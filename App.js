import React, { useEffect, useState, useRef } from 'react'; 
import { View, Text, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native'; 
import { createStackNavigator } from '@react-navigation/stack'; 
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import WelcomeScreen from './screens/WelcomeScreen'; // comments
import ParentDashboard from './screens/ParentDashboard'; 
import TeacherDashboard from './screens/TeacherDashboard'; 
import AdminDashboard from './screens/AdminDashboard'; 
import SubjectQueue from './screens/SubjectQueue'; 
import SubjectList from './screens/SubjectList';
import ImportExcel from './screens/ImportExcel';
import {ManageTeachers, ManageStudents, ManageAdmins, ManageCourses, ManageSubjects, ManageClassrooms, ManageQueues} from './screens/View'; 
import AdminQueue from './screens/AdminQueue';

const Stack = createStackNavigator();

export default function App() {  
  const [expoPushToken, setExpoPushToken] = useState('');
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {      
    // Request notifications permission and get push token
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    // Listen for foreground notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log("Received Notification: ", notification);
    });


    // Handle user tapping on a notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log("User interacted with Notification: ", response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome">
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="ParentDashboard" component={ParentDashboard} />
        <Stack.Screen name="TeacherDashboard" component={TeacherDashboard} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
        <Stack.Screen name="SubjectQueue" component={SubjectQueue} />
        <Stack.Screen name="ManageTeachers" component={ManageTeachers} />
        <Stack.Screen name="ManageStudents" component={ManageStudents} />
        <Stack.Screen name="ManageAdmins" component={ManageAdmins} />
        <Stack.Screen name="ManageCourses" component={ManageCourses} />
        <Stack.Screen name="ManageSubjects" component={ManageSubjects} />
        <Stack.Screen name="ManageClassrooms" component={ManageClassrooms} />
        <Stack.Screen name="ImportExcel" component={ImportExcel} />
        <Stack.Screen name="ManageQueues" component={ManageQueues} />
        <Stack.Screen name="AdminQueue" component={AdminQueue} />
        <Stack.Screen name="SubjectList" component={SubjectList} />
      </Stack.Navigator>
      
    </NavigationContainer>
  );
}

// Request Notification Permissions & Get Push Token
async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Permission for push notifications was denied!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("Expo Push Token:", token);
  } else {
    alert('Must use a physical device for push notifications');
  }

  // Set notification handler for foreground
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
  return token;
}


