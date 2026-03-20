import { db } from "../firebaseConfig";
import { ref, push, set } from "firebase/database";

// student
export const insertStudent = async (student_id, student_name) => {
    const studentRef = ref(db, `students/${student_id}`);
    await set(studentRef, { student_name });
    console.log("Student ${student_name} inserted successfully.");
};

// teacher
export const insertTeacher = async (teacher_id, teacher_name) => {
    const teacherRef = ref(db, `teachers/${teacher_id}`);
    await set(teacherRef, { teacher_name });
    console.log("Teacher inserted successfully.");
};

// admin
export const insertAdmin = async (admin_id, admin_name) => {
    const adminRef = ref(db, `admins/${admin_id}`);
    await set(adminRef, { admin_name });
    console.log("Admin inserted successfully.");
};

// classroom
export const insertClassroom = async (teacher_id, room_number) => {
    const classroomRef = ref(db, `classrooms/${teacher_id}`);
    await set(classroomRef, { room_number });
    console.log("Classroom inserted successfully.");
};

// course
export const insertCourse = async (course_id, course_name) => {
    const courseRef = ref(db, `courses/${course_id}`);
    await set(courseRef, { course_name });
    console.log("Course inserted successfully.");
};

// subject
export const insertSubject = async (teacher_id, student_id, subject_id, visited = false, visit_time = null) => {
  try {
    const subjectRef = push(ref(db, 'subjects')); // Auto-generate unique queue ID

    await set(subjectRef, {
      visit_id: subjectRef.key,
      teacher_id,
      student_id,
      subject_id,
    });

    console.log(`Student ${student_id} added to subject for ${subject_id}`);
  } catch (error) {
    console.error("Error inserting subject entry:", error);
  } 
};

// queue
export const insertQueue = async (teacher_id, student_id, subject_id) => {
    try {
      const queueRef = push(ref(db, 'queues')); // Auto-generate unique queue ID
      const time_joined = new Date().toISOString(); // Capture timestamp
  
      await set(queueRef, {
        queue_id: queueRef.key,
        teacher_id,
        student_id,
        subject_id,
        time_joined,
      });
  
      console.log(`Student ${student_id} added to queue for ${subject_id}`);
    } catch (error) {
      console.error("Error inserting queue entry:", error);
    }
  };
