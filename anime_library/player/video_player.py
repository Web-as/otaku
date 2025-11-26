#!/usr/bin/env python3
"""
Video Player - VLC-based video playback wrapper.
Uses VLC in separate window (not embedded in Tkinter).
"""

from pathlib import Path
from typing import Optional
import subprocess
import platform
import os

try:
    import vlc
    VLC_AVAILABLE = True
except ImportError:
    VLC_AVAILABLE = False


class VideoPlayer:
    """VLC-based video player wrapper."""
    
    def __init__(self):
        """Initialize video player."""
        self.vlc_available = VLC_AVAILABLE
        self.instance = None
        self.player = None
        self.current_file: Optional[Path] = None
        
        if self.vlc_available:
            try:
                self.instance = vlc.Instance()
                self.player = self.instance.media_player_new()
            except Exception:
                self.vlc_available = False
    
    def is_available(self) -> bool:
        """Check if VLC is available."""
        return self.vlc_available
    
    def play_file(self, video_path: Path, start_position: float = 0.0) -> bool:
        """
        Launch VLC with video file in separate window.
        
        Args:
            video_path: Path to video file
            start_position: Start position (0.0 to 1.0)
            
        Returns:
            True if successful, False otherwise
        """
        if not self.vlc_available:
            # Fallback: try to launch VLC directly
            return self._launch_vlc_direct(video_path, start_position)
        
        try:
            media = self.instance.media_new(str(video_path))
            self.player.set_media(media)
            
            # Set start position if provided
            if start_position > 0.0:
                self.player.set_position(start_position)
            
            # Play in separate window
            self.player.play()
            self.current_file = video_path
            return True
        except Exception as e:
            print(f"Error playing video with VLC: {e}")
            # Fallback to direct launch
            return self._launch_vlc_direct(video_path, start_position)
    
    def _launch_vlc_direct(self, video_path: Path, start_position: float = 0.0) -> bool:
        """
        Launch VLC directly as subprocess (fallback method).
        
        Args:
            video_path: Path to video file
            start_position: Start position (0.0 to 1.0)
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Find VLC executable
            vlc_path = self._find_vlc_executable()
            if not vlc_path:
                print("VLC not found. Please install VLC Media Player.")
                return False
            
            # Build command
            cmd = [vlc_path, str(video_path)]
            
            # Add start position if provided
            if start_position > 0.0:
                # VLC uses --start-time in seconds, but we have position (0.0-1.0)
                # We'd need video duration to convert, so skip for now
                pass
            
            # Launch VLC
            subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            self.current_file = video_path
            return True
        except Exception as e:
            print(f"Error launching VLC: {e}")
            return False
    
    def _find_vlc_executable(self) -> Optional[str]:
        """Find VLC executable path."""
        system = platform.system()
        
        if system == "Windows":
            # Common VLC installation paths on Windows
            possible_paths = [
                r"C:\Program Files\VideoLAN\VLC\vlc.exe",
                r"C:\Program Files (x86)\VideoLAN\VLC\vlc.exe",
                os.path.expanduser(r"~\AppData\Local\Programs\VideoLAN\VLC\vlc.exe"),
            ]
            
            for path in possible_paths:
                if os.path.exists(path):
                    return path
            
            # Try to find in PATH
            try:
                result = subprocess.run(['where', 'vlc'], capture_output=True, text=True)
                if result.returncode == 0 and result.stdout.strip():
                    return result.stdout.strip().split('\n')[0]
            except:
                pass
        
        elif system == "Linux":
            # Try common Linux locations
            possible_paths = ['/usr/bin/vlc', '/usr/local/bin/vlc']
            for path in possible_paths:
                if os.path.exists(path):
                    return path
        
        elif system == "Darwin":  # macOS
            possible_paths = [
                '/Applications/VLC.app/Contents/MacOS/VLC',
                os.path.expanduser('~/Applications/VLC.app/Contents/MacOS/VLC'),
            ]
            for path in possible_paths:
                if os.path.exists(path):
                    return path
        
        return None
    
    def get_position(self) -> float:
        """
        Get current playback position (0.0 to 1.0).
        
        Returns:
            Position as float between 0.0 and 1.0
        """
        if self.vlc_available and self.player:
            try:
                return self.player.get_position()
            except:
                return 0.0
        return 0.0
    
    def stop(self):
        """Stop playback."""
        if self.vlc_available and self.player:
            try:
                self.player.stop()
            except:
                pass
        self.current_file = None

