from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from core.database import get_db
from core.models import User, Anime, Episode
from core.auth import get_current_user
from services.file_organizer import FileOrganizer
from config.settings import settings

router = APIRouter(prefix="/organizer", tags=["organizer"])

class OrganizeRequest(BaseModel):
    file_path: str
    anime_id: str
    episode_number: int
    dry_run: bool = False

@router.post("/organize")
def organize_file(
    request: OrganizeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    anime = db.query(Anime).filter(
        Anime.id == request.anime_id,
        Anime.user_id == current_user.id
    ).first()
    
    if not anime:
        return {"error": "Anime not found"}
    
    organizer = FileOrganizer(str(settings.LIBRARY_DIR / current_user.id))
    result = organizer.organize_file(
        request.file_path,
        anime.title,
        request.episode_number,
        request.dry_run
    )
    
    if result['success'] and not request.dry_run:
        episode = db.query(Episode).filter(
            Episode.anime_id == anime.id,
            Episode.episode_number == request.episode_number
        ).first()
        
        if episode:
            episode.file_path = result['destination']
        else:
            episode = Episode(
                anime_id=anime.id,
                episode_number=request.episode_number,
                file_path=result['destination']
            )
            db.add(episode)
        db.commit()
    
    return result

@router.post("/preview")
def preview_organization(
    request: OrganizeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    anime = db.query(Anime).filter(
        Anime.id == request.anime_id,
        Anime.user_id == current_user.id
    ).first()
    
    if not anime:
        return {"error": "Anime not found"}
    
    organizer = FileOrganizer(str(settings.LIBRARY_DIR / current_user.id))
    return organizer.preview_organization(
        request.file_path,
        anime.title,
        request.episode_number
    )


