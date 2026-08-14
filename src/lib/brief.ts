export type FeatureGroup = "Sell & grow" | "Content & trust" | "Connect";

export type BriefFeature = {
  id: string;
  label: string;
  hint: string;
  section: string;
  group: FeatureGroup;
};

export const BRIEF_FEATURES: BriefFeature[] = [
  { id: "store", label: "Store", hint: "Products & checkout", section: "products", group: "Sell & grow" },
  { id: "pricing", label: "Pricing & plans", hint: "Compare tiers", section: "pricing", group: "Sell & grow" },
  { id: "booking", label: "Bookings", hint: "Appointments & slots", section: "booking", group: "Sell & grow" },
  { id: "newsletter", label: "Newsletter", hint: "Email sign-up", section: "newsletter", group: "Sell & grow" },
  { id: "slider", label: "Hero slider", hint: "Rotating banners", section: "heroSlider", group: "Content & trust" },
  { id: "testimonials", label: "Testimonials", hint: "Reviews & quotes", section: "testimonials", group: "Content & trust" },
  { id: "blog", label: "Blog", hint: "Posts & news", section: "posts", group: "Content & trust" },
  { id: "gallery", label: "Gallery", hint: "Photos & work", section: "gallery", group: "Content & trust" },
  { id: "faq", label: "FAQ", hint: "Questions & answers", section: "faq", group: "Content & trust" },
  { id: "team", label: "Team", hint: "People & roles", section: "team", group: "Content & trust" },
  { id: "video", label: "Video", hint: "Embed & showcase", section: "video", group: "Content & trust" },
  { id: "contact", label: "Contact form", hint: "Reach out", section: "contact", group: "Connect" },
  { id: "map", label: "Map & location", hint: "Find us", section: "map", group: "Connect" },
];

export const BRIEF_PAGES = [
  { id: "about", label: "About" },
  { id: "services", label: "Services" },
  { id: "gallery", label: "Gallery" },
  { id: "blog", label: "Blog" },
  { id: "testimonials", label: "Testimonials" },
  { id: "faq", label: "FAQ" },
  { id: "pricing", label: "Pricing" },
  { id: "contact", label: "Contact" },
];

export const BRIEF_TONES = [
  { id: "friendly", label: "Friendly", note: "Warm & approachable" },
  { id: "professional", label: "Professional", note: "Polished & credible" },
  { id: "playful", label: "Playful", note: "Bright & fun" },
  { id: "luxurious", label: "Luxurious", note: "Premium & refined" },
  { id: "authoritative", label: "Authoritative", note: "Confident & expert" },
  { id: "personal", label: "Warm & personal", note: "Story-driven & human" },
];

export const BRIEF_GOALS = [
  { id: "quote", label: "Get a quote" },
  { id: "booking", label: "Book an appointment" },
  { id: "buy", label: "Buy now" },
  { id: "signup", label: "Sign up" },
  { id: "call", label: "Call today" },
  { id: "learn", label: "Learn more" },
];

export const BRIEF_IMAGE_STYLES = [
  { id: "photos", label: "Stock photos" },
  { id: "minimal", label: "Minimal & icons" },
  { id: "illustration", label: "Illustration" },
  { id: "none", label: "No images" },
];

export const BRIEF_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
  { code: "pt", label: "Português" },
  { code: "nl", label: "Nederlands" },
  { code: "ja", label: "日本語" },
  { code: "zh", label: "中文" },
  { code: "ko", label: "한국어" },
  { code: "ar", label: "العربية" },
  { code: "hi", label: "हिन्दी" },
  { code: "ru", label: "Русский" },
];

export const BRIEF_DOMAINS = [".com", ".co", ".io", ".ai", ".net", ".org", ".site", ".online", ".store", ".dev", ".app", ".biz"];

export const EXAMPLE_PROMPTS = [
  "A bakery in Austin called June & Oak. Warm, artisanal feel. Menu, story, online ordering.",
  "A personal trainer helping busy parents stay fit. Bold, energetic. Classes, pricing, booking.",
  "A boutique law firm for startups. Calm, trustworthy. Services, team, FAQ, contact.",
  "A travel photographer selling prints and workshops. Editorial, dramatic. Gallery, store, blog.",
  "A dental clinic for anxious patients. Friendly, reassuring. Services, reviews, booking, map.",
];

export type ThemeChoice =
  | { kind: "preset"; name: string; palette: string[]; label: string }
  | { kind: "generated"; name: string; category: string; palette: string[]; label: string }
  | { kind: "surprise"; label: string }
  | null;

export type BriefState = {
  description: string;
  businessName: string;
  tagline: string;
  city: string;
  features: string[];
  pages: string[];
  onePager: boolean;
  tone: string;
  goal: string;
  imageStyle: string;
  multilingual: boolean;
  language: string;
  phone: string;
  email: string;
  address: string;
  reference: string;
  domain: string;
  theme: ThemeChoice;
};

export const EMPTY_BRIEF: BriefState = {
  description: "",
  businessName: "",
  tagline: "",
  city: "",
  features: [],
  pages: [],
  onePager: true,
  tone: "",
  goal: "",
  imageStyle: "photos",
  multilingual: false,
  language: "es",
  phone: "",
  email: "",
  address: "",
  reference: "",
  domain: ".com",
  theme: null,
};

const KEY = "bukkyai.brief";

export function loadSavedBrief(): BriefState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return { ...EMPTY_BRIEF, ...(JSON.parse(raw) as Partial<BriefState>) };
  } catch {
    return null;
  }
}

export function saveBrief(state: BriefState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
}

export function clearSavedBrief(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}

export function compileBrief(b: BriefState): string {
  const lines: string[] = [];
  const task = b.description.trim();
  if (task) lines.push(`TASK: ${task}`);
  if (b.businessName.trim()) lines.push(`BUSINESS NAME: ${b.businessName.trim()}.`);
  if (b.tagline.trim()) lines.push(`TAGLINE: ${b.tagline.trim()}.`);
  if (b.city.trim()) lines.push(`SERVICE AREA: ${b.city.trim()}.`);
  const biz: string[] = [];
  if (b.phone || b.email || b.address) {
    if (b.phone) biz.push(`phone ${b.phone}`);
    if (b.email) biz.push(`email ${b.email}`);
    if (b.address) biz.push(`address ${b.address}`);
  }
  if (biz.length > 0) lines.push(`CONTACT DETAILS: ${biz.join(", ")}`);
  if (b.goal) lines.push(`MAIN GOAL: visitors should primarily ${b.goal}.`);
  if (b.tone) lines.push(`VOICE & TONE: ${b.tone}.`);
  if (b.onePager) {
    lines.push(`PAGES: keep it a tight one-page site${b.pages.length ? " including: " + b.pages.join(", ") : ""}.`);
  } else if (b.pages.length) {
    lines.push(`PAGES: a full multi-page site with these pages: ${b.pages.join(", ")} (plus Home).`);
  }
  if (b.features.length) {
    lines.push(`FEATURES REQUIRED: ${b.features.map((f) => BRIEF_FEATURES.find((x) => x.id === f)?.label ?? f).join(", ")}.`);
  }
  if (b.theme && b.theme.kind === "generated") {
    lines.push(`THEME DIRECTION: "${b.theme.name}" (${b.theme.category}) — palette ${b.theme.palette.join(" ")}. Use these colors and this mood as the design starting point.`);
  } else if (b.theme && b.theme.kind === "preset") {
    lines.push(`THEME DIRECTION: "${b.theme.name}" — palette ${b.theme.palette.join(" ")}. Use these colors as the design starting point.`);
  } else if (b.theme && b.theme.kind === "surprise") {
    lines.push("THEME DIRECTION: surprise me — pick a bold, distinctive design direction I wouldn't expect.");
  }
  if (b.imageStyle && b.imageStyle !== "photos") {
    const style = BRIEF_IMAGE_STYLES.find((s) => s.id === b.imageStyle)?.label ?? b.imageStyle;
    lines.push(`IMAGES: use ${style} instead of generic stock photos.`);
  }
  if (b.multilingual && b.language && b.language !== "en") {
    const lang = BRIEF_LANGUAGES.find((l) => l.code === b.language)?.label ?? b.language;
    lines.push(`LANGUAGES: build it with English plus ${lang} available.`);
  }
  if (b.reference.trim()) {
    lines.push(`REFERENCE SITE: get overall vibe/structure inspiration from ${b.reference.trim()} without copying it.`);
  }
  if (b.domain) {
    lines.push(`PREFERRED WEB ADDRESS EXTENSION: ${b.domain}.`);
  }
  return lines.join("\n");
}

export function randomSurpriseTheme(): ThemeChoice {
  return { kind: "surprise", label: "Surprise me" };
}
