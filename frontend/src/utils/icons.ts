import {
  Github,
  ExternalLink,
  Mail,
  Layers,
  Search,
  Users,
  Info,
  Heart,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Footer and Contact social link icons
export const SOCIAL_ICON_MAP: Record<string, LucideIcon> = {
  github: Github,
  linktree: ExternalLink,
  email: Mail,
  GitHub: Github,
  Linktree: ExternalLink,
};

// How It Works step icons
export const STEP_ICON_MAP: Record<string, LucideIcon> = {
  layers: Layers,
  search: Search,
  users: Users,
  info: Info,
  heart: Heart,
};

// Flow diagram icons (ordered)
export const FLOW_ICONS: LucideIcon[] = [Layers, Search, Users, Info, Heart];
