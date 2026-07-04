/** Static VN asset IDs — shared with Storybound / dm-friend-rpg-new */
export const BACKGROUNDS = [
  'academy_day', 'dark_forest_night', 'battlefield', 'throne_room', 'sky_battle', 'tavern_warm', 'neutral_room',
] as const

export const SPRITES = [
  'hero_warrior', 'hero_mage', 'hero_rogue', 'npc_guide', 'npc_scared', 'enemy_slime', 'enemy_boss',
] as const

const GRADIENTS: Record<string, string> = {
  academy_day: 'linear-gradient(180deg,#1a2744,#4a6fa5,#87ceeb)',
  dark_forest_night: 'linear-gradient(180deg,#050810,#0f2818,#1a3020)',
  battlefield: 'linear-gradient(180deg,#2a1810,#5a3020,#8b7355)',
  throne_room: 'linear-gradient(180deg,#120818,#3a1848,#6a3080)',
  sky_battle: 'linear-gradient(180deg,#0a1028,#284878,#87ceeb)',
  tavern_warm: 'linear-gradient(180deg,#1a1008,#4a2810,#8b4513)',
  neutral_room: 'linear-gradient(180deg,#12121a,#2a2a38)',
  hero_warrior: 'linear-gradient(135deg,#8b4513,#cd853f)',
  hero_mage: 'linear-gradient(135deg,#4a0080,#9370db)',
  hero_rogue: 'linear-gradient(135deg,#1a1a2e,#4a4a6a)',
  npc_guide: 'linear-gradient(135deg,#2f4f4f,#708090)',
  npc_scared: 'linear-gradient(135deg,#483d8b,#9370db)',
  enemy_slime: 'linear-gradient(135deg,#006400,#00ff7f)',
  enemy_boss: 'linear-gradient(135deg,#4a0000,#8b0000)',
}

export function assetUrl(id: string): { url: string; gradient: string } {
  const gradient = GRADIENTS[id] ?? GRADIENTS.neutral_room
  const isBg = (BACKGROUNDS as readonly string[]).includes(id)
  const path = isBg ? `/vn/backgrounds/${id}.svg` : `/vn/sprites/${id}.svg`
  return { url: path, gradient }
}

export function defaultParallax(backgroundId: string) {
  return [
    { layer: 'background' as const, asset_id: backgroundId, scroll_factor: 0.15 },
    { layer: 'midground' as const, asset_id: backgroundId, scroll_factor: 0.4 },
    { layer: 'foreground' as const, asset_id: 'neutral_room', scroll_factor: 0.75 },
  ]
}
