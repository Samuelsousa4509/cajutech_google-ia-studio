import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gen-lang-client-0909630478",
  appId: "1:1028386871261:web:71c466d6c9c55892ffc834",
  apiKey: "AIzaSyBY8pWanM9UMDQlEpMjg8PdGqzezDcLGdY",
  authDomain: "gen-lang-client-0909630478.firebaseapp.com",
  firestoreDatabaseId: "default",
  storageBucket: "gen-lang-client-0909630478.firebasestorage.app",
  messagingSenderId: "1028386871261"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
