const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { createReview, getFoodReviews, deleteReview } = require('../controllers/reviewController');

router.get('/food/:foodId', getFoodReviews);
router.post('/', protect, authorize('student'), createReview);
router.delete('/:id', protect, authorize('student'), deleteReview);

module.exports = router;
