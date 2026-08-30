import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  enableIndexedDbPersistence
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBgPXykLCHdZB5k5592gbN7NjVYuyuviTY",
  authDomain: "concept-made-easy-classes.firebaseapp.com",
  projectId: "concept-made-easy-classes",
  storageBucket: "concept-made-easy-classes.firebasestorage.app",
  messagingSenderId: "618710748053",
  appId: "1:618710748053:web:36bf875c2b055460eb049c"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);

if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Firestore persistence failed: multiple tabs are open.');
    } else if (err.code === 'unimplemented') {
      console.warn('Firestore persistence is not supported by this browser.');
    } else {
      console.warn('Firestore persistence error:', err);
    }
  });
}

export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  signInWithPopup,
  signOut,
  onAuthStateChanged
};

export type { User };