import { useMemo, useState } from "react";
import { GENERATED_THEMES, THEME_CATEGORIES, type GeneratedTheme } from "../lib/themeEngine";

type Props = {
  tier?: "pro" | "plus";
  onApply: (theme: GeneratedTheme) => void;
  onUpgrade: () => void;
  onClose: () => void;
};

export default function ThemeGallery(p: Props) {
  const [cat, setCat] = useState<string>("All");
  const [mode, setMode] = useState<"all" | "light" | "dark">("all");
  const isPlus = p.tier === "plus";

  const themes = useMemo(() => {
    return GENERATED_THEMES.filter((t) => {
      if (cat !== "All" && t.category !== cat) return false;
      if (mode !== "all" && t.mode !== mode) return false;
      return true;
    });
  }, [cat, mode]);

  const preview = (t: GeneratedTheme) => {
    const box = { width: 26, height: 26, borderRadius: 8, border: "1px solid rgba(0,0,0,.12)" } as const;
    return t.palette.map((c, i) => <span key={i} style={{ ...box, background: c, display: "inline-block", margin: "0 2px" }} />);
  };

  return (
    <div className="modal-overlay" onClick={p.onClose}>
      <div className="modal theme-modal" onClick={(e) => e.stopPropagation()}>
        <div className="inspector-head">
          <h2 style={{ margin: 0, fontSize: 18 }}>Theme generator</h2>
          <button className="btn btn-sm btn-ghost" onClick={p.onClose}>Close</button>
        </div>

        {!isPlus && (
          <div className="theme-plus-banner">
            <b>100+ themes — Plus only</b>
            <p>Upgrade to Plus to apply any of {GENERATED_THEMES.length} generated design systems with one click.</p>
            <button className="btn btn-primary" onClick={p.onUpgrade}>Upgrade to Plus — $49.99/mo</button>
          </div>
        )}

        <div className="theme-filters">
          <div className="theme-cats">
            {["All", ...THEME_CATEGORIES].map((c) => (
              <button key={c} className={`starter-cat${cat === c ? " active" : ""}`} onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>
          <div className="theme-modes">
            {(["all", "light", "dark"] as const).map((m) => (
              <button key={m} className={`starter-cat${mode === m ? " active" : ""}`} onClick={() => setMode(m)}>{m}</button>
            ))}
          </div>
        </div>

        <div className="theme-grid">
          {themes.map((t) => (
            <button
              key={t.id}
              className="theme-card"
              onClick={() => (isPlus ? p.onApply(t) : p.onUpgrade())}
              title={isPlus ? `Apply ${t.name}` : "Plus required"}
            >
              <div className={`theme-preview theme-preview-${t.mode}`}>{preview(t)}</div>
              <div className="theme-card-body">
                <b>{t.name}</b>
                <span>{t.category} · {t.mode}</span>
                <span className="theme-fonts">{t.headingFont} / {t.bodyFont}</span>
              </div>
              {!isPlus && <span className="theme-lock">🔒</span>}
            </button>
          ))}
          {themes.length === 0 && <div className="settings-note">No themes in this category.</div>}
        </div>
      </div>
    </div>
  );
}
