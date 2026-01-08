import type { Step, FlowItem, StepColor } from "@/types";

export const STEPS: Step[] = [
  {
    number: "01",
    title: "Pick a genre",
    description:
      "Start with one of 15 main genres. Whether you're into Rock, Electronic, Jazz, or Hip-Hop — we've got you covered.",
    icon: "layers",
    color: "primary",
    visual: {
      type: "genres",
      items: ["Rock", "Electronic", "Jazz", "Hip-Hop", "Classical"],
    },
  },
  {
    number: "02",
    title: "Dive into subgenres",
    description:
      "Each main genre branches into dozens of subgenres. Find your exact sound — from Shoegaze to Drum and Bass to Bebop.",
    icon: "search",
    color: "accent",
    visual: {
      type: "subgenres",
      parent: "Rock",
      items: ["Alternative Rock", "Indie Rock", "Classic Rock", "Hard Rock", "Pop Punk"],
    },
  },
  {
    number: "03",
    title: "Discover artists",
    description:
      "Browse artists that define each subgenre. Click on any artist to explore their full profile.",
    icon: "users",
    color: "success",
    visual: {
      type: "artists",
      items: [
        { name: "Radiohead", followers: "12.5M" },
        { name: "Arcade Fire", followers: "3.2M" },
        { name: "The National", followers: "2.1M" },
      ],
    },
  },
  {
    number: "04",
    title: "Explore artist details",
    description:
      "See artist info, top tracks, and discover similar artists. It's the perfect rabbit hole for music discovery.",
    icon: "info",
    color: "info",
    visual: {
      type: "artistCard",
      name: "Radiohead",
      followers: "12.5M",
      genres: ["Alternative Rock", "Art Rock"],
      tracks: ["Creep", "Karma Police", "No Surprises"],
    },
  },
  {
    number: "05",
    title: "Listen & save",
    description:
      "Preview 30-second clips of any track. Found something you love? Save it to your favorites for quick access later.",
    icon: "heart",
    color: "error",
    visual: {
      type: "player",
      track: "Everything In Its Right Place",
      artist: "Radiohead",
    },
  },
];

export const FLOW_ITEMS: FlowItem[] = [
  { label: "Genre", sub: "15 categories" },
  { label: "Subgenre", sub: "100+ styles" },
  { label: "Artists", sub: "Millions" },
  { label: "Artist Card", sub: "Full details" },
  { label: "Favorites", sub: "Unlimited" },
];

export const COLOR_MAP: Record<StepColor, { bg: string; text: string; border: string }> = {
  primary: {
    bg: "bg-primary-500/10",
    text: "text-primary-400",
    border: "border-primary-500/30",
  },
  accent: {
    bg: "bg-accent-500/10",
    text: "text-accent-400",
    border: "border-accent-500/30",
  },
  success: {
    bg: "bg-success-500/10",
    text: "text-success-400",
    border: "border-success-500/30",
  },
  info: {
    bg: "bg-info-500/10",
    text: "text-info-400",
    border: "border-info-500/30",
  },
  error: {
    bg: "bg-error-500/10",
    text: "text-error-400",
    border: "border-error-500/30",
  },
};

export const FLOW_NODE_STYLES = [
  {
    gradient: "from-primary-500 to-primary-600",
    glow: "shadow-[0_0_20px_rgba(132,94,247,0.4)]",
  },
  {
    gradient: "from-accent-500 to-accent-600",
    glow: "shadow-[0_0_20px_rgba(240,101,149,0.4)]",
  },
  {
    gradient: "from-success-500 to-success-600",
    glow: "shadow-[0_0_20px_rgba(81,207,102,0.4)]",
  },
  {
    gradient: "from-info-500 to-info-600",
    glow: "shadow-[0_0_20px_rgba(77,171,247,0.4)]",
  },
  {
    gradient: "from-error-500 to-error-600",
    glow: "shadow-[0_0_20px_rgba(255,107,107,0.4)]",
  },
];
