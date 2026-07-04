/**
 * Tracker → Blog “magic sync” — map library entries to mini-posts (few-click flow).
 */
import type { CreateMiniPostInput, MiniPostType } from '../types/miniPost';

export type TrackerAnimeLike = {
  id: string;
  title: string;
  status: string;
  episodes?: number;
  progress?: number;
  watched?: number;
  rating?: number;
  coverImage?: string;
};

export type MagicSyncPreset = 'status' | 'rating' | 'review' | 'recommend';

const STATUS_VERB: Record<string, string> = {
  Watching: 'watching',
  Completed: 'finished',
  'Plan to Watch': 'planning to watch',
  Dropped: 'dropped',
  'On Hold': 'on hold with',
};

function mapStatus(status: string): CreateMiniPostInput['status'] {
  const m: Record<string, CreateMiniPostInput['status']> = {
    Watching: 'watching',
    Completed: 'completed',
    'Plan to Watch': 'plan_to_watch',
    Dropped: 'dropped',
    'On Hold': 'on_hold' as any,
  };
  return m[status] ?? 'watching';
}

export function suggestPreset(anime: TrackerAnimeLike): MagicSyncPreset {
  if (anime.status === 'Completed') return anime.rating && anime.rating > 0 ? 'review' : 'status';
  if (anime.rating && anime.rating > 0) return 'rating';
  if (anime.status === 'Plan to Watch') return 'recommend';
  return 'status';
}

export function buildMagicSyncInput(
  anime: TrackerAnimeLike,
  preset: MagicSyncPreset,
  overrides?: { content?: string; visibility?: 'public' | 'private_draft' },
): CreateMiniPostInput {
  const ep = anime.episodes ?? 0;
  const prog = anime.progress ?? anime.watched ?? 0;
  const verb = STATUS_VERB[anime.status] ?? 'tracking';

  let type: MiniPostType = 'status_update';
  let content = '';
  let rating: number | undefined;

  switch (preset) {
    case 'rating':
      type = 'rating';
      rating = anime.rating && anime.rating > 0 ? anime.rating : 8;
      content = `Rated "${anime.title}" ${rating}/10`;
      break;
    case 'review':
      type = 'quick_review';
      rating = anime.rating && anime.rating > 0 ? anime.rating : undefined;
      content = rating
        ? `Quick take on "${anime.title}" — ${rating}/10.`
        : `Quick take on "${anime.title}".`;
      break;
    case 'recommend':
      type = 'recommendation';
      content = `Recommend checking out "${anime.title}"!`;
      break;
    default:
      type = 'status_update';
      content =
        ep > 0
          ? `Currently ${verb} "${anime.title}" (${prog}/${ep} eps).`
          : `Currently ${verb} "${anime.title}".`;
  }

  if (overrides?.content?.trim()) content = overrides.content.trim();

  return {
    type,
    content,
    anime_id: anime.id,
    anime_title: anime.title,
    anime_cover: anime.coverImage,
    visibility: overrides?.visibility ?? 'private_draft',
    source: 'tracker',
    auto_generated: true,
    rating: type === 'rating' || type === 'quick_review' ? rating : undefined,
    status: type === 'status_update' ? mapStatus(anime.status) : undefined,
    episodes_watched: type === 'status_update' ? prog : undefined,
    total_episodes: type === 'status_update' && ep > 0 ? ep : undefined,
  };
}

export function getBlogUrl(path = '/blog'): string {
  if (typeof window === 'undefined') {
    return path;
  }
  const env =
    (import.meta as { env?: Record<string, string> }).env?.VITE_BLOG_URL ||
    (import.meta as { env?: Record<string, string> }).env?.NEXT_PUBLIC_BLOG_URL;
  if (env) {
    const base = env.replace(/\/$/, '');
    return path.startsWith('/') ? `${base}${path}` : `${base}/${path}`;
  }
  if (window.location.pathname.startsWith('/app')) {
    return path;
  }
  return path;
}

export function openBlogAfterSync(options?: { publish?: boolean; highlight?: string }) {
  const q = new URLSearchParams();
  if (options?.publish) q.set('synced', '1');
  if (options?.highlight) q.set('highlight', options.highlight);
  const suffix = q.toString() ? `?${q.toString()}` : '';
  const url = `${getBlogUrl('/blog')}${suffix}`;
  if (typeof window !== 'undefined') {
    window.location.assign(url);
  }
  return url;
}
