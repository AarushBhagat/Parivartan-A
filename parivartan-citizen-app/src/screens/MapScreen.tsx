import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Platform,
  FlatList,
  Alert,
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { collection, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';

interface MapScreenProps {
  navigation: any;
  route: any;
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
  latitude: number;
  longitude: number;
}

const WINDOW_WIDTH = Dimensions.get('window').width;
const WINDOW_HEIGHT = Dimensions.get('window').height;

const MapScreen: React.FC<MapScreenProps> = ({ navigation, route }) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [region, setRegion] = useState({
    latitude: 31.330000,  // Jalandhar coordinates
    longitude: 75.584400, // Jalandhar coordinates
    latitudeDelta: 0.0522, // Smaller delta for better zoom level
    longitudeDelta: 0.0321, // Smaller delta for better zoom level
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: [] as string[],
    category: [] as string[],
    urgency: false,
  });

  // Load data and get user location
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get the user's location
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          await loadIssuesData();
          setIsLoading(false);
          return;
        }
        
        const location = await Location.getCurrentPositionAsync({});
        console.log(`Got user location: ${location.coords.latitude}, ${location.coords.longitude}`);
        
        // Default to Jalandhar coordinates if location service fails or is inaccurate
        const newRegion = {
          latitude: location.coords.latitude || 31.330000,
          longitude: location.coords.longitude || 75.584400,
          latitudeDelta: 0.0522,
          longitudeDelta: 0.0321,
        };
        
        setRegion(newRegion);
        
        await loadIssuesData();
      } catch (error) {
        console.error('Error getting location:', error);
        await loadIssuesData();
        setIsLoading(false);
      }
    };
    
    loadData();
    
    // Apply filter from route params if any
    if (route.params?.filter === 'urgent') {
      setFilters(prev => ({...prev, urgency: true}));
    }
  }, [route.params]);

  // Update filtered issues when filters or issues change
  useEffect(() => {
    filterIssues();
  }, [filters, issues]);

  // Load issues directly from Firebase
  const loadIssuesData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all grievances from Firebase
      const grievancesRef = collection(db, 'grievances');
      const snapshot = await getDocs(grievancesRef);
      
      const issuesData: Issue[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        // Only include issues that have location coordinates
        if (data.location && (data.location.latitude || data.location.coordinates?.latitude)) {
          const lat = data.location.latitude || data.location.coordinates?.latitude;
          const lng = data.location.longitude || data.location.coordinates?.longitude;
          
          if (lat && lng) {
            issuesData.push({
              id: doc.id,
              title: data.title || 'Untitled',
              description: data.description || 'No description',
              status: data.status || 'pending',
              location: data.location.address || data.location.district || 'Unknown',
              category: data.category || data.department || 'General',
              date: data.createdAt || new Date().toISOString(),
              upvotes: data.upvotes || 0,
              latitude: lat,
              longitude: lng,
            });
          }
        }
      });
      
      console.log(`Loaded ${issuesData.length} issues with valid coordinates from Firebase`);
      setIssues(issuesData);
      
    } catch (error) {
      console.error('Error loading issues from Firebase:', error);
      Alert.alert('Error', 'Failed to load issues. Please check your internet connection.');
      setIssues([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter issues based on selected filters
  const filterIssues = () => {
    let filtered = [...issues];
    
    // Filter by status
    if (filters.status.length > 0) {
      filtered = filtered.filter(issue => filters.status.includes(issue.status));
    }
    
    // Filter by category
    if (filters.category.length > 0) {
      filtered = filtered.filter(issue => filters.category.includes(issue.category));
    }
    
    // Filter by urgency (upvotes > 10)
    if (filters.urgency) {
      filtered = filtered.filter(issue => issue.upvotes > 10);
    }
    
    setFilteredIssues(filtered);
  };

  // Toggle filter selection
  const toggleFilter = (type: 'status' | 'category', value: string) => {
    setFilters(prevFilters => {
      const array = [...prevFilters[type]];
      const index = array.indexOf(value);
      
      if (index > -1) {
        array.splice(index, 1);
      } else {
        array.push(value);
      }
      
      return { ...prevFilters, [type]: array };
    });
  };

  // Toggle urgency filter
  const toggleUrgency = () => {
    setFilters(prevFilters => ({
      ...prevFilters,
      urgency: !prevFilters.urgency
    }));
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      status: [],
      category: [],
      urgency: false,
    });
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

  // Filter categories
  const categories = ['Roads', 'Infrastructure', 'Sanitation', 'Vandalism', 'Parks'];
  const statuses = ['pending', 'in-progress', 'resolved'];

  // Render bottom panel for selected issue
  // Handle upvote
  const handleUpvote = async (issueId: string) => {
    try {
      // Update the upvote count directly in Firebase
      const issueRef = doc(db, 'grievances', issueId);
      await updateDoc(issueRef, {
        upvotes: increment(1)
      });
      
      // Refresh the issue data to show updated upvote count
      await loadIssuesData();
      // Re-select the issue to update the panel
      const updatedIssue = issues.find(issue => issue.id === issueId);
      if (updatedIssue) {
        setSelectedIssue(updatedIssue);
      }
    } catch (error) {
      console.error('Error upvoting issue:', error);
      Alert.alert('Error', 'Failed to upvote issue. Please try again.');
    }
  };

  const renderIssuePanel = () => {
    if (!selectedIssue) return null;

    return (
      <View style={styles.issuePanel}>
        <View style={styles.issuePanelHeader}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedIssue.status) }]}>
            <Text style={styles.statusText}>{getStatusText(selectedIssue.status)}</Text>
          </View>
          <TouchableOpacity 
            style={styles.upvotesContainer} 
            onPress={() => handleUpvote(selectedIssue.id)}
          >
            <Ionicons name="arrow-up" size={14} color="#64748b" />
            <Text style={styles.upvotes}> {selectedIssue.upvotes}</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.issuePanelTitle}>{selectedIssue.title}</Text>
        <Text style={styles.issuePanelLocation}>
          <Ionicons name="location" size={14} color="#64748b" /> {selectedIssue.location}
        </Text>
        <Text style={styles.issuePanelDescription}>{selectedIssue.description}</Text>
        
        <TouchableOpacity 
          style={styles.viewDetailsButton}
          onPress={() => navigation.navigate('IssueDetail', { issueId: selectedIssue.id })}
        >
          <Text style={styles.viewDetailsButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render filter modal
  const renderFiltersModal = () => {
    return (
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Issues</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowFilters(false)}
              >
                <Ionicons name="close" size={24} color="#1e293b" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.filtersContainer}>
              {/* Status Filters */}
              <Text style={styles.filterSectionTitle}>Status</Text>
              <View style={styles.filterOptions}>
                {statuses.map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.filterChip,
                      filters.status.includes(status) && styles.activeFilterChip,
                    ]}
                    onPress={() => toggleFilter('status', status)}
                  >
                    <Text 
                      style={[
                        styles.filterChipText, 
                        filters.status.includes(status) && styles.activeFilterChipText
                      ]}
                    >
                      {getStatusText(status)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              {/* Category Filters */}
              <Text style={styles.filterSectionTitle}>Category</Text>
              <View style={styles.filterOptions}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.filterChip,
                      filters.category.includes(category) && styles.activeFilterChip,
                    ]}
                    onPress={() => toggleFilter('category', category)}
                  >
                    <Text 
                      style={[
                        styles.filterChipText, 
                        filters.category.includes(category) && styles.activeFilterChipText
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              {/* Urgency Filter */}
              <Text style={styles.filterSectionTitle}>Other</Text>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  filters.urgency && styles.activeFilterChip,
                ]}
                onPress={toggleUrgency}
              >
                <Text 
                  style={[
                    styles.filterChipText, 
                    filters.urgency && styles.activeFilterChipText
                  ]}
                >
                  Urgent Issues
                </Text>
              </TouchableOpacity>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.resetButton}
                onPress={resetFilters}
              >
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.applyButton}
                onPress={() => setShowFilters(false)}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0d9488" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={region}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {filteredIssues.map((issue) => (
          <Marker
            key={issue.id}
            coordinate={{
              latitude: issue.latitude,
              longitude: issue.longitude,
            }}
            pinColor={getStatusColor(issue.status)}
            onPress={() => setSelectedIssue(issue)}
          >
            <Callout tooltip>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{issue.title}</Text>
                <Text style={styles.calloutStatus}>{getStatusText(issue.status)}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
      
      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="options" size={22} color="#1e293b" />
          <Text style={styles.filterButtonText}>
            Filters {(filters.status.length > 0 || filters.category.length > 0 || filters.urgency) && '•'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.reportButton}
          onPress={() => navigation.navigate('Report')}
        >
          <Ionicons name="add-circle" size={22} color="white" />
          <Text style={styles.reportButtonText}>Report Issue</Text>
        </TouchableOpacity>
      </View>
      
      {/* Filter Chips */}
      {(filters.status.length > 0 || filters.category.length > 0 || filters.urgency) && (
        <View style={styles.activeFilters}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[
              ...filters.status.map(s => ({ id: `status-${s}`, value: getStatusText(s), type: 'status' as const })),
              ...filters.category.map(c => ({ id: `category-${c}`, value: c, type: 'category' as const })),
              ...(filters.urgency ? [{ id: 'urgency', value: 'Urgent Issues', type: 'urgency' as const }] : []),
            ]}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.activeFilterChipMap}
                onPress={() => {
                  if (item.type === 'urgency') {
                    toggleUrgency();
                  } else {
                    toggleFilter(item.type, item.id.split('-')[1]);
                  }
                }}
              >
                <Text style={styles.activeFilterChipTextMap}>{item.value}</Text>
                <Ionicons name="close-circle" size={16} color="white" />
              </TouchableOpacity>
            )}
          />
        </View>
      )}
      
      {/* Issue Panel */}
      {selectedIssue && renderIssuePanel()}
      
      {/* Filter Modal */}
      {renderFiltersModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc', // slate-50
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#1e293b', // slate-800
  },
  map: {
    width: '100%',
    height: '100%',
  },
  actionButtons: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 30,
    left: 0,
    right: 0,
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    width: '50%',
    alignSelf: 'flex-end',
    gap: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b', // slate-800
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d9488', // teal-600
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  reportButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
  activeFilters: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 110 : 80,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
  activeFilterChipMap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d9488', // teal-600
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  activeFilterChipTextMap: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
    marginRight: 6,
  },
  issuePanel: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  issuePanelHeader: {
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
  upvotesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  issuePanelTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b', // slate-800
    marginBottom: 4,
  },
  issuePanelLocation: {
    fontSize: 14,
    color: '#64748b', // slate-500
    marginBottom: 8,
  },
  issuePanelDescription: {
    fontSize: 14,
    color: '#334155', // slate-700
    marginBottom: 16,
  },
  viewDetailsButton: {
    backgroundColor: '#0d9488', // teal-600
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewDetailsButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    maxHeight: WINDOW_HEIGHT * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9', // slate-100
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b', // slate-800
  },
  closeButton: {
    padding: 4,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    maxHeight: WINDOW_HEIGHT * 0.5,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#334155', // slate-700
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f1f5f9', // slate-100
    marginRight: 8,
    marginBottom: 8,
  },
  activeFilterChip: {
    backgroundColor: '#0d9488', // teal-600
  },
  filterChipText: {
    fontSize: 14,
    color: '#334155', // slate-700
  },
  activeFilterChipText: {
    color: 'white',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9', // slate-100
  },
  resetButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9', // slate-100
    borderRadius: 8,
    marginRight: 8,
  },
  resetButtonText: {
    color: '#334155', // slate-700
    fontSize: 16,
    fontWeight: '500',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0d9488', // teal-600
    borderRadius: 8,
    marginLeft: 8,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  calloutContainer: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 8,
    width: 120,
  },
  calloutTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1e293b', // slate-800
  },
  calloutStatus: {
    fontSize: 10,
    color: '#64748b', // slate-500
    marginTop: 4,
  },
});

export default MapScreen;