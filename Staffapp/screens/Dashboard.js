import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DEPARTMENTS } from '../types';

export default function Dashboard({ user, issues, navigation }) {
  // Issues are already filtered by assignedTo in App.js, so use all issues passed
  const userIssues = issues;

  const stats = {
    total: userIssues.length,
    pending: userIssues.filter(i => i.status === 'pending').length,
    inProgress: userIssues.filter(i => i.status === 'in-progress').length,
    resolved: userIssues.filter(i => i.status === 'resolved').length,
  };

  const StatCard = ({ icon, label, value, color }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statIconContainer}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );

  const recentIssues = userIssues
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 3);

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

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={32} color="#fff" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userDepartment}>{DEPARTMENTS[user.department]}</Text>
            <View style={styles.staffIdBadge}>
              <Text style={styles.staffIdText}>{user.staffId}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statsRow}>
          <StatCard
            icon="file-tray-full"
            label="Total Issues"
            value={stats.total}
            color="#11ad9d"
          />
          <StatCard
            icon="time"
            label="Pending"
            value={stats.pending}
            color="#f59e0b"
          />
        </View>
        <View style={styles.statsRow}>
          <StatCard
            icon="rocket"
            label="In Progress"
            value={stats.inProgress}
            color="#0e8c7e"
          />
          <StatCard
            icon="checkmark-circle"
            label="Resolved"
            value={stats.resolved}
            color="#0d766a"
          />
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Issues')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {recentIssues.length > 0 ? (
          recentIssues.map((issue) => (
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
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(issue.priority) + '20' }]}>
                  <Text style={[styles.priorityText, { color: getPriorityColor(issue.priority) }]}>
                    {issue.priority.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={styles.issueTitle} numberOfLines={2}>{issue.title}</Text>
              <View style={styles.issueFooter}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(issue.status) }]}>
                  <Text style={styles.statusText}>{issue.status.replace('-', ' ')}</Text>
                </View>
                <View style={styles.issueLocation}>
                  <Ionicons name="location-outline" size={14} color="#6b7280" />
                  <Text style={styles.locationText} numberOfLines={1}>
                    {issue.location.address.split(',')[0]}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyStateText}>No recent issues</Text>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Issues')}
          >
            <Ionicons name="list" size={24} color="#11ad9d" />
            <Text style={styles.actionButtonText}>View All Issues</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Map')}
          >
            <Ionicons name="map" size={24} color="#11ad9d" />
            <Text style={styles.actionButtonText}>Map View</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#11ad9d',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 24,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0e8c7e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: '#d1f5f0',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 2,
  },
  userDepartment: {
    fontSize: 12,
    color: '#d1f5f0',
    marginTop: 4,
  },
  staffIdBadge: {
    backgroundColor: '#0e8c7e',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  staffIdText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  statsGrid: {
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statIconContainer: {
    marginBottom: 12,
  },
  statContent: {
    gap: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  seeAllText: {
    fontSize: 14,
    color: '#11ad9d',
    fontWeight: '600',
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  issueTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
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
  issueLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    marginLeft: 12,
  },
  locationText: {
    fontSize: 12,
    color: '#6b7280',
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 12,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
});