import asyncio
import logging
from datetime import datetime, timezone
from typing import List, Optional
import math

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo.errors import DuplicateKeyError

from app.models.track import FavoriteTrack, FavoriteTrackCreate
from app.services.deezer import deezer

logger = logging.getLogger(__name__)


async def add_favorite(
    db: AsyncIOMotorDatabase,
    user_id: str,
    track_data: FavoriteTrackCreate,
) -> FavoriteTrack:
    """Add track to user's favorites."""
    now = datetime.now(timezone.utc)

    # Check if already favorited
    existing = await db.favorites.find_one({
        "user_id": ObjectId(user_id),
        "spotify_id": track_data.spotify_id,
    })

    if existing:
        return FavoriteTrack(**existing)

    doc = {
        "user_id": ObjectId(user_id),
        "spotify_id": track_data.spotify_id,
        "name": track_data.name,
        "artist_id": track_data.artist_id,
        "artist_name": track_data.artist_name,
        "album_name": track_data.album_name,
        "album_image": track_data.album_image,
        "preview_url": track_data.preview_url,
        "duration_ms": track_data.duration_ms,
        "popularity": track_data.popularity,
        "added_at": now,
    }

    try:
        result = await db.favorites.insert_one(doc)
        doc["_id"] = result.inserted_id
        return FavoriteTrack(**doc)
    except DuplicateKeyError:
        # Concurrent insert — return the existing document
        existing = await db.favorites.find_one({
            "user_id": ObjectId(user_id),
            "spotify_id": track_data.spotify_id,
        })
        return FavoriteTrack(**existing)


async def remove_favorite(
    db: AsyncIOMotorDatabase,
    user_id: str,
    spotify_id: str,
) -> bool:
    """Remove track from user's favorites."""
    result = await db.favorites.delete_one({
        "user_id": ObjectId(user_id),
        "spotify_id": spotify_id,
    })
    return result.deleted_count > 0


async def get_user_favorites(
    db: AsyncIOMotorDatabase,
    user_id: str,
    page: int = 1,
    per_page: int = 20,
) -> tuple:
    """Get user's favorite tracks with pagination."""
    skip = (page - 1) * per_page

    cursor = db.favorites.find({"user_id": ObjectId(user_id)})
    total = await db.favorites.count_documents({"user_id": ObjectId(user_id)})

    tracks = await cursor.sort("added_at", -1).skip(skip).limit(per_page).to_list(per_page)
    pages = math.ceil(total / per_page) if total > 0 else 1

    return [FavoriteTrack(**t) for t in tracks], total, pages


async def is_favorite(
    db: AsyncIOMotorDatabase,
    user_id: str,
    spotify_id: str,
) -> bool:
    """Check if track is in user's favorites."""
    doc = await db.favorites.find_one({
        "user_id": ObjectId(user_id),
        "spotify_id": spotify_id,
    })
    return doc is not None


async def get_favorites_count(db: AsyncIOMotorDatabase, user_id: str) -> int:
    """Get count of user's favorites."""
    return await db.favorites.count_documents({"user_id": ObjectId(user_id)})


async def check_favorites_batch(
    db: AsyncIOMotorDatabase,
    user_id: str,
    spotify_ids: List[str],
) -> List[str]:
    """Check which tracks from list are in user's favorites."""
    cursor = db.favorites.find({
        "user_id": ObjectId(user_id),
        "spotify_id": {"$in": spotify_ids},
    })
    docs = await cursor.to_list(len(spotify_ids))
    return [doc["spotify_id"] for doc in docs]


def _is_expired_url(url: Optional[str]) -> bool:
    """Check if a preview URL is from Spotify (expires) or missing."""
    if not url:
        return True
    return "scdn.co" in url


async def refresh_preview_urls(
    db: AsyncIOMotorDatabase,
    tracks: List[FavoriteTrack],
) -> List[FavoriteTrack]:
    """Replace expired Spotify preview URLs with stable Deezer ones."""
    needs_refresh = [
        (i, t) for i, t in enumerate(tracks) if _is_expired_url(t.preview_url)
    ]
    if not needs_refresh:
        return tracks

    tasks = [
        deezer.search_track(t.name, t.artist_name) for _, t in needs_refresh
    ]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    updates = []
    for (idx, fav), result in zip(needs_refresh, results):
        if isinstance(result, str):
            tracks[idx].preview_url = result
            updates.append(
                db.favorites.update_one(
                    {"_id": fav.id}, {"$set": {"preview_url": result}}
                )
            )

    # Persist new URLs so future requests skip Deezer
    if updates:
        await asyncio.gather(*updates)
        logger.info("Refreshed %d/%d preview URLs from Deezer", len(updates), len(needs_refresh))

    return tracks
