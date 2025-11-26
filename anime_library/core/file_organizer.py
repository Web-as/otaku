#!/usr/bin/env python3
"""
File Organizer - Scans a hard drive and organizes files by type into separate folders.
"""

import os
import shutil
import sys
import json
import time
import threading
import queue
from pathlib import Path
from collections import defaultdict
from typing import Dict, List, Set, Optional, Any, Callable
import argparse
from datetime import datetime

try:
    from .metadata_extractor import MetadataExtractor
    METADATA_AVAILABLE = True
except ImportError:
    METADATA_AVAILABLE = False
    MetadataExtractor = None


class FileOrganizer:
    """Organizes files by type into separate folders."""
    
    # Common system directories to exclude
    EXCLUDED_DIRS = {
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
    
    def __init__(self, source_path: str, destination_path: str = None, 
                 move_files: bool = False, dry_run: bool = False,
                 organize_by: str = 'type', metadata_depth: int = 0,
                 extract_metadata: bool = True, config_path: Optional[str] = None):
        """
        Initialize the File Organizer.
        
        Args:
            source_path: Path to scan (drive letter or directory)
            destination_path: Where to create organized folders (default: same as source)
            move_files: If True, move files; if False, copy files
            dry_run: If True, only show what would be done without making changes
            organize_by: How to organize files ('type', 'author', 'genre', 'date', 'album')
            metadata_depth: Depth of nested organization (0 = flat, 1 = one level, 2 = two levels)
            extract_metadata: Whether to extract metadata from files
            config_path: Path to configuration JSON file
        """
        self.source_path = Path(source_path)
        self.destination_path = Path(destination_path) if destination_path else self.source_path
        self.move_files = move_files
        self.dry_run = dry_run
        self.organize_by = organize_by
        self.metadata_depth = max(0, min(metadata_depth, 3))  # Limit depth to 0-3
        # Disable metadata extraction by default for speed (only enable if needed)
        needs_metadata = (organize_by in ['author', 'genre', 'date', 'album'] and metadata_depth > 0)
        self.extract_metadata = (extract_metadata and METADATA_AVAILABLE) if needs_metadata else False
        
        # Load configuration if provided
        self.config = self._load_config(config_path) if config_path else {}
        
        # Override settings from config if provided
        if self.config:
            org_config = self.config.get('organization', {})
            if 'default_organize_by' in org_config and organize_by == 'type':
                self.organize_by = org_config['default_organize_by']
            if 'default_metadata_depth' in org_config and metadata_depth == 0:
                self.metadata_depth = org_config['default_metadata_depth']
            if 'extract_metadata' in org_config:
                self.extract_metadata = org_config['extract_metadata'] and METADATA_AVAILABLE
        
        # Initialize metadata extractor if available
        if self.extract_metadata and METADATA_AVAILABLE:
            self.metadata_extractor = MetadataExtractor()
        else:
            self.metadata_extractor = None
        
        if not self.source_path.exists():
            raise ValueError(f"Source path does not exist: {source_path}")
        
        # Statistics
        self.stats = {
            'files_processed': 0,
            'files_by_type': defaultdict(int),
            'errors': [],
            'skipped': [],
            'metadata_extracted': 0,
            'metadata_errors': 0,
            'scan_time': 0.0,
            'organize_time': 0.0,
            'files_per_second_scan': 0.0,
            'files_per_second_organize': 0.0
        }
        
        # Store metadata for files
        self.file_metadata: Dict[Path, Dict[str, Any]] = {}
    
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
    
    def should_skip_path(self, path: Path) -> bool:
        """
        Correct skipping logic. NEVER skip the source directory itself.
        
        Priority:
            0. NEVER skip the source root directory
            1. Allow all content inside source (except excluded dirs)
            2. Skip excluded system dirs
            3. Skip hidden files/folders
            4. Skip files inside destination (if different paths)
            5. Skip everything outside source
        
        Args:
            path: Path to check
            
        Returns:
            True if path should be skipped
        """
        debug = getattr(self, "debug", False)
        
        # Resolve paths with error handling
        try:
            path_resolved = path.resolve(strict=False)
        except Exception as e:
            if debug:
                print(f"[DEBUG] Failed to resolve path {path}: {e}")
            return True  # broken or inaccessible path
        
        try:
            src = self.source_path.resolve(strict=False)
        except Exception as e:
            if debug:
                print(f"[DEBUG] Failed to resolve source path {self.source_path}: {e}")
            return True  # broken source path
        
        try:
            dst = self.destination_path.resolve(strict=False)
        except Exception:
            dst = src  # Fallback if destination can't be resolved
        
        # Normalize paths for Windows case-insensitive comparison
        # Convert to lowercase strings for comparison (Windows is case-insensitive)
        path_str = str(path_resolved).lower()
        src_str = str(src).lower()
        dst_str = str(dst).lower()
        
        # 0️⃣ DO NOT SKIP THE SOURCE ROOT
        if path_str == src_str:
            if debug:
                print(f"[DEBUG] Source root matched: {path_resolved}")
            return False
        
        # 1️⃣ Check whether path is inside source using multiple methods
        inside_source = False
        
        # Method 1: Try relative_to() (most reliable when it works)
        try:
            path_resolved.relative_to(src)
            inside_source = True
            if debug:
                print(f"[DEBUG] Path in source (relative_to): {path_resolved}")
        except ValueError:
            # Method 2: String comparison (handles case differences on Windows)
            # Check if path string starts with source string
            if path_str.startswith(src_str):
                # Ensure it's actually a subdirectory, not just a similar path
                # Check if next character is path separator or end of string
                remaining = path_str[len(src_str):]
                if not remaining or remaining.startswith(('\\', '/')):
                    inside_source = True
                    if debug:
                        print(f"[DEBUG] Path in source (string match): {path_resolved}")
        
        # Method 3: Check using path parts (fallback for edge cases)
        if not inside_source:
            try:
                # Get common path
                common_path = Path(os.path.commonpath([path_resolved, src]))
                # If common path equals source, then path is inside source
                if str(common_path).lower() == src_str:
                    inside_source = True
                    if debug:
                        print(f"[DEBUG] Path in source (commonpath): {path_resolved}")
            except (ValueError, OSError):
                pass  # Different drives or other issues
        
        # Debug: Log why paths are being skipped
        if debug and not inside_source:
            print(f"[DEBUG] Path NOT in source: {path_resolved}")
            print(f"  Source: {src}")
            print(f"  Destination: {dst}")
            print(f"  Path string: {path_str}")
            print(f"  Source string: {src_str}")
            print(f"  Starts with check: {path_str.startswith(src_str)}")
        
        # 2️⃣ If inside source → only skip excluded and hidden
        if inside_source:
            # Skip excluded system dirs
            for part in path_resolved.parts:
                if part in self.EXCLUDED_DIRS:
                    if debug:
                        print(f"[DEBUG] Skipping excluded dir part: {part} in {path_resolved}")
                    return True
            
            # Skip hidden files/folders (but allow .test_files_ready marker)
            if any(part.startswith('.') for part in path_resolved.parts):
                if path_resolved.name != '.test_files_ready':
                    if debug:
                        print(f"[DEBUG] Skipping hidden: {path_resolved}")
                    return True
            
            if debug:
                print(f"[DEBUG] NOT skipping source file: {path_resolved}")
            return False  # valid source content → DO NOT SKIP
        
        # 3️⃣ If not inside source → skip destination contents
        if src_str != dst_str:
            try:
                path_resolved.relative_to(dst)
                if debug:
                    print(f"[DEBUG] Skipping - in destination: {path_resolved}")
                return True  # skip destination tree
            except ValueError:
                # Also check with string comparison
                if path_str.startswith(dst_str):
                    remaining = path_str[len(dst_str):]
                    if not remaining or remaining.startswith(('\\', '/')):
                        if debug:
                            print(f"[DEBUG] Skipping - in destination (string match): {path_resolved}")
                        return True
        
        # 4️⃣ Everything else outside source → skip
        if debug:
            print(f"[DEBUG] Skipping - outside source: {path_resolved}")
        return True
    
    def _load_config(self, config_path: str) -> Dict[str, Any]:
        """Load configuration from JSON file."""
        try:
            config_file = Path(config_path)
            if config_file.exists():
                with open(config_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
        except (json.JSONDecodeError, IOError, OSError) as e:
            print(f"Warning: Could not load config file: {e}")
        return {}
    
    def get_organization_path(self, file_path: Path, category: str, 
                             metadata: Optional[Dict[str, Any]] = None) -> Path:
        """
        Determine the organization path for a file based on category and metadata.
        
        Args:
            file_path: Path to the file
            category: File category (e.g., 'Images', 'Audio')
            metadata: Optional metadata dictionary
            
        Returns:
            Path object representing the destination folder structure
        """
        base_path = self.destination_path / category
        
        if self.metadata_depth == 0 or not metadata or not self.extract_metadata:
            return base_path
        
        # Build nested path based on organize_by and metadata_depth
        path_parts = [category]
        
        if self.organize_by == 'author' and metadata.get('author'):
            author = self._sanitize_filename(str(metadata['author']))
            if author and author != 'Unknown':
                path_parts.append(author)
                if self.metadata_depth > 1 and metadata.get('album'):
                    album = self._sanitize_filename(str(metadata['album']))
                    if album and album != 'Unknown':
                        path_parts.append(album)
        
        elif self.organize_by == 'genre' and metadata.get('genre'):
            genre = self._sanitize_filename(str(metadata['genre']))
            if genre and genre != 'Unknown':
                path_parts.append(genre)
                if self.metadata_depth > 1 and metadata.get('author'):
                    author = self._sanitize_filename(str(metadata['author']))
                    if author and author != 'Unknown':
                        path_parts.append(author)
        
        elif self.organize_by == 'date' and metadata.get('date'):
            date_str = str(metadata['date'])
            # Try to extract year from date
            year = self._extract_year(date_str)
            if year:
                path_parts.append(year)
                if self.metadata_depth > 1 and metadata.get('author'):
                    author = self._sanitize_filename(str(metadata['author']))
                    if author and author != 'Unknown':
                        path_parts.append(author)
        
        elif self.organize_by == 'album' and metadata.get('album'):
            album = self._sanitize_filename(str(metadata['album']))
            if album and album != 'Unknown':
                path_parts.append(album)
                if self.metadata_depth > 1 and metadata.get('author'):
                    author = self._sanitize_filename(str(metadata['author']))
                    if author and author != 'Unknown':
                        path_parts.append(author)
        
        # Fallback to type-based organization if metadata is insufficient
        if len(path_parts) == 1:
            return base_path
        
        return self.destination_path / Path(*path_parts)
    
    def _sanitize_filename(self, filename: str) -> str:
        """Sanitize a string to be safe for use as a filename/folder name."""
        # Remove or replace invalid characters
        invalid_chars = '<>:"/\\|?*'
        sanitized = filename
        for char in invalid_chars:
            sanitized = sanitized.replace(char, '_')
        # Remove leading/trailing spaces and dots
        sanitized = sanitized.strip(' .')
        # Limit length
        if len(sanitized) > 100:
            sanitized = sanitized[:100]
        return sanitized or 'Unknown'
    
    def _extract_year(self, date_str: str) -> Optional[str]:
        """Extract year from various date string formats."""
        try:
            # Try ISO format
            if 'T' in date_str:
                date_str = date_str.split('T')[0]
            # Try to parse as date
            for fmt in ['%Y-%m-%d', '%Y/%m/%d', '%Y', '%Y-%m', '%d/%m/%Y', '%m/%d/%Y']:
                try:
                    dt = datetime.strptime(date_str[:10], fmt)
                    return str(dt.year)
                except ValueError:
                    continue
            # Try to find 4-digit year in string
            import re
            match = re.search(r'\b(19|20)\d{2}\b', date_str)
            if match:
                return match.group(0)
        except Exception:
            pass
        return None
    
    def scan_directory(self, progress_callback: Optional[Callable] = None) -> Dict[str, List[Path]]:
        """
        Scan the source directory and group files by type.
        
        Args:
            progress_callback: Optional callback function called for each file found.
                              Signature: callback(file_path, category, total_count, files_by_type)
        
        Returns:
            Dictionary mapping file types to lists of file paths
        """
        files_by_type = defaultdict(list)
        start_time = time.time()
        last_callback_time = start_time
        callback_interval = 0.1  # Call callback max once per 100ms for performance
        
        print(f"Scanning: {self.source_path}")
        print("This may take a while for large drives...\n")
        
        try:
            for root, dirs, files in os.walk(self.source_path):
                root_path = Path(root)
                
                # Skip excluded directories
                if self.should_skip_path(root_path):
                    dirs[:] = []  # Don't traverse into excluded dirs
                    continue
                
                for file in files:
                    file_path = root_path / file
                    
                    try:
                        # Skip if path should be excluded
                        if self.should_skip_path(file_path):
                            continue
                        
                        # Get file category (fast - just extension check)
                        category = self.get_file_category(file_path)
                        
                        # Skip metadata extraction for speed - only extract if explicitly needed
                        # Metadata extraction is VERY slow (opens each file)
                        metadata = None
                        if self.extract_metadata and self.metadata_extractor:
                            # Only extract metadata for files that need it (based on organize_by)
                            needs_metadata = (self.organize_by in ['author', 'genre', 'date', 'album'] 
                                            and self.metadata_depth > 0)
                            
                            if needs_metadata:
                                try:
                                    metadata = self.metadata_extractor.extract(file_path)
                                    self.file_metadata[file_path] = metadata
                                    self.stats['metadata_extracted'] += 1
                                except Exception as e:
                                    self.stats['metadata_errors'] += 1
                        
                        files_by_type[category].append(file_path)
                        self.stats['files_by_type'][category] += 1
                        self.stats['files_processed'] += 1
                        
                        # Throttle callback to avoid performance hit (max once per 100ms)
                        current_time = time.time()
                        if progress_callback and (current_time - last_callback_time) >= callback_interval:
                            try:
                                progress_callback(file_path, category, self.stats['files_processed'], 
                                                dict(files_by_type))
                                last_callback_time = current_time
                            except Exception:
                                pass  # Don't let callback errors break scanning
                        
                        # Progress indicator (only if no callback to avoid duplicate output)
                        if not progress_callback and self.stats['files_processed'] % 100 == 0:
                            elapsed = time.time() - start_time
                            rate = self.stats['files_processed'] / elapsed if elapsed > 0 else 0
                            print(f"Found {self.stats['files_processed']} files ({rate:.1f} files/sec)...", end='\r')
                        
                    except (PermissionError, OSError) as e:
                        self.stats['errors'].append(f"Error accessing {file_path}: {e}")
                        continue
                
        except KeyboardInterrupt:
            print("\n\nScan interrupted by user.")
            sys.exit(1)
        except Exception as e:
            self.stats['errors'].append(f"Error during scan: {e}")
        
        # Calculate performance metrics
        scan_time = time.time() - start_time
        self.stats['scan_time'] = scan_time
        self.stats['files_per_second_scan'] = self.stats['files_processed'] / scan_time if scan_time > 0 else 0
        
        print(f"\n\nScan complete! Found {self.stats['files_processed']} files in {scan_time:.2f} seconds.")
        print(f"Scan speed: {self.stats['files_per_second_scan']:.1f} files/second")
        if self.extract_metadata:
            print(f"Extracted metadata from {self.stats['metadata_extracted']} files.")
            if self.stats['metadata_errors'] > 0:
                print(f"Metadata extraction errors: {self.stats['metadata_errors']}")
        return files_by_type
    
    def scan_and_organize_pipeline(self, progress_callback: Optional[Callable] = None):
        """
        Pipeline approach: Scan files and organize them in parallel.
        As files are scanned, they're immediately queued for organization.
        This allows scanning and moving to happen simultaneously.
        
        Args:
            progress_callback: Optional callback function for progress updates
        """
        print(f"Pipeline mode: Scanning and organizing in parallel...")
        print(f"Scanning: {self.source_path}")
        print("This may take a while for large drives...\n")
        
        # Create destination folder if it doesn't exist
        if not self.dry_run:
            self.destination_path.mkdir(parents=True, exist_ok=True)
        
        # Queue for files ready to be organized
        file_queue = queue.Queue(maxsize=1000)  # Buffer up to 1000 files
        scan_complete = threading.Event()
        organize_complete = threading.Event()
        
        # Statistics
        files_organized = 0
        organize_start_time = None
        scan_start_time = time.time()
        
        # Pre-create category directories for speed
        category_dirs_created = set()
        
        def organize_worker():
            """Worker thread that processes files from the queue."""
            nonlocal files_organized, organize_start_time
            
            organize_start_time = time.time()
            category_counts = defaultdict(int)
            
            while True:
                try:
                    # Get file from queue with timeout
                    item = file_queue.get(timeout=1.0)
                    
                    if item is None:  # Sentinel value to stop
                        break
                    
                    file_path, category = item
                    
                    try:
                        # Get metadata for this file (only if needed)
                        metadata = None
                        if self.organize_by != 'type' or self.metadata_depth > 0:
                            metadata = self.file_metadata.get(file_path)
                        
                        # Determine organization path (simplified for type-only)
                        if self.organize_by == 'type' and self.metadata_depth == 0:
                            org_path = self.destination_path / category
                        else:
                            org_path = self.get_organization_path(file_path, category, metadata)
                        
                        # Skip if file is already in the destination
                        if file_path.parent == org_path:
                            self.stats['skipped'].append(f"{file_path} - already in destination")
                            file_queue.task_done()
                            continue
                        
                        # Create destination directory if needed (thread-safe)
                        if not self.dry_run:
                            org_path_key = str(org_path)
                            if org_path_key not in category_dirs_created:
                                org_path.mkdir(parents=True, exist_ok=True)
                                category_dirs_created.add(org_path_key)
                        
                        # Determine destination file path
                        dest_file = org_path / file_path.name
                        
                        # Handle name conflicts (only check if not dry run)
                        if not self.dry_run:
                            counter = 1
                            original_dest = dest_file
                            while dest_file.exists():
                                stem = original_dest.stem
                                suffix = original_dest.suffix
                                dest_file = org_path / f"{stem}_{counter}{suffix}"
                                counter += 1
                        
                        if self.dry_run:
                            action = "MOVE" if self.move_files else "COPY"
                            rel_path = org_path.relative_to(self.destination_path)
                            if files_organized < 10:  # Only show first 10 in dry run
                                print(f"  [{action}] {file_path.name} -> {rel_path}/{dest_file.name}")
                        else:
                            # Use faster move operation for same drive
                            if self.move_files:
                                shutil.move(str(file_path), str(dest_file))
                            else:
                                shutil.copy2(str(file_path), str(dest_file))
                            
                            files_organized += 1
                            category_counts[category] += 1
                            
                            # Progress indicator with speed
                            if files_organized % 50 == 0:
                                elapsed = time.time() - organize_start_time
                                rate = files_organized / elapsed if elapsed > 0 else 0
                                print(f"  Processed {files_organized} files ({rate:.1f} files/sec)...", end='\r')
                        
                    except (PermissionError, OSError, shutil.Error) as e:
                        error_msg = f"Error processing {file_path}: {e}"
                        self.stats['errors'].append(error_msg)
                        if not self.dry_run and files_organized < 10:
                            print(f"  ERROR: {error_msg}")
                    
                    file_queue.task_done()
                    
                except queue.Empty:
                    # Check if scan is complete
                    if scan_complete.is_set():
                        # Check if queue is empty
                        if file_queue.empty():
                            break
                    continue
        
        # Start organize worker thread
        organize_thread = threading.Thread(target=organize_worker, daemon=True)
        organize_thread.start()
        
        # Scan files and queue them for organization
        files_by_type = defaultdict(list)
        last_callback_time = scan_start_time
        callback_interval = 0.1
        
        # DEBUG: Check source root
        print(f"[CHECK ROOT] {self.should_skip_path(self.source_path)}")
        if self.should_skip_path(self.source_path):
            print("❌ CRITICAL: Source root is being skipped! Scanner will not work!")
            self.stats['errors'].append("CRITICAL: Source root is being skipped!")
        
        try:
            skip_count = 0
            for root, dirs, files in os.walk(self.source_path):
                root_path = Path(root)
                
                # Skip excluded directories
                if self.should_skip_path(root_path):
                    print(f"[SKIP ROOT] {root_path}")  # TEMP DEBUG
                    dirs[:] = []
                    continue
                
                for file in files:
                    file_path = root_path / file
                    
                    try:
                        # Skip if path should be excluded
                        if self.should_skip_path(file_path):
                            skip_count += 1
                            if skip_count <= 10:  # Show first 10 skipped files
                                print(f"[SKIP] {file_path}")  # TEMP DEBUG
                            continue
                        
                        # Get file category (fast - just extension check)
                        category = self.get_file_category(file_path)
                        
                        # Skip metadata extraction for speed
                        metadata = None
                        if self.extract_metadata and self.metadata_extractor:
                            needs_metadata = (self.organize_by in ['author', 'genre', 'date', 'album'] 
                                            and self.metadata_depth > 0)
                            if needs_metadata:
                                try:
                                    metadata = self.metadata_extractor.extract(file_path)
                                    self.file_metadata[file_path] = metadata
                                    self.stats['metadata_extracted'] += 1
                                except Exception:
                                    self.stats['metadata_errors'] += 1
                        
                        files_by_type[category].append(file_path)
                        self.stats['files_by_type'][category] += 1
                        self.stats['files_processed'] += 1
                        
                        # Queue file for organization (this will block if queue is full)
                        file_queue.put((file_path, category))
                        
                        # Throttle callback
                        current_time = time.time()
                        if progress_callback and (current_time - last_callback_time) >= callback_interval:
                            try:
                                progress_callback(file_path, category, self.stats['files_processed'], 
                                                dict(files_by_type))
                                last_callback_time = current_time
                            except Exception:
                                pass
                        
                        # Progress indicator
                        if not progress_callback and self.stats['files_processed'] % 100 == 0:
                            elapsed = time.time() - scan_start_time
                            rate = self.stats['files_processed'] / elapsed if elapsed > 0 else 0
                            print(f"Scanned {self.stats['files_processed']} files, queued for organization ({rate:.1f} files/sec)...", end='\r')
                        
                    except (PermissionError, OSError) as e:
                        self.stats['errors'].append(f"Error accessing {file_path}: {e}")
                        continue
        
        except KeyboardInterrupt:
            print("\n\nOperation interrupted by user.")
            scan_complete.set()
            file_queue.put(None)  # Signal worker to stop
            organize_thread.join(timeout=5)
            sys.exit(1)
        except Exception as e:
            self.stats['errors'].append(f"Error during scan: {e}")
        
        # Signal scan is complete
        scan_complete.set()
        scan_time = time.time() - scan_start_time
        self.stats['scan_time'] = scan_time
        self.stats['files_per_second_scan'] = self.stats['files_processed'] / scan_time if scan_time > 0 else 0
        
        print(f"\nScan complete! Found {self.stats['files_processed']} files in {scan_time:.2f} seconds.")
        print(f"Scan speed: {self.stats['files_per_second_scan']:.1f} files/second")
        print("Waiting for organization to complete...")
        
        # Signal worker to stop and wait for queue to empty
        file_queue.put(None)  # Sentinel value
        organize_thread.join()  # Wait for worker to finish
        
        # Calculate performance metrics
        if organize_start_time:
            organize_time = time.time() - organize_start_time
            self.stats['organize_time'] = organize_time
            self.stats['files_per_second_organize'] = files_organized / organize_time if organize_time > 0 else 0
            
            print(f"\nOrganization complete! Processed {files_organized} files in {organize_time:.2f} seconds.")
            print(f"Organization speed: {self.stats['files_per_second_organize']:.1f} files/second")
            
            # Calculate total time (overlap means total < scan + organize)
            total_time = time.time() - scan_start_time
            print(f"Total time: {total_time:.2f} seconds (pipeline efficiency: {((scan_time + organize_time) / total_time * 100) if total_time > 0 else 0:.1f}%)")
        
        return files_by_type
    
    def organize_files(self, files_by_type: Dict[str, List[Path]]):
        """
        Organize files into folders by type (traditional sequential method).
        
        Args:
            files_by_type: Dictionary mapping file types to lists of file paths
        """
        start_time = time.time()
        files_organized = 0
        
        if self.dry_run:
            print("\n=== DRY RUN MODE - No files will be moved/copied ===\n")
        
        # Create destination folder if it doesn't exist
        if not self.dry_run:
            self.destination_path.mkdir(parents=True, exist_ok=True)
        
        # Process each category (organized by file type)
        categories = sorted(files_by_type.items(), key=lambda x: len(x[1]), reverse=True)
        
        for category, files in categories:
            if not files:
                continue
            
            print(f"\nProcessing {category}: {len(files)} files")
            category_start = time.time()
            
            # Pre-create all directories for this category to speed up operations
            if not self.dry_run:
                # For simple type-based organization, create category folder once
                if self.organize_by == 'type' and self.metadata_depth == 0:
                    category_path = self.destination_path / category
                    category_path.mkdir(parents=True, exist_ok=True)
            
            # Process each file
            for file_path in files:
                try:
                    # Get metadata for this file (only if needed)
                    metadata = None
                    if self.organize_by != 'type' or self.metadata_depth > 0:
                        metadata = self.file_metadata.get(file_path)
                    
                    # Determine organization path (simplified for type-only)
                    if self.organize_by == 'type' and self.metadata_depth == 0:
                        org_path = self.destination_path / category
                    else:
                        org_path = self.get_organization_path(file_path, category, metadata)
                    
                    # Skip if file is already in the destination
                    if file_path.parent == org_path:
                        self.stats['skipped'].append(f"{file_path} - already in destination")
                        continue
                    
                    # Create destination directory if needed
                    if not self.dry_run:
                        org_path.mkdir(parents=True, exist_ok=True)
                    
                    # Determine destination file path
                    dest_file = org_path / file_path.name
                    
                    # Handle name conflicts (only check if not dry run)
                    if not self.dry_run:
                        counter = 1
                        original_dest = dest_file
                        while dest_file.exists():
                            stem = original_dest.stem
                            suffix = original_dest.suffix
                            dest_file = org_path / f"{stem}_{counter}{suffix}"
                            counter += 1
                    
                    if self.dry_run:
                        action = "MOVE" if self.move_files else "COPY"
                        rel_path = org_path.relative_to(self.destination_path)
                        if files_organized < 10:  # Only show first 10 in dry run
                            print(f"  [{action}] {file_path.name} -> {rel_path}/{dest_file.name}")
                    else:
                        # Use faster move operation for same drive
                        if self.move_files:
                            # shutil.move is optimized for same-drive moves
                            shutil.move(str(file_path), str(dest_file))
                        else:
                            # Use copy2 to preserve metadata
                            shutil.copy2(str(file_path), str(dest_file))
                        
                        files_organized += 1
                        
                        # Progress indicator with speed
                        if files_organized % 50 == 0:
                            elapsed = time.time() - start_time
                            rate = files_organized / elapsed if elapsed > 0 else 0
                            print(f"  Processed {files_organized} files ({rate:.1f} files/sec)...", end='\r')
                    
                except (PermissionError, OSError, shutil.Error) as e:
                    error_msg = f"Error processing {file_path}: {e}"
                    self.stats['errors'].append(error_msg)
                    if not self.dry_run:
                        print(f"  ERROR: {error_msg}")
                    continue
            
            category_time = time.time() - category_start
            if not self.dry_run:
                print(f"  {category} complete: {len(files)} files in {category_time:.2f}s")
        
        # Calculate performance metrics
        organize_time = time.time() - start_time
        self.stats['organize_time'] = organize_time
        self.stats['files_per_second_organize'] = files_organized / organize_time if organize_time > 0 else 0
        
        print(f"\nOrganization complete! Processed {files_organized} files in {organize_time:.2f} seconds.")
        print(f"Organization speed: {self.stats['files_per_second_organize']:.1f} files/second")
    
    def print_summary(self):
        """Print a summary of the organization process."""
        print("\n" + "="*60)
        print("ORGANIZATION SUMMARY")
        print("="*60)
        print(f"Total files processed: {self.stats['files_processed']}")
        
        # Performance metrics
        if self.stats['scan_time'] > 0:
            print(f"\nPERFORMANCE METRICS:")
            print(f"  Scan time: {self.stats['scan_time']:.2f} seconds")
            print(f"  Scan speed: {self.stats['files_per_second_scan']:.1f} files/second")
        
        if self.stats['organize_time'] > 0:
            print(f"  Organization time: {self.stats['organize_time']:.2f} seconds")
            print(f"  Organization speed: {self.stats['files_per_second_organize']:.1f} files/second")
        
        if self.extract_metadata:
            print(f"\nMetadata extracted: {self.stats['metadata_extracted']}")
            if self.stats['metadata_errors'] > 0:
                print(f"Metadata errors: {self.stats['metadata_errors']}")
        
        print(f"\nFiles by category:")
        for category, count in sorted(self.stats['files_by_type'].items()):
            print(f"  {category}: {count} files")
        
        if self.stats['skipped']:
            print(f"\nSkipped files: {len(self.stats['skipped'])}")
            if len(self.stats['skipped']) <= 10:
                for skip in self.stats['skipped']:
                    print(f"  - {skip}")
        
        if self.stats['errors']:
            print(f"\nErrors encountered: {len(self.stats['errors'])}")
            for error in self.stats['errors'][:10]:  # Show first 10 errors
                print(f"  - {error}")
            if len(self.stats['errors']) > 10:
                print(f"  ... and {len(self.stats['errors']) - 10} more errors")
        
        print("="*60)
    
    def generate_metadata_report(self, output_path: Optional[str] = None):
        """
        Generate a metadata report in JSON format.
        
        Args:
            output_path: Optional path to save the report (default: metadata_report.json in destination)
        """
        if not self.file_metadata:
            print("No metadata to report.")
            return
        
        report = {
            'scan_date': datetime.now().isoformat(),
            'source_path': str(self.source_path),
            'destination_path': str(self.destination_path),
            'organize_by': self.organize_by,
            'metadata_depth': self.metadata_depth,
            'total_files': len(self.file_metadata),
            'files': []
        }
        
        for file_path, metadata in self.file_metadata.items():
            file_report = {
                'file_path': str(file_path),
                'file_name': file_path.name,
                'metadata': metadata
            }
            report['files'].append(file_report)
        
        # Determine output path
        if output_path:
            report_file = Path(output_path)
        else:
            report_file = self.destination_path / 'metadata_report.json'
        
        try:
            with open(report_file, 'w', encoding='utf-8') as f:
                json.dump(report, f, indent=2, ensure_ascii=False)
            print(f"\nMetadata report saved to: {report_file}")
        except Exception as e:
            print(f"Error saving metadata report: {e}")


def main():
    """Main entry point for the file organizer."""
    parser = argparse.ArgumentParser(
        description='Organize files by type into separate folders',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Scan C: drive and organize files (copy mode, dry run)
  python file_organizer.py C:\\ --dry-run
  
  # Scan a specific folder and move files
  python file_organizer.py "D:\\My Files" --move
  
  # Scan and organize to a different destination
  python file_organizer.py C:\\Users\\Documents --dest "D:\\Organized" --copy
        """
    )
    
    parser.add_argument('source', help='Source drive or directory to scan (e.g., C:\\ or D:\\MyFolder)')
    parser.add_argument('--dest', '--destination', dest='destination',
                       help='Destination folder for organized files (default: same as source)')
    parser.add_argument('--move', action='store_true',
                       help='Move files instead of copying (default: copy)')
    parser.add_argument('--copy', action='store_true',
                       help='Copy files (default behavior)')
    parser.add_argument('--dry-run', action='store_true',
                       help='Show what would be done without making changes')
    parser.add_argument('--organize-by', choices=['type', 'author', 'genre', 'date', 'album'],
                       default='type',
                       help='How to organize files (default: type)')
    parser.add_argument('--metadata-depth', type=int, default=0,
                       help='Depth of nested organization based on metadata (0-3, default: 0)')
    parser.add_argument('--no-metadata', action='store_true',
                       help='Disable metadata extraction (faster but less organized)')
    parser.add_argument('--metadata-report', action='store_true',
                       help='Generate a metadata report after scanning')
    parser.add_argument('--config', dest='config_path',
                       help='Path to configuration JSON file')
    
    args = parser.parse_args()
    
    # Determine move/copy mode
    move_files = args.move and not args.copy
    
    try:
        # Create organizer
        organizer = FileOrganizer(
            source_path=args.source,
            destination_path=args.destination,
            move_files=move_files,
            dry_run=args.dry_run,
            organize_by=args.organize_by,
            metadata_depth=args.metadata_depth,
            extract_metadata=not args.no_metadata,
            config_path=args.config_path
        )
        
        # Use pipeline mode for better performance (scan and organize in parallel)
        # This is faster because files start moving while scanning continues
        files_by_type = organizer.scan_and_organize_pipeline()
        
        # Show what was organized
        print("\n" + "="*60)
        print("FILES ORGANIZED BY CATEGORY")
        print("="*60)
        for category, files in sorted(files_by_type.items()):
            print(f"{category}: {len(files)} files")
        print("="*60)
        
        # Generate metadata report if requested
        if args.metadata_report and organizer.extract_metadata:
            organizer.generate_metadata_report()
        
        # Print summary
        organizer.print_summary()
        
    except KeyboardInterrupt:
        print("\n\nOperation cancelled by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\nError: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()

