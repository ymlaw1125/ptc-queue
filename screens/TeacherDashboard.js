import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Stopwatch from '../Stopwatch';
import { markSubjectAsVisited } from '../Database/Update';
import { getQueueForTeacher, getTotalStudentsForTeacher, getVisitedStudentsForTeacher, getTeacherClassroom } from '../Database/Read';
import { removeQueue } from '../Database/Remove';

export default function TeacherDashboard({ route }) {
  const [classroom, setClassroom] = useState(null);
  const [queue, setQueue] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [visitedStudents, setVisitedStudents] = useState(0);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  const [waitingTime, setWaitingTime] = useState(0);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isConsulting, setIsConsulting] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);

  const [consultTimerRunning, setConsultTimerRunning] = useState(false);

  const fetchIntervalRef = useRef(null);

  const teacher_id = route.params.teacher_id;

  useEffect(() => {
    const fetchData = async () => {
      const room = await getTeacherClassroom(teacher_id);
      setClassroom(room);

      const teacherQueue = await getQueueForTeacher(teacher_id);
      setQueue(teacherQueue);

      const total = await getTotalStudentsForTeacher(teacher_id);
      const visited = await getVisitedStudentsForTeacher(teacher_id);

      setTotalStudents(total);
      setVisitedStudents(visited);

      const percentage = total > 0 ? ((visited / total) * 100).toFixed(2) : 0;
      setCompletionPercentage(percentage);
    };

    fetchData();
    fetchIntervalRef.current = setInterval(() => {
      fetchData(); // Automatically refresh queue data
    }, 3000); // 3 seconds in milliseconds
    return () => {
      if (fetchIntervalRef.current) {
        clearInterval(fetchIntervalRef.current);
      }
    };
  }, [teacher_id]);

  useEffect(() => {
    let timer;
    if (isWaiting) {
      timer = setInterval(() => {
        setWaitingTime((prevTime) => prevTime + 1);
      }, 1000);
    }

    if (waitingTime >= 60) {
      handleSkip();
    }

    return () => clearInterval(timer);
  }, [isWaiting, waitingTime]);

  const handleNext = async () => {
    if (queue.length > 0) {
      const firstEntry = queue[0];
      setCurrentStudent(firstEntry);
      setIsWaiting(true);
      setWaitingTime(0);
    }
  };

  const handleSkip = async () => {
    if (queue.length > 0) {
      await removeQueue(queue[0].subject_id, queue[0].student_id, teacher_id);
      const updatedQueue = queue.slice(1);
      setQueue(updatedQueue);
      setIsWaiting(false);
      setWaitingTime(0);
      setCurrentStudent(null);
    }
  };

  const handleStartConsult = () => {
    setIsWaiting(false);
    setIsConsulting(true);
    setConsultTimerRunning(true);
  };

  const handleFinishConsult = async () => {
    if (currentStudent) {
      await markSubjectAsVisited(currentStudent.teacher_id, currentStudent.student_id, currentStudent.subject_id);
      removeQueue(currentStudent.subject_id, currentStudent.student_id, currentStudent.teacher_id);
      setIsConsulting(false);
      setConsultTimerRunning(false);
      setCurrentStudent(null);

      const updatedQueue = queue.filter((student) => student.student_id !== currentStudent.student_id);
      setQueue(updatedQueue);

      const updatedVisited = await getVisitedStudentsForTeacher(teacher_id);
      setVisitedStudents(updatedVisited);

      const percentage = totalStudents > 0 ? ((updatedVisited / totalStudents) * 100).toFixed(2) : 0;
      setCompletionPercentage(percentage);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Teacher Dashboard</Text>
      <Text style={styles.subHeader}>Classroom: {classroom}</Text>
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          {completionPercentage}% Completed ({visitedStudents}/{totalStudents} students)
        </Text>
      </View>

      <Text style={styles.subHeader}>Current Queue</Text>
      <ScrollView>
        {queue.map((entry, index) => (
          <View key={index} style={styles.queueBox}>
            <Text style={styles.queueText}>
              {index + 1}. {entry.student_name} - {entry.subject_name}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Waiting Timer */}
      {isWaiting && (
        <View style={styles.stopwatchContainer}>
          <Text style={styles.timerText}>Waiting Time: {waitingTime}s</Text>
          <TouchableOpacity style={styles.startButton} onPress={handleStartConsult}>
            <Text style={styles.buttonText}>Start Consult</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Consulting Stopwatch (Auto-starts) */}
      {isConsulting && (
        <View style={styles.stopwatchContainer}>
          <Text style={styles.timerText}>Consulting Time:</Text>
          <Stopwatch isRunning={consultTimerRunning} />
        </View>
      )}

      {/* Buttons for Next & Skip */}
      {!isWaiting && !isConsulting && (
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next Student</Text>
        </TouchableOpacity>
      )}

      {isWaiting && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.buttonText}>Skip Student</Text>
        </TouchableOpacity>
      )}

      {isConsulting && (
        <TouchableOpacity style={styles.finishButton} onPress={handleFinishConsult}>
          <Text style={styles.buttonText}>Finish Consultation</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  subHeader: { fontSize: 18, marginBottom: 10 },
  queueBox: { padding: 15, backgroundColor: '#FFF3E0', marginBottom: 10, borderRadius: 5 },
  queueText: { fontSize: 16 },
  progressContainer: { marginBottom: 20 },
  progressText: { fontSize: 16, fontWeight: 'bold' },
  stopwatchContainer: { alignItems: 'center', marginTop: 20 },
  timerText: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  startButton: { backgroundColor: 'green', padding: 15, borderRadius: 5 },
  nextButton: { marginTop: 20, padding: 15, backgroundColor: '#03DAC6', borderRadius: 5 },
  nextButtonText: { color: '#FFF', textAlign: 'center', fontSize: 18 },
  skipButton: { marginTop: 10, padding: 15, backgroundColor: 'red', borderRadius: 5 },
  finishButton: { marginTop: 10, padding: 15, backgroundColor: '#6200EE', borderRadius: 5 },
  buttonText: { color: '#FFF', fontSize: 18, textAlign: 'center' },
});
