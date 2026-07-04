// Shared Authentication Functions for All 3 Sites
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User,
  type UserCredential,
} from 'firebase/auth';
import { auth } from './config';
import { upsertUserProfile, getUserProfile } from '@/shared/supabase/database';
import { markJustRegistered } from '@/shared/membership/passPrompt';
import { env as readEnv } from '@/shared/utils/runtimeEnv';

// Bootstrap user profile in Supabase on first login
export const bootstrapUserProfile = async (user: User): Promise<void> => {
  try {
    // Check if Supabase is configured
    const supabaseUrl = readEnv('VITE_SUPABASE_URL');
    if (!supabaseUrl) {
      console.log('ℹ️ Supabase not configured - skipping profile creation (using localStorage instead)');
      return;
    }

    const existingProfile = await getUserProfile(user.uid);
    
    if (!existingProfile) {
      // All new users get pre-registered badge (early access period)
      const badges = ['pre_registered'];
      const activeTitle = 'Pre-Registered Member';
      
      await upsertUserProfile(user.uid, {
        email: user.email || '',
        display_name: user.displayName || user.email?.split('@')[0] || 'User',
        tier: 'free',
        role: 'guest',
        membership_stage: 'guest',
        badges,
        active_title: activeTitle,
        created_at: new Date().toISOString(),
      });
      console.log('✅ User profile created in Supabase with Pre-Registered badge');
    }
  } catch (error) {
    console.warn('⚠️ Failed to bootstrap user profile (Supabase may not be configured):', error);
    // Don't throw - allow registration to succeed even if Supabase fails
  }
};

// Sign up new user
export const signUp = async (email: string, password: string, displayName?: string): Promise<UserCredential> => {
  if (!auth) {
    throw new Error('Firebase auth is not configured. Set VITE_FIREBASE_* variables.');
  }
  const result = await createUserWithEmailAndPassword(auth, email, password);
  
  // Update display name if provided
  if (displayName && result.user) {
    await updateProfile(result.user, { displayName });
  }
  
  await bootstrapUserProfile(result.user);
  markJustRegistered();
  return result;
};

// Sign in existing user
export const signIn = async (email: string, password: string): Promise<UserCredential> => {
  if (!auth) {
    throw new Error('Firebase auth is not configured. Set VITE_FIREBASE_* variables.');
  }
  const result = await signInWithEmailAndPassword(auth, email, password);
  await bootstrapUserProfile(result.user);
  return result;
};

// Sign out current user
export const logOut = async (): Promise<void> => {
  if (!auth) return;
  return signOut(auth);
};

// Listen to auth state changes
export const onAuthChange = (callback: (user: User | null) => void) => {
  if (!auth) {
    callback(null);
    return () => undefined;
  }
  return onAuthStateChanged(auth, callback);
};

// Get current user
export const getCurrentUser = (): User | null => {
  if (!auth) return null;
  return auth.currentUser;
};

// Format Firebase error messages to be more user-friendly
export const getReadableAuthError = (error: { code?: string; message?: string }): string => {
  if (!error.code) {
    return error.message || 'An unknown authentication error occurred';
  }

  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'This email is already in use. Please login instead or use a different email address.';
    case 'auth/weak-password':
      return 'Please use a stronger password. It should be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-not-found':
      return 'No account found with this email address. Please check your email or sign up.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again or reset your password.';
    case 'auth/invalid-credential':
      return 'Invalid login credentials. Please check your email and password.';
    case 'auth/configuration-not-found':
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled. Please contact support or try again later.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with the same email but different sign-in credentials.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/too-many-requests':
      return 'Too many failed login attempts. Please try again later or reset your password.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection and try again.';
    default:
      return error.message || 'An error occurred during authentication. Please try again.';
  }
};
