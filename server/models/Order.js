const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});
const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
  items: [{
    food: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Food',
      required: true,
    },
    name: String,
    price: Number,
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    image: String,
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'upi', 'card', 'online'],
    default: 'cash',
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'],
    default: 'PENDING',
  },
  // Cashfree payment gateway references (set when an online payment session is created)
  cashfreeOrderId: {
    type: String,
    default: '',
  },
  paymentSessionId: {
    type: String,
    default: '',
  },
  paymentSessionCreatedAt: {
    type: Date,
  },
  paymentAttempt: {
    type: Number,
    default: 0,
  },
  paymentReferenceId: {
    type: String,
    default: '',
  },
  paymentFailureReason: {
    type: String,
    default: '',
  },
  paidAt: {
    type: Date,
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
  },
  pickupTime: {
    type: String,
    required: [true, 'Pickup time is required'],
  },
  // One-time secret token embedded in the pickup QR code. Required to complete
  // the order — prevents replaying a stale QR code or completing an arbitrary order.
  pickupToken: {
    type: String,
    default: '',
  },
  qrCode: {
    type: String,
    default: '',
  },
  estimatedReady: {
    type: Date,
  },
  rejectionReason: {
    type: String,
    default: '',
  },
  statusHistory: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
    note: String,
  }],
  specialInstructions: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// Indexes for the hot query paths
orderSchema.index({ student: 1, createdAt: -1 });
orderSchema.index({ vendor: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
// Unique only when a token is actually set (empty-string placeholder is ignored)
orderSchema.index(
  { pickupToken: 1 },
  { unique: true, partialFilterExpression: { pickupToken: { $gt: '' } } }
);

// Auto-generate a monotonic order number via an atomic counter
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const counter = await Counter.findByIdAndUpdate(
      'order',
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.orderNumber = `ORD-${String(counter.seq).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
