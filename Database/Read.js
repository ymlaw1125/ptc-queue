import { db } from "../firebaseConfig";
import { ref, get } from "firebase/database";

// verify student id
export const verifyStudent = async (student_id) => {
    const studentRef = ref(db, `students/${student_id}`);
    const snapshot = await get(studentRef);
    if (snapshot.exists()) {
        //console.log("Student exists.");
        return true;
    } else {
        //console.log("Student does not exist.");
        return false;
    }
};

// verify teacher id
export const verifyTeacher = async (teacher_id) => {
    const teacherRef = ref(db, `teachers/${teacher_id}`);
    const snapshot = await get(teacherRef);
    if (snapshot.exists()) {
        //console.log("Teacher exists.");
        return true;
    } else {
        //console.log("Teacher does not exist.");
        return false;
    }
};

// verify admin id
export const verifyAdmin = async (admin_id) => {
    const adminRef = ref(db, `admins/${admin_id}`);
    const snapshot = await get(adminRef);
    if (snapshot.exists()) {
        //console.log("Admin exists.");
        return true;
    } else {
        //console.log("Admin does not exist.");
        return false;
    }
};

// get all students
export const getStudents = async () => {
    const studentsRef = ref(db, "students");
    const snapshot = await get(studentsRef);
    return snapshot.exists() ? snapshot.val() : [];
};

// get all teachers
export const getTeachers = async () => {
    const teachersRef = ref(db, "teachers");
    const snapshot = await get(teachersRef);
    return snapshot.exists() ? snapshot.val() : [];
};

// get all admins
export const getAdmins = async () => {
    const adminsRef = ref(db, "admins");
    const snapshot = await get(adminsRef);
    return snapshot.exists() ? snapshot.val() : [];
};

// get all classrooms
export const getClassrooms = async () => {
    const classroomsRef = ref(db, "classrooms");
    const snapshot = await get(classroomsRef);
    return snapshot.exists() ? snapshot.val() : [];
};

// get all courses
export const getCourses = async () => {
    const coursesRef = ref(db, "courses");
    const snapshot = await get(coursesRef);
    return snapshot.exists() ? snapshot.val() : [];
};

// get all subjects
export const getSubjects = async () => {
    const subjectsRef = ref(db, "subjects");
    const snapshot = await get(subjectsRef);
    return snapshot.exists() ? snapshot.val() : [];
};

// get all queues
export const getQueues = async () => {
    const queuesRef = ref(db, "queues");
    const snapshot = await get(queuesRef);
    return snapshot.exists() ? snapshot.val() : [];
};



// get subjects for student
export const getSubjectsForStudent = async (student_id) => {
  try {
      const subjectsRef = ref(db, "subjects");
      const teachersRef = ref(db, "teachers");
      const classroomsRef = ref(db, "classrooms");
      const coursesRef = ref(db, "courses");

      const [subjectsSnapshot, teachersSnapshot, classroomsSnapshot, coursesSnapshot] = 
          await Promise.all([
              get(subjectsRef),
              get(teachersRef),
              get(classroomsRef),
              get(coursesRef)
          ]);

      // Handle null cases properly
      const subjects = subjectsSnapshot.val() || {};
      const teachers = teachersSnapshot.val() || {};
      const classrooms = classroomsSnapshot.val() || {};
      const courses = coursesSnapshot.val() || {};

      // Filter and map with proper null checks
      const studentSubjects = Object.entries(subjects)
          .filter(([id, subject]) => subject?.student_id === student_id)
          .map(([id, subject]) => {
              const course = courses[subject?.subject_id] || {};
              const teacher = teachers[subject?.teacher_id] || {};
              const classroom = classrooms[subject?.teacher_id] || {};

              return {
                  subject_id: subject?.subject_id || 'N/A',
                  teacher_id: subject?.teacher_id || 'N/A',
                  subject_name: course?.course_name || 'Unknown Subject',
                  teacher_name: teacher?.teacher_name || 'Unknown Teacher',
                  room_number: classroom?.room_number || 'No Room Assigned',
              };
          });

      return studentSubjects;
  } catch (error) {
      console.error("Error fetching student subjects:", error);
      return []; // Return empty array on error
  }
};

// get visited subjects
export const getVisitedSubjects = async (student_id) => {
  const subjectsRef = ref(db, "subjects");
  const teachersRef = ref(db, "teachers");
  const classroomsRef = ref(db, "classrooms");
  const coursesRef = ref(db, "courses");

  const [subjectsSnapshot, teachersSnapshot, classroomsSnapshot, coursesSnapshot] =
      await Promise.all([
          get(subjectsRef),
          get(teachersRef),
          get(classroomsRef),
          get(coursesRef)
      ]);

  const subjects = subjectsSnapshot.exists() ? subjectsSnapshot.val() : [];
  const teachers = teachersSnapshot.exists() ? teachersSnapshot.val() : [];
  const classrooms = classroomsSnapshot.exists() ? classroomsSnapshot.val() : [];
  const courses = coursesSnapshot.exists() ? coursesSnapshot.val() : [];

  return Object.entries(subjects)
    .filter(([id, subject]) => subject.student_id === student_id && subject.visited)
    .map(([id, subject]) => ({
        subject_id: subject.subject_id,
        teacher_id: subject.teacher_id,
        subject_name: courses[subject.subject_id].course_name || 'Unknown Subject',
        teacher_name: teachers[subject.teacher_id]?.teacher_name || 'Unknown Teacher',
        room_number: classrooms[subject.teacher_id]?.room_number || 'No Room Assigned',
        visit_time: subject.visit_time || 'No Visit Time',
    }));
};

// get queued subjects
export const getQueuedSubjects = async (student_id) => {
  const teachersRef = ref(db, "teachers");
  const classroomsRef = ref(db, "classrooms");
  const coursesRef = ref(db, "courses");
  const queuesRef = ref(db, "queues");

  const [teachersSnapshot, classroomsSnapshot, coursesSnapshot, queuesSnapshot] =
      await Promise.all([
          get(teachersRef),
          get(classroomsRef),
          get(coursesRef),
          get(queuesRef)
      ]);

  const teachers = teachersSnapshot.exists() ? teachersSnapshot.val() : [];
  const classrooms = classroomsSnapshot.exists() ? classroomsSnapshot.val() : [];
  const courses = coursesSnapshot.exists() ? coursesSnapshot.val() : [];
  const queues = queuesSnapshot.exists() ? queuesSnapshot.val() : [];

  return Object.entries(queues)
    .filter(([id, queue]) => queue.student_id === student_id)
    .map(([id, queue]) => ({
        _id: id,
        queue_id: id,
        subject_id: queue.subject_id,
        teacher_id: queue.teacher_id,
        subject_name: courses[queue.subject_id].course_name || 'Unknown Subject',
        teacher_name: teachers[queue.teacher_id]?.teacher_name || 'Unknown Teacher',
        room_number: classrooms[queue.teacher_id]?.room_number || 'No Room Assigned',
        time_joined: queue.time_joined || 'No Time Joined',
    }));
};

// get queue for teacher
export const getQueueForTeacher = async (teacher_id) => {
  const coursesRef = ref(db, "courses");
  const queuesRef = ref(db, "queues");
  const studentsRef = ref(db, "students");

  const [coursesSnapshot, queuesSnapshot, studentsSnapshot] =
      await Promise.all([
          get(coursesRef),
          get(queuesRef),
          get(studentsRef)
      ]);

  const courses = coursesSnapshot.exists() ? coursesSnapshot.val() : [];
  const queues = queuesSnapshot.exists() ? queuesSnapshot.val() : [];
  const students = studentsSnapshot.exists() ? studentsSnapshot.val() : [];

  return Object.entries(queues)
  .filter(([id, queue]) => queue.teacher_id === teacher_id)
  .map(([id, queue]) => ({
      subject_id: queue.subject_id,
      teacher_id: queue.teacher_id,
      subject_name: courses[queue.subject_id].course_name || 'Unknown Subject',
      student_name: students[queue.student_id]?.student_name || 'Unknown Student',
      student_id: queue.student_id,
      time_joined: queue.time_joined || 'No Time Joined',
  })).sort((a, b) => {
      const timeA = a.time_joined !== 'No Time Joined' ? new Date(a.time_joined).getTime() : 0;
      const timeB = b.time_joined !== 'No Time Joined' ? new Date(b.time_joined).getTime() : 0;
      return timeA - timeB; // Sort by ascending order of time_joined
  });
}

// get teacher classroom
export const getTeacherClassroom = async (teacher_id) => {
    const classroomsRef = ref(db, `classrooms/${teacher_id}`);
    const snapshot = await get(classroomsRef);
  
    return snapshot.exists() ? snapshot.val().room_number : null;
  };

// get teacher by id
export const getTeacherById = async (teacher_id) => {
  const teacherRef = ref(db, `teachers/${teacher_id}`);
  const snapshot = await get(teacherRef);

  return snapshot.exists() ? snapshot.val().teacher_name : null;
};

// get student by id
export const getStudentById = async (student_id) => {
  const studentRef = ref(db, `students/${student_id}`);
  const snapshot = await get(studentRef);

  return snapshot.exists() ? snapshot.val().student_name : null;
};

// get total student for teacher
export const getTotalStudentsForTeacher = async (teacher_id) => {
  const subjectsRef = ref(db, 'subjects');
  const snapshot = await get(subjectsRef);

  if (!snapshot.exists()) return 0;

  let totalStudents = 0;
  snapshot.forEach((childSnapshot) => {
    const data = childSnapshot.val();
    if (data.teacher_id === teacher_id) {
      totalStudents++;
    }
  });

  return totalStudents;
};

// get visited students for teacher
export const getVisitedStudentsForTeacher = async (teacher_id) => {
  const subjectsRef = ref(db, 'subjects');
  const snapshot = await get(subjectsRef);

  if (!snapshot.exists()) return 0;

  let visitedStudents = 0;
  snapshot.forEach((childSnapshot) => {
    const data = childSnapshot.val();
    if (data.teacher_id === teacher_id && data.visited) {
      visitedStudents++;
    }
  });

  return visitedStudents
};

// get teacher completion percentage
export const getTeacherCompletionPercentage = async (teacher_id) => {
  const total = await getTotalStudentsForTeacher(teacher_id);
  const visited = await getVisitedStudentsForTeacher(teacher_id);

  return total > 0 ? visited / total : 0;
};

export const checkShortQueues = async (student_id) => {
  try {
    const queuesRef = ref(db, 'queues');
    const snapshot = await get(queuesRef);
    
    if (!snapshot.exists()) return [];
    
    const parentQueues = [];
    
    // First find all queues where this parent is present
    snapshot.forEach(queueSnap => {
      const queue = queueSnap.val();
      if (queue.student_id === student_id) {
        parentQueues.push({
          queue_id: queueSnap.key,
          teacher_id: queue.teacher_id,
          subject_id: queue.subject_id
        });
      }
    });
    
    // Then check each queue for the parent's position
    const results = await Promise.all(
      parentQueues.map(async (queue) => {
        const fullQueue = await getQueueForTeacher(queue.teacher_id);
        const position = fullQueue.findIndex(q => q.student_id === student_id) + 1;
        return { 
          ...queue,
          position,
          queue_length: fullQueue.length
        };
      })
    );
    
    // Filter for queues where parent position is < 3
    return results.filter(queue => queue.position <= 3);
    
  } catch (error) {
    console.error('Error checking queue positions:', error);
    throw error;
  }
};

export const getSubjectNameById = async (subject_id) => {
  try {
    const subjectRef = ref(db, `courses/${subject_id}`);
    const snapshot = await get(subjectRef);
    return snapshot.exists() ? snapshot.val().course_name : 'Unknown Subject';
  } catch (error) {
    console.error('Error getting subject name:', error);
    return 'Unknown Subject';
  }
};

export const getSubjectDetails = async(subject_id) => {
  try {
      const studentsRef = ref(db, "students");
      const subjectsRef = ref(db, "subjects");
      const teachersRef = ref(db, "teachers");
      const coursesRef = ref(db, "courses");

      const [studentsSnapshot, subjectsSnapshot, teachersSnapshot, coursesSnapshot] = 
          await Promise.all([
              get(studentsRef),
              get(subjectsRef),
              get(teachersRef),
              get(coursesRef)
          ]);

      // Handle null cases properly
      const students = studentsSnapshot.val() || {};
      const subjects = subjectsSnapshot.val() || {};
      const teachers = teachersSnapshot.val() || {};
      const courses = coursesSnapshot.val() || {};

      // Filter and map with proper null checks
      const studentSubjects = Object.entries(subjects)
          .filter(([id, subject]) => subject?.subject_id === subject_id)
          .map(([id, subject]) => {
              const student = students[subject?.student_id] || {};
              const course = courses[subject?.subject_id] || {};
              const teacher = teachers[subject?.teacher_id] || {};

              return {
                  student_name: student?.student_name || 'Unknown Student',
                  student_id: subject?.student_id || 'N/A',
                  teacher_id: subject?.teacher_id || 'N/A',
                  teacher_name: teacher?.teacher_name || 'Unknown Teacher',
                  subject_name: course?.course_name || 'Unknown Subject',
                  visited: subject?.visited || false,
              };
          });

      return studentSubjects;
  } catch (error) {
      console.error("Error fetching subjects:", error);
      return []; // Return empty array on error
  }
}