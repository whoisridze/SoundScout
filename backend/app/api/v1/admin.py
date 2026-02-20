import asyncio

from fastapi import APIRouter, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.api.deps import get_db, get_current_admin_user
from app.core.exceptions import NotFoundError
from app.models.user import (
    UserInDB,
    UserResponse,
    AdminUserUpdate,
    UserListResponse,
)
from app.models.comment import CommentResponse, CommentListResponse
from app.services import user as user_service
from app.services import comments as comments_service
from app.services import favorites as favorites_service

router = APIRouter(prefix="/admin", tags=["Admin"])


# User management
@router.get("/users", response_model=UserListResponse)
async def list_users(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: str = Query(None, description="Search by username or email"),
    admin: UserInDB = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """List all users (admin only)."""
    users, total, pages = await user_service.get_all_users(
        db, page, per_page, search
    )
    return UserListResponse(
        users=[UserResponse.from_db(u) for u in users],
        total=total,
        page=page,
        per_page=per_page,
        pages=pages,
    )


@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    admin: UserInDB = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Get user details (admin only)."""
    user = await user_service.get_user_by_id(db, user_id)
    if not user:
        raise NotFoundError("User")
    return UserResponse.from_db(user)


@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    update_data: AdminUserUpdate,
    admin: UserInDB = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Update user (admin only) - can change role and active status."""
    if user_id == str(admin.id):
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot modify your own role or status",
        )
    user = await user_service.admin_update_user(db, user_id, update_data)
    return UserResponse.from_db(user)


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    admin: UserInDB = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Delete user (admin only)."""
    if user_id == str(admin.id):
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account",
        )
    await user_service.delete_user(db, user_id)
    return {"message": "User deleted"}


# Comment moderation
@router.get("/comments", response_model=CommentListResponse)
async def list_all_comments(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    include_deleted: bool = Query(False),
    admin: UserInDB = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """List all comments (admin only)."""
    comments, total, pages = await comments_service.get_all_comments_admin(
        db, page, per_page, include_deleted
    )
    return CommentListResponse(
        comments=[CommentResponse.from_db(c, str(admin.id)) for c in comments],
        total=total,
        page=page,
        per_page=per_page,
        pages=pages,
    )


@router.delete("/comments/{comment_id}")
async def admin_delete_comment(
    comment_id: str,
    admin: UserInDB = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Delete any comment (admin only)."""
    deleted = await comments_service.delete_comment(
        db, comment_id, str(admin.id), is_admin=True
    )
    return {"deleted": deleted}


# Stats
@router.get("/stats")
async def get_stats(
    admin: UserInDB = Depends(get_current_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Get platform statistics (admin only)."""
    users_count, comments_count, favorites_count = await asyncio.gather(
        user_service.get_users_count(db),
        db.comments.count_documents({"is_deleted": False}),
        db.favorites.count_documents({}),
    )

    return {
        "users": users_count,
        "comments": comments_count,
        "favorites": favorites_count,
    }
