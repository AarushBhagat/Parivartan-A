import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import './GrievanceModal.css';

const GrievanceModal = ({ grievance, onClose, onStatusUpdate, onPriorityUpdate, onAssignStaff, department, isStaff }) => {
  const [selectedStatus, setSelectedStatus] = useState(grievance.status);
  const [selectedPriority, setSelectedPriority] = useState(grievance.priority);
  const [selectedStaff, setSelectedStaff] = useState(grievance.assignedTo || '');
  const [staffMembers, setStaffMembers] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [comment, setComment] = useState('');
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(null);

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#f39c12',
      'in-progress': '#3498db',
      'resolved': '#27ae60',
      'rejected': '#e74c3c'
    };
    return colors[status] || '#95a5a6';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'high': '#e74c3c',
      'medium': '#f39c12',
      'low': '#27ae60'
    };
    return colors[priority] || '#95a5a6';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStatusUpdate = () => {
    if (selectedStatus !== grievance.status) {
      onStatusUpdate(grievance.id, selectedStatus);
      // In real implementation, also save comment
      if (comment.trim()) {
        // saveComment(grievance.id, comment, selectedStatus);
      }
      setComment('');
      setShowCommentBox(false);
    }
  };

  const handlePriorityUpdate = () => {
    if (selectedPriority !== grievance.priority && onPriorityUpdate) {
      onPriorityUpdate(grievance.id, selectedPriority);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="grievance-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-left">
            <h2>Grievance Details</h2>
            <div className="grievance-id-large">#{grievance.id}</div>
          </div>
          <div className="header-right">
            <button className="print-btn" onClick={handlePrint}>
              🖨️ Print
            </button>
            <button className="close-btn" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        <div className="modal-content">
          <div className="status-priority-row">
            <div className="badge-container">
              <span 
                className="priority-badge large" 
                style={{ backgroundColor: getPriorityColor(grievance.priority) }}
              >
                {(grievance.priority || 'MEDIUM').toUpperCase()} PRIORITY
              </span>
              <span 
                className="status-badge large" 
                style={{ backgroundColor: getStatusColor(grievance.status) }}
              >
                {(grievance.status || 'pending').replace('-', ' ').toUpperCase()}
              </span>
            </div>
            <div className="submission-date">
              Submitted: {formatDate(grievance.createdAt || grievance.submittedDate || new Date().toISOString())}
            </div>
          </div>

          <div className="grievance-details">
            <div className="detail-section">
              <h3>Grievance Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Title:</label>
                  <span>{grievance.title || 'Untitled'}</span>
                </div>
                <div className="detail-item full-width">
                  <label>Description:</label>
                  <p>{grievance.description || 'No description provided'}</p>
                </div>
                <div className="detail-item">
                  <label>Category:</label>
                  <span>{grievance.category || grievance.department || 'General'}</span>
                </div>
                <div className="detail-item">
                  <label>Location:</label>
                  <span>
                    {typeof grievance.location === 'object'
                      ? (grievance.location?.address || grievance.location?.district || 'N/A')
                      : (grievance.location || 'N/A')
                    }
                  </span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Citizen Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Name:</label>
                  <span>{grievance.citizenName || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Phone:</label>
                  <span>{grievance.citizenPhone || 'Not provided'}</span>
                </div>
                <div className="detail-item">
                  <label>Email:</label>
                  <span>{grievance.citizenEmail || 'Not provided'}</span>
                </div>
                <div className="detail-item">
                  <label>Address:</label>
                  <span>{grievance.citizenAddress || grievance.location?.address || 'Not provided'}</span>
                </div>
              </div>
            </div>

            {grievance.images && grievance.images.length > 0 && (
              <div className="detail-section">
                <h3>Attachments ({grievance.images.length})</h3>
                <div className="image-gallery">
                  {grievance.images.map((image, index) => (
                    <img 
                      key={index} 
                      src={image} 
                      alt={`Evidence ${index + 1}`}
                      className="evidence-image"
                      onClick={() => setFullscreenImage(image)}
                      title="Click to view full size"
                    />
                  ))}
                </div>
              </div>
            )}

            {fullscreenImage && (
              <div className="fullscreen-image-overlay" onClick={() => setFullscreenImage(null)}>
                <div className="fullscreen-image-container">
                  <button className="close-fullscreen" onClick={() => setFullscreenImage(null)}>✕</button>
                  <img src={fullscreenImage} alt="Full size" className="fullscreen-image" />
                </div>
              </div>
            )}

            <div className="detail-section">
              <h3>Status Management</h3>
              <div className="status-update-section">
                <div className="status-select-row">
                  <label htmlFor="status-select">Update Status:</label>
                  <select
                    id="status-select"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {selectedStatus !== grievance.status && (
                  <div className="comment-section">
                    <button 
                      className="add-comment-btn"
                      onClick={() => setShowCommentBox(!showCommentBox)}
                    >
                      Add Comment (Optional)
                    </button>
                    
                    {showCommentBox && (
                      <textarea
                        placeholder="Add a comment about this status change..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="comment-textarea"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          {selectedStatus !== grievance.status && (
            <button className="update-btn" onClick={handleStatusUpdate}>
              Update Status
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GrievanceModal;