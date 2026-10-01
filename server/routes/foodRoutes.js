const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getFoods, getFood, createFood, updateFood, deleteFood,
  toggleAvailability, getVendorFoods, adminDeleteFood, adminToggleFood,
} = require('../controllers/foodController');

// Public routes
router.get('/', getFoods);

// Admin routes (declared before /:id so they are not shadowed)
router.delete('/admin/:id', protect, authorize('admin'), adminDeleteFood);
router.patch('/admin/:id/toggle', protect, authorize('admin'), adminToggleFood);

// Vendor routes (declared before /:id so they are not shadowed)
router.get('/vendor/my-foods', protect, authorize('vendor'), getVendorFoods);
router.post('/', protect, authorize('vendor'), upload.single('image'), createFood);
router.put('/:id', protect, authorize('vendor'), upload.single('image'), updateFood);
router.delete('/:id', protect, authorize('vendor'), deleteFood);
router.patch('/:id/toggle', protect, authorize('vendor'), toggleAvailability);

// Public single-food route (must be last)
router.get('/:id', getFood);

module.exports = router;
