import type { DesignSystem } from "./types";
import { FONT_PAIRS } from "./fontPairs";

export type ThemeCategory =
  | "Minimal"
  | "Elegant"
  | "Bold"
  | "Earthy"
  | "Tech"
  | "Retro"
  | "Luxury"
  | "Editorial"
  | "Playful"
  | "Corporate";

export type GeneratedTheme = {
  id: string;
  name: string;
  category: ThemeCategory;
  description: string;
  mode: "light" | "dark";
  palette: string[];
  headingFont: string;
  bodyFont: string;
  system: DesignSystem;
};

type PaletteFamily = {
  name: string;
  category: ThemeCategory;
  blurb: string;
  light: { bg: string; surface: string; text: string; muted: string; primary: string; primaryC: string; accent: string; accentC: string; border: string };
  dark?: { bg: string; surface: string; text: string; muted: string; primary: string; primaryC: string; accent: string; accentC: string; border: string };
  fonts: number[]; // indexes into FONT_PAIRS that look good with this palette
  radius: { sm: number; md: number; lg: number; pill: number };
  scale?: { display: number; h1: number; h2: number; h3: number; h4: number; body: number; small: number };
};

const PALETTES: PaletteFamily[] = [
  {
    name: "Cream Ink",
    category: "Elegant",
    blurb: "Warm cream and ink — editorial, timeless, confident.",
    light: { bg: "#f7f3ea", surface: "#fffdf8", text: "#1d1b16", muted: "#6b6355", primary: "#1d1b16", primaryC: "#f7f3ea", accent: "#b3541e", accentC: "#fff7ee", border: "#e2d9c6" },
    dark: { bg: "#16140f", surface: "#1e1b14", text: "#f2efe6", muted: "#a89f8b", primary: "#f2efe6", primaryC: "#16140f", accent: "#d98a52", accentC: "#1a140e", border: "#3a352a" },
    fonts: [1, 3, 11, 5],
    radius: { sm: 8, md: 14, lg: 20, pill: 999 },
  },
  {
    name: "Noir Luxe",
    category: "Luxury",
    blurb: "Deep black, champagne gold — a five-star feel.",
    light: { bg: "#faf7f2", surface: "#ffffff", text: "#14120e", muted: "#6d675b", primary: "#14120e", primaryC: "#faf7f2", accent: "#a3803c", accentC: "#fffdf6", border: "#e5ddd0" },
    dark: { bg: "#0d0c0a", surface: "#161412", text: "#f4f1ea", muted: "#a39b89", primary: "#f4f1ea", primaryC: "#0d0c0a", accent: "#c9a75a", accentC: "#171309", border: "#2b2823" },
    fonts: [1, 11, 3],
    radius: { sm: 6, md: 10, lg: 14, pill: 999 },
  },
  {
    name: "Nordic Fjord",
    category: "Minimal",
    blurb: "Cool slate blues and whites — calm, precise, scandinavian.",
    light: { bg: "#f5f7f9", surface: "#ffffff", text: "#1a2630", muted: "#5f7283", primary: "#1a2630", primaryC: "#f5f7f9", accent: "#2f6f9f", accentC: "#f0f7fc", border: "#dfe6ec" },
    dark: { bg: "#10161c", surface: "#182028", text: "#e8eef3", muted: "#8fa1b0", primary: "#e8eef3", primaryC: "#10161c", accent: "#6aa8d1", accentC: "#0e1a24", border: "#2a3640" },
    fonts: [5, 4, 9, 0],
    radius: { sm: 6, md: 10, lg: 16, pill: 999 },
  },
  {
    name: "Sage Garden",
    category: "Earthy",
    blurb: "Soft greens and clay — grounded, organic, calm.",
    light: { bg: "#f4f6f1", surface: "#fcfdf9", text: "#22302a", muted: "#617168", primary: "#22302a", primaryC: "#f4f6f1", accent: "#4d6b45", accentC: "#f1f7ee", border: "#e1e6da" },
    dark: { bg: "#121712", surface: "#1a2019", text: "#eef2ea", muted: "#9aa89b", primary: "#eef2ea", primaryC: "#121712", accent: "#84a57b", accentC: "#111a10", border: "#2c3529" },
    fonts: [4, 1, 3],
    radius: { sm: 10, md: 16, lg: 24, pill: 999 },
  },
  {
    name: "Cobalt Surge",
    category: "Tech",
    blurb: "Electric blue on deep ink — startup energy, digital clarity.",
    light: { bg: "#f4f6fb", surface: "#ffffff", text: "#0f1b2d", muted: "#5a6b84", primary: "#0f1b2d", primaryC: "#f4f6fb", accent: "#2b5cff", accentC: "#f2f6ff", border: "#dfe5f0" },
    dark: { bg: "#0a0f1a", surface: "#111a2c", text: "#eef2fb", muted: "#8b9cb8", primary: "#eef2fb", primaryC: "#0a0f1a", accent: "#4d7cff", accentC: "#0b1222", border: "#223050" },
    fonts: [0, 5, 6, 9],
    radius: { sm: 6, md: 10, lg: 14, pill: 999 },
  },
  {
    name: "Terracotta Dusk",
    category: "Bold",
    blurb: "Burnt orange and warm neutrals — bold, welcoming, appetizing.",
    light: { bg: "#faf3ec", surface: "#fffdfa", text: "#2b1e16", muted: "#7d6a5b", primary: "#2b1e16", primaryC: "#faf3ec", accent: "#c05a2b", accentC: "#fff6ee", border: "#ead9c9" },
    dark: { bg: "#181009", surface: "#211710", text: "#f8f0e7", muted: "#b09a87", primary: "#f8f0e7", primaryC: "#181009", accent: "#e07a45", accentC: "#1f1208", border: "#3a2b1d" },
    fonts: [1, 3, 4],
    radius: { sm: 10, md: 16, lg: 22, pill: 999 },
  },
  {
    name: "Retro Sunset",
    category: "Retro",
    blurb: "Coral, mustard and teal on cream — seventies energy, playful.",
    light: { bg: "#fbf1e4", surface: "#fffaf0", text: "#2f2113", muted: "#8a7a63", primary: "#2f2113", primaryC: "#fbf1e4", accent: "#c2503a", accentC: "#fff5ef", border: "#ecd7bd" },
    dark: { bg: "#1c1208", surface: "#251a0d", text: "#f8ecdb", muted: "#b6a284", primary: "#f8ecdb", primaryC: "#1c1208", accent: "#e07a5f", accentC: "#1f0f07", border: "#45331d" },
    fonts: [2, 6, 10, 7],
    radius: { sm: 12, md: 18, lg: 26, pill: 999 },
  },
  {
    name: "Charcoal Slate",
    category: "Corporate",
    blurb: "Near-black and cool gray — serious, clean, dependable.",
    light: { bg: "#f7f8fa", surface: "#ffffff", text: "#17181c", muted: "#5f6168", primary: "#17181c", primaryC: "#f7f8fa", accent: "#3f4a5a", accentC: "#f2f5f9", border: "#e3e6ea" },
    dark: { bg: "#111316", surface: "#191b1f", text: "#eef0f3", muted: "#9aa0a8", primary: "#eef0f3", primaryC: "#111316", accent: "#8fa0b5", accentC: "#13171c", border: "#2b2f35" },
    fonts: [5, 9, 0],
    radius: { sm: 4, md: 8, lg: 12, pill: 999 },
  },
  {
    name: "Wild Bloom",
    category: "Playful",
    blurb: "Violet, coral and mint — vivid, friendly, creative.",
    light: { bg: "#faf4fb", surface: "#fffdfe", text: "#231a2c", muted: "#7a6a85", primary: "#231a2c", primaryC: "#faf4fb", accent: "#8b5cf6", accentC: "#f7f1ff", border: "#eadff0" },
    dark: { bg: "#140f1c", surface: "#1c1526", text: "#f5f0fa", muted: "#a28fb5", primary: "#f5f0fa", primaryC: "#140f1c", accent: "#b08cff", accentC: "#150e20", border: "#322642" },
    fonts: [7, 2, 6],
    radius: { sm: 14, md: 20, lg: 28, pill: 999 },
  },
  {
    name: "Ocean Depth",
    category: "Tech",
    blurb: "Teal and deep navy — fluid, modern, trustworthy.",
    light: { bg: "#f2f8f8", surface: "#ffffff", text: "#0e2526", muted: "#527272", primary: "#0e2526", primaryC: "#f2f8f8", accent: "#0e7c7b", accentC: "#eff9f8", border: "#d5e6e5" },
    dark: { bg: "#0a1416", surface: "#121f21", text: "#e9f4f3", muted: "#86a5a4", primary: "#e9f4f3", primaryC: "#0a1416", accent: "#3db6b3", accentC: "#0a1b1c", border: "#223437" },
    fonts: [5, 0, 4],
    radius: { sm: 10, md: 16, lg: 24, pill: 999 },
  },
  {
    name: "Rose Quartz",
    category: "Elegant",
    blurb: "Blush pinks and warm gray — soft, refined, feminine.",
    light: { bg: "#fbf4f5", surface: "#fffdfd", text: "#2b1d22", muted: "#8a7078", primary: "#2b1d22", primaryC: "#fbf4f5", accent: "#b45a78", accentC: "#fef5f8", border: "#efdde2" },
    dark: { bg: "#170f12", surface: "#1f1519", text: "#f7eef1", muted: "#ad929b", primary: "#f7eef1", primaryC: "#170f12", accent: "#d98aa6", accentC: "#1e0f15", border: "#36232a" },
    fonts: [1, 3, 11],
    radius: { sm: 10, md: 16, lg: 22, pill: 999 },
  },
  {
    name: "Forest Whisper",
    category: "Earthy",
    blurb: "Deep green and moss — calm, premium, connected to nature.",
    light: { bg: "#f1f4ee", surface: "#fbfcf8", text: "#1c2620", muted: "#5e6c61", primary: "#1c2620", primaryC: "#f1f4ee", accent: "#3c6b4a", accentC: "#eef6f0", border: "#dce4d7" },
    dark: { bg: "#0e130f", surface: "#151c16", text: "#e9efe8", muted: "#93a393", primary: "#e9efe8", primaryC: "#0e130f", accent: "#6fae7f", accentC: "#0d1a10", border: "#263126" },
    fonts: [4, 1, 5],
    radius: { sm: 8, md: 14, lg: 20, pill: 999 },
  },
  {
    name: "Golden Hour",
    category: "Luxury",
    blurb: "Amber and cream with warm brown — radiant, rich, warm.",
    light: { bg: "#fdf6e9", surface: "#fffdf6", text: "#2a1e10", muted: "#8a7659", primary: "#2a1e10", primaryC: "#fdf6e9", accent: "#c98a2d", accentC: "#fff8e6", border: "#efdcc0" },
    dark: { bg: "#171004", surface: "#21180a", text: "#f8efdd", muted: "#b6a27f", primary: "#f8efdd", primaryC: "#171004", accent: "#e0a63d", accentC: "#1e1305", border: "#3d2d13" },
    fonts: [3, 1, 11],
    radius: { sm: 8, md: 14, lg: 20, pill: 999 },
  },
  {
    name: "Midnight Violet",
    category: "Tech",
    blurb: "Deep indigo and lavender — sleek, mysterious, cutting-edge.",
    light: { bg: "#f4f2fb", surface: "#ffffff", text: "#1a1630", muted: "#6a6385", primary: "#1a1630", primaryC: "#f4f2fb", accent: "#6d5ae8", accentC: "#f1efff", border: "#e1ddef" },
    dark: { bg: "#0d0a1a", surface: "#151128", text: "#edeaf8", muted: "#938aad", primary: "#edeaf8", primaryC: "#0d0a1a", accent: "#8f7bff", accentC: "#130e24", border: "#282145" },
    fonts: [0, 5, 6, 9],
    radius: { sm: 8, md: 12, lg: 18, pill: 999 },
  },
  {
    name: "Sunlit Citrus",
    category: "Playful",
    blurb: "Lemon yellow and sky blue — bright, energetic, fresh.",
    light: { bg: "#fcf8ec", surface: "#fffef9", text: "#2b2413", muted: "#87794f", primary: "#2b2413", primaryC: "#fcf8ec", accent: "#e0a93a", accentC: "#fff7dd", border: "#efe5c4" },
    dark: { bg: "#191303", surface: "#241c07", text: "#f8f1dc", muted: "#c0ae7a", primary: "#f8f1dc", primaryC: "#191303", accent: "#f0c24e", accentC: "#231806", border: "#443814" },
    fonts: [7, 2, 6],
    radius: { sm: 12, md: 18, lg: 24, pill: 999 },
  },
  {
    name: "Graphite Mint",
    category: "Minimal",
    blurb: "Soft mint on light gray — modern, airy, understated.",
    light: { bg: "#f3f6f4", surface: "#ffffff", text: "#18201c", muted: "#5d6b62", primary: "#18201c", primaryC: "#f3f6f4", accent: "#2f8f73", accentC: "#eff8f4", border: "#dfe6e0" },
    dark: { bg: "#0e1210", surface: "#161c18", text: "#eaf0ec", muted: "#93a199", primary: "#eaf0ec", primaryC: "#0e1210", accent: "#5fb398", accentC: "#0c1813", border: "#28342d" },
    fonts: [5, 4, 9, 0],
    radius: { sm: 6, md: 10, lg: 16, pill: 999 },
  },
  {
    name: "Imperial Red",
    category: "Bold",
    blurb: "Crimson and charcoal — dramatic, powerful, confident.",
    light: { bg: "#fbf3f2", surface: "#ffffff", text: "#241718", muted: "#7e6163", primary: "#241718", primaryC: "#fbf3f2", accent: "#b83b3b", accentC: "#fff4f3", border: "#efd8d6" },
    dark: { bg: "#150d0e", surface: "#1e1415", text: "#f7ecec", muted: "#b09193", primary: "#f7ecec", primaryC: "#150d0e", accent: "#e06b6b", accentC: "#200d0d", border: "#382226" },
    fonts: [3, 1, 10],
    radius: { sm: 6, md: 12, lg: 16, pill: 999 },
  },
  {
    name: "Bamboo Paper",
    category: "Editorial",
    blurb: "Rice paper and ink black — minimal, literary, precise.",
    light: { bg: "#f7f4ec", surface: "#fdfbf4", text: "#1c1a15", muted: "#6e685a", primary: "#1c1a15", primaryC: "#f7f4ec", accent: "#9a5b2b", accentC: "#fbf3e8", border: "#e6e0d0" },
    dark: { bg: "#141210", surface: "#1c1916", text: "#f0ede5", muted: "#a39d8e", primary: "#f0ede5", primaryC: "#141210", accent: "#c58a4e", accentC: "#1d1309", border: "#332e27" },
    fonts: [1, 3, 11],
    radius: { sm: 4, md: 8, lg: 12, pill: 999 },
  },
  {
    name: "Candy Pop",
    category: "Playful",
    blurb: "Hot pink, aqua and lime — bold, fun, impossible to ignore.",
    light: { bg: "#fbf2f7", surface: "#fffdfe", text: "#2c1624", muted: "#8a6b7e", primary: "#2c1624", primaryC: "#fbf2f7", accent: "#d84a8c", accentC: "#fff3fa", border: "#f2d9e6" },
    dark: { bg: "#170d13", surface: "#20141b", text: "#faedf5", muted: "#bd95aa", primary: "#faedf5", primaryC: "#170d13", accent: "#f076b0", accentC: "#210e18", border: "#3a2130" },
    fonts: [7, 2, 6],
    radius: { sm: 14, md: 20, lg: 26, pill: 999 },
  },
  {
    name: "Steel Chrome",
    category: "Tech",
    blurb: "Metallic gray and electric accent — industrial, sharp, modern.",
    light: { bg: "#f4f5f6", surface: "#ffffff", text: "#131517", muted: "#5c6064", primary: "#131517", primaryC: "#f4f5f6", accent: "#0078d4", accentC: "#eef7ff", border: "#e0e3e6" },
    dark: { bg: "#0c0e10", surface: "#15181b", text: "#eef1f3", muted: "#9299a0", primary: "#eef1f3", primaryC: "#0c0e10", accent: "#3fa7ff", accentC: "#0a1420", border: "#272c31" },
    fonts: [5, 0, 9],
    radius: { sm: 4, md: 8, lg: 12, pill: 999 },
  },
];

const THEME_NAMES = [
  "Aurora", "Haven", "Ember", "Meadow", "Compass", "Lumen", "Nimbus", "Vale", "Orbit", "Harbor",
  "Sable", "Fable", "Prism", "Dune", "Iris", "Ridge", "Cove", "Lark", "Moss", "Tempo",
  "Quill", "Sora", "Halo", "Fjord", "Bramble", "Cinder", "Dawn", "Echo", "Fern", "Glaze",
  "Haven", "Juniper", "Kite", "Loom", "Marlin", "Noir", "Oasis", "Pebble", "Quartz", "Ripple",
  "Sage", "Thistle", "Umbra", "Vapor", "Willow", "Zephyr", "Alder", "Bloom", "Clover", "Drift",
];

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateThemes(): GeneratedTheme[] {
  const themes: GeneratedTheme[] = [];
  let seed = 42;

  for (let pi = 0; pi < PALETTES.length; pi++) {
    const fam = PALETTES[pi];
    const variants: ("light" | "dark")[] = fam.dark ? ["light", "dark"] : ["light"];

    for (const mode of variants) {
      const colors = mode === "light" ? fam.light : fam.dark!;
      for (const fi of fam.fonts) {
        const fp = FONT_PAIRS[fi];
        const rng = mulberry32(seed++);
        const nameIdx = Math.floor(rng() * THEME_NAMES.length);
        const name = `${THEME_NAMES[nameIdx]} ${fam.name}`;

        const scale = fam.scale ?? {
          display: 52 + Math.floor(rng() * 20),
          h1: 40,
          h2: 30,
          h3: 22,
          h4: 17,
          body: 16,
          small: 13,
        };

        const system: DesignSystem = {
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
            fonts: { heading: fp.heading, body: fp.body },
            fontScale: scale,
            spacing: { section: 96, container: 1120, stack: 16, gap: 24 },
            radius: fam.radius,
            shadows: {
              sm: "0 1px 2px rgba(15,15,20,.06)",
              md: "0 8px 24px rgba(15,15,20,.08)",
              lg: "0 24px 64px rgba(15,15,20,.12)",
            },
            motion: { durationMs: 200 },
            mode,
          },
        };

        themes.push({
          id: `${fam.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${mode}-${fi}`,
          name,
          category: fam.category,
          description: fam.blurb,
          mode,
          palette: [colors.bg, colors.surface, colors.primary, colors.accent, colors.text],
          headingFont: fp.heading,
          bodyFont: fp.body,
          system,
        });
      }
    }
  }

  return themes;
}

export const GENERATED_THEMES: GeneratedTheme[] = generateThemes();

export const THEME_CATEGORIES: ThemeCategory[] = [
  "Minimal", "Elegant", "Bold", "Earthy", "Tech", "Retro", "Luxury", "Editorial", "Playful", "Corporate",
];
