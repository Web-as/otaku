"use client";
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import MilestoneTracker from '@/components/landing/MilestoneTracker';

export default function TrackerLanding() {
  const { setAuthModalOpen } = useAuth();

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center relative overflow-hidden px-4">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-pink-600/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 text-center max-w-2xl">
        {/* Language switch mock button (will be integrated properly in the header) */}
        <div className="absolute top-4 right-4 text-xs font-bold text-gray-500 hover:text-white cursor-pointer">
          [LT / EN]
        </div>

        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-4 text-[#ff00ff]">
          Otaku Biblioteka
        </h1>
        <p className="text-gray-400 mb-8 text-lg">
          Tavo asmeninis anime sekimo įrankis. Sinchronizuok sąrašus ir rask naujų rekomendacijų su AI bibliotekininke.
        </p>

        <button
          onClick={() => setAuthModalOpen(true)}
          className="px-8 py-4 bg-gray-900 border border-gray-700 hover:border-pink-500 text-white font-bold uppercase tracking-wider rounded-xl transition-all"
        >
          Pradėti Stebėti
        </button>

        <div className="mt-12 w-full text-left">
          <MilestoneTracker />
        </div>
      </div>
    </div>
  );
}
