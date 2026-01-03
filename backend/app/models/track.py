from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.common import PyObjectId


class TrackBase(BaseModel):
    """Base track fields from Spotify."""
    spotify_id: str
    name: str
    artist_id: str
    artist_name: str
    album_name: str
    album_image: Optional[str] = None
    preview_url: Optional[str] = None
    duration_ms: int
    popularity: int = 0


class FavoriteTrack(TrackBase):
    """Track saved as favorite by user."""
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )

    id: PyObjectId = Field(alias="_id")
    user_id: PyObjectId
    added_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class FavoriteTrackCreate(TrackBase):
    """Schema for adding track to favorites."""
    pass


class FavoriteTrackResponse(BaseModel):
    """Response schema for favorite track."""
    id: str
    spotify_id: str
    name: str
    artist_id: str
    artist_name: str
    album_name: str
    album_image: Optional[str]
    preview_url: Optional[str]
    duration_ms: int
    popularity: int
    added_at: datetime

    @classmethod
    def from_db(cls, track: FavoriteTrack) -> "FavoriteTrackResponse":
        return cls(
            id=str(track.id),
            spotify_id=track.spotify_id,
            name=track.name,
            artist_id=track.artist_id,
            artist_name=track.artist_name,
            album_name=track.album_name,
            album_image=track.album_image,
            preview_url=track.preview_url,
            duration_ms=track.duration_ms,
            popularity=track.popularity,
            added_at=track.added_at,
        )


class FavoriteListResponse(BaseModel):
    """Response for paginated favorites list."""
    tracks: list
    total: int
    page: int
    per_page: int
    pages: int
