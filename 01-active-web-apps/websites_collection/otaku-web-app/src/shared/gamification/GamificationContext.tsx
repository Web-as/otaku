'use client';

/**
 * Universal gamification hook (snippet49_universal_gamification_hook).
 */
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

const STORAGE_PREFIX = 'otaku_gamification_';

export interface GamificationState {
  xp: number;
  level: number;
  gold: number;
  rank: string;
  addXp: (amount: number, reason?: string, options?: { eventType?: string }) => void;
  addGold: (amount: number, reason?: string) => void;
}

const RANKS = ['Novice', 'Otaku', 'Archivist', 'Kami', 'Legend'];

function rankForLevel(level: number): string {
  if (level >= 20) return RANKS[4]!;
  if (level >= 15) return RANKS[3]!;
  if (level >= 10) return RANKS[2]!;
  if (level >= 5) return RANKS[1]!;
  return RANKS[0]!;
}

function levelFromXp(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

const GamificationContext = createContext<GamificationState | null>(null);

type Props = {
  children: ReactNode;
  userId?: string | null;
  initialXp?: number;
  initialGold?: number;
  /** When true, skip loading stale localStorage over server stats. */
  serverHydrated?: boolean;
};

export function GamificationProvider({
  children,
  userId,
  initialXp = 0,
  initialGold = 0,
  serverHydrated = false,
}: Props) {
  const key = userId ? `${STORAGE_PREFIX}${userId}` : `${STORAGE_PREFIX}guest`;

  const [xp, setXp] = useState(initialXp);
  const [gold, setGold] = useState(initialGold);
  const [level, setLevel] = useState(levelFromXp(initialXp));

  useEffect(() => {
    setXp(initialXp);
    setGold(initialGold);
    setLevel(levelFromXp(initialXp));
  }, [initialXp, initialGold, userId]);

  useEffect(() => {
    if (serverHydrated) return;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as { xp?: number; gold?: number };
        if (typeof parsed.xp === 'number') setXp(parsed.xp);
        if (typeof parsed.gold === 'number') setGold(parsed.gold);
      }
    } catch {
      /* ignore */
    }
  }, [key, serverHydrated]);

  useEffect(() => {
    const next = levelFromXp(xp);
    setLevel(next);
    try {
      localStorage.setItem(key, JSON.stringify({ xp, gold }));
    } catch {
      /* ignore */
    }
  }, [xp, gold, key]);

  const persistAward = useCallback(
    async (xpDelta: number, goldDelta: number, reason?: string, eventType?: string) => {
      if (!userId || (xpDelta === 0 && goldDelta === 0)) return;
      try {
        await fetch('/api/gamification/award', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, xp: Math.max(0, xpDelta), gold: goldDelta, reason, eventType }),
        });
      } catch {
        /* best-effort server projection */
      }
    },
    [userId],
  );

  const addXp = useCallback(
    (amount: number, reason?: string, options?: { eventType?: string }) => {
      if (amount <= 0) return;
      setXp((prev) => prev + amount);
      if (reason) console.info(`+${amount} XP: ${reason}`);
      void persistAward(amount, 0, reason, options?.eventType);
    },
    [persistAward],
  );

  const addGold = useCallback(
    (amount: number, reason?: string) => {
      if (amount === 0) return;
      setGold((prev) => Math.max(0, prev + amount));
      if (amount !== 0) void persistAward(0, amount, reason);
    },
    [persistAward],
  );

  const rank = rankForLevel(level);

  return (
    <GamificationContext.Provider value={{ xp, level, gold, rank, addXp, addGold }}>
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification(): GamificationState {
  const ctx = useContext(GamificationContext);
  if (!ctx) throw new Error('useGamification must be used within GamificationProvider');
  return ctx;
}

export function useGamificationOptional(): GamificationState | null {
  return useContext(GamificationContext);
}
