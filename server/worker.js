// bukkyai publish worker — Cloudflare Worker
//
// Deploy: wrangler deploy
// Secrets: wrangler secret put GITHUB_TOKEN   (a fine-grained PAT with repo+pages scope)
//          wrangler secret put GITHUB_USER     (repo owner)
//          wrangler secret put GITHUB_REPO     (repo name, e.g. "bukkyai-sites")
//          wrangler secret put PRO_LICENSE_KEY (legacy; only used if CREEM_API_KEY is unset)
//          wrangler secret put CREEM_API_KEY        (Creem seller key, from creem.io → Developers)
//          wrangler secret put CREEM_WEBHOOK_SECRET (Creem webhook secret, Developers → Webhook)
//          wrangler secret put CREEM_PRODUCT_ID     (e.g. prod_48AX6fRL1MUIcYUivSHtKa)
//          wrangler secret put CREEM_TEST_MODE      ("1" to hit test-api.creem.io)
//
// KV binding: ENTITLEMENTS (wrangler kv namespace create ENTITLEMENTS)
//
// Endpoints:
//   POST /api/checkout    { email } → creates a Creem checkout session, returns { url }
//   POST /api/webhook     Creem payment events → grant/revoke entitlements in KV
//   POST /api/entitlement { email } → { active, at }
//   POST /publish         { files, email, license } → push static site to GitHub Pages
//
// The browser never sees GITHUB_TOKEN or CREEM_API_KEY.

async function gh(path, init, env) {
  const res = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      authorization: `token ${env.GITHUB_TOKEN}`,
      "content-type": "application/json",
      "user-agent": "bukkyai-worker",
      accept: "application/vnd.github+json",
      ...(init.headers || {}),
    },
  });
  let data = {};
  try { data = await res.json(); } catch {}
  return { ok: res.ok, status: res.status, data };
}

async function sha256Hex(secret, data) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function entKey(email) {
  return `ent:${(email || "").trim().toLowerCase()}`;
}

async function getEntitlement(env, email) {
  if (!email || !env.ENTITLEMENTS) return { active: false };
  try {
    const raw = await env.ENTITLEMENTS.get(entKey(email));
    return raw ? JSON.parse(raw) : { active: false };
  } catch {
    return { active: false };
  }
}

async function setEntitlement(env, email, active, tier) {
  if (!email || !env.ENTITLEMENTS) return;
  const prev = await getEntitlement(env, email);
  const nextTier = active ? (tier || prev.tier || "pro") : undefined;
  await env.ENTITLEMENTS.put(entKey(email), JSON.stringify({ active, at: Date.now(), ...(nextTier ? { tier: nextTier } : {}) }));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === "OPTIONS") {
      return new Response("ok", { headers: cors() });
    }

    // ── Hosted checkout page (GET, branded with the site's design) ──────────
    if (path === "/checkout" && request.method === "GET") {
      const origin = url.origin;
      return new Response(renderCheckoutPage(url.searchParams, env, origin), {
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }

    // ── Serve hosted images (GET /img/{id}) ─────────────────────────────────
    if (path.startsWith("/img/") && request.method === "GET" && env.IMAGES) {
      const id = path.slice(5).replace(/\.(png|jpg|jpeg|webp|gif)$/, "");
      const val = await env.IMAGES.get(id, "arrayBuffer");
      if (val === null) return new Response("Not found", { status: 404 });
      const meta = await env.IMAGES.getWithMetadata(id).then((r) => (r && r.metadata) || {}).catch(() => ({}));
      return new Response(val, { headers: { "content-type": meta.contentType || "image/png", "cache-control": "public, max-age=31536000, immutable" } });
    }

    if (request.method !== "POST") {
      return json({ error: "POST only" }, 405, cors());
    }
    const raw = await request.text();
    let body;
    try { body = JSON.parse(raw); } catch {
      return json({ error: "Invalid JSON" }, 400, cors());
    }

    // ── Image hosting: upload a data-URL image, serve it back at /img/{id} ──
    if (path === "/api/image" && env.IMAGES) {
      const dataUrl = String(body.dataUrl || "");
      if (!dataUrl.startsWith("data:image/")) {
        return json({ error: "Expected a data:image URL." }, 400, cors());
      }
      const m = dataUrl.match(/^data:image\/([a-z0-9.+-]+);base64,(.+)$/s);
      if (!m) return json({ error: "Unsupported image data." }, 400, cors());
      const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
      const raw = atob(m[2]);
      const bytes = Uint8Array.from(raw, (c) => c.charCodeAt(0));
      const ext = m[1].includes("png") ? "png" : m[1].includes("webp") ? "webp" : m[1].includes("jpeg") ? "jpg" : "png";
      await env.IMAGES.put(id, bytes, { metadata: { contentType: `image/${ext}`, at: Date.now() } });
      return json({ url: `${url.origin}/img/${id}.${ext}` }, 200, cors());
    }

    // ── Checkout: create a Creem session bound to the buyer's email ──────────
    if (path === "/api/checkout") {
      const email = (body.email || "").trim();
      if (!email) return json({ error: "Email is required — sign in first." }, 400, cors());
      if (!env.CREEM_API_KEY) {
        return json({ error: "Checkout is not configured on the server yet (missing CREEM_API_KEY)." }, 503, cors());
      }
      const tier = String(body.tier || "pro").toLowerCase();
      const productId = String(body.productId || "")
        || (tier === "plus" ? env.CREEM_PLUS_PRODUCT_ID : "")
        || env.CREEM_PRODUCT_ID
        || "prod_48AX6fRL1MUIcYUivSHtKa";
      const api = env.CREEM_TEST_MODE === "1" ? "https://test-api.creem.io" : "https://api.creem.io";
      const res = await fetch(`${api}/v1/checkouts`, {
        method: "POST",
        headers: {
          "x-api-key": env.CREEM_API_KEY,
          "content-type": "application/json",
          "user-agent": "bukkyai-worker",
        },
        body: JSON.stringify({
          product_id: productId,
          success_url: `${url.origin}/app?creem=success`,
          customer: { email },
          metadata: { email, app: "bukkyai", tier },
        }),
      });
      let data = {};
      try { data = await res.json(); } catch {}
      if (!res.ok) {
        return json({ error: `Creem checkout failed: ${data.error?.message || data.message || res.status}` }, 502, cors());
      }
      if (!data.checkout_url) return json({ error: "Creem returned no checkout URL." }, 502, cors());
      return json({ url: data.checkout_url }, 200, cors());
    }

    // ── Webhook: verify signature, grant / revoke entitlements ───────────────
    if (path === "/api/webhook") {
      if (!env.CREEM_WEBHOOK_SECRET) {
        return json({ error: "Webhook secret not configured." }, 503, cors());
      }
      const sig = request.headers.get("creem-signature");
      if (!sig) return json({ error: "Missing creem-signature header." }, 401, cors());
      const expected = await sha256Hex(env.CREEM_WEBHOOK_SECRET, raw);
      if (sig !== expected) return json({ error: "Invalid signature." }, 401, cors());
      let ev;
      try { ev = JSON.parse(raw); } catch {
        return json({ error: "Invalid payload." }, 400, cors());
      }
      const obj = ev.object || {};
      const email = (obj.customer?.email || obj.metadata?.email || "").trim();
      const type = ev.eventType || "";
      const productId = String(obj.product?.id || obj.product?.product_id || obj.metadata?.product_id || "");
      const tier = productId && env.CREEM_PLUS_PRODUCT_ID && productId === env.CREEM_PLUS_PRODUCT_ID
        ? "plus"
        : String(obj.metadata?.tier || "pro");
      if (email) {
        if (["checkout.completed", "subscription.active", "subscription.paid"].includes(type)) {
          await setEntitlement(env, email, true, tier);
        } else if (["subscription.canceled", "subscription.past_due", "subscription.expired", "refund.created", "dispute.created"].includes(type)) {
          await setEntitlement(env, email, false);
        }
      }
      return json({ ok: true }, 200, cors());
    }

    // ── Entitlement lookup ────────────────────────────────────────────────────
    if (path === "/api/entitlement") {
      const email = (body.email || "").trim();
      if (!email) return json({ active: false }, 200, cors());
      return json(await getEntitlement(env, email), 200, cors());
    }

    // ── Publish (legacy path stays; license check only when Creem is unset) ──
    if (path === "/publish") {
      if (env.CREEM_API_KEY) {
        const ent = await getEntitlement(env, body.email);
        if (!ent.active) {
          return json({ error: "Pro required — complete checkout to unlock publishing." }, 403, cors());
        }
      } else if (env.PRO_LICENSE_KEY && body.license !== env.PRO_LICENSE_KEY) {
        return json({ error: "Invalid or missing Pro license." }, 403, cors());
      }

      const files = Array.isArray(body.files) ? body.files : [];
      if (!files.length) return json({ error: "No files to publish." }, 400, cors());

      const owner = env.GITHUB_USER;
      const domain = String(body.domain || "").trim().toLowerCase();
      const siteId = String(body.siteId || "site").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "") || "site";
      const repo = domain
        ? `bukkyai-${siteId}`  // dedicated repo per custom-domain site (CNAME can't be shared)
        : env.GITHUB_REPO || "bukkyai-sites";
      try {
        // 1. ensure repo exists
        const existing = await gh(`/repos/${owner}/${repo}`, {}, env);
        if (!existing.ok) {
          const created = await gh(`/user/repos`, {
            method: "POST",
            body: JSON.stringify({ name: repo, private: false, auto_init: true, description: domain ? `bukkyai site — ${domain}` : "bukkyai published sites" }),
          }, env);
          if (!created.ok) return json({ error: `Repo create: ${created.data.message || created.status}` }, 502, cors());
        }

        // 2. blobs (+ CNAME for custom domain)
        const blobs = [];
        const allFiles = domain ? [...files, { path: "CNAME", content: `${domain}\n` }] : files;
        for (const f of allFiles) {
          const b = await gh(`/repos/${owner}/${repo}/git/blobs`, {
            method: "POST",
            body: JSON.stringify({ content: btoa(unescape(encodeURIComponent(String(f.content)))), encoding: "base64" }),
          }, env);
          if (!b.ok) return json({ error: `Blob ${f.path}: ${b.data.message || b.status}` }, 502, cors());
          blobs.push({ path: f.path, sha: b.data.sha });
        }

        // 3. tree
        const head = await gh(`/repos/${owner}/${repo}/git/refs/heads/main`, {}, env);
        const parents = head.ok && head.data.object && head.data.object.sha ? [head.data.object.sha] : [];
        const tree = await gh(`/repos/${owner}/${repo}/git/trees`, {
          method: "POST",
          body: JSON.stringify({ tree: blobs.map((b) => ({ path: b.path, mode: "100644", type: "blob", sha: b.sha })) }),
        }, env);
        if (!tree.ok) return json({ error: `Tree: ${tree.data.message || tree.status}` }, 502, cors());

        // 4. commit
        const commit = await gh(`/repos/${owner}/${repo}/git/commits`, {
          method: "POST",
          body: JSON.stringify({ message: `publish ${new Date().toISOString()}`, tree: tree.data.sha, parents }),
        }, env);
        if (!commit.ok) return json({ error: `Commit: ${commit.data.message || commit.status}` }, 502, cors());

        // 5. ref
        const ref = await gh(`/repos/${owner}/${repo}/git/refs/heads/main`, {
          method: "PATCH",
          body: JSON.stringify({ sha: commit.data.sha, force: true }),
        }, env);
        if (!ref.ok) {
          const createRef = await gh(`/repos/${owner}/${repo}/git/refs`, {
            method: "POST",
            body: JSON.stringify({ ref: "refs/heads/main", sha: commit.data.sha }),
          }, env);
          if (!createRef.ok) return json({ error: `Ref: ${createRef.data.message || createRef.status}` }, 502, cors());
        }

        // 6. enable pages (best-effort)
        await gh(`/repos/${owner}/${repo}/pages`, {
          method: "POST",
          body: JSON.stringify({ source: { branch: "main", path: "/" } }),
        }, env);

        return json({ url: domain ? `https://${domain}/` : `https://${owner}.github.io/${repo}/` }, 200, cors());
      } catch (err) {
        return json({ error: err.message || String(err) }, 500, cors());
      }
    }

    return json({ error: "Not found" }, 404, cors());
  },
};

// Renders a branded, hosted checkout page (GET /checkout).
function renderCheckoutPage(params, env, origin) {
  const esc = (s) => String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const siteName = esc(params.get("site") || "This site");
  const bg = esc(params.get("bg") || "#faf6ef");
  const surface = esc(params.get("surface") || "#ffffff");
  const text = esc(params.get("text") || "#1d1b16");
  const accent = esc(params.get("accent") || "#6d5ae8");
  const currency = esc(params.get("currency") || "$");
  let total = Number(params.get("total") || 0);
  if (Number.isNaN(total)) total = 0;
  const items = params.get("items");
  let rowsHtml = "";
  if (items) {
    try {
      const list = JSON.parse(items);
      rowsHtml = list.map((i) => `<div class="row"><span>${esc(i.name)} × ${esc(String(i.qty))}</span><span>${esc(currency)}${(Number(i.price) * Number(i.qty) || 0).toFixed(2)}</span></div>`).join("");
    } catch {}
  }
  const workerBase = env.CREEM_API_KEY ? `${origin}/api/checkout` : "";
  const paymentLink = esc(params.get("link") || "");
  const orderNotify = esc(params.get("orderNotify") || "");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Checkout — ${siteName}</title>
<style>
:root{--bg:${bg};--surface:${surface};--text:${text};--accent:${accent}}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;background:var(--bg);color:var(--text);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
.card{width:min(440px,100%);background:var(--surface);border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.12);padding:28px}
h1{font-size:20px;margin-bottom:4px}
.sub{color:#6b6355;font-size:13px;margin-bottom:20px}
.row{display:flex;justify-content:space-between;gap:12px;padding:9px 0;font-size:14px;border-bottom:1px solid #eee}
.total{display:flex;justify-content:space-between;font-weight:800;font-size:17px;padding:14px 0 20px}
label{display:block;font-size:12px;font-weight:700;margin:10px 0 4px;color:#555}
input{width:100%;padding:11px 12px;border:1px solid #ddd;border-radius:10px;font-size:14px}
.btn{display:block;width:100%;margin-top:18px;padding:14px;border:none;border-radius:10px;background:var(--accent);color:#fff;font-size:15px;font-weight:700;cursor:pointer}
.btn:hover{filter:brightness(1.08)}
.btn:disabled{opacity:.6;cursor:not-allowed}
.note{font-size:12px;color:#888;text-align:center;margin-top:14px;line-height:1.5}
</style>
</head>
<body>
<div class="card">
  <h1>${siteName}</h1>
  <div class="sub">Secure checkout · no account needed</div>
  ${rowsHtml}
  <div class="total"><span>Total</span><span>${esc(currency)}${total.toFixed(2)}</span></div>
  <label>Email (for your receipt)</label>
  <input id="email" type="email" placeholder="you@email.com"/>
  ${workerBase ? '<label>Name</label><input id="name" type="text" placeholder="Your name"/>' : ""}
  <button id="pay" class="btn">Pay ${esc(currency)}${total.toFixed(2)}</button>
  <div class="note" id="status"></div>
</div>
<script>
var pay = document.getElementById("pay");
var statusEl = document.getElementById("status");
var emailEl = document.getElementById("email");
var nameEl = document.getElementById("name");
var workerBase = ${JSON.stringify(workerBase)};
var orderNotify = ${JSON.stringify(orderNotify)};
var paymentLink = ${JSON.stringify(paymentLink)};
var siteName = ${JSON.stringify(siteName)};
pay.addEventListener("click", function () {
  var email = emailEl.value.trim();
  if (!/\\S+@\\S+\\.\\S+/.test(email)) { statusEl.textContent = "Enter a valid email."; return; }
  pay.disabled = true;
  statusEl.textContent = "Preparing secure checkout…";
  if (orderNotify) {
    try {
      fetch(orderNotify, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subject: "New order — " + siteName, email: email, items: ${items ? JSON.stringify(items) : "[]"}, total: ${JSON.stringify(total)} }) });
    } catch (e) {}
  }
  if (workerBase) {
    fetch(workerBase, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email }) })
      .then(function (r) { return r.json(); })
      .then(function (d) { if (d.url) { window.location.href = d.url; } else { statusEl.textContent = d.error || "Checkout unavailable."; pay.disabled = false; } })
      .catch(function () { statusEl.textContent = "Network error. Try again."; pay.disabled = false; });
  } else if (paymentLink) {
    window.location.href = paymentLink;
  } else {
    statusEl.textContent = "Payment not configured on this site yet.";
    pay.disabled = false;
  }
});
</script>
</body>
</html>`;
}

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, creem-signature",
  };
}

function json(body, status, headers) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", ...headers } });
}
