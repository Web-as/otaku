import React from 'react';
import PublicBlog from '@/components/landing/PublicBlog';
import { getAllPosts } from '@/lib/markdown';

export default function BlogPage() {
  const posts = getAllPosts();
  return <PublicBlog posts={posts} />;
}
