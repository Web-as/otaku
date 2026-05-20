"""
Web API Endpoints for Anime/Manga Agent
Provides RESTful API for web interface integration

Designed for easy embedding into any anime-tracking website.
Supports Jikan (MyAnimeList) and AniChart data for currently airing anime.
"""
import json
import asyncio
import os
from datetime import datetime
from typing import Dict, List, Any
from functools import wraps
from flask import Flask, request, jsonify, g, send_from_directory
from flask_cors import CORS
import logging

# Load .env so BROWSERUSE_API_KEY and other env vars are available
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass


class AnimeMangaAPI:
    """Flask-based REST API for the Anime/Manga Agent"""
    
    def __init__(self, agent, config: Dict[str, Any] = None):
        self.agent = agent
        self.config = config or {}
        self.app = Flask(__name__)
        
        # Configure CORS - allow all origins by default for easy embedding
        cors_origins = self.config.get("cors_origins", "*")
        CORS(self.app, origins=cors_origins, supports_credentials=True)
        
        # Setup logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger("API")
        
        # Register routes
        self._register_routes()
    
    def _register_routes(self):
        """Register all API routes"""
        
        # Serve the embeddable widget script
        self.app.route("/embed.js")(self.serve_embed_js)

        # Health check
        self.app.route("/api/health")(self.health_check)
        
        # Auth routes
        self.app.route("/api/auth/register", methods=["POST"])(self.register)
        self.app.route("/api/auth/login", methods=["POST"])(self.login)
        self.app.route("/api/auth/logout", methods=["POST"])(self.logout)
        self.app.route("/api/auth/validate", methods=["GET"])(self.validate_token)
        
        # Preferences routes
        self.app.route("/api/preferences", methods=["GET"])(self._require_auth(self.get_preferences))
        self.app.route("/api/preferences", methods=["PUT", "POST"])(self._require_auth(self.update_preferences))
        
        # Search routes
        self.app.route("/api/search/anime", methods=["GET"])(self.search_anime)
        self.app.route("/api/search/manga", methods=["GET"])(self.search_manga)
        
        # Details routes
        self.app.route("/api/anime/<anime_id>", methods=["GET"])(self.get_anime_details)
        self.app.route("/api/manga/<manga_id>", methods=["GET"])(self.get_manga_details)
        
        # Recommendation routes
        self.app.route("/api/recommendations", methods=["GET"])(self._identify_user(self.get_recommendations))
        self.app.route("/api/recommendations/similar/<content_type>/<content_id>", methods=["GET"])(self.get_similar)
        self.app.route("/api/recommendations/by-description", methods=["POST"])(self._require_auth(self.recommend_by_description))
        self.app.route("/api/recommendations/by-liked-titles", methods=["POST"])(self._require_auth(self.recommend_by_liked))
        
        # Trend routes
        self.app.route("/api/trends", methods=["GET"])(self.get_trends)
        self.app.route("/api/season/current", methods=["GET"])(self.get_current_season)
        self.app.route("/api/upcoming", methods=["GET"])(self.get_upcoming)
        
        # ── Airing / Schedule routes (Jikan + AniChart) ──────────────────────
        self.app.route("/api/airing/now", methods=["GET"])(self.get_airing_now)
        self.app.route("/api/airing/schedule", methods=["GET"])(self.get_airing_schedule)
        self.app.route("/api/airing/anichart", methods=["GET"])(self.get_anichart_season)
        
        # Saved links routes
        self.app.route("/api/saved", methods=["GET"])(self._identify_user(self.get_saved_links))
        self.app.route("/api/saved", methods=["POST"])(self._identify_user(self.save_link))
        self.app.route("/api/saved/<link_id>", methods=["DELETE"])(self._identify_user(self.delete_saved_link))
        self.app.route("/api/saved/add-and-get-links", methods=["POST"])(self._require_auth(self.save_and_get_links))
        
        # Watch history routes
        self.app.route("/api/history", methods=["GET"])(self._identify_user(self.get_watch_history))
        self.app.route("/api/history", methods=["POST"])(self._identify_user(self.add_to_history))
        
        # Links routes
        self.app.route("/api/links/watch/<anime_id>/<anime_title>", methods=["GET"])(self.get_watch_links)
        self.app.route("/api/links/read/<manga_id>/<manga_title>", methods=["GET"])(self.get_read_links)
        
        # Personality routes
        self.app.route("/api/personality/waifu", methods=["GET"])(self.get_waifu)
        self.app.route("/api/personality/hate", methods=["GET"])(self.get_most_hated)
        self.app.route("/api/personality/rival", methods=["GET"])(self.get_rival_complaint)
        self.app.route("/api/personality/hot-take", methods=["GET"])(self.get_hot_take)
        self.app.route("/api/personality/top-10", methods=["GET"])(self.get_top_10)
        self.app.route("/api/personality/top-100/<tier>", methods=["GET"])(self.get_top_100_tier)
        self.app.route("/api/personality/greeting", methods=["GET"])(self.get_greeting)
        
        # Knowledge routes
        self.app.route("/api/knowledge/studios", methods=["GET"])(self.get_studios)
        self.app.route("/api/knowledge/studios/<studio_name>", methods=["GET"])(self.get_studio_info)
        self.app.route("/api/knowledge/mangaka", methods=["GET"])(self.get_mangaka)
        self.app.route("/api/knowledge/mangaka/<mangaka_name>", methods=["GET"])(self.get_mangaka_info)
        self.app.route("/api/knowledge/genres/<genre>", methods=["GET"])(self.get_genre_favorites)
        self.app.route("/api/knowledge/classics/<decade>", methods=["GET"])(self.get_classics)
        
        # Chat routes — both support guest (no token) and authenticated users
        self.app.route("/api/chat", methods=["POST"])(self._identify_user(self.chat))
        self.app.route("/api/chat/greet", methods=["GET"])(self._identify_user(self.chat_greet))
        self.app.route("/api/chat/commands", methods=["GET"])(self._identify_user(self.list_commands))

        # ANN learning — feedback signals and weight profile inspection
        self.app.route("/api/feedback", methods=["POST"])(self.record_feedback)
        self.app.route("/api/weights", methods=["GET"])(self.get_weights)
        self.app.route("/api/session/end", methods=["POST"])(self.end_session)

        # Patron (librarian) routes — member borrow awareness
        self.app.route("/api/patron/profile", methods=["GET"])(self.get_patron_profile)
        self.app.route("/api/patron/summary", methods=["GET"])(self.get_patron_summary)
        self.app.route("/api/patron/next-pick", methods=["GET"])(self.get_librarian_pitch)

        # Staff routes — accessible by librarian OR admin
        self.app.route("/api/admin/patrons",          methods=["GET"])(self._require_staff(self.admin_patrons))
        self.app.route("/api/admin/patron/<username>",methods=["GET"])(self._require_staff(self.admin_patron_detail))
        self.app.route("/api/admin/stats",            methods=["GET"])(self._require_staff(self.admin_library_stats))
        self.app.route("/api/admin/popular",          methods=["GET"])(self._require_staff(self.admin_popular))
        self.app.route("/api/admin/top-rated",        methods=["GET"])(self._require_staff(self.admin_top_rated))
        self.app.route("/api/admin/trending",         methods=["GET"])(self._require_staff(self.admin_trending))
        self.app.route("/api/admin/active",           methods=["GET"])(self._require_staff(self.admin_active))
        self.app.route("/api/admin/new-members",      methods=["GET"])(self._require_staff(self.admin_new_members))
        self.app.route("/api/admin/inactive",         methods=["GET"])(self._require_staff(self.admin_inactive))
        # Promote uses its own role-sensitive logic (librarian vs admin callers handled in agent)
        self.app.route("/api/admin/promote",          methods=["POST"])(self._require_staff(self.admin_promote))

        # Language route
        self.app.route("/api/language", methods=["POST"])(self.set_language)
        
        # Activity tracking routes (for widget)
        self.app.route("/api/activity", methods=["POST"])(self.track_activity)
        self.app.route("/api/activity/history", methods=["GET"])(self.get_activity_history)
        self.app.route("/api/notifications", methods=["GET"])(self.get_notifications)
        self.app.route("/api/notifications/mark-read", methods=["POST"])(self.mark_notifications_read)
        
        # Preset interactions routes (for widget quick actions)
        self.app.route("/api/presets/anime-of-week", methods=["GET"])(self.get_anime_of_week)
        self.app.route("/api/presets/anime-of-year", methods=["GET"])(self.get_anime_of_year)
        self.app.route("/api/presets/anime-of-year/<year>", methods=["GET"])(self.get_anime_of_year_by_year)
        self.app.route("/api/presets/seasonal-gems", methods=["GET"])(self.get_seasonal_gems)
        self.app.route("/api/presets/manga-of-month", methods=["GET"])(self.get_manga_of_month)
        self.app.route("/api/presets/underrated", methods=["GET"])(self.get_underrated_picks)
        self.app.route("/api/presets/beginner-friendly", methods=["GET"])(self.get_beginner_friendly)
        self.app.route("/api/presets/comfort-watches", methods=["GET"])(self.get_comfort_watches)
        self.app.route("/api/presets/binge-worthy", methods=["GET"])(self.get_binge_worthy)
        self.app.route("/api/presets/all", methods=["GET"])(self.get_all_presets)
    
    def _require_auth(self, f):
        """Decorator to require authentication"""
        @wraps(f)
        def decorated(*args, **kwargs):
            auth_header = request.headers.get("Authorization", "")
            if not auth_header.startswith("Bearer "):
                return jsonify({"success": False, "message": "Missing or invalid Authorization header"}), 401
            
            token = auth_header[7:]  # Remove "Bearer "
            response = self.agent.validate_token(token)
            
            if not response.success:
                return jsonify(response.to_dict()), 401
            
            g.token = token
            g.user_data = response.data
            
            return f(*args, **kwargs)
        return decorated
    
    def _require_staff(self, f):
        """
        Decorator that allows access to library staff — librarian OR admin role.
        Use this for the majority of admin routes.
        """
        @wraps(f)
        def decorated(*args, **kwargs):
            from core.auth import UserRole
            auth_header = request.headers.get("Authorization", "")
            if not auth_header.startswith("Bearer "):
                return jsonify({"success": False,
                                "message": "Staff access requires authentication."}), 401
            token = auth_header[7:]
            scope = self.agent.data_isolation.get_user_data_scope(token)
            if not scope or not UserRole.is_staff(scope.get("role", "")):
                return jsonify({
                    "success": False,
                    "message": "🗝️ Library staff access only. "
                               "Contact your Head Librarian or administrator.",
                }), 403
            g.token = token
            g.user_data = scope
            return f(*args, **kwargs)
        return decorated

    def _require_admin(self, f):
        """
        Decorator that allows access ONLY to users with the full 'admin' role.
        Use this for sensitive system operations (promote to librarian/admin, etc.).
        """
        @wraps(f)
        def decorated(*args, **kwargs):
            auth_header = request.headers.get("Authorization", "")
            if not auth_header.startswith("Bearer "):
                return jsonify({"success": False,
                                "message": "Admin access requires authentication."}), 401
            token = auth_header[7:]
            scope = self.agent.data_isolation.get_user_data_scope(token)
            if not scope or scope.get("role") != "admin":
                return jsonify({
                    "success": False,
                    "message": "🔐 Chief Archivist (admin) access only. "
                               "Contact your system administrator.",
                }), 403
            g.token = token
            g.user_data = scope
            return f(*args, **kwargs)
        return decorated

    def _identify_user(self, f):
        """Decorator to identify user (guest or member) without requiring auth."""
        @wraps(f)
        def decorated(*args, **kwargs):
            g.token = None
            g.user_data = None
            auth_header = request.headers.get("Authorization", "")
            if auth_header.startswith("Bearer "):
                token = auth_header[7:]
                response = self.agent.validate_token(token)
                if response.success:
                    g.token = token
                    g.user_data = response.data
            return f(*args, **kwargs)
        return decorated
    
    def _make_response(self, agent_response) -> tuple:
        """Convert agent response to Flask response"""
        return jsonify(agent_response.to_dict()), 200 if agent_response.success else 400

    def _get_token(self) -> str | None:
        """Extract Bearer token from the Authorization header."""
        auth = request.headers.get("Authorization", "")
        return auth[7:] if auth.startswith("Bearer ") else None

    def _run_async(self, coro):
        """Run an async coroutine from a sync Flask route"""
        import concurrent.futures
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
            future = pool.submit(asyncio.run, coro)
            return future.result(timeout=30)

    # ── Static files ──────────────────────────────────────────────────────────

    def serve_embed_js(self):
        """Serve the embeddable chat widget script with correct MIME type"""
        web_dir = os.path.dirname(os.path.abspath(__file__))
        return send_from_directory(web_dir, 'embed.js', mimetype='application/javascript')

    # ── Health check ──────────────────────────────────────────────────────────

    def health_check(self):
        """Health check endpoint"""
        return jsonify({
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "version": "1.0.0"
        })
    
    # ── Auth endpoints ────────────────────────────────────────────────────────

    def register(self):
        """Register new user"""
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "message": "No data provided"}), 400
        
        response = self.agent.register_user(
            username=data.get("username"),
            email=data.get("email"),
            password=data.get("password")
        )
        return self._make_response(response)
    
    def login(self):
        """Login user"""
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "message": "No data provided"}), 400
        
        response = self.agent.login_user(
            username=data.get("username"),
            password=data.get("password")
        )
        return self._make_response(response)
    
    def logout(self):
        """Logout user"""
        return jsonify({"success": True, "message": "Logged out successfully"})
    
    def validate_token(self):
        """Validate current token"""
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"success": False, "message": "Missing or invalid Authorization header"}), 401
        
        token = auth_header[7:]
        response = self.agent.validate_token(token)
        return self._make_response(response)
    
    # ── Preferences endpoints ─────────────────────────────────────────────────

    def get_preferences(self):
        """Get user preferences"""
        response = self.agent.get_user_preferences(g.token)
        return self._make_response(response)
    
    def update_preferences(self):
        """Update user preferences"""
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "message": "No data provided"}), 400
        
        response = self.agent.update_user_preferences(g.token, data)
        return self._make_response(response)
    
    # ── Search endpoints ──────────────────────────────────────────────────────

    def search_anime(self):
        """Search for anime"""
        query = request.args.get("q", "")
        limit = request.args.get("limit", 25, type=int)
        
        if not query:
            return jsonify({"success": False, "message": "Query parameter 'q' is required"}), 400
        
        response = self.agent.search_anime(query, limit)
        return self._make_response(response)
    
    def search_manga(self):
        """Search for manga"""
        query = request.args.get("q", "")
        limit = request.args.get("limit", 25, type=int)
        
        if not query:
            return jsonify({"success": False, "message": "Query parameter 'q' is required"}), 400
        
        response = self.agent.search_manga(query, limit)
        return self._make_response(response)
    
    # ── Details endpoints ─────────────────────────────────────────────────────

    def get_anime_details(self, anime_id: str):
        """Get anime details"""
        response = self.agent.get_anime_details(anime_id)
        return self._make_response(response)
    
    def get_manga_details(self, manga_id: str):
        """Get manga details"""
        response = self.agent.get_manga_details(manga_id)
        return self._make_response(response)
    
    # ── Recommendation endpoints ──────────────────────────────────────────────

    def get_recommendations(self):
        """Get personalized recommendations"""
        content_type = request.args.get("type", "anime")
        response = self.agent.get_recommendations(g.token, content_type)
        return self._make_response(response)
    
    def get_similar(self, content_type: str, content_id: str):
        """Get similar content"""
        limit = request.args.get("limit", 5, type=int)
        response = self.agent.get_similar_content(content_id, content_type, limit)
        return self._make_response(response)
    
    def recommend_by_description(self):
        """Get recommendations based on description"""
        data = request.get_json()
        if not data or "description" not in data:
            return jsonify({"success": False, "message": "Description is required"}), 400
        
        content_type = data.get("type", "anime")
        response = self.agent.recommend_by_description(g.token, data["description"], content_type)
        return self._make_response(response)
    
    def recommend_by_liked(self):
        """Get recommendations based on liked titles"""
        data = request.get_json()
        if not data or "titles" not in data:
            return jsonify({"success": False, "message": "Titles list is required"}), 400
        
        content_type = data.get("type", "anime")
        response = self.agent.recommend_by_liked_titles(g.token, data["titles"], content_type)
        return self._make_response(response)
    
    # ── Trend endpoints ───────────────────────────────────────────────────────

    def get_trends(self):
        """Get trending content"""
        content_type = request.args.get("type", "anime")
        limit = request.args.get("limit", 10, type=int)
        response = self.agent.get_trending(content_type, limit)
        return self._make_response(response)
    
    def get_current_season(self):
        """Get current season info"""
        response = self.agent.get_current_season_info()
        return self._make_response(response)
    
    def get_upcoming(self):
        """Get upcoming releases"""
        content_type = request.args.get("type", "anime")
        limit = request.args.get("limit", 10, type=int)
        response = self.agent.get_upcoming_releases(content_type, limit)
        return self._make_response(response)
    
    # ── Airing / Schedule endpoints (Jikan + AniChart) ────────────────────────

    def get_airing_now(self):
        """
        Get currently airing anime using Jikan API.

        Query params:
          - limit (int, default 25): number of results
          - page  (int, default 1):  page number

        Returns a list of currently airing anime enriched with MAL data.
        Ideal for anime-tracking websites that want to show what's airing now.
        """
        limit = request.args.get("limit", 25, type=int)
        page = request.args.get("page", 1, type=int)

        async def _fetch():
            from core.api_clients import JikanClient
            jikan = JikanClient()
            try:
                return await jikan.get_top_anime(filter_type="airing", limit=limit, page=page)
            finally:
                await jikan.close()

        try:
            data = self._run_async(_fetch())

            anime_list = []
            if data and "data" in data:
                for item in data["data"]:
                    anime_list.append({
                        "mal_id": item.get("mal_id"),
                        "title": item.get("title"),
                        "title_english": item.get("title_english"),
                        "title_japanese": item.get("title_japanese"),
                        "image_url": item.get("images", {}).get("jpg", {}).get("large_image_url"),
                        "episodes": item.get("episodes"),
                        "score": item.get("score"),
                        "scored_by": item.get("scored_by"),
                        "rank": item.get("rank"),
                        "popularity": item.get("popularity"),
                        "status": item.get("status"),
                        "airing": item.get("airing"),
                        "aired": item.get("aired", {}).get("string"),
                        "genres": [g["name"] for g in (item.get("genres") or [])],
                        "studios": [s["name"] for s in (item.get("studios") or [])],
                        "synopsis": item.get("synopsis"),
                        "url": item.get("url"),
                        "broadcast": item.get("broadcast", {})
                    })

            return jsonify({
                "success": True,
                "source": "jikan",
                "count": len(anime_list),
                "page": page,
                "data": anime_list
            })
        except Exception as e:
            self.logger.error(f"get_airing_now error: {e}")
            return jsonify({"success": False, "message": str(e)}), 500

    def get_airing_schedule(self):
        """
        Get the weekly airing schedule using Jikan API.

        Query params:
          - day (str, optional): monday|tuesday|wednesday|thursday|friday|saturday|sunday
            If omitted, returns the full week schedule.

        Returns anime grouped by broadcast day — perfect for a schedule widget.
        """
        day = request.args.get("day", None)

        async def _fetch():
            from core.api_clients import JikanClient
            jikan = JikanClient()
            try:
                return await jikan.get_schedules(day=day)
            finally:
                await jikan.close()

        try:
            data = self._run_async(_fetch())

            schedule = {}
            if data and "data" in data:
                for item in data["data"]:
                    broadcast = item.get("broadcast") or {}
                    broadcast_day = broadcast.get("day") or "Unknown"
                    if broadcast_day not in schedule:
                        schedule[broadcast_day] = []
                    schedule[broadcast_day].append({
                        "mal_id": item.get("mal_id"),
                        "title": item.get("title"),
                        "title_english": item.get("title_english"),
                        "image_url": (item.get("images") or {}).get("jpg", {}).get("image_url"),
                        "score": item.get("score"),
                        "genres": [g["name"] for g in (item.get("genres") or [])],
                        "broadcast_time": broadcast.get("time"),
                        "broadcast_timezone": broadcast.get("timezone"),
                        "url": item.get("url")
                    })

            return jsonify({
                "success": True,
                "source": "jikan",
                "day_filter": day,
                "schedule": schedule
            })
        except Exception as e:
            self.logger.error(f"get_airing_schedule error: {e}")
            return jsonify({"success": False, "message": str(e)}), 500

    def get_anichart_season(self):
        """
        Get current or specified season anime via AniList GraphQL (AniChart data source).

        AniChart uses AniList's API under the hood. This endpoint returns rich
        seasonal data including airing times, episode counts, and cover images.

        Query params:
          - year   (int, optional): season year, defaults to current year
          - season (str, optional): winter|spring|summer|fall, defaults to current season
          - page   (int, default 1)
          - per_page (int, default 50)

        This is the primary endpoint for integrating with an anime-tracking website
        that wants AniChart-style seasonal data.
        """
        now = datetime.utcnow()
        month = now.month
        if month in [1, 2, 3]:
            default_season = "winter"
        elif month in [4, 5, 6]:
            default_season = "spring"
        elif month in [7, 8, 9]:
            default_season = "summer"
        else:
            default_season = "fall"

        year = request.args.get("year", now.year, type=int)
        season = request.args.get("season", default_season).lower()
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 50, type=int)

        async def _fetch_anichart(season_map_val, year, page, per_page):
            from core.api_clients import AniListClient
            anilist = AniListClient()
            try:
                return await anilist._query(ANICHART_QUERY, {
                    "season": season_map_val,
                    "seasonYear": year,
                    "page": page,
                    "perPage": per_page
                })
            finally:
                await anilist.close()

        ANICHART_QUERY = """
            query ($season: MediaSeason, $seasonYear: Int, $page: Int, $perPage: Int) {
                Page(page: $page, perPage: $perPage) {
                    pageInfo {
                        total
                        currentPage
                        lastPage
                        hasNextPage
                    }
                    media(
                        type: ANIME,
                        season: $season,
                        seasonYear: $seasonYear,
                        sort: POPULARITY_DESC,
                        isAdult: false
                    ) {
                        id
                        idMal
                        title {
                            romaji
                            english
                            native
                        }
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
                        tags {
                            name
                            rank
                            isMediaSpoiler
                        }
                        studios(isMain: true) {
                            nodes {
                                id
                                name
                                siteUrl
                            }
                        }
                        coverImage {
                            extraLarge
                            large
                            medium
                            color
                        }
                        bannerImage
                        season
                        seasonYear
                        startDate {
                            year
                            month
                            day
                        }
                        endDate {
                            year
                            month
                            day
                        }
                        nextAiringEpisode {
                            airingAt
                            timeUntilAiring
                            episode
                        }
                        airingSchedule(notYetAired: true) {
                            nodes {
                                airingAt
                                timeUntilAiring
                                episode
                            }
                        }
                        externalLinks {
                            site
                            url
                            type
                            language
                        }
                        trailer {
                            id
                            site
                            thumbnail
                        }
                        siteUrl
                        isAdult
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
        try:
            raw = self._run_async(_fetch_anichart(season_map.get(season, "WINTER"), year, page, per_page))

            if "errors" in raw:
                return jsonify({"success": False, "message": raw["errors"][0].get("message", "AniList error")}), 500

            page_data = raw.get("data", {}).get("Page", {})
            media_list = page_data.get("media", [])
            page_info = page_data.get("pageInfo", {})

            # Normalise for easy consumption by website frontends
            result = []
            for m in media_list:
                next_ep = m.get("nextAiringEpisode")
                result.append({
                    "anilist_id": m.get("id"),
                    "mal_id": m.get("idMal"),
                    "title_romaji": m.get("title", {}).get("romaji"),
                    "title_english": m.get("title", {}).get("english"),
                    "title_native": m.get("title", {}).get("native"),
                    "description": m.get("description"),
                    "episodes": m.get("episodes"),
                    "duration": m.get("duration"),
                    "status": m.get("status"),
                    "format": m.get("format"),
                    "average_score": m.get("averageScore"),
                    "mean_score": m.get("meanScore"),
                    "popularity": m.get("popularity"),
                    "trending": m.get("trending"),
                    "favourites": m.get("favourites"),
                    "genres": m.get("genres", []),
                    "tags": [
                        {"name": t["name"], "rank": t["rank"]}
                        for t in m.get("tags", [])
                        if not t.get("isMediaSpoiler")
                    ],
                    "studios": [s["name"] for s in m.get("studios", {}).get("nodes", [])],
                    "cover_image": m.get("coverImage", {}).get("extraLarge") or m.get("coverImage", {}).get("large"),
                    "cover_color": m.get("coverImage", {}).get("color"),
                    "banner_image": m.get("bannerImage"),
                    "season": m.get("season"),
                    "season_year": m.get("seasonYear"),
                    "start_date": m.get("startDate"),
                    "end_date": m.get("endDate"),
                    "next_airing_episode": {
                        "episode": next_ep["episode"],
                        "airing_at": next_ep["airingAt"],
                        "time_until_airing": next_ep["timeUntilAiring"]
                    } if next_ep else None,
                    "external_links": [
                        {"site": l["site"], "url": l["url"], "type": l.get("type"), "language": l.get("language")}
                        for l in m.get("externalLinks", [])
                    ],
                    "trailer": m.get("trailer"),
                    "site_url": m.get("siteUrl"),
                    "is_adult": m.get("isAdult", False)
                })

            return jsonify({
                "success": True,
                "source": "anilist_anichart",
                "season": season,
                "year": year,
                "page_info": page_info,
                "count": len(result),
                "data": result
            })
        except Exception as e:
            self.logger.error(f"get_anichart_season error: {e}")
            return jsonify({"success": False, "message": str(e)}), 500

    # ── Saved links endpoints ─────────────────────────────────────────────────

    def get_saved_links(self):
        """Get user's saved links"""
        content_type = request.args.get("type")
        response = self.agent.get_saved_links(g.token, content_type)
        return self._make_response(response)
    
    def save_link(self):
        """Save a content link"""
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "message": "No data provided"}), 400
        
        required_fields = ["content_id", "content_type", "title", "site_name", "url"]
        missing = [f for f in required_fields if f not in data]
        if missing:
            return jsonify({"success": False, "message": f"Missing required fields: {missing}"}), 400
        
        response = self.agent.save_content_link(
            token=g.token,
            content_id=data["content_id"],
            content_type=data["content_type"],
            title=data["title"],
            site_name=data["site_name"],
            url=data["url"],
            description=data.get("description"),
            thumbnail_url=data.get("thumbnail_url")
        )
        return self._make_response(response)
    
    def delete_saved_link(self, link_id: str):
        """Delete saved link"""
        response = self.agent.delete_saved_link(g.token, link_id)
        return self._make_response(response)
    
    def save_and_get_links(self):
        """Save content and get links"""
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "message": "No data provided"}), 400
        
        required_fields = ["content_id", "content_type", "title"]
        missing = [f for f in required_fields if f not in data]
        if missing:
            return jsonify({"success": False, "message": f"Missing required fields: {missing}"}), 400
        
        response = self.agent.save_and_get_links(
            token=g.token,
            content_id=data["content_id"],
            content_type=data["content_type"],
            title=data["title"]
        )
        return self._make_response(response)
    
    # ── Watch history endpoints ───────────────────────────────────────────────

    def get_watch_history(self):
        """Get user's watch history"""
        limit = request.args.get("limit", 50, type=int)
        response = self.agent.get_watch_history(g.token, limit)
        return self._make_response(response)
    
    def add_to_history(self):
        """Add to watch history"""
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "message": "No data provided"}), 400
        
        required_fields = ["content_id", "content_type", "title"]
        missing = [f for f in required_fields if f not in data]
        if missing:
            return jsonify({"success": False, "message": f"Missing required fields: {missing}"}), 400
        
        response = self.agent.add_to_watch_history(
            token=g.token,
            content_id=data["content_id"],
            content_type=data["content_type"],
            title=data["title"],
            progress_percent=data.get("progress_percent", 0.0),
            rating=data.get("rating")
        )
        return self._make_response(response)
    
    # ── Links endpoints ───────────────────────────────────────────────────────

    def get_watch_links(self, anime_id: str, anime_title: str):
        """Get anime streaming links"""
        response = self.agent.find_watching_links(anime_title, anime_id)
        return self._make_response(response)
    
    def get_read_links(self, manga_id: str, manga_title: str):
        """Get manga reading links"""
        response = self.agent.find_reading_links(manga_title, manga_id)
        return self._make_response(response)
    
    # ── Personality endpoints ─────────────────────────────────────────────────

    def get_waifu(self):
        """Get agent's waifu"""
        language = request.args.get("lang", "en")
        response = self.agent.get_waifu(language)
        return self._make_response(response)
    
    def get_most_hated(self):
        """Get agent's most hated character"""
        language = request.args.get("lang", "en")
        response = self.agent.get_most_hated_character(language)
        return self._make_response(response)
    
    def get_rival_complaint(self):
        """Get agent's rival complaint"""
        response = self.agent.get_rival_complaint()
        return self._make_response(response)
    
    def get_hot_take(self):
        """Get a random hot take"""
        response = self.agent.get_hot_take()
        return self._make_response(response)
    
    def get_top_10(self):
        """Get agent's top 10 anime"""
        language = request.args.get("lang", "en")
        response = self.agent.get_top_10(language)
        return self._make_response(response)
    
    def get_top_100_tier(self, tier: str):
        """Get top 100 by tier"""
        response = self.agent.get_top_100_tier(tier.upper())
        return self._make_response(response)
    
    def get_greeting(self):
        """Get agent greeting"""
        language = request.args.get("lang", "en")
        response = self.agent.get_agent_greeting(language)
        return self._make_response(response)
    
    # ── Knowledge endpoints ───────────────────────────────────────────────────

    def get_studios(self):
        """Get all studios"""
        response = self.agent.get_studio_info()
        return self._make_response(response)
    
    def get_studio_info(self, studio_name: str):
        """Get studio info"""
        response = self.agent.get_studio_info(studio_name)
        return self._make_response(response)
    
    def get_mangaka(self):
        """Get all mangaka"""
        response = self.agent.get_mangaka_info()
        return self._make_response(response)
    
    def get_mangaka_info(self, mangaka_name: str):
        """Get mangaka info"""
        response = self.agent.get_mangaka_info(mangaka_name)
        return self._make_response(response)
    
    def get_genre_favorites(self, genre: str):
        """Get genre favorites"""
        response = self.agent.get_genre_favorites(genre)
        return self._make_response(response)
    
    def get_classics(self, decade: str):
        """Get classics by decade"""
        response = self.agent.get_classics_by_decade(decade)
        return self._make_response(response)
    
    # ── Chat endpoint ─────────────────────────────────────────────────────────

    def chat(self):
        """
        Chat with the agent.

        Accepts an optional ``website_anime_list`` field in the JSON body so that
        an anime-tracking website can pass its current database/watchlist to the
        agent.  The agent will use this context to give personalised answers about
        what the user is watching, what's airing, etc.

        Request body (JSON):
        {
            "message": "What should I watch next?",
            "language": "en",                          // optional, default "en"
            "website_anime_list": [                    // optional — your site's DB
                {
                    "mal_id": 52991,
                    "title": "Sousou no Frieren",
                    "status": "watching",              // watching|completed|plan_to_watch|dropped
                    "score": 10,
                    "episodes_watched": 28
                }
            ],
            "context": {                               // optional extra context
                "current_page": "seasonal",
                "viewing_anime_id": 52991
            }
        }
        """
        data = request.get_json()
        if not data or "message" not in data:
            return jsonify({"success": False, "message": "Message is required"}), 400
        
        language = data.get("language", "en")
        website_anime_list = data.get("website_anime_list", None)
        extra_context = data.get("context", {})

        # Build an enriched message if the website passed its anime list
        message = data["message"]
        if website_anime_list:
            context_lines = []
            for entry in website_anime_list[:50]:  # cap at 50 to avoid huge prompts
                status = entry.get("status", "unknown")
                title = entry.get("title", "Unknown")
                score = entry.get("score")
                ep = entry.get("episodes_watched")
                line = f"- {title} (status: {status}"
                if score:
                    line += f", score: {score}/10"
                if ep is not None:
                    line += f", episodes watched: {ep}"
                line += ")"
                context_lines.append(line)
            context_block = "\n".join(context_lines)
            message = (
                f"[User's anime list from the website]\n{context_block}\n\n"
                f"[User's question]\n{message}"
            )

        # Pass the token (which can be None for guests) to the chat method
        response = self.agent.chat_sync(message, language, token=g.token)
        
        # The agent might return a special response to prompt login/registration
        if response.data and response.data.get("action") in ["prompt_login", "prompt_registration"]:
            return jsonify({
                "success": response.success,
                "message": response.message,
                "data": response.data,
                "error": "auth_required"
            }), 200

        return self._make_response(response)
    
    def list_commands(self):
        """
        GET /api/chat/commands

        Returns a structured list of all available slash commands so a frontend
        can render a command palette, autocomplete, or help tooltip.

        Each entry contains:
          command    – canonical key
          aliases    – all trigger strings (longest match wins)
          description – one-line description
          member_only – whether a Bearer token is required
        """
        token = g.token
        tier, _profile, _name = self.agent._get_patron_context(token)
        commands = []
        for key, (aliases, desc, member_only) in self.agent.SLASH_COMMANDS.items():
            commands.append({
                "command": key,
                "primary_alias": aliases[0],
                "aliases": aliases,
                "description": desc,
                "member_only": member_only,
                "available": not member_only or tier != "guest",
            })
        return jsonify({
            "success": True,
            "data": {
                "commands": commands,
                "patron_tier": tier,
                "total": len(commands),
            }
        }), 200

    def chat_greet(self):
        """
        GET /api/chat/greet

        Returns the librarian's opening greeting tailored to the patron tier.
        No request body needed — just hit this endpoint (with or without a
        Bearer token) when a chat session opens and display the reply.

        Example responses:
          • Guest  → welcome message + invitation to browse or register
          • New member → personalised welcome back with borrow list hint
          • Regular / Frequent patron → personalised greeting referencing history
        """
        token = g.token  # may be None for guests
        tier, profile, patron_name = self.agent._get_patron_context(token)
        lang = request.args.get("language", "en")
        greeting = self.agent._librarian_greeting(tier, profile, lang)
        return jsonify({
            "success": True,
            "message": greeting,
            "data": {
                "response": greeting,
                "patron_tier": tier,
                "language": lang,
            }
        }), 200

    # ── Language endpoint ─────────────────────────────────────────────────────

    def set_language(self):
        """Set agent language"""
        data = request.get_json()
        if not data or "language" not in data:
            return jsonify({"success": False, "message": "Language is required"}), 400

        response = self.agent.set_language(data["language"])
        return self._make_response(response)

    # ── ANN learning endpoints ────────────────────────────────────────────────

    def record_feedback(self):
        """
        Record a user feedback signal that drives ANN weight adaptation.

        POST /api/feedback
        Body: { "feedback_type": "completed"|"high_rating"|"low_rating"|
                                 "saved"|"skipped"|"seasonal_click"|"seasonal_skip",
                "genres": ["Action", "Drama"]  // optional
              }
        """
        token = self._get_token()
        data = request.get_json() or {}
        feedback_type = data.get("feedback_type")
        if not feedback_type:
            return jsonify({"success": False, "message": "feedback_type is required"}), 400

        genres = data.get("genres", [])
        response = self.agent.record_recommendation_feedback(token, feedback_type, genres)
        return self._make_response(response)

    def get_weights(self):
        """
        Return the current per-user ANN weight profile.

        GET /api/weights
        """
        token = self._get_token()
        response = self.agent.get_user_weight_profile(token)
        return self._make_response(response)

    def end_session(self):
        """
        Consolidate short-term memory to long-term at session end.

        POST /api/session/end
        """
        token = self._get_token()
        response = self.agent.end_session(token)
        return self._make_response(response)

    # ── Patron (librarian) endpoints ─────────────────────────────────────────

    def get_patron_profile(self):
        """
        GET /api/patron/profile
        Full librarian dossier: completed list, currently watching,
        plan-to-watch, inferred genres, stats.
        """
        token = self._get_token()
        response = self.agent.get_patron_profile(token)
        return self._make_response(response)

    def get_patron_summary(self):
        """
        GET /api/patron/summary
        One-liner patron index card — name, totals, average rating, top genres.
        """
        token = self._get_token()
        response = self.agent.get_patron_summary(token)
        return self._make_response(response)

    def get_librarian_pitch(self):
        """
        GET /api/patron/next-pick?content_type=anime
        The librarian's personal pick for this patron's next title,
        complete with a personalised pitch in the Otaku Librarian's voice.
        """
        token = self._get_token()
        content_type = request.args.get("content_type", "anime")
        response = self.agent.get_librarian_pitch(token, content_type)
        return self._make_response(response)

    # ── Admin / librarian endpoints ───────────────────────────────────────────

    def admin_patrons(self):
        """
        GET /api/admin/patrons
        Overview of every registered patron — username, role, completions,
        patron tier, last activity date.
        """
        rows = self.agent.db.admin_get_all_patrons()
        return jsonify({"success": True, "data": {"patrons": rows, "total": len(rows)}}), 200

    def admin_patron_detail(self, username: str):
        """
        GET /api/admin/patron/<username>
        Full PatronProfile for the named patron.
        """
        user_id = self.agent.db.admin_get_patron_by_username(username)
        if not user_id:
            return jsonify({"success": False, "message": f"Patron '{username}' not found."}), 404
        profile = self.agent.db.get_patron_profile_data(user_id)
        if not profile:
            return jsonify({"success": False, "message": "Could not load patron profile."}), 500
        return jsonify({"success": True, "data": profile.to_dict()}), 200

    def admin_library_stats(self):
        """
        GET /api/admin/stats
        Aggregate library-wide statistics.
        """
        stats = self.agent.db.admin_get_library_stats()
        return jsonify({"success": True, "data": stats}), 200

    def admin_popular(self):
        """
        GET /api/admin/popular?limit=15
        Most-completed titles across all patrons.
        """
        limit = min(50, max(1, int(request.args.get("limit", 15))))
        rows = self.agent.db.admin_get_popular_titles(limit)
        return jsonify({"success": True, "data": {"titles": rows}}), 200

    def admin_top_rated(self):
        """
        GET /api/admin/top-rated?limit=15
        Highest average-rated titles (min 2 ratings).
        """
        limit = min(50, max(1, int(request.args.get("limit", 15))))
        rows = self.agent.db.admin_get_top_rated_titles(limit)
        return jsonify({"success": True, "data": {"titles": rows}}), 200

    def admin_trending(self):
        """
        GET /api/admin/trending?limit=15
        Titles most recently added to patron borrow queues.
        """
        limit = min(50, max(1, int(request.args.get("limit", 15))))
        rows = self.agent.db.admin_get_trending_additions(limit)
        return jsonify({"success": True, "data": {"titles": rows}}), 200

    def admin_active(self):
        """
        GET /api/admin/active?days=7
        Patrons who have been active within the last N days.
        """
        days = min(90, max(1, int(request.args.get("days", 7))))
        rows = self.agent.db.admin_get_active_patrons(days)
        return jsonify({"success": True, "data": {"patrons": rows, "days": days}}), 200

    def admin_new_members(self):
        """
        GET /api/admin/new-members?days=14
        Patrons who registered in the last N days.
        """
        days = min(90, max(1, int(request.args.get("days", 14))))
        rows = self.agent.db.admin_get_new_members(days)
        return jsonify({"success": True, "data": {"patrons": rows, "days": days}}), 200

    def admin_inactive(self):
        """
        GET /api/admin/inactive?days=30
        Patrons with no activity for the last N days.
        """
        days = min(365, max(7, int(request.args.get("days", 30))))
        rows = self.agent.db.admin_get_inactive_patrons(days)
        return jsonify({"success": True, "data": {"patrons": rows, "days": days}}), 200

    def admin_promote(self):
        """
        POST /api/admin/promote
        Change a patron's role.

        Body: { "username": "sakura", "role": "premium" }

        Head Librarian (librarian role) may assign: user | premium
        Chief Archivist (admin role) may assign:    user | premium | librarian | admin
        """
        from core.auth import UserRole
        data = request.get_json()
        if not data or "username" not in data or "role" not in data:
            return jsonify({"success": False,
                            "message": "Body must include 'username' and 'role'."}), 400

        new_role = data["role"].lower()
        caller_role = g.user_data.get("role", "user")
        is_admin_caller = (caller_role == "admin")

        librarian_roles = {"user", "premium"}
        admin_only_roles = {"librarian", "admin"}
        all_valid = librarian_roles | admin_only_roles

        if new_role not in all_valid:
            return jsonify({"success": False,
                            "message": f"Invalid role. Valid: {', '.join(sorted(all_valid))}"}), 400

        if new_role in admin_only_roles and not is_admin_caller:
            return jsonify({
                "success": False,
                "message": f"Granting '{new_role}' requires Chief Archivist authority.",
            }), 403

        ok = self.agent.db.admin_set_user_role(data["username"], new_role)
        if not ok:
            return jsonify({"success": False,
                            "message": f"Patron '{data['username']}' not found."}), 404
        return jsonify({"success": True,
                        "message": f"Role updated to '{new_role}' for '{data['username']}'."}), 200

    # ── Activity tracking endpoints (for widget) ──────────────────────────────

    def track_activity(self):
        """Track user activity for widget notifications"""
        auth_header = request.headers.get("Authorization", "")
        token = None
        user_id = None
        
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
            response = self.agent.validate_token(token)
            if response.success:
                user_id = response.data.get("user_id")
        
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "message": "No data provided"}), 400
        
        activity_type = data.get("type")
        activity_data = data.get("data", {})
        timestamp = data.get("timestamp", datetime.utcnow().isoformat())
        
        # Generate contextual response based on activity
        response_message = self._generate_activity_response(activity_type, activity_data)
        
        # Store activity if user is authenticated
        if user_id:
            self._store_activity(user_id, activity_type, activity_data, timestamp)
        
        return jsonify({
            "success": True,
            "message": response_message,
            "activity_type": activity_type,
            "timestamp": timestamp
        })
    
    def _generate_activity_response(self, activity_type: str, data: Dict) -> str:
        """Generate contextual response for activity"""
        import random
        
        responses = {
            "add_watchlist": [
                f"'{data.get('title', 'That volume')}' has been added to your checkout list.",
                "An excellent selection. It's now on your list.",
                "Noted. I've reserved that for you."
            ],
            "remove_watchlist": [
                f"'{data.get('title', 'That volume')}' has been returned to the stacks.",
                "Understood. Removed from your checkout list.",
                "Very well. The reservation has been cancelled."
            ],
            "complete_anime": [
                f"Congratulations on completing '{data.get('title', 'that volume')}'! Please remember to return it to the digital shelves.",
                "I see you've finished a series. I hope you found it enlightening.",
                "Completion noted. What are your thoughts on the narrative?"
            ],
            "complete_manga": [
                f"You've finished reading '{data.get('title', 'that volume')}'. I trust it was a rewarding experience.",
                "Completion of this manga has been recorded in your history.",
                "Excellent. Another volume read. Shall I suggest the next?"
            ],
            "rate_anime": [
                f"You rated '{data.get('title', 'it')}' a {data.get('rating', '?')}/10. Thank you. This data helps improve our collection for all patrons.",
                "Your rating has been recorded. This feedback is valuable.",
                "An interesting rating. I will add it to the archival data."
            ],
            "browse_seasonal": [
                "Ah, browsing the 'New Arrivals' shelf. An excellent habit for any patron.",
                "The current season has several noteworthy volumes. Shall I highlight them?",
                "Perusing the latest releases, I see. A wise choice."
            ],
            "search_anime": [
                f"Searching the archives for '{data.get('query', 'your query')}'... One moment.",
                "Let me consult the card catalogue for you.",
                "Searching... Please be as specific as possible for the best results."
            ],
            "view_details": [
                f"Pulling up the file for '{data.get('title', 'this volume')}'...",
                "An interest in this title? A fine choice.",
                "Here is the archival data for that selection."
            ],
            "save_link": [
                f"A link for '{data.get('title', 'that')}' has been bookmarked in your personal file.",
                "Bookmark saved. You may access it at your leisure.",
                "I have catalogued this link for you."
            ],
            "idle": [
                "The library is quiet... May I suggest a volume from our 'All-Time Hits' shelf?",
                "Should you require assistance, I am here.",
                "Are you finding everything you need? Perhaps a recommendation is in order."
            ],
            "new_episode": [
                f"A new installment of '{data.get('title', 'a series on your list')}' has arrived in the archives.",
                "Please be advised, a new episode you follow is now available.",
                "Notification: A new volume has been added to a series you are tracking."
            ],
            "login": [
                "Welcome back. Your library card has been validated.",
                "Greetings. You are now logged in and have full access to the collection.",
                "Access granted. Welcome, patron."
            ],
            "logout": [
                "You have logged out. The archives will be here upon your return.",
                "Farewell. We look forward to your next visit.",
                "Logout successful. Happy reading."
            ]
        }
        
        activity_responses = responses.get(activity_type, ["🎌 Activity tracked!"])
        return random.choice(activity_responses)
    
    def _store_activity(self, user_id: str, activity_type: str, data: Dict, timestamp: str):
        """Store activity in database"""
        self.logger.info(f"Activity: user={user_id}, type={activity_type}, data={data}, time={timestamp}")
    
    def get_activity_history(self):
        """Get user's activity history"""
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"success": False, "message": "Authentication required"}), 401
        
        token = auth_header[7:]
        response = self.agent.validate_token(token)
        
        if not response.success:
            return jsonify(response.to_dict()), 401
        
        return jsonify({
            "success": True,
            "data": {
                "activities": [
                    {"type": "add_watchlist", "title": "Frieren", "timestamp": datetime.utcnow().isoformat()},
                    {"type": "complete_anime", "title": "Jujutsu Kaisen", "timestamp": datetime.utcnow().isoformat()},
                    {"type": "rate_anime", "title": "Attack on Titan", "rating": 10, "timestamp": datetime.utcnow().isoformat()}
                ]
            }
        })
    
    def get_notifications(self):
        """Get pending notifications for user"""
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"success": False, "message": "Authentication required"}), 401
        
        token = auth_header[7:]
        response = self.agent.validate_token(token)
        
        if not response.success:
            return jsonify(response.to_dict()), 401
        
        return jsonify({
            "success": True,
            "data": {
                "notifications": [
                    {
                        "id": "1",
                        "type": "new_episode",
                        "message": "🆕 New episode of Frieren is out!",
                        "read": False,
                        "timestamp": datetime.utcnow().isoformat()
                    },
                    {
                        "id": "2",
                        "type": "trending",
                        "message": "🔥 Solo Leveling is trending right now!",
                        "read": False,
                        "timestamp": datetime.utcnow().isoformat()
                    }
                ],
                "unread_count": 2
            }
        })
    
    def mark_notifications_read(self):
        """Mark notifications as read"""
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"success": False, "message": "Authentication required"}), 401
        
        token = auth_header[7:]
        response = self.agent.validate_token(token)
        
        if not response.success:
            return jsonify(response.to_dict()), 401
        
        data = request.get_json()
        notification_ids = data.get("ids", []) if data else []
        
        return jsonify({
            "success": True,
            "message": f"Marked {len(notification_ids)} notifications as read"
        })
    
    # ── Preset Interactions Endpoints ─────────────────────────────────────────

    def get_anime_of_week(self):
        """Get the anime of the week recommendation"""
        preset = self._get_preset_data('anime_of_the_week')
        if not preset:
            return jsonify({"success": False, "message": "Preset not found"}), 404
        
        current = preset.get('current_pick', {})
        return jsonify({
            "success": True,
            "data": {
                "title": preset.get('title'),
                "description": preset.get('description'),
                "pick": {
                    "title": current.get('title'),
                    "reason": current.get('reason'),
                    "genre": current.get('genre'),
                    "episodes": current.get('episodes'),
                    "where_to_watch": current.get('where_to_watch', [])
                },
                "previous_picks": preset.get('previous_picks', [])
            },
            "message": f"🎬 Anime of the Week: {current.get('title')}! {current.get('reason', '')}"
        })
    
    def get_anime_of_year(self):
        """Get the anime of the year (current year)"""
        preset = self._get_preset_data('anime_of_the_year')
        if not preset:
            return jsonify({"success": False, "message": "Preset not found"}), 404
        
        current_year = str(datetime.utcnow().year)
        year_data = preset.get(current_year, preset.get('2024', {}))
        
        return jsonify({
            "success": True,
            "data": {
                "title": preset.get('title'),
                "description": preset.get('description'),
                "year": current_year,
                "pick": year_data,
                "all_years": {k: v for k, v in preset.items() if k.isdigit()}
            },
            "message": f"🏆 Anime of the Year {current_year}: {year_data.get('title')}! {year_data.get('reason', '')}"
        })
    
    def get_anime_of_year_by_year(self, year: str):
        """Get the anime of a specific year"""
        preset = self._get_preset_data('anime_of_the_year')
        if not preset:
            return jsonify({"success": False, "message": "Preset not found"}), 404
        
        year_data = preset.get(year)
        if not year_data:
            return jsonify({"success": False, "message": f"No data for year {year}"}), 404
        
        return jsonify({
            "success": True,
            "data": {
                "year": year,
                "pick": year_data
            },
            "message": f"🏆 Anime of the Year {year}: {year_data.get('title')}!"
        })
    
    def get_seasonal_gems(self):
        """Get seasonal gems and must-watches"""
        preset = self._get_preset_data('seasonal_gems')
        if not preset:
            return jsonify({"success": False, "message": "Preset not found"}), 404
        
        current = preset.get('current_season', {})
        return jsonify({
            "success": True,
            "data": {
                "title": preset.get('title'),
                "description": preset.get('description'),
                "season": current.get('name'),
                "must_watch": current.get('must_watch', []),
                "hidden_gems": current.get('hidden_gems', []),
                "skip_list": current.get('skip_list', [])
            },
            "message": f"🌸 {current.get('name')} Seasonal Gems! Check out these must-watches!"
        })
    
    def get_manga_of_month(self):
        """Get the manga of the month recommendation"""
        preset = self._get_preset_data('manga_of_the_month')
        if not preset:
            return jsonify({"success": False, "message": "Preset not found"}), 404
        
        current = preset.get('current_pick', {})
        return jsonify({
            "success": True,
            "data": {
                "title": preset.get('title'),
                "description": preset.get('description'),
                "pick": current,
                "previous_picks": preset.get('previous_picks', [])
            },
            "message": f"📖 Manga of the Month: {current.get('title')}! {current.get('reason', '')}"
        })
    
    def get_underrated_picks(self):
        """Get underrated anime and manga picks"""
        preset = self._get_preset_data('underrated_picks')
        if not preset:
            return jsonify({"success": False, "message": "Preset not found"}), 404
        
        return jsonify({
            "success": True,
            "data": {
                "title": preset.get('title'),
                "description": preset.get('description'),
                "anime": preset.get('anime', []),
                "manga": preset.get('manga', [])
            },
            "message": "💎 Here are some underrated gems you might have missed!"
        })
    
    def get_beginner_friendly(self):
        """Get beginner-friendly anime recommendations"""
        preset = self._get_preset_data('beginner_friendly')
        if not preset:
            return jsonify({"success": False, "message": "Preset not found"}), 404
        
        return jsonify({
            "success": True,
            "data": {
                "title": preset.get('title'),
                "description": preset.get('description'),
                "gateway_anime": preset.get('gateway_anime', []),
                "avoid_first": preset.get('avoid_first', [])
            },
            "message": "🎌 New to anime? Start with these perfect gateway shows!"
        })
    
    def get_comfort_watches(self):
        """Get comfort watch recommendations"""
        preset = self._get_preset_data('comfort_watches')
        if not preset:
            return jsonify({"success": False, "message": "Preset not found"}), 404
        
        return jsonify({
            "success": True,
            "data": {
                "title": preset.get('title'),
                "description": preset.get('description'),
                "picks": preset.get('picks', [])
            },
            "message": "☕ Need something cozy? Here are my comfort watch picks!"
        })
    
    def get_binge_worthy(self):
        """Get binge-worthy anime recommendations"""
        preset = self._get_preset_data('binge_worthy')
        if not preset:
            return jsonify({"success": False, "message": "Preset not found"}), 404
        
        return jsonify({
            "success": True,
            "data": {
                "title": preset.get('title'),
                "description": preset.get('description'),
                "picks": preset.get('picks', [])
            },
            "message": "🔥 Warning: These shows will consume your entire weekend!"
        })
    
    def get_all_presets(self):
        """Get all available preset interactions"""
        presets = self._get_all_presets()
        
        return jsonify({
            "success": True,
            "data": {
                "presets": list(presets.keys()),
                "descriptions": {
                    key: value.get('description', '') if isinstance(value, dict) else ''
                    for key, value in presets.items()
                }
            },
            "message": "📚 Here are all my preset recommendations!"
        })
    
    def _get_preset_data(self, preset_name: str) -> Dict:
        """Get preset data from knowledge base"""
        try:
            if hasattr(self.agent, 'knowledge') and self.agent.knowledge:
                if hasattr(self.agent.knowledge, 'personality'):
                    presets = getattr(self.agent.knowledge.personality, 'preset_interactions', {})
                    return presets.get(preset_name, {})
        except Exception as e:
            self.logger.error(f"Error getting preset: {e}")
        
        return self._get_fallback_preset(preset_name)
    
    def _get_all_presets(self) -> Dict:
        """Get all presets from knowledge base"""
        try:
            if hasattr(self.agent, 'knowledge') and self.agent.knowledge:
                if hasattr(self.agent.knowledge, 'personality'):
                    return getattr(self.agent.knowledge.personality, 'preset_interactions', {})
        except Exception as e:
            self.logger.error(f"Error getting presets: {e}")
        
        return {}
    
    def _get_fallback_preset(self, preset_name: str) -> Dict:
        """Fallback preset data if knowledge base is not available"""
        fallbacks = {
            'anime_of_the_week': {
                'title': 'Anime of the Week',
                'description': 'My current weekly pick!',
                'current_pick': {
                    'title': 'Frieren: Beyond Journey\'s End',
                    'reason': 'A masterpiece in the making!',
                    'genre': 'Fantasy, Adventure',
                    'where_to_watch': ['Crunchyroll']
                }
            },
            'anime_of_the_year': {
                'title': 'Anime of the Year',
                'description': 'The best of each year!',
                '2024': {
                    'title': 'Frieren: Beyond Journey\'s End',
                    'reason': 'Unmatched storytelling and animation.',
                    'runner_ups': ['Solo Leveling']
                }
            },
            'seasonal_gems': {
                'title': 'Seasonal Gems',
                'description': 'Must-watches this season!',
                'current_season': {
                    'name': 'Winter 2024',
                    'must_watch': [
                        {'title': 'Frieren', 'hype_level': 'MAXIMUM'},
                        {'title': 'Solo Leveling', 'hype_level': 'EXTREME'}
                    ]
                }
            }
        }
        return fallbacks.get(preset_name, {})
    
    def run(self, host: str = "0.0.0.0", port: int = 5000, debug: bool = False):
        """Run the API server"""
        self.app.run(host=host, port=port, debug=debug)


def create_api(agent, config: Dict[str, Any] = None) -> AnimeMangaAPI:
    """Factory function to create API instance"""
    return AnimeMangaAPI(agent, config)
