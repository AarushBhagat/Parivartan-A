import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { mockIssues } from '../data/mockData';
import { DEPARTMENTS } from '../types';

export default function WorkHistory({ navigation }) {
  const route = useRoute();
  const currentUser = route.params?.currentUser || { department: 'pwd', id: '1' };
  
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Filter issues by user's department
  const userIssues = mockIssues.filter(issue => issue.category === currentUser.department);

  // Group issues by status for work history
  const completedIssues = userIssues.filter(i => i.status === 'resolved');
  const pendingIssues = userIssues.filter(i => i.status === 'pending' || i.status === 'acknowledged');
  const inProgressIssues = userIssues.filter(i => i.status === 'in-progress');
  const cannotResolveIssues = userIssues.filter(i => i.status === 'cannot-resolve');

  const getFilteredIssues = () => {
    switch (selectedFilter) {
      case 'completed':
        return completedIssues;
      case 'pending':
        return pendingIssues;
      case 'in-progress':
        return inProgressIssues;
      case 'cannot-resolve':
        return cannotResolveIssues;
      default:
        return userIssues;
    }
  };

  const filteredIssues = getFilteredIssues();

  const filterOptions = [
    { value: 'all', label: 'All', count: userIssues.length, icon: 'list' },
    { value: 'completed', label: 'Completed', count: completedIssues.length, icon: 'checkmark-circle' },
    { value: 'in-progress', label: 'In Progress', count: inProgressIssues.length, icon: 'rocket' },
    { value: 'pending', label: 'Pending', count: pendingIssues.length, icon: 'time' },
    { value: 'cannot-resolve', label: 'Cannot Resolve', count: cannotResolveIssues.length, icon: 'close-circle' },
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
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const calculateDuration = (createdAt, completedAt) => {
    if (!completedAt) return null;
    const start = new Date(createdAt);
    const end = new Date(completedAt);
    const diffMs = end - start;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays}d ${diffHours}h`;
    }
    return `${diffHours}h`;
  };

  return (
    <View style={styles.container}>
      {/* Stats Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Work Statistics</Text>
        <Text style={styles.headerSubtitle}>{DEPARTMENTS[currentUser.department]}</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userIssues.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#10b981' }]}>{completedIssues.length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#8b5cf6' }]}>{inProgressIssues.length}</Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#f59e0b' }]}>{pendingIssues.length}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>
      </View>

      {/* Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContainer}
      >
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.filterButton,
              selectedFilter === option.value && styles.filterButtonActive
            ]}
            onPress={() => setSelectedFilter(option.value)}
          >
            <Ionicons 
              name={option.icon} 
              size={16} 
              color={selectedFilter === option.value ? '#fff' : '#6b7280'} 
            />
            <Text style={[
              styles.filterButtonText,
              selectedFilter === option.value && styles.filterButtonTextActive
            ]}>
              {option.label}
            </Text>
            <View style={[
              styles.filterBadge,
              selectedFilter === option.value && styles.filterBadgeActive
            ]}>
              <Text style={[
                styles.filterBadgeText,
                selectedFilter === option.value && styles.filterBadgeTextActive
              ]}>
                {option.count}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Work History List */}
      <ScrollView style={styles.list}>
        {filteredIssues.length > 0 ? (
          filteredIssues
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .map((issue) => (
              <TouchableOpacity
                key={issue.id}
                style={styles.issueCard}
                onPress={() => navigation.navigate('Issues', {
                  screen: 'IssueDetail',
                  params: { issue }
                })}
              >
                <View style={styles.issueHeader}>
                  <Text style={styles.issueId}>{issue.id}</Text>
                  <View style={[
                    styles.priorityBadge,
                    { backgroundColor: getPriorityColor(issue.priority) + '20' }
                  ]}>
                    <Ionicons name="flag" size={12} color={getPriorityColor(issue.priority)} />
                    <Text style={[styles.priorityText, { color: getPriorityColor(issue.priority) }]}>
                      {issue.priority.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={styles.issueTitle} numberOfLines={2}>{issue.title}</Text>
                
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

                {issue.status === 'resolved' && issue.completionDate && (
                  <View style={styles.completionInfo}>
                    <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                    <Text style={styles.completionText}>
                      Completed in {calculateDuration(issue.createdAt, issue.completionDate)}
                    </Text>
                  </View>
                )}

                {issue.comments.length > 0 && (
                  <View style={styles.commentIndicator}>
                    <Ionicons name="chatbubbles-outline" size={14} color="#6b7280" />
                    <Text style={styles.commentCount}>{issue.comments.length} comment(s)</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyStateTitle}>No work history</Text>
            <Text style={styles.emptyStateText}>
              No issues found for this filter
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
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 4,
  },
  filterScroll: {
    maxHeight: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 8,
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: '#11ad9d',
    borderColor: '#11ad9d',
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  filterBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 20,
    alignItems: 'center',
  },
  filterBadgeActive: {
    backgroundColor: '#11ad9d',
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterBadgeTextActive: {
    color: '#fff',
  },
  list: {
    flex: 1,
    padding: 16,
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
    marginBottom: 8,
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
  completionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  completionText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  commentIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  commentCount: {
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
