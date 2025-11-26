import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithCustomToken, 
  signInAnonymously, 
  onAuthStateChanged, 
  Auth,
  User 
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { useState, useEffect } from 'react';

// Initialize configuration
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-otaku-app';
const firebaseConfigStr = typeof __firebase_config !== 'undefined' ? __firebase_config : '{}';
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let isInitialized = false;

// Safe initialization
try {
  const config = JSON.parse(firebaseConfigStr);
  if (Object.keys(config).length > 0) {
    if (!getApps().length) {
      app = initializeApp(config);
    } else {
      app = getApp();
    }
    auth = getAuth(app);
    db = getFirestore(app);
    isInitialized = true;
  } else {
    console.warn("Firebase config is empty. App will run in mock mode.");
  }
} catch (e) {
  console.error("Failed to parse Firebase config or initialize app:", e);
}

export { auth, db, appId, isInitialized };

// Auth Hook
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!isInitialized || !auth) {
      setLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        if (initialAuthToken) {
          await signInWithCustomToken(auth, initialAuthToken);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
      }
    };

    // Only attempt sign-in if no user is currently signed in
    if (!auth.currentUser) {
        initAuth();
    }

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setUserId(u ? u.uid : null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, userId, loading, isInitialized };
};