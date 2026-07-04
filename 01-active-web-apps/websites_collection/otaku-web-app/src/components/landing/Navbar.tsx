"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, Globe, ChevronDown, Zap, Rocket, Menu, X, BookOpen, Gamepad2 } from 'lucide-react';
import { useLanguage } from '@/services/i18n';
import { LanguageSwitcher } from '../LanguageSwitcher';

const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPortalMenuOpen, setIsPortalMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t, setLanguage } = useLanguage();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close portal menu on outside click
  useEffect(() => {
    if (!isPortalMenuOpen) return;
    const handleClick = () => setIsPortalMenuOpen(false);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [isPortalMenuOpen]);

  const handlePortalSelect = (type: 'LT' | 'EU') => {
    setIsPortalMenuOpen(false);
    if (type === 'LT') setLanguage('LT');
    if (type === 'EU') setLanguage('EN');
  };

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#050505]/90 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/20'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="bg-gradient-to-br from-violet-600 to-pink-600 p-1.5 rounded-sm transform group-hover:rotate-12 transition-transform duration-300">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-white group-hover:text-violet-400 transition uppercase">
              {t.nav.brand}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1 text-sm font-bold tracking-wide uppercase">
            {/* App Links */}
            <div className="flex items-center space-x-1 mr-3 border-r border-gray-800 pr-3">
              <Link href="/app/library" className="px-3 py-1.5 hover:bg-white/5 rounded-md text-xs text-gray-400 hover:text-white transition">
                <BookOpen className="w-3.5 h-3.5 inline mr-1.5" />Library
              </Link>
              <Link href="/vn" className="px-3 py-1.5 hover:bg-white/5 rounded-md text-xs text-gray-400 hover:text-white transition">
                <Gamepad2 className="w-3.5 h-3.5 inline mr-1.5" />VN Studio
              </Link>
            </div>

            {/* Section Links */}
            <a href="#features" className="px-3 py-1.5 text-gray-400 hover:text-white transition rounded-md hover:bg-white/5 text-xs">
              {t.nav.features}
            </a>
            <a href="#roadmap" className="px-3 py-1.5 text-gray-400 hover:text-white transition rounded-md hover:bg-white/5 text-xs">
              {t.nav.roadmap}
            </a>
            <a href="#pricing" className="px-3 py-1.5 text-gray-400 hover:text-white transition rounded-md hover:bg-white/5 text-xs">
              Pricing
            </a>

            {/* Portal Dropdown & Language Switcher */}
            <div className="flex items-center ml-2 space-x-2">
              <LanguageSwitcher />
              
              <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setIsPortalMenuOpen(!isPortalMenuOpen); }}
                className={`flex items-center px-4 py-2 rounded-md border text-xs transition-all ${
                  isPortalMenuOpen
                    ? 'border-violet-500/50 text-white bg-violet-500/10'
                    : 'border-gray-800 text-gray-400 hover:text-white hover:border-gray-600'
                }`}
              >
                <Globe className="w-3.5 h-3.5 mr-2" />
                Portal
                <ChevronDown className={`w-3 h-3 ml-2 transition-transform ${isPortalMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isPortalMenuOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 mt-2 w-64 bg-[#0f0e17] border border-violet-500/20 rounded-xl shadow-2xl shadow-violet-900/20 z-50 overflow-hidden animate-scale-in"
                >
                  <div className="px-4 py-2 bg-violet-900/10 border-b border-violet-500/10 text-[10px] font-mono text-violet-300 uppercase tracking-widest">
                    Select Region
                  </div>
                  <button onClick={() => handlePortalSelect('LT')} className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center group transition-colors">
                    <span className="text-xl mr-3">🇱🇹</span>
                    <div>
                      <div className="font-bold text-white text-xs group-hover:text-violet-400">Otaku Gildija</div>
                      <div className="text-[10px] text-gray-500 font-mono">Lithuanian Community</div>
                    </div>
                  </button>
                  <button onClick={() => handlePortalSelect('EU')} className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center group transition-colors">
                    <span className="text-xl mr-3">🇪🇺</span>
                    <div>
                      <div className="font-bold text-white text-xs group-hover:text-pink-400">Library of Otaku</div>
                      <div className="text-[10px] text-gray-500 font-mono">International Hub</div>
                    </div>
                  </button>
                  <div className="border-t border-gray-800 my-1" />
                  <Link href="/blog" className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center group transition-colors">
                    <Zap className="w-5 h-5 mr-3 text-yellow-500" />
                    <div>
                      <div className="font-bold text-white text-xs group-hover:text-yellow-400">DevLog Transmissions</div>
                      <div className="text-[10px] text-gray-500 font-mono">Updates & News</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>
            </div>

            {/* CTA */}
            <Link
              href="/auth"
              className="ml-3 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white px-5 py-2.5 rounded-md shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all transform hover:-translate-y-0.5 flex items-center font-black text-xs"
            >
              <Rocket className="w-3.5 h-3.5 mr-2" />
              Open App
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden z-50 relative">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white p-2 hover:bg-white/5 rounded-md transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-[#050505]/98 backdrop-blur-xl z-40 flex flex-col justify-center items-center space-y-6 animate-fade-in-up lg:hidden">
          <div className="flex gap-4">
            <Link href="/app/library" onClick={() => setMobileMenuOpen(false)} className="text-gray-400 uppercase font-bold text-sm hover:text-white transition">Library</Link>
            <Link href="/vn" onClick={() => setMobileMenuOpen(false)} className="text-gray-400 uppercase font-bold text-sm hover:text-white transition">VN Studio</Link>
          </div>

          <a onClick={() => setMobileMenuOpen(false)} href="#features" className="text-xl font-bold text-white uppercase tracking-widest hover:text-violet-400 transition">{t.nav.features}</a>
          <a onClick={() => setMobileMenuOpen(false)} href="#roadmap" className="text-xl font-bold text-white uppercase tracking-widest hover:text-violet-400 transition">{t.nav.roadmap}</a>
          <a onClick={() => setMobileMenuOpen(false)} href="#pricing" className="text-xl font-bold text-white uppercase tracking-widest hover:text-violet-400 transition">Pricing</a>

          <div className="w-48 border-t border-gray-800 my-4" />
          <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">Select Portal</div>

          <button onClick={() => { handlePortalSelect('LT'); setMobileMenuOpen(false); }} className="text-lg font-bold text-gray-300 hover:text-violet-400 transition">🇱🇹 Otaku Gildija</button>
          <button onClick={() => { handlePortalSelect('EU'); setMobileMenuOpen(false); }} className="text-lg font-bold text-gray-300 hover:text-pink-400 transition">🇪🇺 Library of Otaku</button>
          <Link href="/blog" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-yellow-500 hover:text-yellow-400 transition">DevLog News</Link>

          <div className="w-48 border-t border-gray-800 my-4" />

          <Link
            href="/auth"
            onClick={() => setMobileMenuOpen(false)}
            className="text-xl font-black bg-gradient-to-r from-violet-600 to-pink-600 text-white px-8 py-3 rounded-md uppercase tracking-widest shadow-xl flex items-center"
          >
            <Rocket className="w-5 h-5 mr-2" />
            Open App
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
