"""
Agent Memory System
Mimics human memory: short-term (working) and long-term (persistent)
"""
import json
import uuid
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field, asdict
from enum import Enum
from collections import deque


class MemoryType(Enum):
    """Types of memory"""
    SHORT_TERM = "short_term"
    LONG_TERM = "long_term"
    EPISODIC = "episodic"  # Specific events/conversations
    SEMANTIC = "semantic"  # Facts and knowledge
    PROCEDURAL = "procedural"  # How to do things


@dataclass
class Memory:
    """Individual memory entry"""
    id: str
    user_id: str
    memory_type: MemoryType
    content: str
    importance: float  # 0.0 to 1.0
    access_count: int = 0
    last_accessed: Optional[datetime] = None
    created_at: datetime = field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = None
    context: Dict[str, Any] = field(default_factory=dict)
    tags: List[str] = field(default_factory=list)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "memory_type": self.memory_type.value,
            "content": self.content,
            "importance": self.importance,
            "access_count": self.access_count,
            "last_accessed": self.last_accessed.isoformat() if self.last_accessed else None,
            "created_at": self.created_at.isoformat(),
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
            "context": self.context,
            "tags": self.tags
        }
    
    def should_expire(self) -> bool:
        """Check if memory should expire"""
        if not self.expires_at:
            return False
        return datetime.utcnow() > self.expires_at


@dataclass
class ConversationTurn:
    """A single turn in conversation"""
    id: str
    user_id: str
    role: str  # "user" or "agent"
    message: str
    timestamp: datetime = field(default_factory=datetime.utcnow)
    memory_triggered: List[str] = field(default_factory=list)  # Memory IDs referenced
    context: Optional[Dict[str, Any]] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "role": self.role,
            "message": self.message,
            "timestamp": self.timestamp.isoformat(),
            "memory_triggered": self.memory_triggered,
            "context": self.context or {},
        }


@dataclass
class AgentNote:
    """Notes the agent makes to self"""
    id: str
    user_id: str
    title: str
    content: str
    memory_type: MemoryType = MemoryType.LONG_TERM
    importance: float = 0.5
    related_content_id: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "content": self.content,
            "memory_type": self.memory_type.value,
            "importance": self.importance,
            "related_content_id": self.related_content_id,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }


class ShortTermMemory:
    """
    Human-like short-term (working) memory
    - Limited capacity (~7 items)
    - Decays over time if not rehearsed
    - Holds recent conversation context
    """
    
    def __init__(self, max_items: int = 10, decay_minutes: int = 30):
        self.max_items = max_items
        self.decay_minutes = decay_minutes
        self.items: deque = deque(maxlen=max_items)
        self.last_activity = datetime.utcnow()
    
    def add(self, item: str, context: Dict[str, Any] = None, importance: float = 0.5):
        """Add item to short-term memory"""
        memory_entry = {
            "content": item,
            "context": context or {},
            "importance": importance,
            "timestamp": datetime.utcnow()
        }
        self.items.append(memory_entry)
        self.last_activity = datetime.utcnow()
    
    def get_recent(self, count: int = 5) -> List[Dict[str, Any]]:
        """Get most recent items"""
        return list(self.items)[-count:]
    
    def get_context_for_query(self, query: str) -> str:
        """Get relevant context for a query"""
        recent = self.get_recent(10)
        context_parts = []
        
        for item in recent:
            # Calculate relevance (simple keyword matching)
            item_text = item["content"].lower()
            query_words = query.lower().split()
            relevance = sum(1 for word in query_words if word in item_text)
            
            if relevance > 0:
                context_parts.append(item["content"])
        
        return " ".join(context_parts[-5:])  # Last 5 relevant items
    
    def rehearse(self, item_index: int):
        """Rehearse (reinforce) an item to prevent decay"""
        if 0 <= item_index < len(self.items):
            # Move item to end (most recent)
            item = self.items[item_index]
            self.items.remove(item)
            self.items.append(item)
            self.last_activity = datetime.utcnow()
    
    def decay_weak_items(self):
        """Remove items that have decayed"""
        cutoff = datetime.utcnow() - timedelta(minutes=self.decay_minutes)
        self.items = deque(
            [item for item in self.items if item["timestamp"] > cutoff],
            maxlen=self.max_items
        )
    
    def clear(self):
        """Clear short-term memory"""
        self.items.clear()
    
    def get_all(self) -> List[Dict[str, Any]]:
        """Get all items"""
        return list(self.items)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "items": list(self.items),
            "last_activity": self.last_activity.isoformat()
        }


class LongTermMemory:
    """
    Human-like long-term memory
    - Persistent storage
    - Organized by importance and recency
    - Can be searched and retrieved
    """
    
    def __init__(self, db_manager):
        self.db = db_manager
    
    def store(self, memory: Memory) -> str:
        """Store memory in long-term storage"""
        try:
            self.db.create_memory(memory)
            return memory.id
        except Exception:
            # Table might not exist, create it
            self._ensure_table()
            return memory.id
    
    def retrieve_by_user(self, user_id: str, memory_type: MemoryType = None) -> List[Memory]:
        """Retrieve memories for user"""
        try:
            return self.db.get_user_memories(user_id, memory_type)
        except Exception:
            return []
    
    def retrieve_by_query(self, user_id: str, query: str, limit: int = 5) -> List[Memory]:
        """Retrieve memories relevant to query"""
        memories = self.retrieve_by_user(user_id)
        
        # Score by relevance
        scored = []
        query_words = query.lower().split()
        
        for memory in memories:
            score = 0
            content_lower = memory.content.lower()
            
            # Word overlap
            for word in query_words:
                if word in content_lower:
                    score += 1
            
            # Boost by importance and recency
            score += memory.importance * 2
            score += memory.access_count * 0.1
            
            if score > 0:
                scored.append((memory, score))
        
        # Sort and return top matches
        scored.sort(key=lambda x: x[1], reverse=True)
        return [m for m, _ in scored[:limit]]
    
    def update_importance(self, memory_id: str, importance: float):
        """Update memory importance"""
        try:
            self.db.update_memory(memory_id, {"importance": importance})
        except Exception:
            pass
    
    def increment_access(self, memory_id: str):
        """Increment access count"""
        try:
            self.db.update_memory(memory_id, {
                "access_count": 1,  # Will be incremented by db
                "last_accessed": datetime.utcnow().isoformat()
            })
        except Exception:
            pass
    
    def _ensure_table(self):
        """Ensure memory table exists"""
        try:
            self.db.create_memory_table()
        except Exception:
            pass


class AgentMemory:
    """
    Complete memory system combining short-term and long-term memory
    Mimics human memory processes: encoding, storage, retrieval
    """
    
    def __init__(self, db_manager, short_term_size: int = 10):
        self.short_term = ShortTermMemory(max_items=short_term_size)
        self.long_term = LongTermMemory(db_manager)
        self.conversation_history: List[ConversationTurn] = []
        self.notes: Dict[str, List[AgentNote]] = {}  # user_id -> notes
    
    # ========== ENCODING (Learning from interactions) ==========
    
    def encode_interaction(
        self,
        user_id: str,
        role: str,
        message: str,
        context: Dict[str, Any] = None,
        related_content_id: str = None
    ) -> str:
        """Encode an interaction into memory"""
        turn_id = str(uuid.uuid4())
        
        # Create conversation turn
        turn = ConversationTurn(
            id=turn_id,
            user_id=user_id,
            role=role,
            message=message,
            context=context
        )
        self.conversation_history.append(turn)
        
        # Add to short-term memory
        importance = 0.8 if role == "user" else 0.5
        self.short_term.add(message, context, importance)
        
        # For important user messages, create long-term memory
        if role == "user" and len(message) > 20:
            memory = Memory(
                id=str(uuid.uuid4()),
                user_id=user_id,
                memory_type=MemoryType.EPISODIC,
                content=message,
                importance=importance,
                context=context,
                tags=self._extract_tags(message)
            )
            self.long_term.store(memory)
            turn.memory_triggered.append(memory.id)
        
        # Check if we should make a note
        if self._should_make_note(message):
            self.make_note(user_id, message, related_content_id)
        
        return turn_id
    
    def _extract_tags(self, text: str) -> List[str]:
        """Extract tags from text"""
        tags = []
        
        # Extract anime/manga titles (capitalized words)
        import re
        words = re.findall(r'\b[A-Z][a-z]+\b', text)
        tags.extend(words[:5])  # Max 5 tags
        
        # Extract genres (simple check)
        genre_keywords = ["action", "romance", "comedy", "drama", "fantasy", "sci-fi", 
                         "horror", "mystery", "slice of life", "sports"]
        text_lower = text.lower()
        for genre in genre_keywords:
            if genre in text_lower:
                tags.append(genre)
        
        return list(set(tags))[:10]
    
    def _should_make_note(self, message: str) -> bool:
        """Determine if we should make a note about this"""
        note_triggers = [
            "remind me", "don't forget", "remember this",
            "i want to", "planning to", "interested in",
            "favorite", "loved", "hated", "amazing", "terrible"
        ]
        message_lower = message.lower()
        return any(trigger in message_lower for trigger in note_triggers)
    
    # ========== STORAGE ==========
    
    def store_fact(self, user_id: str, fact: str, importance: float = 0.6):
        """Store a semantic fact"""
        memory = Memory(
            id=str(uuid.uuid4()),
            user_id=user_id,
            memory_type=MemoryType.SEMANTIC,
            content=fact,
            importance=importance,
            tags=["fact"]
        )
        return self.long_term.store(memory)
    
    def store_procedure(self, user_id: str, procedure: str, context: str):
        """Store a procedural memory"""
        memory = Memory(
            id=str(uuid.uuid4()),
            user_id=user_id,
            memory_type=MemoryType.PROCEDURAL,
            content=procedure,
            importance=0.5,
            context={"context": context},
            tags=["procedure"]
        )
        return self.long_term.store(memory)
    
    # ========== RETRIEVAL ==========
    
    def retrieve_relevant(self, user_id: str, query: str) -> Dict[str, Any]:
        """Retrieve relevant memories for a query"""
        result = {
            "short_term_context": self.short_term.get_context_for_query(query),
            "long_term_memories": [],
            "notes": [],
            "conversation_context": []
        }
        
        # Get long-term memories
        result["long_term_memories"] = [
            m.to_dict() for m in 
            self.long_term.retrieve_by_query(user_id, query)
        ]
        
        # Get recent conversation
        user_turns = [t for t in self.conversation_history if t.user_id == user_id][-10:]
        result["conversation_context"] = [
            {"role": t.role, "message": t.message} for t in user_turns
        ]
        
        # Get notes
        user_notes = self.notes.get(user_id, [])
        result["notes"] = [n.to_dict() for n in user_notes if query.lower() in n.content.lower()]
        
        return result
    
    def check_memory(self, user_id: str, topic: str) -> str:
        """Check memory storage for information about a topic"""
        memories = self.long_term.retrieve_by_query(user_id, topic, limit=3)
        
        if not memories:
            # Check short-term
            short_context = self.short_term.get_context_for_query(topic)
            if short_context:
                return f"From our recent conversation: {short_context}"
            return None
        
        # Return most relevant memory
        best = memories[0]
        self.long_term.increment_access(best.id)
        
        return f"I remember: {best.content}"
    
    # ========== NOTES SYSTEM ==========
    
    def make_note(
        self,
        user_id: str,
        content: str,
        related_content_id: str = None,
        title: str = None
    ) -> str:
        """Make a note to self"""
        if user_id not in self.notes:
            self.notes[user_id] = []
        
        note = AgentNote(
            id=str(uuid.uuid4()),
            user_id=user_id,
            title=title or self._generate_note_title(content),
            content=content,
            related_content_id=related_content_id
        )
        
        self.notes[user_id].append(note)
        
        # Also store in long-term memory
        memory = Memory(
            id=note.id,
            user_id=user_id,
            memory_type=MemoryType.LONG_TERM,
            content=f"NOTE [{note.title}]: {content}",
            importance=0.7,
            tags=["note"]
        )
        self.long_term.store(memory)
        
        return note.id
    
    def _generate_note_title(self, content: str) -> str:
        """Generate a title for a note"""
        # Take first few words
        words = content.split()[:5]
        return " ".join(words) + ("..." if len(words) < len(content.split()) else "")
    
    def get_notes(self, user_id: str) -> List[AgentNote]:
        """Get all notes for user"""
        return self.notes.get(user_id, [])
    
    def update_note(self, user_id: str, note_id: str, new_content: str) -> bool:
        """Update a note"""
        notes = self.notes.get(user_id, [])
        for note in notes:
            if note.id == note_id:
                note.content = new_content
                note.updated_at = datetime.utcnow()
                return True
        return False
    
    # ========== MEMORY MANAGEMENT ==========
    
    def consolidate_short_term(self, user_id: str):
        """Move important short-term memories to long-term"""
        items = self.short_term.get_all()
        
        for item in items:
            if item["importance"] > 0.7:
                memory = Memory(
                    id=str(uuid.uuid4()),
                    user_id=user_id,
                    memory_type=MemoryType.EPISODIC,
                    content=item["content"],
                    importance=item["importance"],
                    context=item.get("context", {})
                )
                self.long_term.store(memory)
        
        # Clear short-term after consolidation
        self.short_term.clear()
    
    def decay_short_term(self):
        """Remove decayed short-term memories"""
        self.short_term.decay_weak_items()
    
    def clear_user_memory(self, user_id: str):
        """Clear all memory for user"""
        self.short_term.clear()
        self.conversation_history = [
            t for t in self.conversation_history if t.user_id != user_id
        ]
        self.notes[user_id] = []
    
    def get_memory_summary(self, user_id: str) -> Dict[str, Any]:
        """Get summary of user's memory state"""
        notes = self.notes.get(user_id, [])
        
        return {
            "short_term_count": len(self.short_term.get_all()),
            "short_term_last_activity": self.short_term.last_activity.isoformat(),
            "total_notes": len(notes),
            "recent_notes": [n.to_dict() for n in notes[-5:]],
            "conversation_turns": len([t for t in self.conversation_history if t.user_id == user_id])
        }
    
    # ========== CONTEXT FOR RESPONSES ==========
    
    def get_conversation_context(self, user_id: str, max_turns: int = 5) -> str:
        """Get recent conversation context for response generation"""
        turns = [t for t in self.conversation_history if t.user_id == user_id][-max_turns*2:]
        
        context_parts = []
        for turn in turns:
            prefix = "User: " if turn.role == "user" else "Me: "
            context_parts.append(prefix + turn.message)
        
        return "\n".join(context_parts)
    
    def should_reference_memory(self, user_id: str, query: str) -> bool:
        """Determine if we should reference memories in response"""
        # Check if query relates to recent conversation
        recent = self.short_term.get_context_for_query(query)
        if recent:
            return True
        
        # Check if user asked about memory
        query_lower = query.lower()
        memory_keywords = ["remember", "earlier", "before", "previously", "last time"]
        
        return any(kw in query_lower for kw in memory_keywords)
