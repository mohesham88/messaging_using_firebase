
// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';


const firebaseConfig = {
  apiKey: "AIzaSyCBDbmBIB3x9v8RAmJJ8fut65j1BHmCets",
  authDomain: "labtask2-cb64c.firebaseapp.com",
  projectId: "labtask2-cb64c",
  storageBucket: "labtask2-cb64c.firebasestorage.app",
  messagingSenderId: "230466244503",
  appId: "1:230466244503:web:b99864da1301b2b601bed2"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const database = getDatabase(app);
