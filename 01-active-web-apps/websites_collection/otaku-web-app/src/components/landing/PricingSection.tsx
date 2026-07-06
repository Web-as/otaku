"use client";
import React from 'react';
import Link from 'next/link';
import { Check, Globe, Crown, Zap, Sparkles, X, CreditCard, Star } from 'lucide-react';
import { useLanguage } from '@/services/i18n';
import FadeInSection from '@/components/ui/FadeInSection';
import SectionHeading from '@/components/ui/SectionHeading';

const PricingSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="pricing" className="py-24 bg-[#050505] border-t border-gray-800/50 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-violet-900/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <FadeInSection>
          <SectionHeading
            badge="Early Access"
            badgeColor="yellow"
            title="Become a"
            titleHighlight="Founder"
            subtitle="Secure your closed beta spot and unlock exclusive permanent perks."
          />
        </FadeInSection>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto items-end tilt-card-wrapper mt-16">
          
          {/* TIER 1: Beta Tester */}
          <FadeInSection delay="0ms">
            <div className="bg-[#0a0a0c] border border-gray-800 rounded-2xl p-8 relative flex flex-col h-[520px] transition-transform duration-300 hover:-translate-y-2">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-300 uppercase tracking-wider mb-2">Beta Tester Pack</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">€1.00</span>
                  <span className="text-sm text-gray-500 font-bold">/ one-time</span>
                </div>
                <p className="text-xs text-gray-400 mt-2">Get your foot in the door.</p>
              </div>
              
              <ul className="space-y-4 text-sm flex-1">
                <li className="flex items-start gap-3 text-gray-300">
                  <Check className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  <span>Immediate Desktop Launcher Download</span>
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <Check className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  <span>Immediate Web Beta Access</span>
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <Check className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  <span>1 Month Premium at Launch</span>
                </li>
                <li className="flex items-start gap-3 text-white font-bold">
                  <Star className="w-5 h-5 text-gray-400 flex-shrink-0 fill-current" />
                  <span>"Pioneer" Profile Badge</span>
                </li>
              </ul>
              
              <Link
                href="/preregister"
                className="w-full mt-6 py-4 bg-gray-800 hover:bg-gray-700 text-white font-bold uppercase tracking-wider rounded-xl transition-colors border border-gray-600 text-center block"
              >
                Get Beta Pack
              </Link>
            </div>
          </FadeInSection>

          {/* TIER 2: Founder */}
          <FadeInSection delay="100ms">
            <div className="bg-[#050505] border-2 border-yellow-500 rounded-2xl p-8 relative flex flex-col h-[560px] shadow-[0_0_40px_rgba(255,251,0,0.15)] z-20 tilt-card">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-6 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-yellow-500/50">
                The Ultimate Support
              </div>
              
              <div className="mb-6 mt-4">
                <h3 className="text-2xl font-bold text-yellow-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Crown className="w-6 h-6 animate-glow-pulse" />
                  Founder's Pack
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-white">€2.50</span>
                  <span className="text-sm text-gray-400 font-bold">/ month</span>
                </div>
                <p className="text-sm text-yellow-500 mt-2 font-bold">Fund the project. Own the platform.</p>
              </div>
              
              <ul className="space-y-4 text-sm flex-1">
                <li className="flex items-start gap-3 text-white">
                  <Check className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                  <span>Everything in Beta Tester</span>
                </li>
                <li className="flex items-start gap-3 text-white">
                  <Check className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                  <span>Banked Free Months (1 for 1)</span>
                </li>
                <li className="flex items-start gap-3 text-yellow-400 font-bold">
                  <Sparkles className="w-5 h-5 flex-shrink-0" />
                  <span>Legendary "Founder" Badge</span>
                </li>
                <li className="flex items-start gap-3 text-yellow-400 font-bold">
                  <Star className="w-5 h-5 flex-shrink-0 fill-current" />
                  <span>Founder's Avatar Glow</span>
                </li>
              </ul>
              
              <Link
                href="/preregister"
                className="w-full mt-6 py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-yellow-900/50 text-center block"
              >
                Become a Founder
              </Link>
            </div>
          </FadeInSection>

        </div>
      </div>
    </section>
  );
};

export default PricingSection;
