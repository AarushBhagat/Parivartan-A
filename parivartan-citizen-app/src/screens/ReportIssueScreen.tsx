import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ToastAndroid
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { auth } from '../firebase';
import DropDownPicker from 'react-native-dropdown-picker';
import { issueService, uploadService } from '../services';
import { useAuth } from '../contexts/AuthContext';

interface ReportIssueScreenProps {
  navigation: any;
}

interface LocationInfo {
  latitude: number;
  longitude: number;
  address: string;
  district: string;
}

interface MediaFile {
  uri: string;
  type: string;
  name: string;
}

const ReportIssueScreen: React.FC<ReportIssueScreenProps> = ({ navigation }) => {
  const { user } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: '',
  });

  // DropDown state
  const [open, setOpen] = useState(false);
  const [departments, setDepartments] = useState([
    { label: 'PWD (Public Works Department)', value: 'pwd' },
    { label: 'Municipal Corporation', value: 'municipal' },
    { label: 'Traffic Police', value: 'traffic-police' },
    { label: 'Water & Sanitation', value: 'water-sanitation' },
    { label: 'PSPCL (Punjab State Power)', value: 'pspcl' },
    { label: 'Health & Welfare', value: 'health-welfare' },
    { label: 'Civil Surgeon', value: 'civil-surgeon' },
    { label: 'Punjab Police', value: 'punjab-police' },
    { label: 'Education Department', value: 'education' },
    { label: 'Agriculture Department', value: 'agriculture' },
    { label: 'Food & Civil Supplies', value: 'food-civil-supplies' },
    { label: 'Punjab Roadways', value: 'roadways' },
    { label: 'RTO (Regional Transport)', value: 'rto' },
    { label: 'Revenue Department', value: 'revenue' },
    { label: 'Social Security', value: 'social-security' },
    { label: 'Pollution Control Board', value: 'pollution-control' },
    { label: 'Forest Department', value: 'forest' },
    { label: 'Disaster Management', value: 'disaster-management' },
  ]);

  // Images and location
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Form submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detect location on component mount
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        getLocation();
      }
    })();
  }, []);

  // Get current location
  const getLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Reverse geocoding to get address
      const addressResponse = await Location.reverseGeocodeAsync({ latitude, longitude });

      let address = 'Unknown location';
      let district = 'Unknown District';

      if (addressResponse && addressResponse.length > 0) {
        const addressInfo = addressResponse[0];
        address = [
          addressInfo.name,
          addressInfo.street,
          addressInfo.district,
          addressInfo.city,
        ]
          .filter(Boolean)
          .join(', ');

        district = addressInfo.district || addressInfo.city || 'Unknown District';
      }

      setLocation({ latitude, longitude, address, district });
    } catch (error) {
      console.log('Error getting location:', error);
      Alert.alert('Location Error', 'Could not detect your location. Please try again or enter manually.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Pick image from gallery
  const pickImage = async () => {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permissions to upload photos.');
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      // Limit to 5 images (as per backend)
      if (mediaFiles.length >= 5) {
        Alert.alert('Limit Reached', 'You can upload a maximum of 5 images.');
        return;
      }

      const asset = result.assets[0];
      const mediaFile: MediaFile = {
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        name: asset.fileName || `image_${Date.now()}.jpg`,
      };

      setMediaFiles([...mediaFiles, mediaFile]);
    }
  };

  // Take photo with camera
  const takePhoto = async () => {
    // Request permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera permissions to take photos.');
      return;
    }

    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      // Limit to 5 images (as per backend)
      if (mediaFiles.length >= 5) {
        Alert.alert('Limit Reached', 'You can upload a maximum of 5 images.');
        return;
      }

      const asset = result.assets[0];
      const mediaFile: MediaFile = {
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        name: asset.fileName || `photo_${Date.now()}.jpg`,
      };

      setMediaFiles([...mediaFiles, mediaFile]);
    }
  };

  // Remove an image
  const removeImage = (index: number) => {
    const newMediaFiles = [...mediaFiles];
    newMediaFiles.splice(index, 1);
    setMediaFiles(newMediaFiles);
  };

  // Update form data
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Validate form
  const isFormValid = () => {
    return (
      formData.title.trim() !== '' &&
      formData.description.trim() !== '' &&
      formData.department !== '' &&
      location !== null
    );
  };

  // Submit issue report
  const handleSubmit = async () => {
    if (!isFormValid()) {
      Alert.alert('Missing Information', 'Please fill in all required fields and ensure location is detected.');
      return;
    }

    if (!user) {
      Alert.alert('Authentication Error', 'You must be logged in to report an issue.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Upload photos to AWS S3 first (if any)
      let photoUrls: string[] = [];
      
      if (mediaFiles && mediaFiles.length > 0) {
        console.log(`Uploading ${mediaFiles.length} photos to AWS S3...`);
        
        try {
          const uploadResult = await uploadService.uploadPhotos(mediaFiles, 'issue');
          
          if (uploadResult.success && uploadResult.files) {
            photoUrls = uploadResult.files.map((file: any) => file.url);
            console.log('✅ Photos uploaded to AWS S3:', photoUrls);
          }
        } catch (uploadError) {
          console.error('Photo upload error:', uploadError);
          Alert.alert(
            'Photo Upload Failed',
            'Could not upload photos to cloud storage. Do you want to submit without photos?',
            [
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => setIsSubmitting(false)
              },
              {
                text: 'Submit Without Photos',
                onPress: () => {
                  // Continue with empty photoUrls
                  console.log('Continuing without photos');
                }
              }
            ]
          );
          
          // If user doesn't choose, return
          if (photoUrls.length === 0 && mediaFiles.length > 0) {
            return;
          }
        }
      }

      // Step 2: Prepare issue data with AWS S3 photo URLs
      const issueData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        department: formData.department,
        location: {
          latitude: location!.latitude,
          longitude: location!.longitude,
          address: location!.address,
          district: location!.district,
        },
        photoUrls: photoUrls, // Add AWS S3 photo URLs
      };

      // Step 3: Submit issue to backend/Firebase
      console.log('Submitting issue with AWS S3 photo URLs:', photoUrls.length);
      const response = await issueService.createIssue(issueData, []);

      console.log('Issue created successfully:', response);
      
      // Check if we have an issue ID in the response
      const issueId = response?.issue?.id || (typeof response === 'object' && response.id);
      console.log('Created issue ID:', issueId);
      
      if (Platform.OS === 'android') {
        ToastAndroid.show('Issue reported successfully!', ToastAndroid.LONG);
      }

      // Reset form
      setFormData({ title: '', description: '', department: '' });
      setMediaFiles([]);
      setLocation(null);

      Alert.alert(
        'Report Submitted',
        'Your issue has been reported successfully. You can track its status in My Issues.',
        [
          {
            text: 'View Details',
            onPress: () => {
              if (issueId) {
                console.log('Navigating to issue detail for:', issueId);
                navigation.navigate('IssueDetail', { issueId });
              } else {
                console.log('No issue ID available, going to My Complaints');
                navigation.navigate('MyComplaints');
              }
            },
            style: 'default'
          },
          {
            text: 'Done',
            onPress: () => navigation.navigate('Home'),
            style: 'cancel'
          },
        ]
      );

    } catch (error) {
      console.error('Error submitting issue:', error);
      Alert.alert(
        'Submission Failed',
        error instanceof Error ? error.message : 'Failed to submit your report. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView style={styles.scrollView}>
          {/* Header */}
          <LinearGradient
            colors={['#14b8a6', '#0d9488']} // teal-500 to teal-600
            style={styles.header}
          >
            <Text style={styles.headerTitle}>Report an Issue</Text>
            <Text style={styles.headerSubtitle}>
              Help improve your community by reporting issues
            </Text>
          </LinearGradient>

          {/* Form Container */}
          <View style={styles.formContainer}>
            {/* Title Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="Brief title of the issue"
                value={formData.title}
                onChangeText={(value) => handleInputChange('title', value)}
                maxLength={50}
              />
              <Text style={styles.charCount}>{formData.title.length}/50</Text>
            </View>

            {/* Department Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Department <Text style={styles.required}>*</Text></Text>
              <DropDownPicker
                open={open}
                value={formData.department}
                items={departments}
                setOpen={setOpen}
                setValue={(callback) => {
                  if (typeof callback === 'function') {
                    const value = callback(formData.department);
                    handleInputChange('department', value);
                  } else {
                    handleInputChange('department', callback);
                  }
                }}
                setItems={setDepartments}
                placeholder="Select department"
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                textStyle={styles.dropdownText}
                zIndex={3000}
                zIndexInverse={1000}
              />
            </View>

            {/* Description Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.textArea}
                placeholder="Detailed description of the issue"
                value={formData.description}
                onChangeText={(value) => handleInputChange('description', value)}
                multiline={true}
                numberOfLines={6}
                maxLength={500}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{formData.description.length}/500</Text>
            </View>

            {/* Location */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location <Text style={styles.required}>*</Text></Text>
              {isLoadingLocation ? (
                <View style={styles.locationLoading}>
                  <ActivityIndicator color="#0d9488" />
                  <Text style={styles.locationLoadingText}>Detecting your location...</Text>
                </View>
              ) : location ? (
                <View style={styles.locationContainer}>
                  <View style={styles.locationContent}>
                    <Ionicons name="location" size={20} color="#0d9488" />
                    <View style={styles.locationTextContainer}>
                      <Text style={styles.locationText}>{location.address}</Text>
                      <Text style={styles.locationCoords}>
                        {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.refreshLocationButton}
                    onPress={getLocation}
                  >
                    <Ionicons name="refresh" size={20} color="#0d9488" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.detectLocationButton}
                  onPress={getLocation}
                >
                  <Ionicons name="location" size={20} color="white" />
                  <Text style={styles.detectLocationText}>Detect My Location</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Image Upload */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Upload Images (Optional)</Text>
              <Text style={styles.helperText}>Add up to 5 images to help describe the issue</Text>

              <View style={styles.imageActions}>
                <TouchableOpacity
                  style={styles.imageActionButton}
                  onPress={takePhoto}
                  disabled={mediaFiles.length >= 5}
                >
                  <Ionicons name="camera" size={22} color="#0d9488" />
                  <Text style={styles.imageActionText}>Take Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.imageActionButton}
                  onPress={pickImage}
                  disabled={mediaFiles.length >= 5}
                >
                  <Ionicons name="images" size={22} color="#0d9488" />
                  <Text style={styles.imageActionText}>Choose from Gallery</Text>
                </TouchableOpacity>
              </View>

              {mediaFiles.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.imagesContainer}
                >
                  {mediaFiles.map((file, index) => (
                    <View key={index} style={styles.imageWrapper}>
                      <Image source={{ uri: file.uri }} style={styles.uploadedImage} />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => removeImage(index)}
                      >
                        <Ionicons name="close-circle" size={24} color="white" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!isFormValid() || isSubmitting) && styles.disabledButton
              ]}
              onPress={handleSubmit}
              disabled={!isFormValid() || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="send" size={20} color="white" />
                  <Text style={styles.submitButtonText}>Submit Report</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc', // slate-50
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'center',
    paddingHorizontal: 16,
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
  formContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#334155', // slate-700
    marginBottom: 8,
  },
  required: {
    color: '#ef4444', // red-500
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#cbd5e1', // slate-300
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  charCount: {
    fontSize: 12,
    color: '#64748b', // slate-500
    textAlign: 'right',
    marginTop: 4,
  },
  textArea: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#cbd5e1', // slate-300
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
  },
  dropdown: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#cbd5e1', // slate-300
    borderRadius: 8,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  dropdownContainer: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#cbd5e1', // slate-300
    borderRadius: 8,
  },
  dropdownText: {
    fontSize: 16,
    color: '#334155', // slate-700
  },
  locationLoading: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#cbd5e1', // slate-300
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationLoadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#64748b', // slate-500
  },
  detectLocationButton: {
    backgroundColor: '#0d9488', // teal-600
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detectLocationText: {
    fontSize: 16,
    color: 'white',
    marginLeft: 8,
    fontWeight: '500',
  },
  locationContainer: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#cbd5e1', // slate-300
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationTextContainer: {
    marginLeft: 8,
    flex: 1,
  },
  locationText: {
    fontSize: 14,
    color: '#334155', // slate-700
  },
  locationCoords: {
    fontSize: 12,
    color: '#64748b', // slate-500
    marginTop: 2,
  },
  refreshLocationButton: {
    padding: 4,
  },
  helperText: {
    fontSize: 14,
    color: '#64748b', // slate-500
    marginBottom: 12,
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  imageActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#cbd5e1', // slate-300
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
  },
  imageActionText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#334155', // slate-700
  },
  imagesContainer: {
    paddingVertical: 8,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 8,
  },
  uploadedImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
  },
  submitButton: {
    backgroundColor: '#0d9488', // teal-600
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  }
});

export default ReportIssueScreen;