import React, { useState } from 'react';
import PhotoUpload from '../components/PhotoUpload';
import './UploadExample.css';

const UploadExample = () => {
  const [issuePhotos, setIssuePhotos] = useState([]);
  const [profilePhoto, setProfilePhoto] = useState(null);

  const handleIssueUpload = (files) => {
    console.log('Issue photos uploaded:', files);
    setIssuePhotos(files);
    alert(`Successfully uploaded ${files.length} issue photo(s)`);
  };

  const handleProfileUpload = (file) => {
    console.log('Profile photo uploaded:', file);
    setProfilePhoto(file);
    alert('Profile photo uploaded successfully!');
  };

  return (
    <div className="upload-example-container">
      <h1>Photo Upload Examples</h1>
      
      <div className="example-section">
        <h2>1. Issue Photo Upload (Multiple)</h2>
        <p>Upload multiple photos for civic issues</p>
        <PhotoUpload 
          multiple={true}
          type="issue"
          onUploadSuccess={handleIssueUpload}
        />
      </div>

      <div className="example-section">
        <h2>2. Profile Photo Upload (Single)</h2>
        <p>Upload a single profile photo</p>
        <PhotoUpload 
          multiple={false}
          type="profile"
          onUploadSuccess={handleProfileUpload}
        />
      </div>

      <div className="example-section">
        <h2>3. Resolution Photo Upload (Multiple)</h2>
        <p>Upload before/after resolution photos</p>
        <PhotoUpload 
          multiple={true}
          type="resolution"
          onUploadSuccess={(files) => {
            console.log('Resolution photos:', files);
          }}
        />
      </div>

      {/* Display uploaded data */}
      {issuePhotos.length > 0 && (
        <div className="uploaded-data">
          <h3>Uploaded Issue Photos:</h3>
          <pre>{JSON.stringify(issuePhotos, null, 2)}</pre>
        </div>
      )}

      {profilePhoto && (
        <div className="uploaded-data">
          <h3>Uploaded Profile Photo:</h3>
          <pre>{JSON.stringify(profilePhoto, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default UploadExample;
