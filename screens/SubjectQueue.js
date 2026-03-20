import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { getQueueForTeacher } from '../Database/Read';
import { insertQueue } from '../Database/Create';
import { removeQueue } from '../Database/Remove';

export default function SubjectQueue({ route, navigation }) {
  const { subject, student_id } = route.params; // Get subject & student_id from navigation params
  const [queue, setQueue] = useState([]);
  const [isQueued, setIsQueued] = useState(false);

  useEffect(() => {
    fetchQueue();
  }, [subject.teacher_id]);

  const fetchQueue = async () => {
    const subjectQueue = await getQueueForTeacher(subject.teacher_id);
    setQueue(subjectQueue);
    checkIfQueued(subjectQueue);
  };

  const checkIfQueued = (subjectQueue) => {
    // Check if the student is already in the queue
    const queued = subjectQueue.some((entry) => entry.student_id === student_id);
    setIsQueued(queued);
  };

  const handleQueueToggle = async () => {
    if (isQueued) {
      // Find the queue entry ID for removal
      const queueEntry = queue.find((entry) => entry.student_id === student_id);
      if (queueEntry) {
        await removeQueue(queueEntry.subject_id, queueEntry.student_id, queueEntry.teacher_id);
      }
    } else {
      await insertQueue(subject.teacher_id, student_id, subject.subject_id);
    }

    // Refresh queue after action
    await fetchQueue();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{subject.course_name} Queue</Text>
      <Text style={styles.detailText}>Teacher: {subject.teacher_name}</Text>
      <Text style={styles.detailText}>Room: {subject.room_number}</Text>

      <ScrollView>
        {queue.length > 0 ? (
          queue.map((entry, index) => (
            <View key={index} style={styles.queueBox}>
              <Text style={styles.queueText}>{index + 1}. {entry.student_name}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No one is in the queue yet.</Text>
        )}
      </ScrollView>

      {/* Queue / Dequeue Button */}
      <TouchableOpacity style={[styles.queueButton, isQueued ? styles.dequeueButton : styles.queueButtonActive]} onPress={handleQueueToggle}>
        <Text style={styles.queueButtonText}>{isQueued ? 'Dequeue' : 'Queue'}</Text>
      </TouchableOpacity>

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back</Text>
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
