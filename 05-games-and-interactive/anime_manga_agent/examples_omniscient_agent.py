"""
OMNISCIENT AGENT EXAMPLES
=========================

Practical examples demonstrating the omniscient agent's all-knowing capabilities
to find, rank, and recommend anime/manga from comprehensive indexed knowledge.

Run with: python examples_omniscient_agent.py
"""

import asyncio
from datetime import datetime
from core.agent import AnimeMangaAgent


async def example1_activate_omniscience():
    """
    EXAMPLE 1: Activate Omniscient Mode
    
    The agent becomes an all-knowing entity with comprehensive knowledge
    of all available anime/manga content.
    """
    print("\n" + "="*70)
    print("EXAMPLE 1: ACTIVATE OMNISCIENT MODE")
    print("="*70)
    
    agent = AnimeMangaAgent()
    
    print("\n🌟 Initializing omniscient knowledge...")
    print("   This builds a comprehensive index of ALL anime/manga...")
    
    result = await agent.activate_omniscient_mode()
    
    if result.success:
        stats = result.data
        print(f"\n✨ {result.message}")
        print(f"\n📊 OMNISCIENCE ACHIEVED:")
        print(f"   • Total anime indexed: {stats['index']['anime_indexed']}")
        print(f"   • Total manga indexed: {stats['index']['manga_indexed']}")
        print(f"   • Total content: {stats['index']['total_content']}")
        print(f"   • New releases detected: {stats['new_releases']}")
        print(f"   • Metadata generated: {stats['metadata_generated']}")
        print(f"   • Rankings updated: {len(stats['rankings_updated'])} categories")
    else:
        print(f"\n❌ Error: {result.error}")


async def example2_omniscience_status():
    """
    EXAMPLE 2: Check Omniscience Status
    
    Get detailed information about what the agent knows and has indexed.
    """
    print("\n" + "="*70)
    print("EXAMPLE 2: OMNISCIENCE STATUS")
    print("="*70)
    
    agent = AnimeMangaAgent()
    
    # First activate omniscience
    await agent.activate_omniscient_mode()
    
    # Get status
    status = agent.get_omniscient_status()
    
    if status.success:
        print(f"\n🧠 {status.message}")
        
        stats = status.data['index_stats']
        print(f"\n📚 INDEXED CONTENT:")
        print(f"   • Anime: {stats['indexed_anime']}")
        print(f"   • Manga: {stats['indexed_manga']}")
        print(f"   • Genres tracked: {stats['genres_indexed']}")
        print(f"   • Themes tracked: {stats['themes_indexed']}")
        
        rankings = status.data['rankings_summary']
        print(f"\n🏆 ACTIVE RANKING LISTS:")
        print(f"   • Must Watch: {rankings['must_watch']} items")
        print(f"   • This Season: {rankings['this_season']} items")
        print(f"   • Trending Now: {rankings['trending_now']} items")
        print(f"   • Hidden Gems: {rankings['hidden_gems']} items")


async def example3_must_watch_list():
    """
    EXAMPLE 3: Get "Must Watch" Recommendations
    
    The agent maintains an automatically-updated list of essential anime/manga
    that everyone should experience based on quality scores and ratings.
    """
    print("\n" + "="*70)
    print("EXAMPLE 3: MUST WATCH LIST")
    print("="*70)
    
    agent = AnimeMangaAgent()
    await agent.activate_omniscient_mode()
    
    result = agent.get_must_watch_list(limit=10)
    
    if result.success:
        print(f"\n🎯 {result.message}\n")
        
        for item in result.data['must_watch_list']:
            print(f"   #{item['rank']}: {item['title']}")
            if item['content_type']:
                print(f"      Type: {item['content_type']}")
            if item.get('rating_score'):
                print(f"      Rating: {item['rating_score']}/10")
            if item['rank_reason']:
                print(f"      Reason: {item['rank_reason']}")
            print()


async def example4_trending_content():
    """
    EXAMPLE 4: Get Currently Trending Content
    
    See what's hot right now based on recent releases,
    high engagement, and rising popularity.
    """
    print("\n" + "="*70)
    print("EXAMPLE 4: CURRENTLY TRENDING")
    print("="*70)
    
    agent = AnimeMangaAgent()
    await agent.activate_omniscient_mode()
    
    result = agent.get_trending_now(limit=8)
    
    if result.success:
        print(f"\n🔥 {result.message}\n")
        
        for item in result.data['trending']:
            print(f"   #{item['rank']}: {item['title']}")
            if item.get('ranking_score'):
                print(f"      Trend Score: {item['ranking_score']:.2f}")
            print()


async def example5_hidden_gems():
    """
    EXAMPLE 5: Discover Hidden Gems
    
    Find underrated masterpieces with high quality but low visibility.
    These are "diamonds in the rough" waiting to be discovered.
    """
    print("\n" + "="*70)
    print("EXAMPLE 5: HIDDEN GEMS DISCOVERY")
    print("="*70)
    
    agent = AnimeMangaAgent()
    await agent.activate_omniscient_mode()
    
    result = agent.get_hidden_gems(limit=8)
    
    if result.success:
        print(f"\n💎 {result.message}\n")
        
        for item in result.data['hidden_gems']:
            print(f"   #{item['rank']}: {item['title']}")
            if item.get('rating_score'):
                print(f"      Rating: {item['rating_score']}/10 (Underrated!)")
            if item.get('uniqueness_factor'):
                print(f"      Uniqueness: {item['uniqueness_factor']:.1f}%")
            print()


async def example6_genre_rankings():
    """
    EXAMPLE 6: Genre-Based Rankings
    
    Get ranked lists for specific genres, from the agent's omniscient knowledge.
    """
    print("\n" + "="*70)
    print("EXAMPLE 6: GENRE RANKINGS")
    print("="*70)
    
    agent = AnimeMangaAgent()
    await agent.activate_omniscient_mode()
    
    genres = ["Action", "Romance", "Comedy"]
    
    for genre in genres:
        result = agent.get_genre_rankings(genre, limit=5)
        
        if result.success:
            print(f"\n🎬 Top {genre} Anime/Manga:")
            
            ranking_key = f"{genre}_rankings"
            if ranking_key in result.data:
                for item in result.data[ranking_key]:
                    print(f"   #{item['rank']}: {item['title']} ({item['rating_score']}/10)")
        print()


async def example7_search_omniscient_knowledge():
    """
    EXAMPLE 7: Search Omniscient Knowledge
    
    Query the agent's comprehensive index using natural language.
    The agent instantly knows about matching content.
    """
    print("\n" + "="*70)
    print("EXAMPLE 7: SEARCH OMNISCIENT KNOWLEDGE")
    print("="*70)
    
    agent = AnimeMangaAgent()
    await agent.activate_omniscient_mode()
    
    queries = [
        "dark psychological anime",
        "romantic comedy manga",
        "action adventure"
    ]
    
    for query in queries:
        result = agent.search_omniscient_knowledge(query)
        
        if result.success:
            print(f"\n🔍 Search: '{query}'")
            print(f"   Found {len(result.data['results'])} matches:")
            
            for item in result.data['results'][:3]:
                print(f"      • {item['title']} ({item['type']}) - Match: {item['score']:.1f}%")
        print()


async def example8_monitor_new_releases():
    """
    EXAMPLE 8: Monitor New Releases
    
    The agent actively monitors for new anime/manga releases
    and automatically adds them to rankings.
    """
    print("\n" + "="*70)
    print("EXAMPLE 8: NEW RELEASES MONITORING")
    print("="*70)
    
    agent = AnimeMangaAgent()
    await agent.activate_omniscient_mode()
    
    # Get releases from last 7 days
    result = agent.get_new_releases_detected(days=7)
    
    if result.success:
        print(f"\n🆕 {result.message}")
        print(f"   Detected: {result.data['detected_count']} new releases in last 7 days\n")
        
        releases = result.data['new_releases']
        
        if releases:
            print("   Recent additions:")
            for release in releases[:5]:
                print(f"      • {release['title']} ({release['content_type']})")
                if release.get('release_season'):
                    print(f"        Season: {release['release_season']}")
                if release.get('genres'):
                    print(f"        Genres: {', '.join(release['genres'][:3])}")


async def example9_periodic_updates():
    """
    EXAMPLE 9: Periodic Omniscience Updates
    
    The agent periodically updates its omniscient knowledge
    to detect new releases and update rankings.
    """
    print("\n" + "="*70)
    print("EXAMPLE 9: PERIODIC OMNISCIENCE UPDATES")
    print("="*70)
    
    agent = AnimeMangaAgent()
    
    print("\n🌟 Initializing omniscient mode...")
    await agent.activate_omniscient_mode()
    
    print("📅 Starting periodic updates (simulating 3 updates)...\n")
    
    for i in range(3):
        print(f"   Update {i+1}/3:")
        
        update = await agent.update_omniscient_knowledge()
        
        if update.success:
            print(f"      ✓ New releases detected: {update.data['new_releases_detected']}")
            print(f"      ✓ Metadata generated: {update.data['metadata_generated']}")
            print(f"      ✓ Rankings updated: {len(update.data['rankings_updated'])} categories")
        
        # In real scenario, wait 60 minutes between updates
        # await asyncio.sleep(3600)
        print()


async def example10_combined_recommendations():
    """
    EXAMPLE 10: Combined Multi-Source Recommendations
    
    Use multiple omniscient features together for comprehensive recommendations.
    """
    print("\n" + "="*70)
    print("EXAMPLE 10: COMBINED RECOMMENDATIONS")
    print("="*70)
    
    agent = AnimeMangaAgent()
    await agent.activate_omniscient_mode()
    
    print("\n📊 Generating comprehensive recommendations...\n")
    
    # Get action anime
    action = agent.get_genre_rankings("Action", 5)
    if action.success:
        key = [k for k in action.data.keys() if "rankings" in k][0]
        print("   🎬 Top Action Anime:")
        for item in action.data[key][:3]:
            print(f"      • {item['title']}")
    
    # Get trending
    trending = agent.get_trending_now(3)
    if trending.success:
        print("\n   🔥 Currently Trending:")
        for item in trending.data['trending'][:3]:
            print(f"      • {item['title']}")
    
    # Get hidden gems
    gems = agent.get_hidden_gems(3)
    if gems.success:
        print("\n   💎 Hidden Gems to Discover:")
        for item in gems.data['hidden_gems'][:3]:
            print(f"      • {item['title']}")
    
    print("\n   → Recommendation complete!")


async def main():
    """Run all examples"""
    print("\n" + "="*70)
    print("OMNISCIENT AGENT - COMPREHENSIVE EXAMPLES")
    print("="*70)
    print("Demonstrating the agent's all-knowing capabilities for discovering,")
    print("ranking, and recommending anime/manga from a complete indexed database.")
    
    try:
        # Note: Some examples are commented out to avoid making too many API calls
        # Uncomment the ones you want to run
        
        await example1_activate_omniscience()
        
        # More examples after activation
        await example2_omniscience_status()
        await example3_must_watch_list()
        await example4_trending_content()
        await example5_hidden_gems()
        # await example6_genre_rankings()  # Uncomment to see genre rankings
        # await example7_search_omniscient_knowledge()  # Uncomment to search
        # await example8_monitor_new_releases()  # Uncomment to see new releases
        # await example9_periodic_updates()  # Uncomment to see periodic updates
        await example10_combined_recommendations()
        
        print("\n" + "="*70)
        print("✨ All examples completed!")
        print("="*70 + "\n")
        
    except Exception as e:
        print(f"\n❌ Error running examples: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())
