import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Eye, LogOut, ArrowLeft } from 'lucide-react';
import { onAuthChange, getCurrentUser, logOut } from '@/lib/firebase';
import { getUserPosts, deleteBlogPost, createBlogPost, updateBlogPost } from '../services/blogService';
import PostEditor from '@/components/blog/PostEditor';
import { LoadingSpinner } from '../../../shared/components/LoadingSpinner';
import { useUserProfile } from '../../../shared/hooks/useUserProfile';
import { UserProfileCard } from '../../../shared/components/UserBadge';
import type { BlogPost } from '../types';
import type { BadgeType } from '../../../shared/types/userBadges';

const Admin: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState(getCurrentUser());
  const { profile } = useUserProfile();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthChange((authUser) => {
      setUser(authUser);
      if (!authUser) {
        router.push('/login?redirect=/admin');
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (user) {
      loadPosts();
    }
  }, [user]);

  const loadPosts = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const userPosts = await getUserPosts(user.uid);
      setPosts(userPosts);
    } catch (err: any) {
      setError(err.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (post: Omit<BlogPost, 'id' | 'date'>) => {
    if (!user) return;

    try {
      await createBlogPost(user.uid, post);
      setCreating(false);
      await loadPosts();
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create post');
    }
  };

  const handleUpdatePost = async (post: Omit<BlogPost, 'id' | 'date'>) => {
    if (!editing) return;

    try {
      await updateBlogPost(editing.id, post);
      setEditing(null);
      await loadPosts();
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update post');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await deleteBlogPost(postId);
      await loadPosts();
    } catch (err: any) {
      setError(err.message || 'Failed to delete post');
    }
  };

  const handleLogout = async () => {
    await logOut();
    router.push('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Checking authentication..." />
      </div>
    );
  }

  if (creating || editing) {
    return (
      <PostEditor
        post={editing || undefined}
        onSave={editing ? handleUpdatePost : handleCreatePost}
        onCancel={() => {
          setCreating(false);
          setEditing(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#13172a] text-stone-100">
      {/* Header */}
      <div className="bg-slate-900 border-b border-amber-900/30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 text-stone-400 hover:text-stone-100"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Blog
              </button>
              <h1 className="text-2xl font-bold text-stone-100">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              {profile && (
                <UserProfileCard
                  displayName={profile.display_name || user.email || 'User'}
                  title={profile.active_title}
                  badges={profile.badges as BadgeType[] || []}
                  compact
                />
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-stone-300 hover:bg-slate-800 rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Actions */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-stone-100">
            Your Posts ({posts.length})
          </h2>
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400"
          >
            <Plus className="w-4 h-4" />
            New Post
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-900/20 border border-rose-500/40 rounded-lg text-rose-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner text="Loading posts..." />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 bg-slate-900 rounded-xl border-2 border-dashed border-amber-900/30">
            <div className="text-stone-500 mb-4">
              <Plus className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-stone-100 mb-2">No posts yet</h3>
            <p className="text-stone-400 mb-6">Create your first blog post to get started</p>
            <button
              onClick={() => setCreating(true)}
              className="px-6 py-3 bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400"
            >
              Create First Post
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-slate-900 rounded-lg border border-amber-900/30 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-amber-500/20 text-amber-200 rounded-full text-sm font-medium">
                        {post.category}
                      </span>
                      <span className="text-sm text-stone-500">{post.date}</span>
                    </div>
                    <h3 className="text-xl font-bold text-stone-100 mb-2">{post.title}</h3>
                    <p className="text-stone-400 mb-3">{post.excerpt}</p>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-slate-800 text-stone-400 rounded text-xs border border-amber-900/20"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => router.push(`/posts/${post.id}`)}
                      className="p-2 text-stone-400 hover:bg-slate-800 rounded-lg"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditing(post)}
                      className="p-2 text-indigo-300 hover:bg-indigo-900/20 rounded-lg"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="p-2 text-rose-300 hover:bg-rose-900/20 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
