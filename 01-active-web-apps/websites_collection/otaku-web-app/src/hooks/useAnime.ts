import { useState, useEffect, useMemo } from 'react';
import { animeAPI } from '../services/api';
import { AnimeItem } from '../types/types';
import { useSupabaseRealtime } from './useSupabaseRealtime';
import { getCurrentUser } from '@/lib/firebase';

interface UseAnimeResult {
  anime: AnimeItem[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createAnime: (data: Partial<AnimeItem>) => Promise<void>;
  updateAnime: (id: string, data: Partial<AnimeItem>) => Promise<void>;
  deleteAnime: (id: string) => Promise<void>;
}

export const useAnime = (): UseAnimeResult => {
  const [anime, setAnime] = useState<AnimeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnime = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await animeAPI.getAll();
      setAnime(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch anime');
      console.error('Failed to fetch anime:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnime();
  }, []);

  // Set up real-time sync
  const currentUser = getCurrentUser();
  const filter = useMemo(() => {
    return currentUser?.uid ? `user_id=eq.${currentUser.uid}` : undefined;
  }, [currentUser?.uid]);

  useSupabaseRealtime(
    {
      table: 'anime_library',
      filter: filter,
    },
    fetchAnime
  );

  const createAnime = async (data: Partial<AnimeItem>) => {
    try {
      await animeAPI.create(data);
      await fetchAnime();
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || 'Failed to create anime');
    }
  };

  const updateAnime = async (id: string, data: Partial<AnimeItem>) => {
    try {
      await animeAPI.update(id, data);
      await fetchAnime();
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || 'Failed to update anime');
    }
  };

  const deleteAnime = async (id: string) => {
    try {
      await animeAPI.delete(id);
      await fetchAnime();
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || 'Failed to delete anime');
    }
  };

  return {
    anime,
    loading,
    error,
    refetch: fetchAnime,
    createAnime,
    updateAnime,
    deleteAnime,
  };
};
