"""
Database Models for Anime/Manga Agent
Handles user preferences, saved links, and recommendation data with user isolation
"""
import json
import sqlite3
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field, asdict
from enum import Enum
import hashlib


class ContentType(Enum):
    """Types of content the agent can track"""
    ANIME = "anime"
    MANGA = "manga"
    BOTH = "both"


class WatchStatus(Enum):
    """User's watch/read status for content"""
    WANT_TO_WATCH = "want_to_watch"
    WATCHING = "watching"
    COMPLETED = "completed"
    ON_HOLD = "on_hold"
    DROPPED = "dropped"


@dataclass
class UserPreference:
    """User's anime/manga preferences"""
    id: str
    user_id: str
    favorite_genres: List[str] = field(default_factory=list)
    disliked_genres: List[str] = field(default_factory=list)
    preferred_studios: List[str] = field(default_factory=list)
    preferred_source_material: List[str] = field(default_factory=list)
    min_rating: float = 5.0
    max_episode_count: Optional[int] = None
    content_types: List[str] = field(default_factory=lambda: ["anime", "manga"])
    release_year_range: tuple = (2000, 2024)
    preferred_length: List[str] = field(default_factory=lambda: ["short", "medium", "long"])
    mood_preferences: Dict[str, int] = field(default_factory=dict)
    language_preference: str = "subbed"
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "favorite_genres": self.favorite_genres,
            "disliked_genres": self.disliked_genres,
            "preferred_studios": self.preferred_studios,
            "preferred_source_material": self.preferred_source_material,
            "min_rating": self.min_rating,
            "max_episode_count": self.max_episode_count,
            "content_types": self.content_types,
            "release_year_range": list(self.release_year_range),
            "preferred_length": self.preferred_length,
            "mood_preferences": self.mood_preferences,
            "language_preference": self.language_preference,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }


@dataclass
class SavedLink:
    """Saved link for anime/manga content"""
    id: str
    user_id: str
    content_id: str
    content_type: str
    title: str
    url: str
    site_name: str
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    status: WatchStatus = WatchStatus.WANT_TO_WATCH
    user_rating: Optional[float] = None
    user_notes: Optional[str] = None
    tags: List[str] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)
    last_accessed: Optional[datetime] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "content_id": self.content_id,
            "content_type": self.content_type,
            "title": self.title,
            "url": self.url,
            "site_name": self.site_name,
            "description": self.description,
            "thumbnail_url": self.thumbnail_url,
            "status": self.status.value,
            "user_rating": self.user_rating,
            "user_notes": self.user_notes,
            "tags": self.tags,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "last_accessed": self.last_accessed.isoformat() if self.last_accessed else None
        }


@dataclass
class WatchHistory:
    """User's watch history for anime/manga"""
    id: str
    user_id: str
    content_id: str
    content_type: str
    title: str
    episode_count: int = 0
    progress_percent: float = 0.0
    started_at: Optional[datetime] = None
    last_watched: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    rating: Optional[float] = None
    review: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.utcnow)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "content_id": self.content_id,
            "content_type": self.content_type,
            "title": self.title,
            "episode_count": self.episode_count,
            "progress_percent": self.progress_percent,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "last_watched": self.last_watched.isoformat() if self.last_watched else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "rating": self.rating,
            "review": self.review,
            "created_at": self.created_at.isoformat()
        }


@dataclass
class UserSearch:
    """User's search queries for recommendations"""
    id: str
    user_id: str
    query: str
    query_type: str  # "description", "title", "genre", "mood"
    results_count: int = 0
    clicked_results: List[str] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.utcnow)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "query": self.query,
            "query_type": self.query_type,
            "results_count": self.results_count,
            "clicked_results": self.clicked_results,
            "created_at": self.created_at.isoformat()
        }


@dataclass
class PatronProfile:
    """
    The librarian's view of a registered patron.
    Aggregates watch history, borrow list, and inferred tastes — no login
    credentials, only reading/viewing activity a librarian would naturally know.
    """
    user_id: str
    username: str
    member_since: Optional[str]

    # Borrow records — what they've watched/read
    completed: List[Dict[str, Any]] = field(default_factory=list)   # {title, content_type, rating, completed_at}
    watching: List[Dict[str, Any]] = field(default_factory=list)    # {title, content_type, progress_percent}
    plan_to_watch: List[Dict[str, Any]] = field(default_factory=list)  # {title, content_type} from saved links

    # Inferred taste profile
    inferred_genres: List[str] = field(default_factory=list)        # genres derived from completed + ratings
    avg_rating: float = 0.0
    total_completed: int = 0
    favourite_content_type: str = "anime"                           # "anime" or "manga"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "user_id": self.user_id,
            "username": self.username,
            "member_since": self.member_since,
            "completed": self.completed,
            "watching": self.watching,
            "plan_to_watch": self.plan_to_watch,
            "inferred_genres": self.inferred_genres,
            "avg_rating": self.avg_rating,
            "total_completed": self.total_completed,
            "favourite_content_type": self.favourite_content_type,
        }


class DatabaseManager:
    """SQLite database manager with user data isolation"""
    
    def __init__(self, db_path: str = "./data/anime_manga_agent.db"):
        self.db_path = db_path
        self._init_database()
    
    def _init_database(self):
        """Initialize database tables"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Users table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    username TEXT UNIQUE NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    role TEXT DEFAULT 'user',
                    created_at TEXT,
                    updated_at TEXT,
                    last_login TEXT,
                    is_active INTEGER DEFAULT 1,
                    failed_login_attempts INTEGER DEFAULT 0,
                    locked_until TEXT
                )
            """)
            
            # User preferences table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS user_preferences (
                    id TEXT PRIMARY KEY,
                    user_id TEXT UNIQUE NOT NULL,
                    favorite_genres TEXT,
                    disliked_genres TEXT,
                    preferred_studios TEXT,
                    preferred_source_material TEXT,
                    min_rating REAL DEFAULT 5.0,
                    max_episode_count INTEGER,
                    content_types TEXT,
                    release_year_range TEXT,
                    preferred_length TEXT,
                    mood_preferences TEXT,
                    language_preference TEXT,
                    created_at TEXT,
                    updated_at TEXT,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            """)
            
            # Saved links table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS saved_links (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    content_id TEXT NOT NULL,
                    content_type TEXT NOT NULL,
                    title TEXT NOT NULL,
                    url TEXT NOT NULL,
                    site_name TEXT NOT NULL,
                    description TEXT,
                    thumbnail_url TEXT,
                    status TEXT DEFAULT 'want_to_watch',
                    user_rating REAL,
                    user_notes TEXT,
                    tags TEXT,
                    created_at TEXT,
                    updated_at TEXT,
                    last_accessed TEXT,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            """)
            
            # Watch history table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS watch_history (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    content_id TEXT NOT NULL,
                    content_type TEXT NOT NULL,
                    title TEXT NOT NULL,
                    episode_count INTEGER DEFAULT 0,
                    progress_percent REAL DEFAULT 0.0,
                    started_at TEXT,
                    last_watched TEXT,
                    completed_at TEXT,
                    rating REAL,
                    review TEXT,
                    created_at TEXT,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            """)
            
            # User searches table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS user_searches (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    query TEXT NOT NULL,
                    query_type TEXT NOT NULL,
                    results_count INTEGER DEFAULT 0,
                    clicked_results TEXT,
                    created_at TEXT,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            """)
            
            # Trends cache table (shared, updated periodically)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS trends_cache (
                    id TEXT PRIMARY KEY,
                    content_type TEXT NOT NULL,
                    trend_data TEXT NOT NULL,
                    season TEXT,
                    year INTEGER,
                    created_at TEXT,
                    updated_at TEXT
                )
            """)

            # ANN weight profiles — per-user learnable scoring weights
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS user_weights (
                    user_id TEXT PRIMARY KEY,
                    w_pref REAL DEFAULT 0.5,
                    w_trend REAL DEFAULT 0.3,
                    w_time REAL DEFAULT 0.2,
                    learning_rate REAL DEFAULT 0.05,
                    genre_scores TEXT DEFAULT '{}',
                    total_interactions INTEGER DEFAULT 0,
                    updated_at TEXT,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            """)

            # Trend snapshots — previous-state records for computing real deltas
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS trend_snapshots (
                    id TEXT PRIMARY KEY,
                    content_id TEXT NOT NULL,
                    content_type TEXT NOT NULL,
                    rank INTEGER,
                    score REAL,
                    popularity INTEGER,
                    scored_by INTEGER,
                    snapshot_at TEXT NOT NULL
                )
            """)

            # Long-term memory storage for AgentMemory
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS memories (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    memory_type TEXT NOT NULL,
                    content TEXT NOT NULL,
                    importance REAL DEFAULT 0.5,
                    access_count INTEGER DEFAULT 0,
                    last_accessed TEXT,
                    created_at TEXT,
                    expires_at TEXT,
                    context TEXT DEFAULT '{}',
                    tags TEXT DEFAULT '[]',
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            """)

            conn.commit()
    
    def _serialize_list(self, data: List[Any]) -> str:
        """Serialize list to JSON string"""
        return json.dumps(data) if data else "[]"
    
    def _deserialize_list(self, data: str) -> List[Any]:
        """Deserialize JSON string to list"""
        return json.loads(data) if data else []
    
    def _serialize_dict(self, data: Dict[str, Any]) -> str:
        """Serialize dict to JSON string"""
        return json.dumps(data) if data else "{}"
    
    def _deserialize_dict(self, data: str) -> Dict[str, Any]:
        """Deserialize JSON string to dict"""
        return json.loads(data) if data else {}
    
    # User operations
    def create_user(self, user_data: Dict[str, Any]) -> str:
        """Create new user and return ID"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO users (id, username, email, password_hash, role, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                user_data["id"],
                user_data["username"],
                user_data["email"],
                user_data["password_hash"],
                user_data.get("role", "user"),
                datetime.utcnow().isoformat(),
                datetime.utcnow().isoformat()
            ))
            conn.commit()
        return user_data["id"]
    
    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
            row = cursor.fetchone()
            if row:
                return {
                    "id": row[0], "username": row[1], "email": row[2],
                    "password_hash": row[3], "role": row[4], "created_at": row[5],
                    "updated_at": row[6], "last_login": row[7], "is_active": row[8],
                    "failed_login_attempts": row[9], "locked_until": row[10]
                }
        return None
    
    def get_user_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        """Get user by username"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
            row = cursor.fetchone()
            if row:
                return {
                    "id": row[0], "username": row[1], "email": row[2],
                    "password_hash": row[3], "role": row[4], "created_at": row[5],
                    "updated_at": row[6], "last_login": row[7], "is_active": row[8],
                    "failed_login_attempts": row[9], "locked_until": row[10]
                }
        return None
    
    def update_user(self, user_id: str, updates: Dict[str, Any]) -> bool:
        """Update user data"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            updates["updated_at"] = datetime.utcnow().isoformat()
            
            set_clause = ", ".join([f"{k} = ?" for k in updates.keys()])
            values = list(updates.values()) + [user_id]
            
            cursor.execute(f"UPDATE users SET {set_clause} WHERE id = ?", values)
            conn.commit()
            return cursor.rowcount > 0
    
    # User preferences operations
    def create_user_preferences(self, preferences: UserPreference) -> str:
        """Create user preferences"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO user_preferences (
                    id, user_id, favorite_genres, disliked_genres,
                    preferred_studios, preferred_source_material, min_rating,
                    max_episode_count, content_types, release_year_range,
                    preferred_length, mood_preferences, language_preference,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                preferences.id, preferences.user_id,
                self._serialize_list(preferences.favorite_genres),
                self._serialize_list(preferences.disliked_genres),
                self._serialize_list(preferences.preferred_studios),
                self._serialize_list(preferences.preferred_source_material),
                preferences.min_rating, preferences.max_episode_count,
                self._serialize_list(preferences.content_types),
                self._serialize_list(list(preferences.release_year_range)),
                self._serialize_list(preferences.preferred_length),
                self._serialize_dict(preferences.mood_preferences),
                preferences.language_preference,
                preferences.created_at.isoformat(),
                preferences.updated_at.isoformat()
            ))
            conn.commit()
        return preferences.id
    
    def get_user_preferences(self, user_id: str) -> Optional[UserPreference]:
        """Get user preferences"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM user_preferences WHERE user_id = ?", (user_id,))
            row = cursor.fetchone()
            if row:
                return UserPreference(
                    id=row[0], user_id=row[1],
                    favorite_genres=self._deserialize_list(row[2]),
                    disliked_genres=self._deserialize_list(row[3]),
                    preferred_studios=self._deserialize_list(row[4]),
                    preferred_source_material=self._deserialize_list(row[5]),
                    min_rating=row[6], max_episode_count=row[7],
                    content_types=self._deserialize_list(row[8]),
                    release_year_range=tuple(self._deserialize_list(row[9])),
                    preferred_length=self._deserialize_list(row[10]),
                    mood_preferences=self._deserialize_dict(row[11]),
                    language_preference=row[12],
                    created_at=datetime.fromisoformat(row[13]),
                    updated_at=datetime.fromisoformat(row[14])
                )
        return None
    
    def update_user_preferences(self, user_id: str, updates: Dict[str, Any]) -> bool:
        """Update user preferences"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            updates["updated_at"] = datetime.utcnow().isoformat()
            
            set_clause = ", ".join([f"{k} = ?" for k in updates.keys()])
            values = list(updates.values()) + [user_id]
            
            cursor.execute(f"UPDATE user_preferences SET {set_clause} WHERE user_id = ?", values)
            conn.commit()
            return cursor.rowcount > 0
    
    # Saved links operations
    def create_saved_link(self, link: SavedLink) -> str:
        """Create saved link"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO saved_links (
                    id, user_id, content_id, content_type, title, url, site_name,
                    description, thumbnail_url, status, user_rating, user_notes,
                    tags, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                link.id, link.user_id, link.content_id, link.content_type,
                link.title, link.url, link.site_name, link.description,
                link.thumbnail_url, link.status.value, link.user_rating,
                link.user_notes, self._serialize_list(link.tags),
                link.created_at.isoformat(), link.updated_at.isoformat()
            ))
            conn.commit()
        return link.id
    
    def get_user_saved_links(self, user_id: str, content_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get all saved links for user with optional content type filter"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            if content_type:
                cursor.execute(
                    "SELECT * FROM saved_links WHERE user_id = ? AND content_type = ? ORDER BY created_at DESC",
                    (user_id, content_type)
                )
            else:
                cursor.execute("SELECT * FROM saved_links WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
            
            rows = cursor.fetchall()
            return [
                {
                    "id": row[0], "user_id": row[1], "content_id": row[2],
                    "content_type": row[3], "title": row[4], "url": row[5],
                    "site_name": row[6], "description": row[7], "thumbnail_url": row[8],
                    "status": row[9], "user_rating": row[10], "user_notes": row[11],
                    "tags": self._deserialize_list(row[12]), "created_at": row[13],
                    "updated_at": row[14], "last_accessed": row[15]
                }
                for row in rows
            ]
    
    def update_saved_link(self, link_id: str, user_id: str, updates: Dict[str, Any]) -> bool:
        """Update saved link with user ownership check"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            updates["updated_at"] = datetime.utcnow().isoformat()
            
            # First verify ownership
            cursor.execute("SELECT user_id FROM saved_links WHERE id = ?", (link_id,))
            row = cursor.fetchone()
            if not row or row[0] != user_id:
                return False
            
            set_clause = ", ".join([f"{k} = ?" for k in updates.keys()])
            values = list(updates.values()) + [link_id]
            
            cursor.execute(f"UPDATE saved_links SET {set_clause} WHERE id = ?", values)
            conn.commit()
            return cursor.rowcount > 0
    
    def delete_saved_link(self, link_id: str, user_id: str) -> bool:
        """Delete saved link with user ownership check"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # First verify ownership
            cursor.execute("SELECT user_id FROM saved_links WHERE id = ?", (link_id,))
            row = cursor.fetchone()
            if not row or row[0] != user_id:
                return False
            
            cursor.execute("DELETE FROM saved_links WHERE id = ?", (link_id,))
            conn.commit()
            return cursor.rowcount > 0
    
    # Watch history operations
    def create_watch_history(self, history: WatchHistory) -> str:
        """Create watch history entry"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO watch_history (
                    id, user_id, content_id, content_type, title, episode_count,
                    progress_percent, started_at, last_watched, completed_at,
                    rating, review, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                history.id, history.user_id, history.content_id, history.content_type,
                history.title, history.episode_count, history.progress_percent,
                history.started_at.isoformat() if history.started_at else None,
                history.last_watched.isoformat() if history.last_watched else None,
                history.completed_at.isoformat() if history.completed_at else None,
                history.rating, history.review, history.created_at.isoformat()
            ))
            conn.commit()
        return history.id
    
    def get_user_watch_history(self, user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Get watch history for user"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT * FROM watch_history WHERE user_id = ? ORDER BY last_watched DESC LIMIT ?",
                (user_id, limit)
            )
            rows = cursor.fetchall()
            return [
                {
                    "id": row[0], "user_id": row[1], "content_id": row[2],
                    "content_type": row[3], "title": row[4], "episode_count": row[5],
                    "progress_percent": row[6], "started_at": row[7],
                    "last_watched": row[8], "completed_at": row[9],
                    "rating": row[10], "review": row[11], "created_at": row[12]
                }
                for row in rows
            ]
    
    # User searches operations
    def create_user_search(self, search: UserSearch) -> str:
        """Create user search entry"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO user_searches (
                    id, user_id, query, query_type, results_count,
                    clicked_results, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                search.id, search.user_id, search.query, search.query_type,
                search.results_count, self._serialize_list(search.clicked_results),
                search.created_at.isoformat()
            ))
            conn.commit()
        return search.id
    
    def get_user_searches(self, user_id: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Get recent searches for user"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT * FROM user_searches WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
                (user_id, limit)
            )
            rows = cursor.fetchall()
            return [
                {
                    "id": row[0], "user_id": row[1], "query": row[2],
                    "query_type": row[3], "results_count": row[4],
                    "clicked_results": self._deserialize_list(row[5]), "created_at": row[6]
                }
                for row in rows
            ]
    
    # Trends cache operations
    def update_trends_cache(self, content_type: str, trend_data: Dict[str, Any], season: str, year: int) -> str:
        """Update trends cache"""
        trend_id = str(uuid.uuid4())
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO trends_cache (
                    id, content_type, trend_data, season, year, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                trend_id, content_type, json.dumps(trend_data), season, year,
                datetime.utcnow().isoformat(), datetime.utcnow().isoformat()
            ))
            conn.commit()
        return trend_id
    
    def get_trends_cache(self, content_type: str, max_age_hours: int = 6) -> Optional[Dict[str, Any]]:
        """Get trends cache if not expired"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT * FROM trends_cache WHERE content_type = ? ORDER BY updated_at DESC LIMIT 1",
                (content_type,)
            )
            row = cursor.fetchone()
            if row:
                updated_at = datetime.fromisoformat(row[6])
                if datetime.utcnow() - updated_at < timedelta(hours=max_age_hours):
                    return {
                        "content_type": row[1],
                        "trend_data": json.loads(row[2]),
                        "season": row[3], "year": row[4],
                        "created_at": row[5], "updated_at": row[6]
                    }
        return None

    # ==================== ANN USER WEIGHT PROFILES ====================

    def get_user_weights(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Load the per-user ANN weight profile"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM user_weights WHERE user_id = ?", (user_id,))
            row = cursor.fetchone()
            if row:
                return {
                    "user_id": row[0],
                    "w_pref": row[1],
                    "w_trend": row[2],
                    "w_time": row[3],
                    "learning_rate": row[4],
                    "genre_scores": self._deserialize_dict(row[5]),
                    "total_interactions": row[6],
                    "updated_at": row[7],
                }
        return None

    def upsert_user_weights(self, user_id: str, weights: Dict[str, Any]) -> bool:
        """Create or update the ANN weight profile for a user"""
        now = datetime.utcnow().isoformat()
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO user_weights
                    (user_id, w_pref, w_trend, w_time, learning_rate,
                     genre_scores, total_interactions, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(user_id) DO UPDATE SET
                    w_pref = excluded.w_pref,
                    w_trend = excluded.w_trend,
                    w_time = excluded.w_time,
                    learning_rate = excluded.learning_rate,
                    genre_scores = excluded.genre_scores,
                    total_interactions = excluded.total_interactions,
                    updated_at = excluded.updated_at
            """, (
                user_id,
                weights.get("w_pref", 0.5),
                weights.get("w_trend", 0.3),
                weights.get("w_time", 0.2),
                weights.get("learning_rate", 0.05),
                self._serialize_dict(weights.get("genre_scores", {})),
                weights.get("total_interactions", 0),
                now,
            ))
            conn.commit()
            return True

    # ==================== TREND SNAPSHOTS ====================

    def save_trend_snapshot(
        self,
        content_id: str,
        content_type: str,
        rank: int,
        score: float,
        popularity: int,
        scored_by: int,
    ) -> str:
        """Persist a single trend snapshot so deltas can be computed next fetch"""
        snapshot_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO trend_snapshots
                    (id, content_id, content_type, rank, score, popularity, scored_by, snapshot_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (snapshot_id, content_id, content_type, rank, score, popularity, scored_by, now))
            conn.commit()
        return snapshot_id

    def get_trend_snapshot(self, content_id: str, content_type: str) -> Optional[Dict[str, Any]]:
        """Get the most recent snapshot for a piece of content (before the current fetch)"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT rank, score, popularity, scored_by, snapshot_at
                FROM trend_snapshots
                WHERE content_id = ? AND content_type = ?
                ORDER BY snapshot_at DESC
                LIMIT 1
            """, (content_id, content_type))
            row = cursor.fetchone()
            if row:
                return {
                    "rank": row[0], "score": row[1],
                    "popularity": row[2], "scored_by": row[3],
                    "snapshot_at": row[4],
                }
        return None

    def prune_old_snapshots(self, keep_days: int = 7):
        """Remove trend snapshots older than keep_days to avoid unbounded growth"""
        cutoff = (datetime.utcnow() - timedelta(days=keep_days)).isoformat()
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM trend_snapshots WHERE snapshot_at < ?", (cutoff,))
            conn.commit()

    # ==================== LONG-TERM MEMORY ====================

    def create_memory_table(self):
        """Ensure the memories table exists (idempotent)"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS memories (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    memory_type TEXT NOT NULL,
                    content TEXT NOT NULL,
                    importance REAL DEFAULT 0.5,
                    access_count INTEGER DEFAULT 0,
                    last_accessed TEXT,
                    created_at TEXT,
                    expires_at TEXT,
                    context TEXT DEFAULT '{}',
                    tags TEXT DEFAULT '[]',
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            """)
            conn.commit()

    def create_memory(self, memory) -> str:
        """Persist a Memory object"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR IGNORE INTO memories
                    (id, user_id, memory_type, content, importance, access_count,
                     last_accessed, created_at, expires_at, context, tags)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                memory.id,
                memory.user_id,
                memory.memory_type.value if hasattr(memory.memory_type, "value") else memory.memory_type,
                memory.content,
                memory.importance,
                memory.access_count,
                memory.last_accessed.isoformat() if memory.last_accessed else None,
                memory.created_at.isoformat() if memory.created_at else datetime.utcnow().isoformat(),
                memory.expires_at.isoformat() if memory.expires_at else None,
                self._serialize_dict(memory.context) if memory.context else "{}",
                self._serialize_list(memory.tags) if memory.tags else "[]",
            ))
            conn.commit()
        return memory.id

    def get_user_memories(self, user_id: str, memory_type=None) -> List[Any]:
        """Retrieve Memory-like dicts for a user, optionally filtered by type"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            if memory_type is not None:
                mt = memory_type.value if hasattr(memory_type, "value") else memory_type
                cursor.execute(
                    "SELECT * FROM memories WHERE user_id = ? AND memory_type = ? ORDER BY created_at DESC",
                    (user_id, mt),
                )
            else:
                cursor.execute(
                    "SELECT * FROM memories WHERE user_id = ? ORDER BY created_at DESC",
                    (user_id,),
                )
            rows = cursor.fetchall()

        from .memory import Memory, MemoryType
        results = []
        for row in rows:
            try:
                mt = MemoryType(row[2])
            except ValueError:
                mt = MemoryType.LONG_TERM
            m = Memory(
                id=row[0], user_id=row[1], memory_type=mt,
                content=row[3], importance=row[4], access_count=row[5],
                last_accessed=datetime.fromisoformat(row[6]) if row[6] else None,
                created_at=datetime.fromisoformat(row[7]) if row[7] else datetime.utcnow(),
                expires_at=datetime.fromisoformat(row[8]) if row[8] else None,
                context=self._deserialize_dict(row[9]),
                tags=self._deserialize_list(row[10]),
            )
            results.append(m)
        return results

    def update_memory(self, memory_id: str, updates: Dict[str, Any]) -> bool:
        """Update fields on a memory row; access_count is incremented, not overwritten"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            if "access_count" in updates:
                cursor.execute(
                    "UPDATE memories SET access_count = access_count + 1, last_accessed = ? WHERE id = ?",
                    (datetime.utcnow().isoformat(), memory_id),
                )
            else:
                set_clause = ", ".join([f"{k} = ?" for k in updates.keys()])
                values = list(updates.values()) + [memory_id]
                cursor.execute(f"UPDATE memories SET {set_clause} WHERE id = ?", values)
            conn.commit()
            return cursor.rowcount > 0

    # ==================== PATRON PROFILE ====================

    def get_patron_profile_data(self, user_id: str) -> Optional["PatronProfile"]:
        """
        Assemble a PatronProfile from multiple tables — the librarian's view of
        a patron.  No password or security data is included.
        """
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()

            # Basic user info
            cursor.execute("SELECT username, created_at FROM users WHERE id = ?", (user_id,))
            user_row = cursor.fetchone()
            if not user_row:
                return None
            username, member_since = user_row

            # Completed (progress_percent == 100 OR completed_at is set)
            cursor.execute("""
                SELECT title, content_type, rating, completed_at, episode_count
                FROM watch_history
                WHERE user_id = ? AND (progress_percent >= 100 OR completed_at IS NOT NULL)
                ORDER BY completed_at DESC
            """, (user_id,))
            completed = [
                {
                    "title": r[0], "content_type": r[1], "rating": r[2],
                    "completed_at": r[3], "episode_count": r[4] or 0,
                }
                for r in cursor.fetchall()
            ]

            # Currently watching (progress > 0 but < 100)
            cursor.execute("""
                SELECT title, content_type, progress_percent, episode_count
                FROM watch_history
                WHERE user_id = ? AND progress_percent > 0 AND progress_percent < 100
                  AND completed_at IS NULL
                ORDER BY last_watched DESC
            """, (user_id,))
            watching = [
                {
                    "title": r[0], "content_type": r[1],
                    "progress_percent": r[2], "episode_count": r[3] or 0,
                }
                for r in cursor.fetchall()
            ]

            # Plan-to-watch / plan-to-read (saved links with want_to_watch status)
            cursor.execute("""
                SELECT DISTINCT title, content_type
                FROM saved_links
                WHERE user_id = ? AND status = 'want_to_watch'
                ORDER BY created_at DESC
                LIMIT 50
            """, (user_id,))
            plan_to_watch = [
                {"title": r[0], "content_type": r[1]}
                for r in cursor.fetchall()
            ]

        # Infer genre preferences from completed titles by looking at preferences table
        prefs = self.get_user_preferences(user_id)
        inferred_genres = prefs.favorite_genres if prefs else []

        # Stats
        ratings = [c["rating"] for c in completed if c["rating"] is not None]
        avg_rating = round(sum(ratings) / len(ratings), 1) if ratings else 0.0

        anime_count = sum(1 for c in completed if c["content_type"] == "anime")
        manga_count = sum(1 for c in completed if c["content_type"] == "manga")
        favourite_content_type = "manga" if manga_count > anime_count else "anime"

        return PatronProfile(
            user_id=user_id,
            username=username,
            member_since=member_since,
            completed=completed,
            watching=watching,
            plan_to_watch=plan_to_watch,
            inferred_genres=inferred_genres,
            avg_rating=avg_rating,
            total_completed=len(completed),
            favourite_content_type=favourite_content_type,
        )

    def get_completed_titles(self, user_id: str) -> List[str]:
        """Return a flat list of titles the user has already completed (for exclusion from recs)."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT LOWER(title) FROM watch_history
                WHERE user_id = ? AND (progress_percent >= 100 OR completed_at IS NOT NULL)
            """, (user_id,))
            return [row[0] for row in cursor.fetchall()]

    # ==================== ADMIN / LIBRARIAN QUERIES ====================

    def admin_get_all_patrons(self) -> List[Dict[str, Any]]:
        """
        Overview row for every registered user — suitable for the ./patrons command.
        Returns username, role, join date, completed count, last activity.
        """
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT
                    u.id,
                    u.username,
                    u.role,
                    u.created_at,
                    u.last_login,
                    COUNT(DISTINCT wh.id) AS completed,
                    MAX(wh.last_watched)  AS last_activity
                FROM users u
                LEFT JOIN watch_history wh
                    ON wh.user_id = u.id
                    AND (wh.progress_percent >= 100 OR wh.completed_at IS NOT NULL)
                GROUP BY u.id
                ORDER BY last_activity DESC NULLS LAST
            """)
            cols = ["user_id", "username", "role", "created_at",
                    "last_login", "completed", "last_activity"]
            return [dict(zip(cols, row)) for row in cursor.fetchall()]

    def admin_get_patron_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        """Look up a patron's user_id by username (case-insensitive)."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT id FROM users WHERE LOWER(username) = LOWER(?)", (username,)
            )
            row = cursor.fetchone()
            return row[0] if row else None

    def admin_get_popular_titles(self, limit: int = 15) -> List[Dict[str, Any]]:
        """Titles completed by the most patrons, with average rating."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT
                    title,
                    content_type,
                    COUNT(DISTINCT user_id)        AS patrons_completed,
                    ROUND(AVG(rating), 1)          AS avg_rating,
                    MAX(completed_at)              AS last_completed
                FROM watch_history
                WHERE progress_percent >= 100 OR completed_at IS NOT NULL
                GROUP BY LOWER(title)
                ORDER BY patrons_completed DESC, avg_rating DESC
                LIMIT ?
            """, (limit,))
            cols = ["title", "content_type", "patrons_completed", "avg_rating", "last_completed"]
            return [dict(zip(cols, row)) for row in cursor.fetchall()]

    def admin_get_top_rated_titles(self, limit: int = 15) -> List[Dict[str, Any]]:
        """Titles with the highest average patron rating (min 2 ratings for fairness)."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT
                    title,
                    content_type,
                    ROUND(AVG(rating), 1)   AS avg_rating,
                    COUNT(rating)           AS rating_count
                FROM watch_history
                WHERE rating IS NOT NULL
                GROUP BY LOWER(title)
                HAVING COUNT(rating) >= 2
                ORDER BY avg_rating DESC, rating_count DESC
                LIMIT ?
            """, (limit,))
            cols = ["title", "content_type", "avg_rating", "rating_count"]
            return [dict(zip(cols, row)) for row in cursor.fetchall()]

    def admin_get_trending_additions(self, limit: int = 15) -> List[Dict[str, Any]]:
        """Titles most recently added to patron borrow queues (saved_links want_to_watch)."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT
                    title,
                    content_type,
                    COUNT(DISTINCT user_id) AS queue_count,
                    MAX(created_at)         AS latest_added
                FROM saved_links
                WHERE status = 'want_to_watch'
                GROUP BY LOWER(title)
                ORDER BY latest_added DESC
                LIMIT ?
            """, (limit,))
            cols = ["title", "content_type", "queue_count", "latest_added"]
            return [dict(zip(cols, row)) for row in cursor.fetchall()]

    def admin_get_active_patrons(self, days: int = 7) -> List[Dict[str, Any]]:
        """Patrons who have logged watch activity within the last N days."""
        cutoff = (datetime.utcnow() - timedelta(days=days)).isoformat()
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT
                    u.username,
                    u.role,
                    MAX(wh.last_watched) AS last_activity,
                    COUNT(wh.id)         AS entries_touched
                FROM watch_history wh
                JOIN users u ON u.id = wh.user_id
                WHERE wh.last_watched >= ?
                GROUP BY wh.user_id
                ORDER BY last_activity DESC
            """, (cutoff,))
            cols = ["username", "role", "last_activity", "entries_touched"]
            return [dict(zip(cols, row)) for row in cursor.fetchall()]

    def admin_get_new_members(self, days: int = 14) -> List[Dict[str, Any]]:
        """Patrons who registered within the last N days."""
        cutoff = (datetime.utcnow() - timedelta(days=days)).isoformat()
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT username, role, created_at
                FROM users
                WHERE created_at >= ?
                ORDER BY created_at DESC
            """, (cutoff,))
            cols = ["username", "role", "joined"]
            return [dict(zip(cols, row)) for row in cursor.fetchall()]

    def admin_get_inactive_patrons(self, days: int = 30) -> List[Dict[str, Any]]:
        """Patrons whose last recorded activity was more than N days ago (or never)."""
        cutoff = (datetime.utcnow() - timedelta(days=days)).isoformat()
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT
                    u.username,
                    u.role,
                    MAX(wh.last_watched) AS last_activity,
                    COUNT(wh.id)         AS total_entries
                FROM users u
                LEFT JOIN watch_history wh ON wh.user_id = u.id
                GROUP BY u.id
                HAVING last_activity IS NULL OR last_activity < ?
                ORDER BY last_activity ASC NULLS FIRST
            """, (cutoff,))
            cols = ["username", "role", "last_activity", "total_entries"]
            return [dict(zip(cols, row)) for row in cursor.fetchall()]

    def admin_get_library_stats(self) -> Dict[str, Any]:
        """
        Aggregate statistics across the entire library — the big picture.
        """
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()

            cursor.execute("SELECT COUNT(*) FROM users")
            total_patrons = cursor.fetchone()[0]

            cursor.execute("""
                SELECT COUNT(*) FROM watch_history
                WHERE progress_percent >= 100 OR completed_at IS NOT NULL
            """)
            total_completions = cursor.fetchone()[0]

            cursor.execute("""
                SELECT COUNT(*) FROM watch_history
                WHERE progress_percent > 0 AND progress_percent < 100
                  AND completed_at IS NULL
            """)
            total_in_progress = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM saved_links WHERE status = 'want_to_watch'")
            total_queued = cursor.fetchone()[0]

            cursor.execute("""
                SELECT ROUND(AVG(rating), 2) FROM watch_history WHERE rating IS NOT NULL
            """)
            global_avg_rating = cursor.fetchone()[0] or 0.0

            cursor.execute("""
                SELECT content_type, COUNT(*) AS cnt
                FROM watch_history
                WHERE progress_percent >= 100 OR completed_at IS NOT NULL
                GROUP BY content_type
                ORDER BY cnt DESC
            """)
            by_type = {row[0]: row[1] for row in cursor.fetchall()}

            # Estimate total archive watch time (anime 24 min/ep default 12 eps, manga 800 min)
            cursor.execute("""
                SELECT content_type, SUM(COALESCE(episode_count, 12))
                FROM watch_history
                WHERE progress_percent >= 100 OR completed_at IS NOT NULL
                GROUP BY content_type
            """)
            time_mins = 0
            for ctype, ep_sum in cursor.fetchall():
                ep_sum = ep_sum or 0
                if ctype == "anime":
                    time_mins += ep_sum * 24
                else:
                    time_mins += ep_sum * 800

            cursor.execute("""
                SELECT COUNT(DISTINCT user_id) FROM watch_history
                WHERE last_watched >= DATE('now', '-7 days')
            """)
            active_7d = cursor.fetchone()[0]

            cursor.execute("""
                SELECT COUNT(*) FROM users
                WHERE created_at >= DATE('now', '-30 days')
            """)
            new_30d = cursor.fetchone()[0]

        return {
            "total_patrons": total_patrons,
            "total_completions": total_completions,
            "total_in_progress": total_in_progress,
            "total_queued": total_queued,
            "global_avg_rating": global_avg_rating,
            "completions_by_type": by_type,
            "estimated_total_hours": round(time_mins / 60, 1),
            "active_last_7_days": active_7d,
            "new_members_last_30_days": new_30d,
        }

    def admin_set_user_role(self, username: str, new_role: str) -> bool:
        """
        Promote or demote a user's role. Returns True on success.
        Valid roles: user | premium | librarian | admin
        """
        valid = {"user", "premium", "librarian", "admin"}
        if new_role not in valid:
            raise ValueError(f"Invalid role '{new_role}'. Must be one of: {sorted(valid)}")
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                "UPDATE users SET role = ? WHERE LOWER(username) = LOWER(?)",
                (new_role, username),
            )
            return conn.total_changes > 0
