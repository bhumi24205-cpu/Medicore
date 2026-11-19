const multer = require('multer');

// Store file in memory as Buffer to directly stream or insert into MySQL BLOB columns
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, or WebP images are allowed (max 1 MB).'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 // 1 MB limit
  },
  fileFilter
});

module.exports = upload;
