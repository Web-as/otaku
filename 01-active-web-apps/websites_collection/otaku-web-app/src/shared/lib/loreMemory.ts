/**
 * Lightweight client lore memory (inspired by snippet36_orama — keyword index, no WASM deps).
 */

const DB_NAME = 'otaku_lore_memory';
const STORE = 'memories';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export type LoreEntry = { id: string; text: string; tags: string[]; createdAt: string };

export async function memorizeLore(text: string, tags: string[] = []): Promise<void> {
  if (typeof indexedDB === 'undefined') return;
  const db = await openDb();
  const entry: LoreEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text,
    tags,
    createdAt: new Date().toISOString(),
  };
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(entry);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function recallLore(query: string, limit = 3): Promise<string[]> {
  if (typeof indexedDB === 'undefined') return [];
  const db = await openDb();
  const all = await new Promise<LoreEntry[]>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result as LoreEntry[]);
    req.onerror = () => reject(req.error);
  });
  db.close();

  const terms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
  const scored = all
    .map((entry) => {
      const hay = `${entry.text} ${entry.tags.join(' ')}`.toLowerCase();
      const score = terms.reduce((n, t) => (hay.includes(t) ? n + 1 : n), 0);
      return { entry, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map((s) => s.entry.text);
}
