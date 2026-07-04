/** Token-scored library catalog search (Orama upgrade path for otaku-web-app). */

export type SearchableMedia = {
  id: string;
  title: string;
  tags?: string[];
  studios?: string[];
  status?: string;
  type?: string;
  resolution?: string;
};

function tokenize(query: string): string[] {
  return query.trim().toLowerCase().split(/\s+/).filter(Boolean);
}

function haystack(item: SearchableMedia): string {
  return [item.title, item.type, item.status, item.resolution, ...(item.tags ?? []), ...(item.studios ?? [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function scoreItem(item: SearchableMedia, tokens: string[]): number {
  const text = haystack(item);
  let score = 0;
  for (const token of tokens) {
    if (item.title.toLowerCase().includes(token)) score += 2;
    if (text.includes(token)) score += 1;
  }
  return score;
}

export function searchMediaItems<T extends SearchableMedia>(items: T[], query: string): T[] {
  const tokens = tokenize(query);
  if (!tokens.length) return items;

  return items
    .map((item) => ({ item, score: scoreItem(item, tokens) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);
}
