"use client";
import React, { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import AnimeCard from './AnimeCard';
import { AnimeItem } from '../../types/types';

export default function DiscoveryGrid() {
  const [query, setQuery] = useState('naruto');
  const [type, setType] = useState<'anime' | 'manga' | 'vn'>('anime');
  const [results, setResults] = useState<AnimeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState<AnimeItem | null>(null);

  useEffect(() => {
    handleSearch();
  }, [type]); // Refetch when type changes

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    
    try {
      if (type === 'anime' || type === 'manga') {
        const res = await fetch(`https://api.jikan.moe/v4/${type}?q=${encodeURIComponent(query)}&limit=15`);
        const data = await res.json();
        
        const mapped: AnimeItem[] = (data.data || []).map((item: any) => ({
          id: item.mal_id.toString(),
          title: item.title,
          coverImage: item.images?.jpg?.image_url || '',
          type: type === 'anime' ? (item.type || 'TV') : 'Manga',
          status: 'Plan to Watch', // Default for display styling
          progress: 0,
          episodes: item.episodes || 0,
          genres: item.genres?.map((g: any) => g.name) || [],
          rating: item.score || null,
          resolution: '1080P', // Mock for UI
          year: item.year || new Date().getFullYear(),
        }));
        setResults(mapped);
      } else if (type === 'vn') {
        const payload = {
          filters: ["search", "=", query],
          fields: "title, image.url, description, rating",
          results: 15
        };
        const res = await fetch("https://api.vndb.org/kana/vn", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        const mapped: AnimeItem[] = (data.results || []).map((item: any) => ({
          id: item.id,
          title: item.title,
          coverImage: item.image?.url || '',
          type: 'VN',
          status: 'Plan to Watch',
          progress: 0,
          episodes: 1,
          genres: ['Visual Novel'],
          rating: item.rating ? (item.rating / 10).toFixed(1) : null,
          resolution: '1080P',
          year: new Date().getFullYear(),
        }));
        setResults(mapped);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch results.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = (item: AnimeItem) => {
    setSelectedItem(item);
  };

  const confirmAdd = (status: 'Want to Watch' | 'Watching' | 'Completed') => {
    // In a real app, this sends a mutation to Supabase
    alert(`Added ${selectedItem?.title} to ${status}!`);
    setSelectedItem(null);
  };

  return (
    <div className="min-h-screen bg-[#0f0e17] text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0f0e17]/95 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <h1 className="text-3xl font-black uppercase tracking-tight bg-gradient-to-r from-violet-400 to-pink-500 bg-clip-text text-transparent">
            🌍 Discovery
          </h1>
          
          <div className="flex w-full md:w-auto items-center gap-2">
            <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-800">
              {(['anime', 'manga', 'vn'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition ${
                    type === t ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {t === 'vn' ? 'Visual Novels' : t}
                </button>
              ))}
            </div>
            
            <div className="relative flex-grow md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search database..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-600 focus:border-violet-500 focus:outline-none transition"
              />
            </div>
            <button 
              onClick={handleSearch}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-bold uppercase transition"
            >
              Search
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-400">{error}</div>
        ) : results.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No results found.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {results.map(anime => (
              <AnimeCard 
                key={anime.id} 
                anime={anime} 
                viewMode="grid" 
                discoveryMode={true} 
                onAddClick={handleAddClick} 
              />
            ))}
          </div>
        )}
      </main>

      {/* Add Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Add to Library</h3>
            <p className="text-violet-400 mb-6 truncate">{selectedItem.title}</p>
            
            <div className="space-y-3">
              {(['Want to Watch', 'Watching', 'Completed'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => confirmAdd(status)}
                  className="w-full px-4 py-3 bg-gray-800 hover:bg-violet-600 border border-gray-700 hover:border-violet-500 text-white rounded-lg font-bold uppercase tracking-wider transition"
                >
                  {status}
                </button>
              ))}
            </div>
            
            <button 
              onClick={() => setSelectedItem(null)}
              className="mt-6 w-full px-4 py-2 text-gray-400 hover:text-white uppercase font-bold text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
