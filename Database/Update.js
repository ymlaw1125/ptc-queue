import { db } from "../firebaseConfig";
import { ref, update, get } from "firebase/database";

// mark subject as visited
export const markSubjectAsVisited = async (teacher_id, student_id, subject_id) => {
    console.log(1)
  // 1. Get reference to subjects node
    const subjectsRef = ref(db, `subjects`);
    console.log(2)

    // 2. Query to find the subject with matching criteria
    const snapshot = await get(subjectsRef);
    if (!snapshot.exists()) {
      throw new Error('No subjects found in database');
    }
    console.log(3);

    // 3. Find the matching subject by its properties
    let subjectKey = null;
    snapshot.forEach((childSnapshot) => {
      const subject = childSnapshot.val();
      if (subject.subject_id === subject_id && 
          subject.student_id === student_id && 
          subject.teacher_id === teacher_id) {
        subjectKey = childSnapshot.key;
      }
    });
    console.log(`Subject Key: ${subjectKey}`);
    if (!subjectKey) {
      throw new Error(`No matching subject found for:
        Teacher: ${teacher_id}
        Student: ${student_id}
        Subject: ${subject_id}`);
    }

    // 4. Update the specific subject
    const subjectRef = ref(db, `subjects/${subjectKey}`);

    await update(subjectRef, {
      visited: true,
      visit_time: new Date().toISOString(),
    });
  
    console.log(`Marked subject ${subject_id} as visited.`);
  };