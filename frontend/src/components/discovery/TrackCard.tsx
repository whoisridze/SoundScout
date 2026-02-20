import { memo } from "react";
import { Play, Pause, Music2, MessageCircle } from "lucide-react";
import { formatDuration } from "@/utils";
import { useAudioPlayerContext } from "@/contexts";
import { FavoriteButton } from "@/components";
import type { Track } from "@/types";

interface TrackCardProps {
  track: Track;
  index: number;
  onCommentClick?: () => void;
}

function TrackCard({ track, index, onCommentClick }: TrackCardProps) {
  const { play, pause, isPlaying, currentTrack } = useAudioPlayerContext();

  const isCurrentTrack = currentTrack?.id === track.id;
  const isTrackPlaying = isCurrentTrack && isPlaying;
  const hasPreview = !!track.preview_url;

  const handlePlayClick = () => {
    if (!hasPreview) return;

    if (isTrackPlaying) {
      pause();
    } else {
      play(track);
    }
  };

  const albumImage = track.album.images[track.album.images.length - 1]?.url;

  return (
    <div
      className={`flex items-center gap-4 px-4 py-3 transition-all duration-200 group border-b border-border-subtle last:border-b-0 ${
        isCurrentTrack ? "bg-primary-500/5" : "hover:bg-bg-hover"
      }`}
    >
      {/* Track number / Play button */}
      <div className="w-8 flex justify-center">
        {hasPreview ? (
          <>
            <span
              className={`text-text-muted text-sm font-medium tabular-nums group-hover:hidden ${
                isCurrentTrack ? "hidden" : ""
              }`}
            >
              {index + 1}
            </span>
            <button
              onClick={handlePlayClick}
              aria-label={isTrackPlaying ? "Pause" : `Play ${track.name}`}
              className={`w-8 h-8 items-center justify-center rounded-full bg-primary-500 text-white transition-all duration-200 hover:bg-primary-600 hover:scale-105 ${
                isCurrentTrack ? "flex" : "hidden group-hover:flex group-focus-within:flex"
              }`}
            >
              {isTrackPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4 ml-0.5" />
              )}
            </button>
          </>
        ) : (
          <span className="text-text-muted text-sm font-medium tabular-nums">
            {index + 1}
          </span>
        )}
      </div>

      {/* Album art */}
      <div className="w-11 h-11 rounded-lg bg-bg-hover overflow-hidden flex-shrink-0 border border-border-subtle">
        {albumImage ? (
          <img
            src={albumImage}
            alt={track.album.name}
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
            isCurrentTrack ? "text-primary-400" : "text-text-primary"
          }`}
        >
          {track.name}
        </p>
        <p className="text-sm text-text-muted truncate">
          {track.artists.map((a) => a.name).join(", ")}
        </p>
      </div>

      {/* Duration */}
      <div className="text-sm text-text-muted tabular-nums">
        {formatDuration(track.duration_ms)}
      </div>

      {/* Comment button */}
      {onCommentClick && (
        <button
          onClick={onCommentClick}
          aria-label={`Comment on ${track.name}`}
          className="p-1.5 text-text-muted hover:text-primary-400 transition-default"
        >
          <MessageCircle className="w-4 h-4" />
        </button>
      )}

      {/* Favorite button */}
      <FavoriteButton track={track} />

      {/* No preview indicator */}
      {!hasPreview && (
        <div className="text-xs text-text-disabled px-2 py-1 bg-bg-hover rounded">
          No preview
        </div>
      )}
    </div>
  );
}

export default memo(TrackCard);
