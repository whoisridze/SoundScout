import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Search, Loader2, Music2 } from "lucide-react";
import { useSearch } from "@/hooks";

const DEBOUNCE_MS = 300;

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useSearch(debouncedQuery);

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  // Click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Escape
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const handleResultClick = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setDebouncedQuery("");
  }, []);

  const showDropdown = isOpen && debouncedQuery.length >= 2;
  const hasResults = data && (data.users.length > 0 || data.artists.length > 0);

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-disabled" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search users or artists..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          className="w-full pl-10 pr-10 py-2 bg-bg-surface border border-border-subtle rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 transition-default"
        />
        {isLoading && debouncedQuery.length >= 2 && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted animate-spin" />
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full mt-2 w-full bg-bg-surface border border-border-subtle rounded-xl shadow-2xl overflow-hidden z-50 max-h-[400px] overflow-y-auto">
          {isLoading && !data ? (
            <div className="px-4 py-6 text-center text-sm text-text-muted">
              Searching...
            </div>
          ) : !hasResults ? (
            <div className="px-4 py-6 text-center text-sm text-text-muted">
              No results for &ldquo;{debouncedQuery}&rdquo;
            </div>
          ) : (
            <>
              {/* Users */}
              {data!.users.length > 0 && (
                <div>
                  <div className="px-3 py-2 border-b border-border-subtle">
                    <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">
                      Users
                    </span>
                  </div>
                  {data!.users.map((user) => (
                    <Link
                      key={user.id}
                      to={`/user/${user.username}`}
                      onClick={handleResultClick}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-bg-hover transition-default"
                    >
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.username}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary-600/20 flex items-center justify-center text-primary-400 font-medium text-sm flex-shrink-0">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-sm font-medium text-text-primary truncate">
                        {user.username}
                      </span>
                    </Link>
                  ))}
                </div>
              )}

              {/* Artists */}
              {data!.artists.length > 0 && (
                <div>
                  <div className="px-3 py-2 border-b border-border-subtle">
                    <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">
                      Artists
                    </span>
                  </div>
                  {data!.artists.map((artist) => (
                    <Link
                      key={artist.id}
                      to={`/artist/${artist.id}`}
                      onClick={handleResultClick}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-bg-hover transition-default"
                    >
                      {artist.image ? (
                        <img
                          src={artist.image}
                          alt={artist.name}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-accent-600/20 flex items-center justify-center text-accent-400 flex-shrink-0">
                          <Music2 className="w-4 h-4" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {artist.name}
                        </p>
                        <p className="text-xs text-text-muted">
                          {artist.genres[0] || "Artist"}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
