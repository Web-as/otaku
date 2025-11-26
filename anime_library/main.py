#!/usr/bin/env python3
"""
Anime Library - Main Entry Point
Unified anime viewing library with file organization and video playback.
"""

import sys
import logging
from pathlib import Path

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('anime_library.log'),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)


def main():
    """Main entry point."""
    try:
        # Import and start GUI
        from main_window import AnimeLibraryWindow
        import tkinter as tk
        
        logger.info("Starting Anime Library...")
        
        # Check for updates on startup (if enabled)
        try:
            from core.updater import check_for_updates_with_ui, load_update_config
            update_config = load_update_config()
            
            if update_config.get('update_check_on_startup', True):
                logger.info("Checking for updates...")
                # Check silently first, will show dialog if update available
                check_for_updates_with_ui()
        except Exception as e:
            logger.warning(f"Update check failed: {e}")
            # Continue with app launch even if update check fails
        
        # Create root window
        root = tk.Tk()
        
        # Create and start application
        app = AnimeLibraryWindow(root)
        
        # Start the GUI event loop
        root.mainloop()
        
        logger.info("Application closed.")
        
    except ImportError as e:
        # Show error in a message box if possible
        try:
            import tkinter as tk
            from tkinter import messagebox
            root_temp = tk.Tk()
            root_temp.withdraw()
            messagebox.showerror(
                "Import Error",
                f"Failed to import required modules:\n{str(e)}\n\n"
                f"Please ensure all dependencies are installed:\n"
                f"pip install -r requirements.txt"
            )
            root_temp.destroy()
        except:
            print(f"ERROR: Failed to import GUI: {e}")
            print("Please ensure all dependencies are installed:")
            print("pip install -r requirements.txt")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Fatal error: {e}", exc_info=True)
        # Try to show error in GUI
        try:
            import tkinter as tk
            from tkinter import messagebox
            root_temp = tk.Tk()
            root_temp.withdraw()
            messagebox.showerror(
                "Error",
                f"An error occurred:\n{str(e)}\n\n"
                f"Check anime_library.log for details."
            )
            root_temp.destroy()
        except:
            print(f"Fatal error: {e}")
            print("Check anime_library.log for details.")
        sys.exit(1)


if __name__ == "__main__":
    main()

