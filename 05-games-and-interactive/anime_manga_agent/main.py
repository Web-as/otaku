"""
Main Entry Point for Anime/Manga Agent
======================================

Run this file to start the agent and API server.

Usage:
    python main.py              # Start the API server
    python main.py --demo       # Run a demo of agent features
    python main.py --test       # Run tests
"""

import json
import sys
import os
import argparse
import asyncio

# Load .env before anything else so env vars are available to all modules
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # dotenv not installed; rely on system env vars

# Fix Unicode output on Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from core.web_agent import WebAgent


def load_config():
    """Load configuration from config.json"""
    config_path = os.path.join(os.path.dirname(__file__), "config.json")
    try:
        with open(config_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}


def run_demo():
    """Run a demo of the agent's features"""
    from core.agent import AnimeMangaAgent
    
    print("\n" + "="*60)
    print("🎌 AnimeMangaAgent Demo")
    print("="*60 + "\n")
    
    # Initialize agent
    print("Initializing agent...")
    agent = AnimeMangaAgent()
    config = load_config()
    web_agent = WebAgent(config)
    
    # Demo: Agent personality
    print("\n--- Agent Personality ---\n")
    
    # Waifu
    print("🎀 Agent's Waifu:")
    waifu = agent.get_waifu()
    print(waifu.data['response'][:200] + "...\n")
    
    # Most hated character
    print("😤 Most Hated Character:")
    hate = agent.get_most_hated_character()
    print(hate.data['response'][:200] + "...\n")
    
    # Rival complaint
    print("🎭 Rival Complaint:")
    rival = agent.get_rival_complaint()
    print(rival.data['response'][:200] + "...\n")
    
    # Hot take
    print("🔥 Hot Take:")
    hot_take = agent.get_hot_take()
    print(hot_take.data['response'] + "\n")
    
    # Top 10
    print("🏆 Top 10 Best of All Time:")
    top_10 = agent.get_top_10()
    for anime in top_10.data['top_10'][:5]:
        print(f"  {anime['rank']}. {anime['title']} - {anime['note']}")
    print("  ...\n")
    
    # Demo: Multilingual
    print("\n--- Multilingual Support ---\n")
    
    for lang in ['en', 'ja', 'ru', 'es']:
        greeting = agent.get_agent_greeting(lang)
        print(f"  [{lang}] {greeting.data['greeting'][:50]}...")
    
    # Demo: Knowledge
    print("\n\n--- Knowledge Base ---\n")
    
    # Studios
    print("🎬 Studios:")
    studios = agent.get_studio_info()
    print(f"  Known studios: {', '.join(studios.data['studios'][:5])}...\n")
    
    # Mangaka
    print("✏️ Mangaka:")
    mangaka = agent.get_mangaka_info()
    print(f"  Known mangaka: {', '.join(mangaka.data['mangaka'][:5])}...\n")
    
    # Genre favorites
    print("📚 Genre Favorites:")
    for genre in ['shonen', 'seinen', 'romance']:
        favs = agent.get_genre_favorites(genre)
        print(f"  {genre}: {', '.join(favs.data['favorites'][:3])}...")
    
    # Demo: Web Agent
    print("\n--- Web Agent ---\n")
    search_results = web_agent.search_web("latest anime news")
    print(f"Search results: {json.dumps(search_results, indent=2)}")

    print("\n" + "="*60)
    print("Demo complete! Start the server with: python main.py")
    print("="*60 + "\n")


def run_server():
    """Run the API server"""
    config = load_config()
    
    # Import agent components
    from core.agent import AnimeMangaAgent
    from web.api import create_api
    
    # Initialize the agent
    print("Initializing AnimeMangaAgent...")
    agent = AnimeMangaAgent()
    
    # Create API
    api_config = config.get("server", {})
    api = create_api(agent, {
        "cors_origins": api_config.get("cors_origins", ["http://localhost:3000"])
    })
    
    # Run the API server
    host = api_config.get("host", "0.0.0.0")
    port = api_config.get("port", 5000)
    debug = api_config.get("debug", False)
    
    print(f"\n🎌 AnimeMangaAgent API Server")
    print(f"{'='*40}")
    print(f"Server running at: http://{host}:{port}")
    print(f"Health check: http://{host}:{port}/api/health")
    print(f"\n📡 API Endpoints:")
    print(f"  Authentication:")
    print(f"    POST /api/auth/register - Register new user")
    print(f"    POST /api/auth/login - Login user")
    print(f"  Search:")
    print(f"    GET  /api/search/anime - Search anime")
    print(f"    GET  /api/search/manga - Search manga")
    print(f"  Recommendations:")
    print(f"    GET  /api/recommendations - Get personalized recommendations")
    print(f"    POST /api/recommendations/by-description - By description")
    print(f"  Trends:")
    print(f"    GET  /api/trends - Get trending content")
    print(f"    GET  /api/season/current - Current season info")
    print(f"  Saved Links:")
    print(f"    GET  /api/saved - Get saved links")
    print(f"    POST /api/saved - Save a link")
    print(f"  Personality:")
    print(f"    GET  /api/personality/waifu - Agent's waifu")
    print(f"    GET  /api/personality/rival - Rival complaint")
    print(f"    GET  /api/personality/hot-take - Random hot take")
    print(f"    GET  /api/personality/top-10 - Top 10 best anime")
    print(f"\nPress Ctrl+C to stop the server\n")
    
    try:
        api.run(host=host, port=port, debug=debug)
    except KeyboardInterrupt:
        print("\nShutting down server...")
        sys.exit(0)


def run_tests():
    """Run the test suite"""
    import subprocess
    result = subprocess.run([sys.executable, "test_agent.py"], cwd=os.path.dirname(__file__))
    sys.exit(result.returncode)


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description="AnimeMangaAgent - AI-powered anime/manga recommendation system")
    parser.add_argument("--demo", action="store_true", help="Run a demo of agent features")
    parser.add_argument("--test", action="store_true", help="Run the test suite")
    parser.add_argument("--search", type=str, help="Run the web agent with a search query")
    
    args = parser.parse_args()
    
    if args.demo:
        run_demo()
    elif args.test:
        run_tests()
    elif args.search:
        config = load_config()
        web_agent = WebAgent(config)
        search_results = web_agent.search_web(args.search)
        print(json.dumps(search_results, indent=2))
    else:
        run_server()


if __name__ == "__main__":
    main()
