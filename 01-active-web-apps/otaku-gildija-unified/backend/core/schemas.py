from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# User Schemas
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# Episode Schemas
class EpisodeBase(BaseModel):
    episode_number: int
    title: Optional[str] = None
    file_path: Optional[str] = None
    file_size: Optional[int] = None
    duration_seconds: Optional[int] = None
    watched: bool = False

class EpisodeCreate(EpisodeBase):
    pass

class EpisodeUpdate(BaseModel):
    title: Optional[str] = None
    watched: Optional[bool] = None

class EpisodeResponse(EpisodeBase):
    id: str
    anime_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Anime Schemas
class AnimeBase(BaseModel):
    title: str
    description: Optional[str] = None
    episode_count: int = 0
    status: str = "Watching"
    rating: Optional[float] = None
    cover_image: Optional[str] = None

class AnimeCreate(AnimeBase):
    genres: List[str] = []

class AnimeUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    episode_count: Optional[int] = None
    status: Optional[str] = None
    rating: Optional[float] = None
    cover_image: Optional[str] = None
    genres: Optional[List[str]] = None

class AnimeResponse(AnimeBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class AnimeDetailResponse(AnimeResponse):
    episodes: List[EpisodeResponse] = []


