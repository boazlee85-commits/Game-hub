import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDa5lg4AZiOX_DYhW6tTRdvooWogoEszxQ',
  authDomain: 'gamehub-c0c50.firebaseapp.com',
  projectId: 'gamehub-c0c50',
  storageBucket: 'gamehub-c0c50.firebasestorage.app',
  messagingSenderId: '744560192467',
  appId: '1:744560192467:web:e468eb0211eb5a46f0dd26',
  measurementId: 'G-R1BSF3P9LJ',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
