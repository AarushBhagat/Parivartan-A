// Import Firebase services
import { auth, db } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Toggle between Firebase and Mock mode
// Set to true after you configure Firebase in firebase.js
const USE_FIREBASE = true; // Enable Firebase for all authentication

// Mock authentication service for development
export const authenticateUser = async (userType, credentials) => {
  try {
    // === FIREBASE MODE ===
    if (USE_FIREBASE) {
      // Determine email (user can enter username or email)
      const isEmail = credentials.username && credentials.username.includes('@');
      let email = credentials.username;
      
      // Validate email is provided
      if (!email || email.trim() === '') {
        throw new Error('Please enter your email address');
      }
      
      // If not an email, try to find the user in Firestore by username
      if (!isEmail) {
        throw new Error('Please enter a valid email address (e.g., municipal@parivartan.gov.in)');
      }
      
      // Trim whitespace from email
      email = email.trim().toLowerCase();
      
      console.log('Attempting login with email:', email);
      
      // Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, credentials.password);
      const user = userCredential.user;
      
      // Get additional user data from Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      let userData;
      
      if (!userDoc.exists()) {
        // Auto-create profile for predefined department users
        console.log('User profile not found, creating one...');
        
        // Extract username from email (part before @)
        const username = email.split('@')[0];
        
        // Create profile data
        const newProfile = {
          uid: user.uid,
          username: username,
          email: email,
          userType: userType,
          department: userType === 'department' ? credentials.department : null,
          displayName: user.displayName || username,
          createdAt: new Date().toISOString(),
          autoCreated: true
        };
        
        // Save to Firestore
        await setDoc(userDocRef, newProfile);
        console.log('Profile created successfully');
        
        userData = newProfile;
      } else {
        userData = userDoc.data();
      }
      
      // Validate user type matches
      if (userData.userType !== userType) {
        throw new Error('Invalid user type. Please select the correct login type.');
      }
      
      // Validate department for department users
      if (userType === 'department') {
        if (!credentials.department || credentials.department !== userData.department) {
          throw new Error('Invalid department selection');
        }
      }
      
      return {
        success: true,
        user: {
          uid: user.uid,
          username: userData.username,
          email: userData.email,
          userType: userData.userType,
          department: userData.department || null
        }
      };
    }
    
    // === MOCK MODE ===
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check localStorage for registered users first
    const registeredUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
    const registeredUser = registeredUsers.find(
      u => (u.username === credentials.username || u.email === credentials.username) 
        && u.password === credentials.password
        && u.userType === userType
    );
    
    if (registeredUser) {
      // Validate department for department users
      if (userType === 'department') {
        if (!credentials.department || credentials.department !== registeredUser.department) {
          throw new Error('Invalid department selection');
        }
      }
      
      return {
        success: true,
        user: {
          uid: registeredUser.uid,
          username: registeredUser.username,
          email: registeredUser.email,
          userType: registeredUser.userType,
          department: registeredUser.department || null
        }
      };
    }
    
    // Fallback to default mock users for testing
    const mockUsers = {
      admin: { username: 'admin', password: 'admin123' },
      staff: { username: 'staff', password: 'staff123' },
      department: [
        { username: 'pwd', password: 'pwd123', department: 'pwd' },
        { username: 'municipal', password: 'municipal123', department: 'municipal' },
        { username: 'traffic', password: 'traffic123', department: 'traffic-police' },
        { username: 'water', password: 'water123', department: 'water-sanitation' },
        { username: 'pspcl', password: 'pspcl123', department: 'pspcl' },
        { username: 'health', password: 'health123', department: 'health-welfare' },
        { username: 'civil', password: 'civil123', department: 'civil-surgeon' },
        { username: 'police', password: 'police123', department: 'punjab-police' },
        { username: 'education', password: 'education123', department: 'education' },
        { username: 'agriculture', password: 'agriculture123', department: 'agriculture' },
        { username: 'food', password: 'food123', department: 'food-civil-supplies' },
        { username: 'roadways', password: 'roadways123', department: 'roadways' },
        { username: 'rto', password: 'rto123', department: 'rto' },
        { username: 'revenue', password: 'revenue123', department: 'revenue' },
        { username: 'social', password: 'social123', department: 'social-security' },
        { username: 'pollution', password: 'pollution123', department: 'pollution-control' },
        { username: 'forest', password: 'forest123', department: 'forest' },
        { username: 'disaster', password: 'disaster123', department: 'disaster-management' }
      ]
    };
    
    if (userType === 'department') {
      // Find matching department user
      const deptUser = mockUsers.department.find(
        u => u.username === credentials.username && u.password === credentials.password
      );
      
      if (deptUser) {
        // Validate that selected department matches user's department
        if (!credentials.department || credentials.department !== deptUser.department) {
          throw new Error('Invalid department selection. Please select: ' + deptUser.department);
        }
        
        return {
          success: true,
          user: {
            username: credentials.username,
            userType: userType,
            department: deptUser.department
          }
        };
      }
      
      return {
        success: false,
        error: 'Invalid username or password'
      };
    }
    
    const mockUser = mockUsers[userType];
    
    if (!mockUser) {
      throw new Error('Invalid user type');
    }
    
    if (credentials.username === mockUser.username && credentials.password === mockUser.password) {
      return {
        success: true,
        user: {
          username: credentials.username,
          userType: userType,
          department: null
        }
      };
    } else {
      return {
        success: false,
        error: 'Invalid username or password'
      };
    }
    
    
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Password reset function
export const resetPassword = async (email) => {
  try {
    // === FIREBASE MODE ===
    if (USE_FIREBASE) {
      await sendPasswordResetEmail(auth, email);
      return { success: true, message: 'Password reset email sent!' };
    }
    
    // === MOCK MODE ===
    console.log(`Password reset requested for: ${email}`);
    return { success: true, message: 'Password reset email sent (mock)' };
    
  } catch (error) {
    console.error('Password reset error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// User registration function
export const registerUser = async (userData) => {
  try {
    const { username, email, password, userType, department, phone } = userData;
    
    // === FIREBASE MODE ===
    if (USE_FIREBASE) {
      // Check if user already exists by trying to get their document
      // (Firebase Auth will throw error if email exists)
      
      // Create authentication user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Store additional user data in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        username,
        email,
        phone,
        userType,
        department: userType === 'department' ? department : null,
        createdAt: new Date().toISOString()
      });
      
      console.log('User registered successfully in Firebase:', user.uid);
      
      return {
        success: true,
        user: {
          uid: user.uid,
          username,
          email,
          userType,
          department: userType === 'department' ? department : null
        }
      };
    }
    
    // === MOCK MODE ===
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get existing mock users from localStorage
    const existingUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
    
    // Check if user already exists
    const userExists = existingUsers.some(u => u.email === email || u.username === username);
    if (userExists) {
      throw new Error('User with this email or username already exists');
    }
    
    // Create new user object
    const newUser = {
      uid: `user_${Date.now()}`, // Mock UID
      username,
      email,
      password, // In production, NEVER store plain passwords
      phone,
      userType,
      department: userType === 'department' ? department : null,
      createdAt: new Date().toISOString()
    };
    
    // Save to localStorage (mock database)
    existingUsers.push(newUser);
    localStorage.setItem('mockUsers', JSON.stringify(existingUsers));
    
    console.log('User registered successfully (mock):', newUser);
    
    return {
      success: true,
      user: {
        uid: newUser.uid,
        username: newUser.username,
        email: newUser.email,
        userType: newUser.userType,
        department: newUser.department
      }
    };
    
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};