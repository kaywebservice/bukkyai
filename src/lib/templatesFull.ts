import type { SiteBlueprint } from "./types";
import { footerSection, section, uid } from "./blueprint";
import { DESIGN_PRESETS } from "./presets";

export type FullTemplate = { id: string; name: string; tagline: string; category: string; build: () => SiteBlueprint };

const year = new Date().getFullYear();

const design = (preset: string) =>
  JSON.parse(JSON.stringify(DESIGN_PRESETS.find((p) => p.name === preset)!.system)) as never as SiteBlueprint["design"];

const page = (slug: string, title: string, description: string, sections: Parameters<typeof section>[0] extends never ? never : any[]): SiteBlueprint["pages"][number] => ({
  id: uid("pg"),
  slug,
  title,
  description,
  sections,
});

const post = (slug: string, title: string, excerpt: string, content: string, date: string, category: string, cover = "") => ({
  id: uid("post"), slug, title, excerpt, content, date, category, cover,
});

// ── 1. June & Oak — bakery/café ────────────────────────────────────────────
function bakery(): SiteBlueprint {
  return {
    version: 1,
    meta: { title: "June & Oak — bakery & café, Austin", description: "Wood-fired bread, seasonal pastries and pour-over coffee in East Austin. Baked before dawn, gone by noon.", lang: "en" },
    nav: { links: [
      { label: "Menu", href: "/menu" },
      { label: "Story", href: "/story" },
      { label: "Visit", href: "/visit" },
      { label: "Journal", href: "/journal" },
    ], cta: { label: "Order pickup", href: "/order" } },
    design: design("Cream & Ink"),
    voice: "warm, artisanal, specific",
    pages: [
      page("", "June & Oak", "Wood-fired bread and coffee in East Austin.", [
        section("hero", { layout: "split", eyebrow: "East Austin · Baked before dawn", title: "Bread with a story, coffee worth the walk.", subtitle: "We mill, ferment, and fire everything on site. Sourdough from our 2019 starter, pastries from the season, coffee from small roasters we know by name.", primaryCta: { label: "Order pickup", href: "/order" }, secondaryCta: { label: "See the menu", href: "/menu" }, image: { url: "", alt: "Fresh loaves cooling on the counter" }, trust: "Baked daily · Open Tue–Sun" }),
        section("stats", { heading: "In a typical week", items: [
          { value: "1,400", label: "loaves baked" },
          { value: "600", label: "cups poured" },
          { value: "3am", label: "the oven lights" },
          { value: "100%", label: "sourdough starter, 2019" },
        ] }),
        section("features", { heading: "What's on the counter", subheading: "The lineup rotates with the seasons.", items: [
          { icon: "trophy", title: "House sourdough", desc: "48-hour ferment, stone-milled Texas wheat. Crust that sings." },
          { icon: "sun", title: "Seasonal pastries", desc: "Cardamom knots, stone-fruit danish, olive-oil cake — whatever the market gives us." },
          { icon: "star", title: "Single-origin coffee", desc: "Rotating beans from four small roasters. Filter, espresso, or cold brew." },
          { icon: "heart", title: "Weekend loaves", desc: "Olive-rosemary, dark rye, and a honey-oat that sells out by 9am." },
        ] }),
        section("gallery", { heading: "From the bakery", items: [
          { url: "", alt: "Loaves on the cooling rack", caption: "Saturday bake" },
          { url: "", alt: "Cardamom knots", caption: "The knot, always" },
          { url: "", alt: "Pour over coffee", caption: "Morning pour" },
        ] }),
        section("testimonials", { heading: "Neighbors", items: [
          { quote: "The best sourdough I've had outside of Copenhagen. Worth the walk across the bridge.", name: "Elena R.", role: "Regular since 2021" },
          { quote: "Their cardamom knots are the reason my kids do their homework.", name: "Marcus T.", role: "Saturday family" },
        ] }),
        section("newsletter", { heading: "The proof sheet", subheading: "What's baking this week, every Sunday night. No noise.", placeholder: "you@email.com", button: "Subscribe", note: "4,000 readers" }),
        section("cta", { title: "The oven's on.", subtitle: "Order ahead for pickup, or come see the morning bake in person.", button: { label: "Order pickup", href: "/order" }, note: "Open 7am–2pm, Tue–Sun" }),
        section("contact", { heading: "Find us", subheading: "Corner of Oak & 5th, East Austin.", email: "hello@juneandoak.com", phone: "(512) 555-0122", address: "1305 Oak Ave, Austin, TX", form: { fields: [
          { label: "Name", type: "text", required: true }, { label: "Email", type: "email", required: true }, { label: "Catering inquiry?", type: "textarea", required: false },
        ] }, submitLabel: "Send" }),
        footerSection(`© ${year} June & Oak.`, "Baked before dawn, gone by noon."),
      ]),
      page("menu", "Menu", "This week's bake and coffee list.", [
        section("hero", { layout: "centered", eyebrow: "Menu", title: "This week's counter.", subtitle: "The menu changes with the season and what the market had on Tuesday. Everything is baked in-house.", primaryCta: { label: "Order pickup", href: "/order" }, secondaryCta: { label: "Back home", href: "/" }, image: { url: "", alt: "" }, trust: "Updated every Sunday" }),
        section("features", { heading: "Bread", subheading: "Baked fresh daily.", items: [
          { icon: "trophy", title: "House sourdough", desc: "48-hour ferment, crisp crust, open crumb. $9" },
          { icon: "clock", title: "Dark rye", desc: "Molasses, toasted seeds, 60% rye. $11" },
          { icon: "sun", title: "Olive-rosemary", desc: "Weekend only. Green olives, fresh rosemary. $13" },
          { icon: "star", title: "Honey-oat", desc: "Sells out by 9am most days. $10" },
        ] }),
        section("features", { heading: "Pastries", subheading: "From the morning bake.", items: [
          { icon: "heart", title: "Cardamom knot", desc: "Our signature. Brown-butter glaze. $5" },
          { icon: "sun", title: "Seasonal danish", desc: "Stone-fruit in summer, pear-ginger in winter. $6" },
          { icon: "gem", title: "Olive-oil cake", desc: "Citrus, flaky salt. Gluten-free friendly. $5" },
          { icon: "bolt", title: "Breakfast bun", desc: "Egg, greens, chili crisp. $9" },
        ] }),
        section("pricing", { heading: "Coffee", subheading: "Rotating roasters, dialed in weekly.", currency: "$", period: "", items: [
          { name: "Espresso", price: "4", description: "Single origin, pulled to order.", features: ["12oz cup"], cta: { label: "Order", href: "/order" }, featured: false },
          { name: "Pour over", price: "6", description: "The roaster's tasting recipe, done right.", features: ["V60 or Chemex"], cta: { label: "Order", href: "/order" }, featured: true },
          { name: "Cold brew", price: "5", description: "18-hour steep, never bitter.", features: ["16oz bottle to go"], cta: { label: "Order", href: "/order" }, featured: false },
        ] }),
        section("cta", { title: "Ready when you are.", subtitle: "Skip the line — order ahead and we'll have it bagged at the counter.", button: { label: "Order pickup", href: "/order" }, note: "Order by 8am for 9am pickup" }),
        footerSection(`© ${year} June & Oak.`, "Baked before dawn, gone by noon."),
      ]),
      page("story", "Our story", "Why we bake the way we do.", [
        section("hero", { layout: "centered", eyebrow: "Our story", title: "It started with a starter.", subtitle: "In 2019, June gave Oak a jar of sourdough starter she'd kept alive for two years. We named the bakery after them.", primaryCta: { label: "Read the journal", href: "/journal" }, secondaryCta: { label: "Visit us", href: "/visit" }, image: { url: "", alt: "" }, trust: "" }),
        section("timeline", { heading: "The journey", items: [
          { period: "2019", title: "The first bake", desc: "A pop-up stall at the farmers market, 40 loaves, all gone by 9am." },
          { period: "2021", title: "The shop", desc: "We took over a former auto-shop on Oak Ave and built the oven ourselves." },
          { period: "2023", title: "The mill", desc: "We added a small stone mill and started milling Texas wheat in-house." },
          { period: "Today", title: "The neighborhood", desc: "Same starter, same oven, more neighbors. We still sell out most days." },
        ] }),
        section("features", { heading: "What we believe", items: [
          { icon: "heart", title: "Real fermentation", desc: "Time is the ingredient you can't fake. Every loaf gets a full 48 hours." },
          { icon: "globe", title: "Local first", desc: "Wheat from within 200 miles. Coffee from roasters we can visit on a weekend." },
          { icon: "sun", title: "Seasonal, always", desc: "If it isn't in season, it isn't on the counter. No exceptions." },
        ] }),
        section("cta", { title: "Come taste the story.", subtitle: "The whole story is baked into every loaf.", button: { label: "Visit us", href: "/visit" }, note: "Open Tue–Sun" }),
        footerSection(`© ${year} June & Oak.`, "Baked before dawn, gone by noon."),
      ]),
      page("visit", "Visit", "Hours, location, and getting here.", [
        section("hero", { layout: "centered", eyebrow: "Visit", title: "Come say hi.", subtitle: "Coffee starts at 7am, the pastries follow at 7:30, and the weekend loaves hit the counter at 8.", primaryCta: { label: "Get directions", href: "/visit" }, secondaryCta: { label: "Order ahead", href: "/order" }, image: { url: "", alt: "" }, trust: "Corner of Oak & 5th" }),
        section("map", { heading: "Find us", address: "1305 Oak Ave, Austin, TX", embedUrl: "" }),
        section("features", { heading: "Good to know", items: [
          { icon: "clock", title: "Hours", desc: "Tue–Fri 7am–2pm · Sat–Sun 8am–2pm · Closed Mondays." },
          { icon: "pin", title: "Getting here", desc: "One block from the #7 bus. Bike racks out front, free parking behind." },
          { icon: "star", title: "Dine in or take away", desc: "Four small tables inside, six on the porch. Dogs welcome outside." },
        ] }),
        section("cta", { title: "Skip the line.", subtitle: "Order ahead for pickup — your name's on the bag when you arrive.", button: { label: "Order pickup", href: "/order" }, note: "Usually ready in 15 minutes" }),
        footerSection(`© ${year} June & Oak.`, "Baked before dawn, gone by noon."),
      ]),
      page("order", "Order pickup", "Order ahead for pickup.", [
        section("hero", { layout: "centered", eyebrow: "Order", title: "Order ahead, skip the line.", subtitle: "Tell us what you want and when you'll be here. We'll have it bagged at the counter.", primaryCta: { label: "Order now", href: "/order" }, secondaryCta: { label: "See the menu", href: "/menu" }, image: { url: "", alt: "" }, trust: "" }),
        section("products", { heading: "Order pickup", subheading: "Choose your items, then tell us when to expect you.", currency: "$", items: [
          { id: "sd", name: "House sourdough", price: 9, description: "48-hour ferment, crisp crust.", features: ["Whole loaf"], image: "", badge: "Best seller", sku: "SD" },
          { id: "rye", name: "Dark rye", price: 11, description: "Molasses, toasted seeds.", features: ["Whole loaf"], image: "", sku: "RYE" },
          { id: "olive", name: "Olive-rosemary", price: 13, description: "Weekend only.", features: ["Whole loaf"], image: "", badge: "Weekend", sku: "OLV" },
          { id: "knot", name: "Cardamom knot", price: 5, description: "Brown-butter glaze.", features: ["1 pc"], image: "", badge: "Signature", sku: "KNT" },
          { id: "cf", name: "Cold brew 16oz", price: 5, description: "18-hour steep.", features: ["Bottle"], image: "", sku: "CB" },
          { id: "dan", name: "Seasonal danish", price: 6, description: "This week: stone fruit.", features: ["1 pc"], image: "", sku: "DNS" },
        ] }),
        footerSection(`© ${year} June & Oak.`, "Baked before dawn, gone by noon."),
      ]),
      page("journal", "Journal", "Notes from the bakery.", [
        section("hero", { layout: "centered", eyebrow: "Journal", title: "Notes from the bakery.", subtitle: "Baking, milling, and the occasional strong opinion about croissants.", primaryCta: { label: "", href: "" }, secondaryCta: { label: "Back home", href: "/" }, image: { url: "", alt: "" }, trust: "" }),
        section("posts", { heading: "Latest posts", subheading: "", layout: "grid", postsPerPage: 6, showExcerpt: true, category: "" }),
        footerSection(`© ${year} June & Oak.`, "Baked before dawn, gone by noon."),
      ]),
    ],
    posts: [
      post("why-we-mill", "Why we started milling our own wheat", "Flour is two weeks old when it reaches most bakeries. Here's what changes when you mill it the same morning.", "<p>Most bakeries buy flour that left the mill two weeks ago. By the time it reaches the dough, it has lost a measurable amount of the fats, enzymes, and flavor that make bread taste like something.</p><p>In 2023 we bolted a small stone mill to the floor of the shop. Now the flour for Saturday's bake is milled on Friday night. The bread is rounder, sweeter, and keeps longer. It's more work, but it's the work we want to do.</p>", "2025-03-14", "Baking", ""),
      post("cardamom-knot", "The cardamom knot, explained", "Why we roll it the way we do, and why 11 grams is the number.", "<p>The cardamom knot is 11 grams of freshly ground cardamom folded into a laminated dough with a brown-butter glaze. The 11 grams took us two months to land — too much and the pastry tastes like a candle, too little and it's just sweet bread.</p><p>We grind the cardamom to order. Pre-ground cardamom loses half its aroma within a week, which is why most pastries taste like a vague memory of cardamom.</p>", "2025-02-02", "Pastries", ""),
      post("cold-brew", "A defense of the 18-hour steep", "Cold brew isn't 'coffee but cold'. It's a different extraction, and it deserves a longer timeline.", "<p>Most shops steep cold brew for 12 to 14 hours. We go 18. The extra time pulls out the sugars and chocolate notes without the bitterness that hot water brings.</p><p>The tradeoff is inventory planning — you have to know next week's demand this week. We think it's worth it. The 16oz bottles sell out most weekends.</p>", "2025-01-10", "Coffee", ""),
    ],
  };
}

// ── 2. Northwind — SaaS ────────────────────────────────────────────────────
function saasFull(): SiteBlueprint {
  return {
    version: 1,
    meta: { title: "Northwind — product analytics for teams", description: "Northwind unifies product, marketing, and support data into one dashboard. Set up in ten minutes.", lang: "en" },
    nav: { links: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Customers", href: "/customers" },
      { label: "Blog", href: "/blog" },
    ], cta: { label: "Start free", href: "/signup" } },
    design: design("Alpine"),
    voice: "direct, confident, specific",
    pages: [
      page("", "Northwind", "Product analytics without the setup week.", [
        section("hero", { layout: "split", eyebrow: "New · Northwind 3.0", title: "Your product data, finally in one place.", subtitle: "Product, marketing, and support metrics unified in one dashboard. Set up in ten minutes, not a quarter.", primaryCta: { label: "Start free trial", href: "/signup" }, secondaryCta: { label: "Watch the tour", href: "/features" }, image: { url: "", alt: "Northwind dashboard preview" }, trust: "SOC 2 Type II · 99.9% uptime" }),
        section("logos", { heading: "Powering teams at", items: ["Northbeam", "Lumen", "Octave", "Halcyon", "Brixton", "Kindred"] }),
        section("features", { heading: "Everything your team measures, together", subheading: "Six modules that talk to each other.", items: [
          { icon: "chart", title: "Unified metrics", desc: "One source of truth for activation, retention, and revenue." },
          { icon: "bolt", title: "Event capture", desc: "One SDK line. Works with your existing warehouse." },
          { icon: "users", title: "Cohort analysis", desc: "Retention curves and funnels that update live." },
          { icon: "lock", title: "Enterprise security", desc: "SSO, audit logs, region controls." },
          { icon: "globe", title: "Warehouse-native", desc: "Reads Snowflake, BigQuery, Redshift directly." },
          { icon: "tag", title: "100+ integrations", desc: "Segment, Stripe, HubSpot, Zendesk, and more." },
        ] }),
        section("video", { heading: "See it in action", url: "https://www.youtube.com/embed/xvFZjo5PgG0", caption: "Two-minute tour of Northwind 3.0" }),
        section("stats", { heading: "Why teams switch", items: [
          { value: "10min", label: "median setup time" },
          { value: "40%", label: "less time in reporting" },
          { value: "3.1x", label: "avg. lift in activation" },
          { value: "60+", label: "data sources supported" },
        ] }),
        section("testimonials", { heading: "Customers", items: [
          { quote: "We replaced three tools and a weekly reporting ritual.", name: "Maya Chen", role: "VP Product, Northbeam" },
          { quote: "The cohort analysis found our retention leak in a week.", name: "Dev Patel", role: "Growth Lead, Octave" },
        ] }),
        section("cta", { title: "Your data is ready when you are.", subtitle: "Join 4,000+ product teams tracking numbers the honest way.", button: { label: "Start free trial", href: "/signup" }, note: "14-day Pro trial · No credit card" }),
        section("contact", { heading: "Talk to a human", subheading: "Sales, onboarding, or questions — we answer within a day.", email: "hello@northwind.io", phone: "+1 (415) 555-0192", address: "500 Mission St, San Francisco", form: { fields: [
          { label: "Name", type: "text", required: true }, { label: "Work email", type: "email", required: true }, { label: "Company size", type: "text", required: false }, { label: "Message", type: "textarea", required: true },
        ] }, submitLabel: "Send" }),
        footerSection(`© ${year} Northwind Inc.`, "The analytics layer for product teams."),
      ]),
      page("features", "Features", "Everything Northwind does.", [
        section("hero", { layout: "centered", eyebrow: "Features", title: "Six modules, one dashboard.", subtitle: "Every module reads from your warehouse, so nothing ever drifts out of sync.", primaryCta: { label: "Start free", href: "/signup" }, secondaryCta: { label: "See pricing", href: "/pricing" }, image: { url: "", alt: "" }, trust: "" }),
        section("features", { heading: "Core modules", subheading: "", items: [
          { icon: "chart", title: "Unified metrics", desc: "Activation, retention, revenue — one dashboard, no version-of-the-truth meetings." },
          { icon: "bolt", title: "Event capture", desc: "Auto-capture with a single SDK line on web, iOS, or Android." },
          { icon: "users", title: "Cohort analysis", desc: "Retention curves, funnel steps, segments that update live." },
          { icon: "tag", title: "Integrations", desc: "Segment, Stripe, HubSpot, Zendesk — 100+ and counting." },
          { icon: "globe", title: "Warehouse-native", desc: "Reads Snowflake, BigQuery, or Redshift. We never copy your data." },
          { icon: "lock", title: "Security & compliance", desc: "SSO, audit logs, GDPR tools, SOC 2 Type II." },
        ] }),
        section("comparison", { heading: "Northwind vs the alternatives", subheading: "Same category, different class.", columns: [{ name: "Northwind" }, { name: "Spreadsheets" }, { name: "Legacy BI" }], rows: [
          { label: "Time to first dashboard", values: ["10 minutes", "2 weeks", "1-3 months"] },
          { label: "Real-time data", values: [true, false, "Scheduled"] },
          { label: "Warehouse-native", values: [true, false, true] },
          { label: "Cohort retention", values: [true, "Manual", true] },
          { label: "Pricing transparency", values: [true, true, false] },
        ] }),
        section("cta", { title: "See it with your own data.", subtitle: "Connect a read-only warehouse in ten minutes. No credit card.", button: { label: "Start free", href: "/signup" }, note: "Free forever on 10k events/mo" }),
        footerSection(`© ${year} Northwind Inc.`, "The analytics layer for product teams."),
      ]),
      page("pricing", "Pricing", "Simple, usage-fair pricing.", [
        section("hero", { layout: "centered", eyebrow: "Pricing", title: "Pay for events, not seats.", subtitle: "Free to start. Scales with data, not headcount.", primaryCta: { label: "Start free", href: "/signup" }, secondaryCta: { label: "Talk to sales", href: "/contact" }, image: { url: "", alt: "" }, trust: "" }),
        section("pricing", { heading: "Plans", subheading: "", currency: "$", period: "/mo", items: [
          { name: "Free", price: "0", description: "For side projects.", features: ["10k events/mo", "3 dashboards", "Community support"], cta: { label: "Start free", href: "/signup" }, featured: false },
          { name: "Growth", price: "49", description: "For teams shipping weekly.", features: ["500k events/mo", "Unlimited dashboards", "All integrations", "Email support"], cta: { label: "Start 14-day trial", href: "/signup" }, featured: true },
          { name: "Enterprise", price: "Custom", description: "For organizations at scale.", features: ["Custom volume", "SSO & audit logs", "Dedicated manager", "SLA & on-prem"], cta: { label: "Talk to sales", href: "/contact" }, featured: false },
        ] }),
        section("faq", { heading: "FAQ", items: [
          { q: "How hard is setup, really?", a: "One SDK line. Median time to first dashboard is ten minutes. Enterprise gets white-glove setup." },
          { q: "Can you read our warehouse?", a: "Yes — Snowflake, BigQuery, and Redshift natively. We never require you to copy data." },
          { q: "What if we exceed event volume?", a: "We pause gracefully and warn at 80%. Upgrade instantly, prorated." },
          { q: "Is it GDPR compliant?", a: "Yes. Data residency, deletion workflows, DPA on request." },
        ] }),
        section("cta", { title: "Ready to move off spreadsheets?", subtitle: "14-day Pro trial, no credit card.", button: { label: "Start free trial", href: "/signup" }, note: "Cancel anytime" }),
        footerSection(`© ${year} Northwind Inc.`, "The analytics layer for product teams."),
      ]),
      page("customers", "Customers", "Who uses Northwind.", [
        section("hero", { layout: "centered", eyebrow: "Customers", title: "Loved by product teams.", subtitle: "From seed-stage to public companies, teams trust Northwind with their numbers.", primaryCta: { label: "Start free", href: "/signup" }, secondaryCta: { label: "Read case studies", href: "/blog" }, image: { url: "", alt: "" }, trust: "" }),
        section("logos", { heading: "Trusted by", items: ["Northbeam", "Lumen", "Octave", "Halcyon", "Brixton", "Kindred", "Morrow", "Fathom"] }),
        section("stats", { heading: "The aggregate", items: [
          { value: "4,000+", label: "product teams" },
          { value: "120M", label: "events tracked daily" },
          { value: "99.9%", label: "uptime, last 12 months" },
        ] }),
        section("testimonials", { heading: "In their words", items: [
          { quote: "Northwind replaced three tools and a weekly ritual. Paid for itself in a month.", name: "Maya Chen", role: "VP Product, Northbeam" },
          { quote: "It reads our warehouse directly. No syncing, no drift.", name: "Sarah Kim", role: "Data Lead, Lumen" },
          { quote: "The cohort analysis is how we found our retention leak.", name: "Dev Patel", role: "Growth Lead, Octave" },
          { quote: "Setup took eleven minutes. We timed it.", name: "Jonas Weber", role: "Head of Product, Fathom" },
        ] }),
        section("cta", { title: "Join them.", subtitle: "Set up Northwind with your own data in ten minutes.", button: { label: "Start free", href: "/signup" }, note: "No credit card" }),
        footerSection(`© ${year} Northwind Inc.`, "The analytics layer for product teams."),
      ]),
      page("blog", "Blog", "Product, metrics, and practice.", [
        section("hero", { layout: "centered", eyebrow: "Blog", title: "The Metrics Letter.", subtitle: "Practical analytics for product people.", primaryCta: { label: "", href: "" }, secondaryCta: { label: "Back home", href: "/" }, image: { url: "", alt: "" }, trust: "" }),
        section("posts", { heading: "Latest", subheading: "", layout: "grid", postsPerPage: 6, showExcerpt: true, category: "" }),
        section("newsletter", { heading: "One tip every Friday", subheading: "Read by 9,000 product people.", placeholder: "you@company.com", button: "Subscribe", note: "No spam" }),
        footerSection(`© ${year} Northwind Inc.`, "The analytics layer for product teams."),
      ]),
      page("signup", "Sign up", "Start your free trial.", [
        section("hero", { layout: "centered", eyebrow: "Start free", title: "Your first dashboard in ten minutes.", subtitle: "No credit card. Free forever on 10k events a month.", primaryCta: { label: "Start free", href: "/signup" }, secondaryCta: { label: "Talk to sales", href: "/contact" }, image: { url: "", alt: "" }, trust: "SOC 2 Type II · GDPR-ready" }),
        section("contact", { heading: "Create your account", subheading: "We'll email you setup steps instantly.", email: "hello@northwind.io", phone: "+1 (415) 555-0192", address: "500 Mission St, San Francisco", form: { fields: [
          { label: "Work email", type: "email", required: true }, { label: "Team size", type: "text", required: false }, { label: "What do you want to track?", type: "textarea", required: false },
        ] }, submitLabel: "Start free trial" }),
        footerSection(`© ${year} Northwind Inc.`, "The analytics layer for product teams."),
      ]),
    ],
    posts: [
      post("one-sdk-line", "One SDK line is a feature", "Setup friction is a retention killer. Here's how we made onboarding a ten-minute job.", "<p>Every analytics tool claims easy setup. In practice, most take a week of wiring, schema decisions, and a second meeting to reconcile data.</p><p>Northwind's setup is one SDK line on web or mobile. It auto-captures the core events every product needs, and reads your warehouse for the rest. Ten minutes to first dashboard, median.</p>", "2025-03-20", "Product", ""),
      post("cohorts-not-dashboards", "Cohorts beat dashboards", "A dashboard tells you what happened. A cohort tells you who it happened to.", "<p>Most teams build dashboards first and cohorts never. That's backwards. A retention cohort shows you which activation moment actually predicts a second-week visit — and which one is decoration.</p><p>We run the same cohort math in-house that we ship to customers. It's how we found that the 'invite teammates' step moved retention by 12 points.</p>", "2025-02-11", "Metrics", ""),
      post("warehouse-native", "Why warehouse-native matters", "Copying data out of your warehouse creates drift. Reading it in-place removes a whole class of bugs.", "<p>Every sync tool eventually lies — a column renamed upstream, a scheduled job silently failing. Warehouse-native tools read your Snowflake or BigQuery tables directly, so the number on the dashboard is the number in the database.</p><p>No copy, no drift, no reconciliation meetings.</p>", "2025-01-22", "Architecture", ""),
    ],
  };
}

// ── 3. Atelier — portfolio/agency ───────────────────────────────────────────
function atelier(): SiteBlueprint {
  return {
    version: 1,
    meta: { title: "Atelier — independent design studio", description: "A two-person studio in Lisbon doing brand identity and web design for founders who care about the details.", lang: "en" },
    nav: { links: [
      { label: "Work", href: "/work" },
      { label: "Studio", href: "/studio" },
      { label: "Journal", href: "/journal" },
      { label: "Contact", href: "/contact" },
    ], cta: { label: "Start a project", href: "/contact" } },
    design: design("Linen"),
    voice: "quiet, confident, precise",
    pages: [
      page("", "Atelier", "Brand identity and web design, done carefully.", [
        section("hero", { layout: "centered", eyebrow: "Independent design studio · Lisbon", title: "We make brands that outlast trends.", subtitle: "A two-person studio working with founders who care about the details. Identity, web, and the occasional coffee.", primaryCta: { label: "See the work", href: "/work" }, secondaryCta: { label: "Say hello", href: "/contact" }, image: { url: "", alt: "" }, trust: "Currently booking for Q3" }),
        section("stats", { heading: "Numbers we're proud of", items: [
          { value: "38", label: "projects shipped" },
          { value: "6yr", label: "as a studio" },
          { value: "12", label: "awards & honors" },
          { value: "2", label: "people, on purpose" },
        ] }),
        section("gallery", { heading: "Selected work", items: [
          { url: "", alt: "Identity for a natural wine importer", caption: "Identity · 2025" },
          { url: "", alt: "Website for a ceramicist", caption: "Web · 2025" },
          { url: "", alt: "Packaging for an olive oil producer", caption: "Packaging · 2024" },
          { url: "", alt: "Identity for a record label", caption: "Identity · 2024" },
          { url: "", alt: "Editorial for a design journal", caption: "Editorial · 2023" },
          { url: "", alt: "Wayfinding for a museum", caption: "Wayfinding · 2023" },
        ] }),
        section("features", { heading: "What we do", items: [
          { icon: "gem", title: "Brand identity", desc: "Strategy, naming, and visual systems built to last." },
          { icon: "layers", title: "Web design", desc: "Quiet, fast, accessible sites with real typography." },
          { icon: "megaphone", title: "Art direction", desc: "Campaigns and launches that match the work." },
        ] }),
        section("testimonials", { heading: "Kind words", items: [
          { quote: "They asked better questions than any agency we've used. The brand finally feels like us.", name: "Rita Mendes", role: "Founder, Vindima Wines" },
          { quote: "The website they built is the quietest luxury we own.", name: "Tomás Oliveira", role: "Ceramicist" },
        ] }),
        section("cta", { title: "Have a project worth doing well?", subtitle: "We take on six projects a year. Tell us about yours.", button: { label: "Start a project", href: "/contact" }, note: "Replies within 48 hours" }),
        section("contact", { heading: "Contact", subheading: "A short brief is enough to start.", email: "hello@atelier.studio", phone: "+351 21 555 0145", address: "Rua das Flores 12, Lisbon", form: { fields: [
          { label: "Name", type: "text", required: true }, { label: "Email", type: "email", required: true }, { label: "Budget range", type: "text", required: false }, { label: "The project", type: "textarea", required: true },
        ] }, submitLabel: "Send" }),
        footerSection(`© ${year} Atelier Studio.`, "Designed in Lisbon, slowly."),
      ]),
      page("work", "Work", "Selected projects.", [
        section("hero", { layout: "centered", eyebrow: "Work", title: "Selected projects.", subtitle: "A rotating selection — the full archive lives in the studio.", primaryCta: { label: "Start a project", href: "/contact" }, secondaryCta: { label: "About the studio", href: "/studio" }, image: { url: "", alt: "" }, trust: "" }),
        section("gallery", { heading: "", items: [
          { url: "", alt: "Vindima natural wine identity", caption: "Vindima — identity, packaging, launch" },
          { url: "", alt: "Casa Alva ceramicist website", caption: "Casa Alva — web, art direction" },
          { url: "", alt: "Lago olive oil packaging", caption: "Lago — packaging system" },
          { url: "", alt: "Halcyon record label identity", caption: "Halcyon — identity, typography" },
          { url: "", alt: "Paper journal editorial", caption: "Paper — editorial design" },
          { url: "", alt: "Museu do Mar wayfinding", caption: "Museu do Mar — wayfinding" },
        ] }),
        section("cta", { title: "Your project could be next.", subtitle: "We're booking Q3. Two slots left.", button: { label: "Start a project", href: "/contact" }, note: "Usually 4–10 weeks" }),
        footerSection(`© ${year} Atelier Studio.`, "Designed in Lisbon, slowly."),
      ]),
      page("studio", "Studio", "About the studio.", [
        section("hero", { layout: "centered", eyebrow: "Studio", title: "Two people, one bench.", subtitle: "Marta and Diego. We've worked together for six years and still share the coffee machine without incident.", primaryCta: { label: "Say hello", href: "/contact" }, secondaryCta: { label: "See the work", href: "/work" }, image: { url: "", alt: "" }, trust: "" }),
        section("team", { heading: "The studio", subheading: "", items: [
          { name: "Marta Vidal", role: "Brand & Identity", bio: "Trained in Basel, practiced in London. Believes a logo is the least interesting part of a brand.", photo: "" },
          { name: "Diego Rocha", role: "Web & Type", bio: "Makes type decisions the way other people make small talk.", photo: "" },
        ] }),
        section("timeline", { heading: "How we work", items: [
          { period: "Week 1", title: "Listen", desc: "One long conversation. We map the problem, not the brief." },
          { period: "Weeks 2-4", title: "Design", desc: "Two directions, presented honestly. We push until it's right." },
          { period: "Weeks 5-6", title: "Build", desc: "The web side is built in-house, so what you approve is what ships." },
        ] }),
        section("faq", { heading: "Common questions", items: [
          { q: "Why only two people?", a: "Small means senior on every project, always. No account managers translating." },
          { q: "Do you work internationally?", a: "Yes — half our clients are outside Portugal. Video calls and async notes work fine." },
          { q: "What does it cost?", a: "Identity from €18k, web from €12k. We scope transparently before you sign." },
        ] }),
        section("cta", { title: "Small teams, better work.", subtitle: "That's the whole thesis.", button: { label: "Say hello", href: "/contact" }, note: "Replies within 48 hours" }),
        footerSection(`© ${year} Atelier Studio.`, "Designed in Lisbon, slowly."),
      ]),
      page("journal", "Journal", "Notes on craft.", [
        section("hero", { layout: "centered", eyebrow: "Journal", title: "Notes on craft.", subtitle: "Process, typography, and the occasional rant.", primaryCta: { label: "", href: "" }, secondaryCta: { label: "Back home", href: "/" }, image: { url: "", alt: "" }, trust: "" }),
        section("posts", { heading: "Latest", subheading: "", layout: "list", postsPerPage: 6, showExcerpt: true, category: "" }),
        footerSection(`© ${year} Atelier Studio.`, "Designed in Lisbon, slowly."),
      ]),
      page("contact", "Contact", "Start a project.", [
        section("hero", { layout: "centered", eyebrow: "Contact", title: "Tell us what you're making.", subtitle: "A paragraph is plenty. We reply with honest questions, not a sales call.", primaryCta: { label: "", href: "" }, secondaryCta: { label: "See the work", href: "/work" }, image: { url: "", alt: "" }, trust: "" }),
        section("contact", { heading: "Start a project", subheading: "We read everything.", email: "hello@atelier.studio", phone: "+351 21 555 0145", address: "Rua das Flores 12, Lisbon", form: { fields: [
          { label: "Name", type: "text", required: true }, { label: "Email", type: "email", required: true }, { label: "Company / project", type: "text", required: false }, { label: "Tell us about it", type: "textarea", required: true },
        ] }, submitLabel: "Send" }),
        footerSection(`© ${year} Atelier Studio.`, "Designed in Lisbon, slowly."),
      ]),
    ],
    posts: [
      post("logo-is-not-a-brand", "The logo is not the brand", "A logo is the thumbnail. The brand is the whole film.", "<p>When someone says they need a brand, nine times out of ten they mean a logo. The logo is the thumbnail; the brand is the whole film — the voice, the type, the way the packaging sits in your hand.</p><p>We design the system, then draw the mark. The order matters more than you'd think.</p>", "2025-03-02", "Craft", ""),
      post("type-decisions", "Type decisions are brand decisions", "You can hear a brand before you see it.", "<p>People experience type before color. The headline sets the emotional register before anyone registers the palette. That's why we spend a third of every identity on typography.</p><p>Two fonts, chosen carefully, do more work than a hundred colors.</p>", "2025-02-08", "Typography", ""),
    ],
  };
}

// ── 4. Verdant — eco / wellness ─────────────────────────────────────────────
function verdant(): SiteBlueprint {
  return {
    version: 1,
    meta: { title: "Verdant — botanical wellness", description: "Small-batch botanical skincare and wellness, made with ingredients grown within 150 miles. Plastic-free, refillable, honest.", lang: "en" },
    nav: { links: [
      { label: "Shop", href: "/shop" },
      { label: "Our farm", href: "/farm" },
      { label: "Rituals", href: "/journal" },
      { label: "Contact", href: "/contact" },
    ], cta: { label: "Shop bestsellers", href: "/shop" } },
    design: design("Verde"),
    voice: "calm, grounded, specific",
    pages: [
      page("", "Verdant", "Botanical wellness, grown not manufactured.", [
        section("hero", { layout: "split", eyebrow: "Small-batch · Grown within 150 miles", title: "Skincare that starts in the soil.", subtitle: "We grow the herbs, press the oils, and fill every jar ourselves. No synthetic fragrance, no plastic, no shortcuts.", primaryCta: { label: "Shop bestsellers", href: "/shop" }, secondaryCta: { label: "Visit the farm", href: "/farm" }, image: { url: "", alt: "Herbs growing at the Verdant farm" }, trust: "Refillable · Plastic-free since 2021" }),
        section("stats", { heading: "By the numbers", items: [
          { value: "150mi", label: "ingredient radius" },
          { value: "0", label: "synthetic fragrances" },
          { value: "100%", label: "plastic-free packaging" },
          { value: "4.9", label: "from 3,200 reviews" },
        ] }),
        section("features", { heading: "The line", subheading: "Four products, each with a job.", items: [
          { icon: "heart", title: "Calm Face Oil", desc: "Jojoba, calendula, chamomile. For skin that needs a quiet week." },
          { icon: "sun", title: "Day Balm", desc: "Lightweight SPF-free barrier balm. Sea buckthorn + hemp." },
          { icon: "moon", title: "Night Cream", desc: "Overnight repair with rosehip and frankincense." },
          { icon: "star", title: "Body Butter", desc: "Shea, lavender, and our own calendula oil. A pound a jar." },
        ] }),
        section("products", { heading: "Shop bestsellers", subheading: "Refillable jars, forever.", currency: "$", items: [
          { id: "oil", name: "Calm Face Oil 30ml", price: 38, description: "Jojoba, calendula, chamomile.", features: ["Refillable glass"], image: "", badge: "Best seller", sku: "OIL" },
          { id: "day", name: "Day Balm 50ml", price: 32, description: "Sea buckthorn + hemp barrier.", features: ["Refillable glass"], image: "", sku: "DAY" },
          { id: "night", name: "Night Cream 50ml", price: 44, description: "Rosehip + frankincense.", features: ["Refillable glass"], image: "", badge: "New", sku: "NIGHT" },
          { id: "body", name: "Body Butter 200g", price: 28, description: "Shea, lavender, calendula.", features: ["Refillable glass"], image: "", sku: "BODY" },
          { id: "kit", name: "The Ritual Set", price: 96, description: "Oil + balm, boxed for gifting.", features: ["Save $6", "Gift box"], image: "", badge: "Gift", sku: "KIT" },
        ] }),
        section("testimonials", { heading: "Reviews", items: [
          { quote: "My skin has never been calmer. And the refill program is genius.", name: "Priya S.", role: "Customer for 2 years" },
          { quote: "You can smell the garden in every jar. In the best way.", name: "Tom R.", role: "Verified buyer" },
        ] }),
        section("newsletter", { heading: "The Seasonal Letter", subheading: "What's growing, what's pressing, what's back in stock.", placeholder: "you@email.com", button: "Subscribe", note: "Once a month" }),
        section("cta", { title: "Grow your ritual.", subtitle: "Start with the bestseller or the full ritual set — we'll refill it forever.", button: { label: "Shop the line", href: "/shop" }, note: "Free shipping over $60" }),
        section("contact", { heading: "Questions", subheading: "Ask us anything — a human answers.", email: "hello@verdant.co", phone: "(802) 555-0171", address: "84 Field Road, Richmond, VT", form: { fields: [
          { label: "Name", type: "text", required: true }, { label: "Email", type: "email", required: true }, { label: "Question", type: "textarea", required: true },
        ] }, submitLabel: "Send" }),
        footerSection(`© ${year} Verdant Botanicals.`, "Grown, not manufactured."),
      ]),
      page("shop", "Shop", "The full product line.", [
        section("hero", { layout: "centered", eyebrow: "Shop", title: "The full line.", subtitle: "Every product ships in refillable glass. Refills are 20% less and cost us almost nothing to send.", primaryCta: { label: "", href: "" }, secondaryCta: { label: "Back home", href: "/" }, image: { url: "", alt: "" }, trust: "" }),
        section("products", { heading: "All products", subheading: "", currency: "$", items: [
          { id: "oil", name: "Calm Face Oil 30ml", price: 38, description: "Jojoba, calendula, chamomile.", features: ["Refillable"], image: "", badge: "Best seller", sku: "OIL" },
          { id: "oil-r", name: "Calm Face Oil — refill", price: 30, description: "Same oil, less glass.", features: ["Refill pouch"], image: "", sku: "OILR" },
          { id: "day", name: "Day Balm 50ml", price: 32, description: "Sea buckthorn + hemp.", features: ["Refillable"], image: "", sku: "DAY" },
          { id: "night", name: "Night Cream 50ml", price: 44, description: "Rosehip + frankincense.", features: ["Refillable"], image: "", badge: "New", sku: "NIGHT" },
          { id: "body", name: "Body Butter 200g", price: 28, description: "Shea, lavender, calendula.", features: ["Refillable"], image: "", sku: "BODY" },
          { id: "kit", name: "The Ritual Set", price: 96, description: "Oil + balm, boxed.", features: ["Save $6"], image: "", badge: "Gift", sku: "KIT" },
          { id: "lip", name: "Lip Salve 10g", price: 9, description: "Beeswax, calendula, mint.", features: ["Refillable"], image: "", sku: "LIP" },
        ] }),
        section("faq", { heading: "Shipping & refills", items: [
          { q: "How do refills work?", a: "Mail your jar back in the prepaid pouch, or bring it to a refill station. Refills are 20% less." },
          { q: "Where do you ship?", a: "US and Canada, free over $60. Carbon-neutral via ground shipping." },
          { q: "Are you really plastic-free?", a: "Yes — glass jars, paper labels, kraft boxes, and a paper tape seal. Refill pouches are home-compostable." },
        ] }),
        section("cta", { title: "Start with the ritual.", subtitle: "The set saves $6 and makes a great gift.", button: { label: "Shop the set", href: "/shop" }, note: "Free shipping over $60" }),
        footerSection(`© ${year} Verdant Botanicals.`, "Grown, not manufactured."),
      ]),
      page("farm", "Our farm", "Where it all grows.", [
        section("hero", { layout: "centered", eyebrow: "Our farm", title: "84 acres, four seasons, zero shortcuts.", subtitle: "We grow calendula, chamomile, and sea buckthorn on our own land in Vermont. What we can't grow, we source within 150 miles.", primaryCta: { label: "Shop the harvest", href: "/shop" }, secondaryCta: { label: "Read the journal", href: "/journal" }, image: { url: "", alt: "" }, trust: "Certified organic" }),
        section("stats", { heading: "The farm", items: [
          { value: "84", label: "acres" },
          { value: "12", label: "crops in rotation" },
          { value: "0", label: "synthetic inputs" },
          { value: "6am", label: "harvest starts" },
        ] }),
        section("timeline", { heading: "A year on the farm", items: [
          { period: "Spring", title: "Planting", desc: "Calendula and chamomile go in after the last frost, by hand." },
          { period: "Summer", title: "Harvest", desc: "We pick at dawn and press within hours. The oil is golden within a week." },
          { period: "Autumn", title: "Pressing", desc: "Sea buckthorn and rosehip press, then six weeks of slow infusion." },
          { period: "Winter", title: "Blending", desc: "Small batches, filled by hand. The farm rests, so do we." },
        ] }),
        section("gallery", { heading: "From the fields", items: [
          { url: "", alt: "Calendula in bloom", caption: "June, first flush" },
          { url: "", alt: "Harvest baskets at dawn", caption: "Harvest day" },
          { url: "", alt: "The pressing room", caption: "Cold-press, same day" },
        ] }),
        section("cta", { title: "Meet the harvest.", subtitle: "The oil this year tastes (and smells) like the field it came from.", button: { label: "Shop the line", href: "/shop" }, note: "Small batches sell out" }),
        footerSection(`© ${year} Verdant Botanicals.`, "Grown, not manufactured."),
      ]),
      page("journal", "Rituals", "How to use the line.", [
        section("hero", { layout: "centered", eyebrow: "Rituals", title: "A simpler routine.", subtitle: "Three steps, morning and night. The journal explains the why.", primaryCta: { label: "", href: "" }, secondaryCta: { label: "Shop the line", href: "/shop" }, image: { url: "", alt: "" }, trust: "" }),
        section("posts", { heading: "From the journal", subheading: "", layout: "grid", postsPerPage: 6, showExcerpt: true, category: "" }),
        footerSection(`© ${year} Verdant Botanicals.`, "Grown, not manufactured."),
      ]),
      page("contact", "Contact", "Get in touch.", [
        section("hero", { layout: "centered", eyebrow: "Contact", title: "Questions, wholesale, or press.", subtitle: "We answer everything within a day.", primaryCta: { label: "", href: "" }, secondaryCta: { label: "Back home", href: "/" }, image: { url: "", alt: "" }, trust: "" }),
        section("contact", { heading: "Say hello", subheading: "", email: "hello@verdant.co", phone: "(802) 555-0171", address: "84 Field Road, Richmond, VT", form: { fields: [
          { label: "Name", type: "text", required: true }, { label: "Email", type: "email", required: true }, { label: "I'm a…", type: "text", required: false }, { label: "Message", type: "textarea", required: true },
        ] }, submitLabel: "Send" }),
        footerSection(`© ${year} Verdant Botanicals.`, "Grown, not manufactured."),
      ]),
    ],
    posts: [
      post("three-steps", "Three steps is a routine", "Skin doesn't need a ten-step routine. It needs consistency and the right oils.", "<p>Our whole line is four products. That's deliberate. The science on topical botanicals favors consistency over complexity — the oil that gets applied every day beats the serum applied once.</p><p>Morning: balm. Night: cream. Twice a week: face oil. Everything else is a luxury, not a need.</p>", "2025-03-09", "Ritual", ""),
      post("harvest-dawn", "Why we harvest at dawn", "The essential oils are strongest in the cool hours. It's not romance, it's chemistry.", "<p>Calendula's resin peaks in the early morning, before the sun draws the moisture out of the petals. We pick between six and nine, and the flowers go into the press within two hours.</p><p>It's more expensive to do it this way. It's also the difference between an oil that smells like a garden and one that smells like a warehouse.</p>", "2025-02-15", "Farm", ""),
      post("no-fragrance", "Why there's no fragrance in our bottles", "We don't add scent. The plants provide it.", "<p>Most 'natural' brands add botanical fragrance to standardize the smell batch to batch. We don't. That means each batch smells slightly different — because it is.</p><p>It's a feature. The oil from June's calendula smells like June. The plants did the work; we just didn't undo it.</p>", "2025-01-18", "Craft", ""),
    ],
  };
}

// ── 5. Harbor — boutique hotel ──────────────────────────────────────────────
function harbor(): SiteBlueprint {
  return {
    version: 1,
    meta: { title: "Harbor House — boutique hotel, Portland", description: "A 14-room boutique hotel a block from the waterfront. Rooms from $189, breakfast on the house, and a staff that remembers your name.", lang: "en" },
    nav: { links: [
      { label: "Rooms", href: "/rooms" },
      { label: "Stay", href: "/stay" },
      { label: "Eat & drink", href: "/dining" },
      { label: "Book", href: "/book" },
    ], cta: { label: "Book a room", href: "/book" } },
    design: design("Midnight Garden"),
    voice: "warm, understated, precise",
    pages: [
      page("", "Harbor House", "A quiet hotel by the water.", [
        section("hero", { layout: "split", eyebrow: "Portland waterfront · 14 rooms", title: "Small enough to remember your name.", subtitle: "Fourteen rooms, a real fireplace, and breakfast on the house. A block from the water, a world from the chain hotels.", primaryCta: { label: "Book a room", href: "/book" }, secondaryCta: { label: "See the rooms", href: "/rooms" }, image: { url: "", alt: "The Harbor House lobby" }, trust: "From $189/night · Breakfast included" }),
        section("stats", { heading: "The house", items: [
          { value: "14", label: "rooms, all different" },
          { value: "189", label: "from, per night" },
          { value: "4.8", label: "guest rating" },
          { value: "1", label: "block to the water" },
        ] }),
        section("features", { heading: "What's included", subheading: "No resort fees, ever.", items: [
          { icon: "heart", title: "Breakfast", desc: "Full breakfast, served 7–10, on the house." },
          { icon: "sun", title: "The veranda", desc: "Water views, Adirondack chairs, strong coffee." },
          { icon: "clock", title: "Late checkout", desc: "Noon, every day, included. You're on vacation." },
          { icon: "globe", title: "Local concierge", desc: "Not call centers — actual Portland people." },
        ] }),
        section("gallery", { heading: "The house", items: [
          { url: "", alt: "The lobby fireplace", caption: "The fireplace, lit October–April" },
          { url: "", alt: "A waterfront view room", caption: "Room 7 — the best view" },
          { url: "", alt: "Breakfast on the veranda", caption: "Breakfast, 8am" },
        ] }),
        section("testimonials", { heading: "Guests", items: [
          { quote: "The staff remembered my coffee order by day two. That's the whole review.", name: "Claire M.", role: "Stayed 4 nights" },
          { quote: "Quietest hotel room I've slept in. And I travel 40 weeks a year.", name: "Andrew P.", role: "Business traveler" },
        ] }),
        section("cta", { title: "The water's right there.", subtitle: "Book direct for the best rate and a free room upgrade when available.", button: { label: "Book a room", href: "/book" }, note: "Best rate guaranteed · Free cancellation" }),
        section("contact", { heading: "Questions?", subheading: "We answer the phone. Try us.", email: "hello@harborhouse.pdx", phone: "(503) 555-0163", address: "101 Harbor Lane, Portland, OR", form: { fields: [
          { label: "Name", type: "text", required: true }, { label: "Email", type: "email", required: true }, { label: "Question", type: "textarea", required: true },
        ] }, submitLabel: "Send" }),
        footerSection(`© ${year} Harbor House.`, "A quiet hotel by the water."),
      ]),
      page("rooms", "Rooms", "Fourteen rooms, none identical.", [
        section("hero", { layout: "centered", eyebrow: "Rooms", title: "Fourteen rooms, none identical.", subtitle: "Every room has its own layout, its own view, its own personality. That's the point.", primaryCta: { label: "Book a room", href: "/book" }, secondaryCta: { label: "Back home", href: "/" }, image: { url: "", alt: "" }, trust: "" }),
        section("pricing", { heading: "The rooms", subheading: "All rates include breakfast and the veranda.", currency: "$", period: "/night", items: [
          { name: "Cove", price: "189", description: "Compact and quiet. Garden view.", features: ["Queen bed", "Garden view", "Rain shower"], cta: { label: "Book", href: "/book" }, featured: false },
          { name: "Waterfront", price: "259", description: "The best views in the house.", features: ["King bed", "Water view", "Soaking tub", "Balcony"], cta: { label: "Book", href: "/book" }, featured: true },
          { name: "The Lighthouse", price: "329", description: "Our two-room suite, top floor.", features: ["Separate sitting room", "Corner windows", "Fireplace", "Late checkout"], cta: { label: "Book", href: "/book" }, featured: false },
        ] }),
        section("features", { heading: "Every room has", items: [
          { icon: "heart", title: "Real amenities", desc: "Bathrobes, pour-over coffee, and a record player in every room." },
          { icon: "lock", title: "No resort fees", desc: "The price is the price. We hate fees as much as you do." },
          { icon: "clock", title: "24/7 front desk", desc: "A human, in the building, all night." },
        ] }),
        section("cta", { title: "Pick your room.", subtitle: "Book direct and we'll upgrade you when we can.", button: { label: "Book a room", href: "/book" }, note: "Free cancellation until 48h before" }),
        footerSection(`© ${year} Harbor House.`, "A quiet hotel by the water."),
      ]),
      page("stay", "Stay", "Everything you need for the stay.", [
        section("hero", { layout: "centered", eyebrow: "Your stay", title: "Everything's handled.", subtitle: "Parking, bikes, a packed breakfast for early flights. Ask at the desk, it's usually already arranged.", primaryCta: { label: "Book", href: "/book" }, secondaryCta: { label: "See the rooms", href: "/rooms" }, image: { url: "", alt: "" }, trust: "" }),
        section("features", { heading: "Amenities", items: [
          { icon: "clock", title: "Breakfast 7–10", desc: "Hot breakfast, on the house, plus a grab-and-go bar for early risers." },
          { icon: "sun", title: "Bikes free", desc: "Six cruisers, helmets, and a map of the waterfront loop." },
          { icon: "pin", title: "Parking", desc: "$12/night, in the building. Electric charging in two spots." },
          { icon: "globe", title: "Airport pickup", desc: "Ask at the desk — we drive a very comfortable van." },
        ] }),
        section("timeline", { heading: "A day at Harbor House", items: [
          { period: "7:00", title: "Breakfast", desc: "The veranda, water view, eggs from the farm down the road." },
          { period: "10:00", title: "The waterfront", desc: "Bikes ready. The loop takes an hour, casual pace." },
          { period: "6:00", title: "Dinner", desc: "Walk to the pier — we'll make a reservation you'll like." },
          { period: "21:00", title: "The fireplace", desc: "Cocktails, records, and no TVs in the common rooms." },
        ] }),
        section("faq", { heading: "Staying with us", items: [
          { q: "Can I check in early?", a: "If your room is ready, yes. If not, you can leave bags and use the veranda." },
          { q: "Are pets welcome?", a: "Yes — two dog-friendly rooms, no fee. Just tell us when you book." },
          { q: "Is breakfast really included?", a: "Yes, full breakfast for two included in every rate. The kitchen runs 7–10." },
        ] }),
        section("cta", { title: "Your room is waiting.", subtitle: "Book direct for the best rate.", button: { label: "Book a room", href: "/book" }, note: "Best rate guaranteed" }),
        footerSection(`© ${year} Harbor House.`, "A quiet hotel by the water."),
      ]),
      page("dining", "Eat & drink", "The kitchen and the bar.", [
        section("hero", { layout: "centered", eyebrow: "Eat & drink", title: "The kitchen's open to everyone.", subtitle: "You don't have to be a guest to have dinner here. The dining room does 40 covers a night, most of them locals.", primaryCta: { label: "Book a table", href: "/book" }, secondaryCta: { label: "Back home", href: "/" }, image: { url: "", alt: "" }, trust: "" }),
        section("features", { heading: "On the menu", items: [
          { icon: "star", title: "The chowder", desc: "The famous one. $12, with a story." },
          { icon: "sun", title: "Catch of the day", desc: "Whatever the boat brought in this morning." },
          { icon: "heart", title: "Oysters", desc: "From the bay, shucked to order." },
          { icon: "clock", title: "Sunday supper", desc: "$35 fixed menu, family style, every Sunday." },
        ] }),
        section("timeline", { heading: "Hours", items: [
          { period: "Breakfast", title: "7:00–10:00", desc: "Guests only, included." },
          { period: "Lunch", title: "11:30–14:30", desc: "Open to all." },
          { period: "Dinner", title: "17:00–21:30", desc: "Open to all. The chowder runs out most nights." },
          { period: "Bar", title: "16:00–23:00", desc: "Local beers, proper martinis, and a good pour of whiskey." },
        ] }),
        section("cta", { title: "Come for the chowder.", subtitle: "Book a table online — the dining room fills up on weekends.", button: { label: "Book a table", href: "/book" }, note: "Kitchen closes 21:30" }),
        footerSection(`© ${year} Harbor House.`, "A quiet hotel by the water."),
      ]),
      page("book", "Book", "Reserve your room.", [
        section("hero", { layout: "centered", eyebrow: "Book", title: "Book your stay.", subtitle: "Direct is always the best rate — guaranteed, with free cancellation until 48 hours out.", primaryCta: { label: "", href: "" }, secondaryCta: { label: "See the rooms", href: "/rooms" }, image: { url: "", alt: "" }, trust: "" }),
        section("booking", { heading: "Check availability", subheading: "Or call us — a human answers.", embedUrl: "", buttonLabel: "Book now", note: "Best rate guaranteed", formFields: [
          { label: "Name", type: "text", required: true },
          { label: "Email", type: "email", required: true },
          { label: "Check-in", type: "date", required: true },
          { label: "Nights", type: "number", required: false },
          { label: "Notes", type: "textarea", required: false },
        ] }),
        footerSection(`© ${year} Harbor House.`, "A quiet hotel by the water."),
      ]),
    ],
    posts: [
      post("the-chowder", "The history of our chowder", "It started as a way to use up a boat's worth of clams in 1987.", "<p>The chowder recipe came with the building. In 1987 the original owner, a fisherman named Walt, used the first batch to pay off a bet he'd lost to a clam boat.</p><p>Four decades later it's the same base — cream, bacon, thyme, and whatever the bay gives us. We still sell out most nights, and Walt still comes in on Sundays.</p>", "2025-03-05", "Kitchen", ""),
      post("records-in-rooms", "Why every room has a record player", "Because the TV was making the rooms feel like every other hotel.", "<p>When we took over Harbor House we pulled every TV out of the rooms. Guests stared at us like we'd taken the towels.</p><p>We put record players in instead, with a shelf of local jazz and blues. The guests who were mad about the TVs now ask which room has the Nina Simone collection.</p>", "2025-02-01", "House", ""),
    ],
  };
}

// ── 6. Metro — restaurant/bar ───────────────────────────────────────────────
function metro(): SiteBlueprint {
  return {
    version: 1,
    meta: { title: "Metro — kitchen & bar, Chicago", description: "A neighborhood kitchen and bar on Division Street. Open late, unpretentious, and the burger is a genuine argument.", lang: "en" },
    nav: { links: [
      { label: "Menu", href: "/menu" },
      { label: "Hours", href: "/hours" },
      { label: "Events", href: "/events" },
      { label: "Reserve", href: "/reserve" },
    ], cta: { label: "Reserve a table", href: "/reserve" } },
    design: design("Carbon"),
    voice: "bold, direct, funny",
    pages: [
      page("", "Metro", "Kitchen & bar, open late.", [
        section("hero", { layout: "split", eyebrow: "Division Street · Open late", title: "The neighborhood spot that's actually good.", subtitle: "Sharp kitchen, honest drinks, and a burger that's a genuine argument. Open till 1am, kitchen till midnight.", primaryCta: { label: "Reserve a table", href: "/reserve" }, secondaryCta: { label: "See the menu", href: "/menu" }, image: { url: "", alt: "The Metro bar at night" }, trust: "Open 7 days · Kitchen till midnight" }),
        section("stats", { heading: "In a normal week", items: [
          { value: "1,900", label: "burgers served" },
          { value: "40", label: "draft lines" },
          { value: "1am", label: "last call" },
          { value: "0", label: "pretensions" },
        ] }),
        section("features", { heading: "Why people come back", items: [
          { icon: "trophy", title: "The Metro burger", desc: "Dry-aged beef, caramelized onions, a sauce with a following." },
          { icon: "star", title: "40 draft lines", desc: "Local, weird, and well-kept. Ask for the bartender's pick." },
          { icon: "clock", title: "Open late", desc: "Kitchen till midnight, seven nights. Night-shift people need dinner too." },
          { icon: "users", title: "The room", desc: "Booths, a long bar, and a jukebox that takes requests. Cash only on the jukebox." },
        ] }),
        section("testimonials", { heading: "Word on the street", items: [
          { quote: "The best burger in Chicago and it's not close.", name: "Eater Chicago", role: "Review" },
          { quote: "We came for the burger, stayed for the beer list, moved here for the fries.", name: "Sam & Jo", role: "Regulars" },
        ] }),
        section("cta", { title: "The kitchen's open.", subtitle: "Walk in or reserve — the bar is always first-come.", button: { label: "Reserve a table", href: "/reserve" }, note: "Kitchen till midnight" }),
        section("contact", { heading: "Find us", subheading: "On Division between the dive and the laundromat.", email: "hello@metrochicago.com", phone: "(312) 555-0188", address: "2010 W Division St, Chicago, IL", form: { fields: [
          { label: "Name", type: "text", required: true }, { label: "Email", type: "email", required: true }, { label: "Private event?", type: "textarea", required: false },
        ] }, submitLabel: "Send" }),
        footerSection(`© ${year} Metro Kitchen & Bar.`, "Open late. Bring friends."),
      ]),
      page("menu", "Menu", "The full menu.", [
        section("hero", { layout: "centered", eyebrow: "Menu", title: "The menu.", subtitle: "Comfort food, executed properly. The menu changes seasonally but the burger is permanent.", primaryCta: { label: "Reserve", href: "/reserve" }, secondaryCta: { label: "Back home", href: "/" }, image: { url: "", alt: "" }, trust: "" }),
        section("features", { heading: "Starters", subheading: "", items: [
          { icon: "star", title: "Whiskey wings", desc: "Double-fried, whiskey glaze, pickled celery. $14" },
          { icon: "heart", title: "Duck fat fries", desc: "The default. With malt vinegar salt. $9" },
          { icon: "sun", title: "The wedge", desc: "Iceberg, blue cheese, bacon, buttermilk. Classic. $12" },
        ] }),
        section("features", { heading: "Mains", subheading: "", items: [
          { icon: "trophy", title: "The Metro burger", desc: "Dry-aged beef, caramelized onion, secret sauce. $19" },
          { icon: "clock", title: "Chicken & waffles", desc: "Buttermilk fried, honey butter, hot sauce. $18" },
          { icon: "globe", title: "Steak frites", desc: "Hanger steak, duck fat fries, peppercorn. $28" },
          { icon: "heart", title: "The vegetarian", desc: "Crispy mushroom, swiss, aioli. Unapologetically not a sad salad. $17" },
        ] }),
        section("pricing", { heading: "Bar", subheading: "40 drafts, plus a serious back bar.", currency: "$", period: "", items: [
          { name: "Draft beer", price: "6", description: "Rotating local list, 10oz or pint.", features: ["40 lines"], cta: { label: "Come in", href: "/reserve" }, featured: false },
          { name: "The Metro Mule", price: "12", description: "Ginger, lime, the good vodka.", features: ["House favorite"], cta: { label: "Come in", href: "/reserve" }, featured: true },
          { name: "Whiskey, neat", price: "10", description: "Pick from 60. We'll have opinions.", features: ["60 pours"], cta: { label: "Come in", href: "/reserve" }, featured: false },
        ] }),
        section("cta", { title: "Hungry yet?", subtitle: "Reserve a booth or just walk in — the bar seats are first-come.", button: { label: "Reserve a table", href: "/reserve" }, note: "Kitchen till midnight" }),
        footerSection(`© ${year} Metro Kitchen & Bar.`, "Open late. Bring friends."),
      ]),
      page("hours", "Hours", "When we're open.", [
        section("hero", { layout: "centered", eyebrow: "Hours", title: "Open late, every day.", subtitle: "Kitchen till midnight. Bar till 1am. The jukebox is none of our business after that.", primaryCta: { label: "Reserve", href: "/reserve" }, secondaryCta: { label: "Back home", href: "/" }, image: { url: "", alt: "" }, trust: "" }),
        section("features", { heading: "This week", items: [
          { icon: "clock", title: "Monday–Thursday", desc: "Kitchen 5pm–midnight · Bar till 1am" },
          { icon: "star", title: "Friday–Saturday", desc: "Kitchen 4pm–1am · Bar till 2am" },
          { icon: "sun", title: "Sunday", desc: "Brunch 10am–2pm · Kitchen till 11pm" },
        ] }),
        section("map", { heading: "Find us", address: "2010 W Division St, Chicago, IL", embedUrl: "" }),
        section("cta", { title: "See you after work.", subtitle: "Happy hour, 5–7, Monday to Friday. Half the draft list.", button: { label: "Reserve", href: "/reserve" }, note: "Walk-ins always welcome" }),
        footerSection(`© ${year} Metro Kitchen & Bar.`, "Open late. Bring friends."),
      ]),
      page("events", "Events", "Live music and nonsense.", [
        section("hero", { layout: "centered", eyebrow: "Events", title: "Live music, trivia, and nonsense.", subtitle: "Tuesday trivia, Thursday jazz, Sunday vinyl brunch. Free unless noted.", primaryCta: { label: "", href: "" }, secondaryCta: { label: "Back home", href: "/" }, image: { url: "", alt: "" }, trust: "" }),
        section("timeline", { heading: "The calendar", items: [
          { period: "Tuesdays", title: "Trivia", desc: "7pm. Prizes are bar tabs. Teams of six max, no phone-based cheating (we check)." },
          { period: "Thursdays", title: "Jazz night", desc: "9pm. Local trio, no cover, the good whiskey comes out." },
          { period: "Sundays", title: "Vinyl brunch", desc: "10am–2pm. Guests bring records, we make breakfast." },
          { period: "Monthly", title: "Beer dinner", desc: "Five courses, five local breweries. $65, books out fast." },
        ] }),
        section("cta", { title: "Host your thing here.", subtitle: "The back room seats 40. Birthday, launch, bad idea — we've seen worse.", button: { label: "Book the back room", href: "/reserve" }, note: "Private events on Tuesdays" }),
        footerSection(`© ${year} Metro Kitchen & Bar.`, "Open late. Bring friends."),
      ]),
      page("reserve", "Reserve", "Book a table.", [
        section("hero", { layout: "centered", eyebrow: "Reserve", title: "Reserve a table.", subtitle: "The bar is always first-come. The booths you should book. Parties of 7+ call us directly.", primaryCta: { label: "", href: "" }, secondaryCta: { label: "See the menu", href: "/menu" }, image: { url: "", alt: "" }, trust: "" }),
        section("booking", { heading: "Book a table", subheading: "We confirm by text within the hour.", embedUrl: "", buttonLabel: "Request table", note: "Kitchen till midnight", formFields: [
          { label: "Name", type: "text", required: true },
          { label: "Email", type: "email", required: true },
          { label: "Party size", type: "number", required: true },
          { label: "Date", type: "date", required: true },
          { label: "Notes", type: "textarea", required: false },
        ] }),
        footerSection(`© ${year} Metro Kitchen & Bar.`, "Open late. Bring friends."),
      ]),
    ],
    posts: [
      post("the-burger", "In defense of our burger", "A dry-aged patty, a sauce with a following, and why we will never add a 'plant-based' option to the permanent menu.", "<p>The Metro burger is a dry-aged half-pound patty, caramelized onions, house cheese, and a sauce people write to us about. It's been on the menu since 2012 and it will be on the menu in 2042.</p><p>We change everything else seasonally. The burger is the constant. It's the whole argument of the place: do the one thing, do it properly.</p>", "2025-03-12", "Kitchen", ""),
      post("duck-fat-fries", "Why the fries are the best thing", "Duck fat is not a garnish. It's the entire point.", "<p>We render our own duck fat in-house and fry the potatoes in it, twice, at two temperatures. That's the whole recipe.</p><p>It costs more than oil and it's worth every cent of it. The fries are the thing people talk about more than the burger, which we find slightly annoying and completely fair.</p>", "2025-02-19", "Kitchen", ""),
      post("night-shift", "A defense of the 1am kitchen", "Hospitals, theaters, and bands all end at midnight. Someone should be feeding them.", "<p>We keep the kitchen open till midnight because we've been that person — the one getting off at 11pm with nothing open but a gas station.</p><p>The late menu is real food, not a sad hour of frozen appetizers. It's a small thing, but it's the kind of small thing that makes a neighborhood a neighborhood.</p>", "2025-01-27", "House", ""),
    ],
  };
}

export const FULL_TEMPLATES: FullTemplate[] = [
  { id: "tpl-bakery", name: "June & Oak", tagline: "Bakery & café — 6 pages, menu, orders", category: "Food & Drink", build: bakery },
  { id: "tpl-saas", name: "Northwind", tagline: "SaaS product — 6 pages, pricing, blog", category: "Tech & SaaS", build: saasFull },
  { id: "tpl-atelier", name: "Atelier", tagline: "Design studio — portfolio, journal, contact", category: "Portfolio & Agency", build: atelier },
  { id: "tpl-verdant", name: "Verdant", tagline: "Wellness brand — shop, farm story, journal", category: "Shop & E-commerce", build: verdant },
  { id: "tpl-harbor", name: "Harbor House", tagline: "Boutique hotel — rooms, stay, dining, booking", category: "Hospitality", build: harbor },
  { id: "tpl-metro", name: "Metro", tagline: "Restaurant & bar — menu, hours, events", category: "Food & Drink", build: metro },
];

export function fullTemplateById(id: string): FullTemplate | undefined {
  return FULL_TEMPLATES.find((t) => t.id === id);
}
