import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Heart,
  Music2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useUserFavorites, useToggleFavorite } from "@/hooks";
import { useAudioPlayerContext } from "@/contexts";
import { formatDuration, formatRelativeTime, favoriteToTrack } from "@/utils";
import type { FavoriteTrack } from "@/types";

interface ProfileFavoritesProps {
  username: string;
  isOwnProfile: boolean;
}

const scrollToTabs = () => {
  document.getElementById("profile-tabs")?.scrollIntoView({ behavior: "smooth" });
};

export default function ProfileFavorites({
  username,
  isOwnProfile,
}: ProfileFavoritesProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useUserFavorites(username, page);
  const { remove, isLoading: isRemoving } = useToggleFavorite();
  const { play, pause, isPlaying, currentTrack } = useAudioPlayerContext();

  useEffect(() => { setPage(1); }, [username]);

  const handlePlay = (fav: FavoriteTrack) => {
    if (!fav.preview_url) return;
    const track = favoriteToTrack(fav);
    if (currentTrack?.id === fav.spotify_id && isPlaying) {
      pause();
    } else {
      play(track);
    }
  };

  const handleRemove = async (spotifyId: string) => {
    if (isRemoving) return;
    await remove(spotifyId);
  };

  if (isLoading) {
    return (
      <div className="bg-bg-surface rounded-2xl border border-border-subtle overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle last:border-b-0 animate-pulse"
          >
            <div className="w-11 h-11 rounded-lg bg-bg-hover" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 bg-bg-hover rounded" />
              <div className="h-3 w-32 bg-bg-hover rounded" />
            </div>
            <div className="h-4 w-10 bg-bg-hover rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!data || data.tracks.length === 0) {
    return (
      <div className="text-center py-16 bg-bg-surface rounded-2xl border border-border-subtle">
        <Heart className="w-12 h-12 text-text-muted mx-auto mb-3" />
        <p className="text-text-secondary">
          {isOwnProfile
            ? "No favorites yet. Start exploring to find tracks you love!"
            : "No favorites yet."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div key={page} className="bg-bg-surface rounded-2xl border border-border-subtle overflow-hidden">
        <AnimatePresence initial={false}>
          {data.tracks.map((fav, index) => {
            const isCurrent = currentTrack?.id === fav.spotify_id;
            const isTrackPlaying = isCurrent && isPlaying;
            const hasPreview = !!fav.preview_url;
            const rowNumber = (page - 1) * 15 + index + 1;

            return (
              <motion.div
                key={fav.id}
                layout
                initial={false}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div
                  className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 group border-b border-border-subtle last:border-b-0 ${
                    isCurrent ? "bg-primary-500/5" : "hover:bg-bg-hover"
                  }`}
                >
                  {/* Row number / Play button */}
                  <div className="w-8 flex justify-center">
                    {hasPreview ? (
                      <>
                        <button
                          onClick={() => handlePlay(fav)}
                          aria-label={isTrackPlaying ? "Pause" : `Play ${fav.name}`}
                          className={`w-8 h-8 items-center justify-center rounded-full bg-primary-500 text-white transition-all duration-200 hover:bg-primary-600 hover:scale-105 ${
                            isCurrent
                              ? "flex"
                              : "hidden group-hover:flex group-focus-within:flex"
                          }`}
                        >
                          {isTrackPlaying ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4 ml-0.5" />
                          )}
                        </button>
                        {!isCurrent && (
                          <span className="text-sm text-text-muted tabular-nums group-hover:hidden">
                            {rowNumber}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-sm text-text-disabled tabular-nums">
                        {rowNumber}
                      </span>
                    )}
                  </div>

                  {/* Album art */}
                  <div className="w-11 h-11 rounded-lg bg-bg-hover overflow-hidden flex-shrink-0 border border-border-subtle">
                    {fav.album_image ? (
                      <img
                        src={fav.album_image}
                        alt={fav.album_name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music2 className="w-5 h-5 text-text-muted" />
                      </div>
                    )}
                  </div>

                  {/* Track info */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-medium truncate transition-colors duration-200 ${
                        isCurrent ? "text-primary-400" : "text-text-primary"
                      }`}
                    >
                      {fav.name}
                    </p>
                    <p className="text-sm text-text-muted truncate">
                      {fav.artist_name}
                    </p>
                  </div>

                  {/* Duration */}
                  <div className="text-sm text-text-muted tabular-nums hidden sm:block">
                    {formatDuration(fav.duration_ms)}
                  </div>

                  {/* Added time */}
                  <div className="text-xs text-text-disabled hidden md:block">
                    {formatRelativeTime(fav.added_at)}
                  </div>

                  {/* Unfavorite */}
                  {isOwnProfile && (
                    <button
                      onClick={() => handleRemove(fav.spotify_id)}
                      disabled={isRemoving}
                      aria-label="Remove from favorites"
                      className="p-1.5 rounded-full text-accent-500 hover:text-accent-400 transition-all duration-200 disabled:opacity-50"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {data.pages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-4">
          <button
            onClick={() => { setPage((p) => Math.max(1, p - 1)); scrollToTabs(); }}
            disabled={page === 1}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-default"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <span className="text-sm text-text-muted">
            {page} / {data.pages}
          </span>
          <button
            onClick={() => { setPage((p) => Math.min(data.pages, p + 1)); scrollToTabs(); }}
            disabled={page === data.pages}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-default"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
}
