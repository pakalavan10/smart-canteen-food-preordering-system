const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'custom'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
  },
  format: {
    type: String,
    enum: ['pdf', 'excel', 'json'],
    default: 'json',
  },
  filePath: {
    type: String,
    default: '',
  },
  dateRange: {
    start: Date,
    end: Date,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Report', reportSchema);
