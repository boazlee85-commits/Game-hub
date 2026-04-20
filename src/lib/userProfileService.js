import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

const USERS_COLLECTION = 'users';

export async function getUserProfile(uid) {
  if (!uid) return null;
  const profileRef = doc(db, USERS_COLLECTION, uid);
  const snapshot = await getDoc(profileRef);
  return snapshot.exists() ? snapshot.data() : null;
}

export async function ensureUserProfile(uid, email, displayName) {
  if (!uid) return null;
  const profileRef = doc(db, USERS_COLLECTION, uid);
  const snapshot = await getDoc(profileRef);
  if (snapshot.exists()) {
    return snapshot.data();
  }

  const profile = {
    email,
    displayName: displayName || email,
    avatarUrl: null,
    pieceImages: {},
  };

  await setDoc(profileRef, profile);
  return profile;
}

export async function updateUserProfile(uid, data) {
  if (!uid) return null;
  const profileRef = doc(db, USERS_COLLECTION, uid);
  await setDoc(profileRef, data, { merge: true });
  const snapshot = await getDoc(profileRef);
  return snapshot.exists() ? snapshot.data() : null;
}

export async function uploadUserFile(uid, file, fileName) {
  if (!uid || !file) return null;
  const destination = `users/${uid}/${fileName}`;
  const fileRef = ref(storage, destination);
  await uploadBytes(fileRef, file);
  return await getDownloadURL(fileRef);
}
