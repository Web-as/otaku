"""Core modules for AnimeMangaAgent"""
from .agent import AnimeMangaAgent
from .auth import UserAuthenticator, DataIsolationManager
from .database import DatabaseManager, UserPreference, SavedLink
from .recommendation import TimeAwareRecommender, SimilarContentFinder
from .web_scraper import JikanAPIClient, AniListAPIClient
from .knowledge import AnimeMangaKnowledge, create_knowledge_base
from .api_clients import AnimeAPIManager, JikanClient, AniListClient, AniChartClient, create_api_manager, create_anichart_client
from .streaming_apis import (
    StreamingManager,
    ConsumetAPI,
    KitsuAPI,
    MangaDexAPI,
    OfficialStreamingLinks,
    create_streaming_manager
)

__all__ = [
    "AnimeMangaAgent",
    "UserAuthenticator",
    "DataIsolationManager",
    "DatabaseManager",
    "UserPreference",
    "SavedLink",
    "TimeAwareRecommender",
    "SimilarContentFinder",
    "JikanAPIClient",
    "AniListAPIClient",
    "AnimeMangaKnowledge",
    "create_knowledge_base",
    "AnimeAPIManager",
    "JikanClient",
    "AniListClient",
    "AniChartClient",
    "create_api_manager",
    "create_anichart_client",
    "StreamingManager",
    "ConsumetAPI",
    "KitsuAPI",
    "MangaDexAPI",
    "OfficialStreamingLinks",
    "create_streaming_manager"
]
