import { useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  ExternalLink,
  Music2,
  ListMusic,
  ArrowLeft,
} from "lucide-react";
import { useArtistDetail } from "@/hooks";
import {
  ArtistCard,
  TrackCard,
  LoadingGrid,
  ErrorState,
} from "@/components/discovery";
import { formatFollowers } from "@/utils";

export default function ArtistDetail() {
  const { artistId } = useParams<{ artistId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    artist,
    tracks,
    similarArtists,
    isArtistLoading,
    isTracksLoading,
    isSimilarLoading,
    isArtistError,
    artistError,
    refetch,
  } = useArtistDetail(artistId || "");

  // Set document title
  useEffect(() => {
    if (artist) {
      document.title = `${artist.name} — SoundScout`;
    } else {
      document.title = "Artist — SoundScout";
    }
    return () => {
      document.title = "SoundScout";
    };
  }, [artist]);

  const handleBack = () => {
    // Safe back navigation: only go back if there's history within the app
    if (location.key !== "default") {
      navigate(-1);
    } else {
      navigate("/dashboard");
    }
  };

  if (isArtistLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] relative">
        <div className="max-w-[1200px] mx-auto px-6 py-10">
          <div className="h-10 w-24 bg-bg-surface rounded-lg animate-pulse mb-8" />
          <div className="rounded-2xl bg-bg-surface border border-border-subtle p-8 md:p-10 mb-16">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-8 md:gap-10">
              <div className="w-44 h-44 md:w-52 md:h-52 rounded-full bg-bg-hover animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-4 flex flex-col items-center md:items-start pb-1">
                <div className="h-12 w-72 bg-bg-hover rounded animate-pulse" />
                <div className="h-5 w-48 bg-bg-hover rounded animate-pulse" />
                <div className="flex gap-2">
                  <div className="h-7 w-20 bg-bg-hover rounded-full animate-pulse" />
                  <div className="h-7 w-24 bg-bg-hover rounded-full animate-pulse" />
                </div>
                <div className="h-10 w-44 bg-bg-hover rounded-full animate-pulse" />
              </div>
            </div>
          </div>
          <LoadingGrid count={10} variant="track" />
        </div>
      </div>
    );
  }

  if (isArtistError || !artist) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6">
        <ErrorState
          message={artistError?.message || "Failed to load artist"}
          onRetry={refetch}
        />
      </div>
    );
  }

  const artistImage = artist.images[0]?.url;
  const genres = artist.genres.slice(0, 5);

  return (
    <div className="min-h-[calc(100vh-64px)] relative">
      <div className="max-w-[1200px] mx-auto px-6 py-10">
        {/* Back button */}
        <motion.button
          onClick={handleBack}
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors mb-8"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </motion.button>

        {/* Hero section */}
        <motion.div
          className="relative rounded-2xl overflow-hidden mb-16 group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Animated gradient border */}
          <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-primary-600 via-accent-500 to-primary-600 opacity-50 blur-[1px] animate-border-glow" />

          <div className="relative rounded-2xl bg-bg-surface overflow-hidden">
            {/* Background: blurred artist image */}
            {artistImage && (
              <div className="absolute inset-0 pointer-events-none">
                <img
                  src={artistImage}
                  alt=""
                  aria-hidden="true"
                  className="w-full h-full object-cover blur-[50px] opacity-60 scale-150"
                />
                <div className="absolute inset-0 bg-bg-surface/30" />
                <div className="absolute inset-0 bg-gradient-to-r from-bg-surface/60 via-transparent to-bg-surface/40" />
                <div className="absolute inset-0 bg-gradient-to-t from-bg-surface/50 via-transparent to-bg-surface/30" />
              </div>
            )}

            <div className="relative flex flex-col md:flex-row items-center md:items-center gap-10 md:gap-12 p-10 md:py-14 md:px-12">
              {/* Artist image with glow ring */}
              <motion.div
                className="relative flex-shrink-0"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {/* Glow behind image */}
                <div className="absolute -inset-3 rounded-full bg-gradient-to-br from-primary-500/30 to-accent-500/30 blur-xl opacity-60" />
                <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full bg-bg-hover overflow-hidden ring-2 ring-white/10 shadow-2xl">
                  {artistImage ? (
                    <img
                      src={artistImage}
                      alt={artist.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Users className="w-20 h-20 text-text-muted" />
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Artist info */}
              <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1 min-w-0 gap-5">
                <div>
                  <motion.h1
                    className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-text-primary tracking-tight leading-none"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                  >
                    {artist.name}
                  </motion.h1>

                  {/* Followers */}
                  <motion.div
                    className="flex items-center gap-2 mt-4 justify-center md:justify-start"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    <Users className="w-4 h-4 text-primary-400" />
                    <span className="text-base text-text-secondary">
                      {formatFollowers(artist.followers)} followers
                    </span>
                  </motion.div>
                </div>

                {/* Genres */}
                {genres.length > 0 && (
                  <motion.div
                    className="flex flex-wrap gap-2.5 justify-center md:justify-start"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.25 }}
                  >
                    {genres.map((genre) => (
                      <span
                        key={genre}
                        className="px-4 py-1.5 rounded-full text-sm font-medium text-text-secondary bg-white/8 border border-white/10 hover:border-primary-500/40 hover:text-text-primary transition-colors"
                      >
                        {genre}
                      </span>
                    ))}
                  </motion.div>
                )}

                {/* Spotify link - fixed size */}
                {artist.external_urls?.spotify && (
                  <motion.a
                    href={artist.external_urls.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-48 py-3 rounded-full bg-[#1DB954] text-white text-sm font-semibold hover:bg-[#1ed760] hover:shadow-[0_0_20px_rgba(29,185,84,0.3)] transition-all duration-200"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open in Spotify
                  </motion.a>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Top Tracks */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <ListMusic className="w-5 h-5 text-primary-400" />
            <h2 className="text-xl font-bold text-text-primary">
              Top Tracks
            </h2>
          </div>
          {isTracksLoading ? (
            <LoadingGrid count={10} variant="track" />
          ) : tracks && tracks.tracks.length > 0 ? (
            <div className="bg-bg-surface rounded-2xl border border-border-subtle overflow-hidden">
              {tracks.tracks.map((track, index) => (
                <TrackCard key={track.id} track={track} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-bg-surface rounded-2xl border border-border-subtle">
              <Music2 className="w-16 h-16 text-text-muted mx-auto mb-4" />
              <p className="text-text-secondary">
                No tracks available for this artist
              </p>
            </div>
          )}
        </motion.div>

        {/* Similar Artists */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-400" />
              <h2 className="text-xl font-bold text-text-primary">
                Similar Artists
              </h2>
            </div>
            {similarArtists?.based_on_genre && (
              <span className="text-sm text-text-muted">
                Based on: {similarArtists.based_on_genre}
              </span>
            )}
          </div>
          {isSimilarLoading ? (
            <LoadingGrid count={5} variant="artist" />
          ) : similarArtists && similarArtists.similar_artists.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {similarArtists.similar_artists
                .slice(0, 10)
                .map((similar, index) => (
                  <motion.div
                    key={similar.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: 0.2 + index * 0.03,
                    }}
                  >
                    <ArtistCard artist={similar} replace />
                  </motion.div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted py-8 text-center">
              No similar artists found
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
