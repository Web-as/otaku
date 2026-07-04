import Link from 'next/link';
import { Home, Search, ArrowLeft, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center relative overflow-hidden px-4">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/3 w-[400px] h-[400px] bg-pink-600/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-anime-grid opacity-5" />
      </div>

      <div className="text-center relative z-10 max-w-lg">
        {/* Glitch-style 404 */}
        <div className="relative mb-8">
          <h1 className="text-[120px] md:text-[180px] font-black leading-none text-gradient-brand opacity-20 select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <Compass className="w-20 h-20 text-violet-400 animate-spin-slow opacity-30" />
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-4">
          Lost in the <span className="text-gradient-brand">Void</span>
        </h2>
        <p className="text-gray-400 mb-8 max-w-sm mx-auto leading-relaxed">
          This page has drifted into another dimension. The Guild Archives don&apos;t have a record of this location.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-black uppercase tracking-widest rounded-md shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all transform hover:-translate-y-0.5 text-sm"
          >
            <Home className="w-4 h-4 mr-2" />
            Return Home
          </Link>
          <Link
            href="/blog"
            className="inline-flex items-center justify-center px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold uppercase tracking-widest rounded-md border border-gray-800 hover:border-gray-700 transition text-sm"
          >
            <Search className="w-4 h-4 mr-2" />
            Browse Blog
          </Link>
        </div>

        <p className="text-[10px] text-gray-600 font-mono uppercase tracking-widest mt-12">
          Error Code: PAGE_NOT_FOUND • System v2.5.0-BETA
        </p>
      </div>
    </div>
  );
}
