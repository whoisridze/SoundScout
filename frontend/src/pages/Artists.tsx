import { useState, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useArtists } from "@/hooks";
import { StepIndicator } from "@/components";
import {
  ArtistCard,
  LoadingGrid,
  EmptyState,
  ErrorState,
} from "@/components/discovery";
import { getGenreColors, getGenreIcon } from "@/constants";

const ARTISTS_PER_PAGE = 12;

export default function Artists() {
  const { genreId, subgenre } = useParams<{
    genreId: string;
    subgenre: string;
  }>();
  const [currentPage, setCurrentPage] = useState(0);

  const mainGenre = decodeURIComponent(genreId || "");
  const subgenreName = decodeURIComponent(subgenre || "");
  const colors = getGenreColors(mainGenre);
  const Icon = getGenreIcon(mainGenre);

  const { data, isLoading, isError, error, refetch } = useArtists(subgenreName);

  useEffect(() => { document.title = subgenreName ? `${subgenreName} Artists — SoundScout` : "Artists — SoundScout"; return () => { document.title = "SoundScout"; }; }, [subgenreName]);

  // Reset pagination when navigating to a different subgenre
  useEffect(() => {
    setCurrentPage(0);
  }, [subgenreName]);

  // Pagination
  const totalPages = useMemo(() => {
    if (!data?.artists) return 0;
    return Math.ceil(data.artists.length / ARTISTS_PER_PAGE);
  }, [data?.artists]);

  const paginatedArtists = useMemo(() => {
    if (!data?.artists) return [];
    const start = currentPage * ARTISTS_PER_PAGE;
    return data.artists.slice(start, start + ARTISTS_PER_PAGE);
  }, [data?.artists, currentPage]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(0, Math.min(page, totalPages - 1)));
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px]"
          style={{ background: `${colors.from}20` }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[120px]"
          style={{ background: `${colors.to}20` }}
        />
      </div>

      {/* Header section */}
      <motion.div
        className="relative z-10 w-full max-w-[1200px] mx-auto px-6 pt-6 pb-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Step indicator - centered */}
        <div className="flex justify-center mb-8">
          <StepIndicator
            steps={[
              { label: "Genre", to: "/dashboard", completed: true },
              {
                label: "Subgenre",
                to: `/genre/${encodeURIComponent(mainGenre)}`,
                completed: true,
              },
              { label: "Artist", active: true },
            ]}
          />
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Choose an artist
        </h1>
      </motion.div>

      {/* Artists grid */}
      <section className="relative z-10 w-full max-w-[1200px] mx-auto px-6 pb-6">
        {/* Context bar: breadcrumb left, count right */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-1.5 text-sm">
            <Icon className="w-4 h-4" style={{ color: colors.from }} />
            <span className="font-medium" style={{ color: colors.from }}>
              {mainGenre}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-text-disabled" />
            <span className="font-medium text-text-secondary">
              {subgenreName}
            </span>
          </div>
          <span className="text-sm text-text-muted">
            {isLoading
              ? "Loading..."
              : `${data?.total || 0} artists`}
          </span>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {isLoading ? (
            <LoadingGrid count={12} variant="artist" />
          ) : isError ? (
            <ErrorState
              message={error?.message || "Failed to load artists"}
              onRetry={() => refetch()}
            />
          ) : !data?.artists.length ? (
            <EmptyState variant="artists" />
          ) : (
            <>
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={currentPage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5"
                >
                  {paginatedArtists.map((artist) => (
                    <div key={artist.id}>
                      <ArtistCard artist={artist} />
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-bg-surface border border-border-subtle text-sm font-medium text-text-secondary hover:text-text-primary hover:border-border-default disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => goToPage(i)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                          i === currentPage
                            ? "text-text-primary"
                            : "bg-bg-surface border border-border-subtle text-text-secondary hover:text-text-primary hover:border-border-default"
                        }`}
                        style={
                          i === currentPage
                            ? {
                                backgroundColor: `${colors.from}20`,
                                color: colors.from,
                              }
                            : undefined
                        }
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages - 1}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-bg-surface border border-border-subtle text-sm font-medium text-text-secondary hover:text-text-primary hover:border-border-default disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>
      </section>
    </div>
  );
}
