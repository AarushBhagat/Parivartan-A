import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Upload single photo to AWS S3
 * @param {File} file - The file to upload
 * @param {string} type - Type of upload (issue, profile, resolution)
 * @returns {Promise} Upload response with file URL
 */
export const uploadSinglePhoto = async (file, type = 'issue') => {
  try {
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('type', type);

    const response = await axios.post(`${API_BASE_URL}/upload/single`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`Upload Progress: ${percentCompleted}%`);
      }
    });

    return response.data;
  } catch (error) {
    console.error('Upload error:', error);
    throw error.response?.data || error;
  }
};

/**
 * Upload multiple photos to AWS S3
 * @param {FileList|Array} files - The files to upload
 * @param {string} type - Type of upload (issue, profile, resolution)
 * @returns {Promise} Upload response with files URLs
 */
export const uploadMultiplePhotos = async (files, type = 'issue') => {
  try {
    const formData = new FormData();
    
    // Append all files
    Array.from(files).forEach((file) => {
      formData.append('photos', file);
    });
    formData.append('type', type);

    const response = await axios.post(`${API_BASE_URL}/upload/multiple`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`Upload Progress: ${percentCompleted}%`);
      }
    });

    return response.data;
  } catch (error) {
    console.error('Upload error:', error);
    throw error.response?.data || error;
  }
};

/**
 * Delete photo from AWS S3
 * @param {string} filename - The filename/key to delete
 * @returns {Promise} Delete response
 */
export const deletePhoto = async (filename) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/upload/${filename}`);
    return response.data;
  } catch (error) {
    console.error('Delete error:', error);
    throw error.response?.data || error;
  }
};

/**
 * List all uploaded files
 * @returns {Promise} List of files
 */
export const listUploadedFiles = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/upload/list`);
    return response.data;
  } catch (error) {
    console.error('List error:', error);
    throw error.response?.data || error;
  }
};

/**
 * Validate file before upload
 * @param {File} file - File to validate
 * @returns {Object} Validation result
 */
export const validateFile = (file) => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only image files are allowed (JPEG, PNG, GIF, WEBP)' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 5MB' };
  }

  return { valid: true };
};
