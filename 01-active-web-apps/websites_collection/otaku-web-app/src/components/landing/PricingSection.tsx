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
            badge="Narystės"
            badgeColor="violet"
            title="Atraskite Savo"
            titleHighlight="Potencialą"
            subtitle="Išsirinkite narystę, kuri geriausiai atitinka jūsų poreikius."
          />
        </FadeInSection>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto items-end tilt-card-wrapper mt-16">
          
          {/* TIER 1: Starter */}
          <FadeInSection delay="0ms">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 relative flex flex-col h-[520px] transition-transform duration-300 hover:-translate-y-2">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-300 uppercase tracking-wider mb-2">Starter</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">€1.00</span>
                  <span className="text-sm text-gray-500 font-bold">/ vienkartinis</span>
                </div>
                <p className="text-xs text-gray-400 mt-2">Launcher atsisiuntimas + 1 mėnesio bandomasis periodas</p>
              </div>
              
              <ul className="space-y-4 text-sm flex-1">
                <li className="flex items-start gap-3 text-gray-300">
                  <Check className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  <span>Launcher Atsisiuntimas</span>
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <Check className="w-5 h-5 text-[#00f0ff] flex-shrink-0" />
                  <span>1 Mėnesio Premium Įrankiai</span>
                </li>
                <li className="flex items-start gap-3 text-gray-500">
                  <X className="w-5 h-5 flex-shrink-0" />
                  <span className="line-through">Bibliotekos Kortelė (AR)</span>
                </li>
                <li className="flex items-start gap-3 text-gray-500">
                  <X className="w-5 h-5 flex-shrink-0" />
                  <span className="line-through">VIP Prieiga (Taverna)</span>
                </li>
              </ul>
              
              <Link
                href="/auth"
                className="w-full mt-6 py-4 bg-gray-800 hover:bg-gray-700 text-white font-bold uppercase tracking-wider rounded-xl transition-colors border border-gray-600 text-center block"
              >
                Pradėti nuo €1
              </Link>
            </div>
          </FadeInSection>

          {/* TIER 2: Library Card Holder */}
          <FadeInSection delay="100ms">
            <div className="bg-[#13111c] border-2 border-[#ff00ff] rounded-2xl p-8 relative flex flex-col h-[560px] shadow-[0_0_40px_rgba(255,0,255,0.2)] z-20 tilt-card">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#ff00ff] text-white px-6 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-magenta-500/50">
                Populiariausias
              </div>
              
              <div className="mb-6 mt-4">
                <h3 className="text-2xl font-bold text-[#ff00ff] uppercase tracking-wider mb-2 flex items-center gap-2">
                  <CreditCard className="w-6 h-6" />
                  Card Holder
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-white">€2.50</span>
                  <span className="text-sm text-gray-400 font-bold">/ mėn</span>
                </div>
                <p className="text-sm text-[#ff00ff]/70 mt-2 font-bold">Visos Premium funkcijos visam laikui</p>
              </div>
              
              <ul className="space-y-4 text-sm flex-1">
                <li className="flex items-start gap-3 text-white">
                  <Check className="w-5 h-5 text-[#ff00ff] flex-shrink-0" />
                  <span>Nuolatinė prieiga prie Launcher</span>
                </li>
                <li className="flex items-start gap-3 text-white">
                  <Check className="w-5 h-5 text-[#ff00ff] flex-shrink-0" />
                  <span>Nuolatiniai Premium Įrankiai</span>
                </li>
                <li className="flex items-start gap-3 text-[#00f0ff] font-bold">
                  <Star className="w-5 h-5 flex-shrink-0 fill-current" />
                  <span>Bibliotekos Kortelė (AR Item)</span>
                </li>
                <li className="flex items-start gap-3 text-gray-500">
                  <X className="w-5 h-5 flex-shrink-0" />
                  <span className="line-through">VIP Prieiga (Taverna)</span>
                </li>
              </ul>
              
              <Link
                href="/auth"
                className="w-full mt-6 py-4 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-violet-900/50 text-center block"
              >
                Prenumeruoti
              </Link>
            </div>
          </FadeInSection>

          {/* TIER 3: VIP Access */}
          <FadeInSection delay="200ms">
            <div className="vip-theme bg-[#0a0a05] border-2 border-[#d8b56a] rounded-2xl p-8 relative flex flex-col h-[520px] overflow-hidden group/vip shadow-[0_0_30px_rgba(216,181,106,0.15)] transition-transform duration-300 hover:-translate-y-2">
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(216,181,106,0.1)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] animate-shimmer pointer-events-none" />
              
              <div className="relative z-10 mb-6">
                <h3 className="text-xl font-bold text-[#d8b56a] uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Crown className="w-5 h-5 animate-glow-pulse" />
                  VIP Access
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-gradient-gold">€5.00</span>
                  <span className="text-sm text-[#d8b56a]/60 font-bold">/ mėn</span>
                </div>
                <p className="text-xs text-[#d8b56a]/80 mt-2 font-bold">Ultimate Otaku Patirtis</p>
              </div>
              
              <ul className="space-y-4 text-sm flex-1 relative z-10">
                <li className="flex items-start gap-3 text-white">
                  <Check className="w-5 h-5 text-[#d8b56a] flex-shrink-0" />
                  <span>Visi Card Holder Privalumai</span>
                </li>
                <li className="flex items-start gap-3 text-white">
                  <Check className="w-5 h-5 text-[#d8b56a] flex-shrink-0" />
                  <span className="font-bold text-[#d8b56a]">Prieiga prie VIP Tavernos</span>
                </li>
                <li className="flex items-start gap-3 text-white">
                  <Check className="w-5 h-5 text-[#d8b56a] flex-shrink-0" />
                  <span className="font-bold text-[#d8b56a]">Ekskliuzyvinis Auksinis UI</span>
                </li>
                <li className="flex items-start gap-3 text-white">
                  <Check className="w-5 h-5 text-[#d8b56a] flex-shrink-0" />
                  <span>VIP Discord Rolė & Beta Prieigos</span>
                </li>
              </ul>
              
              <Link
                href="/auth"
                className="w-full mt-6 py-4 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-yellow-900/50 relative z-10 text-center block"
              >
                Tapti VIP
              </Link>
            </div>
          </FadeInSection>

        </div>
      </div>
    </section>
  );
};

export default PricingSection;
