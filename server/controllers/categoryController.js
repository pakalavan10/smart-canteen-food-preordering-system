const Category = require('../models/Category');
const ActivityLog = require('../models/ActivityLog');
const mongoose = require('mongoose');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// ─── Get all categories ──────────────────────────────────────────────
exports.getCategories = async (req, res, next) => {
  try {
    const activeOnly = req.query.active === 'true';
    const query = activeOnly ? { isActive: true } : {};

    const categories = await Category.find(query).sort('sortOrder name');

    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

// ─── Get single category ────────────────────────────────────────────
exports.getCategory = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid category ID format' });
    }
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

// ─── Create category (admin) ─────────────────────────────────────────
exports.createCategory = async (req, res, next) => {
  try {
    const { name, description, icon, sortOrder } = req.body;
    const category = await Category.create({ name, description, icon, sortOrder });

    if (req.user) {
      await ActivityLog.create({
        user: req.user._id,
        userModel: 'Admin',
        action: 'CREATE_CATEGORY',
        details: `Created category: ${name}`,
        ipAddress: req.ip,
      });
    }

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

// ─── Update category (admin) ─────────────────────────────────────────
exports.updateCategory = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid category ID format' });
    }
    const { name, description, icon, isActive, sortOrder } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (icon) updateData.icon = icon;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    const category = await Category.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    await ActivityLog.create({
      user: req.user._id,
      userModel: 'Admin',
      action: 'UPDATE_CATEGORY',
      details: `Updated category: ${category.name}`,
      ipAddress: req.ip,
    });

    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

// ─── Delete category (admin) ─────────────────────────────────────────
exports.deleteCategory = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid category ID format' });
    }
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    await ActivityLog.create({
      user: req.user._id,
      userModel: 'Admin',
      action: 'DELETE_CATEGORY',
      details: `Deleted category: ${category.name}`,
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
};

// ─── Toggle category status ─────────────────────────────────────────
exports.toggleCategory = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid category ID format' });
    }
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    category.isActive = !category.isActive;
    await category.save();

    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};
