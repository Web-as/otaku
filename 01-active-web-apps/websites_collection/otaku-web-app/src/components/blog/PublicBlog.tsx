import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LayoutGrid, Calendar, User, ChevronRight, PenTool, Hash, Newspaper, TrendingUp, Search, Swords } from 'lucide-react';
import { getAllPosts } from '@/lib/markdownActions';
import type { PostMetadata } from '@/lib/postTypes';
import type { BlogPost } from '@/types';
import {
  getPublicMiniPosts,
  getUserDraftMiniPosts,
  patchMiniPost,
  toggleMiniPostLike,
} from '@/services/miniPostService';
import { onAuthChange, getCurrentUser } from '@/lib/firebase';
import { getUserEntitlements } from '@/shared/entitlements';
import MiniPostCard from './MiniPostCard';
import type { MiniPost } from '@/shared/types/miniPost';
import { useLibrarianScout } from '@/hooks/useLibrarianScout';
import { useSupabaseRealtime } from '@/hooks/useSupabaseRealtime';

function postMetadataToBlogPost(m: PostMetadata): BlogPost {
  const isReview = m.category?.toLowerCase() === 'review';
  return {
    id: m.slug,
    title: m.title,
    excerpt: m.excerpt,
    author: m.author,
    date: m.date,
    category: m.category,
    tags: m.tags,
    image: m.image,
    readTime: m.readTime,
    ...(isReview ? { type: 'review' as const } : {}),
  };
}

interface PublicBlogProps {
  onLoginClick?: () => void;
  onHomeClick?: () => void;
}

const CategoryBadge: React.FC<{ category: string }> = ({ category }) => {
    let color = "bg-gray-700 text-gray-300";
    if (category === 'Review') color = "bg-amber-900/30 text-amber-200 border border-amber-500/30";
    if (category === 'Engineering') color = "bg-indigo-900/40 text-indigo-200 border border-indigo-500/30";
    if (category === 'Deep Dive') color = "bg-violet-900/40 text-violet-200 border border-violet-500/30";
    if (category === 'Guide') color = "bg-emerald-900/40 text-emerald-200 border border-emerald-500/30";

    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${color}`}>
            {category}
        </span>
    );
};

const PublicBlog: React.FC<PublicBlogProps> = ({ onLoginClick, onHomeClick }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const syncedFromTracker = searchParams.get('synced') === '1';
  const highlightPostId = searchParams.get('highlight');
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    let cancelled = false;
    getAllPosts().then((mds) => {
      if (!cancelled) setPosts(mds.map(postMetadataToBlogPost));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const featuredPost = posts.length > 0 ? (posts.find(p => p.tags?.includes('Masterpiece')) || posts[0]) : null;
  const reviews = posts.filter(p => p.type === 'review');
  const deepDives = posts.filter(p => p.category === 'Deep Dive' || p.category === 'Engineering');
  const communityPosts = posts.filter(p => p.category !== 'Deep Dive' && p.type !== 'review');

  const [activeTab, setActiveTab] = useState<'All' | 'Reviews' | 'Deep Dives' | 'Guild News'>('All');
  const [miniPosts, setMiniPosts] = useState<MiniPost[]>([]);
  const [draftPosts, setDraftPosts] = useState<MiniPost[]>([]);
  const [authUid, setAuthUid] = useState<string | null>(() => getCurrentUser()?.uid ?? null);
  const [entitlementHint, setEntitlementHint] = useState<string>('');

  const reloadMini = useCallback(async () => {
    const posts = await getPublicMiniPosts();
    setMiniPosts(posts);
    const u = getCurrentUser();
    if (u) {
      const d = await getUserDraftMiniPosts(u.uid);
      setDraftPosts(d);
      try {
        const e = await getUserEntitlements(u.uid);
        setEntitlementHint(
          e.hasLibraryPremium ? 'Tracker library: Premium' : 'Tracker library: Free',
        );
      } catch {
        setEntitlementHint('');
      }
    } else {
      setDraftPosts([]);
      setEntitlementHint('');
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthChange((u) => {
      setAuthUid(u?.uid ?? null);
      void reloadMini();
    });

    void reloadMini();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'miniPosts') void reloadMini();
    };

    const handleLocal = () => void reloadMini();

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('miniPosts-updated', handleLocal);
    return () => {
      unsub();
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('miniPosts-updated', handleLocal);
    };
  }, [reloadMini]);

  // Real-time synchronization for the blog feed
  useSupabaseRealtime(
    {
      table: 'mini_posts',
    },
    reloadMini
  );

  useLibrarianScout(miniPosts, authUid);

  const handleLikeMiniPost = async (postId: string) => {
    await toggleMiniPostLike(postId);
    await reloadMini();
  };

  const handlePublishDraft = async (postId: string) => {
    await patchMiniPost(postId, { visibility: 'public' });
    await reloadMini();
  };
  
  const openPostBySlug = (slug: string) => {
    router.push(`/posts/${encodeURIComponent(slug)}`);
  };

  const filteredPosts = activeTab === 'All' ? posts : 
                        activeTab === 'Reviews' ? reviews :
                        activeTab === 'Deep Dives' ? deepDives : communityPosts;

  return (
    <div className="min-h-screen bg-[#13172a] text-stone-100 font-sans selection:bg-amber-400 selection:text-slate-950">
      
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-[#13172a]/95 backdrop-blur-md border-b border-amber-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3 cursor-pointer group" onClick={onHomeClick}>
              <div className="p-1.5 bg-indigo-600 rounded-sm group-hover:rotate-12 transition">
                  <LayoutGrid className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight uppercase">Nexus <span className="text-amber-400">Gazette</span></span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              {entitlementHint && (
                <span className="text-[10px] font-mono text-gray-500 uppercase max-w-[220px] truncate">
                  {entitlementHint}
                </span>
              )}
              <button onClick={onHomeClick} className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition">Home</button>
              <button
                type="button"
                onClick={() => router.push('/dm-friend')}
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-amber-300 transition"
              >
                <Swords className="w-3.5 h-3.5" />
                Text RPG
              </button>
              <div className="h-4 w-[1px] bg-gray-700"></div>
              <button 
                onClick={onLoginClick}
                className="text-xs font-bold uppercase tracking-widest text-slate-950 bg-amber-400 hover:bg-amber-300 px-5 py-2 rounded-sm transition shadow-lg shadow-amber-900/20"
              >
                Member Login
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-24 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[size:40px_40px] bg-anime-grid opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {posts.length === 0 ? (
              <div className="text-center py-20">
                <Newspaper className="w-20 h-20 text-gray-700 mx-auto mb-6" />
                <h1 className="text-4xl font-black text-white mb-4">No Posts Yet</h1>
                <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
                  This blog is ready for content. Start adding your posts to share with the community.
                </p>
                <button onClick={onLoginClick} className="bg-violet-600 hover:bg-violet-500 text-white px-8 py-3 rounded-sm font-bold uppercase tracking-widest text-sm transition">
                  Get Started
                </button>
              </div>
            ) : (
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Feature */}
                {featuredPost && (
                <div onClick={() => openPostBySlug(featuredPost.id)} className="lg:col-span-2 relative h-[400px] rounded-xl overflow-hidden group cursor-pointer border border-gray-800 hover:border-violet-500 transition-all">
                    <img src={featuredPost.image} alt={featuredPost.title} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f0e17] via-[#0f0e17]/50 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-8">
                        <CategoryBadge category={featuredPost.category || 'General'} />
                        <h1 className="text-3xl md:text-4xl font-black mt-3 mb-3 leading-tight group-hover:text-amber-300 transition">{featuredPost.title}</h1>
                        <p className="text-gray-300 text-sm line-clamp-2 max-w-xl mb-4">{featuredPost.excerpt}</p>
                        <div className="flex items-center text-xs font-mono text-gray-400 space-x-4">
                            <span className="flex items-center"><User className="w-3 h-3 mr-2 text-amber-400" /> {featuredPost.author}</span>
                            <span className="flex items-center"><Calendar className="w-3 h-3 mr-2 text-indigo-300" /> {featuredPost.date}</span>
                        </div>
                    </div>
                </div>
                )}

                {/* Sidebar / Trending */}
                <div className="space-y-6">
                    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-4 flex items-center">
                            <TrendingUp className="w-4 h-4 mr-2 text-green-500" /> Trending Now
                        </h3>
                        <div className="space-y-4">
                            {posts.slice(1, 4).map((post, idx) => (
                                <div key={post.id} role="presentation" onClick={() => openPostBySlug(post.id)} className="group cursor-pointer">
                                    <div className="flex items-center text-[10px] text-gray-500 font-mono mb-1">
                                        <span className="text-pink-500 mr-2">#{idx + 1}</span>
                                        {post.category}
                                    </div>
                                    <h4 className="font-bold text-sm text-gray-200 group-hover:text-white transition leading-snug">{post.title}</h4>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-violet-900/20 to-gray-900 border border-violet-500/30 rounded-xl p-6 text-center">
                        <PenTool className="w-8 h-8 text-violet-400 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-white mb-2">Write for the Guild</h3>
                        <p className="text-xs text-gray-400 mb-4">
                            Got a hot take? Share your reviews and deep dives with the community.
                        </p>
                        <button className="w-full py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold uppercase tracking-widest rounded-sm transition">
                            Submit Article
                        </button>
                    </div>
                </div>
            </div>
            )}
        </div>
      </header>

      {posts.length > 0 && (
      <>
      {/* Filters */}
      <div className="border-y border-gray-800 bg-[#0a0a0c]">
          <div className="max-w-7xl mx-auto px-4 overflow-x-auto">
              <div className="flex space-x-8 py-4 min-w-max">
                  {['All', 'Reviews', 'Deep Dives', 'Guild News'].map(tab => (
                      <button 
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                      >
                          {tab}
                      </button>
                  ))}
              </div>
          </div>
      </div>

      {syncedFromTracker && authUid && (
        <section className="py-4 bg-amber-950/30 border-b border-amber-500/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm text-amber-100 font-semibold">
              Magic sync complete — your tracker update is in My drafts below. Publish when ready.
            </p>
            <button
              type="button"
              onClick={() => router.replace('/blog')}
              className="text-xs text-amber-400/80 hover:text-amber-200 mt-1 underline"
            >
              Dismiss
            </button>
          </div>
        </section>
      )}

      {/* My drafts (tracker / blog sync) */}
      {authUid && draftPosts.length > 0 && (
        <section className="py-8 bg-[#111118] border-b border-amber-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-amber-200 uppercase tracking-wide">From your tracker</h2>
              <span className="text-xs text-amber-600/80 font-mono">Drafts · publish to gazette</span>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {draftPosts.map((post) => (
                <div
                  key={post.id}
                  className={`relative rounded-xl transition ${
                    highlightPostId === post.id ? 'ring-2 ring-amber-400 shadow-lg shadow-amber-900/30' : ''
                  }`}
                >
                  <MiniPostCard post={post} onLike={handleLikeMiniPost} />
                  <button
                    type="button"
                    onClick={() => void handlePublishDraft(post.id)}
                    className="mt-2 w-full py-2 text-xs font-bold uppercase tracking-wider bg-amber-600 hover:bg-amber-500 text-black rounded-sm"
                  >
                    Publikuoti
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Mini Posts from Tracker (public only) */}
      {miniPosts.length > 0 && (
        <section className="py-8 bg-[#0a0a0c] border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white uppercase tracking-wide">
                Community Updates
              </h2>
              <span className="text-xs text-gray-500 font-mono">From Anime Tracker</span>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {miniPosts.slice(0, 6).map(post => (
                <MiniPostCard 
                  key={post.id} 
                  post={post}
                  onLike={handleLikeMiniPost}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Content Grid */}
      <section className="py-12 bg-[#0f0e17]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map(post => (
                    <article key={post.id} onClick={() => openPostBySlug(post.id)} className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-violet-500/50 transition duration-300 flex flex-col group cursor-pointer shadow-lg hover:shadow-violet-900/20">
                        <div className="h-48 bg-gray-800 relative overflow-hidden">
                             {post.image ? (
                                <img src={post.image} alt={post.title} className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition duration-500" />
                             ) : (
                                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                                    <Newspaper className="w-16 h-16 text-white" />
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

                            {/* Tags */}
                            {post.tags && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {post.tags.slice(0, 3).map(tag => (
                                        <span key={tag} className="flex items-center text-[9px] text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded border border-gray-700">
                                            <Hash className="w-2 h-2 mr-1" /> {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
                                <span className="text-[10px] text-gray-600 font-mono uppercase">{post.readTime} Read</span>
                                <span className="text-violet-400 text-xs font-bold uppercase tracking-wider flex items-center group-hover:translate-x-1 transition-transform">
                                    Read <ChevronRight className="w-3 h-3 ml-1" />
                                </span>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </div>
      </section>
      </>
      )}

      {/* Footer */}
      <footer className="bg-[#0a0a0c] border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-widest">Stay Connected</h3>
            <p className="text-gray-500 text-sm mb-8 max-w-md mx-auto">
                Join the Otaku Elite. Get the latest reviews, tech guides, and guild news delivered to your terminal.
            </p>
            <div className="max-w-md mx-auto flex gap-2">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input type="email" placeholder="enter_email_address..." className="w-full bg-gray-900 border border-gray-700 text-white pl-10 pr-4 py-3 rounded-sm focus:border-violet-500 outline-none font-mono text-sm placeholder-gray-600" />
                </div>
                <button className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-3 rounded-sm font-bold uppercase tracking-widest text-xs transition">
                    Subscribe
                </button>
            </div>
            <div className="mt-12 text-[10px] text-gray-600 font-mono uppercase">
                <p>© 2024 Nexus Gazette. A Property of Library of Otaku.</p>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicBlog;
