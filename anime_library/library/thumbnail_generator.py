#!/usr/bin/env python3
"""
Thumbnail Generator - Generates thumbnails from video files.
"""

from pathlib import Path
from typing import Optional
import os

try:
    import cv2
    OPENCV_AVAILABLE = True
except ImportError:
    OPENCV_AVAILABLE = False


class ThumbnailGenerator:
    """Generates thumbnails from video files."""
    
    def __init__(self, cache_dir: Optional[Path] = None):
        """
        Initialize thumbnail generator.
        
        Args:
            cache_dir: Directory to cache thumbnails
        """
        self.opencv_available = OPENCV_AVAILABLE
        self.cache_dir = cache_dir or Path.home() / '.anime_library' / 'thumbnails'
        self.cache_dir.mkdir(parents=True, exist_ok=True)
    
    def is_available(self) -> bool:
        """Check if OpenCV is available."""
        return self.opencv_available
    
    def generate_thumbnail(self, video_path: Path, timestamp: float = 5.0, 
                          size: tuple = (320, 180)) -> Optional[Path]:
        """
        Generate a thumbnail from a video file.
        
        Args:
            video_path: Path to video file
            timestamp: Timestamp in seconds to extract frame
            size: Thumbnail size (width, height)
            
        Returns:
            Path to generated thumbnail or None
        """
        if not self.opencv_available:
            return None
        
        if not video_path.exists():
            return None
        
        try:
            # Check cache first
            cache_path = self._get_cache_path(video_path, timestamp, size)
            if cache_path.exists():
                return cache_path
            
            # Generate thumbnail
            cap = cv2.VideoCapture(str(video_path))
            if not cap.isOpened():
                return None
            
            # Seek to timestamp
            fps = cap.get(cv2.CAP_PROP_FPS)
            frame_number = int(timestamp * fps)
            cap.set(cv2.CAP_PROP_POS_FRAMES, frame_number)
            
            # Read frame
            ret, frame = cap.read()
            cap.release()
            
            if not ret:
                return None
            
            # Resize
            resized = cv2.resize(frame, size)
            
            # Save to cache
            cache_path.parent.mkdir(parents=True, exist_ok=True)
            cv2.imwrite(str(cache_path), resized)
            
            return cache_path
        except Exception as e:
            print(f"Error generating thumbnail: {e}")
            return None
    
    def _get_cache_path(self, video_path: Path, timestamp: float, size: tuple) -> Path:
        """Get cache path for thumbnail."""
        # Create hash-based filename
        import hashlib
        cache_key = f"{video_path}_{timestamp}_{size[0]}x{size[1]}"
        cache_hash = hashlib.md5(cache_key.encode()).hexdigest()
        return self.cache_dir / f"{cache_hash}.jpg"

