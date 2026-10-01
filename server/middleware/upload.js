const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const ALLOWED_MIMES = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/gif', '.gif'],
  ['image/webp', '.webp'],
]);

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    // Cryptographically random filename — no user-controlled input used
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = ALLOWED_MIMES.get(file.mimetype) || path.extname(file.originalname).toLowerCase().slice(0, 10);
    cb(null, `${Date.now()}-${uniqueSuffix}${ext}`);
  },
});

// File filter — only images, validated by MIME type (not just extension)
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIMES.has(file.mimetype)) {
    return cb(null, true);
  }
  cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
});

module.exports = upload;
