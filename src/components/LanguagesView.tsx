import { useState } from "react";
import type { SiteBlueprint } from "../lib/types";

type Props = {
  doc: SiteBlueprint;
  onChange: (doc: SiteBlueprint) => void;
  onTranslateAll: (lang: string) => Promise<{ ok: boolean; error?: string }>;
  busy?: boolean;
};

const LANGS = [
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

export default function LanguagesView(p: Props) {
  const langs = p.doc.languages?.supported ?? [];
  const [pickLang, setPickLang] = useState("fr");
  const [busyLang, setBusyLang] = useState<string | null>(null);

  const setLanguages = (supported: string[], translations?: Record<string, Record<string, string>>) => {
    p.onChange({
      ...p.doc,
      languages: {
        default: p.doc.languages?.default ?? p.doc.meta.lang ?? "en",
        supported,
        translations: translations ?? p.doc.languages?.translations ?? {},
      },
    });
  };

  const addLang = () => {
    if (langs.includes(pickLang)) return;
    setLanguages([...langs, pickLang]);
  };

  const removeLang = (code: string) => {
    const next = langs.filter((l) => l !== code);
    const translations = { ...(p.doc.languages?.translations ?? {}) };
    delete translations[code];
    setLanguages(next, translations);
  };

  const translate = async (code: string) => {
    setBusyLang(code);
    try {
      const res = await p.onTranslateAll(code);
      if (!res.ok) {
        // surface error via chat; keep busy cleared
      }
    } finally {
      setBusyLang(null);
    }
  };

  const count = langs.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="panel-label">Languages</div>
      <div className="settings-note">
        Add languages, then "AI-translate" to convert every string field. Visitors pick the language from a
        switcher in the site nav (shown when 2+ languages exist).
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <select value={pickLang} onChange={(e) => setPickLang(e.target.value)}>
          {LANGS.filter((l) => !langs.includes(l.code)).map((l) => (
            <option key={l.code} value={l.code}>
              {l.label} ({l.code})
            </option>
          ))}
          {LANGS.filter((l) => langs.includes(l.code)).length === LANGS.length ? null : null}
        </select>
        <button className="btn btn-sm" onClick={addLang} disabled={langs.length >= 5}>
          + Add
        </button>
      </div>

      {count === 0 ? (
        <div className="settings-note">No additional languages yet. Pick one above and press "+ Add".</div>
      ) : (
        langs.map((code) => {
          const label = LANGS.find((l) => l.code === code)?.label ?? code;
          const has = Boolean(p.doc.languages?.translations?.[code] && Object.keys(p.doc.languages!.translations![code]).length);
          return (
            <div key={code} className="inspector-section" style={{ padding: 10 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <b>{label}</b>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn btn-sm" onClick={() => void translate(code)} disabled={p.busy || busyLang === code}>
                    {busyLang === code ? "…" : has ? "Re-translate" : "AI-translate"}
                  </button>
                  <button className="btn btn-sm btn-ghost" onClick={() => removeLang(code)}>
                    ×
                  </button>
                </div>
              </div>
              <div style={{ fontSize: 11, color: "var(--chrome-faint)", marginTop: 4 }}>
                {has ? `${Object.keys(p.doc.languages!.translations![code]).length} strings translated` : "Not translated yet"}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
