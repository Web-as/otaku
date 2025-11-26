#!/usr/bin/env python3
"""
Main Window - Unified Tkinter GUI for Anime Library.
Anime Otaku themed with Tokyo Night color scheme.
"""

import tkinter as tk
from tkinter import ttk, filedialog, messagebox, scrolledtext
from pathlib import Path
from typing import Dict, Optional
import logging
import threading
import sys

# Add current directory to path for imports
script_dir = Path(__file__).parent
if str(script_dir) not in sys.path:
    sys.path.insert(0, str(script_dir))

from core.database import Database
from core.file_organizer import FileOrganizer
from anime.series_manager import SeriesManager
from player.player_manager import PlayerManager
from library.watch_history import WatchHistory
from ui.themes import TokyoNightTheme
from gamification import GamificationDatabase, GamificationManager

logger = logging.getLogger(__name__)


class AnimeLibraryWindow:
    """Main application window with anime otaku theme."""
    
    def __init__(self, root):
        """
        Initialize main window.
        
        Args:
            root: Tkinter root window
        """
        self.root = root
        self.root.title("アニメ ライブラリ - Anime Library")
        self.root.geometry("1400x900")
        self.root.resizable(True, True)
        
        # Apply Tokyo Night theme
        TokyoNightTheme.apply_theme(root)
        self.root.configure(bg=TokyoNightTheme.BG_DARK)
        
        # Initialize components
        self.database = None
        self.file_organizer = None
        self.series_manager = None
        self.player_manager = None
        self.watch_history = None
        
        # Setup database
        db_path = Path(__file__).parent / "data" / "anime_library.db"
        db_path.parent.mkdir(parents=True, exist_ok=True)
        self.database = Database(db_path)
        
        # Initialize gamification database
        gamification_db_path = Path(__file__).parent / "data" / "gamification.db"
        gamification_db_path.parent.mkdir(parents=True, exist_ok=True)
        self.gamification_db = GamificationDatabase(gamification_db_path)
        self.gamification_manager = GamificationManager(self.gamification_db)
        
        # Initialize managers
        self.series_manager = SeriesManager(self.database)
        self.player_manager = PlayerManager(self.database)
        self.watch_history = WatchHistory(self.database)
        
        # Register gamification callbacks
        self.gamification_manager.register_level_up_callback(self.on_level_up)
        self.gamification_manager.register_achievement_callback(self.on_achievement_unlocked)
        
        # Daily login bonus
        self.gamification_manager.on_daily_login()
        
        # Current view state
        self.current_view = "organizer"
        
        # Setup UI
        self.setup_ui()
        
        # Center window
        self.center_window()
    
    def center_window(self):
        """Center the window on screen."""
        self.root.update_idletasks()
        width = self.root.winfo_width()
        height = self.root.winfo_height()
        x = (self.root.winfo_screenwidth() // 2) - (width // 2)
        y = (self.root.winfo_screenheight() // 2) - (height // 2)
        self.root.geometry(f'{width}x{height}+{x}+{y}')
    
    def create_anime_button(self, parent, text, command, style='TButton', width=20):
        """Create a styled anime-themed button."""
        btn = ttk.Button(parent, text=text, command=command, style=style, width=width)
        return btn
    
    def setup_ui(self):
        """Setup the user interface with anime theme."""
        # Main container with dark background
        main_frame = ttk.Frame(self.root, padding="0")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Configure grid weights
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(1, weight=1)
        main_frame.rowconfigure(0, weight=1)
        
        # Left sidebar - Navigation (anime-themed)
        sidebar = ttk.Frame(main_frame, style='Card.TFrame', width=250)
        sidebar.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S), padx=(0, 5))
        sidebar.columnconfigure(0, weight=1)
        
        # Sidebar header with Japanese text
        header_frame = ttk.Frame(sidebar, style='Card.TFrame')
        header_frame.grid(row=0, column=0, sticky=(tk.W, tk.E), pady=(20, 30), padx=15)
        
        # Main title with Japanese
        title_label = ttk.Label(header_frame, 
                               text="アニメ ライブラリ",
                               style='Title.TLabel',
                               font=('Segoe UI', 20, 'bold'))
        title_label.grid(row=0, column=0, pady=(0, 5))
        
        subtitle_label = ttk.Label(header_frame,
                                  text="Anime Library",
                                  style='Subtitle.TLabel')
        subtitle_label.grid(row=1, column=0)
        
        # Navigation buttons with anime styling
        nav_frame = ttk.Frame(sidebar, style='Card.TFrame')
        nav_frame.grid(row=1, column=0, sticky=(tk.W, tk.E), padx=15, pady=(0, 20))
        nav_frame.columnconfigure(0, weight=1)
        
        # Navigation buttons
        self.nav_organize = self.create_anime_button(
            nav_frame, "📁 整理ファイル\nOrganize Files", 
            self.show_organizer, 'Purple.TButton', 25
        )
        self.nav_organize.grid(row=0, column=0, sticky=(tk.W, tk.E), pady=8)
        
        self.nav_library = self.create_anime_button(
            nav_frame, "📚 ライブラリ\nLibrary", 
            self.show_library, 'Cyan.TButton', 25
        )
        self.nav_library.grid(row=1, column=0, sticky=(tk.W, tk.E), pady=8)
        
        self.nav_settings = self.create_anime_button(
            nav_frame, "⚙️ 設定\nSettings", 
            self.show_settings, 'TButton', 25
        )
        self.nav_settings.grid(row=2, column=0, sticky=(tk.W, tk.E), pady=8)
        
        # Profile/Stats button
        self.nav_profile = self.create_anime_button(
            nav_frame, "👤 プロフィール\nProfile", 
            self.show_profile, 'Pink.TButton', 25
        )
        self.nav_profile.grid(row=3, column=0, sticky=(tk.W, tk.E), pady=8)
        
        # Check for updates button
        self.nav_updates = self.create_anime_button(
            nav_frame, "🔄 更新を確認\nCheck Updates", 
            self.check_updates_manual, 'TButton', 25
        )
        self.nav_updates.grid(row=4, column=0, sticky=(tk.W, tk.E), pady=8)
        
        # Status/info section at bottom of sidebar (with gamification stats)
        info_frame = ttk.Frame(sidebar, style='Card.TFrame')
        info_frame.grid(row=2, column=0, sticky=(tk.W, tk.E, tk.S), padx=15, pady=15)
        info_frame.columnconfigure(0, weight=1)
        
        # Gamification stats
        stats = self.gamification_manager.get_user_stats()
        level = stats.get('calculated_level', 1)
        title = stats.get('level_title', 'Newbie Otaku')
        coins = stats.get('otaku_coins', 0)
        
        ttk.Label(info_frame, 
                 text=f"✨ Level {level}",
                 style='Accent.TLabel',
                 font=('Segoe UI', 10, 'bold')).grid(row=0, column=0, pady=2)
        
        ttk.Label(info_frame, 
                 text=title,
                 style='Subtitle.TLabel',
                 font=('Segoe UI', 8)).grid(row=1, column=0, pady=2)
        
        ttk.Label(info_frame, 
                 text=f"💰 {coins} Coins",
                 style='Accent.TLabel',
                 font=('Segoe UI', 9)).grid(row=2, column=0, pady=2)
        
        # Main content area
        self.content_frame = ttk.Frame(main_frame)
        self.content_frame.grid(row=0, column=1, sticky=(tk.W, tk.E, tk.N, tk.S), padx=5, pady=5)
        self.content_frame.columnconfigure(0, weight=1)
        self.content_frame.rowconfigure(0, weight=1)
        
        # Show organizer by default
        self.show_organizer()
    
    def show_organizer(self):
        """Show file organizer interface with anime theme."""
        self.current_view = "organizer"
        # Clear content
        for widget in self.content_frame.winfo_children():
            widget.destroy()
        
        # Organizer UI with card styling
        org_frame = ttk.Frame(self.content_frame, style='Card.TFrame', padding="30")
        org_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S), padx=10, pady=10)
        org_frame.columnconfigure(1, weight=1)
        
        # Header with Japanese text
        header_frame = ttk.Frame(org_frame, style='Card.TFrame')
        header_frame.grid(row=0, column=0, columnspan=3, sticky=(tk.W, tk.E), pady=(0, 30))
        
        title_label = ttk.Label(header_frame,
                               text="📁 ファイル整理",
                               style='Title.TLabel',
                               font=('Segoe UI', 24, 'bold'))
        title_label.grid(row=0, column=0, pady=(0, 5))
        
        subtitle_label = ttk.Label(header_frame,
                                  text="Organize your files by type with intelligent metadata extraction",
                                  style='Subtitle.TLabel')
        subtitle_label.grid(row=1, column=0)
        
        # Source path section
        source_frame = ttk.Frame(org_frame, style='Card.TFrame')
        source_frame.grid(row=1, column=0, columnspan=3, sticky=(tk.W, tk.E), pady=15)
        source_frame.columnconfigure(1, weight=1)
        
        ttk.Label(source_frame, 
                 text="📂 ソース:",
                 style='Accent.TLabel',
                 font=('Segoe UI', 11)).grid(row=0, column=0, sticky=tk.W, pady=5)
        ttk.Label(source_frame, 
                 text="Source Directory",
                 style='Subtitle.TLabel').grid(row=0, column=1, sticky=tk.W, padx=(10, 0))
        
        self.source_var = tk.StringVar()
        source_entry = ttk.Entry(source_frame, textvariable=self.source_var, width=60, font=('Segoe UI', 10))
        source_entry.grid(row=1, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=5)
        
        browse_source_btn = ttk.Button(source_frame, 
                                      text="参照...",
                                      command=lambda: self.source_var.set(filedialog.askdirectory() or self.source_var.get()),
                                      style='Cyan.TButton')
        browse_source_btn.grid(row=1, column=2, padx=(10, 0), pady=5)
        
        # Destination path section
        dest_frame = ttk.Frame(org_frame, style='Card.TFrame')
        dest_frame.grid(row=2, column=0, columnspan=3, sticky=(tk.W, tk.E), pady=15)
        dest_frame.columnconfigure(1, weight=1)
        
        ttk.Label(dest_frame, 
                 text="📁 宛先:",
                 style='Accent.TLabel',
                 font=('Segoe UI', 11)).grid(row=0, column=0, sticky=tk.W, pady=5)
        ttk.Label(dest_frame, 
                 text="Destination Directory (optional - defaults to source)",
                 style='Subtitle.TLabel').grid(row=0, column=1, sticky=tk.W, padx=(10, 0))
        
        self.dest_var = tk.StringVar()
        dest_entry = ttk.Entry(dest_frame, textvariable=self.dest_var, width=60, font=('Segoe UI', 10))
        dest_entry.grid(row=1, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=5)
        
        browse_dest_btn = ttk.Button(dest_frame, 
                                     text="参照...",
                                     command=lambda: self.dest_var.set(filedialog.askdirectory() or self.dest_var.get()),
                                     style='Cyan.TButton')
        browse_dest_btn.grid(row=1, column=2, padx=(10, 0), pady=5)
        
        # Options frame
        options_frame = ttk.Frame(org_frame, style='Card.TFrame')
        options_frame.grid(row=3, column=0, columnspan=3, sticky=(tk.W, tk.E), pady=15)
        
        self.move_files_var = tk.BooleanVar(value=False)
        move_check = ttk.Checkbutton(options_frame,
                                    text="移動 (Move files instead of copy)",
                                    variable=self.move_files_var,
                                    style='TLabel')
        move_check.grid(row=0, column=0, sticky=tk.W, pady=5)
        
        self.dry_run_var = tk.BooleanVar(value=True)
        dry_run_check = ttk.Checkbutton(options_frame,
                                       text="ドライラン (Dry run - preview only)",
                                       variable=self.dry_run_var,
                                       style='TLabel')
        dry_run_check.grid(row=1, column=0, sticky=tk.W, pady=5)
        
        # Organize button (large, prominent)
        organize_btn_frame = ttk.Frame(org_frame, style='Card.TFrame')
        organize_btn_frame.grid(row=4, column=0, columnspan=3, pady=30)
        
        organize_btn = ttk.Button(organize_btn_frame,
                                 text="🚀 整理を開始\nStart Organization",
                                 command=self.organize_files,
                                 style='Purple.TButton',
                                 width=30)
        organize_btn.grid(row=0, column=0, pady=10)
        
        # Progress/status area
        self.status_text = scrolledtext.ScrolledText(org_frame,
                                                    height=8,
                                                    bg=TokyoNightTheme.BG_CARD,
                                                    fg=TokyoNightTheme.TEXT_PRIMARY,
                                                    font=('Consolas', 9),
                                                    wrap=tk.WORD,
                                                    relief='flat',
                                                    borderwidth=1)
        self.status_text.grid(row=5, column=0, columnspan=3, sticky=(tk.W, tk.E), pady=15)
        self.status_text.insert('1.0', "Ready to organize files...\n")
        self.status_text.config(state='disabled')
    
    def organize_files(self):
        """Organize files with progress updates."""
        source = self.source_var.get()
        dest = self.dest_var.get() or source
        
        if not source:
            messagebox.showerror("エラー", "Please select a source directory\nソースディレクトリを選択してください")
            return
        
        # Clear status
        self.status_text.config(state='normal')
        self.status_text.delete('1.0', tk.END)
        self.status_text.insert('1.0', f"Starting organization...\nSource: {source}\nDestination: {dest}\n\n")
        self.status_text.config(state='disabled')
        self.root.update()
        
        def organize_thread():
            try:
                organizer = FileOrganizer(
                    source, 
                    dest, 
                    move_files=self.move_files_var.get(),
                    dry_run=self.dry_run_var.get()
                )
                
                # Update status
                self.status_text.config(state='normal')
                self.status_text.insert(tk.END, "Scanning files...\n")
                self.status_text.config(state='disabled')
                self.root.update()
                
                files_by_type = organizer.scan_directory()
                
                self.status_text.config(state='normal')
                self.status_text.insert(tk.END, f"\nFound {organizer.stats['files_processed']} files\n")
                self.status_text.insert(tk.END, "Organizing files...\n")
                self.status_text.config(state='disabled')
                self.root.update()
                
                if not self.dry_run_var.get():
                    organizer.organize_files(files_by_type)
                
                # Show summary
                self.status_text.config(state='normal')
                self.status_text.insert(tk.END, "\n" + "="*50 + "\n")
                self.status_text.insert(tk.END, "ORGANIZATION SUMMARY\n")
                self.status_text.insert(tk.END, "="*50 + "\n")
                self.status_text.insert(tk.END, f"Files processed: {organizer.stats['files_processed']}\n")
                for category, count in sorted(organizer.stats['files_by_type'].items()):
                    self.status_text.insert(tk.END, f"  {category}: {count} files\n")
                if organizer.stats['errors']:
                    self.status_text.insert(tk.END, f"\nErrors: {len(organizer.stats['errors'])}\n")
                self.status_text.insert(tk.END, "\n✅ Organization complete!\n")
                
                # Award gamification rewards
                file_count = organizer.stats.get('files_processed', 0)
                if file_count > 0:
                    xp_result = self.gamification_manager.on_file_organized(file_count)
                    self.status_text.insert(tk.END, f"\n🎮 Gamification:\n")
                    self.status_text.insert(tk.END, f"  +{xp_result['xp_gained']} XP\n")
                    if xp_result.get('leveled_up'):
                        self.status_text.insert(tk.END, f"  🎉 LEVEL UP! Level {xp_result['new_level']} - {xp_result['level_title']}\n")
                
                self.status_text.config(state='disabled')
                self.root.update()
                
                if not self.dry_run_var.get():
                    messagebox.showinfo("成功", "Files organized successfully!\nファイルの整理が完了しました！")
                else:
                    messagebox.showinfo("プレビュー", "Dry run complete. No files were moved.\nドライラン完了。ファイルは移動されませんでした。")
                    
            except Exception as e:
                self.status_text.config(state='normal')
                self.status_text.insert(tk.END, f"\n❌ Error: {e}\n")
                self.status_text.config(state='disabled')
                self.root.update()
                messagebox.showerror("エラー", f"Error organizing files:\n{e}")
        
        # Run in separate thread to avoid freezing GUI
        thread = threading.Thread(target=organize_thread, daemon=True)
        thread.start()
    
    def show_library(self):
        """Show library browsing interface with anime theme."""
        self.current_view = "library"
        # Clear content
        for widget in self.content_frame.winfo_children():
            widget.destroy()
        
        # Library UI with card styling
        lib_frame = ttk.Frame(self.content_frame, style='Card.TFrame', padding="30")
        lib_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S), padx=10, pady=10)
        
        # Header
        header_frame = ttk.Frame(lib_frame, style='Card.TFrame')
        header_frame.grid(row=0, column=0, sticky=(tk.W, tk.E), pady=(0, 30))
        
        title_label = ttk.Label(header_frame,
                               text="📚 メディア ライブラリ",
                               style='Title.TLabel',
                               font=('Segoe UI', 24, 'bold'))
        title_label.grid(row=0, column=0, pady=(0, 5))
        
        subtitle_label = ttk.Label(header_frame,
                                  text="Browse and manage your anime collection",
                                  style='Subtitle.TLabel')
        subtitle_label.grid(row=1, column=0)
        
        # Coming soon message
        coming_soon_frame = ttk.Frame(lib_frame, style='Card.TFrame')
        coming_soon_frame.grid(row=1, column=0, pady=50)
        
        ttk.Label(coming_soon_frame,
                 text="✨ Library browsing interface coming soon!",
                 style='Accent.TLabel',
                 font=('Segoe UI', 14)).grid(row=0, column=0, pady=10)
        
        ttk.Label(coming_soon_frame,
                 text="Features: Series browsing, episode grid, watch history, and more!",
                 style='Subtitle.TLabel').grid(row=1, column=0, pady=5)
    
    def show_settings(self):
        """Show settings interface with anime theme."""
        self.current_view = "settings"
        # Clear content
        for widget in self.content_frame.winfo_children():
            widget.destroy()
        
        # Settings UI with card styling
        settings_frame = ttk.Frame(self.content_frame, style='Card.TFrame', padding="30")
        settings_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S), padx=10, pady=10)
        
        # Header
        header_frame = ttk.Frame(settings_frame, style='Card.TFrame')
        header_frame.grid(row=0, column=0, sticky=(tk.W, tk.E), pady=(0, 30))
        
        title_label = ttk.Label(header_frame,
                               text="⚙️ 設定",
                               style='Title.TLabel',
                               font=('Segoe UI', 24, 'bold'))
        title_label.grid(row=0, column=0, pady=(0, 5))
        
        subtitle_label = ttk.Label(header_frame,
                                  text="Application settings and preferences",
                                  style='Subtitle.TLabel')
        subtitle_label.grid(row=1, column=0)
        
        # Coming soon message
        coming_soon_frame = ttk.Frame(settings_frame, style='Card.TFrame')
        coming_soon_frame.grid(row=1, column=0, pady=50)
        
        ttk.Label(coming_soon_frame,
                 text="✨ Settings interface coming soon!",
                 style='Accent.TLabel',
                 font=('Segoe UI', 14)).grid(row=0, column=0, pady=10)
        
        ttk.Label(coming_soon_frame,
                 text="Configure player settings, library preferences, and more!",
                 style='Subtitle.TLabel').grid(row=1, column=0, pady=5)
    
    def show_profile(self):
        """Show user profile with gamification stats."""
        self.current_view = "profile"
        # Clear content
        for widget in self.content_frame.winfo_children():
            widget.destroy()
        
        # Profile UI
        profile_frame = ttk.Frame(self.content_frame, style='Card.TFrame', padding="30")
        profile_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S), padx=10, pady=10)
        profile_frame.columnconfigure(0, weight=1)
        
        # Header
        header_frame = ttk.Frame(profile_frame, style='Card.TFrame')
        header_frame.grid(row=0, column=0, sticky=(tk.W, tk.E), pady=(0, 30))
        
        title_label = ttk.Label(header_frame,
                               text="👤 プロフィール",
                               style='Title.TLabel',
                               font=('Segoe UI', 24, 'bold'))
        title_label.grid(row=0, column=0, pady=(0, 5))
        
        subtitle_label = ttk.Label(header_frame,
                                  text="Your Otaku Profile & Stats",
                                  style='Subtitle.TLabel')
        subtitle_label.grid(row=1, column=0)
        
        # Stats section
        stats = self.gamification_manager.get_user_stats()
        level = stats.get('calculated_level', 1)
        total_xp = stats.get('total_xp', 0)
        xp_progress = stats.get('xp_progress', {})
        coins = stats.get('otaku_coins', 0)
        title = stats.get('level_title', 'Newbie Otaku')
        
        stats_frame = ttk.Frame(profile_frame, style='Card.TFrame', padding="20")
        stats_frame.grid(row=1, column=0, sticky=(tk.W, tk.E), pady=10)
        
        # Level display
        ttk.Label(stats_frame,
                 text=f"Level {level}",
                 style='Title.TLabel',
                 font=('Segoe UI', 32, 'bold')).grid(row=0, column=0, sticky=tk.W, pady=5)
        
        ttk.Label(stats_frame,
                 text=title,
                 style='Accent.TLabel',
                 font=('Segoe UI', 14)).grid(row=1, column=0, sticky=tk.W, pady=5)
        
        # XP Progress bar
        progress_frame = ttk.Frame(stats_frame, style='Card.TFrame')
        progress_frame.grid(row=2, column=0, sticky=(tk.W, tk.E), pady=10)
        
        ttk.Label(progress_frame,
                 text=f"XP: {xp_progress.get('current', 0)} / {xp_progress.get('needed', 0)} ({xp_progress.get('percentage', 0):.1f}%)",
                 style='Subtitle.TLabel').grid(row=0, column=0, sticky=tk.W)
        
        # Coins
        ttk.Label(stats_frame,
                 text=f"💰 Otaku Coins: {coins}",
                 style='Accent.TLabel',
                 font=('Segoe UI', 14, 'bold')).grid(row=3, column=0, sticky=tk.W, pady=10)
        
        # Achievements section
        achievements = self.gamification_manager.get_achievements()
        
        ach_frame = ttk.Frame(profile_frame, style='Card.TFrame', padding="20")
        ach_frame.grid(row=2, column=0, sticky=(tk.W, tk.E), pady=10)
        
        ttk.Label(ach_frame,
                 text=f"🏅 Achievements ({len(achievements)})",
                 style='Title.TLabel',
                 font=('Segoe UI', 18, 'bold')).grid(row=0, column=0, sticky=tk.W, pady=(0, 15))
        
        if achievements:
            for i, ach in enumerate(achievements[:10]):  # Show first 10
                ach_row = ttk.Frame(ach_frame, style='Card.TFrame')
                ach_row.grid(row=i+1, column=0, sticky=(tk.W, tk.E), pady=5)
                
                ttk.Label(ach_row,
                         text=f"✨ {ach.get('name')}",
                         style='Accent.TLabel').grid(row=0, column=0, sticky=tk.W)
                ttk.Label(ach_row,
                         text=ach.get('description', ''),
                         style='Subtitle.TLabel').grid(row=1, column=0, sticky=tk.W)
        else:
            ttk.Label(ach_frame,
                     text="No achievements unlocked yet. Keep using the app!",
                     style='Subtitle.TLabel').grid(row=1, column=0, pady=10)
    
    def on_level_up(self, new_level: int, result: Dict):
        """Callback for level up events."""
        title = result.get('level_title', '')
        messagebox.showinfo(
            "🎉 Level Up!",
            f"Congratulations! You've reached Level {new_level}!\n\n"
            f"Title: {title}\n\n"
            f"Keep watching and organizing to level up even more!"
        )
    
    def on_achievement_unlocked(self, achievement: Dict):
        """Callback for achievement unlocks."""
        name = achievement.get('name', 'Achievement')
        description = achievement.get('description', '')
        rarity = achievement.get('rarity', 'common')
        
        messagebox.showinfo(
            "🏅 Achievement Unlocked!",
            f"{name}\n\n{description}\n\nRarity: {rarity.title()}"
        )
    
    def check_updates_manual(self):
        """Manually check for updates."""
        try:
            from core.updater import check_for_updates_with_ui
            check_for_updates_with_ui(self.root)
        except Exception as e:
            logger.error(f"Update check failed: {e}")
            messagebox.showerror("Error", f"Failed to check for updates:\n{e}")
    
    def __del__(self):
        """Cleanup on exit."""
        if self.database:
            self.database.close()
        if hasattr(self, 'gamification_db'):
            self.gamification_db.close()
