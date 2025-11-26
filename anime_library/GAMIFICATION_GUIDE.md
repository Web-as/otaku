# 🎮 Library of Otaku - Gamification System Guide

## Overview

The Anime Library app now includes a comprehensive gamification system that rewards users for using the app, making it more engaging and fun!

## ✅ Implemented Features (Phase 1)

### 1. XP & Leveling System

- **XP Sources**:
  - Organizing files: 5 XP per file
  - Watching episodes: 10 XP per episode
  - Adding anime: 20 XP per series
  - Daily login: 25 XP + streak bonus
  - Achievements: Variable XP rewards

- **Level Titles**:
  - Level 1: "Newbie Otaku"
  - Level 10: "Slice-of-Life Enthusiast"
  - Level 20: "Shonen Warrior"
  - Level 30: "Anime Connoisseur"
  - Level 40: "Anime Archivist"
  - Level 50: "Master Collector"
  - Level 60: "Otaku Emperor"
  - Level 70+: "Anime Legend", "Ultimate Otaku", "Anime Deity", "God of Anime"

- **Leveling Formula**: Exponential curve with ~500 XP per level after level 10

### 2. Achievements & Badges

**Watching Achievements**:
- 🏅 **Binge Master**: Watch 10 episodes in one day (100 XP, 50 coins)
- 🏅 **Classic Conqueror**: Finish 10+ old anime (200 XP, 100 coins)
- 🏅 **Night Owl**: Watch past midnight (50 XP, 25 coins)
- 🏅 **Centurion**: Watch 100 episodes (500 XP, 200 coins)
- 🏅 **Thousand Watcher**: Watch 1000 episodes (2000 XP, 1000 coins)

**Organizer Achievements**:
- 🏅 **Folder Sensei**: Organize 500 files (300 XP, 150 coins)
- 🏅 **Metadata Sorcerer**: Auto-tag 100 episodes (400 XP, 200 coins)
- 🏅 **File Master**: Organize 1000 files (1000 XP, 500 coins)

**Community Achievements**:
- 🏅 **Reviewer**: Leave 10 anime reviews (150 XP, 75 coins)
- 🏅 **Critic**: Leave 50 reviews (500 XP, 250 coins)

**Level Achievements**:
- 🏅 **Slice-of-Life Enthusiast**: Reach level 10 (200 XP, 100 coins)
- 🏅 **Shonen Warrior**: Reach level 20 (500 XP, 250 coins)
- 🏅 **Anime Archivist**: Reach level 40 (1500 XP, 750 coins)
- 🏅 **Otaku Emperor**: Reach level 60 (3000 XP, 1500 coins)

### 3. Daily Login & Streaks

- **Daily Login Bonus**: 25 XP + 10 coins
- **Streak Bonus**: +5 XP and +2 coins per consecutive day
- **Maximum Streak**: Unlimited (keeps growing!)

### 4. Otaku Coins

- Earned from achievements, quests, and daily logins
- Currently used for: **Future gacha system** (coming soon!)

### 5. User Profile

Access your profile from the sidebar to see:
- Current level and title
- XP progress bar
- Total Otaku Coins
- Unlocked achievements
- Watch statistics
- Organization statistics

## 🚧 Coming Soon (Phase 2+)

### Daily & Weekly Quests

**Daily Quests** (defined, not yet active):
- Watch 1 Episode (50 XP, 25 coins)
- Add 3 Anime (75 XP, 30 coins)
- Rate a Series (50 XP, 25 coins)
- Organize a Folder (100 XP, 50 coins)

**Weekly Quests**:
- Complete a Season (500 XP, 200 coins)
- Write 5 Reviews (300 XP, 150 coins)
- Tag 15 Files (400 XP, 200 coins)

### Gacha System

**Otaku Coins** will be used to pull:
- 🎨 Anime-themed wallpapers
- 🖼️ Avatar frames
- 🎭 Chibi characters
- 🔊 Sound packs
- 🎨 Color schemes
- 🏷️ Profile banners
- 🎪 Digital shelf decorations
- 🎮 Themes for library interface

**Rarity Tiers**:
- Common (most items)
- Rare (special items)
- Epic (very rare)
- Legendary (ultra rare)

### UI Themes

**Planned Themes**:
- 🎮 **Gaming HUD Mode**: Futuristic overlays, XP bars on cards
- 🏯 **Otaku Room Mode**: Shelves with manga-style volumes, posters
- 🌸 **Kawaii Mode**: Soft pastel UI, chibi companions

### Chibi Companions

- Animated companions that react to your actions
- Happy when you finish episodes
- Sleepy if inactive
- Excited when leveling up
- Unlock via gacha system

### Community Features (Future)

- Friend system
- Leaderboards
- Clubs/Guilds
- Trading cosmetic items

## 📊 How It Works

### Automatic Rewards

The system automatically tracks:
- ✅ Files organized (when you use the organizer)
- ✅ Episodes watched (when you use the player)
- ✅ Anime added (when you add to library)
- ✅ Daily logins (on app startup)

### Achievement Unlocks

Achievements unlock automatically when you meet the requirements. You'll get a notification popup!

### Level Up Notifications

When you level up, you'll see a special notification with your new title!

## 🎯 Tips for Maximizing XP

1. **Organize Files Regularly**: Each file organized = 5 XP
2. **Watch Episodes**: 10 XP per episode
3. **Add Anime to Library**: 20 XP per series
4. **Login Daily**: Build your streak for bonus rewards!
5. **Complete Achievements**: Large XP and coin rewards

## 📁 Database

Gamification data is stored in:
- `data/gamification.db` - All gamification data

**Tables**:
- `user_stats` - XP, level, coins, statistics
- `achievements` - Achievement definitions
- `user_achievements` - Unlocked achievements
- `daily_quests` / `weekly_quests` - Quest definitions
- `user_quest_progress` - Quest tracking
- `gacha_items` - Gacha item catalog
- `user_gacha_inventory` - User's gacha items
- `user_profile` - Profile customization
- `xp_history` - XP transaction log

## 🔧 Developer Notes

### Adding New Achievements

Edit `gamification/database.py` in `_initialize_default_achievements()`:

```python
('achievement_id', 'Achievement Name', 'Description', 'category', xp_reward, coin_reward, 'rarity')
```

### Adding New XP Sources

In `gamification_manager.py`, add methods like:
```python
def on_custom_action(self, count: int = 1):
    xp_per_action = 15
    total_xp = count * xp_per_action
    return self.add_xp(total_xp, 'custom_action', f'action_{count}')
```

### Customizing Level Titles

Edit `LEVEL_TITLES` in `gamification_manager.py`:

```python
LEVEL_TITLES = {
    1: "Your Title",
    10: "Another Title",
    ...
}
```

## 🎨 Future Enhancements

- [ ] Quest system activation and UI
- [ ] Gacha pull interface
- [ ] Chibi companion animations
- [ ] UI theme switching
- [ ] Sound effects for level ups
- [ ] Achievement art/icons
- [ ] Leaderboards
- [ ] Social features

## 📝 Notes

- All gamification is **local only** (no server required)
- Data persists between app sessions
- Achievements unlock automatically
- Daily login bonus resets at midnight
- Streaks reset if you miss a day

Enjoy your journey to becoming the Ultimate Otaku! 🎌✨

