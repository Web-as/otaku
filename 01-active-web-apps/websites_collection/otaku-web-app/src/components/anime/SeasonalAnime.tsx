import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Loader2, Plus } from 'lucide-react';
import { jikanAPI, JikanAnime } from '../../services/jikanAPI';
import { animeAPI } from '../../services/api';

const SeasonalAnime: React.FC = () => {
  const [seasonalAnime, setSeasonalAnime] = useState<JikanAnime[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<number | null>(null);

  useEffect(() => {
    loadSeasonalAnime();
  }, []);

  const loadSeasonalAnime = async () => {
    setLoading(true);
    try {
      const response = await jikanAPI.getCurrentSeason();
      setSeasonalAnime(response.data.slice(0, 12)); // Show top 12
    } catch (error) {
      console.error('Failed to load seasonal anime:', error);
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
        <p className="text-gray-400">Loading seasonal anime...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-violet-400" />
          <div>
            <h2 className="text-2xl font-bold">This Season</h2>
            <p className="text-sm text-gray-500">Currently airing anime</p>
          </div>
        </div>
        <TrendingUp className="w-5 h-5 text-green-400" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {seasonalAnime.map((anime) => (
          <div
            key={anime.mal_id}
            className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-violet-500/50 transition group"
          >
            <div className="relative aspect-[2/3]">
              <img
                src={anime.images.jpg.image_url}
                alt={anime.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition">
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <button
                    onClick={() => handleAddAnime(anime, 'Plan to Watch')}
                    disabled={adding === anime.mal_id}
                    className="w-full px-3 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-xs font-semibold rounded transition flex items-center justify-center gap-1"
                  >
                    {adding === anime.mal_id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-3 h-3" />
                        Add
                      </>
                    )}
                  </button>
                </div>
              </div>
              {anime.score && (
                <div className="absolute top-2 right-2 px-2 py-1 bg-yellow-500/90 text-black text-xs font-bold rounded">
                  ⭐ {anime.score}
                </div>
              )}
            </div>
            <div className="p-2">
              <h3 className="font-bold text-xs line-clamp-2 mb-1">
                {anime.title_english || anime.title}
              </h3>
              {anime.episodes && (
                <p className="text-xs text-gray-500">{anime.episodes} eps</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeasonalAnime;
