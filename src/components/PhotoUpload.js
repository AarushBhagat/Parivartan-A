import React, { useState } from 'react';
import { uploadSinglePhoto, uploadMultiplePhotos, validateFile } from '../services/uploadService';
import './PhotoUpload.css';

const PhotoUpload = ({ onUploadSuccess, multiple = false, type = 'issue' }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [uploadedUrls, setUploadedUrls] = useState([]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setError('');

    // Validate each file
    const validFiles = [];
    const newPreviews = [];

    files.forEach((file) => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
        
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result);
          if (newPreviews.length === files.length) {
            setPreviews(multiple ? [...previews, ...newPreviews] : newPreviews);
          }
        };
        reader.readAsDataURL(file);
      } else {
        setError(validation.error);
      }
    });

    setSelectedFiles(multiple ? [...selectedFiles, ...validFiles] : validFiles);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one file');
      return;
    }

    setUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      let result;
      
      if (multiple) {
        result = await uploadMultiplePhotos(selectedFiles, type);
        setUploadedUrls(result.files.map(f => f.url));
      } else {
        result = await uploadSinglePhoto(selectedFiles[0], type);
        setUploadedUrls([result.file.url]);
      }

      setUploadProgress(100);
      
      // Call success callback
      if (onUploadSuccess) {
        onUploadSuccess(multiple ? result.files : result.file);
      }

      // Reset form
      setTimeout(() => {
        setSelectedFiles([]);
        setPreviews([]);
        setUploadProgress(0);
      }, 2000);

    } catch (err) {
      setError(err.message || 'Upload failed');
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
  };

  return (
    <div className="photo-upload-container">
      <div className="upload-section">
        <label htmlFor="file-input" className="file-input-label">
          <div className="upload-icon">📷</div>
          <div className="upload-text">
            {multiple ? 'Click to select photos (up to 5)' : 'Click to select photo'}
          </div>
          <input
            id="file-input"
            type="file"
            accept="image/*"
            multiple={multiple}
            onChange={handleFileSelect}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </label>

        {/* Preview Section */}
        {previews.length > 0 && (
          <div className="preview-section">
            <h4>Selected Photos:</h4>
            <div className="preview-grid">
              {previews.map((preview, index) => (
                <div key={index} className="preview-item">
                  <img src={preview} alt={`Preview ${index + 1}`} />
                  <button
                    className="remove-btn"
                    onClick={() => removeFile(index)}
                    disabled={uploading}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Button */}
        {selectedFiles.length > 0 && (
          <button
            className="upload-btn"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} Photo(s)`}
          </button>
        )}

        {/* Progress Bar */}
        {uploading && (
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${uploadProgress}%` }}
            />
            <span className="progress-text">{uploadProgress}%</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {/* Success Message */}
        {uploadedUrls.length > 0 && !uploading && (
          <div className="success-message">
            ✅ Upload successful! {uploadedUrls.length} photo(s) uploaded.
          </div>
        )}
      </div>

      {/* Uploaded URLs */}
      {uploadedUrls.length > 0 && (
        <div className="uploaded-urls">
          <h4>Uploaded Photo URLs:</h4>
          {uploadedUrls.map((url, index) => (
            <div key={index} className="url-item">
              <input type="text" value={url} readOnly />
              <button onClick={() => navigator.clipboard.writeText(url)}>
                Copy
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;
