const mongoose = require('mongoose');
const Student = require('../models/Student');
const Vendor = require('../models/Vendor');
const Order = require('../models/Order');
const Food = require('../models/Food');
const Category = require('../models/Category');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const { escapeRegex, clampPage, clampLimit } = require('../utils/queryHelpers');

// ─── Admin Dashboard ─────────────────────────────────────────────────
exports.getDashboard = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const totalStudents = await Student.countDocuments();
    const totalVendors = await Vendor.countDocuments();
    const approvedVendors = await Vendor.countDocuments({ isApproved: true });
    const pendingVendors = await Vendor.countDocuments({ isApproved: false });

    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow },
    });
    const completedOrders = await Order.countDocuments({ status: 'completed' });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });
    const pendingOrders = await Order.countDocuments({ status: 'pending' });

    // Total revenue
    const revenueResult = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Today's revenue
    const todayRevenueResult = await Order.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: today, $lt: tomorrow },
        },
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const todayRevenue = todayRevenueResult[0]?.total || 0;

    // Popular foods
    const popularFoods = await Food.find()
      .sort({ totalOrders: -1 })
      .limit(5)
      .populate('vendor', 'shopName')
      .populate('category', 'name');

    // Peak ordering hours
    const peakHours = await Order.aggregate([
      {
        $group: {
          _id: { $hour: '$createdAt' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // Recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('student', 'name')
      .populate('vendor', 'shopName');

    // Revenue trend (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const revenueTrend = await Order.aggregate([
      {
        $match: { status: 'completed', createdAt: { $gte: weekAgo } },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalStudents,
          totalVendors,
          approvedVendors,
          pendingVendors,
          todayOrders,
          completedOrders,
          cancelledOrders,
          pendingOrders,
          totalRevenue,
          todayRevenue,
        },
        popularFoods,
        peakHours,
        recentOrders,
        revenueTrend,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Manage Students ─────────────────────────────────────────────────
exports.getStudents = async (req, res, next) => {
  try {
    const page = clampPage(req.query.page);
    const limit = clampLimit(req.query.limit, 10, 100);
    const search = (req.query.search || '').toString().slice(0, 100);
    const sort = ['-createdAt', 'createdAt', 'name', '-name'].includes(req.query.sort) ? req.query.sort : '-createdAt';

    const query = search
      ? { $or: [{ name: { $regex: escapeRegex(search), $options: 'i' } }, { email: { $regex: escapeRegex(search), $options: 'i' } }, { rollNumber: { $regex: escapeRegex(search), $options: 'i' } }] }
      : {};

    const students = await Student.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Student.countDocuments(query);

    res.json({
      success: true,
      data: students,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

exports.toggleStudentStatus = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid student ID format' });
    }
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    student.isActive = !student.isActive;
    await student.save({ validateModifiedOnly: true });

    await ActivityLog.create({
      user: req.user._id,
      userModel: 'Admin',
      action: student.isActive ? 'ACTIVATE_STUDENT' : 'DEACTIVATE_STUDENT',
      details: `${student.isActive ? 'Activated' : 'Deactivated'} student ${student.name}`,
      ipAddress: req.ip,
    });

    res.json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};

exports.deleteStudent = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid student ID format' });
    }
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    await ActivityLog.create({
      user: req.user._id,
      userModel: 'Admin',
      action: 'DELETE_STUDENT',
      details: `Deleted student ${student.name}`,
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'Student deleted' });
  } catch (error) {
    next(error);
  }
};

// ─── Manage Vendors ──────────────────────────────────────────────────
exports.getVendors = async (req, res, next) => {
  try {
    const page = clampPage(req.query.page);
    const limit = clampLimit(req.query.limit, 10, 100);
    const search = (req.query.search || '').toString().slice(0, 100);
    const status = req.query.status; // 'approved', 'pending'

    let query = {};
    if (search) {
      const escaped = escapeRegex(search);
      query.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { email: { $regex: escaped, $options: 'i' } },
        { shopName: { $regex: escaped, $options: 'i' } },
      ];
    }
    if (status === 'approved') query.isApproved = true;
    if (status === 'pending') query.isApproved = false;

    const vendors = await Vendor.find(query)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Vendor.countDocuments(query);

    res.json({
      success: true,
      data: vendors,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateVendorStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be 'approved' or 'rejected'" });
    }
    const isApproved = status === 'approved';

    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { isApproved },
      { new: true }
    );
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });

    if (isApproved) {
      await Notification.create({
        recipient: vendor._id,
        recipientModel: 'Vendor',
        type: 'system',
        title: 'Account Approved!',
        message: 'Your vendor account has been approved. You can now start managing your menu.',
      });
    }

    await ActivityLog.create({
      user: req.user._id,
      userModel: 'Admin',
      action: isApproved ? 'APPROVE_VENDOR' : 'REJECT_VENDOR',
      details: `${isApproved ? 'Approved' : 'Rejected'} vendor ${vendor.name} (${vendor.shopName})`,
      ipAddress: req.ip,
    });

    res.json({ success: true, data: vendor });
  } catch (error) {
    next(error);
  }
};

exports.toggleVendorStatus = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid vendor ID format' });
    }
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });

    vendor.isActive = !vendor.isActive;
    await vendor.save({ validateModifiedOnly: true });

    await ActivityLog.create({
      user: req.user._id,
      userModel: 'Admin',
      action: vendor.isActive ? 'ACTIVATE_VENDOR' : 'DEACTIVATE_VENDOR',
      details: `${vendor.isActive ? 'Activated' : 'Deactivated'} vendor ${vendor.name}`,
      ipAddress: req.ip,
    });

    res.json({ success: true, data: vendor });
  } catch (error) {
    next(error);
  }
};

exports.deleteVendor = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid vendor ID format' });
    }
    const vendor = await Vendor.findByIdAndDelete(req.params.id);
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });

    // Also delete vendor's foods
    await Food.deleteMany({ vendor: req.params.id });

    await ActivityLog.create({
      user: req.user._id,
      userModel: 'Admin',
      action: 'DELETE_VENDOR',
      details: `Deleted vendor ${vendor.name} (${vendor.shopName})`,
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'Vendor and associated foods deleted' });
  } catch (error) {
    next(error);
  }
};

// ─── System Settings / Announcements ─────────────────────────────────
exports.createAnnouncement = async (req, res, next) => {
  try {
    const { title, message, targetAudience } = req.body;

    // targetAudience can be 'all', 'students', 'vendors'
    let recipients = [];
    if (targetAudience === 'all' || targetAudience === 'students') {
      const students = await Student.find({ isActive: true }, '_id');
      recipients.push(...students.map(s => ({ recipient: s._id, recipientModel: 'Student' })));
    }
    if (targetAudience === 'all' || targetAudience === 'vendors') {
      const vendors = await Vendor.find({ isActive: true }, '_id');
      recipients.push(...vendors.map(v => ({ recipient: v._id, recipientModel: 'Vendor' })));
    }

    // Create notifications for all recipients
    const notifications = recipients.map(r => ({
      ...r,
      type: 'announcement',
      title,
      message,
    }));

    await Notification.insertMany(notifications);

    await ActivityLog.create({
      user: req.user._id,
      userModel: 'Admin',
      action: 'CREATE_ANNOUNCEMENT',
      details: `Announcement: "${title}" sent to ${targetAudience}`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: `Announcement sent to ${recipients.length} users`,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Activity Logs ───────────────────────────────────────────────────
exports.getActivityLogs = async (req, res, next) => {
  try {
    const page = clampPage(req.query.page);
    const limit = clampLimit(req.query.limit, 20, 100);
    const action = (req.query.action || '').toString().slice(0, 50);

    const query = action ? { action: { $regex: escapeRegex(action), $options: 'i' } } : {};

    const logs = await ActivityLog.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await ActivityLog.countDocuments(query);

    res.json({
      success: true,
      data: logs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};
