import type { NavLink, FooterSection } from "@/types";

export const NAV_LINKS: NavLink[] = [
  { to: "/login", label: "Log in", variant: "default" },
  { to: "/register", label: "Sign up free", variant: "primary" },
];

export interface AppNavLink {
  to: string;
  label: string;
}

export const APP_NAV_LINKS: AppNavLink[] = [
  { to: "/dashboard", label: "Explore" },
  { to: "/favorites", label: "Favorites" },
];

export const FOOTER_SECTIONS: FooterSection[] = [
  {
    title: "Pages",
    links: [
      { to: "/how-it-works", label: "How it works" },
      { to: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Connect",
    links: [
      { href: "https://github.com/whoisridze", label: "GitHub", external: true },
      { href: "https://linktr.ee/r1dze", label: "Linktree", external: true },
    ],
  },
];
