import { Link, NavLink } from "react-router-dom";
import { Disc3, Compass } from "lucide-react";
import { UserMenu } from "@/components";

export default function AppNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-bg-base/80 backdrop-blur-md border-b border-border-subtle">
      <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-text-primary font-semibold text-xl"
          >
            <Disc3 className="w-7 h-7 text-primary-500" />
            SoundScout
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

        <UserMenu />
      </div>
    </nav>
  );
}
