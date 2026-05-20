"""
Test Suite for AnimeMangaAgent
Tests core functionality including authentication, recommendations, and data isolation
"""
import json
import sys
import os
import tempfile
import unittest
from datetime import datetime


# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


class TestAuthentication(unittest.TestCase):
    """Test user authentication and data isolation"""
    
    @classmethod
    def setUpClass(cls):
        """Set up test environment"""
        from core.auth import UserAuthenticator, DataIsolationManager, UserRole
        
        cls.authenticator = UserAuthenticator(
            secret_key="test_secret_key_1234567890123456",
            config={
                "token_expiry_hours": 24,
                "max_login_attempts": 5,
                "lockout_duration_minutes": 30,
                "password_min_length": 12
            }
        )
        
        cls.data_isolation = DataIsolationManager(cls.authenticator)
        cls.users_db = {}
    
    def test_password_hashing(self):
        """Test secure password hashing"""
        password = "TestPassword123!"
        hashed = self.authenticator.hash_password(password)
        
        self.assertNotEqual(password, hashed)
        self.assertTrue(self.authenticator.verify_password(password, hashed))
        self.assertFalse(self.authenticator.verify_password("WrongPassword", hashed))
    
    def test_password_minimum_length(self):
        """Test password minimum length enforcement"""
        with self.assertRaises(ValueError):
            self.authenticator.hash_password("short")
    
    def test_user_creation(self):
        """Test user creation"""
        user = self.authenticator.create_user(
            username="testuser",
            email="test@example.com",
            password="SecurePassword123!",
            role=UserRole.USER
        )
        
        self.assertIsNotNone(user.id)
        self.assertEqual(user.username, "testuser")
        self.assertEqual(user.role, UserRole.USER)
        self.assertIsNotNone(user.password_hash)
        
        # Store for later tests
        self.users_db[user.username] = user
    
    def test_token_generation(self):
        """Test JWT token generation"""
        user = self.authenticator.create_user(
            username="tokentest",
            email="token@example.com",
            password="SecurePassword123!"
        )
        
        token = self.authenticator.generate_token(user)
        self.assertIsNotNone(token)
        self.assertIsInstance(token, str)
        
        # Decode and verify
        payload = self.authenticator.decode_token(token)
        self.assertIsNotNone(payload)
        self.assertEqual(payload["username"], "tokentest")
        self.assertEqual(payload["user_id"], user.id)
    
    def test_invalid_token(self):
        """Test handling of invalid tokens"""
        payload = self.authenticator.decode_token("invalid_token")
        self.assertIsNone(payload)
    
    def test_user_login(self):
        """Test user login process"""
        username = "logintest"
        password = "LoginPassword123!"
        
        # Create user
        user = self.authenticator.create_user(username, "login@example.com", password)
        self.users_db[username] = user
        
        # Successful login
        auth_user, token = self.authenticator.authenticate_user(username, password, self.users_db)
        self.assertIsNotNone(auth_user)
        self.assertIsNotNone(token)
        
        # Failed login
        wrong_user, wrong_token = self.authenticator.authenticate_user(username, "wrongpassword", self.users_db)
        self.assertIsNone(wrong_user)
        self.assertIsNone(wrong_token)
    
    def test_data_isolation(self):
        """Test user data isolation"""
        # Create two users
        user1 = self.authenticator.create_user("user1", "user1@example.com", "Password123!")
        user2 = self.authenticator.create_user("user2", "user2@example.com", "Password123!")
        
        self.users_db[user1.username] = user1
        self.users_db[user2.username] = user2
        
        # Generate tokens
        token1 = self.authenticator.generate_token(user1)
        token2 = self.authenticator.generate_token(user2)
        
        # Get data scopes
        scope1 = self.data_isolation.get_user_data_scope(token1)
        scope2 = self.data_isolation.get_user_data_scope(token2)
        
        self.assertEqual(scope1["user_id"], user1.id)
        self.assertEqual(scope2["user_id"], user2.id)
        self.assertNotEqual(scope1["user_id"], scope2["user_id"])
        
        # Validate access control
        self.assertTrue(self.data_isolation.validate_user_access(token1, user1.id))
        self.assertFalse(self.data_isolation.validate_user_access(token1, user2.id))


class TestDatabase(unittest.TestCase):
    """Test database operations"""
    
    @classmethod
    def setUpClass(cls):
        """Set up test database"""
        from core.database import DatabaseManager
        
        cls.temp_db = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
        cls.temp_db.close()
        
        cls.db = DatabaseManager(cls.temp_db.name)
    
    @classmethod
    def tearDownClass(cls):
        """Clean up test database"""
        try:
            os.unlink(cls.temp_db.name)
        except:
            pass
    
    def test_user_creation(self):
        """Test user creation in database"""
        user_data = {
            "id": "test_user_123",
            "username": "dbtestuser",
            "email": "dbtest@example.com",
            "password_hash": "hashed_password",
            "role": "user"
        }
        
        user_id = self.db.create_user(user_data)
        self.assertEqual(user_id, "test_user_123")
    
    def test_user_retrieval(self):
        """Test user retrieval from database"""
        # Create user
        user_data = {
            "id": "test_user_456",
            "username": "dbtestuser2",
            "email": "dbtest2@example.com",
            "password_hash": "hashed_password",
            "role": "user"
        }
        self.db.create_user(user_data)
        
        # Retrieve by ID
        user = self.db.get_user_by_id("test_user_456")
        self.assertIsNotNone(user)
        self.assertEqual(user["username"], "dbtestuser2")
        
        # Retrieve by username
        user = self.db.get_user_by_username("dbtestuser2")
        self.assertIsNotNone(user)
        self.assertEqual(user["id"], "test_user_456")
    
    def test_saved_links(self):
        """Test saved links CRUD operations"""
        user_id = "test_user_789"
        
        # Create saved link
        from core.database import SavedLink
        
        link = SavedLink(
            id="link_123",
            user_id=user_id,
            content_id="anime_456",
            content_type="anime",
            title="Test Anime",
            url="https://example.com/watch",
            site_name="ExampleStream"
        )
        
        link_id = self.db.create_saved_link(link)
        self.assertEqual(link_id, "link_123")
        
        # Retrieve links
        links = self.db.get_user_saved_links(user_id)
        self.assertEqual(len(links), 1)
        self.assertEqual(links[0]["title"], "Test Anime")
        
        # Update link
        self.db.update_saved_link("link_123", user_id, {"status": "watching"})
        updated_links = self.db.get_user_saved_links(user_id)
        self.assertEqual(updated_links[0]["status"], "watching")
        
        # Delete link
        self.assertTrue(self.db.delete_saved_link("link_123", user_id))
        deleted_links = self.db.get_user_saved_links(user_id)
        self.assertEqual(len(deleted_links), 0)
        
        # Delete with wrong user should fail
        self.assertFalse(self.db.delete_saved_link("link_123", "other_user"))


class TestRecommendationEngine(unittest.TestCase):
    """Test recommendation engine"""
    
    def setUp(self):
        """Set up recommendation engine"""
        from core.recommendation import TimeAwareRecommender
        
        self.recommender = TimeAwareRecommender({
            "trend_weight": 0.3,
            "preference_weight": 0.5,
            "time_relevance_weight": 0.2,
            "min_similarity_score": 0.3,
            "max_recommendations": 5
        })
    
    def test_current_season_detection(self):
        """Test current season detection"""
        season, year = self.recommender.get_current_season()
        
        self.assertIn(season, ["winter", "spring", "summer", "fall"])
        self.assertIsInstance(year, int)
        self.assertGreaterEqual(year, 2024)
    
    def test_time_boost(self):
        """Test time-based boost calculation"""
        # Current year should get boost
        now = datetime.utcnow()
        boost = self.recommender.get_time_based_boost(now.year, "Currently Airing")
        self.assertEqual(boost, 1.5)
        
        # Recent year should get some boost
        boost = self.recommender.get_time_based_boost(now.year - 1, "Finished")
        self.assertEqual(boost, 1.2)
        
        # Old content should get no boost
        boost = self.recommender.get_time_based_boost(2000, "Finished")
        self.assertEqual(boost, 1.0)
    
    def test_mood_analysis(self):
        """Test mood tag analysis"""
        text = "An epic adventure with thrilling battles and magic"
        moods = self.recommender.analyze_mood(text)
        
        self.assertIn("action", moods)
        self.assertIn("fantasy", moods)
    
    def test_genre_similarity(self):
        """Test genre similarity calculation"""
        user_genres = ["Action", "Adventure", "Fantasy"]
        content_genres = ["Adventure", "Fantasy", "Magic"]
        
        similarity = self.recommender.calculate_genre_similarity(user_genres, content_genres)
        self.assertGreater(similarity, 0)
        self.assertLessEqual(similarity, 1)


class TestWebScraper(unittest.TestCase):
    """Test web scraper functionality"""
    
    def test_jikan_client_initialization(self):
        """Test Jikan API client initialization"""
        from core.web_scraper import JikanAPIClient
        
        client = JikanAPIClient({
            "jikan_base_url": "https://api.jikan.moe/v4",
            "request_timeout_seconds": 10,
            "retry_attempts": 2
        })
        
        self.assertIsNotNone(client.session)
        self.assertEqual(client.base_url, "https://api.jikan.moe/v4")
    
    def test_streaming_link_finder(self):
        """Test streaming link generation"""
        from core.web_scraper import StreamingLinkFinder
        
        finder = StreamingLinkFinder({})
        
        links = finder.find_anime_links("Test Anime", "12345")
        self.assertGreater(len(links), 0)
        self.assertTrue(any(l["site_name"] == "Crunchyroll" for l in links))
        self.assertTrue(any(l["site_name"] == "MyAnimeList" for l in links))
        
        manga_links = finder.find_manga_links("Test Manga", "67890")
        self.assertGreater(len(manga_links), 0)
        self.assertTrue(any(l["site_name"] == "MangaDex" for l in manga_links))


class TestAgentIntegration(unittest.TestCase):
    """Integration tests for the main agent"""
    
    @classmethod
    def setUpClass(cls):
        """Set up test agent"""
        from core.agent import AnimeMangaAgent
        
        # Use temporary database
        cls.temp_db = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
        cls.temp_db.close()
        
        # Create agent with test config
        cls.config = {
            "security": {
                "token_expiry_hours": 1,
                "max_login_attempts": 3,
                "lockout_duration_minutes": 5,
                "password_min_length": 8
            },
            "database": {
                "path": cls.temp_db.name
            },
            "recommendation": {
                "trend_weight": 0.3,
                "preference_weight": 0.5,
                "time_relevance_weight": 0.2,
                "min_similarity_score": 0.1,
                "max_recommendations": 5
            }
        }
        
        cls.agent = AnimeMangaAgent(config_path=None)
        # Override config
        cls.agent.config = cls.config
        cls.agent.db = cls.agent._load_config()
    
    @classmethod
    def tearDownClass(cls):
        """Clean up"""
        try:
            os.unlink(cls.temp_db.name)
        except:
            pass
    
    def test_user_registration(self):
        """Test user registration flow"""
        response = self.agent.register_user(
            "integration_test_user",
            "integration@test.com",
            "TestPassword123!"
        )
        
        self.assertTrue(response.success)
        self.assertIsNotNone(response.data["user_id"])
    
    def test_user_login(self):
        """Test user login flow"""
        # Register first
        self.agent.register_user(
            "login_test_user",
            "login@test.com",
            "LoginPassword123!"
        )
        
        # Login
        response = self.agent.login_user("login_test_user", "LoginPassword123!")
        
        self.assertTrue(response.success)
        self.assertIsNotNone(response.data["token"])
        self.assertIsNotNone(response.data["user_id"])
    
    def test_preferences_update(self):
        """Test preferences update"""
        # Register user
        response = self.agent.register_user(
            "prefs_test_user",
            "prefs@test.com",
            "Password123!"
        )
        token = response.data["token"]
        user_id = response.data["user_id"]
        
        # Update preferences
        update_response = self.agent.update_user_preferences(token, {
            "favorite_genres": json.dumps(["Action", "Adventure"]),
            "min_rating": 7.0,
            "mood_preferences": json.dumps({"action": 2, "adventure": 1})
        })
        
        self.assertTrue(update_response.success)
        
        # Retrieve preferences
        prefs_response = self.agent.get_user_preferences(token)
        self.assertTrue(prefs_response.success)
        
        prefs = prefs_response.data["preferences"]
        self.assertIn("Action", prefs["favorite_genres"])
        self.assertEqual(prefs["min_rating"], 7.0)
    
    def test_search_functionality(self):
        """Test search functionality"""
        # Test anime search (may be slow, skip if fails)
        try:
            response = self.agent.search_anime("Naruto", limit=5)
            if response.success:
                self.assertGreater(len(response.data["results"]), 0)
        except Exception:
            self.skipTest("Network request failed")
    
    def test_get_recommendations(self):
        """Test recommendation generation"""
        # Register user
        response = self.agent.register_user(
            "rec_test_user",
            "rec@test.com",
            "Password123!"
        )
        token = response.data["token"]
        
        try:
            rec_response = self.agent.get_recommendations(token, "anime")
            # May fail if no API access
            if rec_response.success:
                self.assertIn("recommendations", rec_response.data)
        except Exception:
            self.skipTest("API request failed")


class TestKnowledgeBase(unittest.TestCase):
    """Test knowledge base and personality features"""
    
    @classmethod
    def setUpClass(cls):
        """Set up knowledge base"""
        from core.knowledge import AnimeMangaKnowledge, create_knowledge_base
        cls.knowledge = create_knowledge_base()
    
    def test_waifu_response(self):
        """Test waifu response generation"""
        response = self.knowledge.get_waifu_response('en')
        self.assertIn('Mikasa', response)
        self.assertIn('Attack on Titan', response)
    
    def test_waifu_multilingual(self):
        """Test waifu response in different languages"""
        # Japanese
        ja_response = self.knowledge.get_waifu_response('ja')
        self.assertIn('ミカサ', ja_response)
        
        # Russian
        ru_response = self.knowledge.get_waifu_response('ru')
        self.assertIn('Микаса', ru_response)
        
        # Spanish
        es_response = self.knowledge.get_waifu_response('es')
        self.assertIn('Mikasa', es_response)
    
    def test_hate_response(self):
        """Test most hated character response"""
        response = self.knowledge.get_hate_response('en')
        self.assertIn('Chi-Chi', response.upper())
        self.assertIn('Dragon Ball', response.upper())
    
    def test_rival_complaint(self):
        """Test rival complaint generation"""
        response = self.knowledge.get_rival_complaint()
        self.assertIn('Satoshi', response)
        self.assertIn('rival', response.lower())
    
    def test_hot_take(self):
        """Test hot take generation"""
        response = self.knowledge.get_hot_take()
        self.assertIn('HOT TAKE', response)
        # Should be one of the predefined hot takes
        self.assertTrue(any(take in response for take in self.knowledge.personality.hot_takes))
    
    def test_top_10_response(self):
        """Test top 10 response"""
        response = self.knowledge.get_top_10_response()
        self.assertIn('TOP 10', response)
        self.assertIn('Fullmetal Alchemist', response)
        self.assertIn('Attack on Titan', response)
    
    def test_top_100_tier(self):
        """Test top 100 tier response"""
        response = self.knowledge.get_top_100_tier('S')
        self.assertIn('S TIER', response)
        self.assertIn('MASTERPIECES', response)
    
    def test_recommend_by_description(self):
        """Test recommendation by vague description"""
        # Test blonde character search
        response = self.knowledge.recommend_by_description('blonde main character')
        self.assertIn('blonde', response.lower())
        
        # Test dark fantasy search
        response = self.knowledge.recommend_by_description('dark fantasy revenge')
        self.assertIn('Berserk', response)
        
        # Test school romance search
        response = self.knowledge.recommend_by_description('school romance')
        self.assertIn('Toradora', response)
    
    def test_recommend_by_favorites(self):
        """Test recommendation by favorites"""
        response = self.knowledge.recommend_by_favorites(['Fullmetal Alchemist'])
        self.assertIn('Hunter x Hunter', response)
        
        response = self.knowledge.recommend_by_favorites(['Attack on Titan'])
        self.assertIn('Vinland Saga', response)
    
    def test_greeting_multilingual(self):
        """Test greeting in different languages"""
        en_greeting = self.knowledge.get_greeting('en')
        self.assertIn('welcome', en_greeting.lower())
        
        ja_greeting = self.knowledge.get_greeting('ja')
        self.assertIn('こんにちは', ja_greeting)
        
        ru_greeting = self.knowledge.get_greeting('ru')
        self.assertIn('Привет', ru_greeting)
    
    def test_studios_knowledge(self):
        """Test studio knowledge"""
        self.assertIn('MAPPA', self.knowledge.studios)
        self.assertIn('ufotable', self.knowledge.studios)
        
        mappa = self.knowledge.studios['MAPPA']
        self.assertIn('Attack on Titan', mappa['notable_works'])
    
    def test_mangaka_knowledge(self):
        """Test mangaka knowledge"""
        self.assertIn('Eiichiro Oda', self.knowledge.mangaka)
        self.assertIn('Hajime Isayama', self.knowledge.mangaka)
        
        oda = self.knowledge.mangaka['Eiichiro Oda']
        self.assertIn('One Piece', oda['works'])
    
    def test_genre_knowledge(self):
        """Test genre knowledge"""
        self.assertIn('shonen', self.knowledge.genres)
        self.assertIn('seinen', self.knowledge.genres)
        
        shonen = self.knowledge.genres['shonen']
        self.assertIn('One Piece', shonen['examples'])
    
    def test_classics_knowledge(self):
        """Test classics knowledge"""
        self.assertIn('1990s', self.knowledge.classics)
        self.assertIn('2000s', self.knowledge.classics)
        
        classics_90s = self.knowledge.classics['1990s']
        self.assertTrue(any('Cowboy Bebop' in c[0] for c in classics_90s))


class TestAPIClients(unittest.TestCase):
    """Test API client functionality"""
    
    def test_jikan_client_initialization(self):
        """Test Jikan client initialization"""
        from core.api_clients import JikanClient
        
        client = JikanClient()
        self.assertIsNotNone(client)
        self.assertEqual(client.BASE_URL, "https://api.jikan.moe/v4")
    
    def test_anilist_client_initialization(self):
        """Test AniList client initialization"""
        from core.api_clients import AniListClient
        
        client = AniListClient()
        self.assertIsNotNone(client)
        self.assertEqual(client.BASE_URL, "https://graphql.anilist.co")
    
    def test_api_manager_initialization(self):
        """Test API manager initialization"""
        from core.api_clients import create_api_manager
        
        manager = create_api_manager()
        self.assertIsNotNone(manager.jikan)
        self.assertIsNotNone(manager.anilist)


class TestAgentPersonality(unittest.TestCase):
    """Test agent personality integration"""
    
    @classmethod
    def setUpClass(cls):
        """Set up test agent"""
        from core.agent import AnimeMangaAgent
        
        # Use temporary database
        cls.temp_db = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
        cls.temp_db.close()
        
        cls.agent = AnimeMangaAgent(config_path=None)
    
    @classmethod
    def tearDownClass(cls):
        """Clean up"""
        try:
            os.unlink(cls.temp_db.name)
        except:
            pass
    
    def test_set_language(self):
        """Test language setting"""
        response = self.agent.set_language('ja')
        self.assertTrue(response.success)
        self.assertEqual(self.agent.current_language, 'ja')
        
        # Reset to English
        self.agent.set_language('en')
    
    def test_invalid_language(self):
        """Test invalid language handling"""
        response = self.agent.set_language('invalid')
        self.assertFalse(response.success)
    
    def test_get_waifu(self):
        """Test waifu retrieval"""
        response = self.agent.get_waifu()
        self.assertTrue(response.success)
        self.assertIn('Mikasa', response.data['response'])
    
    def test_get_most_hated(self):
        """Test most hated character retrieval"""
        response = self.agent.get_most_hated_character()
        self.assertTrue(response.success)
        self.assertIn('Chi-Chi', response.data['response'].upper())
    
    def test_get_rival_complaint(self):
        """Test rival complaint retrieval"""
        response = self.agent.get_rival_complaint()
        self.assertTrue(response.success)
        self.assertIn('Satoshi', response.data['response'])
    
    def test_get_hot_take(self):
        """Test hot take retrieval"""
        response = self.agent.get_hot_take()
        self.assertTrue(response.success)
        self.assertIn('HOT TAKE', response.data['response'])
    
    def test_get_top_10(self):
        """Test top 10 retrieval"""
        response = self.agent.get_top_10()
        self.assertTrue(response.success)
        self.assertEqual(len(response.data['top_10']), 10)
    
    def test_get_genre_favorites(self):
        """Test genre favorites retrieval"""
        response = self.agent.get_genre_favorites('shonen')
        self.assertTrue(response.success)
        self.assertIn('Fullmetal Alchemist', response.data['favorites'])
    
    def test_get_studio_info(self):
        """Test studio info retrieval"""
        response = self.agent.get_studio_info('MAPPA')
        self.assertTrue(response.success)
        self.assertIn('Attack on Titan', response.data['info']['notable_works'])
    
    def test_get_mangaka_info(self):
        """Test mangaka info retrieval"""
        response = self.agent.get_mangaka_info('Eiichiro Oda')
        self.assertTrue(response.success)
        self.assertIn('One Piece', response.data['info']['works'])


class TestOmniscientMode(unittest.TestCase):
    """Test omniscient agent mode - comprehensive knowledge and rankings"""
    
    def test_omniscient_initialization(self):
        """Test omniscient mode can be initialized"""
        from core.content_omniscience import OmniscientModeManager
        from core.web_scraper import JikanAPIClient, AniListAPIClient
        
        jikan = JikanAPIClient({"request_timeout_seconds": 10})
        anilist = AniListAPIClient({"request_timeout_seconds": 10})
        
        omniscient = OmniscientModeManager(jikan, anilist)
        self.assertFalse(omniscient.is_omniscient)
        self.assertIsNotNone(omniscient.indexer)
        self.assertIsNotNone(omniscient.release_monitor)
        self.assertIsNotNone(omniscient.metadata_generator)
        self.assertIsNotNone(omniscient.ranking_system)
    
    def test_content_metadata_generation(self):
        """Test automatic metadata generation for content"""
        from core.content_omniscience import ContentMetadataGenerator
        
        generator = ContentMetadataGenerator()
        
        test_content = {
            "mal_id": 1,
            "title": "Test Anime",
            "genres": [{"name": "Action"}, {"name": "Adventure"}],
            "themes": [{"name": "Friendship"}],
            "synopsis": "A story about battle and friendship",
            "score": 8.5,
            "popularity": 100,
            "aired": {"from": "2020-01-01"}
        }
        
        metadata = generator.generate_metadata(test_content, "anime")
        
        # Verify metadata generation
        self.assertEqual(metadata.title, "Test Anime")
        self.assertEqual(metadata.content_type, "anime")
        self.assertIsNotNone(metadata.short_description)
        self.assertIsNotNone(metadata.extended_description)
        self.assertTrue(len(metadata.keywords) > 0)
        self.assertTrue(len(metadata.mood_tags) > 0)
        self.assertGreater(metadata.discovery_score, 0)
        self.assertGreater(metadata.uniqueness_score, 0)
        self.assertGreater(metadata.relevance_score, 0)
    
    def test_dynamic_ranking_system(self):
        """Test dynamic ranking system updates"""
        from core.content_omniscience import DynamicRankingSystem, ContentMetadataGenerator
        
        generator = ContentMetadataGenerator()
        ranking_system = DynamicRankingSystem(generator)
        
        # Test with sample content
        test_content = {
            "1": {
                "title": "Great Anime",
                "score": 8.8,
                "popularity": 50,
                "genres": [{"name": "Action"}],
                "aired": {"from": "2023-01-01"}
            },
            "2": {
                "title": "Good Anime",
                "score": 7.5,
                "popularity": 5000,
                "genres": [{"name": "Comedy"}],
                "aired": {"from": "2023-06-01"}
            }
        }
        
        metadata_map = {}
        for content_id, content in test_content.items():
            metadata_map[content_id] = generator.generate_metadata(content, "anime")
        
        # Update rankings
        counts = ranking_system.update_rankings(test_content, metadata_map)
        
        # Verify rankings were created
        self.assertGreater(counts.get("must_watch", 0), 0)
        self.assertGreater(counts.get("hidden_gems", 0), 0)
    
    def test_release_monitor(self):
        """Test release monitor can be initialized"""
        from core.content_omniscience import ReleaseMonitor
        from core.web_scraper import JikanAPIClient
        
        jikan = JikanAPIClient({"request_timeout_seconds": 10})
        monitor = ReleaseMonitor(jikan)
        
        self.assertIsNone(monitor.last_check)
        self.assertEqual(len(monitor.new_releases), 0)
        self.assertEqual(len(monitor.processed_releases), 0)
    
    def test_content_indexer(self):
        """Test content indexer structure"""
        from core.content_omniscience import ContentIndexer
        from core.web_scraper import JikanAPIClient, AniListAPIClient
        
        jikan = JikanAPIClient({"request_timeout_seconds": 10})
        anilist = AniListAPIClient({"request_timeout_seconds": 10})
        
        indexer = ContentIndexer(jikan, anilist)
        
        self.assertEqual(len(indexer.anime_index), 0)
        self.assertEqual(len(indexer.manga_index), 0)
        self.assertFalse(indexer.is_indexing)


def run_tests():
    """Run all tests"""
    # Create test suite
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    
    # Add test classes
    suite.addTests(loader.loadTestsFromTestCase(TestAuthentication))
    suite.addTests(loader.loadTestsFromTestCase(TestDatabase))
    suite.addTests(loader.loadTestsFromTestCase(TestRecommendationEngine))
    suite.addTests(loader.loadTestsFromTestCase(TestWebScraper))
    suite.addTests(loader.loadTestsFromTestCase(TestAgentIntegration))
    suite.addTests(loader.loadTestsFromTestCase(TestKnowledgeBase))
    suite.addTests(loader.loadTestsFromTestCase(TestAPIClients))
    suite.addTests(loader.loadTestsFromTestCase(TestAgentPersonality))
    suite.addTests(loader.loadTestsFromTestCase(TestOmniscientMode))
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Return exit code
    return 0 if result.wasSuccessful() else 1


if __name__ == "__main__":
    sys.exit(run_tests())
