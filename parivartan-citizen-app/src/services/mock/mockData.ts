import { v4 as uuidv4 } from 'uuid';

// Types for our mock data
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phone?: string;
  address?: string;
  role: 'citizen' | 'staff' | 'admin';
  departmentId?: string;
  stats?: {
    issuesReported: number;
    issuesResolved: number;
    commentsPosted: number;
    upvotesReceived: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
  userPhotoUrl?: string;
}

export interface StatusUpdate {
  id: string;
  status: 'pending' | 'under_review' | 'assigned' | 'in_progress' | 'resolved' | 'rejected' | 'closed';
  text: string;
  timestamp: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  department: string; // Changed from category to department
  subCategory?: string;
  status: 'pending' | 'under_review' | 'assigned' | 'in_progress' | 'resolved' | 'rejected' | 'closed';
  createdAt: string;
  updatedAt: string;
  location: {
    address?: string;
    latitude: number;
    longitude: number;
    district: string;
  };
  createdBy: {
    uid: string;
    displayName: string;
    photoURL?: string;
  };
  mediaUrls?: string[];
  upvotes: number;
  upvotedBy: string[];
  comments?: Comment[];
  updates?: StatusUpdate[];
  assignedTo?: {
    uid: string;
    displayName: string;
  };
  departmentInfo?: { // Renamed from department to departmentInfo to avoid confusion
    id: string;
    name: string;
  };
  rating?: number;
  ratingComment?: string;
  ratedBy?: string;
  ratedAt?: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  headId?: string;
  contactEmail: string;
  contactPhone: string;
  categories: string[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  subCategories?: string[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  read: boolean;
  type: 'issue_update' | 'comment' | 'assignment' | 'system';
  issueId?: string;
  createdAt: string;
}

// Generate random dates within a range
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
};

// Generate random coordinates near a base location
const randomCoordinates = (baseLat: number, baseLng: number, radiusKm: number) => {
  const earthRadius = 6371; // Earth's radius in km
  const radiusInDegrees = radiusKm / earthRadius;
  
  const randomAngle = Math.random() * Math.PI * 2;
  const randomDistance = Math.random() * radiusInDegrees;
  
  const lat = baseLat + randomDistance * Math.cos(randomAngle);
  const lng = baseLng + randomDistance * Math.sin(randomAngle);
  
  return { latitude: lat, longitude: lng };
};

// Generate realistic looking mock data
export const generateMockData = () => {
  // Mock Users
  const users: User[] = [
    {
      id: 'user1',
      email: 'john.doe@example.com',
      displayName: 'John Doe',
      photoURL: 'https://randomuser.me/api/portraits/men/1.jpg',
      phone: '+91 98765 43210',
      role: 'citizen',
      stats: {
        issuesReported: 7,
        issuesResolved: 3,
        commentsPosted: 12,
        upvotesReceived: 25
      },
      createdAt: randomDate(new Date(2023, 0, 1), new Date(2023, 11, 31)),
      updatedAt: randomDate(new Date(2024, 0, 1), new Date())
    },
    {
      id: 'user2',
      email: 'jane.smith@example.com',
      displayName: 'Jane Smith',
      photoURL: 'https://randomuser.me/api/portraits/women/2.jpg',
      phone: '+91 98765 43211',
      role: 'citizen',
      stats: {
        issuesReported: 4,
        issuesResolved: 2,
        commentsPosted: 8,
        upvotesReceived: 17
      },
      createdAt: randomDate(new Date(2023, 0, 1), new Date(2023, 11, 31)),
      updatedAt: randomDate(new Date(2024, 0, 1), new Date())
    },
    {
      id: 'user3',
      email: 'amit.kumar@example.com',
      displayName: 'Amit Kumar',
      photoURL: 'https://randomuser.me/api/portraits/men/3.jpg',
      phone: '+91 98765 43212',
      role: 'staff',
      departmentId: 'dept1',
      stats: {
        issuesReported: 2,
        issuesResolved: 15,
        commentsPosted: 32,
        upvotesReceived: 8
      },
      createdAt: randomDate(new Date(2023, 0, 1), new Date(2023, 11, 31)),
      updatedAt: randomDate(new Date(2024, 0, 1), new Date())
    },
    {
      id: 'user4',
      email: 'priya.sharma@example.com',
      displayName: 'Priya Sharma',
      photoURL: 'https://randomuser.me/api/portraits/women/4.jpg',
      phone: '+91 98765 43213',
      role: 'staff',
      departmentId: 'dept2',
      stats: {
        issuesReported: 1,
        issuesResolved: 12,
        commentsPosted: 18,
        upvotesReceived: 5
      },
      createdAt: randomDate(new Date(2023, 0, 1), new Date(2023, 11, 31)),
      updatedAt: randomDate(new Date(2024, 0, 1), new Date())
    },
    {
      id: 'user5',
      email: 'admin@parivartan.org',
      displayName: 'System Admin',
      photoURL: 'https://randomuser.me/api/portraits/men/5.jpg',
      phone: '+91 98765 43214',
      role: 'admin',
      stats: {
        issuesReported: 3,
        issuesResolved: 28,
        commentsPosted: 45,
        upvotesReceived: 12
      },
      createdAt: randomDate(new Date(2023, 0, 1), new Date(2023, 11, 31)),
      updatedAt: randomDate(new Date(2024, 0, 1), new Date())
    }
  ];
  
  // Mock Departments
  const departments: Department[] = [
    {
      id: 'dept1',
      name: 'Public Works Department',
      description: 'Responsible for roads, bridges, and public infrastructure maintenance',
      headId: 'user3',
      contactEmail: 'pwd@parivartan.org',
      contactPhone: '+91 11223 44550',
      categories: ['Roads', 'Bridges', 'Street Lights']
    },
    {
      id: 'dept2',
      name: 'Water & Sanitation Department',
      description: 'Responsible for water supply, drainage, and sanitation services',
      headId: 'user4',
      contactEmail: 'water@parivartan.org',
      contactPhone: '+91 11223 44551',
      categories: ['Water Supply', 'Drainage', 'Sanitation']
    },
    {
      id: 'dept3',
      name: 'Municipal Corporation',
      description: 'Responsible for general civic administration',
      contactEmail: 'municipal@parivartan.org',
      contactPhone: '+91 11223 44552',
      categories: ['Encroachment', 'Garbage Collection', 'Parks']
    },
    {
      id: 'dept4',
      name: 'Electricity Department',
      description: 'Responsible for electrical infrastructure and service',
      contactEmail: 'electricity@parivartan.org',
      contactPhone: '+91 11223 44553',
      categories: ['Power Lines', 'Transformers', 'Street Lights']
    }
  ];
  
  // Mock Categories
  const categories: Category[] = [
    {
      id: 'cat1',
      name: 'Roads',
      description: 'Issues related to roads and highways',
      icon: 'road',
      subCategories: ['Potholes', 'Road Damage', 'Traffic Signals', 'Speed Breakers', 'Road Marking']
    },
    {
      id: 'cat2',
      name: 'Water',
      description: 'Issues related to water supply and drainage',
      icon: 'water',
      subCategories: ['Water Supply', 'Leaking Pipes', 'Water Quality', 'Drainage', 'Waterlogging']
    },
    {
      id: 'cat3',
      name: 'Sanitation',
      description: 'Issues related to cleanliness and waste management',
      icon: 'trash',
      subCategories: ['Garbage Collection', 'Public Toilets', 'Sewage', 'Pest Control', 'Cleaning']
    },
    {
      id: 'cat4',
      name: 'Electricity',
      description: 'Issues related to electrical infrastructure',
      icon: 'flash',
      subCategories: ['Street Lights', 'Power Outage', 'Damaged Wires', 'Electrical Hazards']
    },
    {
      id: 'cat5',
      name: 'Public Spaces',
      description: 'Issues related to parks, markets and community areas',
      icon: 'leaf',
      subCategories: ['Parks', 'Public Markets', 'Bus Stops', 'Encroachment']
    }
  ];
  
  // Base locations for different areas (Kapurthala, Punjab, India coordinates)
  const baseLocations = [
    { name: 'Kapurthala City Center', lat: 31.3800, lng: 75.5800, district: 'Kapurthala City' },
    { name: 'Railway Station', lat: 31.3721, lng: 75.5923, district: 'Station Area' },
    { name: 'Jalandhar Road', lat: 31.3647, lng: 75.5976, district: 'Jalandhar Highway' },
    { name: 'Sultanpur Lodhi', lat: 31.2182, lng: 75.1933, district: 'Sultanpur Lodhi' },
    { name: 'Kanjli Wetland', lat: 31.3856, lng: 75.5236, district: 'Kanjli' },
    { name: 'Shalimar Bagh', lat: 31.3900, lng: 75.5700, district: 'Garden Area' },
    { name: 'Bus Stand', lat: 31.3740, lng: 75.5850, district: 'Bus Terminal' }
  ];

  // Sample media URLs (use free stock images)
  const sampleMediaUrls = [
    'https://images.unsplash.com/photo-1592838064575-52970f0c4cd6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1583124168619-0ae4561663d1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1580974852861-c381510bc98a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1603203040743-24cc00018a66?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1601026909629-bad5e1f39cd4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1585909695284-32d2985ac9c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1583306346437-f9172638a91b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1534398079543-7ae6d016b86a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1596731498067-13ae6c6a8dad?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60'
  ];
  
  // Generate issues with comments and updates
  const issues: Issue[] = [];
  
  for (let i = 1; i <= 25; i++) {
    // Randomly select elements for this issue
    const randomUser = users[Math.floor(Math.random() * 3)]; // First 3 users are citizens or staff
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const randomSubCategory = randomCategory.subCategories ? 
      randomCategory.subCategories[Math.floor(Math.random() * randomCategory.subCategories.length)] : undefined;
    const randomLocation = baseLocations[Math.floor(Math.random() * baseLocations.length)];
    const randomCoords = randomCoordinates(randomLocation.lat, randomLocation.lng, 3); // Within 3km radius
    
    // Random status biased toward pending and in_progress for newer issues
    const statuses: Issue['status'][] = ['pending', 'under_review', 'assigned', 'in_progress', 'resolved', 'rejected', 'closed'];
    const statusWeight = Math.random();
    let status: Issue['status'];
    
    if (i <= 5) {
      // Newer issues - more likely pending or under review
      status = statusWeight < 0.7 ? 'pending' : 
               statusWeight < 0.9 ? 'under_review' : 'assigned';
    } else if (i <= 15) {
      // Middle issues - more evenly distributed
      status = statusWeight < 0.3 ? 'assigned' : 
               statusWeight < 0.6 ? 'in_progress' : 
               statusWeight < 0.8 ? 'resolved' : 
               statusWeight < 0.9 ? 'rejected' : 'closed';
    } else {
      // Older issues - more likely resolved or closed
      status = statusWeight < 0.2 ? 'in_progress' : 
               statusWeight < 0.7 ? 'resolved' : 
               statusWeight < 0.9 ? 'closed' : 'rejected';
    }
    
    // Create timestamps based on status
    let createdAtDate = new Date();
    createdAtDate.setDate(createdAtDate.getDate() - (30 - i)); // Distribute over last month
    const createdAt = createdAtDate.toISOString();
    
    let updatedAtDate = new Date(createdAtDate);
    updatedAtDate.setHours(updatedAtDate.getHours() + Math.floor(Math.random() * 72)); // 0-72 hours later
    const updatedAt = updatedAtDate.toISOString();
    
    // Select random number of media URLs
    const numMedia = Math.floor(Math.random() * 4); // 0-3 images
    const mediaUrls: string[] = [];
    for (let j = 0; j < numMedia; j++) {
      mediaUrls.push(sampleMediaUrls[Math.floor(Math.random() * sampleMediaUrls.length)]);
    }
    
    // Generate comments
    const numComments = Math.floor(Math.random() * 6); // 0-5 comments
    const comments: Comment[] = [];
    let commentDate = new Date(createdAtDate);
    commentDate.setHours(commentDate.getHours() + 2); // Start comments 2 hours after issue creation
    
    for (let j = 0; j < numComments; j++) {
      const commentUser = users[Math.floor(Math.random() * users.length)];
      commentDate.setHours(commentDate.getHours() + Math.floor(Math.random() * 12)); // 0-12 hours after previous
      
      comments.push({
        id: `comment_${i}_${j}`,
        userId: commentUser.id,
        userName: commentUser.displayName,
        text: [
          "Thanks for reporting this issue. We'll look into it soon.",
          "This is affecting many people in our area, needs immediate attention!",
          "I've been noticing this problem for weeks now.",
          "The situation is getting worse. Can we expedite this?",
          "Similar issue was resolved in the neighboring area last month.",
          "Happy to see this being addressed finally!",
          "Any updates on when this will be fixed?",
          "I'm facing the same issue near my residence.",
          "This is a critical infrastructure problem and needs priority.",
          "The department staff was very helpful when they came to inspect."
        ][Math.floor(Math.random() * 10)],
        timestamp: commentDate.toISOString(),
        userPhotoUrl: commentUser.photoURL
      });
    }
    
    // Generate status updates
    const updates: StatusUpdate[] = [];
    const possibleStatuses = ['pending', 'under_review', 'assigned', 'in_progress', 'resolved', 'rejected', 'closed'];
    const statusIndex = possibleStatuses.indexOf(status);
    
    let updateDate = new Date(createdAtDate);
    updateDate.setHours(updateDate.getHours() + 1); // Start updates 1 hour after creation
    
    // Always include the initial status
    updates.push({
      id: `update_${i}_0`,
      status: 'pending',
      text: 'Issue reported and logged into the system.',
      timestamp: createdAt
    });
    
    // Add intermediate status updates
    for (let j = 1; j <= statusIndex; j++) {
      updateDate.setHours(updateDate.getHours() + Math.floor(Math.random() * 24)); // 0-24 hours after previous
      
      const currentStatus = possibleStatuses[j];
      const statusUpdateTexts: Record<string, string[]> = {
        'under_review': [
          'Issue is being reviewed by department staff.',
          'Team has been notified and is evaluating the issue.',
          'Issue prioritization in progress.'
        ],
        'assigned': [
          'Issue has been assigned to field staff.',
          'Work order has been generated and assigned to the team.',
          'Technician has been scheduled for inspection.'
        ],
        'in_progress': [
          'Work has begun to address the issue.',
          'Repair team is on site and working on the problem.',
          'Maintenance work is in progress.'
        ],
        'resolved': [
          'The issue has been successfully resolved.',
          'Repairs have been completed and issue is fixed.',
          'All required work has been done to address this issue.'
        ],
        'rejected': [
          'Issue cannot be addressed due to jurisdiction limitations.',
          'This matter falls outside the scope of municipal services.',
          'After review, this was determined not to be a public works issue.'
        ],
        'closed': [
          'Issue has been closed after resolution.',
          'Final inspection completed and case closed.',
          'Work verified and issue has been finalized.'
        ]
      };
      
      const possibleTexts = statusUpdateTexts[currentStatus] || ['Status updated'];
      const text = possibleTexts[Math.floor(Math.random() * possibleTexts.length)];
      
      updates.push({
        id: `update_${i}_${j}`,
        status: currentStatus as any,
        text,
        timestamp: updateDate.toISOString()
      });
    }
    
    // Determine department and assignment if appropriate
    let department = undefined;
    let assignedTo = undefined;
    
    if (['assigned', 'in_progress', 'resolved', 'closed'].includes(status)) {
      const matchingDept = departments.find(d => d.categories.includes(randomCategory.name));
      if (matchingDept) {
        department = {
          id: matchingDept.id,
          name: matchingDept.name
        };
        
        // Find staff from this department
        const staffUser = users.find(u => u.departmentId === matchingDept.id);
        if (staffUser) {
          assignedTo = {
            uid: staffUser.id,
            displayName: staffUser.displayName
          };
        }
      }
    }
    
    // Create the issue
    const issue: Issue = {
      id: `issue_${i}`,
      title: [
        `${randomSubCategory || randomCategory.name} issue near ${randomLocation.name}`,
        `Urgent ${randomSubCategory || randomCategory.name} problem requiring attention`,
        `${randomSubCategory || randomCategory.name} maintenance needed in ${randomLocation.district}`,
        `Report: Damaged ${randomSubCategory || randomCategory.name} in ${randomLocation.name}`,
        `${randomLocation.district}: ${randomSubCategory || randomCategory.name} service request`
      ][Math.floor(Math.random() * 5)],
      description: [
        `There is a significant issue with the ${randomSubCategory || randomCategory.name} in our area that needs immediate attention. It's causing problems for many residents and poses a safety hazard.`,
        `I would like to report a problem with the ${randomSubCategory || randomCategory.name} near ${randomLocation.name}. It has been in this condition for several weeks and is affecting daily activities.`,
        `This ${randomSubCategory || randomCategory.name} has been damaged and requires repair. It's creating difficulties for local residents, especially the elderly and children.`,
        `We're experiencing regular problems with the ${randomSubCategory || randomCategory.name} in our neighborhood. This is an ongoing issue that worsens during rainy season.`,
        `The ${randomSubCategory || randomCategory.name} in ${randomLocation.name} area is in poor condition and needs maintenance. It's affecting access to essential services for the community.`
      ][Math.floor(Math.random() * 5)],
      department: department?.id || 'municipal', // Changed from category to department
      subCategory: randomSubCategory,
      status,
      createdAt,
      updatedAt,
      location: {
        address: `Near ${randomLocation.name}, ${randomLocation.district}`,
        latitude: randomCoords.latitude,
        longitude: randomCoords.longitude,
        district: randomLocation.district
      },
      createdBy: {
        uid: randomUser.id,
        displayName: randomUser.displayName,
        photoURL: randomUser.photoURL
      },
      mediaUrls,
      upvotes: Math.floor(Math.random() * 50),
      upvotedBy: [], // Will populate this later
      comments,
      updates,
      assignedTo,
      departmentInfo: department // Renamed from department to departmentInfo
    };
    
    // Add random upvoters
    const upvoteCount = issue.upvotes;
    const upvoters = new Set<string>();
    while (upvoters.size < upvoteCount && upvoters.size < users.length) {
      upvoters.add(users[Math.floor(Math.random() * users.length)].id);
    }
    issue.upvotedBy = Array.from(upvoters);
    
    issues.push(issue);
  }
  
  // Generate notifications
  const notifications: Notification[] = [];
  
  users.forEach((user) => {
    // Each user gets 3-7 notifications
    const userNotificationCount = Math.floor(Math.random() * 5) + 3;
    
    for (let i = 0; i < userNotificationCount; i++) {
      const relatedIssue = Math.random() < 0.8 ? 
        issues[Math.floor(Math.random() * issues.length)] : null;
      
      const notificationType = ['issue_update', 'comment', 'assignment', 'system'][Math.floor(Math.random() * 4)] as
        'issue_update' | 'comment' | 'assignment' | 'system';
      
      let title = '';
      let body = '';
      
      switch (notificationType) {
        case 'issue_update':
          title = `Update on ${relatedIssue?.department} issue`; // Changed from category to department
          body = `The status has changed to ${relatedIssue?.status.replace('_', ' ')}.`;
          break;
        case 'comment':
          title = 'New comment on your issue';
          body = `Someone commented on your ${relatedIssue?.department} issue`; // Changed from category to department
          break;
        case 'assignment':
          title = 'Issue assigned';
          body = `Your issue has been assigned to ${departments[Math.floor(Math.random() * departments.length)].name}.`;
          break;
        case 'system':
          title = 'Parivartan System Notification';
          body = [
            'Thank you for being an active citizen!',
            'Your profile has been verified successfully.',
            'New feature: You can now share issues on social media.',
            'Please update your app to the latest version.'
          ][Math.floor(Math.random() * 4)];
          break;
      }
      
      const notificationDate = new Date();
      notificationDate.setDate(notificationDate.getDate() - Math.floor(Math.random() * 10));
      
      notifications.push({
        id: `notification_${user.id}_${i}`,
        userId: user.id,
        title,
        body,
        read: Math.random() > 0.6, // 40% chance of being unread
        type: notificationType,
        issueId: relatedIssue?.id,
        createdAt: notificationDate.toISOString()
      });
    }
  });
  
  return {
    users,
    issues,
    departments,
    categories,
    notifications
  };
};

export type MockData = ReturnType<typeof generateMockData>;