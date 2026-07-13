import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api.config';
import { authService } from './mockApiService'; // Import directly from mockApiService to avoid circular dependency
import { initializeMockData } from './mock/mockApi';

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
  register: (email: string, password: string, displayName: string, phoneNumber?: string) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  googleSignIn: (accessToken: string) => Promise<any>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshUserDetails: () => Promise<any>;
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
  
  // AsyncStorage keys
  const USER_STORAGE_KEY = 'parivartan_user';
  const USER_DETAILS_STORAGE_KEY = 'parivartan_user_details';

  // Clear error helper
  const clearError = () => setError(null);

  // Fetch user details from backend or mock API
  const fetchUserDetails = async (user: User) => {
    if (!user) return null;
    
    try {
      const response = await authService.getCurrentUser();
      console.log('Fetched user details:', response);
      
      // Update the userDetails state with the backend data
      setUserDetails(response.user || response);
      
      // Also update the user state with critical fields from backend
      setUser(current => {
        if (!current) return current;
        const userData = response.user || response;
        return {
          ...current,
          displayName: userData.displayName || current.displayName,
          photoURL: userData.photoURL || current.photoURL,
          role: userData.role,
          // Include other fields that might be updated in the backend
        };
      });
      
      // Save to AsyncStorage for persistence
      try {
        await AsyncStorage.setItem(USER_DETAILS_STORAGE_KEY, JSON.stringify(response.user || response));
      } catch (storageErr) {
        console.error('Error saving user details to storage:', storageErr);
      }
      
      return response.user || response;
    } catch (err: any) {
      console.error('Error fetching user details:', err);
      return null;
    }
  };

  // Refresh user details
  const refreshUserDetails = async () => {
    if (!user) return;
    
    try {
      // Fetch the user details from backend
      const backendUserData = await fetchUserDetails(user);
      console.log('Backend user data fetched:', backendUserData);
      
      return backendUserData;
    } catch (err) {
      console.error('Error refreshing user details:', err);
    }
  };

  // Load user from storage on initial load
  useEffect(() => {
    const loadUserFromStorage = async () => {
      setLoading(true);
      try {
        // Try to get user from AsyncStorage
        const userString = await AsyncStorage.getItem(USER_STORAGE_KEY);
        const userDetailsString = await AsyncStorage.getItem(USER_DETAILS_STORAGE_KEY);
        
        if (userString) {
          const userData = JSON.parse(userString);
          setUser(userData);
          
          if (userDetailsString) {
            const userDetailsData = JSON.parse(userDetailsString);
            setUserDetails(userDetailsData);
          }
          
          // Refresh user details from API
          setTimeout(() => {
            fetchUserDetails(userData);
          }, 500);
        } else {
          // If using mock API and no stored user, get demo user
          if (API_CONFIG.USE_MOCK_API) {
            try {
              const response = await authService.getCurrentUser();
              const userData = response.user || response;
              
              // Convert to User type
              const userObj: User = {
                uid: (userData as any).id ?? (userData as any).uid,
                email: (userData as any).email ?? null,
                displayName: (userData as any).displayName ?? (userData as any).name ?? null,
                photoURL: (userData as any).photoURL ?? null,
                role: (userData as any).role,
                phoneNumber: (userData as any).phone ?? (userData as any).phoneNumber ?? null,
                emailVerified: true,
                address: (userData as any).address ?? null
              };
              
              setUser(user);
              setUserDetails(userData);
              
              // Save to AsyncStorage
              await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
              await AsyncStorage.setItem(USER_DETAILS_STORAGE_KEY, JSON.stringify(userData));
            } catch (apiErr) {
              console.error('Error getting mock user:', apiErr);
            }
          }
        }
      } catch (err) {
        console.error('Error loading user from storage:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserFromStorage();
  }, []);

  // Register function
  const register = async (email: string, password: string, displayName: string, phoneNumber?: string) => {
    setLoading(true);
    try {
      // Register with API (mock or real)
      const response = await authService.register({
        email,
        password,
        name: displayName, // Field name may vary
        displayName,
        phoneNumber
      });
      
      const userData = response.user || response;
      
      // Update local state with the new user data
      const user: User = {
        uid: (userData as any).id ?? (userData as any).uid,
        email: (userData as any).email ?? null,
        displayName: (userData as any).displayName ?? displayName ?? null,
        photoURL: (userData as any).photoURL ?? null,
        emailVerified: true, // Assume verified in mock
        role: (userData as any).role ?? 'citizen',
        phoneNumber: (userData as any).phone ?? phoneNumber ?? null
      };
      
      setUser(user);
      setUserDetails(userData);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      await AsyncStorage.setItem(USER_DETAILS_STORAGE_KEY, JSON.stringify(userData));
      
      return userData;
    } catch (err: any) {
      setError(typeof err === 'string' ? err : err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Login with API (mock or real)
      const response = await authService.login(email, password);
      
      const userData = response.user || response;
      
      // Update local state with user data
      const user: User = {
        uid: (userData as any).id ?? (userData as any).uid,
        email: (userData as any).email ?? null,
        displayName: (userData as any).displayName ?? (userData as any).name ?? null,
        photoURL: (userData as any).photoURL ?? null,
        emailVerified: true, // Assume verified in mock
        role: (userData as any).role ?? 'citizen',
        phoneNumber: (userData as any).phone ?? (userData as any).phoneNumber ?? null
      };
      
      setUser(user);
      setUserDetails(userData);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      await AsyncStorage.setItem(USER_DETAILS_STORAGE_KEY, JSON.stringify(userData));
      
      return userData;
    } catch (err: any) {
      setError(typeof err === 'string' ? err : err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Google Sign In function
  const googleSignIn = async (accessToken: string) => {
    setLoading(true);
    try {
      // In mock mode, just use a predefined Google user
      const response = await authService.googleLogin();
      
      const userData = response.user || response;
      
      // Update local state with user data
      const user: User = {
        uid: (userData as any).id ?? (userData as any).uid,
        email: (userData as any).email ?? null,
        displayName: (userData as any).displayName ?? (userData as any).name ?? null,
        photoURL: (userData as any).photoURL ?? null,
        emailVerified: true, // Always true for Google sign-in
        role: (userData as any).role ?? 'citizen',
        phoneNumber: (userData as any).phone ?? (userData as any).phoneNumber ?? null
      };
      
      setUser(user);
      setUserDetails(userData);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      await AsyncStorage.setItem(USER_DETAILS_STORAGE_KEY, JSON.stringify(userData));
      
      return userData;
    } catch (err: any) {
      setError(typeof err === 'string' ? err : err.message || 'Google sign-in failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
      
      // Clear local state
      setUser(null);
      setUserDetails(null);
      
      // Clear from AsyncStorage
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      await AsyncStorage.removeItem(USER_DETAILS_STORAGE_KEY);
    } catch (err: any) {
      setError(typeof err === 'string' ? err : err.message || 'Logout failed');
      throw err;
    }
  };

  // Create context value
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