import type { AnimeItem } from '../types';

/**
 * Payload for AnimeMangaAgent embed widget (`window.AnimeMangaAgent.setAnimeList`).
 * @see 05-games-and-interactive/anime_manga_agent/web/embed.js
 */
export type AnimeAgentListItem = {
  mal_id?: number;
  title: string;
  status: 'watching' | 'completed' | 'planning' | 'dropped' | 'on_hold';
  score?: number;
  episodes_watched?: number;
};

const MAL_ID_RE = /^mal-(\d+)$/i;

function mapStatus(s: AnimeItem['status']): AnimeAgentListItem['status'] {
  switch (s) {
    case 'Watching':
      return 'watching';
    case 'Completed':
      return 'completed';
    case 'Plan to Watch':
      return 'planning';
    case 'Dropped':
      return 'dropped';
    case 'On Hold':
      return 'on_hold';
    default:
      return 'planning';
  }
}

export function animeItemsToAgentPayload(items: AnimeItem[]): AnimeAgentListItem[] {
  return items.map((a) => {
    const malMatch = MAL_ID_RE.exec(a.id);
    const mal_id = malMatch ? Number(malMatch[1]) : undefined;
    const entry: AnimeAgentListItem = {
      title: a.titleEnglish || a.title,
      status: mapStatus(a.status),
    };
    if (mal_id !== undefined && !Number.isNaN(mal_id)) {
      entry.mal_id = mal_id;
    }
    if (typeof a.rating === 'number') {
      entry.score = a.rating;
    }
    if (typeof a.watched === 'number' && a.watched >= 0) {
      entry.episodes_watched = a.watched;
    }
    return entry;
  });
}
