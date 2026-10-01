const Student = require('../models/Student');
const Order = require('../models/Order');
const Food = require('../models/Food');
const Favorite = require('../models/Favorite');

// ─── Update student profile ─────────────────────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, rollNumber, department } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (rollNumber) updateData.rollNumber = rollNumber;
    if (department) updateData.department = department;

    // Handle avatar upload
    if (req.file) {
      updateData.avatar = `/uploads/${req.file.filename}`;
    }

    const student = await Student.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};

// ─── Change password ─────────────────────────────────────────────────
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new passwords are required' });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const student = await Student.findById(req.user._id).select('+password');
    const isMatch = await student.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    student.password = newPassword;
    await student.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

// ─── Get student dashboard data ──────────────────────────────────────
exports.getDashboard = async (req, res, next) => {
  try {
    const studentId = req.user._id;

    // Recent orders
    const recentOrders = await Order.find({ student: studentId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('vendor', 'shopName')
      .populate('items.food', 'name image');

    // Active orders (not completed or cancelled)
    const activeOrders = await Order.find({
      student: studentId,
      status: { $in: ['pending', 'accepted', 'preparing', 'ready'] },
    })
      .populate('vendor', 'shopName')
      .populate('items.food', 'name image');

    // Favorites
    const favorites = await Favorite.find({ student: studentId })
      .populate({
        path: 'food',
        populate: { path: 'vendor', select: 'shopName' },
      })
      .limit(6);

    // Order stats
    const totalOrders = await Order.countDocuments({ student: studentId });
    const completedOrders = await Order.countDocuments({ student: studentId, status: 'completed' });

    // Total spent
    const spentResult = await Order.aggregate([
      { $match: { student: studentId, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalSpent = spentResult[0]?.total || 0;

    // Recommended foods (most ordered categories)
    const recommended = await Food.find({ isAvailable: true })
      .sort({ totalOrders: -1 })
      .limit(6)
      .populate('vendor', 'shopName')
      .populate('category', 'name');

    res.json({
      success: true,
      data: {
        recentOrders,
        activeOrders,
        favorites: favorites.map(f => f.food),
        stats: { totalOrders, completedOrders, totalSpent },
        recommended,
      },
    });
  } catch (error) {
    next(error);
  }
};
