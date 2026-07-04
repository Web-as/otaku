"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { UserTier } from '../types/types';
import { useSupabaseRealtime } from '../hooks/useSupabaseRealtime';

interface User {
  id: string;
  uid: string;
  username: string;
  email: string;
  tier: UserTier;
  role: string;
  purchase_date?: string;
  created_at: string;
  stamina: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  upgradeToPremium: (paymentToken: string) => Promise<void>;
  spendStamina: (amount: number) => boolean;
  isAuthModalOpen: boolean;
  setAuthModalOpen: (isOpen: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    // Attempt to load Firebase auth — gracefully degrade if unavailable
    let unsubscribe: (() => void) | undefined;

    const initAuth = async () => {
      try {
        const { onAuthChange } = await import('@/lib/firebase/auth');
        const { getUserProfile } = await import('@/lib/supabase/database');

        unsubscribe = onAuthChange(async (firebaseUser) => {
          if (firebaseUser) {
            try {
              const profile = await getUserProfile(firebaseUser.uid);
              if (profile) {
                setUser({
                  id: firebaseUser.uid,
                  uid: firebaseUser.uid,
                  username: profile.display_name ?? firebaseUser.displayName ?? firebaseUser.email?.split('@')[0] ?? 'User',
                  email: firebaseUser.email ?? '',
                  tier: (profile.tier as UserTier) ?? 'free',
                  role: profile.role ?? 'guest',
                  purchase_date: profile.purchase_date ?? undefined,
                  created_at: profile.created_at ?? firebaseUser.metadata.creationTime ?? new Date().toISOString(),
                  stamina: profile.stamina ?? 160,
                });
              } else {
                setUser({
                  id: firebaseUser.uid,
                  uid: firebaseUser.uid,
                  username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                  email: firebaseUser.email || '',
                  tier: 'free',
                  role: 'guest',
                  created_at: firebaseUser.metadata.creationTime || new Date().toISOString(),
                  stamina: 160,
                });
              }
            } catch (error) {
              console.error("Failed to load user profile:", error);
              // Fallback if Supabase is down/sandboxed so user is NOT kicked out
              setUser({
                id: firebaseUser.uid,
                uid: firebaseUser.uid,
                username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                email: firebaseUser.email || '',
                tier: 'free',
                role: 'guest',
                created_at: firebaseUser.metadata.creationTime || new Date().toISOString(),
                stamina: 160,
              });
            }
          } else {
            setUser(null);
          }
          setLoading(false);
        });
      } catch (error) {
        // Firebase/Supabase unavailable — graceful fallback
        console.warn("Auth services unavailable, running in demo mode:", error);
        setUser(null);
        setLoading(false);
      }
    };

    initAuth();
    return () => unsubscribe?.();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { signIn } = await import('@/lib/firebase/auth');
      await signIn(email, password);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const { signUp } = await import('@/lib/firebase/auth');
      await signUp(email, password, username);
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { logOut } = await import('@/lib/firebase/auth');
      await logOut();
    } catch (error) {
      console.error("Logout failed:", error);
      setUser(null);
    }
  };

  // Cross-Domain SSO Hook (Future-Proofing for new domains)
  useEffect(() => {
    // If we land on a domain with an SSO token in the URL, authenticate automatically
    const urlParams = new URLSearchParams(window.location.search);
    const ssoToken = urlParams.get('sso_token');
    
    if (ssoToken) {
      console.log('Cross-Domain SSO Token detected. Authenticating ecosystem user...');
      // In production, exchange this short-lived token with our backend for a secure session
      // e.g. await signInWithCustomToken(auth, ssoToken);
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const refreshUser = async () => {
    if (!user) return;
    try {
      const { getUserProfile } = await import('@/lib/supabase/database');
      const profile = await getUserProfile(user.id);
      if (profile) {
        setUser(prev => prev ? {
          ...prev,
          tier: (profile.tier as UserTier) || prev.tier,
          role: profile.role || prev.role,
        } : null);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const upgradeToPremium = async (paymentToken: string) => {
    try {
      const { userAPI } = await import('../services/api');
      await userAPI.upgrade(paymentToken);
      await refreshUser();
    } catch (error: any) {
      console.error('Upgrade failed:', error);
      throw new Error(error.response?.data?.detail || 'Upgrade failed');
    }
  };

  const spendStamina = (amount: number): boolean => {
    if (!user || user.stamina < amount) return false;
    setUser({ ...user, stamina: user.stamina - amount });
    return true;
  };

  const filter = useMemo(() => {
    return user?.uid ? `id=eq.${user.uid}` : undefined;
  }, [user?.uid]);

  useSupabaseRealtime(
    {
      table: 'user_profiles',
      filter: filter,
    },
    refreshUser
  );

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
    upgradeToPremium,
    spendStamina,
    isAuthModalOpen,
    setAuthModalOpen,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
