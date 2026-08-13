# bukkyai — Project Memory (AGENTS.md)

This file is the persistent memory for AI coding sessions. Read it first. It captures the
architecture, everything that has been built, conventions, and gotchas so work can continue
across sessions without re-explaining.

---

## What this is

**bukkyai** is an AI website builder. A user describes their business in a sentence; the app
plans a sitemap, designs a bespoke design system (colors/fonts/spacing), writes all copy and
pages, and lets them edit visually, then export/publish real files they own. Branded by
**Kaywebservice Enterprise Solutions** (credit line only — the app/product name is **bukkyai**).

- Live at: `https://bukkyai.duckdns.org/` (redirects to `www.`). Vercel auto-deploys on push to `main`.
- Editor at `/app`, landing at `/`, marketing pages at `/features`, `/templates`, `/pricing`, `/faq`, `/contact`, `/tools`, `/made-with`.
- Publish worker (Cloudflare): `https://bukkyai-publish-kw.bukkyai-kw.workers.dev`

---

## Tech stack

- **Frontend:** React 18 + TypeScript + Vite (multi-page build — `app.html`, `index.html`, `landing.html`, marketing pages, and 171 programmatic pages in `programmatic/`)
- **State:** React state + localStorage (via `src/lib/store.ts`), Firestore cloud sync (optional)
- **Auth:** Firebase Auth (Google + email), plus anonymous guest mode
- **Storage:** localStorage per project; Firestore shared projects (top-level `projects/{id}` collection)
- **Publish/Pro:** Cloudflare Worker (`server/worker.js`) holding GitHub token, Creem seller key, entitlements in KV
- **Payments:** Creem — Pro product `prod_48AX6fRL1MUIcYUivSHtKa`, Plus product `prod_6bF1BI1oKTyQNSzDhmObOq`
- **Design:** Cream & Ink theme (warm cream `#f7f3ea`, ink `#1d1b16`, terracotta accent `#b3541e`; Fraunces + Inter)
- **Tests:** Vitest — `src/lib/smoke.test.ts` (smoke suite lives in `src/lib/smoke.ts`)

---

## Commands

- `npm run dev` — Vite dev server
- `npm run build` — `node scripts/gen-pages.mjs && node scripts/gen-seo.mjs && tsc --noEmit && vite build`
- `npm test` — vitest run
- Worker: `cd server && npx wrangler deploy` (also `secret put`, `kv namespace`)

**Build gotcha (important):** use `tsc --noEmit`, **never `tsc -b`** — the `-b` incremental cache
masked errors locally that then broke the clean Vercel build. Keep it this way.

---

## Architecture map

- `src/App.tsx` — the whole editor: 3-pane layout (LeftRail / Preview / right-panel tabs). All app state + handlers live here.
- `src/lib/render.ts` — server-side-style static HTML renderer for generated sites (sections, nav, SEO, scripts). Core of exports.
- `src/lib/renderCss.ts` — design-system CSS emitted into every generated site.
- `src/lib/types.ts` — blueprint types: `SiteBlueprint`, `DesignSystem`, `SectionContent`, `Page`, `Post`, etc.
- `src/lib/blueprint.ts` — defaults, `emptyContent()`, `SECTION_TYPES`, `section()`/`footerSection()` helpers.
- `src/lib/presets.ts` — 16 hand-authored design presets (`DESIGN_PRESETS`), `sys()` helper.
- `src/lib/themeEngine.ts` — generates **132 Plus-gated design themes** (`GENERATED_THEMES`) across 10 categories.
- `src/lib/fontPairs.ts` — 12 curated font pairings.
- `src/lib/color.ts` — WCAG contrast/luminance math. `src/lib/harmony.ts` — harmony score + `harmonizeDesign()`.
- `src/lib/builder.ts` — AI pipeline (plan → design → content → edits) using `src/lib/llm.ts` (OpenAI/Anthropic/Gemini).
- `src/lib/cloud.ts` — Firestore shared projects, invites, presence.
- `src/lib/publish.ts` — publish worker client + Creem checkout/entitlement.
- `src/lib/export.ts` — single-file HTML, ZIP, React project, CMS export, GitHub backup/deploy, print.
- `src/components/` — Header, LeftRail, Preview, Chat, DesignPanel, Inspector, SeoPanel, AuthModal, AuthGate, ThemeGallery, VariantsModal, ShareModal, OnboardingTour, ShortcutsModal, FindReplaceModal, PagesManager, PostsView, MediaView, AnalyticsView, EmptyState, FieldHint, etc.
- `server/worker.js` — Cloudflare worker: `/api/checkout`, `/api/webhook`, `/api/entitlement`, `/api/image`, `/img/{id}`, `/checkout`, `/publish`.
- `scripts/` — `gen-pages.mjs` (programmatic pages), `gen-seo.mjs` (sitemap), `prog-data.mjs` (page data), `gen-icons.cjs`.

---

## Everything built so far (history)

**Phase 1 — wired up built-but-hidden features**
- SEO tab (quality score + AI auto-fix), Pages tab (add/rename/delete), project rename button
- `npm test` now runs a smoke suite; it caught + fixed 2 render bugs (footer note, footer data-type)

**Phase 2 — money & polish**
- Cart works end-to-end on generated sites (quantities, real Checkout button)
- Forms deliver to real endpoints (Formspree/Web3Forms) with honest demo-mode messaging
- Real Pro gating: Creem checkout → HMAC-verified webhooks → KV entitlements per email → publish enforced server-side
- Account lifecycle: reset password, resend verification, delete account (wipes Firestore)
- Mobile editor layout; marketing landing page

**Design & brand**
- Classical "design harmony engine" (harmony score + one-click Harmonize) — user explicitly declined the quantum idea
- Cream & Ink design system as the editor chrome + landing (light theme, Fraunces/Inter)
- App name stays **bukkyai**; credit line is "Designed by Kaywebservice Enterprise Solutions" (in export footers, README, templates)

**Marketing site (Wix-style)**
- Multi-page: home, pricing, features, templates, FAQ, contact, tools, made-with
- Wix-style nav: Product mega-menu (Build/Business/Resources groups) + login/signup via /app gate
- Login gate: editor requires sign-in (honest guest mode; publishing still requires account)

**Team collaboration**
- Shared Firestore `projects/{id}` model: ownerId, members map (owner/editor/viewer), email invites, presence heartbeats
- Legacy `users/{uid}/projects` auto-migrates to `projects/{id}` on first list
- `firestore.rules` at repo root — user pastes these into Firebase console

**PWA & SEO**
- PWA: manifest, service worker, generated icons, install prompt
- Programmatic SEO: **171 generated pages** (templates, industries, use-cases, comparisons, how-tos, local city×industry pages), sitemap (179 URLs), robots.txt, canonicals, JSON-LD (Org/SoftwareApp/FAQ)
- Google Search Console verified + sitemap submitted; `LAUNCH.md` + `TRAFFIC-GUIDE.md` contain launch posts
- Free tools page (`/tools`): SEO checker, meta generator, design generator, image compressor, favicon generator

**Theme generator (Plus-gated)**
- `themeEngine.ts` → 132 themes in 10 categories (Minimal, Elegant, Bold, Earthy, Tech, Retro, Luxury, Editorial, Playful, Corporate)
- ThemeGallery in Design tab; Plus users apply, others see upgrade prompt

**Template depth**
- Hero slider section (autoplay/arrows/dots), testimonial slider, pricing billing toggle (monthly/yearly + save badge)
- Breadcrumbs on non-home pages
- **Product detail pages** (`/product/{sku}.html`) and **blog post detail pages** (`/post/{slug}.html` with share buttons + related posts)

**Pricing (current)**
- Free $0 / **Pro $19/mo** / **Plus $35/mo** (was $49.99; user reduced it and will set the same in Creem)
- Pricing page: annual toggle (Pro $15/mo, Plus $28/mo billed yearly), full feature comparison table
- **A/B testing feature** (Plus-gated): control + 2 generated variants side-by-side, shuffle, apply winner

**Traffic build-out (shipped)**
- **Playground** (`/playground`): 6 live template previews in an iframe, desktop/tablet/mobile toggle, per-demo share links (`?t=slug`), Remix → `/app?template=`. Zero signup. Built from static previews generated at build time by `scripts/previews-plugin.ts` (Vite plugin) → `public/previews/{slug}/` (self-contained sites from `renderStaticSite`).
- **Shareable demo links**: `/made-with` now links to live previews (`/previews/{slug}/index.html`) + "Remix this demo"; playground adds share links.
- **Free tools** (`/tools`): now 11 — added website name generator, color palette generator, Google/LinkedIn result preview, domain name ideas, launch checklist.
- **Blog** (`/blog` + 3 hand-written articles in `blog/`): how-to-write-a-website-brief, why-good-design-system-beats-template, writing-homepage-that-sells. In nav + sitemap.
- **Rich results**: `marketing.js` now injects BreadcrumbList (all pages) + Article (blog posts) JSON-LD; programmatic how-to pages get HowTo schema (from `prog-data.mjs` steps).
- **Referral program**: worker endpoints `/api/referral`, `/api/referral/visit`, `/api/referral/stats` (KV `ref:*` keys); checkout accepts `ref` and webhook credits `conversions`. Landing at `/ref?ref=CODE` (records visit + deep-links into `/app?ref=`). App: "Refer & earn" in ⋯ menu → `ReferralModal.tsx`. Referral link: `https://bukkyai.duckdns.org/ref?ref=CODE`.
- **Made-with badge**: `/badge` page + `public/made-with-badge.svg` + `-dark.svg`, copy-paste HTML snippet.
- **Comparisons**: added Webflow, Framer, GoDaddy, Carrd (in `prog-data.mjs`) + a `/compare` index page. Total 176 programmatic pages, 190 sitemap URLs.

**Content & share layer (second batch)**
- **Blog** now 5 articles: + how-much-does-website-cost, best-website-builder-for-restaurants. Newsletter signup on `/blog` (localStorage `bukkyai.newsletter`), RSS at `/blog/feed.xml` (in `public/blog/`).
- **OG share cards**: `scripts/gen-og.mjs` rasterizes branded 1200×630 SVG cards → `public/og/*.png` via `@resvg/resvg-js` (13 cards: 5 articles + 6 demos + default + playground). Referenced in og:image meta on blog pages, landing, playground (playground swaps per-demo). **Dependency: `@resvg/resvg-js` (dev).**
- **Cross-post drafts** in `drafts/`: ready-to-paste Markdown for Medium/LinkedIn/Hashnode with canonical links + `CONTENT-CALENDAR.md` and posting rules. (I can't post for the user — no credentials.)
- **Templates index**: `/templates` cards now have "Live preview" (→ `/previews/{slug}/index.html`) + "Remix" buttons.
- **Landing**: proof strip (one sentence / 6 demos / 176 pages / 5–10 min) + exit-intent popup in `marketing.js` (once per session via `bukkyai.exit`, 30s fallback, skip `/app`).
- **Google Business Profile checklist** added to `/tools`.
- **Local SEO**: 20 cities × 11 industries (added Las Vegas, Philadelphia, Charlotte, San Antonio, Minneapolis + dentist, roofer, tutor) → **279 programmatic pages, 295 sitemap URLs.**

---

## Key conventions

- **No comments in code unless asked** (but this file and obvious section headers are fine).
- Keep `tsc --noEmit` in the build (see gotcha).
- The app is a **blueprint → static HTML** model. Don't add a runtime framework to generated sites.
- Marketing pages share `public/marketing.css` + `public/marketing.js` (injects nav/footer/SEO).
- Previews are generated by a Vite plugin (`scripts/previews-plugin.ts`) — it runs during `vite build` and writes `public/previews/`. Don't commit the generated `public/previews/` output (regenerated each build).
- OG cards are generated by `scripts/gen-og.mjs` into `public/og/*.png` — commit the PNGs (referenced by URL in meta tags), don't rely on regenerating them at runtime.
- Programmatic pages are generated from `scripts/prog-data.mjs` — add data there, run `node scripts/gen-pages.mjs && node scripts/gen-seo.mjs`.
- Keep internal localStorage keys (`bukkyai.*`) unchanged — renaming wipes user data.
- The Plus/Pro tier comes from the worker entitlement (`tier: "plus"`). UI gates use `proTier` in App.tsx.

---

## Known gotchas

- Build: use `tsc --noEmit`, never `tsc -b`.
- `/app` is `noindex` (client-rendered editor shouldn't compete in SERPs). Marketing pages carry SEO.
- Published sites backlink to `https://bukkyai.duckdns.org/` via the "Designed by Kaywebservice" footer.
- The auth gate is client-side (bypassable) — real gating is the server-side Creem entitlement on publish.
- Firestore rules must match `firestore.rules` (projects collection + presence + legacy users path).
