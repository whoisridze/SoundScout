import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import type { Track } from "@/types";

interface AudioPlayerState {
  isPlaying: boolean;
  currentTrack: Track | null;
  progress: number;
  duration: number;
  volume: number;
}

interface AudioPlayerContextValue extends AudioPlayerState {
  play: (track: Track) => void;
  pause: () => void;
  toggle: () => void;
  seek: (time: number) => void;
  stop: () => void;
  setVolume: (volume: number) => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextValue | null>(null);

export function useAudioPlayerContext() {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error(
      "useAudioPlayerContext must be used within an AudioPlayerProvider"
    );
  }
  return context;
}

interface AudioPlayerProviderProps {
  children: ReactNode;
}

export function AudioPlayerProvider({ children }: AudioPlayerProviderProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number>(0);
  const stateRef = useRef<AudioPlayerState>({
    isPlaying: false,
    currentTrack: null,
    progress: 0,
    duration: 0,
    volume: 0.7,
  });
  const [state, setState] = useState<AudioPlayerState>(stateRef.current);

  // Keep stateRef in sync
  const updateState = useCallback(
    (updater: (prev: AudioPlayerState) => AudioPlayerState) => {
      setState((prev) => {
        const next = updater(prev);
        stateRef.current = next;
        return next;
      });
    },
    []
  );

  // Smooth progress updates via requestAnimationFrame
  const startProgressLoop = useCallback(() => {
    const tick = () => {
      const audio = audioRef.current;
      if (audio && !audio.paused) {
        updateState((prev) => ({ ...prev, progress: audio.currentTime }));
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
  }, [updateState]);

  const stopProgressLoop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
  }, []);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = 0.7;

    const audio = audioRef.current;

    const handleLoadedMetadata = () => {
      updateState((prev) => ({
        ...prev,
        duration: audio.duration,
      }));
    };

    const handleEnded = () => {
      stopProgressLoop();
      updateState((prev) => ({
        ...prev,
        isPlaying: false,
        progress: 0,
      }));
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      cancelAnimationFrame(rafRef.current);
      audio.pause();
    };
  }, [stopProgressLoop, updateState]);

  const play = useCallback((track: Track) => {
    const audio = audioRef.current;
    if (!audio || !track.preview_url) return;

    // If it's a different track, load it
    if (audio.src !== track.preview_url) {
      audio.src = track.preview_url;
      audio.load();
    }

    audio.play().catch(console.error);
    updateState((prev) => ({
      ...prev,
      isPlaying: true,
      currentTrack: track,
    }));
    startProgressLoop();
  }, [startProgressLoop, updateState]);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    stopProgressLoop();
    updateState((prev) => ({
      ...prev,
      isPlaying: false,
    }));
  }, [stopProgressLoop, updateState]);

  // Use ref to avoid stale closure — toggle doesn't depend on state
  const toggle = useCallback(() => {
    if (stateRef.current.isPlaying) {
      pause();
    } else if (stateRef.current.currentTrack) {
      play(stateRef.current.currentTrack);
    }
  }, [play, pause]);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = time;
    updateState((prev) => ({
      ...prev,
      progress: time,
    }));
  }, [updateState]);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    updateState((prev) => ({
      isPlaying: false,
      currentTrack: null,
      progress: 0,
      duration: 0,
      volume: prev.volume,
    }));
  }, [updateState]);

  const setVolume = useCallback((volume: number) => {
    const clamped = Math.max(0, Math.min(1, volume));
    const audio = audioRef.current;
    if (audio) audio.volume = clamped;
    updateState((prev) => ({ ...prev, volume: clamped }));
  }, [updateState]);

  const value = useMemo<AudioPlayerContextValue>(
    () => ({
      ...state,
      play,
      pause,
      toggle,
      seek,
      stop,
      setVolume,
    }),
    [state, play, pause, toggle, seek, stop, setVolume]
  );

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
    </AudioPlayerContext.Provider>
  );
}
