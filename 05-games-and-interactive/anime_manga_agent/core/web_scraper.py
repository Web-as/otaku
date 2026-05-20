"""
Web Scraping and API Integration Module for Anime/Manga
Provides access to external anime/manga databases and streaming/reading sites
"""
import json
import time
import requests
import aiohttp
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
from enum import Enum
import xml.etree.ElementTree as ET


class ContentSource(Enum):
    """Available content sources"""
    JIKAN = "jikan"  # Jikan API (MyAnimeList)
    ANILIST = "anilist"  # AniList GraphQL
    KICKASSANIME = "kickassanime"
    GOGOANIME = "gogoanime"
    MANGAREADER = "mangareader"
    MANGAPARK = "mangapark"
    NAVER = "naver"  # Webtoons


@dataclass
class AnimeInfo:
    """Anime information structure"""
    id: str
    title: str
    title_english: Optional[str] = None
    title_japanese: Optional[str] = None
    synopsis: Optional[str] = None
    image_url: Optional[str] = None
    type: str = "TV"
    episodes: int = 0
    status: str = "Finished Airing"
    airing: bool = False
    aired_start: Optional[datetime] = None
    aired_end: Optional[datetime] = None
    duration: Optional[str] = None
    rating: str = "PG-13"
    score: float = 0.0
    scored_by: int = 0
    rank: int = 0
    popularity: int = 0
    genres: List[str] = field(default_factory=list)
    themes: List[str] = field(default_factory=list)
    studios: List[str] = field(default_factory=list)
    source: str = "Original"
    season: Optional[str] = None
    year: int = 0
    trailer_url: Optional[str] = None
    streaming_links: List[Dict[str, str]] = field(default_factory=list)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "title": self.title,
            "title_english": self.title_english,
            "title_japanese": self.title_japanese,
            "synopsis": self.synopsis,
            "image_url": self.image_url,
            "type": self.type,
            "episodes": self.episodes,
            "status": self.status,
            "airing": self.airing,
            "aired_start": self.aired_start.isoformat() if self.aired_start else None,
            "aired_end": self.aired_end.isoformat() if self.aired_end else None,
            "duration": self.duration,
            "rating": self.rating,
            "score": self.score,
            "scored_by": self.scored_by,
            "rank": self.rank,
            "popularity": self.popularity,
            "genres": self.genres,
            "themes": self.themes,
            "studios": self.studios,
            "source": self.source,
            "season": self.season,
            "year": self.year,
            "trailer_url": self.trailer_url,
            "streaming_links": self.streaming_links
        }


@dataclass
class MangaInfo:
    """Manga information structure"""
    id: str
    title: str
    title_english: Optional[str] = None
    title_japanese: Optional[str] = None
    synopsis: Optional[str] = None
    image_url: Optional[str] = None
    type: str = "Manga"
    chapters: int = 0
    volumes: int = 0
    status: str = "Finished"
    publishing: bool = False
    published_start: Optional[datetime] = None
    published_end: Optional[datetime] = None
    rating: str = "None"
    score: float = 0.0
    scored_by: int = 0
    rank: int = 0
    popularity: int = 0
    genres: List[str] = field(default_factory=list)
    themes: List[str] = field(default_factory=list)
    authors: List[str] = field(default_factory=list)
    serialization: Optional[str] = None
    reading_links: List[Dict[str, str]] = field(default_factory=list)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "title": self.title,
            "title_english": self.title_english,
            "title_japanese": self.title_japanese,
            "synopsis": self.synopsis,
            "image_url": self.image_url,
            "type": self.type,
            "chapters": self.chapters,
            "volumes": self.volumes,
            "status": self.status,
            "publishing": self.publishing,
            "published_start": self.published_start.isoformat() if self.published_start else None,
            "published_end": self.published_end.isoformat() if self.published_end else None,
            "rating": self.rating,
            "score": self.score,
            "scored_by": self.scored_by,
            "rank": self.rank,
            "popularity": self.popularity,
            "genres": self.genres,
            "themes": self.themes,
            "authors": self.authors,
            "serialization": self.serialization,
            "reading_links": self.reading_links
        }


@dataclass
class TrendInfo:
    """Trend information for anime/manga"""
    id: str
    title: str
    rank: int
    score: float
    popularity: int
    trend_direction: str  # "up", "down", "stable"
    trend_percent: float
    mentions: int
    timestamp: datetime
    content_type: str
    image_url: Optional[str] = None
    genres: List[str] = field(default_factory=list)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "title": self.title,
            "rank": self.rank,
            "score": self.score,
            "popularity": self.popularity,
            "trend_direction": self.trend_direction,
            "trend_percent": self.trend_percent,
            "mentions": self.mentions,
            "timestamp": self.timestamp.isoformat(),
            "content_type": self.content_type,
            "image_url": self.image_url,
            "genres": self.genres
        }


class JikanAPIClient:
    """Client for Jikan API (MyAnimeList)"""
    
    def __init__(self, config: Dict[str, Any]):
        self.base_url = config.get("jikan_base_url", "https://api.jikan.moe/v4")
        self.request_timeout = config.get("request_timeout_seconds", 30)
        self.max_retries = config.get("retry_attempts", 3)
        self.retry_delay = config.get("retry_delay_seconds", 2)
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": config.get("user_agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        })
    
    def _make_request(self, endpoint: str, params: Dict[str, Any] = None) -> Optional[Dict[str, Any]]:
        """Make API request with retry logic"""
        url = f"{self.base_url}/{endpoint}"
        
        for attempt in range(self.max_retries):
            try:
                response = self.session.get(url, params=params, timeout=self.request_timeout)
                response.raise_for_status()
                return response.json()
            except requests.exceptions.RequestException as e:
                if attempt < self.max_retries - 1:
                    time.sleep(self.retry_delay * (attempt + 1))
                else:
                    return None
        return None
    
    def search_anime(self, query: str, limit: int = 25) -> List[AnimeInfo]:
        """Search for anime by query"""
        data = self._make_request("anime", {"q": query, "limit": limit})
        if data and "data" in data:
            return [self._parse_anime(anime_data) for anime_data in data["data"]]
        return []
    
    def get_anime(self, anime_id: str) -> Optional[AnimeInfo]:
        """Get anime details by ID"""
        data = self._make_request(f"anime/{anime_id}/full")
        if data and "data" in data:
            return self._parse_anime(data["data"])
        return None
    
    def get_top_anime(self, limit: int = 25, filter_type: str = "anime") -> List[AnimeInfo]:
        """Get top anime"""
        data = self._make_request("top/anime", {"limit": limit})
        if data and "data" in data:
            return [self._parse_anime(anime_data) for anime_data in data["data"]]
        return []
    
    def get_seasonal_anime(self, year: int, season: str) -> List[AnimeInfo]:
        """Get anime for specific season"""
        data = self._make_request(f"seasons/{year}/{season}")
        if data and "data" in data:
            return [self._parse_anime(anime_data) for anime_data in data["data"]]
        return []
    
    def get_current_season(self) -> List[AnimeInfo]:
        """Get current season anime"""
        data = self._make_request("seasons/now")
        if data and "data" in data:
            return [self._parse_anime(anime_data) for anime_data in data["data"]]
        return []
    
    def get_recommendations(self, anime_id: str, limit: int = 10) -> List[AnimeInfo]:
        """Get anime recommendations"""
        data = self._make_request(f"anime/{anime_id}/recommendations")
        if data and "data" in data:
            return [self._parse_anime(anime_data["entry"]) for anime_data in data["data"][:limit]]
        return []
    
    def get_anime_by_genre(self, genre_id: int, limit: int = 25) -> List[AnimeInfo]:
        """Get anime by genre ID"""
        data = self._make_request("anime", {"genres": str(genre_id), "limit": limit})
        if data and "data" in data:
            return [self._parse_anime(anime_data) for anime_data in data["data"]]
        return []
    
    def search_manga(self, query: str, limit: int = 25) -> List[MangaInfo]:
        """Search for manga by query"""
        data = self._make_request("manga", {"q": query, "limit": limit})
        if data and "data" in data:
            return [self._parse_manga(manga_data) for manga_data in data["data"]]
        return []
    
    def get_manga(self, manga_id: str) -> Optional[MangaInfo]:
        """Get manga details by ID"""
        data = self._make_request(f"manga/{manga_id}/full")
        if data and "data" in data:
            return self._parse_manga(data["data"])
        return None
    
    def get_top_manga(self, limit: int = 25) -> List[MangaInfo]:
        """Get top manga"""
        data = self._make_request("top/manga", {"limit": limit})
        if data and "data" in data:
            return [self._parse_manga(manga_data) for manga_data in data["data"]]
        return []
    
    def get_manga_recommendations(self, manga_id: str, limit: int = 10) -> List[MangaInfo]:
        """Get manga recommendations"""
        data = self._make_request(f"manga/{manga_id}/recommendations")
        if data and "data" in data:
            return [self._parse_manga(manga_data["entry"]) for manga_data in data["data"][:limit]]
        return []
    
    def _parse_anime(self, data: Dict[str, Any]) -> AnimeInfo:
        """Parse anime data from API response"""
        images = data.get("images", {}).get("jpg", {})
        
        # Parse dates
        aired = data.get("aired", {})
        aired_start = None
        aired_end = None
        if aired.get("from"):
            try:
                aired_start = datetime.fromisoformat(aired["from"].replace("Z", "+00:00"))
            except:
                pass
        if aired.get("to"):
            try:
                aired_end = datetime.fromisoformat(aired["to"].replace("Z", "+00:00"))
            except:
                pass
        
        return AnimeInfo(
            id=str(data.get("mal_id", "")),
            title=data.get("title", ""),
            title_english=data.get("title_english"),
            title_japanese=data.get("title_japanese"),
            synopsis=data.get("synopsis"),
            image_url=images.get("image_url"),
            type=data.get("type", "TV"),
            episodes=data.get("episodes", 0),
            status=data.get("status", "Finished Airing"),
            airing=data.get("airing", False),
            aired_start=aired_start,
            aired_end=aired_end,
            duration=data.get("duration"),
            rating=data.get("rating", "PG-13"),
            score=data.get("score", 0.0),
            scored_by=data.get("scored_by", 0),
            rank=data.get("rank", 0),
            popularity=data.get("popularity", 0),
            genres=[g["name"] for g in data.get("genres", [])],
            themes=[t["name"] for t in data.get("themes", [])],
            studios=[s["name"] for s in data.get("studios", [])],
            source=data.get("source", "Original"),
            season=data.get("season"),
            year=data.get("year", 0),
            trailer_url=data.get("trailer", {}).get("url")
        )
    
    def _parse_manga(self, data: Dict[str, Any]) -> MangaInfo:
        """Parse manga data from API response"""
        images = data.get("images", {}).get("jpg", {})
        
        # Parse dates
        published = data.get("published", {})
        published_start = None
        published_end = None
        if published.get("from"):
            try:
                published_start = datetime.fromisoformat(published["from"].replace("Z", "+00:00"))
            except:
                pass
        if published.get("to"):
            try:
                published_end = datetime.fromisoformat(published["to"].replace("Z", "+00:00"))
            except:
                pass
        
        return MangaInfo(
            id=str(data.get("mal_id", "")),
            title=data.get("title", ""),
            title_english=data.get("title_english"),
            title_japanese=data.get("title_japanese"),
            synopsis=data.get("synopsis"),
            image_url=images.get("image_url"),
            type=data.get("type", "Manga"),
            chapters=data.get("chapters", 0),
            volumes=data.get("volumes", 0),
            status=data.get("status", "Finished"),
            publishing=data.get("publishing", False),
            published_start=published_start,
            published_end=published_end,
            rating=data.get("rating", "None"),
            score=data.get("score", 0.0),
            scored_by=data.get("scored_by", 0),
            rank=data.get("rank", 0),
            popularity=data.get("popularity", 0),
            genres=[g["name"] for g in data.get("genres", [])],
            themes=[t["name"] for t in data.get("themes", [])],
            authors=[a["name"] for a in data.get("authors", [])],
            serialization=data.get("serialization")
        )


class AniListAPIClient:
    """Client for AniList GraphQL API"""
    
    def __init__(self, config: Dict[str, Any]):
        self.base_url = config.get("anilist_base_url", "https://graphql.anilist.co")
        self.request_timeout = config.get("request_timeout_seconds", 30)
    
    def _make_request(self, query: str, variables: Dict[str, Any] = None) -> Optional[Dict[str, Any]]:
        """Make GraphQL request"""
        try:
            response = requests.post(
                self.base_url,
                json={"query": query, "variables": variables or {}},
                timeout=self.request_timeout
            )
            response.raise_for_status()
            data = response.json()
            return data.get("data")
        except Exception:
            return None
    
    def search_anime(self, query: str, limit: int = 25) -> List[AnimeInfo]:
        """Search for anime"""
        graphql_query = """
        query ($search: String, $limit: Int) {
            anime(search: $search, perPage: $limit, sort: SEARCH_MATCH) {
                id
                title { romaji english native }
                description
                coverImage { large medium }
                type
                episodes
                status
                duration
                startDate { year month day }
                endDate { year month day }
                averageScore
                popularity
                genres
                studios { name }
                source
                trailer { id site }
            }
        }
        """
        data = self._make_request(graphql_query, {"search": query, "limit": limit})
        if data and "anime" in data:
            return [self._parse_anime(anime) for anime in data["anime"]]
        return []
    
    def get_trending_anime(self, limit: int = 25) -> List[AnimeInfo]:
        """Get trending anime"""
        graphql_query = """
        query ($limit: Int) {
            anime(perPage: $limit, sort: TRENDING_DESC) {
                id
                title { romaji english native }
                description
                coverImage { large medium }
                type
                episodes
                status
                duration
                startDate { year month day }
                averageScore
                popularity
                genres
                studios { name }
                source
            }
        }
        """
        data = self._make_request(graphql_query, {"limit": limit})
        if data and "anime" in data:
            return [self._parse_anime(anime) for anime in data["anime"]]
        return []
    
    def get_seasonal_anime(self, year: int, season: str, limit: int = 25) -> List[AnimeInfo]:
        """Get seasonal anime"""
        graphql_query = """
        query ($season: MediaSeason, $year: Int, $limit: Int) {
            anime(season: $season, seasonYear: $year, perPage: $limit, sort: POPULARITY_DESC) {
                id
                title { romaji english native }
                description
                coverImage { large medium }
                type
                episodes
                status
                duration
                startDate { year month day }
                averageScore
                popularity
                genres
                studios { name }
                source
            }
        }
        """
        season_map = {"winter": "WINTER", "spring": "SPRING", "summer": "SUMMER", "fall": "FALL"}
        data = self._make_request(graphql_query, {"season": season_map.get(season, season.upper()), "year": year, "limit": limit})
        if data and "anime" in data:
            return [self._parse_anime(anime) for anime in data["anime"]]
        return []
    
    def get_anime_recommendations(self, anime_id: str, limit: int = 10) -> List[AnimeInfo]:
        """Get anime recommendations based on ID"""
        graphql_query = """
        query ($id: Int, $limit: Int) {
            media(id: $id, type: ANIME) {
                recommendations(perPage: $limit, sort: RATING_DESC) {
                    nodes {
                        mediaRecommendation {
                            id
                            title { romaji english }
                            description
                            coverImage { large }
                            type
                            episodes
                            status
                            averageScore
                            popularity
                            genres
                        }
                    }
                }
            }
        }
        """
        data = self._make_request(graphql_query, {"id": int(anime_id), "limit": limit})
        if data and "media" in data:
            recommendations = data["media"]["recommendations"]["nodes"]
            return [self._parse_anime(rec["mediaRecommendation"]) for rec in recommendations if rec.get("mediaRecommendation")]
        return []
    
    def search_manga(self, query: str, limit: int = 25) -> List[MangaInfo]:
        """Search for manga"""
        graphql_query = """
        query ($search: String, $limit: Int) {
            manga(search: $search, perPage: $limit, sort: SEARCH_MATCH) {
                id
                title { romaji english native }
                description
                coverImage { large medium }
                type
                chapters
                volumes
                status
                startDate { year month day }
                endDate { year month day }
                averageScore
                popularity
                genres
                authors { name }
                serialization
            }
        }
        """
        data = self._make_request(graphql_query, {"search": query, "limit": limit})
        if data and "manga" in data:
            return [self._parse_manga(manga) for manga in data["manga"]]
        return []
    
    def _parse_anime(self, data: Dict[str, Any]) -> AnimeInfo:
        """Parse anime data from GraphQL response"""
        title = data.get("title", {})
        
        start_date = data.get("startDate", {})
        aired_start = None
        if start_date.get("year"):
            try:
                aired_start = datetime(start_date["year"], start_date.get("month", 1), start_date.get("day", 1))
            except:
                pass
        
        cover_image = data.get("coverImage", {})
        
        return AnimeInfo(
            id=str(data.get("id", "")),
            title=title.get("romaji", ""),
            title_english=title.get("english"),
            title_japanese=title.get("native"),
            synopsis=data.get("description"),
            image_url=cover_image.get("large") or cover_image.get("medium"),
            type=data.get("type", "ANIME"),
            episodes=data.get("episodes", 0),
            status=data.get("status", "FINISHED"),
            duration=data.get("duration"),
            aired_start=aired_start,
            score=data.get("averageScore", 0.0),
            popularity=data.get("popularity", 0),
            genres=data.get("genres", []),
            studios=[s["name"] for s in data.get("studios", [])] if data.get("studios") else [],
            source=data.get("source", "ORIGINAL")
        )
    
    def _parse_manga(self, data: Dict[str, Any]) -> MangaInfo:
        """Parse manga data from GraphQL response"""
        title = data.get("title", {})
        
        start_date = data.get("startDate", {})
        published_start = None
        if start_date.get("year"):
            try:
                published_start = datetime(start_date["year"], start_date.get("month", 1), start_date.get("day", 1))
            except:
                pass
        
        cover_image = data.get("coverImage", {})
        
        return MangaInfo(
            id=str(data.get("id", "")),
            title=title.get("romaji", ""),
            title_english=title.get("english"),
            title_japanese=title.get("native"),
            synopsis=data.get("description"),
            image_url=cover_image.get("large") or cover_image.get("medium"),
            type=data.get("type", "MANGA"),
            chapters=data.get("chapters", 0),
            volumes=data.get("volumes", 0),
            status=data.get("status", "FINISHED"),
            published_start=published_start,
            score=data.get("averageScore", 0.0),
            popularity=data.get("popularity", 0),
            genres=data.get("genres", []),
            authors=[a["name"] for a in data.get("authors", [])] if data.get("authors") else [],
            serialization=data.get("serialization")
        )


class StreamingLinkFinder:
    """Find streaming/reading links for anime and manga"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
    
    def find_anime_links(self, anime_title: str, anime_id: str) -> List[Dict[str, str]]:
        """Find streaming links for anime"""
        links = []
        
        # Common anime streaming sites
        streaming_sites = [
            {
                "name": "Crunchyroll",
                "base_url": "https://www.crunchyroll.com/search",
                "search_param": "q",
                "url_template": f"https://www.crunchyroll.com/search?q={{title}}"
            },
            {
                "name": "Funimation",
                "base_url": "https://www.funimation.com/search/",
                "search_param": "q",
                "url_template": f"https://www.funimation.com/search/?q={{title}}"
            },
            {
                "name": "9anime",
                "base_url": "https://9anime.id/search",
                "search_param": "keyword",
                "url_template": f"https://9anime.id/search?keyword={{title}}"
            },
            {
                "name": "Gogoanime",
                "base_url": "https://gogoanime.so//search.html",
                "search_param": "keyword",
                "url_template": f"https://gogoanime.so/search.html?keyword={{title}}"
            },
            {
                "name": "Anime-Planet",
                "base_url": "https://www.anime-planet.com/anime/all?name",
                "search_param": "name",
                "url_template": f"https://www.anime-planet.com/anime/all?name={{title}}"
            },
            {
                "name": "MyAnimeList",
                "base_url": f"https://myanimelist.net/anime/{anime_id}",
                "search_param": "",
                "url_template": f"https://myanimelist.net/anime/{anime_id}"
            }
        ]
        
        for site in streaming_sites:
            url = site["url_template"].format(title=anime_title.replace(" ", "%20"))
            links.append({
                "site_name": site["name"],
                "url": url,
                "type": "streaming"
            })
        
        return links
    
    def find_manga_links(self, manga_title: str, manga_id: str) -> List[Dict[str, str]]:
        """Find reading links for manga"""
        links = []
        
        # Common manga reading sites
        reading_sites = [
            {
                "name": "MangaDex",
                "base_url": "https://mangadex.org/search",
                "search_param": "title",
                "url_template": f"https://mangadex.org/search/title/{{title}}"
            },
            {
                "name": "MangaPlus",
                "base_url": "https://mangaplus.shueisha.co.jp/search",
                "search_param": "title",
                "url_template": f"https://mangaplus.shueisha.co.jp/search?title={{title}}"
            },
            {
                "name": "Comixology",
                "base_url": "https://www.comixology.com/search",
                "search_param": "search",
                "url_template": f"https://www.comixology.com/search?search={{title}}"
            },
            {
                "name": "Webtoons",
                "base_url": "https://www.webtoons.com/search",
                "search_param": "search",
                "url_template": f"https://www.webtoons.com/en/search?search={{title}}"
            },
            {
                "name": "MangaRock",
                "base_url": "https://mangarock.com/search",
                "search_param": "q",
                "url_template": f"https://mangarock.com/search?q={{title}}"
            },
            {
                "name": "MyAnimeList Manga",
                "base_url": f"https://myanimelist.net/manga/{manga_id}",
                "search_param": "",
                "url_template": f"https://myanimelist.net/manga/{manga_id}"
            }
        ]
        
        for site in reading_sites:
            url = site["url_template"].format(title=manga_title.replace(" ", "%20"))
            links.append({
                "site_name": site["name"],
                "url": url,
                "type": "reading"
            })
        
        return links


class TrendTracker:
    """
    Track and analyze anime/manga trends.

    When a DatabaseManager is supplied the tracker:
    1. Looks up the previous snapshot for each title.
    2. Computes *real* rank/score/popularity deltas.
    3. Saves a fresh snapshot after every fetch so the next call can diff again.
    4. Prunes snapshots older than 7 days to keep the DB small.

    Without a DB it falls back to the original static behaviour.
    """

    def __init__(self, jikan_client: JikanAPIClient, config: Dict[str, Any], db_manager=None):
        self.jikan = jikan_client
        self.config = config
        self.db = db_manager
        self.trends: List[TrendInfo] = []

    # ------------------------------------------------------------------
    # Delta computation helpers
    # ------------------------------------------------------------------

    def _compute_trend_direction(
        self,
        content_id: str,
        content_type: str,
        current_rank: int,
        current_score: float,
        current_popularity: int,
        current_scored_by: int,
    ):
        """
        Compare current state to the last stored snapshot and return
        (direction: str, trend_percent: float).

        Direction rules (rank improvement = smaller number):
          - Rank improved by ≥ 2  OR  score rose by ≥ 0.1  → "up"
          - Rank worsened by ≥ 2  OR  score fell by ≥ 0.1  → "down"
          - Otherwise                                       → "stable"
        trend_percent is the relative change in scored_by (community engagement).
        """
        if not self.db:
            return "stable", 0.0

        prev = self.db.get_trend_snapshot(content_id, content_type)
        if not prev:
            # No prior snapshot — treat as newly tracked (positive signal)
            return "up", 5.0

        prev_rank  = prev.get("rank") or current_rank
        prev_score = prev.get("score") or current_score
        prev_sb    = prev.get("scored_by") or current_scored_by

        rank_delta  = prev_rank  - current_rank   # positive = improved
        score_delta = current_score - prev_score   # positive = improved

        if rank_delta >= 2 or score_delta >= 0.1:
            direction = "up"
        elif rank_delta <= -2 or score_delta <= -0.1:
            direction = "down"
        else:
            direction = "stable"

        # trend_percent = % change in community engagement (scored_by)
        if prev_sb > 0:
            trend_percent = round(((current_scored_by - prev_sb) / prev_sb) * 100, 1)
        else:
            trend_percent = 0.0

        return direction, trend_percent

    def _save_snapshot(self, content_id: str, content_type: str, rank: int,
                       score: float, popularity: int, scored_by: int):
        """Persist the current state as the new baseline snapshot."""
        if self.db:
            self.db.save_trend_snapshot(content_id, content_type, rank, score, popularity, scored_by)

    # ------------------------------------------------------------------
    # Main fetch
    # ------------------------------------------------------------------

    def fetch_current_trends(self) -> List[TrendInfo]:
        """
        Fetch current anime/manga trends with real delta-based direction signals.
        Snapshots are saved after building the list so the next fetch can diff.
        """
        trends = []
        now = datetime.utcnow()

        # Top anime
        top_anime = self.jikan.get_top_anime(limit=25)
        for i, anime in enumerate(top_anime):
            rank = i + 1
            direction, pct = self._compute_trend_direction(
                anime.id, "anime", rank, anime.score, anime.popularity, anime.scored_by
            )
            trends.append(TrendInfo(
                id=anime.id, title=anime.title, rank=rank,
                score=anime.score, popularity=anime.popularity,
                trend_direction=direction, trend_percent=pct,
                mentions=anime.scored_by, timestamp=now,
                content_type="anime", image_url=anime.image_url, genres=anime.genres,
            ))

        # Current season anime (rank=0 means "currently airing, unranked")
        current_season = self.jikan.get_current_season()
        for anime in current_season:
            direction, pct = self._compute_trend_direction(
                anime.id, "anime", 0, anime.score, anime.popularity, anime.scored_by
            )
            # Seasonal titles always get at least "up" since they are newly airing
            if direction == "stable":
                direction = "up"
                pct = max(pct, 5.0)
            trends.append(TrendInfo(
                id=anime.id, title=anime.title, rank=0,
                score=anime.score, popularity=anime.popularity,
                trend_direction=direction, trend_percent=pct,
                mentions=anime.scored_by, timestamp=now,
                content_type="anime", image_url=anime.image_url, genres=anime.genres,
            ))

        # Top manga
        top_manga = self.jikan.get_top_manga(limit=25)
        for i, manga in enumerate(top_manga):
            rank = i + 1
            direction, pct = self._compute_trend_direction(
                manga.id, "manga", rank, manga.score, manga.popularity, manga.scored_by
            )
            trends.append(TrendInfo(
                id=manga.id, title=manga.title, rank=rank,
                score=manga.score, popularity=manga.popularity,
                trend_direction=direction, trend_percent=pct,
                mentions=manga.scored_by, timestamp=now,
                content_type="manga", image_url=manga.image_url, genres=manga.genres,
            ))

        self.trends = trends

        # Persist fresh snapshots so next call can compute real deltas
        if self.db:
            for t in trends:
                self._save_snapshot(t.id, t.content_type, t.rank, t.score, t.popularity, t.mentions)
            # Clean up old snapshots (keep last 7 days)
            self.db.prune_old_snapshots(keep_days=7)

        return trends
    
    def get_trending_now(self, content_type: str = "anime", limit: int = 10) -> List[TrendInfo]:
        """Get trending content by type"""
        filtered = [t for t in self.trends if t.content_type == content_type]
        
        # Sort by trend direction and score
        trend_order = {"up": 0, "stable": 1, "down": 2}
        sorted_trends = sorted(filtered, key=lambda x: (trend_order[x.trend_direction], -x.score))
        
        return sorted_trends[:limit]
    
    def get_genre_trends(self, genre: str, content_type: str = "anime") -> List[TrendInfo]:
        """Get trends for specific genre"""
        return [t for t in self.trends if t.content_type == content_type and genre.lower() in [g.lower() for g in t.genres]]
