export type UserRole = 'field-staff';

export type IssueStatus = 'pending' | 'acknowledged' | 'in-progress' | 'resolved' | 'cannot-resolve';

export type IssuePriority = 'low' | 'medium' | 'high';

export type IssueCategory = 
  | 'pwd'
  | 'municipal-corporation'
  | 'traffic-police'
  | 'water-sanitation'
  | 'pspcl'
  | 'health-welfare'
  | 'civil-surgeon'
  | 'punjab-police'
  | 'education'
  | 'agriculture'
  | 'food-civil-supplies'
  | 'punjab-roadways'
  | 'rto'
  | 'revenue'
  | 'social-security'
  | 'pollution-control'
  | 'forest'
  | 'disaster-management';

export const DEPARTMENTS: Record<IssueCategory, string> = {
  'pwd': 'Public Works Department (PWD)',
  'municipal-corporation': 'Municipal Corporation / Nagar Council / Nagar Panchayat',
  'traffic-police': 'Traffic Police',
  'water-sanitation': 'Water Supply & Sanitation Department',
  'pspcl': 'Punjab State Power Corporation Limited (PSPCL)',
  'health-welfare': 'Health & Family Welfare Department',
  'civil-surgeon': 'Civil Surgeon\'s Office',
  'punjab-police': 'Punjab Police (SSP, Kapurthala)',
  'education': 'District Education Officer (DEO) – School Education Department',
  'agriculture': 'Agriculture & Farmers\' Welfare Department',
  'food-civil-supplies': 'Food & Civil Supplies Department',
  'punjab-roadways': 'Punjab Roadways / PRTC',
  'rto': 'Regional Transport Office (RTO)',
  'revenue': 'Revenue Department (under Deputy Commissioner)',
  'social-security': 'Social Security & Women & Child Development',
  'pollution-control': 'Punjab Pollution Control Board (PPCB)',
  'forest': 'Forest Department',
  'disaster-management': 'District Disaster Management Authority (DDMA)'
};

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  staffId: string;
  department: IssueCategory;
  contact: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  status: IssueStatus;
  priority: IssuePriority;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  reporter: {
    name: string;
    contact: string;
  };
  photos: string[];
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  comments: Comment[];
  upvotes: number;
  resolvedPhotos?: string[];
  completionDate?: Date;
}

export interface Comment {
  id: string;
  text: string;
  author: string;
  timestamp: Date;
}

export interface Notification {
  id: string;
  type: 'assignment' | 'deadline' | 'comment';
  title: string;
  message: string;
  issueId?: string;
  timestamp: Date;
  read: boolean;
}
