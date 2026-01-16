# Otaku Gildija Unified

A comprehensive anime library management and community platform.

## Project Structure

```
otaku-gildija-unified/
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # UI components
│   │   │   ├── library/    # Library management (from otaku-gildija-website)
│   │   │   ├── features/   # Core features (AI, sync, catalog)
│   │   │   ├── community/  # Guild & community features
│   │   │   ├── landing/    # Marketing & landing pages
│   │   │   └── auth/       # Authentication components
│   │   ├── services/       # API integrations (Firebase, AI, i18n)
│   │   ├── types/          # TypeScript type definitions
│   │   ├── data/           # Mock data & constants
│   │   └── utils/          # Helper functions
│   └── ...config files
│
├── backend/                # FastAPI backend (from otaku-gildija-mvp)
│   ├── api/v1/            # REST API endpoints
│   ├── core/              # Database, auth, schemas
│   ├── services/          # Business logic
│   └── config/            # Settings
│
└── docs/                   # Documentation
```

## Features

### Frontend
- **Library Management**: Organize, filter, sort anime collections
- **Freemium Model**: Free chaotic view → Premium organized view
- **AI Assistant**: Gemini-powered chat assistant
- **Community Hub**: Guild features, quest board, gacha system
- **Creative Studio**: Theme customization tools
- **Device Sync**: Cross-platform synchronization
- **Multi-language**: LT/EN support via i18n

### Backend (FastAPI)
- **Authentication**: JWT-based auth with bcrypt
- **Anime CRUD**: Full anime/episode management
- **File Scanner**: Scan directories for video files
- **File Organizer**: Automatically organize anime files
- **SQLite Database**: Easy setup, production-ready

## Getting Started

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on http://localhost:3000

### Backend
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn main:app --reload
```
Backend runs on http://localhost:8000
API docs at http://localhost:8000/docs

## Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Firebase
- Google Gemini AI

### Backend
- Python 3.11+
- FastAPI
- SQLAlchemy
- JWT Authentication
- Pydantic

## Original Projects

This unified app merges:
- `otaku-gildija-lt` - Modern SPA with overlay architecture
- `otaku-gildija-website` - Mature library management UI
- `otaku-gildija-mvp` - Full-stack backend API
