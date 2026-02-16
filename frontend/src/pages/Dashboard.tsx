import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Shuffle, Layers, Loader2, ArrowLeft } from "lucide-react";
import { useGenres } from "@/hooks";
import { genreService } from "@/services/genres";
import { StepIndicator } from "@/components";
import { EmptyState, ErrorState } from "@/components/discovery";
import { getGenreIcon, getGenreColors } from "@/constants";

export default function Dashboard() {
  const { data, isLoading, isError, error, refetch } = useGenres();
  const navigate = useNavigate();

  const [mode, setMode] = useState<"choice" | "manual">("choice");
  const [isRandomizing, setIsRandomizing] = useState(false);

  const genres = data?.genres || [];

  const handleFeelingLucky = useCallback(async () => {
    setIsRandomizing(true);
    try {
      const allGenres = await genreService.getAllGenres();
      const mainGenres = allGenres.main_genres;
      const genresMap = allGenres.genres_map;

      // Pick random genre
      const randomGenre =
        mainGenres[Math.floor(Math.random() * mainGenres.length)];
      const subgenres = genresMap[randomGenre] || [];

      if (subgenres.length === 0) return;

      // Pick random subgenre
      const randomSubgenre =
        subgenres[Math.floor(Math.random() * subgenres.length)];

      navigate(
        `/genre/${encodeURIComponent(randomGenre)}/${encodeURIComponent(randomSubgenre)}`,
      );
    } finally {
      setIsRandomizing(false);
    }
  }, [navigate]);

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary-500/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent-500/15 rounded-full blur-[120px]" />
      </div>

      {/* Main content */}
      <motion.div
        className="relative z-10 max-w-[900px] mx-auto px-6 py-16 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Step indicator - centered */}
        <div className="flex justify-center mb-12">
          <StepIndicator
            steps={[
              { label: "Genre", active: true },
              { label: "Subgenre" },
              { label: "Artist" },
            ]}
          />
        </div>

        {/* Header */}
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Start your discovery
        </h1>
        <p className="text-text-secondary text-lg mb-12 max-w-md mx-auto">
          Choose how you'd like to explore
        </p>

        <AnimatePresence mode="wait">
          {mode === "choice" ? (
            <motion.div
              key="choice"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col sm:flex-row sm:items-stretch gap-4 justify-center max-w-xl mx-auto"
            >
              {/* Feeling Lucky */}
              <button
                onClick={handleFeelingLucky}
                disabled={isRandomizing}
                className="group relative flex-1 rounded-2xl overflow-hidden"
              >
                {/* Gradient border */}
                <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex flex-col items-center gap-3 px-8 py-8 rounded-2xl bg-bg-surface hover:bg-bg-elevated transition-colors duration-200">
                  {isRandomizing ? (
                    <Loader2 className="w-7 h-7 text-primary-400 animate-spin" />
                  ) : (
                    <Shuffle className="w-7 h-7 text-primary-400 group-hover:scale-110 transition-transform duration-200" />
                  )}
                  <div>
                    <p className="text-lg font-semibold text-text-primary">
                      Feeling lucky?
                    </p>
                    <p className="text-sm text-text-muted mt-1 whitespace-nowrap">
                      Random genre & subgenre
                    </p>
                  </div>
                </div>
              </button>

              {/* Choose Manually */}
              <button
                onClick={() => setMode("manual")}
                className="group relative flex-1 rounded-2xl border border-border-subtle hover:border-border-default transition-all duration-200"
              >
                <div className="flex flex-col items-center justify-center gap-3 px-8 py-8 h-full rounded-2xl bg-bg-surface hover:bg-bg-elevated transition-colors duration-200">
                  <Layers className="w-7 h-7 text-text-secondary group-hover:text-text-primary group-hover:scale-110 transition-all duration-200" />
                  <div>
                    <p className="text-lg font-semibold text-text-primary">
                      Choose manually
                    </p>
                    <p className="text-sm text-text-muted mt-1">
                      Browse all genres
                    </p>
                  </div>
                </div>
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="manual"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Back to choice */}
              <div className="flex justify-center mb-8">
                <button
                  onClick={() => setMode("choice")}
                  className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-secondary transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              </div>

              {/* Genre pills */}
              {isLoading ? (
                <div className="flex flex-wrap justify-center gap-3">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-12 rounded-full bg-bg-surface animate-pulse"
                      style={{ width: `${80 + ((i * 37) % 60)}px` }}
                    />
                  ))}
                </div>
              ) : isError ? (
                <ErrorState
                  message={error?.message || "Failed to load genres"}
                  onRetry={() => refetch()}
                />
              ) : !genres.length ? (
                <EmptyState variant="genres" />
              ) : (
                <div className="flex flex-wrap justify-center gap-3">
                  {genres.map((genre, index) => {
                    const Icon = getGenreIcon(genre);
                    const colors = getGenreColors(genre);

                    return (
                      <motion.div
                        key={genre}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2, delay: index * 0.02 }}
                      >
                        <Link
                          to={`/genre/${encodeURIComponent(genre)}`}
                          className="group inline-flex items-center gap-2.5 px-5 py-3 rounded-full bg-bg-surface border border-border-subtle hover:border-border-default transition-all duration-200 hover:shadow-lg"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = `${colors.from}60`;
                            e.currentTarget.style.boxShadow = `0 0 20px ${colors.from}15`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "";
                            e.currentTarget.style.boxShadow = "";
                          }}
                        >
                          <Icon
                            className="w-5 h-5 transition-transform duration-200 group-hover:scale-110"
                            style={{ color: colors.from }}
                          />
                          <span className="font-medium text-text-primary">
                            {genre}
                          </span>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
