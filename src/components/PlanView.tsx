import type { SitePlan } from "../lib/types";

type Props = {
  plan: SitePlan | null;
  busy: boolean;
  onApprove: () => void;
  onDiscard: () => void;
};

export default function PlanView(p: Props) {
  if (!p.plan) {
    return (
      <div className="settings-note">
        Describe your site and Kaywebservice will first show you the structure — sitemap, sections, and tone —
        before generating anything. You approve the plan, then it builds.
      </div>
    );
  }

  return (
    <>
      <div className="plan-card">
        <div style={{ marginBottom: 10 }}>
          <div className="panel-label">Site title</div>
          <b>{p.plan.meta.title}</b>
          <div className="settings-note" style={{ marginTop: 4 }}>
            {p.plan.meta.description}
          </div>
        </div>
        <div style={{ marginBottom: 10 }}>
          <div className="panel-label">Tone</div>
          <b>{p.plan.tone}</b>
        </div>
      </div>

      <div className="panel-label">Pages & sections</div>
      {p.plan.pages.map((pg, pi) => (
        <div className="plan-card" key={pi}>
          <div className="plan-page-title">
            {pg.title}
            <span className="slug">/{pg.slug || "home"}</span>
          </div>
          <div className="plan-page-desc">{pg.description}</div>
          {pg.sections.map((s, si) => (
            <div className="plan-sec" key={si}>
              <span className="type">{s.type}</span>
              <span className="purpose">{s.purpose}</span>
            </div>
          ))}
        </div>
      ))}

      <div className="plan-card" style={{ borderColor: "var(--chrome-accent)" }}>
        <div className="panel-label" style={{ color: "var(--chrome-accent)" }}>
          Next
        </div>
        <p className="settings-note" style={{ margin: "6px 0 12px" }}>
          Approving will invent a unique design system (colors, fonts, spacing), write all the copy per
          section, and assemble the full site. Every step is checkpointed.
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={p.onApprove} disabled={p.busy}>
            Approve & build
          </button>
          <button className="btn btn-ghost" onClick={p.onDiscard} disabled={p.busy}>
            Discard
          </button>
        </div>
      </div>
    </>
  );
}
