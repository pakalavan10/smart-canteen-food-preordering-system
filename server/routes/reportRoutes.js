const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { exportPDF, exportExcel, getReports } = require('../controllers/reportController');

router.use(protect, authorize('admin'));

router.get('/', getReports);
router.get('/export/pdf', exportPDF);
router.get('/export/excel', exportExcel);

module.exports = router;
