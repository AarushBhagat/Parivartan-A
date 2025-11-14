import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import { authenticateUser } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
  const [selectedUserType, setSelectedUserType] = useState('');
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Placeholder for app download link - replace with actual link
  const APP_DOWNLOAD_LINK = 'https://your-app-download-link.com';

  const handleUserTypeClick = (userType) => {
    if (userType === 'citizen') {
      // Redirect to app download link
      window.open(APP_DOWNLOAD_LINK, '_blank');
    } else {
      setSelectedUserType(userType);
      setShowForm(true);
    }
  };

  const handleLogin = async (credentials) => {
    try {
      const result = await authenticateUser(selectedUserType, credentials);
      if (result.success) {
        // Use the auth context to set the logged-in state
        login(result.user, selectedUserType);
        
        // Navigate to appropriate dashboard based on user type
        if (selectedUserType === 'admin') {
          // For admin users, navigate to admin dashboard
          navigate('/admin', { 
            state: { userType: selectedUserType, userData: result.user } 
          });
        } else if (selectedUserType === 'staff') {
          // For staff users, navigate to staff dashboard
          navigate('/staff', { 
            state: { userType: selectedUserType, userData: result.user } 
          });
        } else if (selectedUserType === 'department') {
          // For department users, navigate to department-specific dashboard
          const departmentCode = result.user.department || 'pwd'; // Default to PWD if no department specified
          navigate(`/department/${departmentCode}`, { 
            state: { userType: selectedUserType, userData: result.user } 
          });
        } else {
          // For other users, navigate to general dashboard
          navigate('/dashboard', { 
            state: { userType: selectedUserType, userData: result.user } 
          });
        }
      } else {
        alert('Login failed: ' + result.error);
      }
    } catch (error) {
      alert('Login error: ' + error.message);
    }
  };

  const handleBack = () => {
    setShowForm(false);
    setSelectedUserType('');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {!showForm ? (
          <div className="user-selection">
            <h2>Select Login Type</h2>
            <div className="user-types">
              <div 
                className="user-type citizen" 
                onClick={() => handleUserTypeClick('citizen')}
                title="Download Mobile App"
              >
                <div className="user-icon">
                  👤
                </div>
                <span>Citizen</span>
              </div>
              
              <div 
                className="user-type admin" 
                onClick={() => handleUserTypeClick('admin')}
                title="Admin Login"
              >
                <div className="user-icon">
                  🛡️
                </div>
                <span>Admin</span>
              </div>
              
              <div 
                className="user-type staff" 
                onClick={() => handleUserTypeClick('staff')}
                title="Staff Login"
              >
                <div className="user-icon">
                  👥
                </div>
                <span>Staff</span>
              </div>
              
              <div 
                className="user-type department" 
                onClick={() => handleUserTypeClick('department')}
                title="Department Login"
              >
                <div className="user-icon">
                  🏢
                </div>
                <span>Department</span>
              </div>
            </div>
          </div>
        ) : (
          <LoginForm 
            userType={selectedUserType} 
            onLogin={handleLogin} 
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  );
};

export default LoginPage;