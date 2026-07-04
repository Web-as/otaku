/**
 * Library catalog Orama prep — token search fallback + optional Orama full-text.
 * Works in Vite SPAs without @orama/orama; Next app can use Orama directly.
 */
import { searchMediaItems, type SearchableMedia } from '../lib/mediaSearch';

export type MediaSearchHit<T extends SearchableMedia> = {
  item: T;
  score: number;
};

/** Score-only search (zero deps) — already used in LibraryCatalog. */
export function searchMediaCatalog<T extends SearchableMedia>(
  items: T[],
  query: string,
): T[] {
  return searchMediaItems(items, query);
}

/**
 * Optional Orama full-text (dynamic import so gildija-lt Vite bundle stays lean).
 * Call from otaku-web-app only when @orama/orama is installed.
 */
export async function searchMediaCatalogOrama<T extends SearchableMedia & { id: string }>(
  items: T[],
  query: string,
): Promise<T[]> {
  const q = query.trim();
  if (!q) return items;
  try {
    const { create, insert, search } = await import('@orama/orama');
    const db = await create({
      schema: { title: 'string', tags: 'string', studio: 'string' },
    });
    for (const item of items) {
      await insert(db, {
        id: item.id,
        title: item.title,
        tags: (item.tags ?? []).join(' '),
        studio: (item.studios ?? []).join(' '),
      });
    }
    const result = await search(db, { term: q, limit: 48, tolerance: 1 });
    const ids = new Set(result.hits.map((h) => String(h.id)));
    return items.filter((i) => ids.has(i.id));
  } catch {
    return searchMediaItems(items, q);
  }
}
