const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  food: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
    required: true,
  },
}, {
  timestamps: true,
});

// Ensure a student can only favorite a food once
favoriteSchema.index({ student: 1, food: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
