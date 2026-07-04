'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, User, Clock, ArrowLeft, Tag } from 'lucide-react';
import type { Post } from '../lib/postTypes';

const PostDetail: React.FC = () => {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetch(`/api/posts/${encodeURIComponent(slug)}`)
        .then(r => (r.ok ? r.json() : null))
        .then(data => {
          setPost(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#13172a] flex items-center justify-center">
        <div className="text-stone-200">Loading...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#13172a] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-stone-100 mb-4">Post Not Found</h1>
          <button
            onClick={() => router.push('/')}
            className="text-amber-300 hover:text-amber-200 transition"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#13172a] text-stone-100">
      {/* Header */}
      <nav className="fixed w-full z-50 bg-[#13172a]/95 backdrop-blur-md border-b border-amber-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => router.push('/')}
              className="flex items-center space-x-2 text-stone-400 hover:text-stone-100 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-bold uppercase tracking-wider">Back to Blog</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Image */}
      <div className="pt-16 relative h-[400px] overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#13172a] via-[#13172a]/50 to-transparent" />
      </div>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        {/* Category Badge */}
        <div className="mb-4">
          <span className="px-3 py-1 bg-amber-500 text-slate-950 text-xs font-bold uppercase tracking-wider rounded-sm">
            {post.category}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
          {post.title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-stone-400 mb-8 pb-8 border-b border-amber-900/30">
          <div className="flex items-center">
            <User className="w-4 h-4 mr-2 text-amber-300" />
            {post.author}
          </div>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-indigo-300" />
            {post.date}
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2 text-cyan-300" />
            {post.readTime}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          {post.tags.map(tag => (
            <span
              key={tag}
              className="flex items-center text-xs text-stone-400 bg-slate-900 px-2 py-1 rounded border border-amber-900/25"
            >
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </span>
          ))}
        </div>

        {/* Post Content */}
        <div className="prose prose-invert prose-lg max-w-none mb-16">
          <div className="text-stone-300 leading-relaxed space-y-6">
            {post.content.split('\n\n').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
};

export default PostDetail;
