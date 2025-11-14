import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import { useAuth } from '../contexts/AuthContext';
import { NavigationProp, ParamListBase } from '@react-navigation/native';

// Ensure WebBrowser redirects are handled properly
WebBrowser.maybeCompleteAuthSession();



interface LoginScreenProps {
  navigation: NavigationProp<ParamListBase>;
}

const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Google Auth configuration with Firebase web client ID
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

  // Debug function to log the exact redirect URI
  React.useEffect(() => {
    const redirectUrl = makeRedirectUri({
      scheme: 'parivartan',
      path: 'oauth'
    });
    console.log('Current redirect URI:', redirectUrl);
    console.log('Client ID being used:', Platform.OS === 'ios' 
      ? '656712268788-c0sjvosg5rke7t90gq830o69l7bfuk8n.apps.googleusercontent.com' 
      : Platform.OS === 'android' 
        ? '656712268788-lup21roadq9cl1sl5nq74l62br1d2vl2.apps.googleusercontent.com'
        : '656712268788-m9ljjubdsde7vr6s6j20ecpbb28tffb8.apps.googleusercontent.com');
  }, []);

  // Use the auth context
  const { login, googleSignIn, error: authError, clearError } = useAuth();
  
  // Handle standard email/password login
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      // Navigation will be handled by the auth state listener in AuthContext
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Could not login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google Sign-in
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
      
      // Proceed directly with Firebase sign-in using the access token
      const handleGoogleAuth = async () => {
        try {
          await googleSignIn(authentication.accessToken);
          console.log('Google sign-in completed successfully');
          // Navigate to main screen on successful login
          navigation.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          });
        } catch (error: any) {
          console.error('Google sign in error:', error);
          
          // Try to parse error message if it's a JSON string
          let errorMessage = 'Could not sign in with Google. Please try again.';
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
          
          Alert.alert('Google Sign-in Failed', errorMessage);
        } finally {
          setIsGoogleLoading(false);
        }
      };
      
      // Execute the function
      handleGoogleAuth();
    } else if (response?.type === 'error') {
      console.error('Google sign in response error:', response.error);
      Alert.alert('Google Sign-in Failed', response.error?.message || 'Could not sign in with Google. Please try again.');
      setIsGoogleLoading(false);
    }
  }, [response, googleSignIn, navigation]);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      console.log('Starting Google sign-in process...');
      
      // Make sure request is ready before proceeding
      if (!request) {
        console.log('Google sign-in request not ready yet');
        Alert.alert('Google Sign-in Not Ready', 'Please try again in a moment.');
        setIsGoogleLoading(false);
        return;
      }
      
      await promptAsync();
      // The rest is handled in the useEffect
    } catch (error: any) {
      console.error('Google sign in prompt error:', error);
      Alert.alert('Google Sign-in Failed', error.message || 'Could not open Google Sign-in. Please try again.');
      setIsGoogleLoading(false);
    }
  };
  
  // Clear any auth errors when component mounts or unmounts
  React.useEffect(() => {
    return () => clearError();
  }, [clearError]);

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          {/* Header with gradient */}
          <LinearGradient
            colors={['#14b8a6', '#0d9488']} // teal-500 to teal-600
            style={styles.header}
          >
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Welcome Back</Text>
              <Text style={styles.headerSubtitle}>Sign in to continue</Text>
            </View>
          </LinearGradient>

          {/* Login Form */}
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, { paddingRight: 50 }]}
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
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

            <TouchableOpacity 
              style={styles.forgotPassword}
              onPress={() => Alert.alert('Forgot Password', 'Reset password functionality would go here')}
            >
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.loginButton, isLoading && styles.disabledButton]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            {/* <View style={styles.divider}>
              <View style={styles.dividerLine}></View>
              <Text style={styles.dividerText}>Or continue with</Text>
              <View style={styles.dividerLine}></View>
            </View> */}

            {/* Google Sign In Button 
            <TouchableOpacity 
              style={[styles.googleButton, isGoogleLoading && styles.disabledButton]}
              onPress={handleGoogleSignIn}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                <ActivityIndicator color="#4285F4" />
              ) : (
                <>
                  <View style={styles.googleIconContainer}>
                    <Ionicons name="logo-google" size={16} color="white" />
                  </View>
                  <Text style={styles.googleButtonText}>Sign in with Google</Text>
                </>
              )}
            </TouchableOpacity> */}
          </View>

          {/* Sign Up Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc', // slate-50
  },
  inner: {
    flex: 1,
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
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#0d9488', // teal-600
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#0d9488', // teal-600
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
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
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  signupText: {
    color: '#64748b', // slate-500
    fontSize: 14,
  },
  signupLink: {
    color: '#0d9488', // teal-600
    fontWeight: '600',
    fontSize: 14,
  },
});

export default LoginScreen;