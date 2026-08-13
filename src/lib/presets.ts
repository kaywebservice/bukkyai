import type { DesignSystem } from "./types";

export type DesignPreset = {
  name: string;
  vibe: string;
  system: DesignSystem;
};

const baseScale = {
  fontScale: { display: 52, h1: 40, h2: 30, h3: 22, h4: 17, body: 16, small: 13 },
  spacing: { section: 96, container: 1120, stack: 16, gap: 24 },
  shadows: {
    sm: "0 1px 2px rgba(15,15,20,.06)",
    md: "0 8px 24px rgba(15,15,20,.08)",
    lg: "0 24px 64px rgba(15,15,20,.12)",
  },
  motion: { durationMs: 200 },
};

function sys(name: string, mode: "light" | "dark", colors: Record<string, string>, fonts: { heading: string; body: string }, radius: { sm: number; md: number; lg: number; pill: number }): DesignSystem {
  return {
    name,
    tokens: {
      colors: {
        background: colors.bg,
        surface: colors.surface,
        text: colors.text,
        muted: colors.muted,
        primary: colors.primary,
        primaryContrast: colors.primaryC,
        accent: colors.accent,
        accentContrast: colors.accentC,
        border: colors.border,
      },
      fonts,
      fontScale: baseScale.fontScale,
      spacing: baseScale.spacing,
      radius,
      shadows: baseScale.shadows,
      motion: baseScale.motion,
      mode,
    },
  };
}

export const DESIGN_PRESETS: DesignPreset[] = [
  {
    name: "Cream & Ink",
    vibe: "Editorial, warm",
    system: sys("Cream & Ink", "light", {
      bg: "#faf6ef", surface: "#fffdf8", text: "#1d1b16", muted: "#6b6355",
      primary: "#1d1b16", primaryC: "#faf6ef", accent: "#b3541e", accentC: "#fff7ee", border: "#e8e0d0",
    }, { heading: "Fraunces", body: "Inter" }, { sm: 8, md: 14, lg: 20, pill: 999 }),
  },
  {
    name: "Nocturne",
    vibe: "Dark, moody, premium",
    system: sys("Nocturne", "dark", {
      bg: "#0e0f13", surface: "#17181e", text: "#ececef", muted: "#9a9aa6",
      primary: "#ececef", primaryC: "#0e0f13", accent: "#c7a24a", accentC: "#14110a", border: "#26272f",
    }, { heading: "Space Grotesk", body: "Inter" }, { sm: 8, md: 14, lg: 20, pill: 999 }),
  },
  {
    name: "Alpine",
    vibe: "Minimal, technical",
    system: sys("Alpine", "light", {
      bg: "#ffffff", surface: "#f5f6f8", text: "#101418", muted: "#5c6670",
      primary: "#101418", primaryC: "#ffffff", accent: "#2563eb", accentC: "#ffffff", border: "#e2e6ea",
    }, { heading: "Space Grotesk", body: "IBM Plex Sans" }, { sm: 4, md: 8, lg: 12, pill: 999 }),
  },
  {
    name: "Verde",
    vibe: "Natural, organic",
    system: sys("Verde", "light", {
      bg: "#f3f7f2", surface: "#fbfdfb", text: "#182018", muted: "#5c6b5c",
      primary: "#182018", primaryC: "#f3f7f2", accent: "#3d7a4e", accentC: "#f4fbf6", border: "#dde6dc",
    }, { heading: "DM Serif Display", body: "Inter" }, { sm: 10, md: 16, lg: 24, pill: 999 }),
  },
  {
    name: "Lava",
    vibe: "Bold, energetic",
    system: sys("Lava", "dark", {
      bg: "#14100f", surface: "#1e1816", text: "#f5eee9", muted: "#b39a8e",
      primary: "#f5eee9", primaryC: "#14100f", accent: "#e8532e", accentC: "#fff4ee", border: "#332722",
    }, { heading: "Space Grotesk", body: "Space Grotesk" }, { sm: 6, md: 12, lg: 18, pill: 999 }),
  },
  {
    name: "Archive",
    vibe: "Swiss, grid-driven",
    system: sys("Archive", "light", {
      bg: "#f4f2ee", surface: "#fbfaf7", text: "#131313", muted: "#66635c",
      primary: "#131313", primaryC: "#f4f2ee", accent: "#d03a2b", accentC: "#fff", border: "#dcd8cf",
    }, { heading: "Oswald", body: "Open Sans" }, { sm: 0, md: 0, lg: 0, pill: 999 }),
  },
  {
    name: "Midnight Garden",
    vibe: "Dark, floral, calm",
    system: sys("Midnight Garden", "dark", {
      bg: "#0c1116", surface: "#141b22", text: "#e8eef3", muted: "#8fa1ad",
      primary: "#e8eef3", primaryC: "#0c1116", accent: "#7fb069", accentC: "#0e160c", border: "#22303c",
    }, { heading: "Cormorant Garamond", body: "Jost" }, { sm: 8, md: 14, lg: 22, pill: 999 }),
  },
  {
    name: "Candy Shop",
    vibe: "Playful, friendly",
    system: sys("Candy Shop", "light", {
      bg: "#fff8f5", surface: "#ffffff", text: "#33202b", muted: "#8a6f7e",
      primary: "#33202b", primaryC: "#fff8f5", accent: "#f05d8a", accentC: "#ffffff", border: "#f6e3ea",
    }, { heading: "Baloo 2", body: "Nunito Sans" }, { sm: 12, md: 18, lg: 26, pill: 999 }),
  },
  {
    name: "Ironclad",
    vibe: "Industrial, rugged",
    system: sys("Ironclad", "light", {
      bg: "#ecebe9", surface: "#f7f6f4", text: "#191919", muted: "#5f5f5b",
      primary: "#191919", primaryC: "#ecebe9", accent: "#b76e2c", accentC: "#fff7ec", border: "#d2d0cb",
    }, { heading: "Space Mono", body: "Inter" }, { sm: 2, md: 4, lg: 6, pill: 999 }),
  },
  {
    name: "Linen",
    vibe: "Soft, boutique",
    system: sys("Linen", "light", {
      bg: "#f7f3ee", surface: "#fffdfa", text: "#2a2420", muted: "#7d7269",
      primary: "#2a2420", primaryC: "#f7f3ee", accent: "#a2624e", accentC: "#fdf4ee", border: "#e8e0d6",
    }, { heading: "Playfair Display", body: "Source Sans 3" }, { sm: 8, md: 14, lg: 22, pill: 999 }),
  },
  {
    name: "Cyber",
    vibe: "Neon, futuristic",
    system: sys("Cyber", "dark", {
      bg: "#0a0a12", surface: "#12121e", text: "#e8e8ff", muted: "#8f8fb8",
      primary: "#e8e8ff", primaryC: "#0a0a12", accent: "#7c6cff", accentC: "#ffffff", border: "#23233a",
    }, { heading: "Space Grotesk", body: "Space Grotesk" }, { sm: 6, md: 10, lg: 16, pill: 999 }),
  },
  {
    name: "Estate",
    vibe: "Classic, luxurious",
    system: sys("Estate", "light", {
      bg: "#f5f1e8", surface: "#fbf8f1", text: "#241f18", muted: "#73695a",
      primary: "#241f18", primaryC: "#f5f1e8", accent: "#8f6b2f", accentC: "#fdf6e8", border: "#e2d9c7",
    }, { heading: "Cormorant Garamond", body: "Jost" }, { sm: 6, md: 10, lg: 16, pill: 999 }),
  },
  {
    name: "Polar",
    vibe: "Clean, airy",
    system: sys("Polar", "light", {
      bg: "#f5f8fa", surface: "#fdfeff", text: "#14212b", muted: "#5b7483",
      primary: "#14212b", primaryC: "#f5f8fa", accent: "#1f8aa5", accentC: "#f2fbff", border: "#dce7ed",
    }, { heading: "Sora", body: "Inter" }, { sm: 10, md: 16, lg: 24, pill: 999 }),
  },
  {
    name: "Carbon",
    vibe: "Dark, sleek, tech",
    system: sys("Carbon", "dark", {
      bg: "#111113", surface: "#19191c", text: "#f0f0f2", muted: "#9d9da6",
      primary: "#f0f0f2", primaryC: "#111113", accent: "#38bdf8", accentC: "#06131c", border: "#26262b",
    }, { heading: "Manrope", body: "Manrope" }, { sm: 6, md: 12, lg: 18, pill: 999 }),
  },
  {
    name: "Sangria",
    vibe: "Mediterranean, vibrant",
    system: sys("Sangria", "light", {
      bg: "#fdf7f2", surface: "#ffffff", text: "#231a16", muted: "#7c6a60",
      primary: "#231a16", primaryC: "#fdf7f2", accent: "#b8322c", accentC: "#fff4f3", border: "#f0e0d6",
    }, { heading: "Playfair Display", body: "Inter" }, { sm: 8, md: 12, lg: 18, pill: 999 }),
  },
  {
    name: "Lagoon",
    vibe: "Tropical, fresh",
    system: sys("Lagoon", "light", {
      bg: "#f2fbf9", surface: "#fafffe", text: "#0f2e2b", muted: "#4f7771",
      primary: "#0f2e2b", primaryC: "#f2fbf9", accent: "#0f766e", accentC: "#ecfdfb", border: "#d0ece7",
    }, { heading: "Manrope", body: "Nunito Sans" }, { sm: 10, md: 16, lg: 24, pill: 999 }),
  },
];
