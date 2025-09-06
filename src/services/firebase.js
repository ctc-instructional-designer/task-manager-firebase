import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Reemplaza esta configuración con la tuya de Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyBmSMV6J1EW7LPPB_eeGxuB1aYDNntIeDo",
  authDomain: "ct5-task-manager.firebaseapp.com",
  projectId: "ct5-task-manager",
  storageBucket: "ct5-task-manager.firebasestorage.app",
  messagingSenderId: "517435934573",
  appId: "1:517435934573:web:0093b6db42f490d7337c64",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
