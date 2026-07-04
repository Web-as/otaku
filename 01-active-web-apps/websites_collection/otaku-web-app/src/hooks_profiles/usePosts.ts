import { useState, useEffect } from 'react';
import { postsAPI } from '../services/api';
import type { PersonalBlogPost, BlogStats } from '../types';

export const usePosts = (filter?: string) => {
  const [posts, setPosts] = useState<PersonalBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await postsAPI.getAll(filter);
      setPosts(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const createPost = async (data: {
    title: string;
    excerpt?: string;
    content: string;
    cover_image?: string;
    status: string;
    category?: string;
    tags?: string[];
  }) => {
    try {
      await postsAPI.create(data);
      await fetchPosts();
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || 'Failed to create post');
    }
  };

  const updatePost = async (id: string, data: Partial<PersonalBlogPost>) => {
    try {
      await postsAPI.update(id, data);
      await fetchPosts();
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || 'Failed to update post');
    }
  };

  const deletePost = async (id: string) => {
    try {
      await postsAPI.delete(id);
      await fetchPosts();
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || 'Failed to delete post');
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
