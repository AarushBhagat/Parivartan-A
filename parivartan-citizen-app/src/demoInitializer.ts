import { initializeApp, getApps } from 'firebase/app';
import { API_CONFIG } from './config/api.config';
import { initializeMockData } from './services/mock/mockApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Initialize the demo environment by setting up mock data
 * and configuring the app to use mock APIs
 * NOW RESPECTS API_CONFIG.USE_MOCK_API setting - won't force mock mode if disabled
 */
export const initializeDemoEnvironment = async () => {
  // If mock API is disabled, skip demo initialization entirely
  if (!API_CONFIG.USE_MOCK_API) {
    console.log('✅ Mock API disabled - using REAL API and Firebase backend');
    return true;
  }
  
  console.log('🚀 Initializing Parivartan Demo Mode...');
  
  try {
    // Respect API_CONFIG setting - don't force mock mode
    console.log('Using mock API mode as configured');

    // Clear any existing stored auth state from previous real auth sessions
    console.log('Clearing existing auth state...');
    try {
      await AsyncStorage.removeItem('parivartan_user');
      await AsyncStorage.removeItem('parivartan_user_details');
    } catch (storageError) {
      console.warn('Error clearing auth state, continuing anyway:', storageError);
      // Continue execution despite storage errors
    }
    
    // Initialize mock data with fresh data
    console.log('Generating fresh mock data...');
    let success = false;
    try {
      success = await initializeMockData(true);
      console.log(`Mock data initialization: ${success ? 'successful' : 'failed'}`);
    } catch (mockDataError) {
      console.error('Error initializing mock data:', mockDataError);
      // Even if mock data fails, continue to see if we can at least get the app running
    }
    
    // Auto-login with a mock user
    console.log('Setting up mock authentication...');
    try {
      const mockData = await AsyncStorage.getItem('parivartan_mock_data');
      if (mockData) {
        const data = JSON.parse(mockData);
        
        if (data && data.users && data.users.length > 0) {
          const defaultUser = data.users[0]; // Use first user as default
          
          // Store as current user
          await AsyncStorage.setItem('parivartan_current_user', JSON.stringify(defaultUser));
          
          // Also store in auth storage format
          const authUser = {
            uid: defaultUser.id,
            email: defaultUser.email,
            displayName: defaultUser.displayName,
            photoURL: defaultUser.photoURL || null,
            emailVerified: true,
            phoneNumber: defaultUser.phone || null,
            role: defaultUser.role
          };
          
          await AsyncStorage.setItem('parivartan_user', JSON.stringify(authUser));
          await AsyncStorage.setItem('parivartan_user_details', JSON.stringify(defaultUser));
          
          console.log(`Auto-logged in as: ${defaultUser.displayName}`);
        } else {
          console.warn("No users found in mock data or data structure is invalid");
        }
      } else {
        console.warn("No mock data found in storage");
      }
    } catch (authError) {
      console.error('Error setting up mock authentication:', authError);
      // Continue despite auth errors
    }
    
    console.log('✅ Demo mode initialized successfully!');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize demo mode:', error);
    throw error; // Propagate error so it can be shown to the user
  }
};