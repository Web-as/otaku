'use client';

import { useEffect, useMemo, useState } from 'react';
import type { MiniPost } from '@/shared/types/miniPost';
import { searchMiniPosts } from '@/shared/lib/miniPostSearch';
import { buildGazetteIndex, searchGazetteIndex, type GazetteIndex } from '@/lib/gazetteOrama';

/** Orama-backed gazette search with fuzzy fallback. */
export function useGazetteSearch(posts: MiniPost[], query: string) {
  const [index, setIndex] = useState<GazetteIndex | null>(null);
  const [oramaHits, setOramaHits] = useState<MiniPost[] | null>(null);

  useEffect(() => {
    if (!posts.length) {
      setIndex(null);
      return;
    }
    let cancelled = false;
    buildGazetteIndex(posts)
      .then((db) => {
        if (!cancelled) setIndex(db);
      })
      .catch(() => {
        if (!cancelled) setIndex(null);
      });
    return () => {
      cancelled = true;
    };
  }, [posts]);

  useEffect(() => {
    if (!query.trim() || !index) {
      setOramaHits(null);
      return;
    }
    let cancelled = false;
    searchGazetteIndex(index, query)
      .then((hits) => {
        if (!cancelled) setOramaHits(hits);
      })
      .catch(() => {
        if (!cancelled) setOramaHits(null);
      });
    return () => {
      cancelled = true;
    };
  }, [index, query]);

  return useMemo(() => {
    if (!query.trim()) return posts;
    if (oramaHits) return oramaHits;
    return searchMiniPosts(posts, query);
  }, [posts, query, oramaHits]);
}
