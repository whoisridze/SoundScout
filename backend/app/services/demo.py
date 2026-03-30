import json
import logging
from pathlib import Path
from typing import Dict, List, Optional

from app.core.exceptions import SpotifyAPIError

logger = logging.getLogger(__name__)

DEMO_DIR = Path(__file__).parent.parent / "data" / "demo"


class DemoService:
    """Serves cached data instead of calling Spotify API."""

    def __init__(self):
        self._genres_data: Optional[Dict] = None
        self._genre_cache: Dict[str, Dict] = {}
        self._artist_cache: Dict[str, Dict] = {}
        self._tracks_cache: Dict[str, Dict] = {}
        self._search_index: Optional[List[Dict]] = None

    async def close(self) -> None:
        pass

    def _load_json(self, path: Path) -> Dict:
        try:
            with open(path, encoding="utf-8") as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError) as e:
            logger.warning("Demo data not found: %s", path)
            raise SpotifyAPIError(f"Demo data missing: {path.name}")

    def _load_genres(self) -> Dict:
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
        return self._load_genres().get("genres", [])

    def get_all_subgenres(self) -> List[str]:
        return self._load_genres().get("subgenres", [])

    def get_genres_map(self) -> Dict[str, List[str]]:
        return self._load_genres().get("genres_map", {})

    def get_subgenres(self, main_genre: str) -> List[str]:
        return self.get_genres_map().get(main_genre, [])

    def search_genres(self, query: str, limit: int = 50) -> List[str]:
        query_lower = query.lower()
        matches = [g for g in self.get_all_subgenres() if query_lower in g.lower()]
        return matches[:limit]

    def _get_genre_slug(self, genre: str) -> str:
        return genre.lower().replace(" ", "-").replace("/", "-")

    def _get_main_genre_for(self, subgenre: str) -> Optional[str]:
        """Find which main genre a subgenre belongs to."""
        for main, subs in self.get_genres_map().items():
            if subgenre in subs:
                return main
        return None

    def _get_cached_genres_for_main(self, main_genre: str) -> List[str]:
        """Get cached genre slugs that belong to the same main genre."""
        subs = self.get_genres_map().get(main_genre, [])
        result = []
        for sub in subs:
            slug = self._get_genre_slug(sub)
            path = DEMO_DIR / "genres" / f"{slug}.json"
            if path.exists():
                result.append(slug)
        return result

    def _load_genre_artists(self, genre: str) -> Dict:
        slug = self._get_genre_slug(genre)
        if slug not in self._genre_cache:
            path = DEMO_DIR / "genres" / f"{slug}.json"
            if path.exists():
                self._genre_cache[slug] = self._load_json(path)
            else:
                # Fallback: find cached genres from the same main genre family
                fallback = self._find_fallback_artists(genre)
                self._genre_cache[slug] = {"items": fallback}
        return self._genre_cache[slug]

    def _find_fallback_artists(self, genre: str) -> List[Dict]:
        """Find artists from a related cached genre when exact match is missing."""
        main = self._get_main_genre_for(genre)
        if main:
            siblings = self._get_cached_genres_for_main(main)
            if siblings:
                # Merge artists from sibling genres
                artists = []
                seen = set()
                for slug in siblings:
                    path = DEMO_DIR / "genres" / f"{slug}.json"
                    data = self._load_json(path)
                    for a in data.get("items", []):
                        if a["id"] not in seen:
                            artists.append(a)
                            seen.add(a["id"])
                if artists:
                    artists.sort(
                        key=lambda a: a.get("followers", {}).get("total", 0),
                        reverse=True,
                    )
                    return artists

        # Ultimate fallback: top artists from entire demo pool
        index = self._load_search_index()
        return sorted(
            index,
            key=lambda a: a.get("followers", {}).get("total", 0),
            reverse=True,
        )[:20]

    def _load_search_index(self) -> List[Dict]:
        if self._search_index is None:
            path = DEMO_DIR / "search_index.json"
            if path.exists():
                self._search_index = self._load_json(path)
            else:
                self._search_index = []
        return self._search_index

    async def search_artists_direct(self, genre: str, limit: int = 20) -> Dict:
        data = self._load_genre_artists(genre)
        items = data.get("items", [])[:limit]
        return {"items": items}

    async def search_artists(self, genre: str, limit: int = 20) -> Dict:
        return await self.search_artists_direct(genre, limit)

    async def search_by_name(self, query: str, limit: int = 3) -> Dict:
        index = self._load_search_index()
        query_lower = query.lower()
        matches = [a for a in index if query_lower in a["name"].lower()]
        matches.sort(key=lambda a: a.get("followers", {}).get("total", 0), reverse=True)
        return {"artists": {"items": matches[:limit]}}

    async def get_artist_top_tracks(self, artist_id: str, market: str = "US") -> Dict:
        if artist_id not in self._tracks_cache:
            path = DEMO_DIR / "tracks" / f"{artist_id}.json"
            if path.exists():
                self._tracks_cache[artist_id] = self._load_json(path)
            else:
                raise SpotifyAPIError(f"Demo tracks not found for {artist_id}")
        return self._tracks_cache[artist_id]

    async def get_artist(self, artist_id: str) -> Dict:
        if artist_id not in self._artist_cache:
            path = DEMO_DIR / "artists" / f"{artist_id}.json"
            if path.exists():
                self._artist_cache[artist_id] = self._load_json(path)
            else:
                raise SpotifyAPIError(f"Demo artist not found: {artist_id}")
        return self._artist_cache[artist_id]
