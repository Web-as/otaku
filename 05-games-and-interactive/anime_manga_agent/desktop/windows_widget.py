"""
Windows Desktop Widget - Phone-Style Notification System
A floating phone-style widget that displays SMS-like notifications
based on user activity from the anime/manga agent.
"""

import tkinter as tk
from tkinter import ttk
import threading
import time
import random
import json
import os
from datetime import datetime
from typing import Optional, Callable
import queue

# Try to import Windows-specific modules
try:
    import win32gui
    import win32con
    import win32api
    HAS_WIN32 = True
except ImportError:
    HAS_WIN32 = False


class NotificationBubble:
    """Individual SMS-style notification bubble."""
    
    def __init__(self, parent: tk.Frame, message: str, msg_type: str = "normal"):
        self.frame = tk.Frame(parent, bg="#1b2838", padx=12, pady=10)
        self.frame.pack(fill=tk.X, pady=5, padx=10)
        
        # Color based on type
        colors = {
            "normal": "#1b2838",
            "important": "#e94560",
            "celebration": "#ffd700",
            "warning": "#ff6b6b"
        }
        bg_color = colors.get(msg_type, "#1b2838")
        text_color = "#1a1a2e" if msg_type == "celebration" else "#ffffff"
        
        self.frame.configure(bg=bg_color)
        
        # Message text
        self.label = tk.Label(
            self.frame,
            text=message,
            font=("Segoe UI", 10),
            fg=text_color,
            bg=bg_color,
            wraplength=250,
            justify=tk.LEFT
        )
        self.label.pack(anchor=tk.W)
        
        # Timestamp
        timestamp = datetime.now().strftime("%H:%M")
        self.time_label = tk.Label(
            self.frame,
            text=timestamp,
            font=("Segoe UI", 8),
            fg=text_color if msg_type == "celebration" else "#888888",
            bg=bg_color
        )
        self.time_label.pack(anchor=tk.E)
        
        # Animation
        self.frame.update()
        self._animate_in()
    
    def _animate_in(self):
        """Slide-in animation."""
        # Simple fade-in effect using alpha (if supported)
        pass
    
    def destroy(self):
        """Remove the notification."""
        self.frame.destroy()


class PhoneWidget:
    """Main phone-style widget window."""
    
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("Otaku Sensei")
        
        # Window configuration
        self.width = 350
        self.height = 500
        self.is_expanded = False
        self.is_dragging = False
        self.drag_start_x = 0
        self.drag_start_y = 0
        
        # Position in bottom-right corner
        screen_width = self.root.winfo_screenwidth()
        screen_height = self.root.winfo_screenheight()
        x = screen_width - self.width - 30
        y = screen_height - self.height - 80
        
        self.root.geometry(f"{self.width}x{self.height}+{x}+{y}")
        self.root.overrideredirect(True)  # Remove window decorations
        self.root.attributes("-topmost", True)  # Always on top
        self.root.attributes("-alpha", 0.95)  # Slight transparency
        
        # Make window draggable
        self.root.bind("<Button-1>", self._start_drag)
        self.root.bind("<B1-Motion>", self._on_drag)
        self.root.bind("<ButtonRelease-1>", self._stop_drag)
        
        # Notification queue
        self.notification_queue = queue.Queue()
        self.notifications = []
        self.max_notifications = 5
        
        # Activity responses
        self.activity_responses = {
            "add_watchlist": [
                "📝 Added to your watchlist! Great choice~",
                "👀 Ooh, adding that one! I approve!",
                "🎯 Another one for the list! Nice!",
                "✨ Added! I'll remind you when it airs!",
                "📚 Nice pick! That one's getting good reviews!"
            ],
            "complete_anime": [
                "🎉 CONGRATS! You finished it!",
                "✅ Another one completed! You're on fire! 🔥",
                "😱 Finished already?! Must've been good!",
                "🏆 Achievement unlocked: Anime completed!",
                "🎊 Done! Now you can avoid spoilers!"
            ],
            "rate_anime": [
                "🌟 Ooh, a rating! What did you think?",
                "⭐ Rating time! Did it live up to hype?",
                "🤔 Interesting rating! I have opinions...",
                "📊 Thanks for rating! Helps me recommend!",
                "✍️ Noted! Your taste is clearer now~"
            ],
            "browse_seasonal": [
                "📅 Checking this season? There's GEMS!",
                "🌸 Seasonal browsing! Want highlights?",
                "📺 Looking at what's airing? I have opinions!",
                "🔥 This season is STACKED!",
                "📊 Browsing seasonal chart? Need help?"
            ],
            "search_anime": [
                "🔍 Searching for something? I can help!",
                "👀 Looking for something specific?",
                "💡 Tip: Describe vibes like 'dark revenge saga'!",
                "🎯 Need help finding something?",
                "🔎 Tell me what mood you're in!"
            ],
            "idle": [
                "👋 Hey, you still there? Want a recommendation?",
                "😏 Getting bored? Let me tell you about my waifu...",
                "🤫 Psst... Want to hear a hot take?",
                "🎬 You know what you should watch?",
                "😈 Idle hands... Perfect for anime recommendations!",
                "🎌 Don't just sit there! Let's find your next obsession!",
                "📚 Fun fact: Oda has been drawing One Piece for 25+ years!",
                "🤔 My rival Satoshi would drop this conversation by now..."
            ],
            "new_episode": [
                "🆕 New episode alert! Check it out!",
                "📺 Fresh episode just dropped!",
                "🔔 Ding ding! New episode available!",
                "🎬 Your show just got a new episode!"
            ],
            "trending": [
                "🔥 Something's trending! Check it out!",
                "📈 This anime is blowing up right now!",
                "💫 Everyone's talking about this one!"
            ]
        }
        
        self._create_ui()
        self._start_notification_processor()
        self._start_idle_checker()
        
        # Initial greeting
        self.root.after(2000, lambda: self.add_notification(
            "👋 Hey! I'm your anime guide! I'll keep you updated~",
            "important"
        ))
    
    def _create_ui(self):
        """Create the phone-style UI."""
        # Main container with rounded corners effect
        self.main_frame = tk.Frame(self.root, bg="#0d1b2a")
        self.main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Phone notch (decorative)
        notch_frame = tk.Frame(self.main_frame, bg="#0d1b2a", height=25)
        notch_frame.pack(fill=tk.X)
        
        notch = tk.Frame(notch_frame, bg="#2a3f5f", width=80, height=5)
        notch.place(relx=0.5, rely=0.5, anchor=tk.CENTER)
        
        # Header
        header = tk.Frame(self.main_frame, bg="#e94560", height=60)
        header.pack(fill=tk.X)
        header.pack_propagate(False)
        
        # Avatar
        avatar_frame = tk.Frame(header, bg="#ffd700", width=40, height=40)
        avatar_frame.pack(side=tk.LEFT, padx=10, pady=10)
        avatar_frame.pack_propagate(False)
        
        avatar_label = tk.Label(avatar_frame, text="🎌", font=("Segoe UI Emoji", 16), bg="#ffd700")
        avatar_label.place(relx=0.5, rely=0.5, anchor=tk.CENTER)
        
        # Title
        title_frame = tk.Frame(header, bg="#e94560")
        title_frame.pack(side=tk.LEFT, fill=tk.Y, pady=10)
        
        title = tk.Label(title_frame, text="Otaku Sensei", font=("Segoe UI", 12, "bold"), fg="white", bg="#e94560")
        title.pack(anchor=tk.W)
        
        subtitle = tk.Label(title_frame, text="Your Anime Guide • Online", font=("Segoe UI", 8), fg="#ffcccc", bg="#e94560")
        subtitle.pack(anchor=tk.W)
        
        # Close button
        close_btn = tk.Button(
            header,
            text="✕",
            font=("Segoe UI", 12),
            fg="white",
            bg="#e94560",
            activebackground="#ff6b6b",
            activeforeground="white",
            bd=0,
            cursor="hand2",
            command=self._minimize
        )
        close_btn.pack(side=tk.RIGHT, padx=10)
        
        # Notifications area
        self.notif_canvas = tk.Canvas(self.main_frame, bg="#0d1b2a", highlightthickness=0)
        self.notif_canvas.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        self.notif_frame = tk.Frame(self.notif_canvas, bg="#0d1b2a")
        self.notif_canvas.create_window((0, 0), window=self.notif_frame, anchor=tk.NW)
        
        # Scrollbar
        scrollbar = ttk.Scrollbar(self.notif_canvas, orient=tk.VERTICAL, command=self.notif_canvas.yview)
        self.notif_canvas.configure(yscrollcommand=scrollbar.set)
        
        self.notif_frame.bind("<Configure>", lambda e: self.notif_canvas.configure(scrollregion=self.notif_canvas.bbox("all")))
        
        # Quick actions
        actions_frame = tk.Frame(self.main_frame, bg="#1b2838", height=50)
        actions_frame.pack(fill=tk.X)
        actions_frame.pack_propagate(False)
        
        actions = [
            ("🎬", "Recommend", lambda: self.add_notification("🎬 Try Vinland Saga! Epic action & deep characters!", "normal")),
            ("🔥", "Trending", lambda: self.add_notification("🔥 Frieren is DOMINATING this season!", "important")),
            ("📚", "Watchlist", lambda: self.add_notification("📚 You have 12 anime queued up!", "normal")),
            ("💬", "Hot Take", lambda: self.add_notification("🔥 HOT TAKE: DBZ is overrated! Come at me! 💪", "important"))
        ]
        
        for emoji, text, cmd in actions:
            btn = tk.Button(
                actions_frame,
                text=f"{emoji}",
                font=("Segoe UI Emoji", 14),
                fg="white",
                bg="#2a3f5f",
                activebackground="#e94560",
                activeforeground="white",
                bd=0,
                cursor="hand2",
                command=cmd
            )
            btn.pack(side=tk.LEFT, expand=True, fill=tk.BOTH, padx=2, pady=5)
        
        # Status bar
        status_frame = tk.Frame(self.main_frame, bg="#0d1b2a", height=30)
        status_frame.pack(fill=tk.X)
        
        self.status_label = tk.Label(
            status_frame,
            text="🟢 Watching your activity...",
            font=("Segoe UI", 8),
            fg="#888888",
            bg="#0d1b2a"
        )
        self.status_label.pack(pady=5)
    
    def _start_drag(self, event):
        """Start dragging the window."""
        self.is_dragging = True
        self.drag_start_x = event.x
        self.drag_start_y = event.y
    
    def _on_drag(self, event):
        """Handle window dragging."""
        if self.is_dragging:
            x = self.root.winfo_x() + event.x - self.drag_start_x
            y = self.root.winfo_y() + event.y - self.drag_start_y
            self.root.geometry(f"+{x}+{y}")
    
    def _stop_drag(self, event):
        """Stop dragging the window."""
        self.is_dragging = False
    
    def _minimize(self):
        """Minimize to system tray or hide."""
        self.root.withdraw()
        # Show again after 5 seconds (for demo)
        self.root.after(5000, self.root.deiconify)
    
    def add_notification(self, message: str, msg_type: str = "normal"):
        """Add a notification to the queue."""
        self.notification_queue.put((message, msg_type))
    
    def _process_notification(self, message: str, msg_type: str):
        """Process and display a notification."""
        # Remove old notifications if at max
        while len(self.notifications) >= self.max_notifications:
            old = self.notifications.pop(0)
            old.destroy()
        
        # Add new notification
        notif = NotificationBubble(self.notif_frame, message, msg_type)
        self.notifications.append(notif)
        
        # Scroll to bottom
        self.notif_canvas.update_idletasks()
        self.notif_canvas.yview_moveto(1.0)
        
        # Auto-remove after 30 seconds
        self.root.after(30000, lambda: self._remove_notification(notif))
    
    def _remove_notification(self, notif: NotificationBubble):
        """Remove a notification."""
        if notif in self.notifications:
            self.notifications.remove(notif)
            notif.destroy()
    
    def _start_notification_processor(self):
        """Start the notification processing thread."""
        def process():
            while True:
                try:
                    message, msg_type = self.notification_queue.get(timeout=0.1)
                    self.root.after(0, lambda m=message, t=msg_type: self._process_notification(m, t))
                except queue.Empty:
                    pass
        
        thread = threading.Thread(target=process, daemon=True)
        thread.start()
    
    def _start_idle_checker(self):
        """Check for idle state and send random messages."""
        def check_idle():
            # Random engagement every 2-5 minutes
            delay = random.randint(120000, 300000)
            
            if random.random() < 0.3:  # 30% chance
                responses = self.activity_responses["idle"]
                message = random.choice(responses)
                self.add_notification(message, "normal")
            
            self.root.after(delay, check_idle)
        
        # Start after 1 minute
        self.root.after(60000, check_idle)
    
    def simulate_activity(self, activity_type: str):
        """Simulate user activity and show appropriate notification."""
        if activity_type in self.activity_responses:
            responses = self.activity_responses[activity_type]
            message = random.choice(responses)
            
            msg_type = "normal"
            if activity_type == "complete_anime":
                msg_type = "celebration"
            elif activity_type in ["idle", "new_episode"]:
                msg_type = "important"
            
            self.add_notification(message, msg_type)
    
    def run(self):
        """Start the widget."""
        self.root.mainloop()


class BubbleWidget:
    """Minimized bubble version of the widget."""
    
    def __init__(self, on_click: Optional[Callable] = None):
        self.root = tk.Tk()
        self.root.title("")
        
        # Small circular window
        self.size = 60
        
        # Position in bottom-right corner
        screen_width = self.root.winfo_screenwidth()
        screen_height = self.root.winfo_screenheight()
        x = screen_width - self.size - 30
        y = screen_height - self.size - 80
        
        self.root.geometry(f"{self.size}x{self.size}+{x}+{y}")
        self.root.overrideredirect(True)
        self.root.attributes("-topmost", True)
        self.root.attributes("-transparentcolor", "gray")
        
        # Make draggable
        self.is_dragging = False
        self.drag_start_x = 0
        self.drag_start_y = 0
        
        self.on_click = on_click
        self.notification_count = 0
        
        self._create_ui()
    
    def _create_ui(self):
        """Create the bubble UI."""
        # Main canvas for circular shape
        self.canvas = tk.Canvas(
            self.root,
            width=self.size,
            height=self.size,
            bg="gray",
            highlightthickness=0
        )
        self.canvas.pack()
        
        # Draw bubble
        self.bubble = self.canvas.create_oval(
            5, 5, self.size - 5, self.size - 5,
            fill="#e94560",
            outline="#ff6b6b",
            width=2
        )
        
        # Emoji
        self.emoji = self.canvas.create_text(
            self.size // 2,
            self.size // 2,
            text="🎌",
            font=("Segoe UI Emoji", 20)
        )
        
        # Notification badge
        self.badge = self.canvas.create_oval(
            self.size - 25, 0, self.size - 5, 20,
            fill="#ffd700",
            outline="",
            state=tk.HIDDEN
        )
        self.badge_text = self.canvas.create_text(
            self.size - 15, 10,
            text="0",
            font=("Segoe UI", 8, "bold"),
            fill="#1a1a2e",
            state=tk.HIDDEN
        )
        
        # Bindings
        self.canvas.bind("<Button-1>", self._on_click)
        self.canvas.bind("<B1-Motion>", self._on_drag)
        self.canvas.bind("<ButtonRelease-1>", self._stop_drag)
        self.canvas.bind("<Enter>", self._on_hover)
        self.canvas.bind("<Leave>", self._on_leave)
        
        # Pulse animation
        self._pulse()
    
    def _on_click(self, event):
        """Handle click on bubble."""
        if not self.is_dragging and self.on_click:
            self.on_click()
    
    def _on_drag(self, event):
        """Handle dragging."""
        if not self.is_dragging:
            self.is_dragging = True
            self.drag_start_x = event.x
            self.drag_start_y = event.y
        else:
            x = self.root.winfo_x() + event.x - self.drag_start_x
            y = self.root.winfo_y() + event.y - self.drag_start_y
            self.root.geometry(f"+{x}+{y}")
    
    def _stop_drag(self, event):
        """Stop dragging."""
        self.root.after(100, lambda: setattr(self, 'is_dragging', False))
    
    def _on_hover(self, event):
        """Handle hover."""
        self.canvas.itemconfig(self.bubble, fill="#ff6b6b")
    
    def _on_leave(self, event):
        """Handle leave."""
        self.canvas.itemconfig(self.bubble, fill="#e94560")
    
    def _pulse(self):
        """Pulse animation."""
        def grow():
            self.canvas.scale(self.bubble, self.size // 2, self.size // 2, 1.05, 1.05)
            self.root.after(500, shrink)
        
        def shrink():
            self.canvas.scale(self.bubble, self.size // 2, self.size // 2, 0.95, 0.95)
            self.root.after(500, grow)
        
        grow()
    
    def set_notification_count(self, count: int):
        """Update notification badge."""
        self.notification_count = count
        if count > 0:
            self.canvas.itemconfig(self.badge, state=tk.NORMAL)
            self.canvas.itemconfig(self.badge_text, state=tk.NORMAL, text=str(min(count, 9)) + ("+" if count > 9 else ""))
        else:
            self.canvas.itemconfig(self.badge, state=tk.HIDDEN)
            self.canvas.itemconfig(self.badge_text, state=tk.HIDDEN)
    
    def run(self):
        """Start the bubble."""
        self.root.mainloop()


class DesktopNotificationManager:
    """Manages desktop notifications and widget state."""
    
    def __init__(self):
        self.phone_widget: Optional[PhoneWidget] = None
        self.bubble_widget: Optional[BubbleWidget] = None
        self.is_phone_visible = True
        
    def start(self):
        """Start the notification system."""
        self.phone_widget = PhoneWidget()
        self.phone_widget.run()
    
    def start_bubble_mode(self):
        """Start in bubble mode."""
        def on_bubble_click():
            if self.bubble_widget:
                self.bubble_widget.root.destroy()
            self.start()
        
        self.bubble_widget = BubbleWidget(on_click=on_bubble_click)
        self.bubble_widget.run()
    
    def notify(self, message: str, msg_type: str = "normal"):
        """Send a notification."""
        if self.phone_widget:
            self.phone_widget.add_notification(message, msg_type)
        elif self.bubble_widget:
            self.bubble_widget.set_notification_count(
                self.bubble_widget.notification_count + 1
            )
    
    def simulate_activity(self, activity_type: str):
        """Simulate user activity."""
        if self.phone_widget:
            self.phone_widget.simulate_activity(activity_type)


def main():
    """Main entry point."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Anime/Manga Agent Desktop Widget")
    parser.add_argument("--bubble", action="store_true", help="Start in bubble mode")
    parser.add_argument("--demo", action="store_true", help="Run demo with simulated activities")
    args = parser.parse_args()
    
    manager = DesktopNotificationManager()
    
    if args.bubble:
        manager.start_bubble_mode()
    elif args.demo:
        # Demo mode with simulated activities
        widget = PhoneWidget()
        
        # Simulate various activities
        def demo_activities():
            activities = [
                ("add_watchlist", 5000),
                ("browse_seasonal", 10000),
                ("rate_anime", 15000),
                ("complete_anime", 20000),
                ("search_anime", 25000),
                ("trending", 30000),
                ("new_episode", 35000),
            ]
            
            for activity, delay in activities:
                widget.root.after(delay, lambda a=activity: widget.simulate_activity(a))
        
        demo_activities()
        widget.run()
    else:
        manager.start()


if __name__ == "__main__":
    main()
