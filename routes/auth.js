const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');

// Initialize Firebase Admin (uncomment when you have your service account key)
/*
const serviceAccount = require('../config/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`
});
*/

// Mock data for development
const mockUsers = {
  admin: [
    { username: 'admin', email: 'admin@example.com', password: 'admin123', userType: 'admin' }
  ],
  staff: [
    { username: 'staff', email: 'staff@example.com', password: 'staff123', userType: 'staff' }
  ],
  department: [
    { 
      username: 'dept', 
      email: 'dept@example.com', 
      password: 'dept123', 
      userType: 'department',
      department: 'pwd'
    }
  ]
};

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password, userType, department } = req.body;

    if (!username || !password || !userType) {
      return res.status(400).json({ message: 'Username, password, and user type are required' });
    }

    // Mock authentication (replace with Firebase authentication)
    const users = mockUsers[userType];
    if (!users) {
      return res.status(400).json({ message: 'Invalid user type' });
    }

    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // For department users, validate department
    if (userType === 'department') {
      if (!department) {
        return res.status(400).json({ message: 'Department selection required' });
      }
      
      const validDepartments = [
        'pwd', 'municipal', 'traffic-police', 'water-sanitation', 'pspcl',
        'health-welfare', 'civil-surgeon', 'punjab-police', 'education',
        'agriculture', 'food-civil-supplies', 'roadways', 'rto', 'revenue',
        'social-security', 'pollution-control', 'forest', 'disaster-management'
      ];
      if (!validDepartments.includes(department)) {
        return res.status(400).json({ message: 'Invalid department' });
      }
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        username: user.username, 
        userType: user.userType,
        department: department || user.department 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        username: user.username,
        userType: user.userType,
        department: department || user.department
      }
    });

    /*
    // Real Firebase authentication would look like this:
    
    const email = `${username}@${userType}.com`; // Construct email based on your logic
    
    try {
      // Verify the user exists in Firebase
      const userRecord = await admin.auth().getUserByEmail(email);
      
      // Get additional user data from Firestore
      const db = admin.firestore();
      const userDoc = await db.collection('users').doc(userRecord.uid).get();
      const userData = userDoc.data();
      
      // Validate user type
      if (userData.userType !== userType) {
        return res.status(403).json({ message: 'User type mismatch' });
      }
      
      // For department users, validate department
      if (userType === 'department' && department !== userData.department) {
        return res.status(403).json({ message: 'Department mismatch' });
      }
      
      // Create custom token
      const customToken = await admin.auth().createCustomToken(userRecord.uid);
      
      res.json({
        success: true,
        token: customToken,
        user: {
          uid: userRecord.uid,
          username: userData.username,
          userType: userData.userType,
          department: userData.department
        }
      });
      
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(401).json({ message: 'Authentication failed' });
    }
    */

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Password reset route
router.post('/reset-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Mock password reset (replace with actual implementation)
    console.log(`Password reset requested for: ${email}`);
    
    res.json({
      success: true,
      message: 'Password reset instructions sent to your email'
    });

    /*
    // Real Firebase implementation:
    try {
      const resetLink = await admin.auth().generatePasswordResetLink(email);
      // Send email with resetLink (use your email service)
      console.log('Password reset link:', resetLink);
      
      res.json({
        success: true,
        message: 'Password reset instructions sent to your email'
      });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(400).json({ message: 'Failed to send reset email' });
    }
    */

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Verify token middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Protected route example
router.get('/profile', verifyToken, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

module.exports = router;