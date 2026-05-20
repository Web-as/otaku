"""
Advanced Recommendation System
Search by vague descriptions, anime history matching, and API integration
"""
import json
import re
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, field
import logging


@dataclass
class SearchCriteria:
    """Parsed search criteria from user description"""
    character_features: List[str] = field(default_factory=list)  # "blonde", "red hair", "scar"
    mood: List[str] = field(default_factory=list)  # "dark", "lighthearted", "funny"
    genre_hints: List[str] = field(default_factory=list)  # "action", "romance"
    setting_hints: List[str] = field(default_factory=list)  # "school", "fantasy world", "space"
    time_period: Optional[str] = None  # "90s", "2000s", "recent"
    length_hints: Optional[str] = None  # "short", "long", "movie"
    target_audience: Optional[str] = None  # "kids", "mature"
    themes: List[str] = field(default_factory=list)  # "revenge", "friendship", "love"


class VagueDescriptionParser:
    """Parse vague user descriptions into search criteria"""
    
    # Character feature mappings
    CHARACTER_FEATURES = {
        "blonde": ["blonde", "blond", "yellow hair", "golden hair", "light hair"],
        "red hair": ["red hair", "ginger", "orange hair", "auburn hair"],
        "blue hair": ["blue hair", "azure hair", "cyan hair"],
        "pink hair": ["pink hair", "magenta hair"],
        "white hair": ["white hair", "silver hair", "pale hair"],
        "black hair": ["black hair", "dark hair", "raven hair"],
        "long hair": ["long hair", "flowing hair"],
        "short hair": ["short hair", "spiky hair"],
        "scar": ["scar", "scarred", "mark on face"],
        "glasses": ["glasses", "spectacles", "bespectacled"],
        "twins": ["twins", "siblings", "brothers", "sisters"],
        "demon": ["demon", "devil", "half-demon", "youkai"],
        "vampire": ["vampire", "bloodsucker", "dracula"],
        "robot": ["robot", "android", "cyborg", "mecha pilot"],
        "sword": ["swordsman", "blade", "samurai", "sword fighter"],
        "mage": ["mage", "wizard", "sorcerer", "magic user"],
        "cat": ["cat ears", "nekomimi", "cat girl", "feline"],
    }
    
    # Mood mappings
    MOOD_MAPPINGS = {
        "dark": ["dark", "grim", "serious", "bleak", "gloomy", "tragic"],
        "lighthearted": ["lighthearted", "fun", "comedy", "happy", "cheerful", "wholesome"],
        "sad": ["sad", "emotional", "tearjerker", "touching", "heartbreaking"],
        "intense": ["intense", "action-packed", "thrilling", "exciting", "epic"],
        "relaxing": ["relaxing", "calm", "slice of life", "peaceful", "chill"],
        "mysterious": ["mysterious", "mystery", "enigma", "puzzle", "suspenseful"],
        "romantic": ["romantic", "love", "romance", "dating", "heart"],
        "scary": ["scary", "horror", "terror", "fear", "creepy"],
    }
    
    # Setting mappings
    SETTING_MAPPINGS = {
        "school": ["school", "academy", "high school", "college", "university"],
        "fantasy world": ["fantasy world", "other world", "isekai", "magic world", "medieval"],
        "modern": ["modern", "contemporary", "present day", "city", "urban"],
        "space": ["space", "sci-fi", "future", "galaxy", "starship"],
        "historical": ["historical", "feudal", "ancient", "period", "samurai era"],
        "underground": ["underground", "dungeon", "abyss"],
        "island": ["island", "deserted island", "tropical"],
    }
    
    # Theme mappings
    THEME_MAPPINGS = {
        "revenge": ["revenge", "vengeance", "payback", "retribution"],
        "friendship": ["friendship", "bonds", "comrades", "teamwork"],
        "love": ["love", "romance", "relationship", "couple"],
        "family": ["family", "parents", "siblings", "lineage"],
        "power": ["power", "strength", "evolution", "growth", "training"],
        "identity": ["identity", "self discovery", "who am i", "secrets"],
        "war": ["war", "battle", "conflict", "fighting"],
        "survival": ["survival", "escape", "run", "chase"],
    }
    
    def parse(self, description: str) -> SearchCriteria:
        """Parse a vague description into structured criteria"""
        desc_lower = description.lower()
        
        criteria = SearchCriteria()
        
        # Extract character features
        for feature, keywords in self.CHARACTER_FEATURES.items():
            if any(kw in desc_lower for kw in keywords):
                criteria.character_features.append(feature)
        
        # Extract mood
        for mood, keywords in self.MOOD_MAPPINGS.items():
            if any(kw in desc_lower for kw in keywords):
                criteria.mood.append(mood)
        
        # Extract setting
        for setting, keywords in self.SETTING_MAPPINGS.items():
            if any(kw in desc_lower for kw in keywords):
                criteria.setting_hints.append(setting)
        
        # Extract themes
        for theme, keywords in self.THEME_MAPPINGS.items():
            if any(kw in desc_lower for kw in keywords):
                criteria.themes.append(theme)
        
        # Extract genres mentioned
        genre_keywords = ["action", "adventure", "comedy", "drama", "fantasy", "horror",
                         "mystery", "romance", "sci-fi", "sports", "thriller", "slice of life",
                         "psychological", "mecha", "music", "supernatural", "military"]
        for genre in genre_keywords:
            if genre in desc_lower:
                criteria.genre_hints.append(genre)
        
        # Extract time period
        if "90s" in desc_lower or "1990" in desc_lower:
            criteria.time_period = "1990s"
        elif "2000" in desc_lower or "2000s" in desc_lower:
            criteria.time_period = "2000s"
        elif "2010" in desc_lower or "recent" in desc_lower or "new" in desc_lower:
            criteria.time_period = "recent"
        
        # Extract length hints
        if "short" in desc_lower or "few episodes" in desc_lower:
            criteria.length_hints = "short"
        elif "long" in desc_lower or "series" in desc_lower:
            criteria.length_hints = "long"
        elif "movie" in desc_lower or "film" in desc_lower:
            criteria.length_hints = "movie"
        
        return criteria


class AniChartIntegration:
    """Integration with AniChart API for seasonal data"""
    
    def __init__(self, config: Dict[str, Any]):
        self.base_url = "https://anichart.net/api"
        self.session = config.get("session")
    
    def get_current_season(self) -> Dict[str, Any]:
        """Get current season anime from AniChart"""
        try:
            import requests
            response = requests.get(f"{self.base_url}/season", timeout=10)
            if response.status_code == 200:
                return response.json()
        except Exception as e:
            logging.warning(f"AniChart API unavailable: {e}")
        return {}
    
    def get_upcoming_season(self) -> Dict[str, Any]:
        """Get upcoming season anime"""
        try:
            import requests
            response = requests.get(f"{self.base_url}/upcoming", timeout=10)
            if response.status_code == 200:
                return response.json()
        except Exception as e:
            logging.warning(f"AniChart API unavailable: {e}")
        return {}
    
    def get_seasonal_chart(self, year: int, season: str) -> Dict[str, Any]:
        """Get chart for specific season"""
        try:
            import requests
            response = requests.get(
                f"{self.base_url}/season/{year}/{season}",
                timeout=10
            )
            if response.status_code == 200:
                return response.json()
        except Exception as e:
            logging.warning(f"AniChart API unavailable: {e}")
        return {}


class AdvancedRecommender:
    """Advanced recommendation system with multiple input methods"""
    
    def __init__(self, jikan_client, anilist_client=None, config: Dict[str, Any] = None):
        self.jikan = jikan_client
        self.anilist = anilist_client
        self.config = config or {}
        self.parser = VagueDescriptionParser()
        self.anichart = AniChartIntegration({"session": None})
    
    def search_by_description(self, description: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Search anime based on vague description"""
        criteria = self.parser.parse(description)
        
        results = []
        
        # Method 1: Search by parsed genres
        if criteria.genre_hints:
            for genre in criteria.genre_hints:
                genre_results = self._search_by_genre(genre, limit // len(criteria.genre_hints))
                results.extend(genre_results)
        
        # Method 2: Search by title keywords from description
        keywords = self._extract_keywords(description)
        for keyword in keywords[:3]:
            keyword_results = self.jikan.search_anime(keyword, limit=5)
            results.extend([a.to_dict() for a in keyword_results])
        
        # Method 3: Filter by criteria
        filtered = self._filter_by_criteria(results, criteria)
        
        # Remove duplicates and rank
        seen = set()
        unique_results = []
        for r in filtered:
            aid = r.get("mal_id")
            if aid and aid not in seen:
                seen.add(aid)
                # Calculate relevance score
                score = self._calculate_relevance(r, criteria)
                r["relevance_score"] = score
                unique_results.append(r)
        
        # Sort by relevance
        unique_results.sort(key=lambda x: x.get("relevance_score", 0), reverse=True)
        
        return unique_results[:limit]
    
    def search_by_anime_list(
        self,
        anime_titles: List[str],
        match_weight: float = 0.5
    ) -> List[Dict[str, Any]]:
        """Find anime similar to a list of anime the user liked"""
        if not anime_titles:
            return []
        
        # Get details for each anime
        all_genres = set()
        all_studios = set()
        all_themes = set()
        all_recommendations = []
        
        for title in anime_titles:
            # Search for anime
            results = self.jikan.search_anime(title, limit=1)
            if results:
                anime = results[0]
                all_genres.update(anime.genres)
                all_studios.update(anime.studios)
                
                # Get recommendations for this anime
                recs = self.jikan.get_recommendations(anime.id, limit=5)
                all_recommendations.extend([r.to_dict() for r in recs])
        
        # Find anime with similar characteristics
        similar_results = []
        
        # Search by genres
        genre_search = " ".join(list(all_genres)[:3])
        genre_results = self.jikan.search_anime(genre_search, limit=20)
        
        for anime in genre_results:
            # Skip if it's in the user's list
            if any(title.lower() in anime.title.lower() for title in anime_titles):
                continue
            
            # Calculate similarity score
            anime_genres = set(anime.genres)
            genre_overlap = len(all_genres & anime_genres) / max(len(all_genres | anime_genres), 1)
            
            # Check if anime is in recommendations
            is_recommended = any(
                rec.get("id") == anime.id for rec in all_recommendations
            )
            
            recommendation_score = 1.0 if is_recommended else 0.5
            
            total_score = (genre_overlap * match_weight) + (recommendation_score * (1 - match_weight))
            
            similar_results.append({
                **anime.to_dict(),
                "similarity_score": total_score,
                "matched_on": "genres" if genre_overlap > 0.3 else "recommendations"
            })
        
        # Sort by similarity
        similar_results.sort(key=lambda x: x.get("similarity_score", 0), reverse=True)
        
        return similar_results[:15]
    
    def get_community_recommendations(self, anime_title: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recommendations based on community recommendations"""
        # Find the anime
        results = self.jikan.search_anime(anime_title, limit=1)
        if not results:
            return []
        
        anime = results[0]
        
        # Get recommendations
        recommendations = self.jikan.get_recommendations(anime.id, limit=limit)
        
        # Also get similar anime
        similar = self._search_similar(anime.id, limit=5)
        
        # Combine and format
        combined = []
        for rec in recommendations:
            combined.append({
                **rec.to_dict(),
                "recommendation_type": "community_rec",
                "based_on": anime.title
            })
        
        for sim in similar:
            combined.append({
                **sim.to_dict(),
                "recommendation_type": "similar",
                "based_on": anime.title
            })
        
        return combined[:limit]
    
    def get_seasonal_recommendations(self, year: int = None, season: str = None, limit: int = 15) -> Dict[str, Any]:
        """Get recommendations for current/upcoming season"""
        from datetime import datetime
        now = datetime.utcnow()
        
        if not year:
            year = now.year
        
        if not season:
            month = now.month
            if month in [1, 2, 3]:
                season = "winter"
            elif month in [4, 5, 6]:
                season = "spring"
            elif month in [7, 8, 9]:
                season = "summer"
            else:
                season = "fall"
        
        # Get from Jikan
        seasonal = self.jikan.get_seasonal_anime(year, season)
        
        # Get from AniChart
        anichart_data = self.anichart.get_seasonal_chart(year, season)
        
        # Combine results
        anime_list = [a.to_dict() for a in seasonal]
        
        # Add anichart data if available
        if anichart_data:
            for item in anichart_data.get("anime", []):
                if not any(a.get("mal_id") == item.get("id") for a in anime_list):
                    anime_list.append(item)
        
        # Sort by score
        anime_list.sort(key=lambda x: x.get("score", 0), reverse=True)
        
        return {
            "season": season,
            "year": year,
            "anime": anime_list[:limit],
            "source": "Jikan API + AniChart"
        }
    
    def get_trending_recommendations(self, limit: int = 15) -> Dict[str, Any]:
        """Get currently trending anime"""
        # Get top anime
        top = self.jikan.get_top_anime(limit=limit)
        
        # Get current season
        current = self.jikan.get_current_season()
        
        # Combine
        trending = []
        
        for anime in current:
            if anime.airing:
                trending.append({
                    **anime.to_dict(),
                    "trending_reason": "Currently Airing"
                })
        
        for anime in top[:10]:
            if anime.id not in [a.get("id") for a in trending]:
                trending.append({
                    **anime.to_dict(),
                    "trending_reason": "Highly Rated"
                })
        
        return {
            "trending": trending,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def _search_by_genre(self, genre: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Search anime by genre"""
        # Jikan genre mapping
        genre_map = {
            "action": 1, "adventure": 2, "cars": 3, "comedy": 4, "dementia": 5,
            "demons": 6, "mystery": 7, "drama": 8, "ecchi": 9, "fantasy": 10,
            "game": 11, "hentai": 12, "historical": 13, "horror": 14, "kids": 15,
            "magic": 16, "martial arts": 17, "mecha": 18, "military": 19, "music": 20,
            "mystery": 21, "parody": 22, "police": 23, "psychological": 24, "romance": 25,
            "samurai": 26, "school": 27, "sci-fi": 28, "seinen": 29, "shoujo": 30,
            "shoujo ai": 31, "shounen": 32, "shounen ai": 33, "slice of life": 34,
            "space": 35, "sports": 36, "super power": 37, "supernatural": 38, "thriller": 39,
            "vampire": 40, "yaoi": 41, "yuri": 42
        }
        
        genre_id = genre_map.get(genre.lower())
        if not genre_id:
            return []
        
        anime_list = self.jikan.get_anime_by_genre(genre_id, limit=limit)
        return [a.to_dict() for a in anime_list]
    
    def _extract_keywords(self, text: str) -> List[str]:
        """Extract meaningful keywords from text"""
        # Remove common words
        stop_words = {"i", "want", "to", "see", "a", "an", "the", "where", "with", "that",
                     "has", "had", "is", "are", "was", "were", "be", "been", "being",
                     "anime", "manga", "series", "show", "movie", "film", "like", "such",
                     "as", "one", "some", "any", "kind", "type", "sort", "of", "for"}
        
        words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
        return [w for w in words if w not in stop_words]
    
    def _filter_by_criteria(self, anime_list: List[Dict], criteria: SearchCriteria) -> List[Dict]:
        """Filter anime list by parsed criteria"""
        filtered = []
        
        for anime in anime_list:
            score = 0
            
            # Check character features (title/synopsis check)
            title = anime.get("title", "").lower()
            synopsis = anime.get("synopsis", "").lower()
            text = title + " " + synopsis
            
            for feature in criteria.character_features:
                feature_keywords = self.parser.CHARACTER_FEATURES.get(feature, [])
                if any(kw in text for kw in feature_keywords):
                    score += 2
            
            # Check mood
            for mood in criteria.mood:
                mood_keywords = self.parser.MOOD_MAPPINGS.get(mood, [])
                if any(kw in text for kw in mood_keywords):
                    score += 1
            
            # Check setting
            for setting in criteria.setting_hints:
                setting_keywords = self.parser.SETTING_MAPPINGS.get(setting, [])
                if any(kw in text for kw in setting_keywords):
                    score += 2
            
            # Check time period
            if criteria.time_period:
                year = anime.get("year", 0)
                if criteria.time_period == "1990s" and 1990 <= year <= 1999:
                    score += 2
                elif criteria.time_period == "2000s" and 2000 <= year <= 2009:
                    score += 2
                elif criteria.time_period == "recent" and year >= 2015:
                    score += 2
            
            # Check length
            episodes = anime.get("episodes", 0)
            if criteria.length_hints == "short" and 1 <= episodes <= 12:
                score += 1
            elif criteria.length_hints == "movie" and episodes <= 2:
                score += 1
            elif criteria.length_hints == "long" and episodes > 50:
                score += 1
            
            if score > 0:
                anime["match_score"] = score
                filtered.append(anime)
        
        return filtered
    
    def _calculate_relevance(self, anime: Dict, criteria: SearchCriteria) -> float:
        """Calculate relevance score for anime"""
        base_score = anime.get("score", 0) / 10  # Normalize score
        
        match_bonus = anime.get("match_score", 0) * 0.1
        
        return min(base_score + match_bonus, 1.0)
    
    def _search_similar(self, anime_id: str, limit: int = 5) -> List[Any]:
        """Search for similar anime"""
        # Get similar from Jikan
        anime = self.jikan.get_anime(anime_id)
        if not anime:
            return []
        
        # Search by genre
        similar = []
        for genre in anime.genres[:3]:
            genre_results = self._search_by_genre(genre, limit=3)
            similar.extend(genre_results)
        
        return similar[:limit]
    
    def parse_user_history(self, history_text: str) -> List[str]:
        """Parse user's anime history from text"""
        anime_list = []
        
        # Split by common separators
        lines = history_text.replace(",", "\n").replace(";", "\n").split("\n")
        
        for line in lines:
            line = line.strip()
            if len(line) > 2:
                # Clean up
                line = re.sub(r'^\d+[\.\)]\\s*', '', line)  # Remove numbering
                line = re.sub(r'\s*-\s*\d{1,2}/\d{1,2}$', '', line)  # Remove ratings
                if line:
                    anime_list.append(line)
        
        return anime_list[:20]  # Limit to 20 anime
    
    def generate_recommendation_from_history(
        self,
        history_text: str,
        include_shared: bool = True
    ) -> Dict[str, Any]:
        """Generate recommendations based on user's anime history"""
        anime_list = self.parse_user_history(history_text)
        
        if not anime_list:
            return {"error": "No anime found in history"}
        
        # Get recommendations
        similar = self.search_by_anime_list(anime_list)
        
        # Get community recs for each (limited)
        community_recs = []
        for anime_title in anime_list[:3]:
            recs = self.get_community_recommendations(anime_title, limit=3)
            community_recs.extend(recs)
        
        # Remove duplicates
        seen = set()
        unique_community = []
        for rec in community_recs:
            rid = rec.get("id")
            if rid and rid not in seen:
                seen.add(rid)
                unique_community.append(rec)
        
        return {
            "input_anime_count": len(anime_list),
            "similar_anime": similar[:10],
            "community_recommendations": unique_community[:10],
            "based_on": anime_list,
            "include_shared_history": include_shared
        }


# Example usage function
def demo_advanced_recommendations():
    """Demo the advanced recommendation system"""
    from core.web_scraper import JikanAPIClient
    
    jikan = JikanAPIClient({
        "jikan_base_url": "https://api.jikan.moe/v4",
        "request_timeout": 10
    })
    
    recommender = AdvancedRecommender(jikan)
    
    # Example 1: Vague description
    print("=" * 50)
    print("Example 1: 'I want an anime with a blonde main character, dark and intense'")
    results = recommender.search_by_description(
        "I want an anime with a blonde main character, dark and intense"
    )
    for r in results[:3]:
        print(f"- {r.get('title')} (Score: {r.get('relevance_score', 0):.2f})")
    
    # Example 2: Seasonal recommendations
    print("\n" + "=" * 50)
    print("Current Season Recommendations:")
    seasonal = recommender.get_seasonal_recommendations()
    print(f"Season: {seasonal['season']} {seasonal['year']}")
    for r in seasonal['anime'][:3]:
        print(f"- {r.get('title')} ({r.get('score')})")
    
    # Example 3: Based on user history
    print("\n" + "=" * 50)
    print("Based on user favorites:")
    history = "Fullmetal Alchemist, Death Note, Attack on Titan"
    recs = recommender.generate_recommendation_from_history(history)
    print(f"Based on: {', '.join(recs['based_on'])}")
    for r in recs['similar_anime'][:3]:
        print(f"- {r.get('title')} (Similarity: {r.get('similarity_score', 0):.2f})")
