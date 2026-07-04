import { useState, useEffect } from 'react';
import { api } from '../services/api';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export const useBadges = () => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const response = await api.get('/api/v1/users/badges');
      setBadges(response.data.badges || []);
    } catch (err) {
      console.error('Failed to fetch badges:', err);
    } finally {
      setLoading(false);
    }
  };

  return { badges, loading, refetch: fetchBadges };
};
