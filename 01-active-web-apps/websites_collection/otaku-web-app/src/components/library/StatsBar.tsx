import React from 'react';
import { HardDrive, CheckCircle, Film, TrendingUp, Monitor } from 'lucide-react';
import { LibraryStats } from '../../types/types';

interface StatsBarProps {
  stats: LibraryStats;
}

const StatsBar: React.FC<StatsBarProps> = ({ stats }) => {
  return (
    <div className="bg-gray-900/50 border-b border-gray-800 py-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Total Items */}
          <StatCard
            icon={<Film className="w-5 h-5" />}
            label="Viso Anime"
            value={stats.totalItems.toString()}
            color="text-violet-400"
          />

          {/* Total Size */}
          <StatCard
            icon={<HardDrive className="w-5 h-5" />}
            label="Dydis"
            value={stats.totalSize}
            color="text-blue-400"
          />

          {/* Completed */}
          <StatCard
            icon={<CheckCircle className="w-5 h-5" />}
            label="Užbaigta"
            value={stats.completedSeries.toString()}
            color="text-green-400"
          />

          {/* Episodes */}
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Epizodai"
            value={`${stats.watchedEpisodes}/${stats.totalEpisodes}`}
            color="text-pink-400"
          />

          {/* 4K Content */}
          <StatCard
            icon={<Monitor className="w-5 h-5" />}
            label="4K Turinys"
            value={stats.by4K.toString()}
            color="text-yellow-400"
          />

          {/* Average Rating */}
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Vid. Įvertinimas"
            value={stats.averageRating ? `${stats.averageRating}/10` : 'N/A'}
            color="text-orange-400"
          />
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; color: string }> = ({ icon, label, value, color }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition">
    <div className="flex items-center gap-3">
      <div className={`${color}`}>{icon}</div>
      <div className="flex-grow">
        <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold font-mono">
          {label}
        </div>
        <div className="text-lg font-bold text-white font-mono">{value}</div>
      </div>
    </div>
  </div>
);

export default StatsBar;

