/**
 * Script to initialize predefined users in Firebase
 * Run this once to create admin, staff, and department users
 * 
 * Usage: node scripts/initializePredefinedUsers.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccountPath = path.join(__dirname, '../config/serviceAccountKey.json');

try {
  const serviceAccount = require(serviceAccountPath);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
  console.log('✅ Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('❌ Error initializing Firebase Admin SDK:', error.message);
  console.log('\n⚠️  Make sure you have downloaded your service account key from Firebase Console:');
  console.log('   1. Go to Firebase Console → Project Settings → Service Accounts');
  console.log('   2. Click "Generate New Private Key"');
  console.log('   3. Save it as backend/config/serviceAccountKey.json');
  process.exit(1);
}

const db = admin.firestore();

// Predefined users to create
const predefinedUsers = [
  {
    email: 'admin@parivartan.gov.in',
    password: 'admin123',
    username: 'admin',
    userType: 'admin',
    displayName: 'System Administrator',
    department: null
  },
  {
    email: 'staff@parivartan.gov.in',
    password: 'staff123',
    username: 'staff',
    userType: 'staff',
    displayName: 'Staff Member',
    department: null
  },
  {
    email: 'pwd@parivartan.gov.in',
    password: 'dept123',
    username: 'pwd',
    userType: 'department',
    displayName: 'PWD Department',
    department: 'pwd'
  },
  {
    email: 'municipal@parivartan.gov.in',
    password: 'dept123',
    username: 'municipal',
    userType: 'department',
    displayName: 'Municipal Corporation',
    department: 'municipal'
  },
  {
    email: 'traffic-police@parivartan.gov.in',
    password: 'dept123',
    username: 'traffic-police',
    userType: 'department',
    displayName: 'Traffic Police',
    department: 'traffic-police'
  },
  {
    email: 'water-sanitation@parivartan.gov.in',
    password: 'dept123',
    username: 'water-sanitation',
    userType: 'department',
    displayName: 'Water & Sanitation',
    department: 'water-sanitation'
  },
  {
    email: 'pspcl@parivartan.gov.in',
    password: 'dept123',
    username: 'pspcl',
    userType: 'department',
    displayName: 'PSPCL',
    department: 'pspcl'
  },
  {
    email: 'health-welfare@parivartan.gov.in',
    password: 'dept123',
    username: 'health-welfare',
    userType: 'department',
    displayName: 'Health & Welfare',
    department: 'health-welfare'
  },
  {
    email: 'punjab-police@parivartan.gov.in',
    password: 'dept123',
    username: 'punjab-police',
    userType: 'department',
    displayName: 'Punjab Police',
    department: 'punjab-police'
  },
  {
    email: 'education@parivartan.gov.in',
    password: 'dept123',
    username: 'education',
    userType: 'department',
    displayName: 'Education Department',
    department: 'education'
  }
];

async function createUser(userData) {
  try {
    // Create authentication user
    const userRecord = await admin.auth().createUser({
      email: userData.email,
      password: userData.password,
      displayName: userData.displayName,
      emailVerified: true
    });
    
    console.log(`✅ Created auth user: ${userData.email} (${userRecord.uid})`);
    
    // Create Firestore document
    await db.collection('users').doc(userRecord.uid).set({
      username: userData.username,
      email: userData.email,
      userType: userData.userType,
      department: userData.department,
      displayName: userData.displayName,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: 'system-initialization'
    });
    
    console.log(`✅ Created Firestore document for: ${userData.email}`);
    
    return { success: true, uid: userRecord.uid };
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log(`⚠️  User already exists: ${userData.email}`);
      
      // Try to update Firestore document
      try {
        const existingUser = await admin.auth().getUserByEmail(userData.email);
        await db.collection('users').doc(existingUser.uid).set({
          username: userData.username,
          email: userData.email,
          userType: userData.userType,
          department: userData.department,
          displayName: userData.displayName,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        console.log(`✅ Updated Firestore document for: ${userData.email}`);
        return { success: true, uid: existingUser.uid };
      } catch (updateError) {
        console.error(`❌ Error updating Firestore for ${userData.email}:`, updateError.message);
        return { success: false, error: updateError.message };
      }
    } else {
      console.error(`❌ Error creating user ${userData.email}:`, error.message);
      return { success: false, error: error.message };
    }
  }
}

async function initializeUsers() {
  console.log('\n🚀 Starting predefined user initialization...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const userData of predefinedUsers) {
    const result = await createUser(userData);
    if (result.success) {
      successCount++;
    } else {
      errorCount++;
    }
    console.log(''); // Add blank line for readability
  }
  
  console.log('\n📊 Summary:');
  console.log(`✅ Successfully created/updated: ${successCount} users`);
  console.log(`❌ Errors: ${errorCount} users`);
  
  console.log('\n📝 Login Credentials:');
  console.log('─────────────────────────────────────────────────');
  console.log('Admin:      admin@parivartan.gov.in / admin123');
  console.log('Staff:      staff@parivartan.gov.in / staff123');
  console.log('Departments: [department]@parivartan.gov.in / dept123');
  console.log('             (e.g., pwd@parivartan.gov.in)');
  console.log('─────────────────────────────────────────────────');
  
  console.log('\n✅ Initialization complete!');
  console.log('You can now login with these credentials in the Department Dashboard.');
  
  process.exit(0);
}

// Run the initialization
initializeUsers().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
