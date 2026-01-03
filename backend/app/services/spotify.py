import base64
import json
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional

import httpx

from app.core.config import settings
from app.core.exceptions import SpotifyAPIError


class SpotifyService:
    """Service for interacting with Spotify API."""

    def __init__(self):
        self.base_url = "https://api.spotify.com/v1"
        self.token_url = "https://accounts.spotify.com/api/token"
        self._access_token: Optional[str] = None
        self._token_expires_at: Optional[datetime] = None
        self._genres_data: Optional[Dict] = None

    async def _get_access_token(self) -> str:
        """Get Spotify access token using Client Credentials flow."""
        if (
            self._access_token
            and self._token_expires_at
            and datetime.now() < self._token_expires_at
        ):
            return self._access_token

        if not settings.spotify_client_id or not settings.spotify_client_secret:
            raise SpotifyAPIError("Spotify credentials not configured")

        credentials = f"{settings.spotify_client_id}:{settings.spotify_client_secret}"
        encoded = base64.b64encode(credentials.encode()).decode()

        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.token_url,
                headers={
                    "Authorization": f"Basic {encoded}",
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                data={"grant_type": "client_credentials"},
            )

            if response.status_code != 200:
                raise SpotifyAPIError("Failed to get Spotify access token")

            data = response.json()
            self._access_token = data["access_token"]
            # Refresh 60 seconds before expiration
            self._token_expires_at = datetime.now() + timedelta(
                seconds=data["expires_in"] - 60
            )
            return self._access_token

    async def _request(self, endpoint: str, params: Optional[Dict] = None) -> Dict:
        """Make authenticated request to Spotify API."""
        token = await self._get_access_token()

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}{endpoint}",
                headers={"Authorization": f"Bearer {token}"},
                params=params,
            )

            if response.status_code != 200:
                raise SpotifyAPIError(f"Spotify API error: {response.text}")

            return response.json()

    def _load_genres(self) -> Dict:
        """Load genres data from JSON file."""
        if self._genres_data:
            return self._genres_data

        genres_path = Path(__file__).parent.parent / "data" / "genres_dict.json"
        try:
            with open(genres_path, encoding="utf-8") as f:
                self._genres_data = json.load(f)
                return self._genres_data
        except Exception as e:
            raise SpotifyAPIError(f"Failed to load genres: {e}")

    def get_main_genres(self) -> List[str]:
        """Get list of main genres."""
        return self._load_genres().get("genres", [])

    def get_all_subgenres(self) -> List[str]:
        """Get list of all subgenres."""
        return self._load_genres().get("subgenres", [])

    def get_genres_map(self) -> Dict[str, List[str]]:
        """Get mapping of main genres to subgenres."""
        return self._load_genres().get("genres_map", {})

    def get_subgenres(self, main_genre: str) -> List[str]:
        """Get subgenres for a specific main genre."""
        return self.get_genres_map().get(main_genre, [])

    def search_genres(self, query: str, limit: int = 50) -> List[str]:
        """Search genres by query string."""
        query_lower = query.lower()
        matches = [g for g in self.get_all_subgenres() if query_lower in g.lower()]
        return matches[:limit]

    async def search_artists(self, genre: str, limit: int = 20) -> Dict:
        """Search artists by genre."""
        data = await self._request(
            "/search",
            params={
                "q": f"genre:{genre}",
                "type": "artist",
                "limit": limit,
                "market": "US",
            },
        )
        return data.get("artists", {})

    async def search_artists_direct(self, genre: str, limit: int = 20) -> Dict:
        """Search artists by genre directly from Spotify (no validation)."""
        # First try with genre: prefix
        data = await self._request(
            "/search",
            params={
                "q": f"genre:{genre}",
                "type": "artist",
                "limit": limit,
                "market": "US",
            },
        )
        result = data.get("artists", {})

        # If few results, try broader search without genre: prefix
        if len(result.get("items", [])) < 5:
            data = await self._request(
                "/search",
                params={
                    "q": genre,
                    "type": "artist",
                    "limit": limit,
                    "market": "US",
                },
            )
            result = data.get("artists", {})

        return result

    async def get_artist_top_tracks(self, artist_id: str, market: str = "US") -> Dict:
        """Get artist's top tracks."""
        return await self._request(
            f"/artists/{artist_id}/top-tracks",
            params={"market": market},
        )

    async def get_artist(self, artist_id: str) -> Dict:
        """Get artist details by ID."""
        return await self._request(f"/artists/{artist_id}")


# Singleton instance
spotify = SpotifyService()
