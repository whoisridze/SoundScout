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

    # CORS
    cors_origins: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4321",
        "http://127.0.0.1:4321",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # Rate Limiting
    rate_limit_login_max: int = 5
    rate_limit_login_window: int = 300
    rate_limit_refresh_max: int = 10
    rate_limit_refresh_window: int = 300

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": False,
    }


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
