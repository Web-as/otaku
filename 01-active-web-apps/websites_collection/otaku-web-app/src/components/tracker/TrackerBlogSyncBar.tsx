'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

interface TrackerBlogSyncBarProps {
  onOpenGuide?: () => void;
}

export default function TrackerBlogSyncBar({ onOpenGuide }: TrackerBlogSyncBarProps) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border border-amber-500/25 bg-gradient-to-r from-amber-950/40 to-violet-950/30">
      <div className="flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-amber-100">Tracker ↔ Blog magic sync</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Hover a title → <span className="text-amber-300">✦</span> one click saves a draft on the
            gazette. Or customize in 3 steps and publish.
          </p>
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        {onOpenGuide && (
          <button
            type="button"
            onClick={onOpenGuide}
            className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-gray-300 hover:text-white"
          >
            How it works
          </button>
        )}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white"
        >
          Open blog <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
