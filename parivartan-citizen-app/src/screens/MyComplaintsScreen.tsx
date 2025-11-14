import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../firebase';
import { issueService } from '../services'; // Import from index to use the correct service (real or mock)
import { useAuth } from '../contexts/AuthContext';

interface MyComplaintsScreenProps {
  navigation: any;
}

interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
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
  mediaUrls?: string[];
  upvotes: number;
  createdBy: {
    uid: string;
    displayName: string;
    photoURL?: string;
  };
}

const MyComplaintsScreen: React.FC<MyComplaintsScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  
  // State
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load complaints from backend
  const loadComplaints = async () => {
    try {
      setIsLoading(true);
      
      if (!user) {
        setComplaints([]);
        setFilteredComplaints([]);
        return;
      }
      
      const response = await issueService.getMyIssues();
      const myIssues = response.issues || response || [];
      
      setComplaints(myIssues);
      setFilteredComplaints(myIssues);
      
    } catch (error) {
      console.error('Error loading my complaints:', error);
      Alert.alert('Error', 'Failed to load your complaints. Please try again.');
      setComplaints([]);
      setFilteredComplaints([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load complaints on component mount and when user changes
  useEffect(() => {
    loadComplaints();
  }, [user]);

  // Add focus listener to refresh data when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadComplaints();
    });

    return unsubscribe;
  }, [navigation, user]);

  // Filtering logic
  useEffect(() => {
    let result = [...complaints];

    // Apply search query filter
    if (searchQuery) {
      result = result.filter(complaint => 
        complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        complaint.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (complaint.location.address && complaint.location.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
        complaint.location.district.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (filter) {
      result = result.filter(complaint => complaint.status === filter);
    }

    setFilteredComplaints(result);
  }, [complaints, searchQuery, filter]);

  // Refresh complaints
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadComplaints();
    } catch (error) {
      console.error('Error refreshing complaints:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Navigate to complaint details
  const handleComplaintPress = (complaint: Complaint) => {
    navigation.navigate('IssueDetail', { issueId: complaint.id });
  };

  // Status badge style and text
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          color: '#f59e0b', // amber-500
          backgroundColor: '#fef3c7', // amber-100
          text: 'Pending'
        };
      case 'under_review':
        return {
          color: '#f59e0b', // amber-500
          backgroundColor: '#fef3c7', // amber-100
          text: 'Under Review'
        };
      case 'assigned':
        return {
          color: '#8b5cf6', // violet-500
          backgroundColor: '#ede9fe', // violet-100
          text: 'Assigned'
        };
      case 'in_progress':
        return {
          color: '#3b82f6', // blue-500
          backgroundColor: '#dbeafe', // blue-100
          text: 'In Progress'
        };
      case 'resolved':
        return {
          color: '#10b981', // emerald-500
          backgroundColor: '#d1fae5', // emerald-100
          text: 'Resolved'
        };
      case 'rejected':
        return {
          color: '#ef4444', // red-500
          backgroundColor: '#fee2e2', // red-100
          text: 'Rejected'
        };
      case 'closed':
        return {
          color: '#6b7280', // gray-500
          backgroundColor: '#f3f4f6', // gray-100
          text: 'Closed'
        };
      default:
        return {
          color: '#6b7280', // gray-500
          backgroundColor: '#f3f4f6', // gray-100
          text: 'Unknown'
        };
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Render complaint item
  const renderComplaintItem = ({ item }: { item: Complaint }) => {
    const statusInfo = getStatusInfo(item.status);
    
    return (
      <TouchableOpacity
        style={styles.complaintCard}
        onPress={() => handleComplaintPress(item)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.backgroundColor }]}>
            <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.text}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.cardDescription} numberOfLines={2}>{item.description}</Text>
          
          {item.mediaUrls && item.mediaUrls.length > 0 && (
            <Image 
              source={{ uri: item.mediaUrls[0] }} 
              style={styles.cardImage} 
              resizeMode="cover"
            />
          )}
          
          <View style={styles.cardFooter}>
            <View style={styles.cardDetail}>
              <Ionicons name="calendar-outline" size={14} color="#64748b" />
              <Text style={styles.cardDetailText}>{formatDate(item.createdAt)}</Text>
            </View>
            
            <View style={styles.cardDetail}>
              <Ionicons name="location-outline" size={14} color="#64748b" />
              <Text style={styles.cardDetailText} numberOfLines={1}>
                {item.location.address || item.location.district}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Filter options
  const filterOptions = [
    { id: null, label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'under_review', label: 'Under Review' },
    { id: 'assigned', label: 'Assigned' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'resolved', label: 'Resolved' },
    { id: 'rejected', label: 'Rejected' },
    { id: 'closed', label: 'Closed' }
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#14b8a6', '#0d9488']} // teal-500 to teal-600
        style={styles.header}
      >
        <Text style={styles.headerTitle}>My Complaints</Text>
        <Text style={styles.headerSubtitle}>
          Track and manage your reported issues
        </Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search your complaints..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94a3b8"
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#64748b" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Filter Tabs */}
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filterOptions}
          keyExtractor={item => item.id || 'all'}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterButton,
                filter === item.id && styles.activeFilterButton
              ]}
              onPress={() => setFilter(item.id)}
            >
              <Text style={[
                styles.filterButtonText,
                filter === item.id && styles.activeFilterButtonText
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.filtersScrollView}
        />
      </View>

      {/* Complaints List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0d9488" />
          <Text style={styles.loadingText}>Loading your complaints...</Text>
        </View>
      ) : filteredComplaints.length > 0 ? (
        <FlatList
          data={filteredComplaints}
          keyExtractor={item => item.id}
          renderItem={renderComplaintItem}
          contentContainerStyle={styles.complaintsListContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#0d9488"
              colors={['#0d9488']}
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color="#cbd5e1" />
          <Text style={styles.emptyTitle}>No complaints found</Text>
          <Text style={styles.emptyMessage}>
            {searchQuery || filter
              ? "No complaints match your current filters. Try adjusting your search or filters."
              : "You haven't reported any issues yet. Report an issue to see it here."}
          </Text>
          
          {!searchQuery && !filter && (
            <TouchableOpacity
              style={styles.reportButton}
              onPress={() => navigation.navigate('Report')}
            >
              <Text style={styles.reportButtonText}>Report an Issue</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
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
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#334155', // slate-700
  },
  filtersContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0', // slate-200
    paddingVertical: 8,
  },
  filtersScrollView: {
    paddingHorizontal: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f1f5f9', // slate-100
  },
  activeFilterButton: {
    backgroundColor: '#0d9488', // teal-600
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b', // slate-500
  },
  activeFilterButtonText: {
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b', // slate-500
  },
  complaintsListContent: {
    padding: 16,
    paddingBottom: 40,
  },
  complaintCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9', // slate-100
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155', // slate-700
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  cardBody: {
    padding: 16,
  },
  cardDescription: {
    fontSize: 14,
    color: '#64748b', // slate-500
    marginBottom: 12,
  },
  cardImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardDetailText: {
    fontSize: 12,
    color: '#64748b', // slate-500
    marginLeft: 4,
    maxWidth: 150,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#334155', // slate-700
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
    color: '#64748b', // slate-500
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  reportButton: {
    backgroundColor: '#0d9488', // teal-600
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  reportButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  }
});

export default MyComplaintsScreen;