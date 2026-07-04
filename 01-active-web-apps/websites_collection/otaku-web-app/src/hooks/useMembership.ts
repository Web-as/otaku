'use client';

import { useCallback, useEffect, useState } from 'react';
import { getCurrentUser, onAuthChange } from '@/lib/firebase';
import { getUserProfile, getAnimeLibrary } from '@/shared/supabase/database';
import {
  resolveMembershipStage,
  fetchAdmissionCard,
  type MembershipStatus,
} from '@/shared/membership';

const backendUrl = () =>
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.VITE_BACKEND_URL ||
  'http://localhost:3333';

export function useMembership() {
  const [uid, setUid] = useState<string | null>(null);
  const [status, setStatus] = useState<MembershipStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [seriesCount, setSeriesCount] = useState(0);
  const [careerUnlocked, setCareerUnlocked] = useState<string[]>([]);

  const refresh = useCallback(async (userId: string | null) => {
    if (!userId) {
      setStatus(
        resolveMembershipStage(null, null, 0, false),
      );
      setSeriesCount(0);
      setCareerUnlocked([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [profile, card, library] = await Promise.all([
        getUserProfile(userId),
        fetchAdmissionCard(userId).catch(() => null),
        getAnimeLibrary(userId).catch(() => []),
      ]);
      const count = library?.length ?? 0;
      setSeriesCount(count);
      const career = profile?.library_career as { milestones_unlocked?: string[] } | undefined;
      setCareerUnlocked(Array.isArray(career?.milestones_unlocked) ? career!.milestones_unlocked! : []);
      setStatus(resolveMembershipStage(profile, card, count, true));

      await fetch(`${backendUrl()}/api/membership/career-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, seriesCount: count }),
      }).catch(() => undefined);
    } catch (e) {
      console.error('[useMembership]', e);
      setStatus(resolveMembershipStage(null, null, 0, Boolean(userId)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const u = getCurrentUser();
    setUid(u?.uid ?? null);
    refresh(u?.uid ?? null);
    return onAuthChange(firebaseUser => {
      const id = firebaseUser?.uid ?? null;
      setUid(id);
      refresh(id);
    });
  }, [refresh]);

  const runInventoryAction = useCallback(
    async (inventoryId: string, action: string) => {
      if (!uid) throw new Error('Sign in required');
      const res = await fetch(`${backendUrl()}/api/inventory/${inventoryId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: uid,
          action,
          returnUrl: typeof window !== 'undefined' ? window.location.href : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');
      if (data.checkoutUrl) window.location.assign(data.checkoutUrl);
      await refresh(uid);
      return data;
    },
    [uid, refresh],
  );

  return { uid, status, loading, seriesCount, careerUnlocked, refresh, runInventoryAction };
}
