import { Link, NavLink } from "react-router-dom";
import { Disc3, Compass } from "lucide-react";
import { UserMenu, SearchBar } from "@/components";

export default function AppNavbar() {
  return (
    <nav className="fixed top-[var(--demo-offset,0px)] left-0 right-0 z-50 bg-bg-base/80 backdrop-blur-md border-b border-border-subtle">
      <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center gap-4">
        <div className="flex items-center gap-6 flex-shrink-0">
          <Link
            to="/"
            className="flex items-center gap-2 text-text-primary font-semibold text-xl hover:opacity-80 transition-default"
          >
            <Disc3 className="w-7 h-7 text-primary-500" />
            <span className="hidden sm:inline">SoundScout</span>
          </Link>

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary-500/15 text-primary-400 border border-primary-500/30"
                  : "text-text-secondary hover:text-text-primary border border-transparent hover:bg-bg-elevated/50"
              }`
            }
          >
            <Compass className="w-4 h-4" />
            Explore
          </NavLink>
        </div>

        <div className="hidden md:flex flex-1 justify-center">
          <div className="w-full max-w-md">
            <SearchBar />
          </div>
        </div>

        <div className="ml-auto flex-shrink-0">
          <UserMenu />
        </div>
      </div>
    </nav>
  );
}
