const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { updateProfile, changePassword, getDashboard } = require('../controllers/studentController');

router.use(protect, authorize('student'));

router.get('/dashboard', getDashboard);
router.put('/profile', upload.single('avatar'), updateProfile);
router.put('/change-password', changePassword);

module.exports = router;
