import { Outlet } from "react-router-dom";
import { useAudioPlayerContext } from "@/contexts";
import AppNavbar from "./AppNavbar";
import DemoBanner from "@/components/DemoBanner";

const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

export default function AppLayout() {
  const { currentTrack } = useAudioPlayerContext();

  return (
    <div
      className="min-h-screen bg-bg-base"
      style={
        isDemoMode
          ? ({ "--demo-offset": "36px" } as React.CSSProperties)
          : undefined
      }
    >
      {isDemoMode && <DemoBanner />}
      <AppNavbar />
      <main
        className={currentTrack ? "pb-20" : ""}
        style={{ paddingTop: isDemoMode ? "calc(64px + 36px)" : "64px" }}
      >
        <Outlet />
      </main>
    </div>
  );
}
