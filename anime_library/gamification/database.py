#!/usr/bin/env python3
"""
Gamification Database - Schema and operations for XP, achievements, quests, etc.
"""

import sqlite3
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import json
import logging

logger = logging.getLogger(__name__)


class GamificationDatabase:
    """Database operations for gamification system."""
    
    def __init__(self, db_path: Path):
        """
        Initialize gamification database.
        
        Args:
            db_path: Path to SQLite database file
        """
        self.db_path = db_path
        self.conn = sqlite3.connect(str(db_path), check_same_thread=False)
        self.conn.row_factory = sqlite3.Row
        self._initialize_schema()
    
    def _initialize_schema(self):
        """Create all gamification tables."""
        cursor = self.conn.cursor()
        
        # User stats and leveling
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_stats (
                user_id TEXT PRIMARY KEY DEFAULT 'default',
                total_xp INTEGER DEFAULT 0,
                current_level INTEGER DEFAULT 1,
                otaku_coins INTEGER DEFAULT 0,
                total_episodes_watched INTEGER DEFAULT 0,
                total_series_added INTEGER DEFAULT 0,
                total_files_organized INTEGER DEFAULT 0,
                total_reviews_written INTEGER DEFAULT 0,
                last_login_date DATE,
                streak_days INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Achievements
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS achievements (
                achievement_id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                category TEXT,
                xp_reward INTEGER DEFAULT 0,
                coin_reward INTEGER DEFAULT 0,
                icon TEXT,
                rarity TEXT DEFAULT 'common',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # User achievements (unlocked)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_achievements (
                user_id TEXT,
                achievement_id TEXT,
                unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (user_id, achievement_id),
                FOREIGN KEY (achievement_id) REFERENCES achievements(achievement_id)
            )
        """)
        
        # Daily quests
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS daily_quests (
                quest_id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                quest_type TEXT NOT NULL,
                target_value INTEGER NOT NULL,
                xp_reward INTEGER DEFAULT 0,
                coin_reward INTEGER DEFAULT 0,
                is_active BOOLEAN DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Weekly quests
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS weekly_quests (
                quest_id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                quest_type TEXT NOT NULL,
                target_value INTEGER NOT NULL,
                xp_reward INTEGER DEFAULT 0,
                coin_reward INTEGER DEFAULT 0,
                is_active BOOLEAN DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # User quest progress
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_quest_progress (
                user_id TEXT,
                quest_id TEXT,
                quest_type TEXT,
                current_progress INTEGER DEFAULT 0,
                completed BOOLEAN DEFAULT 0,
                completed_at TIMESTAMP,
                week_start_date DATE,
                day_date DATE,
                PRIMARY KEY (user_id, quest_id, quest_type, week_start_date, day_date)
            )
        """)
        
        # Gacha items
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS gacha_items (
                item_id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                item_type TEXT NOT NULL,
                rarity TEXT NOT NULL,
                icon_path TEXT,
                unlock_data TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # User gacha inventory
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_gacha_inventory (
                user_id TEXT,
                item_id TEXT,
                obtained_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_equipped BOOLEAN DEFAULT 0,
                PRIMARY KEY (user_id, item_id),
                FOREIGN KEY (item_id) REFERENCES gacha_items(item_id)
            )
        """)
        
        # User profile customization
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_profile (
                user_id TEXT PRIMARY KEY,
                avatar_id TEXT,
                banner_id TEXT,
                theme_id TEXT,
                chibi_companion_id TEXT,
                title TEXT,
                favorite_anime TEXT,
                bio TEXT,
                public_library BOOLEAN DEFAULT 1,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # XP history (for tracking)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS xp_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                xp_amount INTEGER,
                source TEXT,
                source_id TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        self.conn.commit()
        
        # Initialize default user stats if not exists
        self._initialize_default_user()
        
        # Initialize default achievements
        self._initialize_default_achievements()
        
        # Initialize default quests
        self._initialize_default_quests()
        
        # Initialize default gacha items
        self._initialize_default_gacha_items()
    
    def _initialize_default_user(self):
        """Create default user stats."""
        cursor = self.conn.cursor()
        cursor.execute("""
            INSERT OR IGNORE INTO user_stats (user_id, total_xp, current_level, otaku_coins)
            VALUES ('default', 0, 1, 100)
        """)
        self.conn.commit()
    
    def _initialize_default_achievements(self):
        """Initialize default achievements."""
        cursor = self.conn.cursor()
        
        achievements = [
            # Watching achievements
            ('binge_master', 'Binge Master', 'Watch 10 episodes in one day', 'watching', 100, 50, 'common'),
            ('classic_conqueror', 'Classic Conqueror', 'Finish 10+ old anime', 'watching', 200, 100, 'rare'),
            ('night_owl', 'Night Owl', 'Watch past midnight', 'watching', 50, 25, 'common'),
            ('episode_100', 'Centurion', 'Watch 100 episodes', 'watching', 500, 200, 'epic'),
            ('episode_1000', 'Thousand Watcher', 'Watch 1000 episodes', 'watching', 2000, 1000, 'legendary'),
            
            # Organizer achievements
            ('folder_sensei', 'Folder Sensei', 'Organize 500 files', 'organizing', 300, 150, 'rare'),
            ('metadata_sorcerer', 'Metadata Sorcerer', 'Auto-tag 100 episodes', 'organizing', 400, 200, 'epic'),
            ('file_master', 'File Master', 'Organize 1000 files', 'organizing', 1000, 500, 'legendary'),
            
            # Community achievements
            ('reviewer', 'Reviewer', 'Leave 10 anime reviews', 'community', 150, 75, 'common'),
            ('critic', 'Critic', 'Leave 50 reviews', 'community', 500, 250, 'epic'),
            
            # Level achievements
            ('level_10', 'Slice-of-Life Enthusiast', 'Reach level 10', 'leveling', 200, 100, 'rare'),
            ('level_20', 'Shonen Warrior', 'Reach level 20', 'leveling', 500, 250, 'epic'),
            ('level_40', 'Anime Archivist', 'Reach level 40', 'leveling', 1500, 750, 'legendary'),
            ('level_60', 'Otaku Emperor', 'Reach level 60', 'leveling', 3000, 1500, 'legendary'),
        ]
        
        for ach_id, name, desc, category, xp, coins, rarity in achievements:
            cursor.execute("""
                INSERT OR IGNORE INTO achievements 
                (achievement_id, name, description, category, xp_reward, coin_reward, rarity)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (ach_id, name, desc, category, xp, coins, rarity))
        
        self.conn.commit()
    
    def _initialize_default_quests(self):
        """Initialize default daily and weekly quests."""
        cursor = self.conn.cursor()
        
        daily_quests = [
            ('daily_watch_1', 'Watch 1 Episode', 'Watch at least one episode today', 'watch_episodes', 1, 50, 25),
            ('daily_add_3', 'Add 3 Anime', 'Add 3 anime to your library', 'add_anime', 3, 75, 30),
            ('daily_rate_1', 'Rate a Series', 'Rate at least one anime', 'rate_anime', 1, 50, 25),
            ('daily_organize', 'Organize a Folder', 'Organize files in a folder', 'organize_files', 1, 100, 50),
        ]
        
        weekly_quests = [
            ('weekly_complete_season', 'Complete a Season', 'Finish watching a complete season', 'complete_season', 1, 500, 200),
            ('weekly_reviews_5', 'Write 5 Reviews', 'Write 5 anime reviews', 'write_reviews', 5, 300, 150),
            ('weekly_tag_15', 'Tag 15 Files', 'Tag or organize 15 files', 'tag_files', 15, 400, 200),
        ]
        
        for quest_id, name, desc, quest_type, target, xp, coins in daily_quests:
            cursor.execute("""
                INSERT OR IGNORE INTO daily_quests 
                (quest_id, name, description, quest_type, target_value, xp_reward, coin_reward)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (quest_id, name, desc, quest_type, target, xp, coins))
        
        for quest_id, name, desc, quest_type, target, xp, coins in weekly_quests:
            cursor.execute("""
                INSERT OR IGNORE INTO weekly_quests 
                (quest_id, name, description, quest_type, target_value, xp_reward, coin_reward)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (quest_id, name, desc, quest_type, target, xp, coins))
        
        self.conn.commit()
    
    def _initialize_default_gacha_items(self):
        """Initialize default gacha items."""
        cursor = self.conn.cursor()
        
        # Example gacha items
        items = [
            # Common wallpapers
            ('wallpaper_1', 'Sakura Wallpaper', 'Beautiful cherry blossom wallpaper', 'wallpaper', 'common', None),
            ('wallpaper_2', 'Cityscape Wallpaper', 'Tokyo night cityscape', 'wallpaper', 'common', None),
            
            # Rare avatars
            ('avatar_1', 'Anime Protagonist', 'Classic anime hero avatar', 'avatar', 'rare', None),
            ('avatar_2', 'Kawaii Character', 'Cute kawaii-style avatar', 'avatar', 'rare', None),
            
            # Epic themes
            ('theme_gaming', 'Gaming HUD Theme', 'Gaming-style interface theme', 'theme', 'epic', None),
            ('theme_otaku_room', 'Otaku Room Theme', 'Anime room-style interface', 'theme', 'epic', None),
            
            # Legendary companions
            ('chibi_happy', 'Happy Chibi Companion', 'A cheerful chibi companion', 'companion', 'legendary', None),
            ('chibi_sleepy', 'Sleepy Chibi Companion', 'A sleepy chibi companion', 'companion', 'legendary', None),
        ]
        
        for item_id, name, desc, item_type, rarity, icon in items:
            cursor.execute("""
                INSERT OR IGNORE INTO gacha_items 
                (item_id, name, description, item_type, rarity)
                VALUES (?, ?, ?, ?, ?)
            """, (item_id, name, desc, item_type, rarity))
        
        self.conn.commit()
    
    def get_user_stats(self, user_id: str = 'default') -> Dict[str, Any]:
        """Get user statistics."""
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM user_stats WHERE user_id = ?", (user_id,))
        row = cursor.fetchone()
        return dict(row) if row else {}
    
    def add_xp(self, user_id: str, xp_amount: int, source: str, source_id: Optional[str] = None):
        """Add XP to user and log it."""
        cursor = self.conn.cursor()
        
        # Update user stats
        cursor.execute("""
            UPDATE user_stats 
            SET total_xp = total_xp + ?, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
        """, (xp_amount, user_id))
        
        # Log XP history
        cursor.execute("""
            INSERT INTO xp_history (user_id, xp_amount, source, source_id)
            VALUES (?, ?, ?, ?)
        """, (user_id, xp_amount, source, source_id))
        
        self.conn.commit()
    
    def add_coins(self, user_id: str, coin_amount: int):
        """Add Otaku Coins to user."""
        cursor = self.conn.cursor()
        cursor.execute("""
            UPDATE user_stats 
            SET otaku_coins = otaku_coins + ?, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
        """, (coin_amount, user_id))
        self.conn.commit()
    
    def unlock_achievement(self, user_id: str, achievement_id: str):
        """Unlock an achievement for user."""
        cursor = self.conn.cursor()
        
        # Check if already unlocked
        cursor.execute("""
            SELECT * FROM user_achievements 
            WHERE user_id = ? AND achievement_id = ?
        """, (user_id, achievement_id))
        
        if cursor.fetchone():
            return False  # Already unlocked
        
        # Unlock achievement
        cursor.execute("""
            INSERT INTO user_achievements (user_id, achievement_id)
            VALUES (?, ?)
        """, (user_id, achievement_id))
        
        # Get achievement rewards
        cursor.execute("""
            SELECT xp_reward, coin_reward FROM achievements WHERE achievement_id = ?
        """, (achievement_id,))
        reward = cursor.fetchone()
        
        if reward:
            xp, coins = reward
            if xp:
                self.add_xp(user_id, xp, 'achievement', achievement_id)
            if coins:
                self.add_coins(user_id, coins)
        
        self.conn.commit()
        return True
    
    def get_user_achievements(self, user_id: str = 'default') -> List[Dict[str, Any]]:
        """Get all unlocked achievements for user."""
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT a.*, ua.unlocked_at
            FROM achievements a
            INNER JOIN user_achievements ua ON a.achievement_id = ua.achievement_id
            WHERE ua.user_id = ?
            ORDER BY ua.unlocked_at DESC
        """, (user_id,))
        return [dict(row) for row in cursor.fetchall()]
    
    def update_quest_progress(self, user_id: str, quest_type: str, progress: int = 1):
        """Update quest progress."""
        cursor = self.conn.cursor()
        today = datetime.now().date()
        week_start = today - timedelta(days=today.weekday())
        
        # Update daily quests
        cursor.execute("""
            UPDATE user_quest_progress
            SET current_progress = current_progress + ?
            WHERE user_id = ? AND quest_type = ? AND day_date = ? AND completed = 0
        """, (progress, user_id, quest_type, today))
        
        # Update weekly quests
        cursor.execute("""
            UPDATE user_quest_progress
            SET current_progress = current_progress + ?
            WHERE user_id = ? AND quest_type = ? AND week_start_date = ? AND completed = 0
        """, (progress, user_id, quest_type, week_start))
        
        self.conn.commit()
    
    def get_active_quests(self, user_id: str = 'default') -> Dict[str, List[Dict[str, Any]]]:
        """Get active daily and weekly quests with progress."""
        cursor = self.conn.cursor()
        today = datetime.now().date()
        week_start = today - timedelta(days=today.weekday())
        
        # Daily quests
        cursor.execute("""
            SELECT dq.*, 
                   COALESCE(uqp.current_progress, 0) as current_progress,
                   COALESCE(uqp.completed, 0) as completed
            FROM daily_quests dq
            LEFT JOIN user_quest_progress uqp ON 
                dq.quest_id = uqp.quest_id AND 
                uqp.user_id = ? AND 
                uqp.quest_type = 'daily' AND
                uqp.day_date = ?
            WHERE dq.is_active = 1
        """, (user_id, today))
        
        daily = [dict(row) for row in cursor.fetchall()]
        
        # Weekly quests
        cursor.execute("""
            SELECT wq.*, 
                   COALESCE(uqp.current_progress, 0) as current_progress,
                   COALESCE(uqp.completed, 0) as completed
            FROM weekly_quests wq
            LEFT JOIN user_quest_progress uqp ON 
                wq.quest_id = uqp.quest_id AND 
                uqp.user_id = ? AND 
                uqp.quest_type = 'weekly' AND
                uqp.week_start_date = ?
            WHERE wq.is_active = 1
        """, (user_id, week_start))
        
        weekly = [dict(row) for row in cursor.fetchall()]
        
        return {'daily': daily, 'weekly': weekly}
    
    def close(self):
        """Close database connection."""
        if self.conn:
            self.conn.close()

