import { useState } from "react";
import { Info, X } from "lucide-react";

export default function DemoBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-9 bg-amber-500/90 backdrop-blur-sm text-sm text-amber-950">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-3 px-4">
        <div className="flex items-center gap-2">
          <Info size={16} className="shrink-0" />
          <span>
            <strong>Demo mode</strong> — Running with sample data.{" "}
            <span className="hidden sm:inline">
              Spotify's API policy changes (March 2026) require a paid
              subscription for continued access.
            </span>
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 rounded p-0.5 hover:bg-amber-600/30"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
