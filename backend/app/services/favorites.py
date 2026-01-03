from datetime import datetime, timezone
from typing import List, Optional
import math

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.track import FavoriteTrack, FavoriteTrackCreate


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

    result = await db.favorites.insert_one(doc)
    doc["_id"] = result.inserted_id
    return FavoriteTrack(**doc)


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
