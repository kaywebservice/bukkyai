import type { Section, SectionContent, SectionType } from "./types";
import { emptyContent, uid } from "./blueprint";

export type SectionTemplate = {
  id: string;
  type: SectionType;
  name: string;
  build: () => Section;
};

function tpl<T extends SectionType>(
  type: T,
  name: string,
  patch: (base: SectionContent[T]) => SectionContent[T]
): SectionTemplate {
  return { id: uid("tpl"), type, name, build: () => ({ id: uid(), type, content: patch(emptyContent(type) as SectionContent[T]) }) };
}

export const SECTION_TEMPLATES: SectionTemplate[] = [
  tpl("hero", "Centered statement", (b) => ({
    ...b,
    layout: "centered",
    eyebrow: "New · 2026 edition",
    title: "The simplest way to get this done.",
    subtitle: "Built for teams that need results without the busywork. Set up in minutes, see impact the same day.",
    primaryCta: { label: "Start free", href: "#contact" },
    secondaryCta: { label: "See how it works", href: "#features" },
    trust: "Free 14-day trial · No credit card required",
  })),
  tpl("hero", "Split with visual", (b) => ({
    ...b,
    layout: "split",
    eyebrow: "Trusted by 1,200+ teams",
    title: "Results you can measure, not promises you can't.",
    subtitle: "We do the heavy lifting so your team can focus on the work that actually moves the numbers.",
    primaryCta: { label: "Book a demo", href: "#contact" },
    secondaryCta: { label: "Explore features", href: "#features" },
    image: { url: "", alt: "Product interface showing key metrics" },
    trust: "Average setup time: 8 minutes",
  })),
  tpl("hero", "Big brand moment", (b) => ({
    ...b,
    layout: "centered",
    eyebrow: "Founded in 2018 · Berlin",
    title: "Craft that stands out in a world of noise.",
    subtitle: "We partner with brands that refuse to blend in — and build the kind of work that gets remembered.",
    primaryCta: { label: "Start a project", href: "#contact" },
    secondaryCta: { label: "See our work", href: "#gallery" },
    trust: "Featured in Forbes, Dezeen, and The Verge",
  })),
  tpl("features", "Three pillars", (b) => ({
    ...b,
    heading: "Everything you need, nothing you don't",
    subheading: "Three core capabilities that cover 90% of the job.",
    items: [
      { icon: "bolt", title: "Fast by design", desc: "Everything is optimized for speed. Pages load in under a second on average." },
      { icon: "shield", title: "Secure by default", desc: "Encryption, audits, and compliance baked in — not bolted on later." },
      { icon: "users", title: "Built for teams", desc: "Roles, reviews, and handoffs work the way your team already works." },
    ],
  })),
  tpl("features", "Six-card grid", (b) => ({
    ...b,
    heading: "Capabilities",
    subheading: "A complete toolkit for the job.",
    items: [
      { icon: "sparkles", title: "Automation", desc: "Cut manual work with rules that run themselves." },
      { icon: "chart", title: "Analytics", desc: "See what works with dashboards that update live." },
      { icon: "lock", title: "Access control", desc: "Granular permissions for every workspace." },
      { icon: "globe", title: "Localization", desc: "Ship in 30+ languages without extra work." },
      { icon: "tag", title: "Integrations", desc: "Connects to the tools you already use." },
      { icon: "layers", title: "Custom fields", desc: "Model your data your way, no schema meetings." },
    ],
  })),
  tpl("features", "Problem-solution", (b) => ({
    ...b,
    heading: "Why teams switch to us",
    subheading: "Because the old way was costing them time and money.",
    items: [
      { icon: "clock", title: "Hours saved weekly", desc: "Teams report saving 6+ hours a week on repeatable tasks." },
      { icon: "gem", title: "Fewer mistakes", desc: "Automated checks catch errors before they reach customers." },
      { icon: "star", title: "Happier customers", desc: "Faster responses and fewer dropped balls, automatically." },
    ],
  })),
  tpl("stats", "Four key numbers", (b) => ({
    ...b,
    heading: "The numbers that matter",
    items: [
      { value: "12k+", label: "active customers" },
      { value: "99.9%", label: "uptime over 12 months" },
      { value: "4.9/5", label: "average rating" },
      { value: "38", label: "countries served" },
    ],
  })),
  tpl("stats", "Impact stats", (b) => ({
    ...b,
    heading: "Real results, not vanity metrics",
    items: [
      { value: "3.2x", label: "average ROI in year one" },
      { value: "45%", label: "faster time-to-launch" },
      { value: "€2.1M", label: "saved by clients last year" },
      { value: "18mo", label: "median payback period" },
    ],
  })),
  tpl("testimonials", "Three quotes", (b) => ({
    ...b,
    heading: "What our customers say",
    subheading: "No stock quotes here — real feedback from real teams.",
    items: [
      { quote: "We replaced a process that took our team three days a week. It now runs itself.", name: "Alex Rivera", role: "COO, Northbeam" },
      { quote: "The onboarding was the fastest we've ever done. We were live in an afternoon.", name: "Priya Sharma", role: "Head of Ops, Lumen" },
      { quote: "It just works. Support answers in minutes and actually solves the problem.", name: "Tom Becker", role: "Founder, Kindred" },
    ],
  })),
  tpl("testimonials", "Six quotes", (b) => ({
    ...b,
    heading: "Customers, in their words",
    items: [
      { quote: "The best tool decision we made this year.", name: "Mia Johansson", role: "VP Product" },
      { quote: "Setup was genuinely painless.", name: "Daniel Osei", role: "Engineering Lead" },
      { quote: "Our support tickets dropped by half.", name: "Sofia Marino", role: "Support Manager" },
      { quote: "Worth every penny.", name: "James Liu", role: "CTO" },
      { quote: "We onboarded 40 people in a week.", name: "Nadia Hassan", role: "People Ops" },
      { quote: "Simple, fast, reliable.", name: "Erik Lund", role: "Founder" },
    ],
  })),
  tpl("team", "Leadership grid", (b) => ({
    ...b,
    heading: "The people behind the product",
    subheading: "A small team with big standards.",
    items: [
      { name: "Amara Chen", role: "CEO", bio: "Ex-marketplace founder. Believes good tools should be invisible.", photo: "" },
      { name: "Marcus Webb", role: "CTO", bio: "18 years in infrastructure. Still reads commit logs on weekends.", photo: "" },
      { name: "Lena Novak", role: "Head of Design", bio: "Turns complexity into clarity. Formerly at two design-led startups.", photo: "" },
      { name: "Omar Farouk", role: "Customer Success", bio: "Answers in minutes, not days. Our CSAT is his personal scoreboard.", photo: "" },
    ],
  })),
  tpl("timeline", "Milestones", (b) => ({
    ...b,
    heading: "The journey so far",
    subheading: "From garage project to 12,000 customers.",
    items: [
      { period: "2021", title: "The idea", desc: "Two founders, one frustration, zero sleep. The prototype shipped in 6 weeks." },
      { period: "2022", title: "First 100 customers", desc: "Launched publicly and hit 100 paying teams in the first month." },
      { period: "2023", title: "Series A", desc: "Raised to build the team and the platform the customers kept asking for." },
      { period: "2024", title: "Going global", desc: "Localized into 12 languages, opened our first international office." },
      { period: "2025", title: "1M users", desc: "A milestone we celebrate by giving back: 1% of revenue to open source." },
    ],
  })),
  tpl("pricing", "Three tiers", (b) => ({
    ...b,
    heading: "Simple pricing",
    subheading: "Start free, upgrade when you're ready. No surprises.",
    currency: "$",
    period: "/mo",
    items: [
      { name: "Starter", price: "0", description: "For trying things out.", features: ["Up to 3 projects", "Community support", "Core features"], cta: { label: "Start free", href: "#contact" }, featured: false },
      { name: "Pro", price: "29", description: "For growing teams.", features: ["Unlimited projects", "Priority support", "All integrations", "Advanced analytics"], cta: { label: "Start 14-day trial", href: "#contact" }, featured: true },
      { name: "Enterprise", price: "99", description: "For organizations.", features: ["SSO & audit logs", "Dedicated manager", "Custom SLAs", "On-prem options"], cta: { label: "Talk to sales", href: "#contact" }, featured: false },
    ],
  })),
  tpl("pricing", "Two tiers + custom", (b) => ({
    ...b,
    heading: "Plans",
    subheading: "",
    currency: "$",
    period: "/mo",
    items: [
      { name: "Essential", price: "19", description: "Everything a solo founder needs.", features: ["1 seat", "5 projects", "Email support"], cta: { label: "Choose Essential", href: "#contact" }, featured: false },
      { name: "Scale", price: "59", description: "For teams that are shipping.", features: ["5 seats", "Unlimited projects", "Priority support", "API access"], cta: { label: "Choose Scale", href: "#contact" }, featured: true },
    ],
  })),
  tpl("comparison", "Feature matrix", (b) => ({
    ...b,
    heading: "Us vs the alternatives",
    subheading: "Same category, different class.",
    columns: [{ name: "Us" }, { name: "Generic tool" }, { name: "DIY stack" }],
    rows: [
      { label: "Setup time", values: ["Minutes", "Hours", "Weeks"] },
      { label: "Support included", values: [true, false, false] },
      { label: "Built-in analytics", values: [true, true, false] },
      { label: "Custom fields", values: [true, false, true] },
      { label: "Automation", values: [true, "Paid add-on", true] },
      { label: "Maintenance burden", values: ["None", "Low", "High"] },
    ],
  })),
  tpl("faq", "Standard FAQ", (b) => ({
    ...b,
    heading: "Frequently asked questions",
    items: [
      { q: "How long does setup take?", a: "Most teams are up and running in under an hour. We handle the migration for free on annual plans." },
      { q: "Can I cancel anytime?", a: "Yes. Cancel in two clicks from your dashboard — no calls, no retention emails." },
      { q: "Is my data secure?", a: "Encryption at rest and in transit, regular third-party audits, and region controls for data residency." },
      { q: "Do you offer discounts for non-profits?", a: "Yes — registered non-profits get 40% off any plan. Email us and we'll set it up." },
      { q: "What happens if I need more seats?", a: "Seats scale up instantly and are prorated. You only pay for what you use." },
    ],
  })),
  tpl("cta", "Standard CTA", (b) => ({
    ...b,
    title: "Ready to get started?",
    subtitle: "Join 12,000+ teams that already made the switch. You can be live today.",
    button: { label: "Start your free trial", href: "#contact" },
    note: "14-day trial · No credit card · Cancel anytime",
  })),
  tpl("cta", "Urgent CTA", (b) => ({
    ...b,
    title: "Spots for Q3 are filling fast.",
    subtitle: "We only take on 8 projects per quarter so every client gets senior attention.",
    button: { label: "Claim a spot", href: "#contact" },
    note: "First consultation is free",
  })),
  tpl("contact", "Contact form", (b) => ({
    ...b,
    heading: "Get in touch",
    subheading: "We reply within one business day — usually faster.",
    email: "hello@example.com",
    phone: "+1 (555) 010-2030",
    address: "100 Market Street, Suite 400",
    form: {
      fields: [
        { label: "Name", type: "text", required: true },
        { label: "Email", type: "email", required: true },
        { label: "Company", type: "text", required: false },
        { label: "Message", type: "textarea", required: true },
      ],
    },
    submitLabel: "Send message",
  })),
  tpl("gallery", "Work gallery", (b) => ({
    ...b,
    heading: "Selected work",
    items: [
      { url: "", alt: "Project one — brand identity", caption: "Identity · 2025" },
      { url: "", alt: "Project two — website", caption: "Web · 2025" },
      { url: "", alt: "Project three — packaging", caption: "Packaging · 2024" },
      { url: "", alt: "Project four — campaign", caption: "Campaign · 2024" },
      { url: "", alt: "Project five — product design", caption: "Product · 2023" },
      { url: "", alt: "Project six — editorial", caption: "Editorial · 2023" },
    ],
  })),
  tpl("newsletter", "Newsletter", (b) => ({
    ...b,
    heading: "The weekly digest",
    subheading: "One email, every Friday. The three things actually worth reading.",
    placeholder: "you@email.com",
    button: "Subscribe",
    note: "2,400 readers. Unsubscribe anytime.",
  })),
  tpl("video", "Video embed", (b) => ({
    ...b,
    heading: "See it in action",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    caption: "Two-minute product tour",
  })),
  tpl("map", "Location", (b) => ({
    ...b,
    heading: "Find us",
    address: "100 Market Street, San Francisco",
    embedUrl: "",
  })),
  tpl("logos", "Trusted by", (b) => ({
    ...b,
    heading: "Trusted by teams at",
    items: ["Northbeam", "Kindred", "Lumen", "Octave", "Brixton", "Halcyon"],
  })),
  tpl("hero", "Problem → solution", (b) => ({
    ...b,
    layout: "split",
    eyebrow: "The problem",
    title: "Teams waste 10 hours a week on repeatable work.",
    subtitle: "One view of what actually moves the numbers — and what doesn't.",
    primaryCta: { label: "See how it works", href: "#features" },
    secondaryCta: { label: "Talk to a human", href: "#contact" },
    image: { url: "", alt: "A before/after diagram of a team's week" },
    trust: "Results in the first 30 days, or it's free",
  })),
  tpl("hero", "Headline + subhead", (b) => ({
    ...b,
    layout: "centered",
    eyebrow: "New this quarter",
    title: "Software that does the right thing the first time.",
    subtitle: "Built for teams who ship fast and sleep well.",
    primaryCta: { label: "Get started", href: "#contact" },
    secondaryCta: { label: "Watch the demo", href: "#video" },
    trust: "SOC 2 · GDPR · 99.9% uptime",
  })),
  tpl("features", "Four-feature grid", (b) => ({
    ...b,
    heading: "Four things that change the game",
    subheading: "The whole toolkit, no bloat.",
    items: [
      { icon: "zap", title: "Instant setup", desc: "A single webhook. You're done." },
      { icon: "shield-check", title: "Security first", desc: "End-to-end encryption, no plaintext logs." },
      { icon: "bar-chart", title: "Live dashboards", desc: "Metrics update the moment the work does." },
      { icon: "users", title: "Team-ready", desc: "Invites, roles, and handoffs that just work." },
    ],
  })),
  tpl("features", "Benefit-driven", (b) => ({
    ...b,
    heading: "Good for your team. Great for your customers.",
    subheading: "",
    items: [
      { icon: "clock", title: "Save hours weekly", desc: "Automate the work that used to need a spreadsheet army." },
      { icon: "piggy-bank", title: "Cut costs 30%", desc: "Fewer tools, one bill, one source of truth." },
      { icon: "rocket", title: "Ship twice as fast", desc: "From idea to live in days, not weeks." },
    ],
  })),
  tpl("stats", "Five metrics", (b) => ({
    ...b,
    heading: "By the numbers",
    items: [
      { value: "12k+", label: "teams onboarded" },
      { value: "3.2x", label: "avg. throughput lift" },
      { value: "99.9%", label: "uptime (12 months)" },
      { value: "4.9/5", label: "CSAT score" },
      { value: "38", label: "countries, 12 languages" },
    ],
  })),
  tpl("testimonials", "One spotlight quote", (b) => ({
    ...b,
    heading: "Don't just take our word for it.",
    items: [
      {
        quote: "We went from a weekly firefight to a repeatable process. That's the real differentiator.",
        name: "Priya Sharma",
        role: "Head of Platform, Lumen",
      },
    ],
  })),
  tpl("pricing", "Usage-based", (b) => ({
    ...b,
    heading: "Pay for what you use",
    subheading: "",
    currency: "$",
    period: "/mo",
    items: [
      { name: "Core", price: "5", description: "Everything in Core — metered.", features: ["100 actions", "5 workspaces", "Email support"], cta: { label: "Add to Core", href: "#contact" }, featured: false },
      { name: "Pro", price: "49", description: "The most popular plan.", features: ["10 actions included", "Unlimited workspaces", "Priority support", "API access"], cta: { label: "Start 14-day trial", href: "#contact" }, featured: true },
      { name: "Enterprise", price: "Custom", description: "SSO, audit logs, SLA, dedicated success.", features: ["Everything in Pro", "SSO & SCIM", "Custom SLA", "Named success manager"], cta: { label: "Talk to sales", href: "#contact" }, featured: false },
    ],
  })),
  tpl("pricing", "Free forever", (b) => ({
    ...b,
    heading: "Simple, fair pricing",
    subheading: "",
    currency: "$",
    period: "/mo",
    items: [
      { name: "Free", price: "0", description: "For individuals and small teams.", features: ["Up to 5 workspaces", "Core features", "Community support"], cta: { label: "Get started free", href: "#contact" }, featured: false },
      { name: "Pro", price: "19", description: "For growing teams.", features: ["Everything in Free", "Unlimited workspaces", "SSO", "Priority support"], cta: { label: "Start trial", href: "#contact" }, featured: true },
    ],
  })),
  tpl("cta", "Limited availability", (b) => ({
    ...b,
    title: "Only 8 client spots left for Q3.",
    subtitle: "Every client gets a senior strategist. Once they're gone, they're gone.",
    button: { label: "Claim your call", href: "#contact" },
    note: "Free 30-minute strategy call · No obligation",
  })),
  tpl("cta", "Social proof CTA", (b) => ({
    ...b,
    title: "Ready to join 12,000+ teams?",
    subtitle: "Start free today — no credit card, no calls.",
    button: { label: "Get started", href: "#contact" },
    note: "You're covered by our 30-day money-back guarantee.",
  })),
  tpl("gallery", "Masonry showcase", (b) => ({
    ...b,
    heading: "In motion",
    items: [
      { url: "", alt: "Dashboard view", caption: "Analytics · 2025" },
      { url: "", alt: "Mobile flow", caption: "Mobile · 2025" },
      { url: "", alt: "Brand identity", caption: "Identity · 2024" },
      { url: "", alt: "Campaign stills", caption: "Campaign · 2024" },
      { url: "", alt: "Product photos", caption: "Product · 2023" },
      { url: "", alt: "Editorial layout", caption: "Editorial · 2023" },
    ],
  })),
  tpl("logos", "As seen in", (b) => ({
    ...b,
    heading: "As featured in",
    items: ["Forbes", "TechCrunch", "The Verge", "Wired", "Dezeen", "Fast Company"],
  })),
  tpl("contact", "Map + form", (b) => ({
    ...b,
    heading: "Find us",
    subheading: "",
    email: "hello@example.com",
    phone: "+1 (555) 010-2030",
    address: "100 Market Street, San Francisco, CA 94105",
    form: {
      fields: [
        { label: "Name", type: "text", required: true },
        { label: "Email", type: "email", required: true },
        { label: "Phone", type: "tel", required: false },
        { label: "Message", type: "textarea", required: true },
      ],
    },
    submitLabel: "Send message",
  })),
  tpl("newsletter", "Double opt-in", (b) => ({
    ...b,
    heading: "Join the list",
    subheading: "",
    placeholder: "you@email.com",
    button: "Subscribe",
    note: "Double opt-in · Unsubscribe anytime · 2,400 readers",
  })),
  tpl("comparison", "Tier comparison", (b) => ({
    ...b,
    heading: "Feature breakdown",
    subheading: "",
    columns: [{ name: "Starter" }, { name: "Pro" }, { name: "Enterprise" }],
    rows: [
      { label: "Projects", values: ["3", "Unlimited", "Unlimited"] },
      { label: "SSO", values: [false, true, true] },
      { label: "Custom SLA", values: [false, false, true] },
      { label: "Dedicated manager", values: [false, false, true] },
      { label: "Price", values: ["$0", "$19", "Custom"] },
    ],
  })),
  tpl("team", "Two founders", (b) => ({
    ...b,
    heading: "Meet the founders",
    subheading: "",
    items: [
      { name: "Amara Chen", role: "CEO", bio: "Ex-marketplace founder. Believes good tools should be invisible.", photo: "" },
      { name: "Marcus Webb", role: "CTO", bio: "18 years in infrastructure. Still reads commit logs on weekends.", photo: "" },
    ],
  })),
  tpl("footer", "Full footer", (b) => ({
    ...b,
    columns: [
      { title: "Product", links: [{ label: "Features", href: "#features" }, { label: "Pricing", href: "#pricing" }, { label: "Changelog", href: "#" }] },
      { title: "Company", links: [{ label: "About", href: "#" }, { label: "Careers", href: "#" }, { label: "Contact", href: "#contact" }] },
    ],
    socials: [
      { icon: "globe", label: "Website", href: "#" },
      { icon: "mail", label: "Email", href: "#contact" },
    ],
    copyright: `© ${new Date().getFullYear()} Example Co.`,
    note: "Built with bukkyai. Own your site, always.",
  })),
];

export function templatesFor(type: SectionType): SectionTemplate[] {
  return SECTION_TEMPLATES.filter((t) => t.type === type);
}
