import React, {useEffect, useState} from 'react';
import { View, Text, ScrollView, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { insertStudent, insertTeacher, insertAdmin, insertClassroom, insertCourse, insertQueue, insertSubject } from '../Database/Create';
import { getStudents, getTeachers, getAdmins, getClassrooms, getCourses, getQueues, getSubjects } from '../Database/Read';

// manage teachers
export function ManageTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [teacherId, setTeacherId] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [message, setMessage] = useState('');

  // Fetch teachers on component mount
  useEffect(() => {
    fetchTeachers();
  }, []);

  // Function to fetch teachers
  const fetchTeachers = async () => {
    const data = await getTeachers();
    // Convert object into an array of teachers
    if (data) {
      setTeachers(Object.entries(data).map(([id, details]) => ({ teacher_id: id, ...details })));
    } else {
      setTeachers([]);
    }
  };

  // Function to add a teacher
  const handleAddTeacher = async () => {
    if (teacherId.trim() && teacherName.trim()) {
      await insertTeacher(teacherId.trim(), teacherName.trim());
      setMessage('Teacher added successfully!');
      setTeacherId('');
      setTeacherName('');
      fetchTeachers(); // Refresh teacher list
    } else {
      setMessage('Please fill out all fields.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Teachers</Text>

      {/* Add Teacher Form */}
      <View style={styles.form}>
        <Text style={styles.formHeader}>Add Teacher</Text>
        <TextInput
          style={styles.input}
          placeholder="Teacher ID"
          value={teacherId}
          onChangeText={setTeacherId}
        />
        <TextInput
          style={styles.input}
          placeholder="Teacher Name"
          value={teacherName}
          onChangeText={setTeacherName}
        />
        <Button title="Add Teacher" onPress={handleAddTeacher} />
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>

      {/* List of Teachers */}
      <ScrollView>
        {teachers.length > 0 ? (
          teachers.map((teacher, index) => (
            <View key={index} style={styles.item}>
              <Text style={styles.name}>{teacher.teacher_name}</Text>
              <Text style={styles.detail}>ID: {teacher.teacher_id}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No teachers found.</Text>
        )}
      </ScrollView>
    </View>
  );
}

// manage students
export function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [message, setMessage] = useState('');

  // Fetch students on component mount
  useEffect(() => {
    fetchStudents();
  }, []);

  // Function to fetch students
  const fetchStudents = async () => {
    const data = await getStudents();
    // Convert object into an array of students
    if (data) {
      setStudents(Object.entries(data).map(([id, details]) => ({ student_id: id, ...details })));
    } else {
      setStudents([]);
    }
  };

  // Function to add a student
  const handleAddStudent = async () => {
    if (studentId.trim() && studentName.trim()) {
      await insertStudent(studentId.trim(), studentName.trim());
      setMessage('Student added successfully!');
      setStudentId('');
      setStudentName('');
      fetchStudents(); // Refresh student list
    } else {
      setMessage('Please fill out all fields.');
    }
  };

  return (
      <View style={styles.container}>
      <Text style={styles.header}>Students</Text>

      {/* Add Student Form */}
      <View style={styles.form}>
        <Text style={styles.formHeader}>Add Student</Text>
        <TextInput
          style={styles.input}
          placeholder="Student ID"
          value={studentId}
          onChangeText={setStudentId}
        />
        <TextInput
          style={styles.input}
          placeholder="Student Name"
          value={studentName}
          onChangeText={setStudentName}
        />
        <Button title="Add Student" onPress={handleAddStudent} />
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>

      {/* List of Students */}
      <ScrollView>
        {students.map((student, index) => (
          <View key={index} style={styles.item}>
            <Text style={styles.name}>{student.student_name}</Text>
            <Text style={styles.detail}>ID: {student.student_id}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// manage admins
export function ManageAdmins() {
  const [admins, setAdmins] = useState([]);
  const [adminId, setAdminId] = useState('');
  const [adminName, setAdminName] = useState('');
  const [message, setMessage] = useState('');

  // Fetch admins on component mount
  useEffect(() => {
    fetchAdmins();
  }, []);

  // Function to fetch admins
  const fetchAdmins = async () => {
    const data = await getAdmins();
    // Convert object into an array of admins
    if (data) {
      setAdmins(Object.entries(data).map(([id, details]) => ({ admin_id: id, ...details })));
    } else {
      setAdmins([]);
    }
  };

  // Function to add an admin
  const handleAddAdmin = async () => {
    if (adminId.trim() && adminName.trim()) {
      await insertAdmin(adminId.trim(), adminName.trim());
      setMessage('Admin added successfully!');
      setAdminId('');
      setAdminName('');
      fetchAdmins(); // Refresh admin list
    } else {
      setMessage('Please fill out all fields.');
    }
  };

  return (
      <View style={styles.container}>
      <Text style={styles.header}>Admins</Text>

      {/* Add Admin Form */}
      <View style={styles.form}>
        <Text style={styles.formHeader}>Add Admin</Text>
        <TextInput
          style={styles.input}
          placeholder="Admin ID"
          value={adminId}
          onChangeText={setAdminId}
        />
        <TextInput
          style={styles.input}
          placeholder="Admin Name"
          value={adminName}
          onChangeText={setAdminName}
        />
        <Button title="Add Admin" onPress={handleAddAdmin} />
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>

      {/* List of Admins */}
      <ScrollView>
        {admins.map((admin, index) => (
          <View key={index} style={styles.item}>
            <Text style={styles.name}>{admin.admin_name}</Text>
            <Text style={styles.detail}>ID: {admin.admin_id}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// manage classrooms
export function ManageClassrooms() {
  const [classrooms, setClassrooms] = useState([]);
  const [roomNumber, setRoomNumber] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    const classroomData = await getClassrooms();
    const teacherData = await getTeachers();

    if (classroomData) {
      const mergedData = Object.entries(classroomData).map(([teacher_id, details]) => ({
        teacher_id,
        room_number: details.room_number,
        teacher_name: teacherData[teacher_id]?.teacher_name || 'Unknown Teacher',
      }));
      setClassrooms(mergedData);
    } else {
      setClassrooms([]);
    }
  };

  // Function to add a classroom
  const handleAddClassroom = async () => {
    if (teacherId.trim() && roomNumber.trim()) {
      await insertClassroom(teacherId.trim(), roomNumber.trim());
      setMessage('Classroom added successfully!');
      setTeacherId('');
      setRoomNumber('');
      fetchClassrooms(); // Refresh admin list
    } else {
      setMessage('Please fill out all fields.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Classrooms</Text>

      {/* Add Classrooom Form */}
      <View style={styles.form}>
        <Text style={styles.formHeader}>Add Classroom</Text>
        <TextInput
          style={styles.input}
          placeholder="Teacher ID"
          value={teacherId}
          onChangeText={setTeacherId}
        />
        <TextInput
          style={styles.input}
          placeholder="Room Number"
          value={roomNumber}
          onChangeText={setRoomNumber}
        />
        <Button title="Add Classroom" onPress={handleAddClassroom} />
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>

      <ScrollView>
        {classrooms.length > 0 ? (
          classrooms.map((classroom, index) => (
            <View key={index} style={styles.item}>
              <Text style={styles.name}>{classroom.teacher_name}</Text>
              <Text style={styles.detail}>Room: {classroom.room_number}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No classrooms found.</Text>
        )}
      </ScrollView>
    </View>
  );
}

// manage courses
export function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [courseName, setCourseName] = useState('');
  const [message, setMessage] = useState('');

  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  // Function to fetch courses
  const fetchCourses = async () => {
    const data = await getCourses();
    // Convert object into an array of courses
    if (data) {
      setCourses(Object.entries(data).map(([id, details]) => ({ course_id: id, ...details })));
    } else {
      setCourses([]);
    }
  };

  // Function to add a course
  const handleAddCourse = async () => {
    if (courseId.trim() && courseName.trim()) {
      await insertCourse(courseId.trim(), courseName.trim());
      setMessage('Course added successfully!');
      setCourseId('');
      setCourseName('');
      fetchCourses(); // Refresh course list
    } else {
      setMessage('Please fill out all fields.');
    }
  };

  return (
      <View style={styles.container}>
      <Text style={styles.header}>Manage Courses</Text>

      {/* Add Course Form */}
      <View style={styles.form}>
        <Text style={styles.formHeader}>Add Course</Text>
        <TextInput
          style={styles.input}
          placeholder="Course ID"
          value={courseId}
          onChangeText={setCourseId}
        />
        <TextInput
          style={styles.input}
          placeholder="Course Name"
          value={courseName}
          onChangeText={setCourseName}
        />
        <Button title="Add Course" onPress={handleAddCourse} />
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>

      {/* List of Courses */}
      <ScrollView>
        {courses.map((course, index) => (
          <View key={index} style={styles.item}>
            <Text style={styles.name}>{course.course_name}</Text>
            <Text style={styles.detail}>ID: {course.course_id}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// manage subjects
export function ManageSubjects({navigation}) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const coursesData = await getCourses();
      setCourses(Object.entries(coursesData).map(([id, details]) => ({ course_id: id, ...details })));
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading courses...</Text>
      </View>
    );
  }

  return (
    <View style={styles2.container}>
      <Text style={styles2.header}>Select Subject</Text>
      <ScrollView contentContainerStyle={styles2.scrollContainer}>
        {courses.map(course => (
          <TouchableOpacity
            key={course.course_id}
            style={styles2.teacherPanel}
            onPress={() => navigation.navigate('SubjectList', { course_id: course.course_id })}
          >
            <Text style={styles2.teacherName}>{course.course_name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// manage queues
export function ManageQueues({navigation}) {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const teachersData = await getTeachers();
      setTeachers(Object.entries(teachersData).map(([id, details]) => ({ teacher_id: id, ...details })));
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading teachers...</Text>
      </View>
    );
  }

  return (
    <View style={styles2.container}>
      <Text style={styles2.header}>Select Teacher</Text>
      <ScrollView contentContainerStyle={styles2.scrollContainer}>
        {teachers.map(teacher => (
          <TouchableOpacity
            key={teacher.teacher_id}
            style={styles2.teacherPanel}
            onPress={() => navigation.navigate('AdminQueue', { teacherId: teacher.teacher_id })}
          >
            <Text style={styles2.teacherName}>{teacher.teacher_name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles2 = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
    textAlign: 'center',
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  teacherPanel: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  teacherName: {
    fontSize: 18,
    fontWeight: '600',
  },
});



const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  form: { marginBottom: 30 },
  formHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  message: { marginTop: 10, color: 'green' },
  item: { padding: 15, backgroundColor: '#E3F2FD', marginBottom: 10, borderRadius: 5 },
  name: { fontSize: 18, fontWeight: 'bold' },
  detail: { fontSize: 14 },
  emptyText: { textAlign: 'center', fontSize: 16, color: '#888', marginTop: 20 },
});