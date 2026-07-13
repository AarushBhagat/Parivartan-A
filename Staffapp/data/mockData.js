export const mockUsers = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@pwd.gov.in',
    role: 'field-staff',
    staffId: 'PWD-2024-001',
    department: 'pwd',
    contact: '+91 98765 43210'
  },
  {
    id: '2',
    name: 'Priya Singh',
    email: 'priya.singh@water.gov.in',
    role: 'field-staff',
    staffId: 'WSD-2024-002',
    department: 'water-sanitation',
    contact: '+91 98765 43211'
  },
  {
    id: '3',
    name: 'Amarjeet Kaur',
    email: 'amarjeet.kaur@pspcl.gov.in',
    role: 'field-staff',
    staffId: 'PSPCL-2024-003',
    department: 'pspcl',
    contact: '+91 98765 43212'
  },
  {
    id: '4',
    name: 'Sukhwinder Sharma',
    email: 'sukhwinder@traffic.gov.in',
    role: 'field-staff',
    staffId: 'TP-2024-004',
    department: 'traffic-police',
    contact: '+91 98765 43213'
  }
];

export const mockIssues = [
  {
    id: 'ISS-2024-101',
    title: 'Large pothole on Main Road',
    description: 'There is a large pothole near the intersection of Main Road and Civil Lines. It\'s causing damage to vehicles and is a safety hazard.',
    category: 'pwd',
    status: 'in-progress',
    priority: 'high',
    location: {
      address: 'Main Road, Civil Lines, Kapurthala',
      lat: 31.3800,
      lng: 75.3800
    },
    reporter: {
      name: 'Harpreet Singh',
      contact: '+91 98765 11111'
    },
    photos: ['https://images.unsplash.com/photo-1625037672548-70ea2e1098e1?w=800'],
    assignedTo: '1',
    createdAt: new Date('2025-10-29T08:30:00'),
    updatedAt: new Date('2025-10-30T14:20:00'),
    comments: [
      {
        id: 'c1',
        text: 'Started working on this issue. Will complete by end of day.',
        author: 'Rajesh Kumar',
        timestamp: new Date('2025-10-30T14:20:00')
      }
    ],
    upvotes: 24
  },
  {
    id: 'ISS-2024-102',
    title: 'Water leak at Model Town',
    description: 'Water is leaking from underground pipe creating flooding on the road.',
    category: 'water-sanitation',
    status: 'pending',
    priority: 'high',
    location: {
      address: 'Model Town, Phase 2, Kapurthala',
      lat: 31.3850,
      lng: 75.3850
    },
    reporter: {
      name: 'Gurpreet Kaur',
      contact: '+91 98765 22222'
    },
    photos: ['https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800'],
    assignedTo: '2',
    createdAt: new Date('2025-10-31T07:15:00'),
    updatedAt: new Date('2025-10-31T07:15:00'),
    comments: [],
    upvotes: 18
  },
  {
    id: 'ISS-2024-103',
    title: 'Street light not working',
    description: 'The street light near Bus Stand has not been working for the past week.',
    category: 'municipal-corporation',
    status: 'acknowledged',
    priority: 'medium',
    location: {
      address: 'Bus Stand Road, Kapurthala',
      lat: 31.3780,
      lng: 75.3820
    },
    reporter: {
      name: 'Jaswinder Singh',
      contact: '+91 98765 33333'
    },
    photos: ['https://images.unsplash.com/photo-1478358161113-b0e11994a36b?w=800'],
    createdAt: new Date('2025-10-28T18:45:00'),
    updatedAt: new Date('2025-10-29T09:00:00'),
    comments: [],
    upvotes: 8
  },
  {
    id: 'ISS-2024-104',
    title: 'Power outage in residential area',
    description: 'Several houses on Sultanpur Road experiencing power outage since morning.',
    category: 'pspcl',
    status: 'pending',
    priority: 'high',
    location: {
      address: 'Sultanpur Road, Block C, Kapurthala',
      lat: 31.3900,
      lng: 75.3900
    },
    reporter: {
      name: 'Manpreet Kaur',
      contact: '+91 98765 44444'
    },
    photos: [],
    assignedTo: '3',
    createdAt: new Date('2025-10-31T06:00:00'),
    updatedAt: new Date('2025-10-31T06:00:00'),
    comments: [],
    upvotes: 32
  },
  {
    id: 'ISS-2024-105',
    title: 'Traffic signal malfunction',
    description: 'Traffic lights at Railway Crossing are not functioning properly, causing traffic congestion.',
    category: 'traffic-police',
    status: 'in-progress',
    priority: 'high',
    location: {
      address: 'Railway Crossing, GT Road, Kapurthala',
      lat: 31.3820,
      lng: 75.3760
    },
    reporter: {
      name: 'Kulwinder Singh',
      contact: '+91 98765 55555'
    },
    photos: ['https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800'],
    assignedTo: '4',
    createdAt: new Date('2025-10-30T10:30:00'),
    updatedAt: new Date('2025-10-31T08:15:00'),
    comments: [
      {
        id: 'c2',
        text: 'Inspection done. Replacement parts ordered.',
        author: 'Sukhwinder Sharma',
        timestamp: new Date('2025-10-31T08:15:00')
      }
    ],
    upvotes: 45
  },
  {
    id: 'ISS-2024-106',
    title: 'Broken footpath near School',
    description: 'Footpath is damaged and creating difficulty for students and pedestrians.',
    category: 'pwd',
    status: 'resolved',
    priority: 'medium',
    location: {
      address: 'Near Government School, Jalandhar Road, Kapurthala',
      lat: 31.3750,
      lng: 75.3870
    },
    reporter: {
      name: 'Simran Kaur',
      contact: '+91 98765 66666'
    },
    photos: ['https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800'],
    assignedTo: '1',
    createdAt: new Date('2025-10-22T14:30:00'),
    updatedAt: new Date('2025-10-24T16:45:00'),
    comments: [
      {
        id: 'c3',
        text: 'Footpath repaired and made accessible.',
        author: 'Rajesh Kumar',
        timestamp: new Date('2025-10-24T16:45:00')
      }
    ],
    upvotes: 12,
    resolvedPhotos: ['https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800'],
    completionDate: new Date('2025-10-24T16:45:00')
  },
  {
    id: 'ISS-2024-107',
    title: 'Drainage blockage',
    description: 'Drainage system is blocked causing water accumulation during rain.',
    category: 'water-sanitation',
    status: 'resolved',
    priority: 'high',
    location: {
      address: 'Green Avenue, Kapurthala',
      lat: 31.3790,
      lng: 75.3810
    },
    reporter: {
      name: 'Balwinder Singh',
      contact: '+91 98765 77777'
    },
    photos: ['https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800'],
    assignedTo: '2',
    createdAt: new Date('2025-10-20T11:00:00'),
    updatedAt: new Date('2025-10-23T15:30:00'),
    comments: [
      {
        id: 'c4',
        text: 'Drainage cleaned and blockage removed.',
        author: 'Priya Singh',
        timestamp: new Date('2025-10-23T15:30:00')
      }
    ],
    upvotes: 28,
    resolvedPhotos: ['https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800'],
    completionDate: new Date('2025-10-23T15:30:00')
  },
  {
    id: 'ISS-2024-108',
    title: 'Road construction debris',
    description: 'Construction debris left on the road causing obstruction to traffic.',
    category: 'pwd',
    status: 'acknowledged',
    priority: 'medium',
    location: {
      address: 'Phagwara Road, Kapurthala',
      lat: 31.3770,
      lng: 75.3890
    },
    reporter: {
      name: 'Navdeep Kaur',
      contact: '+91 98765 88888'
    },
    photos: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800'],
    assignedTo: '1',
    createdAt: new Date('2025-10-31T09:00:00'),
    updatedAt: new Date('2025-10-31T10:30:00'),
    comments: [],
    upvotes: 15
  }
];

export const mockNotifications = [
  {
    id: 'n1',
    type: 'assignment',
    title: 'New Issue Assigned',
    message: 'Road construction debris issue has been assigned to you',
    issueId: 'ISS-2024-108',
    timestamp: new Date('2025-10-31T09:05:00'),
    read: false
  },
  {
    id: 'n2',
    type: 'deadline',
    title: 'Deadline Reminder',
    message: 'Large pothole on Main Road - Due today',
    issueId: 'ISS-2024-101',
    timestamp: new Date('2025-10-31T06:00:00'),
    read: false
  },
  {
    id: 'n3',
    type: 'comment',
    title: 'New Comment',
    message: 'Citizen commented on pothole issue',
    issueId: 'ISS-2024-101',
    timestamp: new Date('2025-10-30T16:30:00'),
    read: true
  }
];
