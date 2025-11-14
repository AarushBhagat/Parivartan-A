import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  FlatList,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { auth } from '../firebase';
import { issueService } from '../services';
import { useAuth } from '../contexts/AuthContext';

interface IssueDetailScreenProps {
  navigation: any;
  route: {
    params: {
      issueId: string;
    };
  };
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
  userPhotoUrl?: string;
}

interface Update {
  id: string;
  text: string;
  status: string;
  timestamp: string;
}

interface Issue {
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
  createdBy: {
    uid: string;
    displayName: string;
    photoURL?: string;
  };
  mediaUrls?: string[];
  upvotes: number;
  upvotedBy?: string[];
  comments?: Comment[];
  updates?: Update[];
  assignedTo?: {
    uid: string;
    displayName: string;
  };
  department?: {
    id: string;
    name: string;
  };
  rating?: number;
  ratingComment?: string;
  ratedBy?: string;
  ratedAt?: string;
}

const IssueDetailScreen: React.FC<IssueDetailScreenProps> = ({ navigation, route }) => {
  // Get issue ID from route params
  const { issueId } = route.params;
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  // State
  const [issue, setIssue] = useState<Issue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // 'details', 'comments', or 'updates'
  const [isUpvoting, setIsUpvoting] = useState(false);
  
  // Rating state
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  
  // Load issue data from backend
  const loadIssueData = async () => {
    try {
      setIsLoading(true);
      
      const response = await issueService.getIssueById(issueId);
      const issueData = response.issue || response;
      
      console.log('Loaded issue data:', JSON.stringify(issueData, null, 2));
      console.log('Issue status:', issueData.status);
      
      setIssue(issueData);
      
      // Check if current user has upvoted this issue
      if (user && issueData.upvotedBy) {
        setHasUpvoted(issueData.upvotedBy.includes(user.uid));
      }
      
    } catch (error) {
      console.error('Error loading issue:', error);
      Alert.alert('Error', 'Failed to load issue details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (issueId) {
      loadIssueData();
    }
  }, [issueId, user]);
  
  // Handle upvote
  const handleUpvote = async () => {
    if (!issue || !user || isUpvoting) return;
    
    setIsUpvoting(true);
    
    try {
      if (hasUpvoted) {
        // Remove upvote
        await issueService.removeUpvote(issue.id);
        setIssue(prevIssue => ({
          ...prevIssue!,
          upvotes: prevIssue!.upvotes - 1,
          upvotedBy: prevIssue!.upvotedBy?.filter(uid => uid !== user.uid) || []
        }));
        setHasUpvoted(false);
      } else {
        // Add upvote
        await issueService.upvoteIssue(issue.id);
        setIssue(prevIssue => ({
          ...prevIssue!,
          upvotes: prevIssue!.upvotes + 1,
          upvotedBy: [...(prevIssue!.upvotedBy || []), user.uid]
        }));
        setHasUpvoted(true);
      }
    } catch (error) {
      console.error('Error updating upvote:', error);
      Alert.alert('Error', 'Failed to update vote. Please try again.');
    } finally {
      setIsUpvoting(false);
    }
  };
  
  // Submit comment
  const handleSubmitComment = async () => {
    if (!commentText.trim() || !issue) return;
    
    setIsSubmittingComment(true);
    
    try {
      // Add comment to the issue via API
      await issueService.addComment(issue.id, commentText.trim());
      
      // Refresh the issue data to get the updated comments
      await loadIssueData();
      
      // Clear the comment input
      setCommentText('');
    } catch (error) {
      console.error('Error submitting comment:', error);
      Alert.alert('Error', 'Failed to submit comment. Please try again.');
    } finally {
      setIsSubmittingComment(false);
    }
  };
  
  // Submit rating for resolved issue
  const handleSubmitRating = async () => {
    if (!rating || !issue) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }
    
    setIsSubmittingRating(true);
    
    try {
      // Submit rating via API
      await issueService.rateIssue(issue.id, {
        rating,
        comment: ratingComment.trim(),
        userId: user?.uid || '',
        userName: user?.displayName || 'Anonymous'
      });
      
      // Update local state
      setIssue(prevIssue => ({
        ...prevIssue!,
        rating,
        ratingComment: ratingComment.trim(),
        ratedBy: user?.uid,
        ratedAt: new Date().toISOString()
      }));
      
      setShowRatingModal(false);
      setRating(0);
      setRatingComment('');
      
      Alert.alert('Success', 'Thank you for your feedback!');
    } catch (error) {
      console.error('Error submitting rating:', error);
      Alert.alert('Error', 'Failed to submit rating. Please try again.');
    } finally {
      setIsSubmittingRating(false);
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Format timestamp for comments/updates
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Status badge style and text
  const getStatusInfo = (status: string) => {
    // Normalize status (handle both formats: 'in_progress' and 'in-progress')
    const normalizedStatus = status?.toLowerCase().replace(/-/g, '_') || '';
    console.log('Status received:', status, '→ Normalized:', normalizedStatus);
    
    switch (normalizedStatus) {
      case 'pending':
        return {
          color: '#f59e0b', // amber-500
          backgroundColor: '#fef3c7', // amber-100
          text: 'Pending'
        };
      case 'acknowledged':
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
      case 'cannot_resolve':
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
          text: status || 'Unknown'
        };
    }
  };
  
  // Render issue details
  const renderDetails = () => {
    if (!issue) return null;
    
    const statusInfo = getStatusInfo(issue.status);
    
    return (
      <>
        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{issue.description}</Text>
        </View>
        
        {/* Images */}
        {issue.mediaUrls && issue.mediaUrls.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Images</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.imagesContainer}
            >
              {issue.mediaUrls.map((url, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.imageContainer}
                  onPress={() => {
                    // Navigate to a full-screen image viewer
                    navigation.navigate('ImageViewer', { 
                      images: issue.mediaUrls,
                      initialIndex: index 
                    });
                  }}
                >
                  <Image 
                    source={{ uri: url }} 
                    style={styles.image}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        
        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.locationContainer}>
            <Text style={styles.locationText}>
              {issue.location.address || `${issue.location.district}`}
            </Text>
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: issue.location.latitude,
                  longitude: issue.location.longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
                pitchEnabled={false}
                rotateEnabled={false}
              >
                <Marker
                  coordinate={{
                    latitude: issue.location.latitude,
                    longitude: issue.location.longitude,
                  }}
                />
              </MapView>
              {/* <TouchableOpacity 
                style={styles.viewMapButton}
                onPress={() => {
                  // Navigate to full map view
                  navigation.navigate('Map', { 
                    focusIssue: issue.id,
                    latitude: issue.location.latitude,
                    longitude: issue.location.longitude
                  });
                }}
              >
                <Text style={styles.viewMapButtonText}>View on Map</Text>
              </TouchableOpacity> */}
            </View>
          </View>
        </View>
        
        {/* Reporter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reported by</Text>
          <View style={styles.reporterContainer}>
            <View style={styles.reporterInfo}>
              <Image 
                source={{ uri: issue.createdBy?.photoURL || undefined }}
                style={styles.reporterImage}
                defaultSource={require('../../assets/default-avatar.png')}
              />
              <View>
                <Text style={styles.reporterName}>{issue.createdBy?.displayName || 'Unknown User'}</Text>
                <Text style={styles.reportDate}>on {formatDate(issue.createdAt)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Assignment Info */}
        {issue.assignedTo && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Assigned to</Text>
            <View style={styles.reporterContainer}>
              <View style={styles.reporterInfo}>
                <View style={styles.assignedIcon}>
                  <Ionicons name="person" size={20} color="#0d9488" />
                </View>
                <View>
                  <Text style={styles.reporterName}>{issue.assignedTo.displayName}</Text>
                  {issue.department && (
                    <Text style={styles.reportDate}>{issue.department.name}</Text>
                  )}
                </View>
              </View>
            </View>
          </View>
        )}
        
        {/* Rating Section - Show for resolved issues */}
        {(issue.status === 'resolved' || issue.status?.toLowerCase().replace(/-/g, '_') === 'resolved') && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resolution Feedback</Text>
            {issue.rating ? (
              // Already rated - show rating
              <View style={styles.ratingDisplayContainer}>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={star <= (issue.rating || 0) ? "star" : "star-outline"}
                      size={24}
                      color="#fbbf24"
                      style={{ marginRight: 4 }}
                    />
                  ))}
                </View>
                {issue.ratingComment && (
                  <Text style={styles.ratingCommentDisplay}>{issue.ratingComment}</Text>
                )}
                <Text style={styles.ratingDate}>Rated on {formatDate(issue.ratedAt || '')}</Text>
              </View>
            ) : user && issue.createdBy && issue.createdBy.uid === user.uid ? (
              // Not rated yet and user is creator - show rate button
              <View>
                <Text style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>
                  Debug: User ID: {user.uid}, Creator ID: {issue.createdBy?.uid}
                </Text>
                <TouchableOpacity
                  style={styles.rateButton}
                  onPress={() => {
                    console.log('Rate button pressed');
                    setShowRatingModal(true);
                  }}
                >
                  <Ionicons name="star" size={20} color="white" style={{ marginRight: 8 }} />
                  <Text style={styles.rateButtonText}>Rate Resolution</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.notRatedText}>
                No rating yet {!user ? '(Please log in to rate)' : '(Only issue creator can rate)'}
              </Text>
            )}
          </View>
        )}
      </>
    );
  };
  
  // Render comments tab
  const renderComments = () => {
    if (!issue) return null;
    
    return (
      <View style={styles.commentsContainer}>
        {/* Add comment section */}
        <View style={styles.addCommentContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="Add a comment..."
            value={commentText}
            onChangeText={setCommentText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={[
              styles.commentButton,
              (!commentText.trim() || isSubmittingComment) && styles.disabledButton
            ]}
            disabled={!commentText.trim() || isSubmittingComment}
            onPress={handleSubmitComment}
          >
            {isSubmittingComment ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="send" size={18} color="white" />
            )}
          </TouchableOpacity>
        </View>
        
        {/* Comments list */}
        <FlatList
          data={issue.comments || []}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.commentItem}>
              <Image 
                source={{ uri: item.userPhotoUrl || undefined }}
                style={styles.commentUserImage}
                defaultSource={require('../../assets/default-avatar.png')}
              />
              <View style={styles.commentContent}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentUserName}>{item.userName}</Text>
                  <Text style={styles.commentTime}>{formatTimestamp(item.timestamp)}</Text>
                </View>
                <Text style={styles.commentText}>{item.text}</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyCommentsContainer}>
              <Ionicons name="chatbox-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyCommentsText}>No comments yet</Text>
              <Text style={styles.emptyCommentsSubtext}>Be the first to comment</Text>
            </View>
          }
        />
      </View>
    );
  };
  
  // Render updates tab
  const renderUpdates = () => {
    if (!issue) return null;
    
    return (
      <View style={styles.updatesContainer}>
        <FlatList
          data={issue.updates || []}
          keyExtractor={item => item.id}
          renderItem={({ item }) => {
            const statusInfo = getStatusInfo(item.status);
            
            return (
              <View style={styles.updateItem}>
                <View style={styles.updateTimelineNode}>
                  <View style={[styles.updateStatusDot, { backgroundColor: statusInfo.color }]} />
                  <View style={styles.updateTimelineLine} />
                </View>
                <View style={styles.updateContent}>
                  <View style={styles.updateHeader}>
                    <View style={[styles.updateStatusBadge, { backgroundColor: statusInfo.backgroundColor }]}>
                      <Text style={[styles.updateStatusText, { color: statusInfo.color }]}>
                        {statusInfo.text}
                      </Text>
                    </View>
                    <Text style={styles.updateTime}>{formatTimestamp(item.timestamp)}</Text>
                  </View>
                  <Text style={styles.updateText}>{item.text}</Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyUpdatesContainer}>
              <Ionicons name="time-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyUpdatesText}>No updates yet</Text>
              <Text style={styles.emptyUpdatesSubtext}>Check back later for updates</Text>
            </View>
          }
          contentContainerStyle={styles.updatesList}
        />
      </View>
    );
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#0d9488" />
        <Text style={styles.loadingText}>Loading issue details...</Text>
      </View>
    );
  }
  
  // Render error state if issue not found
  if (!issue) {
    return (
      <View style={[styles.errorContainer, { paddingTop: insets.top }]}>
        <Ionicons name="alert-circle-outline" size={64} color="#f43f5e" />
        <Text style={styles.errorTitle}>Issue Not Found</Text>
        <Text style={styles.errorMessage}>The issue you're looking for doesn't exist or has been removed.</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Render issue detail screen
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#334155" />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.categoryLabel}>
            {(issue.category || (typeof issue.department === 'string' ? issue.department : issue.department?.name) || 'General').toUpperCase()}
          </Text>
          <Text style={styles.headerTitle} numberOfLines={1}>{issue.title || 'Untitled'}</Text>
        </View>
        
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => {
            // Prepare the share message with issue details
            const shareMessage = `${issue.title} - ${issue.category}\n${issue.description}\n\nStatus: ${getStatusInfo(issue.status).text}\nLocation: ${issue.location.address || issue.location.district}`;
            
            // Use the native share functionality
            try {
              // Check if navigator.share is available (for web)
              if (typeof navigator !== 'undefined' && navigator.share) {
                navigator.share({
                  title: issue.title,
                  text: shareMessage,
                });
              } else {
                // Use React Native specific sharing
                Alert.alert('Share Issue', 'This would open the native share dialog with the issue details.');
                // In a real implementation, you would use the Share API:
                // import { Share } from 'react-native';
                // Share.share({ message: shareMessage, title: issue.title });
              }
            } catch (error) {
              console.error('Error sharing issue:', error);
              Alert.alert('Error', 'Could not share the issue. Please try again.');
            }
          }}
        >
          <Ionicons name="share-outline" size={24} color="#334155" />
        </TouchableOpacity>
      </View>
      
      {/* Status and upvote bar */}
      <View style={styles.statusBar}>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusInfo(issue.status).backgroundColor }
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusInfo(issue.status).color }
              ]}
            >
              {getStatusInfo(issue.status).text}
            </Text>
          </View>
          <Text style={styles.statusDate}>Reported on {formatDate(issue.createdAt)}</Text>
        </View>
        
        <TouchableOpacity
          style={[styles.upvoteButton, hasUpvoted && styles.upvoteButtonActive]}
          onPress={handleUpvote}
          disabled={isUpvoting}
        >
          {isUpvoting ? (
            <ActivityIndicator size="small" color={hasUpvoted ? "white" : "#334155"} />
          ) : (
            <Ionicons 
              name={hasUpvoted ? "arrow-up" : "arrow-up-outline"} 
              size={16} 
              color={hasUpvoted ? "white" : "#334155"}
            />
          )}
          <Text
            style={[styles.upvoteCount, hasUpvoted && styles.upvoteCountActive]}
          >
            {issue.upvotes}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Content tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[
            styles.tabButton,
            activeTab === 'details' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('details')}
        >
          <Text 
            style={[
              styles.tabButtonText,
              activeTab === 'details' && styles.activeTabButtonText
            ]}
          >
            Details
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tabButton,
            activeTab === 'comments' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('comments')}
        >
          <Text 
            style={[
              styles.tabButtonText,
              activeTab === 'comments' && styles.activeTabButtonText
            ]}
          >
            Comments ({issue.comments?.length || 0})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tabButton,
            activeTab === 'updates' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('updates')}
        >
          <Text 
            style={[
              styles.tabButtonText,
              activeTab === 'updates' && styles.activeTabButtonText
            ]}
          >
            Updates ({issue.updates?.length || 0})
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Tab content */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {activeTab === 'details' && renderDetails()}
        {activeTab === 'comments' && renderComments()}
        {activeTab === 'updates' && renderUpdates()}
      </ScrollView>

      {/* Rating Modal */}
      <Modal
        visible={showRatingModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowRatingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rate This Resolution</Text>
            
            {/* Star Rating Selector */}
            <View style={styles.modalStarsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  style={styles.starButton}
                  onPress={() => setRating(star)}
                >
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={36}
                    color={star <= rating ? '#fbbf24' : '#cbd5e1'}
                  />
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Comment Input */}
            <TextInput
              style={styles.modalCommentInput}
              placeholder="Add a comment (optional)"
              placeholderTextColor="#94a3b8"
              multiline
              value={ratingComment}
              onChangeText={setRatingComment}
            />
            
            {/* Action Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => {
                  setShowRatingModal(false);
                  setRating(0);
                  setRatingComment('');
                }}
              >
                <Text style={[styles.modalButtonText, styles.modalCancelText]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSubmitButton]}
                onPress={handleSubmitRating}
                disabled={rating === 0 || isSubmittingRating}
              >
                <Text style={[styles.modalButtonText, styles.modalSubmitText]}>
                  {isSubmittingRating ? 'Submitting...' : 'Submit'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#f8fafc', // slate-50
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b', // slate-500
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc', // slate-50
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#334155', // slate-700
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    color: '#64748b', // slate-500
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#0d9488', // teal-600
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0', // slate-200
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  headerTitleContainer: {
    flex: 1,
    marginHorizontal: 8,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b', // slate-500
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#334155', // slate-700
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0', // slate-200
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusDate: {
    fontSize: 12,
    color: '#64748b', // slate-500
  },
  upvoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9', // slate-100
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  upvoteButtonActive: {
    backgroundColor: '#0d9488', // teal-600
  },
  upvoteCount: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
    color: '#334155', // slate-700
  },
  upvoteCountActive: {
    color: 'white',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0', // slate-200
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#0d9488', // teal-600
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b', // slate-500
  },
  activeTabButtonText: {
    color: '#0d9488', // teal-600
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155', // slate-700
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#334155', // slate-700
  },
  imagesContainer: {
    paddingVertical: 8,
  },
  imageContainer: {
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: 200,
    height: 150,
  },
  locationContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  locationText: {
    fontSize: 14,
    color: '#334155', // slate-700
    marginBottom: 8,
  },
  mapContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  viewMapButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  viewMapButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#0d9488', // teal-600
  },
  reporterContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  reporterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reporterImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  assignedIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ecfeff', // cyan-50
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reporterName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155', // slate-700
  },
  reportDate: {
    fontSize: 12,
    color: '#64748b', // slate-500
    marginTop: 2,
  },
  commentsContainer: {
    flex: 1,
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  commentInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#f8fafc', // slate-50
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingTop: 8,
    fontSize: 14,
    color: '#334155', // slate-700
  },
  commentButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0d9488', // teal-600
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentUserImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUserName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155', // slate-700
  },
  commentTime: {
    fontSize: 12,
    color: '#94a3b8', // slate-400
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#334155', // slate-700
  },
  emptyCommentsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyCommentsText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#334155', // slate-700
    marginTop: 12,
  },
  emptyCommentsSubtext: {
    fontSize: 14,
    color: '#64748b', // slate-500
    marginTop: 4,
  },
  updatesContainer: {
    flex: 1,
  },
  updatesList: {
    paddingBottom: 16,
  },
  updateItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  updateTimelineNode: {
    alignItems: 'center',
    width: 24,
    marginRight: 12,
  },
  updateStatusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0d9488', // teal-600
  },
  updateTimelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#e2e8f0', // slate-200
    marginTop: 4,
  },
  updateContent: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  updateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  updateStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  updateStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  updateTime: {
    fontSize: 12,
    color: '#94a3b8', // slate-400
  },
  updateText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#334155', // slate-700
  },
  emptyUpdatesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyUpdatesText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#334155', // slate-700
    marginTop: 12,
  },
  emptyUpdatesSubtext: {
    fontSize: 14,
    color: '#64748b', // slate-500
    marginTop: 4,
  },
  // Rating styles
  ratingDisplayContainer: {
    backgroundColor: '#f0fdfa', // teal-50
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  ratingCommentDisplay: {
    fontSize: 14,
    color: '#334155', // slate-700
    lineHeight: 20,
    marginBottom: 8,
  },
  ratingDate: {
    fontSize: 12,
    color: '#64748b', // slate-500
  },
  rateButton: {
    backgroundColor: '#0d9488', // teal-600
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  rateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  notRatedText: {
    fontSize: 14,
    color: '#64748b', // slate-500
    fontStyle: 'italic',
  },
  // Rating modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#334155', // slate-700
    marginBottom: 16,
    textAlign: 'center',
  },
  modalStarsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  starButton: {
    padding: 8,
  },
  modalCommentInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0', // slate-200
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#334155', // slate-700
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#f1f5f9', // slate-100
  },
  modalSubmitButton: {
    backgroundColor: '#0d9488', // teal-600
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalCancelText: {
    color: '#334155', // slate-700
  },
  modalSubmitText: {
    color: 'white',
  },
});

export default IssueDetailScreen;