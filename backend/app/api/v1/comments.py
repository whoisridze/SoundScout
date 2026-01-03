from fastapi import APIRouter, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.api.deps import get_db, get_current_active_user
from app.models.user import UserInDB
from app.models.comment import (
    CommentCreate,
    CommentUpdate,
    CommentResponse,
    CommentListResponse,
)
from app.models.common import UserRole
from app.services import comments as comments_service

router = APIRouter(prefix="/comments", tags=["Comments"])


@router.post("", response_model=CommentResponse, status_code=201)
async def create_comment(
    comment_data: CommentCreate,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Create a new comment on a track."""
    comment = await comments_service.create_comment(
        db,
        str(current_user.id),
        current_user.username,
        comment_data,
    )
    return CommentResponse.from_db(comment, str(current_user.id))


@router.get("/track/{track_id}", response_model=CommentListResponse)
async def get_track_comments(
    track_id: str,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Get comments for a track (public)."""
    comments, total, pages = await comments_service.get_track_comments(
        db, track_id, page, per_page
    )
    return CommentListResponse(
        comments=[CommentResponse.from_db(c) for c in comments],
        total=total,
        page=page,
        per_page=per_page,
        pages=pages,
    )


@router.get("/my", response_model=CommentListResponse)
async def get_my_comments(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Get current user's comments."""
    comments, total, pages = await comments_service.get_user_comments(
        db, str(current_user.id), page, per_page
    )
    return CommentListResponse(
        comments=[CommentResponse.from_db(c, str(current_user.id)) for c in comments],
        total=total,
        page=page,
        per_page=per_page,
        pages=pages,
    )


@router.put("/{comment_id}", response_model=CommentResponse)
async def update_comment(
    comment_id: str,
    comment_data: CommentUpdate,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Update a comment (owner or admin)."""
    is_admin = current_user.role == UserRole.ADMIN
    comment = await comments_service.update_comment(
        db, comment_id, str(current_user.id), comment_data, is_admin
    )
    return CommentResponse.from_db(comment, str(current_user.id))


@router.delete("/{comment_id}")
async def delete_comment(
    comment_id: str,
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Delete a comment (owner or admin)."""
    is_admin = current_user.role == UserRole.ADMIN
    deleted = await comments_service.delete_comment(
        db, comment_id, str(current_user.id), is_admin
    )
    return {"deleted": deleted}
