const express = require('express');
const router = express.Router();
const { uploadSingle, uploadMultiple, s3, bucketName } = require('../middleware/uploadMiddleware');

/**
 * @route   POST /api/upload/single
 * @desc    Upload single photo to AWS S3
 * @access  Public
 */
router.post('/single', (req, res) => {
  uploadSingle(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'Error uploading file'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Return file information
    res.json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        filename: req.file.key,
        url: req.file.location,
        size: req.file.size,
        mimetype: req.file.mimetype,
        bucket: req.file.bucket,
        etag: req.file.etag
      }
    });
  });
});

/**
 * @route   POST /api/upload/multiple
 * @desc    Upload multiple photos to AWS S3
 * @access  Public
 */
router.post('/multiple', (req, res) => {
  uploadMultiple(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'Error uploading files'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    // Return files information
    const filesInfo = req.files.map(file => ({
      filename: file.key,
      url: file.location,
      size: file.size,
      mimetype: file.mimetype,
      bucket: file.bucket,
      etag: file.etag
    }));

    res.json({
      success: true,
      message: `${req.files.length} file(s) uploaded successfully`,
      files: filesInfo
    });
  });
});

/**
 * @route   DELETE /api/upload/:filename
 * @desc    Delete photo from AWS S3
 * @access  Public
 */
router.delete('/:filename(*)', async (req, res) => {
  try {
    const filename = req.params.filename;

    const params = {
      Bucket: bucketName,
      Key: filename
    };

    await s3.deleteObject(params).promise();

    res.json({
      success: true,
      message: 'File deleted successfully',
      filename: filename
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting file',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/upload/list
 * @desc    List all uploaded files
 * @access  Public
 */
router.get('/list', async (req, res) => {
  try {
    const params = {
      Bucket: bucketName,
      MaxKeys: 100
    };

    const data = await s3.listObjectsV2(params).promise();

    const files = data.Contents.map(file => ({
      key: file.Key,
      url: `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.Key}`,
      size: file.Size,
      lastModified: file.LastModified
    }));

    res.json({
      success: true,
      count: files.length,
      files: files
    });
  } catch (error) {
    console.error('List error:', error);
    res.status(500).json({
      success: false,
      message: 'Error listing files',
      error: error.message
    });
  }
});

module.exports = router;
