import type {
  DesignSystem,
  LLMSettings,
  Page,
  Post,
  Section,
  SectionContent,
  SectionType,
  SiteBlueprint,
  SitePlan,
} from "./types";
import { callJSON, callLLM } from "./llm";
import {
  DESIGN_SYSTEM_SYSTEM,
  DISCUSS_SYSTEM,
  FIELD_REWRITE_SYSTEM,
  PLAN_SYSTEM,
  SELF_REVIEW_SYSTEM,
  TONE_SYSTEM,
  contentPageUser,
  contentSystem,
  designUser,
  discussUser,
  editSystem,
  editUser,
  fieldRewriteUser,
  planUser,
  refineDesignUser,
  sectionIdeaUser,
  toneUser,
  TRANSLATE_SYSTEM,
  translateUser,
} from "./prompts";
import { uid } from "./blueprint";
import { filledSection, fleshSection } from "./flesh";

export type BuildCallbacks = {
  onStatus: (label: string) => void;
};

export async function generatePlan(
  brief: string,
  settings: LLMSettings
): Promise<{ plan: SitePlan | null; error?: string }> {
  const res = await callJSON<SitePlan>(settings, PLAN_SYSTEM, planUser(brief));
  if (res.error) return { plan: null, error: res.error };
  if (!res.data || !Array.isArray(res.data.pages) || res.data.pages.length === 0) {
    return { plan: null, error: "The model returned an empty plan. Try rephrasing your brief." };
  }
  return { plan: res.data };
}

export async function generateDesign(
  brief: string,
  plan: SitePlan | null,
  settings: LLMSettings,
  current?: DesignSystem
): Promise<{ design: DesignSystem | null; error?: string }> {
  const system = DESIGN_SYSTEM_SYSTEM;
  const user = current
    ? refineDesignUser(brief, current)
    : designUser(brief, plan ?? { meta: { title: "", description: "", lang: "en" }, nav: { links: [], cta: null }, pages: [], tone: "" });
  const res = await callJSON<DesignSystem>(settings, system, user);
  if (res.error) return { design: null, error: res.error };
  if (!res.data?.tokens?.colors?.background) {
    return { design: null, error: "Model returned an incomplete design system. Try again." };
  }
  return { design: res.data };
}

export async function generatePageContent(
  brief: string,
  plan: SitePlan,
  page: SitePlan["pages"][number],
  design: DesignSystem,
  settings: LLMSettings,
  onStatus: (label: string) => void
): Promise<Page | null> {
  onStatus(`Writing "${page.title}"…`);
  const res = await callJSON<Partial<Page> & { sections?: { type: SectionType; content?: SectionContent[SectionType] }[] }>(
    settings,
    contentSystem(brief, plan.tone),
    contentPageUser(brief, plan, page, design)
  );
  if (res.error) return null;
  const raw = res.data;

  const modelSecs = (raw?.sections ?? [])
    .filter((s) => s && s.type)
    .map((s) => ({ id: uid(), type: s.type, content: (s.content ?? {}) as SectionContent[SectionType] }));
  const byType = new Map<string, Section>();
  for (const s of modelSecs) if (!byType.has(s.type)) byType.set(s.type, s);

  const sections: Section[] = [];
  for (const ps of page.sections) {
    const matched = byType.get(ps.type);
    const content = matched ? matched.content : ({} as SectionContent[SectionType]);
    sections.push({ id: uid(), type: ps.type, content: fleshSection(ps.type, content) });
  }
  for (const m of modelSecs) {
    if (!page.sections.some((pp) => pp.type === m.type)) sections.push(m);
  }
  const hasFooter = sections.some((s) => s.type === "footer");
  if (!hasFooter) {
    sections.push({
      id: uid(),
      type: "footer",
      content: fleshSection("footer", {
        columns: [],
        socials: [],
        copyright: `© ${new Date().getFullYear()} ${raw?.title ?? plan.meta.title}`,
        note: "",
      }),
    });
  }
  return {
    id: uid("pg"),
    slug: raw?.slug ?? page.slug,
    title: raw?.title ?? page.title,
    description: raw?.description ?? page.description,
    sections,
  };
}

function fallbackPage(p: SitePlan["pages"][number]): Page {
  const sections = p.sections.map((ps) => filledSection(ps.type));
  if (!sections.some((s) => s.type === "footer")) {
    sections.push({ id: uid(), type: "footer", content: fleshSection("footer", { columns: [], socials: [], copyright: `© ${new Date().getFullYear()} ${p.title}`, note: "" }) });
  }
  return {
    id: uid("pg"),
    slug: p.slug,
    title: p.title,
    description: p.description,
    sections,
  };
}

export async function buildFromBrief(
  brief: string,
  settings: LLMSettings,
  cb: BuildCallbacks
): Promise<{ doc: SiteBlueprint | null; plan: SitePlan | null; error?: string }> {
  cb.onStatus("Planning the site structure…");
  const { plan, error: planErr } = await generatePlan(brief, settings);
  if (planErr || !plan) return { doc: null, plan: null, error: planErr ?? "Planning failed." };

  cb.onStatus("Inventing the design system…");
  const { design, error: designErr } = await generateDesign(brief, plan, settings);
  if (designErr || !design) return { doc: null, plan, error: designErr ?? "Design generation failed." };

  const doc: SiteBlueprint = {
    version: 1,
    meta: plan.meta,
    nav: plan.nav,
    design,
    pages: [],
  };

  for (const p of plan.pages) {
    const page = (await generatePageContent(brief, plan, p, design, settings, cb.onStatus)) ?? fallbackPage(p);
    doc.pages.push(page);
  }
  return { doc, plan };
}

export async function applyEdit(
  doc: SiteBlueprint,
  instruction: string,
  settings: LLMSettings,
  cb: BuildCallbacks
): Promise<{ doc: SiteBlueprint | null; summary?: string; error?: string }> {
  cb.onStatus("Applying your edit…");
  const res = await callJSON<SiteBlueprint & { __summary?: string }>(
    settings,
    editSystem(),
    editUser(doc, instruction)
  );
  if (res.error) return { doc: null, error: res.error };
  const d = res.data;
  if (!d || !d.meta || !d.design || !Array.isArray(d.pages)) {
    return { doc: null, error: "The model returned an invalid site document. Nothing was changed." };
  }
  const cleaned: SiteBlueprint = {
    version: (doc.version ?? 1) + 1,
    meta: d.meta,
    nav: d.nav ?? doc.nav,
    design: d.design,
    pages: d.pages.map((p) => ({
      id: p.id ?? uid("pg"),
      slug: p.slug ?? "",
      title: p.title ?? "",
      description: p.description ?? "",
      sections: Array.isArray(p.sections)
        ? p.sections.map((s) => ({
            id: s.id ?? uid(),
            type: s.type as SectionType,
            content: (s.content ?? {}) as SectionContent[SectionType],
          }))
        : [],
    })),
  };
  return { doc: cleaned, summary: d.__summary };
}

export async function regenerateSection(
  doc: SiteBlueprint,
  brief: string,
  plan: SitePlan | null,
  pageIndex: number,
  sectionIndex: number,
  settings: LLMSettings,
  cb: BuildCallbacks
): Promise<{ doc: SiteBlueprint | null; error?: string }> {
  const page = doc.pages[pageIndex];
  const sec = page?.sections[sectionIndex];
  if (!page || !sec) return { doc: null, error: "Section not found." };
  if (!plan) return { doc: null, error: "No plan available to regenerate from." };
  cb.onStatus("Rewriting section copy…");
  const res = await callJSON<Record<string, unknown>>(
    settings,
    contentSystem(brief, plan.tone),
    sectionIdeaUser(brief, plan, pageIndex, sectionIndex)
  );
  if (res.error) return { doc: null, error: res.error };
  if (!res.data) return { doc: null, error: "Model returned empty content." };
  const next = JSON.parse(JSON.stringify(doc)) as SiteBlueprint;
  next.pages[pageIndex].sections[sectionIndex].content = res.data as SectionContent[SectionType];
  return { doc: next };
}

export async function selfReview(
  doc: SiteBlueprint,
  settings: LLMSettings,
  cb: BuildCallbacks
): Promise<{ doc: SiteBlueprint | null; issues: string[]; error?: string }> {
  cb.onStatus("Running the QA pass…");
  const res = await callJSON<SiteBlueprint & { __issues?: string[] }>(
    settings,
    SELF_REVIEW_SYSTEM,
    `SITE JSON:\n${JSON.stringify(doc)}`
  );
  if (res.error) return { doc: null, issues: [], error: res.error };
  const d = res.data;
  if (!d || !d.meta || !d.design || !Array.isArray(d.pages)) {
    return { doc: null, issues: [], error: "Model returned an invalid site document during review." };
  }
  return { doc: d, issues: d.__issues ?? [] };
}

export async function toneRewrite(
  doc: SiteBlueprint,
  tone: string,
  length: string,
  settings: LLMSettings,
  cb: BuildCallbacks
): Promise<{ doc: SiteBlueprint | null; summary?: string; error?: string }> {
  cb.onStatus("Rewriting the voice of the site…");
  const res = await callJSON<SiteBlueprint & { __summary?: string }>(
    settings,
    TONE_SYSTEM,
    toneUser(doc, tone, length)
  );
  if (res.error) return { doc: null, error: res.error };
  const d = res.data;
  if (!d || !d.meta || !d.design || !Array.isArray(d.pages)) {
    return { doc: null, error: "Model returned an invalid site document during tone rewrite." };
  }
  return { doc: d, summary: d.__summary ?? "Voice updated." };
}

export async function fieldRewrite(
  doc: SiteBlueprint,
  sectionType: SectionType,
  fieldPath: string,
  currentValue: string,
  context: string,
  settings: LLMSettings
): Promise<{ value: string | null; error?: string }> {
  const res = await callJSON<{ value?: string }>(
    settings,
    FIELD_REWRITE_SYSTEM,
    fieldRewriteUser(sectionType, fieldPath, currentValue, doc.voice ?? "your site's voice", context)
  );
  if (res.error) return { value: null, error: res.error };
  if (typeof res.data?.value !== "string") return { value: null, error: "Model returned an invalid value." };
  return { value: res.data.value };
}

export async function discuss(
  doc: SiteBlueprint,
  question: string,
  settings: LLMSettings,
  cb: BuildCallbacks
): Promise<{ answer?: string; error?: string }> {
  cb.onStatus("Thinking about your site…");
  const res = await callLLM(settings, DISCUSS_SYSTEM, discussUser(doc, question), 1500);
  if (res.error) return { error: res.error };
  if (!res.text.trim()) return { error: "Empty response. Try rephrasing." };
  return { answer: res.text };
}

export type VariantKind = "design" | "hero";

export async function generateVariant(
  doc: SiteBlueprint,
  kind: VariantKind,
  settings: LLMSettings,
  cb: BuildCallbacks
): Promise<{ doc: SiteBlueprint | null; label: string; error?: string }> {
  if (kind === "design") {
    cb.onStatus("Inventing an alternate design…");
    const res = await generateDesign("", null, settings, doc.design);
    if (res.error || !res.design) return { doc: null, label: "", error: res.error ?? "Design variant failed." };
    const next = { ...doc, design: res.design };
    return { doc: next, label: `Design: ${res.design.name}` };
  }
  cb.onStatus("Rewriting the hero…");
  const res = await callJSON<Record<string, unknown>>(
    settings,
    contentSystem(doc.meta.title, doc.voice ?? "direct, specific"),
    `Rewrite the hero section of this page:\n${JSON.stringify(doc.pages[0]?.sections.find((s) => s.type === "hero")?.content ?? {})}\n\nReturn ONLY the hero content JSON object. Make it clearly different in angle and phrasing, still on-brand.`
  );
  if (res.error || !res.data) return { doc: null, label: "", error: res.error ?? "Hero variant failed." };
  const next = JSON.parse(JSON.stringify(doc)) as SiteBlueprint;
  const page = next.pages[0];
  const heroIdx = page?.sections.findIndex((s) => s.type === "hero") ?? -1;
  if (page && heroIdx >= 0) page.sections[heroIdx].content = res.data as SectionContent[SectionType];
  return { doc: next, label: "Alternate hero copy" };
}

export function collectSiteStrings(doc: SiteBlueprint, max = 300): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const push = (v: unknown): void => {
    if (typeof v === "string" && v.trim().length > 1) {
      if (!seen.has(v)) {
        seen.add(v);
        out.push(v);
      }
    } else if (Array.isArray(v)) {
      for (const it of v) push(it);
    } else if (v && typeof v === "object") {
      for (const k of Object.keys(v as Record<string, unknown>)) {
        if (k === "href" || k === "url" || k === "embedUrl" || k === "icon" || k === "id" || k === "slug" || k === "photo" || k === "image") continue;
        push((v as Record<string, unknown>)[k]);
      }
    }
  };
  push(doc.meta.title);
  push(doc.meta.description);
  for (const l of doc.nav.links) push(l.label);
  if (doc.nav.cta) push(doc.nav.cta.label);
  for (const pg of doc.pages) {
    push(pg.title);
    push(pg.description);
    for (const sec of pg.sections) push(sec.content);
  }
  for (const post of doc.posts ?? []) {
    push(post.title);
    push(post.excerpt);
    push(post.content);
    push(post.category);
  }
  return out.slice(0, max);
}

export async function translateSite(
  doc: SiteBlueprint,
  lang: string,
  settings: LLMSettings,
  cb: BuildCallbacks
): Promise<{ translations: Record<string, string> | null; error?: string }> {
  const strings = collectSiteStrings(doc);
  if (strings.length === 0) return { translations: {}, error: undefined };
  cb.onStatus(`Translating ${strings.length} strings to ${lang}…`);
  const res = await callJSON<Record<string, string>>(settings, TRANSLATE_SYSTEM, translateUser(lang, strings));
  if (res.error) return { translations: null, error: res.error };
  if (!res.data) return { translations: null, error: "Translation returned no data." };
  const map: Record<string, string> = {};
  for (const key of Object.keys(res.data)) {
    const val = res.data[key];
    if (typeof val === "string" && val.trim() && key !== val) map[key] = val;
  }
  return { translations: map };
}

const BLOG_POSTS_SYSTEM = `You write real, publishable blog posts for a business website.
Return STRICT JSON: { "posts": [ { "title", "excerpt", "content", "category", "slug" } ] }.
Rules:
- 3 posts, each 180-320 words, in the site's voice.
- content is plain HTML paragraphs (no headings inside <p>; you may use <h2>).
- Topics must be genuinely relevant to the business described.
- excerpt: 1-2 sentences. slug: url-safe lowercase kebab-case. category: one short word.`;

export async function generateBlogPosts(
  doc: SiteBlueprint,
  settings: LLMSettings,
  cb: BuildCallbacks
): Promise<{ posts: Post[]; error?: string }> {
  const brief = doc.meta.description || doc.meta.title || "a small business website";
  const voice = doc.voice ?? "your site's voice";
  cb.onStatus("Writing three blog posts…");
  const res = await callJSON<{ posts?: { title?: string; excerpt?: string; content?: string; category?: string; slug?: string }[] }>(
    settings,
    BLOG_POSTS_SYSTEM,
    `Site: ${doc.meta.title}\nAbout: ${brief}\nVoice: ${voice}\n\nWrite 3 blog posts that would be genuinely useful to the site's audience.`
  );
  if (res.error) return { posts: [], error: res.error };
  const raw = res.data?.posts ?? [];
  const posts: Post[] = raw
    .filter((p) => p?.title && p?.content)
    .map((p) => ({
      id: uid("post"),
      slug: (p.slug || p.title!.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")).slice(0, 60),
      title: p.title!,
      excerpt: p.excerpt ?? "",
      content: p.content!,
      date: new Date().toISOString(),
      category: p.category || "News",
    }));
  if (posts.length === 0) return { posts: [], error: "The model didn't return any usable posts. Try again." };
  return { posts };
}
