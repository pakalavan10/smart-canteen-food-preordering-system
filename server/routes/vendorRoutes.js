const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { updateProfile, getDashboard, getRevenue, getFeedback } = require('../controllers/vendorController');

router.use(protect, authorize('vendor'));

router.get('/dashboard', getDashboard);
router.put('/profile', upload.single('shopImage'), updateProfile);
router.get('/revenue', getRevenue);
router.get('/feedback', getFeedback);

module.exports = router;
