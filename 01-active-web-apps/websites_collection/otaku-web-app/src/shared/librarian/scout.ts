import type { MiniPost } from '../types/miniPost';
import { buildPromptsForPost } from './reactions';
import { craftLibrarianReply, detectAnsweredPrompts } from './reactions';
import { addLibrarianComment, getLibrarianComments } from './localComments';
import { LIBRARIAN_PERSONA } from './types';

/**
 * Kana scouts public gazette posts (she lives on the tracker/library site).
 * She does not need to have watched the anime — prompts are title/status based.
 */
export function scoutPublicPost(post: MiniPost, viewerUserId?: string | null): number {
  if ((post.visibility ?? 'public') !== 'public') return 0;
  if (post.user_id === LIBRARIAN_PERSONA.id) return 0;

  const existing = getLibrarianComments(post.id);
  const prompts = buildPromptsForPost(post.anime_title, post.anime_id, {
    status: mapMiniStatus(post),
    episodesWatched: post.episodes_watched,
    totalEpisodes: post.total_episodes,
    rating: post.rating,
    postType: post.type,
  });

  const answered = detectAnsweredPrompts(post.content, prompts);
  let added = 0;

  for (const prompt of answered.slice(0, 2)) {
    if (existing.some((c) => c.prompt_id === prompt.id)) continue;
    addLibrarianComment(post.id, {
      author_id: 'librarian',
      author_name: LIBRARIAN_PERSONA.name,
      prompt_id: prompt.id,
      body: craftLibrarianReply(
        prompt,
        { animeId: post.anime_id, title: post.anime_title },
        post.content,
      ),
      personalized: Boolean(viewerUserId && post.user_id === viewerUserId),
    });
    added += 1;
  }

  return added;
}

export function scoutAllPublicPosts(
  posts: MiniPost[],
  viewerUserId?: string | null,
): number {
  return posts.reduce((n, p) => n + scoutPublicPost(p, viewerUserId), 0);
}

function mapMiniStatus(post: MiniPost): string | undefined {
  const m: Record<string, string> = {
    watching: 'Watching',
    completed: 'Completed',
    plan_to_watch: 'Plan to Watch',
    dropped: 'Dropped',
    on_hold: 'On Hold',
    started: 'Watching',
  };
  return post.status ? m[post.status] : undefined;
}
