import React, { useState, useEffect } from 'react';
import { View, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { API_CONFIG } from './src/config/api.config';
import { initializeDemoEnvironment } from './src/demoInitializer';

// Import screens
import SplashScreen from './src/screens/SplashScreen';
import IntroScreen from './src/screens/IntroScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import HomeScreen from './src/screens/HomeScreen';
import MapScreen from './src/screens/MapScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import CommunityScreen from './src/screens/CommunityScreen';
import ReportIssueScreen from './src/screens/ReportIssueScreen';
import MyComplaintsScreen from './src/screens/MyComplaintsScreen';
import IssueDetailScreen from './src/screens/IssueDetailScreen';
// Define navigation types
type RootStackParamList = {
  Splash: undefined;
  Intro: undefined;
  Login: undefined;
  Signup: undefined;
  Main: undefined;
  IssueDetail: { issueId: string };
  MyComplaints: undefined;
  ImageViewer: { images: string[], initialIndex: number };
};

type TabParamList = {
  Home: undefined;
  Map: undefined;
  Report: undefined;
  Community: undefined;
  Profile: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Tab Navigator
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Report') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Community') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0d9488',
        tabBarInactiveTintColor: '#64748b',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen 
        name="Report" 
        component={ReportIssueScreen}
        options={{
          tabBarLabel: 'Report Issue',
        }}
      />
      <Tab.Screen name="Community" component={CommunityScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Main App Navigator - This uses the AuthContext
function AppNavigator() {
  const { user, loading } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        // Authenticated user stack
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen 
            name="IssueDetail" 
            component={IssueDetailScreen}
            options={{ headerShown: true, title: 'Issue Details' }}
          />
          <Stack.Screen 
            name="MyComplaints" 
            component={MyComplaintsScreen}
            options={{ headerShown: true, title: 'My Issues' }}
          />
        </>
      ) : (
        // Unauthenticated user stack
        <>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Intro" component={IntroScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

// Root component with AuthProvider
export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize the app, potentially in demo mode
  useEffect(() => {
    const initialize = async () => {
      // Check if we should initialize in demo mode
      if (API_CONFIG.USE_MOCK_API) {
        await initializeDemoEnvironment();
      }
      setIsInitialized(true);
    };
    
    initialize();
  }, []);

  // Show a loading screen while initializing
  if (!isInitialized) {
    return (
      <>
        <StatusBar style="auto" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Image
            source={require('./assets/icon.png')}
            style={{ width: 200, height: 200 }}
            resizeMode="contain"
          />
        </View>
      </>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </NavigationContainer>
  );
}
