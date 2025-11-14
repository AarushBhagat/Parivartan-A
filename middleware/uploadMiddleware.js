const multer = require('multer');
const multerS3 = require('multer-s3');
const { s3, bucketName } = require('../config/aws-config');
const path = require('path');

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// Configure multer-s3 for direct upload to S3
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: bucketName,
    contentType: multerS3.AUTO_CONTENT_TYPE, // Auto-detect content type
    metadata: function (req, file, cb) {
      cb(null, {
        fieldName: file.fieldname,
        uploadedBy: req.user ? req.user.uid : 'anonymous',
        uploadedAt: new Date().toISOString()
      });
    },
    key: function (req, file, cb) {
      // Organize files by type and date
      const folder = req.body.type || 'general'; // 'issue', 'profile', 'resolution'
      const date = new Date().toISOString().split('T')[0];
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const filename = `${folder}/${date}/${uniqueSuffix}${path.extname(file.originalname)}`;
      cb(null, filename);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit per file
  },
  fileFilter: fileFilter
});

// Single file upload
const uploadSingle = upload.single('photo');

// Multiple files upload (up to 5)
const uploadMultiple = upload.array('photos', 5);

module.exports = {
  uploadSingle,
  uploadMultiple,
  s3,
  bucketName
};
