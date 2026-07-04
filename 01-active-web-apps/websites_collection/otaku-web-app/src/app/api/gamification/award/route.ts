import { z } from 'zod';
import { recordGamificationAward } from '@/lib/gamification/recordEvent';

const awardSchema = z.object({
  userId: z.string().min(1).max(128).optional(),
  xp: z.number().int().min(0).max(10000).default(0),
  gold: z.number().int().min(-10000).max(10000).default(0),
  reason: z.string().max(200).optional(),
  eventType: z.string().max(64).optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = awardSchema.safeParse(json);
    if (!parsed.success) {
      return Response.json({ ok: false, error: 'Invalid award' }, { status: 400 });
    }

    const { userId, xp, gold, reason, eventType } = parsed.data;

    if (userId && process.env.DATABASE_URL) {
      const result = await recordGamificationAward({ userId, xp, gold, reason, eventType });
      return Response.json({ ok: true, ...result });
    }

    return Response.json({ ok: true, persisted: false, xp, gold, reason });
  } catch (err) {
    console.error('[gamification/award]', err);
    return Response.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
