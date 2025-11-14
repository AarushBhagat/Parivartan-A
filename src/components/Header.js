import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-section">
          <h1 className="logo-text">Parivartan</h1>
        </div>
        <nav className="nav-menu">
          <a href="#about" className="nav-link">About</a>
          <a href="#contact" className="nav-link">Contact Us</a>
          <a className="nav-link" href="/faq">FAQ</a>
          {!isAuthenticated ? (
            <a className="login-btn" href="/login">Login</a>
          ) : (
            <div className="user-section">
              <span className="user-greeting">Welcome, {user?.username || user?.name || 'User'}!</span>
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;