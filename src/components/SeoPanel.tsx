import { useEffect, useMemo, useState } from "react";
import type { SiteBlueprint, LLMSettings } from "../lib/types";
import { auditSite, seoAutoFixPrompt } from "../lib/audit";
import { applyEdit } from "../lib/builder";

type Props = {
  doc: SiteBlueprint;
  settings: LLMSettings;
  busy: boolean;
  onStatus: (label: string) => void;
  onApplyDoc: (doc: SiteBlueprint, label: string, source: "edit") => void;
  onGenerateOg: () => void;
};

type Issue = ReturnType<typeof auditSite>["issues"][number];

export default function SeoPanel(p: Props) {
  const result = useMemo(() => auditSite(p.doc), [p.doc]);
  const [issues, setIssues] = useState<Issue[]>(result.issues);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setIssues(result.issues);
  }, [result]);

  const runFix = async () => {
    if (!p.settings.apiKey.trim()) return;
    setRunning(true);
    try {
      const res = await applyEdit(
        p.doc,
        seoAutoFixPrompt(p.doc, issues.filter((i) => !i.ok && i.fixable)),
        p.settings,
        { onStatus: p.onStatus }
      );
      if (res.doc) {
        p.onApplyDoc(res.doc, "AI fixed SEO issues", "edit");
        setIssues(res.doc ? auditSite(res.doc).issues : issues);
      }
    } finally {
      setRunning(false);
    }
  };

  return (
    <>
      <div className="panel-label">Site quality</div>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 6 }}>
        <div style={{ fontSize: 34, fontWeight: 800 }}>{result.score}</div>
        <div style={{ flex: 1, height: 10, background: "#2a2a32", borderRadius: 6, overflow: "hidden" }}>
          <div
            className="status-dot"
            style={{ width: `${result.score}%`, height: "100%", background: "var(--chrome-accent)" }}
          />
        </div>
        <span style={{ fontSize: 12, color: "var(--chrome-faint)" }}>out of 100</span>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <button className="btn btn-sm" onClick={runFix} disabled={p.busy || running || !p.settings.apiKey.trim()}>
          {running ? "Fixing…" : "Auto-fix with AI"}
        </button>
        <button
          className="btn btn-sm btn-ghost"
          onClick={() => setIssues(auditSite(p.doc).issues)}
          disabled={p.busy}
        >
          Refresh
        </button>
        <button className="btn btn-sm btn-ghost" onClick={p.onGenerateOg} disabled={p.busy}>
          Generate share image
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {issues.map((i, idx) => (
          <div
            key={idx}
            style={{
              padding: "9px 11px",
              borderRadius: 8,
              border: `1px solid ${
                i.ok ? "rgba(76,175,80,.25)" : "rgba(248,113,113,.25)"
              }`,
              background: i.ok ? "rgba(76,175,80,.06)" : "rgba(248,113,113,.06)",
            }}
          >
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <span
                className="status-dot"
                style={{
                  background: i.ok ? "var(--chrome-good)" : "var(--chrome-bad)",
                  width: 8,
                  height: 8,
                  marginTop: 3,
                }}
              />
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>{i.label}</div>
                <div style={{ fontSize: 11.5, color: "var(--chrome-faint)" }}>{i.detail}</div>
                {i.area && (
                  <span
                    style={{
                      fontSize: 10,
                      color: i.ok ? "var(--chrome-good)" : "var(--chrome-warn)",
                      textTransform: "uppercase",
                      border: "1px solid currentColor",
                      borderRadius: 999,
                      padding: "1px 6px",
                      display: "inline-block",
                      marginTop: 3,
                    }}
                  >
                    {i.area}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="settings-note" style={{ marginTop: 12 }}>
        The site ships with server-rendered HTML, OG meta, JSON-LD, sitemap.xml and robots.txt on
        every export. This panel audits all of it plus WCAG contrast and empty-copy checks.
      </div>
    </>
  );
}
