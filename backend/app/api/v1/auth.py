import logging

from fastapi import APIRouter, Depends, Request
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.api.deps import get_db, get_current_active_user
from app.core.exceptions import ValidationError
from app.core.security import validate_password_strength
from app.models import (
    UserCreate,
    UserResponse,
    LoginRequest,
    RefreshRequest,
    Token,
    AccessToken,
    UserInDB,
)
from app.services import auth as auth_service
from app.services import user as user_service

router = APIRouter(prefix="/auth", tags=["Authentication"])
logger = logging.getLogger(__name__)


@router.post("/register", response_model=UserResponse, status_code=201)
async def register(
    user_data: UserCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Register a new user."""
    # Validate password strength
    is_valid, error = validate_password_strength(user_data.password)
    if not is_valid:
        raise ValidationError(error)

    user = await user_service.create_user(db, user_data)
    return UserResponse.from_db(user)


@router.post("/login", response_model=Token)
async def login(
    login_data: LoginRequest,
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Authenticate user and return tokens."""
    user = await auth_service.authenticate_user(db, login_data.email, login_data.password)
    logger.info(f"Login successful: {user.username} from {request.client.host}")
    return auth_service.create_tokens(user)


@router.post("/refresh", response_model=AccessToken)
async def refresh(
    refresh_data: RefreshRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Refresh access token using refresh token."""
    return await auth_service.refresh_access_token(db, refresh_data.refresh_token)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: UserInDB = Depends(get_current_active_user)):
    """Get current user info."""
    return UserResponse.from_db(current_user)


@router.post("/logout")
async def logout(
    request: Request,
    current_user: UserInDB = Depends(get_current_active_user),
):
    """Logout current user.

    Note: With stateless JWTs, this endpoint just logs the event.
    The client is responsible for removing tokens from storage.
    For full token invalidation, implement a token blacklist with Redis.
    """
    logger.info(f"Logout: {current_user.username} from {request.client.host}")
    return {"message": "Successfully logged out"}
