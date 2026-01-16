
import React, { useState, useEffect, useRef } from 'react';
import { Monitor, Server, Database, Zap, ChevronRight, Menu, X, Check, Sparkles, BrainCircuit, Users, Smartphone, Glasses, Globe, Download, ShieldCheck, ArrowDownCircle, AlertTriangle, FileCheck, Heart, Mail, ChevronDown, Cpu, CloudLightning, Blocks, Layers, Terminal, Code2, Rocket } from 'lucide-react';
import { useLanguage, Language } from '../../services/i18n';
import SocialProofWidget from '../community/SocialProofWidget';
import BeforeAfterDemo from './BeforeAfterDemo';

interface ProductLandingProps {
  onLoginClick: () => void;
  onBlogClick: () => void;
  onBuyClick: () => void;
  onLaunchLibrary: () => void;
  onLaunchGuild: () => void;
  onLaunchStudio: () => void;
}

const FUTURE_UPDATES = [
    {
        quarter: "Q1 2025",
        title: "Hyper-Analyzer & Metadata",
        description: "Unified ML Analyzer (3x Speed). Deep Metadata Sync (AniList/MAL/AniDB). AI-Powered Filename Parsing.",
        icon: Cpu,
        status: "In Development",
        progress: 80,
        color: "text-green-400",
        borderColor: "border-green-500/50"
    },
    {
        quarter: "Q2 2025",
        title: "Hybrid Sync & Media Intel",
        description: "Two-Tier Database (SQLite/Postgres) for conflict-free offline sync. Smart Subtitle Management & Watch Progress Tracking.",
        icon: CloudLightning,
        status: "Planning",
        progress: 45,
        color: "text-blue-400",
        borderColor: "border-blue-500/50"
    },
    {
        quarter: "Q3 2025",
        title: "Mobile Command & Plugins",
        description: "Native Android/iOS Companion App for remote control. Community Plugin System for infinite extensibility.",
        icon: Smartphone,
        status: "Concept",
        progress: 15,
        color: "text-pink-400",
        borderColor: "border-pink-500/50"
    },
    {
        quarter: "Q4 2025",
        title: "AI Architect & Social",
        description: "LangChain AI integration for predictive recommendations. Advanced Analytics & Guild Leaderboards.",
        icon: BrainCircuit,
        status: "Locked",
        progress: 0,
        color: "text-violet-400",
        borderColor: "border-violet-500/50"
    }
];

const DEV_ACHIEVEMENTS = [
    {
        title: "File Organizer Core v2.0",
        category: "Engineering",
        description: "Architecture restructuring 100% complete. Features transactional undo system, unified launcher, and real-time performance monitoring.",
        icon: Terminal,
        color: "text-violet-400",
        borderColor: "border-violet-500",
        bgGradient: "from-violet-900/20 to-gray-900"
    },
    {
        title: "Anime Library API Live",
        category: "Backend",
        description: "Production-ready FastAPI with 52+ endpoints. Supports real-time WebSockets, batch operations, and advanced library statistics.",
        icon: Server,
        color: "text-blue-400",
        borderColor: "border-blue-500",
        bgGradient: "from-blue-900/20 to-gray-900"
    },
    {
        title: "AI Visual Intelligence",
        category: "AI / ML",
        description: "Gemini 2.0 integration active. Generates anime-style art, processes thumbnails, and extracts metadata automatically.",
        icon: Sparkles,
        color: "text-pink-400",
        borderColor: "border-pink-500",
        bgGradient: "from-pink-900/20 to-gray-900"
    },
    {
        title: "Unified System Launch",
        category: "Release",
        description: "Integrated CLI, GUI, and Web modes into a single executable. Database schema finalized with automatic migrations.",
        icon: Rocket,
        color: "text-green-400",
        borderColor: "border-green-500",
        bgGradient: "from-green-900/20 to-gray-900"
    }
];

// --- Animation Wrapper Component ---
const FadeInSection: React.FC<{ children: React.ReactNode; delay?: string }> = ({ children, delay = '0ms' }) => {
  const [isVisible, setVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
            setVisible(true);
        }
      });
    });
    if (domRef.current) observer.observe(domRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-1000 transform ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-95'
      }`}
      style={{ transitionDelay: delay }}
    >
      {children}
    </div>
  );
};

const ProductLanding: React.FC<ProductLandingProps> = ({ 
    onLoginClick, onBlogClick, onBuyClick, 
    onLaunchLibrary, onLaunchGuild, onLaunchStudio 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPortalMenuOpen, setIsPortalMenuOpen] = useState(false);
  const [showFloatingCTA, setShowFloatingCTA] = useState(false);
  const [isBlogPreviewOpen, setIsBlogPreviewOpen] = useState(false);
  const { t, language, setLanguage } = useLanguage();

  // Scroll listener for Floating CTA
  useEffect(() => {
    const handleScroll = () => {
        if (window.scrollY > 600) {
            setShowFloatingCTA(true);
        } else {
            setShowFloatingCTA(false);
        }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePortalSelect = (type: 'LT' | 'EU' | 'BLOG') => {
      setIsPortalMenuOpen(false);
      if (type === 'LT') setLanguage('LT');
      if (type === 'EU') setLanguage('EN');
      if (type === 'BLOG') setIsBlogPreviewOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0f0e17] text-white font-sans selection:bg-pink-500 selection:text-white overflow-x-hidden relative">
      
      {/* Live Social Proof */}
      <SocialProofWidget onBlogClick={onBlogClick} />

      {/* Soft Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-violet-900/5 rounded-full blur-[150px]"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-pink-900/5 rounded-full blur-[150px]"></div>
          <div className="absolute inset-0 bg-[size:40px_40px] bg-anime-grid opacity-10"></div>
      </div>

      {/* Floating CTA Bar */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 bg-[#0f0e17]/90 backdrop-blur-lg border-t border-violet-500/30 p-4 transform transition-transform duration-500 ${showFloatingCTA ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="max-w-7xl mx-auto flex justify-between items-center">
              <div className="hidden md:flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-green-500" />
                  <span className="font-bold text-white uppercase tracking-wider text-sm">v2.4.0-BETA Live</span>
              </div>
              <div className="flex items-center space-x-4 w-full md:w-auto justify-end">
                  <span className="hidden md:inline text-xs text-gray-400 font-mono line-through">€29.99</span>
                  <span className="hidden md:inline text-xl text-white font-black mr-4">$1.00</span>
                  <button 
                    onClick={onBuyClick}
                    className="w-full md:w-auto px-6 py-3 bg-pink-600 hover:bg-pink-500 text-white font-black uppercase tracking-widest rounded-sm shadow-[0_0_15px_rgba(236,72,153,0.6)] flex items-center justify-center animate-pulse"
                  >
                      <Download className="w-4 h-4 mr-2" /> Download Now
                  </button>
              </div>
          </div>
      </div>

      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-[#0f0e17]/90 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3 group cursor-pointer relative" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
              <div className="bg-pink-600 p-1.5 rounded-sm transform group-hover:rotate-12 transition">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-pink-400 transition uppercase">
                {t.nav.brand}
              </span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-4 text-sm font-bold tracking-wide uppercase">
               {/* Quick App Launchers (Demo Features) */}
               <div className="flex items-center space-x-2 mr-4 border-r border-gray-700 pr-4">
                  <button onClick={onLaunchLibrary} className="px-3 py-1.5 hover:bg-white/5 rounded-sm text-xs text-gray-400 hover:text-white transition">Library</button>
                  <button onClick={onLaunchGuild} className="px-3 py-1.5 hover:bg-white/5 rounded-sm text-xs text-gray-400 hover:text-white transition">Guild</button>
                  <button onClick={onLaunchStudio} className="px-3 py-1.5 hover:bg-white/5 rounded-sm text-xs text-gray-400 hover:text-white transition">Studio</button>
               </div>

              <a href="#roadmap" className="text-gray-400 hover:text-white transition">{t.nav.roadmap}</a>
              
              {/* Portal Hub Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setIsPortalMenuOpen(!isPortalMenuOpen)}
                  className={`flex items-center px-4 py-2 rounded-sm border transition-all ${isPortalMenuOpen ? 'border-violet-500 text-white bg-violet-500/10' : 'border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'}`}
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Network Portal
                  <ChevronDown className="w-3 h-3 ml-2" />
                </button>
                
                {isPortalMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-[#1a1a2e] border border-violet-500/30 rounded-lg shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 bg-violet-900/20 border-b border-violet-500/20 text-[10px] font-mono text-violet-300 uppercase tracking-widest">
                        Select Destination
                    </div>
                    <button onClick={() => handlePortalSelect('LT')} className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center group transition-colors">
                        <span className="text-xl mr-3">🇱🇹</span>
                        <div>
                            <div className="font-bold text-white group-hover:text-pink-400">Otaku Gildija</div>
                            <div className="text-[10px] text-gray-500 font-mono">Lithuanian Community</div>
                        </div>
                    </button>
                    <button onClick={() => handlePortalSelect('EU')} className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center group transition-colors">
                        <span className="text-xl mr-3">🇪🇺</span>
                        <div>
                            <div className="font-bold text-white group-hover:text-pink-400">Library of Otaku</div>
                            <div className="text-[10px] text-gray-500 font-mono">International Hub</div>
                        </div>
                    </button>
                    <div className="border-t border-gray-700/50 my-1"></div>
                    <button onClick={() => handlePortalSelect('BLOG')} className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center group transition-colors">
                        <Zap className="w-5 h-5 mr-3 text-yellow-500" />
                        <div>
                            <div className="font-bold text-white group-hover:text-yellow-400">DevLog Transmissions</div>
                            <div className="text-[10px] text-gray-500 font-mono">Updates & News</div>
                        </div>
                    </button>
                    <div className="border-t border-gray-700/50 my-1"></div>
                    <button onClick={onLoginClick} className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center group transition-colors bg-gray-900/50">
                        <div className="font-bold text-gray-300 group-hover:text-white uppercase text-xs w-full text-center">
                            Web Portal Login
                        </div>
                    </button>
                  </div>
                )}
              </div>

              <button 
                onClick={onBuyClick}
                className="bg-white text-black hover:bg-gray-200 px-6 py-2.5 rounded-sm shadow-[0_0_15px_rgba(255,255,255,0.3)] transition transform hover:-translate-y-0.5 flex items-center font-black"
              >
                <Download className="w-4 h-4 mr-2" />
                GET $1.00 BETA
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden z-50 relative">
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white">
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
            <div className="fixed inset-0 bg-[#0f0e17] z-40 flex flex-col justify-center items-center space-y-6 animate-in fade-in duration-200">
                <div className="flex gap-4">
                     <button onClick={() => { onLaunchLibrary(); setMobileMenuOpen(false); }} className="text-gray-400 uppercase font-bold text-sm">Library</button>
                     <button onClick={() => { onLaunchGuild(); setMobileMenuOpen(false); }} className="text-gray-400 uppercase font-bold text-sm">Guild</button>
                </div>
                
                <a onClick={() => setMobileMenuOpen(false)} href="#features" className="text-xl font-bold text-white uppercase tracking-widest">{t.nav.features}</a>
                <a onClick={() => setMobileMenuOpen(false)} href="#roadmap" className="text-xl font-bold text-white uppercase tracking-widest">{t.nav.roadmap}</a>
                
                <div className="w-48 border-t border-gray-800 my-4"></div>
                <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">Select Portal</div>
                
                <button onClick={() => { handlePortalSelect('LT'); setMobileMenuOpen(false); }} className="text-lg font-bold text-gray-300">🇱🇹 Otaku Gildija</button>
                <button onClick={() => { handlePortalSelect('EU'); setMobileMenuOpen(false); }} className="text-lg font-bold text-gray-300">🇪🇺 Library of Otaku</button>
                <button onClick={() => { onBlogClick(); setMobileMenuOpen(false); }} className="text-lg font-bold text-yellow-500">DevLog News</button>
                
                <div className="w-48 border-t border-gray-800 my-4"></div>

                <button onClick={() => { onLoginClick(); setMobileMenuOpen(false); }} className="text-xl font-bold text-pink-400 border border-pink-500 px-8 py-3 rounded-sm uppercase tracking-widest">{t.nav.portal}</button>
                <button onClick={() => { onBuyClick(); setMobileMenuOpen(false); }} className="text-xl font-bold bg-pink-600 text-white px-8 py-3 rounded-sm uppercase tracking-widest shadow-xl flex items-center">
                    <Download className="w-5 h-5 mr-2" />
                    GET $1.00 BETA
                </button>
            </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 lg:pt-48 lg:pb-32 overflow-hidden z-10 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-pink-500/30 bg-pink-500/10 text-pink-400 text-[10px] sm:text-xs font-bold mb-8 font-mono tracking-widest uppercase animate-in fade-in zoom-in duration-500 delay-100">
            <Sparkles className="w-3 h-3 mr-2" />
            {t.hero.presale} - STRICT $1.00 PRICE
          </div>
          
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter mb-8 leading-tight text-white drop-shadow-2xl animate-in slide-in-from-bottom-10 duration-700">
            {t.hero.title_prefix} <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-500">{t.hero.title_suffix}</span>
          </h1>
          
          <p className="mt-4 max-w-2xl mx-auto text-lg sm:text-xl text-gray-400 mb-10 font-medium px-4 leading-relaxed animate-in slide-in-from-bottom-10 duration-700 delay-200">
            {t.hero.subtitle}
          </p>
          
          <div className="flex flex-col items-center gap-6 mb-16 animate-in slide-in-from-bottom-10 duration-700 delay-300">
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4">
              <button 
                  onClick={onBuyClick}
                  className="px-10 py-5 bg-white text-black hover:bg-gray-100 rounded-sm font-black text-sm uppercase tracking-widest shadow-[0_0_40px_rgba(255,255,255,0.3)] transition transform hover:scale-105 flex items-center justify-center"
              >
                  <Download className="w-5 h-5 mr-3" />
                  Get Core for $1.00
              </button>
            </div>
            
            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest flex items-center gap-2">
                <Check className="w-3 h-3 text-green-500" />
                Lifetime Updates • Free Support • One Dollar
            </p>
          </div>

          {/* INTERACTIVE DEMO SLIDER */}
          <div className="relative mx-auto max-w-5xl px-4 perspective-1000 mb-12 animate-in zoom-in duration-1000 delay-500">
             <BeforeAfterDemo />
          </div>

        </div>
      </section>

      {/* LIVE TICKER */}
      <div className="bg-pink-600/10 border-y border-pink-500/20 overflow-hidden py-3">
          <div className="whitespace-nowrap flex animate-marquee">
             {[...Array(10)].map((_, i) => (
                 <span key={i} className="mx-8 text-xs font-mono font-bold text-pink-400 uppercase tracking-widest flex items-center cursor-pointer hover:text-white transition" onClick={onBlogClick}>
                    <Zap className="w-3 h-3 mr-2" /> Pre-Sale Active • Price Locked at $1.00 • Founder's Edition • Free Updates Forever
                 </span>
             ))}
          </div>
      </div>

       {/* ROADMAP SECTION (Prioritized Placement) */}
      <section id="roadmap" className="py-24 bg-[#0a0a0c] relative border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <FadeInSection>
                <div className="text-center mb-16">
                    <div className="inline-block px-3 py-1 mb-4 rounded border border-violet-500/30 bg-violet-500/10 text-violet-400 text-[10px] font-bold uppercase tracking-widest">
                        Incoming Transmission
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tight text-white mb-4">Future Expansion</h2>
                    <p className="text-gray-400">One dollar buys you everything. Even the future features.</p>
                </div>
            </FadeInSection>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {FUTURE_UPDATES.map((item, idx) => (
                    <FadeInSection key={idx} delay={`${idx * 150}ms`}>
                        <div className={`relative p-6 bg-gray-900 border rounded-lg hover:border-gray-600 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl ${item.status === 'Locked' ? 'opacity-50 border-gray-800' : 'border-gray-800'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-lg bg-gray-800 text-white`}>
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest bg-gray-900 px-2 py-1 rounded border border-gray-800">
                                    {item.quarter}
                                </span>
                            </div>
                            
                            <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                            <p className="text-xs text-gray-400 mb-6 min-h-[40px] leading-relaxed">{item.description}</p>
                            
                            <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full ${item.status === 'Locked' ? 'bg-gray-700' : 'bg-white'}`} 
                                    style={{ width: `${item.progress}%` }}
                                ></div>
                            </div>
                        </div>
                    </FadeInSection>
                ))}
            </div>

            <FadeInSection delay="500ms">
                <div className="text-center">
                     <button 
                        onClick={onBuyClick}
                        className="inline-flex items-center text-sm font-bold text-pink-500 uppercase tracking-widest hover:text-white transition"
                     >
                        Secure All Future Updates <ArrowDownCircle className="w-4 h-4 ml-2" />
                     </button>
                </div>
            </FadeInSection>
        </div>
      </section>

      {/* DEV BLOG TEASER (Development Highlights) */}
      <section className="py-24 bg-[#0f0e17] border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
            <FadeInSection>
                <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                    <div>
                         <div className="inline-block px-3 py-1 mb-4 rounded border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-[10px] font-bold uppercase tracking-widest">
                            DevLog Feed
                        </div>
                        <h2 className="text-3xl font-black uppercase tracking-tight text-white mb-2">Development Highlights</h2>
                        <p className="text-gray-400">Engineering milestones achieved for v2.4.0-BETA.</p>
                    </div>
                    <button onClick={onBlogClick} className="hidden md:flex items-center text-xs font-bold uppercase tracking-widest text-violet-400 hover:text-white transition mt-4 md:mt-0">
                        Read All <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                </div>
            </FadeInSection>

            <div className="grid md:grid-cols-2 gap-8">
                 {DEV_ACHIEVEMENTS.map((post, idx) => (
                     <FadeInSection key={idx} delay={`${idx * 100}ms`}>
                         <div onClick={onBlogClick} className={`cursor-pointer group relative bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-opacity-100 hover:${post.borderColor} transition-all duration-300 h-full flex flex-col`}>
                            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${post.bgGradient} opacity-50`}></div>
                            <div className="p-6 relative z-10 flex-grow">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-2 py-1 bg-gray-800 text-[10px] font-bold uppercase ${post.color} rounded-sm border border-gray-700`}>
                                        {post.category}
                                    </span>
                                    <post.icon className={`w-5 h-5 ${post.color} opacity-80`} />
                                </div>
                                <h3 className={`text-xl font-bold text-white mb-3 group-hover:${post.color} transition`}>{post.title}</h3>
                                <p className="text-gray-400 text-xs leading-relaxed max-w-md">{post.description}</p>
                            </div>
                            <div className="px-6 py-4 bg-gray-900/50 border-t border-gray-800 flex justify-between items-center group-hover:bg-gray-800 transition">
                                <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">View Report</span>
                                <ChevronRight className={`w-4 h-4 ${post.color} transform group-hover:translate-x-1 transition`} />
                            </div>
                         </div>
                     </FadeInSection>
                 ))}
            </div>
        </div>
      </section>

      {/* THE CHAOS (Problem) */}
      <section id="problem" className="py-24 bg-[#0a0a0c] border-b border-gray-800">
         <div className="max-w-7xl mx-auto px-4">
            <FadeInSection>
                <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1">
                        <div className="inline-block px-3 py-1 mb-4 rounded border border-red-500/30 bg-red-500/10 text-red-400 text-[10px] font-bold uppercase tracking-widest">
                            Warning: Data Corruption
                        </div>
                        <h2 className="text-4xl font-black text-white uppercase tracking-tight mb-6">Your Library is <br /><span className="text-red-500">Bleeding Out.</span></h2>
                        <p className="text-gray-400 text-lg leading-relaxed mb-6">
                            Scattered hard drives. Mismatched subtitles. "Unknown_Episode_05.mkv". You spend more time organizing than watching. 
                            Your watch history is trapped on one device.
                        </p>
                        <ul className="space-y-3">
                            <li className="flex items-center text-gray-300 font-mono text-sm"><AlertTriangle className="w-4 h-4 mr-3 text-red-500" /> No Backup</li>
                            <li className="flex items-center text-gray-300 font-mono text-sm"><AlertTriangle className="w-4 h-4 mr-3 text-red-500" /> Manual Renaming</li>
                            <li className="flex items-center text-gray-300 font-mono text-sm"><AlertTriangle className="w-4 h-4 mr-3 text-red-500" /> Duplicate Files</li>
                        </ul>
                    </div>
                    <div className="flex-1 relative">
                        <div className="bg-gray-900 border border-red-900/30 rounded-lg p-6 font-mono text-xs text-red-300 opacity-60">
                            &gt; Error: File not found<br/>
                            &gt; Warning: Metadata missing for 420 items<br/>
                            &gt; Critical: Sync failed<br/>
                            &gt; [folder_new_final_v2] contains 15GB of duplicates...
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] to-transparent"></div>
                    </div>
                </div>
            </FadeInSection>
         </div>
      </section>

      {/* THE ORDER (Solution) */}
      <section className="py-24 bg-[#0f0e17] border-b border-gray-800">
         <div className="max-w-7xl mx-auto px-4">
            <FadeInSection delay="200ms">
                <div className="flex flex-col md:flex-row-reverse items-center gap-12">
                    <div className="flex-1">
                        <div className="inline-block px-3 py-1 mb-4 rounded border border-green-500/30 bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-widest">
                            System Restored
                        </div>
                        <h2 className="text-4xl font-black text-white uppercase tracking-tight mb-6">Enter The <br /><span className="text-green-500">Guild Protocol.</span></h2>
                        <p className="text-gray-400 text-lg leading-relaxed mb-6">
                            One click. That's all it takes. The Autosorter Core scans, identifies, and renames your entire 10TB collection in seconds.
                            Sync progress to the cloud. Unlock badges.
                        </p>
                        <ul className="space-y-3">
                            <li className="flex items-center text-gray-300 font-mono text-sm"><FileCheck className="w-4 h-4 mr-3 text-green-500" /> Auto-Renaming</li>
                            <li className="flex items-center text-gray-300 font-mono text-sm"><FileCheck className="w-4 h-4 mr-3 text-green-500" /> 4K HDR Analysis</li>
                            <li className="flex items-center text-gray-300 font-mono text-sm"><FileCheck className="w-4 h-4 mr-3 text-green-500" /> Cloud Sync</li>
                        </ul>
                        <button onClick={onBuyClick} className="mt-8 px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-black uppercase tracking-widest rounded-sm shadow-lg flex items-center">
                            Download Solution <Download className="w-4 h-4 ml-2" />
                        </button>
                    </div>
                    <div className="flex-1 relative">
                        <div className="bg-gray-900 border border-green-500/30 rounded-lg p-6 font-mono text-xs text-green-400">
                            &gt; Scan Complete.<br/>
                            &gt; 14,205 Files Optimized.<br/>
                            &gt; 0 Duplicates Found.<br/>
                            &gt; Uploading to Cloud... [100%]<br/>
                            &gt; Welcome back, Guild Master.
                        </div>
                    </div>
                </div>
            </FadeInSection>
         </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-[#0a0a0c] border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <FadeInSection>
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-black uppercase tracking-tight text-white mb-4">Join the Guild</h2>
                </div>
              </FadeInSection>

              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  {/* Free Tier */}
                  <FadeInSection delay="100ms">
                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 flex flex-col hover:border-gray-700 transition duration-300 h-full">
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-white">Web Portal</h3>
                            <p className="text-gray-400 mt-2 text-sm">Free Forever</p>
                        </div>
                        <div className="flex-grow space-y-4 mb-8">
                            <div className="flex items-center text-sm text-gray-300"><Check className="w-4 h-4 mr-3 text-gray-600" /> Manual Tracking</div>
                            <div className="flex items-center text-sm text-gray-300"><Check className="w-4 h-4 mr-3 text-gray-600" /> Community Access</div>
                            <div className="flex items-center text-sm text-gray-300"><Check className="w-4 h-4 mr-3 text-gray-600" /> Basic Profile</div>
                        </div>
                        <button onClick={onLoginClick} className="w-full py-3 border border-gray-700 text-white font-bold uppercase tracking-wider rounded-sm hover:bg-gray-800 transition">
                            {t.nav.portal}
                        </button>
                    </div>
                  </FadeInSection>

                  {/* Paid Tier */}
                  <FadeInSection delay="200ms">
                    <div className="bg-gray-900 border border-violet-500 rounded-lg p-8 flex flex-col relative shadow-[0_0_40px_rgba(124,58,237,0.1)] transform scale-105 z-10 h-full">
                        <div className="absolute top-0 right-0 bg-violet-600 text-white px-4 py-1 rounded-bl-lg rounded-tr-lg text-[10px] font-bold uppercase tracking-widest">
                            Limited Offer
                        </div>
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-white">Founder's Pack</h3>
                            <p className="text-gray-400 mt-2 text-sm">
                                <span className="text-white font-bold text-2xl mr-2">$1.00</span>
                                <span className="line-through">€29.99</span>
                            </p>
                        </div>
                        <div className="flex-grow space-y-4 mb-8">
                            <div className="flex items-center text-sm text-white font-medium"><Check className="w-4 h-4 mr-3 text-violet-500" /> Autosorter Desktop App</div>
                            <div className="flex items-center text-sm text-white font-medium"><Check className="w-4 h-4 mr-3 text-violet-500" /> 4K/HDR Analysis</div>
                            <div className="flex items-center text-sm text-white font-medium"><Check className="w-4 h-4 mr-3 text-violet-500" /> Founder Badge</div>
                            <div className="flex items-center text-sm text-white font-medium"><Check className="w-4 h-4 mr-3 text-violet-500" /> Priority Cloud Sync</div>
                        </div>
                        <button onClick={onBuyClick} className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-sm hover:bg-gray-100 transition shadow-lg flex items-center justify-center animate-pulse">
                            <Download className="w-4 h-4 mr-2" /> Purchase License ($1)
                        </button>
                    </div>
                  </FadeInSection>
              </div>
          </div>
      </section>

      {/* CTA Footer & Contacts */}
      <footer className="py-20 border-t border-gray-800 bg-[#0f0e17] text-center">
          <FadeInSection>
            <div className="max-w-7xl mx-auto px-4">
                <div className="mb-12">
                    <Heart className="w-12 h-12 text-pink-600 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold text-white mb-6 uppercase tracking-tight">Thank You For Supporting The Beta</h2>
                    <p className="text-gray-400 max-w-xl mx-auto mb-8">
                        Your one dollar helps us keep the servers running. 
                        Updates are always free.
                    </p>
                    <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                        <button 
                            onClick={onBuyClick}
                            className="bg-white text-black px-10 py-3 font-bold rounded-sm hover:bg-gray-200 transition text-sm uppercase tracking-widest shadow-xl"
                        >
                            Get Core for $1.00
                        </button>
                        <button onClick={onLoginClick} className="text-gray-500 hover:text-white text-xs font-bold uppercase tracking-widest underline decoration-gray-700 underline-offset-4">
                            Web Portal Login
                        </button>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8 text-left border-t border-gray-800 pt-12 mt-12">
                    <div>
                        <h4 className="text-white font-bold uppercase mb-4">Contact</h4>
                        <ul className="space-y-2 text-sm text-gray-500 font-mono">
                            <li className="flex items-center"><Mail className="w-4 h-4 mr-2" /> support@otakunexus.lt</li>
                            <li className="flex items-center"><Globe className="w-4 h-4 mr-2" /> www.otakunexus.lt</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold uppercase mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm text-gray-500 font-mono">
                            <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-white">EULA</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold uppercase mb-4">System</h4>
                        <ul className="space-y-2 text-sm text-gray-500 font-mono">
                            <li onClick={onBlogClick} className="cursor-pointer hover:text-white transition">Patch Notes</li>
                            <li onClick={onBlogClick} className="cursor-pointer hover:text-white transition">Server Status</li>
                        </ul>
                        <p className="text-xs text-gray-600 font-mono uppercase mt-4">
                            © 2024 {t.nav.brand}. {t.nav.system}
                            <br/>Made with ❤️ by Otakus for Otakus.
                        </p>
                    </div>
                </div>
            </div>
          </FadeInSection>
      </footer>
      
      {/* Blog Preview Modal (if needed in future, currently handled by SPA Overlay) */}
      {isBlogPreviewOpen && (
          <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center">
              {/* This state would trigger the full Blog View in App.tsx if connected, 
                  but here we just use the onBlogClick prop for simplicity in this file */}
          </div>
      )}

    </div>
  );
};

export default ProductLanding;
