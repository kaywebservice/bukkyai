// Generates programmatic SEO pages into programmatic/*.html from prog-data.mjs.
// Run before vite build (part of `npm run build`).
import { writeFileSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { TEMPLATES, INDUSTRIES, USE_CASES, COMPARISONS, HOW_TOS, CITIES, LOCAL_INDUSTRIES } from "./prog-data.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "programmatic");
mkdirSync(outDir, { recursive: true });

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function pageShell({ title, meta, h1, blurb, accent, grad, body, slug, cat, related, howto, ld }) {
  const links = [
    '<a href="/features">Website builder</a>',
    '<a href="/tools">Free tools</a>',
    '<a href="/templates">Templates</a>',
    '<a href="/pricing">Pricing</a>',
    '<a href="/app">Open editor</a>',
    ...(related || []),
  ].join(" · ");
  const extraLd = ld
    ? `<script type="application/ld+json">${JSON.stringify(ld)}</script>`
    : "";
  const howtoLd = howto ? `
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": ${JSON.stringify(title)},
  "description": ${JSON.stringify(meta)},
  "step": ${JSON.stringify(howto.map(([t, d], i) => ({ "@type": "HowToStep", "position": i + 1, "name": t, "text": d })))}
}
</script>` : "";
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
<meta name="google-site-verification" content="vzREjfhomsn9KoFEywBS7ebsa7Wo-ttVmnc8jPh7l70" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/marketing.css" />${howtoLd}${extraLd}
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
      <p style="color:var(--muted)">The ${t.name} template is one of a dozen full, ready-made sites. Each has multiple pages, a bespoke design and blog posts — all editable, all yours.</p>
    </div>`;
  const related = [
    '<a href="/industries">Industry websites</a>',
    '<a href="/use-cases/small-business">Small business sites</a>',
  ];
  writeFileSync(join(outDir, `templates-${t.slug}.html`), pageShell({ title: t.title, meta: t.meta, h1: t.h1, blurb: t.blurb, accent: t.accent, grad: t.grad, body, slug: t.slug, cat: "Template", related }));
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
  writeFileSync(join(outDir, `industries-${i.slug}.html`), pageShell({ title: i.title, meta: i.meta, h1: i.h1, blurb: i.blurb, accent: i.accent, grad: i.grad, body, slug: i.slug, cat: "Industry", related: ['<a href="/templates">Templates</a>', '<a href="/local">Local websites</a>'] }));
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
  writeFileSync(join(outDir, `use-cases-${u.slug}.html`), pageShell({ title: u.title, meta: u.meta, h1: u.h1, blurb: u.blurb, accent: u.accent, grad: u.grad, body, slug: u.slug, cat: "Use case", related: ['<a href="/templates">Templates</a>', '<a href="/industries">Industry websites</a>'] }));
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
  writeFileSync(join(outDir, `compare-${c.slug}.html`), pageShell({ title: c.title, meta: c.meta, h1: c.h1, blurb: `An honest ${c.name} comparison.`, accent: "#6d5ae8", grad: "#a89bff,#6d5ae8", body, slug: c.slug, cat: "Comparison", related: ['<a href="/compare">All comparisons</a>', '<a href="/templates">Templates</a>'], ld: {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: `Is bukkyai better than ${c.name}?`, acceptedAnswer: { "@type": "Answer", text: `It depends what you need. bukkyai writes and designs your whole site from a sentence and exports open HTML; ${c.name} is strong when its specific strengths match your workflow. Try bukkyai free and compare.` } },
      { "@type": "Question", name: `Can I export my site if I use bukkyai?`, acceptedAnswer: { "@type": "Answer", text: "Yes. bukkyai exports open HTML, a ZIP, or a React project — you own every file and can host anywhere." } },
      { "@type": "Question", name: `How long does bukkyai take vs ${c.name}?`, acceptedAnswer: { "@type": "Answer", text: `Most bukkyai sites go from one-line brief to a written, designed draft in minutes, then you edit visually. With ${c.name}, expect to invest time learning the tool and writing content.` } },
    ],
  } }));
  count++;
}

// Comparison index page → /compare
const compareRows = COMPARISONS.map((c) =>
  `<a href="/compare/${c.slug}" class="compare-link">bukkyai vs ${c.name}</a>`
).join("");
const compareIndexBody = `
  <div class="section-label" style="color:var(--accent)">Comparison</div>
  <h2>bukkyai vs the other website builders.</h2>
  <p style="color:var(--muted);margin-bottom:26px">Honest, side-by-side comparisons — what each tool is best at, and where bukkyai fits. The simplest test is to try it.</p>
  <style>
    .compare-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:14px; }
    .compare-link { display:block; background:var(--panel); border:1px solid var(--border); border-radius:14px; padding:18px 20px; font-weight:700; color:var(--text); text-decoration:none; font-size:15px; transition:all .15s; }
    .compare-link:hover { border-color:var(--accent); color:var(--accent); transform:translateY(-2px); }
  </style>
  <div class="compare-grid">${compareRows}</div>
  <div style="margin-top:26px">
    <p style="color:var(--muted)">Don't compare — try it. Describe your business in bukkyai and watch the site build itself.</p>
  </div>`;
writeFileSync(join(outDir, "compare.html"), pageShell({ title: "bukkyai vs other website builders", meta: "Honest comparisons: bukkyai vs Wix, Squarespace, WordPress, Webflow, Framer, GoDaddy, Carrd, Lovable and more — what each is best at.", h1: "bukkyai vs other website builders", blurb: "Honest, side-by-side comparisons. Try the simplest test: describe your site and watch it build.", accent: "#6d5ae8", grad: "#a89bff,#6d5ae8", body: compareIndexBody, slug: "compare", cat: "Comparison", related: ['<a href="/templates">Templates</a>', '<a href="/industries">Industry websites</a>'] }));
count++;

// Hub index pages — link every programmatic page together (internal linking).
function hubIndex({ file, title, meta, h1, blurb, items, accent, grad, cat }) {
  const cards = items
    .map((it) => `<a class="hub-card" href="${it.href}"><b>${it.title}</b><span>${it.desc}</span></a>`)
    .join("\n");
  const body = `
    <style>
      .hub-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:14px; margin-top:8px; }
      .hub-card { display:block; background:var(--panel); border:1px solid var(--border); border-radius:14px; padding:18px 20px; text-decoration:none; transition:all .15s; }
      .hub-card:hover { border-color:var(--accent); transform:translateY(-2px); box-shadow:var(--shadow-md); }
      .hub-card b { color:var(--text); font-size:15px; display:block; margin-bottom:4px; }
      .hub-card span { color:var(--muted); font-size:13px; }
    </style>
    <div class="hub-grid">${cards}</div>
    <div style="margin-top:26px">
      <p style="color:var(--muted)">Don't see what you need? Describe your business in bukkyai — the site builds itself, whatever the industry.</p>
    </div>`;
  writeFileSync(join(outDir, file), pageShell({ title, meta, h1, blurb, accent, grad, body, slug: file.replace(/\.html$/, ""), cat, related: ['<a href="/templates">Templates</a>', '<a href="/compare">Comparisons</a>', '<a href="/local">Local</a>'] }));
  count++;
}

hubIndex({
  file: "templates-index.html",
  title: "All bukkyai templates",
  meta: "Every bukkyai template: bakery, restaurant, SaaS, portfolio, wellness, hotel, fitness, clinic and more — fully written and designed, ready to remix.",
  h1: "All bukkyai templates",
  blurb: "Every ready-made multi-page template. Open a live preview, remix it, make it yours.",
  accent: "#b3541e",
  grad: "#d9b98c,#b3541e",
  cat: "Templates",
  items: TEMPLATES.map((t) => ({ href: `/templates/${t.slug}`, title: `${t.name} template`, desc: t.blurb })),
});

hubIndex({
  file: "industries-index.html",
  title: "Industry website builders",
  meta: "Website builders for every industry: real estate, restaurants, salons, dentists, roofers, tutors, plumbers and more. Describe your business, get the site.",
  h1: "Industry website builders",
  blurb: "A website builder purpose-built for your industry — describe your business and get the whole site.",
  accent: "#4d6b45",
  grad: "#a8c3a0,#4d6b45",
  cat: "Industries",
  items: INDUSTRIES.map((i) => ({ href: `/industries/${i.slug}`, title: i.name, desc: i.blurb })),
});

hubIndex({
  file: "use-cases-index.html",
  title: "Website use cases",
  meta: "What can bukkyai build? Landing pages, online stores, blogs, portfolios, weddings, events, courses, membership sites and more.",
  h1: "Website use cases",
  blurb: "Whatever the goal — a store, a portfolio, a landing page — bukkyai builds it from a sentence.",
  accent: "#2f6f9f",
  grad: "#9ab8d9,#2f6f9f",
  cat: "Use cases",
  items: USE_CASES.map((u) => ({ href: `/use-cases/${u.slug}`, title: u.name, desc: u.blurb })),
});

hubIndex({
  file: "how-to-index.html",
  title: "Website how-to guides",
  meta: "Practical, no-code guides: how to make a website, a restaurant website, a portfolio and more — the same path bukkyai automates for you.",
  h1: "How to build a website",
  blurb: "Step-by-step guides, with the bukkyai shortcut at every step.",
  accent: "#2f6f63",
  grad: "#8aa29e,#3d5a52",
  cat: "Guides",
  items: HOW_TOS.map((h) => ({ href: `/how-to/${h.slug}`, title: h.name, desc: h.meta })),
});

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
  writeFileSync(join(outDir, `how-to-${h.slug}.html`), pageShell({ title: h.title, meta: h.meta, h1: h.h1, blurb: `Follow along — ${h.name.toLowerCase()}, in minutes.`, accent: "#2f6f63", grad: "#8aa29e,#3d5a52", body, slug: h.slug, cat: "Guide", howto: h.steps }));
  count++;
}

// Local pages → /local/{city}/{industry} (city × industry programmatic local SEO)
for (const city of CITIES) {
  for (const [slug, name] of LOCAL_INDUSTRIES) {
    const citySlug = city.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const nameL = name.toLowerCase();
    const body = `
      <div class="section-label" style="color:var(--accent)">${esc(city)} · ${esc(name)}</div>
      <h2>${esc(name)} websites in ${esc(city)}.</h2>
      <p style="color:var(--muted);margin-bottom:22px">You run a ${nameL} in ${esc(city)}. bukkyai builds you a full website — written, designed and ready to bring in local customers.</p>
      <div class="prog-check">A complete multi-page site, built from a sentence</div>
      <div class="prog-check">Copy written for a ${nameL} in ${esc(city)}</div>
      <div class="prog-check">Menu/services, hours, map and contact</div>
      <div class="prog-check">Local SEO, mobile and a booking/contact form</div>
      <div class="prog-check">Edit in the preview, publish to your own domain</div>
      <div style="margin-top:26px">
        <p style="color:var(--muted)">Most ${nameL} sites in ${esc(city)} take weeks and cost thousands. With bukkyai, describe your business and approve the plan — your site builds itself in minutes, and you own every file.</p>
      </div>`;
    const related = [
      `<a href="/industries/${slug}">${name} websites</a>`,
      '<a href="/templates">Templates</a>',
    ];
    writeFileSync(
      join(outDir, `local-${citySlug}-${slug}.html`),
      pageShell({
        title: `${name} Website Builder in ${city}`,
        meta: `Build a ${nameL} website in ${city} — written, designed and ready in minutes with bukkyai. Local SEO, booking and a contact form included.`,
        h1: `${name} Website Builder in ${city}`,
        blurb: `A ${nameL} website for ${esc(city)} — built, written and designed from one sentence about your business.`,
        accent: "#8a6d3b",
        grad: "#c9b99a,#8a6d3b",
        body,
        slug: `${citySlug}-${slug}`,
        cat: `${city} · ${name}`,
        related,
        ld: {
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          name: `${name} Website Builder in ${city}`,
          description: `Build a ${nameL} website in ${city} with bukkyai — written, designed and ready in minutes.`,
          areaServed: { "@type": "City", name: city },
          url: `https://bukkyai.duckdns.org/local/${citySlug}/${slug}`,
          provider: { "@type": "Organization", name: "bukkyai", url: "https://bukkyai.duckdns.org/" },
        },
      })
    );
    count++;
  }
}

// Local index page → /local
const localRows = CITIES.map((city) => {
  const citySlug = city.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const links = LOCAL_INDUSTRIES.map(([slug, name]) => `<a href="/local/${citySlug}/${slug}" style="color:var(--accent)">${name}</a>`).join(" · ");
  return `<div style="padding:8px 0;border-bottom:1px solid var(--border)"><b>${city}</b><div style="color:var(--muted);font-size:13px;margin-top:4px">${links}</div></div>`;
}).join("\n");
const localIndexBody = `
  <div class="section-label" style="color:var(--accent)">Local</div>
  <h2>Local website builders, city by city.</h2>
  <p style="color:var(--muted);margin-bottom:26px">A local business website for your city — built, written and designed in minutes, and you own every file.</p>
  ${localRows}
  <div style="margin-top:26px">
    <p style="color:var(--muted)">Don't see your city? Describe your business in bukkyai — the result is your site, regardless of location.</p>
  </div>`;
writeFileSync(join(outDir, "local.html"), pageShell({ title: "Local Website Builders", meta: "Build a local business website for your city with bukkyai — bakery, salon, plumber, photographer and more, written and designed in minutes.", h1: "Local Website Builders", blurb: "A local business website for any city, built from one sentence.", accent: "#8a6d3b", grad: "#c9b99a,#8a6d3b", body: localIndexBody, slug: "local", cat: "Local", related: ['<a href="/industries">Industry websites</a>', '<a href="/templates">Templates</a>'] }));
count++;

console.log(`generated ${count} programmatic pages`);
