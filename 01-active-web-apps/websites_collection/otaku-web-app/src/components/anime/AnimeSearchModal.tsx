import React, { useState } from 'react';
import { Search, X, Plus, Loader2 } from 'lucide-react';
import { jikanAPI, JikanAnime } from '../../services/jikanAPI';
import { animeAPI } from '../../services/api';

interface AnimeSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnimeAdded: () => void;
}

const AnimeSearchModal: React.FC<AnimeSearchModalProps> = ({ isOpen, onClose, onAnimeAdded }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<JikanAnime[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<number | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await jikanAPI.searchAnime(searchQuery);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAnime = async (anime: JikanAnime, status: string) => {
    setAdding(anime.mal_id);
    try {
      await animeAPI.create({
        title: anime.title_english || anime.title,
        description: anime.synopsis || '',
        episode_count: anime.episodes || 0,
        status: status,
        rating: anime.score || 0,
        cover_image: anime.images.jpg.large_image_url,
        genres: anime.genres?.map(g => g.name) || [],
      });
      onAnimeAdded();
    } catch (error) {
      console.error('Failed to add anime:', error);
      alert('Failed to add anime. Please make sure you are logged in.');
    } finally {
      setAdding(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Add Anime to Library</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search anime on MyAnimeList..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading || !searchQuery.trim()}
              className="px-6 py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Search
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-6">
          {searchResults.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-500">
              <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Search for anime to add to your library</p>
            </div>
          )}

          <div className="grid gap-4">
            {searchResults.map((anime) => (
              <div
                key={anime.mal_id}
                className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex gap-4 hover:border-violet-500/50 transition"
              >
                <img
                  src={anime.images.jpg.image_url}
                  alt={anime.title}
                  className="w-24 h-32 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg mb-1 truncate">
                    {anime.title_english || anime.title}
                  </h3>
                  {anime.title_english && anime.title !== anime.title_english && (
                    <p className="text-sm text-gray-400 mb-2">{anime.title}</p>
                  )}
                  <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                    {anime.synopsis || 'No description available'}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {anime.score && (
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">
                        ⭐ {anime.score}
                      </span>
                    )}
                    {anime.episodes && (
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                        {anime.episodes} episodes
                      </span>
                    )}
                    {anime.status && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded">
                        {anime.status}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleAddAnime(anime, 'Plan to Watch')}
                    disabled={adding === anime.mal_id}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition whitespace-nowrap"
                  >
                    {adding === anime.mal_id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Plan to Watch'}
                  </button>
                  <button
                    onClick={() => handleAddAnime(anime, 'Watching')}
                    disabled={adding === anime.mal_id}
                    className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition whitespace-nowrap"
                  >
                    {adding === anime.mal_id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Watching'}
                  </button>
                  <button
                    onClick={() => handleAddAnime(anime, 'Completed')}
                    disabled={adding === anime.mal_id}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition whitespace-nowrap"
                  >
                    {adding === anime.mal_id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Completed'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimeSearchModal;
