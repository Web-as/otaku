
import { useState, useEffect } from 'react';
import { MediaItem } from '../types';

interface JikanResponse {
  data: any[];
}

export const useJikan = (query: string, enabled: boolean) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) {
      // Keep existing data or clear? Let's keep for smoother UX toggling, or clear if strict.
      // If we are switching TO local, we rely on Mock Data in the component.
      return;
    }

    const fetchJikan = async () => {
      setLoading(true);
      try {
        const url = query 
          ? `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=20`
          : `https://api.jikan.moe/v4/top/anime?limit=20`;
        
        const res = await fetch(url);
        const data: JikanResponse = await res.json();
        
        const items: MediaItem[] = data.data.map((item: any) => ({
          id: item.mal_id.toString(),
          title: item.title_english || item.title,
          resolution: '1080p', // Mock, API doesn't provide file resolution
          type: item.type === 'Movie' ? 'Movie' : 'Series',
          progress: 0,
          episodes: item.episodes || 0,
          watched: 0,
          missing: 0,
          tags: item.genres?.map((g: any) => g.name) || [],
          coverImage: item.images?.jpg?.large_image_url,
          malId: item.mal_id
        }));
        setMediaItems(items);
      } catch (error) {
        console.error("Jikan API Error", error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchJikan, 500);
    return () => clearTimeout(debounce);
  }, [query, enabled]);

  return { mediaItems, loading };
};
