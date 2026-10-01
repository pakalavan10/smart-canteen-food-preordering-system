const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Student = require('../models/Student');
const Vendor = require('../models/Vendor');
const Admin = require('../models/Admin');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
const { sendEmail, getOTPEmailTemplate } = require('../utils/sendEmail');

// Map role strings to their Mongoose models
const models = { student: Student, vendor: Vendor, admin: Admin };

// ─── Student Register ────────────────────────────────────────────────
exports.studentRegister = async (req, res, next) => {
  try {
    const { name, email, password, phone, rollNumber, department } = req.body;

    const exists = await Student.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const student = await Student.create({ name, email, password, phone, rollNumber, department });

    const accessToken = generateAccessToken(student._id, 'student');
    const refreshToken = generateRefreshToken(student._id, 'student');

    student.refreshToken = refreshToken;
    await student.save({ validateModifiedOnly: true });

    // Welcome notification
    await Notification.create({
      recipient: student._id,
      recipientModel: 'Student',
      type: 'welcome',
      title: 'Welcome to Campus Canteen!',
      message: `Hi ${name}, welcome aboard! Start browsing the menu to place your first order.`,
    });

    // Activity log
    await ActivityLog.create({
      user: student._id,
      userModel: 'Student',
      action: 'REGISTER',
      details: `Student ${name} registered`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: { _id: student._id, name: student.name, email: student.email, role: 'student', phone: student.phone, rollNumber: student.rollNumber, department: student.department, avatar: student.avatar },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Generic Login (student / vendor / admin) ────────────────────────
exports.login = (role) => async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const Model = models[role];

    const user = await Model.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check vendor approval
    if (role === 'vendor' && !user.isApproved) {
      return res.status(403).json({ success: false, message: 'Your vendor account is pending approval' });
    }

    // Check active status
    if (user.isActive === false) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated' });
    }

    const accessToken = generateAccessToken(user._id, role);
    const refreshToken = generateRefreshToken(user._id, role);

    user.refreshToken = refreshToken;
    await user.save({ validateModifiedOnly: true });

    // Activity log
    await ActivityLog.create({
      user: user._id,
      userModel: role.charAt(0).toUpperCase() + role.slice(1),
      action: 'LOGIN',
      details: `${role} ${user.name} logged in`,
      ipAddress: req.ip,
    });

    const userData = user.toObject();
    delete userData.password;
    delete userData.refreshToken;
    delete userData.otp;
    delete userData.otpExpiry;
    delete userData.otpAttempts;
    delete userData.otpLastSentAt;

    res.json({
      success: true,
      message: 'Login successful',
      data: { user: { ...userData, role }, accessToken, refreshToken },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Vendor Register ─────────────────────────────────────────────────
exports.vendorRegister = async (req, res, next) => {
  try {
    const { name, email, password, phone, shopName, shopDescription } = req.body;

    if (!name || !email || !password || !shopName) {
      return res.status(400).json({ success: false, message: 'Name, email, password and shop name are required' });
    }

    const exists = await Vendor.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const vendor = await Vendor.create({ name, email, password, phone, shopName, shopDescription });

    await ActivityLog.create({
      user: vendor._id,
      userModel: 'Vendor',
      action: 'REGISTER',
      details: `Vendor ${name} (${shopName}) registered — pending approval`,
      ipAddress: req.ip,
    });

    // No tokens are issued until the vendor account is approved by an admin.
    res.status(201).json({
      success: true,
      message: 'Registration successful. Your account is pending admin approval.',
      data: {
        user: { _id: vendor._id, name: vendor.name, email: vendor.email, role: 'vendor', shopName: vendor.shopName, isApproved: vendor.isApproved },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Forgot Password ─────────────────────────────────────────────────
const OTP_COOLDOWN_MS = 60 * 1000; // 1 minute between OTP sends
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const OTP_MAX_ATTEMPTS = 5;

exports.forgotPassword = (role) => async (req, res, next) => {
  try {
    const { email } = req.body;
    const Model = models[role];

    const user = await Model.findOne({ email }).select('+otp +otpExpiry +otpAttempts +otpLastSentAt');

    // Do not reveal whether an account exists (prevents user enumeration)
    if (!user) {
      return res.json({ success: true, message: 'If an account exists with this email, an OTP has been sent' });
    }

    // Cooldown to prevent OTP spam
    if (user.otpLastSentAt && Date.now() - new Date(user.otpLastSentAt).getTime() < OTP_COOLDOWN_MS) {
      const remaining = Math.ceil((OTP_COOLDOWN_MS - (Date.now() - new Date(user.otpLastSentAt).getTime())) / 1000);
      return res.status(429).json({ success: false, message: `Please wait ${remaining}s before requesting another OTP` });
    }

    // Cryptographically secure 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + OTP_TTL_MS);
    user.otpAttempts = 0;
    user.otpLastSentAt = new Date();
    await user.save({ validateModifiedOnly: true });

    // Send email
    await sendEmail({
      to: email,
      subject: 'Campus Canteen — Password Reset OTP',
      html: getOTPEmailTemplate(user.name, otp),
    });

    res.json({ success: true, message: 'OTP sent to your email' });
  } catch (error) {
    next(error);
  }
};

// ─── Verify OTP ──────────────────────────────────────────────────────
exports.verifyOTP = (role) => async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const Model = models[role];

    const user = await Model.findOne({ email }).select('+otp +otpExpiry +otpAttempts');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.otp || user.otpExpiry < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one' });
    }

    if (user.otpAttempts >= OTP_MAX_ATTEMPTS) {
      return res.status(429).json({ success: false, message: 'Too many invalid attempts. Please request a new OTP' });
    }

    if (user.otp !== otp) {
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      await user.save({ validateModifiedOnly: true });
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // OTP is single-use — invalidate immediately after successful verification
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.otpAttempts = 0;
    await user.save({ validateModifiedOnly: true });

    res.json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    next(error);
  }
};

// ─── Reset Password ──────────────────────────────────────────────────
exports.resetPassword = (role) => async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    const Model = models[role];

    if (!newPassword || String(newPassword).length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const user = await Model.findOne({ email }).select('+otp +otpExpiry +otpAttempts');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.otp || user.otpExpiry < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one' });
    }

    if (user.otpAttempts >= OTP_MAX_ATTEMPTS) {
      return res.status(429).json({ success: false, message: 'Too many invalid attempts. Please request a new OTP' });
    }

    if (user.otp !== otp) {
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      await user.save({ validateModifiedOnly: true });
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.otpAttempts = 0;
    await user.save();

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
};

// ─── Refresh Token ───────────────────────────────────────────────────
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const Model = models[decoded.role];
    const user = await Model.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    // Do not issue fresh tokens for deactivated or unapproved accounts
    if (user.isActive === false) {
      return res.status(401).json({ success: false, message: 'Account is deactivated' });
    }
    if (decoded.role === 'vendor' && !user.isApproved) {
      return res.status(401).json({ success: false, message: 'Vendor account is pending approval' });
    }

    const newAccessToken = generateAccessToken(user._id, decoded.role);
    const newRefreshToken = generateRefreshToken(user._id, decoded.role);

    user.refreshToken = newRefreshToken;
    await user.save({ validateModifiedOnly: true });

    res.json({
      success: true,
      data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};

// ─── Get current user profile ────────────────────────────────────────
exports.getMe = async (req, res, next) => {
  try {
    const user = req.user.toObject();
    user.role = req.userRole;
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// ─── Logout ──────────────────────────────────────────────────────────
exports.logout = async (req, res, next) => {
  try {
    const Model = models[req.userRole];
    await Model.findByIdAndUpdate(req.user._id, { refreshToken: '' });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};
