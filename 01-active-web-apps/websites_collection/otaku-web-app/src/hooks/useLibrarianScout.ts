'use client';

import { useEffect, useRef } from 'react';
import type { MiniPost } from '@/shared/types/miniPost';
import { scoutAllPublicPosts } from '@/shared/librarian';

/** Kana reads public gazette posts and leaves desk comments when you answered her prompts. */
export function useLibrarianScout(posts: MiniPost[], viewerUserId: string | null) {
  const lastKey = useRef('');

  useEffect(() => {
    if (posts.length === 0) return;
    const key = posts.map((p) => `${p.id}:${p.content.length}`).join('|');
    if (key === lastKey.current) return;
    lastKey.current = key;
    scoutAllPublicPosts(posts, viewerUserId);
  }, [posts, viewerUserId]);
}
