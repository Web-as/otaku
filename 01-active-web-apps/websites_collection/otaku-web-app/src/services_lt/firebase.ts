/**
 * Sales site auth — uses shared Firebase (same account as blog + tracker).
 */
import { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { getCurrentUser, onAuthChange, isFirebaseConfigured } from '@/shared/firebase';
import { db, app } from '@/shared/firebase/config';

export { getCurrentUser, onAuthChange, isFirebaseConfigured, db };
export const appId = app?.options?.appId || 'otaku-gildija-lt';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(getCurrentUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthChange((u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  return {
    user,
    userId: user?.uid ?? null,
    loading,
    isInitialized: isFirebaseConfigured(),
  };
};
