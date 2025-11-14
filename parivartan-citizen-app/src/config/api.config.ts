// API Configuration
// Update this file with your backend server details

// For development, use one of these based on your setup:
// - Android Emulator: 'http://10.0.2.2:5000/api'
// - iOS Simulator: 'http://localhost:5000/api'
// - Physical Device: 'http://YOUR_COMPUTER_IP:5000/api' (replace YOUR_COMPUTER_IP with your actual IP)

export const API_CONFIG = {
  // FOR LAN MODE (physical device on same WiFi network as backend)
  BASE_URL: 'http://172.20.10.3:5000/api', // Backend server network IP
  
  // Alternative configurations (uncomment the one you need):
  // BASE_URL: 'http://10.0.2.2:5000/api', // For Android Emulator
  // BASE_URL: 'http://localhost:5000/api', // For iOS Simulator  
  // BASE_URL: 'https://your-production-api.com/api', // For production
  
  TIMEOUT: 30000, // 30 seconds
  
  // Enable or disable mock API mode
  USE_MOCK_API: false, // REAL API MODE - connects to backend and Firebase
  
  // Simulate network delay (only for mock API)
  MOCK_API_MIN_DELAY: 300, // Minimum delay in ms
  MOCK_API_MAX_DELAY: 1200, // Maximum delay in ms
};

// Helper function to get the correct API URL based on platform
export const getApiUrl = () => {
  return API_CONFIG.BASE_URL;
};
