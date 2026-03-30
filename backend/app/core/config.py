from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    app_name: str = "SoundScout API"
    debug: bool = False
    api_v1_prefix: str = "/api/v1"

    # Database
    mongodb_url: str = "mongodb://localhost:27017"
    database_name: str = "soundscout"

    # JWT
    secret_key: str = Field(..., min_length=32)
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7

    # Spotify
    spotify_client_id: str = ""
    spotify_client_secret: str = ""

    # Demo mode (serve cached data instead of calling Spotify API)
    demo_mode: bool = False

    # CORS (extend via EXTRA_CORS_ORIGINS env var, comma-separated)
    cors_origins: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4321",
        "http://127.0.0.1:4321",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    extra_cors_origins: str = ""

    # Uploads
    upload_dir: str = "uploads"
    max_avatar_size: int = 2 * 1024 * 1024   # 2MB
    max_banner_size: int = 5 * 1024 * 1024   # 5MB
    allowed_image_types: List[str] = [
        "image/jpeg",
        "image/png",
        "image/webp",
    ]

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": False,
    }


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
