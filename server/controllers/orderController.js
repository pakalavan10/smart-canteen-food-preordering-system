const mongoose = require('mongoose');
const crypto = require('crypto');
const Order = require('../models/Order');
const Food = require('../models/Food');
const Vendor = require('../models/Vendor');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const { getIO } = require('../utils/socket');
const { escapeRegex } = require('../utils/queryHelpers');

// Helper to safely emit socket events without throwing if socket not connected
const safeEmit = (emitter) => {
  try {
    const io = getIO();
    if (io) emitter(io);
  } catch (err) {
    console.log('Socket emit warning:', err.message);
  }
};

// ─── Create order (student) ──────────────────────────────────────────
const MAX_ORDER_ITEMS = 50;
const MAX_QUANTITY = 50;

exports.createOrder = async (req, res, next) => {
  try {
    const { items, pickupTime, specialInstructions, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }
    if (items.length > MAX_ORDER_ITEMS) {
      return res.status(400).json({ success: false, message: `Maximum ${MAX_ORDER_ITEMS} items per order` });
    }
    if (!pickupTime) {
      return res.status(400).json({ success: false, message: 'Pickup time is required' });
    }

    // Validate and compute items & concurrency availability
    let totalAmount = 0;
    let vendorId = null;
    const orderItems = [];

    for (const item of items) {
      if (!item || !item.food) {
        return res.status(400).json({ success: false, message: 'Each order item must include a food id' });
      }
      const qty = Number(item.quantity);
      if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QUANTITY) {
        return res.status(400).json({ success: false, message: `Quantity must be an integer between 1 and ${MAX_QUANTITY}` });
      }

      const food = await Food.findById(item.food);
      if (!food) {
        return res.status(400).json({ success: false, message: `Food item not found: ${item.food}` });
      }
      if (!food.isAvailable) {
        return res.status(400).json({ success: false, message: `"${food.name}" is currently out of stock / unavailable` });
      }

      // Ensure all items are from the same vendor
      if (!vendorId) {
        vendorId = food.vendor;
      } else if (food.vendor.toString() !== vendorId.toString()) {
        return res.status(400).json({ success: false, message: 'All items in an order must be from the same vendor' });
      }

      orderItems.push({
        food: food._id,
        name: food.name,
        price: food.price,
        quantity: qty,
        image: food.image,
      });
      totalAmount += food.price * qty;
    }

    // Only allow ordering from an approved & active vendor
    const vendor = await Vendor.findById(vendorId).select('isApproved isActive');
    if (!vendor) {
      return res.status(400).json({ success: false, message: 'Vendor not found' });
    }
    if (!vendor.isApproved || vendor.isActive === false) {
      return res.status(400).json({ success: false, message: 'This vendor is not accepting orders right now' });
    }

    const selectedPaymentMethod = ['cash', 'upi', 'card', 'online'].includes(paymentMethod) ? paymentMethod : 'cash';

    // NOTE: Payment gateway is simulated. We never mark a payment as SUCCESS
    // at order creation — it stays PENDING until the order is completed at pickup.
    const initialPaymentStatus = 'PENDING';

    // Create Order
    const order = await Order.create({
      student: req.user._id,
      vendor: vendorId,
      items: orderItems,
      totalAmount,
      pickupTime,
      paymentMethod: selectedPaymentMethod,
      paymentStatus: initialPaymentStatus,
      specialInstructions: (specialInstructions || '').toString().slice(0, 500),
      statusHistory: [{ status: 'pending', timestamp: new Date(), note: 'Order placed' }],
    });

    // Create Payment Record in MongoDB (simulated — no real gateway)
    const paymentRecord = await Payment.create({
      order: order._id,
      student: req.user._id,
      amount: totalAmount,
      method: selectedPaymentMethod === 'online' ? 'card' : selectedPaymentMethod,
      status: 'pending',
      transactionId: `TXN-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
    });

    order.payment = paymentRecord._id;
    await order.save();

    // Update food total order counts
    for (const item of orderItems) {
      await Food.findByIdAndUpdate(item.food, { $inc: { totalOrders: item.quantity } });
    }

    // Create Notification for Vendor
    const vendorNotification = await Notification.create({
      recipient: vendorId,
      recipientModel: 'Vendor',
      type: 'order_placed',
      title: '📦 New Order Received!',
      message: `New order #${order.orderNumber} placed by ${req.user.name} — ${selectedPaymentMethod.toUpperCase()} (₹${totalAmount})`,
      orderId: order._id,
    });

    await order.populate([
      { path: 'vendor', select: 'shopName phone' },
      { path: 'student', select: 'name email phone' },
      { path: 'items.food', select: 'name image' },
      { path: 'payment' },
    ]);

    // ⚡ Socket.IO Real-Time Emission
    safeEmit((io) => {
      // Send to Vendor specifically & all Vendors
      io.to(`vendor_${vendorId}`).emit('new_order', order);
      io.to('role_vendor').emit('new_order', order);
      // Send to Admin
      io.to('role_admin').emit('admin_new_order', order);
      // Send to Student
      io.to(`user_${req.user._id}`).emit('order_placed', order);
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// ─── Get student's orders ────────────────────────────────────────────
exports.getStudentOrders = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const status = req.query.status;

    let query = { student: req.user._id };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('vendor', 'shopName shopImage phone')
      .populate('items.food', 'name image')
      .populate('payment');

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get single order ────────────────────────────────────────────────
exports.getOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check valid MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID format' });
    }

    const order = await Order.findById(id)
      .populate('student', 'name email phone')
      .populate('vendor', 'shopName shopImage phone')
      .populate('items.food', 'name image price')
      .populate('payment');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Role-based ownership authorization check
    const userId = req.user._id.toString();
    const userRole = req.userRole || req.user.role;

    if (userRole === 'student') {
      const studentId = order.student?._id?.toString() || order.student?.toString();
      if (studentId !== userId) {
        return res.status(403).json({ success: false, message: 'You are not authorized to view this order' });
      }
    } else if (userRole === 'vendor') {
      const vendorId = order.vendor?._id?.toString() || order.vendor?.toString();
      if (vendorId !== userId) {
        return res.status(403).json({ success: false, message: 'You are not authorized to view this order' });
      }
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// ─── Get vendor's orders ─────────────────────────────────────────────
exports.getVendorOrders = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const status = req.query.status;
    const today = req.query.today === 'true';

    let query = { vendor: req.user._id };
    if (status) query.status = status;

    if (today) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('student', 'name email phone avatar')
      .populate('items.food', 'name image')
      .populate('payment');

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Accept order (vendor) ───────────────────────────────────────────
exports.acceptOrder = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID format' });
    }
    const order = await Order.findOne({ _id: req.params.id, vendor: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Cannot accept order currently in state: ${order.status}` });
    }

    order.status = 'accepted';
    order.statusHistory.push({ status: 'accepted', timestamp: new Date(), note: 'Order accepted by vendor' });
    await order.save();

    const notif = await Notification.create({
      recipient: order.student,
      recipientModel: 'Student',
      type: 'order_accepted',
      title: 'Order Accepted! ✅',
      message: `Your order #${order.orderNumber} has been accepted and will be prepared soon.`,
      orderId: order._id,
    });

    await order.populate([
      { path: 'student', select: 'name email' },
      { path: 'vendor', select: 'shopName' },
      { path: 'payment' },
    ]);

    // ⚡ Real-Time Socket Emission
    safeEmit((io) => {
      io.to(`user_${order.student._id || order.student}`).emit('order_status_updated', { order, notification: notif });
      io.to('role_admin').emit('order_status_updated', { order });
      io.to(`vendor_${order.vendor._id || order.vendor}`).emit('order_status_updated', { order });
    });

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// ─── Reject order (vendor) ───────────────────────────────────────────
exports.rejectOrder = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID format' });
    }
    const order = await Order.findOne({ _id: req.params.id, vendor: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.status !== 'pending' && order.status !== 'accepted') {
      return res.status(400).json({ success: false, message: `Cannot reject order currently in state: ${order.status}` });
    }

    order.status = 'cancelled';
    order.rejectionReason = req.body.reason || 'Rejected by vendor';
    order.statusHistory.push({ status: 'cancelled', timestamp: new Date(), note: order.rejectionReason });
    await order.save();

    const notif = await Notification.create({
      recipient: order.student,
      recipientModel: 'Student',
      type: 'order_cancelled',
      title: 'Order Cancelled ❌',
      message: `Your order #${order.orderNumber} was cancelled. Reason: ${order.rejectionReason}`,
      orderId: order._id,
    });

    await order.populate([
      { path: 'student', select: 'name email' },
      { path: 'vendor', select: 'shopName' },
    ]);

    safeEmit((io) => {
      io.to(`user_${order.student._id || order.student}`).emit('order_status_updated', { order, notification: notif });
      io.to('role_admin').emit('order_status_updated', { order });
      io.to(`vendor_${order.vendor._id || order.vendor}`).emit('order_status_updated', { order });
    });

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// ─── Mark as preparing (vendor) ──────────────────────────────────────
exports.prepareOrder = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID format' });
    }
    const order = await Order.findOne({ _id: req.params.id, vendor: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.status !== 'accepted') {
      return res.status(400).json({ success: false, message: `Cannot prepare order currently in state: ${order.status}` });
    }

    order.status = 'preparing';
    order.statusHistory.push({ status: 'preparing', timestamp: new Date(), note: 'Order is being prepared in kitchen' });
    await order.save();

    const notif = await Notification.create({
      recipient: order.student,
      recipientModel: 'Student',
      type: 'order_preparing',
      title: 'Your food is being prepared! 🍳',
      message: `Your order #${order.orderNumber} is now being prepared.`,
      orderId: order._id,
    });

    await order.populate([
      { path: 'student', select: 'name email' },
      { path: 'vendor', select: 'shopName' },
    ]);

    safeEmit((io) => {
      io.to(`user_${order.student._id || order.student}`).emit('order_status_updated', { order, notification: notif });
      io.to('role_admin').emit('order_status_updated', { order });
      io.to(`vendor_${order.vendor._id || order.vendor}`).emit('order_status_updated', { order });
    });

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// ─── Mark as ready (vendor) — generates QR code ──────────────────────
exports.readyOrder = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID format' });
    }
    const order = await Order.findOne({ _id: req.params.id, vendor: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.status !== 'preparing') {
      return res.status(400).json({ success: false, message: `Cannot mark ready for order currently in state: ${order.status}` });
    }

    // Generate a one-time pickup token embedded in the QR code payload
    const pickupToken = crypto.randomBytes(12).toString('hex').toUpperCase();
    const qrPayload = JSON.stringify({
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      pickupToken,
    });

    order.status = 'ready';
    order.qrCode = qrPayload;
    order.pickupToken = pickupToken;
    order.statusHistory.push({ status: 'ready', timestamp: new Date(), note: 'Order is ready for pickup at counter' });
    await order.save();

    const notif = await Notification.create({
      recipient: order.student,
      recipientModel: 'Student',
      type: 'order_ready',
      title: 'Order Ready for Pickup! 🎉',
      message: `Your order #${order.orderNumber} is ready! Show your QR code at counter.`,
      orderId: order._id,
    });

    await order.populate([
      { path: 'student', select: 'name email' },
      { path: 'vendor', select: 'shopName' },
    ]);

    safeEmit((io) => {
      io.to(`user_${order.student._id || order.student}`).emit('order_status_updated', { order, notification: notif });
      io.to('role_admin').emit('order_status_updated', { order });
      io.to(`vendor_${order.vendor._id || order.vendor}`).emit('order_status_updated', { order });
    });

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// ─── Complete order (QR scan / vendor) ───────────────────────────────
exports.completeOrder = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID format' });
    }

    // Vendor ownership check — a vendor may only complete their own orders
    const order = await Order.findOne({ _id: req.params.id, vendor: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.status !== 'ready') {
      return res.status(400).json({ success: false, message: `Cannot complete order currently in state: ${order.status}` });
    }

    // Require the one-time pickup token from the student's QR code
    const submittedToken = (req.body?.pickupToken || '').toString().trim();
    if (!order.pickupToken || submittedToken !== order.pickupToken) {
      return res.status(400).json({ success: false, message: 'Invalid pickup token. Ask the student to show their QR code' });
    }

    order.status = 'completed';
    // Only mark as paid when the money was collected — cash is collected at pickup;
    // online orders must already be verified as SUCCESS by the payment gateway.
    if (order.paymentMethod === 'cash' || order.paymentStatus === 'SUCCESS') {
      order.paymentStatus = 'SUCCESS';
    }
    order.pickupToken = ''; // single-use — cannot be replayed
    order.statusHistory.push({ status: 'completed', timestamp: new Date(), note: 'Order picked up & verified' });
    await order.save();

    // Mark payment completed if cash
    if (order.payment && order.paymentMethod === 'cash') {
      await Payment.findByIdAndUpdate(order.payment, { status: 'completed' });
    }

    const notif = await Notification.create({
      recipient: order.student,
      recipientModel: 'Student',
      type: 'order_completed',
      title: 'Order Completed! 🎊',
      message: `Your order #${order.orderNumber} has been completed. Enjoy your meal!`,
      orderId: order._id,
    });

    await order.populate([
      { path: 'student', select: 'name email' },
      { path: 'vendor', select: 'shopName' },
      { path: 'payment' },
    ]);

    safeEmit((io) => {
      io.to(`user_${order.student._id || order.student}`).emit('order_status_updated', { order, notification: notif });
      io.to('role_admin').emit('order_status_updated', { order });
      io.to(`vendor_${order.vendor._id || order.vendor}`).emit('order_status_updated', { order });
    });

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// ─── Get all orders (admin) ──────────────────────────────────────────
exports.getAllOrders = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const status = req.query.status;
    const search = req.query.search;

    let query = {};
    if (status) query.status = status;
    if (search) query.orderNumber = { $regex: escapeRegex(search), $options: 'i' };

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('student', 'name email')
      .populate('vendor', 'shopName')
      .populate('payment');

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};
