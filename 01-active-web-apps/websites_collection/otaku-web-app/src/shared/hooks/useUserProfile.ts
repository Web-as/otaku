import { useState, useEffect, useCallback, useMemo } from 'react';
import { getCurrentUser, onAuthChange } from '../firebase/auth';
import { getUserProfile, type UserProfile } from '../supabase/database';
import { useSupabaseRealtime } from '../../hooks/useSupabaseRealtime';

/**
 * Hook to get current user's profile from Supabase
 * Shared across all 3 sites - ensures consistent user data
 */
export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    const user = getCurrentUser();
    
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const userProfile = await getUserProfile(user.uid);
      setProfile(userProfile);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load user profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();

    // Listen for auth changes
    const unsubscribe = onAuthChange((user) => {
      if (user) {
        loadProfile();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [loadProfile]);

  const currentUser = getCurrentUser();
  const filter = useMemo(() => {
    return currentUser?.uid ? `id=eq.${currentUser.uid}` : undefined;
  }, [currentUser?.uid]);

  useSupabaseRealtime(
    {
      table: 'user_profiles',
      filter: filter,
    },
    loadProfile
  );

  return { profile, loading, error };
};
