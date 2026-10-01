const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { getAdminAnalytics, getVendorAnalytics } = require('../controllers/analyticsController');

router.get('/admin', protect, authorize('admin'), getAdminAnalytics);
router.get('/vendor', protect, authorize('vendor'), getVendorAnalytics);

module.exports = router;
