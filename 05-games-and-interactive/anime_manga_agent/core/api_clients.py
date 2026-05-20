"""
API Clients for Anime/Manga Data Sources
========================================

This module provides robust API clients for:
- Jikan API (MyAnimeList data)
- AniChart API (Seasonal charts)
- AniList GraphQL API

Author: AnimeManga Agent System
"""

import asyncio
import aiohttp
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from dataclasses import dataclass
import json
import logging

logger = logging.getLogger(__name__)


# ============================================================================
# RATE LIMITER
# ============================================================================

class RateLimiter:
    """Rate limiter for API requests"""
    
    def __init__(self, requests_per_second: float = 1.0):
        self.requests_per_second = requests_per_second
        self.min_interval = 1.0 / requests_per_second
        self.last_request_time: Optional[datetime] = None
    
    async def wait(self):
        """Wait if necessary to respect rate limits"""
        if self.last_request_time:
            elapsed = (datetime.now() - self.last_request_time).total_seconds()
            if elapsed < self.min_interval:
                await asyncio.sleep(self.min_interval - elapsed)
        self.last_request_time = datetime.now()


# ============================================================================
# CACHE SYSTEM
# ============================================================================

@dataclass
class CacheEntry:
    """Cache entry with expiration"""
    data: Any
    expires_at: datetime
    
    def is_expired(self) -> bool:
        return datetime.now() > self.expires_at


class APICache:
    """Simple in-memory cache for API responses"""
    
    def __init__(self, default_ttl_seconds: int = 3600):
        self.cache: Dict[str, CacheEntry] = {}
        self.default_ttl = default_ttl_seconds
    
    def get(self, key: str) -> Optional[Any]:
        """Get cached value if not expired"""
        if key in self.cache:
            entry = self.cache[key]
            if not entry.is_expired():
                return entry.data
            else:
                del self.cache[key]
        return None
    
    def set(self, key: str, data: Any, ttl_seconds: Optional[int] = None):
        """Set cache value with TTL"""
        ttl = ttl_seconds or self.default_ttl
        self.cache[key] = CacheEntry(
            data=data,
            expires_at=datetime.now() + timedelta(seconds=ttl)
        )
    
    def clear(self):
        """Clear all cache"""
        self.cache.clear()


# ============================================================================
# JIKAN API CLIENT
# ============================================================================

class JikanClient:
    """
    Jikan API v4 Client for MyAnimeList data
    
    Documentation: https://docs.api.jikan.moe/
    """
    
    BASE_URL = "https://api.jikan.moe/v4"
    
    def __init__(self, cache_ttl: int = 3600):
        self.rate_limiter = RateLimiter(requests_per_second=0.5)  # Jikan has strict limits
        self.cache = APICache(default_ttl_seconds=cache_ttl)
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def _get_session(self) -> aiohttp.ClientSession:
        """Get or create aiohttp session"""
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession(
                headers={"Accept": "application/json"}
            )
        return self.session
    
    async def close(self):
        """Close the session"""
        if self.session and not self.session.closed:
            await self.session.close()
    
    async def _request(self, endpoint: str, params: Dict = None) -> Dict:
        """Make API request with caching and rate limiting"""
        # Filter out None values before serialising to avoid sort_keys TypeError
        clean_params = {k: v for k, v in (params or {}).items() if v is not None}
        cache_key = f"{endpoint}:{json.dumps(clean_params, sort_keys=True)}"
        
        # Check cache first
        cached = self.cache.get(cache_key)
        if cached:
            logger.debug(f"Cache hit for {endpoint}")
            return cached
        
        # Rate limit
        await self.rate_limiter.wait()
        
        try:
            session = await self._get_session()
            url = f"{self.BASE_URL}{endpoint}"
            
            async with session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    self.cache.set(cache_key, data)
                    return data
                elif response.status == 429:
                    # Rate limited - wait and retry
                    logger.warning("Rate limited by Jikan API, waiting...")
                    await asyncio.sleep(2)
                    return await self._request(endpoint, params)
                else:
                    logger.error(f"Jikan API error: {response.status}")
                    return {"error": f"HTTP {response.status}", "data": None}
        except Exception as e:
            logger.error(f"Jikan API request failed: {e}")
            return {"error": str(e), "data": None}
    
    # =========================================================================
    # ANIME ENDPOINTS
    # =========================================================================
    
    async def get_anime(self, mal_id: int) -> Dict:
        """Get anime by MAL ID"""
        return await self._request(f"/anime/{mal_id}")
    
    async def get_anime_full(self, mal_id: int) -> Dict:
        """Get full anime details"""
        return await self._request(f"/anime/{mal_id}/full")
    
    async def search_anime(self, query: str, limit: int = 25, **filters) -> Dict:
        """
        Search for anime
        
        Filters can include:
        - type: tv, movie, ova, special, ona, music
        - score: minimum score
        - status: airing, complete, upcoming
        - rating: g, pg, pg13, r17, r, rx
        - genres: comma-separated genre IDs
        - order_by: mal_id, title, start_date, end_date, episodes, score, etc.
        - sort: desc, asc
        """
        params = {"q": query, "limit": limit, **filters}
        return await self._request("/anime", params)
    
    async def get_top_anime(self, filter_type: str = None, limit: int = 25, page: int = 1) -> Dict:
        """
        Get top anime
        
        filter_type options:
        - airing: Top airing anime
        - upcoming: Top upcoming anime
        - bypopularity: Top anime by popularity
        - favorite: Top favorited anime
        """
        params = {"limit": limit, "page": page}
        if filter_type:
            params["filter"] = filter_type
        return await self._request("/top/anime", params)
    
    async def get_anime_characters(self, mal_id: int) -> Dict:
        """Get anime characters"""
        return await self._request(f"/anime/{mal_id}/characters")
    
    async def get_anime_recommendations(self, mal_id: int) -> Dict:
        """Get anime recommendations based on MAL ID"""
        return await self._request(f"/anime/{mal_id}/recommendations")
    
    async def get_anime_reviews(self, mal_id: int) -> Dict:
        """Get anime reviews"""
        return await self._request(f"/anime/{mal_id}/reviews")
    
    async def get_anime_relations(self, mal_id: int) -> Dict:
        """Get related anime (sequels, prequels, etc.)"""
        return await self._request(f"/anime/{mal_id}/relations")
    
    async def get_anime_streaming(self, mal_id: int) -> Dict:
        """Get streaming links for anime"""
        return await self._request(f"/anime/{mal_id}/streaming")
    
    # =========================================================================
    # SEASONAL ENDPOINTS
    # =========================================================================
    
    async def get_season_now(self) -> Dict:
        """Get current season anime"""
        return await self._request("/seasons/now")
    
    async def get_season(self, year: int, season: str) -> Dict:
        """
        Get anime by season
        
        season: winter, spring, summer, fall
        """
        return await self._request(f"/seasons/{year}/{season}")
    
    async def get_season_upcoming(self) -> Dict:
        """Get upcoming season anime"""
        return await self._request("/seasons/upcoming")
    
    async def get_seasons_list(self) -> Dict:
        """Get list of available seasons"""
        return await self._request("/seasons")
    
    # =========================================================================
    # MANGA ENDPOINTS
    # =========================================================================
    
    async def get_manga(self, mal_id: int) -> Dict:
        """Get manga by MAL ID"""
        return await self._request(f"/manga/{mal_id}")
    
    async def search_manga(self, query: str, limit: int = 25, **filters) -> Dict:
        """Search for manga"""
        params = {"q": query, "limit": limit, **filters}
        return await self._request("/manga", params)
    
    async def get_top_manga(self, filter_type: str = None, limit: int = 25) -> Dict:
        """Get top manga"""
        params = {"limit": limit}
        if filter_type:
            params["filter"] = filter_type
        return await self._request("/top/manga", params)
    
    async def get_manga_recommendations(self, mal_id: int) -> Dict:
        """Get manga recommendations"""
        return await self._request(f"/manga/{mal_id}/recommendations")
    
    # =========================================================================
    # GENRE ENDPOINTS
    # =========================================================================
    
    async def get_anime_genres(self) -> Dict:
        """Get list of anime genres"""
        return await self._request("/genres/anime")
    
    async def get_manga_genres(self) -> Dict:
        """Get list of manga genres"""
        return await self._request("/genres/manga")
    
    # =========================================================================
    # SCHEDULE ENDPOINTS
    # =========================================================================
    
    async def get_schedules(self, day: str = None) -> Dict:
        """
        Get anime schedules
        
        day: monday, tuesday, wednesday, thursday, friday, saturday, sunday, unknown
        """
        params = {}
        if day:
            params["filter"] = day
        return await self._request("/schedules", params)
    
    # =========================================================================
    # RANDOM ENDPOINTS
    # =========================================================================
    
    async def get_random_anime(self) -> Dict:
        """Get random anime"""
        return await self._request("/random/anime")
    
    async def get_random_manga(self) -> Dict:
        """Get random manga"""
        return await self._request("/random/manga")


# ============================================================================
# ANILIST GRAPHQL CLIENT
# ============================================================================

class AniListClient:
    """
    AniList GraphQL API Client
    
    Documentation: https://anilist.gitbook.io/anilist-apiv2-docs/
    """
    
    BASE_URL = "https://graphql.anilist.co"
    
    def __init__(self, cache_ttl: int = 3600):
        self.rate_limiter = RateLimiter(requests_per_second=1.0)
        self.cache = APICache(default_ttl_seconds=cache_ttl)
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def _get_session(self) -> aiohttp.ClientSession:
        """Get or create aiohttp session"""
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession(
                headers={
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            )
        return self.session
    
    async def close(self):
        """Close the session"""
        if self.session and not self.session.closed:
            await self.session.close()
    
    async def _query(self, query: str, variables: Dict = None) -> Dict:
        """Execute GraphQL query"""
        cache_key = f"anilist:{hash(query)}:{json.dumps(variables or {}, sort_keys=True)}"
        
        # Check cache
        cached = self.cache.get(cache_key)
        if cached:
            return cached
        
        await self.rate_limiter.wait()
        
        try:
            session = await self._get_session()
            payload = {"query": query}
            if variables:
                payload["variables"] = variables
            
            async with session.post(self.BASE_URL, json=payload) as response:
                if response.status == 200:
                    data = await response.json()
                    self.cache.set(cache_key, data)
                    return data
                else:
                    return {"error": f"HTTP {response.status}", "data": None}
        except Exception as e:
            logger.error(f"AniList API request failed: {e}")
            return {"error": str(e), "data": None}
    
    async def get_trending_anime(self, page: int = 1, per_page: int = 25) -> Dict:
        """Get trending anime"""
        query = """
        query ($page: Int, $perPage: Int) {
            Page(page: $page, perPage: $perPage) {
                media(type: ANIME, sort: TRENDING_DESC) {
                    id
                    title {
                        romaji
                        english
                        native
                    }
                    description
                    episodes
                    status
                    averageScore
                    popularity
                    genres
                    coverImage {
                        large
                    }
                    seasonYear
                    season
                }
            }
        }
        """
        return await self._query(query, {"page": page, "perPage": per_page})
    
    async def get_seasonal_anime(self, year: int, season: str, page: int = 1) -> Dict:
        """Get anime by season"""
        query = """
        query ($season: MediaSeason, $seasonYear: Int, $page: Int) {
            Page(page: $page, perPage: 50) {
                media(type: ANIME, season: $season, seasonYear: $seasonYear, sort: POPULARITY_DESC) {
                    id
                    title {
                        romaji
                        english
                    }
                    description
                    episodes
                    status
                    averageScore
                    popularity
                    genres
                    coverImage {
                        large
                    }
                }
            }
        }
        """
        season_map = {
            "winter": "WINTER",
            "spring": "SPRING", 
            "summer": "SUMMER",
            "fall": "FALL"
        }
        return await self._query(query, {
            "season": season_map.get(season.lower(), "WINTER"),
            "seasonYear": year,
            "page": page
        })
    
    async def search_anime(self, search: str, page: int = 1) -> Dict:
        """Search for anime"""
        query = """
        query ($search: String, $page: Int) {
            Page(page: $page, perPage: 25) {
                media(type: ANIME, search: $search) {
                    id
                    title {
                        romaji
                        english
                        native
                    }
                    description
                    episodes
                    status
                    averageScore
                    genres
                    coverImage {
                        large
                    }
                }
            }
        }
        """
        return await self._query(query, {"search": search, "page": page})
    
    async def get_anime_details(self, anime_id: int) -> Dict:
        """Get detailed anime information"""
        query = """
        query ($id: Int) {
            Media(id: $id, type: ANIME) {
                id
                title {
                    romaji
                    english
                    native
                }
                description
                episodes
                duration
                status
                averageScore
                popularity
                genres
                tags {
                    name
                    rank
                }
                studios {
                    nodes {
                        name
                    }
                }
                characters(sort: ROLE) {
                    nodes {
                        name {
                            full
                        }
                    }
                }
                recommendations {
                    nodes {
                        mediaRecommendation {
                            id
                            title {
                                romaji
                            }
                        }
                    }
                }
                externalLinks {
                    site
                    url
                }
                coverImage {
                    large
                }
                bannerImage
                seasonYear
                season
            }
        }
        """
        return await self._query(query, {"id": anime_id})
    
    async def get_recommendations(self, anime_id: int) -> Dict:
        """Get recommendations for an anime"""
        query = """
        query ($id: Int) {
            Media(id: $id, type: ANIME) {
                recommendations(sort: RATING_DESC) {
                    nodes {
                        rating
                        mediaRecommendation {
                            id
                            title {
                                romaji
                                english
                            }
                            averageScore
                            genres
                            coverImage {
                                large
                            }
                        }
                    }
                }
            }
        }
        """
        return await self._query(query, {"id": anime_id})


# ============================================================================
# UNIFIED API MANAGER
# ============================================================================

class AnimeAPIManager:
    """
    Unified manager for all anime/manga API clients
    
    Provides a single interface to query multiple sources
    """
    
    def __init__(self):
        self.jikan = JikanClient()
        self.anilist = AniListClient()
    
    async def close(self):
        """Close all API sessions"""
        await self.jikan.close()
        await self.anilist.close()
    
    async def search_anime(self, query: str, source: str = "jikan") -> Dict:
        """Search anime from specified source"""
        if source == "anilist":
            return await self.anilist.search_anime(query)
        return await self.jikan.search_anime(query)
    
    async def get_trending(self, source: str = "anilist") -> Dict:
        """Get trending anime"""
        if source == "jikan":
            return await self.jikan.get_top_anime(filter_type="airing")
        return await self.anilist.get_trending_anime()
    
    async def get_seasonal(self, year: int = None, season: str = None, source: str = "jikan") -> Dict:
        """Get seasonal anime"""
        if not year or not season:
            if source == "anilist":
                # Get current season
                now = datetime.now()
                year = now.year
                month = now.month
                if month in [1, 2, 3]:
                    season = "winter"
                elif month in [4, 5, 6]:
                    season = "spring"
                elif month in [7, 8, 9]:
                    season = "summer"
                else:
                    season = "fall"
                return await self.anilist.get_seasonal_anime(year, season)
            return await self.jikan.get_season_now()
        
        if source == "anilist":
            return await self.anilist.get_seasonal_anime(year, season)
        return await self.jikan.get_season(year, season)
    
    async def get_recommendations(self, mal_id: int = None, anilist_id: int = None) -> Dict:
        """Get recommendations for an anime"""
        if anilist_id:
            return await self.anilist.get_recommendations(anilist_id)
        if mal_id:
            return await self.jikan.get_anime_recommendations(mal_id)
        return {"error": "No ID provided", "data": None}
    
    async def get_anime_details(self, mal_id: int = None, anilist_id: int = None) -> Dict:
        """Get detailed anime information"""
        if anilist_id:
            return await self.anilist.get_anime_details(anilist_id)
        if mal_id:
            return await self.jikan.get_anime_full(mal_id)
        return {"error": "No ID provided", "data": None}
    
    async def get_streaming_links(self, mal_id: int) -> Dict:
        """Get streaming links for anime"""
        return await self.jikan.get_anime_streaming(mal_id)
    
    async def get_random_anime(self) -> Dict:
        """Get a random anime"""
        return await self.jikan.get_random_anime()
    
    async def get_schedules(self, day: str = None) -> Dict:
        """Get anime schedules"""
        return await self.jikan.get_schedules(day)


# ============================================================================
# ANICHART CLIENT (alias for AniList — AniChart uses AniList's GraphQL API)
# ============================================================================

class AniChartClient(AniListClient):
    """
    AniChart API Client
    
    AniChart (https://anichart.net) is a seasonal anime chart that uses the
    AniList GraphQL API as its data source.  This client extends AniListClient
    with convenience methods tailored for airing/seasonal data.
    
    No API key is required.
    """

    async def get_current_season_airing(self, page: int = 1, per_page: int = 50) -> Dict:
        """
        Get currently airing anime for the current season with full airing schedule.
        Equivalent to what AniChart displays on its main page.
        """
        now = datetime.now()
        month = now.month
        if month in [1, 2, 3]:
            season = "WINTER"
        elif month in [4, 5, 6]:
            season = "SPRING"
        elif month in [7, 8, 9]:
            season = "SUMMER"
        else:
            season = "FALL"

        query = """
        query ($season: MediaSeason, $seasonYear: Int, $page: Int, $perPage: Int) {
            Page(page: $page, perPage: $perPage) {
                pageInfo { total currentPage lastPage hasNextPage }
                media(
                    type: ANIME,
                    season: $season,
                    seasonYear: $seasonYear,
                    sort: POPULARITY_DESC,
                    isAdult: false
                ) {
                    id
                    idMal
                    title { romaji english native }
                    description(asHtml: false)
                    episodes
                    duration
                    status
                    format
                    averageScore
                    popularity
                    trending
                    genres
                    studios(isMain: true) { nodes { name } }
                    coverImage { extraLarge large color }
                    bannerImage
                    season
                    seasonYear
                    startDate { year month day }
                    nextAiringEpisode { airingAt timeUntilAiring episode }
                    externalLinks { site url type language }
                    trailer { id site thumbnail }
                    siteUrl
                }
            }
        }
        """
        return await self._query(query, {
            "season": season,
            "seasonYear": now.year,
            "page": page,
            "perPage": per_page
        })

    async def get_season_chart(self, year: int, season: str,
                               page: int = 1, per_page: int = 50) -> Dict:
        """
        Get the full AniChart-style seasonal chart for any season/year.
        
        season: winter | spring | summer | fall
        """
        season_map = {
            "winter": "WINTER", "spring": "SPRING",
            "summer": "SUMMER", "fall": "FALL"
        }
        query = """
        query ($season: MediaSeason, $seasonYear: Int, $page: Int, $perPage: Int) {
            Page(page: $page, perPage: $perPage) {
                pageInfo { total currentPage lastPage hasNextPage }
                media(
                    type: ANIME,
                    season: $season,
                    seasonYear: $seasonYear,
                    sort: POPULARITY_DESC,
                    isAdult: false
                ) {
                    id
                    idMal
                    title { romaji english native }
                    description(asHtml: false)
                    episodes
                    duration
                    status
                    format
                    averageScore
                    meanScore
                    popularity
                    trending
                    favourites
                    genres
                    tags { name rank isMediaSpoiler }
                    studios(isMain: true) { nodes { id name siteUrl } }
                    coverImage { extraLarge large medium color }
                    bannerImage
                    season
                    seasonYear
                    startDate { year month day }
                    endDate { year month day }
                    nextAiringEpisode { airingAt timeUntilAiring episode }
                    airingSchedule(notYetAired: true) {
                        nodes { airingAt timeUntilAiring episode }
                    }
                    externalLinks { site url type language }
                    trailer { id site thumbnail }
                    siteUrl
                    isAdult
                }
            }
        }
        """
        return await self._query(query, {
            "season": season_map.get(season.lower(), "WINTER"),
            "seasonYear": year,
            "page": page,
            "perPage": per_page
        })


# ============================================================================
# FACTORY FUNCTION
# ============================================================================

def create_api_manager() -> AnimeAPIManager:
    """Create and return a new API manager instance"""
    return AnimeAPIManager()


def create_anichart_client() -> AniChartClient:
    """Create and return a new AniChart client instance"""
    return AniChartClient()


# ============================================================================
# USAGE EXAMPLE
# ============================================================================

async def main():
    """Example usage of API clients"""
    manager = create_api_manager()
    
    try:
        # Search for anime
        print("Searching for 'Attack on Titan'...")
        results = await manager.search_anime("Attack on Titan")
        if "data" in results and results["data"]:
            for anime in results["data"][:3]:
                print(f"  - {anime.get('title', 'Unknown')}")
        
        # Get trending
        print("\nGetting trending anime...")
        trending = await manager.get_trending()
        if "data" in trending:
            page = trending["data"].get("Page", {})
            media = page.get("media", [])
            for anime in media[:5]:
                title = anime.get("title", {}).get("romaji", "Unknown")
                score = anime.get("averageScore", "N/A")
                print(f"  - {title} (Score: {score})")
        
        # Get current season
        print("\nGetting current season...")
        seasonal = await manager.get_seasonal()
        if "data" in seasonal and seasonal["data"]:
            for anime in seasonal["data"][:5]:
                print(f"  - {anime.get('title', 'Unknown')}")
        
    finally:
        await manager.close()


if __name__ == "__main__":
    asyncio.run(main())
