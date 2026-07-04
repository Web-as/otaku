import React from 'react';
import { Play, Star, Calendar, HardDrive, Film } from 'lucide-react';
import { AnimeItem } from '../../types/types';

interface AnimeCardProps {
  anime: AnimeItem;
  viewMode: 'grid' | 'list' | 'compact';
  discoveryMode?: boolean;
  onAddClick?: (anime: AnimeItem) => void;
}

const AnimeCard: React.FC<AnimeCardProps> = ({ anime, viewMode, discoveryMode = false, onAddClick }) => {
  const progressColor = anime.progress === 100 ? 'bg-green-500' : 'bg-pink-500';
  const statusColor = {
    'Watching': 'text-blue-400 border-blue-800 bg-blue-900/20',
    'Completed': 'text-green-400 border-green-800 bg-green-900/20',
    'Plan to Watch': 'text-yellow-400 border-yellow-800 bg-yellow-900/20',
    'Dropped': 'text-red-400 border-red-800 bg-red-900/20',
    'On Hold': 'text-gray-400 border-gray-800 bg-gray-900/20'
  }[anime.status];

  if (viewMode === 'grid') {
    return (
      <div className="group relative bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-violet-500 transition-all duration-300 shadow-lg hover:shadow-violet-900/50">
        {/* Cover Image */}
        <div className="aspect-[2/3] bg-gray-800 relative overflow-hidden">
          {anime.coverImage ? (
            <img
              src={anime.coverImage}
              alt={anime.title}
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <Film className="w-16 h-16 text-white" />
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />

          {/* Top Badges */}
          <div className="absolute top-2 right-2 flex flex-col gap-1 items-end z-10">
            <span className="px-2 py-1 bg-black/80 backdrop-blur text-xs font-mono font-bold text-gray-300 border border-white/10 rounded uppercase">
              {anime.resolution}
            </span>
            {anime.rating && (
              <span className="px-2 py-1 bg-yellow-500/20 backdrop-blur text-xs font-mono font-bold text-yellow-400 border border-yellow-500/50 rounded flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" /> {anime.rating}/10
              </span>
            )}
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800 z-10">
            <div className={`${progressColor} h-full shadow-[0_0_10px_rgba(236,72,153,0.5)]`} style={{ width: `${anime.progress}%` }} />
          </div>

          {/* Hover Play/Add Button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
            {discoveryMode ? (
              <button 
                onClick={() => onAddClick && onAddClick(anime)}
                className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-violet-600 hover:border-violet-500 transition transform hover:scale-110"
              >
                <span className="text-3xl text-white font-light">+</span>
              </button>
            ) : (
              <button className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-pink-600 hover:border-pink-500 transition transform hover:scale-110">
                <Play className="w-6 h-6 text-white fill-current ml-1" />
              </button>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-3 bg-gray-900">
          <h3 className="text-sm font-bold text-white truncate group-hover:text-pink-400 transition" title={anime.titleLT || anime.title}>
            {anime.titleLT || anime.title}
          </h3>
          
          {/* Studio & Year */}
          {anime.studios && anime.studios.length > 0 && (
            <div className="text-[9px] text-gray-500 font-mono mt-1 truncate">
              {anime.studios[0]} • {anime.year}
            </div>
          )}

          {/* Status Badge */}
          <div className="mt-2">
            <span className={`inline-block px-2 py-0.5 text-[9px] font-bold uppercase rounded border ${statusColor}`}>
              {anime.status}
            </span>
          </div>

          <div className="flex justify-between items-center text-[10px] text-gray-500 mt-2 font-mono uppercase">
            <span>{anime.type} • {anime.episodes} EP</span>
            <span className={anime.progress === 100 ? 'text-green-500' : 'text-pink-500'}>
              {anime.progress}%
            </span>
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="flex items-center p-4 bg-gray-900/50 rounded-lg border border-gray-800 hover:border-pink-500/50 hover:bg-gray-800 transition duration-200 group">
      {/* Thumbnail */}
      <div className="w-16 h-24 bg-gray-800 rounded flex-shrink-0 mr-4 overflow-hidden relative">
        {anime.coverImage ? (
          <img src={anime.coverImage} alt={anime.title} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Film className="w-6 h-6 text-gray-600" />
          </div>
        )}
        {anime.rating && (
          <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[8px] font-bold px-1 font-mono">
            {anime.rating}
          </div>
        )}
      </div>
      
      {/* Info */}
      <div className="flex-grow min-w-0 pr-4">
        <h3 className="text-base font-bold text-white truncate group-hover:text-pink-400 transition">
          {anime.titleLT || anime.title}
        </h3>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="px-2 py-0.5 bg-gray-800 text-[10px] font-mono font-bold text-gray-400 border border-gray-700 rounded uppercase">
            {anime.resolution}
          </span>
          <span className="text-[10px] text-gray-500 font-mono uppercase">{anime.type} • {anime.episodes} EP</span>
          {anime.studios?.[0] && (
            <span className="text-[10px] text-violet-400 font-mono uppercase">• {anime.studios[0]}</span>
          )}
        </div>
        {/* Genres */}
        <div className="mt-2 flex flex-wrap gap-1">
          {anime.genres.slice(0, 3).map(genre => (
            <span key={genre} className="px-1.5 py-0.5 bg-violet-900/30 text-violet-400 text-[9px] font-bold uppercase rounded border border-violet-800/50">
              {genre}
            </span>
          ))}
        </div>
      </div>

      {/* Progress */}
      <div className="w-32 mr-6 hidden lg:block">
        <div className="flex justify-between text-[10px] font-mono text-gray-500 mb-1">
          <span>PROGRESAS</span>
          <span>{anime.progress}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
          <div className={`${progressColor} h-full`} style={{ width: `${anime.progress}%` }} />
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex-shrink-0 flex items-center gap-3">
        <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded border ${statusColor} whitespace-nowrap`}>
          {anime.status}
        </span>
        
        <button className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-700 text-gray-400 hover:text-white hover:bg-pink-600 hover:border-pink-500 transition">
          <Play className="w-4 h-4 fill-current ml-0.5" />
        </button>
      </div>
    </div>
  );
};

export default AnimeCard;

