#!/usr/bin/env python3
"""
File Scanner - Scans directories and collects files.
"""

import os
from pathlib import Path
from typing import Dict, List, Set, Optional
from collections import defaultdict


class FileScanner:
    """Scans directories and collects files by category."""
    
    # Common system directories to exclude
    DEFAULT_EXCLUDED_DIRS = {
        'Windows', 'Program Files', 'Program Files (x86)', 'ProgramData',
        'System Volume Information', '$Recycle.Bin', 'Recovery',
        'AppData', 'PerfLogs', 'Boot', 'Config.Msi'
    }
    
    # Common file extensions and their categories
    FILE_CATEGORIES = {
        'Images': {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.tif', 
                   '.webp', '.svg', '.ico', '.heic', '.raw', '.cr2', '.nef'},
        'Videos': {'.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv', '.webm',
                   '.m4v', '.mpg', '.mpeg', '.3gp', '.vob', '.ts', '.m2ts'},
        'Audio': {'.mp3', '.wav', '.flac', '.aac', '.ogg', '.wma', '.m4a',
                  '.opus', '.amr', '.aiff', '.au'},
        'Documents': {'.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
                      '.txt', '.rtf', '.odt', '.ods', '.odp', '.csv'},
        'Archives': {'.zip', '.rar', '.7z', '.tar', '.gz', '.bz2', '.xz',
                     '.iso', '.dmg', '.cab', '.deb', '.rpm'},
        'Code': {'.py', '.js', '.html', '.css', '.java', '.cpp', '.c', '.h',
                 '.cs', '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.ts',
                 '.tsx', '.jsx', '.vue', '.dart', '.sh', '.bat', '.ps1'},
        'Executables': {'.exe', '.msi', '.dmg', '.pkg', '.deb', '.rpm', '.app',
                        '.bin', '.run', '.sh'},
        'Fonts': {'.ttf', '.otf', '.woff', '.woff2', '.eot'},
        'Spreadsheets': {'.xls', '.xlsx', '.ods', '.csv', '.tsv'},
        'Presentations': {'.ppt', '.pptx', '.odp', '.key'},
        'Data': {'.json', '.xml', '.yaml', '.yml', '.toml', '.ini', '.cfg',
                 '.conf', '.sql', '.db', '.sqlite', '.sqlite3'},
        'Web': {'.html', '.htm', '.css', '.js', '.jsx', '.tsx', '.vue',
                '.sass', '.scss', '.less', '.php', '.asp', '.aspx'},
    }
    
    def __init__(self, excluded_dirs: Optional[Set[str]] = None):
        """
        Initialize the file scanner.
        
        Args:
            excluded_dirs: Set of directory names to exclude (default: DEFAULT_EXCLUDED_DIRS)
        """
        self.excluded_dirs = excluded_dirs or self.DEFAULT_EXCLUDED_DIRS.copy()
        self.stats = {
            'files_processed': 0,
            'files_by_type': defaultdict(int),
            'errors': [],
            'skipped': []
        }
    
    def get_file_category(self, file_path: Path) -> str:
        """
        Determine the category for a file based on its extension.
        
        Args:
            file_path: Path to the file
            
        Returns:
            Category name or 'Other' if unknown
        """
        ext = file_path.suffix.lower()
        
        for category, extensions in self.FILE_CATEGORIES.items():
            if ext in extensions:
                return category
        
        return 'Other'
    
    def should_skip_path(self, path: Path, destination_path: Optional[Path] = None) -> bool:
        """
        Check if a path should be skipped during scanning.
        
        Args:
            path: Path to check
            destination_path: Optional destination path to exclude
            
        Returns:
            True if path should be skipped
        """
        # Skip if any part of the path is in excluded directories
        for part in path.parts:
            if part in self.excluded_dirs:
                return True
        
        # Skip hidden files/folders (starting with .)
        if any(part.startswith('.') for part in path.parts):
            return True
        
        # Skip if it's the destination folder itself
        if destination_path:
            try:
                if path.resolve() == destination_path.resolve():
                    return True
            except:
                pass
        
        return False
    
    def scan_directory(self, source_path: Path, destination_path: Optional[Path] = None,
                      progress_callback: Optional[callable] = None) -> Dict[str, List[Path]]:
        """
        Scan the source directory and group files by type.
        
        Args:
            source_path: Path to scan
            destination_path: Optional destination path to exclude from scan
            progress_callback: Optional callback function(processed_count, current_file)
            
        Returns:
            Dictionary mapping file types to lists of file paths
        """
        files_by_type = defaultdict(list)
        
        if not source_path.exists():
            raise ValueError(f"Source path does not exist: {source_path}")
        
        try:
            for root, dirs, files in os.walk(source_path):
                root_path = Path(root)
                
                # Skip excluded directories
                if self.should_skip_path(root_path, destination_path):
                    dirs[:] = []  # Don't traverse into excluded dirs
                    continue
                
                for file in files:
                    file_path = root_path / file
                    
                    try:
                        # Skip if path should be excluded
                        if self.should_skip_path(file_path, destination_path):
                            continue
                        
                        # Get file category
                        category = self.get_file_category(file_path)
                        files_by_type[category].append(file_path)
                        
                        self.stats['files_by_type'][category] += 1
                        self.stats['files_processed'] += 1
                        
                        # Progress callback
                        if progress_callback:
                            progress_callback(self.stats['files_processed'], file_path)
                        
                        # Progress indicator
                        if self.stats['files_processed'] % 100 == 0:
                            if not progress_callback:
                                print(f"Found {self.stats['files_processed']} files...", end='\r')
                        
                    except (PermissionError, OSError) as e:
                        error_msg = f"Error accessing {file_path}: {e}"
                        self.stats['errors'].append(error_msg)
                        continue
                
        except KeyboardInterrupt:
            raise
        except Exception as e:
            self.stats['errors'].append(f"Error during scan: {e}")
        
        return files_by_type
    
    def get_stats(self) -> Dict:
        """Get scanning statistics."""
        return self.stats.copy()

