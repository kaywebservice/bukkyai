import type { SiteBlueprint } from "../lib/types";
import { PRESETS, BRAND_TAGS } from "../lib/designPresets";

type Props = {
  doc: SiteBlueprint;
  onSetVoice: (v: string) => void;
  onApplyPreset: (name: string) => void;
  onUploadBrand: (f: File) => void;
  onSetTone: (t: "default" | "bold" | "minimal") => void;
};

export default function DesignPanel(p: Props) {
  return (
    <div>
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
