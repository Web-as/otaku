import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithCustomToken, 
  signInAnonymously, 
  onAuthStateChanged,
  signOut,
  Auth,
  User 
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { useState, useEffect } from 'react';

// Initialize configuration - safely check for globals
const getGlobal = (name: string): string | undefined => {
  if (typeof window !== 'undefined' && (window as any)[name] !== undefined) {
    return (window as any)[name];
  }
  return undefined;
};

const appId = getGlobal('__app_id') || 'default-otaku-app';
const firebaseConfigStr = getGlobal('__firebase_config') || '{}';
const initialAuthToken = getGlobal('__initial_auth_token') || null;

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

  const logout = async () => {
    if (auth) {
      await signOut(auth);
    }
  };

  return { user, userId, loading, isInitialized, logout };
};
