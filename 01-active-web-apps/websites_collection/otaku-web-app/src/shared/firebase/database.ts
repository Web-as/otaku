// Shared Database Functions for All 3 Sites
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';
import { db } from './config';

function requireDb() {
  if (!db) {
    throw new Error('Firebase Firestore is not configured. Set VITE_FIREBASE_* variables.');
  }
  return db;
}

// Save user data
export const saveUserData = async (userId: string, data: DocumentData): Promise<void> => {
  const userRef = doc(requireDb(), 'users', userId);
  await setDoc(userRef, data, { merge: true });
};

// Get user data
export const getUserData = async (userId: string): Promise<DocumentData | null> => {
  const userRef = doc(requireDb(), 'users', userId);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? userSnap.data() : null;
};

// Update user data
export const updateUserData = async (userId: string, data: Partial<DocumentData>): Promise<void> => {
  const userRef = doc(requireDb(), 'users', userId);
  await updateDoc(userRef, data);
};

// Delete user data
export const deleteUserData = async (userId: string): Promise<void> => {
  const userRef = doc(requireDb(), 'users', userId);
  await deleteDoc(userRef);
};

// Save anime library for user (LT site)
export const saveAnimeLibrary = async (userId: string, library: any[]): Promise<void> => {
  const libraryRef = doc(requireDb(), 'libraries', userId);
  await setDoc(libraryRef, { 
    animeList: library,
    lastUpdated: new Date().toISOString()
  });
};

// Get anime library for user (LT site)
export const getAnimeLibrary = async (userId: string): Promise<any[] | null> => {
  const libraryRef = doc(requireDb(), 'libraries', userId);
  const librarySnap = await getDoc(libraryRef);
  return librarySnap.exists() ? librarySnap.data().animeList : null;
};

// Generic collection query
export const queryCollection = async (
  collectionName: string,
  field: string,
  operator: any,
  value: any
): Promise<DocumentData[]> => {
  const q = query(collection(requireDb(), collectionName), where(field, operator, value));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
