/**
 * Browser-local mini-post store (tracker ↔ blog demo sync on same origin / shared storage).
 * Production would replace with Supabase.
 */
import type { CreateMiniPostInput, MiniPost } from '../types/miniPost';

const STORAGE_KEY = 'miniPosts';

let memory: MiniPost[] = [];

function normalizePost(row: MiniPost): MiniPost {
  return {
    ...row,
    visibility: row.visibility ?? 'public',
    source: row.source ?? 'manual',
    auto_generated: row.auto_generated ?? false,
  };
}

function loadAll(): MiniPost[] {
  if (memory.length) return memory.map(normalizePost);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      memory = Array.isArray(parsed)
        ? (parsed as MiniPost[]).map(normalizePost)
        : [];
      return memory;
    }
  } catch {
    console.warn('[miniPosts] load failed');
  }
  memory = [];
  return memory;
}

function persist(list: MiniPost[]) {
  memory = list;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('miniPosts-updated'));
  } catch {
    console.warn('[miniPosts] persist failed');
  }
}

export async function createMiniPost(
  userId: string,
  authorName: string,
  input: CreateMiniPostInput,
): Promise<MiniPost> {
  const list = loadAll();
  const miniPost: MiniPost = normalizePost({
    id: `mini-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    user_id: userId,
    author_name: authorName,
    ...input,
    visibility: input.visibility ?? 'public',
    source: input.source ?? 'manual',
    auto_generated: input.auto_generated ?? false,
    created_at: new Date().toISOString(),
    likes: 0,
  });
  persist([miniPost, ...list]);
  return miniPost;
}

export async function getMiniPosts(): Promise<MiniPost[]> {
  return loadAll();
}

export async function getPublicMiniPosts(): Promise<MiniPost[]> {
  return loadAll().filter((p) => (p.visibility ?? 'public') === 'public');
}

export async function getUserDraftMiniPosts(userId: string): Promise<MiniPost[]> {
  return loadAll().filter(
    (p) =>
      p.user_id === userId && (p.visibility ?? 'public') === 'private_draft',
  );
}

export async function patchMiniPost(
  postId: string,
  patch: Partial<Pick<MiniPost, 'visibility' | 'content'>>,
): Promise<MiniPost | null> {
  const list = loadAll();
  const i = list.findIndex((p) => p.id === postId);
  if (i < 0) return null;
  const next = { ...list[i], ...patch };
  list[i] = next;
  persist(list);
  return next;
}

export async function deleteMiniPost(postId: string): Promise<void> {
  persist(loadAll().filter((p) => p.id !== postId));
}

export async function toggleMiniPostLike(postId: string): Promise<MiniPost | null> {
  const list = loadAll();
  const post = list.find((p) => p.id === postId);
  if (!post) return null;
  post.likes = (post.likes || 0) + 1;
  persist(list);
  return post;
}
