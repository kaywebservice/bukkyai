export type FontPair = { label: string; heading: string; body: string };

export const FONT_PAIRS: FontPair[] = [
  { label: "Neue Grotesk", heading: "Space Grotesk", body: "Inter" },
  { label: "Editorial", heading: "Fraunces", body: "Inter" },
  { label: "Bauhaus", heading: "Space Grotesk", body: "Space Grotesk" },
  { label: "Classic Serif", heading: "Playfair Display", body: "Source Sans 3" },
  { label: "Soft Modern", heading: "Sora", body: "Inter" },
  { label: "Techy", heading: "Space Grotesk", body: "IBM Plex Sans" },
  { label: "Friendly", heading: "Baloo 2", body: "Nunito Sans" },
  { label: "Editorial Alt", heading: "DM Serif Display", body: "Inter" },
  { label: "Mono Accent", heading: "Space Mono", body: "Inter" },
  { label: "Clean Sans", heading: "Manrope", body: "Manrope" },
  { label: "Condensed", heading: "Oswald", body: "Open Sans" },
  { label: "Elegant", heading: "Cormorant Garamond", body: "Jost" },
];

export function googleFontsLink(heading: string, body: string): string {
  const fams = new Map<string, string>();
  if (heading) fams.set(heading, "400;600;700;800");
  if (body && body !== heading) fams.set(body, "400;500;600;700");
  const q = [...fams]
    .map(([fam, w]) => `family=${fam.replace(/ /g, "+")}:wght@${w}`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${q}&display=swap`;
}

export function fontCssStack(name: string, fallback: string): string {
  const safe = name.replace(/[^a-zA-Z0-9\s-]/g, "").trim();
  return `"${safe}", ${fallback}`;
}
