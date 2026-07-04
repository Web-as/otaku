/**
 * RSC loader prep — snippet_rsc_direct_query.tsx / BLUEPRINT P1.
 * Use in async Server Components instead of client useEffect + fetch.
 */
import { getUserGamificationStats } from '@/lib/gamification/recordEvent';

export type GamificationStatsView = {
  totalXp: number;
  gold: number;
  level: number;
  rank: string;
  persisted: boolean;
};

export async function loadGamificationStats(userId: string): Promise<GamificationStatsView> {
  const row = await getUserGamificationStats(userId);
  if (!row) {
    return { totalXp: 0, gold: 0, level: 1, rank: 'Novice', persisted: false };
  }
  return { ...row, persisted: Boolean(process.env.DATABASE_URL) };
}

export async function loadLeaderboardPreview(limit = 10): Promise<GamificationStatsView[]> {
  // Prep stub — extend when user_stats leaderboard query is added to schema helpers
  void limit;
  return [];
}
