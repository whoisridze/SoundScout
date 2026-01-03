from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.exceptions import AuthenticationError, InactiveUserError
from app.core.security import verify_token
from app.db import get_database
from app.models.user import UserInDB
from app.models.common import UserRole
from app.services import user as user_service

security = HTTPBearer()


async def get_db() -> AsyncIOMotorDatabase:
    """Get database dependency."""
    return await get_database()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> UserInDB:
    """Get current authenticated user from JWT token."""
    username = verify_token(credentials.credentials)
    if not username:
        raise AuthenticationError()

    user = await user_service.get_user_by_username(db, username)
    if not user:
        raise AuthenticationError()

    return user


async def get_current_active_user(
    current_user: UserInDB = Depends(get_current_user),
) -> UserInDB:
    """Get current active user."""
    if not current_user.is_active:
        raise InactiveUserError()
    return current_user


async def get_current_admin_user(
    current_user: UserInDB = Depends(get_current_active_user),
) -> UserInDB:
    """Get current admin user."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user
