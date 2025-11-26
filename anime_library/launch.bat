@echo off
REM Anime Library - Launch Script

echo ========================================
echo Anime Library - Launching...
echo ========================================
echo.

REM Get the directory where this script is located
set SCRIPT_DIR=%~dp0

REM Change to script directory
cd /d "%SCRIPT_DIR%"

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://www.python.org/
    pause
    exit /b 1
)

REM Check if virtual environment exists
if exist ".venv\Scripts\activate.bat" (
    echo Activating virtual environment...
    call .venv\Scripts\activate.bat
    echo.
)

REM Run the application
python main.py
if errorlevel 1 (
    echo.
    echo ERROR: Application exited with an error
    echo.
    echo Common issues:
    echo - Missing dependencies: pip install -r requirements.txt
    echo - VLC not installed: Download from https://www.videolan.org/vlc/
    echo - Check error messages above
    pause
    exit /b 1
)

pause

