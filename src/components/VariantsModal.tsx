import { useState } from "react";
import type { DesignSystem } from "../lib/types";
import { GENERATED_THEMES } from "../lib/themeEngine";

type Props = {
  current: DesignSystem;
  tier?: "pro" | "plus";
  onApply: (design: DesignSystem) => void;
  onUpgrade: () => void;
  onClose: () => void;
};

export default function VariantsModal(p: Props) {
  const isPlus = p.tier === "plus";
  const [seed, setSeed] = useState(0);

  // 3 variants: current + 2 shuffled generated themes (deterministic-ish).
  const variants = [p.current, GENERATED_THEMES[(seed * 7 + 3) % GENERATED_THEMES.length].system, GENERATED_THEMES[(seed * 13 + 11) % GENERATED_THEMES.length].system];

  const swatchRow = (d: DesignSystem) => (
    <div className="variant-swatches">
      {[d.tokens.colors.background, d.tokens.colors.surface, d.tokens.colors.primary, d.tokens.colors.accent, d.tokens.colors.text].map((c, i) => (
        <span key={i} style={{ background: c, display: "inline-block", width: 24, height: 24, borderRadius: 6, margin: "0 2px", border: "1px solid rgba(0,0,0,.1)" }} />
      ))}
    </div>
  );

  return (
    <div className="modal-overlay" onClick={p.onClose}>
      <div className="modal variant-modal" onClick={(e) => e.stopPropagation()}>
        <div className="inspector-head">
          <h2 style={{ margin: 0, fontSize: 18 }}>A/B testing — design variants</h2>
          <button className="btn btn-sm btn-ghost" onClick={p.onClose}>Close</button>
        </div>

        {!isPlus ? (
          <div className="theme-plus-banner">
            <b>A/B testing — Plus only</b>
            <p>Compare design variants, preview them side by side, and pick the winner. Upgrade to Plus to use it.</p>
            <button className="btn btn-primary" onClick={p.onUpgrade}>Upgrade to Plus — $35/mo</button>
          </div>
        ) : (
          <>
            <p className="settings-note">
              Generate alternative designs for your current site, compare them visually, then apply the winner.
              This is a real conversion experiment — change the look, keep the content.
            </p>
            <div className="variant-row">
              {variants.map((v, i) => (
                <div key={i} className="variant-card">
                  {i === 0 ? <span className="variant-tag">Control</span> : <span className="variant-tag variant-tag-alt">Variant {i}</span>}
                  <div className="variant-name">{v.name}</div>
                  {swatchRow(v)}
                  <div className="variant-fonts">{v.tokens.fonts.heading} / {v.tokens.fonts.body}</div>
                  <div className="variant-mode">{v.tokens.mode} · radius {v.tokens.radius.md}px</div>
                  <button className="btn btn-primary btn-sm" style={{ width: "100%", marginTop: 8 }} onClick={() => p.onApply(v)}>
                    {i === 0 ? "Keep control" : "Apply variant"}
                  </button>
                </div>
              ))}
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setSeed((s) => s + 1)} style={{ marginTop: 10 }}>
              ↻ Shuffle variants
            </button>
          </>
        )}
      </div>
    </div>
  );
}
