import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Keyboard,
  Animated,
  Platform
} from 'react-native';

import { verifyStudent, verifyTeacher, verifyAdmin } from '../Database/Read';

export default function WelcomeScreen({ navigation }) {
  const [userType, setUserType] = useState('');
  const [userID, setUserID] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const translateY = useRef(new Animated.Value(0)).current; // Animation for moving elements

  useEffect(() => {
    const keyboardShowListener = Keyboard.addListener('keyboardDidShow', () => {
      Animated.timing(translateY, {
        toValue: -100, // Move up when keyboard appears
        duration: 300,
        useNativeDriver: true,
      }).start();
    });

    const keyboardHideListener = Keyboard.addListener('keyboardDidHide', () => {
      Animated.timing(translateY, {
        toValue: 0, // Move back down when keyboard disappears
        duration: 300,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    };
  }, []);

  const handleLogin = async () => {
    if (!userID) {
      Alert.alert('Error', 'Please enter a valid ID');
      return;
    }
    switch (userType) {
      case 'parent':
        if (await verifyStudent(userID)) {
          navigation.navigate('ParentDashboard', { student_id: userID });
        } else {
          Alert.alert('Error', 'Invalid student ID');
        }
        break;
      case 'teacher':
        if (await verifyTeacher(userID)) {
          navigation.navigate('TeacherDashboard', { teacher_id: userID });
        } else {
          Alert.alert('Error', 'Invalid teacher ID');
        }
        break;
      case 'admin':              
        if (await verifyAdmin(userID)) {
          navigation.navigate('AdminDashboard', { admin_id: userID });
        } else {
          Alert.alert('Error', 'Invalid admin ID');
        }
        break;
      default:
        Alert.alert('Error', 'Please select a valid user type');
    }
  };

  const handleUserTypeSelection = (type) => {
    setUserType(type);
    setShowLogin(true);
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.innerContainer, { transform: [{ translateY }] }]}>
        <Text style={styles.title}>Welcome to Queue Manager</Text>

        <TouchableOpacity
          style={[styles.button, userType === 'parent' && styles.selectedButton]}
          onPress={() => handleUserTypeSelection('parent')}>
          <Text style={styles.buttonText}>Parent</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, userType === 'teacher' && styles.selectedButton]}
          onPress={() => handleUserTypeSelection('teacher')}>
          <Text style={styles.buttonText}>Teacher</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, userType === 'admin' && styles.selectedButton]}
          onPress={() => handleUserTypeSelection('admin')}>
          <Text style={styles.buttonText}>Admin</Text>
        </TouchableOpacity>

        {showLogin && (
          <>
            <TextInput
              style={styles.input}
              placeholder={"Enter Your " + _.capitalize(userType) + " ID"}
              value={userID}
              onChangeText={setUserID}
              returnKeyType="done"
              onSubmitEditing={handleLogin} // Pressing Enter submits login
              blurOnSubmit={false} // Prevents keyboard from closing automatically
            />
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          </>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  innerContainer: {
    alignItems: 'center',
    width: '100%',
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  button: {
    padding: 15,
    backgroundColor: '#6200EE',
    borderRadius: 5,
    marginBottom: 10,
    width: '80%',
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#03DAC6', // Changes color when selected
  },
  buttonText: { color: '#FFF', fontSize: 18 },
  input: {
    width: '80%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#CCC',
    marginTop: 20,
    borderRadius: 5,
    backgroundColor: '#FFF',
    textAlign: 'center',
  },
  loginButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#03DAC6',
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
  loginButtonText: { color: '#FFF', fontSize: 18 },
});
