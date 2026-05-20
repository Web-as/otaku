"""
Recommendation Engine with Time Awareness and ANN-Inspired Adaptive Weights

Core ANN analogy:
  - Neurons   : scoring nodes (preference, trend, time)
  - Weights   : W1=w_pref, W2=w_trend, W3=w_time  (per-user, persisted in DB)
  - Activation: min_similarity_score threshold gate (0.6 default)
  - Learning  : delta rule  W_new = W_old + α × reward_signal
  - Feedback  : FeedbackType signals emitted by agent on user actions
"""
import re
import json
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, field
from collections import Counter
from enum import Enum

# Optional ML dependencies — gracefully degrade if scipy/sklearn unavailable
try:
    import numpy as np
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    _ML_AVAILABLE = True
except (ImportError, Exception):
    _ML_AVAILABLE = False
    np = None
    TfidfVectorizer = None
    cosine_similarity = None


@dataclass
class Recommendation:
    """Recommendation result structure"""
    id: str
    content_id: str
    content_type: str
    title: str
    title_english: Optional[str]
    image_url: Optional[str]
    synopsis: Optional[str]
    score: float
    relevance_score: float
    recommendation_reason: str
    genres: List[str] = field(default_factory=list)
    year: int = 0
    episodes: int = 0
    rating: str = ""
    streaming_links: List[Dict[str, str]] = field(default_factory=list)
    match_factors: Dict[str, float] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "content_id": self.content_id,
            "content_type": self.content_type,
            "title": self.title,
            "title_english": self.title_english,
            "image_url": self.image_url,
            "synopsis": self.synopsis,
            "score": self.score,
            "relevance_score": self.relevance_score,
            "recommendation_reason": self.recommendation_reason,
            "genres": self.genres,
            "year": self.year,
            "episodes": self.episodes,
            "rating": self.rating,
            "streaming_links": self.streaming_links,
            "match_factors": self.match_factors
        }


@dataclass
class MoodTag:
    """Mood tag for content"""
    name: str
    keywords: List[str]
    weight: float = 1.0


# Predefined mood tags for anime/manga
MOOD_TAGS = [
    MoodTag("action", ["fight", "battle", "combat", "war", "adventure", "power", "strong", "hero"], 1.0),
    MoodTag("romance", ["love", "romance", "heart", "relationship", "dating", "couple", "feelings"], 1.0),
    MoodTag("comedy", ["funny", "comedy", "laugh", "humor", "comedic", "hilarious", "joke"], 1.0),
    MoodTag("drama", ["drama", "emotional", "tear", "tragic", "serious", "sad", "heartbreaking"], 1.0),
    MoodTag("fantasy", ["magic", "fantasy", "world", "dragon", "wizard", "supernatural", "mythical"], 1.0),
    MoodTag("sci-fi", ["science", "space", "future", "robot", "technology", "cyber", "mecha"], 1.0),
    MoodTag("horror", ["horror", "scary", "terror", "fear", "dark", "ghost", "monster", "death"], 1.0),
    MoodTag("slice-of-life", ["daily", "life", "school", "friends", "family", "everyday", "relaxing"], 1.0),
    MoodTag("mystery", ["mystery", "detective", "crime", "secret", "puzzle", "investigation", "whodunit"], 1.0),
    MoodTag("sports", ["sports", "game", "match", "competition", "athlete", "team", "championship"], 1.0),
    MoodTag("music", ["music", "song", "band", "singer", "performance", "concert", "melody"], 1.0),
    MoodTag("psychological", ["mind", "psychological", "twist", "reality", "illusion", "dream", "manipulation"], 1.0),
    MoodTag("isekai", ["isekai", "another world", "transported", "game world", "vr", "escaped"], 1.0),
    MoodTag("shounen", ["young", "growth", "training", "power up", "tournament", "friendship"], 1.0),
    MoodTag("shojo", ["girl", "romance", "beauty", "heart", "friendship", "emotions"], 1.0)
]


# ============================================================================
# ANN LEARNING LAYER — Feedback signals, weight profiles, delta-rule adapter
# ============================================================================

class FeedbackType(Enum):
    """
    Reward/penalty signals emitted by the agent when the user interacts.
    Each maps to a weight-delta applied via WeightAdapter.adapt().
    """
    COMPLETED       = "completed"       # Finished watching/reading  (+0.08 W1)
    HIGH_RATING     = "high_rating"     # Rated ≥ 8                  (+0.05 W1)
    LOW_RATING      = "low_rating"      # Rated ≤ 4                  (-0.05 W1)
    SAVED           = "saved"           # Saved a link               (+0.03 W1, W2)
    SKIPPED         = "skipped"         # Skipped/ignored rec        (-0.02 W1)
    SEASONAL_CLICK  = "seasonal_click"  # Clicked a seasonal pick    (+0.03 W3)
    SEASONAL_SKIP   = "seasonal_skip"   # Ignored seasonal rec       (-0.03 W3)


# Delta-rule reward table: FeedbackType → {weight_key: delta}
_FEEDBACK_DELTAS: Dict[str, Dict[str, float]] = {
    FeedbackType.COMPLETED.value:      {"w_pref": +0.08},
    FeedbackType.HIGH_RATING.value:    {"w_pref": +0.05},
    FeedbackType.LOW_RATING.value:     {"w_pref": -0.05},
    FeedbackType.SAVED.value:          {"w_pref": +0.03, "w_trend": +0.03},
    FeedbackType.SKIPPED.value:        {"w_pref": -0.02},
    FeedbackType.SEASONAL_CLICK.value: {"w_time":  +0.03},
    FeedbackType.SEASONAL_SKIP.value:  {"w_time":  -0.03},
}

# Genre confidence delta per positive/negative interaction
_GENRE_POSITIVE_DELTA = 0.05
_GENRE_NEGATIVE_DELTA = 0.03
_GENRE_MIN = -1.0
_GENRE_MAX =  1.0


@dataclass
class UserWeightProfile:
    """
    Per-user ANN weight profile.
    Weights govern the final scoring formula:
        score = pref × w_pref + trend × w_trend + time_boost × w_time
    Weights are adapted via the delta rule each time feedback is recorded.
    """
    user_id: str
    w_pref: float = 0.5
    w_trend: float = 0.3
    w_time: float = 0.2
    learning_rate: float = 0.05
    genre_scores: Dict[str, float] = field(default_factory=dict)  # genre → confidence (-1..1)
    total_interactions: int = 0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "user_id": self.user_id,
            "w_pref": self.w_pref,
            "w_trend": self.w_trend,
            "w_time": self.w_time,
            "learning_rate": self.learning_rate,
            "genre_scores": self.genre_scores,
            "total_interactions": self.total_interactions,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "UserWeightProfile":
        return cls(
            user_id=data["user_id"],
            w_pref=data.get("w_pref", 0.5),
            w_trend=data.get("w_trend", 0.3),
            w_time=data.get("w_time", 0.2),
            learning_rate=data.get("learning_rate", 0.05),
            genre_scores=data.get("genre_scores", {}),
            total_interactions=data.get("total_interactions", 0),
        )


class WeightAdapter:
    """
    Applies the delta learning rule to a UserWeightProfile.

    Delta rule:  W_new = clamp(W_old + α × Δ)
    After every update the three main weights are re-normalised so they
    sum to 1.0, preserving the weighted-average semantics of the scorer.
    Genre confidence scores are updated separately and clamped to [-1, 1].
    """

    def adapt(
        self,
        profile: UserWeightProfile,
        feedback: FeedbackType,
        genres: List[str] = None,
    ) -> UserWeightProfile:
        """
        Apply one feedback signal to the profile and return the updated profile.
        Does NOT persist — the caller is responsible for saving to DB.
        """
        deltas = _FEEDBACK_DELTAS.get(feedback.value, {})
        alpha = profile.learning_rate

        # Apply weight deltas
        for key, delta in deltas.items():
            current = getattr(profile, key, 0.0)
            setattr(profile, key, current + alpha * delta)

        # Normalise so w_pref + w_trend + w_time == 1.0 (keeps scoring meaningful)
        profile = self._normalize_weights(profile)

        # Update genre confidence vector
        if genres:
            positive = feedback in (
                FeedbackType.COMPLETED, FeedbackType.HIGH_RATING,
                FeedbackType.SAVED, FeedbackType.SEASONAL_CLICK,
            )
            negative = feedback in (
                FeedbackType.LOW_RATING, FeedbackType.SKIPPED,
                FeedbackType.SEASONAL_SKIP,
            )
            for genre in genres:
                g = genre.lower()
                current_confidence = profile.genre_scores.get(g, 0.0)
                if positive:
                    profile.genre_scores[g] = min(
                        _GENRE_MAX, current_confidence + alpha * _GENRE_POSITIVE_DELTA
                    )
                elif negative:
                    profile.genre_scores[g] = max(
                        _GENRE_MIN, current_confidence - alpha * _GENRE_NEGATIVE_DELTA
                    )

        profile.total_interactions += 1
        return profile

    @staticmethod
    def _normalize_weights(profile: UserWeightProfile) -> UserWeightProfile:
        """Clamp each weight to [0.05, 0.90] then re-normalise to sum=1."""
        lo, hi = 0.05, 0.90
        profile.w_pref  = max(lo, min(hi, profile.w_pref))
        profile.w_trend = max(lo, min(hi, profile.w_trend))
        profile.w_time  = max(lo, min(hi, profile.w_time))

        total = profile.w_pref + profile.w_trend + profile.w_time
        if total > 0:
            profile.w_pref  /= total
            profile.w_trend /= total
            profile.w_time  /= total
        return profile


class TimeAwareRecommender:
    """Recommendation engine with time awareness and seasonal considerations"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.trend_weight = config.get("trend_weight", 0.3)
        self.preference_weight = config.get("preference_weight", 0.5)
        self.time_relevance_weight = config.get("time_relevance_weight", 0.2)
        self.min_similarity_score = config.get("min_similarity_score", 0.6)
        self.max_recommendations = config.get("max_recommendations", 10)
        self.seasonal_boost_multiplier = config.get("seasonal_boost_multiplier", 1.5)
        
        # Initialize TF-IDF vectorizer for text similarity (optional ML)
        self.vectorizer = TfidfVectorizer(
            stop_words='english',
            ngram_range=(1, 2),
            max_features=5000
        ) if _ML_AVAILABLE else None
    
    def get_current_season(self) -> Tuple[str, int]:
        """Get current anime season and year"""
        now = datetime.utcnow()
        month = now.month
        
        if month in [1, 2, 3]:
            season = "winter"
        elif month in [4, 5, 6]:
            season = "spring"
        elif month in [7, 8, 9]:
            season = "summer"
        else:
            season = "fall"
        
        return season, now.year
    
    def get_time_based_boost(self, content_year, content_status: str) -> float:
        """Calculate time-based boost factor"""
        now = datetime.utcnow()
        current_year = now.year

        # Guard: treat missing/None year as non-recent
        try:
            year = int(content_year) if content_year else 0
        except (TypeError, ValueError):
            year = 0

        # Boost current season content
        if year == current_year:
            return self.seasonal_boost_multiplier

        # Boost recent content (last 2 years)
        if year >= current_year - 2:
            return 1.2

        # Slight boost for ongoing series
        if content_status in ["Currently Airing", "Publishing"]:
            return 1.1

        return 1.0
    
    def analyze_mood(self, text: str) -> Dict[str, float]:
        """Analyze text to extract mood tags"""
        text_lower = text.lower()
        mood_scores = {}
        
        for mood in MOOD_TAGS:
            score = 0
            for keyword in mood.keywords:
                if keyword.lower() in text_lower:
                    score += 1
            
            if score > 0:
                mood_scores[mood.name] = score * mood.weight
        
        return mood_scores
    
    def calculate_genre_similarity(self, user_genres: List[str], content_genres: List[str]) -> float:
        """Calculate genre similarity between user preferences and content"""
        if not user_genres or not content_genres:
            return 0.0
        
        user_genres_lower = set(g.lower() for g in user_genres)
        content_genres_lower = set(g.lower() for g in content_genres)
        
        # Jaccard similarity
        intersection = user_genres_lower & content_genres_lower
        union = user_genres_lower | content_genres_lower
        
        if not union:
            return 0.0
        
        return len(intersection) / len(union)
    
    def calculate_preference_score(
        self,
        preferences: Dict[str, Any],
        content: Any,
        weight_profile: "UserWeightProfile" = None,
    ) -> float:
        """
        Calculate how well content matches user preferences.
        When a UserWeightProfile is supplied the genre confidence vector is
        used to boost (positive confidence) or penalise (negative confidence)
        genre matches beyond the base Jaccard similarity.
        """
        score = 0.0
        factors = {}

        # Genre matching
        user_genres = preferences.get("favorite_genres", [])
        content_genres = content.genres if hasattr(content, "genres") else []
        genre_sim = self.calculate_genre_similarity(user_genres, content_genres)

        # Apply ANN genre confidence if a profile is present
        if weight_profile and weight_profile.genre_scores and content_genres:
            confidence_boost = 0.0
            for g in content_genres:
                conf = weight_profile.genre_scores.get(g.lower(), 0.0)
                confidence_boost += conf
            confidence_boost = max(-0.2, min(0.2, confidence_boost / max(len(content_genres), 1)))
            genre_sim = max(0.0, min(1.0, genre_sim + confidence_boost))
            factors["genre_confidence_boost"] = confidence_boost

        factors["genre_match"] = genre_sim
        score += genre_sim * 0.4
        
        # Disliked genres penalty
        disliked = preferences.get("disliked_genres", [])
        if any(dg.lower() in [g.lower() for g in content_genres] for dg in disliked):
            score -= 0.3
            factors["disliked_genre_penalty"] = 0.3
        
        # Rating check
        min_rating = preferences.get("min_rating", 5.0)
        content_score = content.score if hasattr(content, "score") else 0
        if content_score >= min_rating:
            score += 0.2
            factors["rating_above_min"] = 0.2
        
        # Episode count check
        max_episodes = preferences.get("max_episode_count")
        content_episodes = getattr(content, "episodes", 0) or getattr(content, "chapters", 0)
        if max_episodes and content_episodes <= max_episodes:
            score += 0.1
            factors["episode_count_ok"] = 0.1
        
        # Year range check — guard against None year values from the API
        year_range = preferences.get("release_year_range", (2000, 2024))
        raw_year = getattr(content, "year", None)
        try:
            content_year = int(raw_year) if raw_year else 0
        except (TypeError, ValueError):
            content_year = 0
        if content_year and year_range[0] <= content_year <= year_range[1]:
            score += 0.1
            factors["year_in_range"] = 0.1
        
        # Studio preference
        preferred_studios = preferences.get("preferred_studios", [])
        content_studios = getattr(content, "studios", []) or []
        if any(ps.lower() in [s.lower() for s in content_studios] for ps in preferred_studios):
            score += 0.15
            factors["preferred_studio"] = 0.15
        
        # Source material preference
        preferred_sources = preferences.get("preferred_source_material", [])
        content_source = getattr(content, "source", "")
        if content_source.lower() in [s.lower() for s in preferred_sources]:
            score += 0.1
            factors["preferred_source"] = 0.1
        
        # Mood matching — guard against legacy JSON strings in preferences dict
        mood_prefs = preferences.get("mood_preferences", {})
        if isinstance(mood_prefs, str):
            try:
                import json as _json
                mood_prefs = _json.loads(mood_prefs)
            except Exception:
                mood_prefs = {}
        content_synopsis = content.synopsis if hasattr(content, "synopsis") else ""
        content_moods = self.analyze_mood(content_synopsis)
        
        mood_score = 0
        matched_moods = []
        for mood, weight in mood_prefs.items():
            if mood in content_moods:
                mood_score += content_moods[mood] * weight
                matched_moods.append(mood)
        
        if mood_prefs and matched_moods:
            score += min(0.2, mood_score / sum(mood_prefs.values()))
            factors["mood_match"] = min(0.2, mood_score / sum(mood_prefs.values()))
        
        return max(0, min(1, score)), factors
    
    def calculate_trend_score(self, trend_info: Dict[str, Any]) -> float:
        """Calculate trend-based score"""
        base_score = 0.0
        
        # Score based on ranking
        rank = trend_info.get("rank", 0)
        if rank <= 10:
            base_score += 0.4
        elif rank <= 25:
            base_score += 0.3
        elif rank <= 50:
            base_score += 0.2
        else:
            base_score += 0.1
        
        # Popularity boost
        popularity = trend_info.get("popularity", 0)
        if popularity > 100000:
            base_score += 0.3
        elif popularity > 50000:
            base_score += 0.2
        elif popularity > 10000:
            base_score += 0.1
        
        # Trend direction boost
        direction = trend_info.get("trend_direction", "stable")
        if direction == "up":
            base_score += 0.2
        elif direction == "down":
            base_score -= 0.1
        
        return max(0, min(1, base_score))
    
    def calculate_final_score(
        self,
        preference_score: float,
        trend_score: float,
        time_boost: float,
        weight_profile: "UserWeightProfile" = None,
    ) -> float:
        """
        Calculate final recommendation score.
        Uses per-user learned weights when a UserWeightProfile is supplied;
        falls back to global config weights otherwise.
        """
        w_pref  = weight_profile.w_pref  if weight_profile else self.preference_weight
        w_trend = weight_profile.w_trend if weight_profile else self.trend_weight
        w_time  = weight_profile.w_time  if weight_profile else self.time_relevance_weight
        return (
            preference_score * w_pref +
            trend_score      * w_trend +
            time_boost       * w_time
        )
    
    def generate_recommendations(
        self,
        contents: List[Any],
        user_preferences: Dict[str, Any],
        trends: List[Dict[str, Any]] = None,
        content_type: str = "anime",
        query: str = None,
        query_type: str = "description",
        weight_profile: "UserWeightProfile" = None,
    ) -> List[Recommendation]:
        """Generate personalized recommendations"""
        recommendations = []
        
        # Create trend lookup
        trend_lookup = {t.get("id"): t for t in trends} if trends else {}
        
        # Create TF-IDF matrix for text similarity if query provided (requires ML)
        similarities = None
        if query and _ML_AVAILABLE and self.vectorizer is not None:
            texts = [c.synopsis or "" for c in contents]
            query_texts = [query]
            all_texts = texts + query_texts
            tfidf_matrix = self.vectorizer.fit_transform(all_texts)
            query_vector = tfidf_matrix[-1]
            content_vectors = tfidf_matrix[:-1]
            similarities = cosine_similarity(content_vectors, query_vector).flatten()
        
        for i, content in enumerate(contents):
            # Get preference score (with optional genre confidence from ANN profile)
            preference_score, match_factors = self.calculate_preference_score(
                user_preferences, content, weight_profile=weight_profile
            )

            # Get trend score
            trend_info = trend_lookup.get(content.id, {})
            trend_score = self.calculate_trend_score(trend_info)

            # Get time boost
            content_year = content.year if hasattr(content, "year") else 0
            content_status = content.status if hasattr(content, "status") else ""
            time_boost = self.get_time_based_boost(content_year, content_status)

            # Add query similarity if provided and ML is available
            if query and similarities is not None:
                match_factors["query_similarity"] = float(similarities[i])
                preference_score = preference_score * 0.7 + float(similarities[i]) * 0.3

            # Calculate final score using per-user learned weights (or global fallback)
            final_score = self.calculate_final_score(
                preference_score, trend_score, time_boost, weight_profile=weight_profile
            )
            
            # Filter by minimum score
            if final_score >= self.min_similarity_score:
                # Generate recommendation reason
                reason = self._generate_reason(match_factors, content, user_preferences)
                
                recommendation = Recommendation(
                    id=str(uuid.uuid4()),
                    content_id=content.id,
                    content_type=content_type,
                    title=content.title,
                    title_english=content.title_english,
                    image_url=content.image_url,
                    synopsis=content.synopsis,
                    score=content.score,
                    relevance_score=final_score,
                    recommendation_reason=reason,
                    genres=content.genres,
                    year=content_year,
                    episodes=getattr(content, "episodes", 0) or getattr(content, "chapters", 0),
                    rating=getattr(content, "rating", ""),
                    match_factors=match_factors
                )
                recommendations.append(recommendation)
        
        # Sort by relevance score
        recommendations.sort(key=lambda x: x.relevance_score, reverse=True)
        
        return recommendations[:self.max_recommendations]
    
    def _generate_reason(self, match_factors: Dict[str, float], content: Any, preferences: Dict[str, Any]) -> str:
        """Generate human-readable recommendation reason"""
        reasons = []
        
        # Check genre match
        if match_factors.get("genre_match", 0) > 0.5:
            reasons.append(f"matches your favorite genres: {', '.join(content.genres[:3])}")
        
        # Check score
        if content.score >= 8.0:
            reasons.append("highly rated")
        
        # Check trend
        if match_factors.get("trend_direction") == "up":
            reasons.append("currently trending")
        
        # Check seasonal
        current_season, current_year = self.get_current_season()
        if content.year == current_year:
            reasons.append(f"from the current {current_season} season")
        
        # Check mood
        matched_moods = [m for m, s in match_factors.items() if m in [t.name for t in MOOD_TAGS] and s > 0.1]
        if matched_moods:
            reasons.append(f"matches your mood preferences: {', '.join(matched_moods)}")
        
        # Check studio
        if match_factors.get("preferred_studio", 0) > 0:
            reasons.append("from a preferred studio")
        
        if reasons:
            return "Recommended because it " + " and ".join(reasons[:2])
        else:
            return "Based on your viewing history and preferences"


class SimilarContentFinder:
    """Find similar content based on various factors"""
    
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            stop_words='english',
            ngram_range=(1, 2),
            max_features=5000
        ) if _ML_AVAILABLE else None
    
    def find_similar_by_title(
        self,
        target_title: str,
        all_contents: List[Any],
        limit: int = 5
    ) -> List[Tuple[Any, float]]:
        """Find similar content based on title similarity"""
        if not _ML_AVAILABLE or self.vectorizer is None:
            # Fallback: simple substring matching
            scored = [(c, 1.0 if target_title.lower() in c.title.lower() else 0.0) for c in all_contents]
            scored = [(c, s) for c, s in scored if c.title.lower() != target_title.lower()]
            scored.sort(key=lambda x: x[1], reverse=True)
            return scored[:limit]

        titles = [c.title for c in all_contents] + [target_title]
        tfidf_matrix = self.vectorizer.fit_transform(titles)
        
        target_vector = tfidf_matrix[-1]
        content_vectors = tfidf_matrix[:-1]
        similarities = cosine_similarity(content_vectors, target_vector).flatten()
        
        # Sort by similarity and exclude the target itself
        indexed = [(all_contents[i], similarities[i]) for i in range(len(all_contents))]
        indexed = [(content, sim) for content, sim in indexed if content.title.lower() != target_title.lower()]
        indexed.sort(key=lambda x: x[1], reverse=True)
        
        return indexed[:limit]
    
    def find_similar_by_genre(
        self,
        target_genres: List[str],
        all_contents: List[Any],
        exclude_id: str = None,
        limit: int = 5
    ) -> List[Tuple[Any, float]]:
        """Find similar content based on genre overlap"""
        scored = []
        
        target_genres_lower = set(g.lower() for g in target_genres)
        
        for content in all_contents:
            if exclude_id and content.id == exclude_id:
                continue
            
            content_genres_lower = set(g.lower() for g in content.genres)
            intersection = target_genres_lower & content_genres_lower
            union = target_genres_lower | content_genres_lower
            
            if union:
                similarity = len(intersection) / len(union)
                scored.append((content, similarity))
        
        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:limit]
    
    def find_similar_by_synopsis(
        self,
        target_synopsis: str,
        all_contents: List[Any],
        exclude_id: str = None,
        limit: int = 5
    ) -> List[Tuple[Any, float]]:
        """Find similar content based on synopsis text similarity"""
        if not _ML_AVAILABLE or self.vectorizer is None:
            # Fallback: return first N items excluding target
            return [(c, 0.5) for c in all_contents if c.id != exclude_id][:limit]

        synopses = [c.synopsis or "" for c in all_contents] + [target_synopsis]
        tfidf_matrix = self.vectorizer.fit_transform(synopses)
        
        target_vector = tfidf_matrix[-1]
        content_vectors = tfidf_matrix[:-1]
        similarities = cosine_similarity(content_vectors, target_vector).flatten()
        
        indexed = [(all_contents[i], similarities[i]) for i in range(len(all_contents))]
        indexed = [(content, sim) for content, sim in indexed if content.id != exclude_id]
        indexed.sort(key=lambda x: x[1], reverse=True)
        
        return indexed[:limit]


class RecommendationExplainability:
    """Provide explanations for recommendations"""
    
    def __init__(self):
        self.explanation_templates = {
            "genre_match": "This matches your interest in {genres}",
            "high_rating": "With a score of {score}, it's highly rated by the community",
            "trending": "It's currently trending {direction}",
            "seasonal": "It's from the {season} {year} season",
            "mood_match": "It matches your {moods} mood preference",
            "similar_to_liked": "It shares similarities with {titles}",
            "new_release": "It's a new release you might enjoy",
            "popular": "It's popular among users with similar tastes"
        }
    
    def explain_recommendation(self, recommendation: Recommendation, user_preferences: Dict[str, Any]) -> Dict[str, Any]:
        """Generate detailed explanation for a recommendation"""
        explanations = []
        scores = {}
        
        # Genre explanation
        if recommendation.genres:
            matched_genres = [g for g in recommendation.genres if g in user_preferences.get("favorite_genres", [])]
            if matched_genres:
                explanations.append(self.explanation_templates["genre_match"].format(
                    genres=", ".join(matched_genres[:3])
                ))
                scores["genre"] = 0.3
        
        # Rating explanation
        if recommendation.score >= 8.0:
            explanations.append(self.explanation_templates["high_rating"].format(
                score=recommendation.score
            ))
            scores["rating"] = 0.2
        
        # Match factors
        match_factors = recommendation.match_factors
        if match_factors.get("trend_direction") == "up":
            explanations.append(self.explanation_templates["trending"].format(direction="upward"))
            scores["trending"] = 0.15
        
        # Mood explanation
        if match_factors:
            moods = [k for k in match_factors.keys() if k in [t.name for t in MOOD_TAGS]]
            if moods:
                explanations.append(self.explanation_templates["mood_match"].format(
                    moods=", ".join(moods[:2])
                ))
                scores["mood"] = 0.15
        
        return {
            "recommendation_id": recommendation.id,
            "title": recommendation.title,
            "score": recommendation.relevance_score,
            "explanations": explanations,
            "factor_scores": scores,
            "primary_reason": explanations[0] if explanations else recommendation.recommendation_reason,
            "all_genres": recommendation.genres,
            "year": recommendation.year,
            "rating": recommendation.rating
        }
