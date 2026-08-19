# bukkyai — Project Memory (AGENTS.md)

**READ THIS FIRST.** This file is the persistent memory for every AI coding session on this
project. It captures the architecture, everything that has been built, the current UI state,
conventions, and gotchas so any new AI can continue work without re-explaining. If a session
feels lost, come back here. Sections to always skim: Commands, Architecture map, Current editor
state, Pending user actions, Conventions, Gotchas.

---

## 1. What this is

**bukkyai** is an AI website builder. A user describes their business in a sentence; the app
plans a sitemap, designs a bespoke design system (colors/fonts/spacing), writes all copy and
pages, and lets them edit, then export/publish real files they own.

- Brand: the app/product is **bukkyai**. Credit line "Designed by Kaywebservice Enterprise
  Solutions" appears in export footers, README, templates, landing — the credit line is
  important to the owner, never remove or rename.
- Live at: `https://bukkyai.duckdns.org/` (www resolves; root redirects to www).
- Editor at `/app`, landing at `/`, marketing pages at `/features`, `/templates`, `/pricing`,
  `/faq`, `/contact`, `/tools`, `/made-with`, `/playground`, `/blog`, `/compare`, `/badge`,
  `/design-system`, `/ref`, plus 283 programmatic pages (see §9).
- Deploy: **Vercel auto-deploys every push to `main`** (repo `kaywebservice/bukkyai`). Live
  change after a push is typically visible in ~1 minute.
- Publish worker (Cloudflare): `https://bukkyai-publish-kw.bukkyai-kw.workers.dev`

---

## 2. Tech stack

- **Frontend:** React 18 + TypeScript + Vite, multi-page build (`app.html`, `index.html`,
  `landing.html`, marketing pages, `blog.html`, etc.). No UI framework — hand-rolled CSS.
- **State:** React state + localStorage via `src/lib/store.ts`; optional Firestore cloud sync.
- **Auth:** Firebase Auth (Google + email/password) via `src/lib/auth.ts`. Guest mode: no
  sign-in needed to use the builder.
- **Storage:** localStorage per project; Firestore shared projects at top-level `projects/{id}`.
- **Payments:** Creem (Pro `prod_48AX6fRL1MUIcYUivSHtKa`, Plus `prod_6bF1BI1oKTyQNSzDhmObOq`).
- **Publish/Pro server:** Cloudflare Worker `server/worker.js` (GitHub token, Creem keys,
  entitlements in KV).
- **Design:** Cream & Ink — warm cream `#f7f3ea`, ink `#1d1b16`, terracotta accent `#b3541e`
  (hover/dark `#8a3d12`); Fraunces (display serif) + Inter (sans). Editor chrome AND marketing
  share this palette. **There is no purple anywhere** — primary buttons/focus/glows are
  terracotta (`rgba(179, 84, 30, …)`). If you find stray purple (e.g. `rgba(139,123,255,…)`,
  `#9d8fff`, `#6d5ae8`) it's a regression — fix it.
- **Tests:** Vitest — `src/lib/smoke.test.ts` runs `runSmoke()` from `src/lib/smoke.ts`.

---

## 3. Commands

- `npm run dev` — Vite dev server
- `npm run build` — full build chain:
  `node scripts/gen-pages.mjs` (283 programmatic pages) →
  `node scripts/gen-og.mjs` (13 OG PNGs) →
  `node scripts/gen-seo.mjs` (sitemap.xml, 300 URLs) →
  `tsc --noEmit` →
  `vite build` (also runs `scripts/previews-plugin.ts` → `public/previews/`) →
  `node scripts/ping-indexnow.mjs` (Bing/Yandex/Seznam)
- `npm test` — vitest run (8 smoke tests: blueprint, render, brief compiler, etc.)
- `node scripts/seo-report.mjs --live [--limit N]` — crawl all sitemap URLs, report
  404s/redirects (HEAD, concurrency 12). Without `--live` validates the sitemap only.
- Worker: `cd server && npx wrangler deploy` (also `npx wrangler secret put <NAME>`,
  `npx wrangler kv namespace …`).
- Programmatic content: edit `scripts/prog-data.mjs`, then run
  `node scripts/gen-pages.mjs && node scripts/gen-seo.mjs`.

**Build gotcha (critical):** use `tsc --noEmit`, **never `tsc -b`** — the `-b` incremental
cache masked errors locally that then broke the clean Vercel build. Keep it this way.

---

## 4. Repo layout — complete file map

### Root
- `package.json` — deps: firebase, jszip, react 18. Dev: @resvg/resvg-js (OG cards), vite 5,
  vitest 4, typescript. Scripts: dev/build/test/preview.
- `vercel.json` — rewrites: marketing pages, `/app`→`/app.html`, and programmatic URL patterns
  (`/templates/:slug`, `/industries/:slug`, `/use-cases/:slug`, `/compare/:slug`,
  `/how-to/:slug`, `/local/:city/:industry`, plus hub index pages).
- `firestore.rules` — rules for `projects/{id}`, presence, legacy `users/{uid}/projects`;
  user pastes into Firebase console.
- `index.html`, `app.html`, `landing.html`, `features.html`, `templates.html`, `pricing.html`,
  `faq.html`, `contact.html`, `tools.html`, `made-with.html`, `playground.html`, `blog.html`,
  `referral.html`, `badge.html`, `design-system.html`, `compare.html` — entry HTML files.
  Vite MPA (multi-page) build.
- `LAUNCH.md`, `TRAFFIC-GUIDE.md` — launch posts / traffic playbook (user's own material).
- `drafts/` — cross-post drafts for Medium/LinkedIn/Hashnode + `CONTENT-CALENDAR.md`.

### src/ — the app (editor)
- `src/main.tsx` — React bootstrap.
- `src/App.tsx` — **the whole editor in one file (~2100 lines).** All app state and handlers
  live here: project CRUD, brief studio flow, AI build pipeline wiring, checkpoints/undo,
  chat, panels, publish/go-live, modals. See §6 for the exact current UI structure.
- `src/App.css` — the entire editor stylesheet (CSS variables in `:root`, cream/ink theme).
- `src/components/` — one component per file:
  - `Header.tsx` — top bar: brand, busy-pill, presence chip, **☰ Menu** dropdown, auth chip.
  - `BriefScreen.tsx` — the **brief studio**, first-run screen of `/app` (Durable-style).
  - `FullView.tsx` — fullscreen post-build view: iframe of `multiPageHtml`, device toggle
    (desktop/tablet/mobile), "New tab", "⚙ Advanced editor", approval panel, Go-live tabs
    (Free address / My own domain with DNS polling), live success card.
  - `Preview.tsx` — live editor preview (iframe, renders one page via `renderPage`).
  - `Chat.tsx` — chat tab UI. `DesignPanel.tsx` — design system tab (tone, presets,
    harmony score, brand kit). `Inspector.tsx` — selected section fields + **Delete section**.
  - `MediaView.tsx`, `CodeView.tsx`, `PlanView.tsx`, `HistoryView.tsx`, `PostsView.tsx`,
    `PagesManager.tsx`, `LanguagesView.tsx`, `SeoPanel.tsx`, `AnalyticsView.tsx` — the
    right-panel tabs (opened via ☰ Menu → Editor tools).
  - `StarterGallery.tsx` — full site template gallery (New project). `ThemeGallery.tsx` —
    Plus-gated generated themes. `VariantsModal.tsx` — A/B test variants.
  - `AuthModal.tsx`, `PricingModal.tsx`, `ShareModal.tsx`, `SettingsModal.tsx`,
    `ReferralModal.tsx`, `OnboardingTour.tsx`, `ShortcutsModal.tsx`, `FindReplaceModal.tsx`,
    `CommandPalette.tsx`, `InstallAppButton.tsx`, `EmptyState.tsx`, `FieldHint.tsx`.
  - `LeftRail.tsx` — **LEGACY / UNUSED** (no longer imported by App.tsx). Page/section tree
    with drag reorder. Kept on disk only.
  - `AuthGate.tsx` — legacy sign-in gate; `gateOpen` is `false` on load (guest-first).
- `src/lib/` — the engine:
  - `types.ts` — **all core types**: `ColorTokens`, `FontScale`, `SpacingTokens`,
    `RadiusTokens`, `DesignTokens`, `DesignSystem`, `SectionContent` (map of every section
    type → content), `SectionType` = keyof SectionContent, `SectionMotion`, `Post`,
    `CartItem`, `Section`, `Page`, `NavLink`, `RedirectRule`, `CookieConsent`, `SiteTheme`,
    `SiteBlueprint` (the whole document: pages, design, settings, posts, products, forms,
    embeds, analytics, cart…), `Checkpoint`, `PlanSection`, `PlanPage`, `SitePlan`,
    `EditPatch`, `ChatMessage`, `LLMSettings`, `DEVICE`, `BuilderStatus`.
  - `blueprint.ts` — `SECTION_TYPES`, `SECTION_LABEL`, `uid()`, `DEFAULT_DESIGN`,
    `section()`, `emptyContent()`, `footerSection()`, `emptyBlueprint()`, `sampleProject()`
    (the Northwind demo), `checkpoint()`, `getField()`/`setField()` (dot-path access).
  - `render.ts` — **static HTML renderer** for generated sites: `renderPage()`,
    `renderStaticSite()` (all files for export/publish), `renderProductPage()`,
    `renderPostPage()`, `renderCategoryArchive()`, `rssFeed()`, `renderMaintenance()`,
    `renderNotFound()`, `faviconDataUrl()`, `siteBase()`. Includes the site's JS: cart,
    forms, sliders, share button, cookie banner, language switcher.
  - `renderCss.ts` — design-system CSS emitted into every generated site.
  - `export.ts` — `singleFileHtml()`, `multiPageHtml()` (hash-router multi-page
    self-contained HTML, used by FullView), ZIP/React/CMS/blueprint exports, GitHub backup
    & Pages deploy, print, `publishPreview()`.
  - `builder.ts` — the AI pipeline (plan → design → content → edits) + `BuildCallbacks`,
    `VariantKind`, `collectSiteStrings()`. Calls `llm.ts`.
  - `llm.ts` — OpenAI / Anthropic / Gemini unified client (`LLMResult`, `hasKey()`,
    `extractJson()`, `defaultModel()`).
  - `prompts.ts` — all AI system prompts: plan, design system, content copy, edit patches,
    posts, SEO fixes, `SECTION_TYPE_LIST`, `ICON_LIST`.
  - `brief.ts` — brief-studio constants (`BRIEF_FEATURES`, `BRIEF_PAGES`, `BRIEF_TONES`,
    `BRIEF_GOALS`, `BRIEF_IMAGE_STYLES`, `BRIEF_LANGUAGES`, `BRIEF_DOMAINS`,
    `EXAMPLE_PROMPTS`, `ThemeChoice`, `BriefState`, `EMPTY_BRIEF`), `compileBrief()`
    (turns the screen into a structured free-text prompt), load/save/clear
    (`bukkyai.brief` localStorage key), `randomSurpriseTheme()`.
  - `store.ts` — localStorage persistence: projects list (`bukkyai.projects`), project docs,
    checkpoints/history, chat, plan, settings, media assets, import/export JSON,
    `demoProject()`, `saveProjectAs()`.
  - `templates.ts` — `SECTION_TEMPLATES` (~30 section recipes) + `templatesFor(type)`.
  - `templatesFull.ts` — `FULL_TEMPLATES` (6 full site templates) + `fullTemplateById()`.
  - `starterSites.ts` — `STARTER_SITES` (same gallery source) + `starterById()`.
  - `presets.ts` — `DESIGN_PRESETS` (16 hand-authored design presets) + `sys()`.
  - `designPresets.ts` — `PRESETS`, `BRAND_TAGS` (brand-kit tag matching).
  - `themeEngine.ts` — **132 Plus-gated generated themes** (`GENERATED_THEMES`) in 10
    categories (Minimal, Elegant, Bold, Earthy, Tech, Retro, Luxury, Editorial, Playful,
    Corporate).
  - `fontPairs.ts` — `FONT_PAIRS` (12 pairings), `googleFontsLink()`, `fontCssStack()`.
  - `color.ts` — WCAG math: `hexToRgb`, `luminance`, `contrastRatio`, `isReadable`, `shade`.
  - `harmony.ts` — design harmony engine: `scoreDesign()`, `harmonizeDesign()`
    (one-click Harmonize), hue helpers. (User explicitly declined a "quantum" idea; this is
    the classical engine.)
  - `flesh.ts` — lorem/demo content filler: `loremSentence`, `loremParagraph`, `picsum`,
    `brandName`, `fleshSection()`, `filledSection()`.
  - `audit.ts` — SEO audit: `auditSite()`, `fillAltText()`, `seoAutoFixPrompt()`,
    `renderSmokeTest()`.
  - `diff.ts` — `diffLines()`, `diffCheckpoints()` (history view).
  - `markdown.ts` — `slugify()`, `parseMarkdown()` (blog post import).
  - `images.ts` — AI image generation (`gemini-3.1-flash-image`), `canGenerateImages()`.
  - `compressImage.ts` — `readAsDataUrl()`, `compressDataUrl()` (media uploads).
  - `icons.ts` — `ICON_PATHS`, `svgIcon()` (site icons).
  - `ogImage.ts` — `generateOgImage()` (client-side OG card for a page).
  - `brand.ts` — `BrandPalette` type (brand-kit upload).
  - `auth.ts` — Firebase Auth wrapper: `authConfigured()`, sign in/out, reset password,
    resend verification, delete account, `onAuthChange()`.
  - `cloud.ts` — Firestore: shared projects `projects/{id}` (ownerId + members map), invites,
    presence heartbeats, legacy migration from `users/{uid}/projects`.
  - `publish.ts` — worker client: `publishSite()`, `publishPreview()`, entitlement checks,
    Creem checkout, DNS check helpers (`fetchDnsInfo`, `checkDomainDns`), referral
    (`referralLink`, stats), `proUnlocked()`/`setProUnlocked()` (local shortcut).
  - `payments.ts` — `checkoutEndpoint()`, `checkoutConfigured()`, `openHostedCheckout()`.
  - `useFocusTrap.ts` — a11y hook for modals.
  - `smoke.ts` / `smoke.test.ts` — smoke suite (runSmoke) + vitest file.

### server/ — Cloudflare Worker
- `worker.js` — routes: POST `/api/checkout` (Creem), POST `/api/webhook` (HMAC-verified →
  KV entitlements per email), GET `/api/entitlement`, POST `/api/image` (AI image proxy),
  GET `/img/{id}` (KV image), GET `/api/dnsinfo`, GET `/api/dnscheck?host=`, POST
  `/api/referral`, `/api/referral/visit`, `/api/referral/stats`, `/checkout`, `/publish`.
- `wrangler.toml` — KV namespaces, routes. `.wrangler/` = local state, don't commit.
- **Secrets (env):** `GITHUB_TOKEN`, `GITHUB_USER`, `GITHUB_REPO`, `CREEM_API_KEY`,
  `CREEM_PRODUCT_ID`, `CREEM_PLUS_PRODUCT_ID`, `CREEM_WEBHOOK_SECRET`, `CREEM_TEST_MODE`,
  `ENTITLEMENTS` (KV), `IMAGES` (KV), `PRO_LICENSE_KEY`. Set via
  `cd server && npx wrangler secret put <NAME>`.

### scripts/
- `prog-data.mjs` — source data for all programmatic pages (templates, industries,
  use-cases, comparisons, how-tos, 20 cities × 11 industries, steps for HowTo schema).
- `gen-pages.mjs` — generates the 283 programmatic HTML pages into `programmatic/`
  (committed) + hub index pages via `hubIndex()`.
- `gen-seo.mjs` — writes `public/sitemap.xml` (300 URLs).
- `gen-og.mjs` — rasterizes 13 branded 1200×630 OG cards → `public/og/*.png`
  (needs `@resvg/resvg-js`). **Commit the PNGs** — don't rely on runtime regeneration.
- `previews-plugin.ts` — Vite plugin: during `vite build` renders `public/previews/{slug}/`
  (self-contained demo sites via `renderStaticSite`). **Don't commit `public/previews/`**
  (regenerated every build).
- `ping-indexnow.mjs` — pings Bing/Yandex/Seznam after build (key `public/indexnow-key.txt`
  = `9e04a25db17c63f8f71cd062a7f68d76`).
- `seo-report.mjs` — sitemap crawler/validator (see §3).
- `gen-icons.cjs` — PWA icons.

### public/ (static, committed)
`marketing.css` + `marketing.js` (shared nav/footer/SEO injection incl. JSON-LD, exit-intent
popup, Bing/Yandex placeholder metas), `sw.js` + `manifest.webmanifest` + icons (PWA),
`robots.txt`, `sitemap.xml`, `indexnow-key.txt`, `indexnow.txt`, `made-with-badge.svg` +
`-dark.svg`, `blog/` (5 articles + `feed.xml`), `og/` (13 PNG cards), `previews/` (generated,
gitignored).

---

## 5. Core data model (one paragraph mental model)

A project is a **SiteBlueprint**: a plain JSON document with `name`, `design` (DesignSystem:
colors, fonts, spacing, radius, mode, name), `pages[]` (each: id, slug, title, navLabel,
sections[]), `settings` (seo, forms, commerce, analytics, embeds, password, custom CSS/JS,
redirects, cookie consent, languages, theme, logo…), `posts[]`, `products[]` (with sku/cart
options), `cart`, `nav` (order), `footer`. Every section is `{ id, type, content }` where
`type` is a key of `SectionContent` (hero, features, gallery, pricing, testimonials, faq,
cta, contact, posts, products, video, marquee, stats, team, logos, map, image, text,
custom…). The renderer turns this deterministically into static HTML + CSS. **Never add a
runtime framework to generated sites — they are static files the user owns.**

---

## 6. Current editor UI state (as of last session — IMPORTANT)

The editor is deliberately **minimal / single-pane** (user-driven redesign; several rounds of
removal — do NOT re-add chrome without being asked):

- **First screen of `/app` (guest or signed in): the brief studio** — centered column
  (max-width 880px), kicker "AI WEBSITE BUILDER" (terracotta), serif Fraunces headline
  "Describe your website", one large rounded white textarea (min-height 150px), example
  chips, pill CTA "Design my website →", "or start from a template" link, "↺ Reuse last
  brief" (loads `bukkyai.brief`). Everything else (features in 3 groups, theme picker,
  pages, business basics, goal, voice, images, multilingual, contact, reference site, domain
  extension) sits behind the **"Add more detail ▾" toggle**.
- **No left sidebar. No preview toolbar. No right-panel tabs visible by default.** The
  preview spans the full width. `.app-main` is `display:flex` (`1fr` preview + 400px tools
  panel that only mounts when opened).
- **Header:** brand "bukkyai" (terracotta `b` mark) · busy-pill · presence chip · ☰ Menu ·
  auth chip ("Sign in" or avatar). NO project picker, NO "+ New".
- **☰ Menu groups (in order):**
  1. **Publish & export** — Publish & share, Export zip, single-file HTML, React project,
     CMS, blueprint JSON, print plan, open preview in tab, GitHub backup, GitHub Pages deploy.
  2. **Projects** — New project (templates gallery), the project list (click to open;
     `.menu-project.on` = open one), Rename / Duplicate / Delete.
  3. **Editor tools** — Add section… (insert modal at end of current page), Chat & AI,
     Design, Media, Code, Inspect, Plan, History, Posts, Pages, Translations, SEO,
     Analytics, Full view.
  4. **Tools** — Settings, Share project, Checkpoint, Guided tour, Refer & earn, Load demo
     site, Import project, Invites, Pricing & upgrade, Install app.
  5. **Account** — sign in / account.
- **Tools panel** (`panelOpen` state): topbar with "Tools" + "✕ Close", then the tab strip;
  opening any Editor-tools item calls `setTab(t); setPanelOpen(true)`.
- **After a fresh build:** the site opens in **FullView** — fullscreen iframe of
  `multiPageHtml(doc)`, floating bar (desktop/tablet/mobile, New tab, ⚙ Advanced editor →
  returns to editor view), approval panel ("Happy with your website?" → Yes, go live / No,
  advanced editor / Keep browsing).
- **Go live:** two tabs — **Free address** (instant publish, GitHub Pages, no DNS; default)
  and **My own domain** (CNAME wizard: target `{GITHUB_USER}.github.io`, copy, auto-poll
  worker `/api/dnscheck` every 5s → "Connected" → publish). No account → AuthModal; not Pro
  → PricingModal with `pendingGoLiveRef`; auto-publishes on entitlement arrival. Success
  card shows the live URL. Worker GET `/api/dnsinfo` + `/api/dnscheck` must be deployed
  (`wrangler deploy`) to work.
- **StatusFooter: removed.** `error` state is write-only (`const [, setError]`).
- **LeftRail: removed from render** (file remains, unused). Section reorder is via AI chat;
  section delete via Inspect tab; pages via Pages tab; add-section via Menu.
- **Tour:** 20 steps, guest-first (only auto-shows for signed-in users). Step numbering
  matches the current chrome (no `.left-rail`, no `.project-picker`, no `.preview-toolbar`).
- **Cmd palette** (Ctrl+K): includes "Open tools panel", "Full view", etc.

---

## 7. Core flows

1. **Brief → build:** BriefScreen state → `compileBrief()` → `startBuild()` → plan (AI) →
   plan approval UI → build (design system + content, one page at a time) → doc persisted →
   open FullView. Every AI mutation creates a `Checkpoint` (undo anytime).
2. **Chat edits:** chatSend → `applyEdit` prompt → `EditPatch` list applied via
   `setField`/section ops. Chat can move sections, rewrite copy, add pages.
3. **Checkpoints/history:** `mutate(next, label, source)` — clones doc, saves to history
   (localStorage + optional cloud), Ctrl+Z undoes.
4. **Publish (Pro):** worker `/publish` uses GITHUB_TOKEN to push files to a Pages repo →
   `https://{GITHUB_USER}.github.io/{slug}`; custom domain = dedicated repo + CNAME. Entitle
   → KV `entitlements:{email}` → `tier: "plus"|"pro"`.
5. **Checkout:** client `openCheckout` → worker POST `/api/checkout` → Creem hosted page →
   webhook (HMAC via CREEM_WEBHOOK_SECRET) → KV entitlements → client polls
   `/api/entitlement` (`?creem=success` also triggers a re-check).

---

## 8. Marketing site & content layer

- Pages: home (`index.html`), features, pricing (Free $0 / Pro $15–19 / Plus $28–35, annual
  toggle, comparison table), templates (cards + live preview links + Remix), FAQ, contact,
  tools (11 free tools: SEO checker, meta generator, design generator, image compressor,
  favicon generator, name generator, palette generator, search result preview, domain ideas,
  launch checklist, Google Business Profile checklist), made-with, playground, blog,
  compare, badge, design-system, referral landing.
- Shared chrome: `public/marketing.css` + `public/marketing.js` (injects nav with Product
  mega-menu, footer, JSON-LD: Organization/SoftwareApp/FAQ/BreadcrumbList/Article, exit-intent
  popup once per session, Bing/Yandex placeholder metas).
- Programmatic SEO: 283 pages from `scripts/prog-data.mjs` (templates ×, industries,
  use-cases, comparisons incl. Webflow/Framer/GoDaddy/Carrd/WordPress/Wix/etc., how-tos with
  HowTo schema, 20 cities × 11 industries locals with LocalBusiness schema), hub index pages,
  300 sitemap URLs, canonicals, robots.txt.
- Previews: `public/previews/{slug}/` generated at build → playground iframes + "Live
  preview" links on templates/made-with + OG cards.
- Blog: 5 articles in `public/blog/` + RSS feed + newsletter signup (`bukkyai.newsletter`
  localStorage).
- Referral: worker endpoints (KV `ref:*`), `/ref?ref=CODE`, ReferralModal in Menu.
- PWA: manifest + sw.js + icons + install prompt.

---

## 9. Pending user actions (remind at the START of every session)

- **[TO DO] Deploy the worker:** `cd server && npx wrangler deploy` — needed so the referral
  endpoints and the DNS check endpoints go live. Until deployed, "Refer & earn" shows an
  error, `/ref?ref=` links don't record visits, and the custom-domain wizard's DNS polling
  reports "isn't configured yet".
- **[TO DO] Bing Webmaster Tools:** verify at bing.com/webmasters, paste the code into the
  `BING_CODE` placeholder in `public/marketing.js` (same for Yandex via `YANDEX_CODE`).
  Submit `sitemap.xml`. IndexNow pings on every build once the verification meta is present.
- **[TO DO] Search Console re-indexing:** after deploys, re-request indexing for new/changed
  URLs (blog ×5, playground, compare, badge, OG images, templates, tools, made-with, local
  pages, hub indexes).
- **[TO DO] Cross-post drafts:** `drafts/*.md` ready to paste to Medium/LinkedIn/Hashnode
  with canonical links — the AI can't post; the user must. See `drafts/README.md`.
- **[TO DO] Creem side:** Plus price is $35 in the UI — user should confirm the same in Creem
  (annual plans optional).

---

## 10. Everything built so far (timeline)

- **Phase 1:** wired up hidden features — SEO tab (quality score + AI auto-fix), Pages tab,
  project rename; smoke test suite added (caught 2 render bugs).
- **Phase 2 (money & polish):** cart end-to-end on generated sites; forms to real endpoints
  (Formspree/Web3Forms) with honest demo-mode messaging; real Pro gating via Creem webhooks →
  KV entitlements → server-enforced publish; account lifecycle (reset password, resend
  verification, delete account); mobile editor layout.
- **Design & brand:** classical design harmony engine (score + Harmonize); Cream & Ink theme;
  name = bukkyai, credit = "Designed by Kaywebservice Enterprise Solutions".
- **Marketing site:** Wix-style multi-page + mega-menu nav; `/app` guest-first (brief studio
  is the first thing a fresh visitor sees; tour only for signed-in users; sign-in required
  only at go-live/publish/share — real gating is server-side).
- **Team collaboration:** Firestore `projects/{id}` model with owner/members/invites/
  presence; legacy auto-migration; `firestore.rules` at repo root.
- **PWA & SEO:** manifest/SW/icons/install; programmatic pages growing 171 → 176 → 279 →
  **283** (sitemap 300 URLs); Search Console verified; LAUNCH.md + TRAFFIC-GUIDE.md.
- **Theme generator:** `themeEngine.ts` → 132 Plus-gated themes in 10 categories.
- **Template depth:** hero slider, testimonial slider, pricing billing toggle, breadcrumbs,
  product detail pages `/product/{sku}.html`, blog post pages `/post/{slug}.html`.
- **Pricing:** Free / Pro / Plus with annual toggle; A/B testing feature (Plus-gated).
- **Traffic build-out:** playground (6 live previews, device toggle, share links, Remix);
  made-with live preview links; 11 free tools; blog + RSS + newsletter; rich results
  (BreadcrumbList/Article/HowTo/FAQ/LocalBusiness); referral program; made-with badge;
  comparisons + /compare index; OG share cards (`scripts/gen-og.mjs`); templates live
  previews; proof strip + exit-intent popup; Google Business Profile checklist; local SEO
  (20 cities × 11 industries).
- **Search engines:** IndexNow after every build; Bing/Yandex placeholders; hub index pages;
  share button on every generated site; `/design-system` page; `seo-report.mjs`.
- **App UI (recent):** brief studio first screen; ☰ Menu consolidation; FullView + go-live
  flow + custom-domain DNS wizard; guest-first; clean single-pane editor (toolbar + tabs +
  sidebar + project picker + status footer all removed, features preserved in ☰ Menu);
  `.app-main` flex layout fix; terracotta-only palette (purple removed); centered 880px brief
  column with Fraunces headline.

---

## 11. Conventions

- **No comments in code unless asked** (this file and obvious section headers are fine).
- Keep `tsc --noEmit` in the build (see gotcha). Never `tsc -b`.
- Blueprint → static HTML model. No runtime framework in generated sites.
- Marketing pages share `public/marketing.css` + `public/marketing.js`.
- Don't commit `public/previews/` (regenerated each build). DO commit `public/og/*.png`.
- Programmatic pages come from `scripts/prog-data.mjs` → run gen-pages + gen-seo.
- Keep internal localStorage keys (`bukkyai.*`) unchanged — renaming wipes user data.
- The Plus/Pro tier comes from the worker entitlement (`tier: "plus"`). UI gates use
  `proTier` in App.tsx.
- The user values a **clean, minimal UI** — before adding chrome/buttons to the editor,
  consider ☰ Menu instead. But never silently delete a feature; move it somewhere reachable.
- The user is non-technical in parts; explain deploy steps (wrangler, Vercel) simply.

---

## 12. Known gotchas

- Build: `tsc --noEmit` only, never `tsc -b`.
- `/app` is `noindex` (client-rendered editor shouldn't compete in SERPs). Marketing pages
  carry the SEO.
- Published sites backlink to `https://bukkyai.duckdns.org/` via the "Designed by
  Kaywebservice" footer — by design.
- The auth gate is client-side (bypassable) — real gating is the server-side Creem
  entitlement on publish.
- Firestore rules must match `firestore.rules`.
- After pushes, Vercel takes ~1 min; users may need a hard refresh to bust cached bundles.
- The AI can't see rendered pixels — when the user reports visual UI problems, ask for a
  screenshot or a precise description before guessing.
