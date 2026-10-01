const Favorite = require('../models/Favorite');
const Food = require('../models/Food');
const mongoose = require('mongoose');

// ─── Get student's favorites ─────────────────────────────────────────
exports.getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ student: req.user._id })
      .populate({
        path: 'food',
        populate: [
          { path: 'vendor', select: 'shopName' },
          { path: 'category', select: 'name icon' },
        ],
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: favorites.map(f => ({ ...f.food.toObject(), favoriteId: f._id })),
    });
  } catch (error) {
    next(error);
  }
};

// ─── Add to favorites ────────────────────────────────────────────────
exports.addFavorite = async (req, res, next) => {
  try {
    const { foodId } = req.body;

    if (!foodId || !mongoose.Types.ObjectId.isValid(foodId)) {
      return res.status(400).json({ success: false, message: 'A valid food id is required' });
    }

    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ success: false, message: 'Food not found' });
    }

    const existing = await Favorite.findOne({ student: req.user._id, food: foodId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already in favorites' });
    }

    const favorite = await Favorite.create({ student: req.user._id, food: foodId });

    res.status(201).json({ success: true, data: favorite });
  } catch (error) {
    next(error);
  }
};

// ─── Remove from favorites ──────────────────────────────────────────
exports.removeFavorite = async (req, res, next) => {
  try {
    const favorite = await Favorite.findOneAndDelete({
      student: req.user._id,
      food: req.params.foodId,
    });

    if (!favorite) {
      return res.status(404).json({ success: false, message: 'Favorite not found' });
    }

    res.json({ success: true, message: 'Removed from favorites' });
  } catch (error) {
    next(error);
  }
};

// ─── Check if food is favorited ──────────────────────────────────────
exports.checkFavorite = async (req, res, next) => {
  try {
    const favorite = await Favorite.findOne({
      student: req.user._id,
      food: req.params.foodId,
    });

    res.json({ success: true, data: { isFavorite: !!favorite } });
  } catch (error) {
    next(error);
  }
};
