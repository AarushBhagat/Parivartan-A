import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import './GrievanceCard.css';

const GrievanceCard = ({ grievance, onViewDetails, onStatusUpdate, department }) => {
  const [staffMembers, setStaffMembers] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  
  console.log('GrievanceCard rendering for:', grievance?.id);
  
  React.useEffect(() => {
    console.log('GrievanceCard - Props check for', grievance?.id, ':', {
      hasGrievance: !!grievance,
      hasOnViewDetails: typeof onViewDetails === 'function',
      hasOnStatusUpdate: typeof onStatusUpdate === 'function',
      grievanceStatus: grievance?.status,
      grievanceId: grievance?.id
    });
  }, [grievance, onViewDetails, onStatusUpdate]);

  // Load staff members from Firebase
  useEffect(() => {
    const loadStaffMembers = async () => {
      if (!department) {
        console.log('GrievanceCard - No department provided, skipping staff load');
        return;
      }
      
      setLoadingStaff(true);
      console.log('GrievanceCard - Loading staff for department:', department);
      
      try {
        const usersRef = collection(db, 'users');
        // Try both 'role' and 'userType' fields for compatibility
        const q = query(
          usersRef, 
          where('department', '==', department)
        );
        const snapshot = await getDocs(q);
        
        // Filter staff members (checking both role and userType)
        const staff = snapshot.docs
          .filter(doc => {
            const data = doc.data();
            return data.role === 'staff' || data.userType === 'staff';
          })
          .map(doc => ({
            uid: doc.id,
            ...doc.data()
          }));
        
        setStaffMembers(staff);
        console.log(`GrievanceCard - Loaded ${staff.length} staff members for department ${department}:`, staff);
      } catch (error) {
        console.error('GrievanceCard - Error loading staff members:', error);
      } finally {
        setLoadingStaff(false);
      }
    };

    loadStaffMembers();
  }, [department]);
  
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
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusOptions = (currentStatus) => {
    const allStatuses = ['pending', 'in-progress', 'resolved', 'rejected'];
    return allStatuses.filter(status => status !== currentStatus);
  };

  const handleStatusChange = (e) => {
    e.stopPropagation();
    const newStatus = e.target.value;
    console.log('GrievanceCard - Status change triggered:', newStatus);
    console.log('GrievanceCard - Current status:', grievance.status);
    console.log('GrievanceCard - Grievance ID:', grievance.id);
    console.log('GrievanceCard - onStatusUpdate type:', typeof onStatusUpdate);
    
    if (newStatus && newStatus !== '' && newStatus !== grievance.status) {
      console.log('GrievanceCard - Calling onStatusUpdate with:', grievance.id, newStatus);
      if (typeof onStatusUpdate === 'function') {
        onStatusUpdate(grievance.id, newStatus);
        // Reset the select after update
        e.target.value = '';
      } else {
        console.error('GrievanceCard - onStatusUpdate is not a function!');
      }
    }
  };

  const handleViewDetails = (e) => {
    e.stopPropagation();
    console.log('View details clicked for:', grievance.id);
    console.log('onViewDetails function:', typeof onViewDetails);
    if (typeof onViewDetails === 'function') {
      onViewDetails(grievance);
    } else {
      console.error('onViewDetails is not a function!');
    }
  };

  const handleStaffAssignment = async (e) => {
    e.stopPropagation();
    const staffUid = e.target.value;
    
    if (!staffUid || staffUid === '') return;
    
    try {
      // Find selected staff member
      const selectedStaff = staffMembers.find(s => s.uid === staffUid);
      
      if (!selectedStaff) {
        console.error('Staff member not found');
        return;
      }

      // Update grievance in Firebase
      const grievanceRef = doc(db, 'grievances', grievance.id);
      await updateDoc(grievanceRef, {
        assignedTo: staffUid,
        assignedToName: selectedStaff.displayName || selectedStaff.username,
        assignedAt: new Date().toISOString(),
        status: 'in-progress' // Auto-update status to in-progress when assigned
      });

      alert(`✅ Task assigned to ${selectedStaff.displayName || selectedStaff.username}`);
      
      // Refresh the page or trigger parent update
      if (typeof onStatusUpdate === 'function') {
        onStatusUpdate(grievance.id, 'in-progress');
      }
      
      // Reset select
      e.target.value = '';
    } catch (error) {
      console.error('Error assigning staff:', error);
      alert('❌ Failed to assign task. Please try again.');
    }
  };

  return (
    <div className="grievance-card">
      <div className="card-header">
        <div className="grievance-id">#{grievance.id}</div>
        <div className="card-badges">
          <span 
            className="priority-badge" 
            style={{ backgroundColor: getPriorityColor(grievance.priority) }}
          >
            {(grievance.priority || 'medium').toUpperCase()}
          </span>
          <span 
            className="status-badge" 
            style={{ backgroundColor: getStatusColor(grievance.status) }}
          >
            {(grievance.status || 'pending').replace('-', ' ').toUpperCase()}
          </span>
        </div>
      </div>

      <div className="card-content">
        <h3 className="grievance-title">{grievance.title || 'Untitled'}</h3>
        <p className="grievance-description">
          {grievance.description && grievance.description.length > 150 
            ? `${grievance.description.substring(0, 150)}...`
            : (grievance.description || 'No description provided')
          }
        </p>
        
        <div className="grievance-meta">
          <div className="meta-item">
            <span className="meta-label">Submitted by:</span>
            <span className="meta-value">{grievance.citizenName || 'Unknown'}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Contact:</span>
            <span className="meta-value">{grievance.citizenPhone || grievance.citizenEmail || 'N/A'}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Location:</span>
            <span className="meta-value">
              {typeof grievance.location === 'object' 
                ? (grievance.location?.address || grievance.location?.district || 'N/A')
                : (grievance.location || 'N/A')
              }
            </span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Date:</span>
            <span className="meta-value">{formatDate(grievance.createdAt || grievance.submittedDate || new Date().toISOString())}</span>
          </div>
        </div>
      </div>

      <div className="card-footer">
        <div className="status-update">
          <label htmlFor={`status-${grievance.id}`}>Update Status:</label>
          <select
            id={`status-${grievance.id}`}
            value=""
            onChange={handleStatusChange}
            onClick={(e) => {
              e.stopPropagation();
              console.log('GrievanceCard - Select clicked for:', grievance.id);
            }}
            onFocus={() => console.log('GrievanceCard - Select focused for:', grievance.id)}
          >
            <option value="">Change Status</option>
            {getStatusOptions(grievance.status).map(status => (
              <option key={status} value={status}>
                {status.replace('-', ' ').toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="staff-assignment">
          <label htmlFor={`staff-${grievance.id}`}>Assign to Staff:</label>
          <select
            id={`staff-${grievance.id}`}
            value=""
            onChange={handleStaffAssignment}
            onClick={(e) => e.stopPropagation()}
            disabled={loadingStaff || staffMembers.length === 0}
          >
            <option value="">
              {loadingStaff ? 'Loading...' : 
               staffMembers.length === 0 ? 'No staff available' : 
               grievance.assignedToName ? `Assigned: ${grievance.assignedToName}` : 'Assign Task'}
            </option>
            {staffMembers.map(staff => (
              <option key={staff.uid} value={staff.uid}>
                {staff.displayName || staff.username}
              </option>
            ))}
          </select>
        </div>
        
        <button 
          className="view-details-btn"
          onClick={handleViewDetails}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default GrievanceCard;