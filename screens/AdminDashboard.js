import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

export default function AdminDashboard({ navigation }) {
  const handleAlert = (type) => {
    Alert.alert(`${type} List`, `Viewing ${type} list.`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Admin Dashboard</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("ManageQueues")}>
        <Text style={styles.buttonText}>Manage Queues</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("ManageStudents")}>
        <Text style={styles.buttonText}>View Students</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("ManageTeachers")}>
        <Text style={styles.buttonText}>View Teachers</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("ManageAdmins")}>
        <Text style={styles.buttonText}>View Admins</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("ManageCourses")}>
        <Text style={styles.buttonText}>View Courses</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("ManageClassrooms")}>
        <Text style={styles.buttonText}>View Classrooms</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("ManageSubjects")}>
        <Text style={styles.buttonText}>View Subjects</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("ImportExcel")}>
        <Text style={styles.buttonText}>Import Data</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  button: {
    padding: 15,
    backgroundColor: '#BB86FC',
    borderRadius: 5,
    marginBottom: 15,
  },
  buttonText: { color: '#FFF', fontSize: 16 },
});
