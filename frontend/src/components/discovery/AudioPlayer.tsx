import { memo, useRef } from "react";
import { Play, Pause, X, Music2, Volume2, VolumeX } from "lucide-react";
import { useAudioPlayerContext } from "@/contexts";
import { formatDuration } from "@/utils";

function AudioPlayer() {
  const {
    currentTrack,
    isPlaying,
    progress,
    duration,
    volume,
    toggle,
    stop,
    seek,
    setVolume,
  } = useAudioPlayerContext();

  const prevVolumeRef = useRef(0.7);
  const isMuted = volume === 0;

  if (!currentTrack) return null;

  const albumImage =
    currentTrack.album.images[currentTrack.album.images.length - 1]?.url;
  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    seek(Math.max(0, Math.min(1, percent)) * duration);
  };

  const handleProgressKeyDown = (e: React.KeyboardEvent) => {
    const step = duration * 0.05; // 5% per keypress
    if (e.key === "ArrowRight") seek(Math.min(progress + step, duration));
    else if (e.key === "ArrowLeft") seek(Math.max(progress - step, 0));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (val > 0) prevVolumeRef.current = val;
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(prevVolumeRef.current || 0.7);
    } else {
      prevVolumeRef.current = volume;
      setVolume(0);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-bg-elevated/95 backdrop-blur-md border-t border-border-subtle shadow-xl">
      {/* Progress bar */}
      <div
        className="h-1.5 bg-bg-surface cursor-pointer group relative"
        role="slider"
        tabIndex={0}
        aria-label="Seek"
        aria-valuenow={Math.round(progressPercent)}
        aria-valuemin={0}
        aria-valuemax={100}
        onClick={handleProgressClick}
        onKeyDown={handleProgressKeyDown}
      >
        {/* Gradient fill */}
        <div
          className="h-full bg-gradient-to-r from-primary-500 to-accent-500"
          style={{ width: `${progressPercent}%` }}
        />
        {/* Glow under the filled portion */}
        <div
          className="absolute top-0 h-full blur-sm opacity-50 bg-gradient-to-r from-primary-500 to-accent-500"
          style={{ width: `${progressPercent}%` }}
        />
        {/* Hover thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity"
          style={{
            left: `${progressPercent}%`,
            marginLeft: "-6px",
            boxShadow: "0 0 6px var(--color-primary-500)",
          }}
        />
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-3 flex items-center gap-4">
        {/* Album art with playing indicator */}
        <div
          className={`w-11 h-11 rounded-lg bg-bg-surface overflow-hidden flex-shrink-0 border transition-all duration-300 ${
            isPlaying
              ? "border-primary-500/40 shadow-glow-primary"
              : "border-border-subtle"
          }`}
        >
          {albumImage ? (
            <img
              src={albumImage}
              alt={currentTrack.album.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music2 className="w-5 h-5 text-text-muted" />
            </div>
          )}
        </div>

        {/* Track info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary truncate">
            {currentTrack.name}
          </p>
          <p className="text-xs text-text-muted truncate">
            {currentTrack.artists.map((a) => a.name).join(", ")}
          </p>
        </div>

        {/* Time */}
        <div className="text-xs tabular-nums text-text-muted hidden sm:block whitespace-nowrap">
          {formatDuration(progress * 1000)}{" "}
          <span className="text-text-disabled">/</span>{" "}
          {formatDuration(duration * 1000)}
        </div>

        {/* Play / Pause */}
        <button
          onClick={toggle}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="w-9 h-9 rounded-full bg-primary-600 text-white flex items-center justify-center hover:bg-primary-500 transition-colors flex-shrink-0 shadow-glow-primary"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4 ml-0.5" />
          )}
        </button>

        {/* Volume */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute" : "Mute"}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            aria-label="Volume"
            className="volume-slider w-20"
          />
        </div>

        {/* Close */}
        <button
          onClick={stop}
          aria-label="Close player"
          className="w-7 h-7 rounded-full text-text-disabled hover:text-text-primary hover:bg-bg-hover flex items-center justify-center transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default memo(AudioPlayer);
