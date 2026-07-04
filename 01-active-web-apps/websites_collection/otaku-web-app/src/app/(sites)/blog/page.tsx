"use client";
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import MilestoneTracker from '@/components/landing/MilestoneTracker';

export default function BlogLanding() {
  const { setAuthModalOpen } = useAuth();

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center relative overflow-hidden px-4">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 text-center max-w-2xl">
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-4 text-[#00f0ff]">
          Library of Otaku <span className="text-white">Blog</span>
        </h1>
        <p className="text-gray-400 mb-8 text-lg">
          Dive deep into the culture. Read the latest dev logs, community highlights, and anime analysis from the Library of Otaku ecosystem.
        </p>

        <button
          onClick={() => setAuthModalOpen(true)}
          className="px-8 py-4 bg-gray-900 border border-gray-700 hover:border-blue-500 text-white font-bold uppercase tracking-wider rounded-xl transition-all"
        >
          Join the Ecosystem
        </button>

        <div className="mt-12 w-full text-left">
          <MilestoneTracker />
        </div>
      </div>
    </div>
  );
}
