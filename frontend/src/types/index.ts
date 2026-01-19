export interface Testimonial {
  name: string;
  role: string;
  avatar: string;
  quote: string;
}

export interface GenreCard {
  name: string;
  image: string;
  color: string;
}

export interface SpotifyStat {
  value: string;
  label: string;
}

export interface FeatureCard {
  icon: "music" | "heart" | "users" | "radio";
  title: string;
  description: string;
  colSpan?: 2;
  demo?: React.ReactNode;
}

export interface NavLink {
  to: string;
  label: string;
  variant?: "default" | "primary";
}

export interface FooterLink {
  to?: string;
  href?: string;
  label: string;
  icon?: React.ReactNode;
  external?: boolean;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

// How It Works page types
export type StepColor = "primary" | "accent" | "success" | "info" | "error";

export interface StepVisualGenres {
  type: "genres";
  items: string[];
}

export interface StepVisualSubgenres {
  type: "subgenres";
  parent: string;
  items: string[];
}

export interface StepVisualArtists {
  type: "artists";
  items: { name: string; followers: string }[];
}

export interface StepVisualArtistCard {
  type: "artistCard";
  name: string;
  followers: string;
  genres: string[];
  tracks: string[];
}

export interface StepVisualPlayer {
  type: "player";
  track: string;
  artist: string;
}

export type StepVisual =
  | StepVisualGenres
  | StepVisualSubgenres
  | StepVisualArtists
  | StepVisualArtistCard
  | StepVisualPlayer;

export interface Step {
  number: string;
  title: string;
  description: string;
  icon: "layers" | "search" | "users" | "info" | "heart";
  color: StepColor;
  visual: StepVisual;
}

export interface FlowItem {
  label: string;
  sub: string;
}

// Contact page types
export interface SocialLink {
  name: string;
  href: string;
  icon: "github" | "linktree" | "email";
  description: string;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  role: "user" | "admin";
  is_active: boolean;
  created_at: string;
}

export interface AuthError {
  detail: string;
}
