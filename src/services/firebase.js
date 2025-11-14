// Firebase configuration file
// Replace these values with your actual Firebase project configuration

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service  
export const db = getFirestore(app);

export default app;