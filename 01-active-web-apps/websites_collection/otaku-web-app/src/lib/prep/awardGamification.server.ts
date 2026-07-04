'use server';

/**
 * Server-action-shaped award mutation — prep for next-safe-action (BLUEPRINT P2).
 * Wire: replace client fetch('/api/gamification/award') once auth middleware is added.
 */
import { z } from 'zod';
import { recordGamificationAward } from '@/lib/gamification/recordEvent';

const awardInput = z.object({
  userId: z.string().min(1).max(128),
  xp: z.number().int().min(0).max(10000).default(0),
  gold: z.number().int().min(-10000).max(10000).default(0),
  reason: z.string().max(200).optional(),
  eventType: z.string().max(64).optional(),
});

export type AwardGamificationInput = z.infer<typeof awardInput>;

export async function awardGamificationServer(input: AwardGamificationInput) {
  const parsed = awardInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: 'Invalid input' };
  }

  if (!process.env.DATABASE_URL) {
    return { ok: true as const, persisted: false, ...parsed.data };
  }

  try {
    const result = await recordGamificationAward(parsed.data);
    return { ok: true as const, ...result };
  } catch (err) {
    console.error('[awardGamificationServer]', err);
    return { ok: false as const, error: 'Server error' };
  }
}
