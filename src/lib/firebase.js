import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCf04VW_p4WaOKpYcdLlFDOP23D2JlscOM",
  authDomain: "stratego-f3299.firebaseapp.com",
  projectId: "stratego-f3299",
  storageBucket: "stratego-f3299.firebasestorage.app",
  messagingSenderId: "203519895933",
  appId: "1:203519895933:web:a6a7a7e9bf41b28cdd4414",
  measurementId: "G-E2XHJNG9GP"
};

export const isFirebaseConfigured = Object.values(firebaseConfig).every(
  value => typeof value === 'string' && value && !value.includes('YOUR_') && !value.includes('YOUR-') && !value.includes('your_project')
);

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
