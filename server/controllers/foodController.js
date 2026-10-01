const mongoose = require('mongoose');
const Food = require('../models/Food');
const Category = require('../models/Category');
const Vendor = require('../models/Vendor');
const { escapeRegex, clampPage, clampLimit } = require('../utils/queryHelpers');

const MAX_SEARCH_LENGTH = 100;
const ALLOWED_SORTS = ['-createdAt', 'createdAt', 'price', '-price', 'name', '-name', 'rating', '-rating', 'totalOrders', '-totalOrders'];

// ─── Get all foods (with search, filter, pagination) ─────────────────
exports.getFoods = async (req, res, next) => {
  try {
    const page = clampPage(req.query.page);
    const limit = clampLimit(req.query.limit, 12, 100);
    const search = (req.query.search || '').toString().slice(0, MAX_SEARCH_LENGTH);
    const category = req.query.category;
    const vendor = req.query.vendor;
    const minPrice = req.query.minPrice;
    const maxPrice = req.query.maxPrice;
    const isVeg = req.query.isVeg;
    const sort = ALLOWED_SORTS.includes(req.query.sort) ? req.query.sort : '-createdAt';
    const available = req.query.available;

    let query = {};

    if (search) {
      const escaped = escapeRegex(search);
      query.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { description: { $regex: escaped, $options: 'i' } },
        { tags: { $regex: escaped, $options: 'i' } },
      ];
    }

    if (category) query.category = category;
    if (vendor) query.vendor = vendor;
    if (isVeg !== undefined) query.isVeg = isVeg === 'true';
    if (available !== undefined) query.isAvailable = available === 'true';

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Public menu only exposes food from approved & active vendors
    const approvedVendors = await Vendor.find({ isApproved: true, isActive: true }, '_id');
    if (approvedVendors.length === 0) {
      return res.json({ success: true, data: [], pagination: { page, limit, total: 0, pages: 0 } });
    }
    const approvedVendorIds = approvedVendors.map(v => v._id);
    if (query.vendor) {
      if (!query.vendor.toString().match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ success: false, message: 'Invalid vendor filter' });
      }
      if (!approvedVendorIds.some(id => id.toString() === query.vendor.toString())) {
        return res.json({ success: true, data: [], pagination: { page, limit, total: 0, pages: 0 } });
      }
    } else {
      query.vendor = { $in: approvedVendorIds };
    }

    const foods = await Food.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('category', 'name icon')
      .populate('vendor', 'shopName');

    const total = await Food.countDocuments(query);

    res.json({
      success: true,
      data: foods,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get single food ─────────────────────────────────────────────────
exports.getFood = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id)
      .populate('category', 'name icon')
      .populate('vendor', 'shopName shopImage openingTime closingTime isApproved isActive');

    if (!food) {
      return res.status(404).json({ success: false, message: 'Food not found' });
    }

    // Hide food from unapproved/deactivated vendors on the public route
    if (!food.vendor || !food.vendor.isApproved || food.vendor.isActive === false) {
      return res.status(404).json({ success: false, message: 'Food not found' });
    }

    res.json({ success: true, data: food });
  } catch (error) {
    next(error);
  }
};

// ─── Create food (vendor) ────────────────────────────────────────────
exports.createFood = async (req, res, next) => {
  try {
    const { name, description, price, category, preparationTime, tags, isVeg } = req.body;

    const parsedPrice = Number(price);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({ success: false, message: 'Price must be greater than 0' });
    }

    if (!category || !mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({ success: false, message: 'A valid category is required' });
    }
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ success: false, message: 'Category not found' });
    }

    const foodData = {
      name: (name || '').toString().slice(0, 100),
      description: (description || '').toString().slice(0, 500),
      price: parsedPrice,
      category,
      vendor: req.user._id,
      preparationTime: Math.min(240, Math.max(1, Number(preparationTime) || 15)),
      isVeg: isVeg !== undefined ? !!isVeg : true,
    };

    if (tags) {
      foodData.tags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean).slice(0, 20) : tags;
    }

    if (req.file) {
      foodData.image = `/uploads/${req.file.filename}`;
    }

    const food = await Food.create(foodData);
    await food.populate('category', 'name icon');

    res.status(201).json({ success: true, data: food });
  } catch (error) {
    next(error);
  }
};

// ─── Update food (vendor) ────────────────────────────────────────────
exports.updateFood = async (req, res, next) => {
  try {
    const food = await Food.findOne({ _id: req.params.id, vendor: req.user._id });
    if (!food) {
      return res.status(404).json({ success: false, message: 'Food not found or not authorized' });
    }

    const { name, description, price, category, preparationTime, tags, isVeg, isAvailable } = req.body;

    if (name) food.name = name.toString().slice(0, 100);
    if (description !== undefined) food.description = description.toString().slice(0, 500);
    if (price !== undefined) {
      const parsedPrice = Number(price);
      if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
        return res.status(400).json({ success: false, message: 'Price must be greater than 0' });
      }
      food.price = parsedPrice;
    }
    if (category) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        return res.status(400).json({ success: false, message: 'Invalid category' });
      }
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({ success: false, message: 'Category not found' });
      }
      food.category = category;
    }
    if (preparationTime) food.preparationTime = Math.min(240, Math.max(1, Number(preparationTime) || 15));
    if (isVeg !== undefined) food.isVeg = isVeg;
    if (isAvailable !== undefined) food.isAvailable = isAvailable;

    if (tags) {
      food.tags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean).slice(0, 20) : tags;
    }

    if (req.file) {
      food.image = `/uploads/${req.file.filename}`;
    }

    await food.save();
    await food.populate('category', 'name icon');

    res.json({ success: true, data: food });
  } catch (error) {
    next(error);
  }
};

// ─── Delete food (vendor) ────────────────────────────────────────────
exports.deleteFood = async (req, res, next) => {
  try {
    const food = await Food.findOneAndDelete({ _id: req.params.id, vendor: req.user._id });
    if (!food) {
      return res.status(404).json({ success: false, message: 'Food not found or not authorized' });
    }

    res.json({ success: true, message: 'Food deleted' });
  } catch (error) {
    next(error);
  }
};

// ─── Toggle food availability (vendor) ───────────────────────────────
exports.toggleAvailability = async (req, res, next) => {
  try {
    const food = await Food.findOne({ _id: req.params.id, vendor: req.user._id });
    if (!food) {
      return res.status(404).json({ success: false, message: 'Food not found or not authorized' });
    }

    food.isAvailable = !food.isAvailable;
    await food.save();

    res.json({ success: true, data: food });
  } catch (error) {
    next(error);
  }
};

// ─── Get vendor's own foods (vendor) ──────────────────────────────────
exports.getVendorFoods = async (req, res, next) => {
  try {
    const foods = await Food.find({ vendor: req.user._id })
      .sort('-createdAt')
      .limit(200)
      .populate('category', 'name icon');

    res.json({ success: true, data: foods });
  } catch (error) {
    next(error);
  }
};

// ─── Admin: Delete any food ──────────────────────────────────────────
exports.adminDeleteFood = async (req, res, next) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);
    if (!food) {
      return res.status(404).json({ success: false, message: 'Food not found' });
    }

    res.json({ success: true, message: 'Food deleted by admin' });
  } catch (error) {
    next(error);
  }
};

// ─── Admin: Toggle availability of any food ──────────────────────────
exports.adminToggleFood = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ success: false, message: 'Food not found' });
    }

    food.isAvailable = !food.isAvailable;
    await food.save();

    res.json({ success: true, data: food });
  } catch (error) {
    next(error);
  }
};
