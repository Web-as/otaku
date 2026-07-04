// Shared Firebase Configuration for All 3 Sites
// Add your Firebase credentials to .env.local in the ROOT of the project

import { initializeApp, getApps } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import type { Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import { env } from '@/shared/utils/runtimeEnv';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || env('VITE_FIREBASE_API_KEY'),
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || env('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || env('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || env('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || env('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || env('VITE_FIREBASE_APP_ID'),
};

// Initialize Firebase (only once) when env is configured.
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

const hasRequiredFirebaseConfig = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId,
);

if (hasRequiredFirebaseConfig) {
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.warn('Firebase init failed, continuing in local-only mode:', error);
    app = null;
    auth = null;
    db = null;
  }
} else {
  console.info('Firebase env missing - running in local-only mode.');
}

// Export for use in all sites
export { app, auth, db };

// Helper function to check if Firebase is configured
export const isFirebaseConfigured = (): boolean => {
  return hasRequiredFirebaseConfig && !!app && !!auth && !!db;
};
