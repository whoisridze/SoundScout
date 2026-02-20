import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Settings, Shield, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        closeMenu();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, closeMenu]);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    navigate("/");
  };

  if (!user) return null;

  const initial = user.username.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-bg-elevated transition-default"
      >
        <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium text-sm overflow-hidden">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.username}
              className="w-full h-full object-cover"
            />
          ) : (
            initial
          )}
        </div>
        <span className="text-text-primary font-medium hidden sm:block">
          {user.username}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-text-secondary transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div role="menu" className="absolute right-0 mt-2 w-56 bg-bg-elevated border border-border-subtle rounded-lg shadow-lg py-1 z-50">
          <div className="px-4 py-3 border-b border-border-subtle">
            <p className="text-sm font-medium text-text-primary">{user.username}</p>
            <p className="text-xs text-text-secondary truncate">{user.email}</p>
          </div>

          <div className="py-1">
            <Link
              to="/profile"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-base transition-default"
            >
              <User className="w-4 h-4" />
              Profile
            </Link>
            <Link
              to="/settings"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-base transition-default"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
            {user.role === "admin" && (
              <Link
                to="/admin"
                role="menuitem"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-base transition-default"
              >
                <Shield className="w-4 h-4" />
                Admin Panel
              </Link>
            )}
          </div>

          <div className="border-t border-border-subtle py-1">
            <button
              role="menuitem"
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-error-400 hover:bg-bg-base transition-default"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
