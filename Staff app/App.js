import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';

import Login from './screens/Login';
import Dashboard from './screens/Dashboard';
import IssueList from './screens/IssueList';
import IssueDetail from './screens/IssueDetail';
import MapView from './screens/MapView';
import Settings from './screens/Settings';
import Notifications from './screens/Notifications';
import WorkHistory from './screens/WorkHistory';

import { mockNotifications } from './data/mockData';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function IssueStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="IssueList"
        component={IssueList}
        options={{
          title: 'My Issues',
          headerStyle: { backgroundColor: '#11ad9d' },
          headerTintColor: '#fff'
        }}
      />
      <Stack.Screen
        name="IssueDetail"
        component={IssueDetail}
        options={{
          title: 'Issue Details',
          headerStyle: { backgroundColor: '#11ad9d' },
          headerTintColor: '#fff'
        }}
      />
    </Stack.Navigator>
  );
}

function SettingsStack({ currentUser }) {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SettingsMain"
        options={{
          title: 'Settings',
          headerStyle: { backgroundColor: '#11ad9d' },
          headerTintColor: '#fff'
        }}
      >
        {(props) => <Settings {...props} currentUser={currentUser} />}
      </Stack.Screen>
      <Stack.Screen
        name="Notifications"
        component={Notifications}
        options={{
          title: 'Notifications',
          headerStyle: { backgroundColor: '#11ad9d' },
          headerTintColor: '#fff'
        }}
      />
      <Stack.Screen
        name="WorkHistory"
        component={WorkHistory}
        options={{
          title: 'Work History',
          headerStyle: { backgroundColor: '#11ad9d' },
          headerTintColor: '#fff'
        }}
      />
    </Stack.Navigator>
  );
}

function MainTabs({ currentUser, setCurrentUser, issues, setIssues }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Issues') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'SettingsTab') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#11ad9d',
        tabBarInactiveTintColor: '#6b7280',
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Dashboard"
        options={{ title: 'Dashboard' }}
      >
        {(props) => <Dashboard {...props} user={currentUser} issues={issues} />}
      </Tab.Screen>
      <Tab.Screen
        name="Issues"
        options={{ title: 'Issues' }}
      >
        {(props) => <IssueStack {...props} />}
      </Tab.Screen>
      <Tab.Screen
        name="Map"
        options={{ title: 'Map' }}
      >
        {(props) => <MapView {...props} user={currentUser} issues={issues} />}
      </Tab.Screen>
      <Tab.Screen
        name="SettingsTab"
        options={{ title: 'Settings' }}
      >
        {(props) => <SettingsStack {...props} currentUser={currentUser} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [issues, setIssues] = useState([]);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [loading, setLoading] = useState(false);

  // Load grievances from Firebase when user logs in
  useEffect(() => {
    if (currentUser) {
      loadGrievances();
    }
  }, [currentUser]);

  const loadGrievances = async () => {
    setLoading(true);
    try {
      const grievancesRef = collection(db, 'grievances');
      
      // Filter by staff UID - show only grievances assigned to this staff member
      let q = query(grievancesRef, where('assignedTo', '==', currentUser.uid));
      
      const snapshot = await getDocs(q);
      const grievancesList = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || 'Untitled',
          description: data.description || '',
          category: data.category || 'Other',
          status: data.status || 'pending',
          priority: data.priority || 'medium',
          location: data.location || {},
          imageUrl: data.imageUrl || data.images?.[0] || null,
          citizenName: data.citizenName || 'Anonymous',
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
          assignedTo: data.assignedTo || null,
          assignedToName: data.assignedToName || null,
          assignedAt: data.assignedAt || null,
          comments: data.comments || [],
          upvotes: data.upvotes || 0,
          department: data.department || currentUser.department,
        };
      });

      // Sort by date (newest first)
      grievancesList.sort((a, b) => b.createdAt - a.createdAt);
      
      setIssues(grievancesList);
      console.log(`Loaded ${grievancesList.length} grievances assigned to ${currentUser.displayName || currentUser.email}`);
    } catch (error) {
      console.error('Error loading grievances:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleUpdateProfile = (updates) => {
    setCurrentUser({ ...currentUser, ...updates });
  };

  const handleUpdateIssue = async (issueId, updates) => {
    // Update local state immediately
    setIssues(issues.map(issue =>
      issue.id === issueId ? { ...issue, ...updates } : issue
    ));
    
    // TODO: Update Firebase
    // You can add Firebase update logic here later
  };

  const handleAddComment = async (issueId, comment) => {
    // Update local state immediately
    setIssues(issues.map(issue =>
      issue.id === issueId
        ? { ...issue, comments: [...issue.comments, comment] }
        : issue
    ));
    
    // TODO: Update Firebase
    // You can add Firebase update logic here later
  };

  return (
    <PaperProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        {!currentUser ? (
          <Login onLogin={handleLogin} />
        ) : (
          <MainTabs
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            issues={issues}
            setIssues={setIssues}
            notifications={notifications}
            setNotifications={setNotifications}
            onLogout={handleLogout}
            onUpdateProfile={handleUpdateProfile}
            onUpdateIssue={handleUpdateIssue}
            onAddComment={handleAddComment}
          />
        )}
      </NavigationContainer>
    </PaperProvider>
  );
}
