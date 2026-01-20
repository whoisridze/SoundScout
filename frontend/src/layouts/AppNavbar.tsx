import { Link, NavLink } from "react-router-dom";
import { Disc3 } from "lucide-react";
import { APP_NAV_LINKS } from "@/constants/navigation";
import { UserMenu } from "@/components";

export default function AppNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-bg-base/80 backdrop-blur-md border-b border-border-subtle">
      <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-text-primary font-semibold text-xl"
          >
            <Disc3 className="w-7 h-7 text-primary-500" />
            SoundScout
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {APP_NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-md font-medium transition-default ${
                    isActive
                      ? "text-text-primary bg-bg-elevated"
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated/50"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>

        <UserMenu />
      </div>
    </nav>
  );
}
