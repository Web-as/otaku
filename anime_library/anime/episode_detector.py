#!/usr/bin/env python3
"""
Episode Detector - Finds and manages episodes in directories.
Extracted and adapted from Kivy video player app.
"""

import os
from pathlib import Path
from typing import List, Optional

try:
    from .filename_parser import AnimeFilenameParser
except ImportError:
    # Fallback for direct execution
    from filename_parser import AnimeFilenameParser


class EpisodeDetector:
    """Detects and manages anime episodes in directories."""
    
    VIDEO_EXTENSIONS = {'.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm', '.m4v', '.ts', '.m2ts'}
    
    def __init__(self):
        """Initialize episode detector."""
        self.filename_parser = AnimeFilenameParser()
    
    def find_episodes(self, video_path: Path) -> List[Path]:
        """
        Find all episodes in the same directory as the given video.
        Adapted from Kivy app's find_episodes method.
        
        Args:
            video_path: Path to a video file
            
        Returns:
            List of episode paths, sorted by episode number
        """
        directory = video_path.parent
        episodes = []
        
        for file in directory.iterdir():
            if file.is_file() and file.suffix.lower() in self.VIDEO_EXTENSIONS:
                episodes.append(file)
        
        # Sort by episode number if possible
        return sorted(episodes, key=self._extract_episode_number)
    
    def _extract_episode_number(self, path: Path) -> int:
        """
        Extract episode number from filename for sorting.
        
        Args:
            path: Path to video file
            
        Returns:
            Episode number (0 if not found)
        """
        parsed = self.filename_parser.parse(path.name)
        if parsed and 'episode' in parsed:
            return parsed['episode']
        return 0
    
    def get_next_episode(self, current_video: Path) -> Optional[Path]:
        """
        Get the next episode after the current video.
        
        Args:
            current_video: Path to current video file
            
        Returns:
            Path to next episode, or None if not found
        """
        episodes = self.find_episodes(current_video)
        if current_video in episodes:
            current_index = episodes.index(current_video)
            if current_index < len(episodes) - 1:
                return episodes[current_index + 1]
        return None
    
    def get_previous_episode(self, current_video: Path) -> Optional[Path]:
        """
        Get the previous episode before the current video.
        
        Args:
            current_video: Path to current video file
            
        Returns:
            Path to previous episode, or None if not found
        """
        episodes = self.find_episodes(current_video)
        if current_video in episodes:
            current_index = episodes.index(current_video)
            if current_index > 0:
                return episodes[current_index - 1]
        return None
    
    def get_episode_info(self, video_path: Path) -> dict:
        """
        Get episode information including position in series.
        
        Args:
            video_path: Path to video file
            
        Returns:
            Dictionary with episode info
        """
        episodes = self.find_episodes(video_path)
        if video_path in episodes:
            current_index = episodes.index(video_path)
            return {
                'current_episode': current_index + 1,
                'total_episodes': len(episodes),
                'episode_path': video_path,
                'all_episodes': episodes
            }
        return {
            'current_episode': 0,
            'total_episodes': len(episodes),
            'episode_path': video_path,
            'all_episodes': episodes
        }

