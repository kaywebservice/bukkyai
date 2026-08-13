import { FONT_PAIRS } from "./fontPairs";
import { contrastRatio, hexToRgb, luminance } from "./color";
import type { ColorTokens, DesignSystem } from "./types";

export type Axis = "colors" | "fonts" | "layout";

export type HarmonyScore = {
  total: number;
  axes: Record<Axis, number>;
  notes: string[];
};

export function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return { h: h * 60, s, l };
}

export function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const toHex = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function hueDistance(a: number, b: number): number {
  const d = Math.abs((((a - b) % 360) + 360) % 360);
  return d > 180 ? 360 - d : d;
}

export function hueHarmony(d: number): number {
  const comp = 1 - Math.abs(d - 180) / 180;
  const analog = d <= 35 ? 0.85 - (d / 35) * 0.15 : 0;
  return Math.max(comp, analog);
}

export function readableTextOn(hex: string): string {
  return luminance(hex) > 0.55 ? "#1a1a1a" : "#ffffff";
}

const SERIF_HEADINGS = new Set([
  "Playfair Display",
  "Fraunces",
  "DM Serif Display",
  "Cormorant Garamond",
  "Source Serif 4",
]);

function isCuratedPair(heading: string, body: string): boolean {
  return FONT_PAIRS.some((f) => f.heading === heading && f.body === body);
}

function scoreHue(c: ColorTokens): number {
  const pr = hexToHsl(c.primary);
  const ac = hexToHsl(c.accent);
  if (!pr || !ac) return 0.75;
  if (pr.s < 0.12 && ac.s < 0.06) return 1;
  if (pr.s < 0.12) return 0.85;
  return hueHarmony(hueDistance(pr.h, ac.h));
}

function scoreContrast(c: ColorTokens): number {
  const pairs: Array<[string, string, number]> = [
    [c.text, c.background, 4.5],
    [c.muted, c.background, 3],
    [c.primaryContrast, c.primary, 3],
    [c.accentContrast, c.accent, 3],
  ];
  let pass = 0;
  for (const [a, b, min] of pairs) {
    if (contrastRatio(a, b) >= min) pass += 1;
  }
  return pass / pairs.length;
}

function scoreFonts(d: DesignSystem): number {
  const { heading, body } = d.tokens.fonts;
  if (isCuratedPair(heading, body)) return 1;
  if (heading === body) return 0.4;
  const contrast = SERIF_HEADINGS.has(heading) !== SERIF_HEADINGS.has(body);
  return contrast ? 0.7 : 0.55;
}

function scoreLayout(d: DesignSystem): number {
  const t = d.tokens;
  let pass = 0;
  const checks = 5;
  const fs = t.fontScale;
  if (fs.display >= fs.h1 && fs.h1 >= fs.h2 && fs.h2 >= fs.h3 && fs.h3 >= fs.body) pass += 1;
  if (t.spacing.section > t.spacing.container && t.spacing.container > t.spacing.gap) pass += 1;
  if (t.radius.lg >= t.radius.md && t.radius.md >= t.radius.sm) pass += 1;
  if (t.motion.durationMs >= 80 && t.motion.durationMs <= 600) pass += 1;
  if (fs.body >= 15 && fs.body <= 18) pass += 1;
  return pass / checks;
}

export function scoreDesign(d: DesignSystem): HarmonyScore {
  const colors = Math.round(100 * (0.35 * scoreHue(d.tokens.colors) + 0.65 * scoreContrast(d.tokens.colors)));
  const fonts = Math.round(100 * scoreFonts(d));
  const layout = Math.round(100 * scoreLayout(d));
  const total = Math.round(0.45 * colors + 0.35 * fonts + 0.2 * layout);
  const notes: string[] = [];
  if (colors < 60) notes.push("Low color harmony — accent and primary clash or contrast fails.");
  else if (colors < 80) notes.push("Decent colors — a hue nudge would lift the palette.");
  else notes.push("Colors are harmonious and readable.");
  if (fonts < 70) notes.push("Font pairing is off-curation — swap to a proven pairing.");
  else notes.push("Font pairing is solid.");
  if (layout < 70) notes.push("Type scale or spacing scale is inconsistent.");
  else notes.push("Type and spacing scales are consistent.");
  return { total, axes: { colors, fonts, layout }, notes };
}

export type HarmonizeResult = {
  design: DesignSystem;
  before: HarmonyScore;
  after: HarmonyScore;
  changes: string[];
};

export function harmonizeDesign(d: DesignSystem): HarmonizeResult {
  const changes: string[] = [];
  const colors: ColorTokens = { ...d.tokens.colors };

  const pr = hexToHsl(colors.primary);
  const ac = hexToHsl(colors.accent);
  if (pr && ac && pr.s > 0.12) {
    let best = ac.h;
    let bestScore = -1;
    for (const off of [0, 30, -30, 150, -150, 180]) {
      const cand = pr.h + off;
      const s = hueHarmony(hueDistance(pr.h, cand));
      if (s > bestScore) {
        bestScore = s;
        best = cand;
      }
    }
    const next = hslToHex(best, ac.s, ac.l);
    if (next.toLowerCase() !== colors.accent.toLowerCase()) {
      colors.accent = next;
      const deg = Math.round(((best % 360) + 360) % 360);
      changes.push(`Accent hue tuned to ${deg}° for complementary harmony`);
    }
  }

  colors.accentContrast = readableTextOn(colors.accent);
  colors.primaryContrast = readableTextOn(colors.primary);

  const fonts = { ...d.tokens.fonts };
  const curated =
    FONT_PAIRS.find((f) => f.heading === fonts.heading && f.body === fonts.body) ||
    FONT_PAIRS.find((f) => f.heading === fonts.heading) ||
    FONT_PAIRS.find((f) => f.body === fonts.body);
  const next = curated || FONT_PAIRS[1];
  if (next && (next.heading !== fonts.heading || next.body !== fonts.body)) {
    changes.push(`Swapped to curated pairing “${next.label}” (${next.heading} / ${next.body})`);
    fonts.heading = next.heading;
    fonts.body = next.body;
  }

  const design: DesignSystem = {
    name: `${d.name} · harmonized`,
    tokens: { ...d.tokens, colors, fonts },
  };

  const before = scoreDesign(d);
  const after = scoreDesign(design);
  if (changes.length === 0) changes.push("Design already in strong harmony — no changes needed.");

  return { design, before, after, changes };
}
