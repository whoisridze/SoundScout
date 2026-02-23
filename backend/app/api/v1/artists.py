from fastapi import APIRouter, Query

from app.core.exceptions import NotFoundError, SpotifyAPIError
from app.services import deezer, spotify

router = APIRouter(prefix="/artists", tags=["Artists"])


def _artist_rank(a: dict) -> tuple:
    """Rank artists by available signals (no followers/popularity needed).

    Heuristic: artists with images and genre tags are more established.
    """
    images = a.get("images", [])
    has_image = 1 if images else 0
    max_res = max((img.get("height", 0) or 0 for img in images), default=0)
    genre_count = len(a.get("genres", []))
    return (has_image, max_res, genre_count)


@router.get("/artist/{artist_id}")
async def get_artist_details(artist_id: str):
    """Get full artist details for artist card."""
    try:
        artist = await spotify.get_artist(artist_id)
    except SpotifyAPIError:
        raise NotFoundError(f"Artist with ID '{artist_id}'")

    return {
        "id": artist["id"],
        "name": artist["name"],
        "genres": artist["genres"],
        "images": artist["images"],
        "external_urls": artist["external_urls"],
        "uri": artist["uri"],
    }


@router.get("/artist/{artist_id}/similar")
async def get_similar_artists(
    artist_id: str,
    limit: int = Query(10, ge=1, le=10, description="Number of similar artists"),
):
    """Get similar artists based on shared genres."""
    # Get the original artist's details
    try:
        artist = await spotify.get_artist(artist_id)
    except SpotifyAPIError:
        raise NotFoundError(f"Artist with ID '{artist_id}'")

    artist_genres = artist.get("genres", [])
    if not artist_genres:
        return {
            "artist_id": artist_id,
            "artist_name": artist["name"],
            "based_on_genre": None,
            "artist_genres": [],
            "similar_artists": [],
            "total": 0,
        }

    # Get our validated subgenres list
    valid_subgenres = set(spotify.get_all_subgenres())

    # Find first genre that exists in our database (more specific genres)
    found_artists = []
    used_genre = None

    # First pass: try genres from our validated list (with text fallback)
    for genre in artist_genres:
        if genre in valid_subgenres:
            search_results = await spotify.search_artists_direct(genre, limit=10)
            found_artists = search_results.get("items", [])
            if len(found_artists) >= 3:
                used_genre = genre
                break

    # Second pass: if no good results, try all genres
    if len(found_artists) < 3:
        for genre in artist_genres:
            if len(genre.split()) > 1 or genre in valid_subgenres:
                search_results = await spotify.search_artists_direct(genre, limit=10)
                found_artists = search_results.get("items", [])
                if len(found_artists) >= 3:
                    used_genre = genre
                    break

    found_artists.sort(key=_artist_rank, reverse=True)
    similar = [
        {
            "id": a["id"],
            "name": a["name"],
            "genres": a["genres"],
            "images": a["images"],
            "external_urls": a["external_urls"],
        }
        for a in found_artists
        if a["id"] != artist_id
    ][:limit]

    return {
        "artist_id": artist_id,
        "artist_name": artist["name"],
        "based_on_genre": used_genre,
        "artist_genres": artist_genres,
        "similar_artists": similar,
        "total": len(similar),
    }


@router.get("/{genre}")
async def get_artists_by_genre(
    genre: str,
    limit: int = Query(10, ge=1, le=10, description="Number of artists to return"),
):
    """Search artists by genre using Spotify API."""
    # Validate genre exists
    all_subgenres = spotify.get_all_subgenres()
    if genre not in all_subgenres:
        raise NotFoundError(f"Genre '{genre}'")

    # Use search_artists_direct which has fallback for when genre: search fails
    artists_data = await spotify.search_artists_direct(genre, limit)
    artists = artists_data.get("items", [])

    artists.sort(key=_artist_rank, reverse=True)
    formatted = [
        {
            "id": a["id"],
            "name": a["name"],
            "images": a["images"],
            "genres": a["genres"],
            "external_urls": a["external_urls"],
        }
        for a in artists
    ]

    return {"genre": genre, "artists": formatted, "total": len(formatted)}


@router.get("/artist/{artist_id}/tracks")
async def get_artist_tracks(artist_id: str):
    """Get artist's top tracks."""
    try:
        tracks_data = await spotify.get_artist_top_tracks(artist_id)
    except SpotifyAPIError:
        raise NotFoundError(f"Tracks for artist '{artist_id}'")
    tracks = tracks_data.get("tracks", [])

    formatted = [
        {
            "id": t["id"],
            "name": t["name"],
            "popularity": t.get("popularity", 0),
            "preview_url": t["preview_url"],
            "duration_ms": t["duration_ms"],
            "track_number": t.get("track_number", 1),
            "album": {
                "id": t["album"]["id"],
                "name": t["album"]["name"],
                "images": t["album"]["images"],
                "release_date": t["album"]["release_date"],
                "album_type": t["album"].get("album_type", "album"),
            },
            "artists": [
                {"id": a["id"], "name": a["name"]}
                for a in t.get("artists", [])
            ],
            "external_urls": t["external_urls"],
        }
        for t in tracks
    ]

    # Fill missing preview URLs from Deezer
    formatted = await deezer.enrich_tracks(formatted)

    return {"artist_id": artist_id, "tracks": formatted, "total": len(formatted)}
