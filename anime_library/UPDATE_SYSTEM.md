# Auto-Update System Documentation

## Overview

The Anime Library app includes an auto-update system that can check for new versions and handle updates automatically.

## Current Implementation

**Method**: Simple GitHub Release Auto-Updater (Phase 1)

### Features

- ✅ Version checking on startup
- ✅ GitHub release API support
- ✅ Simple version.txt file support
- ✅ Update notification dialog
- ✅ Installer download
- ✅ Safe application exit before update

## Configuration

Update settings are stored in `config.json`:

```json
{
  "updates": {
    "update_check_enabled": true,
    "update_check_on_startup": true,
    "auto_download": false,
    "version_url": null,
    "installer_url": null,
    "release_api_url": null,
    "check_interval_days": 1
  }
}
```

### Setting Up GitHub Releases

1. **Create a GitHub repository** for your app
2. **Create releases** with version tags (e.g., `v1.0.0`, `v1.0.1`)
3. **Upload installer** to each release
4. **Configure URLs** in `config.json`:

```json
{
  "updates": {
    "release_api_url": "https://api.github.com/repos/yourusername/anime-library/releases/latest",
    "installer_url": "https://github.com/yourusername/anime-library/releases/latest/download/AnimeLibraryInstaller.exe"
  }
}
```

### Alternative: Simple Version File

If you don't use GitHub releases, you can host a simple `version.txt` file:

```json
{
  "updates": {
    "version_url": "https://yourserver.com/version.txt",
    "installer_url": "https://yourserver.com/AnimeLibraryInstaller.exe"
  }
}
```

## How It Works

1. **On Startup**: App checks for updates (if enabled)
2. **Version Comparison**: Compares current version with latest
3. **User Notification**: Shows dialog if update available
4. **Download**: Downloads installer to temp directory
5. **Installation**: Launches installer and exits app
6. **Restart**: Installer handles app restart

## Version Format

Versions use semantic versioning: `MAJOR.MINOR.PATCH`

Examples:
- `1.0.0`
- `1.0.1`
- `1.2.3`
- `2.0.0-beta`

## Usage

### Automatic (Default)

Updates are checked automatically on startup if enabled in config.

### Manual Check

You can add a "Check for Updates" menu item:

```python
from core.updater import check_for_updates_with_ui

def check_updates_manual():
    check_for_updates_with_ui(root)
```

### Disable Updates

Set in `config.json`:
```json
{
  "updates": {
    "update_check_enabled": false
  }
}
```

## File Structure

```
anime_library/
├── core/
│   └── updater.py          # Update checker module
├── version.txt             # Current version (for reference)
├── config.json             # Update configuration
└── main.py                 # Calls updater on startup
```

## Future Enhancements (Phase 2+)

- Background update downloads
- Progress bar for downloads
- Delta patches (only download changes)
- Rollback on failed updates
- Update scheduling (check weekly, etc.)
- Silent updates (optional)
- Update changelog display

## Security Considerations

- Verify installer checksums/hashes before installation
- Use HTTPS for all update URLs
- Sign installers with code signing certificate
- Validate version strings to prevent injection

## Testing

To test the update system:

1. **Set a fake version** in `core/updater.py`:
   ```python
   CURRENT_VERSION = "0.9.0"  # Lower than latest
   ```

2. **Configure test URLs** in `config.json`

3. **Run the app** - it should check and show update dialog

4. **Reset version** after testing

## Notes

- Update check happens in background thread to avoid blocking UI
- If update check fails, app continues normally
- Installer must handle replacing the running executable
- Consider using a separate updater executable for safer updates

