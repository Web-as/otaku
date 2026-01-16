import os
from pathlib import Path
from typing import List, Dict
import hashlib
from loguru import logger

class FileScanner:
    def __init__(self, directories: List[str]):
        self.directories = [Path(d) for d in directories]
        self.results = {
            'video': [],
            'subtitle': [],
            'other': []
        }
        
        self.video_extensions = {'.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm'}
        self.subtitle_extensions = {'.srt', '.ass', '.ssa', '.vtt'}
    
    def scan(self) -> Dict[str, List[Dict]]:
        """Scan directories for anime files"""
        logger.info(f"Starting scan of {len(self.directories)} directories")
        
        for directory in self.directories:
            if not directory.exists():
                logger.warning(f"Directory not found: {directory}")
                continue
            
            self._scan_directory(directory)
        
        logger.info(f"Scan complete. Found {len(self.results['video'])} video files")
        return self.results
    
    def _scan_directory(self, directory: Path):
        """Recursively scan directory"""
        try:
            for item in directory.rglob('*'):
                if item.is_file():
                    self._process_file(item)
        except PermissionError:
            logger.warning(f"Permission denied: {directory}")
    
    def _process_file(self, file_path: Path):
        """Process individual file"""
        extension = file_path.suffix.lower()
        
        if extension in self.video_extensions:
            file_info = self._extract_file_info(file_path)
            self.results['video'].append(file_info)
        elif extension in self.subtitle_extensions:
            file_info = self._extract_file_info(file_path)
            self.results['subtitle'].append(file_info)
    
    def _extract_file_info(self, file_path: Path) -> Dict:
        """Extract basic file information"""
        stats = file_path.stat()
        
        return {
            'path': str(file_path),
            'name': file_path.name,
            'size': stats.st_size,
            'extension': file_path.suffix.lower(),
            'hash': self._get_file_hash(file_path),
        }
    
    def _get_file_hash(self, file_path: Path) -> str:
        """Get file hash for duplicate detection"""
        hash_md5 = hashlib.md5()
        try:
            with open(file_path, "rb") as f:
                chunk = f.read(65536)
                hash_md5.update(chunk)
            return hash_md5.hexdigest()
        except Exception as e:
            logger.error(f"Error hashing {file_path}: {e}")
            return ""


