const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { getCategories, getCategory, createCategory, updateCategory, deleteCategory, toggleCategory } = require('../controllers/categoryController');

// Public
router.get('/', getCategories);
router.get('/:id', getCategory);

// Admin only
router.post('/', protect, authorize('admin'), createCategory);
router.put('/:id', protect, authorize('admin'), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);
router.patch('/:id/toggle', protect, authorize('admin'), toggleCategory);

module.exports = router;
