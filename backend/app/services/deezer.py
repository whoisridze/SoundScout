import asyncio
import logging
from typing import Dict, List, Optional

import httpx

logger = logging.getLogger(__name__)


class DeezerService:
    """Fallback service for fetching track previews from Deezer."""

    def __init__(self):
        self.base_url = "https://api.deezer.com"
        self._timeout = 3.0
        self._client: Optional[httpx.AsyncClient] = None

    async def _get_client(self) -> httpx.AsyncClient:
        """Get or create the persistent HTTP client."""
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(timeout=self._timeout)
        return self._client

    async def close(self) -> None:
        """Close the HTTP client."""
        if self._client and not self._client.is_closed:
            await self._client.aclose()

    async def search_track(
        self, track_name: str, artist_name: str
    ) -> Optional[str]:
        """Search Deezer for a track and return its preview URL."""
        query = f'track:"{track_name}" artist:"{artist_name}"'
        try:
            client = await self._get_client()
            response = await client.get(
                f"{self.base_url}/search",
                params={"q": query, "limit": 5},
            )
            if response.status_code != 200:
                return None

            data = response.json()
            results = data.get("data", [])
            if not results:
                return None

            # Find the best match by comparing track names
            track_lower = track_name.lower()
            for result in results:
                result_title = result.get("title", "").lower()
                preview = result.get("preview")
                if not preview:
                    continue
                # Exact or substring match
                if result_title == track_lower or track_lower in result_title:
                    return preview

            # Fall back to first result with a preview
            for result in results:
                preview = result.get("preview")
                if preview:
                    return preview

        except Exception:
            logger.debug("Deezer lookup failed for '%s' by '%s'", track_name, artist_name)

        return None

    async def enrich_tracks(self, tracks: List[Dict]) -> List[Dict]:
        """Fill in missing preview URLs from Deezer for a list of tracks."""
        if not tracks:
            return tracks

        missing = [
            (i, t)
            for i, t in enumerate(tracks)
            if not t.get("preview_url")
        ]
        if not missing:
            return tracks

        # Fetch all missing previews concurrently, using each track's own artist
        tasks = [
            self.search_track(t["name"], t["artists"][0]["name"] if t.get("artists") else "")
            for _, t in missing
        ]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        for (idx, _), result in zip(missing, results):
            if isinstance(result, str):
                tracks[idx]["preview_url"] = result

        filled = sum(1 for r in results if isinstance(r, str))
        if filled:
            logger.info("Deezer filled %d/%d missing previews", filled, len(missing))

        return tracks


deezer = DeezerService()
