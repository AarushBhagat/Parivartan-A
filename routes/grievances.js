const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Set to true to use Firebase, false to use mock data
const USE_FIREBASE = true; // Changed to true - Firebase active for citizen app integration

// Get Firestore instance (only if Firebase is configured)
let db;
if (USE_FIREBASE) {
  db = admin.firestore();
}

// Mock grievance data - in production this would come from Firebase/database
let mockGrievances = [
  {
    id: 'GRV001',
    title: 'Pothole on Main Street',
    description: 'There is a large pothole on Main Street near the market that is causing traffic issues and vehicle damage. It has been there for over a month.',
    department: 'pwd',
    status: 'pending',
    priority: 'high',
    citizenName: 'Rajesh Kumar',
    citizenPhone: '+91 98765 43210',
    citizenEmail: 'rajesh.kumar@email.com',
    citizenAddress: '123 Market Street, Kapurthala',
    location: 'Main Street, Near Market',
    category: 'Road Infrastructure',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    images: []
  },
  {
    id: 'GRV002',
    title: 'Street Light Not Working',
    description: 'The street light near Bus Stand has been non-functional for the past week, causing safety concerns for pedestrians at night.',
    department: 'municipal',
    status: 'in-progress',
    priority: 'medium',
    citizenName: 'Priya Singh',
    citizenPhone: '+91 87654 32109',
    citizenEmail: 'priya.singh@email.com',
    location: 'Bus Stand Road',
    category: 'Street Lighting',
    createdAt: '2024-01-14T15:45:00Z',
    updatedAt: '2024-01-16T09:15:00Z',
    images: []
  },
  {
    id: 'GRV003',
    title: 'Water Supply Interruption',
    description: 'Water supply has been irregular in our area for the past 3 days. Sometimes there is no water at all.',
    department: 'water-sanitation',
    status: 'resolved',
    priority: 'high',
    citizenName: 'Harpreet Kaur',
    citizenPhone: '+91 76543 21098',
    citizenEmail: 'harpreet.kaur@email.com',
    location: 'Sector 15, Block A',
    category: 'Water Supply',
    createdAt: '2024-01-13T08:20:00Z',
    updatedAt: '2024-01-17T14:30:00Z',
    images: []
  },
  {
    id: 'GRV004',
    title: 'Traffic Signal Malfunction',
    description: 'Traffic signal at the main intersection is not working properly, causing traffic jams during peak hours.',
    department: 'traffic-police',
    status: 'pending',
    priority: 'high',
    citizenName: 'Amit Sharma',
    citizenPhone: '+91 65432 10987',
    location: 'Main Intersection, City Center',
    category: 'Traffic Management',
    createdAt: '2024-01-16T12:00:00Z',
    updatedAt: '2024-01-16T12:00:00Z',
    images: []
  }
];

// POST /api/grievances - Submit a new grievance (for Citizen App)
router.post('/', async (req, res) => {
  try {
    console.log('Received POST request body:', JSON.stringify(req.body, null, 2));
    
    const {
      title,
      description,
      department,
      priority,
      citizenName,
      citizenPhone,
      citizenEmail,
      citizenAddress,
      location,
      category,
      images
    } = req.body;

    // Basic validation - only require title, description, department
    if (!title || !description || !department) {
      console.log('Validation failed - missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, department'
      });
    }

    // Extract location data if it's an object
    let locationString = location;
    let locationData = null;
    
    if (typeof location === 'object' && location !== null) {
      // Location is an object with latitude, longitude, address, etc.
      locationData = location;
      locationString = location.address || `${location.latitude}, ${location.longitude}`;
    }

    if (USE_FIREBASE) {
      // Firebase implementation
      const grievance = {
        title,
        description,
        department,
        status: 'pending',
        priority: priority || 'medium',
        citizenName: citizenName || 'Anonymous',
        citizenPhone: citizenPhone || 'Not provided',
        citizenEmail: citizenEmail || '',
        citizenAddress: citizenAddress || '',
        location: locationString,
        locationData: locationData || null,
        category: category || 'General',
        images: images || [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      console.log('Saving to Firebase:', JSON.stringify(grievance, null, 2));
      const docRef = await db.collection('grievances').add(grievance);
      console.log('New grievance submitted with ID:', docRef.id);

      res.status(201).json({
        success: true,
        message: 'Grievance submitted successfully',
        grievanceId: docRef.id,
        issue: {
          id: docRef.id,
          ...grievance,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      });
    } else {
      // Mock implementation
      const newGrievance = {
        id: `GRV${String(mockGrievances.length + 1).padStart(3, '0')}`,
        title,
        description,
        department,
        status: 'pending',
        priority: priority || 'medium',
        citizenName,
        citizenPhone,
        citizenEmail: citizenEmail || '',
        citizenAddress: citizenAddress || '',
        location,
        category: category || 'General',
        images: images || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      mockGrievances.push(newGrievance);
      console.log('New grievance submitted (mock):', newGrievance.id);

      res.status(201).json({
        success: true,
        message: 'Grievance submitted successfully',
        grievanceId: newGrievance.id,
        data: newGrievance
      });
    }
  } catch (error) {
    console.error('Error submitting grievance:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get grievances by department
router.get('/department/:departmentCode', async (req, res) => {
  try {
    const { departmentCode } = req.params;
    
    if (USE_FIREBASE) {
      // Firebase implementation
      const snapshot = await db.collection('grievances')
        .where('department', '==', departmentCode)
        .orderBy('createdAt', 'desc')
        .get();

      const grievances = [];
      snapshot.forEach(doc => {
        grievances.push({
          id: doc.id,
          ...doc.data()
        });
      });

      res.json({
        success: true,
        data: grievances,
        count: grievances.length
      });
    } else {
      // Mock implementation
      const departmentGrievances = mockGrievances.filter(
        grievance => grievance.department === departmentCode
      );
      
      departmentGrievances.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      res.json({
        success: true,
        data: departmentGrievances,
        count: departmentGrievances.length
      });
    }
  } catch (error) {
    console.error('Error fetching grievances:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching grievances',
      error: error.message
    });
  }
});

// Get all grievances (for admin)
router.get('/all', (req, res) => {
  try {
    const sortedGrievances = [...mockGrievances].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    res.json({
      success: true,
      data: sortedGrievances,
      count: sortedGrievances.length
    });
    
  } catch (error) {
    console.error('Error fetching all grievances:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching grievances' 
    });
  }
});

// Update grievance status
router.put('/:grievanceId/status', (req, res) => {
  try {
    const { grievanceId } = req.params;
    const { status, comment } = req.body;
    
    if (!status) {
      return res.status(400).json({ 
        success: false, 
        message: 'Status is required' 
      });
    }
    
    // In a real implementation, update the database
    // For now, just simulate the update
    console.log(`Updating grievance ${grievanceId} to status: ${status}`);
    if (comment) {
      console.log(`Comment: ${comment}`);
    }
    
    res.json({
      success: true,
      message: 'Grievance status updated successfully',
      data: {
        grievanceId,
        newStatus: status,
        updatedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error updating grievance status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating grievance status' 
    });
  }
});

// Get grievance statistics
router.get('/stats/:departmentCode?', (req, res) => {
  try {
    const { departmentCode } = req.params;
    
    let grievances = mockGrievances;
    if (departmentCode) {
      grievances = mockGrievances.filter(g => g.department === departmentCode);
    }
    
    const stats = {
      total: grievances.length,
      pending: grievances.filter(g => g.status === 'pending').length,
      inProgress: grievances.filter(g => g.status === 'in-progress').length,
      resolved: grievances.filter(g => g.status === 'resolved').length,
      rejected: grievances.filter(g => g.status === 'rejected').length,
      high: grievances.filter(g => g.priority === 'high').length,
      medium: grievances.filter(g => g.priority === 'medium').length,
      low: grievances.filter(g => g.priority === 'low').length,
    };
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('Error fetching grievance stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching statistics' 
    });
  }
});

module.exports = router;