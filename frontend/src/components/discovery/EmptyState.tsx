import { memo } from "react";
import { Music2, Search, Users } from "lucide-react";

interface EmptyStateProps {
  variant?: "genres" | "artists" | "tracks" | "search";
  message?: string;
}

const icons = {
  genres: Music2,
  artists: Users,
  tracks: Music2,
  search: Search,
};

const defaultMessages = {
  genres: "No genres available",
  artists: "No artists found for this genre",
  tracks: "No tracks available",
  search: "No results found",
};

function EmptyState({ variant = "genres", message }: EmptyStateProps) {
  const Icon = icons[variant];
  const displayMessage = message || defaultMessages[variant];

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-bg-surface flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-text-muted" />
      </div>
      <p className="text-text-secondary">{displayMessage}</p>
    </div>
  );
}

export default memo(EmptyState);
