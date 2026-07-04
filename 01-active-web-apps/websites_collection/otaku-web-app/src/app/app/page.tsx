"use client";

import React from 'react';
import Link from 'next/link';
import { Library, Users, Bot, Star, Scan, Backpack, Trophy, PenTool } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function HubDashboard() {
  const { user } = useAuth();
  
  const hubLinks = [
    { name: 'Library', icon: Library, path: '/app/library', desc: 'Browse and track your anime' },
    { name: 'Inventory', icon: Backpack, path: '/app/inventory', desc: 'Manage your loot and passes' },
    { name: 'Scanner', icon: Scan, path: '/app/scanner', desc: 'Scan IRL objects for rewards' },
    { name: 'Quests', icon: Trophy, path: '/app/quests', desc: 'Complete daily tasks' },
    { name: 'My Blog', icon: PenTool, path: '/app/my-blog', desc: 'Write about your journey' },
    { name: 'Community', icon: Users, path: '/app/community', desc: 'See other players' },
    { name: 'AI Assistant', icon: Bot, path: '/app/assistant', desc: 'Talk to your waifu' },
    { name: 'Collectibles', icon: Star, path: '/app/collectibles', desc: 'View your 3D models' },
  ];

  return (
    <div className="p-8 pb-24 max-w-7xl mx-auto relative z-10">
      <h1 className="text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">
        Welcome to the Hub, {user?.username || 'Adventurer'}
      </h1>
      <p className="text-gray-400 mb-10 text-lg">Choose your next destination from the command center.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {hubLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link 
              key={link.path} 
              href={link.path} 
              className="group relative glass p-6 rounded-2xl border border-gray-800/60 hover:border-violet-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(139,92,246,0.3)] bg-[#0f0e17]/80 backdrop-blur-md overflow-hidden flex flex-col items-start"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl group-hover:bg-pink-500/20 transition-colors pointer-events-none" />
              <div className="relative z-10 w-full">
                <div className="w-12 h-12 rounded-xl bg-gray-800/50 flex items-center justify-center mb-4 group-hover:bg-violet-500/20 transition-colors">
                  <Icon className="w-6 h-6 text-violet-400 group-hover:text-pink-400 transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{link.name}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{link.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
