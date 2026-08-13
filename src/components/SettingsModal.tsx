import { useState } from "react";
import type { LLMSettings } from "../lib/types";
import { defaultModel } from "../lib/llm";

type SiteMeta = { password?: string; stripePaymentLink?: string; embedHead?: string; embedBody?: string };
type Props = {
  settings: LLMSettings & { githubToken?: string; formEndpoint?: string; analyticsDomain?: string };
  siteMeta?: SiteMeta;
  cloudOn?: boolean;
  signedIn?: boolean;
  onSave: (s: LLMSettings & { githubToken?: string; formEndpoint?: string; analyticsDomain?: string }) => void;
  onSaveSiteMeta: (m: SiteMeta) => void;
  onToggleCloud: (on: boolean) => void;
  onClose: () => void;
};

export default function SettingsModal(p: Props) {
  const [s, setS] = useState(p.settings);
  const [meta, setMeta] = useState({ password: p.siteMeta?.password ?? "", stripePaymentLink: p.siteMeta?.stripePaymentLink ?? "", embedHead: p.siteMeta?.embedHead ?? "", embedBody: p.siteMeta?.embedBody ?? "" });

  const provider = s.provider;
  const model = s.model || defaultModel(provider);

  return (
    <div className="modal-overlay" onClick={p.onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
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
            value={s.formEndpoint ?? ""}
            placeholder="https://formspree.io/f/xxx or Web3Forms access_key"
            onChange={(e) => setS({ ...s, formEndpoint: e.target.value })}
          />
          <div className="settings-note">
            Your exported contact & newsletter forms will POST here. Leave empty to keep the live in-page
            confirmation. (Formspree and Web3Forms both work out of the box.)
          </div>
        </div>
        <div className="settings-row">
          <label>Analytics domain (optional)</label>
          <input
            value={s.analyticsDomain ?? ""}
            placeholder="yourdomain.com → Plausible; or goatcounter subdomain"
            onChange={(e) => setS({ ...s, analyticsDomain: e.target.value })}
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
