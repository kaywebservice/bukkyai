import { useMemo, useState } from "react";
import type { SiteBlueprint } from "../lib/types";

type Props = {
  doc: SiteBlueprint;
  onApplyDoc: (doc: SiteBlueprint, label: string, source: "edit") => void;
};

export default function AnalyticsView(p: Props) {
  const analytics = p.doc.analytics;
  const [embedUrl, setEmbedUrl] = useState("");

  const providerLabel = useMemo(() => {
    if (analytics?.plausible) return { name: "Plausible", domain: analytics.plausible };
    if (analytics?.goatcounter) return { name: "GoatCounter", domain: analytics.goatcounter };
    return null;
  }, [analytics]);

  const dashboardUrl = providerLabel
    ? providerLabel.name === "Plausible"
      ? `https://plausible.io/${providerLabel.domain}`
      : `https://${providerLabel.domain}.goatcounter.com`
    : "";

  const dashSrc = embedUrl.trim()
    ? embedUrl.trim()
    : analytics?.plausible
      ? `https://plausible.io/${analytics.plausible}?embed=true&theme=dark`
      : analytics?.goatcounter
        ? `https://${analytics.goatcounter}.goatcounter.com/admin`
        : "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="panel-label">Traffic</div>

      {!providerLabel ? (
        <div className="settings-note">
          No analytics connected yet. Go to Settings → Connected services and add a Plausible domain or
          GoatCounter subdomain, then publish your site. Traffic data appears in your analytics provider's
          dashboard.
        </div>
      ) : (
        <>
          <div className="inspector-section" style={{ padding: 12 }}>
            <b>{providerLabel.name}</b>
            <div style={{ fontSize: 12, color: "var(--chrome-faint)", margin: "4px 0 10px" }}>
              {providerLabel.domain} · tracking code is already injected into your published site.
            </div>
            <a className="btn" style={{ width: "100%", justifyContent: "center" }} href={dashboardUrl} target="_blank" rel="noopener noreferrer">
              Open {providerLabel.name} dashboard
            </a>
          </div>
          <div className="json-field">
            <label>Embed dashboard URL (optional)</label>
            <input
              value={embedUrl}
              placeholder="https://plausible.io/yourdomain?embed=true&theme=dark"
              onChange={(e) => setEmbedUrl(e.target.value)}
            />
            <div className="settings-note">
              Paste a public embed link to view it right here.
            </div>
          </div>
          {dashSrc && (
            <iframe
              src={dashSrc}
              title="Analytics"
              style={{ width: "100%", height: 420, border: "1px solid var(--chrome-border)", borderRadius: 10, background: "#fff" }}
            />
          )}
        </>
      )}
    </div>
  );
}
