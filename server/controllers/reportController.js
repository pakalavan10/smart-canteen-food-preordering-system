const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const Order = require('../models/Order');
const Student = require('../models/Student');
const Vendor = require('../models/Vendor');
const Food = require('../models/Food');
const Report = require('../models/Report');

const MAX_RANGE_DAYS = 370;

// ─── Generate report data ───────────────────────────────────────────
const generateReportData = async (period, startDateInput, endDateInput) => {
  let startDate;
  let endDate = new Date();

  if (startDateInput && endDateInput) {
    startDate = new Date(startDateInput);
    endDate = new Date(endDateInput);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      const err = new Error('Invalid date range provided');
      err.statusCode = 400;
      throw err;
    }
    if (startDate > endDate) {
      const err = new Error('Start date cannot be after end date');
      err.statusCode = 400;
      throw err;
    }
    if ((endDate - startDate) > MAX_RANGE_DAYS * 24 * 60 * 60 * 1000) {
      const err = new Error(`Date range cannot exceed ${MAX_RANGE_DAYS} days`);
      err.statusCode = 400;
      throw err;
    }
    // Include the full end date
    endDate.setHours(23, 59, 59, 999);
  } else {
    startDate = new Date();
    if (period === 'daily') {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'weekly') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'monthly') {
      startDate.setMonth(startDate.getMonth() - 1);
    }
  }

  const orders = await Order.find({ createdAt: { $gte: startDate, $lte: endDate } })
    .populate('student', 'name email')
    .populate('vendor', 'shopName');

  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
  const totalRevenue = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return { orders, totalOrders, completedOrders, cancelledOrders, totalRevenue, period, startDate, endDate };
};

// Extract and validate a period from query (whitelist)
const getValidPeriod = (value) => {
  return ['daily', 'weekly', 'monthly'].includes(value) ? value : 'weekly';
};

// ─── Export PDF ──────────────────────────────────────────────────────
exports.exportPDF = async (req, res, next) => {
  try {
    const period = getValidPeriod(req.query.period);
    const data = await generateReportData(period, req.query.startDate, req.query.endDate);

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=report_${period}_${Date.now()}.pdf`);
    doc.pipe(res);

    // Header
    doc.fontSize(24).fillColor('#4F46E5').text('Campus Canteen Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#666').text(`Period: ${period.toUpperCase()} | Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(1);

    // Summary
    doc.fontSize(16).fillColor('#1f2937').text('Summary', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#333');
    doc.text(`Total Orders: ${data.totalOrders}`);
    doc.text(`Completed: ${data.completedOrders}`);
    doc.text(`Cancelled: ${data.cancelledOrders}`);
    doc.text(`Total Revenue: ₹${data.totalRevenue.toLocaleString()}`);
    doc.moveDown(1);

    // Orders table
    doc.fontSize(16).fillColor('#1f2937').text('Order Details', { underline: true });
    doc.moveDown(0.5);

    const tableTop = doc.y;
    const headers = ['Order #', 'Student', 'Vendor', 'Amount', 'Status'];
    const colWidths = [80, 120, 120, 80, 80];
    let x = 50;

    // Table header
    doc.fontSize(10).fillColor('#4F46E5');
    headers.forEach((header, i) => {
      doc.text(header, x, tableTop, { width: colWidths[i] });
      x += colWidths[i];
    });

    doc.moveDown(0.5);
    doc.strokeColor('#ddd').lineWidth(1).moveTo(50, doc.y).lineTo(530, doc.y).stroke();

    // Table rows (limit to prevent oversized PDFs)
    const displayOrders = data.orders.slice(0, 50);
    doc.fontSize(9).fillColor('#333');

    displayOrders.forEach(order => {
      if (doc.y > 700) {
        doc.addPage();
      }
      x = 50;
      const y = doc.y + 5;
      doc.text(order.orderNumber || 'N/A', x, y, { width: colWidths[0] }); x += colWidths[0];
      doc.text(order.student?.name || 'N/A', x, y, { width: colWidths[1] }); x += colWidths[1];
      doc.text(order.vendor?.shopName || 'N/A', x, y, { width: colWidths[2] }); x += colWidths[2];
      doc.text(`₹${order.totalAmount}`, x, y, { width: colWidths[3] }); x += colWidths[3];
      doc.text(order.status, x, y, { width: colWidths[4] });
      doc.moveDown(0.8);
    });

    doc.end();
  } catch (error) {
    next(error);
  }
};

// ─── Export Excel ────────────────────────────────────────────────────
exports.exportExcel = async (req, res, next) => {
  try {
    const period = getValidPeriod(req.query.period);
    const data = await generateReportData(period, req.query.startDate, req.query.endDate);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Campus Canteen';

    // Summary sheet
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 25 },
      { header: 'Value', key: 'value', width: 20 },
    ];

    summarySheet.addRow({ metric: 'Period', value: period });
    summarySheet.addRow({ metric: 'Total Orders', value: data.totalOrders });
    summarySheet.addRow({ metric: 'Completed Orders', value: data.completedOrders });
    summarySheet.addRow({ metric: 'Cancelled Orders', value: data.cancelledOrders });
    summarySheet.addRow({ metric: 'Total Revenue (₹)', value: data.totalRevenue });

    // Style header
    summarySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    summarySheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };

    // Orders sheet
    const ordersSheet = workbook.addWorksheet('Orders');
    ordersSheet.columns = [
      { header: 'Order #', key: 'orderNumber', width: 15 },
      { header: 'Student', key: 'student', width: 20 },
      { header: 'Vendor', key: 'vendor', width: 20 },
      { header: 'Amount (₹)', key: 'amount', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Date', key: 'date', width: 18 },
    ];

    data.orders.forEach(order => {
      ordersSheet.addRow({
        orderNumber: order.orderNumber || 'N/A',
        student: order.student?.name || 'N/A',
        vendor: order.vendor?.shopName || 'N/A',
        amount: order.totalAmount,
        status: order.status,
        date: new Date(order.createdAt).toLocaleDateString(),
      });
    });

    ordersSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    ordersSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=report_${period}_${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};

// ─── Get report list ─────────────────────────────────────────────────
exports.getReports = async (req, res, next) => {
  try {
    const reports = await Report.find()
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, data: reports });
  } catch (error) {
    next(error);
  }
};
