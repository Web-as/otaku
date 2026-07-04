/**
 * Orama lore index prep — ADV-20 / snippet36 (dynamic import; requires @orama/orama in app).
 */
export type LoreDocument = { id: string; text: string; tags?: string[] };

export const ORAMA_VECTOR_PHASE = {
  modelId: 'Xenova/all-MiniLM-L6-v2',
  dimensions: 384,
  idbKey: 'otaku_lore_orama_v1',
} as const;

export async function buildLoreIndex(docs: LoreDocument[]) {
  const { create, insert } = await import('@orama/orama');
  const db = await create({
    schema: { text: 'string', tags: 'string' },
  });
  for (const doc of docs) {
    await insert(db, {
      id: doc.id,
      text: doc.text,
      tags: (doc.tags ?? []).join(' '),
    });
  }
  return db;
}

export async function searchLoreIndex(db: Awaited<ReturnType<typeof buildLoreIndex>>, query: string, limit = 5) {
  const { search } = await import('@orama/orama');
  const q = query.trim();
  if (!q) return [];
  const result = await search(db, { term: q, limit, tolerance: 1 });
  return result.hits.map((h) => String((h.document as { text?: string }).text ?? ''));
}
