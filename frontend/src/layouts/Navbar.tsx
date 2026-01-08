import { Link } from "react-router-dom";
import { Disc3 } from "lucide-react";
import { NAV_LINKS } from "@/constants";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-bg-base/80 backdrop-blur-md border-b border-border-subtle">
      <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-text-primary font-semibold text-xl">
          <Disc3 className="w-7 h-7 text-primary-500" />
          SoundScout
        </Link>
        <div className="flex items-center gap-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={
                link.variant === "primary"
                  ? "bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-md font-medium transition-default"
                  : "text-text-secondary hover:text-text-primary transition-default px-4 py-2"
              }
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
