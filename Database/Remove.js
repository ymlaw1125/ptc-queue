import { db } from "../firebaseConfig";
import { ref, remove, get } from "firebase/database";

// remove student
export const removeStudent = async (student_id) => {
    const studentRef = ref(db, `students/${student_id}`);
    await remove(studentRef);
    console.log("Student removed successfully.");
};

// remove teacher
export const removeTeacher = async (teacher_id) => {
    const teacherRef = ref(db, `teachers/${teacher_id}`);
    await remove(teacherRef);
    console.log("Teacher removed successfully.");
};

// remove admin
export const removeAdmin = async (admin_id) => {
    const adminRef = ref(db, `admins/${admin_id}`);
    await remove(adminRef);
    console.log("Admin removed successfully.");
};

// remove classroom
export const removeClassroom = async (teacher_id) => {
    const classroomRef = ref(db, `classrooms/${teacher_id}`);
    await remove(classroomRef);
    console.log("Classroom removed successfully.");
};

// remove course
export const removeCourse = async (course_id) => {
    const courseRef = ref(db, `courses/${course_id}`);
    await remove(courseRef);
    console.log("Course removed successfully.");
};

// remove subject
export const removeSubject = async (subject_id) => {
    const subjectRef = ref(db, `subjects/${subject_id}`);
    await remove(subjectRef);
    console.log("Subject removed successfully.");
};

// remove queue
export const removeQueue = async (subject_id, student_id, teacher_id) => {
    const queuesRef = ref(db, `queues`);
    const snapshot = await get(queuesRef);
    if (!snapshot.exists()) {
        throw new Error('No queues found in database');
    }
    let queueKey = null;
    snapshot.forEach((childSnapshot) => {
    const queue = childSnapshot.val();
    if (queue.subject_id === subject_id && 
        queue.student_id === student_id && 
        queue.teacher_id === teacher_id) {
        queueKey = childSnapshot.key;
    }
    });
    if (!queueKey) {
        throw new Error(`No matching queue found for:
          Teacher: ${teacher_id}
          Student: ${student_id}
          Subject: ${subject_id}`);
      }
    const queueRef = ref(db, `queues/${queueKey}`);
    await remove(queueRef);
    console.log(`Queue removed successfully.`);
    
};