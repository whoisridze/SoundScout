/**
 * Format a number of followers to a human-readable string
 * @param count - Number of followers
 * @returns Formatted string like "1.2M", "500K", "1,234"
 */
export function formatFollowers(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return count.toLocaleString();
}

/**
 * Format milliseconds to a duration string
 * @param ms - Duration in milliseconds
 * @returns Formatted string like "3:45"
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Convert a Spotify Track to the flat format the favorites backend expects
 */
export function trackToFavoriteCreate(track: {
  id: string;
  name: string;
  duration_ms: number;
  preview_url: string | null;
  album: { name: string; images: { url: string }[] };
  artists: { id: string; name: string }[];
}) {
  return {
    spotify_id: track.id,
    name: track.name,
    artist_id: track.artists[0]?.id ?? "",
    artist_name: track.artists.map((a) => a.name).join(", "),
    album_name: track.album.name,
    album_image: track.album.images[0]?.url ?? null,
    preview_url: track.preview_url,
    duration_ms: track.duration_ms,
    popularity: 0,
  };
}

/**
 * Convert a flat FavoriteTrack to the nested Track shape the AudioPlayer expects
 */
export function favoriteToTrack(fav: {
  spotify_id: string;
  name: string;
  artist_id: string;
  artist_name: string;
  album_name: string;
  album_image: string | null;
  preview_url: string | null;
  duration_ms: number;
}) {
  return {
    id: fav.spotify_id,
    name: fav.name,
    duration_ms: fav.duration_ms,
    preview_url: fav.preview_url,
    track_number: 0,
    album: {
      id: "",
      name: fav.album_name,
      images: fav.album_image
        ? [{ url: fav.album_image, height: null, width: null }]
        : [],
      release_date: "",
      album_type: "",
    },
    artists: [{ id: fav.artist_id, name: fav.artist_name }],
  };
}

/**
 * Format a date string to relative time: "just now", "5m ago", "3h ago", "2d ago", "Jan 15"
 */
export function formatRelativeTime(dateString: string): string {
  // Backend stores UTC but MongoDB strips timezone info, so append Z if missing
  const normalized = dateString.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(dateString)
    ? dateString
    : dateString + "Z";
  const date = new Date(normalized);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
