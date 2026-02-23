import asyncio
import base64
import json
import logging
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Dict, List, Optional

import httpx

from app.core.config import settings
from app.core.exceptions import SpotifyAPIError

logger = logging.getLogger(__name__)


class SpotifyService:
    """Service for interacting with Spotify API."""

    def __init__(self):
        self.base_url = "https://api.spotify.com/v1"
        self.token_url = "https://accounts.spotify.com/api/token"
        self._access_token: Optional[str] = None
        self._token_expires_at: Optional[datetime] = None
        self._genres_data: Optional[Dict] = None
        self._client: Optional[httpx.AsyncClient] = None
        self._token_lock = asyncio.Lock()

    async def _get_client(self) -> httpx.AsyncClient:
        """Get or create the persistent HTTP client."""
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(timeout=10.0)
        return self._client

    async def close(self) -> None:
        """Close the HTTP client."""
        if self._client and not self._client.is_closed:
            await self._client.aclose()

    async def _get_access_token(self) -> str:
        """Get Spotify access token using Client Credentials flow."""
        async with self._token_lock:
            if (
                self._access_token
                and self._token_expires_at
                and datetime.now(timezone.utc) < self._token_expires_at
            ):
                return self._access_token

            if not settings.spotify_client_id or not settings.spotify_client_secret:
                raise SpotifyAPIError("Spotify credentials not configured")

            credentials = f"{settings.spotify_client_id}:{settings.spotify_client_secret}"
            encoded = base64.b64encode(credentials.encode()).decode()

            client = await self._get_client()
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
            self._token_expires_at = datetime.now(timezone.utc) + timedelta(
                seconds=data["expires_in"] - 60
            )
            return self._access_token

    async def _request(self, endpoint: str, params: Optional[Dict] = None, _retry: bool = True) -> Dict:
        """Make authenticated request to Spotify API."""
        token = await self._get_access_token()
        client = await self._get_client()

        response = await client.get(
            f"{self.base_url}{endpoint}",
            headers={"Authorization": f"Bearer {token}"},
            params=params,
        )

        # Handle expired token — clear cache and retry once
        if response.status_code == 401 and _retry:
            logger.warning("Spotify 401, refreshing token and retrying")
            self._access_token = None
            self._token_expires_at = None
            return await self._request(endpoint, params, _retry=False)

        if response.status_code == 429:
            retry_after = min(int(response.headers.get("Retry-After", "1")), 10)
            logger.warning("Spotify rate limited, retrying after %ds", retry_after)
            await asyncio.sleep(retry_after)
            token = await self._get_access_token()
            response = await client.get(
                f"{self.base_url}{endpoint}",
                headers={"Authorization": f"Bearer {token}"},
                params=params,
            )

        if response.status_code != 200:
            logger.error("Spotify API error %d: %s", response.status_code, response.text)
            raise SpotifyAPIError(f"Spotify API error (status {response.status_code})")

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
        except (FileNotFoundError, json.JSONDecodeError) as e:
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
                "q": f'genre:"{genre}"',
                "type": "artist",
                "limit": 10,
                "market": "US",
            },
        )
        return data.get("artists", {})

    @staticmethod
    def _genre_words_match(genre: str, artist_genres: list) -> bool:
        """Check if artist genres share significant words with the target genre."""
        genre_words = set(genre.lower().split())
        for g in artist_genres:
            tag_words = set(g.lower().split())
            # At least half of the genre words must appear in the artist's tag
            if len(genre_words & tag_words) >= max(1, len(genre_words) // 2):
                return True
        return False

    async def search_artists_direct(self, genre: str, limit: int = 20) -> Dict:
        """Search artists by genre using text search (primary) + genre tag search."""
        # Text search (paginated, returns popular artists) + genre tag search
        text_tasks = [
            self._request(
                "/search",
                params={
                    "q": genre,
                    "type": "artist",
                    "limit": 10,
                    "offset": offset,
                    "market": "US",
                },
            )
            for offset in range(0, 30, 10)
        ]
        genre_task = self._request(
            "/search",
            params={
                "q": f'genre:"{genre}"',
                "type": "artist",
                "limit": 10,
                "market": "US",
            },
        )
        results = await asyncio.gather(
            *text_tasks, genre_task, return_exceptions=True
        )

        seen_ids: set = set()
        text_matched: List = []  # text results with matching genre tags
        text_no_genres: List = []  # text results with no genres (probably relevant)

        # Process text search results in tiers
        for r in results[:3]:
            if isinstance(r, Exception):
                continue
            for a in r.get("artists", {}).get("items", []):
                if a["id"] in seen_ids:
                    continue
                seen_ids.add(a["id"])
                if not a.get("genres"):
                    text_no_genres.append(a)
                elif self._genre_words_match(genre, a["genres"]):
                    text_matched.append(a)
                # else: has genres but none match (e.g. "Trapt" for trap) — skip

        # Genre tag search results (exact tag matches, fills gaps)
        genre_items: List = []
        genre_result = results[3]
        if not isinstance(genre_result, Exception):
            for a in genre_result.get("artists", {}).get("items", []):
                if a["id"] not in seen_ids:
                    genre_items.append(a)
                    seen_ids.add(a["id"])

        # Merge: confirmed matches first, then genre search, then no-tag artists
        items = text_matched + genre_items + text_no_genres
        return {"items": items}

    async def search_by_name(self, query: str, limit: int = 3) -> Dict:
        """Search artists by name (for global search bar)."""
        data = await self._request(
            "/search",
            params={
                "q": query,
                "type": "artist",
                "limit": limit,
                "market": "US",
            },
        )
        return data

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
