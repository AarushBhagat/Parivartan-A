import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateMockData, MockData, Issue, User, Comment } from './mockData';
import { auth } from '../../firebase';

// Mock API delay to simulate network requests
const MOCK_API_DELAY = 800; // milliseconds

// Storage keys
const STORAGE_KEYS = {
  MOCK_DATA: 'parivartan_mock_data',
  CURRENT_USER: 'parivartan_current_user'
};

// Helper for simulating API delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper for random delay to make loading feel natural
const randomDelay = () => delay(MOCK_API_DELAY + Math.random() * 600);

// Helper to get the current user ID (Firebase UID if available, mock user ID as fallback)
// Helper to get the current user ID
async function getCurrentUserId(fallbackId?: string) {
  // Try to get the Firebase user first (preferred)
  const firebaseUser = auth.currentUser;
  if (firebaseUser) {
    console.log(`Using Firebase user ID: ${firebaseUser.uid}`);
    return firebaseUser.uid;
  }
  
  // If no Firebase user, try to get the user from our mock auth
  const currentUser = await loadCurrentUser();
  if (currentUser) {
    console.log(`Using stored mock user ID: ${currentUser.id}`);
    return currentUser.id;
  }
  
  // If no user at all, use the fallback or default
  const finalId = fallbackId || 'user1';
  console.log(`No authenticated user found, using fallback ID: ${finalId}`);
  return finalId;
}

// Helper to save data to AsyncStorage
const saveMockData = async (data: MockData) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.MOCK_DATA, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving mock data:', error);
    return false;
  }
};

// Helper to load data from AsyncStorage
const loadMockData = async (): Promise<MockData> => {
  try {
    const dataString = await AsyncStorage.getItem(STORAGE_KEYS.MOCK_DATA);
    if (dataString) {
      return JSON.parse(dataString);
    }
  } catch (error) {
    console.error('Error loading mock data:', error);
  }
  
  // If no data exists or error, generate new data
  const newData = generateMockData();
  await saveMockData(newData);
  return newData;
};

// Helper to save current user to AsyncStorage
const saveCurrentUser = async (user: User) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    return true;
  } catch (error) {
    console.error('Error saving current user:', error);
    return false;
  }
};

// Helper to load current user from AsyncStorage
const loadCurrentUser = async (): Promise<User | null> => {
  try {
    const userString = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (userString) {
      return JSON.parse(userString);
    }
  } catch (error) {
    console.error('Error loading current user:', error);
  }
  return null;
};

// Mock Auth API
export const mockAuthApi = {
  // Get current authenticated user
  getCurrentUser: async () => {
    await randomDelay();
    const mockData = await loadMockData();
    
    // First try to get from AsyncStorage
    const storedUser = await loadCurrentUser();
    if (storedUser) {
      return { user: storedUser };
    }
    
    // If no stored user, use the first user as default
    const defaultUser = mockData.users[0];
    await saveCurrentUser(defaultUser);
    return { user: defaultUser };
  },
  
  // Register a new user
  register: async (userData: { email: string, password: string, name: string }) => {
    await randomDelay();
    const mockData = await loadMockData();
    
    // Check if email already exists
    const existingUser = mockData.users.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('Email already in use');
    }
    
    // Create new user
    const newUser: User = {
      id: `user_${mockData.users.length + 1}`,
      email: userData.email,
      displayName: userData.name,
      photoURL: 'https://randomuser.me/api/portraits/lego/1.jpg',
      role: 'citizen',
      stats: {
        issuesReported: 0,
        issuesResolved: 0,
        commentsPosted: 0,
        upvotesReceived: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockData.users.push(newUser);
    await saveMockData(mockData);
    await saveCurrentUser(newUser);
    
    return { user: newUser };
  },
  
  // Login existing user
  login: async (email: string, password: string) => {
    await randomDelay();
    const mockData = await loadMockData();
    
    // Check if user exists
    const user = mockData.users.find(u => u.email === email);
    if (!user) {
      throw new Error('No user found with this email');
    }
    
    // In a real app we'd check the password, but here we just simulate success
    await saveCurrentUser(user);
    return { user };
  },
  
  // Login with Google
  googleLogin: async () => {
    await randomDelay();
    const mockData = await loadMockData();
    
    // Simulate Google authentication and use the 2nd user
    const user = mockData.users[1]; // Jane Smith
    await saveCurrentUser(user);
    return { user };
  },
  
  // Update user profile
  updateProfile: async (profileData: { displayName?: string, photoURL?: string, phone?: string, address?: string }) => {
    await randomDelay();
    const mockData = await loadMockData();
    const currentUser = await loadCurrentUser();
    
    if (!currentUser) {
      throw new Error('No authenticated user');
    }
    
    // Update user in mock data
    const userIndex = mockData.users.findIndex(u => u.id === currentUser.id);
    if (userIndex >= 0) {
      mockData.users[userIndex] = {
        ...mockData.users[userIndex],
        ...profileData,
        updatedAt: new Date().toISOString()
      };
      await saveMockData(mockData);
      
      // Update current user
      const updatedUser = mockData.users[userIndex];
      await saveCurrentUser(updatedUser);
      
      return { user: updatedUser };
    }
    
    throw new Error('User not found');
  },
  
  // Logout
  logout: async () => {
    await randomDelay();
    await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    return { success: true };
  },
  
  // Update FCM token
  updateFCMToken: async (fcmToken: string) => {
    await randomDelay();
    return { success: true };
  }
};

// Mock Issue API
export const mockIssueApi = {
  // Get all issues
  getAllIssues: async (filters?: any) => {
    await randomDelay();
    const mockData = await loadMockData();
    
    // Apply filters if provided
    let filteredIssues = [...mockData.issues];
    
    if (filters) {
      if (filters.department) { // Changed from category to department
        filteredIssues = filteredIssues.filter(issue => issue.department === filters.department);
      }
      
      if (filters.status) {
        filteredIssues = filteredIssues.filter(issue => issue.status === filters.status);
      }
      
      if (filters.district) {
        filteredIssues = filteredIssues.filter(issue => issue.location.district === filters.district);
      }
    }
    
    // Sort by newest first
    filteredIssues.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return { issues: filteredIssues };
  },
  
  // Get issue by ID
  getIssueById: async (issueId: string) => {
    await randomDelay();
    const mockData = await loadMockData();
    
    console.log(`Looking for issue with ID: ${issueId}`);
    
    // Try to find the issue by exact ID match or by numeric part if it's a string number
    const issue = mockData.issues.find(i => i.id === issueId || 
                                      i.id === `issue_${issueId}` || 
                                      i.id.endsWith(`_${issueId}`));
    if (!issue) {
      console.log(`No issue found with ID: ${issueId}`);
      console.log(`Available issue IDs: ${mockData.issues.map(i => i.id).join(', ')}`);
      throw new Error('Issue not found');
    }
    
    console.log(`Found issue: ${issue.id} - ${issue.title}`);
    return { issue };
  },
  
  // Get issues by user
  getMyIssues: async () => {
    await randomDelay();
    const mockData = await loadMockData();
    const currentUser = await loadCurrentUser();
    const firebaseUser = auth.currentUser;
    
    if (!firebaseUser && !currentUser) {
      throw new Error('No authenticated user');
    }
    
    // Get all possible user IDs to match against - prioritize Firebase auth ID
    const firebaseUserId = firebaseUser?.uid;
    const mockUserId = currentUser?.id;
    
    console.log(`Looking for issues created by user: Firebase ID=${firebaseUserId}, Mock ID=${mockUserId}`);
    
    // Filter issues strictly created by this user using any of the possible IDs
    const userIssues = mockData.issues.filter(issue => {
      const creatorId = issue.createdBy.uid;
      const isCreatedByCurrentUser = 
        (firebaseUserId && creatorId === firebaseUserId) || 
        (mockUserId && creatorId === mockUserId);
      
      return isCreatedByCurrentUser;
    });
    
    console.log(`Found ${userIssues.length} issues for the current user`);
    if (userIssues.length > 0) {
      console.log(`Issue creator IDs: ${userIssues.map(i => i.createdBy.uid).join(', ')}`);
    }
    
    // Sort by newest first
    userIssues.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return { issues: userIssues };
  },
  
  // Create new issue
  createIssue: async (issueData: any, mediaFiles?: any[]) => {
    await randomDelay();
    const mockData = await loadMockData();
    const currentUser = await loadCurrentUser();
    const firebaseUser = auth.currentUser;
    
    if (!firebaseUser && !currentUser) {
      throw new Error('No authenticated user');
    }
    
    // Process media files (in real app, these would be uploaded to storage)
    const mediaUrls: string[] = [];
    
    // Handle FormData (from direct API calls) or regular JSON data
    let processedIssueData: any = issueData;
    
    // Check if issueData is FormData and extract data
    if (issueData instanceof FormData) {
      console.log('Processing FormData for issue creation');
      // Create a placeholder object with default values
      processedIssueData = {
        title: 'New Issue Report',
        description: 'Issue reported from the mobile app',
        department: 'municipal', // Changed from category to department
        location: {
          address: 'Reported from mobile app',
          latitude: 28.6304,
          longitude: 77.2177,
          district: 'Central Area'
        }
      };
      
      // Try to extract actual values from FormData (this is approximate as FormData access is limited)
      try {
        // We can't easily process FormData in React Native mock
        // Just log and use default values
        console.log('FormData received, using default values');
        
        // If we have direct properties on the FormData object, try to use them
        // This is a simplified approach as FormData isn't easily iterable
        if ('title' in issueData && typeof issueData.title === 'string') {
          processedIssueData.title = issueData.title;
        }
        if ('description' in issueData && typeof issueData.description === 'string') {
          processedIssueData.description = issueData.description;
        }
        if ('department' in issueData && typeof issueData.department === 'string') { // Changed from category to department
          processedIssueData.department = issueData.department;
        }
      } catch (error) {
        console.log('Could not fully extract FormData, using defaults', error);
      }
    }
    
    // Handle image/media files
    if (mediaFiles && mediaFiles.length > 0) {
      console.log(`Processing ${mediaFiles.length} media files for issue`);
      // For mock data, we'll use placeholder images
      const placeholderImages = [
        'https://images.unsplash.com/photo-1592838064575-52970f0c4cd6?w=600',
        'https://images.unsplash.com/photo-1583124168619-0ae4561663d1?w=600',
        'https://images.unsplash.com/photo-1580974852861-c381510bc98a?w=600',
        'https://images.unsplash.com/photo-1603203040743-24cc00018a66?w=600',
        'https://images.unsplash.com/photo-1601026909629-bad5e1f39cd4?w=600'
      ];
      
      // For each media file, add a placeholder image
      mediaFiles.forEach((file) => {
        const randomImage = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
        mediaUrls.push(randomImage);
        console.log(`Added placeholder image for media file: ${randomImage}`);
      });
    } else {
      // Always add at least one sample image for better UI
      mediaUrls.push('https://images.unsplash.com/photo-1603203040743-24cc00018a66?w=600');
      console.log('Added default placeholder image to issue');
    }
    
    // Get the authenticated user ID - prioritize Firebase auth
    const userIdToUse = firebaseUser ? firebaseUser.uid : (currentUser ? currentUser.id : 'user1');
    
    // Get the display name and photo URL
    const displayNameToUse = firebaseUser ? 
      (firebaseUser.displayName || (currentUser ? currentUser.displayName : 'Anonymous User')) : 
      (currentUser ? currentUser.displayName : 'Anonymous User');
      
    const photoURLToUse = firebaseUser ? 
      (firebaseUser.photoURL || (currentUser ? currentUser.photoURL : undefined)) : 
      (currentUser ? currentUser.photoURL : undefined);
    
    console.log(`Creating issue with user ID: ${userIdToUse}, name: ${displayNameToUse}`);
    
    // Generate a new unique issue ID
    const newIssueId = `issue_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    const newIssue: Issue = {
      id: newIssueId,
      title: processedIssueData.title,
      description: processedIssueData.description,
      department: processedIssueData.department, // Changed from category to department
      subCategory: processedIssueData.subCategory,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      location: {
        address: processedIssueData.location.address || `Near ${processedIssueData.location.district || 'Jalandhar Area'}`,
        latitude: processedIssueData.location.latitude || 31.330000, // Default to Jalandhar coordinates
        longitude: processedIssueData.location.longitude || 75.584400, // Default to Jalandhar coordinates
        district: processedIssueData.location.district || 'Jalandhar'
      },
      createdBy: {
        uid: userIdToUse, // Use Firebase UID when available
        displayName: displayNameToUse,
        photoURL: photoURLToUse
      },
      mediaUrls,
      upvotes: 0,
      upvotedBy: [],
      comments: [],
      updates: [
        {
          id: `update_${newIssueId}_0`,
          status: 'pending',
          text: 'Issue reported and logged into the system.',
          timestamp: new Date().toISOString()
        }
      ]
    };
    
    // Add to mock data
    mockData.issues.unshift(newIssue);
    console.log(`New issue created with ID: ${newIssue.id}`);
    
    // Update user stats if we have a matching user
    const userIndex = mockData.users.findIndex(u => 
      u.id === userIdToUse || u.id === currentUser?.id
    );
    
    if (userIndex >= 0) {
      const userStats = mockData.users[userIndex].stats || {
        issuesReported: 0,
        issuesResolved: 0,
        commentsPosted: 0,
        upvotesReceived: 0
      };
      
      mockData.users[userIndex].stats = {
        ...userStats,
        issuesReported: userStats.issuesReported + 1
      };
      
      // Update current user
      await saveCurrentUser(mockData.users[userIndex]);
    } else {
      console.log(`Could not find matching user to update stats for ${userIdToUse}`);
    }
    
    // Generate notification for admins/staff
    const staffUsers = mockData.users.filter(u => u.role === 'staff' || u.role === 'admin');
    staffUsers.forEach(staff => {
      mockData.notifications.push({
        id: `notification_${staff.id}_${Date.now()}`,
        userId: staff.id,
        title: 'New Issue Reported',
        body: `A new ${processedIssueData.category} issue has been reported in ${processedIssueData.location.district || 'your area'}.`,
        read: false,
        type: 'system',
        issueId: newIssue.id,
        createdAt: new Date().toISOString()
      });
    });
    
    await saveMockData(mockData);
    return { issue: newIssue };
  },
  
  // Upvote an issue
  upvoteIssue: async (issueId: string) => {
    await randomDelay();
    const mockData = await loadMockData();
    const currentUser = await loadCurrentUser();
    const firebaseUser = auth.currentUser;
    
    if (!firebaseUser && !currentUser) {
      throw new Error('No authenticated user');
    }
    
    // Get user ID with our helper function
    const userIdToUse = await getCurrentUserId(currentUser?.id);
    
    // Find the issue with flexible matching
    const issueIndex = mockData.issues.findIndex(i => 
      i.id === issueId || 
      i.id === `issue_${issueId}` || 
      i.id.endsWith(`_${issueId}`)
    );
    
    if (issueIndex < 0) {
      console.log(`No issue found with ID for upvoting: ${issueId}`);
      console.log(`Available issue IDs: ${mockData.issues.map(i => i.id).join(', ')}`);
      throw new Error('Issue not found');
    }
    
    // Check if already upvoted (allow re-upvoting for demo purposes)
    const alreadyUpvoted = mockData.issues[issueIndex].upvotedBy.includes(userIdToUse);
    if (alreadyUpvoted) {
      console.log(`User ${userIdToUse} already upvoted issue ${issueId}, but allowing re-upvote for demo`);
      // We'll continue and allow re-upvoting for demo purposes
    }
    
    // Update upvote
    mockData.issues[issueIndex].upvotes += 1;
    mockData.issues[issueIndex].upvotedBy.push(userIdToUse);
    
    // Notify the issue creator
    const creatorId = mockData.issues[issueIndex].createdBy.uid;
    if (creatorId !== userIdToUse) {
      mockData.notifications.push({
        id: `notification_${creatorId}_upvote_${issueId}`,
        userId: creatorId,
        title: 'Your issue received an upvote',
        body: `Someone upvoted your issue about ${mockData.issues[issueIndex].department}.`, // Changed from category to department
        read: false,
        type: 'system',
        issueId,
        createdAt: new Date().toISOString()
      });
      
      // Update creator stats
      const creatorIndex = mockData.users.findIndex(u => u.id === creatorId);
      if (creatorIndex >= 0) {
        const userStats = mockData.users[creatorIndex].stats || {
          issuesReported: 0,
          issuesResolved: 0,
          commentsPosted: 0,
          upvotesReceived: 0
        };
        
        mockData.users[creatorIndex].stats = {
          ...userStats,
          upvotesReceived: userStats.upvotesReceived + 1
        };
      }
    }
    
    await saveMockData(mockData);
    return { 
      success: true,
      upvotes: mockData.issues[issueIndex].upvotes,
      upvotedBy: mockData.issues[issueIndex].upvotedBy
    };
  },
  
  // Remove upvote from issue
  removeUpvote: async (issueId: string) => {
    await randomDelay();
    const mockData = await loadMockData();
    const currentUser = await loadCurrentUser();
    
    if (!currentUser) {
      throw new Error('No authenticated user');
    }
    
    // Find the issue with flexible matching
    const issueIndex = mockData.issues.findIndex(i => 
      i.id === issueId || 
      i.id === `issue_${issueId}` || 
      i.id.endsWith(`_${issueId}`)
    );
    
    if (issueIndex < 0) {
      console.log(`No issue found with ID for removing upvote: ${issueId}`);
      console.log(`Available issue IDs: ${mockData.issues.map(i => i.id).join(', ')}`);
      throw new Error('Issue not found');
    }
    
    // Check if upvoted
    if (!mockData.issues[issueIndex].upvotedBy.includes(currentUser.id)) {
      throw new Error('You have not upvoted this issue');
    }
    
    // Remove upvote
    mockData.issues[issueIndex].upvotes -= 1;
    mockData.issues[issueIndex].upvotedBy = mockData.issues[issueIndex].upvotedBy.filter(
      id => id !== currentUser.id
    );
    
    // Update creator stats
    const creatorId = mockData.issues[issueIndex].createdBy.uid;
    if (creatorId !== currentUser.id) {
      const creatorIndex = mockData.users.findIndex(u => u.id === creatorId);
      if (creatorIndex >= 0 && mockData.users[creatorIndex].stats) {
        mockData.users[creatorIndex].stats!.upvotesReceived = 
          Math.max(0, mockData.users[creatorIndex].stats!.upvotesReceived - 1);
      }
    }
    
    await saveMockData(mockData);
    return { 
      success: true,
      upvotes: mockData.issues[issueIndex].upvotes,
      upvotedBy: mockData.issues[issueIndex].upvotedBy
    };
  },
  
  // Get nearby issues based on location
  getNearbyIssues: async (latitude: number, longitude: number, radius: number = 10) => {
    await randomDelay();
    const mockData = await loadMockData();
    
    // Use user's actual coordinates as center point if none provided
    const userLat = latitude || 31.330000; // Default to Jalandhar coordinates
    const userLng = longitude || 75.584400;
    
    console.log(`Looking for issues near: ${userLat}, ${userLng} with radius ${radius}km`);
    
    // Calculate distance between two points (simplified version)
    const getDistanceInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };
    
    // Filter issues within radius
    const nearbyIssues = mockData.issues.filter(issue => {
      const distance = getDistanceInKm(
        userLat,
        userLng,
        issue.location.latitude,
        issue.location.longitude
      );
      
      // Log the distance for each issue to help debug
      if (distance <= radius) {
        console.log(`Issue ${issue.id} is ${distance.toFixed(2)}km away - INCLUDED`);
      } else if (distance <= radius * 1.5) {
        console.log(`Issue ${issue.id} is ${distance.toFixed(2)}km away - TOO FAR`);
      }
      
      return distance <= radius;
    });
    
    return { issues: nearbyIssues };
  },
  
  // Get issues by department (changed from category)
  getIssuesByCategory: async (department: string) => { // Renamed parameter to department
    await randomDelay();
    const mockData = await loadMockData();
    
    const departmentIssues = mockData.issues.filter(issue => issue.department === department); // Changed from category to department
    departmentIssues.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return { issues: departmentIssues };
  },
  
  // Get issues by status
  getIssuesByStatus: async (status: string) => {
    await randomDelay();
    const mockData = await loadMockData();
    
    const statusIssues = mockData.issues.filter(issue => issue.status === status);
    statusIssues.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return { issues: statusIssues };
  },
  
  // Add comment to an issue
  addComment: async (issueId: string, commentText: string) => {
    await randomDelay();
    const mockData = await loadMockData();
    const currentUser = await loadCurrentUser();
    
    if (!currentUser) {
      throw new Error('No authenticated user');
    }
    
    // Find the issue with flexible matching
    const issueIndex = mockData.issues.findIndex(i => 
      i.id === issueId || 
      i.id === `issue_${issueId}` || 
      i.id.endsWith(`_${issueId}`)
    );
    
    if (issueIndex < 0) {
      console.log(`No issue found with ID for adding comment: ${issueId}`);
      console.log(`Available issue IDs: ${mockData.issues.map(i => i.id).join(', ')}`);
      throw new Error('Issue not found');
    }
    
    // Create new comment
    const newComment: Comment = {
      id: `comment_${issueId}_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.displayName,
      text: commentText,
      timestamp: new Date().toISOString(),
      userPhotoUrl: currentUser.photoURL
    };
    
    // Add to issue
    if (!mockData.issues[issueIndex].comments) {
      mockData.issues[issueIndex].comments = [];
    }
    mockData.issues[issueIndex].comments!.push(newComment);
    
    // Update user stats
    const userIndex = mockData.users.findIndex(u => u.id === currentUser.id);
    if (userIndex >= 0) {
      const userStats = mockData.users[userIndex].stats || {
        issuesReported: 0,
        issuesResolved: 0,
        commentsPosted: 0,
        upvotesReceived: 0
      };
      
      mockData.users[userIndex].stats = {
        ...userStats,
        commentsPosted: userStats.commentsPosted + 1
      };
      
      // Update current user
      await saveCurrentUser(mockData.users[userIndex]);
    }
    
    // Notify issue creator if it's not the same person
    const creatorId = mockData.issues[issueIndex].createdBy.uid;
    if (creatorId !== currentUser.id) {
      mockData.notifications.push({
        id: `notification_${creatorId}_comment_${issueId}_${Date.now()}`,
        userId: creatorId,
        title: 'New comment on your issue',
        body: `${currentUser.displayName} commented on your issue.`,
        read: false,
        type: 'comment',
        issueId,
        createdAt: new Date().toISOString()
      });
    }
    
    await saveMockData(mockData);
    return { comment: newComment };
  },
  
  // Rate a resolved issue
  rateIssue: async (issueId: string, ratingData: { rating: number; comment: string; userId: string; userName: string }) => {
    await randomDelay();
    const mockData = await loadMockData();
    
    // Find the issue
    const issueIndex = mockData.issues.findIndex(i => 
      i.id === issueId || 
      i.id === `issue_${issueId}` || 
      i.id.endsWith(`_${issueId}`)
    );
    
    if (issueIndex < 0) {
      throw new Error('Issue not found');
    }
    
    // Check if issue is resolved
    if (mockData.issues[issueIndex].status !== 'resolved') {
      throw new Error('Can only rate resolved issues');
    }
    
    // Check if already rated
    if (mockData.issues[issueIndex].rating) {
      throw new Error('Issue already rated');
    }
    
    // Add rating to issue
    mockData.issues[issueIndex].rating = ratingData.rating;
    mockData.issues[issueIndex].ratingComment = ratingData.comment;
    mockData.issues[issueIndex].ratedBy = ratingData.userId;
    mockData.issues[issueIndex].ratedAt = new Date().toISOString();
    
    await saveMockData(mockData);
    return { success: true, message: 'Rating submitted successfully' };
  }
};

// Mock User API
export const mockUserApi = {
  // Get user profile by ID
  getUserProfile: async (userId: string) => {
    await randomDelay();
    const mockData = await loadMockData();
    
    const user = mockData.users.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    return { user };
  }
};

// Mock Notification API
export const mockNotificationApi = {
  // Get all notifications for current user
  getNotifications: async () => {
    await randomDelay();
    const mockData = await loadMockData();
    const currentUser = await loadCurrentUser();
    
    if (!currentUser) {
      throw new Error('No authenticated user');
    }
    
    // Filter notifications for this user
    const userNotifications = mockData.notifications
      .filter(notification => notification.userId === currentUser.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return { notifications: userNotifications };
  },
  
  // Mark notification as read
  markAsRead: async (notificationId: string) => {
    await randomDelay();
    const mockData = await loadMockData();
    const currentUser = await loadCurrentUser();
    
    if (!currentUser) {
      throw new Error('No authenticated user');
    }
    
    // Find the notification
    const notificationIndex = mockData.notifications.findIndex(
      n => n.id === notificationId && n.userId === currentUser.id
    );
    
    if (notificationIndex < 0) {
      throw new Error('Notification not found');
    }
    
    // Mark as read
    mockData.notifications[notificationIndex].read = true;
    
    await saveMockData(mockData);
    return { success: true };
  },
  
  // Mark all notifications as read
  markAllAsRead: async () => {
    await randomDelay();
    const mockData = await loadMockData();
    const currentUser = await loadCurrentUser();
    
    if (!currentUser) {
      throw new Error('No authenticated user');
    }
    
    // Update all notifications for this user
    mockData.notifications.forEach((notification, index) => {
      if (notification.userId === currentUser.id) {
        mockData.notifications[index].read = true;
      }
    });
    
    await saveMockData(mockData);
    return { success: true };
  }
};

// Mock Department API
export const mockDepartmentApi = {
  // Get all departments
  getAllDepartments: async () => {
    await randomDelay();
    const mockData = await loadMockData();
    
    return { departments: mockData.departments };
  },
  
  // Get department by ID
  getDepartmentById: async (departmentId: string) => {
    await randomDelay();
    const mockData = await loadMockData();
    
    const department = mockData.departments.find(d => d.id === departmentId);
    if (!department) {
      throw new Error('Department not found');
    }
    
    return { department };
  }
};

// Mock Category API
export const mockCategoryApi = {
  // Get all categories
  getAllCategories: async () => {
    await randomDelay();
    const mockData = await loadMockData();
    
    return { categories: mockData.categories };
  }
};

// Initialize mock data
export const initializeMockData = async (force = false) => {
  try {
    if (force) {
      const newData = generateMockData();
      await saveMockData(newData);
      console.log('Initialized mock data with issues:', newData.issues.map(i => i.id).slice(0, 5), '...');
      return true;
    }
    
    const existingData = await AsyncStorage.getItem(STORAGE_KEYS.MOCK_DATA);
    if (!existingData) {
      const newData = generateMockData();
      await saveMockData(newData);
      console.log('Initialized fresh mock data with issues:', newData.issues.map(i => i.id).slice(0, 5), '...');
    } else {
      const parsedData = JSON.parse(existingData);
      console.log('Found existing mock data with issues:', parsedData.issues.map((i: any) => i.id).slice(0, 5), '...');
    }
    return true;
  } catch (error) {
    console.error('Error initializing mock data:', error);
    return false;
  }
};