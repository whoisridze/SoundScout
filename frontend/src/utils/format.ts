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
