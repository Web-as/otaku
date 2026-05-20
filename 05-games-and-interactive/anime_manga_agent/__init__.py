"""
AnimeMangaAgent - AI-powered anime and manga recommendation system
==================================================================

A comprehensive agent for anime and manga discovery with:
- Personalized recommendations based on user preferences
- Time-aware suggestions (current season, trending)
- Multilingual support (Japanese, English, Russian, Lithuanian, Spanish)
- Unique personality with favorites, waifu, rival, and hot takes
- Multiple API integrations for streaming/reading links
- Secure user authentication and data isolation

Usage:
    from anime_manga_agent import AnimeMangaAgent
    
    agent = AnimeMangaAgent()
    
    # Get recommendations
    response = agent.get_recommendations(token, "anime")
    
    # Chat with personality
    response = agent.chat_sync("Find me anime with a blonde hero")
    
    # Get agent's waifu
    waifu = agent.get_waifu()
"""

__version__ = "1.0.0"
__author__ = "AnimeMangaAgent Team"

# Main agent class
from .core.agent import AnimeMangaAgent, AgentResponse

# API creation
from .web.api import create_api

# Core components (for advanced usage)
from .core import (
    AnimeMangaKnowledge,
    create_knowledge_base,
    AnimeAPIManager,
    create_api_manager,
    StreamingManager,
    create_streaming_manager,
    UserAuthenticator,
    DataIsolationManager,
    DatabaseManager,
    TimeAwareRecommender,
)

__all__ = [
    # Main exports
    "AnimeMangaAgent",
    "AgentResponse",
    "create_api",
    
    # Knowledge & Personality
    "AnimeMangaKnowledge",
    "create_knowledge_base",
    
    # API Managers
    "AnimeAPIManager",
    "create_api_manager",
    "StreamingManager",
    "create_streaming_manager",
    
    # Core components
    "UserAuthenticator",
    "DataIsolationManager",
    "DatabaseManager",
    "TimeAwareRecommender",
    
    # Version info
    "__version__",
    "__author__",
]
