from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.common import PyObjectId


class CommentCreate(BaseModel):
    """Schema for creating a comment."""
    track_id: str = Field(..., description="Spotify track ID")
    content: str = Field(..., min_length=1, max_length=1000)


class CommentUpdate(BaseModel):
    """Schema for updating a comment."""
    content: str = Field(..., min_length=1, max_length=1000)


class CommentInDB(BaseModel):
    """Comment document in database."""
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )

    id: PyObjectId = Field(alias="_id")
    track_id: str  # Spotify track ID
    user_id: PyObjectId
    username: str  # Denormalized for display
    content: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_deleted: bool = False  # Soft delete for moderation


class CommentResponse(BaseModel):
    """Response schema for comment."""
    id: str
    track_id: str
    user_id: str
    username: str
    content: str
    created_at: datetime
    updated_at: datetime
    is_own: bool = False  # Whether current user owns this comment

    @classmethod
    def from_db(cls, comment: CommentInDB, current_user_id: Optional[str] = None) -> "CommentResponse":
        return cls(
            id=str(comment.id),
            track_id=comment.track_id,
            user_id=str(comment.user_id),
            username=comment.username,
            content=comment.content,
            created_at=comment.created_at,
            updated_at=comment.updated_at,
            is_own=current_user_id == str(comment.user_id) if current_user_id else False,
        )


class CommentListResponse(BaseModel):
    """Response for paginated comments list."""
    comments: list["CommentResponse"]
    total: int
    page: int
    per_page: int
    pages: int
