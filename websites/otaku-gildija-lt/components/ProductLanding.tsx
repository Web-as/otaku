
import React, { useState } from 'react';
import { Download, Monitor, Share2, Sparkles, Zap, Database, ChevronRight, LayoutGrid, ArrowRight, PlayCircle, Ghost, CheckCircle2, AlertCircle, Shield, Menu, X, Check, HelpCircle, Server, Code, Lock, Users, Smartphone, BrainCircuit, Glasses, Clock } from 'lucide-react';

interface ProductLandingProps {
  onLoginClick: () => void;
  onBlogClick: () => void;
  onBuyClick: () => void;
}

const FUTURE_UPDATES = [
    {
        quarter: "Q2 2025",
        title: "Guild Wars",
        description: "Form clans, compete in watch-time leaderboards, and capture genres.",
        icon: Users,
        status: "In Development",
        progress: 65,
        color: "text-green-400",
        borderColor: "border-green-500/50"
    },
    {
        quarter: "Q3 2025",
        title: "Mobile Companion",
        description: "Native iOS/Android apps with remote control for your desktop player.",
        icon: Smartphone,
        status: "Planning",
        progress: 30,
        color: "text-blue-400",
        borderColor: "border-blue-500/50"
    },
    {
        quarter: "Q4 2025",
        title: "Neural Recommender",
        description: "AI that analyzes your watch history to find hidden gems.",
        icon: BrainCircuit,
        status: "Concept",
        progress: 10,
        color: "text-pink-400",
        borderColor: "border-pink-500/50"
    },
    {
        quarter: "2026",
        title: "VR Archive",
        description: "Walk through your library in a virtual 3D space.",
        icon: Glasses,
        status: "Locked",
        progress: 0,
        color: "text-gray-500",
        borderColor: "border-gray-700"
    }
];

const ProductLanding: React.FC<ProductLandingProps> = ({ onLoginClick, onBlogClick, onBuyClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => setActiveFaq(activeFaq === index ? null : index);

  return (
    <div className="min-h-screen bg-[#0f0e17] text-white font-sans selection:bg-pink-500 selection:text-white overflow-x-hidden relative">
      
      {/* Soft Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-violet-900/5 rounded-full blur-[150px]"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-pink-900/5 rounded-full blur-[150px]"></div>
          <div className="absolute inset-0 bg-[size:40px_40px] bg-anime-grid opacity-10"></div>
      </div>

      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-[#0f0e17]/80 backdrop-blur-md border-b border-white/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3 group cursor-pointer relative" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
              <div className="relative">
                <Shield className="w-8 h-8 text-pink-500 relative z-10" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-pink-400 transition">
                LIBRARY OF OTAKU
              </span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8 text-sm font-bold tracking-wide uppercase">
              <a href="#features" className="text-gray-400 hover:text-white transition">Features</a>
              <a href="#roadmap" className="text-gray-400 hover:text-white transition">Roadmap</a>
              <button onClick={onBlogClick} className="text-gray-400 hover:text-white transition">DevLog</button>
              <button 
                onClick={onLoginClick}
                className="text-white hover:text-pink-400 transition"
              >
                Portal Login
              </button>
              <button 
                onClick={onBuyClick}
                className="bg-white text-black hover:bg-gray-200 px-6 py-2.5 rounded-sm shadow-lg shadow-white/10 transition transform hover:-translate-y-0.5"
              >
                Join Beta
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
            <div className="fixed inset-0 bg-[#0f0e17] z-40 flex flex-col justify-center items-center space-y-8 animate-in fade-in duration-200">
                <a onClick={() => setMobileMenuOpen(false)} href="#features" className="text-xl font-bold text-white uppercase tracking-widest">Features</a>
                <a onClick={() => setMobileMenuOpen(false)} href="#roadmap" className="text-xl font-bold text-white uppercase tracking-widest">Roadmap</a>
                <button onClick={() => { onBlogClick(); setMobileMenuOpen(false); }} className="text-xl font-bold text-white uppercase tracking-widest">DevLog</button>
                <button onClick={() => { onLoginClick(); setMobileMenuOpen(false); }} className="text-xl font-bold text-pink-400 border border-pink-500 px-8 py-3 rounded-sm uppercase tracking-widest">Portal Login</button>
                <button onClick={() => { onBuyClick(); setMobileMenuOpen(false); }} className="text-xl font-bold bg-white text-black px-8 py-3 rounded-sm uppercase tracking-widest">Buy Access</button>
            </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 lg:pt-48 lg:pb-32 overflow-hidden z-10 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-pink-500/30 bg-pink-500/10 text-pink-400 text-[10px] sm:text-xs font-bold mb-8 font-mono tracking-widest uppercase animate-in fade-in zoom-in duration-500">
            <Sparkles className="w-3 h-3 mr-2" />
            Limited Time Pre-Sale
          </div>
          
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter mb-8 leading-tight text-white drop-shadow-2xl">
            Your Anime. <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-500">Organized.</span>
          </h1>
          
          <p className="mt-4 max-w-2xl mx-auto text-lg sm:text-xl text-gray-400 mb-10 font-medium px-4 leading-relaxed">
            The all-in-one desktop manager for serious collectors. Auto-renaming, 4K analysis, and cloud sync in one beautiful package.
          </p>
          
          <div className="flex flex-col items-center gap-6 mb-20">
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4">
              <button 
                  onClick={onBuyClick}
                  className="px-8 py-4 bg-white text-black hover:bg-gray-100 rounded-sm font-black text-sm uppercase tracking-widest shadow-[0_0_30px_rgba(255,255,255,0.2)] transition transform hover:scale-105"
              >
                  Get Founder's Pack
              </button>
              <button 
                onClick={onLoginClick}
                className="px-8 py-4 bg-transparent hover:bg-white/5 text-white rounded-sm font-bold text-sm uppercase tracking-widest border border-gray-700 hover:border-white transition flex items-center justify-center"
              >
                Open Web Portal <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            </div>
            
            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">
                v2.4.0-BETA • Windows 10/11 • Lifetime License
            </p>
          </div>

          {/* Clean Mockup */}
          <div className="relative mx-auto max-w-5xl px-4 perspective-1000">
            <div className="relative rounded-lg border border-gray-800 bg-gray-900 shadow-2xl overflow-hidden ring-1 ring-white/10">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-[#15151a]">
                <div className="flex items-center gap-4">
                     <div className="flex gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                    </div>
                </div>
              </div>

              <div className="aspect-video bg-gray-950 flex items-center justify-center relative overflow-hidden group">
                 <div className="absolute inset-0 opacity-60 transition duration-700 group-hover:opacity-80">
                    <video 
                        className="w-full h-full object-cover" 
                        autoPlay 
                        loop 
                        muted 
                        playsInline
                        src="https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-monitor-close-up-1728-large.mp4"
                    ></video>
                    <div className="absolute inset-0 bg-violet-900/20 mix-blend-overlay"></div>
                 </div>
                 
                 <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[size:100%_4px] pointer-events-none z-20"></div>
                 
                 <div className="absolute bottom-6 left-6 z-30 flex items-center gap-2 px-3 py-1.5 bg-black/80 backdrop-blur rounded text-[10px] font-mono text-green-400 border border-green-500/30">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    SYSTEM ACTIVE
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Specs / Architecture Section */}
      <section id="architecture" className="py-24 border-t border-gray-800 bg-[#111]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid md:grid-cols-3 gap-8">
                  <div className="p-8 border border-gray-800 bg-gray-900/50 rounded-lg hover:border-gray-700 transition">
                      <div className="w-12 h-12 bg-gray-800 rounded flex items-center justify-center mb-6">
                          <Server className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2 uppercase">FastAPI Core</h3>
                      <p className="text-sm text-gray-400 leading-relaxed">
                          Built on modern Python infrastructure for lightning-fast sync and metadata retrieval.
                      </p>
                  </div>
                  <div className="p-8 border border-gray-800 bg-gray-900/50 rounded-lg hover:border-gray-700 transition">
                      <div className="w-12 h-12 bg-gray-800 rounded flex items-center justify-center mb-6">
                          <Database className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2 uppercase">Local First</h3>
                      <p className="text-sm text-gray-400 leading-relaxed">
                          Your data lives on your drive. We only sync what you choose. Privacy by design.
                      </p>
                  </div>
                  <div className="p-8 border border-gray-800 bg-gray-900/50 rounded-lg hover:border-gray-700 transition">
                      <div className="w-12 h-12 bg-gray-800 rounded flex items-center justify-center mb-6">
                          <Zap className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2 uppercase">Gamified</h3>
                      <p className="text-sm text-gray-400 leading-relaxed">
                          Earn XP for organizing files. Unlock badges and track your otaku journey.
                      </p>
                  </div>
              </div>
          </div>
      </section>

      {/* ROADMAP SECTION (Future Teasers) */}
      <section id="roadmap" className="py-24 bg-[#0f0e17] border-t border-gray-800 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-black uppercase tracking-tight text-white mb-4">Future Expansion</h2>
                <p className="text-gray-400">One license. Endless updates.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {FUTURE_UPDATES.map((item, idx) => (
                    <div key={idx} className={`relative p-6 bg-gray-900 border rounded-lg hover:border-gray-600 transition-all duration-300 ${item.status === 'Locked' ? 'opacity-50 border-gray-800' : 'border-gray-800'}`}>
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
                ))}
            </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-[#0a0a0c] border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                  <h2 className="text-3xl font-black uppercase tracking-tight text-white mb-4">Join the Guild</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  {/* Free Tier */}
                  <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 flex flex-col hover:border-gray-700 transition duration-300">
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
                          Access Portal
                      </button>
                  </div>

                  {/* Paid Tier */}
                  <div className="bg-gray-900 border border-violet-500 rounded-lg p-8 flex flex-col relative shadow-[0_0_40px_rgba(124,58,237,0.1)]">
                      <div className="absolute top-0 right-0 bg-violet-600 text-white px-4 py-1 rounded-bl-lg rounded-tr-lg text-[10px] font-bold uppercase tracking-widest">
                          Beta Offer
                      </div>
                      <div className="mb-6">
                          <h3 className="text-2xl font-bold text-white">Founder's Pack</h3>
                          <p className="text-gray-400 mt-2 text-sm">
                             <span className="text-white font-bold text-lg mr-2">€14.99</span>
                             <span className="line-through">€29.99</span>
                          </p>
                      </div>
                      <div className="flex-grow space-y-4 mb-8">
                          <div className="flex items-center text-sm text-white font-medium"><Check className="w-4 h-4 mr-3 text-violet-500" /> Autosorter Desktop App</div>
                          <div className="flex items-center text-sm text-white font-medium"><Check className="w-4 h-4 mr-3 text-violet-500" /> 4K/HDR Analysis</div>
                          <div className="flex items-center text-sm text-white font-medium"><Check className="w-4 h-4 mr-3 text-violet-500" /> Founder Badge</div>
                          <div className="flex items-center text-sm text-white font-medium"><Check className="w-4 h-4 mr-3 text-violet-500" /> Priority Cloud Sync</div>
                      </div>
                      <button onClick={onBuyClick} className="w-full py-3 bg-white text-black font-bold uppercase tracking-wider rounded-sm hover:bg-gray-100 transition shadow-lg">
                          Purchase License
                      </button>
                  </div>
              </div>
          </div>
      </section>

      {/* CTA Footer */}
      <footer className="py-20 border-t border-gray-800 bg-[#0f0e17] text-center">
          <h2 className="text-2xl font-bold text-white mb-6 uppercase tracking-tight">Ready to level up?</h2>
          <button 
            onClick={onBuyClick}
            className="bg-white text-black px-10 py-3 font-bold rounded-sm hover:bg-gray-200 transition text-sm uppercase tracking-widest"
          >
              Get Started
          </button>
          <p className="text-xs text-gray-600 mt-12 font-mono uppercase">© 2024 Library of Otaku. System v2.4.0-BETA</p>
      </footer>

    </div>
  );
};

export default ProductLanding;
