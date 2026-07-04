'use client';

import { useState } from 'react';
import { scoutAllPublicPosts } from '../../librarian/scout';
import type { MiniPost } from '../../types/miniPost';
import { LIBRARIAN_PERSONA } from '../../librarian/types';

type Props = {
  posts: MiniPost[];
  onScoutComplete?: (added: number) => void;
};

/** Kana scouts public gazette posts (librarian_bot_theory). */
export function LibrarianScoutPanel({ posts, onScoutComplete }: Props) {
  const [lastRun, setLastRun] = useState<number | null>(null);
  const [added, setAdded] = useState(0);

  const runScout = () => {
    const n = scoutAllPublicPosts(posts);
    setAdded(n);
    setLastRun(Date.now());
    onScoutComplete?.(n);
  };

  return (
    <div className="hud-panel p-4 border border-[var(--anime-neon-violet-deep,#6f78b7)]/40">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-bold text-white text-sm">{LIBRARIAN_PERSONA.name} — Scout</p>
          <p className="text-xs text-zinc-400 mt-0.5">
            Rule-based comments on public mini-posts (max 2 per post).
          </p>
        </div>
        <button type="button" onClick={runScout} className="theme-cta-secondary text-xs font-bold">
          Run scout
        </button>
      </div>
      {lastRun && (
        <p className="text-xs text-[var(--anime-cyan)] mt-3 font-mono">
          Last run: +{added} comment{added === 1 ? '' : 's'}
        </p>
      )}
    </div>
  );
}
