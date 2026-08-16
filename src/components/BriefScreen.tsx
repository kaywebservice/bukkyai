import { useMemo, useState } from "react";
import {
  BRIEF_DOMAINS,
  BRIEF_FEATURES,
  BRIEF_GOALS,
  BRIEF_IMAGE_STYLES,
  BRIEF_LANGUAGES,
  BRIEF_PAGES,
  BRIEF_TONES,
  EXAMPLE_PROMPTS,
  compileBrief,
  loadSavedBrief,
  saveBrief,
  randomSurpriseTheme,
  type BriefState,
  type ThemeChoice,
  type FeatureGroup,
} from "../lib/brief";
import { DESIGN_PRESETS } from "../lib/presets";
import { GENERATED_THEMES, THEME_CATEGORIES } from "../lib/themeEngine";

type Props = {
  busy: boolean;
  tier?: "pro" | "plus";
  onBuild: (brief: string) => void;
  onDemo: () => void;
  onBrowseTemplates: () => void;
  onUpgrade: () => void;
};

const FEATURE_GROUPS: FeatureGroup[] = ["Sell & grow", "Content & trust", "Connect"];

function Chip({
  active,
  onClick,
  children,
  title,
  className = "",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
}) {
  return (
    <button type="button" title={title} className={`brief-chip${active ? " on" : ""} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}

function GroupCard({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="brief-card">
      <div className="brief-card-head">
        <b>{title}</b>
        {hint && <span>{hint}</span>}
      </div>
      {children}
    </section>
  );
}

export default function BriefScreen({ busy, tier, onBuild, onDemo, onBrowseTemplates, onUpgrade }: Props) {
  const [state, setState] = useState<BriefState>(() => loadSavedBrief() ?? {
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
  });
  const [cat, setCat] = useState<string>("All");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const hasSaved = useMemo(() => loadSavedBrief() !== null, []);

  const set = <K extends keyof BriefState>(key: K, value: BriefState[K]) => setState((prev) => ({ ...prev, [key]: value }));

  const toggle = (key: "features" | "pages", id: string) => {
    setState((prev) => {
      const cur = prev[key];
      return { ...prev, [key]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] };
    });
  };

  const featureLabel = (id: string) => BRIEF_FEATURES.find((f) => f.id === id);
  const canUseGenerated = tier === "plus";

  const pickTheme = (choice: ThemeChoice) => {
    if (choice && choice.kind === "generated" && !canUseGenerated) {
      onUpgrade();
      return;
    }
    set("theme", choice);
  };

  const themeStrip = useMemo(() => {
    const generated = GENERATED_THEMES.filter((t) => cat === "All" || t.category === cat);
    return generated.slice(0, 12);
  }, [cat]);

  const submit = () => {
    const brief = compileBrief(state);
    if (!brief.trim()) return;
    saveBrief(state);
    onBuild(brief);
  };

  const restoreSaved = () => {
    const saved = loadSavedBrief();
    if (saved) setState(saved);
  };

  const ready = state.description.trim().length > 2 && !busy;

  return (
    <div className="brief-studio">
      <div className="brief-hero">
        <span className="brief-kicker">AI WEBSITE BUILDER</span>
        <h2>Describe your website</h2>
        <p>A sentence is enough — we plan it, design it, and write every page. Fine-tune below whenever you want.</p>
      </div>

      <textarea
        className="brief-input-lg"
        placeholder="e.g. A bakery in Austin called June & Oak. Warm, artisanal feel. Menu, story, online ordering."
        value={state.description}
        onChange={(e) => set("description", e.target.value)}
      />
      <div className="brief-examples">
        {EXAMPLE_PROMPTS.map((p) => (
          <button key={p} type="button" className="brief-example" onClick={() => set("description", p)}>
            {p.length > 58 ? `${p.slice(0, 58)}…` : p}
          </button>
        ))}
      </div>

      <div className="brief-cta">
        <button className="btn brief-build" disabled={!ready} onClick={submit}>
          {busy ? "Planning…" : "Design my website →"}
        </button>
        <button className="btn btn-ghost-link" onClick={onBrowseTemplates}>
          or start from a template
        </button>
        {hasSaved && (
          <button className="btn btn-ghost-link" onClick={restoreSaved} title="Reuse your last brief and build another version">
            ↺ Reuse last brief
          </button>
        )}
      </div>

      <div className="brief-more">
        <button className="brief-more-toggle" onClick={() => setDetailsOpen((v) => !v)} aria-expanded={detailsOpen}>
          <span>Add more detail — features, theme, pages & more</span>
          <span className={`brief-more-chevron${detailsOpen ? " open" : ""}`} aria-hidden="true">▾</span>
        </button>
      </div>

      {detailsOpen && (
        <div className="brief-details">
          <div className="brief-grid">
            <GroupCard title="Features you need" hint="Pick any — or none, we'll decide">
              <div className="brief-groups">
                {FEATURE_GROUPS.map((g) => (
                  <div key={g} className="brief-feature-group">
                    <div className="brief-feature-group-label">{g}</div>
                    <div className="brief-features">
                      {BRIEF_FEATURES.filter((f) => f.group === g).map((f) => {
                        const on = state.features.includes(f.id);
                        const chosen = on ? featureLabel(f.id) : undefined;
                        return (
                          <label key={f.id} className={`brief-check${on ? " on" : ""}`} title={f.hint}>
                            <input
                              type="checkbox"
                              checked={on}
                              onChange={() => toggle("features", f.id)}
                              aria-label={f.label}
                            />
                            <span className="brief-check-box" aria-hidden="true" />
                            <span className="brief-check-label">{f.label}</span>
                            <span className="brief-check-hint">{chosen ? f.hint : f.hint}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </GroupCard>

            <div className="brief-stack">
              <GroupCard title="Vibe & theme" hint="How should it feel?">
                <div className="brief-theme-cats">
                  {["All", ...THEME_CATEGORIES].map((c) => (
                    <Chip key={c} active={cat === c} onClick={() => setCat(c)}>
                      {c}
                    </Chip>
                  ))}
                </div>
                <div className="brief-theme-rows">
                  <div className="brief-theme-row">
                    <div className="brief-theme-row-label">Signature presets <span>· free</span></div>
                    <div className="brief-theme-strip">
                      {DESIGN_PRESETS.slice(0, 8).map((p) => {
                        const on = state.theme?.kind === "preset" && state.theme.name === p.name;
                        return (
                          <button
                            key={p.name}
                            type="button"
                            className={`brief-theme${on ? " on" : ""}`}
                            onClick={() => pickTheme({ kind: "preset", name: p.name, palette: [p.system.tokens.colors.background, p.system.tokens.colors.primary, p.system.tokens.colors.accent], label: p.name })}
                            title={`${p.name} — ${p.vibe}`}
                          >
                            <span className="brief-theme-swatches">
                              {[p.system.tokens.colors.background, p.system.tokens.colors.surface, p.system.tokens.colors.primary, p.system.tokens.colors.accent].map((c, i) => (
                                <span key={i} style={{ background: c }} />
                              ))}
                            </span>
                            <span className="brief-theme-name">{p.name}</span>
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        className={`brief-theme${state.theme?.kind === "surprise" ? " on" : ""}`}
                        onClick={() => pickTheme(randomSurpriseTheme())}
                        title="Pick a bold direction for me"
                      >
                        <span className="brief-theme-swatches brief-theme-surprise">
                          <span style={{ background: "#b3541e" }} />
                          <span style={{ background: "#9d8fff" }} />
                          <span style={{ background: "#1d1b16" }} />
                          <span style={{ background: "#c7a24a" }} />
                        </span>
                        <span className="brief-theme-name">Surprise me</span>
                      </button>
                    </div>
                  </div>
                  <div className="brief-theme-row">
                    <div className="brief-theme-row-label">
                      Generated themes <span>{canUseGenerated ? `· ${GENERATED_THEMES.length} available` : "· Plus only"}</span>
                    </div>
                    <div className="brief-theme-strip">
                      {themeStrip.map((t) => {
                        const on = state.theme?.kind === "generated" && state.theme.name === t.name;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            className={`brief-theme${on ? " on" : ""}`}
                            onClick={() => pickTheme({ kind: "generated", name: t.name, category: t.category, palette: t.palette, label: t.name })}
                            title={canUseGenerated ? `${t.name} — ${t.description}` : "Plus themes — upgrade to unlock"}
                          >
                            <span className="brief-theme-swatches">
                              {t.palette.slice(0, 4).map((c, i) => (
                                <span key={i} style={{ background: c }} />
                              ))}
                            </span>
                            <span className="brief-theme-name">
                              {t.name}
                              {!canUseGenerated && <span className="brief-theme-lock">🔒</span>}
                            </span>
                          </button>
                        );
                      })}
                      {themeStrip.length === 0 && <span className="brief-theme-empty">No themes in this category.</span>}
                    </div>
                  </div>
                </div>
              </GroupCard>

              <GroupCard title="Pages" hint="Or keep it to one strong page">
                <div className="brief-toggle">
                  <Chip active={state.onePager} onClick={() => set("onePager", true)}>One-pager</Chip>
                  <Chip active={!state.onePager} onClick={() => set("onePager", false)}>Full site</Chip>
                </div>
                <div className="brief-chips">
                  {BRIEF_PAGES.map((p) => {
                    const on = state.pages.includes(p.id);
                    return (
                      <Chip key={p.id} active={on} onClick={() => toggle("pages", p.id)} className="brief-chip-pad">
                        <span className={`brief-check-box${on ? " on-box" : ""}`} aria-hidden="true" />
                        {p.label}
                      </Chip>
                    );
                  })}
                </div>
              </GroupCard>

              <GroupCard title="Business basics" hint="Optional, but makes the copy feel real">
                <div className="brief-fields">
                  <input
                    type="text"
                    placeholder="Business name"
                    value={state.businessName}
                    onChange={(e) => set("businessName", e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Tagline (optional)"
                    value={state.tagline}
                    onChange={(e) => set("tagline", e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="City / service area"
                    value={state.city}
                    onChange={(e) => set("city", e.target.value)}
                  />
                </div>
              </GroupCard>

              <GroupCard title="What should visitors do first?" hint="We'll aim every headline at this">
                <div className="brief-chips">
                  {BRIEF_GOALS.map((g) => (
                    <Chip key={g.id} active={state.goal === g.id} onClick={() => set("goal", g.id)}>
                      {g.label}
                    </Chip>
                  ))}
                </div>
              </GroupCard>

              <GroupCard title="Voice" hint="How the site should talk">
                <div className="brief-chips">
                  {BRIEF_TONES.map((t) => (
                    <Chip key={t.id} active={state.tone === t.id} onClick={() => set("tone", t.id)} title={t.note}>
                      {t.label}
                    </Chip>
                  ))}
                </div>
              </GroupCard>
            </div>
          </div>

          <div className="brief-grid">
            <GroupCard title="Extra touches" hint="Nice-to-haves">
              <div className="brief-extra">
                <div className="brief-extra-row">
                  <span className="brief-extra-label">Images</span>
                  <div className="brief-chips">
                    {BRIEF_IMAGE_STYLES.map((s) => (
                      <Chip key={s.id} active={state.imageStyle === s.id} onClick={() => set("imageStyle", s.id)}>
                        {s.label}
                      </Chip>
                    ))}
                  </div>
                </div>
                <div className="brief-extra-row">
                  <span className="brief-extra-label">Multilingual</span>
                  <div className="brief-chips brief-chips-inline">
                    <Chip active={state.multilingual} onClick={() => set("multilingual", !state.multilingual)}>
                      {state.multilingual ? "Add a second language" : "English only"}
                    </Chip>
                    {state.multilingual && (
                      <select
                        className="brief-select"
                        value={state.language}
                        onChange={(e) => set("language", e.target.value)}
                        aria-label="Second language"
                      >
                        {BRIEF_LANGUAGES.filter((l) => l.code !== "en").map((l) => (
                          <option key={l.code} value={l.code}>{l.label}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
                <div className="brief-extra-row">
                  <span className="brief-extra-label">Contact details</span>
                  <div className="brief-fields brief-fields-3">
                    <input type="tel" placeholder="Phone" value={state.phone} onChange={(e) => set("phone", e.target.value)} />
                    <input type="email" placeholder="Email" value={state.email} onChange={(e) => set("email", e.target.value)} />
                    <input type="text" placeholder="Address" value={state.address} onChange={(e) => set("address", e.target.value)} />
                  </div>
                </div>
                <div className="brief-extra-row">
                  <span className="brief-extra-label">Reference site</span>
                  <input
                    type="url"
                    placeholder="A site you like (optional)"
                    value={state.reference}
                    onChange={(e) => set("reference", e.target.value)}
                  />
                </div>
                <div className="brief-extra-row">
                  <span className="brief-extra-label">Web address ending</span>
                  <div className="brief-chips brief-chips-inline">
                    <select
                      className="brief-select"
                      value={state.domain}
                      onChange={(e) => set("domain", e.target.value)}
                      aria-label="Domain extension"
                    >
                      {BRIEF_DOMAINS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <span className="brief-note">We'll suggest a matching web address for your site.</span>
                  </div>
                </div>
              </div>
            </GroupCard>
          </div>

          <div className="brief-actions">
            <button className="btn btn-primary brief-build" disabled={!ready} onClick={submit}>
              {busy ? "Planning…" : "Design my website"}
            </button>
            <button className="btn" onClick={onDemo}>Explore the demo</button>
            <span className="brief-hint-text">
              We'll show you a plan to approve before anything is built.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}