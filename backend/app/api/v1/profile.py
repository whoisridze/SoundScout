import asyncio
import math
from datetime import datetime
from typing import List, Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel

from app.api.deps import get_db, get_current_active_user
from app.core.config import settings
from app.core.exceptions import NotFoundError, AuthenticationError
from app.models.user import (
    UserInDB, UserUpdate, UserResponse, UserProfileResponse,
    PublicUserProfileResponse, PasswordChange, EmailChange, DeleteAccountRequest,
)
from app.models.track import FavoriteTrackResponse, FavoriteListResponse
from app.models.comment import CommentResponse, CommentListResponse
from app.services import user as user_service
from app.services import favorites as favorites_service
from app.services import comments as comments_service
from app.services import uploads as uploads_service

router = APIRouter(prefix="/profile", tags=["Profile"])


# --- Activity feed models ---

class ActivityItemResponse(BaseModel):
    type: Literal["favorite", "comment"]
    id: str
    track_name: str
    artist_name: Optional[str] = None
    album_image: Optional[str] = None
    content: Optional[str] = None
    track_id: Optional[str] = None
    artist_id: Optional[str] = None
    timestamp: datetime


class ActivityFeedResponse(BaseModel):
    items: List[ActivityItemResponse]
    total: int
    page: int
    per_page: int
    pages: int


# --- Profile endpoints ---

@router.get("", response_model=UserProfileResponse)
async def get_profile(
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Get current user's profile with stats."""
    favorites_count, comments_count = await asyncio.gather(
        favorites_service.get_favorites_count(db, str(current_user.id)),
        comments_service.get_comments_count(db, str(current_user.id)),
    )

    return UserProfileResponse.from_db(
        current_user,
        favorites_count=favorites_count,
        comments_count=comments_count,
    )


@router.put("", response_model=UserResponse)
async def update_profile(
    user_data: UserUpdate,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Update current user's profile."""
    updated_user = await user_service.update_user(
        db, str(current_user.id), user_data
    )
    return UserResponse.from_db(updated_user)


# --- Upload endpoints (before /user/{username} to avoid path conflicts) ---

@router.post("/avatar", response_model=UserResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Upload or replace profile avatar."""
    url = await uploads_service.save_upload(
        file=file,
        user_id=str(current_user.id),
        subdir="avatars",
        max_size=settings.max_avatar_size,
        old_url=current_user.avatar_url,
    )
    updated = await user_service.update_user_image(
        db, str(current_user.id), "avatar_url", url
    )
    return UserResponse.from_db(updated)


@router.post("/banner", response_model=UserResponse)
async def upload_banner(
    file: UploadFile = File(...),
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Upload or replace profile banner."""
    url = await uploads_service.save_upload(
        file=file,
        user_id=str(current_user.id),
        subdir="banners",
        max_size=settings.max_banner_size,
        old_url=current_user.banner_url,
    )
    updated = await user_service.update_user_image(
        db, str(current_user.id), "banner_url", url
    )
    return UserResponse.from_db(updated)


@router.delete("/avatar", response_model=UserResponse)
async def delete_avatar(
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Remove profile avatar and reset to default."""
    await uploads_service.delete_upload(current_user.avatar_url)
    updated = await user_service.remove_user_image(
        db, str(current_user.id), "avatar_url"
    )
    return UserResponse.from_db(updated)


@router.delete("/banner", response_model=UserResponse)
async def delete_banner(
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Remove profile banner and reset to default."""
    await uploads_service.delete_upload(current_user.banner_url)
    updated = await user_service.remove_user_image(
        db, str(current_user.id), "banner_url"
    )
    return UserResponse.from_db(updated)


# --- Settings endpoints ---

@router.put("/email", response_model=UserResponse)
async def change_email(
    data: EmailChange,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Change email address (requires password confirmation)."""
    try:
        updated = await user_service.change_email(
            db, str(current_user.id), data.email, data.password
        )
        return UserResponse.from_db(updated)
    except AuthenticationError as e:
        raise HTTPException(status_code=400, detail=e.detail)


@router.put("/password")
async def change_password(
    data: PasswordChange,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Change password (requires current password)."""
    try:
        await user_service.change_password(
            db, str(current_user.id), data.current_password, data.new_password
        )
        return {"message": "Password changed successfully"}
    except AuthenticationError as e:
        raise HTTPException(status_code=400, detail=e.detail)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))


@router.post("/delete-account")
async def delete_account(
    data: DeleteAccountRequest,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Permanently delete own account (requires password confirmation)."""
    try:
        await user_service.delete_user_account(
            db, str(current_user.id), data.password
        )
        return {"message": "Account deleted successfully"}
    except AuthenticationError as e:
        raise HTTPException(status_code=400, detail=e.detail)


# --- Public profile endpoints ---

@router.get("/user/{username}/favorites", response_model=FavoriteListResponse)
async def get_user_favorites(
    username: str,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Get public user's favorite tracks."""
    user = await user_service.get_user_by_username(db, username)
    if not user or not user.is_active:
        raise NotFoundError("User")

    tracks, total, pages = await favorites_service.get_user_favorites(
        db, str(user.id), page, per_page
    )
    tracks = await favorites_service.refresh_preview_urls(db, tracks)
    return FavoriteListResponse(
        tracks=[FavoriteTrackResponse.from_db(t) for t in tracks],
        total=total,
        page=page,
        per_page=per_page,
        pages=pages,
    )


@router.get("/user/{username}/comments", response_model=CommentListResponse)
async def get_user_comments(
    username: str,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Get public user's comments."""
    user = await user_service.get_user_by_username(db, username)
    if not user or not user.is_active:
        raise NotFoundError("User")

    comments_list, total, pages = await comments_service.get_user_comments(
        db, str(user.id), page, per_page
    )
    return CommentListResponse(
        comments=[CommentResponse.from_db(c) for c in comments_list],
        total=total,
        page=page,
        per_page=per_page,
        pages=pages,
    )


@router.get("/user/{username}/activity", response_model=ActivityFeedResponse)
async def get_user_activity(
    username: str,
    page: int = Query(1, ge=1),
    per_page: int = Query(15, ge=1, le=50),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Get merged activity feed (favorites + comments) with pagination."""
    user = await user_service.get_user_by_username(db, username)
    if not user or not user.is_active:
        raise NotFoundError("User")

    user_oid = user.id
    skip = (page - 1) * per_page

    pipeline = [
        {"$match": {"user_id": user_oid}},
        {"$project": {
            "type": {"$literal": "favorite"},
            "track_name": "$name",
            "artist_name": "$artist_name",
            "album_image": "$album_image",
            "content": {"$literal": None},
            "track_id": "$spotify_id",
            "artist_id": "$artist_id",
            "timestamp": "$added_at",
        }},
        {"$unionWith": {
            "coll": "comments",
            "pipeline": [
                {"$match": {"user_id": user_oid, "is_deleted": False}},
                {"$project": {
                    "type": {"$literal": "comment"},
                    "track_name": "$track_name",
                    "artist_name": "$artist_name",
                    "album_image": {"$literal": None},
                    "content": "$content",
                    "track_id": "$track_id",
                    "artist_id": "$artist_id",
                    "timestamp": "$created_at",
                }},
            ],
        }},
        {"$sort": {"timestamp": -1}},
        {"$facet": {
            "items": [{"$skip": skip}, {"$limit": per_page}],
            "total": [{"$count": "count"}],
        }},
    ]

    result = await db.favorites.aggregate(pipeline).to_list(1)
    data = result[0] if result else {"items": [], "total": []}

    items = data.get("items", [])
    total_list = data.get("total", [])
    total = total_list[0]["count"] if total_list else 0
    pages_count = math.ceil(total / per_page) if total > 0 else 1

    return ActivityFeedResponse(
        items=[
            ActivityItemResponse(
                type=item["type"],
                id=str(item["_id"]),
                track_name=item.get("track_name", ""),
                artist_name=item.get("artist_name"),
                album_image=item.get("album_image"),
                content=item.get("content"),
                track_id=item.get("track_id"),
                artist_id=item.get("artist_id"),
                timestamp=item["timestamp"],
            )
            for item in items
        ],
        total=total,
        page=page,
        per_page=per_page,
        pages=pages_count,
    )


@router.get("/user/{username}", response_model=PublicUserProfileResponse)
async def get_user_profile(
    username: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Get public profile of a user by username."""
    user = await user_service.get_user_by_username(db, username)
    if not user or not user.is_active:
        raise NotFoundError("User")

    favorites_count, comments_count = await asyncio.gather(
        favorites_service.get_favorites_count(db, str(user.id)),
        comments_service.get_comments_count(db, str(user.id)),
    )

    return PublicUserProfileResponse.from_db(
        user,
        favorites_count=favorites_count,
        comments_count=comments_count,
    )
