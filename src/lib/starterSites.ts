import type { SiteBlueprint } from "./types";
import { footerSection, section, uid } from "./blueprint";
import { DESIGN_PRESETS } from "./presets";

export type StarterSite = { id: string; name: string; tagline: string; build: () => SiteBlueprint };

const year = new Date().getFullYear();

export const STARTER_SITES: StarterSite[] = [
  {
    id: "agency",
    name: "Design Studio",
    tagline: "Award-winning branding & web studio",
    build: () => ({
      version: 1,
      meta: { title: "Form & Matter — design studio", description: "Brand identity and web design for companies that refuse to blend in. Studios in London and New York.", lang: "en" },
      nav: { links: [
        { label: "Work", href: "#gallery" },
        { label: "Studio", href: "#team" },
        { label: "Process", href: "#timeline" },
        { label: "FAQ", href: "#faq" },
      ], cta: { label: "Start a project", href: "#contact" } },
      design: JSON.parse(JSON.stringify(DESIGN_PRESETS.find((p) => p.name === "Cream & Ink")!.system)) as never as SiteBlueprint["design"],
      voice: "confident, warm, no jargon",
      pages: [{
        id: uid("pg"), slug: "", title: "Form & Matter", description: "Brand identity and web design for companies that refuse to blend in.",
        sections: [
          section("hero", { layout: "split", eyebrow: "Brand · Web · Campaigns", title: "We build brands people remember.", subtitle: "A senior team of 12 working directly with founders — no account managers, no hand-offs, no templates.", primaryCta: { label: "Start a project", href: "#contact" }, secondaryCta: { label: "See the work", href: "#gallery" }, image: { url: "", alt: "Recent brand identity work" }, trust: "Recipient of 14 industry awards since 2019" }),
          section("logos", { heading: "Selected clients", items: ["Northbeam", "Kindred", "Lumen", "Octave", "Halcyon", "Brixton"] }),
          section("gallery", { heading: "Selected work", items: [
            { url: "", alt: "Identity for a fermented drinks brand", caption: "Identity · 2025" },
            { url: "", alt: "Website for a research institute", caption: "Web · 2025" },
            { url: "", alt: "Packaging system for a tea company", caption: "Packaging · 2024" },
            { url: "", alt: "Campaign for a music festival", caption: "Campaign · 2024" },
            { url: "", alt: "Rebrand for a logistics firm", caption: "Rebrand · 2023" },
            { url: "", alt: "Editorial design for a journal", caption: "Editorial · 2023" },
          ] }),
          section("features", { heading: "What we do", subheading: "Three disciplines, one team.", items: [
            { icon: "gem", title: "Brand identity", desc: "Strategy, naming, and visual systems that hold up for a decade, not a quarter." },
            { icon: "layers", title: "Web design", desc: "Marketing sites that load fast, rank well, and convert. Designed in-house, built by us." },
            { icon: "megaphone", title: "Campaigns", desc: "Launch moments and seasonal work that move product and build buzz." },
          ] }),
          section("stats", { heading: "The track record", items: [
            { value: "14", label: "industry awards" },
            { value: "96", label: "projects shipped" },
            { value: "82%", label: "clients return for round two" },
            { value: "4.2yr", label: "average client relationship" },
          ] }),
          section("team", { heading: "The studio", subheading: "Senior people, no juniors-in-training on client work.", items: [
            { name: "Amara Chen", role: "Founder", bio: "Ex-Wolff Olins. Believes identity is behaviour, not just a logo.", photo: "" },
            { name: "Marcus Webb", role: "Creative Director", bio: "Typographer first, everything else second.", photo: "" },
            { name: "Lena Novak", role: "Head of Web", bio: "Has deleted more carousels than most people have shipped.", photo: "" },
            { name: "Omar Farouk", role: "Strategy Lead", bio: "Reads the room, the market, and the quarterly report.", photo: "" },
          ] }),
          section("timeline", { heading: "How we work", subheading: "A process with no surprises.", items: [
            { period: "Week 1", title: "Listen", desc: "Deep-dive workshops with your team. We map the business problem, not the brief." },
            { period: "Week 2-4", title: "Design", desc: "Two rounds of concepts. We push until it's right, then we refine it." },
            { period: "Week 5-6", title: "Build", desc: "Design-accurate build, in-house. You see a working site, not a mockup." },
            { period: "Week 7", title: "Launch & beyond", desc: "Launch support, then a 90-day care window included with every project." },
          ] }),
          section("testimonials", { heading: "Kind words", items: [
            { quote: "They asked better questions than any agency we'd worked with. The work shipped on time and the brand finally feels like us.", name: "Sofia Marino", role: "CMO, Northbeam" },
            { quote: "The site they built paid for itself in six weeks. Our conversion rate went up 40%.", name: "James Liu", role: "CEO, Lumen" },
            { quote: "Senior people on every call. No account managers translating for us.", name: "Nadia Hassan", role: "Founder, Kindred" },
          ] }),
          section("faq", { heading: "Common questions", items: [
            { q: "What does a project cost?", a: "Brand identity starts at $28k, web projects at $18k, campaigns at $12k. We scope transparently before you sign." },
            { q: "How long does a project take?", a: "Most engagements run 6-8 weeks. Brand + web together usually lands at 10 weeks." },
            { q: "Do you work with early-stage startups?", a: "Yes — we cap equity offers and keep a few 'founder rate' slots open each quarter." },
            { q: "Who actually does the work?", a: "The people you meet in the pitch. We don't staff up with freelancers we haven't worked with." },
          ] }),
          section("cta", { title: "Have something worth building?", subtitle: "We take on 8 projects per quarter. Tell us about yours — the first call is free.", button: { label: "Book a call", href: "#contact" }, note: "Senior people on every call" }),
          section("contact", { heading: "Start a project", subheading: "Tell us what you're building. We reply within 48 hours.", email: "hello@formandmatter.co", phone: "+44 20 7946 0101", address: "11 Hanbury Street, London", form: { fields: [
            { label: "Name", type: "text", required: true }, { label: "Email", type: "email", required: true }, { label: "Budget range", type: "text", required: false }, { label: "Message", type: "textarea", required: true },
          ] }, submitLabel: "Send project brief" }),
          footerSection(`© ${year} Form & Matter Studio Ltd.`, "Identity is behaviour."),
        ],
      }],
    }),
  },
  {
    id: "saas",
    name: "SaaS Landing",
    tagline: "Product landing page, enterprise-ready",
    build: () => ({
      version: 1,
      meta: { title: "Stackline — the analytics layer for product teams", description: "Stackline unifies your product, marketing, and support data into one dashboard. Set up in 10 minutes.", lang: "en" },
      nav: { links: [
        { label: "Features", href: "#features" },
        { label: "Pricing", href: "#pricing" },
        { label: "Customers", href: "#testimonials" },
        { label: "FAQ", href: "#faq" },
      ], cta: { label: "Start free", href: "#contact" } },
      design: JSON.parse(JSON.stringify(DESIGN_PRESETS.find((p) => p.name === "Alpine")!.system)) as never as SiteBlueprint["design"],
      voice: "direct, confident, specific",
      pages: [{
        id: uid("pg"), slug: "", title: "Stackline", description: "Product analytics without the setup week.",
        sections: [
          section("hero", { layout: "split", eyebrow: "New · Stackline 2.0", title: "Your product data, finally in one place.", subtitle: "Stackline unifies product, marketing, and support metrics into one dashboard — set up in 10 minutes, not a quarter.", primaryCta: { label: "Start free trial", href: "#contact" }, secondaryCta: { label: "Watch the tour", href: "#video" }, image: { url: "", alt: "Stackline dashboard preview" }, trust: "SOC 2 Type II · GDPR-ready · 99.9% uptime" }),
          section("logos", { heading: "Powering product teams at", items: ["Northbeam", "Lumen", "Octave", "Halcyon", "Brixton", "Kindred"] }),
          section("features", { heading: "Everything your team measures, together", subheading: "Six modules that talk to each other — no exports, no spreadsheets.", items: [
            { icon: "chart", title: "Unified metrics", desc: "One source of truth for activation, retention, and revenue. No more version-of-the-truth meetings." },
            { icon: "bolt", title: "Event capture", desc: "Auto-capture with a single SDK line. Works with your existing data warehouse." },
            { icon: "users", title: "Cohort analysis", desc: "Retention curves, funnel steps, and segments that update live." },
            { icon: "lock", title: "Enterprise security", desc: "SSO, audit logs, and region controls. SOC 2 Type II certified." },
            { icon: "globe", title: "Warehouse-native", desc: "Reads directly from Snowflake, BigQuery, or Redshift. No data copy." },
            { icon: "tag", title: "100+ integrations", desc: "Segment, Stripe, HubSpot, Zendesk, and everything in between." },
          ] }),
          section("video", { heading: "See it in action", url: "https://www.youtube.com/embed/xvFZjo5PgG0", caption: "Two-minute tour of Stackline 2.0" }),
          section("stats", { heading: "Why teams make the switch", items: [
            { value: "10min", label: "median setup time" },
            { value: "40%", label: "less time in reporting" },
            { value: "3.1x", label: "avg. lift in activation" },
            { value: "60+", label: "data sources supported" },
          ] }),
          section("testimonials", { heading: "Customers", subheading: "Product leaders who moved off spreadsheets.", items: [
            { quote: "We replaced three tools and a weekly reporting ritual. Stackline paid for itself in a month.", name: "Maya Chen", role: "VP Product, Northbeam" },
            { quote: "The cohort analysis alone was worth the switch. It's how we found our retention leak.", name: "Dev Patel", role: "Growth Lead, Octave" },
            { quote: "It reads our warehouse directly. No syncing, no duplication, no drift.", name: "Sarah Kim", role: "Data Lead, Lumen" },
          ] }),
          section("comparison", { heading: "Stackline vs the alternatives", subheading: "Same category, different class.", columns: [{ name: "Stackline" }, { name: "Spreadsheet stack" }, { name: "Legacy BI" }], rows: [
            { label: "Time to first dashboard", values: ["10 minutes", "2 weeks", "1-3 months"] },
            { label: "Real-time data", values: [true, false, "Scheduled"] },
            { label: "Warehouse-native", values: [true, false, true] },
            { label: "Cohort retention", values: [true, "Manual", true] },
            { label: "Support included", values: [true, "Paid", "Paid"] },
            { label: "Pricing transparency", values: [true, true, false] },
          ] }),
          section("pricing", { heading: "Simple, usage-fair pricing", subheading: "Free to start. Scales with events, not seats.", currency: "$", period: "/mo", items: [
            { name: "Free", price: "0", description: "For side projects and evaluation.", features: ["10k events/mo", "3 dashboards", "Community support"], cta: { label: "Start free", href: "#contact" }, featured: false },
            { name: "Growth", price: "49", description: "For teams shipping weekly.", features: ["500k events/mo", "Unlimited dashboards", "All integrations", "Email support"], cta: { label: "Start 14-day trial", href: "#contact" }, featured: true },
            { name: "Enterprise", price: "Custom", description: "For organizations at scale.", features: ["Custom event volume", "SSO & audit logs", "Dedicated manager", "SLA & on-prem"], cta: { label: "Talk to sales", href: "#contact" }, featured: false },
          ] }),
          section("faq", { heading: "FAQ", items: [
            { q: "How hard is the setup, really?", a: "One SDK line on web or mobile. Median time to first dashboard is 10 minutes. Support sets it up for you on Enterprise." },
            { q: "Can Stackline read our existing warehouse?", a: "Yes — Snowflake, BigQuery, and Redshift are supported natively. We never require you to copy data." },
            { q: "What happens if we exceed our event volume?", a: "We pause ingestion gracefully and warn you at 80%. You can upgrade instantly, prorated." },
            { q: "Is it GDPR compliant?", a: "Yes. Data residency controls, deletion workflows, and DPA on request. SOC 2 Type II report available to customers." },
            { q: "Do you offer a student or non-profit discount?", a: "40% off any plan for registered non-profits and accredited students." },
          ] }),
          section("newsletter", { heading: "The Metrics Letter", subheading: "One practical analytics tip every Friday. Read by 9,000 product people.", placeholder: "you@company.com", button: "Subscribe", note: "No spam. Unsubscribe in one click." }),
          section("cta", { title: "Your data is ready when you are.", subtitle: "Join 4,000+ product teams tracking their numbers the honest way.", button: { label: "Start your free trial", href: "#contact" }, note: "14-day Pro trial · No credit card" }),
          section("contact", { heading: "Talk to a human", subheading: "Sales, onboarding, or questions — we answer within a day.", email: "hello@stackline.io", phone: "+1 (415) 555-0192", address: "500 Mission St, San Francisco", form: { fields: [
            { label: "Name", type: "text", required: true }, { label: "Work email", type: "email", required: true }, { label: "Company size", type: "text", required: false }, { label: "Message", type: "textarea", required: true },
          ] }, submitLabel: "Send" }),
          footerSection(`© ${year} Stackline Inc.`, "The analytics layer for product teams."),
        ],
      }],
    }),
  },
  {
    id: "restaurant",
    name: "Restaurant",
    tagline: "Local restaurant with menu & reservations",
    build: () => ({
      version: 1,
      meta: { title: "June & Oak — seasonal restaurant, Austin", description: "A neighborhood restaurant in East Austin serving seasonal wood-fired plates. Open Tue–Sun. Reservations welcome.", lang: "en" },
      nav: { links: [
        { label: "Menu", href: "#menu" },
        { label: "Story", href: "#story" },
        { label: "Reviews", href: "#testimonials" },
        { label: "Reserve", href: "#contact" },
      ], cta: { label: "Book a table", href: "#contact" } },
      design: JSON.parse(JSON.stringify(DESIGN_PRESETS.find((p) => p.name === "Sangria")!.system)) as never as SiteBlueprint["design"],
      voice: "warm, unpretentious, specific",
      pages: [{
        id: uid("pg"), slug: "", title: "June & Oak", description: "Wood-fired, seasonal, and honest.",
        sections: [
          section("hero", { layout: "split", eyebrow: "East Austin · Est. 2019", title: "Wood-fired cooking that tastes like the season.", subtitle: "We cook what's good right now — 80% of our menu changes monthly. Small plates, natural wine, and a room that feels like a party.", primaryCta: { label: "Reserve a table", href: "#contact" }, secondaryCta: { label: "See this week's menu", href: "#menu" }, image: { url: "", alt: "Wood-fired dishes at June & Oak" }, trust: "Open Tue–Sun · Dinner from 5pm" }),
          section("stats", { heading: "In the last year", items: [
            { value: "38k", label: "plates served" },
            { value: "12", label: "farm partners" },
            { value: "94%", label: "menu items from <100mi away" },
            { value: "0", label: "freezers in the kitchen" },
          ] }),
          section("features", { heading: "This week on the menu", subheading: "A sample — the menu changes with the farmers.", items: [
            { icon: "trophy", title: "Charred carrots, labneh, dukkah", desc: "From Johnson Farms, 40 miles away. Fire-kissed, finished with smoked oil." },
            { icon: "clock", title: "Texas redfish, citrus, lovage", desc: "Line-caught Tuesday, on your table Friday." },
            { icon: "sun", title: "Wood-fired lamb, salsa verde", desc: "Whole-animal program with Stone Bench Ranch. Served medium-rare, always." },
            { icon: "star", title: "Brown butter cake, burnt honey", desc: "Our pastry chef's non-negotiable. Yes, it's as good as it sounds." },
          ] }),
          section("timeline", { heading: "From plot to plate", subheading: "How a dish gets on your table.", items: [
            { period: "Monday", title: "Market", desc: "We walk the farms and fish market before dawn. The menu is written after, never before." },
            { period: "Tuesday", title: "Prep", desc: "Broth, fermentations, and dough start their long shifts." },
            { period: "Wed–Sun", title: "Fire", desc: "Service. The wood oven is lit at 3pm and never stops until close." },
          ] }),
          section("testimonials", { heading: "What the room says", items: [
            { quote: "The best meal I've had in Austin this year. The lamb is not to be missed.", name: "Texas Monthly", role: "Critic's pick" },
            { quote: "A neighborhood restaurant that refuses to behave like one.", name: "Eater Austin", role: "Review" },
            { quote: "We came for the food, stayed for the wine list.", name: "Daniel & Priya", role: "Regulars since 2021" },
          ] }),
          section("faq", { heading: "Good to know", items: [
            { q: "Do you take walk-ins?", a: "Yes — half the room is held for walk-ins every night. The bar seats 14 and is first-come." },
            { q: "Can you handle allergies?", a: "Yes, tell your server. We can adapt most dishes; a few are non-negotiables like the lamb." },
            { q: "Is there parking?", a: "Free lot behind the building plus street parking on Oak. Valet on weekends." },
            { q: "Do you do private events?", a: "The whole room seats 64; we take one buyout per week, usually Tuesdays. Email events@juneandoak.com." },
          ] }),
          section("gallery", { heading: "The room & the food", items: [
            { url: "", alt: "Wood oven at service", caption: "The fire, 3pm to close" },
            { url: "", alt: "Charred carrots dish", caption: "Carrots, labneh, dukkah" },
            { url: "", alt: "The dining room", caption: "Tuesday night, full room" },
            { url: "", alt: "Redfish with citrus", caption: "Friday special" },
          ] }),
          section("newsletter", { heading: "The Sunday menu letter", subheading: "What's in season and what we're cooking — every Sunday. No noise.", placeholder: "you@email.com", button: "Subscribe", note: "3,100 subscribers" }),
          section("cta", { title: "Come hungry, stay late.", subtitle: "Reservations open 30 days out. The bar is always first-come.", button: { label: "Reserve a table", href: "#contact" }, note: "Parties of 6+ — call us directly" }),
          section("contact", { heading: "Reservations", subheading: "We confirm by text within a few hours.", email: "hello@juneandoak.com", phone: "(512) 555-0177", address: "1420 Oak Ave, Austin, TX", form: { fields: [
            { label: "Name", type: "text", required: true }, { label: "Email", type: "email", required: true }, { label: "Party size", type: "text", required: false }, { label: "Date & notes", type: "textarea", required: true },
          ] }, submitLabel: "Request reservation" }),
          footerSection(`© ${year} June & Oak.`, "Wood-fired. Seasonal. East Austin."),
        ],
      }],
    }),
  },
  {
    id: "portfolio",
    name: "Portfolio",
    tagline: "Personal portfolio for a product designer",
    build: () => ({
      version: 1,
      meta: { title: "Nina Voss — product designer", description: "Portfolio of Nina Voss, a product designer based in Berlin working with startups on design systems and product strategy.", lang: "en" },
      nav: { links: [
        { label: "Work", href: "#gallery" },
        { label: "About", href: "#about" },
        { label: "Now", href: "#now" },
      ], cta: { label: "Get in touch", href: "#contact" } },
      design: JSON.parse(JSON.stringify(DESIGN_PRESETS.find((p) => p.name === "Linen")!.system)) as never as SiteBlueprint["design"],
      voice: "quiet, confident, personal",
      pages: [{
        id: uid("pg"), slug: "", title: "Nina Voss", description: "Product designer in Berlin.",
        sections: [
          section("hero", { layout: "centered", eyebrow: "Product designer · Berlin", title: "Hi, I'm Nina. I design products people keep using.", subtitle: "Ten years, 40+ products, two design systems that outlived their companies. I work with early-stage teams on product strategy, UX, and design systems.", primaryCta: { label: "See selected work", href: "#gallery" }, secondaryCta: { label: "About me", href: "#about" }, image: { url: "", alt: "" }, trust: "Currently: fractional design lead at two startups" }),
          section("stats", { heading: "A few numbers", items: [
            { value: "10", label: "years in product design" },
            { value: "40+", label: "products shipped" },
            { value: "2", label: "design systems built from scratch" },
            { value: "9.2", label: "average NPS of shipped features" },
          ] }),
          section("gallery", { heading: "Selected work", subheading: "", items: [
            { url: "", alt: "Billing redesign for a fintech", caption: "Fintech · billing redesign" },
            { url: "", alt: "Design system for a logistics platform", caption: "Design system · 2024" },
            { url: "", alt: "Onboarding flow for a health app", caption: "Health · onboarding" },
            { url: "", alt: "Mobile app for a booking service", caption: "Mobile · 2023" },
            { url: "", alt: "Dashboard for an analytics tool", caption: "Dashboard · 2022" },
            { url: "", alt: "Website redesign for a non-profit", caption: "Non-profit · 2021" },
          ] }),
          section("features", { heading: "How I work", subheading: "", items: [
            { icon: "layers", title: "Design systems", desc: "Tokens, components, and docs that make a team fast — not a design prison." },
            { icon: "users", title: "Workshops", desc: "Structured sessions that get decisions out of rooms and into a roadmap." },
            { icon: "chart", title: "Metrics-first", desc: "I design against numbers. If we can't measure it, we scope it differently." },
          ] }),
          section("timeline", { heading: "Where I've been", items: [
            { period: "2022–now", title: "Independent", desc: "Fractional design lead. Two clients at a time, at least six months each." },
            { period: "2019–2022", title: "Senior Product Designer, Lumen", desc: "Led design for the billing platform. Cut support tickets about billing by 34%." },
            { period: "2016–2019", title: "Product Designer, Northbeam", desc: "First design hire. Built the team from one to six." },
            { period: "2014–2016", title: "Junior → Mid, freelance", desc: "The years of many, many website projects. Good reps, better lessons." },
          ] }),
          section("testimonials", { heading: "What people say", items: [
            { quote: "Nina is the rare designer who argues from data and then delivers something beautiful anyway.", name: "Tom Becker", role: "CEO, Lumen" },
            { quote: "Our design system went from a figma file to a product people actually use.", name: "Priya Sharma", role: "Eng Lead, Halcyon" },
          ] }),
          section("faq", { heading: "Practical questions", items: [
            { q: "What kind of engagements do you take?", a: "Fractional design lead (2+ days/week), design system sprints (6-10 weeks), and one-off UX audits. No gigs under 3 weeks." },
            { q: "Do you work with agencies?", a: "Sometimes — usually as a senior IC on complex product work agencies can't staff internally." },
            { q: "How do you price?", a: "Daily rate with a weekly cap, or fixed price for scoped sprints. You'll know the number before we start." },
          ] }),
          section("newsletter", { heading: "Notes on designing things", subheading: "A monthly letter on design systems, metrics, and building products. 2,100 readers.", placeholder: "you@email.com", button: "Subscribe", note: "Once a month, no fluff" }),
          section("cta", { title: "Have a product problem worth solving?", subtitle: "Tell me where you're stuck. If I'm not the right fit, I'll say so and point you to someone better.", button: { label: "Say hello", href: "#contact" }, note: "Replies within 48 hours" }),
          section("contact", { heading: "Say hello", subheading: "Tell me about your product, timeline, and what's actually broken.", email: "hello@ninavoss.design", phone: "", address: "Berlin, Germany", form: { fields: [
            { label: "Name", type: "text", required: true }, { label: "Email", type: "email", required: true }, { label: "Project type", type: "text", required: false }, { label: "Message", type: "textarea", required: true },
          ] }, submitLabel: "Send" }),
          footerSection(`© ${year} Nina Voss.`, "Designed, written, and built by hand."),
        ],
      }],
    }),
  },
  {
    id: "clinic",
    name: "Clinic",
    tagline: "Medical clinic with appointments",
    build: () => ({
      version: 1,
      meta: { title: "Willow Health — family medicine clinic", description: "Willow Health is a family medicine clinic in Portland offering same-week appointments, honest pricing, and doctors who actually call back.", lang: "en" },
      nav: { links: [
        { label: "Services", href: "#features" },
        { label: "Doctors", href: "#team" },
        { label: "Pricing", href: "#pricing" },
        { label: "FAQ", href: "#faq" },
      ], cta: { label: "Book an appointment", href: "#contact" } },
      design: JSON.parse(JSON.stringify(DESIGN_PRESETS.find((p) => p.name === "Verde")!.system)) as never as SiteBlueprint["design"],
      voice: "calm, clear, reassuring",
      pages: [{
        id: uid("pg"), slug: "", title: "Willow Health", description: "Family medicine, done honestly.",
        sections: [
          section("hero", { layout: "split", eyebrow: "Portland · Family medicine", title: "A doctor's office that respects your time.", subtitle: "Same-week appointments, prices on the website, and doctors who return your calls before the end of the day. That's the whole pitch.", primaryCta: { label: "Book an appointment", href: "#contact" }, secondaryCta: { label: "See our doctors", href: "#team" }, image: { url: "", alt: "The Willow Health waiting room" }, trust: "Accepting new patients · Most insurances" }),
          section("stats", { heading: "Why patients stay", items: [
            { value: "2 days", label: "average wait for an appointment" },
            { value: "4.9/5", label: "patient rating (2,100 reviews)" },
            { value: "24h", label: "call-back guarantee" },
            { value: "12", label: "years of practice" },
          ] }),
          section("features", { heading: "Services", subheading: "Everything a family needs, under one roof.", items: [
            { icon: "heart", title: "Primary care", desc: "Annual physicals, chronic condition management, and preventive care." },
            { icon: "shield", title: "Women's health", desc: "Wellness exams, contraception, and pregnancy care with same-week availability." },
            { icon: "users", title: "Pediatrics", desc: "Well-child visits and sick visits for kids 0–18." },
            { icon: "clock", title: "Same-week sick visits", desc: "Flu, fevers, and infections — we hold slots every day for urgent needs." },
          ] }),
          section("team", { heading: "Your doctors", subheading: "Small practice, senior doctors, no residents on your case without consent.", items: [
            { name: "Dr. Elena Ruiz, MD", role: "Internal Medicine", bio: "15 years in family practice. Known for actually listening.", photo: "" },
            { name: "Dr. Sam Okafor, MD", role: "Pediatrics", bio: "Formerly at Doernbecher. Kids' visits that don't end in tears (usually).", photo: "" },
            { name: "Dr. Priya Nair, DO", role: "Women's Health", bio: "Believes preventive care should be the default, not the exception.", photo: "" },
          ] }),
          section("pricing", { heading: "Transparent pricing", subheading: "What you pay when you pay out of pocket. Insurance billed normally.", currency: "$", period: "", items: [
            { name: "Visit", price: "120", description: "Standard office visit, 30 minutes with your doctor.", features: ["30 min appointment", "Follow-up included"], cta: { label: "Book", href: "#contact" }, featured: false },
            { name: "Physical", price: "180", description: "Annual physical with full screening and lab review.", features: ["60 min appointment", "Lab work included", "Results call within a week"], cta: { label: "Book", href: "#contact" }, featured: true },
            { name: "Sick visit", price: "90", description: "Same-week urgent visits for kids and adults.", features: ["Same-week slot", "Prescriptions as needed"], cta: { label: "Book", href: "#contact" }, featured: false },
          ] }),
          section("faq", { heading: "Questions, answered", items: [
            { q: "Do you take my insurance?", a: "We work with most major plans — check the list on our patient portal, or call and we'll verify before you book." },
            { q: "What if I need a same-day appointment?", a: "We hold 4 same-day slots every weekday. Call before 9am and we'll do our best." },
            { q: "Can I message my doctor?", a: "Yes — secure messaging is included. Your doctor replies by end of the next business day." },
            { q: "Do you offer telehealth?", a: "Yes, for follow-ups and chronic care. Initial visits are in person." },
          ] }),
          section("testimonials", { heading: "From our patients", items: [
            { quote: "The doctor called me back the same day. I can't tell you how long it's been since that happened anywhere.", name: "Marge H.", role: "Patient since 2020" },
            { quote: "They told me the price before the visit. On the website. That alone won us over.", name: "David R.", role: "Patient since 2021" },
            { quote: "My kids actually like going to the doctor now. I didn't know that was possible.", name: "Lena K.", role: "Mom of two" },
          ] }),
          section("newsletter", { heading: "The Willow letter", subheading: "Seasonal health tips from our doctors. Four emails a year, no more.", placeholder: "you@email.com", button: "Subscribe", note: "No spam, ever" }),
          section("cta", { title: "Your health can't wait a month.", subtitle: "Book online in two minutes, or call us — a human answers the phone.", button: { label: "Book an appointment", href: "#contact" }, note: "Same-week availability" }),
          section("contact", { heading: "Book an appointment", subheading: "We confirm within one business hour.", email: "hello@willowhealth.pdx", phone: "(503) 555-0199", address: "2210 SE Division St, Portland, OR", form: { fields: [
            { label: "Name", type: "text", required: true }, { label: "Email", type: "email", required: true }, { label: "Preferred time", type: "text", required: false }, { label: "Reason for visit", type: "textarea", required: true },
          ] }, submitLabel: "Request appointment" }),
          footerSection(`© ${year} Willow Health P.C.`, "Family medicine, done honestly."),
        ],
      }],
    }),
  },
  {
    id: "fitness",
    name: "Fitness Studio",
    tagline: "Local gym with classes & memberships",
    build: () => ({
      version: 1,
      meta: { title: "Iron & Grace — strength studio, Seattle", description: "A strength-focused studio in Fremont, Seattle. Small classes, big coaching ratios, and programming that actually adapts to you.", lang: "en" },
      nav: { links: [
        { label: "Classes", href: "#features" },
        { label: "Coaches", href: "#team" },
        { label: "Memberships", href: "#pricing" },
        { label: "FAQ", href: "#faq" },
      ], cta: { label: "Try a free class", href: "#contact" } },
      design: JSON.parse(JSON.stringify(DESIGN_PRESETS.find((p) => p.name === "Ironclad")!.system)) as never as SiteBlueprint["design"],
      voice: "direct, motivating, specific",
      pages: [{
        id: uid("pg"), slug: "", title: "Iron & Grace", description: "Strength training in small classes.",
        sections: [
          section("hero", { layout: "split", eyebrow: "Fremont · Seattle", title: "Get strong, the honest way.", subtitle: "Small classes, max 10 people, a coach for every 5. We program your lifts, watch your form, and write your numbers down.", primaryCta: { label: "Try a free class", href: "#contact" }, secondaryCta: { label: "See the schedule", href: "#features" }, image: { url: "", alt: "Coach and athlete during a session" }, trust: "First class free · No contracts" }),
          section("stats", { heading: "The numbers we track", items: [
            { value: "10", label: "people max per class" },
            { value: "1:5", label: "coach-to-athlete ratio" },
            { value: "4.9", label: "member rating" },
            { value: "68%", label: "of members hit a PR in 90 days" },
          ] }),
          section("features", { heading: "Classes", subheading: "Every class is coached, not just supervised.", items: [
            { icon: "bolt", title: "Strength Foundations", desc: "Squat, deadlift, press — coached progressions from your first session. 60 min." },
            { icon: "clock", title: "MetCon 45", desc: "Conditioning that won't wreck your joints. 45 minutes, coaches pace you." },
            { icon: "users", title: "Team Lifts", desc: "Partner programming for groups of 6–10. Saturdays at 9am." },
            { icon: "sun", title: "Open Gym + Coach", desc: "Book the rack, get eyes on your sets. Any hour, by reservation." },
          ] }),
          section("team", { heading: "Coaches", subheading: "Certified, experienced, and annoyingly attentive to form.", items: [
            { name: "Jake Moreno", role: "Head Coach", bio: "8 years coaching, ex-competitive powerlifter. Deadlift 585 at 74kg.", photo: "" },
            { name: "Ana Reyes", role: "Coach", bio: "Sports science grad. Fixes your elbow angle from across the room.", photo: "" },
            { name: "Tom Brandt", role: "Coach", bio: "Masters-level athlete. Teaches the 40+ crowd to lift forever.", photo: "" },
          ] }),
          section("pricing", { heading: "Memberships", subheading: "Month to month. Cancel in the app, no guilt trip.", currency: "$", period: "/mo", items: [
            { name: "Drop-in", price: "25", description: "One coached class.", features: ["Any class", "Free open gym after"], cta: { label: "Book drop-in", href: "#contact" }, featured: false },
            { name: "Standard", price: "139", description: "Unlimited classes, most popular.", features: ["Unlimited classes", "Open gym 6am–10pm", "Monthly 1:1 check-in", "Guest pass monthly"], cta: { label: "Start free week", href: "#contact" }, featured: true },
            { name: "Coach-led", price: "229", description: "Four 1:1 sessions a month.", features: ["Everything in Standard", "4 personal sessions", "Programmed plan"], cta: { label: "Talk to a coach", href: "#contact" }, featured: false },
          ] }),
          section("timeline", { heading: "Your first month", items: [
            { period: "Week 1", title: "Foundations", desc: "Free intro session. We test your lifts, not your ego." },
            { period: "Week 2-3", title: "Consistency", desc: "3 classes a week. Form checks on every single lift." },
            { period: "Week 4", title: "The first PR", desc: "A simple test week. Most people surprise themselves." },
          ] }),
          section("testimonials", { heading: "Members", items: [
            { quote: "I'd been 'training' for five years at big-box gyms. One month here and I finally learned how to deadlift.", name: "Sarah K.", role: "Member for 14 months" },
            { quote: "The coaches know your name and your numbers. That's the whole difference.", name: "Marcus T.", role: "Member for 2 years" },
            { quote: "I'm 46 and I'm stronger than I was at 30. That's not a brag, it's the programming.", name: "Diane L.", role: "Member for 18 months" },
          ] }),
          section("faq", { heading: "FAQ", items: [
            { q: "I've never lifted. Is this for me?", a: "Yes — Foundations exists exactly for you. Everyone starts with empty-bar technique work." },
            { q: "What should I wear?", a: "Flat shoes or barefoot, clothes you can squat in. No judgment, we promise." },
            { q: "How do I cancel?", a: "In the app, two taps. We'd rather earn your renewal than block it." },
            { q: "Do you have showers?", a: "Yes — three private shower rooms with towels provided." },
          ] }),
          section("cta", { title: "Your first class is free.", subtitle: "Come see why 400 members call this home. No contracts, no pressure.", button: { label: "Book a free class", href: "#contact" }, note: "Free week on Standard memberships" }),
          section("contact", { heading: "Start here", subheading: "Tell us your goals and we'll set up your free first session.", email: "hello@ironandgrace.com", phone: "(206) 555-0114", address: "3611 Fremont Ave N, Seattle, WA", form: { fields: [
            { label: "Name", type: "text", required: true }, { label: "Email", type: "email", required: true }, { label: "Experience level", type: "text", required: false }, { label: "Goals", type: "textarea", required: true },
          ] }, submitLabel: "Book free session" }),
          footerSection(`© ${year} Iron & Grace Strength Studio.`, "Small classes. Big coaching."),
        ],
      }],
    }),
  },
];

export function starterById(id: string): StarterSite | undefined {
  return STARTER_SITES.find((s) => s.id === id);
}
