import React, { useState } from 'react';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { Lock, Unlock, Crown } from 'lucide-react';
import NPCOnboardingChat from '../npc/NPCOnboardingChat';

interface SystemUILayoutProps {
  children: React.ReactNode;
  isVIP?: boolean;
}

export function SystemUILayout({ children, isVIP = false }: SystemUILayoutProps) {
  const [activeNPC, setActiveNPC] = useState<'librarian' | 'dm_friend' | null>(null);

  const handleRestrictedClick = (e: React.MouseEvent, npcType: 'librarian' | 'dm_friend') => {
    if (!isVIP) {
      e.preventDefault();
      setActiveNPC(npcType);
    }
  };

  return (
    <div className={`min-h-screen text-gray-50 flex flex-col font-sans relative overflow-hidden ${isVIP ? 'vip-theme bg-[#0a0a05]' : 'bg-[#050505]'}`}>
      
      {/* Ambient VIP Particles */}
      {isVIP && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-500 rounded-full animate-particle-rise delay-100 shadow-[0_0_10px_#eab308]" />
          <div className="absolute top-3/4 left-2/4 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-particle-rise delay-300 shadow-[0_0_8px_#facc15]" />
          <div className="absolute top-1/2 left-3/4 w-2.5 h-2.5 bg-yellow-600 rounded-full animate-particle-rise delay-700 shadow-[0_0_12px_#ca8a04]" />
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 glass-panel border-b border-dark-border px-6 py-4 flex justify-between items-center relative">
        <div className="flex items-center space-x-4">
          <div className={`font-display font-bold text-2xl tracking-wider ${isVIP ? 'vip-text-glow text-[#d8b56a]' : 'text-[#00f0ff]'}`}>
            OTAKU <span className={isVIP ? 'text-[#f5d799]' : 'text-[#ff00ff]'}>NEXUS</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6 ml-10">
            <a href="/app/dashboard" className="text-gray-300 hover:text-white transition-colors">Dashboard</a>
            <a href="/app/library" className="text-gray-300 hover:text-white transition-colors">Library</a>
            
            {/* VIP Restricted Portal */}
            <a 
              href="/vn/dm-tavern" 
              onClick={(e) => handleRestrictedClick(e, 'dm_friend')}
              className={`flex items-center gap-1 font-bold transition-all ${isVIP ? 'text-[#d8b56a] hover:text-[#f5d799] drop-shadow-[0_0_5px_rgba(216,181,106,0.5)]' : 'text-gray-600 hover:text-gray-400 group cursor-pointer'}`}
            >
              {isVIP ? <Crown className="w-4 h-4 animate-glow-pulse" /> : <Lock className="w-4 h-4 group-hover:hidden" />}
              {!isVIP && <Unlock className="w-4 h-4 hidden group-hover:block text-violet-400" />}
              Taverna (VIP Only)
            </a>
          </nav>
        </div>
        
        {/* User Profile Area */}
        <div className="flex items-center space-x-4">
          <LanguageSwitcher />
          <div className="text-right hidden sm:block">
            <div className={`text-sm font-bold ${isVIP ? 'text-[#d8b56a]' : 'text-[#00f0ff]'}`}>
              {isVIP ? 'Lv. 99 VIP Member' : 'Lv. 12 Adventurer'}
            </div>
            <div className="text-xs text-gray-400">1,450 EXP to next</div>
          </div>
          <div className={`w-10 h-10 rounded-sm overflow-hidden ${isVIP ? 'neon-border-cyan border-[#d8b56a]' : 'inked-outline border-[#00f0ff]'}`}>
            <img src="/avatars/default.jpg" alt="Avatar" className="w-full h-full object-cover" 
                 onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=User&background=0a0a0c&color=00f0ff' }} />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {children}
      </main>

      {/* NPC Onboarding Modal */}
      {activeNPC && (
        <NPCOnboardingChat 
          npcType={activeNPC} 
          onClose={() => setActiveNPC(null)} 
        />
      )}

      {/* Footer */}
      <footer className="border-t border-dark-border py-6 text-center text-gray-500 text-sm mt-auto glass-panel">
        <p>Aetherpunk RPG System UI. Transition to Agent Zones for immersive features.</p>
      </footer>
    </div>
  );
}
