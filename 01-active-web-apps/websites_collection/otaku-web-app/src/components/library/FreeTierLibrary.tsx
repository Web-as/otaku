import React, { useState } from 'react';
import { Lock, Sparkles, AlertTriangle, Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { AnimeItem } from '../../types/types';
import { ANIME_LIBRARY } from '../../data/animeData';
import UpgradeModal from './UpgradeModal';

interface FreeTierLibraryProps {
  onUpgrade: () => void;
}

const FreeTierLibrary: React.FC<FreeTierLibraryProps> = ({ onUpgrade }) => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Sleek presentation, just restricted
  const pristineLibrary = [...ANIME_LIBRARY].slice(0, 12); // Show a limited preview of perfection

  // Basic search only (very limited)
  const filteredLibrary = searchTerm
    ? pristineLibrary.filter(anime => 
        anime.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : pristineLibrary;

  return (
    <div className="min-h-screen bg-[#0f0e17] text-white">
      {/* Header with Premium Tease */}
      <header className="sticky top-0 z-50 bg-[#0f0e17]/95 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Premium Banner */}
          <div className="mb-4 glass-panel border border-violet-800/50 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-violet-400 animate-pulse" />
              <div>
                <p className="text-sm font-bold text-gray-200">Naršote ribotu režimu</p>
                <p className="text-xs text-gray-400">Atraskite pilną potencialą. Atrakinkite įrankius nuo €1.</p>
              </div>
            </div>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="px-6 py-2 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-black uppercase tracking-wider rounded-lg transition shadow-lg shadow-violet-900/50 flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Atrakinti (nuo €1)
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight text-gray-400">
                Anime Biblioteka
                <span className="ml-3 text-xs px-2 py-1 bg-gray-800 border border-gray-700 rounded text-gray-500 font-mono">NEMOKAMA VERSIJA</span>
              </h1>
              <p className="text-sm text-gray-600 font-mono uppercase tracking-widest mt-1">
                {filteredLibrary.length} Neorganizuotų Anime
              </p>
            </div>
          </div>

          {/* Basic Search Only */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
            <input
              type="text"
              placeholder="Paprasta paieška... (Tik nemokamoje versijoje)"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-800 rounded-lg pl-12 pr-4 py-3 text-sm text-gray-400 placeholder-gray-700 focus:border-gray-700 focus:outline-none"
            />
          </div>

          {/* Locked Features */}
          <div className="mt-4 flex gap-2 flex-wrap">
            <LockedFeature label="Filtrai" icon={<SlidersHorizontal className="w-3 h-3" />} onClick={() => setShowUpgradeModal(true)} />
            <LockedFeature label="Rūšiavimas" icon={<ArrowUpDown className="w-3 h-3" />} onClick={() => setShowUpgradeModal(true)} />
            <LockedFeature label="Grupavimas" onClick={() => setShowUpgradeModal(true)} />
            <LockedFeature label="Statistika" onClick={() => setShowUpgradeModal(true)} />
          </div>
        </div>
      </header>

      {/* Pristine Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-8 relative">
        
        {/* Pristine Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 relative z-10">
          {filteredLibrary.map((anime, index) => (
            <RestrictedAnimeCard 
              key={anime.id} 
              anime={anime} 
              onUpgradeClick={() => setShowUpgradeModal(true)}
            />
          ))}
        </div>
        
        {/* Gradient Fade out for limited view */}
        <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-[#0f0e17] to-transparent z-20 pointer-events-none" />

        {/* Bottom CTA */}
        <div className="mt-12 text-center glass-panel rounded-xl p-8 relative z-30">
          <Lock className="w-12 h-12 text-violet-400 mx-auto mb-4" />
          <h3 className="text-2xl font-black uppercase mb-2 text-white">Norite matyti viską?</h3>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Gaukite automatinį rūšiavimą, pažangius filtrus, grupavimą pagal studiją/žanrą, 
            statistiką, ir net AR bibliotekos kortelę. Atrakinkite nuo €1.
          </p>
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="px-8 py-4 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-black uppercase tracking-wider rounded-lg transition shadow-lg shadow-violet-900/50 text-lg group"
          >
            <Sparkles className="w-5 h-5 inline mr-2 group-hover:animate-spin-slow" />
            Atrakinti Pilną Potencialą
          </button>
        </div>
      </main>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradeModal 
          onClose={() => setShowUpgradeModal(false)}
          onUpgrade={onUpgrade}
        />
      )}
    </div>
  );
};

// Locked Feature Button
const LockedFeature: React.FC<{ label: string; icon?: React.ReactNode; onClick: () => void }> = ({ label, icon, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 px-3 py-1.5 bg-gray-900/40 border border-gray-700/50 rounded-lg text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-violet-400 hover:border-violet-500/50 transition cursor-pointer relative group overflow-hidden"
  >
    <div className="absolute inset-0 bg-violet-500/10 translate-y-full group-hover:translate-y-0 transition-transform" />
    <span className="relative z-10 flex items-center gap-2">
      {icon}
      {label}
      <Lock className="w-3 h-3 text-violet-500/50 group-hover:text-violet-400" />
    </span>
  </button>
);

// Restricted Anime Card (sleek, but restricted)
const RestrictedAnimeCard: React.FC<{ anime: AnimeItem; onUpgradeClick: () => void }> = ({ anime, onUpgradeClick }) => {
  return (
    <div className="glass-card rounded-lg overflow-hidden group cursor-pointer" onClick={onUpgradeClick}>
      {/* Sleek Image */}
      <div className="aspect-[2/3] bg-gray-900 relative overflow-hidden">
        {anime.coverImage ? (
          <img
            src={anime.coverImage}
            alt={anime.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:blur-sm"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-700 text-xs">
            NO IMAGE
          </div>
        )}
        
        {/* Frosted Glass Overlay */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center border border-violet-500/30">
          <Lock className="w-8 h-8 text-violet-400 mb-2" />
          <span className="px-4 py-1.5 bg-violet-600/90 text-white text-xs font-bold rounded-full uppercase tracking-widest shadow-lg shadow-violet-900/50">
            Atrakinti
          </span>
        </div>
      </div>

      {/* Info - sleek but minimal */}
      <div className="p-3 bg-gray-900/80 border-t border-gray-800">
        <p className="text-sm font-bold text-gray-200 truncate">{anime.title}</p>
        <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1 flex gap-2">
          <span>{anime.type}</span>
          <span className="text-violet-400/50"><Lock className="inline w-2 h-2 mr-1"/>HD</span>
        </div>
      </div>
    </div>
  );
};

export default FreeTierLibrary;

