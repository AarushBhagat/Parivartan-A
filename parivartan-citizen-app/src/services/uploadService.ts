import { getApiUrl } from '../config/api.config';

// Get API base URL from configuration
const API_BASE_URL = getApiUrl();

/**
 * Upload photos to AWS S3 via backend API
 * @param mediaFiles Array of media files with uri, type, and name
 * @param uploadType Type of upload (issue, profile, resolution)
 * @returns Promise with uploaded file URLs
 */
export const uploadPhotosToS3 = async (
  mediaFiles: Array<{ uri: string; type: string; name: string }>,
  uploadType: string = 'issue'
): Promise<any> => {
  try {
    if (!mediaFiles || mediaFiles.length === 0) {
      throw new Error('No files to upload');
    }

    const formData = new FormData();

    // Add type field
    formData.append('type', uploadType);

    // Add all photos
    mediaFiles.forEach((file, index) => {
      // For React Native, we need to append the file properly
      formData.append('photos', {
        uri: file.uri,
        type: file.type || 'image/jpeg',
        name: file.name || `photo_${index}_${Date.now()}.jpg`,
      } as any);
    });

    console.log(`Uploading ${mediaFiles.length} photos to AWS S3...`);

    // Upload to backend upload endpoint
    const response = await fetch(`${API_BASE_URL}/upload/multiple`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Upload failed');
    }

    console.log('✅ Photos uploaded successfully to AWS S3');
    console.log('Uploaded files:', result.files);

    return result;
  } catch (error) {
    console.error('Error uploading photos to S3:', error);
    throw error;
  }
};

/**
 * Upload single photo to AWS S3
 * @param mediaFile Media file with uri, type, and name
 * @param uploadType Type of upload (issue, profile, resolution)
 * @returns Promise with uploaded file URL
 */
export const uploadSinglePhotoToS3 = async (
  mediaFile: { uri: string; type: string; name: string },
  uploadType: string = 'issue'
): Promise<any> => {
  try {
    const formData = new FormData();

    // Add type field
    formData.append('type', uploadType);

    // Add photo
    formData.append('photo', {
      uri: mediaFile.uri,
      type: mediaFile.type || 'image/jpeg',
      name: mediaFile.name || `photo_${Date.now()}.jpg`,
    } as any);

    console.log('Uploading photo to AWS S3...');

    // Upload to backend upload endpoint
    const response = await fetch(`${API_BASE_URL}/upload/single`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Upload failed');
    }

    console.log('✅ Photo uploaded successfully to AWS S3');
    console.log('Uploaded file:', result.file);

    return result;
  } catch (error) {
    console.error('Error uploading photo to S3:', error);
    throw error;
  }
};

/**
 * Delete photo from AWS S3
 * @param filename The filename/key to delete
 * @returns Promise with delete result
 */
export const deletePhotoFromS3 = async (filename: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/upload/${encodeURIComponent(filename)}`, {
      method: 'DELETE',
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Delete failed');
    }

    console.log('✅ Photo deleted successfully from AWS S3');
    return result;
  } catch (error) {
    console.error('Error deleting photo from S3:', error);
    throw error;
  }
};

export const uploadService = {
  uploadPhotos: uploadPhotosToS3,
  uploadSinglePhoto: uploadSinglePhotoToS3,
  deletePhoto: deletePhotoFromS3,
};
