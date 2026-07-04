import { z } from 'zod';
import { getUserGamificationStats } from '@/lib/gamification/recordEvent';

const querySchema = z.object({
  userId: z.string().min(1).max(128),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const parsed = querySchema.safeParse({ userId: searchParams.get('userId') });
    if (!parsed.success) {
      return Response.json({ ok: false, error: 'Missing userId' }, { status: 400 });
    }

    const stats = await getUserGamificationStats(parsed.data.userId);
    if (!stats) {
      return Response.json({
        ok: true,
        persisted: false,
        totalXp: 0,
        gold: 0,
        level: 1,
        rank: 'Novice',
      });
    }

    return Response.json({ ok: true, persisted: true, ...stats });
  } catch (err) {
    console.error('[gamification/stats]', err);
    return Response.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
