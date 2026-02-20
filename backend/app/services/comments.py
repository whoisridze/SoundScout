from datetime import datetime, timezone
from typing import List, Optional
import math

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.exceptions import NotFoundError, ForbiddenError
from app.models.comment import CommentInDB, CommentCreate, CommentUpdate


# $lookup stages to resolve the current avatar_url from the users collection
# so comments always show the user's latest avatar, not the one at creation time.
# Uses $cond (not $ifNull) so that when a user exists but has no avatar,
# we correctly return null instead of falling back to the stale stored URL.
_AVATAR_LOOKUP_STAGES = [
    {"$lookup": {
        "from": "users",
        "localField": "user_id",
        "foreignField": "_id",
        "pipeline": [{"$project": {"avatar_url": 1}}],
        "as": "_user",
    }},
    {"$set": {
        "avatar_url": {
            "$cond": {
                "if": {"$gt": [{"$size": "$_user"}, 0]},
                "then": {"$arrayElemAt": ["$_user.avatar_url", 0]},
                "else": "$avatar_url",
            }
        }
    }},
    {"$unset": "_user"},
]


async def create_comment(
    db: AsyncIOMotorDatabase,
    user_id: str,
    username: str,
    comment_data: CommentCreate,
    avatar_url: Optional[str] = None,
) -> CommentInDB:
    """Create a new comment."""
    now = datetime.now(timezone.utc)

    doc = {
        "track_id": comment_data.track_id,
        "track_name": comment_data.track_name,
        "artist_id": comment_data.artist_id,
        "artist_name": comment_data.artist_name,
        "user_id": ObjectId(user_id),
        "username": username,
        "avatar_url": avatar_url,
        "content": comment_data.content,
        "created_at": now,
        "updated_at": now,
        "is_deleted": False,
    }

    result = await db.comments.insert_one(doc)
    doc["_id"] = result.inserted_id
    return CommentInDB(**doc)


async def get_comment_by_id(
    db: AsyncIOMotorDatabase,
    comment_id: str,
) -> Optional[CommentInDB]:
    """Get comment by ID."""
    if not ObjectId.is_valid(comment_id):
        return None

    doc = await db.comments.find_one({
        "_id": ObjectId(comment_id),
        "is_deleted": False,
    })
    return CommentInDB(**doc) if doc else None


async def update_comment(
    db: AsyncIOMotorDatabase,
    comment_id: str,
    user_id: str,
    comment_data: CommentUpdate,
    is_admin: bool = False,
) -> CommentInDB:
    """Update a comment (only owner or admin)."""
    comment = await get_comment_by_id(db, comment_id)
    if not comment:
        raise NotFoundError("Comment")

    # Check ownership (unless admin)
    if not is_admin and str(comment.user_id) != user_id:
        raise ForbiddenError("You can only edit your own comments")

    await db.comments.update_one(
        {"_id": ObjectId(comment_id)},
        {
            "$set": {
                "content": comment_data.content,
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )

    return await get_comment_by_id(db, comment_id)


async def delete_comment(
    db: AsyncIOMotorDatabase,
    comment_id: str,
    user_id: str,
    is_admin: bool = False,
) -> bool:
    """Delete a comment (soft delete, only owner or admin)."""
    comment = await get_comment_by_id(db, comment_id)
    if not comment:
        raise NotFoundError("Comment")

    # Check ownership (unless admin)
    if not is_admin and str(comment.user_id) != user_id:
        raise ForbiddenError("You can only delete your own comments")

    # Soft delete
    result = await db.comments.update_one(
        {"_id": ObjectId(comment_id)},
        {"$set": {"is_deleted": True, "updated_at": datetime.now(timezone.utc)}},
    )
    return result.modified_count > 0


async def get_track_comments(
    db: AsyncIOMotorDatabase,
    track_id: str,
    page: int = 1,
    per_page: int = 20,
) -> tuple:
    """Get comments for a track with pagination."""
    skip = (page - 1) * per_page
    query = {"track_id": track_id, "is_deleted": False}
    total = await db.comments.count_documents(query)
    pages = math.ceil(total / per_page) if total > 0 else 1

    pipeline = [
        {"$match": query},
        {"$sort": {"created_at": -1}},
        {"$skip": skip},
        {"$limit": per_page},
        *_AVATAR_LOOKUP_STAGES,
    ]
    comments = await db.comments.aggregate(pipeline).to_list(per_page)

    return [CommentInDB(**c) for c in comments], total, pages


async def get_artist_comments(
    db: AsyncIOMotorDatabase,
    artist_id: str,
    page: int = 1,
    per_page: int = 15,
) -> tuple:
    """Get all comments for an artist's tracks with pagination."""
    skip = (page - 1) * per_page
    query = {"artist_id": artist_id, "is_deleted": False}
    total = await db.comments.count_documents(query)
    pages = math.ceil(total / per_page) if total > 0 else 1

    pipeline = [
        {"$match": query},
        {"$sort": {"created_at": -1}},
        {"$skip": skip},
        {"$limit": per_page},
        *_AVATAR_LOOKUP_STAGES,
    ]
    comments = await db.comments.aggregate(pipeline).to_list(per_page)

    return [CommentInDB(**c) for c in comments], total, pages


async def get_user_comments(
    db: AsyncIOMotorDatabase,
    user_id: str,
    page: int = 1,
    per_page: int = 20,
) -> tuple:
    """Get comments by user with pagination."""
    skip = (page - 1) * per_page
    query = {"user_id": ObjectId(user_id), "is_deleted": False}
    total = await db.comments.count_documents(query)
    pages = math.ceil(total / per_page) if total > 0 else 1

    pipeline = [
        {"$match": query},
        {"$sort": {"created_at": -1}},
        {"$skip": skip},
        {"$limit": per_page},
        *_AVATAR_LOOKUP_STAGES,
    ]
    comments = await db.comments.aggregate(pipeline).to_list(per_page)

    return [CommentInDB(**c) for c in comments], total, pages


async def get_comments_count(db: AsyncIOMotorDatabase, user_id: str) -> int:
    """Get count of user's comments."""
    return await db.comments.count_documents({
        "user_id": ObjectId(user_id),
        "is_deleted": False,
    })


async def get_all_comments_admin(
    db: AsyncIOMotorDatabase,
    page: int = 1,
    per_page: int = 20,
    include_deleted: bool = False,
) -> tuple:
    """Get all comments for admin with pagination."""
    skip = (page - 1) * per_page
    query = {} if include_deleted else {"is_deleted": False}
    total = await db.comments.count_documents(query)
    pages = math.ceil(total / per_page) if total > 0 else 1

    pipeline = [
        {"$match": query},
        {"$sort": {"created_at": -1}},
        {"$skip": skip},
        {"$limit": per_page},
        *_AVATAR_LOOKUP_STAGES,
    ]
    comments = await db.comments.aggregate(pipeline).to_list(per_page)

    return [CommentInDB(**c) for c in comments], total, pages
