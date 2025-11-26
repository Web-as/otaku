#!/usr/bin/env python3
"""
Anime Filename Parser - Extracts metadata from anime filenames.
Patterns extracted from MergedApp PHASE3_ADVANCED_SERVICES.md
"""

import re
from typing import Optional, Dict


class AnimeFilenameParser:
    """Parse anime filenames to extract metadata."""
    
    # Common patterns for anime filenames
    PATTERNS = [
        # [Group] Title - 01 [Quality][Codec].mkv
        r'\[(?P<group>[^\]]+)\]\s*(?P<title>.+?)\s*-\s*(?P<ep>\d+)',
        
        # Title S01E01 or Title - S01E01
        r'(?P<title>.+?)\s*-?\s*S(?P<season>\d+)E(?P<ep>\d+)',
        
        # Title - 01 or Title 01
        r'(?P<title>.+?)\s*-?\s*(?P<ep>\d+)',
        
        # Title Episode 01
        r'(?P<title>.+?)\s*Episode\s*(?P<ep>\d+)',
    ]
    
    def __init__(self):
        """Initialize filename parser."""
        self.compiled_patterns = [re.compile(pattern, re.IGNORECASE) for pattern in self.PATTERNS]
    
    def parse(self, filename: str) -> Optional[Dict]:
        """
        Parse filename and extract metadata.
        
        Args:
            filename: Filename to parse
            
        Returns:
            Dictionary with parsed metadata or None if no match
        """
        # Remove file extension
        name = filename.rsplit('.', 1)[0] if '.' in filename else filename
        
        for pattern in self.compiled_patterns:
            match = pattern.search(name)
            if match:
                data = match.groupdict()
                
                # Clean up title
                title = data.get('title', '').strip()
                title = re.sub(r'\[.*?\]', '', title).strip()  # Remove tags
                title = re.sub(r'\(.*?\)', '', title).strip()  # Remove parentheses
                
                # Extract episode number
                ep_str = data.get('ep', '0')
                try:
                    episode = int(ep_str)
                except (ValueError, TypeError):
                    episode = 0
                
                # Extract season number
                season_str = data.get('season', '1')
                try:
                    season = int(season_str) if season_str else 1
                except (ValueError, TypeError):
                    season = 1
                
                return {
                    'title': title,
                    'episode': episode,
                    'season': season,
                    'group': data.get('group'),
                    'original_filename': filename
                }
        
        return None
    
    def extract_quality(self, filename: str) -> Optional[str]:
        """
        Extract quality information from filename (e.g., 1080p, 720p).
        
        Args:
            filename: Filename to parse
            
        Returns:
            Quality string or None
        """
        quality_pattern = r'\[?(\d+p)\]?'
        match = re.search(quality_pattern, filename, re.IGNORECASE)
        if match:
            return match.group(1).lower()
        return None
    
    def extract_codec(self, filename: str) -> Optional[str]:
        """
        Extract codec information from filename (e.g., x264, HEVC).
        
        Args:
            filename: Filename to parse
            
        Returns:
            Codec string or None
        """
        codec_patterns = [
            r'\[?(x264|H\.264|h264)\]?',
            r'\[?(x265|H\.265|HEVC|h265)\]?',
            r'\[?(VP9|vp9)\]?',
            r'\[?(AV1|av1)\]?',
        ]
        
        for pattern in codec_patterns:
            match = re.search(pattern, filename, re.IGNORECASE)
            if match:
                return match.group(1)
        return None

