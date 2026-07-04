"use client";

import React, { useState, useEffect } from 'react';
import { Target, Gift, Crown, Scroll, Sparkles } from 'lucide-react';

const milestones = [
  { count: 1000, title: 'Title & Banner', desc: 'Unlock "Pioneer" Title & Bronze Profile Banner', icon: Target, unlocked: true },
  { count: 5000, title: 'Starter Pack', desc: 'Starter Quest Scroll + Basic Currency Pack', icon: Scroll, unlocked: false },
  { count: 10000, title: 'Free Premium', desc: '1 Month of Premium Status (All Features)', icon: Crown, unlocked: false },
  { count: 25000, title: 'Exclusive Aura', desc: 'Custom Pre-Register Only Avatar Aura', icon: Sparkles, unlocked: false },
];

export default function MilestoneTracker() {
  // Mock current pre-register count
  const [currentCount, setCurrentCount] = useState(4892);

  // Small animation effect on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentCount(4915);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const maxMilestone = milestones.length > 0 ? milestones[milestones.length - 1].count : 1;
  const progressPercentage = Math.min((currentCount / maxMilestone) * 100, 100);

  return (
    <div className="bg-[#0f0e17] border border-violet-500/30 rounded-xl p-6 relative overflow-hidden my-8 glass-card">
      <div className="absolute inset-0 bg-anime-grid opacity-20 mix-blend-overlay pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-500 uppercase tracking-widest flex items-center">
            <Gift className="w-6 h-6 mr-2 text-pink-500" />
            Global Pre-Register Rewards
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Rewards are <strong className="text-violet-400">cumulative!</strong> If we reach 10,000 users, every pre-registered player receives ALL previous tier rewards.
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 text-right">
          <div className="text-xs text-gray-500 uppercase font-mono tracking-widest">Current Recruits</div>
          <div className="text-4xl font-black text-white tracking-tighter">
            {currentCount.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative w-full h-4 bg-gray-900 rounded-full mb-10 border border-gray-800 shadow-inner">
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-violet-600 to-pink-500 rounded-full transition-all duration-1000 ease-out relative shadow-[0_0_15px_rgba(236,72,153,0.5)]"
          style={{ width: `${progressPercentage}%` }}
        >
          {/* Animated glow head */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_10px_white] animate-pulse"></div>
        </div>

        {/* Milestone Markers */}
        {milestones.map((ms, i) => {
          const isReached = currentCount >= ms.count;
          const position = (ms.count / maxMilestone) * 100;
          return (
            <div 
              key={i}
              className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center"
              style={{ left: `${position}%` }}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-lg border-2 z-10 transition-colors ${isReached ? 'bg-pink-500 border-white text-white' : 'bg-gray-800 border-gray-600 text-gray-500'}`}>
                {i + 1}
              </div>
              <div className="absolute top-8 w-24 text-center transform -translate-x-1/2 hidden md:block">
                <div className={`text-[10px] font-bold ${isReached ? 'text-pink-400' : 'text-gray-500'}`}>{ms.count.toLocaleString()}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reward Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
        {milestones.map((ms, i) => {
          const isReached = currentCount >= ms.count;
          const Icon = ms.icon;
          return (
            <div key={i} className={`p-4 rounded-lg border transition-all ${isReached ? 'bg-violet-900/20 border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.15)]' : 'bg-gray-900/50 border-gray-800 opacity-60'}`}>
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${isReached ? 'text-pink-400' : 'text-gray-600'}`} />
                {isReached && <span className="text-[9px] font-bold px-2 py-0.5 bg-green-500/20 text-green-400 rounded uppercase">Unlocked</span>}
                {!isReached && <span className="text-[9px] font-bold px-2 py-0.5 bg-gray-800 text-gray-500 rounded uppercase">Locked</span>}
              </div>
              <h4 className={`font-bold text-sm mb-1 ${isReached ? 'text-white' : 'text-gray-500'}`}>{ms.title}</h4>
              <p className="text-xs text-gray-400 leading-snug">{ms.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
