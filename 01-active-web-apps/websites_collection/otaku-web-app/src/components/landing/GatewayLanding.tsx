import React, { useState, useEffect } from 'react';
import { Globe, ArrowRight, Shield, Users, Zap, Monitor, Star } from 'lucide-react';
import ChibiCompanion from '../ChibiCompanion';
import { useLanguage } from '../../services/i18n';

interface GatewayLandingProps {
  onEnter: (region: 'LT' | 'EU') => void;
}

const GatewayLanding: React.FC<GatewayLandingProps> = ({ onEnter }) => {
  const [hoveredRegion, setHoveredRegion] = useState<'LT' | 'EU' | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { t } = useLanguage();
  
  // Parallax Effect Logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0f0e17] text-white overflow-x-hidden font-sans selection:bg-pink-500 selection:text-white">
      
      {/* --- SEO META (Simulated) --- */}
      <div className="hidden">
        <h1>{t.nav.brand}</h1>
        <p>{t.gateway.subtitle}</p>
      </div>

      {/* --- PARALLAX BACKGROUND LAYERS --- */}
      <div 
        className="absolute inset-0 bg-[size:50px_50px] bg-anime-grid opacity-20 pointer-events-none"
        style={{ transform: `translate(${mousePosition.x * 10}px, ${mousePosition.y * 10}px)` }}
      ></div>

      <div 
        className="absolute top-1/4 left-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-violet-600/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none"
        style={{ transform: `translate(${mousePosition.x * -20}px, ${mousePosition.y * -20}px)` }}
      ></div>
      <div 
        className="absolute bottom-1/4 right-1/4 w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-pink-600/10 rounded-full blur-[80px] md:blur-[100px] pointer-events-none"
        style={{ transform: `translate(${mousePosition.x * -15}px, ${mousePosition.y * -15}px)` }}
      ></div>

      {/* --- MAIN CONTENT --- */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen py-12 px-4">
        
        {/* Brand Header */}
        <div 
            className="mb-8 md:mb-12 text-center transform transition-transform duration-100 max-w-2xl"
            style={{ transform: `translate(${mousePosition.x * -10}px, ${mousePosition.y * -10}px)` }}
        >
            <div className="inline-flex items-center justify-center p-2 md:p-3 mb-4 md:mb-6 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_0_30px_rgba(124,58,237,0.2)]">
                <Shield className="w-6 h-6 md:w-8 md:h-8 text-pink-500 mr-2 md:mr-3" />
                <span className="text-lg md:text-2xl font-black tracking-tighter italic">OTAKU <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-500">NEXUS</span></span>
            </div>
            <h1 className="text-4xl md:text-7xl font-black tracking-tight mb-4 leading-none">
                {t.gateway.title}
            </h1>
            <p className="text-gray-400 max-w-xs md:max-w-lg mx-auto font-mono text-xs md:text-sm tracking-widest uppercase">
                {t.gateway.subtitle}
            </p>
        </div>

        {/* Region Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 w-full max-w-4xl perspective-1000">
            
            {/* LT Domain Card */}
            <div 
                onMouseEnter={() => setHoveredRegion('LT')}
                onMouseLeave={() => setHoveredRegion(null)}
                onClick={() => onEnter('LT')}
                className="group relative bg-gray-900/40 backdrop-blur-md border border-gray-700 rounded-xl p-6 md:p-8 cursor-pointer overflow-hidden hover:border-violet-500 transition-all duration-500 hover:shadow-[0_0_50px_rgba(124,58,237,0.3)] hover:-translate-y-1 md:hover:-translate-y-2 active:scale-95"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4 md:mb-6">
                        <div className="bg-violet-900/30 p-2 md:p-3 rounded-lg border border-violet-500/30">
                            <span className="text-xl md:text-2xl font-black text-violet-300">LT</span>
                        </div>
                    </div>
                    
                    <h2 className="text-2xl md:text-3xl font-black mb-2 group-hover:text-violet-400 transition-colors">{t.gateway.region_lt_title}</h2>
                    <p className="text-gray-400 text-xs md:text-sm mb-6 md:mb-8 font-mono">
                        {t.gateway.region_lt_desc}
                    </p>

                    <div className="mt-auto">
                        <div className="flex items-center space-x-2 md:space-x-4 mb-4 md:mb-6 text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-wider">
                            <span className="flex items-center"><Users className="w-3 h-3 md:w-4 md:h-4 mr-1.5 text-violet-500" /> 2.4k Narių</span>
                            <span className="flex items-center"><Zap className="w-3 h-3 md:w-4 md:h-4 mr-1.5 text-yellow-500" /> XP Sistema</span>
                        </div>
                        <button className="w-full py-3 md:py-4 bg-white/5 hover:bg-violet-600 border border-white/10 hover:border-violet-500 rounded-lg font-bold text-xs md:text-sm uppercase tracking-widest transition-all flex items-center justify-center group-hover:shadow-lg">
                            {t.gateway.join} <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>

            {/* EU Domain Card */}
            <div 
                onMouseEnter={() => setHoveredRegion('EU')}
                onMouseLeave={() => setHoveredRegion(null)}
                onClick={() => onEnter('EU')}
                className="group relative bg-gray-900/40 backdrop-blur-md border border-gray-700 rounded-xl p-6 md:p-8 cursor-pointer overflow-hidden hover:border-pink-500 transition-all duration-500 hover:shadow-[0_0_50px_rgba(236,72,153,0.3)] hover:-translate-y-1 md:hover:-translate-y-2 active:scale-95"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-pink-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10 flex flex-col h-full">
                     <div className="flex justify-between items-start mb-4 md:mb-6">
                        <div className="bg-pink-900/30 p-2 md:p-3 rounded-lg border border-pink-500/30">
                            <span className="text-xl md:text-2xl font-black text-pink-300">EU</span>
                        </div>
                        <div className="flex items-center text-gray-500 text-[9px] md:text-xs font-mono uppercase">
                             <Globe className="w-3 h-3 md:w-4 md:h-4 mr-1" /> International
                        </div>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-black mb-2 group-hover:text-pink-400 transition-colors">{t.gateway.region_eu_title}</h2>
                    <p className="text-gray-400 text-xs md:text-sm mb-6 md:mb-8 font-mono">
                         {t.gateway.region_eu_desc}
                    </p>

                    <div className="mt-auto">
                         <div className="flex items-center space-x-2 md:space-x-4 mb-4 md:mb-6 text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-wider">
                            <span className="flex items-center"><Monitor className="w-3 h-3 md:w-4 md:h-4 mr-1.5 text-pink-500" /> Desktop App</span>
                            <span className="flex items-center"><Star className="w-3 h-3 md:w-4 md:h-4 mr-1.5 text-yellow-500" /> Global Rank</span>
                        </div>
                        <button className="w-full py-3 md:py-4 bg-white/5 hover:bg-pink-600 border border-white/10 hover:border-pink-500 rounded-lg font-bold text-xs md:text-sm uppercase tracking-widest transition-all flex items-center justify-center group-hover:shadow-lg">
                            {t.gateway.enter} <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>

        </div>

        {/* --- INTERACTIVE CHIBI MASCOT (Feature Enhancement) --- */}
        <div className="absolute bottom-10 right-10 hidden lg:block z-50">
             <div className="relative group">
                <div className="absolute -top-12 -left-20 bg-white text-black text-xs font-bold px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg transform scale-90 group-hover:scale-100">
                    {hoveredRegion === 'LT' ? 'Sveiki atvykę į Gildiją!' : hoveredRegion === 'EU' ? 'Ready to organize?' : 'Choose your path!'}
                    <div className="absolute bottom-[-6px] right-4 w-3 h-3 bg-white rotate-45"></div>
                </div>
                {/* Reusing existing Chibi component via props mocking */}
                <div className="animate-bounce duration-[3000ms]">
                    <ChibiCompanion item={{id:'mascot', name:'Nexus', type:'Chibi', rarity:'Legendary', icon:'Bot', description:''}} />
                </div>
             </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-6 text-center w-full text-[9px] md:text-[10px] text-gray-600 font-mono uppercase tracking-widest pointer-events-none">
            <p>Otaku Nexus Network • {t.nav.system}</p>
        </div>
      </div>
    </div>
  );
};

export default GatewayLanding;