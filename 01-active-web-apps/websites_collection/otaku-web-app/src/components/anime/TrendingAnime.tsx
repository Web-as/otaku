import React, { useState, useEffect } from 'react';
import { TrendingUp, Loader2, Plus, Star } from 'lucide-react';
import { jikanAPI, JikanAnime } from '../../services/jikanAPI';
import { animeAPI } from '../../services/api';

const TrendingAnime: React.FC = () => {
  const [trendingAnime, setTrendingAnime] = useState<JikanAnime[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<number | null>(null);

  useEffect(() => {
    loadTrendingAnime();
  }, []);

  const loadTrendingAnime = async () => {
    setLoading(true);
    try {
      const response = await jikanAPI.getTopAnime(1);
      setTrendingAnime(response.data.slice(0, 10)); // Show top 10
    } catch (error) {
      console.error('Failed to load trending anime:', error);
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
      window.location.reload();
    } catch (error) {
      console.error('Failed to add anime:', error);
      alert('Failed to add anime. Please login first at /auth');
    } finally {
      setAdding(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Loading top anime...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-violet-400" />
          <div>
            <h2 className="text-2xl font-bold">Top Rated Anime</h2>
            <p className="text-sm text-gray-500">Most popular on MyAnimeList</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {trendingAnime.map((anime, index) => (
          <div
            key={anime.mal_id}
            className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-violet-500/50 transition flex gap-4"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-violet-600 rounded-lg font-bold text-xl">
              #{index + 1}
            </div>
            <img
              src={anime.images.jpg.image_url}
              alt={anime.title}
              className="w-16 h-24 object-cover rounded"
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
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    {anime.score}
                  </span>
                )}
                {anime.episodes && (
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                    {anime.episodes} episodes
                  </span>
                )}
                {anime.year && (
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded">
                    {anime.year}
                  </span>
                )}
                {anime.genres && anime.genres.length > 0 && (
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded">
                    {anime.genres[0].name}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleAddAnime(anime, 'Plan to Watch')}
                disabled={adding === anime.mal_id}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition whitespace-nowrap flex items-center gap-2"
              >
                {adding === anime.mal_id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingAnime;
