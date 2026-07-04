'use client';

import { Coins, Sparkles } from 'lucide-react';
import { useGamificationOptional } from '../gamification/GamificationContext';

export function GamificationBar() {
  const game = useGamificationOptional();
  if (!game) return null;

  const xpIntoLevel = game.xp % (game.level * game.level * 100);
  const xpNeeded = Math.max(1, game.level * 100);
  const pct = Math.min(100, Math.round((xpIntoLevel / xpNeeded) * 100));

  return (
    <div
      className="flex flex-wrap items-center gap-3 px-3 py-1.5 rounded-lg border border-[var(--anime-hud-border)] bg-black/40 text-xs"
      data-tour-id="gamification-bar"
    >
      <span className="font-black text-[var(--anime-gold)]">Lv.{game.level}</span>
      <span className="text-zinc-400">{game.rank}</span>
      <div className="flex items-center gap-2 min-w-[120px] flex-1">
        <Sparkles className="w-3.5 h-3.5 text-violet-400" aria-hidden />
        <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-violet-500 to-pink-500" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-zinc-500 tabular-nums">{game.xp} XP</span>
      </div>
      <span className="inline-flex items-center gap-1 text-amber-300">
        <Coins className="w-3.5 h-3.5" aria-hidden />
        {game.gold}g
      </span>
    </div>
  );
}
