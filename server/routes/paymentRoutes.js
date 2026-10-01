const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createPaymentSession,
  verifyPayment,
  handleWebhook,
} = require('../controllers/paymentController');

// Student: create/resume a Cashfree payment session for an existing order
router.post('/create-session', protect, authorize('student'), createPaymentSession);

// Student: server-side verification of a payment against Cashfree
router.post('/verify', protect, authorize('student'), verifyPayment);

// Cashfree webhook (no auth — protected by signature verification)
router.post('/webhook', handleWebhook);

module.exports = router;