from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
from core.models import User
from core.auth import get_current_user
from core.schemas import (
    AnimeCreate, AnimeUpdate, AnimeResponse, AnimeDetailResponse,
    EpisodeCreate, EpisodeResponse
)
from services.anime_service import AnimeService

router = APIRouter(prefix="/anime", tags=["anime"])

@router.get("/", response_model=List[AnimeResponse])
def list_anime(
    skip: int = 0,
    limit: int = 100,
    search: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return AnimeService.get_anime_list(db, current_user, skip, limit, search)

@router.post("/", response_model=AnimeResponse)
def create_anime(
    anime: AnimeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return AnimeService.create_anime(db, anime, current_user)

@router.get("/{anime_id}", response_model=AnimeDetailResponse)
def get_anime(
    anime_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return AnimeService.get_anime(db, anime_id, current_user)

@router.put("/{anime_id}", response_model=AnimeResponse)
def update_anime(
    anime_id: str,
    anime: AnimeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return AnimeService.update_anime(db, anime_id, anime, current_user)

@router.delete("/{anime_id}")
def delete_anime(
    anime_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return AnimeService.delete_anime(db, anime_id, current_user)

@router.post("/{anime_id}/episodes", response_model=EpisodeResponse)
def add_episode(
    anime_id: str,
    episode: EpisodeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return AnimeService.add_episode(db, anime_id, episode, current_user)

@router.patch("/episodes/{episode_id}/watched", response_model=EpisodeResponse)
def toggle_watched(
    episode_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return AnimeService.toggle_watched(db, episode_id, current_user)


