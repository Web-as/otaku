import { apiCache } from './apiCache';
import { rateLimiter } from './rateLimiter';

interface JikanAnime {
  mal_id: number;
  title: string;
  title_english: string;
  title_japanese: string;
  type: string;
  episodes: number;
  status: string;
  score: number;
  synopsis: string;
  images: {
    jpg: {
      large_image_url: string;
    };
  };
  genres: { name: string }[];
  studios: { name: string }[];
}

const JIKAN_API = 'https://api.jikan.moe/v4';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes
const RATE_LIMIT_DELAY = 1000; // Jikan requires 1 request per second

let lastRequestTime = 0;

async function waitForRateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest));
  }
  
  lastRequestTime = Date.now();
}

async function fetchWithRetry(url: string, maxRetries = 3): Promise<Response> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await waitForRateLimit();
      
      const response = await fetch(url);
      
      if (response.status === 429) {
        console.warn('Jikan rate limit hit. Waiting 60s...');
        await new Promise(resolve => setTimeout(resolve, 60000));
        continue;
      }
      
      if (!response.ok && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        continue;
      }
      
      return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
  throw new Error('Max retries exceeded');
}

export async function searchAnime(query: string): Promise<JikanAnime[]> {
  const cacheKey = `jikan:search:${query}`;
  
  const cached = apiCache.get<JikanAnime[]>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const url = `${JIKAN_API}/anime?q=${encodeURIComponent(query)}&limit=20&order_by=popularity`;
    const response = await fetchWithRetry(url);
    const { data } = await response.json();

    apiCache.set(cacheKey, data || [], CACHE_TTL);

    return data || [];
  } catch (error) {
    console.error('Jikan API error:', error);
    return [];
  }
}

export async function getTopAnime(limit = 20): Promise<JikanAnime[]> {
  const cacheKey = `jikan:top:${limit}`;
  
  const cached = apiCache.get<JikanAnime[]>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const url = `${JIKAN_API}/top/anime?limit=${limit}`;
    const response = await fetchWithRetry(url);
    const { data } = await response.json();

    apiCache.set(cacheKey, data || [], CACHE_TTL);

    return data || [];
  } catch (error) {
    console.error('Jikan API error:', error);
    return [];
  }
}

export async function getAnimeById(id: number): Promise<JikanAnime | null> {
  const cacheKey = `jikan:anime:${id}`;
  
  const cached = apiCache.get<JikanAnime>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const url = `${JIKAN_API}/anime/${id}`;
    const response = await fetchWithRetry(url);
    const { data } = await response.json();

    if (data) {
      apiCache.set(cacheKey, data, CACHE_TTL);
    }

    return data || null;
  } catch (error) {
    console.error('Jikan API error:', error);
    return null;
  }
}

export async function getSeasonalAnime(year?: number, season?: string): Promise<JikanAnime[]> {
  const currentYear = year || new Date().getFullYear();
  const currentSeason = season || getCurrentSeason();
  const cacheKey = `jikan:seasonal:${currentYear}:${currentSeason}`;
  
  const cached = apiCache.get<JikanAnime[]>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const url = `${JIKAN_API}/seasons/${currentYear}/${currentSeason}`;
    const response = await fetchWithRetry(url);
    const { data } = await response.json();

    apiCache.set(cacheKey, data || [], CACHE_TTL);

    return data || [];
  } catch (error) {
    console.error('Jikan API error:', error);
    return [];
  }
}

function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1;
  if (month >= 1 && month <= 3) return 'winter';
  if (month >= 4 && month <= 6) return 'spring';
  if (month >= 7 && month <= 9) return 'summer';
  return 'fall';
}
