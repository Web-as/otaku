import { z } from 'zod'

/** Blueprint: Live2D / expression state keyed to Cubism parameters. */
export const AnimationStateSchema = z.enum([
  'neutral', 'happy', 'angry', 'scared', 'surprised', 'thinking', 'crying',
])

export const DndEventSchema = z.object({
  type: z.enum(['SKILL_CHECK', 'COMBAT_START', 'COMBAT_END', 'LOOT', 'LEVEL_UP', 'NONE']),
  required_skill: z.string().optional(),
  dc: z.number().int().min(1).max(30).optional(),
  enemy_id: z.string().optional(),
  label: z.string().optional(),
}).optional()

export const ParallaxLayerSchema = z.object({
  layer: z.enum(['background', 'midground', 'foreground']),
  asset_id: z.string(),
  scroll_factor: z.number().min(0).max(1).default(0.5),
})

export const DialogueLineSchema = z.object({
  speaker: z.string(),
  sprite: z.string().nullable(),
  /** Blueprint field name */
  dialogue: z.string().optional(),
  /** Backward-compatible alias */
  text: z.string().optional(),
  animation_state: AnimationStateSchema.optional(),
  emotion: AnimationStateSchema.optional(),
}).refine(d => Boolean(d.dialogue?.trim() || d.text?.trim()), {
  message: 'dialogue or text required',
})

export const ChoiceSchema = z.object({
  id: z.string(),
  label: z.string(),
  action: z.string().optional(),
})

export const Live2DModelSchema = z.object({
  model_id: z.string(),
  moc3_url: z.string().optional(),
  slot: z.enum(['left', 'center', 'right']).default('center'),
  visible: z.boolean().default(true),
}).optional()

/** Master Scene Block — DM Friend + VN canvas contract (May 2026 blueprint). */
export const SceneBlockSchema = z.object({
  scene_id: z.string(),
  background: z.string(),
  music_track: z.string().optional(),
  parallax_layers: z.array(ParallaxLayerSchema).optional(),
  dnd_event: DndEventSchema,
  dialogue_lines: z.array(DialogueLineSchema).min(1),
  choices: z.array(ChoiceSchema).optional(),
  stage_sprites: z.array(z.object({
    slot: z.enum(['left', 'center', 'right']),
    sprite: z.string(),
    visible: z.boolean().default(true),
    animation_state: AnimationStateSchema.optional(),
  })).optional(),
  live2d_models: z.array(Live2DModelSchema).optional(),
  transition: z.enum(['fade', 'cut', 'slide']).default('fade'),
  particles: z.enum(['none', 'rain', 'magic_dust', 'snow']).optional(),
})

export type AnimationState = z.infer<typeof AnimationStateSchema>
export type DndEvent = z.infer<typeof DndEventSchema>
export type DialogueLine = z.infer<typeof DialogueLineSchema>
export type SceneChoice = z.infer<typeof ChoiceSchema>
export type SceneBlock = z.infer<typeof SceneBlockSchema>

export function lineText(line: DialogueLine): string {
  return (line.dialogue ?? line.text ?? '').trim()
}

export function lineAnimation(line: DialogueLine): AnimationState {
  return line.animation_state ?? line.emotion ?? 'neutral'
}

export function parseSceneBlock(raw: unknown): SceneBlock {
  return SceneBlockSchema.parse(raw)
}

export function safeParseSceneBlock(raw: unknown, fallbackText: string): SceneBlock {
  const result = SceneBlockSchema.safeParse(raw)
  if (result.success) return result.data
  return textToFallbackScene(fallbackText)
}

export function textToFallbackScene(text: string): SceneBlock {
  return {
    scene_id: `fallback_${Date.now()}`,
    background: 'neutral_room',
    music_track: 'ambient_explore',
    dnd_event: { type: 'NONE' },
    dialogue_lines: [{ speaker: 'DM', sprite: null, dialogue: text.slice(0, 500) }],
    transition: 'fade',
  }
}

/** Zod object for Vercel AI SDK generateObject */
export const SceneBlockObjectSchema = SceneBlockSchema
