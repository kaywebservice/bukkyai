# bukkyai — Traffic & Launch Guide

Everything you need to get traffic: verify the site with Google, request indexing, record the demo
video, and launch on Product Hunt + Hacker News. All copy-paste posts are below.

---

## Quick status (what's already done)

- ✅ Marketing site live at https://bukkyai.duckdns.org/ (Cream & Ink theme, Wix-style nav)
- ✅ Google Search Console verified (meta tag)
- ✅ Sitemap submitted (sitemap.xml, 179 URLs)
- ✅ 171 programmatic SEO pages (templates, industries, use-cases, comparisons, how-tos, local city pages)
- ✅ Free tools page (/tools) — SEO checker, meta generator, design generator, image compressor, favicon generator
- ✅ "Made with bukkyai" demo gallery (/made-with)
- ✅ Backlink in published sites ("Designed by Kaywebservice Enterprise Solutions" links to bukkyai)
- ✅ Tier-aware pricing: Free / Pro $19 / Plus $49.99 (Creem checkout wired)

---

## Step 1 — Request indexing (Search Console, ~5 min)

1. Open Search Console → **URL Inspection** (left sidebar)
2. Paste `https://www.bukkyai.duckdns.org/` → hit Enter
3. Click **Request Indexing** at the top
4. Repeat for these (one at a time):
   - `https://www.bukkyai.duckdns.org/templates`
   - `https://www.bukkyai.duckdns.org/compare/wix`
   - `https://www.bukkyai.duckdns.org/tools`
   - `https://www.bukkyai.duckdns.org/made-with`

You can request ~10 per day. This nudges Google to crawl sooner — it does not guarantee ranking.
Re-request weekly on your best pages as they settle.

---

## Step 2 — Record the demo video (~15 min)

A 30–60 second screen recording of the "wow" moment. Reused in every launch post — this is your #1 asset.

### How to record
- **Windows:** press **Win + G** → record button (or Win + Alt + R to start/stop)
- **Mac:** press **Cmd + Shift + 5** → choose record screen
- **iPhone:** Control Center → screen record button

### What to record (follow this script)
1. Open `https://bukkyai.duckdns.org/` → click **Get started** → log in
2. In the welcome box, type:
   `"A bakery in Austin called June & Oak. Warm, artisanal, wood-fired bread."`
3. Click **Plan my site** → show the plan
4. Click **Approve & build** → let it generate
5. Scroll the finished site, click a word to edit it, flip to mobile view
6. End. (Optional: click "View in browser")

Keep it under 60 seconds.

---

## Step 3 — Launch on Product Hunt + Hacker News

### Product Hunt
1. Go to `producthunt.com` → sign up / log in (use your personal account — launches are tied to a person)
2. Create the product: `producthunt.com/products/new` (or "Add a product")
3. Fill in:
   - **Name:** bukkyai
   - **Tagline:** *The AI website builder that hands you the files*
   - **URL:** `https://bukkyai.duckdns.org/`
   - **Logo:** `/icon-512.png`
   - **Topics:** Web App, Artificial Intelligence, Developer Tools, SaaS
   - **Gallery:** your demo video + 3–4 screenshots of the editor
4. **Pick launch day** (a weekday; avoid Fridays). On launch morning (~7am PT), open your product page and click **"Launch now"**
5. Paste the **first comment** below immediately after launching
6. For the next 4 hours: reply to every comment and upvote replies to you

#### Product Hunt first comment
```
Hey PH! 👋 I built bukkyai because most "AI website builders" lock you in.

The flow is simple:
1. Type "a bakery in Austin called June & Oak, warm and artisanal"
2. Approve the plan it shows you
3. Watch it write the whole site — copy, design, every page
4. Edit anything by clicking it, then export the files

What makes it different: your site is real files you own. Single-file HTML,
a static ZIP, or a React project. No lock-in, no credits, no "rebuild with us".

Free to build forever. Pro ($19/mo) adds one-click publishing + your own domain.
Plus ($49.99/mo) for 5 published sites and advanced analytics.

Try the demo bakery site here: https://bukkyai.duckdns.org/made-with
Happy to answer anything — the whole thing is open.
```

### Hacker News — Show HN
1. Go to `news.ycombinator.com` → sign in (needs an HN account with a little karma)
2. Click **submit** (top-right)
3. **Title:** `Show HN: I built an AI website builder that exports open HTML you own`
4. **URL:** leave blank. Paste the **full body below** into the **text** box
5. Post on a **weekday between 9–11am ET**
6. Stay in the thread 3–4 hours answering questions — first-hour engagement decides whether it trends

#### Show HN post body
```
https://bukkyai.duckdns.org/

Describe your business in a sentence. bukkyai plans your site, designs a
design system, writes every page, and gives you back real files — single-file
HTML, a static ZIP, or a React project.

Why I built it: most AI builders trap your site in their platform. I wanted
something where the output is genuinely yours and portable.

Some things it does:
- Plan-first: see the sitemap before anything is built
- Writes full copy in your brand voice (not lorem ipsum)
- Live preview you can edit by clicking
- SEO built in: sitemap, RSS, JSON-LD, OG images, WCAG checks
- Publish to GitHub Pages or your own domain (Pro)

The demo bakery site (fully generated from one line):
https://bukkyai.duckdns.org/made-with

Happy to hear brutal feedback — especially about the design and the pricing.
```

---

## Bonus: Reddit + X posts (stagger across days)

### r/SideProject (link post)
**Title:** `I built an AI website builder that exports plain HTML you own`

**Body:**
```
https://bukkyai.duckdns.org/

Type a sentence about your business → it plans, designs, and writes a complete
multi-page site → you edit it visually → you export the actual files (HTML/ZIP/React).

The core idea: no lock-in. Your site is real files you own, forever.

Demo (generated from one line): https://bukkyai.duckdns.org/made-with

Would love feedback on the onboarding and the pricing tiers.
```

### r/webdev (text post)
**Title:** `Show & Tell: my AI website builder renders static HTML with a plan-first pipeline`

**Body:**
```
I built bukkyai (https://bukkyai.duckdns.org/) — an AI site builder whose output
is a plain blueprint (JSON) rendered to static HTML/CSS at the end.

The pipeline: brief → plan (sitemap + sections) → design system (tokens) →
copy generation → static render. Everything is checkpointed so you can
time-travel any change.

I wanted the export to be boring and portable: single-file HTML, a static ZIP,
or a Vite+React project. No framework of its own, no runtime lock-in.

Genuinely curious what other devs think of the plan-first approach vs the
"just stream a full site" style. Happy to share more about the rendering layer.
```

### r/Entrepreneur (text post)
**Title:** `Solo dev launched an AI website builder — ask me anything about getting to launch`

**Body:**
```
https://bukkyai.duckdns.org/ — an AI website builder that writes the whole
site and hands you the files (no lock-in).

I'm happy to answer questions about building solo, the pricing strategy
(Free / $19 / $49.99), and what's actually working for traffic.
```

### X / Twitter build-in-public thread
1. `I built an AI website builder where you type one sentence and it hands you real HTML files you own. No lock-in, no credits. Here's the thread: 🧵`
2. `The insight: most AI site builders trap your site in their platform. I built the opposite — the output is a boring, portable blueprint that renders to static HTML you can host anywhere.`
3. `Describe it → approve the plan → it writes everything. The bakery demo below was built from one line: "a bakery in Austin, warm and artisanal." No templates, no lorem ipsum. (attach demo video)`
4. `Every site ships with sitemap, RSS, JSON-LD, OG images and WCAG contrast checks out of the box. SEO isn't an add-on, it's the default.`
5. `Try it free: bukkyai.duckdns.org — 6 full templates ready to edit, or start from your own sentence. Feedback welcome, brutal honesty preferred.`

*(Tag @producthunt and @ShowHN on launch day.)*

---

## Launch-day tips that actually matter

- Do PH and HN on **different days** (e.g., PH Monday, HN Wednesday) so each gets full attention.
- Reply fast and humbly — every comment in the first 4 hours.
- Post the r/SideProject post + X thread on the same day as one launch for compounding.
- After the spike: encourage users to publish → every published site is a backlink to bukkyai.
- Watch **Search Console → Performance** after 2–4 weeks and double down on queries getting impressions.

---

## Checklist

- [ ] Request indexing on home + /templates + /compare/wix + /tools + /made-with
- [ ] Record the 30–60s demo video
- [ ] Create the Product Hunt product + upload video/screenshots
- [ ] Launch on Product Hunt (weekday, ~7am PT) + post first comment
- [ ] Post Show HN (weekday, 9–11am ET)
- [ ] Post r/SideProject, r/webdev, r/Entrepreneur (stagger across days)
- [ ] Post the X build-in-public thread
- [ ] Reply to every comment in the first 4 hours
