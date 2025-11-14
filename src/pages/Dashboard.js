import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userType, userData } = location.state || {};

  useEffect(() => {
    // Redirect department users to their specific department dashboard
    if (userType === 'department' && userData?.department) {
      navigate(`/department/${userData.department}`, { 
        state: { userData, userType } 
      });
    }
  }, [userType, userData, navigate]);

  const getDashboardTitle = () => {
    switch(userType) {
      case 'admin': return 'Admin Dashboard';
      case 'staff': return 'Staff Dashboard';  
      case 'department': return 'Department Dashboard';
      default: return 'Dashboard';
    }
  };

  const getDepartmentFullName = (deptCode) => {
    const departmentNames = {
      'pwd': 'Public Works Department (PWD)',
      'municipal': 'Municipal Corporation / Nagar Council / Nagar Panchayat',
      'traffic-police': 'Traffic Police',
      'water-sanitation': 'Water Supply & Sanitation Department',
      'pspcl': 'Punjab State Power Corporation Limited (PSPCL)',
      'health-welfare': 'Health & Family Welfare Department',
      'civil-surgeon': 'Civil Surgeon\'s Office',
      'punjab-police': 'Punjab Police (SSP, Kapurthala)',
      'education': 'District Education Officer (DEO) – School Education Department',
      'agriculture': 'Agriculture & Farmers Welfare Department',
      'food-civil-supplies': 'Food & Civil Supplies Department',
      'roadways': 'Punjab Roadways / PRTC',
      'rto': 'Regional Transport Office (RTO)',
      'revenue': 'Revenue Department (under Deputy Commissioner)',
      'social-security': 'Social Security & Women & Child Development',
      'pollution-control': 'Punjab Pollution Control Board (PPCB)',
      'forest': 'Forest Department',
      'disaster-management': 'District Disaster Management Authority (DDMA)'
    };
    return departmentNames[deptCode] || deptCode;
  };

  // Show loading for department users while redirecting
  if (userType === 'department') {
    return (
      <div className="dashboard">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Redirecting to department dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>{getDashboardTitle()}</h1>
        <p>Welcome, {userData?.username || 'User'}!</p>
      </div>
      
      <div className="dashboard-content">
        <div className="dashboard-card">
          <h3>User Information</h3>
          <p><strong>Type:</strong> {userType}</p>
          <p><strong>Username:</strong> {userData?.username}</p>
          {userData?.department && (
            <p><strong>Department:</strong> {getDepartmentFullName(userData.department)}</p>
          )}
        </div>
        
        <div className="dashboard-card">
          <h3>Quick Actions</h3>
          <button className="action-button">View Profile</button>
          <button className="action-button">Settings</button>
          <button className="action-button">Logout</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;