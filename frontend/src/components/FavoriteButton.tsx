import { memo } from "react";
import { Heart } from "lucide-react";
import { useFavoriteCheck, useToggleFavorite } from "@/hooks";
import { useAuth } from "@/contexts";
import type { Track } from "@/types";

interface FavoriteButtonProps {
  track: Track;
}

function FavoriteButton({ track }: FavoriteButtonProps) {
  const { isAuthenticated } = useAuth();
  const { data: isFavorite, isLoading: isChecking } = useFavoriteCheck(
    track.id
  );
  const { add, remove, isLoading: isToggling } = useToggleFavorite();

  if (!isAuthenticated) return null;

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isToggling || isChecking) return;

    if (isFavorite) {
      await remove(track.id);
    } else {
      await add(track);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isToggling || isChecking}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      className={`p-1.5 rounded-full transition-all duration-200 ${
        isFavorite
          ? "text-accent-500 hover:text-accent-400"
          : "text-text-muted hover:text-accent-500"
      } disabled:opacity-50`}
    >
      <Heart
        className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`}
      />
    </button>
  );
}

export default memo(FavoriteButton);
