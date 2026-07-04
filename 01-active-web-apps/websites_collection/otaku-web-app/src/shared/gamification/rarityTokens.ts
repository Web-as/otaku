/**
 * Shared rarity design tokens — used by collectibles, inventory grids, gacha UI.
 * Sourced from MASTER_ARCHITECTURE_2026 + RESEARCH_HYBRID_MMO_DND_INVENTORY.
 */

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export const RARITY_CSS_VARS: Record<ItemRarity, Record<string, string>> = {
  common: {
    '--rarity-border': '#6b7280',
    '--rarity-glow': 'rgba(107, 114, 128, 0.25)',
    '--rarity-text': '#9ca3af',
    '--rarity-gradient-from': '#6b7280',
    '--rarity-gradient-to': '#4b5563',
  },
  uncommon: {
    '--rarity-border': '#22c55e',
    '--rarity-glow': 'rgba(34, 197, 94, 0.3)',
    '--rarity-text': '#4ade80',
    '--rarity-gradient-from': '#22c55e',
    '--rarity-gradient-to': '#059669',
  },
  rare: {
    '--rarity-border': '#3b82f6',
    '--rarity-glow': 'rgba(59, 130, 246, 0.35)',
    '--rarity-text': '#60a5fa',
    '--rarity-gradient-from': '#3b82f6',
    '--rarity-gradient-to': '#0891b2',
  },
  epic: {
    '--rarity-border': '#a855f7',
    '--rarity-glow': 'rgba(168, 85, 247, 0.4)',
    '--rarity-text': '#c084fc',
    '--rarity-gradient-from': '#a855f7',
    '--rarity-gradient-to': '#ec4899',
  },
  legendary: {
    '--rarity-border': '#f59e0b',
    '--rarity-glow': 'rgba(245, 158, 11, 0.45)',
    '--rarity-text': '#fbbf24',
    '--rarity-gradient-from': '#f59e0b',
    '--rarity-gradient-to': '#ea580c',
  },
};

export const RARITY_TAILWIND = {
  common: { border: 'border-gray-500', text: 'text-gray-400', gradient: 'from-gray-500 to-gray-600' },
  uncommon: { border: 'border-green-500', text: 'text-green-400', gradient: 'from-green-500 to-emerald-600' },
  rare: { border: 'border-blue-500', text: 'text-blue-400', gradient: 'from-blue-500 to-cyan-600' },
  epic: { border: 'border-purple-500', text: 'text-purple-400', gradient: 'from-purple-500 to-pink-600' },
  legendary: { border: 'border-yellow-500', text: 'text-yellow-400', gradient: 'from-yellow-500 to-orange-600' },
} as const;

export function normalizeRarity(raw: string): ItemRarity {
  const r = raw.toLowerCase() as ItemRarity;
  return RARITY_CSS_VARS[r] ? r : 'common';
}

export function rarityStyle(rarity: string): Record<string, string> {
  return RARITY_CSS_VARS[normalizeRarity(rarity)];
}
