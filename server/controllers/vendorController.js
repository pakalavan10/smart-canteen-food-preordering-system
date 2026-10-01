const Vendor = require('../models/Vendor');
const Order = require('../models/Order');
const Food = require('../models/Food');
const Review = require('../models/Review');

// ─── Update vendor profile ──────────────────────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, shopName, shopDescription, openingTime, closingTime } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (shopName) updateData.shopName = shopName;
    if (shopDescription) updateData.shopDescription = shopDescription;
    if (openingTime) updateData.openingTime = openingTime;
    if (closingTime) updateData.closingTime = closingTime;

    if (req.file) {
      updateData.shopImage = `/uploads/${req.file.filename}`;
    }

    const vendor = await Vendor.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: vendor });
  } catch (error) {
    next(error);
  }
};

// ─── Vendor dashboard stats ─────────────────────────────────────────
exports.getDashboard = async (req, res, next) => {
  try {
    const vendorId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's orders
    const todayOrders = await Order.countDocuments({
      vendor: vendorId,
      createdAt: { $gte: today, $lt: tomorrow },
    });

    // Pending orders
    const pendingOrders = await Order.countDocuments({
      vendor: vendorId,
      status: 'pending',
    });

    // Completed orders today
    const completedToday = await Order.countDocuments({
      vendor: vendorId,
      status: 'completed',
      createdAt: { $gte: today, $lt: tomorrow },
    });

    // Today's revenue
    const revenueResult = await Order.aggregate([
      {
        $match: {
          vendor: vendorId,
          status: 'completed',
          createdAt: { $gte: today, $lt: tomorrow },
        },
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const todayRevenue = revenueResult[0]?.total || 0;

    // Total revenue
    const totalRevenueResult = await Order.aggregate([
      { $match: { vendor: vendorId, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = totalRevenueResult[0]?.total || 0;

    // Most ordered food
    const mostOrdered = await Food.find({ vendor: vendorId })
      .sort({ totalOrders: -1 })
      .limit(5);

    // Recent orders
    const recentOrders = await Order.find({ vendor: vendorId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('student', 'name email')
      .populate('items.food', 'name image');

    // Active orders
    const activeOrders = await Order.find({
      vendor: vendorId,
      status: { $in: ['pending', 'accepted', 'preparing', 'ready'] },
    })
      .sort({ createdAt: -1 })
      .populate('student', 'name email phone')
      .populate('items.food', 'name image');

    // Total menu items
    const totalMenuItems = await Food.countDocuments({ vendor: vendorId });

    // Average rating
    const ratingResult = await Review.aggregate([
      { $match: { vendor: vendorId } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          todayOrders,
          pendingOrders,
          completedToday,
          todayRevenue,
          totalRevenue,
          totalMenuItems,
          avgRating: ratingResult[0]?.avg?.toFixed(1) || '0.0',
          totalRatings: ratingResult[0]?.count || 0,
        },
        mostOrdered,
        recentOrders,
        activeOrders,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get vendor revenue data ─────────────────────────────────────────
exports.getRevenue = async (req, res, next) => {
  try {
    const vendorId = req.user._id;
    const period = ['daily', 'weekly', 'monthly'].includes(req.query.period) ? req.query.period : 'weekly';

    let startDate = new Date();
    if (period === 'daily') {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'weekly') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'monthly') {
      startDate.setMonth(startDate.getMonth() - 1);
    }

    const revenue = await Order.aggregate([
      {
        $match: {
          vendor: vendorId,
          status: 'completed',
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, data: revenue });
  } catch (error) {
    next(error);
  }
};

// ─── Get customer feedback ───────────────────────────────────────────
exports.getFeedback = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const reviews = await Review.find({ vendor: req.user._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('student', 'name avatar')
      .populate('food', 'name image');

    const total = await Review.countDocuments({ vendor: req.user._id });

    res.json({
      success: true,
      data: reviews,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};
