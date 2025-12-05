import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDGqC3uAK_uNxrZEi6HSC3MFx0uCKYIHyI",
  authDomain: "warkahkasih-f5c6c.firebaseapp.com",
  projectId: "warkahkasih-f5c6c",
  storageBucket: "warkahkasih-f5c6c.firebasestorage.app",
  messagingSenderId: "1070841752082",
  appId: "1:1070841752082:web:2dc4b46db950188c2446cb",
  measurementId: "G-HK8Q2J53TM"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Analytics Safe Init
let analytics;
try {
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
  }
} catch (e) { 
  console.log("Analytics skipped in this environment"); 
}

// App ID constant for Firestore paths
export const APP_ID = 'warkahkasih-f5c6c';