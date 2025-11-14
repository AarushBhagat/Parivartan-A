// Grievance service for Firebase integration
import { db } from './firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  addDoc,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';

// Set to true to use Firebase, false to use mock data
const USE_FIREBASE = true; // Changed to true - Firebase active for citizen app integration

// Mock data for development - replace with actual Firebase calls
// Making it mutable so we can update it in memory
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
  },
  {
    id: 'GRV005',
    title: 'Power Outage Issues',
    description: 'Frequent power cuts in our locality, especially during evening hours. This is affecting daily work.',
    department: 'pspcl',
    status: 'in-progress',
    priority: 'medium',
    citizenName: 'Mandeep Singh',
    citizenPhone: '+91 54321 09876',
    location: 'Model Town Extension',
    category: 'Power Supply',
    createdAt: '2024-01-12T18:30:00Z',
    updatedAt: '2024-01-15T11:45:00Z',
    images: []
  },
  {
    id: 'GRV006',
    title: 'Garbage Collection Missed',
    description: 'Garbage has not been collected from our street for the past 4 days. It is creating hygiene issues.',
    department: 'municipal',
    status: 'pending',
    priority: 'medium',
    citizenName: 'Neha Gupta',
    citizenPhone: '+91 43210 98765',
    location: 'Green Avenue, House No. 45',
    category: 'Waste Management',
    createdAt: '2024-01-17T07:15:00Z',
    updatedAt: '2024-01-17T07:15:00Z',
    images: []
  },
  {
    id: 'GRV007',
    title: 'Stray Dog Problem',
    description: 'Increasing number of stray dogs in the area is becoming a safety concern, especially for children and elderly.',
    department: 'municipal',
    status: 'pending',
    priority: 'low',
    citizenName: 'Suresh Patel',
    citizenPhone: '+91 32109 87654',
    location: 'Park View Colony',
    category: 'Animal Control',
    createdAt: '2024-01-11T14:20:00Z',
    updatedAt: '2024-01-11T14:20:00Z',
    images: []
  },
  {
    id: 'GRV008',
    title: 'Health Center Medicine Shortage',
    description: 'The local health center is facing shortage of essential medicines, especially for diabetes and blood pressure.',
    department: 'health-welfare',
    status: 'in-progress',
    priority: 'high',
    citizenName: 'Dr. Kamal Singh',
    citizenPhone: '+91 21098 76543',
    location: 'Community Health Center, Sector 12',
    category: 'Healthcare',
    createdAt: '2024-01-10T09:40:00Z',
    updatedAt: '2024-01-14T16:20:00Z',
    images: []
  }
];

// Mock function to get grievances by department
export const getGrievancesByDepartment = async (departmentCode) => {
  try {
    if (USE_FIREBASE) {
      // Real Firebase implementation
      console.log('Fetching grievances from Firebase for department:', departmentCode);
      const grievancesRef = collection(db, 'grievances');
      
      // Query without orderBy to avoid index requirement
      const q = query(
        grievancesRef,
        where('department', '==', departmentCode)
      );
      
      const querySnapshot = await getDocs(q);
      const grievances = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        grievances.push({
          id: doc.id,
          ...data,
          // Convert Firestore Timestamp to ISO string if needed
          createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toISOString() : data.updatedAt
        });
      });
      
      // Sort in JavaScript instead of Firestore
      grievances.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      
      console.log(`Fetched ${grievances.length} grievances from Firebase for department: ${departmentCode}`);
      if (grievances.length > 0) {
        console.log('Sample grievance:', grievances[0]);
      }
      return grievances;
    } else {
      // Mock data fallback
      console.log('Using mock data for department:', departmentCode);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filter mock data by department
      const departmentGrievances = mockGrievances.filter(
        grievance => grievance.department === departmentCode
      );
      
      // Sort by creation date (newest first)
      departmentGrievances.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      return departmentGrievances;
    }
  } catch (error) {
    console.error('Error fetching grievances:', error);
    throw error;
  }
};

// Mock function to update grievance status
export const updateGrievanceStatus = async (grievanceId, newStatus, comment = '') => {
  try {
    if (USE_FIREBASE) {
      // Real Firebase implementation
      console.log(`grievanceService - Updating grievance ${grievanceId} in Firebase to status: ${newStatus}`);
      
      const grievanceRef = doc(db, 'grievances', grievanceId);
      const updateData = {
        status: newStatus,
        updatedAt: serverTimestamp()
      };
      
      if (comment) {
        updateData.comment = comment;
      }
      
      await updateDoc(grievanceRef, updateData);
      console.log(`grievanceService - Successfully updated grievance ${grievanceId} in Firebase`);
      
      return { success: true };
    } else {
      // Mock data fallback
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log(`grievanceService - Updating grievance ${grievanceId} to status: ${newStatus}`);
      
      // Find and update the grievance in mock data
      const grievanceIndex = mockGrievances.findIndex(g => g.id === grievanceId);
      
      if (grievanceIndex !== -1) {
        mockGrievances[grievanceIndex] = {
          ...mockGrievances[grievanceIndex],
          status: newStatus,
          updatedAt: new Date().toISOString()
        };
        console.log(`grievanceService - Successfully updated grievance ${grievanceId}:`, mockGrievances[grievanceIndex]);
        
        if (comment) {
          console.log(`grievanceService - Comment: ${comment}`);
        }
        
        return { success: true, grievance: mockGrievances[grievanceIndex] };
      } else {
        console.error(`grievanceService - Grievance ${grievanceId} not found`);
        throw new Error('Grievance not found');
      }
    }
  } catch (error) {
    console.error('Error updating grievance status:', error);
    throw error;
  }
};

// Function to get all grievances (for admin)
export const getAllGrievances = async () => {
  try {
    if (USE_FIREBASE) {
      // Real Firebase implementation
      console.log('Fetching all grievances from Firebase');
      const grievancesRef = collection(db, 'grievances');
      const querySnapshot = await getDocs(grievancesRef);
      
      const grievances = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        grievances.push({
          id: doc.id,
          ...data,
          // Convert Firestore Timestamp to ISO string if needed
          createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toISOString() : data.updatedAt
        });
      });
      
      // Sort in JavaScript
      grievances.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      
      console.log(`Fetched ${grievances.length} grievances from Firebase`);
      return grievances;
    } else {
      // Mock data fallback
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockGrievances.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
    }
  } catch (error) {
    console.error('Error fetching all grievances:', error);
    throw error;
  }
};

// Function to get grievance statistics
export const getGrievanceStats = async (departmentCode = null) => {
  try {
    const grievances = departmentCode 
      ? await getGrievancesByDepartment(departmentCode)
      : await getAllGrievances();
    
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
    
    return stats;
  } catch (error) {
    console.error('Error fetching grievance stats:', error);
    throw error;
  }
};

// Function to submit a new grievance (for citizen app)
export const submitGrievance = async (grievanceData) => {
  try {
    if (USE_FIREBASE) {
      // Real Firebase implementation
      console.log('Submitting grievance to Firebase:', grievanceData);
      
      const grievancesRef = collection(db, 'grievances');
      const newGrievance = {
        ...grievanceData,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(grievancesRef, newGrievance);
      console.log('Grievance submitted with ID:', docRef.id);
      
      return { success: true, id: docRef.id };
    } else {
      // Mock data fallback
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newGrievance = {
        id: `GRV${String(mockGrievances.length + 1).padStart(3, '0')}`,
        ...grievanceData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      mockGrievances.push(newGrievance);
      console.log('Mock grievance submitted:', newGrievance);
      
      return { success: true, id: newGrievance.id, grievance: newGrievance };
    }
  } catch (error) {
    console.error('Error submitting grievance:', error);
    throw error;
  }
};