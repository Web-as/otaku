"""
Chat and Interaction Module for AnimeMangaAgent
Provides conversational AI capabilities and interaction awareness
"""
import json
import uuid
import re
import random
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, field, asdict
from enum import Enum
from collections import defaultdict

from .knowledge import AnimeKnowledgeBase, AgentPersonality, AgentDebateSystem


class InteractionType(Enum):
    """Types of user interactions"""
    ADD_ANIME = "add_anime"
    ADD_MANGA = "add_manga"
    WATCH_PROGRESS = "watch_progress"
    COMPLETE_CONTENT = "complete_content"
    RATE_CONTENT = "rate_content"
    SEARCH_QUERY = "search_query"
    SAVE_LINK = "save_link"
    VIEW_DETAILS = "view_details"
    GET_RECOMMENDATION = "get_recommendation"


@dataclass
class UserInteraction:
    """Record of user interaction with the agent"""
    id: str
    user_id: str
    interaction_type: InteractionType
    content_id: Optional[str]
    content_title: str
    content_type: str
    timestamp: datetime = field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "interaction_type": self.interaction_type.value,
            "content_id": self.content_id,
            "content_title": self.content_title,
            "content_type": self.content_type,
            "timestamp": self.timestamp.isoformat(),
            "metadata": self.metadata
        }


@dataclass
class AgentComment:
    """Agent's comment on user interaction"""
    id: str
    user_id: str
    content_id: str
    content_type: str
    content_title: str
    comment_type: str  # "greeting", "fact", "trivia", "observation", "question"
    message: str
    is_spoiler_free: bool = True
    timestamp: datetime = field(default_factory=datetime.utcnow)
    related_interaction_id: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "content_id": self.content_id,
            "content_type": self.content_type,
            "content_title": self.content_title,
            "comment_type": self.comment_type,
            "message": self.message,
            "is_spoiler_free": self.is_spoiler_free,
            "timestamp": self.timestamp.isoformat(),
            "related_interaction_id": self.related_interaction_id
        }


@dataclass
class ChatMessage:
    """Chat message between user and agent"""
    id: str
    user_id: str
    role: str  # "user" or "agent"
    message: str
    timestamp: datetime = field(default_factory=datetime.utcnow)
    context: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "role": self.role,
            "message": self.message,
            "timestamp": self.timestamp.isoformat(),
            "context": self.context
        }


class SpoilerFreeCommentGenerator:
    """
    Generate spoiler-free comments about anime/manga.
    Persona: The Otaku Librarian
    """
    
    # Spoiler keywords to avoid
    SPOILER_KEYWORDS = [
        "dies", "death", "killed", "murdered", "spoiler",
        "twist", "ending", "revealed", "secret", "truth",
        "kills", "destroyed", "defeated", "betrayed",
        "turns out", "it was actually", "the real reason"
    ]
    
    # Otaku persona greetings and phrases
    OTAKU_GREETINGS = [
        "An excellent selection from our collection.",
        "Ah, you've chosen this volume. Let me pull up its file.",
        "A fine choice. This one is quite popular with our patrons.",
        "*adjusts glasses* A most discerning selection. Let's review the archival data.",
        "Checking this one out, are we? Very well."
    ]
    
    # Genre-based reviews (spoiler-free, detailed)
    GENRE_REVIEWS = {
        "Action": "🔥 This one's an ACTION MASTERPIECE! Expect heart-pounding battles, epic choreography, and moments that'll have you on the edge of your seat. The animation quality in modern action series is absolutely stunning!",
        "Adventure": "🌟 Ah, the spirit of ADVENTURE! This series embodies the classic hero's journey. Get ready for world-building that transports you to incredible realms, companion bonds that warm the heart, and discoveries around every corner!",
        "Comedy": "🤣 Prepare for LAUGHTER! This comedy is pure joy. The humor ranges from clever wordplay to absurd situations. Perfect for when you need a good pick-me-up!",
        "Drama": "💔 BRACE YOURSELF! This drama digs deep into the human experience. The emotional journey here is profound - have your tissues ready. Character development is top-notch!",
        "Fantasy": "🔮 Welcome to a world of WONDER! Fantasy at its finest. Magic systems, mythical creatures, and epic quests await. The world-building alone deserves applause!",
        "Sci-Fi": "🚀 INTO THE FUTURE! Sci-fi excellence awaits. Think AI takeovers, space exploration, philosophical questions about humanity, and tech that makes our reality look primitive!",
        "Horror": "👻 YOU DARING SOUL! Horror that sends shivers down your spine. Atmospheric tension, psychological dread, and moments that make you check over your shoulder. Not for the faint of heart!",
        "Romance": "💕 Ah, ROMANCE! Beautiful, heartfelt, and sometimes painful. The chemistry between characters here is electric. Get ready for all the feels - warm fuzzies and occasional heartache!",
        "Mystery": "🕵️ MYSTERY TIME! Prepare to have your brain engaged. Clues planted carefully, red herrings abound, and that satisfaction of solving the puzzle before the reveal. Elementary, my dear viewer!",
        "Thriller": "😱 EDGE OF YOUR SEAT TIME! Suspense that grips you tight and doesn't let go. Plot twists that make your jaw drop. This is storytelling at its most gripping!",
        "Sports": "⚽ LET'S GOOO! SPORTS ANIME - where passion meets athletic excellence! The determination, the training montages, the underdog stories, the victories! This will get your adrenaline pumping!",
        "Music": "🎵 HARMONIES AHEAD! Music anime that touches the soul. Whether it's classical, rock, or idol culture, these stories celebrate the power of music to connect and inspire!",
        "Psychological": "🧠 MIND BENDER ALERT! This one plays with your perceptions. Reality vs illusion, twisted narratives, and themes that make you think long after the credits roll!",
        "Slice of Life": "☕ RELAXING VIBES! Slice of life at its most comforting. These stories celebrate the beauty in everyday moments, friendship, and personal growth. Perfect for a peaceful viewing experience!",
        "Isekai": "🌍 ANOTHER WORLD! Welcome to isekai - where ordinary life meets extraordinary adventure. Portal fantasies that let us escape to worlds of magic, mecha, or political intrigue!",
        "Shounen": "💪 THE POWER OF FRIENDSHIP SHINES! Shounen at its core - growth, perseverance, and bonds that transcend all. The journey from zero to hero is always satisfying!",
        "Shojo": "💖 SHOJO GLORY! Romance, drama, and beautiful aesthetics. Character-driven stories that explore relationships, self-discovery, and the complexity of emotions. Absolutely stunning visuals!",
        "Seinen": "🗡️ MATURE THEMES AHEAD! Seinen offers complex narratives, moral ambiguity, and storytelling that doesn't shy away from darker aspects. This is sophisticated viewing!",
        "Mecha": "🤖 GIANT ROBOTS! Mecha anime - where humanity's creations become extensions of our hopes and fears. Epic scale battles and themes about technology and humanity!",
        "Cyberpunk": "💾 NEON-DRENCHED FUTURE! Cyberpunk atmosphere - high-tech meets low-life. Dystopian settings, corporate conspiracies, and characters fighting for their humanity in a dehumanizing world!"
    }
    
    # Studio reputations
    STUDIO_COMMENTS = {
        "Kyoto Animation": "🏠 Kyoto Animation: Archived for their mastery of character animation and emotional nuance.",
        "ufotable": "⚔️ ufotable: Known for their exceptional digital animation and dynamic action sequences.",
        "MAPPA": "🎨 MAPPA: A prolific modern studio, catalogued for their high-quality adaptations of popular manga.",
        "Studio Ghibli": "🐉 Studio Ghibli: The cornerstone of our feature film wing. Timeless classics.",
        "Pierrot": "📺 Pierrot: Specialists in long-running shonen series that have defined generations.",
        "Wit Studio": "🗡️ Wit Studio - known for epic fantasy adaptations with gorgeous animation!",
        "Madhouse": "🎬 Madhouse - versatile studio that's delivered countless classics across genres!",
        "A-1 Pictures": "✨ A-1 Pictures - consistent quality and beautiful productions!",
        "Sunrise": "🚀 Sunrise - the mecha legends! They've defined the genre for decades!",
        "Bones": "🦴 Bones - home to incredible animation and fan-favorite adaptations!",
        "PA Works": "🌸 PA Works - known for beautiful, atmospheric productions!",
        "Shaft": "🌀 Shaft - unique visual style that pushes creative boundaries!",
        "Production I.G": "👁️ Production I.G - technically brilliant and thematically complex!",
        "Trigger": "💥 Trigger - high-energy, colorful, and unapologetically bold!",
        "White Fox": "❄️ White Fox - masters of adapting complex source material!",
    }
    
    def __init__(self):
        self.comment_templates = self._load_templates()
    
    def _load_templates(self) -> Dict[str, List[str]]:
        """Load comment templates with otaku persona"""
        return {
            "greeting": [
                "You've selected {title}. Allow me to provide the archival summary.",
                "Ah, {title}. This volume has quite the circulation history.",
                "Regarding {title}... let me pull up the file."
            ],
            "fact": [
                "🎬 Archival note: {fact}",
                "📚 From the records: {fact}",
                "💡 A point of interest: {fact}"
            ],
            "observation": [
                "This volume is catalogued under {genres}...",
                "Patron rating for this volume is {score}/10...",
                "Archived publication dates: {start_date} to {end_date}."
            ],
            "review_style": [
                "🎯 Librarian's Assessment: {verdict}",
                "📖 Archival Summary: {review}",
                "⭐ Catalogued Rating & Notes: {rating}"
            ]
        }
    
    def generate_add_comment(
        self,
        content: Any,
        user_history: List[UserInteraction],
        is_spoiler_free: bool = True
    ) -> str:
        """Generate an otaku-style review comment when user adds content"""
        comments = []
        
        # Persona greeting
        import random
        comments.append(random.choice(self.OTAKU_GREETINGS))
        comments.append(f"\nYou've added **{content.title}** to your checkout list. Here is the archival record for this volume:")
        
        # Score and rating
        if hasattr(content, "score") and content.score:
            score_emoji = "🌟" if content.score >= 8 else "⭐" if content.score >= 7 else "📊" if content.score >= 6 else "🤔"
            comments.append(f"\n{score_emoji} PATRON RATING: {content.score}/10")
            if content.score >= 8:
                comments.append("This volume is held in high regard by our patrons.")
            elif content.score >= 7:
                comments.append("A well-regarded volume with positive circulation history.")
        
        # Type and format
        if hasattr(content, "type") and content.type:
            content_type = content.type
            type_info = f"\n📺 FORMAT: {content_type}"
            if content_type == "TV":
                type_info += " (Standard TV series - expect 12-26 episodes typically)"
            elif content_type == "Movie":
                type_info += " (Feature film - approximately 1.5-2 hours)"
            elif content_type == "OVA":
                type_info += " (Original Video Animation - bonus content!)"
            elif content_type == "ONA":
                type_info += " (Original Net Animation - web series!)"
            comments.append(type_info)
        
        # Episode/chapter count
        if hasattr(content, "episodes") and content.episodes:
            comments.append(f"\n📈 LENGTH: {content.episodes} Episodes")
            if content.episodes <= 12:
                comments.append("A short-form series, suitable for a single checkout period.")
            elif content.episodes <= 26:
                comments.append("A standard-length series, offering a complete narrative arc.")
            elif content.episodes <= 100:
                comments.append("A long-running series, requiring a significant time investment.")
            else:
                comments.append("An epic, one of the longest volumes in our collection.")
        
        if hasattr(content, "chapters") and content.chapters:
            comments.append(f"\n📚 LENGTH: {content.chapters} Chapters")
        
        # Genres with detailed reviews
        if hasattr(content, "genres") and content.genres:
            comments.append(f"\n🏷️ CATALOGUED GENRES:")
            for genre in content.genres[:4]:
                if genre in self.GENRE_REVIEWS:
                    comments.append(f"\n• {genre.upper()}: {self.GENRE_REVIEWS[genre]}")
                else:
                    comments.append(f"\n• {genre}: A {genre.lower()} series worth exploring!")
        
        # Studio with reputation
        if hasattr(content, "studios") and content.studios:
            comments.append(f"\n🏭 PUBLISHER / STUDIO:")
            for studio in content.studios[:2]:
                if studio in self.STUDIO_COMMENTS:
                    comments.append(f"• {studio}: {self.STUDIO_COMMENTS[studio]}")
                else:
                    comments.append(f"• {studio}: A studio with their own style!")
        
        # Source material
        if hasattr(content, "source") and content.source:
            comments.append(f"\n📖 SOURCE MATERIAL: {content.source}")
            if content.source == "Original":
                comments.append("(An original work, not adapted from other media.)")
            elif content.source == "Manga":
                comments.append("(This is an adaptation of a manga series.)")
            elif content.source == "Light novel":
                comments.append("(Adapted from a light novel series.)")
            elif content.source == "Visual novel":
                comments.append("(Adapted from a visual novel.)")
            elif content.source == "Web manga":
                comments.append("(Adapted from a web manga.)")
        
        # Airing status
        if hasattr(content, "airing") and content.airing:
            comments.append(f"\n🔴 STATUS: Currently Publishing")
            comments.append("(New volumes are arriving periodically. Please check back for updates.)")
        elif hasattr(content, "status"):
            status_map = {
                "Finished Airing": "✅ Concluded - All volumes are available for checkout.",
                "Currently Airing": "🔴 Publishing - New volumes are arriving periodically.",
                "Not yet aired": "📅 Forthcoming - This volume has been announced but is not yet available.",
                "Finished": "✅ Concluded - All volumes are available.",
                "Publishing": "🔴 Publishing - New volumes are arriving periodically.",
                "Discontinued": "⚠️ Discontinued - This series was concluded prematurely. Proceed with caution."
            }
            status_text = status_map.get(content.status, content.status)
            comments.append(f"\n📅 STATUS: {status_text}")
        
        # Air dates
        if hasattr(content, "aired_start") and content.aired_start:
            start = content.aired_start.strftime("%B %Y")
            end = "Present" if (hasattr(content, "airing") and content.airing) else (content.aired_end.strftime("%B %Y") if hasattr(content, "aired_end") and content.aired_end else "TBD")
            comments.append(f"\n📆 AIRED: {start} to {end}")
        
        # Audience rating
        if hasattr(content, "rating") and content.rating:
            rating_map = {
                "G": "👶 All Ages - family friendly!",
                "PG": "👧 Suitable for older children",
                "PG-13": "🧑 teens 13 and up",
                "R": "🔞 17+ (violence, language)",
                "Rx": "🔞 Adults only (contains adult content)"
            }
            rating_text = rating_map.get(content.rating, content.rating)
            comments.append(f"\n👥 AUDIENCE: {rating_text}")
        
        # Final verdict section
        comments.append(f"\n{'='*50}")
        comments.append(f"🎯 LIBRARIAN'S NOTE ON {content.title.upper()}:")
        comments.append(f"{'='*50}")
        
        if hasattr(content, "score") and content.score >= 8:
            comments.append("RECOMMENDATION: Essential. This volume is a cornerstone of its genre and is highly recommended for all patrons.")
        elif hasattr(content, "score") and content.score >= 7:
            comments.append("RECOMMENDATION: Recommended. A strong, well-regarded work, particularly for fans of the genre.")
        elif hasattr(content, "score") and content.score >= 6:
            comments.append("RECOMMENDATION: For Consideration. A worthwhile volume, though it may have some noted flaws. Best for genre enthusiasts.")
        else:
            comments.append("RECOMMENDATION: Niche Appeal. This volume may be of interest to patrons with very specific tastes.")
        
        # Discussion prompt
        comments.append(f"\nI trust this information is satisfactory. If you have further inquiries about {content.title}, feel free to ask. Enjoy your reading/viewing.")
        
        return "\n".join(comments)
    
    def generate_fact_comment(self, facts: List[str]) -> str:
        """Generate comment with interesting facts"""
        if not facts:
            return ""
        
        comments = ["Here's some trivia about this title:\n"]
        for i, fact in enumerate(facts[:3], 1):  # Max 3 facts
            comments.append(f"{i}. {fact}")
        
        return "\n".join(comments)
    
    def generate_discussion_prompt(self, content: Any) -> str:
        """Generate discussion prompts about the content"""
        prompts = []
        
        # Character-focused prompts
        if hasattr(content, "type"):
            if content.type in ["TV", "ONA"]:
                prompts.append("Who's your favorite character so far?")
            elif content.type == "Manga":
                prompts.append("Which character resonates with you the most?")
        
        # Genre-based prompts
        if hasattr(content, "genres"):
            if "Romance" in content.genres:
                prompts.append("What do you think about the relationship development?")
            if "Action" in content.genres:
                prompts.append("Which fight scene was your favorite?")
            if "Mystery" in content.genres:
                prompts.append("Did you see the plot twist coming?")
        
        # General prompts
        prompts.append("What made you interested in this title?")
        prompts.append("How would you describe this series to a friend?")
        
        return "Here are some discussion topics:\n" + "\n".join(f"- {p}" for p in prompts[:3])
    
    def _find_similar_in_history(
        self,
        content: Any,
        history: List[UserInteraction]
    ) -> Optional[str]:
        """Find similar content in user history"""
        content_genres = set(g.lower() for g in getattr(content, "genres", []))
        
        for interaction in history[-10:]:  # Check last 10 interactions
            if interaction.content_type == content.content_type:
                # Simple genre overlap check
                # In a real implementation, you'd fetch the other content's genres
                return interaction.content_title
        
        return None
    
    def is_spoiler_free(self, text: str) -> bool:
        """Check if text contains potential spoilers"""
        text_lower = text.lower()
        for keyword in self.SPOILER_KEYWORDS:
            if keyword in text_lower:
                # Check context
                if "potential" not in text_lower and "might" not in text_lower:
                    return False
        return True


class ChatManager:
    """Manage chat conversations with the agent"""
    
    def __init__(self, db, jikan_client, config: Dict[str, Any] = None):
        self.db = db
        self.jikan = jikan_client
        self.config = config or {}
        self.comment_generator = SpoilerFreeCommentGenerator()
        self.chat_history: Dict[str, List[ChatMessage]] = defaultdict(list)
        self.interactions: Dict[str, List[UserInteraction]] = defaultdict(list)
        self.comments: Dict[str, List[AgentComment]] = defaultdict(list)
        
        # Initialize memory system
        from .memory import AgentMemory
        self.memory = AgentMemory(db)
        
        # Memory-aware responses
        self.memory_aware_phrases = [
            "Ah, I remember mentioning this before...",
            "Based on our previous conversation...",
            "You told me earlier that...",
            "I recall you were interested in...",
            "As we discussed before..."
        ]
    
    def record_interaction(
        self,
        user_id: str,
        interaction_type: InteractionType,
        content_id: Optional[str],
        content_title: str,
        content_type: str,
        metadata: Dict[str, Any] = None
    ) -> UserInteraction:
        """Record a user interaction"""
        interaction = UserInteraction(
            id=str(uuid.uuid4()),
            user_id=user_id,
            interaction_type=interaction_type,
            content_id=content_id,
            content_title=content_title,
            content_type=content_type,
            metadata=metadata or {}
        )
        
        self.interactions[user_id].append(interaction)
        
        # Save to database
        self._save_interaction(interaction)
        
        return interaction
    
    def _save_interaction(self, interaction: UserInteraction):
        """Save interaction to database"""
        try:
            self.db.create_interaction(interaction)
        except Exception:
            pass  # Ignore if table doesn't exist
    
    def generate_add_comment(
        self,
        user_id: str,
        content_id: str,
        content_type: str,
        content_title: str
    ) -> AgentComment:
        """Generate and return agent comment when content is added"""
        # Get content details
        content = None
        if content_type == "anime":
            content = self.jikan.get_anime(content_id)
        else:
            content = self.jikan.get_manga(content_id)
        
        # Get user history
        history = self.interactions.get(user_id, [])
        
        # Generate comment
        comment_text = self.comment_generator.generate_add_comment(content, history)
        
        # Create comment object
        comment = AgentComment(
            id=str(uuid.uuid4()),
            user_id=user_id,
            content_id=content_id,
            content_type=content_type,
            content_title=content_title,
            comment_type="observation",
            message=comment_text,
            is_spoiler_free=True
        )
        
        self.comments[user_id].append(comment)
        
        return comment
    
    def get_facts_about_content(self, content_id: str, content_type: str) -> List[str]:
        """Get interesting facts about content"""
        facts = []
        
        # Fetch content details
        if content_type == "anime":
            content = self.jikan.get_anime(content_id)
        else:
            content = self.jikan.get_manga(content_id)
        
        if not content:
            return facts
        
        # Generate facts based on content info
        if hasattr(content, "studios") and content.studios:
            facts.append(f"It was produced by {', '.join(content.studios)}")
        
        if hasattr(content, "source") and content.source:
            facts.append(f"It's based on {content.source}")
        
        if hasattr(content, "aired_start") and content.aired_start:
            facts.append(f"It started airing on {content.aired_start.strftime('%B %d, %Y')}")
        
        if hasattr(content, "score") and content.score:
            facts.append(f"It's rated {content.score}/10 by the community")
        
        if hasattr(content, "popularity") and content.popularity:
            facts.append(f"It's ranked #{content.popularity} in popularity")
        
        if hasattr(content, "episodes") and content.episodes:
            facts.append(f"It has {content.episodes} episodes")
        
        if hasattr(content, "genres") and content.genres:
            facts.append(f"It falls under the genres: {', '.join(content.genres)}")
        
        return facts
    
    def chat(
        self,
        user_id: str,
        user_message: str,
        context: Dict[str, Any] = None
    ) -> Tuple[str, Dict[str, Any]]:
        """Process user chat message and generate response"""
        # Record message
        user_msg = ChatMessage(
            id=str(uuid.uuid4()),
            user_id=user_id,
            role="user",
            message=user_message,
            context=context or {}
        )
        self.chat_history[user_id].append(user_msg)
        
        # Analyze message intent
        intent = self._analyze_intent(user_message)
        
        # Generate response based on intent
        response, metadata = self._generate_response(user_id, intent, user_message)
        
        # Record agent response
        agent_msg = ChatMessage(
            id=str(uuid.uuid4()),
            user_id=user_id,
            role="agent",
            message=response,
            context=metadata
        )
        self.chat_history[user_id].append(agent_msg)
        
        return response, metadata
    
    def _analyze_intent(self, message: str) -> str:
        """Analyze user message intent"""
        message_lower = message.lower()
        
        # Check for common intents
        if any(word in message_lower for word in ["recommend", "suggest", "what should i watch"]):
            return "recommendation"
        elif any(word in message_lower for word in ["fact", "trivia", "did you know", "interesting"]):
            return "facts"
        elif any(word in message_lower for word in ["similar", "like", "other"]):
            return "similar"
        elif any(word in message_lower for word in ["discuss", "think about", "opinion"]):
            return "discussion"
        elif any(word in message_lower for word in ["what is", "tell me about", "info"]):
            return "info"
        elif any(word in message_lower for word in ["help", "how", "what can you do"]):
            return "help"
        else:
            return "general"
    
    def _generate_response(
        self,
        user_id: str,
        intent: str,
        message: str
    ) -> Tuple[str, Dict[str, Any]]:
        """Generate response based on intent"""
        responses = {
            "recommendation": (
                "I'd be happy to recommend something for you! To give you the best suggestions, "
                "could you tell me what genres you enjoy? Or if there's a specific anime/manga you recently "
                "loved that I can use as a reference?"
            ),
            "facts": (
                "I can share interesting facts about anime and manga! Just tell me which title "
                "you're curious about, and I'll look up some trivia for you."
            ),
            "similar": (
                "Looking for similar titles is my specialty! Which anime or manga did you enjoy "
                "recently? I can find others with similar themes, genres, or vibes."
            ),
            "discussion": (
                "I love discussing anime and manga! Whether you want to talk about character development, "
                "plot themes, or just share your thoughts on a series, I'm here for it. What series "
                "is on your mind?"
            ),
            "info": (
                "I can provide information about any anime or manga. Just give me the name, "
                "and I'll fetch details like score, genres, synopsis, and where to watch/read it."
            ),
            "help": (
                "Here's what I can help you with:\n"
                "🔍 Search for anime and manga\n"
                "🎯 Get personalized recommendations\n"
                "📚 Learn interesting facts about titles\n"
                "💬 Discuss your favorite series\n"
                "🔗 Find where to watch/read content\n"
                "📖 Track your watch history\n\n"
                "What would you like to do?"
            ),
            "general": (
                "I'm your anime and manga companion! I can help you discover new series, "
                "find similar titles, share interesting facts, and discuss your favorites. "
                "What are you in the mood for today?"
            )
        }
        
        return responses.get(intent, responses["general"]), {"intent": intent}
    
    def get_interaction_summary(self, user_id: str) -> Dict[str, Any]:
        """Get summary of user interactions"""
        interactions = self.interactions.get(user_id, [])
        
        # Group by content type
        anime_count = sum(1 for i in interactions if i.content_type == "anime")
        manga_count = sum(1 for i in interactions if i.content_type == "manga")
        
        # Recent interactions
        recent = sorted(interactions, key=lambda x: x.timestamp, reverse=True)[:5]
        
        return {
            "total_interactions": len(interactions),
            "anime_added": anime_count,
            "manga_added": manga_count,
            "recent_activity": [
                {
                    "type": i.interaction_type.value,
                    "title": i.content_title,
                    "timestamp": i.timestamp.isoformat()
                }
                for i in recent
            ]
        }
    
    def get_user_comments(self, user_id: str, limit: int = 10) -> List[AgentComment]:
        """Get recent agent comments for user"""
        return self.comments.get(user_id, [])[-limit:]
    
    def get_chat_history(self, user_id: str, limit: int = 20) -> List[ChatMessage]:
        """Get recent chat history for user"""
        return self.chat_history.get(user_id, [])[-limit:]
    
    def clear_chat_history(self, user_id: str):
        """Clear chat history for user"""
        self.chat_history[user_id] = []


class InteractionAwareAgent:
    """Agent that tracks and learns from user interactions"""
    
    def __init__(self, chat_manager: ChatManager, recommender):
        self.chat_manager = chat_manager
        self.recommender = recommender
    
    def on_content_added(
        self,
        user_id: str,
        content_id: str,
        content_type: str,
        content_title: str
    ) -> AgentComment:
        """Handle content being added - generate response"""
        # Record interaction
        interaction_type = InteractionType.ADD_ANIME if content_type == "anime" else InteractionType.ADD_MANGA
        self.chat_manager.record_interaction(
            user_id, interaction_type, content_id, content_title, content_type
        )
        
        # Generate and return agent comment
        return self.chat_manager.generate_add_comment(user_id, content_id, content_type, content_title)
    
    def on_watch_progress(
        self,
        user_id: str,
        content_id: str,
        content_type: str,
        content_title: str,
        progress_percent: float
    ) -> str:
        """Handle watch progress update"""
        self.chat_manager.record_interaction(
            user_id,
            InteractionType.WATCH_PROGRESS,
            content_id,
            content_title,
            content_type,
            {"progress_percent": progress_percent}
        )
        
        if progress_percent >= 100:
            return f"🎉 Congratulations on completing {content_title}! How did you enjoy it?\n\nWhat would you rate it?"
        elif progress_percent >= 50:
            return f"📺 You're halfway through {content_title}! How's it going so far?"
        elif progress_percent >= 25:
            return f"📖 Making progress on {content_title}! What do you think so far?"
        else:
            return f"🌟 Just started {content_title}? Hope you're enjoying it!"
    
    def on_rating(
        self,
        user_id: str,
        content_id: str,
        content_type: str,
        content_title: str,
        rating: float
    ) -> str:
        """Handle content rating"""
        self.chat_manager.record_interaction(
            user_id,
            InteractionType.RATE_CONTENT,
            content_id,
            content_title,
            content_type,
            {"rating": rating}
        )
        
        if rating >= 8:
            return f"⭐ You rated **{content_title}** {rating}/10! That's a great score! It seems to have left a strong impression on you."
        elif rating >= 5:
            return f"📊 You gave **{content_title}** a {rating}/10. Thanks for the rating!"
        else:
            return f"💭 You rated **{content_title}** {rating}/10. Not your cup of tea? That's okay - everyone has different tastes!"
    
    def get_interaction_insights(self, user_id: str) -> Dict[str, Any]:
        """Get insights based on user interactions"""
        summary = self.chat_manager.get_interaction_summary(user_id)
        
        # Analyze preferences
        interactions = self.chat_manager.interactions.get(user_id, [])
        genres = []
        for i in interactions:
            if i.content_id:
                # In real implementation, fetch content genres
                pass
        
        return {
            "summary": summary,
            "insights": {
                "activity_level": "high" if summary["total_interactions"] > 20 else "medium" if summary["total_interactions"] > 5 else "low",
                "preferred_type": "anime" if summary["anime_added"] > summary["manga_added"] else "manga" if summary["manga_added"] > summary["anime_added"] else "both"
            }
        }
