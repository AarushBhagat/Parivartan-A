import { auth } from '../firebase';

import { getApiUrl } from '../config/api.config';

// Get API base URL from configuration
const API_BASE_URL = getApiUrl();

// Helper to get auth token
const getAuthToken = async (): Promise<string | null> => {
  const user = auth.currentUser;
  if (!user) {
    return null;
  }
  return await user.getIdToken();
};

// Generic API request function with authentication
const apiRequest = async (
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any,
  requiresAuth: boolean = true,
  retryCount: number = 2 // Add retry mechanism
) => {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (requiresAuth) {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Not authenticated');
      }
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Create an AbortController with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const options: RequestInit = {
      method,
      headers,
      signal: controller.signal
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
      
      // Clear the timeout as the request completed
      clearTimeout(timeoutId);
      
      // Some endpoints might return empty response
      let result;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        result = { success: response.ok };
      }

      if (!response.ok) {
        const errorMessage = result.error || result.message || 'API request failed';
        console.log('API error details:', result);
        throw new Error(errorMessage);
      }

      return result;
    } catch (fetchError) {
      // Clear the timeout even if the request failed
      clearTimeout(timeoutId);
      
      // Check if we should retry
      if (retryCount > 0) {
        // Check for network errors that should be retried
        const isNetworkError = fetchError instanceof TypeError || 
                              (typeof fetchError === 'object' && 
                               fetchError !== null && 
                               'name' in fetchError && 
                               (fetchError as any).name === 'AbortError');
        
        if (isNetworkError) {
          console.log(`Network error, retrying... (${retryCount} attempts left)`);
          // Wait a bit before retrying (use exponential backoff)
          await new Promise(resolve => setTimeout(resolve, (3 - retryCount) * 1000));
          // Retry the request with one fewer retry attempts
          return apiRequest(endpoint, method, data, requiresAuth, retryCount - 1);
        }
      }
      throw fetchError;
    }
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    // Convert Error objects to strings to avoid [object Object] in error messages
    if (error instanceof Error) {
      // Check if this is a JSON string error that we need to parse
      try {
        const parsedError = JSON.parse(error.message);
        const errorMessage = parsedError.error || parsedError.message || error.message;
        throw new Error(errorMessage);
      } catch (parseError) {
        // Not JSON, just throw the original error
        throw error;
      }
    } else if (typeof error === 'object' && error !== null) {
      // Convert object to string to avoid [object Object] errors
      try {
        const errorString = JSON.stringify(error);
        throw new Error(errorString);
      } catch {
        throw new Error('Unknown error occurred');
      }
    } else {
      throw new Error(String(error));
    }
  }
};

// API request function for FormData (file uploads)
const apiRequestWithFormData = async (
  endpoint: string,
  method: 'POST' | 'PUT' = 'POST',
  formData: FormData,
  requiresAuth: boolean = true,
  retryCount: number = 2
) => {
  try {
    const headers: Record<string, string> = {};

    if (requiresAuth) {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Not authenticated');
      }
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Create an AbortController with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for uploads

    const options: RequestInit = {
      method,
      headers,
      body: formData,
      signal: controller.signal
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
      
      // Clear the timeout as the request completed
      clearTimeout(timeoutId);
      
      let result;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        result = { success: response.ok };
      }

      if (!response.ok) {
        const errorMessage = result.error || result.message || 'API request failed';
        console.log('API error details:', result);
        throw new Error(errorMessage);
      }

      return result;
    } catch (fetchError) {
      // Clear the timeout even if the request failed
      clearTimeout(timeoutId);
      
      // Check if we should retry
      if (retryCount > 0) {
        // Check for network errors that should be retried
        const isNetworkError = fetchError instanceof TypeError || 
                              (typeof fetchError === 'object' && 
                               fetchError !== null && 
                               'name' in fetchError && 
                               (fetchError as any).name === 'AbortError');
        
        if (isNetworkError) {
          console.log(`Network error in form upload, retrying... (${retryCount} attempts left)`);
          // Wait a bit before retrying (use exponential backoff)
          await new Promise(resolve => setTimeout(resolve, (3 - retryCount) * 1000));
          // Retry the request with one fewer retry attempts
          return apiRequestWithFormData(endpoint, method, formData, requiresAuth, retryCount - 1);
        }
      }
      throw fetchError;
    }
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(String(error));
    }
  }
};

// Auth Services
export const authService = {
  // Register a new user
  register: async (userData: any) => {
    return apiRequest('/auth/register', 'POST', userData, false);
  },

  // Verify token with backend
  verifyToken: async (idToken: string) => {
    try {
      return await apiRequest('/auth/verify-token', 'POST', { idToken }, false);
    } catch (error) {
      console.error('Error verifying token with backend:', error);
      throw error;
    }
  },

  // Get current user profile
  getCurrentUser: async () => {
    // Try Firebase first (direct), fallback to backend API
    try {
      const { getFirestore, doc, getDoc } = await import('firebase/firestore');
      const { getAuth } = await import('firebase/auth');
      const firebaseImport = await import('../firebase');
      
      const db = getFirestore(firebaseImport.app);
      const auth = getAuth(firebaseImport.app);
      const user = auth.currentUser;
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Try citizens collection first
      let userDoc = await getDoc(doc(db, 'citizens', user.uid));
      
      if (!userDoc.exists()) {
        // Try users collection as fallback
        userDoc = await getDoc(doc(db, 'users', user.uid));
      }
      
      if (userDoc.exists()) {
        return {
          success: true,
          user: {
            id: userDoc.id,
            ...userDoc.data(),
            email: user.email,
            phoneNumber: user.phoneNumber,
          }
        };
      }
      
      // If no profile exists, return basic auth info
      return {
        success: true,
        user: {
          id: user.uid,
          email: user.email,
          phoneNumber: user.phoneNumber,
          displayName: user.displayName,
        }
      };
    } catch (firebaseError) {
      console.log('[Auth Service] Firebase direct fetch failed, trying backend API:', firebaseError);
      return apiRequest('/auth/me', 'GET');
    }
  },

  // Update user profile
  updateProfile: async (profileData: any) => {
    return apiRequest('/auth/update-profile', 'PUT', profileData);
  },

  // Update FCM token for push notifications
  updateFCMToken: async (fcmToken: string) => {
    return apiRequest('/auth/update-fcm-token', 'PUT', { fcmToken });
  },

  // Request password reset
  requestPasswordReset: async (email: string) => {
    return apiRequest('/auth/password-reset', 'POST', { email }, false);
  },
};

// Issue Services
export const issueService = {
  // Get all issues
  getAllIssues: async (filters?: any) => {
    // Try Firebase first (direct), fallback to backend API
    try {
      const { getFirestore, collection, query, where, getDocs } = await import('firebase/firestore');
      const firebaseImport = await import('../firebase');
      
      const db = getFirestore(firebaseImport.app);
      const grievancesRef = collection(db, 'grievances');
      
      // Build query based on filters
      let q = query(grievancesRef);
      
      if (filters) {
        if (filters.department) {
          const { where: whereClause } = await import('firebase/firestore');
          q = query(grievancesRef, whereClause('department', '==', filters.department));
        }
        if (filters.status) {
          const { where: whereClause } = await import('firebase/firestore');
          q = query(grievancesRef, whereClause('status', '==', filters.status));
        }
      }
      
      const snapshot = await getDocs(q);
      const issues = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Convert Firestore Timestamp to ISO string
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        };
      });
      
      // Sort by creation date (newest first)
      issues.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });
      
      return {
        success: true,
        issues,
        count: issues.length
      };
    } catch (firebaseError) {
      console.log('[Issue Service] Firebase direct fetch failed, trying backend API:', firebaseError);
      const queryParams = filters ? `?${new URLSearchParams(filters).toString()}` : '';
      return apiRequest(`/issues${queryParams}`);
    }
  },

  // Get issue by ID
  getIssueById: async (issueId: string) => {
    // Try Firebase first (direct), fallback to backend API
    try {
      const { getFirestore, doc, getDoc } = await import('firebase/firestore');
      const firebaseImport = await import('../firebase');
      
      const db = getFirestore(firebaseImport.app);
      const issueDoc = await getDoc(doc(db, 'grievances', issueId));
      
      if (!issueDoc.exists()) {
        return { success: false, error: 'Issue not found' };
      }
      
      const data = issueDoc.data();
      return {
        success: true,
        issue: {
          id: issueDoc.id,
          ...data,
          // Convert Firestore Timestamp to ISO string
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        }
      };
    } catch (firebaseError) {
      console.log('[Issue Service] Firebase direct fetch failed, trying backend API:', firebaseError);
      return apiRequest(`/issues/${issueId}`);
    }
  },

  // Get issues by user
  getMyIssues: async () => {
    // Try Firebase first (direct), fallback to backend API
    try {
      const { getFirestore, collection, query, where, getDocs, orderBy } = await import('firebase/firestore');
      const { getAuth } = await import('firebase/auth');
      const firebaseImport = await import('../firebase');
      
      const db = getFirestore(firebaseImport.app);
      const auth = getAuth(firebaseImport.app);
      const user = auth.currentUser;
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Query grievances collection for this user's issues
      const grievancesRef = collection(db, 'grievances');
      const q = query(
        grievancesRef,
        where('userId', '==', user.uid)
      );
      
      const snapshot = await getDocs(q);
      const issues = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Convert Firestore Timestamp to ISO string
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        };
      });
      
      // Sort by creation date (newest first)
      issues.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });
      
      return {
        success: true,
        issues,
        count: issues.length
      };
    } catch (firebaseError) {
      console.log('[Issue Service] Firebase direct fetch failed, trying backend API:', firebaseError);
      return apiRequest('/issues/my-issues');
    }
  },

  // Create a new issue with file upload support
  createIssue: async (issueData: any, mediaFiles?: any[]) => {
    // Try Firebase first (direct), fallback to backend API
    try {
      const { getFirestore, collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      const { getAuth } = await import('firebase/auth');
      const firebaseImport = await import('../firebase');
      
      const db = getFirestore(firebaseImport.app);
      const auth = getAuth(firebaseImport.app);
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      // Prepare grievance data for Firebase
      const grievance = {
        title: issueData.title,
        description: issueData.description,
        department: issueData.department,
        status: 'pending',
        priority: 'medium',
        
        // Citizen information
        userId: user.uid,
        citizenName: user.displayName || 'Anonymous',
        citizenEmail: user.email || '',
        citizenPhone: '',
        
        // Location information
        location: {
          address: issueData.location.address || '',
          latitude: issueData.location.latitude,
          longitude: issueData.location.longitude,
          district: issueData.location.district || ''
        },
        
        // Metadata with AWS S3 photo URLs
        images: issueData.photoUrls || [],
        photoUrls: issueData.photoUrls || [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      console.log('Saving grievance directly to Firebase...');
      const docRef = await addDoc(collection(db, 'grievances'), grievance);
      console.log('✅ Grievance saved to Firebase with ID:', docRef.id);
      
      return {
        success: true,
        issue: {
          id: docRef.id,
          ...grievance,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };
    } catch (firebaseError) {
      console.log('Firebase direct save failed, trying backend API...', firebaseError);
      
      // Fallback to backend API
      const formData = new FormData();
      
      // Add text fields
      Object.keys(issueData).forEach(key => {
        if (key === 'location') {
          // Handle location object
          formData.append('location[latitude]', issueData.location.latitude.toString());
          formData.append('location[longitude]', issueData.location.longitude.toString());
          if (issueData.location.address) {
            formData.append('location[address]', issueData.location.address);
          }
          if (issueData.location.district) {
            formData.append('location[district]', issueData.location.district);
          }
        } else {
          formData.append(key, issueData[key]);
        }
      });
      
      // Add media files
      if (mediaFiles && mediaFiles.length > 0) {
        mediaFiles.forEach((file, index) => {
          formData.append('media', {
            uri: file.uri,
            type: file.type || 'image/jpeg',
            name: file.name || `image_${index}.jpg`,
          } as any);
        });
      }

      return apiRequestWithFormData('/issues', 'POST', formData);
    }
  },

  // Update an issue
  updateIssue: async (issueId: string, issueData: any) => {
    return apiRequest(`/issues/${issueId}`, 'PUT', issueData);
  },

  // Upvote an issue
  upvoteIssue: async (issueId: string) => {
    return apiRequest(`/issues/${issueId}/upvote`, 'POST');
  },

  // Remove upvote from an issue
  removeUpvote: async (issueId: string) => {
    return apiRequest(`/issues/${issueId}/upvote`, 'DELETE');
  },

  // Get nearby issues
  getNearbyIssues: async (latitude: number, longitude: number, radius?: number) => {
    return apiRequest('/issues/nearby', 'GET', { latitude, longitude, radius });
  },

  // Get issues by category (department)
  getIssuesByCategory: async (category: string) => {
    // Try Firebase first (direct), fallback to backend API
    try {
      const { getFirestore, collection, query, where, getDocs } = await import('firebase/firestore');
      const firebaseImport = await import('../firebase');
      
      const db = getFirestore(firebaseImport.app);
      const grievancesRef = collection(db, 'grievances');
      const q = query(grievancesRef, where('department', '==', category));
      
      const snapshot = await getDocs(q);
      const issues = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        };
      });
      
      // Sort by creation date (newest first)
      issues.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });
      
      return {
        success: true,
        issues,
        count: issues.length
      };
    } catch (firebaseError) {
      console.log('[Issue Service] Firebase direct fetch failed, trying backend API:', firebaseError);
      return apiRequest(`/issues/by-category/${category}`);
    }
  },

  // Get issues by status
  getIssuesByStatus: async (status: string) => {
    // Try Firebase first (direct), fallback to backend API
    try {
      const { getFirestore, collection, query, where, getDocs } = await import('firebase/firestore');
      const firebaseImport = await import('../firebase');
      
      const db = getFirestore(firebaseImport.app);
      const grievancesRef = collection(db, 'grievances');
      const q = query(grievancesRef, where('status', '==', status));
      
      const snapshot = await getDocs(q);
      const issues = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        };
      });
      
      // Sort by creation date (newest first)
      issues.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });
      
      return {
        success: true,
        issues,
        count: issues.length
      };
    } catch (firebaseError) {
      console.log('[Issue Service] Firebase direct fetch failed, trying backend API:', firebaseError);
      return apiRequest(`/issues/by-status/${status}`);
    }
  },

  // Update progress on an issue (for staff)
  updateProgress: async (issueId: string, progressData: any, mediaFiles?: any[]) => {
    const formData = new FormData();
    
    // Add text fields
    Object.keys(progressData).forEach(key => {
      formData.append(key, progressData[key]);
    });
    
    // Add media files
    if (mediaFiles && mediaFiles.length > 0) {
      mediaFiles.forEach((file, index) => {
        formData.append('media', {
          uri: file.uri,
          type: file.type || 'image/jpeg',
          name: file.name || `progress_${index}.jpg`,
        } as any);
      });
    }

    return apiRequestWithFormData(`/issues/${issueId}/progress`, 'POST', formData);
  },

  // Provide feedback on a resolved issue
  provideFeedback: async (issueId: string, feedbackData: any) => {
    return apiRequest(`/issues/${issueId}/feedback`, 'POST', feedbackData);
  },
  
  // Add a comment to an issue
  addComment: async (issueId: string, commentText: string) => {
    return apiRequest(`/issues/${issueId}/comments`, 'POST', { text: commentText });
  },
  
  // Rate a resolved issue
  rateIssue: async (issueId: string, ratingData: { rating: number; comment: string; userId: string; userName: string }) => {
    return apiRequest(`/issues/${issueId}/rating`, 'POST', ratingData);
  },
};

// User Services
export const userService = {
  // Get user profile by ID
  getUserProfile: async (userId: string) => {
    return apiRequest(`/users/${userId}`);
  },
};

// Notification Services
export const notificationService = {
  // Get all notifications for current user
  getNotifications: async () => {
    return apiRequest('/notifications');
  },

  // Mark notification as read
  markAsRead: async (notificationId: string) => {
    return apiRequest(`/notifications/${notificationId}/read`, 'PUT');
  },
};

// Department Services
export const departmentService = {
  // Get all departments
  getAllDepartments: async () => {
    return apiRequest('/departments');
  },

  // Get department by ID
  getDepartmentById: async (departmentId: string) => {
    return apiRequest(`/departments/${departmentId}`);
  },
};