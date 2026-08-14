import { useEffect, useMemo, useRef, useState } from "react";
import type { SiteBlueprint } from "../lib/types";
import { multiPageHtml } from "../lib/export";
import { checkDomainDns, fetchDnsInfo } from "../lib/publish";

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

type DnsState = "idle" | "checking" | "ok" | "no";

export default function FullView({ doc, tier, busy, live, onGoLive, onEnterEditor, onOpenTab }: Props) {
  const [device, setDevice] = useState<Device>("desktop");
  const [askApproval, setAskApproval] = useState(true);
  const [panel, setPanel] = useState<"none" | "golive" | "domain">("none");
  const [domain, setDomain] = useState("");
  const [dnsTarget, setDnsTarget] = useState<string>("");
  const [dnsState, setDnsState] = useState<DnsState>("idle");
  const [dnsNote, setDnsNote] = useState("");
  const pollRef = useRef<number | null>(null);

  const html = useMemo(() => multiPageHtml(doc), [doc]);

  useEffect(() => {
    void fetchDnsInfo().then((info) => {
      if (info) setDnsTarget(info.cnameTarget);
    });
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, []);

  const stopPolling = () => {
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const runDnsCheck = () => {
    const host = domain.trim();
    if (!host) {
      setDnsNote("Enter your domain first.");
      return;
    }
    setDnsState("checking");
    setDnsNote(`Watching ${host} — checking every few seconds…`);
    let tries = 0;
    const tick = async () => {
      const res = await checkDomainDns(host);
      if (res.ok) {
        stopPolling();
        setDnsState("ok");
        setDnsNote("");
        return;
      }
      tries += 1;
      if (tries >= 24) {
        stopPolling();
        setDnsState("no");
        setDnsNote("Still not visible yet. Double-check the record at your registrar and try again.");
        return;
      }
    };
    void tick();
    stopPolling();
    pollRef.current = window.setInterval(tick, 5000);
  };

  const resetPanel = () => {
    stopPolling();
    setDnsState("idle");
    setDnsNote("");
    setPanel("none");
  };

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

      {panel === "golive" && (
        <div className="full-panel">
          <div className="full-panel-head">
            <b>Go live</b>
            <button className="btn btn-sm btn-ghost" onClick={resetPanel}>Close</button>
          </div>
          <div className="full-tabs">
            <button className="full-tab on" onClick={() => setPanel("golive")}>Free address</button>
            <button className="full-tab" onClick={() => setPanel("domain")}>My own domain</button>
          </div>
          <p className="full-panel-text">
            Your site goes live instantly at a free bukkyai address — no DNS, no setup. {tier ? "Pro is active — ready when you are." : "It's part of Pro — you'll be guided through checkout in a moment."}
          </p>
          <button className="btn btn-primary full-go" disabled={busy} onClick={() => onGoLive("")}>
            {busy ? "Going live…" : "Publish now — it's instant"}
          </button>
        </div>
      )}

      {panel === "domain" && (
        <div className="full-panel">
          <div className="full-panel-head">
            <b>Connect my own domain</b>
            <button className="btn btn-sm btn-ghost" onClick={resetPanel}>Close</button>
          </div>
          <div className="full-tabs">
            <button className="full-tab" onClick={() => setPanel("golive")}>Free address</button>
            <button className="full-tab on" onClick={() => setPanel("domain")}>My own domain</button>
          </div>
          <p className="full-panel-text">
            Use a domain you already own (like <b>www.mybakery.com</b>). One small DNS record at your registrar — and we watch for it automatically.
          </p>
          <label className="full-field">
            <span>Your domain</span>
            <input
              type="text"
              placeholder="www.yourbusiness.com"
              value={domain}
              disabled={dnsState === "checking" || dnsState === "ok"}
              onChange={(e) => {
                setDomain(e.target.value);
                setDnsState("idle");
                setDnsNote("");
              }}
            />
          </label>
          <div className="full-dns">
            <div className="full-dns-row">
              <span>Type</span><b>CNAME</b>
            </div>
            <div className="full-dns-row">
              <span>Name</span><b>{domain ? domain.split(".").slice(0, -2).join(".") || "@" : "your subdomain"}</b>
            </div>
            <div className="full-dns-row">
              <span>Value</span>
              <b className="full-dns-value">
                {dnsTarget || "username.github.io"}
                <button
                  className="btn btn-sm"
                  onClick={() => {
                    void navigator.clipboard?.writeText(dnsTarget || "username.github.io");
                  }}
                  title="Copy the CNAME value"
                >
                  Copy
                </button>
              </b>
            </div>
          </div>
          <small className="full-field-note">Add this record at your domain registrar (GoDaddy, Namecheap, Google Domains…) — it usually takes effect within a few minutes.</small>
          <div className="full-go-row">
            {dnsState !== "ok" ? (
              <button className="btn btn-primary full-go" disabled={dnsState === "checking" || !domain.trim()} onClick={runDnsCheck}>
                {dnsState === "checking" ? "Watching for it…" : "I've added it — check"}
              </button>
            ) : (
              <button className="btn btn-primary full-go" disabled={busy} onClick={() => onGoLive(domain.trim())}>
                {busy ? "Publishing…" : `Publish on ${domain.trim()}`}
              </button>
            )}
            {dnsState === "ok" && <span className="full-dns-ok">✅ Connected — {domain.trim()} points to us. You're clear to publish.</span>}
            {dnsNote && <span className={`full-dns-note${dnsState === "no" ? " err" : ""}`}>{dnsNote}</span>}
          </div>
        </div>
      )}

      {panel === "none" && (
        askApproval && (
          <div className="full-panel full-approval">
            <div className="full-approval-q">
              <b>Happy with your website?</b>
              <span>You can go live right now — or keep refining in the advanced editor.</span>
            </div>
            <div className="full-approval-btns">
              <button className="btn btn-primary" onClick={() => setPanel("golive")}>
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
