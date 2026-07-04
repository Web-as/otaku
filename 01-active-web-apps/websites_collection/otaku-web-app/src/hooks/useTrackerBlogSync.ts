'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/firebase';
import { createMiniPost, patchMiniPost } from '@/services/miniPostService';
import {
  buildMagicSyncInput,
  suggestPreset,
  type MagicSyncPreset,
  type TrackerAnimeLike,
} from '@/shared/trackerBlog/sync';
import { scoutPublicPost } from '@/shared/librarian';

export type SyncResult = { postId: string; published: boolean };

export function useTrackerBlogSync() {
  const router = useRouter();

  const resolveAuthor = useCallback(() => {
    const u = getCurrentUser();
    if (!u?.uid) return null;
    return {
      userId: u.uid,
      authorName: u.displayName || u.email?.split('@')[0] || 'Member',
    };
  }, []);

  const syncToBlog = useCallback(
    async (
      anime: TrackerAnimeLike,
      options?: {
        preset?: MagicSyncPreset;
        content?: string;
        publish?: boolean;
        navigate?: boolean;
      },
    ): Promise<SyncResult> => {
      const author = resolveAuthor();
      if (!author) {
        router.push('/auth?next=/app/library');
        throw new Error('Sign in to sync to the blog');
      }

      const preset = options?.preset ?? suggestPreset(anime);
      const input = buildMagicSyncInput(anime, preset, {
        content: options?.content,
        visibility: options?.publish ? 'public' : 'private_draft',
      });

      const post = await createMiniPost(author.userId, author.authorName, input);

      if (options?.publish) {
        const published = await patchMiniPost(post.id, { visibility: 'public' });
        if (published) scoutPublicPost({ ...published, visibility: 'public' }, author.userId);
      }

      if (options?.navigate !== false) {
        router.push(`/blog?synced=1&highlight=${encodeURIComponent(post.id)}`);
      }

      return { postId: post.id, published: Boolean(options?.publish) };
    },
    [resolveAuthor, router],
  );

  const magicSync = useCallback(
    (anime: TrackerAnimeLike) =>
      syncToBlog(anime, { preset: suggestPreset(anime), publish: false, navigate: true }),
    [syncToBlog],
  );

  return { syncToBlog, magicSync, resolveAuthor, suggestPreset };
}
