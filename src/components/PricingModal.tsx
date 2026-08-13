import { useFocusTrap } from "../lib/useFocusTrap";

type Props = {
  onClose: () => void;
  onBuy: (tier: "pro" | "plus") => void;
  configured?: boolean;
  pro?: boolean;
  tier?: string;
  signedIn?: boolean;
  email?: string | null;
  projectCount?: number;
  publishedCount?: number;
  onOpenAccount?: () => void;
};

export default function PricingModal(p: Props) {
  const modalRef = useFocusTrap(true, p.onClose);
  const plan = p.tier === "plus" ? "Plus" : p.pro ? "Pro" : "Free";
  return (
    <div className="modal-overlay" onClick={p.onClose}>
      <div className="modal pricing-modal" ref={modalRef} role="dialog" aria-modal="true" aria-label="Pricing" onClick={(e) => e.stopPropagation()}>
        <div className="inspector-head">
          <h2 style={{ margin: 0, fontSize: 18 }}>bukkyai</h2>
          <button className="btn btn-sm btn-ghost" onClick={p.onClose}>
            Close
          </button>
        </div>

        {p.signedIn && (
          <div className="plan-card">
            <div className="plan-card-row">
              <span>
                <b>Current plan</b>
                <span className={`plan-badge ${p.pro ? "plan-badge-pro" : ""}`}>{plan}</span>
              </span>
              <span className="plan-card-email">{p.email}</span>
            </div>
            <div className="plan-card-stats">
              <span>
                <b>{p.projectCount ?? 0}</b> projects
              </span>
              <span>
                <b>{p.publishedCount ?? 0}</b> published
              </span>
            </div>
            {p.onOpenAccount && (
              <button className="btn btn-ghost btn-sm" style={{ width: "100%", marginTop: 8 }} onClick={p.onOpenAccount}>
                Manage account
              </button>
            )}
          </div>
        )}

        <p className="settings-note">
          An AI website builder that's yours forever — unlimited edits, no credits, no cloud lock-in.
          Describe a site, get the whole thing built, then polish it visually.
        </p>

        <div className="pricing-tiers">
          <div className={`pricing-tier${!p.pro ? " pricing-tier-active" : ""}`}>
            <b>Free</b>
            <div className="pricing-price">$0</div>
            <ul>
              <li>Unlimited local projects</li>
              <li>AI plan → build (multi-page)</li>
              <li>Visual canvas editor</li>
              <li>AI image generation</li>
              <li>Static HTML / zip export</li>
              <li>Blog, i18n, animations, cart</li>
            </ul>
            {!p.pro && <div className="plan-badge plan-badge-current">Your plan</div>}
          </div>
          <div className={`pricing-tier pricing-tier-featured${p.tier === "pro" || (p.pro && p.tier !== "plus") ? " pricing-tier-active" : ""}`}>
            <b>Pro</b>
            <div className="pricing-price">$19<span>/mo</span></div>
            <ul>
              <li>Everything in Free</li>
              <li>One-click publish & share links</li>
              <li>Custom domains</li>
              <li>Cloud save across devices</li>
              <li>Firebase auth / member areas</li>
              <li>Checkout with payments</li>
              <li>Priority support</li>
            </ul>
            {p.tier === "pro" ? (
              <div className="plan-badge plan-badge-current plan-badge-pro">Active</div>
            ) : (
              <button
                className="btn btn-primary"
                style={{ width: "100%", marginTop: 10 }}
                onClick={() => p.onBuy("pro")}
                disabled={!p.configured}
              >
                {p.configured ? "Get Pro" : "Configure payment link first"}
              </button>
            )}
          </div>
          <div className={`pricing-tier${p.tier === "plus" ? " pricing-tier-active" : ""}`}>
            <b>Plus</b>
            <div className="pricing-price">$49.99<span>/mo</span></div>
            <ul>
              <li>Everything in Pro</li>
              <li>5 published sites</li>
              <li>Higher publish limits</li>
              <li>Advanced analytics & A/B testing</li>
              <li>Dedicated support</li>
            </ul>
            {p.tier === "plus" ? (
              <div className="plan-badge plan-badge-current plan-badge-pro">Active</div>
            ) : (
              <button
                className="btn"
                style={{ width: "100%", marginTop: 10 }}
                onClick={() => p.onBuy("plus")}
                disabled={!p.configured}
              >
                {p.configured ? "Get Plus" : "Configure payment link first"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
