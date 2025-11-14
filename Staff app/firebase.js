// Firebase configuration for Staff App
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
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

// Initialize Firebase Authentication with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Cloud Firestore and get a reference to the service  
export const db = getFirestore(app);

export default app;
