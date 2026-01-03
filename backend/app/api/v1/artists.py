from typing import Optional

from fastapi import APIRouter, Query

from app.core.exceptions import NotFoundError, SpotifyAPIError
from app.services import spotify

router = APIRouter(prefix="/artists", tags=["Artists"])


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
        "popularity": artist["popularity"],
        "followers": artist["followers"]["total"],
        "genres": artist["genres"],
        "images": artist["images"],
        "external_urls": artist["external_urls"],
        "uri": artist["uri"],
    }


@router.get("/artist/{artist_id}/similar")
async def get_similar_artists(
    artist_id: str,
    limit: int = Query(10, ge=1, le=20, description="Number of similar artists"),
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

    # First pass: try genres from our validated list
    for genre in artist_genres:
        if genre in valid_subgenres:
            search_results = await spotify.search_artists(genre, limit=limit + 5)
            found_artists = search_results.get("items", [])
            if len(found_artists) >= 3:
                used_genre = genre
                break

    # Second pass: if no good results, try all genres with direct search
    if len(found_artists) < 3:
        for genre in artist_genres:
            # Skip very generic single-word genres
            if len(genre.split()) > 1 or genre in valid_subgenres:
                search_results = await spotify.search_artists_direct(genre, limit=limit + 5)
                found_artists = search_results.get("items", [])
                if len(found_artists) >= 3:
                    used_genre = genre
                    break

    # Filter out the original artist and format response
    similar = [
        {
            "id": a["id"],
            "name": a["name"],
            "popularity": a["popularity"],
            "followers": a["followers"]["total"],
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
    limit: int = Query(20, ge=1, le=50, description="Number of artists to return"),
):
    """Search artists by genre using Spotify API."""
    # Validate genre exists
    all_subgenres = spotify.get_all_subgenres()
    if genre not in all_subgenres:
        # Try to suggest similar genres
        suggestions = spotify.search_genres(genre)
        if suggestions:
            return {
                "error": f"Genre '{genre}' not found",
                "suggestions": suggestions[:10],
                "message": "Try one of the suggested genres instead",
            }
        raise NotFoundError(f"Genre '{genre}'")

    artists_data = await spotify.search_artists(genre, limit)
    artists = artists_data.get("items", [])

    formatted = [
        {
            "id": a["id"],
            "name": a["name"],
            "popularity": a["popularity"],
            "followers": a["followers"]["total"],
            "images": a["images"],
            "genres": a["genres"],
            "external_urls": a["external_urls"],
        }
        for a in artists
    ]

    return {"genre": genre, "artists": formatted, "total": len(formatted)}


@router.get("/{artist_id}/tracks")
async def get_artist_tracks(artist_id: str):
    """Get artist's top tracks."""
    tracks_data = await spotify.get_artist_top_tracks(artist_id)
    tracks = tracks_data.get("tracks", [])

    formatted = [
        {
            "id": t["id"],
            "name": t["name"],
            "popularity": t["popularity"],
            "preview_url": t["preview_url"],
            "duration_ms": t["duration_ms"],
            "album": {
                "id": t["album"]["id"],
                "name": t["album"]["name"],
                "images": t["album"]["images"],
                "release_date": t["album"]["release_date"],
            },
            "external_urls": t["external_urls"],
        }
        for t in tracks
    ]

    return {"artist_id": artist_id, "tracks": formatted, "total": len(formatted)}
