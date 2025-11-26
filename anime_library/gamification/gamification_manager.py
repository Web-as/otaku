#!/usr/bin/env python3
"""
Gamification Manager - Core XP, leveling, and achievement system.
"""

import logging
from pathlib import Path
from typing import Dict, List, Optional, Callable
from datetime import datetime

from .database import GamificationDatabase

logger = logging.getLogger(__name__)


class GamificationManager:
    """Manages XP, leveling, achievements, and rewards."""
    
    # XP required per level (exponential curve)
    XP_PER_LEVEL = {
        1: 0,      # Level 1 is starting level
        2: 100,
        3: 250,
        4: 450,
        5: 700,
        6: 1000,
        7: 1350,
        8: 1750,
        9: 2200,
        10: 2700,
    }
    
    # Level titles
    LEVEL_TITLES = {
        1: "Newbie Otaku",
        10: "Slice-of-Life Enthusiast",
        20: "Shonen Warrior",
        30: "Anime Connoisseur",
        40: "Anime Archivist",
        50: "Master Collector",
        60: "Otaku Emperor",
        70: "Anime Legend",
        80: "Ultimate Otaku",
        90: "Anime Deity",
        100: "God of Anime",
    }
    
    def __init__(self, db: GamificationDatabase, user_id: str = 'default'):
        """
        Initialize gamification manager.
        
        Args:
            db: GamificationDatabase instance
            user_id: User identifier
        """
        self.db = db
        self.user_id = user_id
        self._level_up_callbacks: List[Callable] = []
        self._achievement_callbacks: List[Callable] = []
    
    def get_user_stats(self) -> Dict:
        """Get current user statistics."""
        stats = self.db.get_user_stats(self.user_id)
        
        # Calculate level from XP
        if stats:
            level = self._calculate_level(stats.get('total_xp', 0))
            stats['calculated_level'] = level
            stats['level_title'] = self.get_level_title(level)
            stats['xp_for_current_level'] = self._get_xp_for_level(level)
            stats['xp_for_next_level'] = self._get_xp_for_level(level + 1)
            stats['xp_progress'] = self._get_xp_progress(stats.get('total_xp', 0), level)
        
        return stats
    
    def _calculate_level(self, total_xp: int) -> int:
        """Calculate level from total XP."""
        level = 1
        for lvl, xp_required in sorted(self.XP_PER_LEVEL.items()):
            if total_xp >= xp_required:
                level = lvl
            else:
                break
        
        # For levels beyond defined, use formula
        if level >= max(self.XP_PER_LEVEL.keys()):
            base_xp = self.XP_PER_LEVEL[max(self.XP_PER_LEVEL.keys())]
            level = max(self.XP_PER_LEVEL.keys())
            remaining_xp = total_xp - base_xp
            # Rough formula: each level needs ~500 more XP than previous
            while remaining_xp >= 0:
                level += 1
                remaining_xp -= 500 * (level - max(self.XP_PER_LEVEL.keys()))
        
        return level
    
    def _get_xp_for_level(self, level: int) -> int:
        """Get XP required to reach a level."""
        if level in self.XP_PER_LEVEL:
            return self.XP_PER_LEVEL[level]
        
        # Extrapolate for higher levels
        max_level = max(self.XP_PER_LEVEL.keys())
        base_xp = self.XP_PER_LEVEL[max_level]
        additional_levels = level - max_level
        # Rough estimate: 500 XP per level after max defined
        return base_xp + (additional_levels * 500)
    
    def _get_xp_progress(self, total_xp: int, current_level: int) -> Dict:
        """Get XP progress for current level."""
        xp_current = self._get_xp_for_level(current_level)
        xp_next = self._get_xp_for_level(current_level + 1)
        xp_in_level = total_xp - xp_current
        xp_needed = xp_next - xp_current
        
        return {
            'current': xp_in_level,
            'needed': xp_needed,
            'percentage': (xp_in_level / xp_needed * 100) if xp_needed > 0 else 100
        }
    
    def get_level_title(self, level: int) -> str:
        """Get title for a level."""
        # Find the highest title <= level
        title = "Newbie Otaku"
        for lvl, title_text in sorted(self.LEVEL_TITLES.items()):
            if level >= lvl:
                title = title_text
        return title
    
    def add_xp(self, xp_amount: int, source: str, source_id: Optional[str] = None) -> Dict:
        """
        Add XP to user and check for level up.
        
        Args:
            xp_amount: Amount of XP to add
            source: Source of XP (e.g., 'watch_episode', 'organize_file')
            source_id: Optional ID of source item
            
        Returns:
            Dict with level_up info if leveled up
        """
        old_stats = self.get_user_stats()
        old_level = old_stats.get('calculated_level', 1)
        
        # Add XP
        self.db.add_xp(self.user_id, xp_amount, source, source_id)
        
        # Check for level up
        new_stats = self.get_user_stats()
        new_level = new_stats.get('calculated_level', 1)
        
        result = {
            'xp_gained': xp_amount,
            'new_total_xp': new_stats.get('total_xp', 0),
            'leveled_up': False,
            'old_level': old_level,
            'new_level': new_level
        }
        
        if new_level > old_level:
            result['leveled_up'] = True
            result['level_title'] = self.get_level_title(new_level)
            
            # Update database level
            cursor = self.db.conn.cursor()
            cursor.execute("""
                UPDATE user_stats 
                SET current_level = ?, updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?
            """, (new_level, self.user_id))
            self.db.conn.commit()
            
            # Trigger callbacks
            for callback in self._level_up_callbacks:
                try:
                    callback(new_level, result)
                except Exception as e:
                    logger.error(f"Level up callback error: {e}")
            
            logger.info(f"User {self.user_id} leveled up to {new_level}!")
        
        return result
    
    def on_file_organized(self, file_count: int = 1):
        """Handle file organization event."""
        # XP per file organized
        xp_per_file = 5
        total_xp = file_count * xp_per_file
        
        result = self.add_xp(total_xp, 'organize_file', f'files_{file_count}')
        
        # Check achievements
        stats = self.get_user_stats()
        total_organized = stats.get('total_files_organized', 0) + file_count
        
        # Update organized count
        cursor = self.db.conn.cursor()
        cursor.execute("""
            UPDATE user_stats 
            SET total_files_organized = total_files_organized + ?
            WHERE user_id = ?
        """, (file_count, self.user_id))
        self.db.conn.commit()
        
        # Check for organizer achievements
        if total_organized >= 500:
            self.check_and_unlock('folder_sensei')
        if total_organized >= 1000:
            self.check_and_unlock('file_master')
        
        # Update quest progress
        self.db.update_quest_progress(self.user_id, 'organize_files', file_count)
        
        return result
    
    def on_episode_watched(self, episode_count: int = 1):
        """Handle episode watched event."""
        # XP per episode
        xp_per_episode = 10
        total_xp = episode_count * xp_per_episode
        
        result = self.add_xp(total_xp, 'watch_episode', f'episodes_{episode_count}')
        
        # Update watched count
        cursor = self.db.conn.cursor()
        cursor.execute("""
            UPDATE user_stats 
            SET total_episodes_watched = total_episodes_watched + ?
            WHERE user_id = ?
        """, (episode_count, self.user_id))
        self.db.conn.commit()
        
        # Check achievements
        stats = self.get_user_stats()
        total_watched = stats.get('total_episodes_watched', 0)
        
        if total_watched >= 100:
            self.check_and_unlock('episode_100')
        if total_watched >= 1000:
            self.check_and_unlock('episode_1000')
        
        # Update quest progress
        self.db.update_quest_progress(self.user_id, 'watch_episodes', episode_count)
        
        return result
    
    def on_anime_added(self, count: int = 1):
        """Handle anime added to library."""
        xp_per_anime = 20
        total_xp = count * xp_per_anime
        
        result = self.add_xp(total_xp, 'add_anime', f'anime_{count}')
        
        # Update count
        cursor = self.db.conn.cursor()
        cursor.execute("""
            UPDATE user_stats 
            SET total_series_added = total_series_added + ?
            WHERE user_id = ?
        """, (count, self.user_id))
        self.db.conn.commit()
        
        # Update quest progress
        self.db.update_quest_progress(self.user_id, 'add_anime', count)
        
        return result
    
    def on_daily_login(self):
        """Handle daily login."""
        # Check if already logged in today
        stats = self.get_user_stats()
        last_login = stats.get('last_login_date')
        today = datetime.now().date()
        
        if last_login:
            last_login_date = datetime.strptime(last_login, '%Y-%m-%d').date() if isinstance(last_login, str) else last_login
            if last_login_date == today:
                return {'already_logged_in': True}
        
        # Calculate streak
        streak = stats.get('streak_days', 0)
        if last_login:
            last_login_date = datetime.strptime(last_login, '%Y-%m-%d').date() if isinstance(last_login, str) else last_login
            days_diff = (today - last_login_date).days
            if days_diff == 1:
                streak += 1
            elif days_diff > 1:
                streak = 1  # Reset streak
        else:
            streak = 1
        
        # Update login date and streak
        cursor = self.db.conn.cursor()
        cursor.execute("""
            UPDATE user_stats 
            SET last_login_date = ?, streak_days = ?, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
        """, (today, streak, self.user_id))
        self.db.conn.commit()
        
        # Daily login bonus
        login_xp = 25 + (streak * 5)  # Base 25 + 5 per streak day
        login_coins = 10 + (streak * 2)
        
        result = self.add_xp(login_xp, 'daily_login', f'streak_{streak}')
        self.db.add_coins(self.user_id, login_coins)
        
        result['streak_days'] = streak
        result['coins_gained'] = login_coins
        
        return result
    
    def check_and_unlock(self, achievement_id: str) -> bool:
        """Check and unlock an achievement if conditions are met."""
        unlocked = self.db.unlock_achievement(self.user_id, achievement_id)
        
        if unlocked:
            # Get achievement info
            cursor = self.db.conn.cursor()
            cursor.execute("SELECT * FROM achievements WHERE achievement_id = ?", (achievement_id,))
            achievement = cursor.fetchone()
            
            if achievement:
                ach_dict = dict(achievement)
                # Trigger callbacks
                for callback in self._achievement_callbacks:
                    try:
                        callback(ach_dict)
                    except Exception as e:
                        logger.error(f"Achievement callback error: {e}")
                
                logger.info(f"Unlocked achievement: {ach_dict.get('name')}")
        
        return unlocked
    
    def get_achievements(self) -> List[Dict]:
        """Get all unlocked achievements."""
        return self.db.get_user_achievements(self.user_id)
    
    def register_level_up_callback(self, callback: Callable):
        """Register callback for level up events."""
        self._level_up_callbacks.append(callback)
    
    def register_achievement_callback(self, callback: Callable):
        """Register callback for achievement unlocks."""
        self._achievement_callbacks.append(callback)

