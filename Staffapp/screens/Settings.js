import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { DEPARTMENTS } from '../types';

export default function Settings({ currentUser }) {
  const navigation = useNavigation();
  const route = useRoute();
  const user = currentUser || route.params?.currentUser || {
    name: 'Demo User',
    email: 'demo@example.com',
    staffId: 'DEMO-001',
    department: 'pwd',
    contact: '+91 00000 00000'
  };

  const [name, setName] = useState(user.name);
  const [contact, setContact] = useState(user.contact);

  const [notificationSettings, setNotificationSettings] = useState({
    newAssignment: true,
    deadlineReminder: true,
    citizenComment: true,
    statusUpdate: false,
  });

  const handleSaveProfile = () => {
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            // Handle logout logic here
            Alert.alert('Logged Out', 'You have been logged out successfully');
          }
        }
      ]
    );
  };

  const toggleNotification = (key) => {
    setNotificationSettings({
      ...notificationSettings,
      [key]: !notificationSettings[key]
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Settings Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="person" size={20} color="#2563eb" />
          <Text style={styles.cardTitle}>Profile Settings</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="mail-outline" size={16} color="#6b7280" />
            <Text style={styles.label}>Email</Text>
          </View>
          <TextInput
            style={[styles.input, styles.inputDisabled]}
            value={user.email}
            editable={false}
          />
          <Text style={styles.helperText}>Email cannot be changed</Text>
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="card-outline" size={16} color="#6b7280" />
            <Text style={styles.label}>Staff ID</Text>
          </View>
          <TextInput
            style={[styles.input, styles.inputDisabled]}
            value={user.staffId}
            editable={false}
          />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="business-outline" size={16} color="#6b7280" />
            <Text style={styles.label}>Department</Text>
          </View>
          <TextInput
            style={[styles.input, styles.inputDisabled]}
            value={DEPARTMENTS[user.department]}
            editable={false}
            multiline
          />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="call-outline" size={16} color="#6b7280" />
            <Text style={styles.label}>Contact Number</Text>
          </View>
          <TextInput
            style={styles.input}
            value={contact}
            onChangeText={setContact}
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
          <Ionicons name="save-outline" size={20} color="#fff" />
          <Text style={styles.saveButtonText}>Save Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Notification Preferences Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="notifications" size={20} color="#2563eb" />
          <Text style={styles.cardTitle}>Notification Preferences</Text>
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>New Issue Assignment</Text>
            <Text style={styles.settingDescription}>Get notified when a new issue is assigned</Text>
          </View>
          <Switch
            value={notificationSettings.newAssignment}
            onValueChange={() => toggleNotification('newAssignment')}
            trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
            thumbColor={notificationSettings.newAssignment ? '#2563eb' : '#f3f4f6'}
          />
        </View>

        <View style={styles.separator} />

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Deadline Reminders</Text>
            <Text style={styles.settingDescription}>Receive reminders about upcoming deadlines</Text>
          </View>
          <Switch
            value={notificationSettings.deadlineReminder}
            onValueChange={() => toggleNotification('deadlineReminder')}
            trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
            thumbColor={notificationSettings.deadlineReminder ? '#2563eb' : '#f3f4f6'}
          />
        </View>

        <View style={styles.separator} />

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Citizen Comments</Text>
            <Text style={styles.settingDescription}>Get notified of citizen comments on your issues</Text>
          </View>
          <Switch
            value={notificationSettings.citizenComment}
            onValueChange={() => toggleNotification('citizenComment')}
            trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
            thumbColor={notificationSettings.citizenComment ? '#2563eb' : '#f3f4f6'}
          />
        </View>

        <View style={styles.separator} />

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Status Updates</Text>
            <Text style={styles.settingDescription}>Receive updates on issue status changes</Text>
          </View>
          <Switch
            value={notificationSettings.statusUpdate}
            onValueChange={() => toggleNotification('statusUpdate')}
            trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
            thumbColor={notificationSettings.statusUpdate ? '#2563eb' : '#f3f4f6'}
          />
        </View>
      </View>

      {/* Quick Actions Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="menu" size={20} color="#2563eb" />
          <Text style={styles.cardTitle}>Quick Actions</Text>
        </View>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Ionicons name="notifications-outline" size={20} color="#374151" />
          <Text style={styles.actionButtonText}>Notifications</Text>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" style={styles.actionButtonArrow} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('WorkHistory')}
        >
          <Ionicons name="time-outline" size={20} color="#374151" />
          <Text style={styles.actionButtonText}>Work History</Text>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" style={styles.actionButtonArrow} />
        </TouchableOpacity>
      </View>

      {/* Logout Card */}
      <View style={styles.card}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <View style={styles.appInfo}>
        <Text style={styles.appInfoText}>Civic Issue Reporter v1.0.0</Text>
        <Text style={styles.appInfoText}>© 2025 City Government</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  inputGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  inputDisabled: {
    backgroundColor: '#f9fafb',
    color: '#6b7280',
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  actionButtonArrow: {
    marginLeft: 'auto',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 4,
  },
  appInfoText: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
