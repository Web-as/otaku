"use client";
import React from 'react';
import Link from 'next/link';
import { Sparkles, Globe, Check, ArrowDown } from 'lucide-react';
import { useLanguage } from '@/services/i18n';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import BeforeAfterDemo from './BeforeAfterDemo';

const HeroSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="relative pt-32 pb-16 lg:pt-44 lg:pb-28 overflow-hidden z-10 text-center">
      {/* Background glow orbs - Nano Banana palette */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-yellow-400/10 rounded-full blur-[120px] pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-pink-600/10 rounded-full blur-[100px] pointer-events-none" aria-hidden="true" />
      <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[150px] pointer-events-none" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Pre-sale Badge */}
        <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-yellow-500/50 bg-yellow-500/10 text-yellow-400 text-[10px] sm:text-xs font-bold mb-8 font-mono tracking-widest uppercase shadow-[0_0_15px_rgba(255,251,0,0.2)]">
          <Sparkles className="w-3 h-3 mr-2" />
          Currently in Closed Beta
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-6 leading-[0.9] text-white drop-shadow-2xl">
          The Ultimate <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-pink-500">
            Anime Ecosystem.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-4 max-w-2xl mx-auto text-lg sm:text-xl text-gray-400 mb-10 font-medium px-4 leading-relaxed">
          Otaku Gildija is currently in closed development. Secure your Founder's Pack today to unlock immediate beta access, exclusive profile badges, and permanent web-app perks.
        </p>

        {/* Stats Counter Row */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 mb-12 animate-fade-in-up delay-300">
          <div className="text-center">
            <AnimatedCounter end={14205} className="text-3xl md:text-4xl font-black text-white font-mono" suffix="+" />
            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mt-1">Files Organized</p>
          </div>
          <div className="text-center">
            <AnimatedCounter end={2400} className="text-3xl md:text-4xl font-black text-white font-mono" suffix="+" />
            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mt-1">Guild Members</p>
          </div>
          <div className="text-center">
            <AnimatedCounter end={52} className="text-3xl md:text-4xl font-black text-white font-mono" suffix="+" />
            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mt-1">API Endpoints</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col items-center gap-6 mb-16">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4">
            <Link
              href="/preregister"
              className="px-10 py-5 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black rounded-md font-black text-sm uppercase tracking-widest shadow-[0_0_40px_rgba(255,251,0,0.4)] transition-all transform hover:scale-105 hover:-translate-y-1 flex items-center justify-center"
            >
              <Globe className="w-5 h-5 mr-3" />
              Become a Founder
            </Link>
            <Link
              href="#features"
              className="px-10 py-5 bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 rounded-md font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center"
            >
              Explore Features
            </Link>
          </div>

          <p className="text-[10px] text-yellow-500/70 font-mono uppercase tracking-widest flex items-center gap-2">
            <Check className="w-3 h-3 text-yellow-500" />
            Beta Spots Available • Instant Download
          </p>
        </div>

        {/* Before/After Demo */}
        <div className="relative mx-auto max-w-5xl px-4 perspective-1000 mb-12 animate-fade-in-up delay-700">
          <BeforeAfterDemo />
        </div>

        {/* Scroll Indicator */}
        <div className="flex justify-center animate-bounce mt-8">
          <ArrowDown className="w-5 h-5 text-gray-600" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
