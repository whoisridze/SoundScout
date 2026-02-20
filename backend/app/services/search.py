import re
from typing import Any, Dict, List, Optional

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.services.spotify import spotify


async def search_users(
    db: AsyncIOMotorDatabase,
    query: str,
    limit: int = 5,
) -> List[Dict[str, Any]]:
    """Search users by username (case-insensitive, prefix-preferred)."""
    escaped = re.escape(query)
    cursor = db.users.find(
        {"username": {"$regex": escaped, "$options": "i"}, "is_active": True},
        {"username": 1, "avatar_url": 1},
    )
    users = await cursor.limit(limit).to_list(limit)
    return [
        {
            "id": str(u["_id"]),
            "username": u["username"],
            "avatar_url": u.get("avatar_url"),
        }
        for u in users
    ]


async def search_artists(
    query: str,
    limit: int = 3,
) -> List[Dict[str, Any]]:
    """Search artists by name via Spotify."""
    data = await spotify.search_by_name(query, limit=limit)
    items = data.get("artists", {}).get("items", [])
    return [
        {
            "id": a["id"],
            "name": a["name"],
            "followers": a.get("followers", {}).get("total", 0),
            "image": a["images"][0]["url"] if a.get("images") else None,
        }
        for a in items
    ]
