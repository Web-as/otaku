import React, { useState } from 'react';
import { Star, Trash2, Edit, Check, Sparkles } from 'lucide-react';
import { animeAPI } from '../../services/api';
import { AnimeItem } from '../../types/types';

interface AnimeCardProps {
  anime: AnimeItem;
  viewMode: 'grid' | 'list';
  onBlogSync?: (anime: AnimeItem) => void;
}

const AnimeCard: React.FC<AnimeCardProps> = ({ anime, viewMode, onBlogSync }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const statuses = ['Watching', 'Completed', 'Plan to Watch', 'On Hold', 'Dropped'];

  const statusColors: Record<string, string> = {
    'Watching': 'bg-green-500/20 text-green-400 border-green-500/50',
    'Completed': 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    'Plan to Watch': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    'On Hold': 'bg-orange-500/20 text-orange-400 border-orange-500/50',
    'Dropped': 'bg-red-500/20 text-red-400 border-red-500/50',
  };

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await animeAPI.update(anime.id, { status: newStatus });
      window.location.reload(); // Simple refresh for now
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsUpdating(false);
      setShowStatusMenu(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Remove "${anime.title}" from your library?`)) return;
    
    try {
      await animeAPI.delete(anime.id);
      window.location.reload();
    } catch (error) {
      console.error('Failed to delete anime:', error);
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-violet-500/50 transition flex gap-4">
        <img
          src={anime.coverImage || '/placeholder-anime.jpg'}
          alt={anime.title}
          className="w-20 h-28 object-cover rounded"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/200x280?text=No+Image';
          }}
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg mb-1 truncate">{anime.title}</h3>
          <p className="text-sm text-gray-400 line-clamp-2 mb-2">
            No description available
          </p>
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative">
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className={`px-3 py-1 text-xs font-semibold rounded border ${statusColors[anime.status] || 'bg-gray-700 text-gray-300'}`}
              >
                {anime.status}
              </button>
              {showStatusMenu && (
                <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 min-w-[150px]">
                  {statuses.map(status => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      disabled={isUpdating}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg transition flex items-center justify-between"
                    >
                      {status}
                      {anime.status === status && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {anime.rating && anime.rating > 0 && (
              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                {anime.rating}
              </span>
            )}
            {anime.episodes > 0 && (
              <span className="text-xs text-gray-500">
                {anime.episodes} episodes
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1 self-start">
          {onBlogSync && (
            <button
              type="button"
              onClick={() => onBlogSync(anime)}
              className="p-2 hover:bg-amber-500/20 hover:text-amber-300 rounded-lg transition"
              title="Sync to blog"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={handleDelete}
            className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-violet-500/50 transition group">
      <div className="relative aspect-[2/3]">
        <img
          src={anime.coverImage || '/placeholder-anime.jpg'}
          alt={anime.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/200x300?text=No+Image';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition">
          <div className="absolute bottom-0 left-0 right-0 p-3 flex gap-2">
            {onBlogSync && (
              <button
                type="button"
                onClick={() => onBlogSync(anime)}
                className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-black text-xs font-bold rounded transition"
                title="Magic sync to blog"
              >
                <Sparkles className="w-3 h-3 inline" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className="flex-1 px-3 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded transition"
            >
              <Edit className="w-3 h-3 inline mr-1" />
              Status
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded transition"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
        {showStatusMenu && (
          <div className="absolute top-2 left-2 right-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10">
            {statuses.map(status => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={isUpdating}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg transition flex items-center justify-between"
              >
                {status}
                {anime.status === status && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-bold text-sm mb-2 line-clamp-2">{anime.title}</h3>
        <div className="flex items-center justify-between">
          <span className={`px-2 py-1 text-xs font-semibold rounded border ${statusColors[anime.status] || 'bg-gray-700 text-gray-300'}`}>
            {anime.status}
          </span>
          {anime.rating && anime.rating > 0 && (
            <span className="flex items-center gap-1 text-xs text-yellow-400">
              <Star className="w-3 h-3 fill-current" />
              {anime.rating}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnimeCard;
