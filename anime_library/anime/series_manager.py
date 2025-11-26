#!/usr/bin/env python3
"""
Series Manager - Groups episodes into series and manages series metadata.
"""

from pathlib import Path
from typing import Dict, List, Optional
from collections import defaultdict

try:
    from .filename_parser import AnimeFilenameParser
    from .episode_detector import EpisodeDetector
except ImportError:
    # Fallback for direct execution
    from filename_parser import AnimeFilenameParser
    from episode_detector import EpisodeDetector


class SeriesManager:
    """Manages anime series and episode grouping."""
    
    def __init__(self, database=None):
        """
        Initialize series manager.
        
        Args:
            database: Optional database instance for persistence
        """
        self.database = database
        self.filename_parser = AnimeFilenameParser()
        self.episode_detector = EpisodeDetector()
        self._series_cache: Dict[str, List[Path]] = defaultdict(list)
    
    def group_episodes_by_series(self, video_files: List[Path]) -> Dict[str, List[Path]]:
        """
        Group video files by series name.
        
        Args:
            video_files: List of video file paths
            
        Returns:
            Dictionary mapping series names to lists of episode paths
        """
        series_groups: Dict[str, List[Path]] = defaultdict(list)
        
        for video_path in video_files:
            parsed = self.filename_parser.parse(video_path.name)
            if parsed and parsed.get('title'):
                series_name = parsed['title']
                series_groups[series_name].append(video_path)
            else:
                # Fallback: use directory name as series name
                series_name = video_path.parent.name
                series_groups[series_name].append(video_path)
        
        # Sort episodes within each series
        for series_name in series_groups:
            series_groups[series_name] = sorted(
                series_groups[series_name],
                key=lambda p: self._extract_episode_number(p)
            )
        
        return dict(series_groups)
    
    def _extract_episode_number(self, path: Path) -> int:
        """Extract episode number for sorting."""
        parsed = self.filename_parser.parse(path.name)
        if parsed and 'episode' in parsed:
            return parsed['episode']
        return 0
    
    def get_series_info(self, series_name: str) -> Dict:
        """
        Get information about a series.
        
        Args:
            series_name: Name of the series
            
        Returns:
            Dictionary with series information
        """
        episodes = self._series_cache.get(series_name, [])
        
        return {
            'name': series_name,
            'episode_count': len(episodes),
            'episodes': episodes,
            'complete': self._is_series_complete(episodes)
        }
    
    def _is_series_complete(self, episodes: List[Path]) -> bool:
        """
        Check if series appears complete (has consecutive episode numbers).
        
        Args:
            episodes: List of episode paths
            
        Returns:
            True if series appears complete
        """
        if len(episodes) < 2:
            return True  # Single episode or empty
        
        episode_numbers = []
        for ep in episodes:
            parsed = self.filename_parser.parse(ep.name)
            if parsed and 'episode' in parsed:
                episode_numbers.append(parsed['episode'])
        
        if not episode_numbers:
            return True  # Can't determine
        
        episode_numbers.sort()
        # Check if episodes are consecutive
        expected = list(range(episode_numbers[0], episode_numbers[0] + len(episode_numbers)))
        return episode_numbers == expected
    
    def find_missing_episodes(self, series_name: str) -> List[int]:
        """
        Find missing episode numbers in a series.
        
        Args:
            series_name: Name of the series
            
        Returns:
            List of missing episode numbers
        """
        episodes = self._series_cache.get(series_name, [])
        episode_numbers = set()
        
        for ep in episodes:
            parsed = self.filename_parser.parse(ep.name)
            if parsed and 'episode' in parsed:
                episode_numbers.add(parsed['episode'])
        
        if not episode_numbers:
            return []
        
        min_ep = min(episode_numbers)
        max_ep = max(episode_numbers)
        expected = set(range(min_ep, max_ep + 1))
        missing = expected - episode_numbers
        
        return sorted(list(missing))

