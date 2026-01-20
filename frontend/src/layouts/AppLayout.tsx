import { Outlet } from "react-router-dom";
import AppNavbar from "./AppNavbar";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-bg-base">
      <AppNavbar />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}
