import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { getSubjectDetails } from '../Database/Read';

export default function SubjectList({ route, navigation }) {
    const { course_id, course_name } = route.params;
    const [subjectData, setSubjectData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedTeacher, setExpandedTeacher] = useState(null);
  
    useEffect(() => {
      fetchSubjectData();
    }, [course_id]);
  
    const fetchSubjectData = async () => {
      try {
        // Assuming you have a function to fetch subject details by course_id
        const data = await getSubjectDetails(course_id);
        
        // Group students by teacher
        const groupedData = data.reduce((acc, item) => {
          if (!acc[item.teacher_id]) {
            acc[item.teacher_id] = {
              teacher_id: item.teacher_id,
              teacher_name: item.teacher_name || `Teacher ${item.teacher_id}`,
              students: []
            };
          }
          acc[item.teacher_id].students.push({
            student_id: item.student_id,
            student_name: item.student_name || `Student ${item.student_id}`,
            visited: item.visited
          });
          return acc;
        }, {});
        setSubjectData(Object.values(groupedData));
      } catch (error) {
        console.error('Error fetching subject details:', error);
      } finally {
        setLoading(false);
      }
    };
  
    const toggleTeacher = (teacherId) => {
      setExpandedTeacher(expandedTeacher === teacherId ? null : teacherId);
    };
  
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text>Loading subject details...</Text>
        </View>
      );
    }
  
    return (
      <View style={styles.container}>
        <Text style={styles.header}>{course_name}</Text>
        <Text style={styles.subHeader}>Teachers and Students</Text>
        
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {subjectData.map((teacher) => (
            <View key={teacher.teacher_id} style={styles.teacherPanel}>
              <TouchableOpacity 
                onPress={() => toggleTeacher(teacher.teacher_id)}
                style={styles.teacherHeader}
              >
                <Text style={styles.teacherName}>{teacher.teacher_name}</Text>
                <Text style={styles.arrow}>
                  {expandedTeacher === teacher.teacher_id ? '▼' : '▶'}
                </Text>
              </TouchableOpacity>
  
              {expandedTeacher === teacher.teacher_id && (
                <View style={styles.studentsContainer}>
                  {teacher.students.map(student => (
                    <View key={student.student_id} style={styles.studentItem}>
                      <Text style={styles.studentName}>{student.student_name}</Text>
                      <View style={[
                        styles.statusIndicator,
                        student.visited ? styles.visited : styles.notVisited
                      ]} />
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    header: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      color: '#333',
    },
    subHeader: {
      fontSize: 18,
      color: '#666',
      marginBottom: 15,
    },
    scrollContainer: {
      paddingBottom: 20,
    },
    coursePanel: {
      backgroundColor: '#fff',
      borderRadius: 10,
      padding: 15,
      marginBottom: 15,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    },
    courseName: {
      fontSize: 18,
      fontWeight: '600',
      color: '#6200EE',
    },
    courseCode: {
      fontSize: 14,
      color: '#666',
      marginTop: 5,
    },
    teacherPanel: {
      backgroundColor: '#fff',
      borderRadius: 10,
      marginBottom: 15,
      overflow: 'hidden',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    },
    teacherHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 15,
      backgroundColor: '#6200EE',
    },
    teacherName: {
      fontSize: 16,
      fontWeight: '600',
      color: '#fff',
    },
    arrow: {
      color: '#fff',
      fontSize: 16,
    },
    studentsContainer: {
      padding: 10,
    },
    studentItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    studentName: {
      fontSize: 15,
      color: '#333',
    },
    statusIndicator: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    visited: {
      backgroundColor: '#4CAF50',
    },
    notVisited: {
      backgroundColor: '#F44336',
    },
  });