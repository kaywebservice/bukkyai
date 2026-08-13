// bukkyai publish worker — Cloudflare Worker
//
// Deploy: wrangler deploy
// Secrets: wrangler secret put GITHUB_TOKEN   (a fine-grained PAT with repo+pages scope)
//          wrangler secret put GITHUB_USER     (repo owner)
//          wrangler secret put GITHUB_REPO     (repo name, e.g. "bukkyai-sites")
//          wrangler secret put PRO_LICENSE_KEY (optional; if set, requests must include it)
//
// The app POSTs { files: [{path, content}], license } here. The worker pushes the
// static site to GitHub Pages and returns { url }. This keeps ALL secrets server-side.
// The browser never sees GITHUB_TOKEN.

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

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response("ok", { headers: cors() });
    }
    if (request.method !== "POST") {
      return json({ error: "POST only" }, 405, cors());
    }
    let body;
    try { body = await request.json(); } catch {
      return json({ error: "Invalid JSON" }, 400, cors());
    }

    // Optional license check
    if (env.PRO_LICENSE_KEY && body.license !== env.PRO_LICENSE_KEY) {
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
  },
};

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
  };
}

function json(body, status, headers) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", ...headers } });
}
