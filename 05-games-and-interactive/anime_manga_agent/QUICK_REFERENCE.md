"""
OMNISCIENT AGENT - QUICK REFERENCE CARD
========================================

Essential Commands & Examples for All-Knowing Agent Functionality
"""

# ============================================================================
# QUICK START (3 LINES)
# ============================================================================

import asyncio
from core.agent import AnimeMangaAgent

async def quick_start():
    agent = AnimeMangaAgent()
    await agent.activate_omniscient_mode()  # Takes ~30 seconds
    print(agent.get_must_watch_list(limit=10))

asyncio.run(quick_start())


# ============================================================================
# CORE METHODS - OMNISCIENT MODE
# ============================================================================

## ACTIVATION & STATUS
agent.activate_omniscient_mode()          # Activate all-knowing entity
agent.get_omniscient_status()             # Check omniscience stats
agent.update_omniscient_knowledge()       # Periodic knowledge refresh


## MAIN FEATURES
agent.get_must_watch_list(limit=50)       # Get essential viewing list
agent.get_trending_now(limit=25)          # See what's hot
agent.get_hidden_gems(limit=30)           # Find underrated masterpieces
agent.get_genre_rankings(genre, limit=25) # Top content by genre
agent.search_omniscient_knowledge(query)  # Search comprehensive index
agent.get_new_releases_detected(days=7)   # Track new anime/manga
agent.get_content_metadata(content_id)    # View auto-generated metadata


# ============================================================================
# RESPONSE STRUCTURE
# ============================================================================

response.success           # Boolean: True if successful
response.message           # String: Human-readable message
response.data              # Dict: The actual data (lists, rankings, etc.)
response.error             # String: Error message if failed
response.to_dict()         # Convert to dictionary


# ============================================================================
# EXAMPLE: MUST-WATCH LIST
# ============================================================================

result = agent.get_must_watch_list(limit=10)
for item in result.data['must_watch_list']:
    print(f"#{item['rank']}: {item['title']}")
    print(f"   Score: {item['rating_score']}/10")
    print(f"   Reason: {item['rank_reason']}")


# ============================================================================
# EXAMPLE: TRENDING CONTENT
# ============================================================================

result = agent.get_trending_now(limit=5)
for item in result.data['trending']:
    print(f"{item['rank']}. {item['title']} - Trend Score: {item['rank_score']}")


# ============================================================================
# EXAMPLE: HIDDEN GEMS
# ============================================================================

result = agent.get_hidden_gems(limit=5)
for item in result.data['hidden_gems']:
    print(f"{item['rank']}. {item['title']}")
    print(f"   Rating: {item['rating_score']}/10 (underrated!)")


# ============================================================================
# EXAMPLE: GENRE RANKINGS
# ============================================================================

# Get top action anime
result = agent.get_genre_rankings("Action", limit=10)
key = [k for k in result.data.keys() if "rankings" in k][0]
for item in result.data[key]:
    print(f"{item['rank']}. {item['title']} - {item['rating_score']}/10")

# Available genres: Action, Romance, Comedy, Drama, Fantasy, Sci-Fi,
#                  Horror, Slice of Life, Mystery, Sports, Music, etc.


# ============================================================================
# EXAMPLE: SEARCH OMNISCIENT INDEX
# ============================================================================

# Natural language search across all 50k+ titles
results = agent.search_omniscient_knowledge("dark psychological anime")
for item in results.data['results'][:5]:
    print(f"- {item['title']} ({item['type']}) - Match: {item['score']}%")


# ============================================================================
# EXAMPLE: NEW RELEASES
# ============================================================================

result = agent.get_new_releases_detected(days=7)
print(f"Found {result.data['detected_count']} new releases")
for release in result.data['new_releases']:
    print(f"- {release['title']} ({release['release_season']})")


# ============================================================================
# EXAMPLE: PERIODIC UPDATES (ASYNC)
# ============================================================================

async def periodic_updates():
    agent = AnimeMangaAgent()
    await agent.activate_omniscient_mode()
    
    while True:
        update = await agent.update_omniscient_knowledge()
        print(f"New releases: {update.data['new_releases_detected']}")
        await asyncio.sleep(3600)  # Every hour


# ============================================================================
# EXAMPLE: COMBINED RECOMMENDATIONS
# ============================================================================

async def combined_recommendations():
    agent = AnimeMangaAgent()
    await agent.activate_omniscient_mode()
    
    # Get multiple recommendation types
    must_watch = agent.get_must_watch_list(limit=5)
    trending = agent.get_trending_now(limit=5)
    gems = agent.get_hidden_gems(limit=5)
    
    # Present all together
    print("🎯 Must Watch:", must_watch.data['must_watch_list'][0]['title'])
    print("🔥 Trending:", trending.data['trending'][0]['title'])
    print("💎 Hidden Gem:", gems.data['hidden_gems'][0]['title'])


# ============================================================================
# RANKING CATEGORIES
# ============================================================================

all_time_greatest     # Top 100 best of all time
must_watch            # Top 50 essential viewing
this_season           # Current seasonal highlights
trending_now          # Top 25 hot right now
hidden_gems           # Top 30 underrated masterpieces
underrated            # Good quality, low visibility
by_genre              # Rankings for each genre
by_platform           # Rankings by streaming source


# ============================================================================
# CONTENT STATUS CLASSIFICATION
# ============================================================================

NEWLY_INDEXED         # Just added, metadata being generated
INDEXED               # Standard indexed content
TRENDING              # Recent releases with high engagement
HIDDEN_GEM            # 7.5+ quality but low popularity
MUST_WATCH            # 8.0+ quality with good popularity


# ============================================================================
# SCORING SYSTEM (0-100)
# ============================================================================

discovery_score       # How discoverable/recommended it is
uniqueness_score      # How novel/unique it is
relevance_score       # How relevant for recommendations


# ============================================================================
# CONFIGURATION (config.json)
# ============================================================================

{
  "omniscience": {
    "check_interval_minutes": 60,              # How often to check new releases
    "max_indexed_items": 50000,                # Max items to index
    "enable_keyword_generation": true,         # Auto-generate keywords
    "enable_trend_tracking": true,             # Track trends
    "ranking_update_frequency_hours": 6,       # How often to update rankings
    "new_release_boost_multiplier": 2.0        # Boost for new content
  }
}


# ============================================================================
# RETURNED DATA STRUCTURE (Example: Must Watch)
# ============================================================================

{
  "success": true,
  "message": "🎯 Must Watch List - 50 essential anime/manga",
  "data": {
    "must_watch_list": [
      {
        "content_id": "1",
        "title": "Attack on Titan",
        "content_type": "anime",
        "rank": 1,
        "rank_score": 9.2,
        "category": "must_watch",
        "rank_reason": "Exceptional quality and high engagement",
        "rating_score": 8.9,
        "popularity_score": 95,
        "genres": ["Action", "Adventure"],
        "ranked_at": "2026-02-12T...",
        "expires_at": null
      },
      # ... more items
    ]
  }
}


# ============================================================================
# ERROR HANDLING
# ============================================================================

result = agent.get_must_watch_list()
if result.success:
    # Use result.data
    for item in result.data['must_watch_list']:
        print(item['title'])
else:
    # Handle error
    print(f"Error: {result.error}")
    print(f"Message: {result.message}")


# ============================================================================
# ASYNC OPERATIONS
# ============================================================================

# Async methods (must use await)
await agent.activate_omniscient_mode()
await agent.update_omniscient_knowledge()

# Run async in sync context
import asyncio
result = asyncio.run(agent.activate_omniscient_mode())


# ============================================================================
# USEFUL COMMANDS
# ============================================================================

# Check if omniscience is active
status = agent.get_omniscient_status()
print(status.data['is_omniscient'])  # True/False

# Get detailed stats
stats = status.data['index_stats']
print(f"Indexed: {stats['indexed_anime']} anime, {stats['indexed_manga']} manga")

# Get rankings summary
rankings = status.data['rankings_summary']
print(f"Must watch list: {rankings['must_watch']} items")


# ============================================================================
# INTEGRATION WITH EXISTING FEATURES
# ============================================================================

# Omniscience works alongside existing systems:
# - User authentication still works
# - Saved links compatible
# - Watch history compatible
# - Chat system compatible
# - All existing APIs unchanged

# Example: Get omniscient must-watch + save links
token = agent.login_user("user", "password").data['token']
must_watch = agent.get_must_watch_list(limit=5)
agent.save_streaming_links(token, must_watch.data['must_watch_list'][0]['title'])


# ============================================================================
# PERFORMANCE TIPS
# ============================================================================

# Call activate_omniscient_mode() once at startup
# Then reuse agent instance for all queries
agent = AnimeMangaAgent()
await agent.activate_omniscient_mode()

# Search is instant (O(1) for exact matches)
# Ranking lists are pre-computed and cached

# Limit results to reduce data transfer
agent.get_trending_now(limit=25)  # Better than limit=1000

# Cache responses if calling multiple times
cache = {}
if 'must_watch' not in cache:
    cache['must_watch'] = agent.get_must_watch_list()


# ============================================================================
# COMMON PATTERNS
# ============================================================================

# Pattern 1: Get recommendations by genre
def get_genre_recommendations(genre, limit=10):
    result = agent.get_genre_rankings(genre, limit)
    return result.data[f"{genre}_rankings"]

# Pattern 2: Search + get metadata
def find_and_describe(query):
    results = agent.search_omniscient_knowledge(query)
    for result in results.data['results'][:3]:
        metadata = agent.get_content_metadata(result['id'])
        print(f"{result['title']}: {metadata.data['metadata']['short_description']}")

# Pattern 3: Get all recommendations at once
def all_recommendations():
    return {
        'must_watch': agent.get_must_watch_list().data['must_watch_list'],
        'trending': agent.get_trending_now().data['trending'],
        'gems': agent.get_hidden_gems().data['hidden_gems']
    }


# ============================================================================
# TROUBLESHOOTING
# ============================================================================

# "Omniscient mode not activated"
# → Call: await agent.activate_omniscient_mode()

# "API returned no results"
# → Check: agent.get_omniscient_status()
# → Verify: Indexing completed successfully

# "Rankings are empty"
# → Wait for: await agent.update_omniscient_knowledge()
# → Or manually: agent.ranking_system.update_rankings(...)

# Memory issues with 50k items?
# → Reduce: max_indexed_items in config.json
# → Or: Use pagination with limit parameter


# ============================================================================
# FULL EXAMPLE: COMPLETE WORKFLOW
# ============================================================================

import asyncio
from core.agent import AnimeMangaAgent

async def omniscient_workflow():
    print("🌟 Omniscient Anime Agent Demo")
    print("="*50)
    
    # 1. Create agent
    agent = AnimeMangaAgent()
    
    # 2. Activate omniscience
    print("\n📚 Activating omniscient mode...")
    result = await agent.activate_omniscient_mode()
    if not result.success:
        print(f"Error: {result.error}")
        return
    
    print(f"✨ {result.message}")
    
    # 3. Get status
    print("\n📊 Omniscient Status:")
    status = agent.get_omniscient_status()
    stats = status.data['index_stats']
    print(f"   Anime: {stats['indexed_anime']}")
    print(f"   Manga: {stats['indexed_manga']}")
    
    # 4. Get recommendations
    print("\n🎯 Must Watch Recommendations:")
    must_watch = agent.get_must_watch_list(limit=3)
    for item in must_watch.data['must_watch_list']:
        print(f"   #{item['rank']}: {item['title']} ({item['rating_score']}/10)")
    
    print("\n🔥 Currently Trending:")
    trending = agent.get_trending_now(limit=3)
    for item in trending.data['trending']:
        print(f"   #{item['rank']}: {item['title']}")
    
    print("\n💎 Hidden Gems:")
    gems = agent.get_hidden_gems(limit=3)
    for item in gems.data['hidden_gems']:
        print(f"   #{item['rank']}: {item['title']}")
    
    print("\n" + "="*50)
    print("✅ Demo Complete!")

# Run the workflow
asyncio.run(omniscient_workflow())


# ============================================================================
# DOCUMENTATION LINKS
# ============================================================================

"""
For more information:
- OMNISCIENT_AGENT_GUIDE.md - Comprehensive guide
- examples_omniscient_agent.py - Runnable examples
- README.md - Quick overview
- OMNISCIENT_IMPLEMENTATION_SUMMARY.md - Technical details
- test_agent.py - Unit tests
"""
