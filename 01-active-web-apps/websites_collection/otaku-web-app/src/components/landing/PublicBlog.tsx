"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { LayoutGrid, Calendar, User, ChevronRight, Star, Zap, PenTool, Hash, Newspaper, TrendingUp, Search } from 'lucide-react';
import type { PostMetadata } from '@/lib/markdown';

const CategoryBadge: React.FC<{ category: string }> = ({ category }) => {
  const colorMap: Record<string, string> = {
    'Review': "bg-pink-900/50 text-pink-300 border border-pink-500/30",
    'Engineering': "bg-blue-900/50 text-blue-300 border border-blue-500/30",
    'Deep Dive': "bg-purple-900/50 text-purple-300 border border-purple-500/30",
    'Guide': "bg-green-900/50 text-green-300 border border-green-500/30",
    'Backend': "bg-blue-900/50 text-blue-300 border border-blue-500/30",
    'AI / ML': "bg-pink-900/50 text-pink-300 border border-pink-500/30",
  };
  const color = colorMap[category] || "bg-gray-800 text-gray-300 border border-gray-700";

  return (
    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest ${color}`}>
      {category}
    </span>
  );
};

const PublicBlog: React.FC<{ posts: PostMetadata[] }> = ({ posts = [] }) => {
  const featuredPost = posts.find(p => p.tags?.includes('Masterpiece')) || posts[0];
  const reviews = posts.filter(p => p.type === 'review');
  const deepDives = posts.filter(p => p.category === 'Deep Dive' || p.category === 'Engineering');
  const communityPosts = posts.filter(p => p.category !== 'Deep Dive' && p.type !== 'review');

  const [activeTab, setActiveTab] = useState<'All' | 'Reviews' | 'Deep Dives' | 'Guild News'>('All');

  const filteredPosts = activeTab === 'All' ? posts :
                        activeTab === 'Reviews' ? reviews :
                        activeTab === 'Deep Dives' ? deepDives : communityPosts;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-violet-500/30 selection:text-white">

      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-[#050505]/95 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/blog" className="flex items-center space-x-3 group">
              <div className="p-1.5 bg-gradient-to-br from-violet-600 to-pink-600 rounded-sm group-hover:rotate-12 transition-transform">
                <LayoutGrid className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight uppercase">Nexus <span className="text-pink-500">Gazette</span></span>
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition">Home</Link>
              <div className="h-4 w-[1px] bg-gray-800" />
              <Link
                href="/auth"
                className="text-xs font-bold uppercase tracking-widest text-white bg-pink-600 hover:bg-pink-500 px-5 py-2 rounded-md transition shadow-lg shadow-pink-900/20"
              >
                Member Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-24 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-anime-grid opacity-5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Feature */}
            <div className="lg:col-span-2 relative h-[400px] rounded-2xl overflow-hidden group cursor-pointer border border-gray-800/60 hover:border-violet-500/50 transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-900/30 to-pink-900/20" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8">
                {featuredPost && (
                  <>
                    <CategoryBadge category={featuredPost.category || 'General'} />
                    <h1 className="text-3xl md:text-4xl font-black mt-3 mb-3 leading-tight group-hover:text-violet-400 transition">{featuredPost.title}</h1>
                    <p className="text-gray-300 text-sm line-clamp-2 max-w-xl mb-4">{featuredPost.excerpt}</p>
                    <div className="flex items-center text-xs font-mono text-gray-400 space-x-4">
                      <span className="flex items-center"><User className="w-3 h-3 mr-2 text-pink-500" /> {featuredPost.author}</span>
                      <span className="flex items-center"><Calendar className="w-3 h-3 mr-2 text-violet-500" /> {featuredPost.date}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-[#0a0a0c] border border-gray-800/60 rounded-xl p-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-4 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-green-500" /> Trending Now
                </h3>
                <div className="space-y-4">
                  {posts.slice(1, 4).map((post, idx) => (
                    <div key={idx} className="group cursor-pointer">
                      <div className="flex items-center text-[10px] text-gray-500 font-mono mb-1">
                        <span className="text-pink-500 mr-2">#{idx + 1}</span>
                        {post.category}
                      </div>
                      <h4 className="font-bold text-sm text-gray-200 group-hover:text-white transition leading-snug">{post.title}</h4>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-violet-900/20 to-[#0a0a0c] border border-violet-500/20 rounded-xl p-6 text-center">
                <PenTool className="w-8 h-8 text-violet-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">Write for the Guild</h3>
                <p className="text-xs text-gray-400 mb-4">
                  Got a hot take? Share your reviews and deep dives with the community.
                </p>
                <button className="w-full py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold uppercase tracking-widest rounded-md transition">
                  Submit Article
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="border-y border-gray-800/50 bg-[#0a0a0c]">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto">
          <div className="flex space-x-8 py-4 min-w-max">
            {(['All', 'Reviews', 'Deep Dives', 'Guild News'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-xs font-bold uppercase tracking-widest transition-colors ${
                  activeTab === tab ? 'text-white border-b-2 border-violet-500 pb-1' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <section className="py-12 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map(post => (
              <Link href={`/blog/posts/${post.slug}`} key={post.slug} className="bg-[#0a0a0c] rounded-xl overflow-hidden border border-gray-800/60 hover:border-violet-500/30 transition duration-300 flex flex-col group cursor-pointer shadow-lg hover:shadow-violet-900/10">
                <div className="h-48 bg-gray-900 relative overflow-hidden">
                  {post.image ? (
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 to-pink-900/20 group-hover:opacity-80 transition" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                      <Newspaper className="w-16 h-16 text-white" />
                    </div>
                  )}

                  {post.rating && (
                    <div className="absolute top-3 right-3 bg-[#050505]/90 backdrop-blur border border-pink-500/50 text-pink-400 px-2 py-1 rounded-md flex items-center shadow-lg">
                      <Star className="w-3 h-3 fill-current mr-1" />
                      <span className="text-xs font-bold font-mono">{post.rating}/10</span>
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3">
                    <CategoryBadge category={post.category || 'General'} />
                  </div>
                </div>

                <div className="p-5 flex-grow flex flex-col">
                  <div className="flex items-center text-[10px] text-gray-500 font-mono mb-3 space-x-3 uppercase tracking-wider">
                    <span>{post.date}</span>
                    <span>•</span>
                    <span className="text-violet-400">{post.author}</span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-3 group-hover:text-violet-400 transition-colors line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-gray-400 text-xs leading-relaxed mb-4 line-clamp-3 flex-grow">
                    {post.excerpt}
                  </p>

                  {post.tags && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="flex items-center text-[9px] text-gray-500 bg-gray-900 px-1.5 py-0.5 rounded-md border border-gray-800">
                          <Hash className="w-2 h-2 mr-1" /> {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-800/50 flex items-center justify-between">
                    <span className="text-[10px] text-gray-600 font-mono uppercase">{post.readTime} Read</span>
                    <span className="text-violet-400 text-xs font-bold uppercase tracking-wider flex items-center group-hover:translate-x-1 transition-transform">
                      Read <ChevronRight className="w-3 h-3 ml-1" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a0a0c] border-t border-gray-800/50 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-widest">Stay Connected</h3>
          <p className="text-gray-500 text-sm mb-8 max-w-md mx-auto">
            Join the Otaku Elite. Get the latest reviews, tech guides, and guild news delivered to your terminal.
          </p>
          <div className="max-w-md mx-auto flex gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="email" placeholder="enter_email_address..." className="w-full bg-[#050505] border border-gray-800 text-white pl-10 pr-4 py-3 rounded-md focus:border-violet-500 outline-none font-mono text-sm placeholder-gray-600 transition" />
            </div>
            <button className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-3 rounded-md font-bold uppercase tracking-widest text-xs transition">
              Subscribe
            </button>
          </div>
          <div className="mt-12 text-[10px] text-gray-600 font-mono uppercase">
            <p>© 2026 Nexus Gazette. A Property of Library of Otaku.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicBlog;
