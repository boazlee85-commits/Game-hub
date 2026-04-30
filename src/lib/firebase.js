import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCTNNHLKN61uoSHAUkC3yPf8Tv1mCsPjLY",
  authDomain: "stratego-4539e.firebaseapp.com",
  projectId: "stratego-4539e",
  storageBucket: "stratego-4539e.firebasestorage.app",
  messagingSenderId: "1042198097098",
  appId: "1:1042198097098:web:d1ebff1d72d39755141833",
  measurementId: "G-H6S969N7R4"
};

export const isFirebaseConfigured = Object.values(firebaseConfig).every(
  value => typeof value === 'string' && value && !value.includes('YOUR_') && !value.includes('YOUR-') && !value.includes('your_project')
);

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
