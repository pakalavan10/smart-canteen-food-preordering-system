const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  method: {
    type: String,
    enum: ['cash', 'upi', 'card', 'wallet'],
    default: 'cash',
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
  },
  transactionId: {
    type: String,
    default: '',
  },
  // Cashfree payment gateway references
  cashfreeOrderId: {
    type: String,
    default: '',
  },
  paymentSessionId: {
    type: String,
    default: '',
  },
  paymentReferenceId: {
    type: String,
    default: '',
  },
  gatewayMethod: {
    type: String,
    default: '',
  },
  failureReason: {
    type: String,
    default: '',
  },
  paidAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Payment', paymentSchema);
