const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Set to true to use Firebase, false to use mock data
const USE_FIREBASE = true;

// Get Firestore instance (only if Firebase is configured)
let db;
if (USE_FIREBASE) {
  try {
    db = admin.firestore();
  } catch (error) {
    console.error('Error initializing Firestore:', error);
  }
}

// POST /api/issues - Submit a new issue/grievance (for Citizen App)
router.post('/', async (req, res) => {
  try {
    console.log('📥 Received new issue submission');
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    // Handle both JSON and form-data submissions
    let title, description, department, location;
    
    // Check if location data is nested or flattened
    if (req.body['location[latitude]']) {
      // FormData format - location fields are flattened
      title = req.body.title;
      description = req.body.description;
      department = req.body.department;
      location = {
        latitude: parseFloat(req.body['location[latitude]']),
        longitude: parseFloat(req.body['location[longitude]']),
        address: req.body['location[address]'] || '',
        district: req.body['location[district]'] || ''
      };
      console.log('📍 Parsed FormData location:', location);
    } else {
      // JSON format - location is an object
      title = req.body.title;
      description = req.body.description;
      department = req.body.department;
      location = req.body.location;
      console.log('📍 JSON location:', location);
    }

    // Validation
    if (!title || !description || !department) {
      console.log('❌ Validation failed - missing:', {
        title: !title,
        description: !description,
        department: !department
      });
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, department'
      });
    }

    if (!location || !location.latitude || !location.longitude) {
      console.log('❌ Validation failed - invalid location:', location);
      return res.status(400).json({
        success: false,
        message: 'Please provide valid location with latitude and longitude'
      });
    }

    console.log('✅ Validation passed:', { title, department });

    if (USE_FIREBASE && db) {
      // Get authenticated user info (if available)
      let citizenName = 'Anonymous User';
      let citizenEmail = '';
      let citizenPhone = '';
      let userId = null;

      // Try to get user from Firebase Auth token
      if (req.headers.authorization) {
        try {
          const token = req.headers.authorization.split('Bearer ')[1];
          const decodedToken = await admin.auth().verifyIdToken(token);
          userId = decodedToken.uid;
          citizenEmail = decodedToken.email || '';
          
          // Try to get additional user info from Firestore
          const userDoc = await db.collection('citizens').doc(userId).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            citizenName = userData.fullName || userData.displayName || citizenEmail;
            citizenPhone = userData.phone || '';
          } else {
            // Fallback to email as name
            citizenName = citizenEmail || 'Anonymous User';
          }
        } catch (authError) {
          console.log('Could not verify auth token:', authError.message);
          // Continue without user info
        }
      }

      // Prepare grievance data for Firebase
      const grievance = {
        title,
        description,
        department,
        status: 'pending',
        priority: 'medium',
        
        // Citizen information
        userId: userId || null,
        citizenName,
        citizenEmail,
        citizenPhone,
        
        // Location information
        location: {
          address: location.address || '',
          latitude: location.latitude,
          longitude: location.longitude,
          district: location.district || ''
        },
        
        // Metadata
        images: [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      console.log('Saving grievance to Firebase:', { 
        title, 
        department, 
        userId,
        citizenName 
      });

      const docRef = await db.collection('grievances').add(grievance);
      console.log('✅ Grievance saved successfully with ID:', docRef.id);

      // Forward to Pathway service for real-time enrichment (fire-and-forget)
      if (process.env.PATHWAY_SERVICE_URL) {
        fetch(process.env.PATHWAY_SERVICE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            description,
            department,
            location_address: location.address || '',
            location_latitude: location.latitude || 0,
            location_longitude: location.longitude || 0,
            citizen_name: citizenName,
            issue_id: docRef.id
          })
        }).catch(() => {}); // non-blocking: ignore errors
      }

      res.status(201).json({
        success: true,
        message: 'Issue reported successfully',
        issue: {
          id: docRef.id,
          ...grievance,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      });
    } else {
      // Firebase not configured
      return res.status(500).json({
        success: false,
        message: 'Firebase is not properly configured on the server'
      });
    }
  } catch (error) {
    console.error('❌ Error submitting issue:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit issue',
      error: error.message
    });
  }
});

// GET /api/issues/my-issues - Get issues by authenticated user
router.get('/my-issues', async (req, res) => {
  try {
    if (!USE_FIREBASE || !db) {
      return res.status(500).json({
        success: false,
        message: 'Firebase is not properly configured'
      });
    }

    // Get user ID from auth token
    if (!req.headers.authorization) {
      return res.status(401).json({
        success: false,
        message: 'Authorization required'
      });
    }

    const token = req.headers.authorization.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    // Query grievances by user ID
    const snapshot = await db.collection('grievances')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const issues = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      issues.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString()
      });
    });

    res.json({
      success: true,
      issues
    });
  } catch (error) {
    console.error('Error fetching user issues:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch issues',
      error: error.message
    });
  }
});

// GET /api/issues/:id - Get issue by ID
router.get('/:id', async (req, res) => {
  try {
    if (!USE_FIREBASE || !db) {
      return res.status(500).json({
        success: false,
        message: 'Firebase is not properly configured'
      });
    }

    const { id } = req.params;
    const doc = await db.collection('grievances').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    const data = doc.data();
    res.json({
      success: true,
      issue: {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching issue:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch issue',
      error: error.message
    });
  }
});

module.exports = router;
