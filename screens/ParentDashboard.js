import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { getSubjectsForStudent, getVisitedSubjects, getQueuedSubjects, getQueueForTeacher, getSubjectNameById, getStudentById, getTeacherCompletionPercentage, checkShortQueues, getTotalStudentsForTeacher, getVisitedStudentsForTeacher } from '../Database/Read';
import InAppNotification from '../InAppNotification'; // Import notification component
import { insertQueue } from '../Database/Create';
import { removeQueue } from '../Database/Remove';
import { sendPushNotification } from '../Notification'; // Import push notification function


export const suggestNextSubject = async (student_id) => {
  const allSubjects = await getSubjectsForStudent(student_id);
  const queuedSubjects = await getQueuedSubjects(student_id);
  const visitedSubjects = await getVisitedSubjects(student_id);

  // Step 1: Filter out subjects that are already queued or visited
  const notQueuedSubjects = allSubjects.filter(
    (subject) =>
      !queuedSubjects.some((q) => q.subject_id === subject.subject_id) &&
      !visitedSubjects.some((v) => v.subject_id === subject.subject_id)
  );

  if (notQueuedSubjects.length === 0) return null; // No subjects left to suggest



  // Step 2: Get queue length and teacher progress for each subject
  const subjectsWithMetrics = await Promise.all(
    notQueuedSubjects.map(async (subject) => {
      const queue = await getQueueForTeacher(subject.teacher_id);
      const queueLength = queue.length;
      
      const total = await getTotalStudentsForTeacher(subject.teacher_id);
      const visited = await getVisitedStudentsForTeacher(subject.teacher_id);
      const maxQueueLength = total - visited; // Prevent division by 0

      const teacherProgress = 1 - await getTeacherCompletionPercentage(subject.teacher_id);

      // Step 3: Normalize values
      const normalizedQueueLength = queueLength / maxQueueLength; // Normalized queue (0 to 1)
      const normalizedTeacherProgress = Math.pow(teacherProgress, 1.5); // Reduce teacher completion impact

      // Step 4: Compute final score
      const score = normalizedQueueLength + normalizedTeacherProgress;  

      return { ...subject, queueLength, teacherProgress, normalizedQueueLength, normalizedTeacherProgress, score, maxQueueLength };
    })
  );

  // Step 5: Sort by lowest score (best choice)
  subjectsWithMetrics.sort((a, b) => a.score - b.score);
  //console.log(subjectsWithMetrics);

  // Step 6: Return the best subject, or null if none available
  return subjectsWithMetrics[0] || null;
};

export default function ParentDashboard({navigation, route}) {
  const [queuedSubjects, setQueuedSubjects] = useState([]);
  const [notQueuedSubjects, setNotQueuedSubjects] = useState([]);
  const [visitedSubjects, setVisitedSubjects] = useState([]);
  const [shortestQueue, setShortestQueue] = useState(null);
  const [remainingSubjects, setRemainingSubjects] = useState(0);
  const [recommendedSubject, setRecommendedSubject] = useState(null);
  const [notification, setNotification] = useState(null);

  const student_id = route.params.student_id; // Get student_id from route.params
  const student_name = getStudentById(student_id);


  const fetchIntervalRef = useRef(null);
  const queueCheckIntervalRef = useRef(null);


  const fetchData = async () => {
    const queued = await getQueuedSubjects(student_id); // Fetch queued subjects from the database
    const allSubjects = await getSubjectsForStudent(student_id); // Fetch subjects from the database
    const visited = await getVisitedSubjects(student_id); // Fetch visited subjects from the database

    const recommended = await suggestNextSubject(student_id);
    //console.log(recommended);
    const queuedWithLengths = await Promise.all(
      queued.map(async (subject) => {
        const teacherQueue = await getQueueForTeacher(subject.teacher_id);
        const position = teacherQueue.findIndex(
          item => item.student_id === student_id && 
                 item.subject_id === subject.subject_id
        ) + 1; // +1 to convert from index to position
        return {
          ...subject,
          queue_length: teacherQueue.length, // Get queue length
          position: position > 0 ? position : null, // Set position or null if not found
        }
      }
    ));

    const notQueuedWithLengths = await Promise.all(
      allSubjects
        .filter((item) => !queued.some((queuedSubject) => queuedSubject.subject_id === item.subject_id) &&
        !visited.some((visitedSubject) => visitedSubject.subject_id === item.subject_id))
        .map(async (subject) => ({
          ...subject,
          queue_length: (await getQueueForTeacher(subject.teacher_id)).length, // Get queue length
        }))
    );
    
    
    setNotQueuedSubjects(notQueuedWithLengths.filter((item) => !queued.some((subject) => subject.subject_id === item.subject_id)));
    setQueuedSubjects(queuedWithLengths);
    setVisitedSubjects(visited);
    setRecommendedSubject(recommended);

    if (queuedWithLengths.length > 0) {
      const sortedQueues = [...queuedWithLengths].sort((a, b) => a.queue_length - b.queue_length);
      setShortestQueue(sortedQueues[0]); // First element (smallest queue)
    } else {
      setShortestQueue(null);
    }

    const remainingCount = allSubjects.length - visited.length;
    setRemainingSubjects(remainingCount);
  };

  const checkForShortQueues = async () => {
    try {
      const shortQueues = await checkShortQueues(student_id);
      if (shortQueues.length > 0) {
        const subjectNames = await Promise.all(
          shortQueues.map(q => getSubjectNameById(q.subject_id))
        );
        const message = `Hurry! Your queue for ${subjectNames.join(', ')} is almost ready`;
        sendPushNotification("Upcoming Queue" , message, { subject_id: shortQueues[0].subject_id });
        setNotification(message);
      }
    } catch (error) {
      console.error('Error checking short queues:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData(); 
      checkForShortQueues();
      fetchIntervalRef.current = setInterval(() => {
        fetchData(); // Automatically refresh queue data
      }, 3000); // 3 seconds in milliseconds

      queueCheckIntervalRef.current = setInterval(() => {
        checkForShortQueues(); // Check for short queues every 30 seconds
      }, 30000); // 1 minute in milliseconds
      
      

      // Cleanup function
      return () => {
        if (fetchIntervalRef.current) {
          clearInterval(fetchIntervalRef.current);
        }
        if (queueCheckIntervalRef.current) {
          clearInterval(queueCheckIntervalRef.current);
        }
      };
    }, [student_id])
  )

  /*  
  useEffect(() => { 

    fetchData();
    //console.log(notQueuedSubjects);
  }, [student_id]);
  */

  const handleQueue = async(subject) => {
    await insertQueue(subject.teacher_id, student_id, subject.subject_id); // Insert the student into the queue
    //setQueuedSubjects([...queuedSubjects, subject]);
    //setNotQueuedSubjects(notQueuedSubjects.filter((item) => item.subject_id !== subject.subject_id));
    setNotification(`Queued for ${subject.subject_name}`);
    fetchData();
  };

  const handleUnqueue = async(subject) => {
    await removeQueue(subject.subject_id, student_id, subject.teacher_id); // Insert the student into the queue
    //setQueuedSubjects(queuedSubjects.filter((item) => item.subject_id !== subject.subject_id)); // Update queued subjects
    //setNotQueuedSubjects([...notQueuedSubjects, subject]); // Add to not queued subjects
    setNotification(`Dequeued for ${subject.subject_name}`);
    fetchData();
  };

  const navigateToSubjectQueue = (subject) => {
    navigation.navigate('SubjectQueue', { subject, student_id });
  };


  return (
    <View style={styles.container}>
      <View style={styles.notificationWrapper}>
      {notification && <InAppNotification message={notification} onDismiss={() => setNotification(null)} />}
      </View>

      <Text style={styles.header}>{student_name}</Text>
      <Text style={styles.summaryText}>Student ID: {student_id}</Text>
      
      <View style={styles.summaryContainer}>
        <TouchableOpacity style={styles.summaryBox} onPress={() => navigateToSubjectQueue(shortestQueue)} disabled={!shortestQueue}>
          <Text style={styles.summaryTitle}>Shortest Queued</Text>
          <Text style={styles.summaryValue}>
            {shortestQueue ? `${shortestQueue.subject_name} (${shortestQueue.queue_length})` : "N/A"}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>Remaining</Text>
          <Text style={styles.summaryValue}>{remainingSubjects}</Text>
        </View>
        
        <TouchableOpacity style={styles.summaryBox} onPress={() => navigateToSubjectQueue(recommendedSubject)}  disabled={!recommendedSubject}>
          <Text style={styles.summaryTitle}>Next Best To Queue</Text>
          <Text style={styles.summaryValue}>
            {recommendedSubject ? `${recommendedSubject.subject_name} (${recommendedSubject.queueLength})` : "N/A"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView>

        <Text style={styles.sectionHeader}>Subjects Queued</Text>
        <ScrollView>
          {queuedSubjects.length > 0 ? (
            queuedSubjects.map((subject, index) => (
            <TouchableOpacity key={index} style={styles.subjectBox} onPress={() => navigateToSubjectQueue(subject)}>
              <Text style={styles.subjectText}>{subject.subject_name}</Text>
              <Text style={styles.detailText}>Teacher: {subject.teacher_name}</Text>
              <Text style={styles.detailText}>Room: {subject.room_number}</Text>
              <Text style={styles.detailText}>Queue Length: {subject.position}/{subject.queue_length}</Text>
              <TouchableOpacity
                style={styles.queueButton}
                onPress={() => handleUnqueue(subject)}
              >
                <Text style={styles.queueButtonText}>Cancel</Text>
              </TouchableOpacity>
            </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>No subjects are currently queued.</Text> 
          )}
        </ScrollView>

        <Text style={styles.sectionHeader}>Subjects Not Queued</Text>
        <ScrollView>
          {notQueuedSubjects.length > 0 ? (notQueuedSubjects.map((subject, index) => (
            <TouchableOpacity key={index} style={styles.subjectBox} onPress={() => navigateToSubjectQueue(subject)}>
              <Text style={styles.subjectText}>{subject.subject_name}</Text>
              <Text style={styles.detailText}>Teacher: {subject.teacher_name}</Text>
              <Text style={styles.detailText}>Room: {subject.room_number}</Text>
              <Text style={styles.detailText}>Queue Length: {subject.queue_length}</Text>
              <TouchableOpacity
                style={styles.queueButton}
                onPress={() => handleQueue(subject)}
              >
                <Text style={styles.queueButtonText}>Queue</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))
          ) : (
            <Text style={styles.emptyText}>All subjects have been queued or visited.</Text>
          )}
        </ScrollView>

        <Text style={styles.sectionHeader}>Subjects Completed</Text>
        <ScrollView>
          {visitedSubjects.length > 0 ? (visitedSubjects.map((subject, index) => (
            <View key={index} style={styles.visitedBox}>
              <Text style={styles.subjectText}>{subject.subject_name}</Text>
              <Text style={styles.detailText}>Teacher: {subject.teacher_name}</Text>
              <Text style={styles.detailText}>Room: {subject.room_number}</Text>
              <Text style={styles.detailText}>Visited At: {new Date(subject.visit_time).toLocaleString()}</Text>
            </View>
          ))
          ) : (
            <Text style={styles.emptyText}>No subjects have been completed yet.</Text>
          )}
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 20,
  },

  notificationWrapper: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000, // Keeps notification above everything
  },

  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  
  summaryContainer: {
    flexDirection: 'row', // Places items side by side
    justifyContent: 'space-between', // Spaces them evenly
    marginBottom: 20,
  },
  summaryBox: {
    flex: 1, // Each box takes equal space
    backgroundColor: '#E3F2FD', // Light blue background
    padding: 15,
    marginHorizontal: 5, // Small spacing between boxes
    borderRadius: 10,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6200EE', // Purple text for contrast
    marginTop: 5,
  },
  summaryText: { fontSize: 16, marginBottom: 5 },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', marginTop: 20 },
  
  subjectBox: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subjectText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  detailText: {
    fontSize: 14,
    color: '#555',
    marginTop: 3,
  },
  queueButton: {
    marginTop: 10,
    paddingVertical: 10,
    backgroundColor: '#03DAC6',
    borderRadius: 5,
    alignItems: 'center',
  },
  queueButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  visitedBox: {
    backgroundColor: '#C8E6C9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    color: '#777',
  },
});
