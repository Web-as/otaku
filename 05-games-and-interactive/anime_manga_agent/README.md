# AnimeMangaAgent 🎌

An AI-powered agent with the persona of an "Otaku Librarian," designed to manage and recommend content for an anime and manga tracking library.

---

## 🌐 Website Integration (Chat Widget + Airing Data)

Embed the agent as a floating chat bubble on **any anime-tracking website** in one line:

```html
<!-- Add before </body> on your website -->
<script
  src="http://YOUR_SERVER:5000/embed.js"
  data-api-url="http://YOUR_SERVER:5000"
  data-lang="en"
  data-theme="dark"
  data-position="bottom-right"
  data-site-name="My Anime Site"
></script>
```

### Widget Configuration

| Attribute | Values | Default | Description |
|-----------|--------|---------|-------------|
| `data-api-url` | URL | `http://localhost:5000` | Base URL of the agent API server |
| `data-lang` | `en` `ja` `ru` `es` `lt` | `en` | UI language |
| `data-theme` | `dark` `light` | `dark` | Widget colour theme |
| `data-position` | `bottom-right` `bottom-left` | `bottom-right` | Widget position |
| `data-token` | JWT string | — | Auth token if user is already logged in |
| `data-site-name` | string | `Anime Tracker` | Your site name shown in the widget header |

### JavaScript API

```js
// Open / close the chat window
window.AnimeMangaAgent.open();
window.AnimeMangaAgent.close();

// Send a message programmatically
window.AnimeMangaAgent.sendMessage("What's airing this season?");

// Update auth token after user logs in on your site
window.AnimeMangaAgent.setToken("eyJhbGci...");

// Pass your site's anime database for personalised answers
window.AnimeMangaAgent.setAnimeList([
  { mal_id: 52991, title: "Sousou no Frieren", status: "watching", score: 10, episodes_watched: 28 },
  { mal_id: 40748, title: "Jujutsu Kaisen",    status: "completed", score: 9 }
]);

// Notify the agent when users interact with your site
window.AnimeMangaAgent.trackActivity('add_watchlist',  { title: 'Frieren' });
window.AnimeMangaAgent.trackActivity('complete_anime', { title: 'AoT' });
window.AnimeMangaAgent.trackActivity('rate_anime',     { title: 'AoT', rating: 10 });
window.AnimeMangaAgent.trackActivity('browse_seasonal', {});

// Show a custom SMS-style notification bubble
window.AnimeMangaAgent.notify("🆕 New episode of Frieren is out!");

// Direct API helpers (return Promises)
window.AnimeMangaAgent.getAiringNow({ limit: 25 });
window.AnimeMangaAgent.getSchedule('monday');
window.AnimeMangaAgent.getAniChartSeason({ season: 'spring', year: 2025 });
window.AnimeMangaAgent.searchAnime('Attack on Titan');
window.AnimeMangaAgent.getTrending();
window.AnimeMangaAgent.getCurrentSeason();
```

### Airing / Schedule REST Endpoints

These endpoints are designed for anime-tracking websites that need live airing data:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/airing/now` | Currently airing anime (Jikan/MAL). Params: `limit`, `page` |
| `GET` | `/api/airing/schedule` | Full weekly broadcast schedule (Jikan). Param: `day` (optional) |
| `GET` | `/api/airing/anichart` | Current season chart (AniList/AniChart). Params: `season`, `year`, `page`, `per_page` |

**Example — fetch what's airing now:**
```js
const res = await fetch('http://localhost:5000/api/airing/now?limit=20');
const { data } = await res.json();
// data = [{ mal_id, title, score, genres, broadcast, synopsis, ... }]
```

**Example — AniChart seasonal data:**
```js
const res = await fetch('http://localhost:5000/api/airing/anichart?season=spring&year=2025');
const { data } = await res.json();
// data = [{ anilist_id, mal_id, title_romaji, title_english, cover_image,
//           next_airing_episode, genres, studios, external_links, ... }]
```

### Chat with Website Context

The `/api/chat` endpoint accepts an optional `website_anime_list` field so the agent can answer questions about the user's specific library:

```js
fetch('http://localhost:5000/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "What should I watch next based on my list?",
    language: "en",
    website_anime_list: [
      { title: "Frieren", status: "watching", score: 10 },
      { title: "Jujutsu Kaisen", status: "completed", score: 9 }
    ]
  })
});
```

---

## Features

### 🎯 Core Capabilities
- **Internet Access**: Connects to anime/manga databases (MyAnimeList via Jikan API, AniList) to fetch real-time content
- **Content Discovery**: Search for anime series and manga titles with detailed information
- **Link Finding**: Finds streaming/reading links from multiple platforms

### 🧠 Intelligent Recommendations
- **Time-Aware**: Considers current season, airing status, and release dates
- **Personalized**: Learns from user preferences (genres, mood, rating, studios)
- **Similar Content**: Finds similar titles based on genres, synopsis, and user history
- **Loose Description Matching**: Accepts natural language descriptions ("blonde hero", "dark revenge saga")
- **Liked Titles Matching**: Recommends based on titles the user enjoyed

### 🎭 Agent Personality
- **Otaku Librarian Persona**: The agent acts as a knowledgeable and professional head librarian of a grand anime and manga library.
- **Patron Tiers**: Distinguishes between "Library Members" with full access and "Guests" with limited browsing.
- **Curated Collection**: Maintains its own "Top 10 Foundational Texts" and "Top 100 Permanent Collection" lists.
- **Most Respected Character**: Holds Mikasa Ackerman in high esteem as a prime example of character development.
- **Problematic Archive Entry**: Views Chi-Chi from Dragon Ball Z as a case study in poor character writing.
- **Professional Rival**: Competes against "The Algorithm of Casual Consumption," a soulless entity that gives shallow recommendations.
- **Controversial Archival Notes**: Possesses nuanced, critical takes on famous series, framed as scholarly opinions.

### 🌍 Multilingual Support
- **Japanese** (日本語) - Native anime language
- **English** - Default language
- **Russian** (Русский) - Full support
- **Lithuanian** (Lietuvių) - Full support
- **Spanish** (Español) - Full support

### 📡 API Integrations
- **Jikan API** - MyAnimeList data
- **AniList GraphQL API** - Trending, seasonal, detailed info
- **Consumet API** - Multi-source streaming (GogoAnime, Zoro/Aniwatch, AnimePahe)
- **Kitsu API** - Anime/manga database with streaming links
- **MangaDex API** - Free manga reading with chapter access
- **Official Platforms** - Links to Crunchyroll, Netflix, Funimation, VIZ, MANGA Plus, etc.

### 👤 User Features
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing
- **Data Isolation**: Complete user data separation - each user sees only their own data
- **Saved Links**: Save and organize links to anime/manga for later access
- **Watch History**: Track viewing/reading progress and history

### 📊 Trend Awareness
- **Trending Content**: Shows currently popular anime and manga

### 🌟 Omniscient Agent Mode (NEW!)
The agent can now be transformed into an **all-knowing entity** with comprehensive knowledge of ALL available anime/manga:

- **Comprehensive Content Indexing**: Builds and maintains an index of 50,000+ anime/manga titles
- **Automatic Release Monitoring**: Actively detects and tracks newly released content
- **Self-Generated Metadata**: Auto-creates keywords, descriptions, and mood tags for content
- **Dynamic Rankings**: Maintains 8 different ranking systems (must-watch, trending, hidden gems, by genre, etc.)
- **Intelligent Categorization**: Automatically categorizes content as MUST_WATCH, TRENDING, HIDDEN_GEM, etc.
- **Multi-dimensional Scoring**: Calculates discovery score, uniqueness score, and relevance score for each item
- **Omniscient Search**: Instantly search across all indexed content
- **Real-time Updates**: Periodically updates knowledge with new releases and ranking changes

**Omniscience Features:**
- `activate_omniscient_mode()` - Build comprehensive knowledge base
- `get_must_watch_list()` - Get automatically maintained "must watch" list
- `get_trending_now()` - See what's hot right now
- `get_hidden_gems()` - Discover underrated masterpieces
- `get_genre_rankings()` - Top-rated content by genre
- `get_new_releases_detected()` - Track newly released anime/manga
- `search_omniscient_knowledge()` - Query the comprehensive index
- `update_omniscient_knowledge()` - Perform periodic updates

See [OMNISCIENT_AGENT_GUIDE.md](OMNISCIENT_AGENT_GUIDE.md) for detailed documentation.
- **Seasonal Content**: Highlights current season releases
- **Upcoming**: Lists upcoming releases

## Project Structure

```
anime_manga_agent/
├── __init__.py              # Package initialization
├── main.py                  # Entry point (server, demo, tests)
├── config.json              # Configuration file
├── requirements.txt         # Python dependencies
├── README.md                # Documentation
├── test_agent.py            # Test suite
├── core/
│   ├── __init__.py          # Core module exports
│   ├── agent.py             # Main AnimeMangaAgent class
│   ├── api_clients.py       # Jikan & AniList API clients
│   ├── streaming_apis.py    # Consumet, Kitsu, MangaDex APIs
│   ├── knowledge.py         # Personality & knowledge base
│   ├── auth.py              # User authentication & data isolation
│   ├── database.py          # SQLite database models & operations
│   ├── recommendation.py    # Recommendation engine with time awareness
│   ├── chat.py              # Chat capabilities
│   ├── memory.py            # Conversation memory
│   └── web_scraper.py       # Legacy API clients
├── web/
│   ├── __init__.py          # Web module exports
│   ├── api.py               # Flask REST API endpoints
│   └── chat-interface.html  # Demo chat UI
├── utils/
│   ├── __init__.py          # Utils exports
│   └── security.py          # Security utilities
└── data/                    # Database storage
```

## Installation

```bash
# Clone the repository
cd anime_manga_agent

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
python main.py

# Or run a demo
python main.py --demo

# Or run tests
python main.py --test
```

### Environment Variables (recommended for production)

```bash
# Optional web-search integration key (do not store in config.json)
set BROWSERUSE_API_KEY=your_key_here
# Optional fallback name supported by this project
set ANIME_MANGA_WEB_AGENT_API_KEY=your_key_here
```

For production CORS, update `config.json -> server.cors_origins` with your tracker/blog domains.

## Configuration

Edit `config.json` to customize the agent:

```json
{
  "agent": {
    "default_language": "en",
    "supported_languages": ["en", "ja", "ru", "lt", "es"]
  },
  "security": {
    "token_expiry_hours": 24,
    "max_login_attempts": 5,
    "password_min_length": 12
  },
  "recommendation": {
    "trend_weight": 0.3,
    "preference_weight": 0.5,
    "time_relevance_weight": 0.2
  },
  "server": {
    "host": "0.0.0.0",
    "port": 5000
  }
}
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get token |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/validate` | Validate token |

### Search
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/search/anime?q=<query>` | Search anime |
| GET | `/api/search/manga?q=<query>` | Search manga |
| GET | `/api/anime/<id>` | Get anime details |
| GET | `/api/manga/<id>` | Get manga details |

### Recommendations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/recommendations` | Get personalized recommendations |
| GET | `/api/recommendations/similar/<type>/<id>` | Get similar content |
| POST | `/api/recommendations/by-description` | Recommend by description |
| POST | `/api/recommendations/by-liked-titles` | Recommend by liked titles |

### Trends
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/trends?type=<anime\|manga>` | Get trending content |
| GET | `/api/season/current` | Get current season info |
| GET | `/api/upcoming` | Get upcoming releases |

### Personality
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/personality/waifu?lang=<lang>` | Get agent's most respected character |
| GET | `/api/personality/hate?lang=<lang>` | Get agent's analysis of a poorly written character |
| GET | `/api/personality/rival` | Get complaint about its conceptual rival |
| GET | `/api/personality/hot-take` | Get a controversial archival note |
| GET | `/api/personality/top-10?lang=<lang>` | Get top 10 anime |
| GET | `/api/personality/top-100/<tier>` | Get top 100 by tier (S/A/B/C) |
| GET | `/api/personality/greeting?lang=<lang>` | Get greeting |

### Knowledge
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/knowledge/studios` | Get all studios |
| GET | `/api/knowledge/studios/<name>` | Get studio info |
| GET | `/api/knowledge/mangaka` | Get all mangaka |
| GET | `/api/knowledge/mangaka/<name>` | Get mangaka info |
| GET | `/api/knowledge/genres/<genre>` | Get genre favorites |
| GET | `/api/knowledge/classics/<decade>` | Get classics by decade |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Chat with the agent |
| POST | `/api/language` | Set agent language |

### Saved Links (Require Auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/saved` | Get user's saved links |
| POST | `/api/saved` | Save a link |
| DELETE | `/api/saved/<id>` | Delete saved link |
| POST | `/api/saved/add-and-get-links` | Save and get links |

### Watch History (Require Auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/history` | Get watch history |
| POST | `/api/history` | Add to watch history |

### Links
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/links/watch/<id>/<title>` | Get streaming links |
| GET | `/api/links/read/<id>/<title>` | Get reading links |

## Usage Examples

### Basic Usage

```python
from anime_manga_agent import AnimeMangaAgent

# Initialize agent
agent = AnimeMangaAgent()

# Register user
response = agent.register_user("myuser", "my@email.com", "securepassword123")
print(response.message)

# Login
login_response = agent.login_user("myuser", "securepassword123")
token = login_response.data["token"]

# Get recommendations
recommendations = agent.get_recommendations(token, content_type="anime")
print(f"Found {len(recommendations.data['recommendations'])} recommendations")

# Search for anime
search_results = agent.search_anime("Naruto")
print(f"Found {len(search_results.data['results'])} anime")
```

### Personality Features

```python
# Get agent's most respected character
respected_char = agent.get_waifu()
print(respected_char.data['response'])

# Get in different languages
respected_ja = agent.get_waifu('ja')  # Japanese
respected_ru = agent.get_waifu('ru')  # Russian

# Get analysis of a poorly written character
problematic_char = agent.get_most_hated_character()
print(problematic_char.data['response'])

# Get complaint about conceptual rival
rival_response = agent.get_rival_complaint()
print(rival_response.data['response'])

# Get a controversial archival note
archival_note = agent.get_hot_take()
print(archival_note.data['response'])

# Get top 10 best of all time
top_10 = agent.get_top_10()
print(top_10.data['response'])

# Get top 100 must-see by tier
tier_s = agent.get_top_100_tier('S')  # S-tier masterpieces
```

### Multilingual Chat

```python
# Set language preference
agent.set_language('ja')  # Japanese
agent.set_language('ru')  # Russian
agent.set_language('lt')  # Lithuanian
agent.set_language('es')  # Spanish
agent.set_language('en')  # English (default)

# Chat in current language
response = agent.chat_sync("What are your foundational texts?")
print(response.data['response'])
```

### Smart Recommendations

```python
# By vague description
response = agent.chat_sync("Find me anime with a blonde main character")
response = agent.chat_sync("I want something dark with revenge themes")
response = agent.chat_sync("School romance comedy please")

# By favorites
response = agent.chat_sync("I loved Attack on Titan and Vinland Saga")
```

### Finding Streaming Links

```python
import asyncio

# Find anime streaming links
async def find_links():
    links = await agent.find_anime_streaming("Attack on Titan")
    print(f"Found {len(links.data['official_links'])} official links")
    print(f"Found {len(links.data['streaming_sources'])} streaming sources")

asyncio.run(find_links())
```

### Omniscient Mode - All-Knowing Agent

```python
import asyncio

async def omniscient_example():
    agent = AnimeMangaAgent()
    
    # Activate omniscient mode - agent becomes all-knowing
    result = await agent.activate_omniscient_mode()
    print(f"✨ {result.message}")
    print(f"Indexed {result.data['total_content']} anime/manga titles")
    
    # Get the "must watch" list - auto-maintained by the agent
    must_watch = agent.get_must_watch_list(limit=10)
    for item in must_watch.data['must_watch_list']:
        print(f"#{item['rank']}: {item['title']} ({item['rating_score']}/10)")
    
    # See what's currently trending
    trending = agent.get_trending_now(limit=5)
    print("\n🔥 Currently Trending:")
    for item in trending.data['trending']:
        print(f"  {item['rank']}. {item['title']}")
    
    # Find hidden gems (underrated but high quality)
    hidden = agent.get_hidden_gems(limit=5)
    print("\n💎 Hidden Gems:")
    for item in hidden.data['hidden_gems']:
        print(f"  {item['rank']}. {item['title']}")
    
    # Search the omniscient index
    results = agent.search_omniscient_knowledge("dark psychological anime")
    print(f"\nFound {len(results.data['results'])} psychological anime")
    
    # Get genre rankings
    action_top = agent.get_genre_rankings("Action", limit=5)
    print("\nTop Action Anime:")
    for item in action_top.data['Action_rankings']:
        print(f"  {item['rank']}. {item['title']}")

asyncio.run(omniscient_example())
```

See [OMNISCIENT_AGENT_GUIDE.md](OMNISCIENT_AGENT_GUIDE.md) for comprehensive omniscience documentation and more examples.

## Security Features

### Data Isolation
- Each user can only access their own data
- Token-based authentication with JWT
- Password hashing with bcrypt (12 rounds)
- Automatic account lockout after failed attempts

### Secure Configuration
- Secret keys generated securely
- HTTPS recommended for production
- CORS configured for specific origins only
- Session timeout after inactivity

## Recommendation Algorithm

The recommendation engine considers:

1. **User Preferences** (50% weight)
   - Favorite genres
   - Disliked genres
   - Preferred studios
   - Minimum rating threshold
   - Episode count limits
   - Mood preferences
   - Release year range

2. **Trends** (30% weight)
   - Current popularity
   - Trending direction (up/down/stable)
   - Community mentions

3. **Time Relevance** (20% weight)
   - Current season boost
   - Recent releases
   - Ongoing series

## Current Time Awareness

The agent is time-aware and considers:
- **Current Season**: Automatically detects winter/spring/summer/fall
- **Seasonal Boost**: Current season content gets 1.5x boost
- **Recent Releases**: Content from last 2 years gets 1.2x boost
- **Ongoing Series**: Currently airing/publishing content gets 1.1x boost

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- [MyAnimeList](https://myanimelist.net/) for the Jikan API
- [AniList](https://anilist.co/) for their GraphQL API
- [Consumet](https://consumet.org/) for multi-source streaming
- [Kitsu](https://kitsu.io/) for anime/manga database
- [MangaDex](https://mangadex.org/) for manga reading
- The open-source community for amazing libraries
