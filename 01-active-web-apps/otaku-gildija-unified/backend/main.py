from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.database import init_db
from api.v1 import auth, anime, scanner, organizer
from config.settings import settings

app = FastAPI(title=settings.APP_NAME, version=settings.APP_VERSION)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
init_db()

# Routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(anime.router, prefix="/api/v1")
app.include_router(scanner.router, prefix="/api/v1")
app.include_router(organizer.router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "Otaku Gildija MVP API", "version": settings.APP_VERSION}

@app.get("/health")
def health():
    return {"status": "ok"}


