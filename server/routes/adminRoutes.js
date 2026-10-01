const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getDashboard, getStudents, toggleStudentStatus, deleteStudent,
  getVendors, updateVendorStatus, toggleVendorStatus, deleteVendor,
  createAnnouncement, getActivityLogs,
} = require('../controllers/adminController');

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboard);

// Student management
router.get('/students', getStudents);
router.patch('/students/:id/toggle', toggleStudentStatus);
router.delete('/students/:id', deleteStudent);

// Vendor management
router.get('/vendors', getVendors);
router.patch('/vendors/:id/status', updateVendorStatus);
router.patch('/vendors/:id/approve', updateVendorStatus);
router.patch('/vendors/:id/toggle', toggleVendorStatus);
router.delete('/vendors/:id', deleteVendor);

// Announcements
router.post('/announcements', createAnnouncement);

// Activity logs
router.get('/activity-logs', getActivityLogs);

module.exports = router;
