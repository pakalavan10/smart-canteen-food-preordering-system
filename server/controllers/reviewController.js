const mongoose = require('mongoose');
const Review = require('../models/Review');
const Food = require('../models/Food');
const Order = require('../models/Order');

// ─── Create review ──────────────────────────────────────────────────
exports.createReview = async (req, res, next) => {
  try {
    const { foodId, rating, comment, orderId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(foodId)) {
      return res.status(400).json({ success: false, message: 'Invalid food ID format' });
    }

    const parsedRating = Number(rating);
    if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5' });
    }

    const food = await Food.findById(foodId);
    if (!food) return res.status(404).json({ success: false, message: 'Food not found' });

    // Only students who actually completed an order containing this food may review it
    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: 'A valid orderId is required to submit feedback' });
    }

    const order = await Order.findOne({
      _id: orderId,
      student: req.user._id,
      status: 'completed',
      'items.food': foodId,
    });

    if (!order) {
      return res.status(403).json({
        success: false,
        message: 'You can only review food from a completed order of yours',
      });
    }

    // One review per food per order
    const existing = await Review.findOne({ student: req.user._id, food: foodId, order: orderId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this item for this order' });
    }

    const review = await Review.create({
      student: req.user._id,
      food: foodId,
      vendor: food.vendor,
      order: orderId,
      rating: parsedRating,
      comment: (comment || '').toString().slice(0, 500),
    });

    // Update food average rating
    const reviews = await Review.find({ food: foodId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    food.rating = avgRating;
    food.totalRatings = reviews.length;
    await food.save();

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

// ─── Get reviews for a food ──────────────────────────────────────────
exports.getFoodReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ food: req.params.foodId })
      .sort({ createdAt: -1 })
      .populate('student', 'name avatar');

    res.json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

// ─── Delete review ───────────────────────────────────────────────────
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findOneAndDelete({
      _id: req.params.id,
      student: req.user._id,
    });

    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    // Recalculate rating
    const reviews = await Review.find({ food: review.food });
    const food = await Food.findById(review.food);
    if (reviews.length > 0) {
      food.rating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      food.totalRatings = reviews.length;
    } else {
      food.rating = 0;
      food.totalRatings = 0;
    }
    await food.save();

    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    next(error);
  }
};
