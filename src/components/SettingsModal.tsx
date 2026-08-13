import { useState } from "react";
import type { LLMSettings } from "../lib/types";
import { defaultModel } from "../lib/llm";
import FieldHint from "./FieldHint";
import { useFocusTrap } from "../lib/useFocusTrap";

type SiteMeta = { password?: string; stripePaymentLink?: string; embedHead?: string; embedBody?: string; formEndpoint?: string; analyticsDomain?: string; cookieEnabled?: boolean; cookieText?: string; cookiePolicyUrl?: string; redirects?: string; themeToggle?: boolean; themeDefaultMode?: "auto" | "light" | "dark"; siteUrl?: string; stickyNav?: boolean; announcementText?: string; announcementHref?: string; popupEnabled?: boolean; popupTitle?: string; popupText?: string; popupButtonLabel?: string; popupCtaUrl?: string; popupDelaySec?: number; popupTrigger?: "time" | "exit" | "scroll"; popupScrollPct?: number; customFonts?: string; emailServiceProvider?: string; emailServiceEndpoint?: string; emailServiceApiKey?: string; emailServiceListId?: string; coupons?: string; orderNotify?: string; maintenanceEnabled?: boolean; maintenanceTitle?: string; maintenanceText?: string; maintenanceEmail?: string };
type Props = {
  settings: LLMSettings & { githubToken?: string };
  siteMeta?: SiteMeta;
  cloudOn?: boolean;
  signedIn?: boolean;
  onSave: (s: LLMSettings & { githubToken?: string }) => void;
  onSaveSiteMeta: (m: SiteMeta) => void;
  onToggleCloud: (on: boolean) => void;
  onClose: () => void;
};

export default function SettingsModal(p: Props) {
  const [s, setS] = useState(p.settings);
  const modalRef = useFocusTrap(true, p.onClose);
  const [meta, setMeta] = useState({
    password: p.siteMeta?.password ?? "",
    stripePaymentLink: p.siteMeta?.stripePaymentLink ?? "",
    embedHead: p.siteMeta?.embedHead ?? "",
    embedBody: p.siteMeta?.embedBody ?? "",
    formEndpoint: p.siteMeta?.formEndpoint ?? "",
    analyticsDomain: p.siteMeta?.analyticsDomain ?? "",
    cookieEnabled: p.siteMeta?.cookieEnabled ?? false,
    cookieText: p.siteMeta?.cookieText ?? "",
    cookiePolicyUrl: p.siteMeta?.cookiePolicyUrl ?? "",
    redirects: p.siteMeta?.redirects ?? "",
    themeToggle: p.siteMeta?.themeToggle ?? false,
    themeDefaultMode: p.siteMeta?.themeDefaultMode ?? "auto",
    siteUrl: p.siteMeta?.siteUrl ?? "",
    stickyNav: p.siteMeta?.stickyNav ?? false,
    announcementText: p.siteMeta?.announcementText ?? "",
    announcementHref: p.siteMeta?.announcementHref ?? "",
    popupEnabled: p.siteMeta?.popupEnabled ?? false,
    popupTitle: p.siteMeta?.popupTitle ?? "",
    popupText: p.siteMeta?.popupText ?? "",
    popupButtonLabel: p.siteMeta?.popupButtonLabel ?? "",
    popupCtaUrl: p.siteMeta?.popupCtaUrl ?? "",
    popupDelaySec: p.siteMeta?.popupDelaySec ?? 6,
    popupTrigger: p.siteMeta?.popupTrigger ?? "time",
    popupScrollPct: p.siteMeta?.popupScrollPct ?? 60,
    customFonts: p.siteMeta?.customFonts ?? "",
    emailServiceProvider: p.siteMeta?.emailServiceProvider ?? "",
    emailServiceEndpoint: p.siteMeta?.emailServiceEndpoint ?? "",
    emailServiceApiKey: p.siteMeta?.emailServiceApiKey ?? "",
    emailServiceListId: p.siteMeta?.emailServiceListId ?? "",
    coupons: p.siteMeta?.coupons ?? "",
    orderNotify: p.siteMeta?.orderNotify ?? "",
    maintenanceEnabled: p.siteMeta?.maintenanceEnabled ?? false,
    maintenanceTitle: p.siteMeta?.maintenanceTitle ?? "",
    maintenanceText: p.siteMeta?.maintenanceText ?? "",
    maintenanceEmail: p.siteMeta?.maintenanceEmail ?? "",
  });

  const provider = s.provider;
  const model = s.model || defaultModel(provider);

  return (
    <div className="modal-overlay" onClick={p.onClose}>
      <div className="modal" ref={modalRef} role="dialog" aria-modal="true" aria-label="Settings" onClick={(e) => e.stopPropagation()}>
        <h2>Settings</h2>

        <div className="panel-label">AI provider (your key stays local)</div>
        <div className="settings-row">
          <label>Provider</label>
          <select
            value={s.provider}
            onChange={(e) => setS({ ...s, provider: e.target.value as LLMSettings["provider"], model: "" })}
          >
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic (Claude)</option>
            <option value="gemini">Google Gemini</option>
            <option value="custom">Custom (OpenRouter, Ollama, etc.)</option>
          </select>
        </div>

        <div className="settings-row">
          <label>API key</label>
          <input
            type="password"
            value={s.apiKey}
            placeholder="Key is stored only in this browser"
            onChange={(e) => setS({ ...s, apiKey: e.target.value })}
          />
        </div>

        <div className="settings-row">
          <label>Model</label>
          <input
            value={model}
            placeholder={provider === "custom" ? "e.g. openai/gpt-4o" : "leave blank for default"}
            onChange={(e) => setS({ ...s, model: e.target.value })}
          />
        </div>

        <div className="settings-row">
          <label>Image model (Gemini)</label>
          <input
            value={s.imageModel ?? ""}
            placeholder="gemini-3.1-flash-image"
            onChange={(e) => setS({ ...s, imageModel: e.target.value })}
          />
          <div className="settings-note">
            Used by the ✦ Generate buttons (Inspector + Media library). Leave blank for the default; needs a
            Gemini key with image output.
          </div>
        </div>

        {provider === "custom" && (
          <div className="settings-row">
            <label>Base URL</label>
            <input
              value={s.baseUrl ?? ""}
              placeholder="https://openrouter.ai/api/v1"
              onChange={(e) => setS({ ...s, baseUrl: e.target.value })}
            />
          </div>
        )}

        <div className="panel-label">Connected services (your tokens stay local)</div>
        <div className="settings-row">
          <label>Form endpoint (optional)</label>
          <input
            value={meta.formEndpoint}
            placeholder="https://formspree.io/f/xxx or https://api.web3forms.com/submit"
            onChange={(e) => setMeta({ ...meta, formEndpoint: e.target.value })}
          />
          <div className="settings-note">
            Your contact & newsletter forms POST here when the site is exported/published. Formspree and
            Web3Forms both work out of the box. Leave empty and forms show a friendly demo note.
          </div>
        </div>
        <div className="settings-row">
          <label>Analytics domain (optional)</label>
          <input
            value={meta.analyticsDomain}
            placeholder="yourdomain.com → Plausible; or goatcounter subdomain"
            onChange={(e) => setMeta({ ...meta, analyticsDomain: e.target.value })}
          />
          <div className="settings-note">
            Turns on Plausible (if you give a full domain) or GoatCounter (if you give a subdomain, e.g.
            "mysite"). The script is injected into your export.
          </div>
        </div>
        <div className="settings-row">
          <label>GitHub token (optional)</label>
          <input
            type="password"
            value={s.githubToken ?? ""}
            placeholder="ghp_… (gist scope)"
            onChange={(e) => setS({ ...s, githubToken: e.target.value })}
          />
          <div className="settings-note">
            Used only for "Back up to GitHub" (creates a private gist). Never sent anywhere but GitHub.
          </div>
        </div>

        <div className="panel-label">Cloud & accounts</div>
        <div className="settings-row">
          <label>
            <input
              type="checkbox"
              checked={Boolean(p.cloudOn)}
              onChange={(e) => p.onToggleCloud(e.target.checked)}
              style={{ width: "auto" }}
            />
            Cloud sync (Firestore)
          </label>
          <div className="settings-note">
            {p.signedIn
              ? "Projects auto-backup to your Firebase account on every change."
              : "Sign in (top-right) to sync projects across devices. Requires Firestore enabled in Firebase."}
          </div>
        </div>

        <div className="panel-label">Site protection & payments</div>
        <div className="settings-row">
          <label>Password protect (optional)</label>
          <input
            value={meta.password}
            placeholder="Leave empty for a public site"
            onChange={(e) => setMeta({ ...meta, password: e.target.value })}
          />
          <div className="settings-note">Visitors must enter this password to view the site. Stored in your blueprint.</div>
        </div>
        <div className="settings-row">
          <label>Payment / checkout link (optional)</label>
          <input
            value={meta.stripePaymentLink}
            placeholder={(import.meta.env.VITE_DEFAULT_PAYMENT_LINK as string) || "https://…"}
            onChange={(e) => setMeta({ ...meta, stripePaymentLink: e.target.value })}
          />
          <div className="settings-note">
            Checkout redirects the visitor to this link (Creem, Stripe, or any hosted checkout). Create one
            in your payment dashboard.
          </div>
        </div>

        <div className="panel-label">Custom code (head/body)</div>
        <div className="settings-row">
          <label>Head scripts</label>
          <textarea
            rows={3}
            value={meta.embedHead}
            placeholder="<meta …> or <script>…</script> injected into <head>"
            onChange={(e) => setMeta({ ...meta, embedHead: e.target.value })}
          />
        </div>
        <div className="settings-row">
          <label>Body scripts</label>
          <textarea
            rows={3}
            value={meta.embedBody}
            placeholder="<script>…</script> injected before </body>"
            onChange={(e) => setMeta({ ...meta, embedBody: e.target.value })}
          />
        </div>

        <div className="panel-label">Appearance</div>
        <div className="settings-row">
          <label>
            <input
              type="checkbox"
              checked={Boolean(meta.themeToggle)}
              onChange={(e) => setMeta({ ...meta, themeToggle: e.target.checked })}
              style={{ width: "auto" }}
            />
            Allow visitors to toggle dark mode
          </label>
        </div>
        {meta.themeToggle && (
          <div className="settings-row">
            <label>Default mode</label>
            <select
              value={meta.themeDefaultMode}
              onChange={(e) => setMeta({ ...meta, themeDefaultMode: e.target.value as "auto" | "light" | "dark" })}
            >
              <option value="auto">Follow device</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        )}

        <div className="panel-label">Site & branding</div>
        <div className="settings-row">
          <label>Site URL<FieldHint hint="Used in sitemap.xml, RSS feed and canonical tags. Set to your real domain before publishing." /></label>
          <input
            value={meta.siteUrl}
            placeholder="https://yoursite.com"
            onChange={(e) => setMeta({ ...meta, siteUrl: e.target.value })}
          />
          <div className="settings-note">
            Used in sitemap.xml, RSS feed and canonical tags. Set this to your real domain before publishing.
          </div>
        </div>
        <div className="settings-row">
          <label>
            <input
              type="checkbox"
              checked={Boolean(meta.stickyNav)}
              onChange={(e) => setMeta({ ...meta, stickyNav: e.target.checked })}
              style={{ width: "auto" }}
            />
            Sticky navigation bar
          </label>
        </div>
        <div className="settings-row">
          <label>Announcement bar</label>
          <input
            value={meta.announcementText}
            placeholder="Free shipping on orders over $50"
            onChange={(e) => setMeta({ ...meta, announcementText: e.target.value })}
          />
        </div>
        {meta.announcementText && (
          <div className="settings-row">
            <label>Announcement link (optional)</label>
            <input value={meta.announcementHref} placeholder="https://…" onChange={(e) => setMeta({ ...meta, announcementHref: e.target.value })} />
          </div>
        )}

        <div className="panel-label">Lead capture popup</div>
        <div className="settings-row">
          <label>
            <input
              type="checkbox"
              checked={Boolean(meta.popupEnabled)}
              onChange={(e) => setMeta({ ...meta, popupEnabled: e.target.checked })}
              style={{ width: "auto" }}
            />
            Show popup (once per visit)
          </label>
        </div>
        {meta.popupEnabled && (
          <>
            <div className="settings-row"><label>Title</label><input value={meta.popupTitle} onChange={(e) => setMeta({ ...meta, popupTitle: e.target.value })} placeholder="Get 10% off your first order" /></div>
            <div className="settings-row"><label>Text</label><textarea rows={2} value={meta.popupText} onChange={(e) => setMeta({ ...meta, popupText: e.target.value })} placeholder="Join our newsletter…" /></div>
            <div className="settings-row"><label>Button label</label><input value={meta.popupButtonLabel} onChange={(e) => setMeta({ ...meta, popupButtonLabel: e.target.value })} placeholder="Subscribe" /></div>
            <div className="settings-row"><label>Button link (optional)</label><input value={meta.popupCtaUrl} onChange={(e) => setMeta({ ...meta, popupCtaUrl: e.target.value })} placeholder="https://…" /></div>
            <div className="settings-row"><label>Delay (seconds)</label><input type="number" value={meta.popupDelaySec} onChange={(e) => setMeta({ ...meta, popupDelaySec: Number(e.target.value) || 0 })} /></div>
            <div className="settings-row">
              <label>Show when</label>
              <select value={meta.popupTrigger} onChange={(e) => setMeta({ ...meta, popupTrigger: e.target.value as "time" | "exit" | "scroll" })}>
                <option value="time">After a few seconds</option>
                <option value="exit">Visitor is about to leave</option>
                <option value="scroll">Visitor scrolls down</option>
              </select>
            </div>
            {meta.popupTrigger === "scroll" && (
              <div className="settings-row"><label>Scroll depth (%)</label><input type="number" value={meta.popupScrollPct} onChange={(e) => setMeta({ ...meta, popupScrollPct: Number(e.target.value) || 60 })} /></div>
            )}
          </>
        )}

        <div className="panel-label">Custom fonts</div>
        <div className="settings-row">
          <label>Fonts (name + woff2 URL per line)<FieldHint hint="One per line: 'Name https://…/font.woff2 600'. After saving, use the font name in any heading/body field." /></label>
          <textarea
            rows={3}
            value={meta.customFonts}
            placeholder={"MyFont https://…/font.woff2 600\nTitleFont https://…/title.woff2 800"}
            onChange={(e) => setMeta({ ...meta, customFonts: e.target.value })}
          />
          <div className="settings-note">
            One per line: <code>Name url [weight]</code>. After saving, use the font name in any heading/body field.
          </div>
        </div>

        <div className="panel-label">Commerce</div>
        <div className="settings-row">
          <label>Coupon codes (code %)<FieldHint hint="One per line: 'CODE 10'. Visitors enter the code in the cart drawer and get that percent off." /></label>
          <textarea
            rows={3}
            value={meta.coupons}
            placeholder={"SAVE10 10\nLAUNCH 20"}
            onChange={(e) => setMeta({ ...meta, coupons: e.target.value })}
          />
          <div className="settings-note">One per line: <code>code percent</code>. Visitors enter them in the cart.</div>
        </div>
        <div className="settings-row">
          <label>Order notification URL (optional)</label>
          <input
            value={meta.orderNotify}
            placeholder="https://formspree.io/f/xxx"
            onChange={(e) => setMeta({ ...meta, orderNotify: e.target.value })}
          />
          <div className="settings-note">
            When a visitor hits Checkout, the cart contents are POSTed here so you get notified of new orders.
          </div>
        </div>
        <div className="settings-row">
          <label>Email list provider</label>
          <select value={meta.emailServiceProvider} onChange={(e) => setMeta({ ...meta, emailServiceProvider: e.target.value })}>
            <option value="">Off (use form endpoint)</option>
            <option value="mailchimp">Mailchimp</option>
            <option value="klaviyo">Klaviyo</option>
            <option value="custom">Custom endpoint</option>
          </select>
        </div>
        {meta.emailServiceProvider && (
          <>
            <div className="settings-row">
              <label>Subscribe endpoint</label>
              <input
                value={meta.emailServiceEndpoint}
                placeholder="https://…/subscribe"
                onChange={(e) => setMeta({ ...meta, emailServiceEndpoint: e.target.value })}
              />
            </div>
            <div className="settings-row">
              <label>API key (optional)</label>
              <input
                type="password"
                value={meta.emailServiceApiKey}
                onChange={(e) => setMeta({ ...meta, emailServiceApiKey: e.target.value })}
              />
            </div>
            <div className="settings-row">
              <label>List / audience ID (optional)</label>
              <input value={meta.emailServiceListId} onChange={(e) => setMeta({ ...meta, emailServiceListId: e.target.value })} />
            </div>
          </>
        )}

        <div className="panel-label">Maintenance mode</div>
        <div className="settings-row">
          <label>
            <input
              type="checkbox"
              checked={Boolean(meta.maintenanceEnabled)}
              onChange={(e) => setMeta({ ...meta, maintenanceEnabled: e.target.checked })}
              style={{ width: "auto" }}
            />
            Show a "coming soon" page on publish
          </label>
        </div>
        {meta.maintenanceEnabled && (
          <>
            <div className="settings-row"><label>Title</label><input value={meta.maintenanceTitle} onChange={(e) => setMeta({ ...meta, maintenanceTitle: e.target.value })} placeholder="We'll be right back." /></div>
            <div className="settings-row"><label>Message</label><textarea rows={2} value={meta.maintenanceText} onChange={(e) => setMeta({ ...meta, maintenanceText: e.target.value })} placeholder="We're putting the finishing touches on…" /></div>
            <div className="settings-row"><label>Contact email (optional)</label><input value={meta.maintenanceEmail} onChange={(e) => setMeta({ ...meta, maintenanceEmail: e.target.value })} placeholder="hello@…" /></div>
          </>
        )}

        <div className="panel-label">Privacy & redirects</div>
        <div className="settings-row">
          <label>
            <input
              type="checkbox"
              checked={Boolean(meta.cookieEnabled)}
              onChange={(e) => setMeta({ ...meta, cookieEnabled: e.target.checked })}
              style={{ width: "auto" }}
            />
            Show cookie consent banner
          </label>
        </div>
        {meta.cookieEnabled && (
          <>
            <div className="settings-row">
              <label>Banner text</label>
              <textarea
                rows={2}
                value={meta.cookieText}
                placeholder="We use cookies to improve your experience…"
                onChange={(e) => setMeta({ ...meta, cookieText: e.target.value })}
              />
            </div>
            <div className="settings-row">
              <label>Policy URL</label>
              <input
                value={meta.cookiePolicyUrl}
                placeholder="https://…/privacy"
                onChange={(e) => setMeta({ ...meta, cookiePolicyUrl: e.target.value })}
              />
            </div>
          </>
        )}
        <div className="settings-row">
          <label>Redirects (from → to)</label>
          <textarea
            rows={3}
            value={meta.redirects}
            placeholder={"/old-page → /new-page\n/old.html → /new.html"}
            onChange={(e) => setMeta({ ...meta, redirects: e.target.value })}
          />
          <div className="settings-note">
            One per line, "from → to". Emitted as <code>_redirects</code> for Netlify/Vercel plus
            redirects.json. Only applies to the static publish, not the preview.
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={p.onClose}>
            Close
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              p.onSave(s);
              p.onSaveSiteMeta(meta);
              p.onClose();
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
