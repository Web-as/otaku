"""
Omnipotent Content Omniscience Module
==============================================

Transforms the agent into an all-knowing librarian who:
- Maintains comprehensive indexed knowledge of ALL anime/manga content
- Monitors new releases in real-time
- Auto-generates keywords and metadata for new content
- Dynamically maintains "must watch" rankings
- Provides omniscient content recommendations

Author: Omniscient Agent System
"""

import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Set, Tuple
from dataclasses import dataclass, field, asdict
from enum import Enum
from collections import defaultdict, Counter
import asyncio
import aiohttp
from abc import ABC, abstractmethod


# ============================================================================
# CORE DATA STRUCTURES
# ============================================================================

class ContentStatus(Enum):
    """Status of content in the omniscient index"""
    NEWLY_INDEXED = "newly_indexed"
    INDEXED = "indexed"
    TRENDING = "trending"
    HIDDEN_GEM = "hidden_gem"
    MUST_WATCH = "must_watch"
    SEASONAL_HIGHLIGHT = "seasonal_highlight"


@dataclass
class ContentMetadata:
    """Generated metadata for content"""
    content_id: str
    title: str
    content_type: str  # "anime" or "manga"
    
    # Auto-generated keywords
    keywords: List[str] = field(default_factory=list)
    keyword_weights: Dict[str, float] = field(default_factory=dict)
    
    # Generated descriptions
    short_description: Optional[str] = None
    extended_description: Optional[str] = None
    mood_tags: List[str] = field(default_factory=list)
    
    # Content metrics
    discovery_score: float = 0.0
    uniqueness_score: float = 0.0
    relevance_score: float = 0.0
    
    # Classification
    content_status: ContentStatus = ContentStatus.INDEXED
    is_trending: bool = False
    is_hidden_gem: bool = False
    
    # Metadata timestamps
    indexed_at: datetime = field(default_factory=datetime.utcnow)
    last_updated: datetime = field(default_factory=datetime.utcnow)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "content_id": self.content_id,
            "title": self.title,
            "content_type": self.content_type,
            "keywords": self.keywords,
            "keyword_weights": self.keyword_weights,
            "short_description": self.short_description,
            "extended_description": self.extended_description,
            "mood_tags": self.mood_tags,
            "discovery_score": self.discovery_score,
            "uniqueness_score": self.uniqueness_score,
            "relevance_score": self.relevance_score,
            "content_status": self.content_status.value,
            "is_trending": self.is_trending,
            "is_hidden_gem": self.is_hidden_gem,
            "indexed_at": self.indexed_at.isoformat(),
            "last_updated": self.last_updated.isoformat()
        }


@dataclass
class RankedContent:
    """Content with dynamic ranking"""
    content_id: str
    title: str
    content_type: str
    rank: int
    rank_score: float
    category: str  # "must_watch", "classics", "trending_now", "hidden_gems", etc.
    rank_reason: str
    
    # Ranking factors
    rating_score: float = 0.0
    popularity_score: float = 0.0
    recency_score: float = 0.0
    uniqueness_factor: float = 0.0
    user_engagement: float = 0.0
    
    # Metadata
    ranked_at: datetime = field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = None  # For seasonal/trending lists
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "content_id": self.content_id,
            "title": self.title,
            "content_type": self.content_type,
            "rank": self.rank,
            "rank_score": self.rank_score,
            "category": self.category,
            "rank_reason": self.rank_reason,
            "rating_score": self.rating_score,
            "popularity_score": self.popularity_score,
            "recency_score": self.recency_score,
            "uniqueness_factor": self.uniqueness_factor,
            "user_engagement": self.user_engagement,
            "ranked_at": self.ranked_at.isoformat(),
            "expires_at": self.expires_at.isoformat() if self.expires_at else None
        }


@dataclass
class NewRelease:
    """Newly detected anime/manga release"""
    content_id: str
    title: str
    content_type: str
    release_date: datetime
    release_season: Optional[str] = None  # "Spring 2024", "Fall 2024"
    
    # Initial metadata
    genres: List[str] = field(default_factory=list)
    synopsis: Optional[str] = None
    image_url: Optional[str] = None
    episodes: int = 0
    studios: List[str] = field(default_factory=list)
    
    # Detection info
    detected_at: datetime = field(default_factory=datetime.utcnow)
    metadata_generated: bool = False
    added_to_rankings: bool = False
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "content_id": self.content_id,
            "title": self.title,
            "content_type": self.content_type,
            "release_date": self.release_date.isoformat(),
            "release_season": self.release_season,
            "genres": self.genres,
            "synopsis": self.synopsis,
            "image_url": self.image_url,
            "episodes": self.episodes,
            "studios": self.studios,
            "detected_at": self.detected_at.isoformat(),
            "metadata_generated": self.metadata_generated,
            "added_to_rankings": self.added_to_rankings
        }


# ============================================================================
# CONTENT INDEXER - Know ALL content
# ============================================================================

class ContentIndexer:
    """
    Comprehensive content indexer that crawls and maintains awareness
    of ALL anime/manga available on integrated sources.
    """
    
    def __init__(self, jikan_client, anilist_client, config: Dict[str, Any] = None):
        """Initialize the content indexer"""
        self.jikan_client = jikan_client
        self.anilist_client = anilist_client
        self.config = config or {}
        self.logger = logging.getLogger("ContentIndexer")
        
        # In-memory index
        self.anime_index: Dict[str, Dict[str, Any]] = {}  # id -> anime data
        self.manga_index: Dict[str, Dict[str, Any]] = {}  # id -> manga data
        self.content_metadata: Dict[str, ContentMetadata] = {}  # id -> metadata
        
        # Genre and theme tracking
        self.genre_content_map: Dict[str, Set[str]] = defaultdict(set)
        self.theme_content_map: Dict[str, Set[str]] = defaultdict(set)
        self.studio_content_map: Dict[str, Set[str]] = defaultdict(set)
        
        # Indexing status
        self.last_full_index: Optional[datetime] = None
        self.is_indexing: bool = False
        self.index_stats: Dict[str, int] = {
            "total_anime": 0,
            "total_manga": 0,
            "indexed_anime": 0,
            "indexed_manga": 0
        }
    
    async def build_comprehensive_index(self, limit: Optional[int] = None) -> Dict[str, Any]:
        """
        Build a comprehensive index of ALL available anime/manga.
        This makes the agent omniscient about all content.
        """
        self.is_indexing = True
        self.logger.info("Starting comprehensive content indexer...")
        
        try:
            start_time = datetime.utcnow()
            
            # Index anime
            anime_count = await self._index_all_anime(limit=limit)
            
            # Index manga
            manga_count = await self._index_all_manga(limit=limit)
            
            self.last_full_index = datetime.utcnow()
            index_duration = (self.last_full_index - start_time).total_seconds()
            
            self.logger.info(
                f"Omniscient index complete: {anime_count} anime, "
                f"{manga_count} manga indexed in {index_duration:.2f}s"
            )
            
            return {
                "success": True,
                "anime_indexed": anime_count,
                "manga_indexed": manga_count,
                "total_content": anime_count + manga_count,
                "duration_seconds": index_duration,
                "last_full_index": self.last_full_index.isoformat()
            }
        finally:
            self.is_indexing = False
    
    async def _index_all_anime(self, limit: Optional[int] = None) -> int:
        """Index all anime from all available sources"""
        count = 0
        try:
            # Get anime from Jikan in batches
            page = 1
            max_pages = limit if limit else 100
            
            while page <= max_pages:
                anime_list = self.jikan_client.get_anime_list(page=page)
                if not anime_list:
                    break
                
                for anime in anime_list:
                    anime_id = anime.get("mal_id") or anime.get("id")
                    
                    self.anime_index[str(anime_id)] = anime
                    
                    # Build genre map
                    for genre in anime.get("genres", []):
                        self.genre_content_map[genre["name"]].add(str(anime_id))
                    
                    # Build theme map
                    for theme in anime.get("themes", []):
                        self.theme_content_map[theme["name"]].add(str(anime_id))
                    
                    count += 1
                
                page += 1
            
            self.index_stats["indexed_anime"] = len(self.anime_index)
            self.index_stats["total_anime"] = count
            return count
        
        except Exception as e:
            self.logger.error(f"Error indexing anime: {str(e)}")
            return count
    
    async def _index_all_manga(self, limit: Optional[int] = None) -> int:
        """Index all manga from all available sources"""
        count = 0
        try:
            # Get manga from Jikan in batches
            page = 1
            max_pages = limit if limit else 50
            
            while page <= max_pages:
                manga_list = self.jikan_client.get_manga_list(page=page)
                if not manga_list:
                    break
                
                for manga in manga_list:
                    manga_id = manga.get("mal_id") or manga.get("id")
                    
                    self.manga_index[str(manga_id)] = manga
                    
                    # Build genre map
                    for genre in manga.get("genres", []):
                        self.genre_content_map[genre["name"]].add(str(manga_id))
                    
                    count += 1
                
                page += 1
            
            self.index_stats["indexed_manga"] = len(self.manga_index)
            self.index_stats["total_manga"] = count
            return count
        
        except Exception as e:
            self.logger.error(f"Error indexing manga: {str(e)}")
            return count
    
    def search_index(self, query: str, content_types: List[str] = None) -> List[Dict[str, Any]]:
        """
        Search the omniscient index with natural language.
        The agent instantly knows about ALL matching content.
        """
        results = []
        query_lower = query.lower()
        
        # Determine which indexes to search
        search_anime = not content_types or "anime" in content_types
        search_manga = not content_types or "manga" in content_types
        
        # Search anime
        if search_anime:
            for content_id, content in self.anime_index.items():
                if self._matches_query(content, query_lower):
                    results.append({
                        "id": content_id,
                        "title": content.get("title"),
                        "type": "anime",
                        "score": self._calculate_match_score(content, query_lower)
                    })
        
        # Search manga
        if search_manga:
            for content_id, content in self.manga_index.items():
                if self._matches_query(content, query_lower):
                    results.append({
                        "id": content_id,
                        "title": content.get("title"),
                        "type": "manga",
                        "score": self._calculate_match_score(content, query_lower)
                    })
        
        # Sort by match score
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:20]  # Return top 20
    
    def _matches_query(self, content: Dict[str, Any], query: str) -> bool:
        """Check if content matches query"""
        title = content.get("title", "").lower()
        title_english = content.get("title_english", "").lower()
        synopsis = content.get("synopsis", "").lower()
        genres = [g.get("name", "").lower() for g in content.get("genres", [])]
        
        # Check title
        if query in title or query in title_english:
            return True
        
        # Check synopsis
        if query in synopsis:
            return True
        
        # Check genres
        if any(query in g for g in genres):
            return True
        
        return False
    
    def _calculate_match_score(self, content: Dict[str, Any], query: str) -> float:
        """Calculate relevance score for search result"""
        score = 0.0
        
        title = content.get("title", "").lower()
        title_english = content.get("title_english", "").lower()
        
        # Exact title match is highest
        if query == title or query == title_english:
            score += 100
        elif query in title or query in title_english:
            score += 50
        
        # Title starts with query
        if title.startswith(query) or title_english.startswith(query):
            score += 25
        
        # Synopsis match
        if query in content.get("synopsis", "").lower():
            score += 10
        
        return score
    
    def get_index_stats(self) -> Dict[str, Any]:
        """Get statistics about the omniscient index"""
        return {
            **self.index_stats,
            "genres_indexed": len(self.genre_content_map),
            "themes_indexed": len(self.theme_content_map),
            "studios_indexed": len(self.studio_content_map),
            "last_full_index": self.last_full_index.isoformat() if self.last_full_index else None,
            "is_indexing": self.is_indexing
        }


# ============================================================================
# RELEASE MONITOR - Track new releases
# ============================================================================

class ReleaseMonitor:
    """
    Real-time monitor for newly released anime/manga.
    Detects new content and triggers metadata generation and ranking updates.
    """
    
    def __init__(self, jikan_client, config: Dict[str, Any] = None):
        """Initialize the release monitor"""
        self.jikan_client = jikan_client
        self.config = config or {}
        self.logger = logging.getLogger("ReleaseMonitor")
        
        # Track detected releases
        self.new_releases: Dict[str, NewRelease] = {}
        self.processed_releases: Set[str] = set()
        
        # Release tracking
        self.last_check: Optional[datetime] = None
        self.check_interval = config.get("check_interval_minutes", 60)
    
    async def check_for_new_releases(self) -> List[NewRelease]:
        """
        Check for newly released anime/manga.
        Returns list of detected new releases.
        """
        self.logger.info("Checking for new releases...")
        new_releases = []
        
        try:
            # Get current season anime
            current_season = self._get_current_season()
            anime_list = self.jikan_client.get_seasonal_anime(
                season=current_season["season"],
                year=current_season["year"]
            )
            
            if anime_list:
                for anime in anime_list:
                    release_id = f"anime_{anime.get('mal_id')}"
                    
                    if release_id not in self.processed_releases:
                        new_release = NewRelease(
                            content_id=str(anime.get("mal_id")),
                            title=anime.get("title"),
                            content_type="anime",
                            release_date=self._parse_air_date(anime),
                            release_season=f"{current_season['season'].capitalize()} {current_season['year']}",
                            genres=[g.get("name") for g in anime.get("genres", [])],
                            synopsis=anime.get("synopsis"),
                            image_url=anime.get("images", {}).get("jpg", {}).get("image_url"),
                            episodes=anime.get("episodes", 0),
                            studios=[s.get("name") for s in anime.get("studios", [])]
                        )
                        
                        self.new_releases[release_id] = new_release
                        new_releases.append(new_release)
                        self.processed_releases.add(release_id)
                        
                        self.logger.info(f"New release detected: {new_release.title} ({new_release.content_type})")
            
            self.last_check = datetime.utcnow()
            return new_releases
        
        except Exception as e:
            self.logger.error(f"Error checking for new releases: {str(e)}")
            return new_releases
    
    def _get_current_season(self) -> Dict[str, Any]:
        """Get current anime season"""
        now = datetime.utcnow()
        month = now.month
        year = now.year
        
        if month in [1, 2, 3]:
            season = "winter"
        elif month in [4, 5, 6]:
            season = "spring"
        elif month in [7, 8, 9]:
            season = "summer"
        else:
            season = "fall"
        
        return {"season": season, "year": year}
    
    def _parse_air_date(self, anime: Dict[str, Any]) -> datetime:
        """Parse air date from anime data"""
        aired = anime.get("aired", {})
        if isinstance(aired, dict):
            from_date = aired.get("from")
            if from_date:
                try:
                    return datetime.fromisoformat(from_date.replace("Z", "+00:00"))
                except:
                    pass
        
        return datetime.utcnow()
    
    def get_release_status(self, release_id: str) -> Optional[Dict[str, Any]]:
        """Get status of a detected release"""
        release = self.new_releases.get(release_id)
        if release:
            return {
                "release": release.to_dict(),
                "metadata_generated": release.metadata_generated,
                "added_to_rankings": release.added_to_rankings
            }
        return None


# ============================================================================
# CONTENT METADATA GENERATOR - Auto-create keywords and descriptions
# ============================================================================

class ContentMetadataGenerator:
    """
    Intelligent metadata generator that creates keywords, descriptions,
    and mood tags for all content automatically.
    """
    
    def __init__(self, config: Dict[str, Any] = None):
        """Initialize the metadata generator"""
        self.config = config or {}
        self.logger = logging.getLogger("ContentMetadataGenerator")
        
        # Keyword generation templates
        self.keyword_templates = self._init_keyword_templates()
        self.mood_templates = self._init_mood_templates()
    
    def _init_keyword_templates(self) -> Dict[str, List[str]]:
        """Initialize keyword generation templates"""
        return {
            "genres": {
                "Action": ["battle", "combat", "fight", "hero", "adventure", "power", "strong"],
                "Romance": ["love", "relationship", "heart", "feelings", "couple", "dating"],
                "Comedy": ["funny", "laugh", "humor", "hilarious", "joke", "silly"],
                "Drama": ["emotional", "tragedy", "serious", "heartfelt", "touching"],
                "Fantasy": ["magic", "world", "supernatural", "adventure", "mystery"],
                "Sci-Fi": ["technology", "future", "space", "science", "robots", "cyber"],
                "Horror": ["scary", "terror", "dark", "fear", "suspense", "creepy"],
                "Slice of Life": ["daily", "peaceful", "relax", "friends", "heart-warming"],
                "Mystery": ["detective", "investigation", "secret", "puzzle", "clues"],
                "Sports": ["competition", "tournament", "team", "victory", "ability"],
            }
        }
    
    def _init_mood_templates(self) -> Dict[str, List[str]]:
        """Initialize mood tag templates"""
        return {
            "lighthearted": ["comedy", "slice of life", "wholesome"],
            "intense": ["action", "thriller", "psychological"],
            "emotional": ["drama", "romance", "tragedy"],
            "dark": ["horror", "psychological", "dark fantasy"],
            "adventurous": ["action", "fantasy", "adventure"],
            "mysterious": ["mystery", "psychological", "thriller"],
            "relaxing": ["slice of life", "comedy", "wholesome"],
        }
    
    def generate_metadata(self, content: Dict[str, Any], content_type: str) -> ContentMetadata:
        """
        Generate comprehensive metadata for content.
        Automatically creates keywords and descriptions.
        """
        content_id = str(content.get("id") or content.get("mal_id"))
        title = content.get("title", "Unknown")
        
        metadata = ContentMetadata(
            content_id=content_id,
            title=title,
            content_type=content_type
        )
        
        # Generate keywords
        keywords, keyword_weights = self._generate_keywords(content)
        metadata.keywords = keywords
        metadata.keyword_weights = keyword_weights
        
        # Generate descriptions
        metadata.short_description = self._generate_short_description(content, keywords)
        metadata.extended_description = self._generate_extended_description(content, keywords)
        
        # Generate mood tags
        metadata.mood_tags = self._generate_mood_tags(content, keywords)
        
        # Calculate content scores
        metadata.discovery_score = self._calculate_discovery_score(content, keywords)
        metadata.uniqueness_score = self._calculate_uniqueness_score(content)
        metadata.relevance_score = self._calculate_relevance_score(content)
        
        # Determine content status
        metadata.content_status = self._determine_content_status(content)
        
        return metadata
    
    def _generate_keywords(self, content: Dict[str, Any]) -> Tuple[List[str], Dict[str, float]]:
        """Generate keywords from content metadata"""
        keywords = []
        weights = {}
        
        # Extract from genres
        for genre in content.get("genres", []):
            genre_name = genre.get("name") if isinstance(genre, dict) else genre
            keywords.append(genre_name.lower())
            weights[genre_name.lower()] = 1.0
        
        # Extract from themes
        for theme in content.get("themes", []):
            theme_name = theme.get("name") if isinstance(theme, dict) else theme
            keywords.append(theme_name.lower())
            weights[theme_name.lower()] = 0.8
        
        # Extract from studios
        for studio in content.get("studios", []):
            studio_name = studio.get("name") if isinstance(studio, dict) else studio
            keywords.append(f"studio: {studio_name.lower()}")
            weights[f"studio: {studio_name.lower()}"] = 0.6
        
        # Add synopsis keywords
        synopsis = content.get("synopsis", "").lower()
        synopsis_keywords = self._extract_synopsis_keywords(synopsis)
        for keyword in synopsis_keywords:
            if keyword not in keywords:
                keywords.append(keyword)
                weights[keyword] = 0.5
        
        return list(set(keywords)), weights
    
    def _extract_synopsis_keywords(self, synopsis: str) -> List[str]:
        """Extract important keywords from synopsis"""
        keywords = []
        
        important_words = [
            "journey", "adventure", "mystery", "power", "love", "friendship",
            "battle", "conflict", "discovery", "transformation", "connection",
            "sacrifice", "growth", "challenge", "secret", "destiny"
        ]
        
        synopsis_lower = synopsis.lower()
        for word in important_words:
            if word in synopsis_lower:
                keywords.append(word)
        
        return keywords
    
    def _generate_short_description(self, content: Dict[str, Any], keywords: List[str]) -> str:
        """Generate a short, catchy description"""
        title = content.get("title", "")
        genres = [g.get("name") if isinstance(g, dict) else g for g in content.get("genres", [])]
        
        if genres:
            genre_str = ", ".join(genres[:3])
            return f"{title} - {genre_str} series featuring {', '.join(keywords[:3])} elements"
        else:
            return f"Discover {title} with themes of {', '.join(keywords[:3])}"
    
    def _generate_extended_description(self, content: Dict[str, Any], keywords: List[str]) -> str:
        """Generate an extended description"""
        synopsis = content.get("synopsis", "")
        if synopsis:
            if len(synopsis) > 300:
                return synopsis[:300] + "..."
            return synopsis
        
        # Fallback if no synopsis
        genres = [g.get("name") if isinstance(g, dict) else g for g in content.get("genres", [])]
        return f"A {', '.join(genres)} series exploring themes like {', '.join(keywords[:5])}"
    
    def _generate_mood_tags(self, content: Dict[str, Any], keywords: List[str]) -> List[str]:
        """Generate mood tags based on content"""
        mood_tags = set()
        
        genres = [g.get("name").lower() if isinstance(g, dict) else g.lower() 
                 for g in content.get("genres", [])]
        
        for mood, mood_genres in self.mood_templates.items():
            if any(g in mood_genres for g in genres):
                mood_tags.add(mood)
        
        return list(mood_tags)
    
    def _calculate_discovery_score(self, content: Dict[str, Any], keywords: List[str]) -> float:
        """Calculate how discoverable content is (potential to be recommended)"""
        score = 5.0
        
        # Popular content is more discoverable
        popularity = content.get("popularity", 0) or 0
        score += (10000 - popularity) / 1000  # Higher popularity rank = lower number = higher score
        
        # Content with many genres is more discoverable
        genres = content.get("genres", [])
        score += len(genres) * 0.5
        
        # Recent content gets a boost
        aired = content.get("aired", {})
        if isinstance(aired, dict) and aired.get("from"):
            try:
                air_date = datetime.fromisoformat(aired["from"].replace("Z", "+00:00"))
                days_old = (datetime.utcnow() - air_date).days
                if days_old < 365:
                    score += (365 - days_old) / 100
            except:
                pass
        
        return min(score, 100.0)
    
    def _calculate_uniqueness_score(self, content: Dict[str, Any]) -> float:
        """Calculate uniqueness/novelty of content"""
        score = 5.0
        
        # Lower popularity rank = more unique
        popularity = content.get("popularity", 0) or 1000000
        score += (popularity / 10000)
        
        return min(score, 100.0)
    
    def _calculate_relevance_score(self, content: Dict[str, Any]) -> float:
        """Calculate relevance score for recommendations"""
        score = 0.0
        
        # High ratings are relevant
        score += (content.get("score", 5.0) / 10) * 30
        
        # Recent is relevant
        aired = content.get("aired", {})
        if isinstance(aired, dict) and aired.get("from"):
            try:
                air_date = datetime.fromisoformat(aired["from"].replace("Z", "+00:00"))
                days_old = (datetime.utcnow() - air_date).days
                if days_old < 365:
                    score += 25
            except:
                pass
        
        # Popular is relevant
        score += min((content.get("popularity", 10000) / 10000) * 45, 45)
        
        return min(score, 100.0)
    
    def _determine_content_status(self, content: Dict[str, Any]) -> ContentStatus:
        """Determine the content's status in the index"""
        score = content.get("score", 0) or 0
        popularity = content.get("popularity", 10000) or 10000
        
        # Must watch: High score and good popularity
        if score >= 8.0 and popularity <= 1000:
            return ContentStatus.MUST_WATCH
        
        # Trending: Recent high engagement
        aired = content.get("aired", {})
        if isinstance(aired, dict) and aired.get("from"):
            try:
                air_date = datetime.fromisoformat(aired["from"].replace("Z", "+00:00"))
                if (datetime.utcnow() - air_date).days < 180:
                    if score >= 7.5 or popularity <= 5000:
                        return ContentStatus.TRENDING
            except:
                pass
        
        # Hidden gem: Good score but low popularity
        if score >= 7.5 and popularity > 5000:
            return ContentStatus.HIDDEN_GEM
        
        return ContentStatus.INDEXED


# ============================================================================
# DYNAMIC RANKING SYSTEM - Maintain must-watch lists
# ============================================================================

class DynamicRankingSystem:
    """
    Maintains dynamic, automatically-updated rankings and "must watch" lists.
    Rankings update as new content is added and trends emerge.
    """
    
    def __init__(self, metadata_generator: ContentMetadataGenerator, config: Dict[str, Any] = None):
        """Initialize the ranking system"""
        self.metadata_generator = metadata_generator
        self.config = config or {}
        self.logger = logging.getLogger("DynamicRankingSystem")
        
        # Ranking lists
        self.rankings: Dict[str, List[RankedContent]] = {
            "all_time_greatest": [],
            "must_watch": [],
            "this_season": [],
            "trending_now": [],
            "hidden_gems": [],
            "underrated": [],
            "by_genre": {},  # genre -> ranked list
            "by_platform": {},  # platform -> ranked list
        }
        
        # Ranking history for trend tracking
        self.ranking_history: Dict[str, List[Tuple[datetime, str, int]]] = defaultdict(list)
    
    def update_rankings(self, all_content: Dict[str, Dict[str, Any]], metadata_map: Dict[str, ContentMetadata]) -> Dict[str, int]:
        """
        Update all ranking lists based on current content and metadata.
        This is called whenever new content is added or rankings need refresh.
        """
        self.logger.info("Updating dynamic rankings...")
        update_counts = {}
        
        try:
            # Update each ranking category
            update_counts["all_time_greatest"] = self._update_all_time_greatest(all_content, metadata_map)
            update_counts["must_watch"] = self._update_must_watch(all_content, metadata_map)
            update_counts["this_season"] = self._update_seasonal(all_content, metadata_map)
            update_counts["trending_now"] = self._update_trending(all_content, metadata_map)
            update_counts["hidden_gems"] = self._update_hidden_gems(all_content, metadata_map)
            update_counts["underrated"] = self._update_underrated(all_content, metadata_map)
            
            # Update genre-based rankings
            update_counts["by_genre"] = self._update_genre_rankings(all_content, metadata_map)
            
            self.logger.info(f"Rankings updated: {update_counts}")
            return update_counts
        
        except Exception as e:
            self.logger.error(f"Error updating rankings: {str(e)}")
            return update_counts
    
    def _update_all_time_greatest(self, all_content: Dict[str, Dict[str, Any]], metadata_map: Dict[str, ContentMetadata]) -> int:
        """Update all-time greatest/best of all time list"""
        ranked = []
        
        for content_id, content in all_content.items():
            metadata = metadata_map.get(content_id)
            if not metadata:
                continue
            
            score = content.get("score", 0) or 0
            if score < 8.0:
                continue
            
            ranked_content = RankedContent(
                content_id=content_id,
                title=content.get("title", ""),
                content_type="anime" if "anime" in str(content_id) else "manga",
                rank=0,  # Will be set after sorting
                rank_score=score,
                category="all_time_greatest",
                rank_reason=f"Best of all time with exceptional {score}/10 score",
                rating_score=score
            )
            ranked.append(ranked_content)
        
        # Sort by score
        ranked.sort(key=lambda x: x.rank_score, reverse=True)
        
        # Assign ranks
        for i, item in enumerate(ranked[:100], 1):
            item.rank = i
        
        self.rankings["all_time_greatest"] = ranked[:100]
        return len(self.rankings["all_time_greatest"])
    
    def _update_must_watch(self, all_content: Dict[str, Dict[str, Any]], metadata_map: Dict[str, ContentMetadata]) -> int:
        """Update must-watch list from highly-rated and popular content"""
        ranked = []
        
        for content_id, content in all_content.items():
            metadata = metadata_map.get(content_id)
            if not metadata or metadata.content_status != ContentStatus.MUST_WATCH:
                continue
            
            score = content.get("score", 0) or 0
            popularity = content.get("popularity", 10000) or 10000
            
            # Combined score: rating + popularity + metadata scores
            combined_score = (score * 0.5) + ((10000 - popularity) / 200) + (metadata.relevance_score * 0.3)
            
            ranked_content = RankedContent(
                content_id=content_id,
                title=content.get("title", ""),
                content_type="anime" if "anime" in str(content_id) else "manga",
                rank=0,
                rank_score=combined_score,
                category="must_watch",
                rank_reason=f"Exceptional quality ({score}/10) and high user engagement - a must-watch masterpiece",
                rating_score=score,
                popularity_score=popularity
            )
            ranked.append(ranked_content)
        
        ranked.sort(key=lambda x: x.rank_score, reverse=True)
        for i, item in enumerate(ranked[:50], 1):
            item.rank = i
        
        self.rankings["must_watch"] = ranked[:50]
        return len(self.rankings["must_watch"])
    
    def _update_seasonal(self, all_content: Dict[str, Dict[str, Any]], metadata_map: Dict[str, ContentMetadata]) -> int:
        """Update seasonal highlights"""
        ranked = []
        now = datetime.utcnow()
        
        for content_id, content in all_content.items():
            metadata = metadata_map.get(content_id)
            if not metadata:
                continue
            
            # Check if aired recently (this season or last)
            aired = content.get("aired", {})
            if isinstance(aired, dict) and aired.get("from"):
                try:
                    air_date = datetime.fromisoformat(aired["from"].replace("Z", "+00:00"))
                    days_old = (now - air_date).days
                    
                    # This season or last season (roughly 6 months)
                    if days_old > 180:
                        continue
                    
                    score = content.get("score", 0) or 0
                    recency_bonus = max(0, (180 - days_old) / 30)
                    combined_score = score + recency_bonus
                    
                    ranked_content = RankedContent(
                        content_id=content_id,
                        title=content.get("title", ""),
                        content_type="anime" if "anime" in str(content_id) else "manga",
                        rank=0,
                        rank_score=combined_score,
                        category="this_season",
                        rank_reason=f"Current season highlight - {score}/10 score",
                        rating_score=score,
                        recency_score=recency_bonus,
                        expires_at=air_date + timedelta(days=180)
                    )
                    ranked.append(ranked_content)
                except:
                    pass
        
        ranked.sort(key=lambda x: x.rank_score, reverse=True)
        for i, item in enumerate(ranked, 1):
            item.rank = i
        
        self.rankings["this_season"] = ranked[:30]
        return len(self.rankings["this_season"])
    
    def _update_trending(self, all_content: Dict[str, Dict[str, Any]], metadata_map: Dict[str, ContentMetadata]) -> int:
        """Update trending list based on recent activity"""
        ranked = []
        
        for content_id, content in all_content.items():
            metadata = metadata_map.get(content_id)
            if not metadata or not metadata.is_trending:
                continue
            
            score = content.get("score", 0) or 0
            popularity = content.get("popularity", 10000) or 10000
            
            trending_score = (score * 0.4) + ((10000 - popularity) / 100) + (metadata.discovery_score * 0.6)
            
            ranked_content = RankedContent(
                content_id=content_id,
                title=content.get("title", ""),
                content_type="anime" if "anime" in str(content_id) else "manga",
                rank=0,
                rank_score=trending_score,
                category="trending_now",
                rank_reason="Currently trending with high engagement",
                rating_score=score,
                popularity_score=popularity
            )
            ranked.append(ranked_content)
        
        ranked.sort(key=lambda x: x.rank_score, reverse=True)
        for i, item in enumerate(ranked, 1):
            item.rank = i
        
        self.rankings["trending_now"] = ranked[:25]
        return len(self.rankings["trending_now"])
    
    def _update_hidden_gems(self, all_content: Dict[str, Dict[str, Any]], metadata_map: Dict[str, ContentMetadata]) -> int:
        """Update hidden gems list - great content that's not mainstream"""
        ranked = []
        
        for content_id, content in all_content.items():
            metadata = metadata_map.get(content_id)
            if not metadata or metadata.content_status != ContentStatus.HIDDEN_GEM:
                continue
            
            score = content.get("score", 0) or 0
            popularity = content.get("popularity", 10000) or 10000
            
            # Hidden gems: high quality, low popularity
            gem_score = score + (popularity / 1000)  # Lower popularity = higher score
            
            ranked_content = RankedContent(
                content_id=content_id,
                title=content.get("title", ""),
                content_type="anime" if "anime" in str(content_id) else "manga",
                rank=0,
                rank_score=gem_score,
                category="hidden_gems",
                rank_reason=f"Underrated masterpiece with {score}/10 quality but low visibility",
                rating_score=score,
                uniqueness_factor=metadata.uniqueness_score
            )
            ranked.append(ranked_content)
        
        ranked.sort(key=lambda x: x.rank_score, reverse=True)
        for i, item in enumerate(ranked, 1):
            item.rank = i
        
        self.rankings["hidden_gems"] = ranked[:30]
        return len(self.rankings["hidden_gems"])
    
    def _update_underrated(self, all_content: Dict[str, Dict[str, Any]], metadata_map: Dict[str, ContentMetadata]) -> int:
        """Update underrated list - good quality with low rating scores"""
        ranked = []
        
        for content_id, content in all_content.items():
            score = content.get("score", 0) or 0
            scored_by = content.get("scored_by", 0) or 0
            
            # Underrated: OK score but not enough votes
            if score >= 6.5 and score < 8.0 and scored_by < 50000:
                ranked_content = RankedContent(
                    content_id=content_id,
                    title=content.get("title", ""),
                    content_type="anime" if "anime" in str(content_id) else "manga",
                    rank=0,
                    rank_score=score,
                    category="underrated",
                    rank_reason=f"Solid {score}/10 that deserves more attention ({scored_by} ratings)",
                    rating_score=score
                )
                ranked.append(ranked_content)
        
        ranked.sort(key=lambda x: x.rank_score, reverse=True)
        for i, item in enumerate(ranked, 1):
            item.rank = i
        
        self.rankings["underrated"] = ranked[:25]
        return len(self.rankings["underrated"])
    
    def _update_genre_rankings(self, all_content: Dict[str, Dict[str, Any]], metadata_map: Dict[str, ContentMetadata]) -> int:
        """Update rankings by genre"""
        count = 0
        
        # Collect all genres
        genres = set()
        for content in all_content.values():
            for genre in content.get("genres", []):
                genre_name = genre.get("name") if isinstance(genre, dict) else genre
                genres.add(genre_name)
        
        # Create rankings for each genre
        for genre in genres:
            ranked = []
            
            for content_id, content in all_content.items():
                content_genres = [g.get("name") if isinstance(g, dict) else g for g in content.get("genres", [])]
                if genre not in content_genres:
                    continue
                
                score = content.get("score", 0) or 0
                ranked_content = RankedContent(
                    content_id=content_id,
                    title=content.get("title", ""),
                    content_type="anime" if "anime" in str(content_id) else "manga",
                    rank=0,
                    rank_score=score,
                    category=f"genre_{genre}",
                    rank_reason=f"Top-rated {genre} content",
                    rating_score=score
                )
                ranked.append(ranked_content)
            
            ranked.sort(key=lambda x: x.rank_score, reverse=True)
            for i, item in enumerate(ranked[:25], 1):
                item.rank = i
            
            self.rankings["by_genre"][genre] = ranked[:25]
            count += len(self.rankings["by_genre"][genre])
        
        return count
    
    def get_ranked_list(self, category: str) -> List[Dict[str, Any]]:
        """Get a ranked list by category"""
        ranked = self.rankings.get(category, [])
        return [item.to_dict() for item in ranked]
    
    def get_all_rankings_summary(self) -> Dict[str, Any]:
        """Get summary of all rankings"""
        return {
            "all_time_greatest": len(self.rankings.get("all_time_greatest", [])),
            "must_watch": len(self.rankings.get("must_watch", [])),
            "this_season": len(self.rankings.get("this_season", [])),
            "trending_now": len(self.rankings.get("trending_now", [])),
            "hidden_gems": len(self.rankings.get("hidden_gems", [])),
            "underrated": len(self.rankings.get("underrated", [])),
            "genres": len(self.rankings.get("by_genre", {})),
            "last_updated": datetime.utcnow().isoformat()
        }


# ============================================================================
# OMNISCIENT MODE MANAGER - Coordinate everything
# ============================================================================

class OmniscientModeManager:
    """
    Master coordinator that integrates all omniscience systems.
    Makes the agent an all-knowing, all-seeing content librarian.
    """
    
    def __init__(self, jikan_client, anilist_client, config: Dict[str, Any] = None):
        """Initialize the omniscient mode manager"""
        self.config = config or {}
        self.logger = logging.getLogger("OmniscientModeManager")
        
        # Initialize all subsystems
        self.indexer = ContentIndexer(jikan_client, anilist_client, config)
        self.release_monitor = ReleaseMonitor(jikan_client, config)
        self.metadata_generator = ContentMetadataGenerator(config)
        self.ranking_system = DynamicRankingSystem(self.metadata_generator, config)
        
        # Omniscience state
        self.is_omniscient = False
        self.omniscience_enabled_at: Optional[datetime] = None
        self.last_full_update: Optional[datetime] = None
    
    async def initialize_omniscience(self) -> Dict[str, Any]:
        """
        Activate omniscient mode: build comprehensive index and establish
        knowledge of all available content.
        """
        self.logger.info("Initializing OMNISCIENT MODE...")
        
        try:
            # Build comprehensive index
            index_result = await self.indexer.build_comprehensive_index(limit=50)  # Limit for demo
            
            # Check for new releases
            new_releases = await self.release_monitor.check_for_new_releases()
            
            # Generate metadata for new releases
            for release in new_releases:
                self.metadata_generator.generate_metadata(
                    {"mal_id": release.content_id, "title": release.title},
                    release.content_type
                )
                release.metadata_generated = True
            
            # Update all rankings
            all_content = {**self.indexer.anime_index, **self.indexer.manga_index}
            ranking_updates = self.ranking_system.update_rankings(all_content, self.metadata_generator.config)
            
            self.is_omniscient = True
            self.omniscience_enabled_at = datetime.utcnow()
            self.last_full_update = datetime.utcnow()
            
            result = {
                "success": True,
                "status": "OMNISCIENT MODE ACTIVATED",
                "index": index_result,
                "new_releases": len(new_releases),
                "metadata_generated": sum(1 for r in new_releases if r.metadata_generated),
                "rankings_updated": ranking_updates,
                "activated_at": self.omniscience_enabled_at.isoformat()
            }
            
            self.logger.info(f"OMNISCIENCE INITIALIZED: {result}")
            return result
        
        except Exception as e:
            self.logger.error(f"Omniscience initialization failed: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def update_omniscience(self) -> Dict[str, Any]:
        """
        Periodic update of omniscient knowledge.
        Checks for new releases, updates metadata, and refreshes rankings.
        """
        if not self.is_omniscient:
            return {"error": "Omniscient mode not initialized"}
        
        try:
            # Check for new releases
            new_releases = await self.release_monitor.check_for_new_releases()
            
            # Generate metadata for new releases
            metadata_generated = 0
            for release in new_releases:
                metadata = self.metadata_generator.generate_metadata(
                    {"mal_id": release.content_id, "title": release.title},
                    release.content_type
                )
                # Store metadata
                self.metadata_generator.config[release.content_id] = metadata
                release.metadata_generated = True
                metadata_generated += 1
            
            # Add new releases to indexes
            for release in new_releases:
                if release.content_type == "anime":
                    self.indexer.anime_index[release.content_id] = release.to_dict()
                else:
                    self.indexer.manga_index[release.content_id] = release.to_dict()
            
            # Update rankings
            all_content = {**self.indexer.anime_index, **self.indexer.manga_index}
            ranking_updates = self.ranking_system.update_rankings(all_content, self.metadata_generator.config)
            
            self.last_full_update = datetime.utcnow()
            
            return {
                "success": True,
                "new_releases_detected": len(new_releases),
                "metadata_generated": metadata_generated,
                "rankings_updated": ranking_updates,
                "updated_at": self.last_full_update.isoformat()
            }
        
        except Exception as e:
            self.logger.error(f"Omniscience update failed: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def get_omniscience_status(self) -> Dict[str, Any]:
        """Get current omniscience status"""
        return {
            "is_omniscient": self.is_omniscient,
            "omniscience_enabled_at": self.omniscience_enabled_at.isoformat() if self.omniscience_enabled_at else None,
            "last_full_update": self.last_full_update.isoformat() if self.last_full_update else None,
            "index_stats": self.indexer.get_index_stats(),
            "last_release_check": self.release_monitor.last_check.isoformat() if self.release_monitor.last_check else None,
            "rankings_summary": self.ranking_system.get_all_rankings_summary()
        }
    
    def search_omniscient_index(self, query: str, content_types: List[str] = None) -> List[Dict[str, Any]]:
        """Search across all omniscient knowledge"""
        if not self.is_omniscient:
            return []
        
        return self.indexer.search_index(query, content_types)
    
    def get_must_watch_list(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get the automatically maintained must-watch list"""
        ranked = self.ranking_system.rankings.get("must_watch", [])
        return [item.to_dict() for item in ranked[:limit]]
    
    def get_trending_now(self, limit: int = 25) -> List[Dict[str, Any]]:
        """Get currently trending content based on omniscient knowledge"""
        ranked = self.ranking_system.rankings.get("trending_now", [])
        return [item.to_dict() for item in ranked[:limit]]
    
    def get_hidden_gems(self, limit: int = 30) -> List[Dict[str, Any]]:
        """Get underrated hidden gems from omniscient index"""
        ranked = self.ranking_system.rankings.get("hidden_gems", [])
        return [item.to_dict() for item in ranked[:limit]]
    
    def get_genre_rankings(self, genre: str, limit: int = 25) -> List[Dict[str, Any]]:
        """Get ranked list for a specific genre"""
        ranked = self.ranking_system.rankings.get("by_genre", {}).get(genre, [])
        return [item.to_dict() for item in ranked[:limit]]
