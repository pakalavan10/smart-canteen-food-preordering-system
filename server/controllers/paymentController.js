const mongoose = require('mongoose');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const cashfreeConfig = require('../config/cashfree');
const {
  createPaymentSession: cfCreateSession,
  fetchPayments,
  normalizePaymentStatus,
  verifyWebhook,
} = require('../services/cashfreeService');
const { getIO } = require('../utils/socket');

// Helper to safely emit socket events without throwing if socket not connected
const safeEmit = (emitter) => {
  try {
    const io = getIO();
    if (io) emitter(io);
  } catch (err) {
    console.log('Socket emit warning:', err.message);
  }
};

// Extract a friendly error message from Cashfree API failures
const cashfreeError = (error) => {
  const data = error?.response?.data;
  if (data) {
    return data.message || data.code || data.error_description || 'Cashfree API error';
  }
  return error?.message || 'Unable to reach Cashfree';
};

// Apply a verified payment result to the order + payment document.
// Idempotent: a SUCCESS result can never be overwritten by a later FAILED webhook,
// and a FAILED result never downgrades an already-SUCCESS order.
const applyPaymentResult = async (order, { paymentStatus, referenceId, gatewayMethod, failureReason, paidAt }) => {
  const previous = order.paymentStatus;
  let changed = false;

  if (paymentStatus === 'SUCCESS' && previous !== 'SUCCESS') {
    order.paymentStatus = 'SUCCESS';
    if (referenceId) order.paymentReferenceId = referenceId;
    order.paidAt = paidAt || new Date();
    order.paymentFailureReason = '';
    changed = true;
  } else if (paymentStatus === 'FAILED' && previous === 'PENDING') {
    order.paymentStatus = 'FAILED';
    order.paymentFailureReason = failureReason || 'Payment failed';
    changed = true;
  } else if (paymentStatus === 'REFUNDED' && previous === 'SUCCESS') {
    order.paymentStatus = 'REFUNDED';
    changed = true;
  }

  if (changed) {
    await order.save();

    if (order.payment) {
      const update = {
        status: paymentStatus === 'SUCCESS' ? 'completed' : paymentStatus === 'REFUNDED' ? 'refunded' : 'failed',
      };
      if (referenceId) update.transactionId = referenceId;
      if (referenceId) update.paymentReferenceId = referenceId;
      if (gatewayMethod) update.gatewayMethod = gatewayMethod;
      if (failureReason) update.failureReason = failureReason;
      if (paidAt) update.paidAt = paidAt;
      await Payment.findByIdAndUpdate(order.payment, update);
    }

    // Notify the vendor when an online payment succeeds (money actually received)
    if (paymentStatus === 'SUCCESS') {
      await Notification.create({
        recipient: order.vendor,
        recipientModel: 'Vendor',
        type: 'payment_received',
        title: '💳 Payment Received',
        message: `Payment of ₹${order.totalAmount} received for order #${order.orderNumber}.`,
        orderId: order._id,
      });
    }

    safeEmit((io) => {
      io.to(`user_${order.student._id || order.student}`).emit('payment_status_updated', { order });
      io.to(`vendor_${order.vendor._id || order.vendor}`).emit('payment_status_updated', { order });
      io.to('role_admin').emit('payment_status_updated', { order });
    });
  }

  return {
    paymentStatus: order.paymentStatus,
    paymentReferenceId: order.paymentReferenceId,
    paymentFailureReason: order.paymentFailureReason,
    paidAt: order.paidAt,
    paid: order.paymentStatus === 'SUCCESS',
  };
};

// ─── POST /api/payments/create-session (student) ─────────────────────
// Creates (or resumes) a Cashfree payment session for an existing order.
// The amount is validated from the DB order — the frontend never sends it.
exports.createPaymentSession = async (req, res, next) => {
  try {
    if (!cashfreeConfig.isConfigured) {
      return res.status(503).json({
        success: false,
        message:
          'Online payments are temporarily unavailable. Add CASHFREE_APP_ID and CASHFREE_SECRET_KEY to the server .env file to enable the Cashfree gateway.',
      });
    }

    const { orderId } = req.body;
    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }

    const order = await Order.findOne({ _id: orderId, student: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.paymentStatus === 'SUCCESS') {
      return res.status(400).json({ success: false, message: 'This order has already been paid' });
    }
    if (['completed', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ success: false, message: `Cannot pay for an order that is ${order.status}` });
    }

    // Resume an existing session when it is still fresh and the payment is pending
    if (order.cashfreeOrderId && order.paymentSessionId && order.paymentStatus === 'PENDING') {
      const age = Date.now() - new Date(order.paymentSessionCreatedAt || 0).getTime();
      if (age < cashfreeConfig.sessionTtlMs) {
        return res.json({
          success: true,
          data: {
            appOrderId: order._id,
            orderId: order.cashfreeOrderId,
            paymentSessionId: order.paymentSessionId,
            mode: cashfreeConfig.environment === 'PRODUCTION' ? 'production' : 'sandbox',
            resumed: true,
          },
        });
      }
    }

    // New payment attempt (Cashfree order ids must be unique per attempt)
    order.paymentAttempt = (order.paymentAttempt || 0) + 1;
    const session = await cfCreateSession({ order, student: req.user });

    order.cashfreeOrderId = session.orderId;
    order.paymentSessionId = session.paymentSessionId;
    order.paymentSessionCreatedAt = new Date();
    order.paymentStatus = 'PENDING';
    order.paymentFailureReason = '';
    await order.save();

    if (order.payment) {
      await Payment.findByIdAndUpdate(order.payment, {
        cashfreeOrderId: session.orderId,
        paymentSessionId: session.paymentSessionId,
        status: 'pending',
        failureReason: '',
      });
    }

    res.json({
      success: true,
      data: {
        appOrderId: order._id,
        orderId: session.orderId,
        cfOrderId: session.cfOrderId,
        paymentSessionId: session.paymentSessionId,
        mode: cashfreeConfig.environment === 'PRODUCTION' ? 'production' : 'sandbox',
        resumed: false,
      },
    });
  } catch (error) {
    if (error.statusCode === 503) {
      return res.status(503).json({ success: false, message: error.message });
    }
    return res.status(502).json({ success: false, message: `Payment gateway error: ${cashfreeError(error)}` });
  }
};

// ─── POST /api/payments/verify (student) ─────────────────────────────
// Server-side verification against Cashfree. The order is only marked PAID
// based on Cashfree's authoritative payment record, never on a frontend claim.
exports.verifyPayment = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }

    const order = await Order.findOne({ _id: orderId, student: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (!order.cashfreeOrderId) {
      return res.status(400).json({ success: false, message: 'No Cashfree payment session exists for this order' });
    }

    // Fast path — nothing to verify
    if (order.paymentStatus === 'SUCCESS' || order.paymentStatus === 'REFUNDED') {
      return res.json({
        success: true,
        data: {
          paymentStatus: order.paymentStatus,
          paymentReferenceId: order.paymentReferenceId,
          paymentFailureReason: order.paymentFailureReason,
          paidAt: order.paidAt,
          paid: order.paymentStatus === 'SUCCESS',
        },
      });
    }

    const payments = await fetchPayments(order.cashfreeOrderId);
    const latest = Array.isArray(payments) && payments.length > 0 ? payments[0] : null;

    let paymentStatus = 'PENDING';
    let referenceId = '';
    let gatewayMethod = '';
    let failureReason = '';
    let paidAt = null;

    if (latest) {
      paymentStatus = normalizePaymentStatus(latest.payment_status || '');
      referenceId = latest.cf_payment_id ? String(latest.cf_payment_id) : '';
      gatewayMethod = latest.payment_group || '';
      failureReason = latest.payment_message || latest.error_details?.error_description || '';
      paidAt = latest.payment_time ? new Date(latest.payment_time) : null;

      // Defense in depth — reject success when the paid amount differs from the order total
      if (paymentStatus === 'SUCCESS') {
        const paidAmount = Number(latest.payment_amount);
        if (!Number.isFinite(paidAmount) || Math.abs(paidAmount - order.totalAmount) > 0.01) {
          paymentStatus = 'FAILED';
          failureReason = 'Paid amount does not match the order total';
        }
      }
    }

    const result = await applyPaymentResult(order, {
      paymentStatus,
      referenceId,
      gatewayMethod,
      failureReason,
      paidAt,
    });

    res.json({ success: true, data: result });
  } catch (error) {
    return res.status(502).json({ success: false, message: `Payment gateway error: ${cashfreeError(error)}` });
  }
};

// ─── POST /api/payments/webhook (Cashfree) ───────────────────────────
// Verifies the webhook signature before trusting anything. Responds quickly;
// idempotent updates mean duplicate webhooks are harmless.
exports.handleWebhook = async (req, res, next) => {
  try {
    const rawBody = req.rawBody ? req.rawBody.toString('utf8') : '';
    const event = verifyWebhook(rawBody, req.headers);

    if (!event) {
      return res.status(401).json({ success: false, message: 'Invalid webhook signature' });
    }

    const data = event.data || {};
    const cfOrderId = data.order?.order_id || '';
    if (!cfOrderId) {
      return res.status(400).json({ success: false, message: 'Missing order_id in webhook payload' });
    }

    const order = await Order.findOne({ cashfreeOrderId: cfOrderId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'No matching order found' });
    }

    const payment = data.payment || {};
    let paymentStatus = normalizePaymentStatus(payment.payment_status || '');
    if (event.type === 'PAYMENT_FAILED_WEBHOOK' || event.type === 'PAYMENT_CANCELLED_WEBHOOK') {
      paymentStatus = 'FAILED';
    }
    if (event.type === 'PAYMENT_REFUNDED_WEBHOOK') {
      paymentStatus = 'REFUNDED';
    }

    // Defense in depth — never mark paid when the amount differs from the order total
    if (paymentStatus === 'SUCCESS') {
      const paidAmount = Number(payment.payment_amount);
      if (!Number.isFinite(paidAmount) || Math.abs(paidAmount - order.totalAmount) > 0.01) {
        paymentStatus = 'FAILED';
      }
    }

    await applyPaymentResult(order, {
      paymentStatus,
      referenceId: payment.cf_payment_id ? String(payment.cf_payment_id) : '',
      gatewayMethod: payment.payment_method?.payment_group || payment.payment_group || '',
      failureReason: payment.payment_message || payment.error_details?.error_description || '',
      paidAt: payment.payment_time ? new Date(payment.payment_time) : null,
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};