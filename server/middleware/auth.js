const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Vendor = require('../models/Vendor');
const Admin = require('../models/Admin');

// Map role to model
const models = {
  student: Student,
  vendor: Vendor,
  admin: Admin,
};

// Protect routes — verify JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from appropriate model
    const Model = models[decoded.role];
    if (!Model) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token role',
      });
    }

    const user = await Model.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if user is active
    if (user.isActive === false) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated',
      });
    }

    // Enforce vendor approval at middleware level so it applies to ALL vendor routes
    if (decoded.role === 'vendor' && !user.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'Your vendor account is pending admin approval',
      });
    }

    req.user = user;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Not authorized',
    });
  }
};

// Authorize specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.userRole}' is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
