const Order = require('../models/Order');
const Student = require('../models/Student');
const Vendor = require('../models/Vendor');
const Food = require('../models/Food');

// ─── Admin analytics ─────────────────────────────────────────────────
const VALID_PERIODS = ['daily', 'weekly', 'monthly', 'yearly'];
const getPeriod = (value, fallback) => (VALID_PERIODS.includes(value) ? value : fallback);

exports.getAdminAnalytics = async (req, res, next) => {
  try {
    const period = getPeriod(req.query.period, 'monthly');

    let startDate = new Date();
    if (period === 'daily') startDate.setHours(0, 0, 0, 0);
    else if (period === 'weekly') startDate.setDate(startDate.getDate() - 7);
    else if (period === 'monthly') startDate.setMonth(startDate.getMonth() - 1);
    else if (period === 'yearly') startDate.setFullYear(startDate.getFullYear() - 1);

    // Revenue trend
    const revenueTrend = await Order.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Order status distribution
    const statusDistribution = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Top vendors by revenue
    const topVendors = await Order.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: startDate } } },
      { $group: { _id: '$vendor', revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'vendors',
          localField: '_id',
          foreignField: '_id',
          as: 'vendor',
        },
      },
      { $unwind: '$vendor' },
      {
        $project: {
          shopName: '$vendor.shopName',
          revenue: 1,
          orders: 1,
        },
      },
    ]);

    // Top foods
    const topFoods = await Food.find()
      .sort({ totalOrders: -1 })
      .limit(10)
      .populate('vendor', 'shopName')
      .populate('category', 'name');

    // Peak hours
    const peakHours = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: { $hour: '$createdAt' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Registration trend
    const studentRegistrations = await Student.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        revenueTrend,
        statusDistribution,
        topVendors,
        topFoods,
        peakHours,
        studentRegistrations,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Vendor analytics ────────────────────────────────────────────────
exports.getVendorAnalytics = async (req, res, next) => {
  try {
    const vendorId = req.user._id;
    const period = getPeriod(req.query.period, 'weekly');

    let startDate = new Date();
    if (period === 'daily') startDate.setHours(0, 0, 0, 0);
    else if (period === 'weekly') startDate.setDate(startDate.getDate() - 7);
    else if (period === 'monthly') startDate.setMonth(startDate.getMonth() - 1);

    // Revenue trend
    const revenueTrend = await Order.aggregate([
      { $match: { vendor: vendorId, status: 'completed', createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Order status distribution
    const statusDistribution = await Order.aggregate([
      { $match: { vendor: vendorId, createdAt: { $gte: startDate } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Top items
    const topItems = await Food.find({ vendor: vendorId })
      .sort({ totalOrders: -1 })
      .limit(5);

    // Hourly distribution
    const hourlyOrders = await Order.aggregate([
      { $match: { vendor: vendorId, createdAt: { $gte: startDate } } },
      { $group: { _id: { $hour: '$createdAt' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: { revenueTrend, statusDistribution, topItems, hourlyOrders },
    });
  } catch (error) {
    next(error);
  }
};
