// Generates OG share-card PNGs (1200x630) into public/og/ at build time.
// Run as part of `npm run build` (before vite build).
// Cards use the Cream & Ink brand system so shared links look intentional.
import { Resvg } from "@resvg/resvg-js";
import { writeFileSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "og");
mkdirSync(outDir, { recursive: true });

const CREAM = "#f7f3ea";
const INK = "#1d1b16";
const TERRACOTTA = "#b3541e";

function esc(s) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function wrapLines(text, max = 26) {
  const words = String(text || "").split(/\s+/);
  const lines = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > max && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = (cur + " " + w).trim();
    }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 4);
}

function svgCard({ kicker, title, sub }) {
  const lines = wrapLines(title, 34).slice(0, 3);
  const lineY = lines.map((_, i) => 280 + i * 92);
  const textBlock = lines.map((l, i) =>
    `<text x="80" y="${lineY[i]}" font-family="Georgia, serif" font-size="76" font-weight="700" fill="${INK}">${esc(l)}</text>`
  ).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${CREAM}"/>
  <circle cx="1080" cy="90" r="300" fill="${TERRACOTTA}" opacity="0.08"/>
  <rect x="80" y="84" width="64" height="10" rx="5" fill="${TERRACOTTA}"/>
  <text x="80" y="180" font-family="Arial, sans-serif" font-size="30" font-weight="600" letter-spacing="6" fill="${TERRACOTTA}" text-transform="uppercase">${esc(kicker).toUpperCase()}</text>
  ${textBlock}
  ${sub ? `<text x="80" y="${lineY[lineY.length - 1] + 96}" font-family="Arial, sans-serif" font-size="30" fill="#6b6355">${esc(sub)}</text>` : ""}
  <circle cx="66" cy="588" r="22" fill="${INK}"/>
  <text x="66" y="601" text-anchor="middle" font-family="Georgia, serif" font-size="30" font-weight="700" fill="${CREAM}">b</text>
  <text x="102" y="596" font-family="Georgia, serif" font-size="28" font-weight="700" fill="${INK}">bukkyai</text>
</svg>`;
}

function render(name, card) {
  const png = new Resvg(svgCard(card), { fitTo: { mode: "width", value: 1200 } }).render().asPng();
  writeFileSync(join(outDir, `${name}.png`), png);
  console.log(`og: ${name}.png`);
}

const ARTICLES = [
  { file: "how-to-write-a-website-brief", kicker: "Planning", title: "How to write a website brief that gets you the right site", sub: "One honest paragraph is worth a four-page document" },
  { file: "why-good-design-system-beats-template", kicker: "Design", title: "Why a real design system beats choosing a template", sub: "Three decisions, repeated consistently" },
  { file: "writing-homepage-that-sells", kicker: "Copy", title: "Writing a homepage that sells without sounding salesy", sub: "Specific beats clever. One button beats five" },
  { file: "how-much-does-website-cost", kicker: "Cost", title: "How much does a small business website cost in 2026?", sub: "A real breakdown, not \"it depends\"" },
  { file: "best-website-builder-for-restaurants", kicker: "Guides", title: "Best website builder for restaurants (2026)", sub: "Menu, hours, reservations, one good photo" },
];

for (const a of ARTICLES) render(a.file, a);

const DEMOS = [
  { file: "bakery", kicker: "Demo", title: "June & Oak — bakery & café", sub: "Generated from one sentence" },
  { file: "saas", kicker: "Demo", title: "Northwind — SaaS product", sub: "Generated from one sentence" },
  { file: "atelier", kicker: "Demo", title: "Atelier — design studio", sub: "Generated from one sentence" },
  { file: "verdant", kicker: "Demo", title: "Verdant — wellness brand", sub: "Generated from one sentence" },
  { file: "harbor", kicker: "Demo", title: "Harbor House — boutique hotel", sub: "Generated from one sentence" },
  { file: "metro", kicker: "Demo", title: "Metro — restaurant & bar", sub: "Generated from one sentence" },
];
for (const d of DEMOS) render(d.file, d);

render("default", { kicker: "AI website builder", title: "Describe your business. Get the whole website.", sub: "Planned, designed and written in minutes" });
render("playground", { kicker: "Playground", title: "Try bukkyai — live website previews, no signup", sub: "Six real sites generated from one sentence each" });

console.log(`generated ${ARTICLES.length + DEMOS.length + 2} OG cards`);
