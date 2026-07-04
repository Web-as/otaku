import { apiCache } from './apiCache';
import { rateLimiter } from './rateLimiter';

interface AnimeMetadata {
  id: number;
  malId: number;
  title: {
    romaji: string;
    english: string;
    native: string;
  };
  coverImage: {
    large: string;
  };
  bannerImage: string;
  episodes: number;
  genres: string[];
  format: string;
  status: string;
  description: string;
  averageScore: number;
  season: string;
  seasonYear: number;
  studios: { name: string }[];
}

const ANILIST_API = 'https://graphql.anilist.co';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
        console.warn(`Rate limited. Retrying after ${retryAfter}s`);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
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

export async function searchAnime(query: string): Promise<AnimeMetadata[]> {
  const cacheKey = `anilist:search:${query}`;
  
  // Check cache
  const cached = apiCache.get<AnimeMetadata[]>(cacheKey);
  if (cached) {
    return cached;
  }

  // Check rate limit
  if (!await rateLimiter.checkLimit('anilist')) {
    await rateLimiter.waitForLimit('anilist');
  }

  const graphqlQuery = `
    query ($search: String) {
      Page(page: 1, perPage: 20) {
        media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
          id
          idMal
          title {
            romaji
            english
            native
          }
          coverImage {
            large
          }
          bannerImage
          episodes
          genres
          format
          status
          description
          averageScore
          season
          seasonYear
          studios(isMain: true) {
            nodes {
              name
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetchWithRetry(ANILIST_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: graphqlQuery,
        variables: { search: query },
      }),
    });

    const { data } = await response.json();
    const results = data?.Page?.media || [];

    // Cache results
    apiCache.set(cacheKey, results, CACHE_TTL);

    return results;
  } catch (error) {
    console.error('AniList API error:', error);
    return [];
  }
}

export async function getTrendingAnime(): Promise<AnimeMetadata[]> {
  const cacheKey = 'anilist:trending';
  
  const cached = apiCache.get<AnimeMetadata[]>(cacheKey);
  if (cached) {
    return cached;
  }

  if (!await rateLimiter.checkLimit('anilist')) {
    await rateLimiter.waitForLimit('anilist');
  }

  const graphqlQuery = `
    query {
      Page(page: 1, perPage: 20) {
        media(type: ANIME, sort: TRENDING_DESC) {
          id
          idMal
          title {
            romaji
            english
            native
          }
          coverImage {
            large
          }
          bannerImage
          episodes
          genres
          format
          status
          description
          averageScore
          season
          seasonYear
          studios(isMain: true) {
            nodes {
              name
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetchWithRetry(ANILIST_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: graphqlQuery }),
    });

    const { data } = await response.json();
    const results = data?.Page?.media || [];

    apiCache.set(cacheKey, results, CACHE_TTL);

    return results;
  } catch (error) {
    console.error('AniList API error:', error);
    return [];
  }
}

export async function getAnimeById(id: number): Promise<AnimeMetadata | null> {
  const cacheKey = `anilist:anime:${id}`;
  
  const cached = apiCache.get<AnimeMetadata>(cacheKey);
  if (cached) {
    return cached;
  }

  if (!await rateLimiter.checkLimit('anilist')) {
    await rateLimiter.waitForLimit('anilist');
  }

  const graphqlQuery = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        id
        idMal
        title {
          romaji
          english
          native
        }
        coverImage {
          large
        }
        bannerImage
        episodes
        genres
        format
        status
        description
        averageScore
        season
        seasonYear
        studios(isMain: true) {
          nodes {
            name
          }
        }
      }
    }
  `;

  try {
    const response = await fetchWithRetry(ANILIST_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: graphqlQuery,
        variables: { id },
      }),
    });

    const { data } = await response.json();
    const result = data?.Media || null;

    if (result) {
      apiCache.set(cacheKey, result, CACHE_TTL);
    }

    return result;
  } catch (error) {
    console.error('AniList API error:', error);
    return null;
  }
}
