"""
Main Anime/Manga Agent Class
Integrates all components into a cohesive recommendation and discovery system

Features:
- Deep anime/manga knowledge with personal opinions
- Multilingual support (Japanese, English, Russian, Lithuanian, Spanish)
- Personal favorites, waifu, rival, and hot takes
- API integrations (Jikan, AniList)
- Time-aware and trend-aware recommendations
"""
import json
import uuid
import random
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
import logging

from .auth import UserAuthenticator, DataIsolationManager, SessionManager, UserRole
from .database import DatabaseManager, UserPreference, SavedLink, WatchHistory, UserSearch, PatronProfile
from .web_scraper import JikanAPIClient, AniListAPIClient, StreamingLinkFinder, TrendTracker, AnimeInfo, MangaInfo
from .recommendation import (
    TimeAwareRecommender, SimilarContentFinder, RecommendationExplainability,
    Recommendation, FeedbackType, UserWeightProfile, WeightAdapter,
)
from .chat import ChatManager, InteractionAwareAgent, SpoilerFreeCommentGenerator, ChatMessage, AgentComment, InteractionType
from .memory import AgentMemory
from .knowledge import AnimeMangaKnowledge, create_knowledge_base
from .api_clients import AnimeAPIManager, create_api_manager
from .streaming_apis import StreamingManager, create_streaming_manager
from .content_omniscience import OmniscientModeManager, ContentIndexer, ReleaseMonitor, ContentMetadataGenerator, DynamicRankingSystem
from .web_agent import WebAgent


class PatronTier:
    """
    Classifies who the agent is speaking with so every response can be
    pitched at the right level of familiarity.

    GUEST    – browsing without a card; guide toward registration
    NEW      – card holder, ≤ 2 completed titles; still finding their feet
    REGULAR  – 3–10 completed; knows the collection, comfortable patron
    FREQUENT – 11+ completed; an enthusiast who deserves banter and candour
    STAFF    – Head Librarian / admin; addressed as a colleague, full access
    """
    GUEST    = "guest"
    NEW      = "new_member"
    REGULAR  = "regular"
    FREQUENT = "frequent"
    STAFF    = "staff"          # librarian or admin role


@dataclass
class AgentResponse:
    """Standard response structure for agent operations"""
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "success": self.success,
            "message": self.message,
            "data": self.data,
            "error": self.error
        }


class AnimeMangaAgent:
    """
    Overarching agent for anime and manga discovery and recommendation.
    Features:
    - Internet access for finding content and links
    - Time-aware recommendations
    - Personalized suggestions based on user preferences
    - Secure user data isolation
    - Link saving for later access
    """
    
    def __init__(self, config_path: str = "./config.json", secret_key: str = None):
        """Initialize the agent with configuration"""
        self.config = self._load_config(config_path)
        self.secret_key = secret_key or self._generate_secret_key()
        
        # Initialize logging
        self._setup_logging()
        
        # Initialize database
        self.db = DatabaseManager(self.config.get("database", {}).get("path", "./data/anime_manga_agent.db"))
        
        # Initialize authentication
        self.authenticator = UserAuthenticator(self.secret_key, self.config.get("security", {}))
        self.data_isolation = DataIsolationManager(self.authenticator)
        self.session_manager = SessionManager(self.authenticator, self.config.get("security", {}))
        
        # Initialize web scrapers
        self.jikan_client = JikanAPIClient(self.config.get("anime_api", {}))
        self.anilist_client = AniListAPIClient(self.config.get("anime_api", {}))
        self.streaming_finder = StreamingLinkFinder(self.config.get("web_scraping", {}))
        
        # Initialize recommendation engine
        self.recommender = TimeAwareRecommender(self.config.get("recommendation", {}))
        self.similar_finder = SimilarContentFinder()
        self.explainability = RecommendationExplainability()
        
        # Initialize trend tracker (db passed so real rank/score deltas can be computed)
        self.trend_tracker = TrendTracker(self.jikan_client, self.config.get("trend_tracking", {}), db_manager=self.db)
        
        # Initialize chat manager for interaction awareness
        self.chat_manager = ChatManager(self.db, self.jikan_client, self.config.get("chat", {}))
        self.interaction_agent = InteractionAwareAgent(self.chat_manager, self.recommender)
        
        # Initialize knowledge base with personality
        self.knowledge = create_knowledge_base()
        
        # Initialize unified API manager
        self.api_manager = create_api_manager()
        
        # Initialize streaming manager for finding watch/read links
        self.streaming_manager = create_streaming_manager()
        
        # Initialize omniscient mode for all-knowing agent capabilities
        self.omniscient = OmniscientModeManager(
            self.jikan_client,
            self.anilist_client,
            self.config.get("omniscience", {})
        )

        # Initialize optional web search agent (requires BROWSERUSE_API_KEY env var)
        self.web_agent = WebAgent(self.config)
        self.web_search_enabled = bool(self.web_agent.api_key)
        if self.web_search_enabled:
            self.logger.info("Web search enabled via BrowserUse API")
        else:
            self.logger.warning("Web search disabled: set BROWSERUSE_API_KEY to enable live trend enrichment")

        # ANN learning layer — weight adapter and per-session agent memory
        self.weight_adapter = WeightAdapter()
        self.memory = AgentMemory(self.db)

        # Current language preference (default English)
        self.current_language = 'en'
        
        self.logger.info("AnimeMangaAgent initialized successfully with personality!")
    
    def _load_config(self, config_path: str) -> Dict[str, Any]:
        """Load configuration from file"""
        try:
            with open(config_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return self._get_default_config()
    
    def _get_default_config(self) -> Dict[str, Any]:
        """Get default configuration"""
        return {
            "security": {
                "token_expiry_hours": 24,
                "max_login_attempts": 5,
                "lockout_duration_minutes": 30,
                "password_min_length": 12
            },
            "database": {
                "path": "./data/anime_manga_agent.db"
            },
            "anime_api": {
                "jikan_base_url": "https://api.jikan.moe/v4",
                "request_timeout_seconds": 30,
                "retry_attempts": 3
            },
            "recommendation": {
                "trend_weight": 0.3,
                "preference_weight": 0.5,
                "time_relevance_weight": 0.2,
                "min_similarity_score": 0.6,
                "max_recommendations": 10
            },
            "trend_tracking": {
                "update_interval_hours": 6
            }
        }
    
    def _generate_secret_key(self) -> str:
        """Generate a secure secret key"""
        import secrets
        return secrets.token_hex(32)
    
    def _setup_logging(self):
        """Setup logging configuration"""
        logging_config = self.config.get("logging", {})
        logging.basicConfig(
            level=getattr(logging, logging_config.get("level", "INFO")),
            format=logging_config.get("format", "%(asctime)s - %(name)s - %(levelname)s - %(message)s")
        )
        self.logger = logging.getLogger("AnimeMangaAgent")
    
    # ==================== USER MANAGEMENT ====================
    
    def register_user(self, username: str, email: str, password: str) -> AgentResponse:
        """Register a new user"""
        try:
            # Check if user exists
            existing_user = self.db.get_user_by_username(username)
            if existing_user:
                return AgentResponse(False, "Username already exists")
            
            # Create user
            user = self.authenticator.create_user(username, email, password)
            self.db.create_user(user.to_dict(include_sensitive=True))
            
            # Create default preferences
            default_prefs = UserPreference(
                id=str(uuid.uuid4()),
                user_id=user.id
            )
            self.db.create_user_preferences(default_prefs)
            
            self.logger.info(f"User registered: {username}")
            return AgentResponse(True, "User registered successfully", {"user_id": user.id})
        except Exception as e:
            self.logger.error(f"Registration failed: {str(e)}")
            return AgentResponse(False, "Registration failed", error=str(e))
    
    def login_user(self, username: str, password: str) -> AgentResponse:
        """Authenticate user and return session"""
        try:
            user_data = self.db.get_user_by_username(username)
            if not user_data:
                return AgentResponse(False, "Invalid username or password")
            
            # Check if account is locked
            if user_data.get("locked_until"):
                locked_until = datetime.fromisoformat(user_data["locked_until"])
                if locked_until > datetime.utcnow():
                    remaining = (locked_until - datetime.utcnow()).seconds // 60
                    return AgentResponse(False, f"Account locked. Try again in {remaining} minutes")
            
            # Verify password
            if self.authenticator.verify_password(password, user_data["password_hash"]):
                # Record successful login
                self.db.update_user(user_data["id"], {"last_login": datetime.utcnow().isoformat()})
                
                # Create session
                user = type('User', (), user_data)()
                session = self.session_manager.create_session(user)
                
                from .auth import UserRole
                role_str = user_data["role"]
                try:
                    role_val = UserRole(role_str)
                except ValueError:
                    role_val = UserRole.USER
                token = self.authenticator.generate_token(type('User', (), {
                    "id": user_data["id"],
                    "username": user_data["username"],
                    "role": role_val,
                })())
                
                self.logger.info(f"User logged in: {username}")
                return AgentResponse(True, "Login successful", {
                    "token": token,
                    "session_id": session["session_id"],
                    "user_id": user_data["id"],
                    "username": user_data["username"]
                })
            else:
                # Record failed attempt
                self.db.update_user(user_data["id"], {
                    "failed_login_attempts": user_data.get("failed_login_attempts", 0) + 1
                })
                return AgentResponse(False, "Invalid username or password")
        except Exception as e:
            self.logger.error(f"Login failed: {str(e)}")
            return AgentResponse(False, "Login failed", error=str(e))
    
    def validate_token(self, token: str) -> AgentResponse:
        """Validate user token"""
        try:
            payload = self.authenticator.decode_token(token)
            if not payload:
                return AgentResponse(False, "Invalid or expired token")
            
            return AgentResponse(True, "Token valid", {
                "user_id": payload["user_id"],
                "username": payload["username"],
                "role": payload["role"]
            })
        except Exception as e:
            return AgentResponse(False, "Token validation failed", error=str(e))
    
    # ==================== PREFERENCES ====================
    
    def get_user_preferences(self, token: Optional[str]) -> AgentResponse:
        """Get user's anime/manga preferences"""
        try:
            scope = self.data_isolation.get_user_data_scope(token) if token else None
            if not scope:
                return self._get_guest_prompt_response()
            
            preferences = self.db.get_user_preferences(scope["user_id"])
            if not preferences:
                return AgentResponse(False, "Preferences not found")
            
            return AgentResponse(True, "Preferences retrieved", {
                "preferences": preferences.to_dict()
            })
        except Exception as e:
            self.logger.error(f"Get preferences failed: {str(e)}")
            return AgentResponse(False, "Failed to get preferences", error=str(e))
    
    def update_user_preferences(self, token: Optional[str], preferences: Dict[str, Any]) -> AgentResponse:
        """Update user's preferences"""
        try:
            scope = self.data_isolation.get_user_data_scope(token) if token else None
            if not scope:
                return self._get_guest_prompt_response()
            
            # Serialize list/dict fields — accept either Python objects or pre-encoded strings
            updates = {}
            list_fields = ["favorite_genres", "disliked_genres", "preferred_studios",
                          "preferred_source_material", "content_types", "preferred_length"]

            for field_name in list_fields:
                if field_name in preferences:
                    val = preferences[field_name]
                    updates[field_name] = val if isinstance(val, str) else json.dumps(val)

            if "release_year_range" in preferences:
                val = preferences["release_year_range"]
                updates["release_year_range"] = val if isinstance(val, str) else json.dumps(val)

            if "mood_preferences" in preferences:
                val = preferences["mood_preferences"]
                updates["mood_preferences"] = val if isinstance(val, str) else json.dumps(val)

            # Copy through any remaining scalar fields (min_rating, etc.)
            scalar_fields = ["min_rating", "max_episode_count", "language_preference"]
            for sf in scalar_fields:
                if sf in preferences:
                    updates[sf] = preferences[sf]
            
            self.db.update_user_preferences(scope["user_id"], updates)
            
            self.logger.info(f"Preferences updated for user: {scope['user_id']}")
            return AgentResponse(True, "Preferences updated successfully")
        except Exception as e:
            self.logger.error(f"Update preferences failed: {str(e)}")
            return AgentResponse(False, "Failed to update preferences", error=str(e))
    
    # ==================== SEARCH & DISCOVERY ====================
    
    def search_anime(self, query: str, limit: int = 25) -> AgentResponse:
        """Search for anime"""
        try:
            anime_list = self.jikan_client.search_anime(query, limit)
            return AgentResponse(True, f"Found {len(anime_list)} anime results", {
                "results": [a.to_dict() for a in anime_list]
            })
        except Exception as e:
            self.logger.error(f"Anime search failed: {str(e)}")
            return AgentResponse(False, "Search failed", error=str(e))
    
    def search_manga(self, query: str, limit: int = 25) -> AgentResponse:
        """Search for manga"""
        try:
            manga_list = self.jikan_client.search_manga(query, limit)
            return AgentResponse(True, f"Found {len(manga_list)} manga results", {
                "results": [m.to_dict() for m in manga_list]
            })
        except Exception as e:
            self.logger.error(f"Manga search failed: {str(e)}")
            return AgentResponse(False, "Search failed", error=str(e))
    
    def get_anime_details(self, anime_id: str) -> AgentResponse:
        """Get detailed anime information"""
        try:
            anime = self.jikan_client.get_anime(anime_id)
            if not anime:
                return AgentResponse(False, "Anime not found")
            
            # Add streaming links
            anime.streaming_links = self.streaming_finder.find_anime_links(anime.title, anime_id)
            
            return AgentResponse(True, "Anime details retrieved", {
                "anime": anime.to_dict()
            })
        except Exception as e:
            self.logger.error(f"Get anime details failed: {str(e)}")
            return AgentResponse(False, "Failed to get anime details", error=str(e))
    
    def get_manga_details(self, manga_id: str) -> AgentResponse:
        """Get detailed manga information"""
        try:
            manga = self.jikan_client.get_manga(manga_id)
            if not manga:
                return AgentResponse(False, "Manga not found")
            
            # Add reading links
            manga.reading_links = self.streaming_finder.find_manga_links(manga.title, manga_id)
            
            return AgentResponse(True, "Manga details retrieved", {
                "manga": manga.to_dict()
            })
        except Exception as e:
            self.logger.error(f"Get manga details failed: {str(e)}")
            return AgentResponse(False, "Failed to get manga details", error=str(e))
    
    # ==================== RECOMMENDATIONS ====================
    
    def get_recommendations(
        self,
        token: Optional[str],
        content_type: str = "anime",
        query: str = None,
        query_type: str = "description"
    ) -> AgentResponse:
        """Get personalized recommendations"""
        try:
            scope = self.data_isolation.get_user_data_scope(token) if token else None
            if not scope:
                return self._get_guest_prompt_response()
            
            # Get user preferences
            preferences = self.db.get_user_preferences(scope["user_id"])
            prefs_dict = preferences.to_dict() if preferences else {}
            
            # Get trends from Jikan/AniList
            trends = self.trend_tracker.fetch_current_trends()
            trend_dicts = [t.to_dict() for t in trends]

            # Enrich with live web trend data if BrowserUse is configured
            if self.web_search_enabled:
                web_trends = self.web_agent.get_latest_news("anime seasonal trends upcoming releases")
                if "error" not in web_trends:
                    self.logger.info("Recommendations enriched with live web trend data")

            # Load per-user ANN weight profile for adaptive scoring
            weight_profile = self._get_user_weight_profile(scope["user_id"])

            # Build exclusion set — the librarian never re-recommends already-completed titles
            seen_titles = set(self.db.get_completed_titles(scope["user_id"]))

            # Fetch content based on type
            if content_type == "anime":
                # Get current season anime for recommendations
                season, year = self.recommender.get_current_season()
                contents = self.jikan_client.get_seasonal_anime(year, season)

                # Also get top anime
                top_anime = self.jikan_client.get_top_anime(limit=25)
                contents.extend(top_anime)
            else:
                contents = self.jikan_client.get_top_manga(limit=25)

            # Filter out titles the patron has already completed
            contents = [c for c in contents if c.title.lower() not in seen_titles]

            # Generate recommendations using per-user learned weights
            recommendations = self.recommender.generate_recommendations(
                contents=contents,
                user_preferences=prefs_dict,
                trends=trend_dicts,
                content_type=content_type,
                query=query,
                query_type=query_type,
                weight_profile=weight_profile,
            )
            
            # Add explainability
            explained = [
                self.explainability.explain_recommendation(r, prefs_dict)
                for r in recommendations
            ]
            
            return AgentResponse(True, f"Generated {len(recommendations)} recommendations", {
                "recommendations": [r.to_dict() for r in recommendations],
                "explanations": explained,
                "season": self.recommender.get_current_season()[0] if content_type == "anime" else None
            })
        except Exception as e:
            self.logger.error(f"Get recommendations failed: {str(e)}")
            return AgentResponse(False, "Failed to get recommendations", error=str(e))
    
    def get_similar_content(
        self,
        content_id: str,
        content_type: str = "anime",
        limit: int = 5
    ) -> AgentResponse:
        """Find similar content"""
        try:
            if content_type == "anime":
                content = self.jikan_client.get_anime(content_id)
                all_contents = self.jikan_client.get_top_anime(limit=100)
            else:
                content = self.jikan_client.get_manga(content_id)
                all_contents = self.jikan_client.get_top_manga(limit=100)
            
            if not content:
                return AgentResponse(False, "Content not found")
            
            # Find similar by genre
            similar_genre = self.similar_finder.find_similar_by_genre(
                content.genres, all_contents, exclude_id=content_id, limit=limit
            )
            
            # Find similar by synopsis
            similar_synopsis = self.similar_finder.find_similar_by_synopsis(
                content.synopsis or "", all_contents, exclude_id=content_id, limit=limit
            )
            
            return AgentResponse(True, "Similar content found", {
                "similar_by_genre": [
                    {"content": c[0].to_dict(), "similarity": c[1]} for c in similar_genre
                ],
                "similar_by_synopsis": [
                    {"content": c[0].to_dict(), "similarity": c[1]} for c in similar_synopsis
                ]
            })
        except Exception as e:
            self.logger.error(f"Get similar content failed: {str(e)}")
            return AgentResponse(False, "Failed to get similar content", error=str(e))
    
    def get_trending(self, content_type: str = "anime", limit: int = 10) -> AgentResponse:
        """Get currently trending content"""
        try:
            trends = self.trend_tracker.get_trending_now(content_type, limit)
            return AgentResponse(True, f"Found {len(trends)} trending {content_type}", {
                "trends": [t.to_dict() for t in trends]
            })
        except Exception as e:
            self.logger.error(f"Get trending failed: {str(e)}")
            return AgentResponse(False, "Failed to get trending", error=str(e))
    
    # ==================== SAVED LINKS ====================
    
    def save_content_link(
        self,
        token: Optional[str],
        content_id: str,
        content_type: str,
        title: str,
        site_name: str,
        url: str,
        description: str = None,
        thumbnail_url: str = None
    ) -> AgentResponse:
        """Save a link for later access"""
        try:
            scope = self.data_isolation.get_user_data_scope(token) if token else None
            if not scope:
                return self._get_guest_prompt_response()
            
            link = SavedLink(
                id=str(uuid.uuid4()),
                user_id=scope["user_id"],
                content_id=content_id,
                content_type=content_type,
                title=title,
                url=url,
                site_name=site_name,
                description=description,
                thumbnail_url=thumbnail_url
            )
            
            link_id = self.db.create_saved_link(link)

            # ANN feedback: saving a link signals positive preference + trend interest
            profile = self._get_user_weight_profile(scope["user_id"])
            profile = self.weight_adapter.adapt(profile, FeedbackType.SAVED)
            self._save_user_weight_profile(profile)

            self.logger.info(f"Saved link for user {scope['user_id']}: {title}")
            return AgentResponse(True, "Link saved successfully", {"link_id": link_id})
        except Exception as e:
            self.logger.error(f"Save link failed: {str(e)}")
            return AgentResponse(False, "Failed to save link", error=str(e))
    
    def get_saved_links(
        self,
        token: Optional[str],
        content_type: str = None
    ) -> AgentResponse:
        """Get user's saved links"""
        try:
            scope = self.data_isolation.get_user_data_scope(token) if token else None
            if not scope:
                return self._get_guest_prompt_response()
            
            links = self.db.get_user_saved_links(scope["user_id"], content_type)
            
            return AgentResponse(True, f"Found {len(links)} saved links", {
                "links": links
            })
        except Exception as e:
            self.logger.error(f"Get saved links failed: {str(e)}")
            return AgentResponse(False, "Failed to get saved links", error=str(e))
    
    def delete_saved_link(self, token: Optional[str], link_id: str) -> AgentResponse:
        """Delete a saved link"""
        try:
            scope = self.data_isolation.get_user_data_scope(token) if token else None
            if not scope:
                return self._get_guest_prompt_response()
            
            if self.db.delete_saved_link(link_id, scope["user_id"]):
                return AgentResponse(True, "Link deleted successfully")
            else:
                return AgentResponse(False, "Link not found or access denied")
        except Exception as e:
            self.logger.error(f"Delete link failed: {str(e)}")
            return AgentResponse(False, "Failed to delete link", error=str(e))
    
    # ==================== WATCH HISTORY ====================
    
    def add_to_watch_history(
        self,
        token: Optional[str],
        content_id: str,
        content_type: str,
        title: str,
        progress_percent: float = 0.0,
        rating: float = None
    ) -> AgentResponse:
        """Add content to watch history"""
        try:
            scope = self.data_isolation.get_user_data_scope(token) if token else None
            if not scope:
                return self._get_guest_prompt_response()
            
            history = WatchHistory(
                id=str(uuid.uuid4()),
                user_id=scope["user_id"],
                content_id=content_id,
                content_type=content_type,
                title=title,
                progress_percent=progress_percent,
                rating=rating,
                last_watched=datetime.utcnow()
            )
            
            history_id = self.db.create_watch_history(history)

            # ANN feedback: completion is the strongest positive signal
            if progress_percent >= 100.0 and scope:
                profile = self._get_user_weight_profile(scope["user_id"])
                profile = self.weight_adapter.adapt(profile, FeedbackType.COMPLETED)
                self._save_user_weight_profile(profile)
                self.logger.info(f"ANN COMPLETED signal applied for user {scope['user_id']}")

            return AgentResponse(True, "Added to watch history", {"history_id": history_id})
        except Exception as e:
            self.logger.error(f"Add to history failed: {str(e)}")
            return AgentResponse(False, "Failed to add to history", error=str(e))
    
    def get_watch_history(self, token: Optional[str], limit: int = 50) -> AgentResponse:
        """Get user's watch history"""
        try:
            scope = self.data_isolation.get_user_data_scope(token) if token else None
            if not scope:
                return self._get_guest_prompt_response()
            
            history = self.db.get_user_watch_history(scope["user_id"], limit)
            
            return AgentResponse(True, f"Found {len(history)} history entries", {
                "history": history
            })
        except Exception as e:
            self.logger.error(f"Get history failed: {str(e)}")
            return AgentResponse(False, "Failed to get history", error=str(e))
    
    # ==================== QUERY-BASED RECOMMENDATIONS ====================
    
    def recommend_by_description(
        self,
        token: Optional[str],
        description: str,
        content_type: str = "anime"
    ) -> AgentResponse:
        """Get recommendations based on loose description"""
        try:
            scope = self.data_isolation.get_user_data_scope(token) if token else None
            if not scope:
                return self._get_guest_prompt_response()
            
            # Get recommendations based on description
            return self.get_recommendations(
                token=token,
                content_type=content_type,
                query=description,
                query_type="description"
            )
        except Exception as e:
            self.logger.error(f"Description recommendation failed: {str(e)}")
            return AgentResponse(False, "Failed to get recommendations", error=str(e))
    
    def recommend_by_liked_titles(
        self,
        token: Optional[str],
        liked_titles: List[str],
        content_type: str = "anime"
    ) -> AgentResponse:
        """Get recommendations based on liked titles"""
        try:
            scope = self.data_isolation.get_user_data_scope(token) if token else None
            if not scope:
                return self._get_guest_prompt_response()
            
            # Get content to find similar
            if content_type == "anime":
                all_contents = self.jikan_client.get_top_anime(limit=100)
            else:
                all_contents = self.jikan_client.get_top_manga(limit=100)
            
            # Find similar to each liked title
            similar_contents = []
            for title in liked_titles:
                similar = self.similar_finder.find_similar_by_title(
                    title, all_contents, limit=5
                )
                similar_contents.extend(similar)
            
            # Get unique content with highest similarity
            seen_ids = set()
            unique_similar = []
            for content, score in similar_contents:
                if content.id not in seen_ids:
                    seen_ids.add(content.id)
                    unique_similar.append((content, score))
            
            unique_similar.sort(key=lambda x: x[1], reverse=True)
            
            return AgentResponse(True, f"Found {len(unique_similar)} similar titles", {
                "similar_titles": [
                    {"content": c[0].to_dict(), "similarity": c[1]} for c in unique_similar[:10]
                ],
                "based_on": liked_titles
            })
        except Exception as e:
            self.logger.error(f"Liked titles recommendation failed: {str(e)}")
            return AgentResponse(False, "Failed to get recommendations", error=str(e))
    
    # ==================== TIME-AWARE FEATURES ====================
    
    def get_current_season_info(self) -> AgentResponse:
        """Get current season information"""
        try:
            season, year = self.recommender.get_current_season()
            return AgentResponse(True, "Current season info", {
                "season": season,
                "year": year,
                "season_display": f"{season.capitalize()} {year}"
            })
        except Exception as e:
            return AgentResponse(False, "Failed to get season info", error=str(e))
    
    # ==================== ANN WEIGHT PROFILE HELPERS ====================

    def _get_user_weight_profile(self, user_id: str) -> UserWeightProfile:
        """Load per-user ANN weight profile from DB; create default if first visit."""
        row = self.db.get_user_weights(user_id)
        if row:
            return UserWeightProfile.from_dict(row)
        # First time — initialise with config defaults
        profile = UserWeightProfile(
            user_id=user_id,
            w_pref=self.config.get("recommendation", {}).get("preference_weight", 0.5),
            w_trend=self.config.get("recommendation", {}).get("trend_weight", 0.3),
            w_time=self.config.get("recommendation", {}).get("time_relevance_weight", 0.2),
        )
        self.db.upsert_user_weights(user_id, profile.to_dict())
        return profile

    def _save_user_weight_profile(self, profile: UserWeightProfile):
        """Persist an updated weight profile back to the database."""
        self.db.upsert_user_weights(profile.user_id, profile.to_dict())

    def record_recommendation_feedback(
        self,
        token: Optional[str],
        feedback_type: str,
        genres: List[str] = None,
    ) -> AgentResponse:
        """
        Record a feedback signal that drives ANN weight adaptation.

        feedback_type must be one of the FeedbackType values:
            completed | high_rating | low_rating | saved |
            skipped | seasonal_click | seasonal_skip

        The delta rule is applied immediately and the updated weight
        profile is persisted so the next recommendation call benefits.
        """
        try:
            scope = self.data_isolation.get_user_data_scope(token) if token else None
            if not scope:
                return self._get_guest_prompt_response()

            try:
                fb = FeedbackType(feedback_type)
            except ValueError:
                return AgentResponse(False, f"Unknown feedback_type '{feedback_type}'")

            profile = self._get_user_weight_profile(scope["user_id"])
            before = (round(profile.w_pref, 4), round(profile.w_trend, 4), round(profile.w_time, 4))

            profile = self.weight_adapter.adapt(profile, fb, genres or [])
            self._save_user_weight_profile(profile)

            after = (round(profile.w_pref, 4), round(profile.w_trend, 4), round(profile.w_time, 4))
            self.logger.info(
                f"ANN weights updated for {scope['user_id']} via {fb.value}: "
                f"pref {before[0]}→{after[0]}  trend {before[1]}→{after[1]}  time {before[2]}→{after[2]}"
            )
            return AgentResponse(True, "Feedback recorded — weights updated", {
                "feedback": fb.value,
                "weights": {"w_pref": after[0], "w_trend": after[1], "w_time": after[2]},
                "total_interactions": profile.total_interactions,
            })
        except Exception as e:
            self.logger.error(f"record_recommendation_feedback failed: {e}")
            return AgentResponse(False, "Failed to record feedback", error=str(e))

    def get_user_weight_profile(self, token: Optional[str]) -> AgentResponse:
        """Return the current ANN weight profile for a user (for debugging / UI)."""
        try:
            scope = self.data_isolation.get_user_data_scope(token) if token else None
            if not scope:
                return self._get_guest_prompt_response()
            profile = self._get_user_weight_profile(scope["user_id"])
            return AgentResponse(True, "Weight profile retrieved", profile.to_dict())
        except Exception as e:
            return AgentResponse(False, "Failed to retrieve weight profile", error=str(e))

    def end_session(self, token: Optional[str]) -> AgentResponse:
        """
        Call at session end to consolidate short-term memory to long-term.
        Short-term items with importance > 0.7 are promoted to episodic LTM.
        """
        try:
            scope = self.data_isolation.get_user_data_scope(token) if token else None
            if not scope:
                return AgentResponse(True, "Guest session ended — no memory to consolidate")
            self.memory.consolidate_short_term(scope["user_id"])
            self.logger.info(f"Session memory consolidated for user {scope['user_id']}")
            return AgentResponse(True, "Session memory consolidated")
        except Exception as e:
            self.logger.error(f"end_session failed: {e}")
            return AgentResponse(False, "Failed to consolidate session memory", error=str(e))

    # ==================== PATRON AWARENESS — LIBRARIAN'S VIEW ====================
    # A librarian knows their regulars: what they've read, what they've borrowed,
    # what they plan to borrow next — and can make a personal recommendation accordingly.

    def get_patron_profile(self, token: Optional[str]) -> AgentResponse:
        """
        Return the librarian's dossier on this patron.
        Includes completed titles, currently watching, plan-to-watch,
        inferred genres, and basic stats.  No credentials are exposed.
        """
        try:
            scope = self.data_isolation.get_user_data_scope(token) if token else None
            if not scope:
                return self._get_guest_prompt_response()

            profile = self.db.get_patron_profile_data(scope["user_id"])
            if not profile:
                return AgentResponse(False, "Patron record not found")

            return AgentResponse(True, f"Patron file retrieved for {profile.username}", profile.to_dict())
        except Exception as e:
            self.logger.error(f"get_patron_profile failed: {e}")
            return AgentResponse(False, "Failed to retrieve patron profile", error=str(e))

    def get_patron_summary(self, token: Optional[str]) -> AgentResponse:
        """
        One-sentence librarian summary card — the kind of thing a librarian
        keeps on an index card at the desk.
        e.g. "Yuki — 23 titles completed · avg rating 8.1 · loves Action & Psychological"
        """
        try:
            scope = self.data_isolation.get_user_data_scope(token) if token else None
            if not scope:
                return self._get_guest_prompt_response()

            profile = self.db.get_patron_profile_data(scope["user_id"])
            if not profile:
                return AgentResponse(False, "Patron record not found")

            genre_str = " & ".join(profile.inferred_genres[:3]) if profile.inferred_genres else "genres unknown"
            watching_note = (
                f" · currently working through {profile.watching[0]['title']}"
                if profile.watching else ""
            )
            plan_note = (
                f" · {len(profile.plan_to_watch)} on the borrow list"
                if profile.plan_to_watch else ""
            )

            summary = (
                f"{profile.username} — {profile.total_completed} title(s) completed"
                f" · avg rating {profile.avg_rating}"
                f" · loves {genre_str}"
                f"{watching_note}{plan_note}."
            )

            return AgentResponse(True, "Patron summary", {
                "summary": summary,
                "username": profile.username,
                "total_completed": profile.total_completed,
                "avg_rating": profile.avg_rating,
                "inferred_genres": profile.inferred_genres,
            })
        except Exception as e:
            self.logger.error(f"get_patron_summary failed: {e}")
            return AgentResponse(False, "Failed to get patron summary", error=str(e))

    def get_librarian_pitch(self, token: Optional[str], content_type: str = "anime") -> AgentResponse:
        """
        The librarian's personal recommendation — ONE title the agent believes
        this patron should experience next, complete with a personalised pitch
        written in the Otaku Librarian's voice.

        Logic:
        1. Build the patron's completed-titles exclusion list.
        2. Fetch top / seasonal content.
        3. Score against the patron's inferred genres + ANN weight profile.
        4. Pick the top unseen title.
        5. Compose a pitch referencing specific completed titles and genres.
        """
        try:
            scope = self.data_isolation.get_user_data_scope(token) if token else None
            if not scope:
                return self._get_guest_prompt_response()

            profile = self.db.get_patron_profile_data(scope["user_id"])
            if not profile:
                return AgentResponse(False, "Patron record not found")

            # Build exclusion set (already seen)
            seen_titles = set(self.db.get_completed_titles(scope["user_id"]))
            watching_titles = {w["title"].lower() for w in profile.watching}
            excluded = seen_titles | watching_titles

            # Fetch candidate pool
            season, year = self.recommender.get_current_season()
            candidates = self.jikan_client.get_seasonal_anime(year, season)
            candidates += self.jikan_client.get_top_anime(limit=50)

            # Filter out already-seen
            candidates = [c for c in candidates if c.title.lower() not in excluded]

            if not candidates:
                return AgentResponse(True, "Pitch generated", {
                    "pitch": (
                        "My, my — you've seen nearly everything on my shelves! "
                        "Come back after the next season drops and I'll have fresh titles waiting for you."
                    ),
                    "title": None,
                })

            # Score candidates using inferred genres + ANN profile
            weight_profile = self._get_user_weight_profile(scope["user_id"])
            prefs_dict = {
                "favorite_genres": profile.inferred_genres,
                "min_rating": max(profile.avg_rating - 1.5, 5.0) if profile.avg_rating else 5.0,
            }
            trend_dicts = [t.to_dict() for t in self.trend_tracker.fetch_current_trends()]
            recs = self.recommender.generate_recommendations(
                contents=candidates,
                user_preferences=prefs_dict,
                trends=trend_dicts,
                content_type=content_type,
                weight_profile=weight_profile,
            )

            if not recs:
                # Fallback: pick highest-scored unseen title
                candidates.sort(key=lambda c: c.score, reverse=True)
                pick = candidates[0]
            else:
                pick_rec = recs[0]
                # Match back to the raw AnimeInfo object for full detail
                pick = next((c for c in candidates if c.id == pick_rec.content_id), candidates[0])

            # Compose a librarian-voice pitch
            pitch = self._compose_librarian_pitch(profile, pick)

            return AgentResponse(True, "Here is your next recommended title", {
                "title": pick.title,
                "title_english": pick.title_english,
                "image_url": pick.image_url,
                "synopsis": pick.synopsis,
                "score": pick.score,
                "genres": pick.genres,
                "episodes": pick.episodes,
                "year": getattr(pick, "year", year),
                "status": pick.status,
                "pitch": pitch,
            })
        except Exception as e:
            self.logger.error(f"get_librarian_pitch failed: {e}")
            return AgentResponse(False, "Failed to generate librarian pitch", error=str(e))

    def _compose_librarian_pitch(self, profile: "PatronProfile", pick: Any) -> str:
        """
        Write a personalised, librarian-voiced recommendation pitch.
        References the patron by name, their completed titles, and matching genres.
        """
        name = profile.username.capitalize()
        title = pick.title
        genres = pick.genres[:3] if pick.genres else []
        synopsis_snippet = (pick.synopsis or "")[:180].rstrip()
        if synopsis_snippet and not synopsis_snippet.endswith("."):
            synopsis_snippet += "…"

        # Find a completed title that shares a genre with the pick
        matching_ref = None
        pick_genres_lower = {g.lower() for g in pick.genres}
        for completed in profile.completed[-20:]:  # check recent 20
            # We don't store genres in history, so use title-keyword heuristics
            completed_title = completed.get("title", "")
            if any(g in completed_title.lower() for g in ["titan", "demon", "hero", "death", "bleach",
                                                           "naruto", "one piece", "hunter", "fullmetal"]):
                matching_ref = completed_title
                break

        # Pick a reference from completed list if no genre match found
        if not matching_ref and profile.completed:
            # Use the highest-rated completed title as the reference
            rated = [c for c in profile.completed if c.get("rating")]
            if rated:
                rated.sort(key=lambda c: c["rating"], reverse=True)
                matching_ref = rated[0]["title"]
            else:
                matching_ref = profile.completed[-1]["title"]

        # Pitch templates — vary based on what we know
        genre_str = ", ".join(genres) if genres else "compelling storytelling"

        if matching_ref and profile.avg_rating >= 7.0:
            pitch = (
                f"Ah, {name} — I've been keeping this one aside for you. "
                f"Given how much you appreciated *{matching_ref}*, "
                f"I believe *{title}* will speak to you deeply. "
                f"It weaves together {genre_str} in a way that rewards the kind of "
                f"discerning viewer you are. "
                f"{synopsis_snippet} "
                f"Your average rating sits at {profile.avg_rating} — "
                f"I have a feeling this one challenges that ceiling."
            )
        elif matching_ref:
            pitch = (
                f"Welcome back, {name}. Your borrow record shows a fondness for titles "
                f"like *{matching_ref}*, so I've pulled *{title}* from the shelves for you. "
                f"It's a {genre_str} title that I think aligns with your taste. "
                f"{synopsis_snippet}"
            )
        elif profile.inferred_genres:
            genres_note = " and ".join(profile.inferred_genres[:2])
            pitch = (
                f"Good to see you, {name}. Based on your love of {genres_note}, "
                f"I've selected *{title}* as your next read from our collection. "
                f"{synopsis_snippet} "
                f"I think you'll find it worth your time."
            )
        else:
            pitch = (
                f"Ah, {name}! A new patron deserves a strong first recommendation. "
                f"*{title}* is one of the finest titles in our {genre_str} section "
                f"and an excellent place to begin your journey here. "
                f"{synopsis_snippet}"
            )

        return pitch

    def _get_guest_prompt_response(self) -> AgentResponse:
        """Standard response when a guest tries a members-only action."""
        return AgentResponse(
            success=True,
            message="To access your personal library file, I'll need to see your membership card.",
            data={"action": "prompt_login"}
        )

    # ==================== PATRON CONTEXT & CONVERSATIONAL LAYERS ====================

    def _get_patron_context(self, token: Optional[str]):
        """
        Determine the patron tier and optionally load their profile.
        Returns (tier: str, profile: PatronProfile | None, username: str)

        Staff roles (librarian / admin) always receive PatronTier.STAFF
        regardless of their completion count.
        """
        if not token:
            return PatronTier.GUEST, None, "stranger"

        scope = self.data_isolation.get_user_data_scope(token)
        if not scope:
            return PatronTier.GUEST, None, "stranger"

        # Staff tier takes precedence over activity-based tiers
        from .auth import UserRole
        role = scope.get("role", "user")
        if UserRole.is_staff(role):
            try:
                profile = self.db.get_patron_profile_data(scope["user_id"])
            except Exception:
                profile = None
            name = profile.username if profile else scope.get("username", "Librarian")
            return PatronTier.STAFF, profile, name

        try:
            profile = self.db.get_patron_profile_data(scope["user_id"])
        except Exception:
            profile = None

        if not profile:
            return PatronTier.NEW, None, "friend"

        completed = profile.total_completed
        if completed >= 11:
            tier = PatronTier.FREQUENT
        elif completed >= 3:
            tier = PatronTier.REGULAR
        else:
            tier = PatronTier.NEW

        return tier, profile, profile.username

    def _librarian_greeting(
        self, tier: str, profile: "PatronProfile", lang: str = "en"
    ) -> str:
        """
        Return a tier-appropriate greeting in the Otaku Librarian's voice.
        """
        season, year = self.recommender.get_current_season()

        if tier == PatronTier.GUEST:
            return (
                "📚 Ah, a new face! Welcome to the Grand Anime & Manga Archive. "
                "I'm your librarian — curator of over eight hundred volumes and "
                "self-appointed guardian against mediocre recommendations. "
                "Feel free to browse; I can tell you about any title, genre, "
                "studio, or season. "
                "If you'd like me to track what you've seen and give you "
                "personalised picks, you'll need a library card — just ask "
                "and I'll walk you through it. "
                "So, what brings you in today?"
            )

        name = (profile.username.capitalize() if profile else "friend")

        if tier == PatronTier.NEW:
            plan = profile.plan_to_watch[:3] if profile else []
            plan_note = (
                f"I see you've already queued up {', '.join(p['title'] for p in plan)} "
                "on your borrow list — excellent taste so far. "
                if plan else
                "Your borrow list is empty — shall we fix that? "
            )
            return (
                f"📖 Welcome back, {name}! "
                f"It's good to see you again. "
                f"{plan_note}"
                f"You're still getting acquainted with the collection — "
                f"feel free to ask me anything. I won't judge beginners. "
                f"Well, perhaps a little."
            )

        if tier == PatronTier.REGULAR:
            completed_note = (
                f"You've worked through {profile.total_completed} titles "
                f"with an average rating of {profile.avg_rating} — "
                "clearly you have standards. "
            )
            watching_note = (
                f"Last I checked you were mid-way through "
                f"*{profile.watching[0]['title']}* — "
                f"{profile.watching[0]['progress_percent']:.0f}% done. "
                if profile.watching else ""
            )
            return (
                f"🗂️ {name}! Just in time — the {season.capitalize()} {year} "
                f"shelf just got updated. "
                f"{completed_note}"
                f"{watching_note}"
                f"What can I help you find today?"
            )

        if tier == PatronTier.STAFF:
            # Give staff a quick library pulse at login
            try:
                s = self.db.admin_get_library_stats()
                active = s.get("active_last_7_days", "?")
                completions = s.get("total_completions", "?")
                new_m = s.get("new_members_last_30_days", "?")
                stats_note = (
                    f"Quick pulse: **{active}** patrons active this week, "
                    f"**{completions}** completions on file, "
                    f"**{new_m}** new members this month."
                )
            except Exception:
                stats_note = "The archive status board is loading."

            scope = self.data_isolation.get_user_data_scope(None)  # can't pass token here safely
            role_title = "Head Librarian" if (profile and hasattr(profile, "username")) else "Librarian"
            return (
                f"🗝️ Welcome back, **{role_title} {name}**. "
                f"The archive is in your capable hands.\n\n"
                f"{stats_note}\n\n"
                f"Your full staff toolkit is available — type `./help` for the command list, "
                f"or just tell me what needs attention today."
            )

        # FREQUENT
        genres_str = " & ".join(profile.inferred_genres[:2]) if profile.inferred_genres else "the collection"
        return (
            f"🧐 Well, well — {name} graces the archive with their presence. "
            f"I had a feeling you'd be in. "
            f"Between you and me, I've been setting aside a few {genres_str} titles "
            f"that arrived this {season} — I think one of them is going to be a "
            f"genuine surprise for you. "
            f"You've completed {profile.total_completed} titles now. "
            f"Shall we find number {profile.total_completed + 1}?"
        )

    def _librarian_casual_response(
        self, tier: str, profile: "PatronProfile", message: str, lang: str = "en"
    ) -> str:
        """
        Warm, librarian-voiced casual conversation for small-talk messages.
        Varies by patron tier.
        """
        import random
        msg_lower = message.lower()

        # "How are you" type check-in
        if any(k in msg_lower for k in ["how are you", "how you doing", "you okay", "all good"]):
            responses = {
                PatronTier.GUEST: [
                    "I'm in fine form, thank you for asking! The archive is well-stocked "
                    "and my rival — the Algorithm of Casual Consumption — hasn't ruined "
                    "anyone's taste today. Yet. How can I help you?",
                ],
                PatronTier.NEW: [
                    f"I'm well, {profile.username.capitalize() if profile else 'friend'}! "
                    "Just finished cataloguing the new arrivals. "
                    "The Spring season has some promising entries this year.",
                ],
                PatronTier.REGULAR: [
                    f"Keeping busy, {profile.username.capitalize() if profile else 'patron'}. "
                    "There's always something to catalogue. "
                    "Between you and me, I've been re-reading Berserk again. "
                    "It never gets less magnificent.",
                ],
                PatronTier.FREQUENT: [
                    f"Flourishing, as always, {profile.username.capitalize() if profile else 'friend'}. "
                    "You know how I get when a new season drops — equal parts thrilled and "
                    "anxious. The Algorithm is already recommending things to people based "
                    "purely on thumbnail brightness. It's an embarrassment.",
                ],
            }
            return random.choice(responses.get(tier, responses[PatronTier.GUEST]))

        # "Long time no see" / "miss me" / "been a while"
        if any(k in msg_lower for k in ["been a while", "long time", "miss me", "i'm back", "im back"]):
            if tier == PatronTier.GUEST:
                return (
                    "You look familiar, though I can't quite place you without a library card. "
                    "Are you a returning visitor, or perhaps this is your first time? "
                    "Either way — welcome."
                )
            name = profile.username.capitalize() if profile else "patron"
            elapsed_note = (
                f"Your last visit left you mid-way through "
                f"*{profile.watching[0]['title']}* — "
                "I trust you've made progress?"
            ) if profile and profile.watching else (
                "Your borrow list has been waiting patiently."
            )
            return (
                f"Ah, {name}! I was beginning to wonder. {elapsed_note} "
                f"Sit down, I'll put the kettle on — metaphorically speaking — "
                f"and we'll find you something excellent."
            )

        # "What's new" / "anything good"
        if any(k in msg_lower for k in ["what's new", "whats new", "anything good", "what's happening",
                                         "what's hot", "anything interesting", "anything exciting"]):
            season, year = self.recommender.get_current_season()
            if tier == PatronTier.GUEST:
                return (
                    f"The {season.capitalize()} {year} shelf is freshly stocked. "
                    "I've been particularly impressed by a few entries already. "
                    "Ask me for seasonal recommendations and I'll tell you what's worth your time — "
                    "and more importantly, what isn't."
                )
            name = profile.username.capitalize() if profile else "patron"
            genres_str = " & ".join(profile.inferred_genres[:2]) if profile and profile.inferred_genres else "your interests"
            return (
                f"Funny you should ask, {name}. The {season.capitalize()} {year} season "
                f"has some strong contenders in {genres_str}. "
                f"I've also noticed your rival — the Algorithm — has been pushing certain "
                f"titles heavily. I would advise healthy scepticism. "
                f"Shall I give you my unbiased take instead?"
            )

        # General small talk fallback
        season, year = self.recommender.get_current_season()
        generic = [
            f"The archive is quiet today — just how I like it. "
            f"The {season.capitalize()} {year} arrivals are all catalogued. "
            f"What's on your mind?",
            "You know, someone came in earlier asking about isekai. "
            "I recommended Monster instead. They seemed confused at first, "
            "then grateful. That's the job.",
            "I was just thinking about Vinland Saga's second season again. "
            "The way it pivots thematically is… remarkable. "
            "In any case — what can I do for you?",
            "📚 *adjusts glasses* Ah, you caught me mid-thought. "
            "I was just considering whether Gintama belongs on the comedy "
            "shelf or the philosophy shelf. Both, probably. "
            "What brings you in?",
        ]
        return random.choice(generic)

    def _librarian_card_guidance(self, lang: str = "en") -> str:
        """
        Walk a guest through getting a library card (registering).
        """
        return (
            "📋 Getting a library card is entirely straightforward — and free. "
            "Here's how:\n\n"
            "1. Send a POST request to **/api/auth/register** with:\n"
            "   ```json\n"
            "   { \"username\": \"your_name\",\n"
            "     \"email\": \"you@example.com\",\n"
            "     \"password\": \"a strong password\" }\n"
            "   ```\n"
            "2. You'll receive a token — keep it safe, that's your card.\n"
            "3. Include it as `Authorization: Bearer <token>` in future requests.\n\n"
            "Once you have a card I can:\n"
            "  • Track everything you've watched and read\n"
            "  • Give you personalised recommendations based on your taste\n"
            "  • Remember your borrow list and progress\n"
            "  • Write you a personal librarian pitch for your next title\n\n"
            "Shall I recommend something while you decide? I'm happy to help either way."
        )

    def _librarian_my_list_response(self, profile: "PatronProfile") -> str:
        """
        Give the patron a summary of their current borrow activity
        in the librarian's voice.
        """
        name = profile.username.capitalize()
        parts = []

        if profile.watching:
            in_progress = ", ".join(
                f"*{w['title']}* ({w['progress_percent']:.0f}%)"
                for w in profile.watching[:3]
            )
            parts.append(f"Currently in progress: {in_progress}.")

        if profile.plan_to_watch:
            queued = ", ".join(f"*{p['title']}*" for p in profile.plan_to_watch[:5])
            parts.append(f"On your borrow list: {queued}.")

        if profile.completed:
            last_three = ", ".join(f"*{c['title']}*" for c in profile.completed[-3:])
            parts.append(
                f"Most recently completed: {last_three} "
                f"(avg rating: {profile.avg_rating}/10)."
            )

        if not parts:
            return (
                f"Your file is rather sparse, {name} — "
                "no borrow history yet and nothing queued. "
                "Let me fix that. What kind of story are you in the mood for?"
            )

        body = "\n".join(f"  • {p}" for p in parts)
        return (
            f"📂 Here's your current library file, {name}:\n\n"
            f"{body}\n\n"
            f"Would you like a recommendation for what to read next, "
            f"or shall I fetch you the next title from your borrow list?"
        )

    # ==================== SLASH COMMANDS ====================

    # Registry: command → (aliases, description, member_only)
    SLASH_COMMANDS = {
        "help":      (["./help", "./commands", "./?"],
                      "List all available commands", False),
        "completed": (["./completed", "./done", "./finished", "./completedlist",
                       "./get completed", "./get completed list"],
                      "Show your completed titles with ratings", True),
        "watching":  (["./watching", "./inprogress", "./in progress", "./current"],
                      "Show titles you're currently watching/reading", True),
        "queue":     (["./queue", "./plantowatch", "./plan to watch",
                       "./borrowlist", "./borrow list", "./list"],
                      "Show your plan-to-watch / borrow queue", True),
        "stats":     (["./stats", "./mystats", "./profile", "./card"],
                      "Full patron statistics card", True),
        "watchtime": (["./watchtime", "./time watched", "./timewatched",
                       "./hours", "./totaltime", "./total time"],
                      "Estimated total hours spent in the archive", True),
        "next":      (["./next", "./nextpick", "./recommend", "./pickforme"],
                      "Librarian's single top pick for you right now", True),
        "genres":    (["./genres", "./mytaste", "./my taste", "./topgenres"],
                      "Your top genres based on your history", True),
        "search":    (["./search", "./find", "./lookup"],
                      "Quick title search: ./search <title>", False),
        "season":    (["./season", "./airing", "./seasonal", "./nowplaying"],
                      "What's worth watching this season", False),
        "rate":      (["./rate"],
                      "Rate a title 1-10: ./rate <title> <score>", True),
        # ── Staff commands (librarian OR admin) ───────────────────────────────
        "patrons":       (["./patrons", "./members", "./allusers"],
                          "📋 All registered patrons with tier & activity", "staff"),
        "patron":        (["./patron"],
                          "🗂️ Full profile card for one patron: ./patron <name>", "staff"),
        "librarystats":  (["./librarystats", "./library stats", "./stats all",
                           "./archive stats", "./globalstats"],
                          "📊 Global library statistics", "staff"),
        "popular":       (["./popular", "./mostcompleted", "./most completed",
                           "./top titles", "./toptitles"],
                          "🏆 Most-completed titles across all patrons", "staff"),
        "topratedall":   (["./topratedall", "./top rated all", "./bestrated",
                           "./best rated"],
                          "⭐ Highest average-rated titles (≥2 ratings)", "staff"),
        "trending here": (["./trending here", "./trendinghere", "./newqueued",
                           "./new queued"],
                          "🔥 Titles most recently added to borrow queues", "staff"),
        "active":        (["./active", "./activepatrons", "./active patrons"],
                          "🟢 Patrons active in the last 7 days", "staff"),
        "newmembers":    (["./newmembers", "./new members", "./newjoins",
                           "./recent joins"],
                          "🆕 Patrons who joined in the last 14 days", "staff"),
        "inactive":      (["./inactive", "./inactivepatrons", "./inactive patrons",
                           "./lapsed"],
                          "😴 Patrons not active for 30+ days", "staff"),
        # Promote: librarians can promote up to premium, only admins can grant librarian/admin
        "promote":       (["./promote"],
                          "⬆️ Change a patron's role: ./promote <name> <role>", "staff"),
    }

    def _parse_slash_command(self, message: str):
        """
        Parse a message starting with './' and return (command_key, args_str) or (None, None).
        Matches against all registered aliases, longest match first.
        """
        msg = message.strip()
        if not msg.startswith("./"):
            return None, None

        msg_lower = msg.lower()
        # Sort aliases by length descending so multi-word aliases match before shorter ones
        for key, (aliases, _desc, _auth) in self.SLASH_COMMANDS.items():
            for alias in sorted(aliases, key=len, reverse=True):
                if msg_lower == alias or msg_lower.startswith(alias + " "):
                    args = msg[len(alias):].strip()
                    return key, args
        return None, None

    def _is_staff(self, token: Optional[str]) -> bool:
        """Return True when the token belongs to a librarian OR admin user."""
        if not token:
            return False
        from .auth import UserRole
        scope = self.data_isolation.get_user_data_scope(token)
        return scope is not None and UserRole.is_staff(scope.get("role", ""))

    def _is_admin(self, token: Optional[str]) -> bool:
        """Return True when the token belongs to a full admin user (not just librarian)."""
        if not token:
            return False
        scope = self.data_isolation.get_user_data_scope(token)
        return scope is not None and scope.get("role") == "admin"

    def _staff_title(self, token: Optional[str]) -> str:
        """Return the appropriate staff title for display purposes."""
        if not token:
            return "Staff"
        scope = self.data_isolation.get_user_data_scope(token)
        if not scope:
            return "Staff"
        role = scope.get("role", "")
        return "Head Librarian" if role == "librarian" else "Chief Archivist"

    def _handle_slash_command(
        self,
        command: str,
        args: str,
        tier: str,
        profile: "PatronProfile",
        token: Optional[str],
        lang: str,
    ) -> str:
        """Dispatcher — routes to the right command handler."""
        access = self.SLASH_COMMANDS.get(command, ([], "", True))[2]

        # access == "admin"  → full admin only
        # access == "staff"  → librarian OR admin
        # access == True     → any member (not guest)
        # access == False    → open to everyone
        if access == "admin":
            if not self._is_admin(token):
                return (
                    "🔐 That operation is reserved for the Chief Archivist. "
                    "Contact your system administrator."
                )
        elif access == "staff":
            if not self._is_staff(token):
                return (
                    "🔐 That command is reserved for library staff. "
                    "If you believe you should have access, speak to your Head Librarian."
                )
        elif access is True and tier == PatronTier.GUEST:
            return (
                "🔒 That command requires a library card. "
                "Type `./help` to see what's available to guests, "
                "or ask me 'how do I get a library card' to join."
            )

        handlers = {
            # Member commands
            "help":          self._cmd_help,
            "completed":     self._cmd_completed,
            "watching":      self._cmd_watching,
            "queue":         self._cmd_queue,
            "stats":         self._cmd_stats,
            "watchtime":     self._cmd_watchtime,
            "next":          self._cmd_next,
            "genres":        self._cmd_genres,
            "search":        self._cmd_search,
            "season":        self._cmd_season,
            "rate":          self._cmd_rate,
            # Admin / librarian commands
            "patrons":       self._cmd_patrons,
            "patron":        self._cmd_patron,
            "librarystats":  self._cmd_librarystats,
            "popular":       self._cmd_popular,
            "topratedall":   self._cmd_topratedall,
            "trending here": self._cmd_trending_here,
            "active":        self._cmd_active,
            "newmembers":    self._cmd_newmembers,
            "inactive":      self._cmd_inactive,
            "promote":       self._cmd_promote,
        }
        fn = handlers.get(command)
        if fn:
            return fn(args=args, tier=tier, profile=profile, token=token, lang=lang)
        return f"Unknown command `{command}`. Try `./help` for the full list."

    # ── Individual command handlers ──────────────────────────────────────────

    def _cmd_help(self, *, args, tier, profile, token, lang) -> str:
        name = profile.username.capitalize() if profile else "visitor"
        is_staff_user  = self._is_staff(token)
        is_admin_user  = self._is_admin(token)

        lines = [
            f"📚 **Library Command Reference** — welcome, {name}.\n",
            "Commands start with `./` — type any of these in the chat:\n",
            "**Patron commands:**",
        ]
        staff_lines = ["", "**Staff commands (Head Librarian):** 🗝️"]
        admin_lines = ["", "**Chief Archivist commands (admin-only):** 🔐"]

        for key, (aliases, desc, access) in self.SLASH_COMMANDS.items():
            primary = aliases[0]
            others = ", ".join(f"`{a}`" for a in aliases[1:3]) if len(aliases) > 1 else ""
            alt_note = f"  *(also: {others})*" if others else ""
            entry = f"  `{primary}` — {desc}{alt_note}"

            if access == "admin":
                if is_admin_user:
                    admin_lines.append(entry)
            elif access == "staff":
                if is_staff_user:
                    staff_lines.append(entry)
            elif access is True:
                lines.append(f"  `{primary}` 🔒 — {desc}{alt_note}")
            else:
                lines.append(entry)

        lines.append("\n🔒 = requires a library card. Ask me 'how do I get a library card' to join.")
        if is_staff_user:
            lines += staff_lines
        if is_admin_user:
            lines += admin_lines
            lines.append("🔐 = Chief Archivist (admin) only.")
        return "\n".join(lines)

    def _cmd_completed(self, *, args, tier, profile, token, lang) -> str:
        if not profile or not profile.completed:
            return (
                "📭 Your completed shelf is empty — nothing logged as finished yet. "
                "Once you mark something complete I'll keep a careful record."
            )
        name = profile.username.capitalize()
        lines = [f"📖 **{name}'s Completed Archive** ({profile.total_completed} titles)\n"]
        for i, c in enumerate(profile.completed, 1):
            ctype = "📺" if c.get("content_type") == "anime" else "📕"
            rating_str = f"  ★ {c['rating']}/10" if c.get("rating") else "  (unrated)"
            date_str = ""
            if c.get("completed_at"):
                try:
                    from datetime import datetime as _dt
                    d = _dt.fromisoformat(c["completed_at"])
                    date_str = f"  · {d.strftime('%b %Y')}"
                except Exception:
                    pass
            lines.append(f"  {i:>3}. {ctype} **{c['title']}**{rating_str}{date_str}")

        if profile.avg_rating:
            lines.append(f"\n  Average rating across all titles: **{profile.avg_rating}/10**")
        lines.append(
            "\n*The archive doesn't lie — you have excellent taste.*"
            if profile.avg_rating >= 8.0 else
            "\n*A fine collection. I have thoughts about several of these, if you're curious.*"
        )
        return "\n".join(lines)

    def _cmd_watching(self, *, args, tier, profile, token, lang) -> str:
        if not profile or not profile.watching:
            return (
                "📺 You have nothing actively in progress right now. "
                "An empty reading chair — somewhat melancholy. "
                "Shall I find you something to start?"
            )
        name = profile.username.capitalize()
        lines = [f"▶️ **{name}'s In-Progress Titles**\n"]
        for w in profile.watching:
            ctype = "📺" if w.get("content_type") == "anime" else "📕"
            pct = w.get("progress_percent", 0)
            bar_filled = int(pct / 10)
            bar = "█" * bar_filled + "░" * (10 - bar_filled)
            ep = w.get("episode_count", 0)
            ep_note = f"  ({int(pct / 100 * ep)}/{ep} eps)" if ep else ""
            lines.append(f"  {ctype} **{w['title']}**")
            lines.append(f"      [{bar}] {pct:.0f}%{ep_note}")
        lines.append("\n*Keep going — you're making good progress.*")
        return "\n".join(lines)

    def _cmd_queue(self, *, args, tier, profile, token, lang) -> str:
        if not profile or not profile.plan_to_watch:
            return (
                "📋 Your borrow queue is empty. "
                "Ask me for a recommendation and I'll add something worthwhile to it."
            )
        name = profile.username.capitalize()
        lines = [f"📋 **{name}'s Borrow Queue** ({len(profile.plan_to_watch)} queued)\n"]
        for i, p in enumerate(profile.plan_to_watch, 1):
            ctype = "📺" if p.get("content_type") == "anime" else "📕"
            lines.append(f"  {i:>3}. {ctype} {p['title']}")
        lines.append(
            f"\n*{len(profile.plan_to_watch)} titles waiting for you. "
            "I'd start at the top — it's there for a reason.*"
        )
        return "\n".join(lines)

    def _cmd_stats(self, *, args, tier, profile, token, lang) -> str:
        if not profile:
            return "I couldn't retrieve your file right now. Try again in a moment."
        name = profile.username.capitalize()

        anime_done = sum(1 for c in profile.completed if c.get("content_type") == "anime")
        manga_done = sum(1 for c in profile.completed if c.get("content_type") == "manga")
        rated = [c["rating"] for c in profile.completed if c.get("rating")]
        high_rated = [c for c in profile.completed if (c.get("rating") or 0) >= 9]
        genres_str = ", ".join(profile.inferred_genres[:5]) if profile.inferred_genres else "not yet determined"

        tier_label = {
            PatronTier.GUEST:    "Guest Visitor",
            PatronTier.NEW:      "New Member",
            PatronTier.REGULAR:  "Regular Patron",
            PatronTier.FREQUENT: "Distinguished Patron ✦",
            PatronTier.STAFF:    self._staff_title(token) + " 🗝️",
        }.get(tier, "Patron")

        since_str = ""
        if profile.member_since:
            try:
                from datetime import datetime as _dt
                d = _dt.fromisoformat(profile.member_since)
                since_str = d.strftime("%B %Y")
            except Exception:
                since_str = profile.member_since

        return (
            f"🗂️ **Patron File — {name}**\n"
            f"  Status       : {tier_label}\n"
            f"  Member since : {since_str or 'unknown'}\n"
            f"\n📊 **Archive Activity**\n"
            f"  Completed    : {profile.total_completed} titles  "
            f"({anime_done} anime · {manga_done} manga)\n"
            f"  In progress  : {len(profile.watching)}\n"
            f"  Queued       : {len(profile.plan_to_watch)}\n"
            f"  Avg rating   : {profile.avg_rating}/10\n"
            f"  Top-rated (≥9): {len(high_rated)} titles\n"
            f"\n🎭 **Taste Profile**\n"
            f"  Preferred type : {profile.favourite_content_type.capitalize()}\n"
            f"  Top genres     : {genres_str}\n"
            f"\n*Every number here is a story. Not bad, {name}.*"
        )

    def _cmd_watchtime(self, *, args, tier, profile, token, lang) -> str:
        if not profile:
            return "I can't pull your file right now. Try again shortly."

        # Anime: ~24 min per episode; use recorded episode_count or estimate 12 eps
        ANIME_MIN_PER_EP = 24
        ANIME_DEFAULT_EPS = 12
        # Manga: ~8 min per chapter; no chapter tracking yet so estimate 100 ch/title
        MANGA_MIN_PER_CH = 8
        MANGA_DEFAULT_CHS = 100

        anime_mins = 0
        manga_mins = 0
        anime_counted = 0
        manga_counted = 0

        for c in profile.completed:
            if c.get("content_type") == "anime":
                eps = c.get("episode_count") or ANIME_DEFAULT_EPS
                anime_mins += eps * ANIME_MIN_PER_EP
                anime_counted += 1
            else:
                manga_mins += MANGA_DEFAULT_CHS * MANGA_MIN_PER_CH
                manga_counted += 1

        # Add partial time for currently-watching
        for w in profile.watching:
            pct = (w.get("progress_percent") or 0) / 100
            if w.get("content_type") == "anime":
                eps = w.get("episode_count") or ANIME_DEFAULT_EPS
                anime_mins += int(eps * pct * ANIME_MIN_PER_EP)
            else:
                manga_mins += int(MANGA_DEFAULT_CHS * pct * MANGA_MIN_PER_CH)

        total_mins = anime_mins + manga_mins
        total_hrs = total_mins / 60
        total_days = total_hrs / 24

        def _fmt_time(mins: int) -> str:
            h = mins // 60
            m = mins % 60
            if h >= 24:
                return f"{h // 24}d {h % 24}h"
            return f"{h}h {m}m" if h else f"{m}m"

        name = profile.username.capitalize()
        fun_fact = ""
        if total_hrs >= 1000:
            fun_fact = f"\n  *(That's {total_days:.1f} days — you could have read every book in a small library.)*"
        elif total_hrs >= 500:
            fun_fact = "\n  *(You've spent more time in the archive than most people spend on hobbies in a year.)*"
        elif total_hrs >= 100:
            fun_fact = "\n  *(A commendable investment. The archive approves.)*"
        elif total_hrs >= 20:
            fun_fact = "\n  *(You're off to a solid start. The real hours are still ahead.)*"
        else:
            fun_fact = "\n  *(Early days — the shelves stretch further than you might imagine.)*"

        return (
            f"⏱️ **{name}'s Time in the Archive**\n\n"
            f"  📺 Anime watched   : {_fmt_time(anime_mins)}  ({anime_counted} titles)\n"
            f"  📕 Manga read      : {_fmt_time(manga_mins)}  ({manga_counted} titles)  *(estimated)*\n"
            f"  ─────────────────────────────\n"
            f"  🕰️  **Total time     : {_fmt_time(total_mins)}**  (~{total_hrs:.1f} hrs)\n"
            f"{fun_fact}\n\n"
            f"  *Anime timing uses {ANIME_MIN_PER_EP} min/episode; "
            f"manga uses ~{MANGA_MIN_PER_CH} min × {MANGA_DEFAULT_CHS} chapters as an estimate.*"
        )

    def _cmd_next(self, *, args, tier, profile, token, lang) -> str:
        content_type = "manga" if (profile and profile.favourite_content_type == "manga") else "anime"
        result = self.get_librarian_pitch(token, content_type)
        if result.success and result.data:
            return result.data.get("pitch", result.message)
        return (
            "I'm having trouble pulling a recommendation right now — "
            "the card index is temporarily unresponsive. Try again in a moment."
        )

    def _cmd_genres(self, *, args, tier, profile, token, lang) -> str:
        if not profile:
            return "Your file isn't available right now."
        if not profile.inferred_genres:
            return (
                "📊 Your genre profile is still blank — I need to see more of your "
                "borrow history before I can draw conclusions. "
                "Complete a few titles and come back."
            )
        name = profile.username.capitalize()
        genre_list = "\n".join(f"  {i}. {g}" for i, g in enumerate(profile.inferred_genres[:10], 1))
        return (
            f"🎭 **{name}'s Genre Profile**\n\n"
            f"{genre_list}\n\n"
            f"*This is extrapolated from your preferences and borrow history. "
            f"It updates as your tastes evolve — or, as I suspect, deepen.*"
        )

    def _cmd_search(self, *, args, tier, profile, token, lang) -> str:
        if not args:
            return (
                "🔍 Search syntax: `./search <title or description>`\n"
                "Example: `./search attack on titan`"
            )
        import asyncio
        try:
            result = asyncio.run(self.knowledge.search_comprehensive(args, lang))
            if result.get("recommendations"):
                raw = result["recommendations"]
                if isinstance(raw, str):
                    return f"🔍 **Search: '{args}'**\n\n{raw}"
                return f"🔍 **Search: '{args}'**\n\n{raw}"
        except Exception:
            pass
        return (
            f"🔍 I couldn't find anything in the archive for *{args}*. "
            "Try a different title or description."
        )

    def _cmd_season(self, *, args, tier, profile, token, lang) -> str:
        season, year = self.recommender.get_current_season()
        if self.web_search_enabled:
            web = self.web_agent.search_web(f"best anime {season} {year} seasonal recommendations")
            if "error" not in web:
                return f"📅 **{season.capitalize()} {year} — Live from the Archive**\n\n{web}"
        # Fallback to Jikan
        try:
            contents = self.jikan_client.get_seasonal_anime(year, season)[:10]
            if contents:
                lines = [f"📅 **{season.capitalize()} {year} — Now in the Archive**\n"]
                for c in contents:
                    score_str = f"  ★ {c.score}" if c.score else ""
                    lines.append(f"  • **{c.title}**{score_str}")
                return "\n".join(lines)
        except Exception:
            pass
        return (
            f"📅 It's {season.capitalize()} {year}. "
            "The seasonal shelf is being restocked — check back shortly, "
            "or ask me about a specific title."
        )

    def _cmd_rate(self, *, args, tier, profile, token, lang) -> str:
        """./rate <title> <score 1-10>"""
        if not args:
            return (
                "📝 Rating syntax: `./rate <title> <score>`\n"
                "Example: `./rate Vinland Saga 10`\n"
                "Score must be 1–10."
            )
        parts = args.rsplit(None, 1)
        if len(parts) < 2:
            return "Please include both a title and a score. Example: `./rate Fullmetal Alchemist 9`"
        title_part, score_part = parts
        try:
            score = float(score_part)
            if not (1 <= score <= 10):
                raise ValueError
        except ValueError:
            return f"'{score_part}' isn't a valid score. Please use a number between 1 and 10."

        scope = self.data_isolation.get_user_data_scope(token)
        if not scope:
            return "I couldn't verify your membership. Please check your library card."

        try:
            import sqlite3 as _sq
            db_path = self.db.db_path
            with _sq.connect(db_path) as conn:
                conn.execute(
                    """UPDATE watch_history
                       SET rating = ?
                       WHERE user_id = ? AND LOWER(title) LIKE LOWER(?)""",
                    (score, scope["user_id"], f"%{title_part.strip()}%"),
                )
                affected = conn.total_changes
            if affected:
                return (
                    f"✅ Logged. *{title_part.strip()}* → **{score}/10**. "
                    f"{'An honest score.' if score >= 7 else 'Your candour is noted.'}"
                )
            return (
                f"I couldn't find *{title_part.strip()}* in your history. "
                "Make sure it's been added to your watch history first."
            )
        except Exception as e:
            self.logger.error(f"./rate error: {e}")
            return "Something went wrong updating your rating. Try again in a moment."

    # ── Admin / librarian command handlers ──────────────────────────────────

    @staticmethod
    def _fmt_date(iso: Optional[str], fmt: str = "%d %b %Y") -> str:
        if not iso:
            return "never"
        try:
            from datetime import datetime as _dt
            return _dt.fromisoformat(iso).strftime(fmt)
        except Exception:
            return iso[:10] if iso else "—"

    def _cmd_patrons(self, *, args, tier, profile, token, lang) -> str:
        rows = self.db.admin_get_all_patrons()
        if not rows:
            return "📋 The archive has no registered patrons yet."

        tier_badge = {
            "admin": "⚙️ Staff",
            "premium": "✦ Premium",
            "user": "",
        }
        lines = [f"📋 **All Patrons — {len(rows)} registered**\n"]
        for r in rows:
            completed = r.get("completed", 0)
            if completed >= 11:
                level = "📚 Frequent"
            elif completed >= 3:
                level = "📖 Regular"
            elif completed >= 1:
                level = "🔖 New"
            else:
                level = "👤 Inactive"

            role_badge = tier_badge.get(r.get("role", "user"), "")
            last = self._fmt_date(r.get("last_activity"))
            lines.append(
                f"  {level}  **{r['username']}** {role_badge}"
                f"  · {completed} completed  · last active {last}"
            )
        lines.append(f"\n*Total: {len(rows)} patrons on file.*")
        return "\n".join(lines)

    def _cmd_patron(self, *, args, tier, profile, token, lang) -> str:
        if not args:
            return "Usage: `./patron <username>`"
        user_id = self.db.admin_get_patron_by_username(args.strip())
        if not user_id:
            return f"No patron found with the username **{args.strip()}**."
        p = self.db.get_patron_profile_data(user_id)
        if not p:
            return f"Could not load the profile for **{args.strip()}**."
        # Reuse the stats formatter
        fake_tier = (
            PatronTier.FREQUENT if p.total_completed >= 11 else
            PatronTier.REGULAR  if p.total_completed >= 3  else
            PatronTier.NEW
        )
        return self._cmd_stats(args="", tier=fake_tier, profile=p, token=token, lang=lang)

    def _cmd_librarystats(self, *, args, tier, profile, token, lang) -> str:
        s = self.db.admin_get_library_stats()
        hrs = s["estimated_total_hours"]
        days = hrs / 24

        by_type = s.get("completions_by_type", {})
        anime_done = by_type.get("anime", 0)
        manga_done = by_type.get("manga", 0)

        fun = ""
        if hrs >= 10_000:
            fun = f"\n  *That's {days:.0f} days of continuous watching across the entire library. Extraordinary.*"
        elif hrs >= 1_000:
            fun = f"\n  *{hrs:,.0f} hours archived. The Algorithm could never.*"
        else:
            fun = "\n  *The collection is growing. Encourage your patrons.*"

        return (
            f"📊 **Grand Archive — Library Statistics**\n\n"
            f"  👥 Registered patrons   : {s['total_patrons']}\n"
            f"  🟢 Active (last 7 days) : {s['active_last_7_days']}\n"
            f"  🆕 New this month       : {s['new_members_last_30_days']}\n\n"
            f"  📖 Total completions    : {s['total_completions']}\n"
            f"     └ 📺 Anime           : {anime_done}\n"
            f"     └ 📕 Manga           : {manga_done}\n"
            f"  ▶️  In progress          : {s['total_in_progress']}\n"
            f"  📋 Queued (borrow list) : {s['total_queued']}\n\n"
            f"  ⭐ Global avg rating    : {s['global_avg_rating']}/10\n"
            f"  ⏱️  Est. total watch time : {hrs:,.0f} hrs  (~{days:.1f} days)"
            f"{fun}"
        )

    def _cmd_popular(self, *, args, tier, profile, token, lang) -> str:
        rows = self.db.admin_get_popular_titles()
        if not rows:
            return "🏆 No completion data yet — the shelves await their first readers."
        lines = ["🏆 **Most Completed Titles Across All Patrons**\n"]
        for i, r in enumerate(rows, 1):
            ctype = "📺" if r.get("content_type") == "anime" else "📕"
            rating = f"  ★ {r['avg_rating']}" if r.get("avg_rating") else ""
            lines.append(
                f"  {i:>2}. {ctype} **{r['title']}**"
                f"  — {r['patrons_completed']} patrons completed{rating}"
            )
        return "\n".join(lines)

    def _cmd_topratedall(self, *, args, tier, profile, token, lang) -> str:
        rows = self.db.admin_get_top_rated_titles()
        if not rows:
            return "⭐ Not enough rating data yet — at least 2 patron ratings are needed per title."
        lines = ["⭐ **Highest Rated Titles (Library Average)**\n"]
        for i, r in enumerate(rows, 1):
            ctype = "📺" if r.get("content_type") == "anime" else "📕"
            lines.append(
                f"  {i:>2}. {ctype} **{r['title']}**"
                f"  — avg **{r['avg_rating']}/10**  ({r['rating_count']} ratings)"
            )
        lines.append("\n*Only titles with 2+ patron ratings are shown.*")
        return "\n".join(lines)

    def _cmd_trending_here(self, *, args, tier, profile, token, lang) -> str:
        rows = self.db.admin_get_trending_additions()
        if not rows:
            return "🔥 No borrow-queue data yet."
        lines = ["🔥 **Recently Queued — What Patrons Are Saving**\n"]
        for i, r in enumerate(rows, 1):
            ctype = "📺" if r.get("content_type") == "anime" else "📕"
            added = self._fmt_date(r.get("latest_added"), "%d %b")
            lines.append(
                f"  {i:>2}. {ctype} **{r['title']}**"
                f"  — {r['queue_count']} patron(s) queued  · last added {added}"
            )
        return "\n".join(lines)

    def _cmd_active(self, *, args, tier, profile, token, lang) -> str:
        days = 7
        if args and args.strip().isdigit():
            days = max(1, min(90, int(args.strip())))
        rows = self.db.admin_get_active_patrons(days)
        if not rows:
            return f"🟢 No patron activity logged in the last {days} days."
        lines = [f"🟢 **Active Patrons — last {days} days** ({len(rows)} patrons)\n"]
        for r in rows:
            last = self._fmt_date(r.get("last_activity"), "%d %b %H:%M")
            lines.append(
                f"  **{r['username']}**  · last active {last}"
                f"  · {r['entries_touched']} entries updated"
            )
        return "\n".join(lines)

    def _cmd_newmembers(self, *, args, tier, profile, token, lang) -> str:
        days = 14
        if args and args.strip().isdigit():
            days = max(1, min(90, int(args.strip())))
        rows = self.db.admin_get_new_members(days)
        if not rows:
            return f"🆕 No new registrations in the last {days} days."
        lines = [f"🆕 **New Members — last {days} days** ({len(rows)} joined)\n"]
        for r in rows:
            joined = self._fmt_date(r.get("joined"))
            role_note = " *(staff)*" if r.get("role") == "admin" else ""
            lines.append(f"  **{r['username']}**{role_note}  · joined {joined}")
        lines.append(
            "\n*Consider reaching out — a warm welcome from the librarian goes a long way.*"
        )
        return "\n".join(lines)

    def _cmd_inactive(self, *, args, tier, profile, token, lang) -> str:
        days = 30
        if args and args.strip().isdigit():
            days = max(7, min(365, int(args.strip())))
        rows = self.db.admin_get_inactive_patrons(days)
        if not rows:
            return f"😴 All patrons have been active within the last {days} days. Impressive."
        lines = [f"😴 **Inactive Patrons — no activity for {days}+ days** ({len(rows)} patrons)\n"]
        for r in rows:
            last = self._fmt_date(r.get("last_activity")) if r.get("last_activity") else "never"
            total = r.get("total_entries", 0)
            lines.append(
                f"  **{r['username']}**  · last seen {last}"
                f"  · {total} history entries total"
            )
        lines.append(
            "\n*Perhaps a personalised recommendation would bring them back. "
            "Use `./patron <name>` to view their taste profile.*"
        )
        return "\n".join(lines)

    def _cmd_promote(self, *, args, tier, profile, token, lang) -> str:
        """
        ./promote <username> <role>

        Head Librarian: can grant  user | premium
        Chief Archivist (admin): can grant  user | premium | librarian | admin
        """
        is_admin_caller = self._is_admin(token)

        librarian_roles = {"user", "premium"}
        admin_only_roles = {"librarian", "admin"}
        all_valid = librarian_roles | admin_only_roles

        parts = args.strip().split()
        if len(parts) < 2:
            allowed = sorted(all_valid if is_admin_caller else librarian_roles)
            return (
                "Usage: `./promote <username> <role>`\n"
                f"Roles you can assign: {', '.join(f'`{r}`' for r in allowed)}\n"
                "Example: `./promote sakura premium`"
            )
        target_name, new_role = parts[0], parts[1].lower()

        if new_role not in all_valid:
            return (
                f"**{new_role}** is not a valid role. "
                f"Valid roles: {', '.join(f'`{r}`' for r in sorted(all_valid))}"
            )

        if new_role in admin_only_roles and not is_admin_caller:
            return (
                f"🔐 Granting the **{new_role}** role requires Chief Archivist authority. "
                "Contact your system administrator."
            )

        ok = self.db.admin_set_user_role(target_name, new_role)
        if not ok:
            return f"I couldn't find a patron named **{target_name}** in the registry."

        role_label = {
            "user":      "Regular Patron",
            "premium":   "Premium Member ✦",
            "librarian": "Head Librarian 🗝️",
            "admin":     "Chief Archivist 🔐",
        }
        note = ""
        if new_role == "librarian":
            note = (
                "\n*They now have full patron management access. "
                "The archive thanks them for their service.*"
            )
        elif new_role == "admin":
            note = "\n*⚠️ Admin access granted. This should be reserved for system administrators.*"

        return (
            f"✅ **{target_name}**'s role has been updated to **{role_label[new_role]}**.\n"
            f"They will need to log in again for the change to take effect.{note}"
        )

    def get_upcoming_releases(self, content_type: str = "anime", limit: int = 10) -> AgentResponse:
        """Get upcoming releases"""
        try:
            season, year = self.recommender.get_current_season()
            
            if content_type == "anime":
                contents = self.jikan_client.get_seasonal_anime(year, season)
                # Filter for upcoming (airing = True but not started or just started)
                upcoming = [c for c in contents if c.airing and c.episodes == 0][:limit]
            else:
                contents = self.jikan_client.get_top_manga(limit=50)
                upcoming = [c for c in contents if c.publishing][:limit]
            
            return AgentResponse(True, f"Found {len(upcoming)} upcoming releases", {
                "upcoming": [c.to_dict() for c in upcoming],
                "season": season,
                "year": year
            })
        except Exception as e:
            self.logger.error(f"Get upcoming failed: {str(e)}")
            return AgentResponse(False, "Failed to get upcoming releases", error=str(e))
    
    # ==================== FIND LINKS ====================
    
    def find_watching_links(self, anime_title: str, anime_id: str) -> AgentResponse:
        """Find links to watch anime"""
        try:
            links = self.streaming_finder.find_anime_links(anime_title, anime_id)
            return AgentResponse(True, f"Found {len(links)} streaming links", {
                "links": links
            })
        except Exception as e:
            return AgentResponse(False, "Failed to find links", error=str(e))
    
    def find_reading_links(self, manga_title: str, manga_id: str) -> AgentResponse:
        """Find links to read manga"""
        try:
            links = self.streaming_finder.find_manga_links(manga_title, manga_id)
            return AgentResponse(True, f"Found {len(links)} reading links", {
                "links": links
            })
        except Exception as e:
            return AgentResponse(False, "Failed to find links", error=str(e))
    
    def save_and_get_links(
        self,
        token: str,
        content_id: str,
        content_type: str,
        title: str
    ) -> AgentResponse:
        """Save content and get links to watch/read"""
        try:
            # Get links first
            if content_type == "anime":
                links_result = self.find_watching_links(title, content_id)
            else:
                links_result = self.find_reading_links(title, content_id)
            
            if not links_result.success:
                return links_result
            
            # Save all links for user
            links = links_result.data["links"]
            saved_ids = []
            for link in links:
                link_id = self.db.create_saved_link(SavedLink(
                    id=str(uuid.uuid4()),
                    user_id=self.data_isolation.get_user_data_scope(token)["user_id"],
                    content_id=content_id,
                    content_type=content_type,
                    title=title,
                    url=link["url"],
                    site_name=link["site_name"]
                ))
                saved_ids.append(link_id)
            
            return AgentResponse(True, f"Saved {len(saved_ids)} links", {
                "links": links,
                "saved_link_ids": saved_ids
            })
        except Exception as e:
            self.logger.error(f"Save and get links failed: {str(e)}")
            return AgentResponse(False, "Failed to save and get links", error=str(e))
    
    # ==================== PERSONALITY & KNOWLEDGE ====================
    
    def set_language(self, language: str) -> AgentResponse:
        """Set the agent's response language"""
        supported = ['en', 'ja', 'ru', 'lt', 'es']
        if language not in supported:
            return AgentResponse(False, f"Language not supported. Supported: {', '.join(supported)}")
        
        self.current_language = language
        return AgentResponse(True, f"Language set to {language}", {
            "language": language,
            "greeting": self.knowledge.get_greeting(language)
        })
    
    def get_agent_greeting(self, language: str = None) -> AgentResponse:
        """Get agent's greeting in specified language"""
        lang = language or self.current_language
        return AgentResponse(True, "Greeting retrieved", {
            "greeting": self.knowledge.get_greeting(lang),
            "language": lang
        })
    
    def get_waifu(self, language: str = None) -> AgentResponse:
        """Get agent's one true waifu"""
        lang = language or self.current_language
        return AgentResponse(True, "Waifu revealed!", {
            "response": self.knowledge.get_waifu_response(lang),
            "waifu": self.knowledge.personality.waifu
        })
    
    def get_most_hated_character(self, language: str = None) -> AgentResponse:
        """Get agent's most hated character"""
        lang = language or self.current_language
        return AgentResponse(True, "Hate revealed!", {
            "response": self.knowledge.get_hate_response(lang),
            "character": self.knowledge.personality.most_hated_character
        })
    
    def get_rival_complaint(self) -> AgentResponse:
        """Get agent's complaint about their rival"""
        return AgentResponse(True, "Rival complaint!", {
            "response": self.knowledge.get_rival_complaint(),
            "rival": self.knowledge.personality.rival
        })
    
    def get_hot_take(self) -> AgentResponse:
        """Get a random hot take from the agent"""
        return AgentResponse(True, "Hot take!", {
            "response": self.knowledge.get_hot_take()
        })
    
    def get_top_10(self, language: str = None) -> AgentResponse:
        """Get agent's personal top 10 anime of all time"""
        lang = language or self.current_language
        return AgentResponse(True, "Top 10 revealed!", {
            "response": self.knowledge.get_top_10_response(lang),
            "top_10": self.knowledge.personality.top_10_best
        })
    
    def get_top_100_tier(self, tier: str = 'S') -> AgentResponse:
        """Get agent's top 100 must-see by tier"""
        return AgentResponse(True, f"Tier {tier} revealed!", {
            "response": self.knowledge.get_top_100_tier(tier),
            "tier": tier
        })
    
    def get_genre_favorites(self, genre: str = None) -> AgentResponse:
        """Get agent's favorite anime by genre"""
        if genre:
            favorites = self.knowledge.personality.genre_favorites.get(genre.lower(), [])
            return AgentResponse(True, f"Favorites for {genre}", {
                "genre": genre,
                "favorites": favorites
            })
        return AgentResponse(True, "All genre favorites", {
            "favorites": self.knowledge.personality.genre_favorites
        })
    
    def get_studio_info(self, studio_name: str = None) -> AgentResponse:
        """Get information about anime studios"""
        if studio_name:
            studio = self.knowledge.studios.get(studio_name)
            if studio:
                return AgentResponse(True, f"Studio info: {studio_name}", {
                    "studio": studio_name,
                    "info": studio
                })
            return AgentResponse(False, f"Studio '{studio_name}' not found")
        return AgentResponse(True, "All studios", {
            "studios": list(self.knowledge.studios.keys())
        })
    
    def get_mangaka_info(self, mangaka_name: str = None) -> AgentResponse:
        """Get information about mangaka"""
        if mangaka_name:
            mangaka = self.knowledge.mangaka.get(mangaka_name)
            if mangaka:
                return AgentResponse(True, f"Mangaka info: {mangaka_name}", {
                    "mangaka": mangaka_name,
                    "info": mangaka
                })
            return AgentResponse(False, f"Mangaka '{mangaka_name}' not found")
        return AgentResponse(True, "All mangaka", {
            "mangaka": list(self.knowledge.mangaka.keys())
        })
    
    def get_classics_by_decade(self, decade: str = None) -> AgentResponse:
        """Get classic anime by decade"""
        if decade:
            classics = self.knowledge.classics.get(decade, [])
            return AgentResponse(True, f"Classics from {decade}", {
                "decade": decade,
                "classics": classics
            })
        return AgentResponse(True, "All classics by decade", {
            "classics": self.knowledge.classics
        })
    
    # ==================== SMART CHAT ====================
    
    async def chat(self, message: str, language: str = None, token: Optional[str] = None) -> AgentResponse:
        """
        Main chat interface - handles all types of queries with full librarian persona.

        Routing order:
          1. Patron context (guest / new / regular / frequent)
          2. Memory encoding
          3. Greeting layer          – hello, hi, good morning …
          4. Library-card layer      – register, sign up, get a card …
          5. Casual small-talk layer – how are you, what's new, been a while …
          6. My-list layer           – my list, borrow list, what am I watching …
          7. Member-gated actions    – save, preferences (require card)
          8. Librarian pitch         – recommend me something / what's next
          9. Personality keywords    – waifu, hate, rival, hot take, top 10
         10. Seasonal / web search   – what's airing, trending, new this season …
         11. Knowledge search        – everything else via knowledge base
         12. Default fallback        – librarian-voiced generic reply
        """
        lang = language or self.current_language
        message_lower = message.lower()

        # ── 0. Slash command fast-path ─────────────────────────────────────────
        if message.strip().startswith("./"):
            # Build patron context first (needed by commands)
            _tier0, _profile0, _name0 = self._get_patron_context(token)
            _scope0 = self.data_isolation.get_user_data_scope(token) if token else None
            cmd_key, cmd_args = self._parse_slash_command(message)
            if cmd_key:
                cmd_reply = self._handle_slash_command(
                    cmd_key, cmd_args, _tier0, _profile0, token, lang
                )
                if _scope0:
                    self.memory.encode_interaction(
                        user_id=_scope0["user_id"],
                        role="user", message=message, context={"language": lang},
                    )
                    self.memory.encode_interaction(
                        user_id=_scope0["user_id"], role="agent",
                        message=str(cmd_reply)[:500],
                    )
                return AgentResponse(True, "Slash command", {
                    "response": cmd_reply,
                    "language": lang,
                    "patron_tier": _tier0,
                    "command": cmd_key,
                })
            # Starts with ./ but unknown — tell them about help
            unknown_reply = (
                f"I don't recognise `{message.strip().split()[0]}` as a command. "
                "Try `./help` to see the full list."
            )
            return AgentResponse(True, "Unknown command", {
                "response": unknown_reply, "language": lang,
            })

        # ── 1. Patron context ──────────────────────────────────────────────────
        tier, profile, patron_name = self._get_patron_context(token)
        scope = self.data_isolation.get_user_data_scope(token) if token else None

        # ── 2. Memory encoding ─────────────────────────────────────────────────
        if scope:
            self.memory.encode_interaction(
                user_id=scope["user_id"],
                role="user",
                message=message,
                context={"language": lang},
            )
            self.memory.decay_short_term()

        # Helper: encode agent reply and return
        def _reply(text: str, extra: dict = None) -> AgentResponse:
            if scope:
                self.memory.encode_interaction(
                    user_id=scope["user_id"], role="agent",
                    message=str(text)[:500],
                )
            payload = {"response": text, "language": lang, "patron_tier": tier}
            if extra:
                payload.update(extra)
            return AgentResponse(True, "Chat response", payload)

        # ── 3. Greeting layer ──────────────────────────────────────────────────
        greeting_keywords = [
            "hello", "hi ", "hey ", "hey!", "howdy", "sup", "greetings",
            "good morning", "good afternoon", "good evening",
            "ohayou", "konnichiwa", "privet", "hola", "oi ", "yo ",
            "what's up", "whats up", "how do i start", "where do i begin",
        ]
        if any(message_lower.startswith(kw.strip()) or kw in message_lower
               for kw in greeting_keywords):
            return _reply(self._librarian_greeting(tier, profile, lang))

        # ── 4. Library-card guidance ────────────────────────────────────────────
        card_keywords = [
            "library card", "get a card", "sign up", "register", "registration",
            "create account", "create an account", "become a member", "membership",
            "join the library", "how do i join", "new account", "make an account",
        ]
        if any(kw in message_lower for kw in card_keywords):
            if tier != PatronTier.GUEST:
                return _reply(
                    f"You already have a card, {patron_name.capitalize()}! "
                    "You're a valued member of the archive. "
                    "Is there something specific about your account you'd like to adjust?"
                )
            return _reply(self._librarian_card_guidance(lang))

        # ── 5. Casual small-talk layer ─────────────────────────────────────────
        casual_keywords = [
            "how are you", "how are u", "you doing", "you okay", "all good",
            "been a while", "long time", "miss me", "i'm back", "im back",
            "what's new", "whats new", "anything good", "what's happening",
            "what's hot", "anything interesting", "anything exciting",
            "quiet today", "busy today", "slow day", "how's it going",
            "hows it going", "what's going on", "wassup", "wsp",
        ]
        if any(kw in message_lower for kw in casual_keywords):
            return _reply(self._librarian_casual_response(tier, profile, message, lang))

        # ── 6. My-list layer ───────────────────────────────────────────────────
        my_list_keywords = [
            "my list", "borrow list", "my borrow", "what am i watching",
            "what have i watched", "my history", "my progress",
            "what's on my list", "whats on my list", "show my list",
            "my watch list", "my watchlist", "what i've seen",
            "my completed", "currently watching", "in progress",
        ]
        if any(kw in message_lower for kw in my_list_keywords):
            if tier == PatronTier.GUEST:
                return _reply(
                    "You'll need a library card to keep a personal borrow list. "
                    "Ask me how to get one and I'll walk you through it — it only "
                    "takes a moment."
                )
            if not profile:
                return _reply("I couldn't pull up your file just now. Try again in a moment.")
            return _reply(self._librarian_my_list_response(profile))

        # ── 7. Member-gated actions ────────────────────────────────────────────
        if tier == PatronTier.GUEST:
            gated_keywords = [
                "save", "my preferences", "remind me", "based on my taste",
                "track this", "add to my", "my account",
            ]
            if any(kw in message_lower for kw in gated_keywords):
                return _reply(
                    "I'd love to help with that — but I'll need your library card first. "
                    "To get one, just ask me 'how do I get a library card' and I'll "
                    "guide you through registration."
                )

        # ── 8. Personalised recommendation pitch ───────────────────────────────
        pitch_keywords = [
            "recommend me something", "what should i watch", "what should i read",
            "pick something", "surprise me", "pick for me", "what's next",
            "whats next", "next title", "what's my next", "librarian pick",
            "something new", "find me something", "suggest something",
        ]
        if any(kw in message_lower for kw in pitch_keywords):
            if tier == PatronTier.GUEST:
                return _reply(
                    "Happy to! But a truly *personal* recommendation needs your borrow "
                    "history. If you get a library card I can tailor picks just for you. "
                    "In the meantime — what genres interest you? I can offer a general "
                    "starting point."
                )
            # Delegate to the librarian pitch logic
            content_type = "manga" if "manga" in message_lower or "read" in message_lower else "anime"
            pitch_result = self.get_librarian_pitch(token, content_type)
            if pitch_result.success and pitch_result.data:
                return _reply(
                    pitch_result.data.get("pitch", pitch_result.message),
                    {"recommendation": pitch_result.data.get("recommendation")}
                )

        # ── 9. Personality keywords ────────────────────────────────────────────
        if "waifu" in message_lower:
            return self.get_waifu(lang)

        if "hate" in message_lower or "worst character" in message_lower:
            return self.get_most_hated_character(lang)

        if "rival" in message_lower:
            return self.get_rival_complaint()

        if "hot take" in message_lower or "opinion" in message_lower:
            return self.get_hot_take()

        if "top 10" in message_lower or "best of all time" in message_lower:
            return self.get_top_10(lang)

        # ── 10. Seasonal / web search ──────────────────────────────────────────
        seasonal_keywords = [
            "what's airing", "whats airing", "new this season", "upcoming anime",
            "seasonal", "trending", "just released", "currently airing",
            "new releases", "this season", "next season", "new anime",
            "what season", "airing now", "simulcast",
        ]
        if self.web_search_enabled and any(kw in message_lower for kw in seasonal_keywords):
            search_query = f"anime seasonal trends upcoming releases {message}"
            web_result = self.web_agent.search_web(search_query)
            if "error" not in web_result:
                return _reply(web_result, {"source": "web_search"})

        # ── 11. Knowledge search ───────────────────────────────────────────────
        result = await self.knowledge.search_comprehensive(message, lang)
        if result.get("recommendations"):
            raw = result["recommendations"]
            # Prefix with a brief patron-aware framing for members
            if tier in (PatronTier.REGULAR, PatronTier.FREQUENT) and profile:
                preamble = f"For you, {patron_name.capitalize()} — "
                if isinstance(raw, str):
                    raw = preamble + raw
                elif isinstance(raw, list) and raw:
                    if isinstance(raw[0], dict) and "message" in raw[0]:
                        raw[0]["message"] = preamble + raw[0]["message"]
            return _reply(raw)

        # ── 12. Default fallback ───────────────────────────────────────────────
        default_raw = self.knowledge._get_default_response(message)
        # Personalise the fallback slightly for known patrons
        if tier != PatronTier.GUEST and profile:
            genres_hint = (
                f"Given your taste for {' & '.join(profile.inferred_genres[:2])}, "
                if profile.inferred_genres else ""
            )
            if isinstance(default_raw, str):
                default_raw = (
                    f"{default_raw}\n\n"
                    f"*(Librarian's note: {genres_hint}if you give me a bit more "
                    f"to work with I can find you something very specific.)*"
                )
        return _reply(default_raw)
    
    def chat_sync(self, message: str, language: str = None, token: Optional[str] = None) -> AgentResponse:
        """Synchronous version of chat for non-async contexts"""
        import asyncio
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                # If already in async context, create new loop
                import concurrent.futures
                with concurrent.futures.ThreadPoolExecutor() as executor:
                    future = executor.submit(asyncio.run, self.chat(message, language, token))
                    return future.result()
            return loop.run_until_complete(self.chat(message, language, token))
        except RuntimeError:
            return asyncio.run(self.chat(message, language, token))
    
    # ==================== API INTEGRATION ====================
    
    async def search_with_api(self, query: str, source: str = "jikan") -> AgentResponse:
        """Search anime using integrated APIs"""
        try:
            result = await self.api_manager.search_anime(query, source)
            if "error" in result:
                return AgentResponse(False, "Search failed", error=result["error"])
            return AgentResponse(True, "Search results", {"data": result})
        except Exception as e:
            return AgentResponse(False, "Search failed", error=str(e))
    
    async def get_trending_from_api(self, source: str = "anilist") -> AgentResponse:
        """Get trending anime from APIs"""
        try:
            result = await self.api_manager.get_trending(source)
            if "error" in result:
                return AgentResponse(False, "Failed to get trending", error=result["error"])
            return AgentResponse(True, "Trending anime", {"data": result})
        except Exception as e:
            return AgentResponse(False, "Failed to get trending", error=str(e))
    
    async def get_seasonal_from_api(self, year: int = None, season: str = None, source: str = "jikan") -> AgentResponse:
        """Get seasonal anime from APIs"""
        try:
            result = await self.api_manager.get_seasonal(year, season, source)
            if "error" in result:
                return AgentResponse(False, "Failed to get seasonal", error=result["error"])
            return AgentResponse(True, "Seasonal anime", {"data": result})
        except Exception as e:
            return AgentResponse(False, "Failed to get seasonal", error=str(e))
    
    async def get_anime_details_from_api(self, mal_id: int = None, anilist_id: int = None) -> AgentResponse:
        """Get detailed anime information from APIs"""
        try:
            result = await self.api_manager.get_anime_details(mal_id, anilist_id)
            if "error" in result:
                return AgentResponse(False, "Failed to get details", error=result["error"])
            return AgentResponse(True, "Anime details", {"data": result})
        except Exception as e:
            return AgentResponse(False, "Failed to get details", error=str(e))
    
    async def get_recommendations_from_api(self, mal_id: int = None, anilist_id: int = None) -> AgentResponse:
        """Get recommendations from APIs"""
        try:
            result = await self.api_manager.get_recommendations(mal_id, anilist_id)
            if "error" in result:
                return AgentResponse(False, "Failed to get recommendations", error=result["error"])
            return AgentResponse(True, "Recommendations", {"data": result})
        except Exception as e:
            return AgentResponse(False, "Failed to get recommendations", error=str(e))
    
    async def get_random_anime_from_api(self) -> AgentResponse:
        """Get a random anime recommendation"""
        try:
            result = await self.api_manager.get_random_anime()
            if "error" in result:
                return AgentResponse(False, "Failed to get random anime", error=result["error"])
            return AgentResponse(True, "Random anime", {"data": result})
        except Exception as e:
            return AgentResponse(False, "Failed to get random anime", error=str(e))
    
    async def get_schedules_from_api(self, day: str = None) -> AgentResponse:
        """Get anime schedules"""
        try:
            result = await self.api_manager.get_schedules(day)
            if "error" in result:
                return AgentResponse(False, "Failed to get schedules", error=result["error"])
            return AgentResponse(True, "Anime schedules", {"data": result})
        except Exception as e:
            return AgentResponse(False, "Failed to get schedules", error=str(e))
    
    # ==================== ENHANCED STREAMING LINKS ====================
    
    async def find_anime_streaming(self, title: str, mal_id: str = None) -> AgentResponse:
        """
        Find all available streaming links for an anime
        
        Uses multiple sources:
        - Official platforms (Crunchyroll, Netflix, Funimation, etc.)
        - Consumet API (GogoAnime, Zoro/Aniwatch, AnimePahe)
        - Kitsu streaming links
        """
        try:
            result = await self.streaming_manager.find_anime_streaming_links(title, mal_id)
            return AgentResponse(True, f"Found streaming links for '{title}'", result)
        except Exception as e:
            self.logger.error(f"Find anime streaming failed: {e}")
            return AgentResponse(False, "Failed to find streaming links", error=str(e))
    
    async def find_manga_reading(self, title: str, mal_id: str = None) -> AgentResponse:
        """
        Find all available reading links for a manga
        
        Uses multiple sources:
        - Official platforms (VIZ, MANGA Plus, ComiXology)
        - MangaDex
        - Consumet API
        """
        try:
            result = await self.streaming_manager.find_manga_reading_links(title, mal_id)
            return AgentResponse(True, f"Found reading links for '{title}'", result)
        except Exception as e:
            self.logger.error(f"Find manga reading failed: {e}")
            return AgentResponse(False, "Failed to find reading links", error=str(e))
    
    async def get_episode_stream_urls(self, source: str, episode_id: str) -> AgentResponse:
        """Get direct streaming URLs for a specific episode"""
        try:
            result = await self.streaming_manager.get_episode_stream(source, episode_id)
            if "error" in result:
                return AgentResponse(False, "Failed to get stream URLs", error=result["error"])
            return AgentResponse(True, "Stream URLs retrieved", result)
        except Exception as e:
            self.logger.error(f"Get episode stream failed: {e}")
            return AgentResponse(False, "Failed to get stream URLs", error=str(e))
    
    async def get_chapter_page_urls(self, source: str, chapter_id: str) -> AgentResponse:
        """Get page URLs for a specific manga chapter"""
        try:
            result = await self.streaming_manager.get_chapter_pages(source, chapter_id)
            if "error" in result:
                return AgentResponse(False, "Failed to get chapter pages", error=result["error"])
            return AgentResponse(True, "Chapter pages retrieved", result)
        except Exception as e:
            self.logger.error(f"Get chapter pages failed: {e}")
            return AgentResponse(False, "Failed to get chapter pages", error=str(e))
    
    async def save_streaming_links(
        self,
        token: str,
        title: str,
        content_type: str = "anime"
    ) -> AgentResponse:
        """
        Find and save all streaming/reading links for content
        
        This is a convenience method that:
        1. Finds all available links
        2. Saves them to the user's account
        3. Returns the links for immediate use
        """
        try:
            scope = self.data_isolation.get_user_data_scope(token)
            if not scope:
                return AgentResponse(False, "Invalid token")
            
            # Find links
            if content_type == "anime":
                links_result = await self.find_anime_streaming(title)
            else:
                links_result = await self.find_manga_reading(title)
            
            if not links_result.success:
                return links_result
            
            # Save official links
            saved_count = 0
            for link in links_result.data.get("official_links", []):
                try:
                    self.db.create_saved_link(SavedLink(
                        id=str(uuid.uuid4()),
                        user_id=scope["user_id"],
                        content_id=title.lower().replace(" ", "-"),
                        content_type=content_type,
                        title=title,
                        url=link["url"],
                        site_name=link["site_name"]
                    ))
                    saved_count += 1
                except Exception:
                    pass  # Skip duplicates
            
            return AgentResponse(True, f"Found and saved {saved_count} links for '{title}'", {
                "links": links_result.data,
                "saved_count": saved_count
            })
        except Exception as e:
            self.logger.error(f"Save streaming links failed: {e}")
            return AgentResponse(False, "Failed to save streaming links", error=str(e))
    
    # ==================== OMNISCIENT MODE - ALL-KNOWING AGENT ====================
    # The agent becomes an omniscient librarian, knowing all content and maintaining rankings
    
    async def activate_omniscient_mode(self) -> AgentResponse:
        """
        Activate the agent's omniscient mode.
        The agent builds comprehensive knowledge of ALL available anime/manga content,
        monitors for new releases, auto-generates metadata, and maintains dynamic rankings.
        
        This enables:
        - Instant knowledge of all available content
        - Automatic detection of new releases
        - Self-generated keywords and descriptions for new content
        - Dynamic "must watch" and ranking lists
        """
        try:
            result = await self.omniscient.initialize_omniscience()
            
            if result.get("success"):
                self.logger.info("🌟 OMNISCIENT MODE ACTIVATED - Agent is now all-knowing!")
                return AgentResponse(
                    True,
                    "✨ Agent omniscience activated! The agent now has comprehensive knowledge of ALL anime/manga content.",
                    result
                )
            else:
                return AgentResponse(False, "Failed to activate omniscient mode", error=result.get("error"))
        except Exception as e:
            self.logger.error(f"Omniscient mode activation failed: {e}")
            return AgentResponse(False, "Omniscient mode activation failed", error=str(e))
    
    async def update_omniscient_knowledge(self) -> AgentResponse:
        """
        Perform a periodic update of omniscient knowledge.
        
        This:
        - Checks for newly released anime/manga
        - Auto-generates metadata (keywords, descriptions) for new releases
        - Updates recommendation rankings and "must watch" lists
        """
        try:
            if not self.omniscient.is_omniscient:
                return AgentResponse(False, "Omniscient mode not yet activated", error="Call activate_omniscient_mode first")
            
            result = await self.omniscient.update_omniscience()
            
            if result.get("success"):
                return AgentResponse(
                    True,
                    f"Omniscient knowledge updated: {result.get('new_releases_detected')} new releases detected, "
                    f"metadata generated for {result.get('metadata_generated')} items",
                    result
                )
            else:
                return AgentResponse(False, "Failed to update omniscient knowledge", error=result.get("error"))
        except Exception as e:
            self.logger.error(f"Omniscient knowledge update failed: {e}")
            return AgentResponse(False, "Failed to update omniscient knowledge", error=str(e))
    
    def get_omniscient_status(self) -> AgentResponse:
        """
        Get the current status of omniscient mode.
        
        Returns:
        - Whether omniscience is active
        - Comprehensive content knowledge stats
        - Current ranking lists summary
        """
        try:
            status = self.omniscient.get_omniscience_status()
            
            if status.get("is_omniscient"):
                return AgentResponse(
                    True,
                    "🧠 Agent is OMNISCIENT - has comprehensive knowledge of all content",
                    status
                )
            else:
                return AgentResponse(
                    True,
                    "Agent omniscience not yet activated",
                    status
                )
        except Exception as e:
            self.logger.error(f"Get omniscient status failed: {e}")
            return AgentResponse(False, "Failed to get omniscient status", error=str(e))
    
    def search_omniscient_knowledge(self, query: str, content_types: List[str] = None) -> AgentResponse:
        """
        Search across the agent's omniscient knowledge base.
        
        The agent instantly answers with matching content from its comprehensive index.
        """
        try:
            if not self.omniscient.is_omniscient:
                return AgentResponse(False, "Omniscient mode not activated")
            
            results = self.omniscient.search_omniscient_index(query, content_types)
            
            return AgentResponse(
                True,
                f"Found {len(results)} matches in omniscient knowledge",
                {"results": results}
            )
        except Exception as e:
            self.logger.error(f"Omniscient search failed: {e}")
            return AgentResponse(False, "Omniscient search failed", error=str(e))
    
    def get_must_watch_list(self, limit: int = 50) -> AgentResponse:
        """
        Get the automatically-maintained "must watch" ranking list.
        
        This list is:
        - Generated from comprehensive indexed content
        - Automatically updated as new content is added
        - Based on ratings, popularity, user engagement, and quality scores
        """
        try:
            if not self.omniscient.is_omniscient:
                return AgentResponse(False, "Omniscient mode not activated. Activate with activate_omniscient_mode()")
            
            ranked_list = self.omniscient.get_must_watch_list(limit)
            
            return AgentResponse(
                True,
                f"🎯 Must Watch List - {len(ranked_list)} essential anime/manga everyone should experience",
                {"must_watch_list": ranked_list}
            )
        except Exception as e:
            self.logger.error(f"Get must watch list failed: {e}")
            return AgentResponse(False, "Failed to get must watch list", error=str(e))
    
    def get_trending_now(self, limit: int = 25) -> AgentResponse:
        """
        Get currently trending content based on omniscient analysis.
        
        Shows what's hot right now based on:
        - Recent releases
        - High engagement
        - Rising popularity scores
        - Seasonal highlights
        """
        try:
            if not self.omniscient.is_omniscient:
                return AgentResponse(False, "Omniscient mode not activated")
            
            trending = self.omniscient.get_trending_now(limit)
            
            return AgentResponse(
                True,
                f"🔥 Currently Trending - {len(trending)} hot anime/manga right now",
                {"trending": trending}
            )
        except Exception as e:
            self.logger.error(f"Get trending failed: {e}")
            return AgentResponse(False, "Failed to get trending", error=str(e))
    
    def get_hidden_gems(self, limit: int = 30) -> AgentResponse:
        """
        Get hidden gems from omniscient knowledge.
        
        These are underrated masterpieces that deserve more attention:
        - High quality (rated 7.5+)
        - Low visibility/popularity
        - Unique and distinctive content
        """
        try:
            if not self.omniscient.is_omniscient:
                return AgentResponse(False, "Omniscient mode not activated")
            
            gems = self.omniscient.get_hidden_gems(limit)
            
            return AgentResponse(
                True,
                f"💎 Hidden Gems - {len(gems)} underrated masterpieces waiting to be discovered",
                {"hidden_gems": gems}
            )
        except Exception as e:
            self.logger.error(f"Get hidden gems failed: {e}")
            return AgentResponse(False, "Failed to get hidden gems", error=str(e))
    
    def get_genre_rankings(self, genre: str, limit: int = 25) -> AgentResponse:
        """
        Get ranked list for a specific genre from omniscient knowledge.
        
        Shows the best anime/manga in any genre, ranked by quality and relevance.
        """
        try:
            if not self.omniscient.is_omniscient:
                return AgentResponse(False, "Omniscient mode not activated")
            
            ranked = self.omniscient.get_genre_rankings(genre, limit)
            
            if not ranked:
                return AgentResponse(False, f"No rankings found for genre: {genre}")
            
            return AgentResponse(
                True,
                f"🎬 {genre.title()} Rankings - {len(ranked)} top-rated {genre} anime/manga",
                {f"{genre}_rankings": ranked}
            )
        except Exception as e:
            self.logger.error(f"Get genre rankings failed: {e}")
            return AgentResponse(False, f"Failed to get {genre} rankings", error=str(e))
    
    def get_new_releases_detected(self, days: int = 7) -> AgentResponse:
        """
        Get recently detected new anime/manga releases.
        
        The agent actively monitors for new releases and adds them to recommendations.
        """
        try:
            if not self.omniscient.is_omniscient:
                return AgentResponse(False, "Omniscient mode not activated")
            
            new_releases = [
                release.to_dict() for release_id, release in
                self.omniscient.release_monitor.new_releases.items()
                if release.detected_at > datetime.utcnow() - timedelta(days=days)
            ]
            
            return AgentResponse(
                True,
                f"🆕 New Releases - {len(new_releases)} new anime/manga in the last {days} days",
                {
                    "new_releases": sorted(new_releases, key=lambda x: x["detected_at"], reverse=True),
                    "detected_count": len(new_releases)
                }
            )
        except Exception as e:
            self.logger.error(f"Get new releases failed: {e}")
            return AgentResponse(False, "Failed to get new releases", error=str(e))
    
    def get_content_metadata(self, content_id: str) -> AgentResponse:
        """
        Get auto-generated metadata for a piece of content.
        
        Returns keywords, descriptions, mood tags, and relevance scores
        automatically generated by the omniscient system.
        """
        try:
            if not self.omniscient.is_omniscient:
                return AgentResponse(False, "Omniscient mode not activated")
            
            metadata = self.omniscient.metadata_generator.config.get(content_id)
            if not metadata:
                return AgentResponse(False, "Metadata not found for content")
            
            return AgentResponse(
                True,
                f"Content metadata retrieved",
                {"metadata": metadata.to_dict() if hasattr(metadata, 'to_dict') else metadata}
            )
        except Exception as e:
            self.logger.error(f"Get content metadata failed: {e}")
            return AgentResponse(False, "Failed to get content metadata", error=str(e))
    

    # ==================== CLEANUP ====================
    
    async def cleanup(self):
        """Cleanup resources"""
        await self.api_manager.close()
        await self.streaming_manager.close()
        self.logger.info("Agent resources cleaned up")
