"""
Generate demo data for SoundScout using Deezer's free API.
Outputs JSON files formatted in Spotify API shape so route handlers work unchanged.

Usage:
    cd backend && python scripts/generate_demo_data.py
"""

import asyncio
import json
import logging
from pathlib import Path
from typing import Dict, List, Optional

import httpx

logging.basicConfig(level=logging.INFO, format="%(message)s")
log = logging.getLogger(__name__)

DEMO_DIR = Path(__file__).parent.parent / "app" / "data" / "demo"
DEEZER_BASE = "https://api.deezer.com"

# Curated artists per subgenre — real, well-known artists
GENRE_ARTISTS = {
    "indie rock": [
        "Arctic Monkeys", "Tame Impala", "The Strokes", "Radiohead",
        "Arcade Fire", "Vampire Weekend", "The Black Keys", "Alt-J",
        "Foster the People", "Two Door Cinema Club", "MGMT", "The Killers",
        "Interpol", "Death Cab for Cutie", "Modest Mouse",
    ],
    "dream pop": [
        "Beach House", "Cocteau Twins", "Mazzy Star", "Cigarettes After Sex",
        "Slowdive", "M83", "Alvvays", "Japanese Breakfast",
        "Men I Trust", "Warpaint", "Wild Nothing", "Still Corners",
        "Clairo", "DIIV", "Blouse",
    ],
    "trap": [
        "Travis Scott", "Future", "21 Savage", "Migos",
        "Young Thug", "Lil Uzi Vert", "Playboi Carti", "Metro Boomin",
        "Gucci Mane", "Kodak Black", "Gunna", "Lil Baby",
        "A$AP Rocky", "Denzel Curry", "Ski Mask the Slump God",
    ],
    "jazz fusion": [
        "Snarky Puppy", "Pat Metheny", "Herbie Hancock", "Chick Corea",
        "Weather Report", "Return to Forever", "Hiromi",
        "Kamasi Washington", "Robert Glasper", "Jacob Collier",
        "Thundercat", "Casiopea", "T-Square", "Jaco Pastorius",
        "John McLaughlin",
    ],
    "synthwave": [
        "The Midnight", "FM-84", "Kavinsky", "Perturbator",
        "Carpenter Brut", "Gunship", "Timecop1983", "Mitch Murder",
        "Dance With the Dead", "Power Glove", "Com Truise", "Lazerhawk",
        "Miami Nights 1984", "Dynatron", "Electric Youth",
    ],
    "latin pop": [
        "Shakira", "Bad Bunny", "J Balvin", "Rosalia",
        "Maluma", "Ozuna", "Daddy Yankee", "Luis Fonsi",
        "Becky G", "Karol G", "Nicky Jam", "Enrique Iglesias",
        "Ricky Martin", "Thalia", "Sebastian Yatra",
    ],
    "k-pop": [
        "BTS", "BLACKPINK", "Stray Kids", "TWICE",
        "aespa", "NewJeans", "EXO", "Red Velvet",
        "SEVENTEEN", "NCT 127", "ITZY", "IVE",
        "LE SSERAFIM", "TXT", "ATEEZ",
    ],
    "blues rock": [
        "Gary Clark Jr.", "Joe Bonamassa", "The Black Keys", "Jack White",
        "John Mayer", "Stevie Ray Vaughan", "Eric Clapton", "B.B. King",
        "Buddy Guy", "Rory Gallagher", "Jonny Lang", "Kenny Wayne Shepherd",
        "Derek Trucks", "Tedeschi Trucks Band", "Gov't Mule",
    ],
    "lo-fi beats": [
        "nujabes", "J Dilla", "Tomppabeats", "Jinsang",
        "bsd.u", "idealism", "Kupla", "Philanthrope",
        "Elijah Who", "Aso", "Saib", "Nymano",
        "Wun Two", "Psalm Trees", "mt. fujitive",
    ],
    "progressive rock": [
        "Pink Floyd", "Yes", "Genesis", "King Crimson",
        "Rush", "Tool", "Porcupine Tree", "Dream Theater",
        "Opeth", "Steven Wilson", "Camel", "Jethro Tull",
        "Emerson Lake & Palmer", "Gentle Giant", "Marillion",
    ],
    # --- Cover every main genre ---
    "r&b": [
        "The Weeknd", "Frank Ocean", "SZA", "Daniel Caesar",
        "H.E.R.", "Khalid", "Summer Walker", "Jhene Aiko",
        "Brent Faiyaz", "Jorja Smith", "6LACK", "Snoh Aalegra",
        "Ari Lennox", "Lucky Daye", "Ravyn Lenae",
    ],
    "reggaeton": [
        "Daddy Yankee", "Don Omar", "Wisin", "Yandel",
        "Nicky Jam", "Farruko", "Anuel AA", "Rauw Alejandro",
        "Sech", "Myke Towers", "Jhay Cortez", "Lunay",
        "Mora", "Jay Wheeler", "Feid",
    ],
    "metal": [
        "Metallica", "Iron Maiden", "Slayer", "Megadeth",
        "Pantera", "Black Sabbath", "Judas Priest", "Lamb of God",
        "Gojira", "Mastodon", "Trivium", "Avenged Sevenfold",
        "Killswitch Engage", "Disturbed", "System of a Down",
    ],
    "country": [
        "Luke Combs", "Morgan Wallen", "Chris Stapleton", "Zach Bryan",
        "Luke Bryan", "Carrie Underwood", "Blake Shelton", "Kane Brown",
        "Jason Aldean", "Thomas Rhett", "Maren Morris", "Kacey Musgraves",
        "Tim McGraw", "Keith Urban", "Dolly Parton",
    ],
    "indie folk": [
        "Bon Iver", "Fleet Foxes", "Iron & Wine", "Sufjan Stevens",
        "The Lumineers", "Mumford & Sons", "Of Monsters and Men", "Vance Joy",
        "Hozier", "Phoebe Bridgers", "Lord Huron", "Gregory Alan Isakov",
        "The Head and the Heart", "Caamp", "Big Thief",
    ],
    "classical": [
        "Ludovico Einaudi", "Yiruma", "Hans Zimmer", "Max Richter",
        "Olafur Arnalds", "Nils Frahm", "Yo-Yo Ma", "Lang Lang",
        "Andre Rieu", "2Cellos", "Lindsey Stirling", "The Piano Guys",
        "Ennio Morricone", "John Williams", "Joe Hisaishi",
    ],
    "blues": [
        "B.B. King", "Muddy Waters", "Howlin' Wolf", "John Lee Hooker",
        "Robert Johnson", "Etta James", "Albert King", "Freddie King",
        "Keb' Mo'", "Taj Mahal", "Bonnie Raitt", "Susan Tedeschi",
        "Robert Cray", "Joe Bonamassa", "Gary Clark Jr.",
    ],
    "easy listening": [
        "Norah Jones", "Michael Buble", "Diana Krall", "Jack Johnson",
        "Sade", "Enya", "Adele", "Amy Winehouse",
        "Nana Mouskouri", "Andrea Bocelli", "Josh Groban", "Il Divo",
        "Celtic Woman", "Burt Bacharach", "Henry Mancini",
    ],
    "new age": [
        "Enya", "Yanni", "Kitaro", "Enigma",
        "Vangelis", "Jean-Michel Jarre", "Deuter", "Loreena McKennitt",
        "Dead Can Dance", "Liquid Mind", "Hiroki Okano", "Karunesh",
        "Deva Premal", "Krishna Das", "Jai-Jagdeesh",
    ],
    "dancehall": [
        "Sean Paul", "Shaggy", "Beenie Man", "Buju Banton",
        "Vybz Kartel", "Popcaan", "Alkaline", "Konshens",
        "Kranium", "Koffee", "Skeng", "Spice",
        "Shenseea", "Stylo G", "Busy Signal",
    ],
}

TRACKS_PER_ARTIST = 10


def genre_slug(genre: str) -> str:
    return genre.lower().replace(" ", "-").replace("/", "-")


def map_artist(deezer_artist: Dict, genres: List[str]) -> Dict:
    """Map Deezer artist to Spotify artist shape."""
    nb_fan = deezer_artist.get("nb_fan", 0)
    return {
        "id": str(deezer_artist["id"]),
        "name": deezer_artist["name"],
        "popularity": min(99, max(1, nb_fan // 10000)) if nb_fan > 10000 else max(1, nb_fan // 100),
        "followers": {"total": nb_fan},
        "genres": genres,
        "images": [
            {"url": deezer_artist.get("picture_xl", ""), "height": 1000, "width": 1000},
            {"url": deezer_artist.get("picture_big", ""), "height": 500, "width": 500},
            {"url": deezer_artist.get("picture_medium", ""), "height": 250, "width": 250},
        ],
        "external_urls": {"spotify": deezer_artist.get("link", "")},
        "uri": f"deezer:artist:{deezer_artist['id']}",
    }


def map_track(deezer_track: Dict, artist_id: str, artist_name: str, index: int) -> Dict:
    """Map Deezer track to Spotify track shape."""
    album = deezer_track.get("album", {})
    return {
        "id": str(deezer_track["id"]),
        "name": deezer_track.get("title", "Unknown"),
        "popularity": min(99, max(1, deezer_track.get("rank", 50000) // 10000)),
        "preview_url": deezer_track.get("preview"),
        "duration_ms": deezer_track.get("duration", 200) * 1000,
        "track_number": index + 1,
        "album": {
            "id": str(album.get("id", "")),
            "name": album.get("title", "Unknown Album"),
            "images": [
                {"url": album.get("cover_xl", ""), "height": 640, "width": 640},
                {"url": album.get("cover_big", ""), "height": 300, "width": 300},
                {"url": album.get("cover_medium", ""), "height": 120, "width": 120},
            ],
            "release_date": "2023-01-01",
            "album_type": "album",
        },
        "artists": [{"id": artist_id, "name": artist_name}],
        "external_urls": {"spotify": deezer_track.get("link", "")},
    }


async def fetch_json(client: httpx.AsyncClient, url: str, params: dict = None) -> Dict:
    for attempt in range(3):
        resp = await client.get(url, params=params)
        if resp.status_code == 200:
            return resp.json()
        if resp.status_code == 429:
            wait = 2 ** attempt
            log.warning("  Rate limited, waiting %ds...", wait)
            await asyncio.sleep(wait)
            continue
        log.warning("  HTTP %d for %s", resp.status_code, url)
        return {}
    return {}


async def find_artist(client: httpx.AsyncClient, name: str) -> Optional[Dict]:
    """Search Deezer for an artist by name and return the best match."""
    data = await fetch_json(client, f"{DEEZER_BASE}/search/artist", {"q": name, "limit": 5})
    results = data.get("data", [])
    if not results:
        return None

    # Prefer exact name match
    name_lower = name.lower()
    for r in results:
        if r["name"].lower() == name_lower:
            return r

    # Fall back to first result if close enough
    if results[0].get("nb_fan", 0) > 100:
        return results[0]

    return None


async def main():
    (DEMO_DIR / "genres").mkdir(parents=True, exist_ok=True)
    (DEMO_DIR / "artists").mkdir(parents=True, exist_ok=True)
    (DEMO_DIR / "tracks").mkdir(parents=True, exist_ok=True)

    all_artists: Dict[str, Dict] = {}
    genre_artist_map: Dict[str, List[str]] = {}

    async with httpx.AsyncClient(timeout=15.0) as client:
        for genre, artist_names in GENRE_ARTISTS.items():
            log.info("--- %s ---", genre)
            artist_ids = []

            for name in artist_names:
                # Check if already fetched (cross-genre artist like The Black Keys)
                existing = next(
                    (aid for aid, a in all_artists.items() if a["name"].lower() == name.lower()),
                    None,
                )
                if existing:
                    artist_ids.append(existing)
                    if genre not in all_artists[existing]["genres"]:
                        all_artists[existing]["genres"].append(genre)
                    log.info("  = %s (already cached)", name)
                    continue

                match = await find_artist(client, name)
                if not match:
                    log.warning("  x %s (not found)", name)
                    continue

                # Get full artist details
                detail = await fetch_json(client, f"{DEEZER_BASE}/artist/{match['id']}")
                if not detail or "error" in detail:
                    log.warning("  x %s (detail fetch failed)", name)
                    continue

                aid = str(detail["id"])
                mapped = map_artist(detail, [genre])
                all_artists[aid] = mapped
                artist_ids.append(aid)

                fans = mapped["followers"]["total"]
                log.info("  + %s (%s fans)", mapped["name"], f"{fans:,}")

                # Fetch top tracks
                tracks_data = await fetch_json(
                    client,
                    f"{DEEZER_BASE}/artist/{detail['id']}/top",
                    {"limit": TRACKS_PER_ARTIST},
                )
                raw_tracks = tracks_data.get("data", [])
                tracks = [
                    map_track(t, aid, mapped["name"], i)
                    for i, t in enumerate(raw_tracks)
                ]

                tracks_path = DEMO_DIR / "tracks" / f"{aid}.json"
                with open(tracks_path, "w", encoding="utf-8") as f:
                    json.dump({"tracks": tracks}, f, indent=2, ensure_ascii=False)

                await asyncio.sleep(0.25)

            genre_artist_map[genre] = artist_ids
            log.info("  %d artists for '%s'\n", len(artist_ids), genre)

    # Write artist detail files
    for aid, artist in all_artists.items():
        path = DEMO_DIR / "artists" / f"{aid}.json"
        with open(path, "w", encoding="utf-8") as f:
            json.dump(artist, f, indent=2, ensure_ascii=False)

    # Write genre files
    for genre, artist_ids in genre_artist_map.items():
        items = [all_artists[aid] for aid in artist_ids if aid in all_artists]
        path = DEMO_DIR / "genres" / f"{genre_slug(genre)}.json"
        with open(path, "w", encoding="utf-8") as f:
            json.dump({"items": items}, f, indent=2, ensure_ascii=False)

    # Search index
    search_index = list(all_artists.values())
    path = DEMO_DIR / "search_index.json"
    with open(path, "w", encoding="utf-8") as f:
        json.dump(search_index, f, indent=2, ensure_ascii=False)

    log.info("=== Done ===")
    log.info("Total unique artists: %d", len(all_artists))
    log.info("Genres cached: %d", len(genre_artist_map))
    for genre, ids in genre_artist_map.items():
        log.info("  %s: %d artists", genre, len(ids))
    log.info("Output: %s", DEMO_DIR)


if __name__ == "__main__":
    asyncio.run(main())
