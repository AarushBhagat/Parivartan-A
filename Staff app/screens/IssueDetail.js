import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function IssueDetail({ route, navigation }) {
  const { issue: initialIssue } = route.params;
  const [issue, setIssue] = useState(initialIssue);
  const [newComment, setNewComment] = useState('');
  const [uploading, setUploading] = useState(false);

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

  const handleStatusChange = (newStatus) => {
    Alert.alert(
      'Update Status',
      `Change status to "${newStatus.replace('-', ' ')}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            setIssue({ ...issue, status: newStatus, updatedAt: new Date() });
            Alert.alert('Success', 'Status updated successfully');
          }
        }
      ]
    );
  };

  const handleAddComment = () => {
    if (!newComment.trim()) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }

    const comment = {
      id: `c${Date.now()}`,
      text: newComment,
      author: 'Current User',
      timestamp: new Date(),
    };

    setIssue({
      ...issue,
      comments: [...(issue.comments || []), comment],
      updatedAt: new Date()
    });
    setNewComment('');
    Alert.alert('Success', 'Comment added successfully');
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 0.7,
    });

    if (!result.canceled) {
      setUploading(true);
      setTimeout(() => {
        setIssue({
          ...issue,
          photos: [...(issue.photos || []), result.assets[0].uri],
          updatedAt: new Date()
        });
        setUploading(false);
        Alert.alert('Success', 'Photo uploaded successfully');
      }, 1000);
    }
  };

  const handleNavigate = () => {
    if (!issue.location?.lat || !issue.location?.lng) {
      Alert.alert('Error', 'Location coordinates not available');
      return;
    }
    
    const { lat, lng } = issue.location;
    const url = Platform.OS === 'ios'
      ? `maps://app?daddr=${lat},${lng}`
      : `google.navigation:q=${lat},${lng}`;
    
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
      }
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending', icon: 'time' },
    { value: 'acknowledged', label: 'Acknowledged', icon: 'checkmark' },
    { value: 'in-progress', label: 'In Progress', icon: 'rocket' },
    { value: 'resolved', label: 'Resolved', icon: 'checkmark-circle' },
    { value: 'cannot-resolve', label: 'Cannot Resolve', icon: 'close-circle' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Issue Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.issueId}>{issue.id}</Text>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(issue.priority) }]}>
            <Ionicons name="flag" size={14} color="#fff" />
            <Text style={styles.priorityText}>{issue.priority.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.issueTitle}>{issue.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(issue.status) }]}>
          <Text style={styles.statusText}>{issue.status.replace('-', ' ')}</Text>
        </View>
      </View>

      {/* Issue Details */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="document-text" size={20} color="#2563eb" />
          <Text style={styles.cardTitle}>Description</Text>
        </View>
        <Text style={styles.description}>{issue.description}</Text>
      </View>

      {/* Location */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="location" size={20} color="#2563eb" />
          <Text style={styles.cardTitle}>Location</Text>
        </View>
        <Text style={styles.locationText}>
          {issue.location?.address || issue.location?.description || 'Location not provided'}
        </Text>
        {issue.location?.lat && issue.location?.lng && (
          <TouchableOpacity style={styles.navigateButton} onPress={handleNavigate}>
            <Ionicons name="navigate" size={18} color="#fff" />
            <Text style={styles.navigateButtonText}>Navigate</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Reporter Info */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="person" size={20} color="#2563eb" />
          <Text style={styles.cardTitle}>Reporter Information</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Name:</Text>
          <Text style={styles.infoValue}>
            {issue.reporter?.name || issue.citizenName || issue.reportedBy || 'Anonymous'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Contact:</Text>
          <Text style={styles.infoValue}>
            {issue.reporter?.contact || issue.citizenContact || issue.phoneNumber || 'Not provided'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Upvotes:</Text>
          <View style={styles.upvoteBadge}>
            <Ionicons name="arrow-up" size={14} color="#2563eb" />
            <Text style={styles.upvoteText}>{issue.upvotes || 0}</Text>
          </View>
        </View>
      </View>

      {/* Photos */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="images" size={20} color="#2563eb" />
          <Text style={styles.cardTitle}>Photos</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
          {issue.photos && issue.photos.length > 0 ? (
            issue.photos.map((photo, index) => (
              <Image key={index} source={{ uri: photo }} style={styles.photo} />
            ))
          ) : (
            <Text style={styles.noPhotosText}>No photos available</Text>
          )}
        </ScrollView>
        <TouchableOpacity 
          style={styles.uploadButton} 
          onPress={handlePickImage}
          disabled={uploading}
        >
          <Ionicons name="camera" size={18} color="#2563eb" />
          <Text style={styles.uploadButtonText}>
            {uploading ? 'Uploading...' : 'Upload Photo'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Update Status */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="refresh" size={20} color="#2563eb" />
          <Text style={styles.cardTitle}>Update Status</Text>
        </View>
        <View style={styles.statusButtons}>
          {statusOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.statusButton,
                issue.status === option.value && styles.statusButtonActive,
                { borderColor: getStatusColor(option.value) }
              ]}
              onPress={() => handleStatusChange(option.value)}
            >
              <Ionicons 
                name={option.icon} 
                size={18} 
                color={issue.status === option.value ? '#fff' : getStatusColor(option.value)} 
              />
              <Text style={[
                styles.statusButtonText,
                issue.status === option.value && styles.statusButtonTextActive
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Comments */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="chatbubbles" size={20} color="#2563eb" />
          <Text style={styles.cardTitle}>Comments ({(issue.comments || []).length})</Text>
        </View>
        
        {issue.comments && issue.comments.length > 0 ? (
          issue.comments.map((comment) => (
            <View key={comment.id} style={styles.comment}>
              <View style={styles.commentHeader}>
                <Text style={styles.commentAuthor}>{comment.author}</Text>
                <Text style={styles.commentTime}>{formatDate(comment.timestamp)}</Text>
              </View>
              <Text style={styles.commentText}>{comment.text}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noCommentsText}>No comments yet</Text>
        )}

        <View style={styles.addCommentSection}>
          <TextInput
            style={styles.commentInput}
            placeholder="Add a comment..."
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />
          <TouchableOpacity style={styles.commentButton} onPress={handleAddComment}>
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Timestamps */}
      <View style={styles.timestamps}>
        <View style={styles.timestampRow}>
          <Ionicons name="calendar-outline" size={16} color="#6b7280" />
          <Text style={styles.timestampText}>Created: {formatDate(issue.createdAt)}</Text>
        </View>
        <View style={styles.timestampRow}>
          <Ionicons name="time-outline" size={16} color="#6b7280" />
          <Text style={styles.timestampText}>Updated: {formatDate(issue.updatedAt)}</Text>
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
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  issueId: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  priorityText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '700',
  },
  issueTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    textTransform: 'capitalize',
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
    marginBottom: 12,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  description: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
  locationText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
    lineHeight: 20,
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  navigateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  upvoteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  upvoteText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
  photoScroll: {
    marginBottom: 12,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 8,
  },
  noPhotosText: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2563eb',
    borderStyle: 'dashed',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  uploadButtonText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
  },
  statusButtons: {
    gap: 8,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    gap: 8,
  },
  statusButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  statusButtonTextActive: {
    color: '#fff',
  },
  comment: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  commentTime: {
    fontSize: 11,
    color: '#6b7280',
  },
  commentText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  noCommentsText: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  addCommentSection: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
  },
  commentButton: {
    backgroundColor: '#2563eb',
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timestamps: {
    padding: 16,
    gap: 8,
    marginBottom: 20,
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timestampText: {
    fontSize: 12,
    color: '#6b7280',
  },
});
