import {
  mockAuthApi,
  mockIssueApi,
  mockUserApi,
  mockNotificationApi,
  mockDepartmentApi,
  mockCategoryApi,
  initializeMockData
} from './mock/mockApi';

// Initialize mock data system
initializeMockData();

// Auth Services
export const authService = {
  register: async (userData: any) => {
    try {
      return await mockAuthApi.register(userData);
    } catch (error) {
      console.error('Error in mock register:', error);
      throw error;
    }
  },
  
  verifyToken: async (idToken: string) => {
    try {
      // In the mock implementation, we'll just return the current user
      return await mockAuthApi.getCurrentUser();
    } catch (error) {
      console.error('Error in mock verifyToken:', error);
      throw error;
    }
  },
  
  getCurrentUser: async () => {
    try {
      return await mockAuthApi.getCurrentUser();
    } catch (error) {
      console.error('Error in mock getCurrentUser:', error);
      throw error;
    }
  },
  
  updateProfile: async (profileData: any) => {
    try {
      return await mockAuthApi.updateProfile(profileData);
    } catch (error) {
      console.error('Error in mock updateProfile:', error);
      throw error;
    }
  },
  
  updateFCMToken: async (fcmToken: string) => {
    try {
      return await mockAuthApi.updateFCMToken(fcmToken);
    } catch (error) {
      console.error('Error in mock updateFCMToken:', error);
      throw error;
    }
  },
  
  requestPasswordReset: async (email: string) => {
    // Simulate successful request
    return { success: true, message: 'Password reset email sent (mock)' };
  },
  
  // Additional methods needed for the mock auth context
  login: async (email: string, password: string) => {
    try {
      return await mockAuthApi.login(email, password);
    } catch (error) {
      console.error('Error in mock login:', error);
      throw error;
    }
  },
  
  googleLogin: async () => {
    try {
      return await mockAuthApi.googleLogin();
    } catch (error) {
      console.error('Error in mock googleLogin:', error);
      throw error;
    }
  },
  
  logout: async () => {
    try {
      return await mockAuthApi.logout();
    } catch (error) {
      console.error('Error in mock logout:', error);
      throw error;
    }
  }
};

// Issue Services
export const issueService = {
  getAllIssues: async (filters?: any) => {
    try {
      return await mockIssueApi.getAllIssues(filters);
    } catch (error) {
      console.error('Error in mock getAllIssues:', error);
      throw error;
    }
  },
  
  getIssueById: async (issueId: string) => {
    try {
      return await mockIssueApi.getIssueById(issueId);
    } catch (error) {
      console.error('Error in mock getIssueById:', error);
      throw error;
    }
  },
  
  getMyIssues: async () => {
    try {
      return await mockIssueApi.getMyIssues();
    } catch (error) {
      console.error('Error in mock getMyIssues:', error);
      throw error;
    }
  },
  
  createIssue: async (issueData: any, mediaFiles?: any[]) => {
    try {
      console.log('Mock createIssue called with:', { issueData, mediaFilesCount: mediaFiles?.length });
      
      // Handle case when issueData is FormData (from API service)
      if (issueData instanceof FormData) {
        // For mock purposes, simply create a new issue with dummy data
        // since we can't easily access FormData contents in React Native
        
        // Create a fake issue for demo purposes
        const fakeIssueData = {
          title: 'New Issue Report',
          description: 'This is a mock issue created from your form submission.',
          category: 'Roads',
          location: {
            latitude: 31.330000, // Jalandhar coordinates
            longitude: 75.584400, // Jalandhar coordinates
            address: 'unnamed road, Jalandhar, Punjab, India',
            district: 'Jalandhar'
          }
        };
        
        return await mockIssueApi.createIssue(fakeIssueData, mediaFiles || []);
      }
      
      // Regular JSON data case
      return await mockIssueApi.createIssue(issueData, mediaFiles);
      
      // Regular JSON data case
      return await mockIssueApi.createIssue(issueData, mediaFiles);
    } catch (error) {
      console.error('Error in mock createIssue:', error);
      throw error;
    }
  },
  
  updateIssue: async (issueId: string, issueData: any) => {
    // Not implemented in mock, but return success
    return { success: true };
  },
  
  upvoteIssue: async (issueId: string) => {
    try {
      return await mockIssueApi.upvoteIssue(issueId);
    } catch (error) {
      console.error('Error in mock upvoteIssue:', error);
      throw error;
    }
  },
  
  removeUpvote: async (issueId: string) => {
    try {
      return await mockIssueApi.removeUpvote(issueId);
    } catch (error) {
      console.error('Error in mock removeUpvote:', error);
      throw error;
    }
  },
  
  getNearbyIssues: async (latitude: number, longitude: number, radius?: number) => {
    try {
      return await mockIssueApi.getNearbyIssues(latitude, longitude, radius);
    } catch (error) {
      console.error('Error in mock getNearbyIssues:', error);
      throw error;
    }
  },
  
  getIssuesByCategory: async (category: string) => {
    try {
      return await mockIssueApi.getIssuesByCategory(category);
    } catch (error) {
      console.error('Error in mock getIssuesByCategory:', error);
      throw error;
    }
  },
  
  getIssuesByStatus: async (status: string) => {
    try {
      return await mockIssueApi.getIssuesByStatus(status);
    } catch (error) {
      console.error('Error in mock getIssuesByStatus:', error);
      throw error;
    }
  },
  
  updateProgress: async (issueId: string, progressData: any, mediaFiles?: any[]) => {
    // Not implemented in mock, but return success
    return { success: true };
  },
  
  provideFeedback: async (issueId: string, feedbackData: any) => {
    // Not implemented in mock, but return success
    return { success: true };
  },
  
  addComment: async (issueId: string, commentText: string) => {
    try {
      return await mockIssueApi.addComment(issueId, commentText);
    } catch (error) {
      console.error('Error in mock addComment:', error);
      throw error;
    }
  },
  
  rateIssue: async (issueId: string, ratingData: { rating: number; comment: string; userId: string; userName: string }) => {
    try {
      return await mockIssueApi.rateIssue(issueId, ratingData);
    } catch (error) {
      console.error('Error in mock rateIssue:', error);
      throw error;
    }
  },
};

// User Services
export const userService = {
  getUserProfile: async (userId: string) => {
    try {
      return await mockUserApi.getUserProfile(userId);
    } catch (error) {
      console.error('Error in mock getUserProfile:', error);
      throw error;
    }
  },
};

// Notification Services
export const notificationService = {
  getNotifications: async () => {
    try {
      return await mockNotificationApi.getNotifications();
    } catch (error) {
      console.error('Error in mock getNotifications:', error);
      throw error;
    }
  },
  
  markAsRead: async (notificationId: string) => {
    try {
      return await mockNotificationApi.markAsRead(notificationId);
    } catch (error) {
      console.error('Error in mock markAsRead:', error);
      throw error;
    }
  },
  
  markAllAsRead: async () => {
    try {
      return await mockNotificationApi.markAllAsRead();
    } catch (error) {
      console.error('Error in mock markAllAsRead:', error);
      throw error;
    }
  },
};

// Department Services
export const departmentService = {
  getAllDepartments: async () => {
    try {
      return await mockDepartmentApi.getAllDepartments();
    } catch (error) {
      console.error('Error in mock getAllDepartments:', error);
      throw error;
    }
  },
  
  getDepartmentById: async (departmentId: string) => {
    try {
      return await mockDepartmentApi.getDepartmentById(departmentId);
    } catch (error) {
      console.error('Error in mock getDepartmentById:', error);
      throw error;
    }
  },
};

// Category Services
export const categoryService = {
  getAllCategories: async () => {
    try {
      return await mockCategoryApi.getAllCategories();
    } catch (error) {
      console.error('Error in mock getAllCategories:', error);
      throw error;
    }
  },
};