import { create, insert, search, type Orama } from '@orama/orama';
import type { MiniPost } from '@/shared/types/miniPost';

export type GazetteIndex = any;

let cachedIndex: GazetteIndex | null = null;
let cachedPosts: MiniPost[] = [];
let cachedKey = '';

export async function buildGazetteIndex(posts: MiniPost[]): Promise<GazetteIndex> {
  const key = posts.map((p) => p.id).join('|');
  if (cachedIndex && cachedKey === key) return cachedIndex;

  const db = await create({
    schema: {
      content: 'string',
      anime_title: 'string',
      author: 'string',
      type: 'string',
    },
  });

  for (const post of posts) {
    await insert(db, {
      id: post.id,
      content: post.content,
      anime_title: post.anime_title,
      author: post.author_name,
      type: post.type,
    });
  }

  cachedIndex = db;
  cachedPosts = posts;
  cachedKey = key;
  return db;
}

export async function searchGazetteIndex(
  db: GazetteIndex,
  query: string,
  limit = 24,
): Promise<MiniPost[]> {
  const q = query.trim();
  if (!q) return cachedPosts;

  const result = await search(db, {
    term: q,
    limit,
    tolerance: 1,
  });

  const ids = new Set(result.hits.map((h) => String(h.id)));
  return cachedPosts.filter((p) => ids.has(p.id));
}

export function invalidateGazetteIndex() {
  cachedIndex = null;
  cachedPosts = [];
  cachedKey = '';
}
