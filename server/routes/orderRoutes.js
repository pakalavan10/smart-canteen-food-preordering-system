const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createOrder, getStudentOrders, getOrder, getVendorOrders,
  acceptOrder, rejectOrder, prepareOrder, readyOrder, completeOrder,
  getAllOrders,
} = require('../controllers/orderController');

// Static routes declared before the parameterized /:id route to avoid shadowing

// Student
router.post('/', protect, authorize('student'), createOrder);
router.get('/my-orders', protect, authorize('student'), getStudentOrders);

// Vendor
router.get('/vendor-orders', protect, authorize('vendor'), getVendorOrders);
router.patch('/:id/accept', protect, authorize('vendor'), acceptOrder);
router.patch('/:id/reject', protect, authorize('vendor'), rejectOrder);
router.patch('/:id/preparing', protect, authorize('vendor'), prepareOrder);
router.patch('/:id/ready', protect, authorize('vendor'), readyOrder);
router.patch('/:id/complete', protect, authorize('vendor'), completeOrder);

// Admin
router.get('/all', protect, authorize('admin'), getAllOrders);

// Shared single order (must be last)
router.get('/:id', protect, getOrder);

module.exports = router;
