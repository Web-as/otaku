'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Zap, Sparkles, UserPlus, Star, Crosshair, Crown } from 'lucide-react';
import BattlePass from './BattlePass';

// Mock Data for fallback
const MOCK_ACCOUNT = {
  level: 142,
  totalXp: 854000,
  aestheticTier: 'Cosmic Overseer'
};

const MOCK_ROSTER = [
  { id: '1', name: 'Arx', class: 'Spellblade', level: 40, isActive: true, avatar: 'var(--anime-neon-violet)' },
  { id: '2', name: 'Zoro', class: 'Ronin', level: 12, isActive: false, avatar: 'var(--anime-semantic-success)' },
  { id: '3', name: 'Megumin', class: 'Archwizard', level: 25, isActive: false, avatar: 'var(--anime-magenta)' },
];

export default function RPGProfile() {
  const { user } = useAuth();
  
  const [account, setAccount] = useState<any>(MOCK_ACCOUNT);
  const [roster, setRoster] = useState<any[]>(MOCK_ROSTER);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfileData() {
      try {
        const token = localStorage.getItem('token') || 'DUMMY_TOKEN';
        const headers = { 'Authorization': `Bearer ${token}` };

        // Fetch Account Profile
        const accRes = await fetch('http://localhost:3333/api/game/account', { headers });
        if (accRes.ok) {
          const accData = await accRes.json();
          if (accData.profile) {
            setAccount({
              level: accData.profile.account_level,
              totalXp: accData.profile.total_xp,
              aestheticTier: accData.profile.aesthetic_tier
            });
          }
        }

        // Fetch Character Roster
        const rosterRes = await fetch('http://localhost:3333/api/game/roster', { headers });
        if (rosterRes.ok) {
          const rosterData = await rosterRes.json();
          if (rosterData.roster && rosterData.roster.length > 0) {
            setRoster(rosterData.roster.map((c: any) => ({
              id: c.id,
              name: c.character_name,
              class: c.official_sheet?.class || 'Novice',
              level: c.official_sheet?.level || 1,
              isActive: c.is_active,
              avatar: c.avatar_url || 'var(--anime-neon-violet)'
            })));
          }
        }
      } catch (e) {
        console.error('Failed to load profile data, using mocks:', e);
      } finally {
        setLoading(false);
      }
    }
    loadProfileData();
  }, []);

  const handleSetActive = async (id: string) => {
    // Optimistic UI update
    setRoster(prev => prev.map(char => ({
      ...char,
      isActive: char.id === id
    })));

    // Backend update
    try {
      const token = localStorage.getItem('token') || 'DUMMY_TOKEN';
      await fetch('http://localhost:3333/api/game/roster/active', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ characterId: id })
      });
    } catch (e) {
      console.error('Failed to set active character:', e);
    }
  };

  const activeChar = roster.find(c => c.isActive) || roster[0];

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto">
      
      {/* ZONE 1: The Player Meta-Card (Infinite Progression) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-[var(--anime-neon-violet)]/50 bg-black/60 backdrop-blur-md p-8 shadow-[0_0_30px_var(--anime-neon-violet)]"
      >
        {/* Infinite Cosmic Background FX */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 animate-pulse pointer-events-none" />
        <div className="absolute top-[-50%] left-[-10%] w-96 h-96 bg-[var(--anime-magenta)] opacity-20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-50%] right-[-10%] w-96 h-96 bg-[var(--anime-cyan)] opacity-20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="relative w-32 h-32 rounded-full border-4 border-[var(--anime-cyan)] shadow-[0_0_20px_var(--anime-cyan)] flex items-center justify-center bg-black overflow-hidden group">
             {/* Avatar Placeholder */}
             <div className="text-4xl">👑</div>
             <div className="absolute inset-0 bg-[var(--anime-cyan)]/20 group-hover:bg-[var(--anime-cyan)]/40 transition-all cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100">
               <span className="text-xs font-bold text-white tracking-widest uppercase">Change</span>
             </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.3)] flex items-center justify-center md:justify-start gap-3">
              {user?.displayName || 'Player Account'}
              <Crown className="text-[var(--anime-gold)]" size={32} />
            </h1>
            
            <div className="mt-2 flex flex-wrap items-center justify-center md:justify-start gap-4">
              <span className="px-4 py-1 rounded-full bg-black/50 border border-[var(--anime-cyan)]/50 text-[var(--anime-cyan)] font-bold tracking-widest text-sm flex items-center gap-2">
                <Sparkles size={14} /> {account.aestheticTier}
              </span>
              <span className="text-gray-400 font-bold flex items-center gap-1 text-sm">
                <Zap size={14} className="text-yellow-400" /> Total XP: {account.totalXp.toLocaleString()}
              </span>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex-shrink-0 text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[var(--anime-neon-violet)] to-[var(--anime-magenta)] drop-shadow-md">
                Lv. {account.level}
              </div>
              <div className="flex-1 h-3 bg-black/80 rounded-full border border-white/10 overflow-hidden relative">
                {/* Infinite glow bar */}
                <div className="absolute inset-y-0 left-0 w-[75%] bg-gradient-to-r from-[var(--anime-neon-violet)] via-[var(--anime-cyan)] to-[var(--anime-magenta)] rounded-full shadow-[0_0_15px_var(--anime-magenta)] animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ZONE 2: Character Roster (MMORPG Style Grid) */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black uppercase tracking-wider text-white flex items-center gap-2">
            <Shield className="text-[var(--anime-gold)]" /> Playable Roster
          </h2>
          <button className="theme-button-primary text-sm flex items-center gap-2 px-4 py-2">
            <UserPlus size={16} /> Roll New Character
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {roster.map((char) => (
              <motion.div 
                key={char.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`relative rounded-xl border p-5 cursor-pointer transition-all duration-300 overflow-hidden group ${
                  char.isActive 
                  ? 'border-[var(--anime-gold)] bg-[var(--anime-gold)]/10 shadow-[0_0_20px_var(--anime-gold)]' 
                  : 'border-gray-800 bg-black/40 hover:border-gray-500 hover:bg-black/60'
                }`}
                onClick={() => handleSetActive(char.id)}
              >
                {/* Active Indicator */}
                {char.isActive && (
                  <div className="absolute top-0 right-0 bg-[var(--anime-gold)] text-black text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-lg">
                    Active Link
                  </div>
                )}
                
                <div className="flex items-center gap-4 mb-4">
                  <div 
                    className="w-16 h-16 rounded-lg border-2 border-white/20 shadow-inner flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `color-mix(in srgb, ${char.avatar} 30%, black)` }}
                  >
                    🎭
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white group-hover:text-[var(--anime-cyan)] transition-colors">{char.name}</h3>
                    <div className="text-sm font-bold text-gray-400">{char.class}</div>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-black/50 p-2 rounded border border-white/5">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Level</span>
                  <span className={`text-lg font-black ${char.level === 40 ? 'text-[var(--anime-gold)]' : 'text-white'}`}>{char.level}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* ZONE 3: Active Character's Battle Pass Timeline */}
      <div className="mt-8">
        <div className="mb-4">
          <h2 className="text-2xl font-black uppercase tracking-wider text-white flex items-center gap-2">
            <Crosshair className="text-[var(--anime-cyan)]" /> {activeChar.name}'s Lifecycle
          </h2>
          <p className="text-gray-400 text-sm">Viewing Battle Pass progress for the active character.</p>
        </div>
        
        {/* We mount the BattlePass component here, passing down the active character's context if this was fully wired to the backend */}
        <BattlePass />
      </div>

    </div>
  );
}
