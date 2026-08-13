import type { Page, Section, SiteBlueprint } from "./types";
import { svgIcon } from "./icons";
import { renderCss } from "./renderCss";
import { googleFontsLink } from "./fontPairs";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function attrSafe(href: string): string {
  const h = href && typeof href === "string" ? href.trim() : "";
  if (/^javascript:/i.test(h)) return "#";
  return esc(h);
}

function sectionId(page: Page, sec: Section): string {
  const count = page.sections.filter((s) => s.type === sec.type).length;
  return count === 1 ? sec.type : sec.id;
}

function te(path: string, text: string, tag = "span", cls = ""): string {
  const c = cls ? ` class="${cls}"` : "";
  const t = esc(text ?? "");
  return `<${tag} data-field="${path}" data-text="${t}"${c}>${t}</${tag}>`;
}

function dataAttrsStr(pi: number, si: number) {
  return `data-page="${pi}" data-secidx="${si}"`;
}
const root = (pi: number, si: number) => `pages[${pi}].sections[${si}].content`;

function analyticsSnippet(doc: SiteBlueprint): string {
  const a = doc.analytics;
  if (!a) return "";
  const parts: string[] = [];
  if (a.plausible) parts.push(`<script defer data-domain="${attrSafe(a.plausible)}" src="https://plausible.io/js/script.js"></script>`);
  if (a.goatcounter) parts.push(`<script data-goatcounter="//${attrSafe(a.goatcounter)}.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>`);
  return parts.join("\n");
}

export function faviconDataUrl(doc: SiteBlueprint): string {
  const c = doc.design.tokens.colors;
  const bg = c.primary.replace(/^#/, "");
  const fg = c.accent.replace(/^#/, "");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#${bg}"/><circle cx="20" cy="20" r="10" fill="#${fg}"/><circle cx="44" cy="44" r="10" fill="#${fg}" opacity="0.75"/><circle cx="44" cy="20" r="5" fill="#${fg}" opacity="0.5"/><circle cx="20" cy="44" r="5" fill="#${fg}" opacity="0.5"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function buildJsonLd(doc: SiteBlueprint, page: Page): unknown {
  const base = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.title || doc.meta.title,
    description: page.description || doc.meta.description,
  };
  const faqSec = page.sections.find((s) => s.type === "faq");
  const faqItems = (faqSec?.content as { items?: { q: string; a: string }[] } | undefined)?.items;
  if (faqItems && faqItems.length > 0) {
    return {
      "@context": "https://schema.org",
      "@graph": [
        base,
        {
          "@type": "FAQPage",
          mainEntity: faqItems.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        },
      ],
    };
  }
  return base;
}

export function renderPage(
  doc: SiteBlueprint,
  page: Page,
  editingMode: boolean,
  previewSlugs?: string[]
): string {
  const pi = doc.pages.indexOf(page);
  const sections = page.sections.map((s, i) => renderSection(doc, page, s, i, pi));
  const embedsHead = (doc.embeds?.head ?? []).join("\n");
  const embedsBody = (doc.embeds?.body ?? []).join("\n");
  const analyticsHead = analyticsSnippet(doc);
  const ogImage = doc.meta.ogImage
    ? `<meta property="og:image" content="${attrSafe(doc.meta.ogImage)}"/>\n<meta name="twitter:card" content="summary_large_image"/>`
    : "";
  const jsonLd = buildJsonLd(doc, page);
  let html = `
<!doctype html>
<html lang="${esc(doc.meta.lang)}">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${esc(page.title ? `${page.title} — ${doc.meta.title}` : doc.meta.title)}</title>
<meta name="description" content="${esc(page.description || doc.meta.description)}"/>
<meta property="og:title" content="${esc(page.title)}"/>
<meta property="og:description" content="${esc(page.description || doc.meta.description)}"/>
<meta property="og:type" content="website"/>
<link rel="icon" href="${faviconDataUrl(doc)}"/>
${ogImage}
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="${googleFontsLink(doc.design.tokens.fonts.heading, doc.design.tokens.fonts.body)}" rel="stylesheet"/>
<style>${renderCss(doc)}</style>
<script type="application/ld+json">
${JSON.stringify(jsonLd)}
</script>
${analyticsHead}
${embedsHead}
</head>
<body${editingMode ? ' class="bk-editing"' : ""}>
<a href="#main" style="position:absolute;left:-9999px">Skip to content</a>
${renderNav(doc, previewSlugs)}
<main id="main">
${sections.join("\n")}
</main>
<script>
window.__BKKY__ = ${JSON.stringify({
    posts: doc.posts ?? [],
    password: doc.password || "",
    stripeLink: doc.stripePaymentLink || (import.meta.env.VITE_DEFAULT_PAYMENT_LINK as string | undefined) || "",
    formEndpoint: doc.forms?.endpoint || "",
    currency: (doc.pages.flatMap((p) => p.sections).find((s) => s.type === "products")?.content as { currency?: string } | undefined)?.currency || "$",
    translations: doc.languages?.translations || {},
    supported: doc.languages?.supported ?? [],
    defaultLang: doc.languages?.default ?? doc.meta.lang,
  })};
</script>
<script>
document.querySelectorAll(".bk-form form").forEach(function(f){
  f.addEventListener("submit", function(e){
    var act = f.getAttribute("action");
    if(act && !act.startsWith("#") && f.querySelector('input[name="_subject"]')){
      return;
    }
    e.preventDefault();
    var s = f.querySelector(".bk-form-success");
    if (!s) return;
    var ep = cfg.formEndpoint;
    if (!ep) {
      s.textContent = "Thanks! (Demo mode — the site owner hasn\u2019t connected a form service yet.)";
      f.reset();
      return;
    }
    var payload = new URLSearchParams(new FormData(f));
    payload.set("_subject", document.title + " — " + (f.getAttribute("data-form-label") || "form"));
    s.textContent = "Sending\u2026";
    fetch(ep, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body: payload.toString()
    }).then(function (r) {
      if (r.ok) { s.textContent = "Thanks! Your message has been sent."; f.reset(); }
      else throw new Error("status " + r.status);
    }).catch(function () {
      s.textContent = "Sorry, sending failed. Please try again or email us directly.";
    });
  });
});
document.querySelectorAll(".bk-newsletter form").forEach(function(f){
  f.addEventListener("submit", function(e){
    e.preventDefault();
    var s = f.querySelector(".bk-form-success");
    if (!s) return;
    var ep = cfg.formEndpoint;
    if (!ep) {
      s.textContent = "You're on the list — check your inbox. (Demo mode — no form service connected yet.)";
      f.reset();
      return;
    }
    var payload = new URLSearchParams(new FormData(f));
    payload.set("_subject", document.title + " — newsletter signup");
    s.textContent = "Sending\u2026";
    fetch(ep, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body: payload.toString()
    }).then(function (r) {
      if (r.ok) { s.textContent = "You're on the list — check your inbox."; f.reset(); }
      else throw new Error("status " + r.status);
    }).catch(function () {
      s.textContent = "Sorry, signup failed. Please try again.";
    });
  });
});
document.addEventListener("click", function(e){
  var a = e.target && e.target.closest ? e.target.closest('a[href^="#bkpage:"]') : null;
  if(a){ e.preventDefault(); window.parent.postMessage({type:"bk-nav", slug: a.getAttribute("href").slice(8)}, "*"); }
});
${SITE_FEATURES_SCRIPT}
</script>
${embedsBody}
</body>
</html>`;

  if (previewSlugs) html = rewriteInternalLinks(html, doc, previewSlugs);
  return html;
}

export function renderStaticSite(doc: SiteBlueprint): { files: { path: string; content: string }[] } {
  const pages = doc.pages.length ? doc.pages : [emptyHomePage(doc)];
  const files: { path: string; content: string }[] = [];
  const slugs = pages.map((p) => p.slug);

  for (const page of pages) {
    const html = renderPage(doc, page, false, slugs);
    const path = page.slug ? `${page.slug}.html` : "index.html";
    files.push({ path, content: html });
  }

  files.push({ path: "robots.txt", content: `User-agent: *\nAllow: /\nSitemap: /sitemap.xml\n` });
  files.push({
    path: "sitemap.xml",
    content: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>https://example.com${p.slug ? `/${p.slug}.html` : "/"}</loc><priority>${p.slug ? "0.8" : "1.0"}</priority></url>`).join("\n")}
</urlset>`,
  });
  return { files };
}

function emptyHomePage(doc: SiteBlueprint): Page {
  return { id: "pg_home", slug: "", title: doc.meta.title, description: doc.meta.description, sections: [] };
}

function rewriteInternalLinks(html: string, doc: SiteBlueprint, _slugs: string[]): string {
  let out = html;
  for (const page of doc.pages) {
    const slug = page.slug;
    if (!slug) continue;
    out = out.split(`href="/${slug}.html"`).join(`href="#bkpage:${slug}"`);
    out = out.split(`href="/${slug}"`).join(`href="#bkpage:${slug}"`);
    out = out.split(`href="#/${slug}"`).join(`href="#bkpage:${slug}"`);
  }
  return out;
}

function renderNav(doc: SiteBlueprint, previewSlugs?: string[]): string {
  const brand = esc(doc.meta.title);
  const slugify = (href: string): string => {
    if (!previewSlugs) return href;
    for (const s of doc.pages) {
      if (s.slug && (href === `/${s.slug}` || href === `/${s.slug}.html`)) return `#bkpage:${s.slug}`;
    }
    return href;
  };
  const links = doc.nav.links
    .map((l) => `<a href="${attrSafe(slugify(l.href))}">${esc(l.label)}</a>`)
    .join("");
  const cta = doc.nav.cta
    ? `<a class="bk-btn bk-btn-accent bk-nav-cta" href="${attrSafe(slugify(doc.nav.cta.href))}">${esc(doc.nav.cta.label)}</a>`
    : "";
  const brandHref = previewSlugs ? "#bkpage:" : "/";
  const hasProducts = doc.pages.some((p) => p.sections.some((s) => s.type === "products"));
  const langs = doc.languages?.supported ?? [];
  const langSwitch = langs.length > 1
    ? `<select id="bk-lang-switch" class="bk-lang-switch" aria-label="Language">${langs
        .map((c) => `<option value="${esc(c)}"${c === (doc.languages?.default ?? doc.meta.lang) ? " selected" : ""}>${esc(c.toUpperCase())}</option>`)
        .join("")}</select>`
    : "";
  const cartBtn = hasProducts
    ? `<button id="bk-cart-toggle" class="bk-cart-toggle" aria-label="Cart">${svgIcon("shopping-cart", 18)}<span id="bk-cart-count" class="bk-cart-count">0</span></button>`
    : "";
  return `
<header class="bk-nav">
  <div class="bk-nav-inner">
    <a class="bk-nav-brand" href="${brandHref}">${brand}</a>
    ${links || cta ? `<nav class="bk-nav-links" aria-label="Primary">${links}${cta}</nav>` : ""}
    <div class="bk-nav-extra">${langSwitch}${cartBtn}</div>
  </div>
</header>
${hasProducts ? `<div id="bk-cart-drawer" class="bk-cart-drawer"><div class="bk-cart-drawer-inner"><div class="bk-cart-drawer-head"><b>Your cart</b><button id="bk-cart-close" aria-label="Close">x</button></div><div id="bk-cart-items" class="bk-cart-items"></div></div></div>` : ""}`;
}

function artBlock(url: string | undefined, alt: string, path = ""): string {
  if (url) {
    return `<div class="bk-art"><img class="bk-art-img" src="${attrSafe(url)}" alt="${esc(alt)}" loading="lazy"${path ? ` data-bkimg="${path}"` : ""}/></div>`;
  }
  return `<div class="bk-art" aria-label="${esc(alt)}"></div>`;
}

function renderSection(
  doc: SiteBlueprint,
  page: Page,
  sec: Section,
  i: number,
  pi: number
): string {
  const si = i;
  const r = root(pi, si);
  const c = sec.content as Record<string, unknown>;
  const d = dataAttrsStr(pi, si);
  const id = ` id="${sectionId(page, sec)}"`;
  const motionCls = sec.motion && sec.motion !== "none" ? ` bk-motion-${sec.motion}` : "";
  const wrap = (inner: string, extraCls = "") =>
    `<section class="bk-section ${extraCls}${motionCls}"${id} ${d} data-type="${sec.type}">${inner}</section>`;

  switch (sec.type) {
    case "hero": {
      const h = c as typeof c & {
        layout?: string; eyebrow?: string; title?: string; subtitle?: string;
        primaryCta?: { label: string; href: string }; secondaryCta?: { label: string; href: string };
        image?: { url: string; alt: string }; trust?: string;
      };
      const split = h.layout === "split";
      const ctas = `
<div class="bk-btn-row"${d}>
  ${h.primaryCta?.label ? `<a class="bk-btn bk-btn-primary" href="${attrSafe(h.primaryCta.href)}">${te(`${r}.primaryCta.label`, h.primaryCta.label, "span")}</a>` : ""}
  ${h.secondaryCta?.label ? `<a class="bk-btn bk-btn-ghost" href="${attrSafe(h.secondaryCta.href)}">${te(`${r}.secondaryCta.label`, h.secondaryCta.label, "span")}</a>` : ""}
</div>`;
      return wrap(
        `<div class="bk-hero ${split ? "bk-hero-split" : "bk-hero-centered"}" ${d}>
  <div class="bk-hero-glow"></div>
  <div class="bk-container bk-hero-inner">
    <div class="bk-hero-copy">
      ${h.eyebrow ? te(`${r}.eyebrow`, h.eyebrow, "span", "bk-eyebrow") : ""}
      <h1 class="bk-hero-title">${te(`${r}.title`, h.title ?? "", "span")}</h1>
      ${h.subtitle ? `<p class="bk-hero-sub">${te(`${r}.subtitle`, h.subtitle, "span")}</p>` : ""}
      ${ctas}
      ${h.trust ? `<p class="bk-hero-trust">${te(`${r}.trust`, h.trust, "span")}</p>` : ""}
    </div>
    <div class="bk-hero-art">${split ? artBlock(h.image?.url, h.image?.alt ?? "", `${r}.image.url`) : ""}</div>
  </div>
</div>`
      );
    }

    case "logos": {
      const h = c as typeof c & { heading?: string; items?: string[] };
      const items = (h.items ?? []).map((n, idx) => `<span class="bk-logo" data-field="${r}.items[${idx}]">${te("", n, "span")}</span>`).join("");
      return wrap(
        `<div class="bk-container" ${d}>
  ${h.heading ? `<p class="bk-center bk-eyebrow">${te(`${r}.heading`, h.heading, "span")}</p>` : ""}
  <div class="bk-logo-row">${items}</div>
</div>`
      );
    }

    case "features": {
      const h = c as typeof c & {
        heading?: string; subheading?: string; items?: { icon: string; title: string; desc: string }[];
      };
      const cards = (h.items ?? []).map(
        (f, idx) => `
  <div class="bk-feature" ${d}>
    <div class="bk-feature-icon">${svgIcon(f.icon || "sparkles", 22)}</div>
    <h3 class="bk-h3">${te(`${r}.items[${idx}].title`, f.title ?? "", "span")}</h3>
    <p>${te(`${r}.items[${idx}].desc`, f.desc ?? "", "span")}</p>
  </div>`
      ).join("");
      return wrap(
        `<div class="bk-container"${d}>
  <div class="bk-section-head">
    <h2 class="bk-h2">${te(`${r}.heading`, h.heading ?? "", "span")}</h2>
    ${h.subheading ? te(`${r}.subheading`, h.subheading, "p", "bk-lede") : ""}
  </div>
  <div class="bk-grid bk-grid-features">${cards}
  </div>
</div>`,
        "bk-section-alt"
      );
    }

    case "stats": {
      const h = c as typeof c & { heading?: string; items?: { value: string; label: string }[] };
      const stats = (h.items ?? []).map(
        (s, idx) => `
  <div class="bk-stat"${d}>
    <div class="bk-stat-value">${te(`${r}.items[${idx}].value`, s.value ?? "", "span")}</div>
    <div class="bk-stat-label">${te(`${r}.items[${idx}].label`, s.label ?? "", "span")}</div>
  </div>`
      ).join("");
      return wrap(
        `<div class="bk-container"${d}>
  ${h.heading ? `<div class="bk-section-head"><h2 class="bk-h2">${te(`${r}.heading`, h.heading, "span")}</h2></div>` : ""}
  <div class="bk-grid bk-grid-stats">${stats}
  </div>
</div>`
      );
    }

    case "testimonials": {
      const h = c as typeof c & {
        heading?: string; subheading?: string; items?: { quote: string; name: string; role: string }[];
      };
      const cards = (h.items ?? []).map(
        (t, idx) => `
  <div class="bk-card bk-quote-card"${d}>
    <span class="bk-quote-mark">&ldquo;</span>
    <p class="bk-quote">${te(`${r}.items[${idx}].quote`, t.quote ?? "", "span")}</p>
    <div class="bk-quote-who">
      <div class="bk-quote-name">${te(`${r}.items[${idx}].name`, t.name ?? "", "span")}</div>
      <div class="bk-quote-role">${te(`${r}.items[${idx}].role`, t.role ?? "", "span")}</div>
    </div>
  </div>`
      ).join("");
      return wrap(
        `<div class="bk-container"${d}>
  <div class="bk-section-head">
    <h2 class="bk-h2">${te(`${r}.heading`, h.heading ?? "", "span")}</h2>
    ${h.subheading ? te(`${r}.subheading`, h.subheading, "p", "bk-lede") : ""}
  </div>
  <div class="bk-grid bk-grid-3">${cards}
  </div>
</div>`,
        "bk-section-alt"
      );
    }

    case "team": {
      const h = c as typeof c & {
        heading?: string; subheading?: string; items?: { name: string; role: string; bio: string; photo?: string }[];
      };
      const cards = (h.items ?? []).map(
        (m, idx) => `
  <div class="bk-team-card"${d}>
    ${m.photo ? `<div class="bk-team-photo"${d}><img src="${attrSafe(m.photo)}" alt="${esc(m.name)}" loading="lazy" data-bkimg="${r}.items[${idx}].photo"/></div>` : `<div class="bk-team-avatar"${d}>${esc((m.name || "?").trim()[0] ?? "?")}</div>`}
    <h3 class="bk-h3">${te(`${r}.items[${idx}].name`, m.name ?? "", "span")}</h3>
    <div class="bk-team-role">${te(`${r}.items[${idx}].role`, m.role ?? "", "span")}</div>
    <p class="bk-team-bio">${te(`${r}.items[${idx}].bio`, m.bio ?? "", "span")}</p>
  </div>`
      ).join("");
      return wrap(
        `<div class="bk-container"${d}>
  <div class="bk-section-head">
    <h2 class="bk-h2">${te(`${r}.heading`, h.heading ?? "", "span")}</h2>
    ${h.subheading ? te(`${r}.subheading`, h.subheading, "p", "bk-lede") : ""}
  </div>
  <div class="bk-grid" style="grid-template-columns:repeat(auto-fill,minmax(220px,1fr))">${cards}
  </div>
</div>`,
        "bk-section-alt"
      );
    }

    case "timeline": {
      const h = c as typeof c & {
        heading?: string; subheading?: string; items?: { period: string; title: string; desc: string }[];
      };
      const items = (h.items ?? []).map(
        (t, idx) => `
  <li class="bk-timeline-item"${d}>
    <span class="bk-timeline-dot"></span>
    <div class="bk-timeline-body">
      <div class="bk-timeline-period">${te(`${r}.items[${idx}].period`, t.period ?? "", "span")}</div>
      <h3 class="bk-h3">${te(`${r}.items[${idx}].title`, t.title ?? "", "span")}</h3>
      <p>${te(`${r}.items[${idx}].desc`, t.desc ?? "", "span")}</p>
    </div>
  </li>`
      ).join("");
      return wrap(
        `<div class="bk-container"${d}>
  <div class="bk-section-head">
    <h2 class="bk-h2">${te(`${r}.heading`, h.heading ?? "", "span")}</h2>
    ${h.subheading ? te(`${r}.subheading`, h.subheading, "p", "bk-lede") : ""}
  </div>
  <ul class="bk-timeline">${items}
  </ul>
</div>`
      );
    }

    case "comparison": {
      const h = c as typeof c & {
        heading?: string; subheading?: string;
        columns?: { name: string }[]; rows?: { label: string; values: (string | boolean)[] }[];
      };
      const cols = h.columns ?? [];
      const rows = h.rows ?? [];
      const cell = (v: string | boolean): string => {
        if (v === true) return `<span class="bk-cmp-yes" title="Included">${svgIcon("check", 16)}</span>`;
        if (v === false) return `<span class="bk-cmp-no">—</span>`;
        return `<span>${esc(v)}</span>`;
      };
      const head = `<tr ${d}><th class="bk-cmp-corner">${te(`${r}.heading`, h.heading ?? "", "span")}</th>${cols
        .map((col, ci) => `<th>${te(`${r}.columns[${ci}].name`, col.name ?? "", "span")}</th>`)
        .join("")}</tr>`;
      const body = rows
        .map(
          (row, ri) => `
  <tr${ri % 2 === 1 ? ' class="bk-cmp-stripe"' : ""}${d}>
    <th scope="row">${te(`${r}.rows[${ri}].label`, row.label ?? "", "span")}</th>
    ${(row.values ?? []).map((v, ci) =>`<td>${typeof v === "string" ? te(`${r}.rows[${ri}].values[${ci}]`, v, "span") : cell(v)}</td>`).join("")}
  </tr>`
        )
        .join("");
      return wrap(
        `<div class="bk-container"${d}>
  <div class="bk-section-head">
    <h2 class="bk-h2">${te(`${r}.heading`, h.heading ?? "", "span")}</h2>
    ${h.subheading ? te(`${r}.subheading`, h.subheading, "p", "bk-lede") : ""}
  </div>
  <div class="bk-cmp-wrap">
    <table class="bk-cmp">${head}${body}
    </table>
  </div>
</div>`,
        "bk-section-alt"
      );
    }

    case "newsletter": {
      const h = c as typeof c & {
        heading?: string; subheading?: string; placeholder?: string; button?: string; note?: string;
      };
      return wrap(
        `<div class="bk-container"${d}>
  <div class="bk-newsletter">
    <div class="bk-newsletter-inner">
      <h2 class="bk-h2">${te(`${r}.heading`, h.heading ?? "", "span")}</h2>
      ${h.subheading ? `<p class="bk-lede">${te(`${r}.subheading`, h.subheading, "span")}</p>` : ""}
      <form class="bk-newsletter-form">
        <div class="bk-newsletter-row">
          <input type="email" placeholder="${esc(h.placeholder ?? "you@email.com")}" aria-label="Email" required/>
          <button class="bk-btn bk-btn-accent" type="submit">${te(`${r}.button`, h.button ?? "Subscribe", "span")}</button>
        </div>
        <div class="bk-form-success" aria-live="polite"></div>
        ${h.note ? `<div class="bk-newsletter-note">${te(`${r}.note`, h.note, "span")}</div>` : ""}
      </form>
    </div>
  </div>
</div>`,
        "bk-section-alt"
      );
    }

    case "pricing": {
      const h = c as typeof c & {
        heading?: string; subheading?: string; currency?: string; period?: string;
        items?: { name: string; price: string; description: string; features: string[]; cta: { label: string; href: string }; featured: boolean }[];
      };
      const cards = (h.items ?? []).map(
        (p, idx) => `
  <div class="bk-price${p.featured ? " bk-price-featured" : ""}"${d}>
    <div class="bk-price-name">${te(`${r}.items[${idx}].name`, p.name ?? "", "span")}</div>
    <div class="bk-price-amount"><span class="bk-price-num">${te("", h.currency ?? "$", "span")}${te(`${r}.items[${idx}].price`, p.price ?? "", "span")}</span><span>${te(`${r}.period`, h.period ?? "", "span")}</span></div>
    <p class="bk-price-desc">${te(`${r}.items[${idx}].description`, p.description ?? "", "span")}</p>
    <ul class="bk-price-feat">${(p.features ?? []).map((f) => `<li>${svgIcon("check", 16)}<span>${te(`${r}.items[${idx}].features[]`, f ?? "", "span")}</span></li>`).join("")}</ul>
    <a class="bk-btn ${p.featured ? "bk-btn-accent" : "bk-btn-primary"}" href="${attrSafe(p.cta.href)}">${te(`${r}.items[${idx}].cta.label`, p.cta.label ?? "Choose", "span")}</a>
  </div>`
      ).join("");
      return wrap(
        `<div class="bk-container"${d}>
  <div class="bk-section-head">
    <h2 class="bk-h2">${te(`${r}.heading`, h.heading ?? "", "span")}</h2>
    ${h.subheading ? te(`${r}.subheading`, h.subheading, "p", "bk-lede") : ""}
  </div>
  <div class="bk-grid bk-grid-3">${cards}
  </div>
</div>`
      );
    }

    case "faq": {
      const h = c as typeof c & { heading?: string; items?: { q: string; a: string }[] };
      const items = (h.items ?? []).map(
        (f, i) => `
  <details class="bk-faq-item"${d}${i === 0 ? " open" : ""}>
    <summary>${te(`${r}.items[${i}].q`, f.q ?? "", "span")} <span class="bk-faq-mark">+</span></summary>
    <div class="bk-faq-body">${te(`${r}.items[${i}].a`, f.a ?? "", "span")}</div>
  </details>`
      ).join("");
      return wrap(
        `<div class="bk-container"${d}>
  <div class="bk-section-head"><h2 class="bk-h2">${te(`${r}.heading`, h.heading ?? "FAQ", "span")}</h2></div>
  <div class="bk-faq">${items}</div>
</div>`,
        "bk-section-alt"
      );
    }

    case "cta": {
      const h = c as typeof c & { title?: string; subtitle?: string; button?: { label: string; href: string }; note?: string };
      return wrap(
        `<div class="bk-container"${d}>
  <div class="bk-cta">
    <div class="bk-cta-inner">
      <h2>${te(`${r}.title`, h.title ?? "", "span")}</h2>
      ${h.subtitle ? `<p>${te(`${r}.subtitle`, h.subtitle, "span")}</p>` : ""}
      ${h.button?.label ? `<a class="bk-btn bk-btn-accent" href="${attrSafe(h.button.href)}">${te(`${r}.button.label`, h.button.label, "span")}</a>` : ""}
      ${h.note ? `<div class="bk-cta-note">${te(`${r}.note`, h.note, "span")}</div>` : ""}
    </div>
  </div>
</div>`
      );
    }

    case "contact": {
      const h = c as typeof c & {
        heading?: string; subheading?: string; email?: string; phone?: string; address?: string;
        form?: { fields: { label: string; type: string; required: boolean }[] }; submitLabel?: string;
      };
      const fields = (h.form?.fields ?? []).map(
        (f, idx) => `
  <div class="bk-field"${d}>
    <label for="bk-f-${idx}">${te(`${r}.form.fields[${idx}].label`, f.label ?? "", "span")}</label>
    ${f.type === "textarea"
      ? `<textarea id="bk-f-${idx}" rows="4" ${f.required ? "required" : ""} placeholder=" "></textarea>`
      : `<input id="bk-f-${idx}" type="${esc(f.type)}" ${f.required ? "required" : ""}/>`}
  </div>`
      ).join("");
      const info = [
        h.email ? { icon: "mail", label: "Email", value: `<a href="mailto:${attrSafe(h.email)}">${te(`${r}.email`, h.email, "span")}</a>` } : null,
        h.phone ? { icon: "phone", label: "Phone", value: te(`${r}.phone`, h.phone, "span") } : null,
        h.address ? { icon: "pin", label: "Address", value: te(`${r}.address`, h.address, "span") } : null,
      ].filter(Boolean);
      return wrap(
        `<div class="bk-container"${d}>
  <div class="bk-section-head">
    <h2 class="bk-h2">${te(`${r}.heading`, h.heading ?? "Contact", "span")}</h2>
    ${h.subheading ? te(`${r}.subheading`, h.subheading, "p", "bk-lede") : ""}
  </div>
  <div class="bk-contact-grid">
    <div class="bk-contact-info">
      ${info
        .map(
          (i) => `
      <div class="bk-contact-line"${d}>
        <div class="bk-contact-icon">${svgIcon((i as { icon: string }).icon, 19)}</div>
        <div><b>${te("", (i as { label: string }).label, "span")}</b><span>${(i as { value: string }).value}</span></div>
      </div>`
        )
        .join("")}
    </div>
    <form class="bk-form"${d}${doc.forms?.endpoint ? ` action="${attrSafe(doc.forms.endpoint)}" method="POST"` : ""}>
      <input type="hidden" name="_subject" value="${esc(doc.meta.title)} contact form"/>
      ${fields}
      <div class="bk-form-success" aria-live="polite"></div>
      <button class="bk-btn bk-btn-primary" type="submit">${te(`${r}.submitLabel`, h.submitLabel ?? "Send message", "span")}</button>
    </form>
  </div>
</div>`,
        "bk-section-alt"
      );
    }

    case "gallery": {
      const h = c as typeof c & { heading?: string; items?: { url: string; alt: string; caption: string }[] };
      const items = (h.items ?? []).map((g, idx) => {
        const body = g.url
          ? `<img class="bk-gallery-img" src="${attrSafe(g.url)}" alt="${esc(g.alt)}" loading="lazy" data-bkimg="${r}.items[${idx}].url"/>`
          : `<div class="bk-gallery-art"${d}>${te(`${r}.items[${idx}].caption`, g.caption ?? "", "div", "bk-gallery-caption")}</div>`;
        return `
  <div class="bk-gallery-item"${d}>${body}</div>`;
      }).join("");
      return wrap(
        `<div class="bk-container"${d}>
  <div class="bk-section-head"><h2 class="bk-h2">${te(`${r}.heading`, h.heading ?? "", "span")}</h2></div>
  <div class="bk-grid" style="grid-template-columns:repeat(auto-fill,minmax(220px,1fr))">${items}
  </div>
</div>`
      );
    }

    case "video": {
      const h = c as typeof c & { heading?: string; url?: string; caption?: string };
      const url = h.url ?? "";
      let embed = "";
      const m1 = url.match(/youtube\.com\/watch\?v=([\w-]+)/) || url.match(/youtu\.be\/([\w-]+)/);
      const m2 = url.match(/vimeo\.com\/(\d+)/);
      if (m1) embed = `https://www.youtube.com/embed/${m1[1]}`;
      else if (m2) embed = `https://player.vimeo.com/video/${m2[1]}`;
      else if (url.includes("/embed/")) embed = url;
      return wrap(
        `<div class="bk-container"${d}>
  <div class="bk-section-head">
    <h2 class="bk-h2">${te(`${r}.heading`, h.heading ?? "", "span")}</h2>
  </div>
  ${embed ? `<div class="bk-video"><iframe src="${attrSafe(embed)}" title="${esc(h.heading ?? "Video")}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>` : `<div class="bk-video bk-video-empty">${svgIcon("camera", 34)}</div>`}
  ${h.caption ? `<p class="bk-video-caption"${d}>${te(`${r}.caption`, h.caption, "span")}</p>` : ""}
</div>`
      );
    }

    case "map": {
      const h = c as typeof c & { heading?: string; address?: string; embedUrl?: string };
      const addr = h.address ?? "";
      const mapsLink = addr ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}` : "#contact";
      const embedSrc = h.embedUrl || (addr ? `https://www.openstreetmap.org/export/embed.html?bbox=-122.46,37.74,-122.40,37.80&q=${encodeURIComponent(addr)}&layer=R` : "");
      const frame = embedSrc
        ? `<iframe class="bk-map-frame" src="${attrSafe(embedSrc)}" title="${esc(h.heading ?? "Map")}" loading="lazy"></iframe>`
        : `<div class="bk-map-placeholder">${svgIcon("pin", 26)}</div>`;
      return wrap(
        `<div class="bk-container"${d}>
  <div class="bk-section-head">
    <h2 class="bk-h2">${te(`${r}.heading`, h.heading ?? "Find us", "span")}</h2>
  </div>
  <div class="bk-map-grid">
    ${frame}
    <div class="bk-map-info">
      ${addr ? te(`${r}.address`, addr, "p", "bk-muted") : ""}
      <a class="bk-btn bk-btn-ghost" href="${attrSafe(mapsLink)}" target="_blank" rel="noopener">Open in maps</a>
    </div>
  </div>
</div>`
      );
    }

    case "footer": {
      const h = c as typeof c & {
        columns?: { title: string; links: { label: string; href: string }[] }[];
        socials?: { icon: string; label: string; href: string }[];
        copyright?: string; note?: string;
      };
      const cols = (h.columns ?? []).map(
        (col, ci) => `
  <div class="bk-footer-col"${d}>
    <h4>${te(`${r}.columns[${ci}].title`, col.title ?? "", "span")}</h4>
    <ul>${(col.links ?? []).map((l, li) => `<li><a href="${attrSafe(l.href)}">${te(`${r}.columns[${ci}].links[${li}].label`, l.label ?? "", "span")}</a></li>`).join("")}</ul>
  </div>`
      ).join("");
      const socials = (h.socials ?? []).map(
        (s) => `<a class="bk-social" href="${attrSafe(s.href)}" aria-label="${esc(s.label)}">${svgIcon(s.icon, 17)}</a>`
      ).join("");
      return `
<footer class="bk-footer"${d} data-type="footer">${cols}${socials}
  <div class="bk-footer-bottom">
    <span>${te(`${r}.copyright`, h.copyright ?? "", "span")}</span>
    <span>${esc(doc.meta.title)}</span>
  </div>
  ${h.note ? `<p class="bk-footer-note">${te(`${r}.note`, h.note, "span")}</p>` : ""}
</footer>`;
    }

    case "custom": {
      const h = c as typeof c & { html?: string };
      return wrap(
        `<div class="bk-custom"${d}>${h.html ?? ""}</div>`,
        "bk-section-alt"
      );
    }

    case "products": {
      const h = c as typeof c & {
        heading?: string; subheading?: string; currency?: string;
        items?: { id: string; name: string; price: number; description: string; features?: string[]; image?: string; badge?: string; sku?: string }[];
      };
      const cards = (h.items ?? []).map(
        (p, idx) => `
  <div class="bk-product"${d} data-product-id="${esc(p.id)}">
    ${p.image ? `<div class="bk-product-image"><img src="${attrSafe(p.image)}" alt="${esc(p.name)}" loading="lazy" data-bkimg="${r}.items[${idx}].image"/></div>` : `<div class="bk-product-image-placeholder"></div>`}
    ${p.badge ? `<span class="bk-product-badge">${esc(p.badge)}</span>` : ""}
    <div class="bk-product-content">
      <h3 class="bk-h3">${te(`${r}.items[${idx}].name`, p.name ?? "", "span")}</h3>
      <p class="bk-muted">${te(`${r}.items[${idx}].description`, p.description ?? "", "span")}</p>
      ${p.features && p.features.length ? `<ul class="bk-price-feat">${p.features.map((f) => `<li>${svgIcon("check", 16)}<span>${te(`${r}.items[${idx}].features[]`, f ?? "", "span")}</span></li>`).join("")}</ul>` : ""}
      <div class="bk-product-footer">
        <span class="bk-product-price">${esc(h.currency ?? "$")}${te(`${r}.items[${idx}].price`, String(p.price ?? 0), "span")}</span>
        <button class="bk-btn bk-btn-primary bk-add-to-cart" data-product-id="${esc(p.id)}" data-product-name="${esc(p.name)}" data-product-price="${p.price ?? 0}">Add to cart</button>
      </div>
    </div>
  </div>`
      ).join("");
      return wrap(
        `<div class="bk-container"${d}>
  <div class="bk-section-head">
    <h2 class="bk-h2">${te(`${r}.heading`, h.heading ?? "", "span")}</h2>
    ${h.subheading ? te(`${r}.subheading`, h.subheading, "p", "bk-lede") : ""}
  </div>
  <div class="bk-grid bk-grid-3">${cards}
  </div>
</div>`,
        "bk-section-alt"
      );
    }

    case "booking": {
      const h = c as typeof c & {
        heading?: string; subheading?: string; embedUrl?: string; buttonLabel?: string; note?: string;
        formFields?: { label: string; type: string; required: boolean }[];
      };
      const head = `<div class="bk-section-head">
    <h2 class="bk-h2">${te(`${r}.heading`, h.heading ?? "Book", "span")}</h2>
    ${h.subheading ? te(`${r}.subheading`, h.subheading, "p", "bk-lede") : ""}
  </div>`;
      if (h.embedUrl) {
        return wrap(
          `<div class="bk-container"${d}>
  ${head}
  <div class="bk-booking-embed"><iframe src="${attrSafe(h.embedUrl)}" title="Booking" loading="lazy"></iframe></div>
  ${h.note ? `<p class="bk-note">${te(`${r}.note`, h.note, "span")}</p>` : ""}
</div>`,
          "bk-section-alt"
        );
      }
      const fields = (h.formFields ?? [
        { label: "Name", type: "text", required: true },
        { label: "Email", type: "email", required: true },
        { label: "Date", type: "date", required: true },
        { label: "Message", type: "textarea", required: false },
      ]).map((f, fi) => `
      <div class="bk-field"${d}>
        <label for="bk-book-${fi}">${te(`${r}.formFields[${fi}].label`, f.label ?? "", "span")}${f.required ? " *" : ""}</label>
        ${f.type === "textarea"
          ? `<textarea id="bk-book-${fi}" rows="3" ${f.required ? "required" : ""} placeholder=" "></textarea>`
          : `<input id="bk-book-${fi}" type="${esc(f.type)}" ${f.required ? "required" : ""}/>`}
      </div>`).join("");
      return wrap(
        `<div class="bk-container"${d}>
  ${head}
  <form class="bk-form">
    ${fields}
    <div class="bk-form-success" aria-live="polite"></div>
    <button class="bk-btn bk-btn-primary" type="submit">${te(`${r}.buttonLabel`, h.buttonLabel ?? "Book now", "span")}</button>
    ${h.note ? `<p class="bk-note">${te(`${r}.note`, h.note, "span")}</p>` : ""}
  </form>
</div>`,
        "bk-section-alt"
      );
    }

    case "posts": {
      const h = c as typeof c & {
        heading?: string; subheading?: string; layout?: "grid" | "list"; postsPerPage?: number; showExcerpt?: boolean; category?: string;
      };
      const posts = (doc.posts ?? [])
        .filter((p) => !h.category || p.category === h.category)
        .slice(0, h.postsPerPage || 6);
      const layout = h.layout === "list" ? "bk-posts-list" : "bk-posts-grid";
      const cards = posts.map(
        (p) => `
  <article class="bk-post-card"${d} data-post-slug="${esc(p.slug)}">
    ${p.cover ? `<div class="bk-post-cover"><img src="${attrSafe(p.cover)}" alt="${esc(p.title)}" loading="lazy" data-bkimg="${r}.post-cover"/></div>` : `<div class="bk-post-cover-placeholder"></div>`}
    <div class="bk-post-content">
      ${p.category ? `<span class="bk-post-category">${esc(p.category)}</span>` : ""}
      <h3 class="bk-h3"><a href="#post-${esc(p.slug)}">${esc(p.title)}</a></h3>
      <time class="bk-post-date">${new Date(p.date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</time>
      ${h.showExcerpt !== false && p.excerpt ? `<p class="bk-muted">${esc(p.excerpt)}</p>` : ""}
      <button class="bk-btn bk-btn-ghost bk-post-read" data-post-slug="${esc(p.slug)}">Read more</button>
    </div>
  </article>`
      ).join("");
      return wrap(
        `<div class="bk-container"${d}>
  <div class="bk-section-head">
    <h2 class="bk-h2">${te(`${r}.heading`, h.heading ?? "Blog", "span")}</h2>
    ${h.subheading ? te(`${r}.subheading`, h.subheading, "p", "bk-lede") : ""}
  </div>
  <div class="bk-posts ${layout}">${cards}
  </div>
  <div id="bk-post-modal" class="bk-post-modal" style="display:none"></div>
</div>`,
        "bk-section-alt"
      );
    }

    default:
      return "";
  }
}

export const _renderSectionRoot = root;

const SITE_FEATURES_SCRIPT = `(function () {
  var cfg = window.__BKKY__ || {};
  // Password gate
  if (cfg.password) {
    var ok = false;
    try { ok = sessionStorage.getItem("bk-pwd-ok") === cfg.password; } catch {}
    if (!ok) {
      var entered = prompt("This site is password protected. Enter password:");
      if (entered !== cfg.password) {
        document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:#111;color:#fff;font-family:system-ui,sans-serif"><div style="text-align:center"><h1>Access denied</h1><p>Incorrect password.</p></div></div>';
        return;
      }
      try { sessionStorage.setItem("bk-pwd-ok", cfg.password); } catch {}
    }
  }
  // Language switcher
  var langSel = document.getElementById("bk-lang-switch");
  if (langSel) {
    var applyLang = function (lang) {
      var map = (cfg.translations || {})[lang] || {};
      document.documentElement.lang = lang;
      document.querySelectorAll("[data-field]").forEach(function (el) {
        var orig = el.getAttribute("data-text");
        if (orig && map[orig]) el.textContent = map[orig];
      });
    };
    langSel.addEventListener("change", function () { applyLang(this.value); });
  }
  // Blog post modal
  var posts = cfg.posts || [];
  var modal = document.getElementById("bk-post-modal");
  document.addEventListener("click", function (e) {
    var read = e.target.closest ? e.target.closest(".bk-post-read") : null;
    if (read && modal) {
      e.preventDefault();
      var slug = read.getAttribute("data-post-slug");
      var post = posts.find(function (p) { return p.slug === slug; });
      if (!post) return;
      modal.innerHTML = '<div class="bk-modal-overlay"><div class="bk-modal-content">' +
        '<button class="bk-post-modal-close" aria-label="Close">x</button>' +
        (post.cover ? '<img class="bk-post-hero" src="' + post.cover + '" alt=""/>' : '') +
        (post.category ? '<span class="bk-post-category">' + post.category + '</span>' : '') +
        '<h2>' + post.title + '</h2>' +
        '<time>' + new Date(post.date).toLocaleDateString() + '</time>' +
        '<div class="bk-post-body">' + post.content + '</div>' +
        '</div></div>';
      modal.style.display = "flex";
      return;
    }
    if (e.target.closest && e.target.closest(".bk-post-modal-close")) {
      modal.style.display = "none";
    }
    if (e.target.closest && e.target.closest(".bk-modal-overlay") && e.target.className === "bk-modal-overlay") {
      modal.style.display = "none";
    }
  });
  // Cart
  var cartKey = "bk-cart";
  function loadCart() { try { return JSON.parse(localStorage.getItem(cartKey) || "[]"); } catch { return []; } }
  function saveCart(cart) { try { localStorage.setItem(cartKey, JSON.stringify(cart)); } catch {} }
  function cartCount(cart) { return cart.reduce(function (s, i) { return s + i.qty; }, 0); }
  function fmtMoney(n) { return (Number(n) || 0).toFixed(2); }
  function renderCartBadge() {
    var badge = document.getElementById("bk-cart-count");
    if (badge) badge.textContent = cartCount(loadCart());
  }
  function renderCartDrawer() {
    var box = document.getElementById("bk-cart-items");
    if (!box) return;
    var cart = loadCart();
    if (!cart.length) {
      box.innerHTML = '<p style="padding:8px 0;color:var(--muted)">Your cart is empty.</p>';
      return;
    }
    var rows = cart.map(function (i) {
      return '<div class="bk-cart-item">' +
        '<div class="bk-cart-item-main"><div class="bk-cart-item-name">' + i.name + '</div>' +
        '<div class="bk-cart-item-sub">' + (cfg.currency || "$") + fmtMoney(i.price) + " × " + i.qty + "</div></div>" +
        '<button class="bk-cart-remove" data-remove="' + i.id + '" aria-label="Remove">✕</button></div>';
    }).join("");
    var total = cart.reduce(function (s, i) { return s + (Number(i.price) || 0) * i.qty; }, 0);
    box.innerHTML = rows +
      '<div class="bk-cart-total"><span>Total</span><span>' + (cfg.currency || "$") + fmtMoney(total) + "</span></div>" +
      '<button id="bk-cart-checkout" class="bk-btn bk-btn-primary">Checkout</button>' +
      (cfg.stripeLink ? "" : '<p class="bk-cart-note">Checkout not configured by the site owner yet.</p>');
  }
  document.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest(".bk-add-to-cart") : null;
    if (btn) {
      e.preventDefault();
      var cart = loadCart();
      var id = btn.getAttribute("data-product-id");
      var found = cart.find(function (i) { return i.id === id; });
      if (found) found.qty += 1;
      else cart.push({ id: id, name: btn.getAttribute("data-product-name"), price: Number(btn.getAttribute("data-product-price")) || 0, qty: 1 });
      saveCart(cart);
      renderCartBadge();
      renderCartDrawer();
      var done = document.createElement("span");
      done.textContent = "Added";
      btn.parentNode.replaceChild(done, btn);
      return;
    }
    var rem = e.target.closest ? e.target.closest(".bk-cart-remove") : null;
    if (rem) {
      var id2 = rem.getAttribute("data-remove");
      saveCart(loadCart().filter(function (i) { return i.id !== id2; }));
      renderCartBadge();
      renderCartDrawer();
      return;
    }
    var checkout = e.target.closest ? e.target.closest("#bk-cart-checkout") : null;
    if (checkout) {
      if (!cfg.stripeLink) return;
      window.location.href = cfg.stripeLink;
      return;
    }
    var toggle = e.target.closest ? e.target.closest("#bk-cart-toggle") : null;
    if (toggle) {
      e.preventDefault();
      var drawer = document.getElementById("bk-cart-drawer");
      if (drawer) {
        renderCartDrawer();
        drawer.classList.add("bk-open");
      }
    }
    if (e.target.closest && e.target.closest("#bk-cart-close")) {
      var dr = document.getElementById("bk-cart-drawer");
      if (dr) dr.classList.remove("bk-open");
    }
  });
  renderCartBadge();
  // Motion / reveal on scroll
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("bk-in-view");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll(".bk-motion-fade,.bk-motion-slide-up,.bk-motion-slide-left,.bk-motion-slide-right,.bk-motion-zoom,.bk-motion-marquee").forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll(".bk-motion-fade,.bk-motion-slide-up,.bk-motion-slide-left,.bk-motion-slide-right,.bk-motion-zoom,.bk-motion-marquee").forEach(function (el) { el.classList.add("bk-in-view"); });
  }
})();`;
