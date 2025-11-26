#!/usr/bin/env python3
"""
Anime Otaku Theme - Tokyo Night inspired color scheme for Tkinter.
Adapted from Kivy video player app.
"""

import tkinter as tk
from tkinter import ttk


class TokyoNightTheme:
    """Tokyo Night theme colors and styling."""
    
    # Convert RGBA (0-1) to RGB hex for Tkinter
    BG_DARK = '#1a1a26'        # Deep purple-black (0.1, 0.1, 0.15)
    BG_CARD = '#262638'        # Card background (0.15, 0.15, 0.22)
    BG_CARD_HOVER = '#2d2d45'  # Hover state (0.18, 0.18, 0.28)
    ACCENT_PURPLE = '#b380ff'  # Soft purple (0.7, 0.5, 1)
    ACCENT_PINK = '#ff66b3'    # Sakura pink (1, 0.4, 0.7)
    ACCENT_CYAN = '#66ccff'    # Cyan blue (0.4, 0.8, 1)
    ACCENT_GREEN = '#80e6b3'   # Mint green (0.5, 0.9, 0.7)
    TEXT_PRIMARY = '#ffffff'   # White
    TEXT_SECONDARY = '#b3b3cc' # Light gray (0.7, 0.7, 0.8)
    TEXT_ACCENT = '#e699ff'    # Purple text (0.9, 0.6, 1)
    BORDER = '#3d3d5c'         # Border color
    
    @staticmethod
    def apply_theme(root: tk.Tk):
        """
        Apply Tokyo Night theme to Tkinter root window.
        
        Args:
            root: Tkinter root window
        """
        style = ttk.Style()
        
        # Use 'clam' theme as base (better customization support)
        style.theme_use('clam')
        
        # Configure root window background
        root.configure(bg=TokyoNightTheme.BG_DARK)
        
        # Frame styles
        style.configure('TFrame', 
                       background=TokyoNightTheme.BG_DARK,
                       borderwidth=0)
        
        style.configure('Card.TFrame',
                       background=TokyoNightTheme.BG_CARD,
                       relief='flat',
                       borderwidth=1)
        
        # Label styles
        style.configure('TLabel',
                       background=TokyoNightTheme.BG_DARK,
                       foreground=TokyoNightTheme.TEXT_PRIMARY,
                       font=('Segoe UI', 10))
        
        style.configure('Title.TLabel',
                       background=TokyoNightTheme.BG_DARK,
                       foreground=TokyoNightTheme.ACCENT_PURPLE,
                       font=('Segoe UI', 18, 'bold'))
        
        style.configure('Subtitle.TLabel',
                       background=TokyoNightTheme.BG_DARK,
                       foreground=TokyoNightTheme.TEXT_SECONDARY,
                       font=('Segoe UI', 9))
        
        style.configure('Accent.TLabel',
                       background=TokyoNightTheme.BG_DARK,
                       foreground=TokyoNightTheme.ACCENT_CYAN,
                       font=('Segoe UI', 10, 'bold'))
        
        # Button styles
        style.configure('TButton',
                       background=TokyoNightTheme.BG_CARD,
                       foreground=TokyoNightTheme.TEXT_PRIMARY,
                       borderwidth=0,
                       relief='flat',
                       padding=10,
                       font=('Segoe UI', 10))
        
        style.map('TButton',
                 background=[('active', TokyoNightTheme.BG_CARD_HOVER),
                            ('pressed', TokyoNightTheme.ACCENT_PURPLE)])
        
        # Accent button styles
        style.configure('Purple.TButton',
                       background=TokyoNightTheme.ACCENT_PURPLE,
                       foreground=TokyoNightTheme.TEXT_PRIMARY,
                       borderwidth=0,
                       relief='flat',
                       padding=12,
                       font=('Segoe UI', 11, 'bold'))
        
        style.map('Purple.TButton',
                 background=[('active', '#c299ff'),
                            ('pressed', '#9933ff')])
        
        style.configure('Cyan.TButton',
                       background=TokyoNightTheme.ACCENT_CYAN,
                       foreground=TokyoNightTheme.BG_DARK,
                       borderwidth=0,
                       relief='flat',
                       padding=12,
                       font=('Segoe UI', 11, 'bold'))
        
        style.map('Cyan.TButton',
                 background=[('active', '#80d9ff'),
                            ('pressed', '#33b3ff')])
        
        style.configure('Pink.TButton',
                       background=TokyoNightTheme.ACCENT_PINK,
                       foreground=TokyoNightTheme.TEXT_PRIMARY,
                       borderwidth=0,
                       relief='flat',
                       padding=12,
                       font=('Segoe UI', 11, 'bold'))
        
        style.map('Pink.TButton',
                 background=[('active', '#ff80cc'),
                            ('pressed', '#ff3399')])
        
        # Entry styles
        style.configure('TEntry',
                       fieldbackground=TokyoNightTheme.BG_CARD,
                       foreground=TokyoNightTheme.TEXT_PRIMARY,
                       borderwidth=1,
                       relief='flat',
                       padding=8,
                       insertcolor=TokyoNightTheme.ACCENT_CYAN)
        
        style.map('TEntry',
                 fieldbackground=[('focus', TokyoNightTheme.BG_CARD_HOVER)],
                 bordercolor=[('focus', TokyoNightTheme.ACCENT_PURPLE)])
        
        # Notebook (tabs) styles
        style.configure('TNotebook',
                       background=TokyoNightTheme.BG_DARK,
                       borderwidth=0)
        
        style.configure('TNotebook.Tab',
                       background=TokyoNightTheme.BG_CARD,
                       foreground=TokyoNightTheme.TEXT_SECONDARY,
                       padding=[20, 10],
                       borderwidth=0)
        
        style.map('TNotebook.Tab',
                 background=[('selected', TokyoNightTheme.ACCENT_PURPLE)],
                 foreground=[('selected', TokyoNightTheme.TEXT_PRIMARY)])
        
        # Scrollbar styles
        style.configure('TScrollbar',
                       background=TokyoNightTheme.BG_CARD,
                       troughcolor=TokyoNightTheme.BG_DARK,
                       borderwidth=0,
                       arrowcolor=TokyoNightTheme.TEXT_SECONDARY,
                       darkcolor=TokyoNightTheme.BG_CARD,
                       lightcolor=TokyoNightTheme.BG_CARD)
        
        style.map('TScrollbar',
                 background=[('active', TokyoNightTheme.ACCENT_PURPLE)])

