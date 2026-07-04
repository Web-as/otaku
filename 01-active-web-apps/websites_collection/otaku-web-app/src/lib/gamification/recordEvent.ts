import { eq } from 'drizzle-orm';
import { getDb, schema } from '@/db';

const RANKS = ['Novice', 'Otaku', 'Archivist', 'Kami', 'Legend'];

function levelFromXp(xp: number) {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

function rankForLevel(level: number) {
  if (level >= 20) return RANKS[4]!;
  if (level >= 15) return RANKS[3]!;
  if (level >= 10) return RANKS[2]!;
  if (level >= 5) return RANKS[1]!;
  return RANKS[0]!;
}

export type AwardInput = {
  userId: string;
  xp?: number;
  gold?: number;
  reason?: string;
  eventType?: string;
};

/** Snippet 22 pattern — append event + update projection when DATABASE_URL is set. */
export async function recordGamificationAward(input: AwardInput) {
  const db = getDb();
  if (!db) return { persisted: false as const, ...input };

  const xpGain = input.xp ?? 0;
  const goldGain = input.gold ?? 0;
  const eventType = input.eventType ?? (xpGain > 0 ? 'XP_GAINED' : goldGain > 0 ? 'GOLD_GAINED' : 'AWARD');

  await db.insert(schema.gamificationEvents).values({
    userId: input.userId,
    eventType,
    payload: {
      xp: xpGain,
      gold: goldGain,
      reason: input.reason ?? null,
    },
  });

  const [existing] = await db
    .select()
    .from(schema.userStats)
    .where(eq(schema.userStats.userId, input.userId))
    .limit(1);

  const newXp = (existing?.totalXp ?? 0) + xpGain;
  const newGold = (existing?.gold ?? 0) + goldGain;
  const newLevel = levelFromXp(newXp);

  if (existing) {
    await db
      .update(schema.userStats)
      .set({
        totalXp: newXp,
        gold: newGold,
        level: newLevel,
        rank: rankForLevel(newLevel),
        updatedAt: new Date(),
      })
      .where(eq(schema.userStats.userId, input.userId));
  } else {
    await db.insert(schema.userStats).values({
      userId: input.userId,
      totalXp: newXp,
      gold: newGold,
      level: newLevel,
      rank: rankForLevel(newLevel),
    });
  }

  return {
    persisted: true as const,
    totalXp: newXp,
    gold: newGold,
    level: newLevel,
    rank: rankForLevel(newLevel),
  };
}

export async function getUserGamificationStats(userId: string) {
  const db = getDb();
  if (!db) return null;

  const [row] = await db
    .select()
    .from(schema.userStats)
    .where(eq(schema.userStats.userId, userId))
    .limit(1);

  if (!row) {
    return { totalXp: 0, gold: 0, level: 1, rank: RANKS[0]! };
  }

  return {
    totalXp: row.totalXp,
    gold: row.gold,
    level: row.level,
    rank: row.rank,
  };
}
