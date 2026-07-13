import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { mockIssues } from '../data/mockData';

export default function IssueList() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [issues, setIssues] = useState(mockIssues);

  // Get current user from route params if available
  const route = useRoute();
  const currentUser = route.params?.currentUser || { department: 'pwd' };

  // Issues are already filtered by assignedTo in App.js
  const userIssues = issues;

  // Apply search and status filters
  const filteredIssues = userIssues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { value: 'all', label: 'All', count: userIssues.length },
    { value: 'pending', label: 'Pending', count: userIssues.filter(i => i.status === 'pending').length },
    { value: 'in-progress', label: 'In Progress', count: userIssues.filter(i => i.status === 'in-progress').length },
    { value: 'resolved', label: 'Resolved', count: userIssues.filter(i => i.status === 'resolved').length },
  ];

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#f59e0b',
      'acknowledged': '#3b82f6',
      'in-progress': '#8b5cf6',
      'resolved': '#10b981',
      'cannot-resolve': '#ef4444',
    };
    return colors[status] || '#6b7280';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'high': '#ef4444',
      'medium': '#f59e0b',
      'low': '#10b981',
    };
    return colors[priority] || '#6b7280';
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    const diffTime = Math.abs(today - d);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search issues..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>

      {/* Status Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContainer}
      >
        {statusOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.filterButton,
              statusFilter === option.value && styles.filterButtonActive
            ]}
            onPress={() => setStatusFilter(option.value)}
          >
            <Text style={[
              styles.filterButtonText,
              statusFilter === option.value && styles.filterButtonTextActive
            ]}>
              {option.label}
            </Text>
            <View style={[
              styles.filterBadge,
              statusFilter === option.value && styles.filterBadgeActive
            ]}>
              <Text style={[
                styles.filterBadgeText,
                statusFilter === option.value && styles.filterBadgeTextActive
              ]}>
                {option.count}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Issue List */}
      <ScrollView style={styles.issueList}>
        {filteredIssues.length > 0 ? (
          filteredIssues.map((issue) => (
            <TouchableOpacity
              key={issue.id}
              style={styles.issueCard}
              onPress={() => navigation.navigate('IssueDetail', { issue })}
            >
              <View style={styles.issueHeader}>
                <Text style={styles.issueId}>{issue.id}</Text>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(issue.priority) + '20' }]}>
                  <Ionicons name="flag" size={12} color={getPriorityColor(issue.priority)} />
                  <Text style={[styles.priorityText, { color: getPriorityColor(issue.priority) }]}>
                    {issue.priority.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.issueTitle} numberOfLines={2}>{issue.title}</Text>
              <Text style={styles.issueDescription} numberOfLines={2}>{issue.description}</Text>

              <View style={styles.issueLocation}>
                <Ionicons name="location-outline" size={14} color="#6b7280" />
                <Text style={styles.locationText} numberOfLines={1}>{issue.location.address}</Text>
              </View>

              <View style={styles.issueFooter}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(issue.status) }]}>
                  <Text style={styles.statusText}>{issue.status.replace('-', ' ')}</Text>
                </View>
                <Text style={styles.dateText}>{formatDate(issue.updatedAt)}</Text>
              </View>

              {issue.photos && issue.photos.length > 0 && (
                <View style={styles.photoIndicator}>
                  <Ionicons name="images-outline" size={14} color="#6b7280" />
                  <Text style={styles.photoCount}>{issue.photos.length} photo(s)</Text>
                </View>
              )}

              {issue.upvotes > 0 && (
                <View style={styles.upvoteIndicator}>
                  <Ionicons name="arrow-up-circle-outline" size={14} color="#6b7280" />
                  <Text style={styles.upvoteCount}>{issue.upvotes} upvotes</Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyStateTitle}>No issues found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery ? 'Try adjusting your search' : 'No issues match the selected filter'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#111827',
  },
  filterScroll: {
    maxHeight: 60,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#11ad9d',
    borderColor: '#11ad9d',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginRight: 6,
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  filterBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  filterBadgeActive: {
    backgroundColor: '#0e8c7e',
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterBadgeTextActive: {
    color: '#fff',
  },
  issueList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  issueCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  issueId: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  issueTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  issueDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  issueLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  locationText: {
    fontSize: 13,
    color: '#6b7280',
    flex: 1,
  },
  issueFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  dateText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  photoIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  photoCount: {
    fontSize: 12,
    color: '#6b7280',
  },
  upvoteIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  upvoteCount: {
    fontSize: 12,
    color: '#6b7280',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
});
