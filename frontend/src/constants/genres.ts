import type { LucideIcon } from "lucide-react";
import {
  Guitar,
  Radio,
  Mic2,
  Headphones,
  Heart,
  Piano,
  Music2,
  Music,
  Drum,
  Waves,
  TreePine,
  Globe,
  Flame,
  Sparkles,
  Coffee,
  Sun,
} from "lucide-react";

// Genre configuration with unique colors and icons
// Keys match exactly what backend returns
interface GenreConfig {
  gradient: { from: string; via?: string; to: string };
  icon: LucideIcon;
}

export const GENRE_CONFIG: Record<string, GenreConfig> = {
  // Colors chosen for maximum distinction and visibility on dark background
  // Using design system colors where possible

  // Pinks/Reds
  Pop: {
    gradient: { from: "#f06595", to: "#f783ac" }, // Accent pink from design system
    icon: Radio,
  },
  Rock: {
    gradient: { from: "#ff6b6b", to: "#ff8787" }, // Error red from design system
    icon: Guitar,
  },
  "R&B": {
    gradient: { from: "#f472b6", to: "#f9a8d4" }, // Rose - distinct from Pop pink
    icon: Heart,
  },

  // Oranges/Yellows
  "Hip Hop": {
    gradient: { from: "#fcc419", to: "#ffd43b" }, // Warning yellow from design system
    icon: Mic2,
  },
  Latin: {
    gradient: { from: "#f97316", to: "#fb923c" }, // Warm orange
    icon: Flame,
  },
  "Folk/Acoustic": {
    gradient: { from: "#d97706", to: "#f59e0b" }, // Amber/wood tone
    icon: TreePine,
  },

  // Blues/Cyans
  Electronic: {
    gradient: { from: "#22d3ee", to: "#67e8f9" }, // Bright cyan
    icon: Headphones,
  },
  Blues: {
    gradient: { from: "#4dabf7", to: "#74c0fc" }, // Info blue from design system
    icon: Waves,
  },
  Metal: {
    gradient: { from: "#60a5fa", to: "#93c5fd" }, // Steel blue - much more visible
    icon: Drum,
  },

  // Greens/Teals
  Country: {
    gradient: { from: "#51cf66", to: "#69db7c" }, // Success green from design system
    icon: Music,
  },
  Jazz: {
    gradient: { from: "#20c997", to: "#38d9a9" }, // Teal
    icon: Music2,
  },
  "Easy listening": {
    gradient: { from: "#38d9a9", to: "#63e6be" }, // Mint - softer green
    icon: Coffee,
  },

  // Purples (only 2 now, clearly distinct)
  Classical: {
    gradient: { from: "#845ef7", to: "#9775fa" }, // Primary purple from design system
    icon: Piano,
  },
  "New age": {
    gradient: { from: "#da77f2", to: "#e599f7" }, // Orchid/magenta - distinct from purple
    icon: Sun,
  },

  // Unique
  "World/Traditional": {
    gradient: { from: "#ff922b", to: "#ffa94d" }, // Tangerine - warm and inviting
    icon: Globe,
  },
};

// Fallback config
const DEFAULT_CONFIG: GenreConfig = {
  gradient: { from: "#7950f2", to: "#7048e8" },
  icon: Sparkles,
};

// Get icon component for a genre
export function getGenreIcon(genre: string): LucideIcon {
  const config = GENRE_CONFIG[genre];
  return config?.icon || DEFAULT_CONFIG.icon;
}

// Get colors for decorative elements
export function getGenreColors(genre: string): { from: string; to: string } {
  const config = GENRE_CONFIG[genre] || DEFAULT_CONFIG;
  return { from: config.gradient.from, to: config.gradient.to };
}

// Popular subgenres for each main genre (curated for quick access)
export const POPULAR_SUBGENRES: Record<string, string[]> = {
  Pop: [
    "dance pop",
    "pop rock",
    "synth-pop",
    "electropop",
    "indie pop",
    "k-pop",
    "art pop",
    "bedroom pop",
  ],
  Rock: [
    "alternative rock",
    "indie rock",
    "classic rock",
    "hard rock",
    "punk rock",
    "progressive rock",
    "grunge",
    "post-rock",
  ],
  Metal: [
    "nu metal",
    "thrash metal",
    "death metal",
    "black metal",
    "heavy metal",
    "metalcore",
    "power metal",
    "progressive metal",
  ],
  "Hip Hop": [
    "trap",
    "conscious hip hop",
    "gangster rap",
    "boom bap",
    "southern hip hop",
    "alternative hip hop",
    "drill",
    "lo-fi hip hop",
  ],
  Electronic: [
    "house",
    "techno",
    "drum and bass",
    "dubstep",
    "trance",
    "ambient",
    "edm",
    "synthwave",
  ],
  "R&B": [
    "contemporary r&b",
    "neo soul",
    "alternative r&b",
    "soul",
    "funk",
    "new jack swing",
    "quiet storm",
    "urban contemporary",
  ],
  Jazz: [
    "smooth jazz",
    "bebop",
    "jazz fusion",
    "acid jazz",
    "vocal jazz",
    "contemporary jazz",
    "cool jazz",
    "swing",
  ],
  Classical: [
    "baroque",
    "romantic",
    "contemporary classical",
    "orchestral",
    "chamber music",
    "opera",
    "minimalism",
    "neo-classical",
  ],
  Country: [
    "country pop",
    "country rock",
    "outlaw country",
    "americana",
    "bluegrass",
    "country blues",
    "honky tonk",
    "nashville sound",
  ],
  Latin: [
    "reggaeton",
    "latin pop",
    "salsa",
    "bachata",
    "cumbia",
    "latin rock",
    "bossa nova",
    "merengue",
  ],
  Blues: [
    "electric blues",
    "chicago blues",
    "delta blues",
    "blues rock",
    "soul blues",
    "texas blues",
    "acoustic blues",
    "modern blues",
  ],
  "Folk/Acoustic": [
    "indie folk",
    "folk rock",
    "contemporary folk",
    "singer-songwriter",
    "americana",
    "traditional folk",
    "folk pop",
    "acoustic",
  ],
  "World/Traditional": [
    "afrobeat",
    "reggae",
    "world fusion",
    "celtic",
    "flamenco",
    "indian classical",
    "middle eastern",
    "african",
  ],
  "New age": [
    "meditation",
    "healing",
    "nature sounds",
    "space music",
    "ambient new age",
    "celtic new age",
    "spiritual",
    "relaxation",
  ],
  "Easy listening": [
    "lounge",
    "soft rock",
    "adult contemporary",
    "instrumental pop",
    "mood music",
    "beautiful music",
    "elevator music",
    "light music",
  ],
};

// Get popular subgenres for a genre (returns empty array if none defined)
export function getPopularSubgenres(genre: string): string[] {
  return POPULAR_SUBGENRES[genre] || [];
}
