import type { MiniPost } from '../types/miniPost';

function tokenize(query: string): string[] {
  return query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

function postHaystack(post: MiniPost): string {
  return [
    post.content,
    post.anime_title,
    post.type,
    post.status,
    post.author_name,
    ...(post.tags ?? []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function scorePost(post: MiniPost, tokens: string[]): number {
  const haystack = postHaystack(post);
  let score = 0;
  for (const token of tokens) {
    if (haystack.includes(token)) score += 1;
    if (post.anime_title.toLowerCase().startsWith(token)) score += 1;
  }
  return score;
}

/** Phase-1 gazette search (Orama used in otaku-web-app via useGazetteSearch). */
export function searchMiniPosts(posts: MiniPost[], query: string): MiniPost[] {
  const tokens = tokenize(query);
  if (!tokens.length) return posts;

  return posts
    .map((post) => ({ post, score: scorePost(post, tokens) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ post }) => post);
}

export function rankMiniPostsByRecency(posts: MiniPost[]): MiniPost[] {
  return [...posts].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}
