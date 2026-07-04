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
      {/* Background glow orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-violet-600/8 rounded-full blur-[120px] pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-pink-600/6 rounded-full blur-[100px] pointer-events-none" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Pre-sale Badge */}
        <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-400 text-[10px] sm:text-xs font-bold mb-8 font-mono tracking-widest uppercase animate-fade-in-up">
          <Sparkles className="w-3 h-3 mr-2" />
          {t.hero.presale} — Strict $1.00 Price
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-8 leading-[0.9] text-white drop-shadow-2xl animate-fade-in-up delay-100">
          {t.hero.title_prefix} <br />
          <span className="text-gradient-brand">{t.hero.title_suffix}</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-4 max-w-2xl mx-auto text-lg sm:text-xl text-gray-400 mb-10 font-medium px-4 leading-relaxed animate-fade-in-up delay-200">
          {t.hero.subtitle}
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
        <div className="flex flex-col items-center gap-6 mb-16 animate-fade-in-up delay-500">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4">
            <Link
              href="/pricing"
              className="px-10 py-5 bg-white text-black hover:bg-gray-100 rounded-md font-black text-sm uppercase tracking-widest shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all transform hover:scale-105 hover:-translate-y-1 flex items-center justify-center"
            >
              <Globe className="w-5 h-5 mr-3" />
              Open Web App — $1.00
            </Link>
            <Link
              href="/vn"
              className="px-10 py-5 bg-transparent border border-violet-500/40 text-violet-400 hover:bg-violet-500/10 hover:border-violet-400 rounded-md font-black text-sm uppercase tracking-widest transition-all transform hover:scale-105 hover:-translate-y-1 flex items-center justify-center"
            >
              <Sparkles className="w-5 h-5 mr-3" />
              Try VN Studio
            </Link>
          </div>

          <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest flex items-center gap-2">
            <Check className="w-3 h-3 text-green-500" />
            Browser + WebXR • No Install • One Dollar
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
