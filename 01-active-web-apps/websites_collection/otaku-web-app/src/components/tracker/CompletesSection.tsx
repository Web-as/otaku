'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Monitor } from 'lucide-react';
import type { UserProfile } from '@/shared/supabase/database';

export default function CompletesSection({ profile }: { profile: UserProfile | null }) {
  const queue = profile?.completes_queue ?? [];
  if (queue.length === 0) return null;

  return (
    <section className="mb-8 rounded-xl border border-amber-500/25 bg-amber-950/20 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Monitor className="w-5 h-5 text-amber-400" />
        <h2 className="font-bold text-amber-100">Completes (from desktop)</h2>
        <span className="text-xs text-gray-500">Launcher sync — no browser needed</span>
      </div>
      <ul className="space-y-2">
        {queue.slice(0, 8).map(item => (
          <li
            key={item.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-black/30 border border-white/5"
          >
            <div>
              <p className="font-medium text-white text-sm">{item.title}</p>
              <p className="text-xs text-gray-400">{item.message}</p>
              <p className="text-[10px] text-gray-600 mt-1">
                {item.status} · {item.progress ?? 0} eps this season · S{item.season}E{item.episode}
              </p>
            </div>
            {item.pendingBlog && (
              <Link
                href="/blog"
                className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white shrink-0"
              >
                <Sparkles className="w-3 h-3" />
                Blog from tracker
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
