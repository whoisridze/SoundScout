import { ArrowRight, Music, Radio, Sparkles, Heart, Users, Quote } from "lucide-react";
import { Link } from "react-router-dom";
import { useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { fadeInUp, defaultTransition, defaultViewport } from "@/utils/animations";
import { PageLayout } from "@/layouts";
import { GradientBackground, GrainOverlay } from "@/components";
import { useAuth } from "@/contexts";
import { MARQUEE_GENRES, GENRE_CARDS, TESTIMONIALS, SPOTIFY_STATS } from "@/constants/landing";

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const ctaTo = isAuthenticated ? "/dashboard" : "/register";
  useEffect(() => { document.title = "SoundScout — Discover Music"; return () => { document.title = "SoundScout"; }; }, []);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // Fade out marquee as user scrolls (starts at 1, reaches 0 when 80% scrolled)
  const marqueeOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <PageLayout>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 pb-32"
      >
        <GradientBackground />
        <GrainOverlay />

        <motion.div
          className="relative z-10 max-w-[1400px] mx-auto px-6 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bg-surface border border-border-subtle text-text-secondary text-sm mb-8">
            <Sparkles className="w-4 h-4 text-primary-400" />
            Genre-driven artist finder
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tighter mb-6 text-balance">
            Your next favorite
            <span className="block bg-gradient-to-r from-primary-400 via-accent-400 to-primary-400 bg-clip-text text-transparent">
              artist awaits
            </span>
          </h1>

          <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop scrolling through endless playlists. Explore music the way it's meant to be
            — by genre, style, and sound.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={ctaTo}
              className="group flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-md font-semibold text-lg transition-default shadow-lg hover:shadow-glow-primary"
            >
              Start exploring
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/how-it-works"
              className="flex items-center gap-2 text-text-secondary hover:text-text-primary px-8 py-4 rounded-md font-medium transition-default"
            >
              See how it works
            </Link>
          </div>
        </motion.div>

        {/* Genre Marquee */}
        <motion.div
          className="absolute bottom-8 left-0 right-0 overflow-hidden"
          style={{ opacity: marqueeOpacity }}
        >
          <div className="marquee-container space-y-2">
            <div className="flex animate-marquee">
              {[...MARQUEE_GENRES, ...MARQUEE_GENRES, ...MARQUEE_GENRES, ...MARQUEE_GENRES].map((genre, i) => (
                <span
                  key={`row1-${i}`}
                  className="marquee-item flex-shrink-0 mx-3 text-sm font-medium whitespace-nowrap cursor-default text-text-muted opacity-40"
                >
                  {genre}
                </span>
              ))}
            </div>
            <div className="flex animate-marquee-reverse">
              {[...MARQUEE_GENRES.slice().reverse(), ...MARQUEE_GENRES.slice().reverse(), ...MARQUEE_GENRES.slice().reverse(), ...MARQUEE_GENRES.slice().reverse()].map((genre, i) => (
                <span
                  key={`row2-${i}`}
                  className="marquee-item flex-shrink-0 mx-3 text-sm font-medium whitespace-nowrap cursor-default text-text-muted opacity-40"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Genre Showcase Section */}
      <motion.section
        className="py-32 relative"
        initial="initial"
        whileInView="animate"
        viewport={defaultViewport}
        variants={fadeInUp}
        transition={defaultTransition}
      >
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">
              Pick your sound
            </h2>
            <p className="text-text-secondary text-lg max-w-xl mx-auto">
              From broad categories to niche subgenres — find exactly what you're looking for.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {GENRE_CARDS.map((genre) => (
              <div
                key={genre.name}
                className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer"
              >
                <img
                  src={genre.image}
                  alt={genre.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-slow group-hover:scale-110"
                  loading="lazy"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${genre.color} to-bg-base/90 group-hover:to-bg-base/70 transition-default`} />
                <div className="absolute inset-0 flex items-end p-4">
                  <span className="font-semibold text-lg">{genre.name}</span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-text-muted mt-8">
            ...and 10 more main genres with 100+ subgenres to explore
          </p>
        </div>
      </motion.section>

      {/* Bento Grid Features */}
      <motion.section
        className="py-32 bg-bg-elevated"
        initial="initial"
        whileInView="animate"
        viewport={defaultViewport}
        variants={fadeInUp}
        transition={defaultTransition}
      >
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">
              Built for music lovers
            </h2>
            <p className="text-text-secondary text-lg max-w-xl mx-auto">
              Simple tools that make finding new music actually enjoyable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-bg-surface rounded-xl p-8 border border-border-subtle hover:border-border-default transition-default">
              <div className="p-3 rounded-lg bg-primary-500/10 text-primary-400 w-fit mb-6">
                <Music className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Genre-based discovery</h3>
              <p className="text-text-secondary leading-relaxed">
                Navigate through a curated hierarchy of genres and subgenres. Start broad with Rock,
                narrow down to Alternative Rock, and discover artists that define the sound.
              </p>
              <div className="mt-6 flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-bg-hover text-text-muted text-sm">Rock</span>
                <span className="text-text-muted">→</span>
                <span className="px-3 py-1 rounded-full bg-bg-hover text-text-muted text-sm">Alternative</span>
                <span className="text-text-muted">→</span>
                <span className="px-3 py-1 rounded-full bg-primary-500/20 text-primary-300 text-sm">Radiohead</span>
              </div>
            </div>

            <div className="bg-bg-surface rounded-xl p-8 border border-border-subtle hover:border-border-default transition-default">
              <div className="p-3 rounded-lg bg-accent-500/10 text-accent-400 w-fit mb-6">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Save favorites</h3>
              <p className="text-text-secondary leading-relaxed">
                Build your personal collection of tracks. Quick access to everything you love.
              </p>
            </div>

            <div className="bg-bg-surface rounded-xl p-8 border border-border-subtle hover:border-border-default transition-default">
              <div className="p-3 rounded-lg bg-success-500/10 text-success-400 w-fit mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Similar artists</h3>
              <p className="text-text-secondary leading-relaxed">
                Found someone you like? Find similar artists and expand your taste.
              </p>
            </div>

            <div className="lg:col-span-2 bg-bg-surface rounded-xl p-8 border border-border-subtle hover:border-border-default transition-default">
              <div className="p-3 rounded-lg bg-info-500/10 text-info-400 w-fit mb-6">
                <Radio className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Track previews</h3>
              <p className="text-text-secondary leading-relaxed">
                Listen to 30-second previews directly in the app. No need to switch between platforms
                — hear the music before you commit.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Powered by Spotify */}
      <motion.section
        className="py-24 relative overflow-hidden"
        initial="initial"
        whileInView="animate"
        viewport={defaultViewport}
        variants={fadeInUp}
        transition={defaultTransition}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#1DB954]/10 rounded-full blur-[120px]" />

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-3 mb-8">
            <span className="text-text-muted text-sm uppercase tracking-wider">Powered by</span>
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#1DB954">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
          </div>

          <h2 className="text-2xl md:text-3xl font-semibold text-text-primary mb-4">
            Real data. Real artists. Real tracks.
          </h2>
          <p className="text-text-secondary max-w-lg mx-auto mb-16">
            SoundScout connects directly to Spotify's catalog — millions of tracks,
            accurate artist info, and 30-second previews for every song.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
            {SPOTIFY_STATS.map((stat, i) => (
              <div key={stat.label} className="flex items-center gap-8 sm:gap-16">
                <div>
                  <p className="text-2xl md:text-3xl font-bold text-text-primary">{stat.value}</p>
                  <p className="text-text-muted text-sm mt-1">{stat.label}</p>
                </div>
                {i < SPOTIFY_STATS.length - 1 && (
                  <div className="hidden sm:block w-px h-10 bg-border-subtle" />
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Testimonials */}
      <motion.section
        className="py-24 bg-bg-elevated"
        initial="initial"
        whileInView="animate"
        viewport={defaultViewport}
        variants={fadeInUp}
        transition={defaultTransition}
      >
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">
              What music lovers say
            </h2>
            <p className="text-text-secondary text-lg max-w-xl mx-auto">
              Join thousands of users who've transformed how they find new music.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial) => (
              <div
                key={testimonial.name}
                className="bg-bg-surface rounded-xl p-6 border border-border-subtle hover:border-border-default transition-default"
              >
                <Quote className="w-8 h-8 text-primary-500/30 mb-4" />
                <p className="text-text-secondary leading-relaxed mb-6">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full object-cover"
                    loading="lazy"
                  />
                  <div>
                    <p className="font-medium text-text-primary text-sm">{testimonial.name}</p>
                    <p className="text-text-muted text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Final CTA */}
      <motion.section
        className="py-32 bg-bg-base"
        initial="initial"
        whileInView="animate"
        viewport={defaultViewport}
        variants={fadeInUp}
        transition={defaultTransition}
      >
        <div className="max-w-[1400px] mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">
            Ready to dive in?
          </h2>
          <p className="text-text-secondary text-lg max-w-xl mx-auto mb-10">
            Create a free account and start building your personal music collection today.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-md font-semibold text-lg transition-default shadow-lg hover:shadow-glow-primary"
          >
            Get started
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </motion.section>
    </PageLayout>
  );
}
