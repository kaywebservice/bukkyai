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

async function setEntitlement(env, email, active) {
  if (!email || !env.ENTITLEMENTS) return;
  await env.ENTITLEMENTS.put(entKey(email), JSON.stringify({ active, at: Date.now() }));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === "OPTIONS") {
      return new Response("ok", { headers: cors() });
    }
    if (request.method !== "POST") {
      return json({ error: "POST only" }, 405, cors());
    }
    const raw = await request.text();
    let body;
    try { body = JSON.parse(raw); } catch {
      return json({ error: "Invalid JSON" }, 400, cors());
    }

    // ── Checkout: create a Creem session bound to the buyer's email ──────────
    if (path === "/api/checkout") {
      const email = (body.email || "").trim();
      if (!email) return json({ error: "Email is required — sign in first." }, 400, cors());
      if (!env.CREEM_API_KEY) {
        return json({ error: "Checkout is not configured on the server yet (missing CREEM_API_KEY)." }, 503, cors());
      }
      const api = env.CREEM_TEST_MODE === "1" ? "https://test-api.creem.io" : "https://api.creem.io";
      const res = await fetch(`${api}/v1/checkouts`, {
        method: "POST",
        headers: {
          "x-api-key": env.CREEM_API_KEY,
          "content-type": "application/json",
          "user-agent": "bukkyai-worker",
        },
        body: JSON.stringify({
          product_id: env.CREEM_PRODUCT_ID || "prod_48AX6fRL1MUIcYUivSHtKa",
          success_url: `${url.origin}/app?creem=success`,
          customer: { email },
          metadata: { email, app: "bukkyai" },
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
      if (email) {
        if (["checkout.completed", "subscription.active", "subscription.paid"].includes(type)) {
          await setEntitlement(env, email, true);
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
      const repo = env.GITHUB_REPO || "bukkyai-sites";
      try {
        // 1. ensure repo exists
        const existing = await gh(`/repos/${owner}/${repo}`, {}, env);
        if (!existing.ok) {
          const created = await gh(`/user/repos`, {
            method: "POST",
            body: JSON.stringify({ name: repo, private: false, auto_init: true, description: "bukkyai published sites" }),
          }, env);
          if (!created.ok) return json({ error: `Repo create: ${created.data.message || created.status}` }, 502, cors());
        }

        // 2. blobs
        const blobs = [];
        for (const f of files) {
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

        return json({ url: `https://${owner}.github.io/${repo}/` }, 200, cors());
      } catch (err) {
        return json({ error: err.message || String(err) }, 500, cors());
      }
    }

    return json({ error: "Not found" }, 404, cors());
  },
};

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
