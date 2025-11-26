# Anime Library

Unified Windows anime viewing library program that combines file organization, media library management, and video playback.

## Features

- **File Organization**: Organize files by type with metadata extraction
- **Anime Detection**: Smart episode detection and series grouping
- **Video Playback**: VLC-based video player with episode navigation
- **Library Management**: Browse and manage your anime collection
- **Watch History**: Track viewing progress and resume positions

## Installation

### Prerequisites

- Python 3.8 or higher
- VLC Media Player (for video playback)
  - Download from: https://www.videolan.org/vlc/

### Setup

1. **Navigate to the project directory**:
```bash
cd anime_library
```

2. **Create a virtual environment (recommended)**:
```bash
python -m venv .venv
```

3. **Activate the virtual environment**:
   - **Windows**:
     ```bash
     .venv\Scripts\activate
     ```
   - **Linux/Mac**:
     ```bash
     source .venv/bin/activate
     ```

4. **Install Python dependencies**:
```bash
pip install -r requirements.txt
```

5. **Install VLC Media Player** (required for video playback):
   - Download from: https://www.videolan.org/vlc/
   - Install to default location (Windows: `C:\Program Files\VideoLAN\VLC\`)
   - The application will automatically detect VLC if installed to default location

6. **Verify installation**:
```bash
python -c "import vlc; print('VLC Python bindings: OK')"
python -c "import cv2; print('OpenCV: OK')"
```

**Note**: If VLC is not found, the application will still work for file organization, but video playback will be unavailable.

## Usage

### Launch Application

**Option 1: Using launch script (Windows)**:
```bash
launch.bat
```

**Option 2: Direct Python execution**:
```bash
python main.py
```

**Option 3: With virtual environment**:
```bash
# Activate virtual environment first
.venv\Scripts\activate  # Windows
# or
source .venv/bin/activate  # Linux/Mac

# Then run
python main.py
```

### Organize Files

1. Click "📁 Organize Files" in the sidebar
2. Select source directory
3. (Optional) Select destination directory
4. Click "Organize Files"

### Play Videos

1. Click "📚 Library" in the sidebar
2. Browse your collection
3. Click on an episode to play

## Project Structure

```
anime_library/
├── main.py                 # Entry point
├── main_window.py          # Main GUI window
├── core/                   # Core file organization
│   ├── file_organizer.py
│   ├── file_scanner.py
│   ├── metadata_extractor.py
│   └── database.py
├── anime/                  # Anime-specific features
│   ├── episode_detector.py
│   ├── filename_parser.py
│   └── series_manager.py
├── player/                 # Video playback
│   ├── video_player.py
│   └── player_manager.py
└── library/                # Library management
    ├── watch_history.py
    └── thumbnail_generator.py
```

## Dependencies

- **Pillow**: Image metadata extraction
- **mutagen**: Audio/video metadata
- **python-vlc**: VLC Python bindings (requires VLC installed)
- **opencv-python**: Thumbnail generation
- Plus standard library modules

## Notes

- **VLC Media Player**: Must be installed separately for video playback functionality
- **Database**: Automatically created in `data/anime_library.db` on first run
- **Thumbnails**: Cached in `~/.anime_library/thumbnails/` (user home directory)
- **Logs**: Application logs are saved to `anime_library.log` in the project directory

## Troubleshooting

### "VLC not found" error
- Ensure VLC Media Player is installed from https://www.videolan.org/vlc/
- Install to default location: `C:\Program Files\VideoLAN\VLC\` (Windows)
- Restart the application after installing VLC
- File organization will still work without VLC, but video playback requires it

### Import errors
- Ensure all dependencies are installed: `pip install -r requirements.txt`
- Verify you're in the `anime_library` directory when running
- Try using a virtual environment to avoid dependency conflicts
- Check that Python version is 3.8 or higher: `python --version`

### Database errors
- The `data/` folder will be created automatically on first run
- Ensure you have write permissions in the project directory
- If issues persist, delete `data/anime_library.db` and restart (will recreate automatically)

### GUI not appearing
- Check if the window opened behind other windows
- Look for error messages in the console/terminal
- Check `anime_library.log` for detailed error information
- Try running from command line to see error output: `python main.py`

### File organization not working
- Ensure source directory exists and is accessible
- Check that you have read permissions for source directory
- Verify destination directory has write permissions
- Check `anime_library.log` for specific error messages

## Development

This project merges code from:
- `file organizer/autosorter/` - File organization foundation
- `surf wave/aniflow/finalized/04-video-worker/` - Episode detection logic
- `surf wave/MergedApp/` - Filename parser patterns

