import { useEffect, useRef } from 'react';
import { getCurrentUser, onAuthChange } from '@/lib/firebase';
import { animeItemsToAgentPayload } from '../utils/animeMangaAgentContext';
import type { AnimeItem } from '../types';

const SCRIPT_ID = 'otaku-anime-manga-embed-script';

/**
 * Loads the Anime/Manga agent embed script once when `VITE_ANIME_MANGA_AGENT_URL` is set.
 * Call from `TrackerApp` so both free and premium library views get the bubble.
 */
/** Pass Firebase ID token to embed when user is signed in */
export function useAnimeMangaAgentAuthToken(): void {
  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_ANIME_MANGA_AGENT_URL?.trim();
    if (!base) return;

    const apply = async () => {
      const user = getCurrentUser();
      if (!user?.getIdToken || !window.AnimeMangaAgent?.setToken) return;
      try {
        const token = await user.getIdToken();
        window.AnimeMangaAgent.setToken(token);
      } catch (e) {
        console.warn('[anime-agent] setToken failed', e);
      }
    };

    void apply();
    return onAuthChange(() => void apply());
  }, []);
}

export function useAnimeMangaAgentScript(): void {
  useAnimeMangaAgentAuthToken();
  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_ANIME_MANGA_AGENT_URL?.trim();
    if (!base) return;
    if (document.getElementById(SCRIPT_ID)) {
      window.dispatchEvent(new CustomEvent('anime-agent:ready'));
      return;
    }

    const normalized = base.replace(/\/$/, '');
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = `${normalized}/embed.js`;
    script.setAttribute('data-api-url', normalized);
    script.setAttribute('data-lang', 'lt');
    script.setAttribute('data-theme', 'dark');
    script.setAttribute('data-site-name', 'Otaku Gildija');
    script.addEventListener('load', () => {
      window.dispatchEvent(new CustomEvent('anime-agent:ready'));
    });
    script.addEventListener('error', () => {
      console.error('[anime-agent] Failed to load embed script', script.src);
    });
    document.body.appendChild(script);
  }, []);
}

/**
 * Pushes the user's library to the embed once the agent API is available.
 */
export function useAnimeMangaAgentLibrarySync(items: AnimeItem[]): void {
  const lastPayloadRef = useRef<string>('');

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_ANIME_MANGA_AGENT_URL?.trim();
    if (!base) return;

    const payload = animeItemsToAgentPayload(items);
    const payloadKey = JSON.stringify(payload);
    if (lastPayloadRef.current === payloadKey) return;
    let cancelled = false;

    const apply = () => {
      if (cancelled) return true;
      const api = window.AnimeMangaAgent;
      if (api?.setAnimeList) {
        api.setAnimeList(payload);
        lastPayloadRef.current = payloadKey;
        return true;
      }
      return false;
    };

    if (apply()) return;

    const interval = window.setInterval(() => {
      if (apply()) window.clearInterval(interval);
    }, 100);
    const stop = window.setTimeout(() => window.clearInterval(interval), 15000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.clearTimeout(stop);
    };
  }, [items]);
}
