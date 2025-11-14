import React from 'react';
import App from '../App';
import { API_CONFIG } from './config/api.config';
import { AuthProvider as RealAuthProvider } from './contexts/AuthContext';
import { AuthProvider as MockAuthProvider } from './services/mockAuthContext';
import { initializeMockData } from './services/mock/mockApi';

// Initialize mock data on app start if mock API is enabled
if (API_CONFIG.USE_MOCK_API) {
  // Initialize mock data asynchronously
  initializeMockData().then(success => {
    console.log('Mock data initialization:', success ? 'successful' : 'failed');
  });
}

// MockAppWrapper component that conditionally uses the appropriate AuthProvider
const MockAppWrapper = () => {
  // Choose the appropriate AuthProvider based on configuration
  const AuthProvider = API_CONFIG.USE_MOCK_API ? MockAuthProvider : RealAuthProvider;

  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
};

export default MockAppWrapper;