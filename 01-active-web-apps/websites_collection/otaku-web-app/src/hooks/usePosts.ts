import { useState, useEffect } from 'react';
import type { PersonalBlogPost, BlogStats } from '../types';

export const usePosts = (filter?: string) => {
  const [posts, setPosts] = useState<PersonalBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const stored = localStorage.getItem('otaku_blog_posts');
      let allPosts: PersonalBlogPost[] = stored ? JSON.parse(stored) : [];
      
      if (filter && filter !== 'all') {
          allPosts = allPosts.filter(p => p.status === filter);
      }
      setPosts(allPosts);
    } catch (err: any) {
      setError('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const createPost = async (data: any) => {
    try {
      const stored = localStorage.getItem('otaku_blog_posts');
      const allPosts: PersonalBlogPost[] = stored ? JSON.parse(stored) : [];
      
      const newPost: PersonalBlogPost = {
          ...data,
          id: `post_${Date.now()}`,
          author_id: 'local_user',
          views: 0,
          likes: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
      };
      
      allPosts.unshift(newPost);
      localStorage.setItem('otaku_blog_posts', JSON.stringify(allPosts));
      await fetchPosts();
    } catch (err: any) {
      throw new Error('Failed to create post');
    }
  };

  const updatePost = async (id: string, data: Partial<PersonalBlogPost>) => {
    try {
      const stored = localStorage.getItem('otaku_blog_posts');
      let allPosts: PersonalBlogPost[] = stored ? JSON.parse(stored) : [];
      
      allPosts = allPosts.map(p => p.id === id ? { ...p, ...data, updated_at: new Date().toISOString() } : p);
      localStorage.setItem('otaku_blog_posts', JSON.stringify(allPosts));
      
      await fetchPosts();
    } catch (err: any) {
      throw new Error('Failed to update post');
    }
  };

  const deletePost = async (id: string) => {
    try {
      const stored = localStorage.getItem('otaku_blog_posts');
      let allPosts: PersonalBlogPost[] = stored ? JSON.parse(stored) : [];
      
      allPosts = allPosts.filter(p => p.id !== id);
      localStorage.setItem('otaku_blog_posts', JSON.stringify(allPosts));
      
      await fetchPosts();
    } catch (err: any) {
      throw new Error('Failed to delete post');
    }
  };

  const calculateStats = (): BlogStats => {
    return {
      totalPosts: posts.length,
      publishedPosts: posts.filter((p: PersonalBlogPost) => p.status === 'published').length,
      draftPosts: posts.filter((p: PersonalBlogPost) => p.status === 'draft').length,
      totalViews: posts.reduce((sum: number, p: PersonalBlogPost) => sum + (p.views || 0), 0),
      totalLikes: posts.reduce((sum: number, p: PersonalBlogPost) => sum + (p.likes || 0), 0),
    };
  };

  return {
    posts,
    loading,
    error,
    stats: calculateStats(),
    createPost,
    updatePost,
    deletePost,
    refetch: fetchPosts,
  };
};
