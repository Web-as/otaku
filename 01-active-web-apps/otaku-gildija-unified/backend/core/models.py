from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

Base = declarative_base()

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    anime = relationship("Anime", back_populates="user", cascade="all, delete-orphan")

class Anime(Base):
    __tablename__ = "anime"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String(500), nullable=False, index=True)
    description = Column(Text)
    episode_count = Column(Integer, default=0)
    status = Column(String(50), default="Watching")
    rating = Column(Float)
    cover_image = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="anime")
    episodes = relationship("Episode", back_populates="anime", cascade="all, delete-orphan")
    genres = relationship("AnimeGenre", back_populates="anime", cascade="all, delete-orphan")

class Episode(Base):
    __tablename__ = "episodes"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    anime_id = Column(String, ForeignKey("anime.id"), nullable=False)
    episode_number = Column(Integer, nullable=False)
    title = Column(String(500))
    file_path = Column(String(1000))
    file_size = Column(Integer)
    duration_seconds = Column(Integer)
    watched = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    anime = relationship("Anime", back_populates="episodes")

class Genre(Base):
    __tablename__ = "genres"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), unique=True, nullable=False)
    
    anime = relationship("AnimeGenre", back_populates="genre")

class AnimeGenre(Base):
    __tablename__ = "anime_genres"
    
    anime_id = Column(String, ForeignKey("anime.id"), primary_key=True)
    genre_id = Column(Integer, ForeignKey("genres.id"), primary_key=True)
    
    anime = relationship("Anime", back_populates="genres")
    genre = relationship("Genre", back_populates="anime")


