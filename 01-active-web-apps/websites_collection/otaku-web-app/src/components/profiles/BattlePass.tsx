'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Unlock, Star, Gem, Crown, Gift } from 'lucide-react';
import Card from '@/components/ui/Card';

type RewardTier = 'free' | 'gold' | 'vip';

interface RewardNode {
  level: number;
  free: string;
  gold: string;
  vip: string;
  rarity: 'Common' | 'Rare' | 'Very Rare' | 'Legendary';
}

const BATTLE_PASS_DATA: RewardNode[] = [
  { level: 1, free: '50 Gold', gold: 'Wooden Sword + Gacha', vip: 'Mythic Reincarnation Ticket', rarity: 'Common' },
  { level: 3, free: '100 Gold', gold: 'Goblin Core', vip: "Summoner's Catalyst", rarity: 'Common' },
  { level: 5, free: 'Basic Avatar', gold: 'Animated Bronze Plate', vip: 'Exclusive Guild Border', rarity: 'Rare' },
  { level: 10, free: '1x EXP Boost', gold: 'Class-Change Scroll', vip: 'Permanent +10% EXP Aura', rarity: 'Rare' },
  { level: 15, free: 'Dungeon Map', gold: 'Silver Armor Cosmetic', vip: 'Fairy Companion (Pet)', rarity: 'Rare' },
  { level: 20, free: '500 Gold', gold: 'Title: Adept', vip: 'Title: Exalted Adept', rarity: 'Very Rare' },
  { level: 25, free: "Hero's Badge", gold: 'Glowing Weapon Aura', vip: "Demon Lord's Haki Effect", rarity: 'Very Rare' },
  { level: 30, free: 'Gacha Ticket', gold: '5x Gacha Tickets', vip: 'Domain Expansion Background', rarity: 'Very Rare' },
  { level: 35, free: '1000 Gold', gold: 'Angelic Wings Cosmetic', vip: 'God-Tier Relic', rarity: 'Legendary' },
  { level: 40, free: 'Title: Grandmaster', gold: 'Golden Crown Badge', vip: 'Legendary Animated Frame', rarity: 'Legendary' },
];

export default function BattlePass() {
  const [currentLevel, setCurrentLevel] = useState(15);
  const [isCardHolder, setIsCardHolder] = useState(false);
  const [isVip, setIsVip] = useState(false);

  const renderRewardBox = (tier: RewardTier, reward: string, level: number, isActive: boolean) => {
    const isUnlocked = currentLevel >= level;
    let baseStyles = 'p-3 rounded-lg border flex flex-col items-center justify-center text-center text-xs font-bold transition-all h-24 ';
    
    if (!isUnlocked) {
      baseStyles += 'bg-black/40 border-gray-800 text-gray-600 opacity-50';
      return (
        <div className={baseStyles}>
          <Lock size={16} className="mb-2" />
          Locked (Lv.{level})
        </div>
      );
    }

    if (!isActive && tier !== 'free') {
      baseStyles += 'bg-black/60 border-gray-800 text-gray-500 relative overflow-hidden';
      return (
        <div className={baseStyles}>
          <Lock size={16} className="mb-1 opacity-50" />
          <span className="opacity-50 line-through">{reward}</span>
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[1px]">
            <span className="text-[10px] text-red-400 uppercase tracking-widest bg-black px-2 rounded border border-red-900">Requires Subs</span>
          </div>
        </div>
      );
    }

    if (tier === 'free') baseStyles += 'bg-[var(--anime-semantic-success)]/20 border-[var(--anime-semantic-success)] text-green-300 shadow-[0_0_10px_var(--anime-semantic-success)]';
    if (tier === 'gold') baseStyles += 'bg-[var(--anime-gold)]/20 border-[var(--anime-gold)] text-yellow-300 shadow-[0_0_15px_var(--anime-gold)]';
    if (tier === 'vip') baseStyles += 'bg-[var(--anime-neon-violet)]/20 border-[var(--anime-magenta)] text-fuchsia-300 shadow-[0_0_20px_var(--anime-neon-violet)] animate-pulse';

    return (
      <div className={baseStyles}>
        <Gift size={16} className="mb-1" />
        {reward}
        <span className="mt-2 text-[10px] bg-black/50 px-2 py-0.5 rounded text-white border border-white/20">Claimed</span>
      </div>
    );
  };

  return (
    <Card>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-wider text-white">Season 1: Descent into the Abyss</h2>
            <p className="text-gray-400 text-sm mt-1">D&D Loot Scaling Enabled. Gain EXP to unlock tiers.</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsCardHolder(!isCardHolder)}
              className={`px-4 py-2 rounded font-bold text-sm border transition-all ${isCardHolder ? 'bg-[var(--anime-gold)] text-black border-[var(--anime-gold)] shadow-[0_0_15px_var(--anime-gold)]' : 'border-gray-700 text-gray-500'}`}
            >
              <Star size={16} className="inline mr-1" /> Card Holder
            </button>
            <button 
              onClick={() => setIsVip(!isVip)}
              className={`px-4 py-2 rounded font-bold text-sm border transition-all ${isVip ? 'bg-[var(--anime-neon-violet)] text-white border-[var(--anime-magenta)] shadow-[0_0_20px_var(--anime-neon-violet)]' : 'border-gray-700 text-gray-500'}`}
            >
              <Crown size={16} className="inline mr-1" /> VIP Exalted
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-black/50 p-4 rounded-xl border border-white/10">
          <span className="font-bold text-gray-400">Current Level: {currentLevel}</span>
          <input 
            type="range" min="1" max="40" 
            value={currentLevel} 
            onChange={(e) => setCurrentLevel(parseInt(e.target.value))}
            className="flex-1 accent-[var(--anime-cyan)]"
          />
        </div>

        <div className="overflow-x-auto pb-4 custom-scrollbar">
          <div 
            className="gap-4 items-end"
            style={{ 
              display: 'grid', 
              gridTemplateColumns: `140px repeat(${BATTLE_PASS_DATA.length}, 160px)`,
              minWidth: 'max-content'
            }}
          >
            {/* Headers Row */}
            <div className="font-bold text-gray-500 text-right pr-4 mb-8">VIP Track</div>
            {BATTLE_PASS_DATA.map(node => (
              <div key={`vip-${node.level}`} className="mb-2">
                {renderRewardBox('vip', node.vip, node.level, isVip)}
              </div>
            ))}

            <div className="font-bold text-gray-500 text-right pr-4 mb-8">Card Holder Track</div>
            {BATTLE_PASS_DATA.map(node => (
              <div key={`gold-${node.level}`} className="mb-2">
                {renderRewardBox('gold', node.gold, node.level, isCardHolder)}
              </div>
            ))}

            <div className="font-bold text-gray-500 text-right pr-4 mb-8">Free Track</div>
            {BATTLE_PASS_DATA.map(node => (
              <div key={`free-${node.level}`} className="mb-2">
                {renderRewardBox('free', node.free, node.level, true)}
              </div>
            ))}
            
            {/* Timeline Row */}
            <div className="font-bold text-white text-right pr-4">Level Requirement</div>
            {BATTLE_PASS_DATA.map(node => (
              <div key={`timeline-${node.level}`} className="text-center border-t-2 border-[var(--anime-cyan)] pt-2 relative">
                <div className="absolute top-[-5px] left-1/2 transform -translate-x-1/2 w-2 h-2 bg-[var(--anime-cyan)] rounded-full shadow-[0_0_10px_var(--anime-cyan)]" />
                <span className="font-black text-[var(--anime-cyan)]">Lv {node.level}</span>
                <div className={`text-[10px] mt-1 ${node.rarity === 'Legendary' ? 'text-[var(--anime-gold)]' : 'text-gray-400'}`}>
                  {node.rarity}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </Card>
  );
}
