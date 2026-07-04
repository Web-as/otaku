"use client";

import React, { useEffect, useState } from 'react';
import { Zap, Users, Heart } from 'lucide-react';
import { getSupabase } from '@/lib/supabase/config';

export default function LiveStatsTicker() {
  const [stats, setStats] = useState({
    totalMembers: 1420, // Fallback starting values
    totalSupporters: 142,
    fundsRaised: 142.00
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const supabase = getSupabase();
        
        // Fetch total registered users
        const { count: usersCount } = await supabase
          .from('user_profiles')
          .select('*', { count: 'exact', head: true });

        // Fetch users who have supported/purchased
        const { count: supportersCount } = await supabase
          .from('user_profiles')
          .select('*', { count: 'exact', head: true })
          .not('purchase_date', 'is', null);

        if (usersCount !== null) {
          setStats(prev => ({ ...prev, totalMembers: usersCount }));
        }
        if (supportersCount !== null) {
          setStats(prev => ({ 
            ...prev, 
            totalSupporters: supportersCount,
            fundsRaised: supportersCount * 1.00 // Assuming $1 per supporter
          }));
        }
      } catch (err) {
        console.error("Failed to fetch live stats", err);
      }
    };

    fetchStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative z-10 bg-pink-600/10 border-y border-pink-500/20 overflow-hidden py-3">
      <div className="whitespace-nowrap flex animate-marquee">
        {[...Array(10)].map((_, i) => (
          <span key={i} className="mx-8 text-xs font-mono font-bold text-pink-400 uppercase tracking-widest flex items-center">
            <Zap className="w-3 h-3 mr-2" /> Pre-Sale Active at $1.00 
            <span className="mx-4 text-violet-500/50">•</span> 
            <Users className="w-3 h-3 mr-2 text-violet-400" /> <span className="text-violet-300">Total Members: {stats.totalMembers.toLocaleString()}</span>
            <span className="mx-4 text-violet-500/50">•</span> 
            <Heart className="w-3 h-3 mr-2 text-green-400" /> <span className="text-green-300">Supporters: {stats.totalSupporters.toLocaleString()}</span>
            <span className="mx-4 text-violet-500/50">•</span> 
            <span className="text-pink-300">Funds Raised: ${stats.fundsRaised.toFixed(2)}</span>
            <span className="mx-4 text-violet-500/50">•</span> 
            Free Updates Forever
          </span>
        ))}
      </div>
    </div>
  );
}
