const Notification = require('../models/Notification');
const mongoose = require('mongoose');

const roleModelMap = { student: 'Student', vendor: 'Vendor', admin: 'Admin' };

const getNotificationScope = (req) => ({
  recipient: req.user._id,
  recipientModel: roleModelMap[req.userRole],
});

// ─── Get user's notifications ────────────────────────────────────────
exports.getNotifications = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));

    const notifications = await Notification.find(getNotificationScope(req))
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Notification.countDocuments(getNotificationScope(req));

    const unreadCount = await Notification.countDocuments({
      ...getNotificationScope(req),
      isRead: false,
    });

    res.json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Mark notification as read ───────────────────────────────────────
exports.markAsRead = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid notification ID format' });
    }

    // Ownership-scoped update — users can only read their own notifications
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, ...getNotificationScope(req) },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    next(error);
  }
};

// ─── Mark all as read ────────────────────────────────────────────────
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      {
        ...getNotificationScope(req),
        isRead: false,
      },
      { isRead: true }
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

// ─── Delete notification ─────────────────────────────────────────────
exports.deleteNotification = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid notification ID format' });
    }

    // Ownership-scoped delete — users can only delete their own notifications
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      ...getNotificationScope(req),
    });
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
};

// ─── Get unread count ────────────────────────────────────────────────
exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      ...getNotificationScope(req),
      isRead: false,
    });

    res.json({ success: true, data: { count } });
  } catch (error) {
    next(error);
  }
};
