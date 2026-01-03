from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.api.deps import get_db, get_current_active_user
from app.models.user import UserInDB, UserUpdate, UserResponse, UserProfileResponse
from app.services import user as user_service
from app.services import favorites as favorites_service
from app.services import comments as comments_service

router = APIRouter(prefix="/profile", tags=["Profile"])


@router.get("", response_model=UserProfileResponse)
async def get_profile(
    current_user: UserInDB = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Get current user's profile with stats."""
    favorites_count = await favorites_service.get_favorites_count(
        db, str(current_user.id)
    )
    comments_count = await comments_service.get_comments_count(
        db, str(current_user.id)
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


@router.get("/user/{username}", response_model=UserProfileResponse)
async def get_user_profile(
    username: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Get public profile of a user by username."""
    from app.core.exceptions import NotFoundError

    user = await user_service.get_user_by_username(db, username)
    if not user:
        raise NotFoundError("User")

    favorites_count = await favorites_service.get_favorites_count(
        db, str(user.id)
    )
    comments_count = await comments_service.get_comments_count(
        db, str(user.id)
    )

    return UserProfileResponse.from_db(
        user,
        favorites_count=favorites_count,
        comments_count=comments_count,
    )
