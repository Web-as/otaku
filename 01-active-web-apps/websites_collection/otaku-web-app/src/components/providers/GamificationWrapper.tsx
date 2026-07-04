'use client';

import { useEffect, useState } from 'react';
import { GamificationProvider } from '@/shared/gamification/GamificationContext';
import { useAuth } from '@/contexts/AuthContext';

type ServerStats = {
  totalXp: number;
  gold: number;
};

export function GamificationWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [stats, setStats] = useState<ServerStats>({ totalXp: 0, gold: 0 });

  useEffect(() => {
    if (!user?.uid) {
      setStats({ totalXp: 0, gold: 0 });
      return;
    }

    let cancelled = false;
    fetch(`/api/gamification/stats?userId=${encodeURIComponent(user.uid)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Stats fetch failed');
        return res.json();
      })
      .then((data: ServerStats & { ok?: boolean }) => {
        if (cancelled) return;
        setStats({
          totalXp: typeof data.totalXp === 'number' ? data.totalXp : 0,
          gold: typeof data.gold === 'number' ? data.gold : 0,
        });
      })
      .catch(() => {
        if (!cancelled) setStats({ totalXp: 0, gold: 0 });
      });

    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  return (
    <GamificationProvider
      userId={user?.uid ?? null}
      initialXp={stats.totalXp}
      initialGold={stats.gold}
      serverHydrated={Boolean(user?.uid)}
    >
      {children}
    </GamificationProvider>
  );
}
