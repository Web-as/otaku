# Anime Library - Complete Implementation Plan

## Current Status Summary

### ✅ Completed
- Core file organization (from autosorter)
- Anime detection modules (episode_detector, filename_parser, series_manager)
- VLC player wrapper (video_player.py, player_manager.py)
- Watch history tracking (watch_history.py)
- Thumbnail generation (thumbnail_generator.py)
- Main window with organizer interface
- Gamification Phase 1 (XP, leveling, achievements, profile)
- Auto-updater system
- Tokyo Night anime-themed UI

### ⏳ Pending Implementation
- Library browsing GUI (grid/list views)
- Video player integration with library
- Gamification Phase 2 (quests UI, gacha, chibi, themes)
- Advanced features (subtitles, quality, content matching)
- Polish and optimization

---

## Phase 1: Library Browsing GUI (Priority: High)

### 1.1 Library GUI Module
**File**: `library/library_gui.py` (new)

**Features**:
- Grid view: Netflix-style poster grid with series thumbnails
- List view: Detailed list with metadata columns (name, episodes, progress, quality)
- View switcher: Toggle between grid/list views
- Series detail view: Show all episodes in a series when clicked
- Episode cards: Display episode thumbnails, titles, watch status
- Play buttons: "Play" button on each episode/series card

**Integration Points**:
- Connect to `series_manager.py` for series data
- Use `thumbnail_generator.py` for thumbnails
- Use `watch_history.py` for progress indicators
- Connect to `player_manager.py` for playback

**Tasks**:
1. Create `library/library_gui.py` with grid/list view classes
2. Implement series grid display with thumbnails
3. Implement episode list display
4. Add search and filter functionality
5. Add sorting options (name, date, progress, quality)
6. Integrate into `main_window.py` library tab
7. Add "Play" button handlers that launch video player

---

## Phase 2: Video Player Integration (Priority: High)

### 2.1 Player-Library Integration
**Files**: `main_window.py`, `player/player_manager.py` (enhance)

**Features**:
- Click episode in library → Launch VLC player
- Episode navigation: Next/Previous episode buttons in player
- Auto-play next: Automatically play next episode when current ends
- Resume from last position: Auto-resume when playing episode
- Play queue: Add multiple episodes to queue
- Playlist support: Play entire series or custom playlist

**Tasks**:
1. Connect library GUI play buttons to `player_manager.play_video()`
2. Enhance `player_manager.py` with episode navigation
3. Add next/previous episode detection from current file
4. Implement auto-resume from watch history
5. Add play queue management
6. Create playlist creation UI
7. Add "Continue Watching" smart folder integration

---

## Phase 3: Gamification Phase 2 - Quest System UI (Priority: Medium)

### 3.1 Quest Display Interface
**File**: `ui/quest_panel.py` (new)

**Features**:
- Daily quests panel: Show active daily quests with progress bars
- Weekly quests panel: Show active weekly quests with progress
- Quest completion notifications: Popup when quest completed
- Quest rewards display: Show XP and coin rewards
- Quest refresh: Daily/weekly quest reset handling

**Integration**:
- Use `gamification/database.py` for quest data
- Connect to `gamification_manager.py` for progress updates
- Display in profile tab or separate quests tab

**Tasks**:
1. Create `ui/quest_panel.py` with quest display widgets
2. Add progress bars for each quest
3. Implement quest completion detection and rewards
4. Add quest panel to main window (new tab or in profile)
5. Style with anime theme (Tokyo Night colors)
6. Add quest completion animations/notifications

---

## Phase 4: Gamification Phase 2 - Gacha System (Priority: Medium)

### 4.1 Gacha Pull Interface
**File**: `ui/gacha_panel.py` (new)

**Features**:
- Gacha pull screen: Animated pull interface
- Item reveal: Show pulled item with rarity animation
- Inventory display: Show all owned gacha items
- Equip system: Equip wallpapers, avatars, themes, companions
- Item preview: Preview items before equipping
- Rarity indicators: Visual rarity display (common/rare/epic/legendary)

**Integration**:
- Use `gamification/database.py` gacha tables
- Connect to `gamification_manager.py` for coin spending
- Update profile to show equipped items

**Tasks**:
1. Create `ui/gacha_panel.py` with pull interface
2. Implement pull animation (spinning/item reveal)
3. Create inventory grid view
4. Add equip/unequip functionality
5. Update profile to display equipped items
6. Add gacha button to main window sidebar
7. Implement coin spending validation

---

## Phase 5: Gamification Phase 2 - Chibi Companion (Priority: Medium)

### 5.1 Chibi Companion System
**File**: `ui/chibi_companion.py` (new)

**Features**:
- Animated chibi sprite: Display chibi companion in corner of window
- Reaction system: Chibi reacts to user actions
  - Happy: When episode completed, level up
  - Sleepy: When inactive for X minutes
  - Excited: When achievement unlocked
  - Angry: When series dropped (if implemented)
- Companion selection: Choose from unlocked chibi companions
- Companion animations: Idle, happy, sleep, excited states

**Integration**:
- Connect to gamification events (level up, achievement)
- Use gacha system for companion unlocks
- Display in main window corner or profile

**Tasks**:
1. Create `ui/chibi_companion.py` with sprite display
2. Implement reaction system with event listeners
3. Add companion selection UI
4. Create simple animations (or use static images with state changes)
5. Integrate into main window (corner widget)
6. Add companion to profile display

---

## Phase 6: Gamification Phase 2 - UI Theme Switching (Priority: Medium)

### 6.1 Theme System Enhancement
**Files**: `ui/themes.py` (enhance), `ui/theme_manager.py` (new)

**Features**:
- Gaming HUD Theme: Futuristic overlays, XP bars on cards, neon accents
- Otaku Room Theme: Manga-style shelves, poster backgrounds, cozy feel
- Kawaii Theme: Soft pastels, rounded corners, cute icons
- Theme switcher: Dropdown or button to switch themes
- Theme preview: Preview theme before applying
- Custom theme colors: Allow user color customization (future)

**Integration**:
- Extend `TokyoNightTheme` class with new themes
- Apply theme to all UI components
- Save theme preference to database

**Tasks**:
1. Create `GamingHUDTheme` class in `ui/themes.py`
2. Create `OtakuRoomTheme` class
3. Create `KawaiiTheme` class
4. Create `ui/theme_manager.py` for theme switching
5. Add theme switcher to settings
6. Apply theme changes dynamically
7. Save theme preference to database

---

## Phase 7: Advanced Features - Subtitle Management (Priority: Low)

### 7.1 Subtitle System
**File**: `player/subtitle_manager.py` (new)

**Features**:
- Auto-detect subtitles: Find .srt, .ass, .vtt files near video
- Subtitle matching: Match subtitles to video files by name
- Language detection: Identify subtitle languages
- Subtitle display: Show subtitles during VLC playback
- Subtitle selection: Choose subtitle track in player
- Subtitle styling: Customize subtitle appearance (size, color, position)

**Tasks**:
1. Create `player/subtitle_manager.py` with detection logic
2. Integrate subtitle detection into `player_manager.py`
3. Add subtitle file scanning to library scan
4. Display subtitle info in library (if available)
5. Add subtitle selection to player controls (if VLC supports)

---

## Phase 8: Advanced Features - Quality Management (Priority: Low)

### 8.1 Quality Analysis and Display
**File**: `anime/quality_manager.py` (new)

**Features**:
- Quality detection: Analyze video resolution, bitrate, codec
- Quality badges: Display quality indicators in library (480p, 720p, 1080p, 4K)
- Quality filtering: Filter library by quality
- Duplicate detection: Find multiple quality versions of same episode
- Quality comparison: Compare quality when duplicates found
- Quality-based organization: Organize by quality tiers

**Tasks**:
1. Create `anime/quality_manager.py` with quality analysis
2. Enhance `metadata_extractor.py` with video quality detection
3. Add quality badges to library display
4. Add quality filter to library GUI
5. Implement duplicate quality detection
6. Add quality info to database schema

---

## Phase 9: Advanced Features - Content Matching (Priority: Low)

### 9.1 Online Database Matching
**File**: `anime/content_matcher.py` (new)

**Features**:
- AniDB matching: Match series to AniDB database (optional, opt-in)
- MyAnimeList matching: Match to MAL for metadata
- Metadata enrichment: Fetch descriptions, genres, studios, ratings
- Poster art: Download series posters and cover art
- Privacy-first: User-enabled, opt-in matching only
- API key management: Store API keys securely

**Tasks**:
1. Create `anime/content_matcher.py` with API integration
2. Add AniDB API client (if API available)
3. Add MyAnimeList API client
4. Create metadata enrichment workflow
5. Add poster download functionality
6. Add content matching toggle to settings
7. Store API keys securely in config

---

## Phase 10: Polish and Optimization (Priority: High)

### 10.1 Performance Optimization
**Files**: Various

**Optimizations**:
- Lazy loading: Load thumbnails on demand, not all at once
- Caching: Cache metadata and thumbnails efficiently
- Background processing: Generate thumbnails in background thread
- Database indexing: Add indexes for common queries
- Memory management: Efficient memory usage for large libraries
- Pagination: Paginate library display for large collections

**Tasks**:
1. Implement lazy thumbnail loading in library GUI
2. Add thumbnail caching system
3. Create background thumbnail generation queue
4. Add database indexes for performance
5. Implement pagination for library views
6. Optimize database queries

### 10.2 UI/UX Enhancements
**Files**: `main_window.py`, `ui/` components

**Features**:
- Loading indicators: Show loading states for operations
- Progress bars: Show progress for long operations
- Tooltips: Helpful tooltips throughout interface
- Error handling: User-friendly error messages
- Onboarding: First-run setup wizard
- Keyboard shortcuts: Global hotkeys for common actions
- Context menus: Right-click menus for library items

**Tasks**:
1. Add loading spinners/indicators
2. Add progress bars for file operations
3. Add tooltips to all buttons/controls
4. Improve error messages with helpful text
5. Create first-run wizard
6. Implement keyboard shortcuts
7. Add context menus to library items

### 10.3 Settings System
**File**: `ui/settings_manager.py` (new)

**Features**:
- Player settings: Default playback speed, subtitle settings, auto-play next
- Library settings: Default view (grid/list), sorting preferences, items per page
- Organization settings: Auto-organize on file add, default organization rules
- Appearance settings: Theme selection, font sizes, UI scaling
- Gamification settings: Enable/disable gamification, notification preferences
- Advanced settings: Database location, cache size, log level

**Tasks**:
1. Create `ui/settings_manager.py` with settings UI
2. Add settings persistence to database/config
3. Implement all setting categories
4. Add settings validation
5. Integrate settings into main window

---

## Implementation Order Recommendation

### Sprint 1 (Week 1-2): Core Library Experience
1. Library Browsing GUI (Phase 1)
2. Video Player Integration (Phase 2)
3. Basic polish (loading indicators, error handling)

### Sprint 2 (Week 3-4): Gamification Phase 2
4. Quest System UI (Phase 3)
5. Gacha System (Phase 4)
6. Chibi Companion (Phase 5)
7. UI Theme Switching (Phase 6)

### Sprint 3 (Week 5-6): Advanced Features
8. Subtitle Management (Phase 7)
9. Quality Management (Phase 8)
10. Content Matching (Phase 9)

### Sprint 4 (Week 7-8): Polish
11. Performance Optimization (Phase 10.1)
12. UI/UX Enhancements (Phase 10.2)
13. Settings System (Phase 10.3)
14. Final testing and bug fixes

---

## Dependencies and Prerequisites

### Required Dependencies (add to requirements.txt)
- Already have: `python-vlc`, `opencv-python`, `requests`
- May need: `Pillow` (for image handling in themes), `tkinter` (built-in)

### Database Schema Updates Needed
- Add indexes for performance
- May need additional tables for playlists, quality info

### External Services (Optional)
- AniDB API (for content matching)
- MyAnimeList API (for content matching)
- Both require API keys and user opt-in

---

## Success Criteria

### Library GUI
- ✅ Can browse series in grid view
- ✅ Can browse episodes in list view
- ✅ Can search and filter library
- ✅ Thumbnails load efficiently
- ✅ Can click episode to play

### Video Integration
- ✅ Clicking episode launches player
- ✅ Can navigate next/previous episodes
- ✅ Auto-resumes from last position
- ✅ Play queue works correctly

### Gamification Phase 2
- ✅ Quest UI displays active quests
- ✅ Gacha pull interface works
- ✅ Chibi companion reacts to events
- ✅ Can switch between UI themes

### Advanced Features
- ✅ Subtitles detected and displayed
- ✅ Quality badges shown in library
- ✅ Content matching enriches metadata (if enabled)

### Polish
- ✅ Application performs well with 1000+ episodes
- ✅ UI is responsive and smooth
- ✅ Settings are comprehensive
- ✅ Error handling is user-friendly

---

## Detailed Task List

### Phase 1: Library Browsing GUI
- [ ] Create `library/library_gui.py` with grid view (Netflix-style poster grid with series thumbnails)
- [ ] Implement list view in library GUI (detailed list with metadata columns: name, episodes, progress, quality)
- [ ] Add search and filter functionality to library GUI (by name, genre, quality, completion status)
- [ ] Integrate library GUI into `main_window.py` library tab, connect to series_manager and watch_history

### Phase 2: Video Player Integration
- [ ] Connect library play buttons to `player_manager.play_video()`, launch VLC when episode clicked
- [ ] Enhance `player_manager.py` with episode navigation (next/previous episode detection and playback)
- [ ] Implement auto-resume from watch history when playing episode (load last position from database)
- [ ] Add play queue management (add multiple episodes to queue, auto-play next episode)

### Phase 3: Gamification Phase 2 - Quest System
- [ ] Create `ui/quest_panel.py` with daily/weekly quest display, progress bars, and completion notifications
- [ ] Integrate quest panel into main window (new tab or in profile), connect to gamification_manager

### Phase 4: Gamification Phase 2 - Gacha System
- [ ] Create `ui/gacha_panel.py` with animated pull interface, item reveal, and rarity indicators
- [ ] Implement gacha inventory display and equip system (equip wallpapers, avatars, themes, companions)

### Phase 5: Gamification Phase 2 - Chibi Companion
- [ ] Create `ui/chibi_companion.py` with animated sprite, reaction system (happy/sleepy/excited), and companion selection
- [ ] Integrate chibi companion into main window (corner widget), connect to gamification events

### Phase 6: Gamification Phase 2 - UI Themes
- [ ] Create `GamingHUDTheme` class in `ui/themes.py` (futuristic overlays, XP bars on cards, neon accents)
- [ ] Create `OtakuRoomTheme` class (manga-style shelves, poster backgrounds, cozy feel)
- [ ] Create `KawaiiTheme` class (soft pastels, rounded corners, cute icons)
- [ ] Create `ui/theme_manager.py` for theme switching, add theme switcher to settings, save preference to database

### Phase 7: Advanced Features - Subtitles
- [ ] Create `player/subtitle_manager.py` with auto-detection (.srt, .ass, .vtt), matching, and language detection
- [ ] Integrate subtitle detection into player_manager and library scan, display subtitle info in library

### Phase 8: Advanced Features - Quality Management
- [ ] Create `anime/quality_manager.py` with quality detection (resolution, bitrate, codec), duplicate detection
- [ ] Add quality badges to library display, quality filter, and quality info to database

### Phase 9: Advanced Features - Content Matching
- [ ] Create `anime/content_matcher.py` with AniDB/MAL API clients, metadata enrichment, and poster download (opt-in)

### Phase 10: Polish and Optimization
- [ ] Implement lazy thumbnail loading in library GUI, pagination for large collections
- [ ] Add thumbnail caching system and background thumbnail generation queue
- [ ] Add database indexes for common queries, optimize database operations
- [ ] Add loading spinners/indicators and progress bars for long operations throughout UI
- [ ] Add tooltips to all buttons/controls, implement keyboard shortcuts and context menus
- [ ] Improve error messages with helpful text, add user-friendly error dialogs
- [ ] Create `ui/settings_manager.py` with comprehensive settings UI (player, library, organization, appearance, gamification, advanced)
- [ ] Add settings persistence to database/config, integrate settings into main window

---

## Notes

- All features should maintain anime/otaku theme consistency
- Gamification features should be optional (can be disabled)
- Content matching should be opt-in only (privacy-first)
- Performance is critical for large libraries
- Each phase should be testable independently
- This plan builds on the existing master plan (ANIME_VIEWING_LIBRARY_PLAN.md)
- Gamification Phase 1 is complete, Phase 2 is outlined here
- Auto-updater system is already implemented

---

## File Structure (After Complete Implementation)

```
anime_library/
├── main.py
├── main_window.py
├── config.json
├── requirements.txt
│
├── core/                      # Core functionality
│   ├── file_organizer.py
│   ├── file_scanner.py
│   ├── metadata_extractor.py
│   ├── database.py
│   └── updater.py
│
├── anime/                     # Anime-specific features
│   ├── episode_detector.py
│   ├── filename_parser.py
│   ├── series_manager.py
│   ├── quality_manager.py     # NEW
│   └── content_matcher.py     # NEW
│
├── library/                   # Library management
│   ├── library_gui.py         # NEW (grid/list views)
│   ├── thumbnail_generator.py
│   ├── watch_history.py
│   └── smart_folders.py       # FUTURE
│
├── player/                    # Video playback
│   ├── video_player.py
│   ├── player_manager.py
│   └── subtitle_manager.py    # NEW
│
├── gamification/              # Gamification system
│   ├── database.py
│   └── gamification_manager.py
│
└── ui/                        # UI components
    ├── themes.py              # Enhanced with new themes
    ├── theme_manager.py       # NEW
    ├── quest_panel.py         # NEW
    ├── gacha_panel.py         # NEW
    ├── chibi_companion.py     # NEW
    └── settings_manager.py    # NEW
```

---

**Last Updated**: Based on current implementation status and user requirements
**Plan Version**: 1.0
**Status**: Ready for implementation

