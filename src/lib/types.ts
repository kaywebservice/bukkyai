export type ColorTokens = {
  background: string;
  surface: string;
  text: string;
  muted: string;
  primary: string;
  primaryContrast: string;
  accent: string;
  accentContrast: string;
  border: string;
};

export type FontScale = {
  display: number;
  h1: number;
  h2: number;
  h3: number;
  h4: number;
  body: number;
  small: number;
};

export type SpacingTokens = {
  section: number;
  container: number;
  stack: number;
  gap: number;
};

export type RadiusTokens = {
  sm: number;
  md: number;
  lg: number;
  pill: number;
};

export type DesignTokens = {
  colors: ColorTokens;
  fonts: { heading: string; body: string };
  fontScale: FontScale;
  spacing: SpacingTokens;
  radius: RadiusTokens;
  shadows: { sm: string; md: string; lg: string };
  motion: { durationMs: number };
  mode: "light" | "dark";
};

export type DesignSystem = {
  name: string;
  tokens: DesignTokens;
};

export type SectionContent = {
  hero?: {
    layout: "centered" | "split";
    eyebrow: string;
    title: string;
    subtitle: string;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
    image?: { url: string; alt: string };
    trust: string;
  };
  logos?: { heading: string; items: string[] };
  features?: {
    heading: string;
    subheading: string;
    items: { icon: string; title: string; desc: string }[];
  };
  stats?: { heading: string; items: { value: string; label: string }[] };
   testimonials?: {
    heading: string;
    subheading?: string;
    items: { quote: string; name: string; role: string }[];
  };
  pricing?: {
    heading: string;
    subheading: string;
    currency: string;
    period: string;
    items: {
      name: string;
      price: string;
      description: string;
      features: string[];
      cta: { label: string; href: string };
      featured: boolean;
    }[];
  };
  cta?: {
    title: string;
    subtitle: string;
    button: { label: string; href: string };
    note: string;
  };
  faq?: { heading: string; items: { q: string; a: string }[] };
  contact?: {
    heading: string;
    subheading: string;
    email: string;
    phone: string;
    address: string;
    form: { fields: { label: string; type: string; required: boolean }[] };
    submitLabel: string;
  };
   gallery?: { heading: string; subheading?: string; items: { url: string; alt: string; caption: string }[] };
  team?: {
    heading: string;
    subheading: string;
    items: { name: string; role: string; bio: string; photo?: string }[];
  };
   timeline?: {
    heading: string;
    subheading?: string;
    items: { period: string; title: string; desc: string }[];
  };
  comparison?: {
    heading: string;
    subheading: string;
    columns: { name: string }[];
    rows: { label: string; values: (string | boolean)[] }[];
  };
  newsletter?: {
    heading: string;
    subheading: string;
    placeholder: string;
    button: string;
    note: string;
  };
  video?: { heading: string; url: string; caption: string };
  map?: { heading: string; address: string; embedUrl: string };
  embed?: { heading: string; url: string; caption: string; provider?: "youtube" | "vimeo" | "spotify" | "cal" | "maps" | "generic" };
  footer?: {
    columns: { title: string; links: { label: string; href: string }[] }[];
    socials: { icon: string; label: string; href: string }[];
    copyright: string;
    note: string;
  };
  custom?: { html: string };
  products?: {
    heading: string;
    subheading?: string;
    currency?: string;
    items: {
      id: string;
      name: string;
      price: number;
      description: string;
      features?: string[];
      image?: string;
      badge?: string;
      sku?: string;
    }[];
  };
  booking?: {
    heading: string;
    subheading?: string;
    embedUrl?: string;
    buttonLabel?: string;
    note?: string;
    formFields?: { label: string; type: string; required: boolean }[];
  };
  posts?: {
    heading: string;
    subheading?: string;
    layout?: "grid" | "list";
    postsPerPage?: number;
    showExcerpt?: boolean;
    category?: string;
  };
};

export type SectionType = keyof SectionContent;

export type SectionMotion = "fade" | "slide-up" | "slide-left" | "slide-right" | "zoom" | "marquee" | "none";

export const MOTION_OPTIONS: { value: SectionMotion; label: string }[] = [
  { value: "none", label: "None" },
  { value: "fade", label: "Fade in" },
  { value: "slide-up", label: "Slide up" },
  { value: "slide-left", label: "Slide left" },
  { value: "slide-right", label: "Slide right" },
  { value: "zoom", label: "Zoom in" },
  { value: "marquee", label: "Marquee" },
];

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  cover?: string;
  category?: string;
  author?: string;
};

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  qty: number;
  image?: string;
};

export type Section = {
  id: string;
  type: SectionType;
  content: SectionContent[SectionType];
  motion?: SectionMotion;
};

export type Page = {
  id: string;
  slug: string;
  title: string;
  description: string;
  sections: Section[];
};

export type NavLink = { label: string; href: string };

export type RedirectRule = { from: string; to: string };

export type CookieConsent = {
  enabled: boolean;
  text?: string;
  policyUrl?: string;
};

export type SiteTheme = {
  defaultMode: "auto" | "light" | "dark";
  toggle: boolean;
};

export type SiteBlueprint = {
  version: number;
  meta: { title: string; description: string; lang: string; ogImage?: string };
  nav: { links: NavLink[]; cta: NavLink | null };
  design: DesignSystem;
  pages: Page[];
  embeds?: { head: string[]; body: string[] };
  analytics?: { plausible?: string; goatcounter?: string };
  forms?: { endpoint?: string };
  voice?: string;
  posts?: Post[];
  languages?: { default: string; supported: string[]; translations?: Record<string, Record<string, string>> };
  password?: string;
  stripePaymentLink?: string;
  redirects?: RedirectRule[];
  cookieConsent?: CookieConsent;
  theme?: SiteTheme;
};

export type CheckpointSource = "init" | "plan" | "design" | "content" | "edit" | "manual";

export type Checkpoint = {
  id: string;
  label: string;
  at: number;
  source: CheckpointSource;
  doc: SiteBlueprint;
};

export type PlanSection = { type: SectionType; purpose: string };

export type PlanPage = {
  slug: string;
  title: string;
  description: string;
  sections: PlanSection[];
};

export type SitePlan = {
  meta: { title: string; description: string; lang: string };
  nav: { links: NavLink[]; cta: NavLink | null };
  pages: PlanPage[];
  tone: string;
};

export type EditPatch = {
  meta?: SiteBlueprint["meta"];
  nav?: SiteBlueprint["nav"];
  design?: DesignSystem;
  pages?: Page[];
  summary: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
  kind?: "status" | "error" | "info";
};

export type LLMSettings = {
  provider: "openai" | "anthropic" | "gemini" | "custom";
  apiKey: string;
  model: string;
  baseUrl?: string;
  imageModel?: string;
  githubToken?: string;
  formEndpoint?: string;
  analyticsDomain?: string;
};

export const DEVICE = {
  desktop: 1280,
  tablet: 768,
  mobile: 375,
} as const;

export type BuilderStatus =
  | "idle"
  | "planning"
  | "designing"
  | "writing"
  | "applying"
  | "rewriting"
  | "error";
