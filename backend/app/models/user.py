from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.models.common import PyObjectId, UserRole


class UserBase(BaseModel):
    """Base user fields."""
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr

    @field_validator("username")
    @classmethod
    def username_alphanumeric(cls, v: str) -> str:
        if not v.replace("_", "").replace("-", "").isalnum():
            raise ValueError("Username must be alphanumeric (underscores and hyphens allowed)")
        return v.lower()


class UserCreate(UserBase):
    """Schema for user registration."""
    password: str = Field(..., min_length=8, max_length=128)


class UserUpdate(BaseModel):
    """Schema for updating user profile."""
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    status: Optional[str] = Field(None, max_length=100)

    @field_validator("username")
    @classmethod
    def username_alphanumeric(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        if not v.replace("_", "").replace("-", "").isalnum():
            raise ValueError("Username must be alphanumeric (underscores and hyphens allowed)")
        return v.lower()


class UserInDB(UserBase):
    """User document from database."""
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )

    id: PyObjectId = Field(alias="_id")
    hashed_password: str
    is_active: bool = True
    role: UserRole = UserRole.USER
    avatar_url: Optional[str] = None
    banner_url: Optional[str] = None
    status: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class UserResponse(BaseModel):
    """Schema for user API response."""
    id: str
    username: str
    email: str
    is_active: bool
    role: UserRole
    avatar_url: Optional[str] = None
    banner_url: Optional[str] = None
    status: Optional[str] = None
    created_at: datetime

    @classmethod
    def from_db(cls, user: UserInDB) -> "UserResponse":
        return cls(
            id=str(user.id),
            username=user.username,
            email=user.email,
            is_active=user.is_active,
            role=user.role,
            avatar_url=user.avatar_url,
            banner_url=user.banner_url,
            status=user.status,
            created_at=user.created_at,
        )


class UserProfileResponse(BaseModel):
    """Schema for user profile with stats (private — includes email)."""
    id: str
    username: str
    email: str
    is_active: bool
    role: UserRole
    avatar_url: Optional[str] = None
    banner_url: Optional[str] = None
    status: Optional[str] = None
    created_at: datetime
    favorites_count: int = 0
    comments_count: int = 0

    @classmethod
    def from_db(
        cls,
        user: UserInDB,
        favorites_count: int = 0,
        comments_count: int = 0,
    ) -> "UserProfileResponse":
        return cls(
            id=str(user.id),
            username=user.username,
            email=user.email,
            is_active=user.is_active,
            role=user.role,
            avatar_url=user.avatar_url,
            banner_url=user.banner_url,
            status=user.status,
            created_at=user.created_at,
            favorites_count=favorites_count,
            comments_count=comments_count,
        )


class PublicUserProfileResponse(BaseModel):
    """Schema for public user profile (no email)."""
    id: str
    username: str
    role: UserRole
    avatar_url: Optional[str] = None
    banner_url: Optional[str] = None
    status: Optional[str] = None
    created_at: datetime
    favorites_count: int = 0
    comments_count: int = 0

    @classmethod
    def from_db(
        cls,
        user: UserInDB,
        favorites_count: int = 0,
        comments_count: int = 0,
    ) -> "PublicUserProfileResponse":
        return cls(
            id=str(user.id),
            username=user.username,
            role=user.role,
            avatar_url=user.avatar_url,
            banner_url=user.banner_url,
            status=user.status,
            created_at=user.created_at,
            favorites_count=favorites_count,
            comments_count=comments_count,
        )


# Settings models
class PasswordChange(BaseModel):
    """Schema for changing password."""
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8, max_length=128)


class EmailChange(BaseModel):
    """Schema for changing email."""
    email: EmailStr
    password: str = Field(..., min_length=1)


class DeleteAccountRequest(BaseModel):
    """Schema for account deletion confirmation."""
    password: str = Field(..., min_length=1)


# Admin models
class AdminUserUpdate(BaseModel):
    """Schema for admin updating user."""
    is_active: Optional[bool] = None
    role: Optional[UserRole] = None


class UserListResponse(BaseModel):
    """Schema for paginated user list."""
    users: list["UserResponse"]
    total: int
    page: int
    per_page: int
    pages: int
