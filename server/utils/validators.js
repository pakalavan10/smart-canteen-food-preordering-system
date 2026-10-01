const { body, validationResult } = require('express-validator');

// Handle validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array().map(e => e.msg).join(', '),
      errors: errors.array(),
    });
  }
  next();
};

// Registration validation rules
const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

// Vendor registration validation rules
const vendorRegisterRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('shopName').trim().notEmpty().withMessage('Shop name is required'),
  body('phone').optional({ checkFalsy: true }).isLength({ max: 15 }).withMessage('Phone number is too long'),
];

// Login validation rules
const loginRules = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Food validation rules
const foodRules = [
  body('name').trim().notEmpty().withMessage('Food name is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('category').notEmpty().withMessage('Category is required'),
];

// Order validation rules
const orderRules = [
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('pickupTime').notEmpty().withMessage('Pickup time is required'),
];

module.exports = { validate, registerRules, loginRules, vendorRegisterRules, foodRules, orderRules };
