"""
Streaming and Reading Link APIs
===============================

This module provides integrations with various anime streaming and manga reading
platforms to help users find where to watch or read their favorite content.

APIs Integrated:
- Consumet API (Multi-source aggregator)
- Kitsu API (Anime/Manga database with streaming links)
- SIMKL API (Tracking with streaming availability)
- Anime-Planet API (Recommendations and streaming)
- MangaDex API (Manga reading)
- AnimePahe API (Streaming)
- GogoAnime API (Streaming)
- Zoro/Aniwatch API (Streaming)

Author: AnimeManga Agent System
"""

import asyncio
import aiohttp
from typing import Dict, List, Optional, Any
from datetime import datetime
from dataclasses import dataclass
import logging
import urllib.parse

logger = logging.getLogger(__name__)


# ============================================================================
# DATA CLASSES
# ============================================================================

@dataclass
class StreamingLink:
    """Represents a streaming/reading link"""
    site_name: str
    url: str
    quality: Optional[str] = None
    language: str = "sub"  # sub, dub, raw
    is_official: bool = False
    requires_premium: bool = False
    
    def to_dict(self) -> Dict:
        return {
            "site_name": self.site_name,
            "url": self.url,
            "quality": self.quality,
            "language": self.language,
            "is_official": self.is_official,
            "requires_premium": self.requires_premium
        }


@dataclass
class EpisodeInfo:
    """Represents episode information"""
    number: int
    title: Optional[str] = None
    url: Optional[str] = None
    thumbnail: Optional[str] = None
    
    def to_dict(self) -> Dict:
        return {
            "number": self.number,
            "title": self.title,
            "url": self.url,
            "thumbnail": self.thumbnail
        }


# ============================================================================
# CONSUMET API CLIENT
# ============================================================================

class ConsumetAPI:
    """
    Consumet API - Multi-source anime/manga aggregator
    
    Provides access to multiple streaming sources:
    - GogoAnime
    - Zoro/Aniwatch
    - AnimePahe
    - 9anime
    - And more...
    
    Documentation: https://docs.consumet.org/
    """
    
    # Public Consumet API instances
    BASE_URLS = [
        "https://api.consumet.org",
        "https://consumet-api.vercel.app",
    ]
    
    def __init__(self):
        self.base_url = self.BASE_URLS[0]
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def _get_session(self) -> aiohttp.ClientSession:
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession()
        return self.session
    
    async def close(self):
        if self.session and not self.session.closed:
            await self.session.close()
    
    async def _request(self, endpoint: str) -> Dict:
        """Make API request"""
        try:
            session = await self._get_session()
            url = f"{self.base_url}{endpoint}"
            
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=30)) as response:
                if response.status == 200:
                    return await response.json()
                return {"error": f"HTTP {response.status}"}
        except Exception as e:
            logger.error(f"Consumet API error: {e}")
            return {"error": str(e)}
    
    # =========================================================================
    # ANIME ENDPOINTS (GogoAnime)
    # =========================================================================
    
    async def search_anime_gogoanime(self, query: str) -> Dict:
        """Search anime on GogoAnime"""
        encoded = urllib.parse.quote(query)
        return await self._request(f"/anime/gogoanime/{encoded}")
    
    async def get_anime_info_gogoanime(self, anime_id: str) -> Dict:
        """Get anime info from GogoAnime"""
        return await self._request(f"/anime/gogoanime/info/{anime_id}")
    
    async def get_episode_sources_gogoanime(self, episode_id: str) -> Dict:
        """Get streaming sources for an episode"""
        return await self._request(f"/anime/gogoanime/watch/{episode_id}")
    
    # =========================================================================
    # ANIME ENDPOINTS (Zoro/Aniwatch)
    # =========================================================================
    
    async def search_anime_zoro(self, query: str) -> Dict:
        """Search anime on Zoro/Aniwatch"""
        encoded = urllib.parse.quote(query)
        return await self._request(f"/anime/zoro/{encoded}")
    
    async def get_anime_info_zoro(self, anime_id: str) -> Dict:
        """Get anime info from Zoro"""
        return await self._request(f"/anime/zoro/info?id={anime_id}")
    
    async def get_episode_sources_zoro(self, episode_id: str) -> Dict:
        """Get streaming sources from Zoro"""
        return await self._request(f"/anime/zoro/watch?episodeId={episode_id}")
    
    # =========================================================================
    # ANIME ENDPOINTS (AnimePahe)
    # =========================================================================
    
    async def search_anime_animepahe(self, query: str) -> Dict:
        """Search anime on AnimePahe"""
        encoded = urllib.parse.quote(query)
        return await self._request(f"/anime/animepahe/{encoded}")
    
    async def get_anime_info_animepahe(self, anime_id: str) -> Dict:
        """Get anime info from AnimePahe"""
        return await self._request(f"/anime/animepahe/info/{anime_id}")
    
    # =========================================================================
    # MANGA ENDPOINTS (MangaDex)
    # =========================================================================
    
    async def search_manga_mangadex(self, query: str) -> Dict:
        """Search manga on MangaDex"""
        encoded = urllib.parse.quote(query)
        return await self._request(f"/manga/mangadex/{encoded}")
    
    async def get_manga_info_mangadex(self, manga_id: str) -> Dict:
        """Get manga info from MangaDex"""
        return await self._request(f"/manga/mangadex/info/{manga_id}")
    
    async def get_chapter_pages_mangadex(self, chapter_id: str) -> Dict:
        """Get chapter pages from MangaDex"""
        return await self._request(f"/manga/mangadex/read/{chapter_id}")
    
    # =========================================================================
    # MANGA ENDPOINTS (MangaReader)
    # =========================================================================
    
    async def search_manga_mangareader(self, query: str) -> Dict:
        """Search manga on MangaReader"""
        encoded = urllib.parse.quote(query)
        return await self._request(f"/manga/mangareader/{encoded}")
    
    async def get_manga_info_mangareader(self, manga_id: str) -> Dict:
        """Get manga info from MangaReader"""
        return await self._request(f"/manga/mangareader/info/{manga_id}")


# ============================================================================
# KITSU API CLIENT
# ============================================================================

class KitsuAPI:
    """
    Kitsu API - Anime/Manga database with streaming links
    
    Documentation: https://kitsu.docs.apiary.io/
    """
    
    BASE_URL = "https://kitsu.io/api/edge"
    
    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def _get_session(self) -> aiohttp.ClientSession:
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession(
                headers={
                    "Accept": "application/vnd.api+json",
                    "Content-Type": "application/vnd.api+json"
                }
            )
        return self.session
    
    async def close(self):
        if self.session and not self.session.closed:
            await self.session.close()
    
    async def _request(self, endpoint: str, params: Dict = None) -> Dict:
        """Make API request"""
        try:
            session = await self._get_session()
            url = f"{self.BASE_URL}{endpoint}"
            
            async with session.get(url, params=params) as response:
                if response.status == 200:
                    return await response.json()
                return {"error": f"HTTP {response.status}"}
        except Exception as e:
            logger.error(f"Kitsu API error: {e}")
            return {"error": str(e)}
    
    async def search_anime(self, query: str, limit: int = 20) -> Dict:
        """Search for anime"""
        return await self._request("/anime", {
            "filter[text]": query,
            "page[limit]": limit
        })
    
    async def search_manga(self, query: str, limit: int = 20) -> Dict:
        """Search for manga"""
        return await self._request("/manga", {
            "filter[text]": query,
            "page[limit]": limit
        })
    
    async def get_anime(self, anime_id: str) -> Dict:
        """Get anime by ID"""
        return await self._request(f"/anime/{anime_id}")
    
    async def get_manga(self, manga_id: str) -> Dict:
        """Get manga by ID"""
        return await self._request(f"/manga/{manga_id}")
    
    async def get_trending_anime(self) -> Dict:
        """Get trending anime"""
        return await self._request("/trending/anime")
    
    async def get_trending_manga(self) -> Dict:
        """Get trending manga"""
        return await self._request("/trending/manga")
    
    async def get_anime_streaming_links(self, anime_id: str) -> Dict:
        """Get streaming links for anime"""
        return await self._request(f"/anime/{anime_id}/streaming-links")
    
    async def get_anime_episodes(self, anime_id: str) -> Dict:
        """Get episodes for anime"""
        return await self._request(f"/anime/{anime_id}/episodes")


# ============================================================================
# MANGADEX API CLIENT (Direct)
# ============================================================================

class MangaDexAPI:
    """
    MangaDex API - Free manga reading platform
    
    Documentation: https://api.mangadex.org/docs/
    """
    
    BASE_URL = "https://api.mangadex.org"
    
    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def _get_session(self) -> aiohttp.ClientSession:
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession()
        return self.session
    
    async def close(self):
        if self.session and not self.session.closed:
            await self.session.close()
    
    async def _request(self, endpoint: str, params: Dict = None) -> Dict:
        """Make API request"""
        try:
            session = await self._get_session()
            url = f"{self.BASE_URL}{endpoint}"
            
            async with session.get(url, params=params) as response:
                if response.status == 200:
                    return await response.json()
                return {"error": f"HTTP {response.status}"}
        except Exception as e:
            logger.error(f"MangaDex API error: {e}")
            return {"error": str(e)}
    
    async def search_manga(self, title: str, limit: int = 25) -> Dict:
        """Search for manga"""
        return await self._request("/manga", {
            "title": title,
            "limit": limit,
            "includes[]": ["cover_art", "author", "artist"]
        })
    
    async def get_manga(self, manga_id: str) -> Dict:
        """Get manga details"""
        return await self._request(f"/manga/{manga_id}", {
            "includes[]": ["cover_art", "author", "artist", "tag"]
        })
    
    async def get_manga_chapters(self, manga_id: str, limit: int = 100) -> Dict:
        """Get manga chapters"""
        return await self._request(f"/manga/{manga_id}/feed", {
            "limit": limit,
            "translatedLanguage[]": ["en"],
            "order[chapter]": "asc"
        })
    
    async def get_chapter_pages(self, chapter_id: str) -> Dict:
        """Get chapter page URLs"""
        return await self._request(f"/at-home/server/{chapter_id}")
    
    async def get_popular_manga(self) -> Dict:
        """Get popular manga"""
        return await self._request("/manga", {
            "limit": 25,
            "order[followedCount]": "desc",
            "includes[]": ["cover_art"]
        })
    
    async def get_latest_updates(self) -> Dict:
        """Get latest manga updates"""
        return await self._request("/manga", {
            "limit": 25,
            "order[latestUploadedChapter]": "desc",
            "includes[]": ["cover_art"]
        })


# ============================================================================
# SIMKL API CLIENT
# ============================================================================

class SimklAPI:
    """
    SIMKL API - Tracking service with streaming availability
    
    Documentation: https://simkl.docs.apiary.io/
    """
    
    BASE_URL = "https://api.simkl.com"
    
    def __init__(self, client_id: str = None):
        self.client_id = client_id or "demo"  # Use demo for basic access
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def _get_session(self) -> aiohttp.ClientSession:
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession(
                headers={"simkl-api-key": self.client_id}
            )
        return self.session
    
    async def close(self):
        if self.session and not self.session.closed:
            await self.session.close()
    
    async def _request(self, endpoint: str, params: Dict = None) -> Dict:
        """Make API request"""
        try:
            session = await self._get_session()
            url = f"{self.BASE_URL}{endpoint}"
            
            async with session.get(url, params=params) as response:
                if response.status == 200:
                    return await response.json()
                return {"error": f"HTTP {response.status}"}
        except Exception as e:
            logger.error(f"SIMKL API error: {e}")
            return {"error": str(e)}
    
    async def search_anime(self, query: str) -> Dict:
        """Search for anime"""
        return await self._request("/search/anime", {"q": query})
    
    async def get_anime(self, simkl_id: str) -> Dict:
        """Get anime details"""
        return await self._request(f"/anime/{simkl_id}")


# ============================================================================
# OFFICIAL STREAMING LINK GENERATOR
# ============================================================================

class OfficialStreamingLinks:
    """
    Generates links to official streaming platforms
    """
    
    STREAMING_PLATFORMS = {
        "crunchyroll": {
            "name": "Crunchyroll",
            "base_url": "https://www.crunchyroll.com/search?q=",
            "is_official": True,
            "requires_premium": False
        },
        "funimation": {
            "name": "Funimation",
            "base_url": "https://www.funimation.com/search/?q=",
            "is_official": True,
            "requires_premium": True
        },
        "netflix": {
            "name": "Netflix",
            "base_url": "https://www.netflix.com/search?q=",
            "is_official": True,
            "requires_premium": True
        },
        "hulu": {
            "name": "Hulu",
            "base_url": "https://www.hulu.com/search?q=",
            "is_official": True,
            "requires_premium": True
        },
        "amazon_prime": {
            "name": "Amazon Prime Video",
            "base_url": "https://www.amazon.com/s?k=",
            "is_official": True,
            "requires_premium": True
        },
        "hidive": {
            "name": "HIDIVE",
            "base_url": "https://www.hidive.com/search?q=",
            "is_official": True,
            "requires_premium": True
        },
        "disney_plus": {
            "name": "Disney+",
            "base_url": "https://www.disneyplus.com/search?q=",
            "is_official": True,
            "requires_premium": True
        },
        "myanimelist": {
            "name": "MyAnimeList",
            "base_url": "https://myanimelist.net/anime.php?q=",
            "is_official": True,
            "requires_premium": False
        },
        "anilist": {
            "name": "AniList",
            "base_url": "https://anilist.co/search/anime?search=",
            "is_official": True,
            "requires_premium": False
        }
    }
    
    MANGA_PLATFORMS = {
        "mangadex": {
            "name": "MangaDex",
            "base_url": "https://mangadex.org/search?q=",
            "is_official": False,
            "requires_premium": False
        },
        "viz": {
            "name": "VIZ Media",
            "base_url": "https://www.viz.com/search?search=",
            "is_official": True,
            "requires_premium": False
        },
        "manga_plus": {
            "name": "MANGA Plus",
            "base_url": "https://mangaplus.shueisha.co.jp/search_result?keyword=",
            "is_official": True,
            "requires_premium": False
        },
        "comixology": {
            "name": "ComiXology",
            "base_url": "https://www.comixology.com/search?search=",
            "is_official": True,
            "requires_premium": True
        },
        "myanimelist_manga": {
            "name": "MyAnimeList",
            "base_url": "https://myanimelist.net/manga.php?q=",
            "is_official": True,
            "requires_premium": False
        },
        "anilist_manga": {
            "name": "AniList",
            "base_url": "https://anilist.co/search/manga?search=",
            "is_official": True,
            "requires_premium": False
        }
    }
    
    @classmethod
    def get_anime_links(cls, title: str) -> List[StreamingLink]:
        """Generate streaming links for anime"""
        encoded_title = urllib.parse.quote(title)
        links = []
        
        for platform_id, platform in cls.STREAMING_PLATFORMS.items():
            links.append(StreamingLink(
                site_name=platform["name"],
                url=f"{platform['base_url']}{encoded_title}",
                is_official=platform["is_official"],
                requires_premium=platform["requires_premium"]
            ))
        
        return links
    
    @classmethod
    def get_manga_links(cls, title: str) -> List[StreamingLink]:
        """Generate reading links for manga"""
        encoded_title = urllib.parse.quote(title)
        links = []
        
        for platform_id, platform in cls.MANGA_PLATFORMS.items():
            links.append(StreamingLink(
                site_name=platform["name"],
                url=f"{platform['base_url']}{encoded_title}",
                is_official=platform["is_official"],
                requires_premium=platform["requires_premium"]
            ))
        
        return links


# ============================================================================
# UNIFIED STREAMING MANAGER
# ============================================================================

class StreamingManager:
    """
    Unified manager for all streaming/reading link sources
    """
    
    def __init__(self):
        self.consumet = ConsumetAPI()
        self.kitsu = KitsuAPI()
        self.mangadex = MangaDexAPI()
        self.simkl = SimklAPI()
        self.official = OfficialStreamingLinks()
    
    async def close(self):
        """Close all API sessions"""
        await self.consumet.close()
        await self.kitsu.close()
        await self.mangadex.close()
        await self.simkl.close()
    
    async def find_anime_streaming_links(self, title: str, mal_id: str = None) -> Dict:
        """
        Find all available streaming links for an anime
        
        Returns links from:
        - Official platforms (Crunchyroll, Netflix, etc.)
        - Consumet sources (GogoAnime, Zoro, etc.)
        - Kitsu streaming links
        """
        result = {
            "title": title,
            "official_links": [],
            "streaming_sources": [],
            "episodes": []
        }
        
        # Get official links
        result["official_links"] = [
            link.to_dict() for link in self.official.get_anime_links(title)
        ]
        
        # Try Consumet sources
        try:
            # GogoAnime
            gogo_search = await self.consumet.search_anime_gogoanime(title)
            if "results" in gogo_search and gogo_search["results"]:
                anime = gogo_search["results"][0]
                anime_info = await self.consumet.get_anime_info_gogoanime(anime["id"])
                if "episodes" in anime_info:
                    result["streaming_sources"].append({
                        "source": "GogoAnime",
                        "anime_id": anime["id"],
                        "episode_count": len(anime_info.get("episodes", []))
                    })
            
            # Zoro/Aniwatch
            zoro_search = await self.consumet.search_anime_zoro(title)
            if "results" in zoro_search and zoro_search["results"]:
                anime = zoro_search["results"][0]
                result["streaming_sources"].append({
                    "source": "Zoro/Aniwatch",
                    "anime_id": anime["id"]
                })
        except Exception as e:
            logger.warning(f"Consumet search failed: {e}")
        
        # Try Kitsu
        try:
            kitsu_search = await self.kitsu.search_anime(title, limit=1)
            if "data" in kitsu_search and kitsu_search["data"]:
                anime = kitsu_search["data"][0]
                kitsu_id = anime["id"]
                
                # Get streaming links from Kitsu
                streaming = await self.kitsu.get_anime_streaming_links(kitsu_id)
                if "data" in streaming:
                    for link in streaming["data"]:
                        attrs = link.get("attributes", {})
                        result["streaming_sources"].append({
                            "source": "Kitsu",
                            "url": attrs.get("url"),
                            "subs": attrs.get("subs"),
                            "dubs": attrs.get("dubs")
                        })
        except Exception as e:
            logger.warning(f"Kitsu search failed: {e}")
        
        return result
    
    async def find_manga_reading_links(self, title: str, mal_id: str = None) -> Dict:
        """
        Find all available reading links for a manga
        
        Returns links from:
        - Official platforms (VIZ, MANGA Plus, etc.)
        - MangaDex
        - Consumet sources
        """
        result = {
            "title": title,
            "official_links": [],
            "reading_sources": [],
            "chapters": []
        }
        
        # Get official links
        result["official_links"] = [
            link.to_dict() for link in self.official.get_manga_links(title)
        ]
        
        # Try MangaDex
        try:
            mangadex_search = await self.mangadex.search_manga(title, limit=1)
            if "data" in mangadex_search and mangadex_search["data"]:
                manga = mangadex_search["data"][0]
                manga_id = manga["id"]
                
                # Get chapters
                chapters = await self.mangadex.get_manga_chapters(manga_id, limit=50)
                if "data" in chapters:
                    result["reading_sources"].append({
                        "source": "MangaDex",
                        "manga_id": manga_id,
                        "url": f"https://mangadex.org/title/{manga_id}",
                        "chapter_count": len(chapters["data"])
                    })
                    
                    # Add first few chapters
                    for ch in chapters["data"][:10]:
                        attrs = ch.get("attributes", {})
                        result["chapters"].append({
                            "id": ch["id"],
                            "chapter": attrs.get("chapter"),
                            "title": attrs.get("title"),
                            "url": f"https://mangadex.org/chapter/{ch['id']}"
                        })
        except Exception as e:
            logger.warning(f"MangaDex search failed: {e}")
        
        # Try Consumet MangaDex
        try:
            consumet_search = await self.consumet.search_manga_mangadex(title)
            if "results" in consumet_search and consumet_search["results"]:
                manga = consumet_search["results"][0]
                result["reading_sources"].append({
                    "source": "Consumet/MangaDex",
                    "manga_id": manga["id"]
                })
        except Exception as e:
            logger.warning(f"Consumet manga search failed: {e}")
        
        return result
    
    async def get_episode_stream(self, source: str, episode_id: str) -> Dict:
        """Get streaming URLs for a specific episode"""
        if source.lower() == "gogoanime":
            return await self.consumet.get_episode_sources_gogoanime(episode_id)
        elif source.lower() in ["zoro", "aniwatch"]:
            return await self.consumet.get_episode_sources_zoro(episode_id)
        return {"error": "Unknown source"}
    
    async def get_chapter_pages(self, source: str, chapter_id: str) -> Dict:
        """Get page URLs for a specific chapter"""
        if source.lower() == "mangadex":
            return await self.mangadex.get_chapter_pages(chapter_id)
        elif source.lower() == "consumet":
            return await self.consumet.get_chapter_pages_mangadex(chapter_id)
        return {"error": "Unknown source"}


# ============================================================================
# FACTORY FUNCTION
# ============================================================================

def create_streaming_manager() -> StreamingManager:
    """Create and return a new streaming manager instance"""
    return StreamingManager()


# ============================================================================
# USAGE EXAMPLE
# ============================================================================

async def main():
    """Example usage"""
    manager = create_streaming_manager()
    
    try:
        # Find anime streaming links
        print("Finding streaming links for 'Attack on Titan'...")
        anime_links = await manager.find_anime_streaming_links("Attack on Titan")
        print(f"Found {len(anime_links['official_links'])} official links")
        print(f"Found {len(anime_links['streaming_sources'])} streaming sources")
        
        # Find manga reading links
        print("\nFinding reading links for 'One Piece'...")
        manga_links = await manager.find_manga_reading_links("One Piece")
        print(f"Found {len(manga_links['official_links'])} official links")
        print(f"Found {len(manga_links['reading_sources'])} reading sources")
        
    finally:
        await manager.close()


if __name__ == "__main__":
    asyncio.run(main())
