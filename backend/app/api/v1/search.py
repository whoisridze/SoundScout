import asyncio
from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel

from app.api.deps import get_db
from app.services import search as search_service

router = APIRouter(prefix="/search", tags=["Search"])


class UserSearchResult(BaseModel):
    id: str
    username: str
    avatar_url: Optional[str] = None


class ArtistSearchResult(BaseModel):
    id: str
    name: str
    followers: int
    image: Optional[str] = None


class SearchResponse(BaseModel):
    users: List[UserSearchResult]
    artists: List[ArtistSearchResult]


@router.get("", response_model=SearchResponse)
async def global_search(
    q: str = Query(..., min_length=2, max_length=100),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Search for users and artists."""
    users, artists = await asyncio.gather(
        search_service.search_users(db, q, limit=5),
        search_service.search_artists(q, limit=3),
    )

    return SearchResponse(
        users=[UserSearchResult(**u) for u in users],
        artists=[ArtistSearchResult(**a) for a in artists],
    )
