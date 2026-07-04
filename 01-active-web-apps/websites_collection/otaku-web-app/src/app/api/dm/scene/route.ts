import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { SceneBlockSchema, textToFallbackScene } from '@/vn/schema'
import { validateSceneRequest } from '@/lib/validateSceneRequest'

export const runtime = 'nodejs'
export const maxDuration = 60

const SYSTEM = `You are the DM Friend — Game Engine Coordinator for an anime visual novel RPG.
Output ONLY a valid SceneBlock JSON object. Pick asset IDs from:
backgrounds: academy_day, dark_forest_night, battlefield, throne_room, sky_battle, tavern_warm
sprites: hero_warrior, hero_mage, npc_guide, npc_scared, enemy_slime, enemy_boss
Use dialogue_lines with speaker, sprite, dialogue, animation_state.
Include dnd_event when a skill check or combat beat applies.
IMPORTANT: The player is assigned a unique "Otaku Class" based on their anime watch history instead of standard RPG classes (like Warrior or Mage). Refer to them using their specific Otaku Class and Tier if appropriate.`

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validated = validateSceneRequest(body)
    if (!validated.ok) {
      return Response.json({
        sceneBlock: validated.sceneBlock,
        source: 'blocked',
        error: validated.error,
      })
    }

    const data = validated.data
    const userMsg = data.playerMessage?.trim() || 'I look around.'
    const context = [
      data.scrollContext && `Active scroll: ${data.scrollContext}`,
      data.charName && `Hero: ${data.charName} (${data.charClass ?? 'The Generic Adventurer'})`,
      `Player action: ${userMsg}`,
    ].filter(Boolean).join('\n')

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return Response.json({
        sceneBlock: textToFallbackScene(
          `[Local fallback — set GOOGLE_GENERATIVE_AI_API_KEY for AI scenes]\n\n${userMsg}`,
        ),
        source: 'fallback',
      })
    }

    const { object } = await generateObject({
      model: google('gemini-2.0-flash'),
      schema: SceneBlockSchema,
      system: SYSTEM,
      prompt: context,
    })

    return Response.json({ sceneBlock: object, source: 'ai' })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Scene generation failed'
    return Response.json(
      { sceneBlock: textToFallbackScene(msg), source: 'error', error: msg },
      { status: 200 },
    )
  }
}
