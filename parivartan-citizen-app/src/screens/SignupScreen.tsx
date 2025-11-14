import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Alert
} from 'react-native';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';

import { useAuth } from '../contexts/AuthContext';

// Initialize WebBrowser for auth
WebBrowser.maybeCompleteAuthSession();

interface SignupScreenProps {
  navigation: NavigationProp<ParamListBase>;
}

const SignupScreen = ({ navigation }: SignupScreenProps) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Google Auth configuration
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '656712268788-m9ljjubdsde7vr6s6j20ecpbb28tffb8.apps.googleusercontent.com', // Web client ID from Firebase
    androidClientId: '656712268788-lup21roadq9cl1sl5nq74l62br1d2vl2.apps.googleusercontent.com', // Android client ID from google-services.json
    iosClientId: '656712268788-c0sjvosg5rke7t90gq830o69l7bfuk8n.apps.googleusercontent.com', // iOS client ID
    scopes: ['profile', 'email'],
    // Configure redirect URI for development and production
    redirectUri: makeRedirectUri({
      scheme: 'parivartan',
      path: 'oauth'
    }),
    usePKCE: true
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validatePasswordMatch = () => {
    return formData.password === formData.confirmPassword || formData.confirmPassword === '';
  };

  const isValidForm = () => {
    return (
      formData.fullName.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.password.trim() !== '' &&
      formData.confirmPassword.trim() !== '' &&
      formData.password === formData.confirmPassword
    );
  };

  // Use the auth context
  const { register, googleSignIn, error: authError, clearError } = useAuth();
  
  const handleSignup = async () => {
    if (!isValidForm()) {
      Alert.alert('Error', 'Please fill all required fields and ensure passwords match');
      return;
    }

    setIsLoading(true);
    try {
      // Register with the backend using our AuthContext
      await register(
        formData.email,
        formData.password,
        formData.fullName,
        formData.phone || undefined
      );
      
      setStep(2); // Move to success screen
    } catch (error: any) {
      // Format the error message properly
      let errorMessage = 'Could not sign up. Please try again.';
      
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && error.message) {
        errorMessage = error.message;
        
        // Try to parse JSON error message if it's stringified JSON
        try {
          const parsedError = JSON.parse(error.message);
          if (parsedError && typeof parsedError === 'object') {
            errorMessage = parsedError.message || parsedError.error || JSON.stringify(parsedError);
          }
        } catch (parseError) {
          // Not a JSON string, use as is
        }
      } else if (error && typeof error === 'object') {
        errorMessage = JSON.stringify(error);
      }
      
      // Check for Firebase email-already-in-use error
      if (errorMessage.includes('email address is already in use')) {
        Alert.alert(
          'Email Already Registered', 
          'This email address is already registered. Please sign in or use a different email address.',
          [
            { text: 'Sign In', onPress: () => navigation.navigate('Login') },
            { text: 'Try Again', style: 'cancel' }
          ]
        );
      } else {
        Alert.alert('Signup Failed', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    try {
      console.log('Starting Google sign-up process...');
      
      // Make sure request is ready before proceeding
      if (!request) {
        console.log('Google sign-up request not ready yet');
        Alert.alert('Google Sign-up Not Ready', 'Please try again in a moment.');
        setIsGoogleLoading(false);
        return;
      }
      
      await promptAsync();
      // The rest is handled in the useEffect
    } catch (error: any) {
      console.error('Google sign up prompt error:', error);
      Alert.alert('Google Sign-up Failed', error.message || 'Could not open Google Sign-up. Please try again.');
      setIsGoogleLoading(false);
    }
  };
  
  // Handle Google Sign-up response
  React.useEffect(() => {
    if (response?.type === 'success') {
      setIsGoogleLoading(true);
      const { authentication } = response;
      
      console.log('Google authentication received:', authentication);
      
      if (!authentication || !authentication.accessToken) {
        console.error('No access token received from Google');
        Alert.alert('Authentication Error', 'No access token received from Google');
        setIsGoogleLoading(false);
        return;
      }
      
      // Proceed with Firebase sign-up using the access token
      const handleGoogleAuth = async () => {
        try {
          await googleSignIn(authentication.accessToken);
          console.log('Google sign-up completed successfully');
          setStep(2); // Move to success screen
        } catch (error: any) {
          console.error('Google sign up error:', error);
          
          // Try to parse error message if it's a JSON string
          let errorMessage = 'Could not sign up with Google. Please try again.';
          if (typeof error === 'string') {
            errorMessage = error;
          } else if (error.message) {
            errorMessage = error.message;
            try {
              // Try to parse JSON error message
              const parsedError = JSON.parse(error.message);
              if (parsedError.error && parsedError.error.message) {
                errorMessage = parsedError.error.message;
              }
            } catch (parseError) {
              // Ignore parsing errors
            }
          }
          
          Alert.alert('Google Sign-up Failed', errorMessage);
        } finally {
          setIsGoogleLoading(false);
        }
      };
      
      // Execute the function
      handleGoogleAuth();
    } else if (response?.type === 'error') {
      console.error('Google sign up response error:', response.error);
      Alert.alert('Google Sign-up Failed', response.error?.message || 'Could not sign up with Google. Please try again.');
      setIsGoogleLoading(false);
    }
  }, [response, googleSignIn, setStep]);

  // Clear any auth errors when component mounts or unmounts
  React.useEffect(() => {
    return () => clearError();
  }, [clearError]);

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Header with gradient */}
      <LinearGradient
        colors={['#14b8a6', '#0d9488']} // teal-500 to teal-600
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => step === 1 ? navigation.navigate('Login') : setStep(1)}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {step === 1 ? 'Create Account' : 'Success'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {step === 1 ? 'Sign up to get started' : 'Your account has been created'}
          </Text>
        </View>
      </LinearGradient>

      {step === 1 ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View>
              {/* Signup Form */}
              <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Full Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChangeText={(value) => handleInputChange('fullName', value)}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    value={formData.email}
                    onChangeText={(value) => handleInputChange('email', value)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Phone Number (Optional)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChangeText={(value) => handleInputChange('phone', value)}
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={[styles.input, { paddingRight: 50 }]}
                      placeholder="Create a password"
                      secureTextEntry={!showPassword}
                      value={formData.password}
                      onChangeText={(value) => handleInputChange('password', value)}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity 
                      style={styles.eyeIcon}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Ionicons 
                        name={showPassword ? "eye-off" : "eye"} 
                        size={22} 
                        color="#94a3b8" 
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={[
                        styles.input, 
                        { paddingRight: 50 },
                        formData.confirmPassword && !validatePasswordMatch() && styles.inputError
                      ]}
                      placeholder="Confirm your password"
                      secureTextEntry={!showConfirmPassword}
                      value={formData.confirmPassword}
                      onChangeText={(value) => handleInputChange('confirmPassword', value)}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity 
                      style={styles.eyeIcon}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <Ionicons 
                        name={showConfirmPassword ? "eye-off" : "eye"} 
                        size={22} 
                        color="#94a3b8" 
                      />
                    </TouchableOpacity>
                  </View>
                  {formData.confirmPassword && !validatePasswordMatch() && (
                    <Text style={styles.errorText}>Passwords do not match</Text>
                  )}
                </View>

                <TouchableOpacity 
                  style={[
                    styles.signupButton,
                    (!isValidForm() || isLoading) && styles.disabledButton
                  ]}
                  onPress={handleSignup}
                  disabled={!isValidForm() || isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.signupButtonText}>Create Account</Text>
                  )}
                </TouchableOpacity>

                {/* Divider */}
                {/* <View style={styles.divider}>
                  <View style={styles.dividerLine}></View>
                  <Text style={styles.dividerText}>Or sign up with</Text>
                  <View style={styles.dividerLine}></View>
                </View> */}

                {/* Google Sign Up Button 
                <TouchableOpacity 
                  style={[styles.googleButton, isGoogleLoading && styles.disabledButton]}
                  onPress={handleGoogleSignUp}
                  disabled={isGoogleLoading}
                >
                  {isGoogleLoading ? (
                    <ActivityIndicator color="#4285F4" />
                  ) : (
                    <>
                      <View style={styles.googleIconContainer}>
                        <Ionicons name="logo-google" size={16} color="white" />
                      </View>
                      <Text style={styles.googleButtonText}>Sign up with Google</Text>
                    </>
                  )}
                </TouchableOpacity> */}
              </View>

              {/* Login Link */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginLink}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      ) : (
        /* Success Screen */
        <View style={styles.successContainer}>
          <View style={styles.successCard}>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={64} color="#10b981" />
            </View>
            <Text style={styles.successTitle}>Account Created!</Text>
            <Text style={styles.successDescription}>
              Your account has been created successfully. You can now sign in to access all features.
            </Text>
            <TouchableOpacity 
              style={styles.continueButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.continueButtonText}>Continue to Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc', // slate-50
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  headerContent: {
    marginTop: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: -20,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155', // slate-700
    marginBottom: 6,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1', // slate-300
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1e293b', // slate-800
  },
  inputError: {
    borderColor: '#ef4444', // red-500
  },
  errorText: {
    color: '#ef4444', // red-500
    fontSize: 12,
    marginTop: 4,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  signupButton: {
    backgroundColor: '#0d9488', // teal-600
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  signupButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.7,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#cbd5e1', // slate-300
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#64748b', // slate-500
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1', // slate-300
    borderRadius: 8,
    padding: 12,
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    paddingTop: 1,
  },

  googleButtonText: {
    color: '#1e293b', // slate-800
    fontSize: 16,
    fontWeight: '500',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loginText: {
    color: '#64748b', // slate-500
    fontSize: 14,
  },
  loginLink: {
    color: '#0d9488', // teal-600
    fontWeight: '600',
    fontSize: 14,
  },
  // Success Screen
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  successCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  successIconContainer: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1e293b', // slate-800
    marginBottom: 8,
  },
  successDescription: {
    fontSize: 14,
    color: '#64748b', // slate-500
    textAlign: 'center',
    marginBottom: 24,
  },
  continueButton: {
    backgroundColor: '#0d9488', // teal-600
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  }
});

export default SignupScreen;