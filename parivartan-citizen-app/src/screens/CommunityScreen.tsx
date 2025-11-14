import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';

interface CommunityScreenProps {
  navigation: any;
}

interface Issue {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'resolved';
  location: string;
  category: string;
  date: string;
  upvotes: number;
  user: {
    name: string;
    avatar?: string;
  };
}

const CommunityScreen: React.FC<CommunityScreenProps> = ({ navigation }) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // Filters
  const filters = [
    { id: 'all', name: 'All' },
    { id: 'pending', name: 'Pending' },
    { id: 'in-progress', name: 'In Progress' },
    { id: 'resolved', name: 'Resolved' },
    { id: 'infrastructure', name: 'Infrastructure' },
    { id: 'roads', name: 'Roads' },
    { id: 'parks', name: 'Parks' },
    { id: 'sanitation', name: 'Sanitation' },
  ];

  // Load issues data
  useEffect(() => {
    loadIssues();
  }, []);

  // Apply filters when filter changes or search query changes
  useEffect(() => {
    applyFilters();
  }, [activeFilter, searchQuery, issues]);

  const loadIssues = async () => {
    try {
      setLoading(true);
      
      // Fetch all grievances from Firebase
      const grievancesRef = collection(db, 'grievances');
      const snapshot = await getDocs(grievancesRef);
      
      const issuesData: Issue[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        issuesData.push({
          id: doc.id,
          title: data.title || 'Untitled',
          description: data.description || 'No description',
          status: data.status || 'pending',
          location: data.location?.address || data.location?.district || 'Unknown',
          category: (data.category || data.department || 'General').toLowerCase(),
          date: data.createdAt || new Date().toISOString(),
          upvotes: data.upvotes || 0,
          user: {
            name: data.createdBy?.displayName || data.citizenName || 'Anonymous User',
            avatar: data.createdBy?.photoURL
          },
        });
      });

      // Sort by upvotes (highest first)
      issuesData.sort((a, b) => b.upvotes - a.upvotes);
      
      console.log(`Loaded ${issuesData.length} issues for community display from Firebase`);
      setIssues(issuesData);
      
    } catch (error) {
      console.error('Error loading issues from Firebase:', error);
      Alert.alert('Error', 'Failed to load issues. Please try again.');
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadIssues();
    setRefreshing(false);
  };

  const applyFilters = () => {
    let filtered = [...issues];
    
    // Apply category/status filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(
        issue => issue.status === activeFilter || issue.category === activeFilter
      );
    }
    
    // Apply search
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        issue => 
          issue.title.toLowerCase().includes(query) || 
          issue.description.toLowerCase().includes(query) || 
          issue.location.toLowerCase().includes(query)
      );
    }
    
    setFilteredIssues(filtered);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending':
        return '#eab308'; // amber-500
      case 'in-progress':
        return '#3b82f6'; // blue-500
      case 'resolved':
        return '#10b981'; // emerald-500
      default:
        return '#94a3b8'; // slate-400
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'pending':
        return 'Pending';
      case 'in-progress':
        return 'In Progress';
      case 'resolved':
        return 'Resolved';
      default:
        return status;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle issue upvote
  const handleUpvote = async (issueId: string) => {
    try {
      // Update the upvote count directly in Firebase
      const issueRef = doc(db, 'grievances', issueId);
      await updateDoc(issueRef, {
        upvotes: increment(1)
      });
      
      // Refresh the issues to show updated upvotes
      await loadIssues();
    } catch (error) {
      console.error('Error upvoting issue:', error);
      Alert.alert('Error', 'Failed to upvote issue. Please try again.');
    }
  };

  // Render issue item
  const renderIssueItem = ({ item }: { item: Issue }) => (
    <TouchableOpacity 
      style={styles.issueCard}
      onPress={() => navigation.navigate('IssueDetail', { issueId: item.id })}
    >
      <View style={styles.issueCardHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {getInitials(item.user.name)}
            </Text>
          </View>
          <Text style={styles.userName}>{item.user.name}</Text>
        </View>
        <Text style={styles.issueDate}>{formatDate(item.date)}</Text>
      </View>

      <Text style={styles.issueTitle}>{item.title}</Text>
      
      <Text numberOfLines={2} style={styles.issueDescription}>
        {item.description}
      </Text>
      
      <View style={styles.issueFooter}>
        <View style={styles.issueLocation}>
          <Ionicons name="location" size={14} color="#64748b" />
          <Text style={styles.locationText}>{item.location}</Text>
        </View>
        
        <View style={styles.issueStats}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.upvotesContainer}
            onPress={() => handleUpvote(item.id)}
          >
            <Ionicons name="arrow-up" size={14} color="#64748b" />
            <Text style={styles.upvotesText}>{item.upvotes}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render the filter chip
  const renderFilterChip = ({ item }: { item: { id: string, name: string } }) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        activeFilter === item.id && styles.activeFilterChip,
      ]}
      onPress={() => setActiveFilter(item.id)}
    >
      <Text 
        style={[
          styles.filterChipText,
          activeFilter === item.id && styles.activeFilterChipText,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#14b8a6', '#0d9488']} // teal-500 to teal-600
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Community Issues</Text>
        <Text style={styles.headerSubtitle}>
          View and track issues reported in your community
        </Text>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search issues..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>
        
        <TouchableOpacity 
          style={styles.mapButton}
          onPress={() => navigation.navigate('Map')}
        >
          <Ionicons name="map" size={22} color="white" />
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          data={filters}
          renderItem={renderFilterChip}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersList}
        />
      </View>

      {/* Issues List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0d9488" />
          <Text style={styles.loadingText}>Loading issues...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredIssues}
          renderItem={renderIssueItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.issuesList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#0d9488']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="alert-circle-outline" size={48} color="#94a3b8" />
              <Text style={styles.emptyText}>No issues found</Text>
              <Text style={styles.emptySubtext}>
                Try changing your search or filters
              </Text>
            </View>
          }
        />
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
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
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
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9', // slate-100
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#334155', // slate-700
  },
  mapButton: {
    backgroundColor: '#0d9488', // teal-600
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9', // slate-100
  },
  filtersList: {
    paddingHorizontal: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9', // slate-100
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: '#0d9488', // teal-600
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155', // slate-700
  },
  activeFilterChipText: {
    color: 'white',
  },
  issuesList: {
    padding: 16,
    paddingBottom: 40,
  },
  issueCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  issueCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0891b2', // cyan-600
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  userName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155', // slate-700
  },
  issueDate: {
    fontSize: 12,
    color: '#64748b', // slate-500
  },
  issueTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b', // slate-800
    marginBottom: 8,
  },
  issueDescription: {
    fontSize: 14,
    color: '#334155', // slate-700
    marginBottom: 16,
  },
  issueFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  issueLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    fontSize: 12,
    color: '#64748b', // slate-500
    marginLeft: 4,
    flex: 1,
  },
  issueStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  upvotesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upvotesText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#64748b', // slate-500
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#334155', // slate-700
  },
  emptyContainer: {
    marginTop: 60,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#334155', // slate-700
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748b', // slate-500
    textAlign: 'center',
  },
});

export default CommunityScreen;