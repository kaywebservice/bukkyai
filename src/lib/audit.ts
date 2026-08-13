import type { SiteBlueprint } from "./types";
import { SECTION_LABEL } from "./blueprint";
import { contrastRatio } from "./color";
import { renderPage } from "./render";

export type AuditIssue = {
  ok: boolean;
  label: string;
  detail: string;
  area: "seo" | "a11y" | "performance" | "content" | "design";
  fixable: boolean;
};

type AuditResult = { score: number; issues: AuditIssue[] };

function inRange(v: number, min: number, max: number): boolean {
  return v >= min && v <= max;
}

export function auditSite(doc: SiteBlueprint): AuditResult {
  const issues: AuditIssue[] = [];
  const push = (ok: boolean, label: string, detail: string, area: AuditIssue["area"], fixable = false) =>
    issues.push({ ok, label, detail, area, fixable });

  const pages = doc.pages.length ? doc.pages : [];

  const tLen = doc.meta.title.length;
  push(
    inRange(tLen, 20, 60),
    "Site title length",
    `${tLen} chars — ideal 20–60`,
    "seo",
    true
  );

  const dLen = doc.meta.description.length;
  push(
    inRange(dLen, 50, 160),
    "Meta description length",
    `${dLen} chars — ideal 50–160`,
    "seo",
    true
  );

  const titles = new Set(pages.map((p) => p.title.trim().toLowerCase()));
  push(titles.size === pages.length, "Unique page titles", pages.length ? `Found ${pages.length} pages, all unique` : "No pages yet", "seo", true);

  let pagesMissingDesc = 0;
  for (const p of pages) if (!p.description || p.description.length < 20) pagesMissingDesc++;
  push(pagesMissingDesc === 0, "Page descriptions", pagesMissingDesc ? `${pagesMissingDesc} page(s) missing or too-short description` : "All pages have descriptions", "seo", true);

  const sectionTypes: Record<string, number> = {};
  for (const p of pages)
    for (const s of p.sections) sectionTypes[s.type] = (sectionTypes[s.type] ?? 0) + 1;

  const navIds = new Set(doc.nav.links.map((l) => l.href).filter(Boolean));
  let brokenNav = 0;
  for (const href of navIds) {
    const isAnchor = href.startsWith("#");
    const isPage = doc.pages.some((p) => href === `/${p.slug}` || href === `/${p.slug}.html`);
    if (isAnchor) {
      const key = href.slice(1);
      const exists = sectionTypes[key] === 1 || doc.pages.some((p) => p.sections.some((s) => s.id === key));
      if (!exists && key !== "main") brokenNav++;
    } else if (!isPage && !href.startsWith("http") && !href.startsWith("mailto:")) {
      brokenNav++;
    }
  }
  push(brokenNav === 0, "Navigation links resolve", brokenNav ? `${brokenNav} nav link(s) don't point anywhere` : "All nav links resolve", "seo", true);

  // Deep link check: every href in section content (CTAs, footer, cards…).
  const pageLinks = new Set<string>();
  for (const p of pages) for (const s of p.sections) collectHrefs(s.content as Record<string, unknown>, pageLinks);
  let brokenLinks = 0;
  for (const href of pageLinks) {
    if (href.startsWith("#")) continue;
    if (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) continue;
    const ok = doc.pages.some((p) => href === `/${p.slug}` || href === `/${p.slug}.html`);
    if (!ok) brokenLinks++;
  }
  push(brokenLinks === 0, "In-content links resolve", brokenLinks ? `${brokenLinks} internal link(s) point to missing pages` : "All internal links resolve", "seo", true);

  const checks: { label: string; a: string; b: string }[] = [
    { label: "Text on background", a: doc.design.tokens.colors.text, b: doc.design.tokens.colors.background },
    { label: "Muted text", a: doc.design.tokens.colors.muted, b: doc.design.tokens.colors.background },
    { label: "Primary buttons", a: doc.design.tokens.colors.primaryContrast, b: doc.design.tokens.colors.primary },
    { label: "Accent buttons", a: doc.design.tokens.colors.accentContrast, b: doc.design.tokens.colors.accent },
  ];
  for (const c of checks) {
    const ratio = contrastRatio(c.a, c.b);
    const ok = ratio >= 4.5;
    push(ok, `Contrast: ${c.label}`, ratio.toFixed(2) + ":1" + (ok ? " (AA)" : " — below 4.5:1"), "design", ok);
  }

  let totalImgs = 0;
  let noAlt = 0;
  let emptyFields = 0;
  const emptyPlaces: string[] = [];
  for (const p of pages) {
    for (const s of p.sections) {
      const content = s.content as Record<string, unknown>;
      for (const [k, v] of Object.entries(content)) {
        if (typeof v === "string" && !v.trim() && k !== "note") {
          emptyFields++;
          emptyPlaces.push(`${p.title || "home"}/${SECTION_LABEL[s.type] ?? s.type}.${k}`);
          if (emptyPlaces.length > 6) continue;
        }
        if (Array.isArray(v)) {
          for (const item of v) {
            if (item && typeof item === "object") {
              for (const [ik, iv] of Object.entries(item as Record<string, unknown>)) {
                if (typeof iv === "string" && !iv.trim() && ik !== "photo" && ik !== "url" && ik !== "href") {
                  emptyFields++;
                  if (emptyPlaces.length <= 6) emptyPlaces.push(`${p.title || "home"}/${SECTION_LABEL[s.type] ?? s.type}.${k}[].${ik}`);
                }
              }
              if ((item as Record<string, unknown>).alt !== undefined && !String((item as Record<string, unknown>).alt).trim()) {
                noAlt++;
              }
              if ((item as Record<string, unknown>).alt !== undefined) totalImgs++;
              else if ((item as Record<string, unknown>).url !== undefined) totalImgs++;
            }
          }
        }
      }
    }
  }
  push(noAlt === 0, "Images have alt text", noAlt ? `${noAlt} image(s) missing alt text` : "All images have alt text", "a11y", true);
  push(emptyFields === 0, "No empty copy fields", emptyPlaces.length ? `Empty: ${emptyPlaces.slice(0, 6).join(", ")}${emptyFields > 6 ? ` (+${emptyFields - 6} more)` : ""}` : "Every field has content", "content", true);

  const hasFaq = doc.pages.some((p) => p.sections.some((s) => s.type === "faq"));
  push(hasFaq, "FAQ structured data (GEO)", hasFaq ? "FAQPage JSON-LD auto-generated" : "Add an FAQ section to qualify for rich results in AI answers", "seo", true);

  let okCount = 0;
  let fixable = 0;
  for (const i of issues) {
    if (i.ok) okCount++;
    if (i.fixable && !i.ok) fixable++;
  }
  const score = issues.length ? Math.round((okCount / issues.length) * 100) : 100;

  return { score, issues };
}

function collectHrefs(value: unknown, out: Set<string>): void {  if (typeof value === "string") {
    if (value.startsWith("/") && !value.startsWith("//")) out.add(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectHrefs(item, out);
    return;
  }
  if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (k === "href" && typeof v === "string" && v.startsWith("/") && !v.startsWith("//")) out.add(v);
      else collectHrefs(v, out);
    }
  }
}

// Fill every empty image alt from its sibling caption/title/name field (no AI needed).
export function fillAltText(doc: SiteBlueprint): { doc: SiteBlueprint; count: number } {
  const next = JSON.parse(JSON.stringify(doc)) as SiteBlueprint;
  let count = 0;
  for (const pg of next.pages) {
    for (const s of pg.sections) {
      const content = s.content as Record<string, unknown>;
      if (typeof content.alt === "string" && !content.alt.trim()) {
        content.alt = suggestAltFor(content);
        count++;
      }
      for (const item of Object.values(content)) {
        if (!Array.isArray(item)) continue;
        for (const el of item as Record<string, unknown>[]) {
          if (!el || typeof el !== "object") continue;
          if (typeof el.alt === "string" && !el.alt.trim()) {
            el.alt = suggestAltFor(el, String(s.type));
            count++;
          }
          if (el.alt === undefined && typeof el.url === "string" && el.url) {
            el.alt = suggestAltFor(el, String(s.type));
            count++;
          }
        }
      }
    }
  }
  return { doc: next, count };
}

function suggestAltFor(item: Record<string, unknown>, sectionType = ""): string {
  const candidates = [item.caption, item.title, item.name, item.alt];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return c.trim().slice(0, 140);
  }
  const fallback = sectionType ? sectionType.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase()) : "";
  return fallback ? `${fallback} image` : "Image";
}

export function seoAutoFixPrompt(_doc: SiteBlueprint, issues: AuditIssue[]): string {
  const failing = issues.filter((i) => !i.ok && i.fixable);
  const list = failing.map((i) => `- ${i.label}: ${i.detail}`).join("\n");
  return `Fix the following issues in my site (structure and untouched copy must stay EXACTLY the same; only fix the listed issues — titles, descriptions, nav links, empty fields, alts):\n\n${list}`;
}

export function renderSmokeTest(_doc: SiteBlueprint): string[] {  const warnings: string[] = [];
  const home = _doc.pages[0];
  if (!home) {
    warnings.push("No pages — add content before exporting.");
    return warnings;
  }
  try {
    const html = renderPage(_doc, home, false);
    if (html.includes("undefined") || html.includes("NaN")) {
      warnings.push("Render contained undefined/NaN values.");
    }
  } catch {
    warnings.push("Rendering failed — report this as a bug.");
  }
  return warnings;
}