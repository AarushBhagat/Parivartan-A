const admin = require('firebase-admin');

let firebaseInitialized = false;

function initializeFirebase() {
  if (firebaseInitialized) {
    return;
  }

  try {
    // Try to load service account key
    const serviceAccount = require('./config/serviceAccountKey.json');
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    console.log('✅ Firebase Admin SDK initialized successfully');
    firebaseInitialized = true;
  } catch (error) {
    console.warn('⚠️  Firebase service account key not found');
    console.warn('   The backend will work without Firebase integration');
    console.warn('   To enable Firebase:');
    console.warn('   1. Go to Firebase Console → Project Settings → Service Accounts');
    console.warn('   2. Click "Generate New Private Key"');
    console.warn('   3. Save it as backend/config/serviceAccountKey.json');
    
    // Initialize without credentials for development
    // This will allow the server to start but Firebase operations will fail
    try {
      admin.initializeApp();
      firebaseInitialized = true;
    } catch (initError) {
      console.error('❌ Could not initialize Firebase Admin SDK:', initError.message);
    }
  }
}

module.exports = { initializeFirebase, admin };
