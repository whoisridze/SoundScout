import type { Testimonial, GenreCard, SpotifyStat } from "@/types";

// Genre images
import rockImg from "@/assets/images/genres/rock.webp";
import electronicImg from "@/assets/images/genres/electronic.webp";
import hiphopImg from "@/assets/images/genres/hiphop.webp";
import jazzImg from "@/assets/images/genres/jazz.webp";
import classicalImg from "@/assets/images/genres/classical.webp";

// Avatar images
import avatar1 from "@/assets/images/avatars/avatar-1.jpg";
import avatar2 from "@/assets/images/avatars/avatar-2.jpg";
import avatar3 from "@/assets/images/avatars/avatar-3.jpg";

export const MARQUEE_GENRES: string[] = [
  "Pop", "Electronic", "Hip Hop", "R&B", "Latin",
  "Rock", "Metal", "Country", "Folk", "Classical",
  "Jazz", "Blues", "Easy Listening", "New Age", "World"
];

export const GENRE_CARDS: GenreCard[] = [
  {
    name: "Rock",
    image: rockImg,
    color: "from-red-500/20"
  },
  {
    name: "Electronic",
    image: electronicImg,
    color: "from-cyan-500/20"
  },
  {
    name: "Hip-Hop",
    image: hiphopImg,
    color: "from-yellow-500/20"
  },
  {
    name: "Jazz",
    image: jazzImg,
    color: "from-amber-500/20"
  },
  {
    name: "Classical",
    image: classicalImg,
    color: "from-purple-500/20"
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Sarah Chen",
    role: "Music enthusiast",
    avatar: avatar1,
    quote: "Finally a way to explore music that actually makes sense. I've found so many new artists through the genre system."
  },
  {
    name: "Marcus Johnson",
    role: "DJ & Producer",
    avatar: avatar2,
    quote: "The subgenre breakdown is incredibly detailed. Perfect for digging into specific sounds I'm looking for."
  },
  {
    name: "Emma Rodriguez",
    role: "Playlist curator",
    avatar: avatar3,
    quote: "I use SoundScout daily to find tracks for my playlists. The similar artists feature is a game changer."
  }
];

export const SPOTIFY_STATS: SpotifyStat[] = [
  { value: "100M+", label: "tracks available" },
  { value: "Real-time", label: "artist data" },
  { value: "30s", label: "track previews" },
];
