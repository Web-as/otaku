import React from 'react';
import { LayoutGrid, ArrowLeft, Calendar, User, Tag, ChevronRight } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  author: string;
  date: string;
  excerpt: string;
  category: string;
  readTime: string;
}

const BLOG_POSTS: BlogPost[] = [
    { 
        id: 'b1', 
        title: 'Understanding the Sync Service: Local vs. Cloud', 
        author: 'DevTeam', 
        date: 'Nov 24, 2024', 
        excerpt: 'A deep dive into the Sync Service that bridges the Autosorter (SQLite) and the Website (PostgreSQL) databases to ensure your watch history never desyncs.',
        category: 'Engineering',
        readTime: '5 min read'
    },
    { 
        id: 'b2', 
        title: 'Top 5 Anime to Watch This Winter Season', 
        author: 'CommunityLead', 
        date: 'Nov 18, 2024', 
        excerpt: 'Our picks for the most anticipated releases and returning favorites. Find out what needs to be in your "Plan to Watch" list immediately.',
        category: 'Community',
        readTime: '3 min read'
    },
    {
        id: 'b3',
        title: 'v2.4.0 Release Notes: 4K Support & Faster Hashing',
        author: 'Admin',
        date: 'Nov 10, 2024',
        excerpt: 'We have optimized the hashing algorithm by 40% and added native support for HEVC 10-bit color profiles. Your library scan just got a whole lot faster.',
        category: 'Updates',
        readTime: '2 min read'
    },
    {
        id: 'b4',
        title: 'Designing the Perfect Metadata Scraper',
        author: 'Engineering',
        date: 'Oct 28, 2024',
        excerpt: 'How we aggregate data from AniDB, MAL, and TVDB without hitting rate limits, ensuring your library is always rich with cover art and synopses.',
        category: 'Engineering',
        readTime: '8 min read'
    }
];

interface PublicBlogProps {
  onLoginClick: () => void;
  onHomeClick: () => void;
}

const PublicBlog: React.FC<PublicBlogProps> = ({ onLoginClick, onHomeClick }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-gray-900/95 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={onHomeClick}>
              <LayoutGrid className="w-8 h-8 text-indigo-500" />
              <span className="text-xl font-bold tracking-tight">Otaku Nexus</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={onHomeClick} className="text-sm font-medium text-gray-300 hover:text-white transition">Home</button>
              <button onClick={onHomeClick} className="text-sm font-medium text-gray-300 hover:text-white transition">Features</button>
              <span className="text-sm font-medium text-white border-b-2 border-indigo-500">Blog</span>
              <button 
                onClick={onLoginClick}
                className="text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-full border border-gray-700 transition"
              >
                Web Portal Login
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <header className="pt-32 pb-16 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <button onClick={onHomeClick} className="inline-flex items-center text-indigo-400 hover:text-indigo-300 mb-6 transition">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
            </button>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">Developer Diary & News</h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Updates on development, community highlights, and deep dives into how we build the ultimate anime manager.
            </p>
        </div>
      </header>

      {/* Blog Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {BLOG_POSTS.map(post => (
                    <article key={post.id} className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 hover:border-indigo-500/50 transition duration-300 flex flex-col group cursor-pointer">
                        <div className="h-48 bg-gray-700 relative overflow-hidden">
                             <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-60"></div>
                             {/* Abstract Pattern Placeholder */}
                             <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                             <div className="absolute bottom-4 left-4">
                                <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full uppercase tracking-wider">
                                    {post.category}
                                </span>
                             </div>
                        </div>
                        <div className="p-6 flex-grow flex flex-col">
                            <div className="flex items-center text-xs text-gray-400 mb-3 space-x-3">
                                <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {post.date}</span>
                                <span className="flex items-center"><User className="w-3 h-3 mr-1" /> {post.author}</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors">{post.title}</h3>
                            <p className="text-gray-400 text-sm mb-6 flex-grow leading-relaxed">
                                {post.excerpt}
                            </p>
                            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                                <span className="text-xs text-gray-500 font-mono">{post.readTime}</span>
                                <span className="text-indigo-400 text-sm font-medium flex items-center group-hover:translate-x-1 transition-transform">
                                    Read Article <ChevronRight className="w-4 h-4 ml-1" />
                                </span>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </div>
      </section>

      {/* Newsletter / Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Stay in the loop</h3>
            <p className="text-gray-400 mb-8">Get the latest updates delivered directly to your inbox.</p>
            <div className="max-w-md mx-auto flex gap-2">
                <input type="email" placeholder="Enter your email" className="flex-grow bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-bold transition">Subscribe</button>
            </div>
            <p className="text-xs text-gray-600 mt-12">© 2024 Otaku Nexus. Windows is a trademark of Microsoft Corp.</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicBlog;