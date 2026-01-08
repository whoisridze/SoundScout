import {
  ChevronRight,
  Heart,
  Layers,
  Music,
  Play,
  User,
  Users,
} from "lucide-react";
import { COLOR_MAP } from "@/constants/how-it-works";
import type { Step } from "@/types";

interface StepVisualProps {
  step: Step;
}

export default function StepVisual({ step }: StepVisualProps) {
  const colors = COLOR_MAP[step.color];
  const visual = step.visual;

  if (visual.type === "genres") {
    return (
      <div className="flex flex-wrap gap-2 justify-center">
        {visual.items.map((genre, i) => (
          <span
            key={genre}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all cursor-default
              ${
                i === 0
                  ? `${colors.bg} ${colors.text} border ${colors.border}`
                  : "bg-bg-surface text-text-muted border border-border-subtle"
              }`}
          >
            {genre}
          </span>
        ))}
      </div>
    );
  }

  if (visual.type === "subgenres") {
    return (
      <div className="space-y-2">
        {/* Parent genre */}
        <div className={`flex items-center gap-3 p-3 rounded-lg ${colors.bg} border ${colors.border}`}>
          <Layers className={`w-5 h-5 ${colors.text}`} />
          <span className={`font-medium ${colors.text}`}>{visual.parent}</span>
        </div>

        {/* Subgenres list */}
        <div className="pl-4 border-l-2 border-border-subtle ml-4 space-y-1.5">
          {visual.items.map((sub, i) => (
            <div
              key={sub}
              className={`flex items-center gap-2 p-2 rounded-md text-sm transition-all cursor-default ${
                i === 0
                  ? "bg-bg-hover text-text-primary"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              <ChevronRight className={`w-3.5 h-3.5 ${i === 0 ? colors.text : "text-text-muted"}`} />
              <span>{sub}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (visual.type === "artists") {
    return (
      <div className="space-y-2">
        {visual.items.map((artist, i) => (
          <div
            key={artist.name}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all cursor-default
              ${
                i === 0
                  ? `${colors.bg} border ${colors.border}`
                  : "bg-bg-surface border border-border-subtle"
              }`}
          >
            <div className="w-10 h-10 rounded-full bg-bg-hover flex items-center justify-center">
              <Users
                className={`w-5 h-5 ${
                  i === 0 ? colors.text : "text-text-muted"
                }`}
              />
            </div>
            <div className="flex-1 text-left">
              <p
                className={`font-medium text-sm ${
                  i === 0 ? "text-text-primary" : "text-text-secondary"
                }`}
              >
                {artist.name}
              </p>
              <p className="text-xs text-text-muted">
                {artist.followers} followers
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (visual.type === "artistCard") {
    return (
      <div className="space-y-4">
        {/* Artist Header */}
        <div className="flex items-center gap-3">
          <div
            className={`w-14 h-14 rounded-full ${colors.bg} flex items-center justify-center`}
          >
            <User className={`w-7 h-7 ${colors.text}`} />
          </div>
          <div className="text-left">
            <p className="font-semibold text-text-primary">{visual.name}</p>
            <p className="text-xs text-text-muted">
              {visual.followers} followers
            </p>
          </div>
        </div>

        {/* Genres */}
        <div className="flex flex-wrap gap-1.5">
          {visual.genres.map((genre) => (
            <span
              key={genre}
              className={`px-2 py-1 rounded-md text-xs ${colors.bg} ${colors.text}`}
            >
              {genre}
            </span>
          ))}
        </div>

        {/* Top Tracks */}
        <div className="space-y-1.5">
          <p className="text-xs text-text-muted uppercase tracking-wider">
            Top Tracks
          </p>
          {visual.tracks.map((track) => (
            <div
              key={track}
              className="flex items-center gap-2 p-2 rounded-md bg-bg-hover text-left"
            >
              <Music className="w-3.5 h-3.5 text-text-muted" />
              <span className="text-sm text-text-secondary">{track}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (visual.type === "player") {
    return (
      <div
        className={`p-4 rounded-xl ${colors.bg} border ${colors.border}`}
      >
        <div className="flex items-center gap-4">
          <button
            className={`w-12 h-12 rounded-full ${colors.bg} ${colors.text} flex items-center justify-center`}
          >
            <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
          </button>
          <div className="flex-1 text-left">
            <p className="font-medium text-text-primary text-sm">
              {visual.track}
            </p>
            <p className="text-xs text-text-muted">{visual.artist}</p>
          </div>
          <Heart className={`w-5 h-5 ${colors.text}`} fill="currentColor" />
        </div>
        <div className="mt-4 h-1 bg-bg-hover rounded-full overflow-hidden">
          <div
            className="h-full w-1/3 rounded-full"
            style={{ background: `var(--color-${step.color}-500)` }}
          />
        </div>
      </div>
    );
  }

  return null;
}
