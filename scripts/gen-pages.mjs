// Generates programmatic SEO pages into programmatic/*.html from prog-data.mjs.
// Run before vite build (part of `npm run build`).
import { writeFileSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { TEMPLATES, INDUSTRIES, USE_CASES, COMPARISONS, HOW_TOS } from "./prog-data.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "programmatic");
mkdirSync(outDir, { recursive: true });

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function pageShell({ title, meta, h1, blurb, accent, grad, body, slug, cat }) {
  const links = [
    '<a href="/features">Website builder</a>',
    '<a href="/templates">Templates</a>',
    '<a href="/pricing">Pricing</a>',
    '<a href="/app">Open editor</a>',
  ].join(" · ");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(title)} — bukkyai</title>
<meta name="description" content="${esc(meta)}" />
<meta property="og:title" content="${esc(title)} — bukkyai" />
<meta property="og:description" content="${esc(meta)}" />
<link rel="manifest" href="/manifest.webmanifest" />
<link rel="icon" href="/icon-192.png" />
<meta name="theme-color" content="#f7f3ea" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/marketing.css" />
<style>
  .prog-hero { padding: 76px 0 44px; text-align: center; }
  .prog-hero h1 { font-family: var(--font-display); font-size: clamp(34px, 5vw, 52px); letter-spacing: -.02em; margin-bottom: 14px; }
  .prog-hero p { color: var(--muted); font-size: 17px; max-width: 640px; margin: 0 auto; }
  .prog-pill { display: inline-block; font-size: 12px; color: #fff; background: var(--accent); padding: 7px 14px; border-radius: 999px; margin-bottom: 18px; }
  .prog-body { max-width: 760px; margin: 0 auto; }
  .prog-check { display: flex; gap: 10px; align-items: flex-start; padding: 8px 0; font-size: 15px; }
  .prog-check::before { content: "✓"; color: var(--accent); font-weight: 700; }
  .prog-cta { text-align: center; padding: 70px 0 90px; }
  .prog-links { text-align: center; margin: 0 0 40px; color: var(--muted); font-size: 14px; }
  .prog-links a { color: var(--accent); margin: 0 6px; }
</style>
</head>
<body>

<header class="prog-hero">
  <div class="wrap">
    <span class="prog-pill" style="background:linear-gradient(135deg, ${grad})">${esc(cat)}</span>
    <h1>${esc(h1)}</h1>
    <p>${esc(blurb)}</p>
  </div>
</header>

<section class="prog-body">
  <div class="wrap">
    ${body}
  </div>
</section>

<section class="prog-cta">
  <div class="wrap">
    <h2 style="font-family:var(--font-display);margin-bottom:14px">Build yours in minutes.</h2>
    <p style="color:var(--muted);margin-bottom:24px">Describe your ${esc(cat.toLowerCase())} — get the whole site, written and designed.</p>
    <div class="btn-row" style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
      <a class="btn btn-primary" href="/app">Get started — it's free</a>
      <a class="btn btn-ghost" href="/templates">See templates</a>
    </div>
  </div>
</section>

<section class="prog-links">
  <div class="wrap">${links}</div>
</section>

<script src="/marketing.js"></script>
</body>
</html>`;
}

let count = 0;

// Templates → /templates/{slug}
for (const t of TEMPLATES) {
  const body = `
    <div class="section-label" style="color:${t.accent}">Template</div>
    <h2>Start from the ${t.name} template.</h2>
    <p style="color:var(--muted);margin-bottom:22px">Pick the template, then describe your ${t.name.toLowerCase()} — bukkyai rewrites it into your own site with real words.</p>
    ${t.features.map((f) => `<div class="prog-check">${f}</div>`).join("\n")}
    <div style="margin-top:26px">
      <p style="color:var(--muted)">The ${t.name} template is one of six full, ready-made sites — bakery, SaaS, studio, wellness, hotel and restaurant. Each has multiple pages, a bespoke design and blog posts, all editable.</p>
    </div>`;
  writeFileSync(join(outDir, `templates-${t.slug}.html`), pageShell({ title: t.title, meta: t.meta, h1: t.h1, blurb: t.blurb, accent: t.accent, grad: t.grad, body, slug: t.slug, cat: "Template" }));
  count++;
}

// Industries → /industries/{slug}
for (const i of INDUSTRIES) {
  const body = `
    <div class="section-label" style="color:${i.accent}">Industry</div>
    <h2>The ${i.name.toLowerCase()} website you need, without the work.</h2>
    <p style="color:var(--muted);margin-bottom:22px">You describe your ${i.name.toLowerCase()} business. bukkyai plans the pages, writes the copy and designs a site that fits — no templates to wrestle, no code.</p>
    <div class="prog-check">A full multi-page site, not a one-pager</div>
    <div class="prog-check">Copy written in your voice</div>
    <div class="prog-check">SEO, mobile and a contact form built in</div>
    <div class="prog-check">Edit any word in the live preview</div>
    <div class="prog-check">Export open HTML or publish to your domain</div>
    <div style="margin-top:26px">
      <p style="color:var(--muted)">Most ${i.name.toLowerCase()} sites take days. With bukkyai, describe your business and approve the plan — the site builds itself in minutes.</p>
    </div>`;
  writeFileSync(join(outDir, `industries-${i.slug}.html`), pageShell({ title: i.title, meta: i.meta, h1: i.h1, blurb: i.blurb, accent: i.accent, grad: i.grad, body, slug: i.slug, cat: "Industry" }));
  count++;
}

// Use cases → /use-cases/{slug}
for (const u of USE_CASES) {
  const body = `
    <div class="section-label" style="color:${u.accent}">Use case</div>
    <h2>A ${u.name.toLowerCase()} website, built for you.</h2>
    <p style="color:var(--muted);margin-bottom:22px">bukkyai is built around your goal: describe it, see a plan, approve, and get a finished ${u.name.toLowerCase()} site.</p>
    <div class="prog-check">Describe it in one sentence</div>
    <div class="prog-check">Approve the plan and structure</div>
    <div class="prog-check">Get real copy, design and pages</div>
    <div class="prog-check">Edit visually and publish</div>
    <div style="margin-top:26px">
      <p style="color:var(--muted)">Whether it's a ${u.name.toLowerCase()} page or a full multi-page site, you own the result — export it as HTML, a ZIP, or a React project.</p>
    </div>`;
  writeFileSync(join(outDir, `use-cases-${u.slug}.html`), pageShell({ title: u.title, meta: u.meta, h1: u.h1, blurb: u.blurb, accent: u.accent, grad: u.grad, body, slug: u.slug, cat: "Use case" }));
  count++;
}

// Comparisons → /compare/{slug}
for (const c of COMPARISONS) {
  const rows = c.points.map(([a, b]) => `<tr><td>${a}</td><td class="yes">${b}</td></tr>`).join("\n");
  const body = `
    <div class="section-label" style="color:var(--accent)">Comparison</div>
    <h2>${esc(c.h1)} — the honest version.</h2>
    <p style="color:var(--muted);margin-bottom:22px">${esc(c.meta)}</p>
    <div class="table-wrap" style="margin:0 0 24px">
      <table>
        <thead><tr><th>What matters</th><th>bukkyai</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <p style="color:var(--muted)">The simplest test is to try it: describe your site, approve the plan and see how fast a finished website appears.</p>`;
  writeFileSync(join(outDir, `compare-${c.slug}.html`), pageShell({ title: c.title, meta: c.meta, h1: c.h1, blurb: `An honest ${c.name} comparison.`, accent: "#6d5ae8", grad: "#a89bff,#6d5ae8", body, slug: c.slug, cat: "Comparison" }));
  count++;
}

// How-tos → /how-to/{slug}
for (const h of HOW_TOS) {
  const steps = h.steps.map(([t, d], i) => `<div class="step"><span class="num">${i + 1}</span><h3>${t}</h3><p>${d}</p></div>`).join("\n");
  const body = `
    <div class="section-label" style="color:var(--accent)">Guide</div>
    <h2>${esc(h.h1)}</h2>
    <p style="color:var(--muted);margin-bottom:26px">A practical, no-code path — the same one used to build every site on this page.</p>
    <div class="steps" style="grid-template-columns:1fr">${steps}</div>
    <div style="margin-top:26px">
      <p style="color:var(--muted)">With bukkyai, most of these steps are handled for you: describe, approve, edit, publish. Start free, no credit card.</p>
    </div>`;
  writeFileSync(join(outDir, `how-to-${h.slug}.html`), pageShell({ title: h.title, meta: h.meta, h1: h.h1, blurb: `Follow along — ${h.name.toLowerCase()}, in minutes.`, accent: "#2f6f63", grad: "#8aa29e,#3d5a52", body, slug: h.slug, cat: "Guide" }));
  count++;
}

console.log(`generated ${count} programmatic pages`);
