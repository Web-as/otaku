import { getCurrentUser } from '../../shared/firebase';
import { getAnimeLibrary, type AnimeEntry } from '../../shared/supabase';
import type { ExtendedWatchListItem } from '../types';

const USE_DB = true;

function entryToWatchItem(e: AnimeEntry): ExtendedWatchListItem {
  return {
    id: String((e as any).id || Date.now()),
    title: e.title,
    status: e.status === 'completed' ? 'Completed' : e.status === 'watching' ? 'Watching' : 'Plan to Watch',
    progress: e.progress ?? 0,
    episodes: 12,
    image: (e as { cover_image?: string }).cover_image,
    rating: e.rating,
    lastUpdate: new Date().toISOString(),
  };
}

export async function fetchUserWatchlist(): Promise<ExtendedWatchListItem[]> {
  const user = getCurrentUser();
  if (!user || !USE_DB) return [];

  try {
    const rows = await getAnimeLibrary(user.uid);
    return rows.map(entryToWatchItem);
  } catch (e) {
    console.warn('[watchlist] load failed', e);
    return [];
  }
}
