'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getCurrentUser } from '@/lib/firebase';
import { getUserProfile, getAnimeLibrary, upsertUserProfile } from '../shared/supabase/database';
import { calculateOtakuClass } from '../shared/utils/otakuClass';

/**
 * Embeds the DM Friend web client from `dm-friend-rpg-new`.
 * Set `VITE_APP_DMF_RPG_URL` to that app origin (e.g. http://localhost:3003).
 */
export default function DmFriendPage() {
  const [failedToLoad, setFailedToLoad] = useState(false);
  const [otakuParams, setOtakuParams] = useState('');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  
  const raw = process.env.NEXT_PUBLIC_APP_DMF_RPG_URL?.trim();
  let baseUrl = raw ? raw.replace(/\/$/, '') : '';

  useEffect(() => {
    async function initProfile() {
      try {
        const user = getCurrentUser();
        if (!user) {
          setIsLoadingProfile(false);
          return;
        }

        const profile = await getUserProfile(user.uid);
        let currentClass = profile?.otaku_class;
        let currentTier = profile?.otaku_tier;

        // If class is missing, we calculate it from their library
        if (!currentClass) {
          const library = await getAnimeLibrary(user.uid);
          
          // Calculate genres from library (mocking a bit since genre isn't in AnimeEntry, assuming Librarian enriched it or simple fallback)
          // Ideally the Librarian backend would provide genre tags, but we'll use a basic calc here for demonstration.
          const genre_counts: Record<string, number> = {};
          library.forEach((entry: any) => {
             // Mock generic mapping if no genres present, or if entry has tags
             const tags = entry.tags || ['Action']; 
             tags.forEach((t: string) => genre_counts[t] = (genre_counts[t] || 0) + 1);
          });
          
          const calc = calculateOtakuClass({
            total_anime_count: library.length,
            genre_counts
          });

          currentClass = calc.className;
          currentTier = calc.tierName;

          // Save back to profile
          await upsertUserProfile(user.uid, {
            otaku_class: currentClass,
            otaku_tier: currentTier,
            otaku_rank: calc.rankName
          });
        }

        const params = new URLSearchParams();
        if (currentClass) params.set('charClass', currentClass);
        if (currentTier) params.set('tier', currentTier);
        if (profile?.display_name) params.set('charName', profile.display_name);

        setOtakuParams('?' + params.toString());
      } catch (e) {
        console.error('Failed to init DM Friend otaku profile', e);
      } finally {
        setIsLoadingProfile(false);
      }
    }
    
    initProfile();
  }, []);

  const iframeSrc = baseUrl + otakuParams;

  if (!baseUrl) {
    return (
      <div className="min-h-screen bg-[#13172a] text-stone-100 flex flex-col items-center justify-center px-4">
        <p className="text-stone-400 text-center max-w-md mb-6">
          DM Friend is not configured. Set <code className="text-amber-300">VITE_APP_DMF_RPG_URL</code> to the
          DM Friend app origin (run <code className="text-amber-300">npm run dev</code> in{' '}
          <code className="text-stone-500">dm-friend-rpg-new</code>, default port 3003).
        </p>
        <Link
          href="/blog"
          className="text-xs font-bold uppercase tracking-widest text-amber-300 hover:text-amber-200"
        >
          ← Back to blog
        </Link>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[#13172a] flex flex-col">
      <header className="shrink-0 flex items-center justify-between gap-4 px-4 py-3 border-b border-amber-900/30 bg-[#13172a]/95">
        <Link
          href="/blog"
          className="text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-stone-100 transition"
        >
          ← Blog
        </Link>
        <span className="text-[10px] font-mono text-stone-500 truncate">DM Friend (embedded)</span>
        {baseUrl && (
          <a
            href={baseUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-bold uppercase tracking-widest text-amber-300 hover:text-amber-200 transition"
          >
            Open in new tab ↗
          </a>
        )}
      </header>
      {failedToLoad ? (
        <div className="flex-1 w-full min-h-0 bg-[#1b2137] text-stone-300 flex items-center justify-center px-6 text-center">
          <div>
            <p className="mb-4">Could not load DM Friend in the embedded frame.</p>
            <a
              href={baseUrl}
              target="_blank"
              rel="noreferrer"
              className="text-amber-300 hover:text-amber-200 text-xs font-bold uppercase tracking-widest"
            >
              Open DM Friend in new tab ↗
            </a>
          </div>
        </div>
      ) : (
        <iframe
          title="DM Friend — AI text RPG"
          src={iframeSrc}
          loading="lazy"
          className="flex-1 w-full min-h-0 border-0 bg-[#1a1a2e]"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          allow="fullscreen"
          onError={() => setFailedToLoad(true)}
        />
      )}
    </div>
  );
}
