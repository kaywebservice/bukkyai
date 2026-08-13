import { useMemo } from "react";
import type { SiteBlueprint } from "../lib/types";
import { PRESETS, BRAND_TAGS } from "../lib/designPresets";
import { scoreDesign, type HarmonyScore } from "../lib/harmony";

type Props = {
  doc: SiteBlueprint;
  onSetVoice: (v: string) => void;
  onApplyPreset: (name: string) => void;
  onUploadBrand: (f: File) => void;
  onSetTone: (t: "default" | "bold" | "minimal") => void;
  onHarmonize: () => void;
  onOpenThemes: () => void;
};

function scoreTone(total: number): string {
  return total >= 80 ? "green" : total >= 60 ? "amber" : "red";
}

function ScoreGauge({ score, onHarmonize }: { score: HarmonyScore; onHarmonize: () => void }) {
  const tone = scoreTone(score.total);
  return (
    <div className="harmony-card">
      <div className="harmony-head">
        <span className="harmony-title">Design harmony</span>
        <span className={`harmony-score harmony-score-${tone}`}>{score.total}</span>
      </div>
      <div className="harmony-axis">
        <span>Colors</span>
        <div className="harmony-bar">
          <div className={`harmony-fill harmony-fill-${scoreTone(score.axes.colors)}`} style={{ width: `${score.axes.colors}%` }} />
        </div>
        <b>{score.axes.colors}</b>
      </div>
      <div className="harmony-axis">
        <span>Fonts</span>
        <div className="harmony-bar">
          <div className={`harmony-fill harmony-fill-${scoreTone(score.axes.fonts)}`} style={{ width: `${score.axes.fonts}%` }} />
        </div>
        <b>{score.axes.fonts}</b>
      </div>
      <div className="harmony-axis">
        <span>Layout</span>
        <div className="harmony-bar">
          <div className={`harmony-fill harmony-fill-${scoreTone(score.axes.layout)}`} style={{ width: `${score.axes.layout}%` }} />
        </div>
        <b>{score.axes.layout}</b>
      </div>
      <ul className="harmony-notes">
        {score.notes.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
      <button className="btn" style={{ width: "100%", marginTop: 6 }} onClick={onHarmonize}>
        Harmonize design
      </button>
    </div>
  );
}

export default function DesignPanel(p: Props) {
  const score = useMemo(() => scoreDesign(p.doc.design), [p.doc.design]);
  return (
    <div>
      <button className="btn btn-primary" style={{ width: "100%", marginBottom: 12 }} onClick={p.onOpenThemes}>
        ✦ Theme generator — 100+ themes
      </button>
      <ScoreGauge score={score} onHarmonize={p.onHarmonize} />
      <div className="panel-label">Voice & tone</div>
      <textarea
        className="chat-input"
        style={{ width: "100%", height: 60, fontSize: 13 }}
        placeholder="e.g. 'A witty fintech brand that sounds like a friend texting'"
        value={p.doc.voice ?? ""}
        onChange={(e) => p.onSetVoice(e.target.value)}
      />
      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
        <button className="btn btn-sm" onClick={() => p.onSetTone("minimal")}>Minimal</button>
        <button className="btn btn-sm" onClick={() => p.onSetTone("bold")}>Bold</button>
        <button className="btn btn-sm btn-ghost" onClick={() => p.onSetTone("default")}>Default</button>
      </div>

      <div className="panel-label">Presets</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {PRESETS.map((pr) => (
          <button key={pr.name} className="btn" style={{ justifyContent: "flex-start" }} onClick={() => p.onApplyPreset(pr.name)}>
            <span style={{ fontWeight: 600, minWidth: 90 }}>{pr.name}</span>
            <span style={{ fontSize: 12, color: "var(--chrome-faint)" }}>{pr.desc}</span>
          </button>
        ))}
      </div>

      <div className="panel-label">Upload brand kit</div>
      <label className="btn btn-ghost" style={{ width: "100%", justifyContent: "center" }}>
        Upload logo + colors (.zip or .json)
        <input type="file" accept=".zip,.json,application/json" hidden onChange={(e) => {
          const f = e.target.files?.[0]; e.target.value = ""; if (f) p.onUploadBrand(f);
        }} />
      </label>
      <div className="settings-note">
        {BRAND_TAGS}
      </div>
    </div>
  );
}
