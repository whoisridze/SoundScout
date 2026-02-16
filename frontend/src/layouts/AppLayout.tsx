import { Outlet } from "react-router-dom";
import { useAudioPlayerContext } from "@/contexts";
import AppNavbar from "./AppNavbar";

export default function AppLayout() {
  const { currentTrack } = useAudioPlayerContext();

  return (
    <div className="min-h-screen bg-bg-base">
      <AppNavbar />
      <main className={`pt-16 ${currentTrack ? "pb-20" : ""}`}>
        <Outlet />
      </main>
    </div>
  );
}
