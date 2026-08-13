# bukkyai publish worker

A Cloudflare Worker that lets your site visitors publish generated sites to a
shared GitHub Pages repo — without ever exposing your GitHub token to the browser.

## Deploy

1. `cd server`
2. `npm i -g wrangler` (or use npx)
3. `npx wrangler deploy` — first run picks an account
4. Set secrets:
   - `npx wrangler secret put GITHUB_TOKEN` — a fine-grained PAT with **Contents: read/write** and **Pages: read/write** on the target repo
   - `npx wrangler secret put GITHUB_USER` — repo owner
   - `npx wrangler secret put GITHUB_REPO` — repo name (e.g. `bukkyai-sites`)
   - `npx wrangler secret put PRO_LICENSE_KEY` — optional; if set, the app must send the matching license or publishing is refused

## Wire into the app

In the app `.env`:

```
VITE_PUBLISH_ENDPOINT=https://<your-worker>.workers.dev/publish
```

## Security

- The GitHub token lives only as a Worker secret. The browser never sees it.
- The optional `PRO_LICENSE_KEY` secret is the real revenue gate: only paid users get the license value, and the worker refuses to publish without it. (For a hard gate, add webhook verification from Creem on purchase.)
