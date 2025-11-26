#!/usr/bin/env python3
"""
Core module - File organization and scanning.
"""

from .file_organizer import FileOrganizer
from .file_scanner import FileScanner
from .metadata_extractor import MetadataExtractor
from .database import Database
from .updater import UpdateChecker, check_for_updates_silent, check_for_updates_with_ui, CURRENT_VERSION

__all__ = [
    'FileOrganizer', 
    'FileScanner', 
    'MetadataExtractor', 
    'Database',
    'UpdateChecker',
    'check_for_updates_silent',
    'check_for_updates_with_ui',
    'CURRENT_VERSION'
]
