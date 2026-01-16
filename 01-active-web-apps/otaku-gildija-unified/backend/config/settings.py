from pydantic_settings import BaseSettings
from typing import List
from pathlib import Path

class Settings(BaseSettings):
    APP_NAME: str = "Otaku Gildija MVP"
    APP_VERSION: str = "1.0.0"
    
    DATABASE_URL: str = "sqlite:///./otaku_gildija.db"
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 43200
    
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
    ]
    
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    DATA_DIR: Path = BASE_DIR / "data"
    LIBRARY_DIR: Path = DATA_DIR / "library"
    
    class Config:
        env_file = ".env"

settings = Settings()

# Ensure directories exist
settings.DATA_DIR.mkdir(exist_ok=True)
settings.LIBRARY_DIR.mkdir(exist_ok=True)


