import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getQueueForTeacher, getTeacherById } from '../Database/Read';
import { removeQueue } from '../Database/Remove';

export default function AdminQueue({ route, navigation }) {
  const { teacherId } = route.params;
  const [queue, setQueue] = useState([]);
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQueue();
  }, [teacherId]);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const queue = await getQueueForTeacher(teacherId);
      setTeacher(await getTeacherById(teacherId)); // Fetch teacher details
      setQueue(queue);
    } catch (error) {
      console.error('Error fetching queue:', error);
      Alert.alert('Error', 'Failed to load queue data');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStudent = (studentId, subjectId) => {
    Alert.alert(
      'Confirm Removal',
      `Remove ${studentId} from ${subjectId} queue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            try {
              console.log(subjectId, studentId, teacherId);
              await removeQueue(subjectId, studentId, teacherId);
              fetchQueue(); // Refresh the queue
            } catch (error) {
              Alert.alert('Error', 'Failed to remove student');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading queue...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{teacher || 'Teacher'}'s Queue</Text>
      <Text style={styles.detailText}>{queue.length} {queue.length === 1 ? 'student' : 'students'} waiting</Text>   
      
      <ScrollView style={{ marginBottom: 20 }}>
        {queue.length > 0 ? (
          queue.map((student, index) => (
            <View key={`${student.student_id}-${student.subject_id}`} style={styles.queueBox}>
              <Text style={styles.queueText}>
                {index + 1}. {student.student_name}
              </Text>
              <Text style={styles.detailText}>{student.subject_name} ({student.subject_id})</Text>
              <Text style={[styles.detailText, { fontSize: 14, color: '#555' }]}>
                Joined: {new Date(student.time_joined).toLocaleString()}
              </Text>
              <TouchableOpacity
                style={[styles.queueButton, styles.dequeueButton]}
                onPress={() => handleRemoveStudent(
                  student.student_id, 
                  student.subject_id
                )}
              >
                <Text style={styles.queueButtonText}>Remove Student</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No students in queue</Text>
        )}
      </ScrollView>

      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Back to Teachers</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FAFAFA' },

  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },

  detailText: { fontSize: 16, marginBottom: 5, textAlign: 'center' },

  queueBox: { 
    padding: 15, 
    backgroundColor: '#FFCDD2', 
    marginBottom: 10, 
    borderRadius: 10, 
    elevation: 3, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  queueText: { fontSize: 16, textAlign: 'center', fontWeight: '600' },

  emptyText: { fontSize: 16, textAlign: 'center', marginTop: 20, color: '#777' },

  queueButton: { 
    marginTop: 20, 
    paddingVertical: 15, 
    borderRadius: 10, 
    alignItems: 'center',
    width: '100%',  
    elevation: 3, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  queueButtonText: { 
    color: '#FFF', 
    fontSize: 18, 
    fontWeight: 'bold', 
    textTransform: 'uppercase' 
  },

  dequeueButton: { backgroundColor: '#D32F2F' },  // 🔴 Red for Dequeue
  queueButtonActive: { backgroundColor: '#03DAC6' }, // 🟢 Green for Queue

  backButton: { 
    marginTop: 20, 
    paddingVertical: 15, 
    backgroundColor: '#6200EE', 
    borderRadius: 10, 
    alignItems: 'center',
    width: '100%',  
    elevation: 3, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  backButtonText: { 
    color: '#FFF', 
    fontSize: 18, 
    fontWeight: 'bold', 
    textTransform: 'uppercase' 
  },
});