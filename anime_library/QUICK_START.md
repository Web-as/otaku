# Quick Start Guide - Anime Library

## Installation

1. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Install VLC Media Player** (required for video playback):
   - Download from: https://www.videolan.org/vlc/
   - Install to default location

## Launch

**Windows**:
```bash
launch.bat
```

**Or directly**:
```bash
python main.py
```

## First Use

1. **Organize Files**:
   - Click "📁 Organize Files" in sidebar
   - Select source directory
   - Click "Organize Files"
   - Files will be organized by type

2. **Browse Library** (coming soon):
   - Click "📚 Library" in sidebar
   - Browse your organized collection

3. **Play Videos** (coming soon):
   - Click on an episode in library
   - VLC will launch with the video

## Features Available Now

✅ File organization by type
✅ Metadata extraction
✅ Episode detection (code ready, UI coming)
✅ VLC player integration (code ready)

## Features Coming Soon

⏳ Library browsing GUI
⏳ Series grouping display
⏳ Watch history tracking
⏳ Resume positions
⏳ Thumbnail generation

## Troubleshooting

**"VLC not found" error**:
- Install VLC Media Player from https://www.videolan.org/vlc/
- Ensure it's installed to default location

**Import errors**:
- Run: `pip install -r requirements.txt`
- Ensure you're in the `anime_library` directory

**Database errors**:
- The database will be created automatically in `data/anime_library.db`
- Ensure the `data/` folder exists and is writable

