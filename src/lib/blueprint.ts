import type {
  Checkpoint,
  DesignSystem,
  Section,
  SectionContent,
  SectionType,
  SiteBlueprint,
} from "./types";

export const SECTION_TYPES: { type: SectionType; label: string }[] = [
  { type: "hero", label: "Hero" },
  { type: "logos", label: "Logo cloud" },
  { type: "features", label: "Features" },
  { type: "stats", label: "Stats" },
  { type: "testimonials", label: "Testimonials" },
  { type: "team", label: "Team" },
  { type: "pricing", label: "Pricing" },
  { type: "comparison", label: "Comparison" },
  { type: "timeline", label: "Timeline" },
  { type: "faq", label: "FAQ" },
  { type: "gallery", label: "Gallery" },
  { type: "video", label: "Video" },
  { type: "map", label: "Map" },
  { type: "embed", label: "Embed" },
  { type: "newsletter", label: "Newsletter" },
  { type: "cta", label: "Call to action" },
  { type: "contact", label: "Contact" },
  { type: "footer", label: "Footer" },
  { type: "custom", label: "Custom code" },
  { type: "products", label: "Products" },
  { type: "booking", label: "Booking" },
  { type: "posts", label: "Blog posts" },
];

export const SECTION_LABEL: Record<SectionType, string> = Object.fromEntries(
  SECTION_TYPES.map((s) => [s.type, s.label])
) as Record<SectionType, string>;

export function uid(prefix = "s"): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

export const DEFAULT_DESIGN: DesignSystem = {
  name: "Default",
  tokens: {
    colors: {
      background: "#ffffff",
      surface: "#f6f6f4",
      text: "#131316",
      muted: "#5c5c66",
      primary: "#1a1a22",
      primaryContrast: "#ffffff",
      accent: "#e8552e",
      accentContrast: "#ffffff",
      border: "#e5e5e0",
    },
    fonts: { heading: "Space Grotesk", body: "Inter" },
    fontScale: { display: 56, h1: 44, h2: 32, h3: 22, h4: 17, body: 16, small: 13 },
    spacing: { section: 96, container: 1120, stack: 16, gap: 24 },
    radius: { sm: 8, md: 14, lg: 20, pill: 999 },
    shadows: {
      sm: "0 1px 2px rgba(16,16,20,.06)",
      md: "0 8px 24px rgba(16,16,20,.08)",
      lg: "0 24px 64px rgba(16,16,20,.12)",
    },
    motion: { durationMs: 200 },
    mode: "light",
  },
};

export function section<T extends SectionType>(type: T, content: SectionContent[T]): Section {
  return { id: uid(), type, content };
}

export function emptyContent(type: SectionType): SectionContent[SectionType] {
  switch (type) {
    case "hero":
      return {
        layout: "centered",
        eyebrow: "",
        title: "",
        subtitle: "",
        primaryCta: { label: "Get started", href: "#contact" },
        secondaryCta: { label: "Learn more", href: "#features" },
        image: { url: "", alt: "" },
        trust: "",
      };
    case "logos":
      return { heading: "", items: [""] };
    case "features":
      return { heading: "", subheading: "", items: [{ icon: "bolt", title: "", desc: "" }] };
    case "stats":
      return { heading: "", items: [{ value: "", label: "" }] };
    case "testimonials":
      return { heading: "", subheading: "", items: [{ quote: "", name: "", role: "" }] };
    case "team":
      return { heading: "", subheading: "", items: [{ name: "", role: "", bio: "", photo: "" }] };
    case "timeline":
      return { heading: "", subheading: "", items: [{ period: "", title: "", desc: "" }] };
    case "comparison":
      return {
        heading: "",
        subheading: "",
        columns: [{ name: "" }, { name: "" }],
        rows: [{ label: "", values: [true, false] }],
      };
    case "newsletter":
      return { heading: "", subheading: "", placeholder: "", button: "", note: "" };
    case "pricing":
      return {
        heading: "",
        subheading: "",
        currency: "$",
        period: "/mo",
        items: [
          {
            name: "",
            price: "",
            description: "",
            features: [""],
            cta: { label: "", href: "#contact" },
            featured: false,
          },
        ],
      };
    case "faq":
      return { heading: "", items: [{ q: "", a: "" }] };
    case "cta":
      return { title: "", subtitle: "", button: { label: "", href: "#contact" }, note: "" };
    case "contact":
      return {
        heading: "",
        subheading: "",
        email: "",
        phone: "",
        address: "",
        form: {
          fields: [
            { label: "Name", type: "text", required: true },
            { label: "Email", type: "email", required: true },
            { label: "Message", type: "textarea", required: true },
          ],
        },
        submitLabel: "Send message",
      };
    case "gallery":
      return { heading: "", items: [{ url: "", alt: "", caption: "" }] };
    case "video":
      return { heading: "", url: "", caption: "" };
    case "map":
      return { heading: "", address: "", embedUrl: "" };
    case "embed":
      return { heading: "", url: "", caption: "", provider: "generic" };
    case "footer":
      return {
        columns: [{ title: "", links: [{ label: "", href: "" }] }],
        socials: [{ icon: "globe", label: "", href: "" }],
        copyright: "",
        note: "",
      };
    case "custom":
      return { html: "" };
    case "products":
      return {
        heading: "",
        subheading: "",
        currency: "$",
        items: [
          {
            id: uid(),
            name: "",
            price: 0,
            description: "",
            features: [],
            image: "",
            badge: "",
            sku: "",
          },
        ],
      };
    case "booking":
      return {
        heading: "",
        subheading: "",
        embedUrl: "",
        buttonLabel: "Book now",
        note: "",
        formFields: [
          { label: "Name", type: "text", required: true },
          { label: "Email", type: "email", required: true },
          { label: "Date", type: "date", required: true },
          { label: "Message", type: "textarea", required: false },
        ],
      };
    case "posts":
      return {
        heading: "",
        subheading: "",
        layout: "grid",
        postsPerPage: 6,
        showExcerpt: true,
        category: "",
      };
  }
}

export function footerSection(
  copyright: string,
  note: string
): Section {
  return section("footer", {
    columns: [],
    socials: [],
    copyright,
    note,
  });
}

export function emptyBlueprint(title = "Untitled site"): SiteBlueprint {
  return {
    version: 1,
    meta: { title, description: "", lang: "en" },
    nav: { links: [], cta: null },
    design: JSON.parse(JSON.stringify(DEFAULT_DESIGN)) as DesignSystem,
    pages: [],
  };
}

export function sampleProject(): SiteBlueprint {
  return {
    version: 1,
    meta: {
      title: "Northwind — specialty coffee, roasted weekly",
      description:
        "Small-batch specialty coffee roasted in Portland. Subscribe and get beans delivered within 48 hours of roasting.",
      lang: "en",
    },
    nav: {
      links: [
        { label: "Roasts", href: "#features" },
        { label: "Pricing", href: "#pricing" },
        { label: "FAQ", href: "#faq" },
      ],
      cta: { label: "Start subscription", href: "#cta" },
    },
    design: {
      name: "Northwind",
      tokens: {
        colors: {
          background: "#f7f2ea",
          surface: "#fffdf8",
          text: "#241a12",
          muted: "#6f5e4e",
          primary: "#241a12",
          primaryContrast: "#f7f2ea",
          accent: "#c2410c",
          accentContrast: "#fff8ef",
          border: "#e6dccb",
        },
        fonts: { heading: "Fraunces", body: "Inter" },
        fontScale: { display: 56, h1: 44, h2: 32, h3: 22, h4: 17, body: 16, small: 13 },
        spacing: { section: 96, container: 1120, stack: 16, gap: 24 },
        radius: { sm: 8, md: 14, lg: 20, pill: 999 },
        shadows: {
          sm: "0 1px 2px rgba(60,40,20,.06)",
          md: "0 8px 24px rgba(60,40,20,.08)",
          lg: "0 24px 64px rgba(60,40,20,.12)",
        },
        motion: { durationMs: 200 },
        mode: "light",
      },
    },
    pages: [
      {
        id: uid("pg"),
        slug: "",
        title: "Northwind Coffee",
        description: "Specialty coffee roasted to order, delivered fresh.",
        sections: [
          section("hero", {
            layout: "split",
            eyebrow: "Roasted to order · Portland, OR",
            title: "Coffee that was roasted this week, not last quarter.",
            subtitle:
              "Northwind sources single-origin beans and roasts them in small batches. Your subscription ships within 48 hours of the roast — never stale, never arbitrary.",
            primaryCta: { label: "Start a subscription", href: "#cta" },
            secondaryCta: { label: "See the roasts", href: "#features" },
            trust: "4.9/5 from 2,300+ subscribers · Free shipping on first box",
          }),
          section("logos", {
            heading: "Featured in",
            items: ["Sprudge", "Food & Wine", "Bon Appétit", "Portland Monthly", "Eater"],
          }),
          section("features", {
            heading: "Everything the beans deserve",
            subheading: "From green sourcing to your door, every step is deliberate.",
            items: [
              {
                icon: "trophy",
                title: "87+ point sourcing",
                desc: "We cup 40+ single-origin lots a month and only buy lots scoring 87 points or higher on the SCA scale.",
              },
              {
                icon: "clock",
                title: "Fresh within 48 hours",
                desc: "Roasts ship the same week they're roasted. Most subscriptions arrive within two days of roasting.",
              },
              {
                icon: "globe",
                title: "Direct relationships",
                desc: "We pay 2.4x Fair Trade price to the farms we buy from, and visit every origin partner at least once a year.",
              },
              {
                icon: "bolt",
                title: "Roasted to your style",
                desc: "Pick light, medium, or dark. We calibrate each roast profile to the bean, not the machine.",
              },
            ],
          }),
          section("stats", {
            heading: "The numbers behind the ritual",
            items: [
              { value: "120k+", label: "boxes shipped" },
              { value: "24", label: "origin partners" },
              { value: "48h", label: "roast-to-door" },
              { value: "92%", label: "of subscribers stay after year one" },
            ],
          }),
          section("testimonials", {
            heading: "Subscribers, caffeinated",
            subheading: "Real words from real boxes of beans.",
            items: [
              {
                quote:
                  "I canceled my old subscription after the first box. The tasting notes were accurate — I can taste the blueberry in the Yirgacheffe every single time.",
                name: "Maya Chen",
                role: "Subscriber for 2 years",
              },
              {
                quote:
                  "The roast date on the bag is within 48 hours of my door. Nothing else on the market even comes close to this freshness.",
                name: "Dev Patel",
                role: "Subscriber for 1 year",
              },
              {
                quote:
                  "I've sent boxes as gifts to three different people. Every single one has resubscribed on their own.",
                name: "Sarah Kim",
                role: "Subscriber for 8 months",
              },
            ],
          }),
          section("pricing", {
            heading: "Simple, honest pricing",
            subheading: "Skip or pause anytime. No lock-in, no fine print.",
            currency: "$",
            period: "/mo",
            items: [
              {
                name: "Explorer",
                price: "22",
                description: "Two 12oz bags of the current single-origin, one blend.",
                features: ["Free shipping", "Pause or skip anytime", "Tasting notes included"],
                cta: { label: "Choose Explorer", href: "#cta" },
                featured: false,
              },
              {
                name: "Devotee",
                price: "38",
                description: "Four 12oz bags, first pick of limited lots, 10% off merch.",
                features: [
                  "Free shipping",
                  "First access to limited roasts",
                  "10% off brewing gear",
                  "Priority roast slots",
                ],
                cta: { label: "Choose Devotee", href: "#cta" },
                featured: true,
              },
              {
                name: "For the Office",
                price: "72",
                description: "8lb of beans monthly with a free grinder rental.",
                features: ["Free shipping", "Bulk whole-bean or ground", "Free grinder rental"],
                cta: { label: "Talk to us", href: "#contact" },
                featured: false,
              },
            ],
          }),
          section("faq", {
            heading: "Questions, roasted",
            items: [
              {
                q: "How fresh is the coffee really?",
                a: "Every bag is roasted within 48 hours of shipping. Most subscribers receive coffee 2–4 days off roast. We guarantee the roast date on every bag.",
              },
              {
                q: "Can I pause or cancel?",
                a: "Anytime, in two clicks, from your account. No fees, no retention calls, no guilt trips.",
              },
              {
                q: "What grind should I pick?",
                a: "If you use a drip machine or pour-over, choose 'ground for pour-over'. If you use espresso, pick that setting. Whole bean is always an option.",
              },
              {
                q: "Do you offer decaf?",
                a: "Yes — we carry a Swiss Water decaf single-origin in every subscription cycle.",
              },
            ],
          }),
          section("cta", {
            title: "Your morning deserves better beans.",
            subtitle:
              "Join 4,000+ people who stopped settling for stale grocery-store coffee. First box ships within 48 hours of roasting.",
            button: { label: "Start my subscription", href: "#contact" },
            note: "30-day money-back guarantee. Seriously.",
          }),
          section("contact", {
            heading: "Talk to a roaster",
            subheading: "Questions about your order, a subscription, or wholesale? We answer within a day.",
            email: "hello@northwind.coffee",
            phone: "(503) 555-0142",
            address: "1420 SE Alder St, Portland, OR",
            form: {
              fields: [
                { label: "Name", type: "text", required: true },
                { label: "Email", type: "email", required: true },
                { label: "Message", type: "textarea", required: true },
              ],
            },
            submitLabel: "Send message",
          }),
          footerSection("© 2026 Northwind Coffee Co.", "Roasted with intent in Portland, OR."),
        ],
      },
    ],
  };
}

export function checkpoint(label: string, doc: SiteBlueprint, source: Checkpoint["source"]): Checkpoint {
  return {
    id: uid("chk"),
    label,
    at: Date.now(),
    source,
    doc: JSON.parse(JSON.stringify(doc)) as SiteBlueprint,
  };
}

export function getField(obj: unknown, path: string): unknown {
  let cur: unknown = obj;
  for (const part of path.split(".")) {
    const m = part.match(/^(\w+)\[(\d+)\]$/);
    if (m) {
      const arr = (cur as Record<string, unknown[] | undefined> | undefined)?.[m[1]];
      cur = Array.isArray(arr) ? arr[Number(m[2])] : undefined;
    } else {
      cur = (cur as Record<string, unknown> | null | undefined)?.[part];
    }
    if (cur === undefined) return undefined;
  }
  return cur;
}

export function setField(target: Record<string, unknown>, path: string, value: unknown): boolean {
  const parts = path.split(".");
  let cur: Record<string, unknown> | unknown[] = target;
  for (let i = 0; i < parts.length - 1; i++) {
    const m = parts[i].match(/^(\w+)\[(\d+)\]$/);
    if (m) {
      const arr = cur as Record<string, unknown[]>;
      if (!Array.isArray(arr[m[1]])) arr[m[1]] = [];
      cur = arr[m[1]][Number(m[2])] as Record<string, unknown>;
    } else {
      const next = (cur as Record<string, unknown>)[parts[i]];
      cur = next as Record<string, unknown>;
    }
    if (cur === undefined || cur === null) return false;
  }
  const last = parts[parts.length - 1];
  const lm = last.match(/^(\w+)\[(\d+)\]$/);
  if (lm) {
    const arr = (cur as Record<string, unknown[]>)[lm[1]];
    if (!Array.isArray(arr)) return false;
    arr[Number(lm[2])] = value;
  } else {
    (cur as Record<string, unknown>)[last] = value;
  }
  return true;
}
