# 🌐 Library of Otaku - Web Platform Details

## Backend Architecture

### Technology Stack

**Backend Framework**: FastAPI
- Modern, fast Python web framework
- Automatic OpenAPI documentation
- Async/await support for high performance
- Type hints and validation built-in

**Database**: PostgreSQL 15
- Robust relational database
- JSONB support for flexible metadata
- UUID primary keys
- Full-text search capabilities

**Deployment**: Docker & Docker Compose
- Easy local development setup
- Production-ready containerization
- Database and backend in one stack

### Core Features

#### 1. User Management
- **Registration & Authentication**: Secure JWT-based auth
- **User Profiles**: Customizable profiles with avatars
- **Device Linking**: Multiple devices per account
- **Preferences**: User settings and preferences storage

#### 2. Watch History Sync
- **Offline-First Design**: Work offline, sync when connected
- **Conflict Resolution**: Smart merging of watch progress
  - Takes maximum position when conflicts occur
  - Preserves newest watch timestamps
  - Handles multiple devices gracefully
- **Checkpoint System**: Reliable sync with server sequence numbers
- **Device Tracking**: Track which device made each update

#### 3. Gamification Backend
- **XP Events**: Append-only event log for anti-cheat
- **Server-Side Validation**: All XP and achievements validated server-side
- **Achievement System**: Unlock tracking and verification
- **Leaderboards**: Global and friend-based rankings
- **Anti-Cheat**: Rate limiting and validation heuristics

#### 4. Sync Architecture

**How It Works**:
1. Desktop app works offline, logs operations locally
2. When online, sends operations to `/api/v1/sync/checkpoint`
3. Server validates and applies operations
4. Server returns new operations and updated sequence number
5. Desktop app applies server changes and updates sequence

**Key Benefits**:
- ✅ Works completely offline
- ✅ Reliable conflict resolution
- ✅ Idempotent operations
- ✅ Prevents data loss
- ✅ Anti-cheat protection

### Database Schema

**Core Tables**:
- `users` - User accounts and profiles
- `devices` - Device registration and sync state
- `watch_entries` - Watch history and progress
- `xp_events` - Gamification event log
- `achievements` - Achievement definitions
- `user_achievements` - Unlocked achievements

**Future Tables** (ready for expansion):
- `gacha_items` - Gacha item catalog
- `user_inventory` - User's gacha collection
- `series` - Series metadata
- `leaderboards` - Leaderboard entries
- `friends` - Friend relationships
- `clubs` - Club/guild data

### API Endpoints

**Authentication**:
- `POST /api/v1/auth/register` - Create new account
- `POST /api/v1/auth/login` - Get access token
- `POST /api/v1/auth/refresh` - Refresh token

**Sync**:
- `POST /api/v1/sync/checkpoint` - Sync operations
- `GET /api/v1/sync/status` - Get sync status

**Users**:
- `GET /api/v1/users/me` - Get current user
- `GET /api/v1/users/{username}/profile` - Get public profile
- `PUT /api/v1/users/me` - Update profile

**Watch History**:
- `GET /api/v1/watch/entries` - Get watch history
- `POST /api/v1/watch/entries` - Create/update entry

**Gamification**:
- `GET /api/v1/gamification/stats` - Get user stats
- `GET /api/v1/gamification/achievements` - Get achievements
- `GET /api/v1/gamification/leaderboard` - Get leaderboard

### Security Features

**Authentication**:
- JWT tokens with expiration
- Password hashing with bcrypt
- Device-based authentication
- Refresh token support

**Anti-Cheat**:
- Server-side XP validation
- Rate limiting on XP events
- Achievement unlock verification
- Suspicious activity detection

**Privacy**:
- All cloud features opt-in
- Local-only mode available
- Encrypted data transmission
- User data export/deletion

### Development Setup

**Quick Start**:
```bash
# Clone repository
git clone <repo-url>
cd library-of-otaku-backend

# Start with Docker
docker-compose up --build

# Access API docs
open http://localhost:8000/docs
```

**Local Development**:
- FastAPI auto-reloads on code changes
- PostgreSQL data persists in Docker volume
- Environment variables for configuration
- Hot-reload for rapid iteration

### Integration with Desktop App

**Sync Client** (to be implemented):
- Python module for desktop app
- Writes operations to local oplog
- Calls sync endpoint periodically
- Handles conflicts and merges
- Works seamlessly in background

**Features**:
- Automatic background sync
- Manual sync trigger
- Sync status indicator
- Conflict resolution UI
- Offline queue management

### Future Enhancements

**Planned Features**:
- WebSocket support for real-time updates
- GraphQL API option
- Rate limiting and DDoS protection
- Advanced analytics
- Admin dashboard
- API rate limiting tiers
- Webhook support for integrations

**Scalability**:
- Horizontal scaling ready
- Database connection pooling
- Caching layer (Redis)
- CDN for static assets
- Load balancing support

---

## Privacy & Security

### Data Handling
- **Local-First**: Desktop app works without internet
- **Opt-In Sync**: User chooses what to sync
- **Encryption**: All data encrypted in transit
- **Minimal Data**: Only necessary data sent to server

### User Control
- **Export Data**: Download all your data
- **Delete Account**: Complete data removal
- **Privacy Settings**: Control what's public
- **Device Management**: Revoke device access

### Compliance
- **GDPR Ready**: Data export and deletion
- **Privacy by Design**: Minimal data collection
- **Transparent**: Clear privacy policy
- **User Consent**: Explicit opt-in for features

---

## Status

**Current**: Backend scaffold complete and ready for integration
**Next Steps**: 
1. Wire authentication fully
2. Implement desktop sync client
3. Build web interface
4. Add social features
5. Deploy to production

**Timeline**: v2.0+ release (after desktop app v1.4.0)

---

*"Your anime journey, synced across all your devices!"* ✨

