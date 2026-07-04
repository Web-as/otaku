'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
  Plus,
  Search,
  BarChart3,
  FileText,
  CheckCircle,
  Lock,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import BlogPostCard from '@/components/profiles/BlogPostCard';
import PostEditor from '@/components/profiles/PostEditor';
import { usePosts } from '@/hooks/usePosts';
import type { PersonalBlogPost } from '@/types';
import { useAuth } from '../contexts/AuthContext';
import { useMembership } from '@/hooks/useMembership';
import { BlogProfileShell } from '@/shared/blog/BlogProfileShell';
import { themeFromProfile } from '@/shared/blog/profileTheme';
import '@/styles/blogProfile.css';

export default function MyBlogPage() {
  const { user } = useAuth();
  const { status, uid } = useMembership();
  const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'private'>('all');
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<PersonalBlogPost | undefined>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const { posts, loading, error, stats, createPost, updatePost, deletePost } = usePosts(
    filter === 'all' ? undefined : filter,
  );

  const profileTheme = status
    ? themeFromProfile(
        {
          role: status.role,
          membership_stage: status.stage,
          library_subscription_active: status.hasValidPass,
        },
        status.hasValidPass,
      )
    : themeFromProfile(null, false);

  useEffect(() => {
    // Intercept share intent
    const shareTitle = searchParams.get('share_title');
    const shareContent = searchParams.get('share_content');
    const shareVisibility = searchParams.get('share_visibility');

    if (shareTitle && shareContent && user) {
      // Create the post immediately
      const visibilityStr = shareVisibility === 'published' ? 'published' : 'private';
      
      createPost({
        title: shareTitle,
        content: shareContent,
        excerpt: shareContent.substring(0, 100) + '...',
        tags: ['Quest', 'Storybound'],
        category: 'Thoughts',
        status: visibilityStr as 'published' | 'private',
      }).then(() => {
        // Remove query parameters to prevent duplicate creation on reload
        router.replace(pathname, { scroll: false });
        alert('Shared to .blog successfully!');
      }).catch(err => {
        console.error('Failed to auto-share:', err);
      });
    }
  }, [searchParams, user, createPost, router, pathname]);

  const handleNewPost = () => {
    setEditingPost(undefined);
    setShowEditor(true);
  };

  const handleEdit = (id: string) => {
    const post = posts.find(p => p.id === id);
    if (post) {
      setEditingPost(post);
      setShowEditor(true);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(id);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to delete post';
        alert(message);
      }
    }
  };

  const handleSavePost = async (data: Parameters<typeof createPost>[0]) => {
    if (editingPost) {
      await updatePost(editingPost.id, data);
    } else {
      await createPost(data);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-stone-400">Please sign in to view your profile.</p>
      </div>
    );
  }

  const publicProfileHref = uid ? `/blog/author/${uid}` : '/blog/author/guest';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <BlogProfileShell
        theme={profileTheme}
        isOwner
        identity={{
          displayName: user.username || user.email,
          username: user.email?.split('@')[0],
          bio: 'Your personal anime blog on the Otaku Network — profile skin follows your membership.',
          joinDate: user.created_at,
          chips: [profileTheme.shortLabel, user.tier],
        }}
        stats={[
          { label: 'Total Posts', value: stats.totalPosts },
          { label: 'Published', value: stats.publishedPosts },
          { label: 'Views', value: stats.totalViews },
          { label: 'Likes', value: stats.totalLikes },
        ]}
        footer={
          <p className="text-center text-xs text-stone-500 mt-4">
            <Link href={publicProfileHref} className="text-violet-400 hover:underline">
              View public profile ({profileTheme.shortLabel} skin) →
            </Link>
          </p>
        }
      >
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
              <input
                type="text"
                placeholder="Search your posts..."
                className="w-full bg-slate-900/80 border border-white/10 text-white pl-12 pr-4 py-3 rounded-lg focus:border-[var(--blog-accent)] outline-none transition"
              />
            </div>
            <button
              type="button"
              onClick={handleNewPost}
              className="w-full md:w-auto px-6 py-3 font-semibold rounded-lg transition flex items-center justify-center text-black"
              style={{ background: 'var(--blog-accent)' }}
            >
              <Plus className="w-5 h-5 mr-2" />
              New Post
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {(
              [
                ['all', 'All Posts', BarChart3],
                ['published', 'Published', CheckCircle],
                ['draft', 'Drafts', FileText],
                ['private', 'Private', Lock],
              ] as const
            ).map(([key, label, Icon]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition flex items-center ${
                  filter === key ? profileTheme.tabActiveClass : 'bg-slate-800/80 text-stone-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-6 py-4 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 mr-3" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 text-violet-500 animate-spin mx-auto mb-4" />
              <p className="text-stone-400">Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 rounded-xl border border-white/10 bg-black/20">
              <FileText className="w-16 h-16 text-stone-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-stone-400 mb-2">No posts found</h3>
              <button
                type="button"
                onClick={handleNewPost}
                className="px-6 py-3 font-semibold rounded-lg text-black mt-4"
                style={{ background: 'var(--blog-accent)' }}
              >
                Create New Post
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map(post => (
                <BlogPostCard
                  key={post.id}
                  post={post}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </BlogProfileShell>

      {showEditor && (
        <PostEditor
          post={editingPost}
          onSave={handleSavePost}
          onClose={() => {
            setShowEditor(false);
            setEditingPost(undefined);
          }}
        />
      )}
    </div>
  );
}
