from fastapi import APIRouter, Path, Query

from app.core.exceptions import NotFoundError
from app.services import spotify

router = APIRouter(prefix="/genres", tags=["Genres"])


@router.get("")
async def get_main_genres():
    """Get all main music genres."""
    genres = spotify.get_main_genres()
    return {"genres": genres, "total": len(genres)}


@router.get("/all")
async def get_all_genres():
    """Get all genres including subgenres and mapping."""
    return {
        "main_genres": spotify.get_main_genres(),
        "all_subgenres": spotify.get_all_subgenres(),
        "genres_map": spotify.get_genres_map(),
        "total_main": len(spotify.get_main_genres()),
        "total_subgenres": len(spotify.get_all_subgenres()),
    }


@router.get("/search")
async def search_genres(
    q: str = Query(..., min_length=2, description="Search query for genres"),
):
    """Search genres by query string."""
    matches = spotify.search_genres(q)
    return {"query": q, "genres": matches, "total": len(matches)}


@router.get("/{main_genre:path}/subgenres")
async def get_subgenres(main_genre: str = Path(..., description="Main genre name")):
    """Get subgenres for a specific main genre."""
    subgenres = spotify.get_subgenres(main_genre)
    if not subgenres:
        raise NotFoundError(f"Main genre '{main_genre}'")
    return {
        "main_genre": main_genre,
        "subgenres": subgenres,
        "total": len(subgenres),
    }
