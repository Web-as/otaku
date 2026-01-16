from sqlalchemy.orm import Session
from core.models import Anime, Episode, Genre, AnimeGenre, User
from core.schemas import AnimeCreate, AnimeUpdate, EpisodeCreate
from fastapi import HTTPException

class AnimeService:
    @staticmethod
    def get_anime_list(db: Session, user: User, skip: int = 0, limit: int = 100, search: str = None):
        query = db.query(Anime).filter(Anime.user_id == user.id)
        if search:
            query = query.filter(Anime.title.contains(search))
        return query.offset(skip).limit(limit).all()
    
    @staticmethod
    def get_anime(db: Session, anime_id: str, user: User):
        anime = db.query(Anime).filter(Anime.id == anime_id, Anime.user_id == user.id).first()
        if not anime:
            raise HTTPException(status_code=404, detail="Anime not found")
        return anime
    
    @staticmethod
    def create_anime(db: Session, anime_data: AnimeCreate, user: User):
        anime = Anime(
            user_id=user.id,
            title=anime_data.title,
            description=anime_data.description,
            episode_count=anime_data.episode_count,
            status=anime_data.status,
            rating=anime_data.rating,
            cover_image=anime_data.cover_image
        )
        db.add(anime)
        db.commit()
        db.refresh(anime)
        
        # Add genres
        for genre_name in anime_data.genres:
            genre = db.query(Genre).filter(Genre.name == genre_name).first()
            if not genre:
                genre = Genre(name=genre_name)
                db.add(genre)
                db.commit()
                db.refresh(genre)
            
            anime_genre = AnimeGenre(anime_id=anime.id, genre_id=genre.id)
            db.add(anime_genre)
        
        db.commit()
        return anime
    
    @staticmethod
    def update_anime(db: Session, anime_id: str, anime_data: AnimeUpdate, user: User):
        anime = AnimeService.get_anime(db, anime_id, user)
        
        update_data = anime_data.dict(exclude_unset=True)
        genres = update_data.pop('genres', None)
        
        for key, value in update_data.items():
            setattr(anime, key, value)
        
        if genres is not None:
            db.query(AnimeGenre).filter(AnimeGenre.anime_id == anime_id).delete()
            for genre_name in genres:
                genre = db.query(Genre).filter(Genre.name == genre_name).first()
                if not genre:
                    genre = Genre(name=genre_name)
                    db.add(genre)
                    db.commit()
                    db.refresh(genre)
                anime_genre = AnimeGenre(anime_id=anime.id, genre_id=genre.id)
                db.add(anime_genre)
        
        db.commit()
        db.refresh(anime)
        return anime
    
    @staticmethod
    def delete_anime(db: Session, anime_id: str, user: User):
        anime = AnimeService.get_anime(db, anime_id, user)
        db.delete(anime)
        db.commit()
        return {"message": "Anime deleted successfully"}
    
    @staticmethod
    def add_episode(db: Session, anime_id: str, episode_data: EpisodeCreate, user: User):
        anime = AnimeService.get_anime(db, anime_id, user)
        episode = Episode(
            anime_id=anime_id,
            episode_number=episode_data.episode_number,
            title=episode_data.title,
            file_path=episode_data.file_path,
            file_size=episode_data.file_size,
            duration_seconds=episode_data.duration_seconds,
            watched=episode_data.watched
        )
        db.add(episode)
        db.commit()
        db.refresh(episode)
        return episode
    
    @staticmethod
    def toggle_watched(db: Session, episode_id: str, user: User):
        episode = db.query(Episode).join(Anime).filter(
            Episode.id == episode_id,
            Anime.user_id == user.id
        ).first()
        
        if not episode:
            raise HTTPException(status_code=404, detail="Episode not found")
        
        episode.watched = not episode.watched
        db.commit()
        db.refresh(episode)
        return episode


