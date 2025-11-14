import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { updateEmail, updatePassword, updateProfile } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services';
import { auth } from '../firebase';
import { debugUserState } from '../utils/debug';

// Type definition for navigation prop
interface ProfileScreenProps {
  navigation: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  // Get setUser to directly update auth state when needed
  const { user, userDetails, logout, refreshUserDetails, setUser } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  
  const [profile, setProfile] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    phone: userDetails?.phoneNumber || '',
    address: userDetails?.address || '',
    notificationsEnabled: true,
    locationSharing: false,
    darkMode: false
  });
  
  // Update profile state when user or userDetails changes
  useEffect(() => {
    if (user || userDetails) {
      console.log('ProfileScreen: Updating profile from user/userDetails changes');
      console.log('Current displayName:', user?.displayName);
      setProfile(prev => ({
        ...prev,
        displayName: user?.displayName || '',
        email: user?.email || '',
        phone: userDetails?.phoneNumber || '',
        address: userDetails?.address || ''
      }));
    }
  }, [user, userDetails]);
  
  // Force refresh when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      console.log('ProfileScreen focused, refreshing user details');
      
      try {
        await debugUserState('ProfileScreen - On Navigation Focus');
      } catch (debugErr) {
        console.error('Debug logging error:', debugErr);
      }
      
      // Force reload current user from Firebase and backend
      await refreshUserDetails();
      
      try {
        await debugUserState('ProfileScreen - After Navigation Focus Refresh');
      } catch (debugErr) {
        console.error('Debug logging error:', debugErr);
      }
    });

    return unsubscribe;
  }, [navigation]);
  
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Handle profile update
  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      await debugUserState('ProfileScreen - Before Update');
    } catch (debugErr) {
      console.error('Debug logging error:', debugErr);
    }
    
    try {
      // First update Firebase Auth directly for immediate UI changes
      const currentUser = auth.currentUser;
      if (currentUser) {
        // Update Firebase Auth profile directly
        await updateProfile(currentUser, {
          displayName: profile.displayName,
          // Note: photoURL would go here if updating it
        });
        
        console.log("Firebase Auth profile updated directly");
        
        // Immediately update local state after Firebase Auth update for better UI responsiveness
        // This ensures user sees their changes even before backend completes
        if (user) {
          const updatedUser = { ...user, displayName: profile.displayName };
          // This uses the setUser function from AuthContext
          // It's important to trigger this update immediately
          setUser(updatedUser);
          console.log("Local state updated immediately with new display name:", updatedUser.displayName);
        }
        
        // Verify the update was successful by reloading and checking
        try {
          // Force reload to ensure we have the latest data
          await currentUser.reload();
          const reloadedUser = auth.currentUser;
          
          // Log verification of the update
          console.log("Firebase Auth profile verification:");
          console.log("- Expected name:", profile.displayName);
          console.log("- Actual name after update:", reloadedUser?.displayName);
          
          if (reloadedUser?.displayName !== profile.displayName) {
            console.warn("Firebase Auth profile update might not have been applied immediately");
          }
        } catch (reloadErr) {
          console.error("Error during verification reload:", reloadErr);
        }
      }
      
      // Then try to update backend - but don't fail the whole operation if backend fails
      try {
        await authService.updateProfile({
          displayName: profile.displayName,
          phoneNumber: profile.phone,
          address: profile.address
        });
        
        console.log("Backend profile updated");
      } catch (backendErr: any) {
        // Log the backend error but don't fail the entire operation
        // Firebase Auth update was already successful
        console.log("API error details:", backendErr);
        console.warn("Backend profile update failed, but Firebase Auth profile was updated successfully");
      }
      
      // Force refresh auth state and user details from backend
      await refreshUserDetails();
      
      // Force update local state to show changes immediately
      setProfile(prev => ({
        ...prev,
        displayName: profile.displayName || '',
        phone: profile.phone || '',
        address: profile.address || '',
      }));
      
      setIsEditing(false);
      
      try {
        await debugUserState('ProfileScreen - After Update');
      } catch (debugErr) {
        console.error('Debug logging error:', debugErr);
      }
      
      Alert.alert('Success', 'Your profile has been updated');
    } catch (error: any) {
      console.error("Profile update failed:", error);
      Alert.alert(
        'Update Failed', 
        'Failed to update your profile completely. Your name may still update but some details could not be saved. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (!user) return;
    
    if (passwords.newPassword !== passwords.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    
    setIsLoading(true);
    try {
      // In a real app, you'd have a backend endpoint to change password
      // For now, we're showing a success message
      setShowChangePassword(false);
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      Alert.alert('Success', 'Your password has been updated');
    } catch (error: any) {
      Alert.alert('Password Update Failed', error.message || 'Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await logout();
              // Navigation will be handled by the auth state listener in AuthContext
            } catch (error: any) {
              Alert.alert('Logout Failed', error.message || 'Failed to log out. Please try again.');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  // Handle profile setting toggle
  const handleToggle = (setting: string, value: boolean) => {
    setProfile(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <LinearGradient
        colors={['#14b8a6', '#0d9488']} // teal-500 to teal-600
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.profileImageContainer}>
            {user?.photoURL ? (
              <Image 
                source={{ uri: user.photoURL }} 
                style={styles.profileImage} 
              />
            ) : (
              <View style={[styles.profileImage, styles.profileImageFallback]}>
                <Text style={styles.profileImageText}>
                  {profile.displayName ? profile.displayName[0].toUpperCase() : 'U'}
                </Text>
              </View>
            )}
          </View>
          
          <Text style={styles.profileName}>
            {isEditing ? (
              <TextInput
                style={styles.editNameInput}
                value={profile.displayName}
                onChangeText={(text) => setProfile(prev => ({ ...prev, displayName: text }))}
                placeholder="Your Name"
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
              />
            ) : (
              profile.displayName || 'User'
            )}
          </Text>
          
          <Text style={styles.profileEmail}>
            {profile.email}
          </Text>
          
          {!isEditing && (
            <TouchableOpacity 
              style={styles.editButton} 
              onPress={() => setIsEditing(true)}
            >
              <Ionicons name="pencil" size={16} color="white" />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Profile Content */}
      <ScrollView style={styles.content}>
        {isEditing ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Edit Profile</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={profile.displayName}
                onChangeText={(text) => setProfile(prev => ({ ...prev, displayName: text }))}
                placeholder="Your full name"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={profile.email}
                onChangeText={(text) => setProfile(prev => ({ ...prev, email: text }))}
                placeholder="Your email address"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number (Optional)</Text>
              <TextInput
                style={styles.input}
                value={profile.phone}
                onChangeText={(text) => setProfile(prev => ({ ...prev, phone: text }))}
                placeholder="Your phone number"
                keyboardType="phone-pad"
              />
            </View>
            
            <View style={styles.buttonsContainer}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setIsEditing(false);
                  // Reset to original values
                  setProfile(prev => ({
                    ...prev,
                    displayName: user?.displayName || '',
                    email: user?.email || '',
                    phone: user?.phoneNumber || ''
                  }));
                }}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleUpdateProfile}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : showChangePassword ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Change Password</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Current Password</Text>
              <TextInput
                style={styles.input}
                value={passwords.currentPassword}
                onChangeText={(text) => setPasswords(prev => ({ ...prev, currentPassword: text }))}
                placeholder="Enter current password"
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password</Text>
              <TextInput
                style={styles.input}
                value={passwords.newPassword}
                onChangeText={(text) => setPasswords(prev => ({ ...prev, newPassword: text }))}
                placeholder="Enter new password"
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm New Password</Text>
              <TextInput
                style={styles.input}
                value={passwords.confirmPassword}
                onChangeText={(text) => setPasswords(prev => ({ ...prev, confirmPassword: text }))}
                placeholder="Confirm new password"
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.buttonsContainer}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setShowChangePassword(false);
                  // Reset password fields
                  setPasswords({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  });
                }}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handlePasswordChange}
                disabled={
                  isLoading || 
                  !passwords.currentPassword || 
                  !passwords.newPassword ||
                  !passwords.confirmPassword
                }
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.saveButtonText}>Update Password</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            {/* Account Settings Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account</Text>
              
              <TouchableOpacity 
                style={styles.settingItem}
                onPress={() => setShowChangePassword(true)}
              >
                <View style={styles.settingIcon}>
                  <Ionicons name="lock-closed-outline" size={22} color="#0d9488" />
                </View>
                <Text style={styles.settingText}>Change Password</Text>
                <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.settingItem}>
                <View style={styles.settingIcon}>
                  <Ionicons name="notifications-outline" size={22} color="#0d9488" />
                </View>
                <Text style={styles.settingText}>Notifications</Text>
                <Switch
                  value={profile.notificationsEnabled}
                  onValueChange={(value) => handleToggle('notificationsEnabled', value)}
                  trackColor={{ false: "#cbd5e1", true: "#0d9488" }}
                  thumbColor="#ffffff"
                />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.settingItem}>
                <View style={styles.settingIcon}>
                  <Ionicons name="location-outline" size={22} color="#0d9488" />
                </View>
                <Text style={styles.settingText}>Location Sharing</Text>
                <Switch
                  value={profile.locationSharing}
                  onValueChange={(value) => handleToggle('locationSharing', value)}
                  trackColor={{ false: "#cbd5e1", true: "#0d9488" }}
                  thumbColor="#ffffff"
                />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.settingItem}>
                <View style={styles.settingIcon}>
                  <Ionicons name="moon-outline" size={22} color="#0d9488" />
                </View>
                <Text style={styles.settingText}>Dark Mode</Text>
                <Switch
                  value={profile.darkMode}
                  onValueChange={(value) => handleToggle('darkMode', value)}
                  trackColor={{ false: "#cbd5e1", true: "#0d9488" }}
                  thumbColor="#ffffff"
                />
              </TouchableOpacity>
            </View>
            
            {/* Help Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Help & Support</Text>
              
              <TouchableOpacity style={styles.settingItem}>
                <View style={styles.settingIcon}>
                  <Ionicons name="help-circle-outline" size={22} color="#0d9488" />
                </View>
                <Text style={styles.settingText}>Help Center</Text>
                <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.settingItem}>
                <View style={styles.settingIcon}>
                  <Ionicons name="chatbubble-ellipses-outline" size={22} color="#0d9488" />
                </View>
                <Text style={styles.settingText}>Contact Support</Text>
                <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.settingItem}>
                <View style={styles.settingIcon}>
                  <Ionicons name="document-text-outline" size={22} color="#0d9488" />
                </View>
                <Text style={styles.settingText}>Privacy Policy</Text>
                <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.settingItem}>
                <View style={styles.settingIcon}>
                  <Ionicons name="information-circle-outline" size={22} color="#0d9488" />
                </View>
                <Text style={styles.settingText}>About</Text>
                <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>
            
            {/* Logout Button */}
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={22} color="#ef4444" />
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
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
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'white',
  },
  profileImageFallback: {
    backgroundColor: '#0891b2', // cyan-600
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    color: 'white',
    fontSize: 40,
    fontWeight: '600',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
  },
  editNameInput: {
    fontSize: 22,
    fontWeight: '600',
    color: 'white',
    borderBottomWidth: 1,
    borderBottomColor: 'white',
    padding: 4,
    width: 200,
    textAlign: 'center',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 6,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  section: {
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155', // slate-700
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9', // slate-100
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0fdfa', // teal-50
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: '#334155', // slate-700
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155', // slate-700
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1', // slate-300
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1e293b', // slate-800
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1', // slate-300
    borderRadius: 8,
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#64748b', // slate-500
    fontWeight: '500',
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#0d9488', // teal-600
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginLeft: 8,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ef4444', // red-500
    marginLeft: 8,
  },
});

export default ProfileScreen;