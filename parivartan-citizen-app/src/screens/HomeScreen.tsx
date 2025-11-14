import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  FlatList,
  Dimensions,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../firebase';
import { issueService } from '../services';
import { useAuth } from '../contexts/AuthContext';

interface HomeScreenProps {
  navigation: any;
}

interface Issue {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'under_review' | 'assigned' | 'in_progress' | 'resolved' | 'rejected' | 'closed';
  location: {
    address?: string;
    latitude: number;
    longitude: number;
    district: string;
  };
  category: string;
  subCategory?: string;
  createdAt: string;
  upvotes: number;
  mediaUrls?: string[];
  createdBy: {
    uid: string;
    displayName: string;
    photoURL?: string;
  };
}

const WINDOW_WIDTH = Dimensions.get('window').width;

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [urgentIssues, setUrgentIssues] = useState<Issue[]>([]);
  const [recentIssues, setRecentIssues] = useState<Issue[]>([]);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Update username whenever auth state changes
  const updateUserName = () => {
    // Get current user's name from Firebase Auth (most up-to-date)
    const user = auth.currentUser;
    if (user && user.displayName) {
      const names = user.displayName.split(' ');
      console.log('HomeScreen: Updating username to', names[0]);
      setUserName(names[0]);
    } else {
      console.log('HomeScreen: No display name found');
      setUserName('');
    }
  };
  
  useEffect(() => {
    // Initial load of username and data
    updateUserName();
    loadIssuesData();
    
    // Add a focus listener to refresh the username whenever the screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('HomeScreen focused, refreshing username and data');
      updateUserName();
      loadIssuesData();
    });

    return unsubscribe;
  }, [navigation]);

  const loadIssuesData = async () => {
    try {
      setLoading(true);
      
      // Fetch all issues from backend
      const allIssuesResponse = await issueService.getAllIssues();
      const allIssues = allIssuesResponse.issues || allIssuesResponse || [];
      
      // Sort issues by upvotes to get urgent issues (top upvoted)
      const sortedByUpvotes = [...allIssues].sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
      const urgentIssuesData = sortedByUpvotes.slice(0, 5); // Top 5 most upvoted
      
      // Sort issues by creation date to get recent issues
      const sortedByDate = [...allIssues].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      const recentIssuesData = sortedByDate.slice(0, 5); // 5 most recent
      
      setUrgentIssues(urgentIssuesData);
      setRecentIssues(recentIssuesData);
      
    } catch (error) {
      console.error('Error loading issues:', error);
      Alert.alert('Error', 'Failed to load issues. Please try again.');
      
      // Fallback to empty arrays
      setUrgentIssues([]);
      setRecentIssues([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadIssuesData();
      updateUserName();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending':
        return '#eab308'; // amber-500
      case 'under_review':
        return '#f59e0b'; // amber-500
      case 'assigned':
        return '#8b5cf6'; // violet-500
      case 'in_progress':
        return '#3b82f6'; // blue-500
      case 'resolved':
        return '#10b981'; // emerald-500
      case 'rejected':
        return '#ef4444'; // red-500
      case 'closed':
        return '#6b7280'; // gray-500
      default:
        return '#94a3b8'; // slate-400
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'pending':
        return 'Pending';
      case 'under_review':
        return 'Under Review';
      case 'assigned':
        return 'Assigned';
      case 'in_progress':
        return 'In Progress';
      case 'resolved':
        return 'Resolved';
      case 'rejected':
        return 'Rejected';
      case 'closed':
        return 'Closed';
      default:
        return status;
    }
  };

  const renderUrgentIssue = ({ item }: { item: Issue }) => (
    <TouchableOpacity 
      style={styles.urgentIssueCard}
      onPress={() => navigation.navigate('IssueDetail', { issueId: item.id })}
    >
      <View style={styles.urgentCardContent}>
        <View style={styles.urgentCardHeader}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
          <Text style={styles.upvotes}>
            <Ionicons name="arrow-up" size={14} color="#64748b" /> {item.upvotes}
          </Text>
        </View>
        <Text style={styles.urgentCardTitle}>{item.title}</Text>
        <Text style={styles.urgentCardLocation}>
          <Ionicons name="location" size={14} color="#64748b" /> {item.location.address || `${item.location.district}`}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderRecentIssue = ({ item }: { item: Issue }) => (
    <TouchableOpacity 
      style={styles.recentIssueCard}
      onPress={() => navigation.navigate('IssueDetail', { issueId: item.id })}
    >
      <View style={styles.recentIssueContent}>
        <View style={styles.recentIssueLeft}>
          <View style={[styles.categoryDot, { backgroundColor: getStatusColor(item.status) }]} />
          <View>
            <Text style={styles.recentIssueTitle}>{item.title}</Text>
            <Text style={styles.recentIssueLocation}>
              <Ionicons name="location-outline" size={12} color="#64748b" /> {item.location.address || `${item.location.district}`}
            </Text>
          </View>
        </View>
        <View style={styles.recentIssueRight}>
          <View style={styles.upvotesContainer}>
            <Ionicons name="arrow-up" size={12} color="#64748b" />
            <Text style={styles.recentIssueUpvotes}>{item.upvotes}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
        </View>
      </View>
    </TouchableOpacity>
  );

  const QuickAction = ({ icon, title, color, onPress }: { icon: any, title: string, color: string, onPress: () => void }) => (
    <TouchableOpacity style={styles.quickActionItem} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
        <Ionicons name={icon as any} size={24} color="white" />
      </View>
      <Text style={styles.quickActionTitle}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        {/* Header */}
        <LinearGradient
          colors={['#14b8a6', '#0d9488']} // teal-500 to teal-600
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.welcomeText}>Welcome{userName ? ', ' + userName : ''}!</Text>
              <Text style={styles.headerSubtitle}>Report and track community issues</Text>
            </View>
            
            <TouchableOpacity 
              onPress={() => navigation.navigate('Profile')}
              style={styles.profileButton}
            >
              {auth.currentUser?.photoURL ? (
                <Image 
                  key={`profile-${userName}`}
                  source={{ uri: auth.currentUser.photoURL }} 
                  style={styles.profileImage} 
                />
              ) : (
                <View style={styles.profileImageFallback} key={`profile-${userName}`}>
                  <Text style={styles.profileImageText}>
                    {userName ? userName[0].toUpperCase() : 'U'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <QuickAction
            icon="add-circle"
            title="Report"
            color="#0d9488" // teal-600
            onPress={() => navigation.navigate('Report')}
          />
          <QuickAction
            icon="map"
            title="Map View"
            color="#3b82f6" // blue-500
            onPress={() => navigation.navigate('Map')}
          />
          <QuickAction
            icon="list"
            title="My Issues"
            color="#8b5cf6" // violet-500
            onPress={() => navigation.navigate('MyComplaints')}
          />
          <QuickAction
            icon="people"
            title="Community"
            color="#f59e0b" // amber-500
            onPress={() => navigation.navigate('Community')}
          />
        </View>

        {/* Urgent Issues */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Urgent Issues</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Map', { filter: 'urgent' })}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <View>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.urgentIssuesContainer}
              data={urgentIssues}
              renderItem={renderUrgentIssue}
              keyExtractor={item => item.id}
            />
          </View>
        </View>

          {/* Recent Issues */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Reports</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Community')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <View>
            {recentIssues.map(issue => (
              <View key={issue.id}>
                {renderRecentIssue({ item: issue })}
              </View>
            ))}
          </View>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsContainer}>
          <View style={styles.tipCard}>
            <View style={styles.tipIconContainer}>
              <Ionicons name="bulb" size={24} color="#0d9488" />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Report Issues Faster</Text>
              <Text style={styles.tipText}>
                Enable location access to automatically detect your location when reporting issues.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc', // slate-50
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
  },
  profileImageFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0891b2', // cyan-600
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  profileImageText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9', // slate-100
  },
  quickActionItem: {
    alignItems: 'center',
    width: (WINDOW_WIDTH - 32) / 4, // Divide space evenly
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#334155', // slate-700
  },
  sectionContainer: {
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b', // slate-800
  },
  seeAllText: {
    fontSize: 14,
    color: '#0d9488', // teal-600
    fontWeight: '500',
  },
  urgentIssuesContainer: {
    paddingRight: 16,
  },
  urgentIssueCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginRight: 12,
    width: 230,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  urgentCardContent: {
    padding: 16,
  },
  urgentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  upvotes: {
    fontSize: 14,
    color: '#64748b', // slate-500
    fontWeight: '500',
  },
  urgentCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b', // slate-800
    marginBottom: 8,
  },
  urgentCardLocation: {
    fontSize: 14,
    color: '#64748b', // slate-500
  },
  recentIssueCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  recentIssueContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  recentIssueLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  recentIssueTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b', // slate-800
    marginBottom: 4,
  },
  recentIssueLocation: {
    fontSize: 12,
    color: '#64748b', // slate-500
  },
  recentIssueRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upvotesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  recentIssueUpvotes: {
    fontSize: 14,
    color: '#64748b', // slate-500
    marginLeft: 4,
  },
  tipsContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
  tipCard: {
    backgroundColor: '#ecfeff', // cyan-50
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0e7490', // cyan-700
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: '#164e63', // cyan-800
  },
});

export default HomeScreen;