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

  // Intentionally messy: randomize the order
  const messyLibrary = [...ANIME_LIBRARY].sort(() => Math.random() - 0.5);

  // Basic search only (very limited)
  const filteredLibrary = searchTerm
    ? messyLibrary.filter(anime => 
        anime.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : messyLibrary;

  return (
    <div className="min-h-screen bg-[#0f0e17] text-white">
      {/* Header with Premium Tease */}
      <header className="sticky top-0 z-50 bg-[#0f0e17]/95 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Premium Banner */}
          <div className="mb-4 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-700/50 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm font-bold text-yellow-300">Nemokami Apribojimai Aktyvūs</p>
                <p className="text-xs text-yellow-600">Jūsų biblioteka nėra organizuota. Atnaujinkite už €1!</p>
              </div>
            </div>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-black uppercase tracking-wider rounded-lg transition shadow-lg animate-pulse flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Atnaujinti €1
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

      {/* Messy Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Chaos Warning */}
        <div className="mb-6 bg-red-900/20 border border-red-800/50 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-400">Chaosas! Jūsų Anime Biblioteka Neorganizuota</p>
            <p className="text-xs text-red-600 mt-1">
              Failai atsitiktine tvarka, nėra filtrų, nėra rūšiavimo, nėra kategorijų. 
              <button onClick={() => setShowUpgradeModal(true)} className="underline ml-1 hover:text-red-400">
                Atnaujinkite už €1 ir gaukite pilną tvarką.
              </button>
            </p>
          </div>
        </div>

        {/* Intentionally Messy Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filteredLibrary.map((anime, index) => (
            <MessyAnimeCard 
              key={anime.id} 
              anime={anime} 
              index={index}
              onUpgradeClick={() => setShowUpgradeModal(true)}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center bg-gradient-to-br from-violet-900/20 to-pink-900/20 border border-violet-800/50 rounded-xl p-8">
          <Lock className="w-12 h-12 text-violet-400 mx-auto mb-4" />
          <h3 className="text-2xl font-black uppercase mb-2 text-white">Pavargo nuo Chaoso?</h3>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Gaukite automatinį rūšiavimą, pažangius filtrus, grupavimą pagal studiją/žanrą, 
            statistiką ir daug daugiau. Vienkartinis €1 mokestis.
          </p>
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="px-8 py-4 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-black uppercase tracking-wider rounded-lg transition shadow-lg shadow-violet-900/50 text-lg"
          >
            <Sparkles className="w-5 h-5 inline mr-2" />
            Organizuoti Biblioteką už €1
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
    className="flex items-center gap-2 px-3 py-1.5 bg-gray-900/50 border border-gray-800 rounded-lg text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-gray-400 hover:border-gray-700 transition cursor-not-allowed"
  >
    {icon}
    {label}
    <Lock className="w-3 h-3" />
  </button>
);

// Messy Anime Card (intentionally unpolished)
const MessyAnimeCard: React.FC<{ anime: AnimeItem; index: number; onUpgradeClick: () => void }> = ({ anime, index, onUpgradeClick }) => {
  // Random styling issues to emphasize the chaos
  const isOddSize = index % 3 === 0;
  const isMisaligned = index % 5 === 0;
  
  return (
    <div 
      className={`relative bg-gray-900 rounded-lg overflow-hidden border border-gray-800 ${
        isMisaligned ? 'transform rotate-1' : ''
      } ${isOddSize ? 'col-span-2' : ''}`}
      style={{ opacity: 0.7 + (index % 3) * 0.1 }}
    >
      {/* Messy Image */}
      <div className={`${isOddSize ? 'aspect-video' : 'aspect-[2/3]'} bg-gray-800 relative overflow-hidden`}>
        {anime.coverImage ? (
          <img
            src={anime.coverImage}
            alt={anime.title}
            className="w-full h-full object-cover"
            style={{ filter: 'grayscale(50%)' }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-700 text-xs">
            NO IMAGE
          </div>
        )}
        
        {/* "Upgrade to organize" overlay on hover */}
        <div className="absolute inset-0 bg-black/80 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
          <button 
            onClick={onUpgradeClick}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded flex items-center gap-2"
          >
            <Lock className="w-3 h-3" />
            Organizuoti
          </button>
        </div>
      </div>

      {/* Messy Info - no proper formatting */}
      <div className="p-2 bg-gray-900">
        <p className="text-xs text-gray-500 truncate font-mono">{anime.title}</p>
        <div className="text-[10px] text-gray-700 mt-1">
          {anime.resolution} • {anime.type} • ???
        </div>
      </div>
    </div>
  );
};

export default FreeTierLibrary;

