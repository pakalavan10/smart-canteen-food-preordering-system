const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { validate, registerRules, loginRules, vendorRegisterRules } = require('../utils/validators');
const {
  studentRegister, vendorRegister, login,
  forgotPassword, verifyOTP, resetPassword,
  refreshToken, getMe, logout,
} = require('../controllers/authController');

// Student auth
router.post('/student/register', registerRules, validate, studentRegister);
router.post('/student/login', loginRules, validate, login('student'));
router.post('/student/forgot-password', forgotPassword('student'));
router.post('/student/verify-otp', verifyOTP('student'));
router.post('/student/reset-password', resetPassword('student'));

// Vendor auth
router.post('/vendor/register', vendorRegisterRules, validate, vendorRegister);
router.post('/vendor/login', loginRules, validate, login('vendor'));
router.post('/vendor/forgot-password', forgotPassword('vendor'));
router.post('/vendor/verify-otp', verifyOTP('vendor'));
router.post('/vendor/reset-password', resetPassword('vendor'));

// Admin auth
router.post('/admin/login', loginRules, validate, login('admin'));
router.post('/admin/forgot-password', forgotPassword('admin'));
router.post('/admin/verify-otp', verifyOTP('admin'));
router.post('/admin/reset-password', resetPassword('admin'));

// Common
router.post('/refresh-token', refreshToken);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;
