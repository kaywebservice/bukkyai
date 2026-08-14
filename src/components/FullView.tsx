import { useMemo, useState } from "react";
import type { SiteBlueprint } from "../lib/types";
import { multiPageHtml } from "../lib/export";

type Props = {
  doc: SiteBlueprint;
  tier?: "pro" | "plus";
  busy: boolean;
  live: { url: string } | null;
  onGoLive: (domain: string) => void;
  onEnterEditor: () => void;
  onOpenTab: () => void;
};

type Device = "desktop" | "tablet" | "mobile";

const DEVICE_WIDTH: Record<Device, string> = {
  desktop: "100%",
  tablet: "820px",
  mobile: "390px",
};

export default function FullView({ doc, tier, busy, live, onGoLive, onEnterEditor, onOpenTab }: Props) {
  const [device, setDevice] = useState<Device>("desktop");
  const [askApproval, setAskApproval] = useState(true);
  const [goLiveOpen, setGoLiveOpen] = useState(false);
  const [domain, setDomain] = useState("");

  const html = useMemo(() => multiPageHtml(doc), [doc]);

  if (live) {
    return (
      <div className="full-view full-view-live">
        <div className="live-card">
          <div className="live-check" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="34" height="34">
              <path d="M5 13l4 4 10-10" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2>Your website is live</h2>
          <p>
            Congratulations — <b>{doc.meta.title}</b> is published and reachable at:
          </p>
          <a className="live-url" href={live.url} target="_blank" rel="noopener noreferrer">
            {live.url}
          </a>
          <div className="live-actions">
            <a className="btn btn-primary" href={live.url} target="_blank" rel="noopener noreferrer">
              Visit my site ↗
            </a>
            <button className="btn" onClick={onEnterEditor}>
              Back to the editor
            </button>
          </div>
          <p className="live-note">Share the link anywhere — and it stays yours. You own the files, the domain, everything.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="full-view">
      <div className="full-frame" style={{ width: DEVICE_WIDTH[device], maxWidth: device === "desktop" ? "100%" : undefined }}>
        <iframe title="Your website — full view" srcDoc={html} sandbox="allow-scripts allow-same-origin allow-forms allow-popups" />
      </div>

      <div className="full-bar">
        <div className="full-bar-left">
          <span className="full-site-name">{doc.meta.title}</span>
          <span className="full-site-dot" aria-hidden="true" />
          <span className="full-site-tag">live preview</span>
        </div>
        <div className="full-devices">
          {(["desktop", "tablet", "mobile"] as Device[]).map((d) => (
            <button key={d} className={`full-device${device === d ? " on" : ""}`} onClick={() => setDevice(d)} title={`${d} view`}>
              {d === "desktop" ? (
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></svg>
              ) : d === "tablet" ? (
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M11 18h2" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" /></svg>
              )}
              {d}
            </button>
          ))}
        </div>
        <div className="full-bar-right">
          <button className="btn btn-sm" onClick={onOpenTab} title="Open in a real browser tab">
            ↗ New tab
          </button>
          <button className="btn btn-sm btn-ghost" onClick={onEnterEditor} title="Open the full editor">
            ⚙ Advanced editor
          </button>
        </div>
      </div>

      {goLiveOpen ? (
        <div className="full-panel">
          <div className="full-panel-head">
            <b>Go live</b>
            <button className="btn btn-sm btn-ghost" onClick={() => setGoLiveOpen(false)}>Close</button>
          </div>
          <p className="full-panel-text">
            Publishing puts your site on a real web address. {tier ? "Pro is active — ready when you are." : "It's part of Pro — you'll be guided through checkout in a moment."}
          </p>
          <label className="full-field">
            <span>Your custom domain (optional)</span>
            <input
              type="text"
              placeholder="www.yourbusiness.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />
            <small>Leave empty for a free bukkyai address. With a custom domain we add it automatically — point its DNS (CNAME) at your GitHub Pages host.</small>
          </label>
          <button className="btn btn-primary full-go" disabled={busy} onClick={() => onGoLive(domain.trim())}>
            {busy ? "Going live…" : "Publish my site"}
          </button>
        </div>
      ) : (
        askApproval && (
          <div className="full-panel full-approval">
            <div className="full-approval-q">
              <b>Happy with your website?</b>
              <span>You can go live right now — or keep refining in the advanced editor.</span>
            </div>
            <div className="full-approval-btns">
              <button className="btn btn-primary" onClick={() => setGoLiveOpen(true)}>
                Yes — go live
              </button>
              <button className="btn" onClick={onEnterEditor}>
                No — take me to the advanced editor
              </button>
              <button className="btn btn-ghost" onClick={() => setAskApproval(false)}>
                Keep browsing
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
}
