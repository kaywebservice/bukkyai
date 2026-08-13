import type { Section, SectionContent, SectionType } from "./types";
import { emptyContent, section } from "./blueprint";

export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do",
  "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua", "enim",
  "minim", "veniam", "quis", "nostrud", "exercitation", "ullamco", "laboris", "nisi", "aliquip",
  "commodo", "consequat", "duis", "aute", "irure", "reprehenderit", "voluptate", "velit", "esse",
  "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint", "occaecat", "cupidatat", "non",
  "proident", "sunt", "culpa", "qui", "officia", "deserunt", "mollit", "anim", "id", "est", "laborum",
];

const cap = (s: string): string => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

export function loremSentence(min = 8, max = 14): string {
  const n = randInt(min, max);
  const words: string[] = [];
  for (let i = 0; i < n; i++) words.push(pick(WORDS));
  return `${cap(words.join(" "))}.`;
}

export function loremShort(min = 3, max = 5): string {
  const n = randInt(min, max);
  const words: string[] = [];
  for (let i = 0; i < n; i++) words.push(pick(WORDS));
  return cap(words.join(" "));
}

export function loremCta(): string {
  return pick(["Get started", "Learn more", "Join now", "Explore it", "Contact us", "Try it today"]);
}

export function loremParagraph(sentences = 3): string {
  const out: string[] = [];
  for (let i = 0; i < sentences; i++) out.push(loremSentence());
  return out.join(" ");
}

export function picsum(seed: string, w = 900, h = 600): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
}

const randSeed = (): string => Math.random().toString(36).slice(2, 9);

const ICONS = [
  "sparkles", "rocket", "shield", "bolt", "star", "heart", "globe", "chart", "lock", "mail",
  "phone", "pin", "check", "arrow", "sun", "moon", "code", "camera", "clock", "tag", "users",
  "trophy", "layers", "search", "gem", "palette", "megaphone",
];

const names = [
  "Avery", "Jordan", "Riley", "Morgan", "Casey", "Quinn", "Alex", "Sam", "Rowan", "Sage",
  "Maya", "Dev", "Elena", "Marcus", "Priya", "Omar", "Nadia", "Theo", "Ingrid", "Luis",
];

const companyWords = ["North", "South", "Pine", "Maple", "Iron", "Golden", "Blue", "Cedar", "Fox", "Luna"];

export function loremName(): string {
  return `${pick(names)} ${pick(["A.", "R.", "M.", "J.", "K.", "S."])}`;
}

export function brandName(): string {
  return `${pick(companyWords)} ${pick(["&", "+", ".", "co"])}`.replace(/[.&+]+$/, "") || "Acme Co";
}

function fill(obj: Record<string, unknown>, key: string, val: unknown): void {
  if (obj[key] === undefined || obj[key] === null || obj[key] === "") obj[key] = val;
}

function safeHref(href: string | undefined, fallback: string): string {
  if (!href || !href.trim()) return fallback;
  return href.trim();
}

export function fleshSection<T extends SectionType>(type: T, content: SectionContent[T]): SectionContent[T] {
  const c = content as unknown as Record<string, unknown>;
  switch (type) {
    case "hero": {
      const h = c as Record<string, unknown>;
      if (h.layout !== "split") h.layout = "centered";
      fill(h, "eyebrow", pick(["New chapter", "Now serving", "Est. 2019", "Hand made", "Since 2015", "Welcome in"]));
      fill(h, "title", loremShort(4, 6));
      fill(h, "subtitle", loremParagraph(2));
      const pc = (h.primaryCta ?? {}) as Record<string, unknown>;
      pc.label = pc.label || loremCta();
      pc.href = safeHref(pc.href as string, "#contact");
      h.primaryCta = pc;
      const sc = (h.secondaryCta ?? {}) as Record<string, unknown>;
      sc.label = sc.label || loremCta();
      sc.href = safeHref(sc.href as string, "#contact");
      h.secondaryCta = sc;
      const img = (h.image ?? {}) as Record<string, unknown>;
      img.url = img.url || "";
      img.alt = img.alt || "Illustrative placeholder image";
      h.image = img;
      fill(h, "trust", `${randInt(4, 5)}.${randInt(0, 9)}/${randInt(2, 5)} from ${randInt(100, 900)}+ happy customers`);
      break;
    }
    case "logos": {
      const h = c as Record<string, unknown>;
      fill(h, "heading", pick(["Featured in", "Trusted by", "As seen in", "Our partners"]));
      const items = (Array.isArray(h.items) ? h.items : []).filter((x) => x !== "");
      while (items.length < 5) items.push(pick(["Alpha", "Northwind", "Halcyon", "Verde", "Orbit", "Trent", "Ponder", "Cobalt", "Everly", "Macro"]) + pick(["", " Labs", " & Co", " Studio"]));
      h.items = items;
      break;
    }
    case "features": {
      const h = c as Record<string, unknown>;
      fill(h, "heading", loremShort(4, 5));
      fill(h, "subheading", loremShort(6, 9));
      const items = (Array.isArray(h.items) ? h.items : []) as Record<string, unknown>[];
      items.forEach((it) => {
        it.icon = it.icon || pick(ICONS);
        it.title = it.title || loremShort(3, 4);
        it.desc = it.desc || loremSentence(10, 16);
      });
      while (items.length < 4) {
        items.push({ icon: pick(ICONS), title: loremShort(3, 4), desc: loremSentence(10, 16) });
      }
      h.items = items;
      break;
    }
    case "stats": {
      const h = c as Record<string, unknown>;
      fill(h, "heading", loremShort(4, 5));
      const items = (Array.isArray(h.items) ? h.items : []) as Record<string, unknown>[];
      items.forEach((it) => {
        it.value = it.value || `${randInt(2, 999)}${pick(["k+", "%", "+", "x", ""])}`;
        it.label = it.label || loremShort(2, 3);
      });
      while (items.length < 4) {
        items.push({ value: `${randInt(2, 999)}${pick(["k+", "%", "+", "x", ""])}`, label: loremShort(2, 3) });
      }
      h.items = items;
      break;
    }
    case "testimonials": {
      const h = c as Record<string, unknown>;
      fill(h, "heading", loremShort(4, 5));
      fill(h, "subheading", h.subheading || loremShort(6, 9));
      const items = (Array.isArray(h.items) ? h.items : []) as Record<string, unknown>[];
      items.forEach((it) => {
        it.quote = it.quote || loremSentence(12, 20);
        it.name = it.name || loremName();
        it.role = it.role || pick(["Customer", "Client", "Founder", "Subscriber", "Partner", "Regular"]);
      });
      while (items.length < 3) items.push({ quote: loremSentence(12, 20), name: loremName(), role: "Customer" });
      h.items = items;
      break;
    }
    case "pricing": {
      const h = c as Record<string, unknown>;
      fill(h, "heading", loremShort(4, 5));
      fill(h, "subheading", loremShort(6, 9));
      fill(h, "currency", "$");
      fill(h, "period", "/mo");
      const items = (Array.isArray(h.items) ? h.items : []) as Record<string, unknown>[];
      items.forEach((it, idx) => {
        const p = it as Record<string, unknown>;
        p.name = p.name || pick(["Starter", "Growth", "Pro", "Business", "Scale", "Core", "Plus"]);
        p.price = p.price || String(randInt(9, 99));
        p.description = p.description || loremShort(8, 12);
        const feats = (Array.isArray(p.features) ? p.features : []).filter((x) => x !== "");
        while (feats.length < 4) feats.push(loremShort(4, 6));
        p.features = feats;
        const cta = (p.cta ?? {}) as Record<string, unknown>;
        cta.label = cta.label || `Choose ${p.name}`;
        cta.href = safeHref(cta.href as string, "#contact");
        p.cta = cta;
        p.featured = Boolean(p.featured) || (idx === 1 && items.length > 2);
      });
      while (items.length < 3) {
        items.push({
          name: pick(["Starter", "Growth", "Pro"]),
          price: String(randInt(9, 99)),
          description: loremShort(8, 12),
          features: [loremShort(4, 6), loremShort(4, 6), loremShort(4, 6), loremShort(4, 6)],
          cta: { label: "Choose plan", href: "#contact" },
          featured: false,
        });
      }
      if (items.every((it) => !it.featured)) (items[1] as Record<string, unknown>).featured = true;
      h.items = items;
      break;
    }
    case "faq": {
      const h = c as Record<string, unknown>;
      fill(h, "heading", loremShort(4, 5));
      const items = (Array.isArray(h.items) ? h.items : []) as Record<string, unknown>[];
      items.forEach((it) => {
        it.q = it.q || loremShort(6, 9) + "?";
        it.a = it.a || loremSentence(14, 22);
      });
      while (items.length < 4) items.push({ q: loremShort(6, 9) + "?", a: loremSentence(14, 22) });
      h.items = items;
      break;
    }
    case "cta": {
      const h = c as Record<string, unknown>;
      fill(h, "title", loremShort(5, 7));
      fill(h, "subtitle", loremSentence(12, 18));
      const btn = (h.button ?? {}) as Record<string, unknown>;
      btn.label = btn.label || loremCta();
      btn.href = safeHref(btn.href as string, "#contact");
      h.button = btn;
      fill(h, "note", loremShort(6, 9));
      break;
    }
    case "contact": {
      const h = c as Record<string, unknown>;
      fill(h, "heading", loremShort(3, 4));
      fill(h, "subheading", loremSentence(8, 14));
      fill(h, "email", "hello@example.com");
      fill(h, "phone", "(555) 010-0100");
      fill(h, "address", "123 Main Street, Portland, OR");
      const form = (h.form ?? {}) as Record<string, unknown>;
      const fields =
        Array.isArray(form.fields) && form.fields.length > 0
          ? (form.fields as Record<string, unknown>[])
          : [
              { label: "Name", type: "text", required: true },
              { label: "Email", type: "email", required: true },
              { label: "Message", type: "textarea", required: true },
            ];
      form.fields = fields;
      h.form = form;
      fill(h, "submitLabel", "Send message");
      break;
    }
    case "gallery": {
      const h = c as Record<string, unknown>;
      fill(h, "heading", loremShort(4, 5));
      fill(h, "subheading", h.subheading || loremShort(6, 9));
      const items = (Array.isArray(h.items) ? h.items : []) as Record<string, unknown>[];
      items.forEach((it, idx) => {
        it.url = it.url || picsum(`g${randSeed()}${idx}`, 900, 600);
        it.alt = it.alt || loremShort(3, 5);
        it.caption = it.caption || loremShort(3, 5);
      });
      while (items.length < 6) items.push({ url: picsum(`g${randSeed()}-${items.length}`, 900, 600), alt: loremShort(3, 5), caption: loremShort(3, 5) });
      h.items = items;
      break;
    }
    case "team": {
      const h = c as Record<string, unknown>;
      fill(h, "heading", loremShort(4, 5));
      fill(h, "subheading", h.subheading || loremShort(6, 9));
      const items = (Array.isArray(h.items) ? h.items : []) as Record<string, unknown>[];
      items.forEach((it, idx) => {
        it.photo = it.photo || picsum(`t${randSeed()}${idx}`, 500, 500);
        it.name = it.name || `${pick(names)} ${pick(names)}`;
        it.role = it.role || pick(["Founder", "Designer", "Engineer", "Marketer", "Lead", "Director"]);
        it.bio = it.bio || loremSentence(9, 15);
      });
      while (items.length < 4) {
        items.push({ photo: picsum(`t${randSeed()}-${items.length}`, 500, 500), name: `${pick(names)} ${pick(names)}`, role: pick(["Founder", "Designer", "Engineer"]), bio: loremSentence(9, 15) });
      }
      h.items = items;
      break;
    }
    case "timeline": {
      const h = c as Record<string, unknown>;
      fill(h, "heading", loremShort(4, 5));
      fill(h, "subheading", h.subheading || loremShort(6, 9));
      const items = (Array.isArray(h.items) ? h.items : []) as Record<string, unknown>[];
      items.forEach((it) => {
        it.period = it.period || `20${randInt(12, 26)}`;
        it.title = it.title || loremShort(3, 5);
        it.desc = it.desc || loremSentence(10, 16);
      });
      while (items.length < 3) items.push({ period: `20${randInt(12, 26)}`, title: loremShort(3, 5), desc: loremSentence(10, 16) });
      h.items = items;
      break;
    }
    case "comparison": {
      const h = c as Record<string, unknown>;
      fill(h, "heading", loremShort(4, 5));
      fill(h, "subheading", h.subheading || loremShort(6, 9));
      const columns = (Array.isArray(h.columns) ? h.columns : []) as Record<string, unknown>[];
      columns.forEach((col) => {
        col.name = col.name || pick(["Basic", "Pro", "Enterprise"]);
      });
      while (columns.length < 2) columns.push({ name: pick(["Basic", "Pro", "Enterprise"]) });
      const rows = (Array.isArray(h.rows) ? h.rows : []) as Record<string, unknown>[];
      rows.forEach((row) => {
        (row as Record<string, unknown>).label = ((row as Record<string, unknown>).label as string) || loremShort(4, 6);
        const values = Array.isArray((row as Record<string, unknown>).values) ? ((row as Record<string, unknown>).values as unknown[]) : [];
        while (values.length < columns.length) values.push(pick([true, false, loremShort(2, 3)]));
        (row as Record<string, unknown>).values = values;
      });
      while (rows.length < 4) {
        rows.push({ label: loremShort(4, 6), values: Array.from({ length: columns.length }, () => pick([true, false, loremShort(2, 3)])) });
      }
      h.columns = columns;
      h.rows = rows;
      break;
    }
    case "newsletter": {
      const h = c as Record<string, unknown>;
      fill(h, "heading", loremShort(4, 5));
      fill(h, "subheading", loremShort(6, 9));
      fill(h, "placeholder", "you@email.com");
      fill(h, "button", "Subscribe");
      fill(h, "note", loremShort(6, 8));
      break;
    }
    case "video": {
      const h = c as Record<string, unknown>;
      fill(h, "heading", loremShort(4, 5));
      fill(h, "url", h.url || "");
      fill(h, "caption", h.caption || loremShort(6, 9));
      break;
    }
    case "map": {
      const h = c as Record<string, unknown>;
      fill(h, "heading", loremShort(3, 4));
      fill(h, "address", h.address || "123 Main Street, Portland, OR");
      fill(h, "embedUrl", h.embedUrl || "");
      break;
    }
    case "footer": {
      const h = c as Record<string, unknown>;
      const columns = (Array.isArray(h.columns) ? h.columns : []) as Record<string, unknown>[];
      const colTitles = ["Explore", "Company", "Connect"];
      columns.forEach((col, idx) => {
        col.title = col.title || colTitles[idx % colTitles.length];
        const links = (Array.isArray(col.links) ? col.links : []) as Record<string, unknown>[];
        links.forEach((ln) => {
          ln.label = ln.label || loremShort(2, 3);
          ln.href = (ln.href as string) || "#contact";
        });
        while (links.length < 3) links.push({ label: loremShort(2, 3), href: "#contact" });
        col.links = links;
      });
      if (columns.length === 0) {
        columns.push({ title: "Explore", links: [{ label: "Home", href: "#hero" }, { label: "Features", href: "#features" }, { label: "Pricing", href: "#pricing" }] });
        columns.push({ title: "Company", links: [{ label: "About", href: "#about" }, { label: "Contact", href: "#contact" }, { label: "FAQ", href: "#faq" }] });
        columns.push({ title: "Connect", links: [{ label: "Newsletter", href: "#newsletter" }, { label: "Support", href: "#contact" }, { label: "Careers", href: "#careers" }] });
      }
      h.columns = columns;
      const socials = (Array.isArray(h.socials) ? h.socials : []) as Record<string, unknown>[];
      socials.forEach((soc) => {
        soc.label = soc.label || pick(["Twitter", "Instagram", "LinkedIn"]);
        soc.icon = soc.icon || pick(["globe", "mail", "phone", "share"]);
        soc.href = (soc.href as string) || "#social";
      });
      while (socials.length < 3) {
        socials.push({ label: pick(["Twitter", "Instagram", "LinkedIn"]), icon: pick(["globe", "mail", "phone"]), href: "#social" });
      }
      h.socials = socials;
      fill(h, "copyright", `© ${new Date().getFullYear()} ${loremShort(2, 3)}. All rights reserved.`);
      fill(h, "note", loremShort(6, 9));
      break;
    }
    case "custom": {
      const h = c as Record<string, unknown>;
      fill(h, "html", "");
      break;
    }
    case "products": {
      const h = c as Record<string, unknown>;
      fill(h, "heading", loremShort(4, 5));
      fill(h, "subheading", h.subheading || loremShort(6, 9));
      fill(h, "currency", "$");
      const items = (Array.isArray(h.items) ? h.items : []) as Record<string, unknown>[];
      items.forEach((it) => {
        const p = it as Record<string, unknown>;
        p.name = p.name || loremShort(2, 4);
        p.price = p.price ?? randInt(9, 199);
        p.description = p.description || loremSentence(8, 14);
        if (!Array.isArray(p.features) || (p.features as unknown[]).length === 0) p.features = [loremShort(3, 5), loremShort(3, 5), loremShort(3, 5)];
        p.image = p.image || "";
        p.badge = p.badge || pick(["Bestseller", "New", "Limited"]);
      });
      while (items.length < 3) {
        items.push({ id: `p${Math.random().toString(36).slice(2, 9)}`, name: loremShort(2, 4), price: randInt(9, 199), description: loremSentence(8, 14), features: [loremShort(3, 5), loremShort(3, 5)], image: "", badge: "New" });
      }
      h.items = items;
      break;
    }
    case "booking": {
      const h = c as Record<string, unknown>;
      fill(h, "heading", loremShort(3, 4));
      fill(h, "subheading", h.subheading || loremShort(6, 9));
      fill(h, "embedUrl", h.embedUrl || "");
      fill(h, "buttonLabel", "Book now");
      fill(h, "note", h.note || loremShort(6, 9));
      break;
    }
    case "posts": {
      const h = c as Record<string, unknown>;
      fill(h, "heading", "Blog");
      fill(h, "subheading", h.subheading || loremShort(6, 9));
      fill(h, "layout", h.layout || "grid");
      fill(h, "postsPerPage", 6);
      fill(h, "showExcerpt", true);
      fill(h, "category", "");
      break;
    }
  }
  return c as SectionContent[T];
}

export function filledSection(type: SectionType): Section {
  return section(type, fleshSection(type, emptyContent(type)));
}
