import React, { useState } from 'react';
import './CheckStatusPage.css';

const CheckStatusPage = () => {
  const [grievanceNumber, setGrievanceNumber] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Mock grievance data for demonstration
  const mockGrievances = {
    'GRV001': {
      id: 'GRV001',
      title: 'Road Repair Request',
      description: 'Pothole on Main Street needs repair',
      status: 'In Progress',
      department: 'Public Works Department',
      submittedDate: '2025-09-20',
      lastUpdated: '2025-09-23',
      assignedOfficer: 'John Smith',
      estimatedCompletion: '2025-09-30'
    },
    'GRV002': {
      id: 'GRV002',
      title: 'Street Light Issue',
      description: 'Street light not working on Park Avenue',
      status: 'Resolved',
      department: 'Municipal Corporation',
      submittedDate: '2025-09-18',
      lastUpdated: '2025-09-22',
      assignedOfficer: 'Sarah Johnson',
      estimatedCompletion: 'Completed'
    },
    'GRV003': {
      id: 'GRV003',
      title: 'Water Supply Problem',
      description: 'No water supply for 3 days',
      status: 'Pending',
      department: 'Water Supply & Sanitation',
      submittedDate: '2025-09-24',
      lastUpdated: '2025-09-24',
      assignedOfficer: 'Not Assigned',
      estimatedCompletion: 'TBD'
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    console.log('Form submitted with grievance number:', grievanceNumber);
    
    setLoading(true);
    setError('');
    setStatus(null);

    // Simulate API call delay
    setTimeout(() => {
      if (!grievanceNumber.trim()) {
        setError('Please enter a grievance number');
        setLoading(false);
        return;
      }

      const foundGrievance = mockGrievances[grievanceNumber.toUpperCase()];
      console.log('Search result:', foundGrievance);
      
      if (foundGrievance) {
        setStatus(foundGrievance);
        console.log('Grievance found:', foundGrievance);
      } else {
        setError('Grievance not found. Please check your grievance number and try again.');
        console.log('Grievance not found for number:', grievanceNumber);
      }
      
      setLoading(false);
    }, 1000);
  };

  const handleSampleClick = (sampleNumber) => {
    console.log('Sample clicked:', sampleNumber);
    setGrievanceNumber(sampleNumber);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return '#FF9800';
      case 'in progress': return '#2196F3';
      case 'resolved': return '#4CAF50';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return '⏳';
      case 'in progress': return '🔄';
      case 'resolved': return '✅';
      default: return '❓';
    }
  };

  return (
    <div className="check-status-page">
      <div className="status-container">
        <div className="status-header">
          <h1>Check Grievance Status</h1>
          <p>Enter your grievance number to track the status of your complaint</p>
        </div>

        <form onSubmit={handleSearch} className="search-form">
          <div className="input-group">
            <label htmlFor="grievanceNumber">Grievance Number:</label>
            <input
              type="text"
              id="grievanceNumber"
              value={grievanceNumber}
              onChange={(e) => setGrievanceNumber(e.target.value)}
              placeholder="Enter your grievance number (e.g., GRV001)"
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading} 
            className="search-btn"
            onClick={(e) => {
              console.log('Button clicked!');
              if (!loading) {
                handleSearch(e);
              }
            }}
          >
            {loading ? 'Searching...' : 'Check Status'}
          </button>
        </form>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {status && (
          <div className="status-result">
            <div className="status-card">
              <div className="status-badge">
                <span 
                  className="status-indicator" 
                  style={{ backgroundColor: getStatusColor(status.status) }}
                >
                  {getStatusIcon(status.status)} {status.status}
                </span>
              </div>
              
              <h2>{status.title}</h2>
              <p className="grievance-id">Grievance ID: {status.id}</p>
              
              <div className="status-details">
                <div className="detail-row">
                  <span className="label">Description:</span>
                  <span className="value">{status.description}</span>
                </div>
                
                <div className="detail-row">
                  <span className="label">Department:</span>
                  <span className="value">{status.department}</span>
                </div>
                
                <div className="detail-row">
                  <span className="label">Assigned Officer:</span>
                  <span className="value">{status.assignedOfficer}</span>
                </div>
                
                <div className="detail-row">
                  <span className="label">Submitted Date:</span>
                  <span className="value">{new Date(status.submittedDate).toLocaleDateString()}</span>
                </div>
                
                <div className="detail-row">
                  <span className="label">Last Updated:</span>
                  <span className="value">{new Date(status.lastUpdated).toLocaleDateString()}</span>
                </div>
                
                <div className="detail-row">
                  <span className="label">Estimated Completion:</span>
                  <span className="value">{status.estimatedCompletion === 'Completed' ? 'Completed' : 
                    status.estimatedCompletion === 'TBD' ? 'To Be Determined' : 
                    new Date(status.estimatedCompletion).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="sample-numbers">
          <h3>Sample Grievance Numbers for Testing:</h3>
          <div className="sample-list">
            <span className="sample-number" onClick={() => handleSampleClick('GRV001')}>GRV001</span>
            <span className="sample-number" onClick={() => handleSampleClick('GRV002')}>GRV002</span>
            <span className="sample-number" onClick={() => handleSampleClick('GRV003')}>GRV003</span>
          </div>
          <p className="note">Click on any sample number to test the functionality</p>
        </div>
      </div>
    </div>
  );
};

export default CheckStatusPage;