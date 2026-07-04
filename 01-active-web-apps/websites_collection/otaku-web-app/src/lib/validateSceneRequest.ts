import { z } from 'zod';
import { agentChaperone } from '@/shared/lib/AgentChaperone';
import { textToFallbackScene } from '@/vn/schema';

const bodySchema = z.object({
  playerMessage: z.string().max(4000).optional(),
  scrollContext: z.string().max(500).optional(),
  charName: z.string().max(120).optional(),
  charClass: z.string().max(120).optional(),
});

export function validateSceneRequest(body: unknown):
  | { ok: true; data: z.infer<typeof bodySchema> }
  | { ok: false; sceneBlock: ReturnType<typeof textToFallbackScene>; error: string } {
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return {
      ok: false,
      sceneBlock: textToFallbackScene('Invalid request format.'),
      error: 'validation_failed',
    };
  }

  const msg = parsed.data.playerMessage?.trim() ?? '';
  if (msg) {
    const guard = agentChaperone.validatePlayerText(msg);
    if (guard.status !== 'AUTHORIZED') {
      return {
        ok: false,
        sceneBlock: textToFallbackScene(
          `[Kana the Librarian] That request looks suspicious. ${guard.reason ?? 'Try a normal in-world action.'}`,
        ),
        error: guard.status,
      };
    }
  }

  return { ok: true, data: parsed.data };
}
