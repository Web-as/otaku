'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center relative overflow-hidden px-4">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-anime-grid opacity-5" />
      </div>

      <div className="text-center relative z-10 max-w-lg">
        <div className="inline-flex items-center justify-center p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertTriangle className="w-10 h-10 text-red-400" />
        </div>

        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-4">
          System <span className="text-red-400">Malfunction</span>
        </h2>
        <p className="text-gray-400 mb-8 max-w-sm mx-auto leading-relaxed">
          Something went wrong. The Guild Engineers have been notified and are working on a fix.
        </p>

        {error.digest && (
          <p className="text-[10px] text-gray-600 font-mono mb-6">
            Error Digest: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-black uppercase tracking-widest rounded-md shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all transform hover:-translate-y-0.5 text-sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold uppercase tracking-widest rounded-md border border-gray-800 hover:border-gray-700 transition text-sm"
          >
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Link>
        </div>

        <p className="text-[10px] text-gray-600 font-mono uppercase tracking-widest mt-12">
          Error Handler Active • System v2.5.0-BETA
        </p>
      </div>
    </div>
  );
}
