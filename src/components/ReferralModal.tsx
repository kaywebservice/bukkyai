import { useEffect, useState } from "react";
import { fetchReferral, referralStats, referralLink, type ReferralStats } from "../lib/publish";

type Props = {
  email: string;
  onClose: () => void;
};

export default function ReferralModal(p: Props) {
  const [code, setCode] = useState<string>("");
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetchReferral(p.email);
      if (res.error) {
        setError(res.error);
        setLoading(false);
        return;
      }
      const c = res.code ?? "";
      setCode(c);
      const s = await referralStats(p.email);
      setStats(s);
      setLoading(false);
    })();
  }, [p.email]);

  const link = code ? referralLink(code) : "";
  const share = (net: string) => {
    const text = `Build your website in minutes — I just did, using bukkyai. It plans, designs and writes the whole site from one sentence. ${link}`;
    const urls: Record<string, string> = {
      x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text)}`,
    };
    window.open(urls[net], "_blank", "noopener,width=600,height=500");
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="modal-backdrop" onClick={p.onClose} role="presentation">
      <div className="modal" role="dialog" aria-modal="true" aria-label="Refer & earn" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
        <button className="modal-x" onClick={p.onClose} aria-label="Close">
          ✕
        </button>
        <h2>Refer &amp; earn</h2>
        <p style={{ color: "var(--faint)", fontSize: 14, margin: "6px 0 14px" }}>
          Share bukkyai with someone who needs a website. Every paid signup through your link counts.
        </p>
        {loading ? (
          <div style={{ color: "var(--faint)", fontSize: 14 }}>Creating your referral link…</div>
        ) : error ? (
          <div style={{ color: "#c0392b", fontSize: 14 }}>{error}</div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                readOnly
                value={link}
                onFocus={(e) => e.currentTarget.select()}
                style={{ flex: 1, padding: "10px 12px", border: "1px solid var(--border-strong)", borderRadius: 10, background: "var(--panel2)", color: "var(--text)", font: "inherit", fontSize: 13 }}
              />
              <button className="btn btn-sm btn-primary" onClick={copy}>
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              <button className="btn btn-sm btn-ghost" onClick={() => share("x")}>Share on X</button>
              <button className="btn btn-sm btn-ghost" onClick={() => share("facebook")}>Facebook</button>
              <button className="btn btn-sm btn-ghost" onClick={() => share("linkedin")}>LinkedIn</button>
              <button className="btn btn-sm btn-ghost" onClick={() => share("whatsapp")}>WhatsApp</button>
            </div>
            <div style={{ display: "flex", gap: 26, marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{stats?.count ?? 0}</div>
                <div style={{ fontSize: 12, color: "var(--faint)" }}>Link clicks</div>
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{stats?.conversions ?? 0}</div>
                <div style={{ fontSize: 12, color: "var(--faint)" }}>Paid signups</div>
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{stats?.conversions ? stats.conversions : "—"}</div>
                <div style={{ fontSize: 12, color: "var(--faint)" }}>Reward due</div>
              </div>
            </div>
            <p style={{ color: "var(--faint)", fontSize: 12, marginTop: 14, lineHeight: 1.6 }}>
              Rewards are credited as free Pro time when a referred friend upgrades —{" "}
              <a href="/badge" style={{ color: "var(--accent)" }}>learn more</a>.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
