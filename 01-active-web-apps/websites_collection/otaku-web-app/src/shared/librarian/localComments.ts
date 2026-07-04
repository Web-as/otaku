import type { LibrarianComment } from './types';

const STORAGE_KEY = 'librarianComments';

type Store = Record<string, LibrarianComment[]>;

function load(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Store;
  } catch {
    /* ignore */
  }
  return {};
}

function persist(store: Store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new Event('librarian-comments-updated'));
}

export function getLibrarianComments(postId: string): LibrarianComment[] {
  return load()[postId] ?? [];
}

export function addLibrarianComment(
  postId: string,
  comment: Omit<LibrarianComment, 'id' | 'post_id' | 'created_at'>,
): LibrarianComment {
  const store = load();
  const list = store[postId] ?? [];
  const row: LibrarianComment = {
    ...comment,
    id: `lib-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    post_id: postId,
    created_at: new Date().toISOString(),
  };
  if (list.some((c) => c.prompt_id && c.prompt_id === row.prompt_id)) {
    return list.find((c) => c.prompt_id === row.prompt_id)!;
  }
  store[postId] = [row, ...list].slice(0, 20);
  persist(store);
  return row;
}

export function getAllLibrarianComments(): Store {
  return load();
}
