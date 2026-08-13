export const PRESETS = [
  { name: "SaaS", desc: "Clean, conversion-focused, teal + dark", href: "/p SaaS" },
  { name: "Agency", desc: "Bold, editorial, duotone imagery", href: "/p Agency" },
  { name: "Portfolio", desc: "Minimal grid, monospace accents", href: "/p Portfolio" },
  { name: "Eco", desc: "Earthy palettes, soft rounded", href: "/p Eco" },
  { name: "DTC", desc: "High-contrast, product photography, urgency", href: "/p DTC" },
] as const;

export const BRAND_TAGS =
  "Supported: .zip with logo files + colors.json, or a plain colors.json with {logo: dataUrl, colors: [...]}. We read the palette and seed the design tokens live.";
