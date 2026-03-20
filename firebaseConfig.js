import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";


const firebaseConfig = {
  apiKey: "AIzaSyDEqJbnMX1-SUZXvPto3dAhjdpIjQ4FaDA",
  authDomain: "parent-teacher-queue-app.firebaseapp.com",
  databaseURL: "https://parent-teacher-queue-app-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "parent-teacher-queue-app",
  storageBucket: "parent-teacher-queue-app.firebasestorage.app",
  messagingSenderId: "780951548850",
  appId: "1:780951548850:web:bbfd639e38ac8829c02aab",
  measurementId: "G-XXDG3NWMYM"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };