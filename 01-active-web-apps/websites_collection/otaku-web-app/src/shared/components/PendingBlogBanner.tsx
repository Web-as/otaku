import { Newspaper, X } from 'lucide-react';
import { useState } from 'react';

type Props = {
  animeTitle: string;
  blogUrl?: string;
  onDismiss?: () => void;
};

/**
 * Shown when desktop sync sets pendingBlog on a completed series (desktop_library_sync_theory).
 */
export function PendingBlogBanner({ animeTitle, blogUrl, onDismiss }: Props) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const href = blogUrl ? `${blogUrl.replace(/\/$/, '')}/compose?title=${encodeURIComponent(animeTitle)}` : undefined;

  return (
    <div
      className="theme-banner-info hud-panel-cut flex flex-wrap items-center gap-3 p-4 mb-6 border border-[var(--anime-cyan)]/30"
      role="status"
    >
      <Newspaper className="w-5 h-5 text-[var(--anime-cyan)] shrink-0" aria-hidden />
      <div className="flex-1 min-w-[200px]">
        <p className="font-semibold text-white text-sm">Series complete — share your take?</p>
        <p className="text-xs text-zinc-400 mt-0.5">
          <span className="text-[var(--anime-neon-violet)]">{animeTitle}</span> finished on desktop. Write a mini-post for the gazette.
        </p>
      </div>
      {href ? (
        <a
          href={href}
          className="theme-cta-secondary anime-focus-ring px-4 py-2 min-h-[44px] inline-flex items-center text-sm font-bold"
        >
          Write post
        </a>
      ) : null}
      <button
        type="button"
        onClick={() => {
          setDismissed(true);
          onDismiss?.();
        }}
        className="anime-focus-ring p-2 min-h-[44px] min-w-[44px] text-zinc-500 hover:text-white"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
