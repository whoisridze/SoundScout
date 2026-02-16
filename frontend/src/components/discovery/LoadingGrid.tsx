import { memo } from "react";

interface LoadingGridProps {
  count?: number;
  variant?: "genre" | "artist" | "track" | "chip";
}

function LoadingGrid({ count = 15, variant = "genre" }: LoadingGridProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  if (variant === "chip") {
    return (
      <div className="flex flex-wrap gap-3">
        {items.map((i) => (
          <div
            key={i}
            className="h-10 rounded-full bg-bg-surface animate-pulse"
            style={{ width: `${80 + ((i * 37) % 60)}px` }}
          />
        ))}
      </div>
    );
  }

  if (variant === "track") {
    return (
      <div className="space-y-2">
        {items.map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-3 rounded-lg bg-bg-surface animate-pulse"
          >
            <div className="w-10 h-10 rounded bg-bg-hover" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 rounded bg-bg-hover" />
              <div className="h-3 w-24 rounded bg-bg-hover" />
            </div>
            <div className="h-4 w-12 rounded bg-bg-hover" />
          </div>
        ))}
      </div>
    );
  }

  const gridCols =
    variant === "artist"
      ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
      : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5";

  if (variant === "genre") {
    return (
      <div className={`grid ${gridCols} gap-4`}>
        {items.map((i) => (
          <div
            key={i}
            className="animate-pulse bg-bg-surface rounded-xl border border-border-subtle p-5"
          >
            {/* Icon placeholder */}
            <div className="w-11 h-11 rounded-xl bg-bg-hover mb-4" />
            {/* Title */}
            <div className="h-5 rounded bg-bg-hover w-3/4 mb-2" />
            {/* Subtitle */}
            <div className="h-4 rounded bg-bg-hover w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  // Artist variant
  return (
    <div className={`grid ${gridCols} gap-5`}>
      {items.map((i) => (
        <div key={i} className="animate-pulse p-2.5">
          <div className="aspect-square rounded-2xl bg-bg-surface mb-3" />
          <div className="space-y-2 px-1">
            <div className="h-4 rounded bg-bg-surface w-3/4" />
            <div className="h-3 rounded bg-bg-surface w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default memo(LoadingGrid);
