from typing import List

from fastapi import APIRouter, Depends, Query, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.api.deps import get_db, get_current_active_user
from app.models.user import UserInDB
from app.models.track import (
    FavoriteTrackCreate,
    FavoriteTrackResponse,
    FavoriteListResponse,
)
from app.services import favorites as favorites_service

router = APIRouter(prefix="/favorites", tags=["Favorites"])


@router.post("", response_model=FavoriteTrackResponse, status_code=201)
async def add_favorite(
    track_data: FavoriteTrackCreate,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Add track to favorites."""
    track = await favorites_service.add_favorite(
        db, str(current_user.id), track_data
    )
    return FavoriteTrackResponse.from_db(track)


@router.delete("/{spotify_id}")
async def remove_favorite(
    spotify_id: str,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Remove track from favorites."""
    removed = await favorites_service.remove_favorite(
        db, str(current_user.id), spotify_id
    )
    return {"removed": removed}


@router.get("", response_model=FavoriteListResponse)
async def get_favorites(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Get current user's favorite tracks."""
    tracks, total, pages = await favorites_service.get_user_favorites(
        db, str(current_user.id), page, per_page
    )
    tracks = await favorites_service.refresh_preview_urls(db, tracks)
    return FavoriteListResponse(
        tracks=[FavoriteTrackResponse.from_db(t) for t in tracks],
        total=total,
        page=page,
        per_page=per_page,
        pages=pages,
    )


@router.get("/check/{spotify_id}")
async def check_favorite(
    spotify_id: str,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Check if track is in favorites."""
    is_fav = await favorites_service.is_favorite(
        db, str(current_user.id), spotify_id
    )
    return {"is_favorite": is_fav}


@router.post("/check-batch")
async def check_favorites_batch(
    spotify_ids: List[str],
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Check which tracks from list are in favorites."""
    if len(spotify_ids) > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 100 IDs per batch",
        )
    favorited = await favorites_service.check_favorites_batch(
        db, str(current_user.id), spotify_ids
    )
    return {"favorited": favorited}
