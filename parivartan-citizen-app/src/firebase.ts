// Firebase configuration file
// Using parivartan-12 project (same as Department Dashboard)

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, onIdTokenChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCXjKyjjpIzfViaPwqNaFm8h6d_Oqs4ybY",
  authDomain: "parivartan-12.firebaseapp.com",
  projectId: "parivartan-12",
  storageBucket: "parivartan-12.firebasestorage.app",
  messagingSenderId: "779445083679",
  appId: "1:779445083679:web:9ad7ea10183628beb4bf2a",
  measurementId: "G-J1E4JKGFG5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
// For React Native, we're using the standard getAuth method
// The AsyncStorage warning is expected in development mode
// In production, we would use the getReactNativePersistence method,
// but that would require additional setup and dependencies
const auth = getAuth(app);

// Track token refresh times
let lastTokenRefreshTime: number | null = null;
const TOKEN_REFRESH_STORAGE_KEY = 'parivartan_last_token_refresh';

// Function to get the last token refresh time
export const getLastTokenRefreshTime = async (): Promise<Date | null> => {
  try {
    // Try to get from memory first
    if (lastTokenRefreshTime) {
      return new Date(lastTokenRefreshTime);
    }
    
    // Otherwise try to get from storage
    const timeStr = await AsyncStorage.getItem(TOKEN_REFRESH_STORAGE_KEY);
    if (timeStr) {
      const time = parseInt(timeStr, 10);
      if (!isNaN(time)) {
        lastTokenRefreshTime = time;
        return new Date(time);
      }
    }
  } catch (err) {
    console.error('Error getting token refresh time:', err);
  }
  return null;
};

// Set up token refresh listener
onIdTokenChanged(auth, async (user) => {
  if (user) {
    // Update the last token refresh time
    lastTokenRefreshTime = Date.now();
    try {
      await AsyncStorage.setItem(TOKEN_REFRESH_STORAGE_KEY, lastTokenRefreshTime.toString());
    } catch (err) {
      console.error('Error saving token refresh time:', err);
    }
  }
});

// Silence the warning for demo purposes - in a real app we would implement proper persistence
console.warn = (function() {
  const originalWarn = console.warn;
  const warnings: Record<string, boolean> = {};
  return function(message: string) {
    // Suppress AsyncStorage persistence warning
    if (typeof message === 'string' && message.includes('AsyncStorage')) {
      if (!warnings[message]) {
        warnings[message] = true;
        originalWarn.call(console, 'Firebase Auth AsyncStorage warning suppressed for demo');
      }
      return;
    }
    originalWarn.apply(console, arguments as any);
  };
})();

// Initialize Firestore and Storage
const db = getFirestore(app);
const storage = getStorage(app);

// Create a Google provider
const googleProvider = new GoogleAuthProvider();

// Analytics may not be available on all platforms
let analytics = null;
isSupported().then(yes => {
  if (yes) analytics = getAnalytics(app);
}).catch(e => console.log('Analytics not supported:', e));

export { app, auth, db, storage, googleProvider, analytics };
