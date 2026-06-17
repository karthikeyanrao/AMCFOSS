import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, getDocs } from "firebase/firestore";

// Replace with your Firebase project's config (or use environment variables)
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "YOUR_SENDER_ID",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "YOUR_APP_ID"
};

// Check if Firebase is properly configured
export const isFirebaseConfigured = !!(
  process.env.REACT_APP_FIREBASE_PROJECT_ID &&
  process.env.REACT_APP_FIREBASE_PROJECT_ID !== "YOUR_PROJECT_ID"
);

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Fetch Firestore documents with a timeout to fail-fast on slow/offline connections
export const getDocsWithTimeout = async (ref, timeoutMs = 1500) => {
  if (!isFirebaseConfigured) {
    throw new Error("Firebase is not configured");
  }
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Firestore fetch timed out")), timeoutMs)
  );
  return Promise.race([getDocs(ref), timeoutPromise]);
};

export default app;



