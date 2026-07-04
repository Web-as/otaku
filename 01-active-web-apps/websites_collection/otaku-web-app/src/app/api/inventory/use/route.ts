import { z } from 'zod';

const useSchema = z.object({
  itemId: z.string().min(1).max(64),
  userId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = useSchema.safeParse(json);
    if (!parsed.success) {
      return Response.json({ ok: false, error: 'Invalid payload' }, { status: 400 });
    }
    // Demo endpoint — real persistence via Drizzle/Supabase later (snippet22 pattern)
    return Response.json({
      ok: true,
      itemId: parsed.data.itemId,
      message: 'Item consumed',
    });
  } catch {
    return Response.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
