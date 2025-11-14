import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRoute } from '@react-navigation/native';
import { mockIssues } from '../data/mockData';

export default function MapViewScreen({ navigation }) {
  const route = useRoute();
  const currentUser = route.params?.currentUser || { department: 'pwd' };

  const [location, setLocation] = useState(null);
  const [issues, setIssues] = useState(mockIssues);
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to show your position');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    })();
  }, []);

  // Filter issues by user's department
  const [selectedIssue, setSelectedIssue] = useState(null);

  // Issues are already filtered by assignedTo in App.js
  const userIssues = issues;

  // Apply status filter
  const filteredIssues = selectedStatus === 'all'
    ? userIssues
    : userIssues.filter(issue => issue.status === selectedStatus);

  const getMarkerColor = (status) => {
    const colors = {
      'pending': '#f59e0b',
      'acknowledged': '#11ad9d',
      'in-progress': '#0e8c7e',
      'resolved': '#0d766a',
      'cannot-resolve': '#ef4444',
    };
    return colors[status] || '#6b7280';
  };

  const statusFilters = [
    { value: 'all', label: 'All', icon: 'list' },
    { value: 'pending', label: 'Pending', icon: 'time' },
    { value: 'in-progress', label: 'In Progress', icon: 'rocket' },
    { value: 'resolved', label: 'Resolved', icon: 'checkmark-circle' },
  ];

  const initialRegion = location || {
    latitude: 31.3800,
    longitude: 75.3800,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <View style={styles.container}>
      {/* Status Filter */}
      <View style={styles.filterContainer}>
        {statusFilters.map((filter) => (
          <TouchableOpacity
            key={filter.value}
            style={[
              styles.filterButton,
              selectedStatus === filter.value && styles.filterButtonActive
            ]}
            onPress={() => setSelectedStatus(filter.value)}
          >
            <Ionicons
              name={filter.icon}
              size={16}
              color={selectedStatus === filter.value ? '#fff' : '#11ad9d'}
            />
            <Text style={[
              styles.filterButtonText,
              selectedStatus === filter.value && styles.filterButtonTextActive
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <Ionicons name="location" size={18} color="#11ad9d" />
        <Text style={styles.statsText}>
          Showing {filteredIssues.length} of {userIssues.length} issues
        </Text>
      </View>

      {/* Map */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        {filteredIssues.map((issue) => (
          <Marker
            key={issue.id}
            coordinate={{
              latitude: issue.location.lat,
              longitude: issue.location.lng,
            }}
            pinColor={getMarkerColor(issue.status)}
          >
            <Callout
              onPress={() => navigation.navigate('Issues', {
                screen: 'IssueDetail',
                params: { issue }
              })}
            >
              <View style={styles.callout}>
                <Text style={styles.calloutTitle} numberOfLines={2}>{issue.title}</Text>
                <View style={[styles.calloutStatus, { backgroundColor: getMarkerColor(issue.status) }]}>
                  <Text style={styles.calloutStatusText}>{issue.status.replace('-', ' ')}</Text>
                </View>
                <Text style={styles.calloutAddress} numberOfLines={1}>{issue.location.address}</Text>
                <Text style={styles.calloutTap}>Tap to view details</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Status Legend</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
            <Text style={styles.legendText}>Pending</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#11ad9d' }]} />
            <Text style={styles.legendText}>Acknowledged</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#0e8c7e' }]} />
            <Text style={styles.legendText}>In Progress</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#0d766a' }]} />
            <Text style={styles.legendText}>Resolved</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 60,
    paddingBottom: 24,
    gap: 6,
    backgroundColor: '#e6f7f5',
    borderBottomWidth: 1,
    borderBottomColor: '#11ad9d',
    zIndex: 1,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#11ad9d',
    gap: 4,
  },
  filterButtonActive: {
    backgroundColor: '#11ad9d',
  },
  filterButtonText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#11ad9d',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  map: {
    flex: 1,
  },
  callout: {
    width: 200,
    padding: 8,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  calloutStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  calloutStatusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  calloutAddress: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  calloutTap: {
    fontSize: 11,
    color: '#11ad9d',
    fontWeight: '500',
    marginTop: 4,
  },
  legend: {
    position: 'absolute',
    bottom: 60,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  legendTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '500',
  },
  stats: {
    position: 'absolute',
    top: 145,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  statsText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
});
