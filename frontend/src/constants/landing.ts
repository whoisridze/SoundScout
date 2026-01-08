import type { Testimonial, GenreCard, SpotifyStat } from "@/types";

export const MARQUEE_GENRES: string[] = [
  "Pop", "Electronic", "Hip Hop", "R&B", "Latin",
  "Rock", "Metal", "Country", "Folk", "Classical",
  "Jazz", "Blues", "Easy Listening", "New Age", "World"
];

export const GENRE_CARDS: GenreCard[] = [
  {
    name: "Rock",
    image: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&h=400&fit=crop",
    color: "from-red-500/20"
  },
  {
    name: "Electronic",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop",
    color: "from-cyan-500/20"
  },
  {
    name: "Hip-Hop",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
    color: "from-yellow-500/20"
  },
  {
    name: "Jazz",
    image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400&h=400&fit=crop",
    color: "from-amber-500/20"
  },
  {
    name: "Classical",
    image: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=400&fit=crop",
    color: "from-purple-500/20"
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Sarah Chen",
    role: "Music enthusiast",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    quote: "Finally a way to explore music that actually makes sense. I've found so many new artists through the genre system."
  },
  {
    name: "Marcus Johnson",
    role: "DJ & Producer",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    quote: "The subgenre breakdown is incredibly detailed. Perfect for digging into specific sounds I'm looking for."
  },
  {
    name: "Emma Rodriguez",
    role: "Playlist curator",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    quote: "I use SoundScout daily to find tracks for my playlists. The similar artists feature is a game changer."
  }
];

export const SPOTIFY_STATS: SpotifyStat[] = [
  { value: "100M+", label: "tracks available" },
  { value: "Real-time", label: "artist data" },
  { value: "30s", label: "track previews" },
];
