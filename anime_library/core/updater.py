#!/usr/bin/env python3
"""
Auto-Updater Module - Checks for updates and handles installation.
Supports GitHub releases and local update servers.
"""

import os
import sys
import subprocess
import requests
import hashlib
import shutil
from pathlib import Path
from typing import Optional, Dict, Tuple
from tkinter import messagebox
import tkinter as tk
import logging
import json

logger = logging.getLogger(__name__)

# Current version - update this when releasing new versions
CURRENT_VERSION = "1.0.0"

# Update configuration
# Set these to your GitHub repository or update server
VERSION_URL = None  # e.g., "https://raw.githubusercontent.com/user/repo/main/version.txt"
INSTALLER_URL = None  # e.g., "https://github.com/user/repo/releases/latest/download/AnimeLibraryInstaller.exe"
RELEASE_API_URL = None  # e.g., "https://api.github.com/repos/user/repo/releases/latest"

# Update settings (can be loaded from config)
UPDATE_CHECK_ENABLED = True
UPDATE_CHECK_ON_STARTUP = True
AUTO_DOWNLOAD = False  # If True, download automatically; if False, ask user


class Version:
    """Simple version comparison class."""
    
    def __init__(self, version_string: str):
        """
        Initialize version from string.
        
        Args:
            version_string: Version string like "1.0.0" or "1.2.3-beta"
        """
        self.version_string = version_string
        # Extract numeric parts
        parts = version_string.split('-')[0].split('.')
        try:
            self.major = int(parts[0]) if len(parts) > 0 else 0
            self.minor = int(parts[1]) if len(parts) > 1 else 0
            self.patch = int(parts[2]) if len(parts) > 2 else 0
        except (ValueError, IndexError):
            self.major = 0
            self.minor = 0
            self.patch = 0
    
    def __str__(self):
        return self.version_string
    
    def __lt__(self, other):
        """Compare versions."""
        if not isinstance(other, Version):
            other = Version(str(other))
        return (self.major, self.minor, self.patch) < (other.major, other.minor, other.patch)
    
    def __gt__(self, other):
        """Compare versions."""
        if not isinstance(other, Version):
            other = Version(str(other))
        return (self.major, self.minor, self.patch) > (other.major, other.minor, other.patch)
    
    def __eq__(self, other):
        """Compare versions."""
        if not isinstance(other, Version):
            other = Version(str(other))
        return (self.major, self.minor, self.patch) == (other.major, other.minor, other.patch)


class UpdateChecker:
    """Checks for updates and handles download/installation."""
    
    def __init__(self, current_version: str = CURRENT_VERSION,
                 version_url: Optional[str] = None,
                 installer_url: Optional[str] = None,
                 release_api_url: Optional[str] = None):
        """
        Initialize update checker.
        
        Args:
            current_version: Current application version
            version_url: URL to fetch latest version (simple text file)
            installer_url: URL to download installer/update
            release_api_url: GitHub API URL for release info
        """
        self.current_version = Version(current_version)
        self.version_url = version_url or VERSION_URL
        self.installer_url = installer_url or INSTALLER_URL
        self.release_api_url = release_api_url or RELEASE_API_URL
        self.latest_version: Optional[Version] = None
        self.update_info: Optional[Dict] = None
    
    def check_for_updates(self, timeout: int = 5) -> Tuple[bool, Optional[str]]:
        """
        Check if a newer version is available.
        
        Args:
            timeout: Request timeout in seconds
            
        Returns:
            Tuple of (update_available, latest_version_string)
        """
        if not self.version_url and not self.release_api_url:
            logger.debug("No update URLs configured, skipping update check")
            return False, None
        
        try:
            # Try GitHub API first (more information)
            if self.release_api_url:
                return self._check_github_release(timeout)
            # Fallback to simple version.txt
            elif self.version_url:
                return self._check_version_file(timeout)
        except Exception as e:
            logger.warning(f"Update check failed: {e}")
            return False, None
        
        return False, None
    
    def _check_github_release(self, timeout: int) -> Tuple[bool, Optional[str]]:
        """Check for updates using GitHub API."""
        try:
            response = requests.get(self.release_api_url, timeout=timeout)
            response.raise_for_status()
            
            release_data = response.json()
            latest_version_str = release_data.get('tag_name', '').lstrip('v')
            self.latest_version = Version(latest_version_str)
            
            # Store release info
            self.update_info = {
                'version': latest_version_str,
                'name': release_data.get('name', ''),
                'body': release_data.get('body', ''),
                'published_at': release_data.get('published_at', ''),
                'assets': release_data.get('assets', [])
            }
            
            # Find installer/download URL
            if not self.installer_url and release_data.get('assets'):
                for asset in release_data['assets']:
                    if 'installer' in asset.get('name', '').lower() or asset.get('name', '').endswith('.exe'):
                        self.installer_url = asset.get('browser_download_url')
                        break
            
            update_available = self.latest_version > self.current_version
            return update_available, latest_version_str
            
        except Exception as e:
            logger.error(f"GitHub release check failed: {e}")
            return False, None
    
    def _check_version_file(self, timeout: int) -> Tuple[bool, Optional[str]]:
        """Check for updates using simple version.txt file."""
        try:
            response = requests.get(self.version_url, timeout=timeout)
            response.raise_for_status()
            
            latest_version_str = response.text.strip().lstrip('v')
            self.latest_version = Version(latest_version_str)
            
            update_available = self.latest_version > self.current_version
            return update_available, latest_version_str
            
        except Exception as e:
            logger.error(f"Version file check failed: {e}")
            return False, None
    
    def download_update(self, download_path: Optional[Path] = None) -> Optional[Path]:
        """
        Download the update installer.
        
        Args:
            download_path: Where to save the installer (default: temp directory)
            
        Returns:
            Path to downloaded installer, or None if failed
        """
        if not self.installer_url:
            logger.error("No installer URL configured")
            return None
        
        if download_path is None:
            # Use temp directory
            import tempfile
            temp_dir = Path(tempfile.gettempdir())
            download_path = temp_dir / "AnimeLibraryInstaller.exe"
        
        try:
            logger.info(f"Downloading update from {self.installer_url}")
            response = requests.get(self.installer_url, stream=True, timeout=30)
            response.raise_for_status()
            
            # Download with progress (simple)
            total_size = int(response.headers.get('content-length', 0))
            downloaded = 0
            
            with open(download_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
                        downloaded += len(chunk)
                        # Could emit progress event here
            
            logger.info(f"Update downloaded to {download_path}")
            return download_path
            
        except Exception as e:
            logger.error(f"Download failed: {e}")
            if download_path.exists():
                download_path.unlink()  # Clean up partial download
            return None
    
    def install_update(self, installer_path: Path) -> bool:
        """
        Launch the installer and exit the application.
        
        Args:
            installer_path: Path to installer executable
            
        Returns:
            True if installer launched successfully
        """
        if not installer_path.exists():
            logger.error(f"Installer not found: {installer_path}")
            return False
        
        try:
            # Launch installer
            subprocess.Popen([str(installer_path)])
            logger.info("Installer launched, exiting application")
            # Exit application (updater will restart it)
            os._exit(0)
            return True
        except Exception as e:
            logger.error(f"Failed to launch installer: {e}")
            return False
    
    def show_update_dialog(self, root: Optional[tk.Tk] = None) -> bool:
        """
        Show update notification dialog.
        
        Args:
            root: Optional Tkinter root (will create if None)
            
        Returns:
            True if user wants to update
        """
        if not self.latest_version or not self.update_info:
            return False
        
        # Create root if needed
        if root is None:
            root = tk.Tk()
            root.withdraw()
        
        # Build message
        message = f"A new version is available!\n\n"
        message += f"Current version: {self.current_version}\n"
        message += f"Latest version: {self.latest_version}\n\n"
        
        if self.update_info.get('name'):
            message += f"{self.update_info['name']}\n\n"
        
        if self.update_info.get('body'):
            # Truncate changelog if too long
            body = self.update_info['body']
            if len(body) > 500:
                body = body[:500] + "..."
            message += f"Changes:\n{body}\n\n"
        
        message += "Would you like to download and install the update?"
        
        result = messagebox.askyesno(
            "Update Available",
            message,
            icon='question'
        )
        
        if root != tk._default_root:
            root.destroy()
        
        return result


def check_for_updates_silent(version_url: Optional[str] = None,
                             installer_url: Optional[str] = None,
                             release_api_url: Optional[str] = None) -> Optional[UpdateChecker]:
    """
    Check for updates silently (no UI).
    
    Args:
        version_url: Optional version URL override
        installer_url: Optional installer URL override
        release_api_url: Optional GitHub API URL override
        
    Returns:
        UpdateChecker instance if update available, None otherwise
    """
    if not UPDATE_CHECK_ENABLED:
        return None
    
    # Load config if URLs not provided
    if not version_url and not release_api_url:
        config = load_update_config()
        version_url = version_url or config.get('version_url')
        installer_url = installer_url or config.get('installer_url')
        release_api_url = release_api_url or config.get('release_api_url')
    
    checker = UpdateChecker(
        current_version=CURRENT_VERSION,
        version_url=version_url,
        installer_url=installer_url,
        release_api_url=release_api_url
    )
    
    update_available, latest_version = checker.check_for_updates()
    
    if update_available:
        logger.info(f"Update available: {latest_version}")
        return checker
    
    return None


def check_for_updates_with_ui(root: Optional[tk.Tk] = None,
                              version_url: Optional[str] = None,
                              installer_url: Optional[str] = None,
                              release_api_url: Optional[str] = None) -> bool:
    """
    Check for updates and show UI if available.
    
    Args:
        root: Optional Tkinter root window
        version_url: Optional version URL override
        installer_url: Optional installer URL override
        release_api_url: Optional GitHub API URL override
        
    Returns:
        True if update was initiated
    """
    if not UPDATE_CHECK_ENABLED:
        return False
    
    # Load config if URLs not provided
    if not version_url and not release_api_url:
        config = load_update_config()
        version_url = version_url or config.get('version_url')
        installer_url = installer_url or config.get('installer_url')
        release_api_url = release_api_url or config.get('release_api_url')
    
    checker = check_for_updates_silent(version_url, installer_url, release_api_url)
    
    if checker and checker.show_update_dialog(root):
        # User wants to update
        installer_path = checker.download_update()
        if installer_path:
            return checker.install_update(installer_path)
    
    return False


def load_update_config(config_path: Optional[Path] = None) -> Dict:
    """
    Load update configuration from file.
    
    Args:
        config_path: Path to config file (default: config.json in project root)
        
    Returns:
        Configuration dictionary
    """
    if config_path is None:
        config_path = Path(__file__).parent.parent / "config.json"
    
    default_config = {
        "update_check_enabled": True,
        "update_check_on_startup": True,
        "auto_download": False,
        "version_url": None,
        "installer_url": None,
        "release_api_url": None
    }
    
    if config_path.exists():
        try:
            with open(config_path, 'r') as f:
                config = json.load(f)
                update_config = config.get('updates', {})
                return {**default_config, **update_config}
        except Exception as e:
            logger.warning(f"Failed to load update config: {e}")
    
    return default_config

