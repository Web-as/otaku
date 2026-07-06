"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Lock, Crown } from 'lucide-react';

export default function RestrictedWrapper({ children }: { children: React.ReactNode }) {
  const [hasAccess, setHasAccess] = useState<boolean>(true); // Default to true to prevent hydration flicker, check on mount
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Check if cookie exists
    const hasCookie = document.cookie.includes('early_access_unlocked');
    setHasAccess(hasCookie);
  }, []);

  if (!isClient) return <>{children}</>; // Render normally on server, blur on client if needed

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* The actual content, heavily blurred and disabled */}
      <div className="pointer-events-none select-none blur-[12px] opacity-40 grayscale-[30%]">
        {children}
      </div>

      {/* The Nano Banana Glassmorphic FOMO Overlay */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div className="bg-[#050505]/80 backdrop-blur-3xl border border-yellow-500/30 rounded-3xl p-8 md:p-12 max-w-2xl w-full text-center shadow-[0_0_80px_rgba(255,251,0,0.15)] animate-fade-in-up">
          
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(255,251,0,0.4)]">
            <Lock className="w-10 h-10 text-black" />
          </div>

          <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-4 drop-shadow-md">
            Area <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-pink-500">Restricted</span>
          </h2>
          
          <p className="text-gray-400 text-lg mb-8 max-w-lg mx-auto">
            You are viewing a live preview of the closed beta. To unlock full access to the Library, Visual Novel Studio, and VR Guilds, you must become a Founder.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/preregister"
              className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black rounded-xl font-black text-sm uppercase tracking-widest shadow-[0_0_30px_rgba(255,251,0,0.3)] transition-all transform hover:scale-105 hover:-translate-y-1 flex items-center justify-center pointer-events-auto"
            >
              <Crown className="w-5 h-5 mr-3" />
              Become a Founder
            </Link>
            <Link
              href="/"
              className="px-8 py-4 bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-xl font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center pointer-events-auto"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
