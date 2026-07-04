
import { useState, useEffect } from 'react';
import { MediaItem } from '../types';

export const useAniList = (query: string, enabled: boolean, mode: 'search' | 'seasonal' = 'search') => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const fetchAniList = async () => {
      setLoading(true);
      
      // Standard Search Query
      const searchQuery = `
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
              nextAiringEpisode {
                episode
                timeUntilAiring
              }
              trailer {
                id
                site
              }
            }
          }
        }
      `;
      
      // Trending Query (Default)
      const trendingQuery = `
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
              nextAiringEpisode {
                episode
                timeUntilAiring
              }
              trailer {
                id
                site
              }
            }
          }
        }
      `;

      // Yearly / Seasonal Query
      const yearlyQuery = `
        query ($year: Int) {
          Page(page: 1, perPage: 30) {
            media(seasonYear: $year, type: ANIME, sort: POPULARITY_DESC) {
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
              nextAiringEpisode {
                episode
                timeUntilAiring
              }
              trailer {
                id
                site
              }
            }
          }
        }
      `;

      try {
        let queryBody = {};
        const currentYear = new Date().getFullYear();

        if (mode === 'seasonal') {
            queryBody = {
                query: yearlyQuery,
                variables: { year: currentYear }
            };
        } else {
            queryBody = {
                query: query ? searchQuery : trendingQuery,
                variables: query ? { search: query } : {}
            };
        }

        const response = await fetch('https://graphql.anilist.co', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(queryBody)
        });

        const { data } = await response.json();
        
        if (!data || !data.Page) {
            setMediaItems([]);
            return;
        }

        const items: MediaItem[] = data.Page.media.map((item: any) => ({
          id: item.id.toString(),
          malId: item.idMal,
          title: item.title.english || item.title.romaji,
          resolution: '1080p', // Still mocked as API doesn't know local file quality
          type: item.format === 'MOVIE' ? 'Movie' : 'Series',
          progress: 0,
          episodes: item.episodes || 0,
          watched: 0,
          missing: 0,
          tags: item.genres || [],
          coverImage: item.coverImage.large,
          // Extended Data Mapping
          bannerImage: item.bannerImage,
          description: item.description,
          averageScore: item.averageScore,
          status: item.status,
          season: item.season,
          seasonYear: item.seasonYear,
          studios: item.studios?.nodes?.map((s: any) => s.name) || [],
          nextAiringEpisode: item.nextAiringEpisode,
          trailer: item.trailer
        }));
        
        setMediaItems(items);
      } catch (error) {
        console.error("AniList API Error", error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchAniList, 500);
    return () => clearTimeout(debounce);
  }, [query, enabled, mode]);

  return { mediaItems, loading };
};
