#!/usr/bin/env python3
"""
Player Manager - Manages video playback and tracks watch progress.
"""

from pathlib import Path
from typing import Optional
from .video_player import VideoPlayer

try:
    from ..anime.episode_detector import EpisodeDetector
except ImportError:
    # Fallback for direct execution
    import sys
    from pathlib import Path as P
    sys.path.insert(0, str(P(__file__).parent.parent))
    from anime.episode_detector import EpisodeDetector


class PlayerManager:
    """Manages video player and watch tracking."""
    
    def __init__(self, database=None):
        """
        Initialize player manager.
        
        Args:
            database: Optional database instance for tracking watch history
        """
        self.player = VideoPlayer()
        self.episode_detector = EpisodeDetector()
        self.database = database
        self.current_video: Optional[Path] = None
    
    def play_episode(self, video_path: Path, resume: bool = True) -> bool:
        """
        Play an episode, optionally resuming from last position.
        
        Args:
            video_path: Path to video file
            resume: If True, resume from last watched position
            
        Returns:
            True if successful
        """
        if not video_path.exists():
            return False
        
        # Get resume position if requested
        start_position = 0.0
        if resume and self.database:
            resume_pos = self.get_resume_position(video_path)
            if resume_pos:
                start_position = resume_pos
        
        # Play video
        success = self.player.play_file(video_path, start_position)
        if success:
            self.current_video = video_path
        
        return success
    
    def play_next_episode(self) -> bool:
        """
        Play the next episode in the series.
        
        Returns:
            True if next episode found and played
        """
        if not self.current_video:
            return False
        
        next_ep = self.episode_detector.get_next_episode(self.current_video)
        if next_ep:
            return self.play_episode(next_ep)
        return False
    
    def play_previous_episode(self) -> bool:
        """
        Play the previous episode in the series.
        
        Returns:
            True if previous episode found and played
        """
        if not self.current_video:
            return False
        
        prev_ep = self.episode_detector.get_previous_episode(self.current_video)
        if prev_ep:
            return self.play_episode(prev_ep)
        return False
    
    def save_watch_position(self, video_path: Path, position: float):
        """
        Save current watch position for an episode.
        
        Args:
            video_path: Path to video file
            position: Position (0.0 to 1.0)
        """
        if self.database:
            # This will be implemented when database is extended
            # For now, just a placeholder
            pass
    
    def get_resume_position(self, video_path: Path) -> Optional[float]:
        """
        Get saved resume position for an episode.
        
        Args:
            video_path: Path to video file
            
        Returns:
            Resume position (0.0 to 1.0) or None
        """
        if self.database:
            # This will be implemented when database is extended
            # For now, return None
            pass
        return None
    
    def mark_as_watched(self, video_path: Path):
        """
        Mark an episode as watched.
        
        Args:
            video_path: Path to video file
        """
        if self.database:
            # This will be implemented when database is extended
            pass

