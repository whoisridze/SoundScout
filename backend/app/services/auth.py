from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.exceptions import InvalidCredentialsError, InvalidTokenError, InactiveUserError
from app.core.security import (
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_token,
)
from app.models.token import Token, AccessToken
from app.models.user import UserInDB
from app.services import user as user_service


async def authenticate_user(
    db: AsyncIOMotorDatabase, email: str, password: str
) -> UserInDB:
    """Authenticate user with email and password."""
    user = await user_service.get_user_by_email(db, email)
    if not user:
        raise InvalidCredentialsError()

    if not await verify_password(password, user.hashed_password):
        raise InvalidCredentialsError()

    if not user.is_active:
        raise InactiveUserError()

    return user


def create_tokens(user: UserInDB) -> Token:
    """Create access and refresh tokens for user."""
    user_id = str(user.id)
    access_token = create_access_token(subject=user_id)
    refresh_token = create_refresh_token(subject=user_id)
    return Token(access_token=access_token, refresh_token=refresh_token)


async def refresh_access_token(db: AsyncIOMotorDatabase, refresh_token: str) -> AccessToken:
    """Create new access token using refresh token.

    Note: Only returns new access token, not a new refresh token.
    This is more secure as refresh tokens should be long-lived and not rotated on every use.
    """
    user_id = verify_token(refresh_token, token_type="refresh")
    if not user_id:
        raise InvalidTokenError("Invalid or expired refresh token")

    user = await user_service.get_user_by_id(db, user_id)
    if not user:
        raise InvalidTokenError("User not found")

    if not user.is_active:
        raise InactiveUserError()

    access_token = create_access_token(subject=str(user.id))
    return AccessToken(access_token=access_token)
