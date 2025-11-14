import React, { useState } from 'react';
import GrievanceCard from './GrievanceCard';
import GrievanceModal from './GrievanceModal';
import './GrievanceList.css';

const GrievanceList = ({ grievances, onStatusUpdate, department }) => {
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [showModal, setShowModal] = useState(false);

  console.log('GrievanceList - Rendering with:', {
    grievancesCount: grievances?.length,
    hasStatusUpdate: typeof onStatusUpdate === 'function',
    department
  });

  const handleViewDetails = (grievance) => {
    console.log('GrievanceList - View details called for:', grievance?.id);
    setSelectedGrievance(grievance);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    console.log('GrievanceList - Closing modal');
    setShowModal(false);
    setSelectedGrievance(null);
  };

  const handleStatusUpdate = (grievanceId, newStatus) => {
    console.log('GrievanceList - Status update called:', grievanceId, newStatus);
    if (typeof onStatusUpdate === 'function') {
      onStatusUpdate(grievanceId, newStatus);
      // Update the selected grievance if it's currently open
      if (selectedGrievance && selectedGrievance.id === grievanceId) {
        setSelectedGrievance({
          ...selectedGrievance,
          status: newStatus
        });
      }
    } else {
      console.error('GrievanceList - onStatusUpdate is not a function!');
    }
  };

  if (grievances.length === 0) {
    return (
      <div className="no-grievances">
        <div className="no-grievances-icon">📋</div>
        <h3>No Grievances Found</h3>
        <p>No grievances match your current filters.</p>
      </div>
    );
  }

  return (
    <div className="grievance-list-container">
      <div className="grievance-list">
        {grievances.map((grievance) => (
          <GrievanceCard
            key={grievance.id}
            grievance={grievance}
            onViewDetails={handleViewDetails}
            onStatusUpdate={handleStatusUpdate}
            department={department}
          />
        ))}
      </div>

      {showModal && selectedGrievance && (
        <GrievanceModal
          grievance={selectedGrievance}
          onClose={handleCloseModal}
          onStatusUpdate={handleStatusUpdate}
          department={department}
        />
      )}
    </div>
  );
};

export default GrievanceList;