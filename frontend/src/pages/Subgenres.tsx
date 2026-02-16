import { useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, TrendingUp } from "lucide-react";
import { useSubgenres } from "@/hooks";
import { StepIndicator } from "@/components";
import { EmptyState, ErrorState } from "@/components/discovery";
import { getGenreColors, getGenreIcon, getPopularSubgenres } from "@/constants";

export default function Subgenres() {
  const { genreId } = useParams<{ genreId: string }>();
  const genre = decodeURIComponent(genreId || "");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, isError, error, refetch } = useSubgenres(genre);

  const Icon = getGenreIcon(genre);
  const colors = getGenreColors(genre);

  // Get popular subgenres that exist in the data
  const popularSubgenres = useMemo(() => {
    if (!data?.subgenres) return [];
    const popular = getPopularSubgenres(genre);
    const dataLower = data.subgenres.map((s) => s.toLowerCase());
    return popular.filter((p) => dataLower.includes(p.toLowerCase()));
  }, [data?.subgenres, genre]);

  // Filter and sort subgenres, grouped by first letter (excluding popular ones)
  const groupedSubgenres = useMemo(() => {
    if (!data?.subgenres) return {};
    const popularSet = new Set(popularSubgenres.map((p) => p.toLowerCase()));
    const sorted = [...data.subgenres]
      .filter((s) => !popularSet.has(s.toLowerCase()))
      .sort((a, b) => a.localeCompare(b));
    const filtered = searchQuery.trim()
      ? sorted.filter((s) =>
          s.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : sorted;

    // Group by first letter
    return filtered.reduce(
      (acc, subgenre) => {
        const letter = subgenre[0].toUpperCase();
        if (!acc[letter]) acc[letter] = [];
        acc[letter].push(subgenre);
        return acc;
      },
      {} as Record<string, string[]>
    );
  }, [data?.subgenres, searchQuery, popularSubgenres]);

  // Filter popular subgenres when searching
  const filteredPopular = useMemo(() => {
    if (!searchQuery.trim()) return popularSubgenres;
    return popularSubgenres.filter((s) =>
      s.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [popularSubgenres, searchQuery]);

  const filteredCount =
    Object.values(groupedSubgenres).flat().length + filteredPopular.length;

  return (
    <div className="min-h-[calc(100vh-64px)] relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full blur-[120px]"
          style={{ background: `${colors.from}20` }}
        />
        <div
          className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] rounded-full blur-[120px]"
          style={{ background: `${colors.to}20` }}
        />
      </div>

      {/* Main content */}
      <motion.div
        className="relative z-10 max-w-[700px] mx-auto px-6 py-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Step indicator - centered */}
        <div className="flex justify-center mb-10">
          <StepIndicator
            steps={[
              { label: "Genre", to: "/dashboard", completed: true },
              { label: "Subgenre", active: true },
              { label: "Artist" },
            ]}
          />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Pick a style
          </h1>
        </div>

        {/* Search bar */}
        {!isLoading && !isError && data?.subgenres.length ? (
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-disabled" />
              <input
                type="text"
                placeholder="Search subgenres..."
                aria-label="Search subgenres"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-bg-surface border border-border-subtle focus:border-border-default focus:outline-none text-text-primary placeholder:text-text-disabled transition-colors"
                style={{
                  boxShadow: searchQuery
                    ? `0 0 0 1px ${colors.from}30`
                    : undefined,
                }}
              />
            </div>
          </div>
        ) : null}

        {/* Context bar: genre left, count right */}
        {!isLoading && !isError && data?.subgenres.length ? (
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-1.5 text-sm">
              <Icon className="w-4 h-4" style={{ color: colors.from }} />
              <span className="font-medium" style={{ color: colors.from }}>
                {genre}
              </span>
            </div>
            <span className="text-sm text-text-muted">
              {searchQuery.trim()
                ? `${filteredCount} of ${data?.total || 0} subgenres`
                : `${data?.total || 0} subgenres`}
            </span>
          </div>
        ) : null}

        {/* Subgenres list grouped by letter */}
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-12 rounded-lg bg-bg-surface animate-pulse"
              />
            ))}
          </div>
        ) : isError ? (
          <ErrorState
            message={error?.message || "Failed to load subgenres"}
            onRetry={() => refetch()}
          />
        ) : !data?.subgenres.length ? (
          <EmptyState variant="genres" message="No subgenres found" />
        ) : filteredCount === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-secondary">
              No subgenres match "{searchQuery}"
            </p>
          </div>
        ) : (
          <div className="max-h-[calc(100vh-420px)] overflow-y-auto pr-2 -mr-2 scrollbar-thin">
            <div className="space-y-6">
              {/* Popular section */}
              {filteredPopular.length > 0 && (
                <div>
                  {/* Popular header */}
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className="text-sm font-bold px-2.5 h-7 rounded-md flex items-center justify-center gap-1.5"
                      style={{
                        backgroundColor: `${colors.from}20`,
                        color: colors.from,
                      }}
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      Popular
                    </span>
                    <div
                      className="flex-1 h-px"
                      style={{ backgroundColor: `${colors.from}20` }}
                    />
                  </div>
                  {/* Popular subgenres */}
                  <div className="grid grid-cols-2 gap-2">
                    {filteredPopular.map((subgenre, index) => (
                      <motion.div
                        key={subgenre}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15, delay: index * 0.02 }}
                      >
                        <Link
                          to={`/genre/${encodeURIComponent(genre)}/${encodeURIComponent(subgenre)}`}
                          className="group block px-4 py-3 rounded-lg border transition-all duration-200"
                          style={{
                            backgroundColor: `${colors.from}08`,
                            borderColor: `${colors.from}20`,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = `${colors.from}40`;
                            e.currentTarget.style.boxShadow = `inset 3px 0 0 ${colors.from}`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = `${colors.from}20`;
                            e.currentTarget.style.boxShadow = "";
                          }}
                        >
                          <span className="text-sm font-medium text-text-primary">
                            {subgenre}
                          </span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Alphabetical groups */}
              {Object.entries(groupedSubgenres).map(([letter, subgenres]) => (
                <div key={letter}>
                  {/* Letter header */}
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className="text-sm font-bold w-7 h-7 rounded-md flex items-center justify-center"
                      style={{
                        backgroundColor: `${colors.from}15`,
                        color: colors.from,
                      }}
                    >
                      {letter}
                    </span>
                    <div
                      className="flex-1 h-px"
                      style={{ backgroundColor: `${colors.from}20` }}
                    />
                  </div>
                  {/* Subgenres in this group */}
                  <div className="grid grid-cols-2 gap-2">
                    {subgenres.map((subgenre, index) => (
                      <motion.div
                        key={subgenre}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15, delay: index * 0.02 }}
                      >
                        <Link
                          to={`/genre/${encodeURIComponent(genre)}/${encodeURIComponent(subgenre)}`}
                          className="group block px-4 py-3 rounded-lg bg-bg-surface/50 border border-transparent hover:bg-bg-surface hover:border-border-subtle transition-all duration-200"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = `${colors.from}30`;
                            e.currentTarget.style.boxShadow = `inset 3px 0 0 ${colors.from}`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "";
                            e.currentTarget.style.boxShadow = "";
                          }}
                        >
                          <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">
                            {subgenre}
                          </span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
