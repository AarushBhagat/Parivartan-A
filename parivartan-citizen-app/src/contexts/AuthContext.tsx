import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  signInWithCredential,
  GoogleAuthProvider,
  UserCredential
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { debugUserState } from '../utils/debug';
import { authService } from '../services'; // Import from index to use the correct service (real or mock)

// Define types
type User = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role?: string;
  phoneNumber?: string | null;
  emailVerified: boolean;
  address?: string | null;
  citizenPoints?: number;
  department?: string;
  district?: string;
} | null;

type AuthContextType = {
  user: User;
  userDetails: any;
  loading: boolean;
  error: string | null;
  register: (email: string, password: string, displayName: string, phoneNumber?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  googleSignIn: (accessToken: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshUserDetails: () => Promise<void>;
  // Add setter for direct updates from components
  setUser: React.Dispatch<React.SetStateAction<User>>;
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Context provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Clear error helper
  const clearError = () => setError(null);

  // Fetch user details from backend
  const fetchUserDetails = async (user: User) => {
    if (!user) return null;
    
    try {
      await debugUserState('AuthContext - Before Fetch User Details');
    } catch (debugErr) {
      console.error('Debug logging error:', debugErr);
    }
    
    try {
      const userData = await authService.getCurrentUser();
      console.log('Fetched user details from backend:', userData);
      
      // Update the userDetails state with the backend data
      setUserDetails(userData);
      
      // Also update the user state with critical fields from backend
      setUser(current => {
        if (!current) return current;
        return {
          ...current,
          displayName: userData.displayName || current.displayName,
          photoURL: userData.photoURL || current.photoURL,
          role: userData.role,
          // Include other fields that might be updated in the backend
        };
      });
      
      try {
        await debugUserState('AuthContext - After Fetch User Details');
      } catch (debugErr) {
        console.error('Debug logging error:', debugErr);
      }
      
      return userData;
    } catch (err: any) {
      console.error('Error fetching user details:', err);
      return null;
    }
  };

  // Refresh user details
  const refreshUserDetails = async () => {
    if (!user) return;
    
    try {
      await debugUserState('AuthContext - Before Refresh');
    } catch (debugErr) {
      console.error('Debug logging error:', debugErr);
    }
    
    try {
      // First, refresh the Firebase Auth user
      const currentUser = auth.currentUser;
      if (currentUser) {
        // Force reload the user to get fresh data
        await currentUser.reload();
        console.log('User reloaded from Firebase Auth');
        
        // Force refresh the token to get the latest claims
        await currentUser.getIdToken(true);
        console.log('ID token refreshed');
        
        // Get the fresh user data after reload
        const freshCurrentUser = auth.currentUser; // Get fresh instance after reload
        const userData: User = {
          uid: freshCurrentUser!.uid,
          email: freshCurrentUser!.email,
          displayName: freshCurrentUser!.displayName,
          photoURL: freshCurrentUser!.photoURL,
          emailVerified: freshCurrentUser!.emailVerified,
          phoneNumber: freshCurrentUser!.phoneNumber,
        };
        
        console.log('Setting fresh user data:', userData.displayName);
        setUser(userData);
      }
      
      // Then fetch the user details from backend
      const backendUserData = await fetchUserDetails(user);
      console.log('Backend user data fetched:', backendUserData);
      
      try {
        await debugUserState('AuthContext - After Refresh');
      } catch (debugErr) {
        console.error('Debug logging error:', debugErr);
      }
      
      return backendUserData;
    } catch (err) {
      console.error('Error refreshing user details:', err);
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      
      try {
        await debugUserState('AuthContext - Auth State Changed');
      } catch (debugErr) {
        console.error('Debug logging error:', debugErr);
      }
      
      if (firebaseUser) {
        console.log('Auth state changed, user detected:', firebaseUser.uid);
        
        // Force reload the user to get the most up-to-date data
        try {
          await firebaseUser.reload();
          console.log('User data reloaded from Firebase Auth');
          
          // Get the fresh instance after reload
          const freshUser = auth.currentUser;
          if (freshUser) {
            const userData: User = {
              uid: freshUser.uid,
              email: freshUser.email,
              displayName: freshUser.displayName,
              photoURL: freshUser.photoURL,
              emailVerified: freshUser.emailVerified,
              phoneNumber: freshUser.phoneNumber,
            };
            
            console.log('Setting user with fresh data:', userData.displayName);
            setUser(userData);
            
            try {
              await debugUserState('AuthContext - After Setting Fresh User Data');
            } catch (debugErr) {
              console.error('Debug logging error:', debugErr);
            }
            
            fetchUserDetails(userData);
          }
        } catch (err) {
          console.error('Error reloading user data:', err);
          // Fall back to the provided firebaseUser if reload fails
          const userData: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            emailVerified: firebaseUser.emailVerified,
            phoneNumber: firebaseUser.phoneNumber,
          };
          
          setUser(userData);
          
          try {
            await debugUserState('AuthContext - After Setting Fallback User Data');
          } catch (debugErr) {
            console.error('Debug logging error:', debugErr);
          }
          
          fetchUserDetails(userData);
        }
      } else {
        console.log('Auth state changed, user signed out');
        setUser(null);
        setUserDetails(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Register function
  const register = async (email: string, password: string, displayName: string, phoneNumber?: string) => {
    setLoading(true);
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's display name immediately after creation
      if (userCredential.user) {
        // Import the updateProfile function
        const { updateProfile } = require('firebase/auth');
        
        // Update the profile with display name
        await updateProfile(userCredential.user, {
          displayName: displayName
        });
        console.log('Firebase Auth profile updated with display name:', displayName);
        
        // Force reload to get updated user data
        await userCredential.user.reload();
      }
      
      // Register with backend
      await authService.register({
        email,
        password,
        displayName,
        phoneNumber
      });
      
      // Update local state with the new user data including display name
      if (userCredential.user) {
        setUser({
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: displayName, // Use the provided display name
          photoURL: userCredential.user.photoURL,
          emailVerified: userCredential.user.emailVerified,
          phoneNumber: userCredential.user.phoneNumber,
        });
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // The auth state listener will handle setting the user
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Google Sign In function
  const googleSignIn = async (accessToken: string) => {
    setLoading(true);
    try {
      console.log('Processing Google sign in with access token');
      
      // Create a credential from the Google access token
      const credential = GoogleAuthProvider.credential(null, accessToken);
      console.log('Google credential created successfully');
      
      // Sign in with credential
      const userCredential = await signInWithCredential(auth, credential);
      console.log('Successfully signed in with Google, user:', userCredential.user.uid);
      
      // Get Firebase ID token from the authenticated user
      const firebaseToken = await userCredential.user.getIdToken();
      console.log('Firebase ID token generated, length:', firebaseToken.length);
      
      // Set up the user object
      const userData: User = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
        emailVerified: userCredential.user.emailVerified,
        phoneNumber: userCredential.user.phoneNumber
      };
      
      // Set the user in state immediately to improve UX
      setUser(userData);
      
      // Verify token with backend (this will create the user if they don't exist)
      try {
        console.log('Verifying token with backend');
        await authService.verifyToken(firebaseToken);
        console.log('Token verified with backend');
        
        // Fetch user details
        await fetchUserDetails(userData);
      } catch (verifyError) {
        console.error('Failed to verify token with backend:', verifyError);
        
        // Try to register the user if verification failed
        if (userCredential.user.email && userCredential.user.displayName) {
          try {
            console.log('Attempting to register user with backend');
            await authService.register({
              email: userCredential.user.email,
              displayName: userCredential.user.displayName,
              password: Math.random().toString(36).slice(-8), // Generate random password
              phoneNumber: userCredential.user.phoneNumber || undefined
            });
            
            console.log('User registered with backend, fetching details');
            await fetchUserDetails(userData);
          } catch (registerError) {
            console.error('Failed to register user with backend:', registerError);
          }
        }
      }
    } catch (err: any) {
      console.error("Google sign in error:", err);
      setError(typeof err === 'string' ? err : err.message || 'Google sign-in failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth);
      // The auth state listener will handle clearing the user
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    user,
    userDetails,
    loading,
    error,
    register,
    login,
    googleSignIn,
    logout,
    clearError,
    refreshUserDetails,
    // Export setUser for direct updates from components
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};