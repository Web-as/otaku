import shutil
from pathlib import Path
from typing import Dict
from loguru import logger

class FileOrganizer:
    def __init__(self, base_path: str):
        self.base_path = Path(base_path)
        self.base_path.mkdir(parents=True, exist_ok=True)
    
    def organize_file(
        self,
        file_path: str,
        anime_title: str,
        episode_number: int,
        dry_run: bool = False
    ) -> Dict:
        """Organize a single file"""
        source = Path(file_path)
        
        if not source.exists():
            raise FileNotFoundError(f"File not found: {file_path}")
        
        safe_title = self._sanitize_filename(anime_title)
        dest_dir = self.base_path / safe_title
        extension = source.suffix
        new_filename = f"{safe_title}_-_{episode_number:03d}{extension}"
        dest_path = dest_dir / new_filename
        
        if dry_run:
            return {
                'source': str(source),
                'destination': str(dest_path),
                'action': 'preview',
                'success': True
            }
        
        try:
            dest_dir.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, dest_path)
            logger.info(f"Organized: {source.name} -> {dest_path}")
            
            return {
                'source': str(source),
                'destination': str(dest_path),
                'action': 'copied',
                'success': True
            }
        except Exception as e:
            logger.error(f"Failed to organize {source}: {e}")
            return {
                'source': str(source),
                'destination': str(dest_path),
                'action': 'failed',
                'success': False,
                'error': str(e)
            }
    
    def _sanitize_filename(self, filename: str) -> str:
        """Remove invalid characters from filename"""
        invalid_chars = '<>:"/\\|?*'
        for char in invalid_chars:
            filename = filename.replace(char, '_')
        return ' '.join(filename.split())
    
    def preview_organization(self, file_path: str, anime_title: str, episode_number: int) -> Dict:
        """Preview what the organization would do"""
        return self.organize_file(file_path, anime_title, episode_number, dry_run=True)


