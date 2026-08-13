# bukkyai publish worker

A Cloudflare Worker that lets your site visitors publish generated sites to a
shared GitHub Pages repo — without ever exposing your GitHub token to the browser.
It also runs Pro checkout + entitlements (Creem, KV-backed), hosts images, and
serves a branded checkout page.

## Deploy

1. `cd server`
2. `npm i -g wrangler` (or use npx)
3. `npx wrangler kv namespace create ENTITLEMENTS` and `npx wrangler kv namespace create IMAGES` → paste ids into `wrangler.toml`
4. `npx wrangler deploy` — first run picks an account
5. Set secrets:
   - `npx wrangler secret put GITHUB_TOKEN` — a fine-grained PAT with **Contents: read/write** and **Pages: read/write** on the target repo
   - `npx wrangler secret put GITHUB_USER` — repo owner
   - `npx wrangler secret put GITHUB_REPO` — repo name (e.g. `bukkyai-sites`)
   - `npx wrangler secret put PRO_LICENSE_KEY` — optional; if set, the app must send the matching license or publishing is refused
   - `npx wrangler secret put CREEM_API_KEY` / `CREEM_WEBHOOK_SECRET` — real Pro gate (see server docs)

## Endpoints

- `POST /api/checkout` `{ email }` → `{ url }` (Creem checkout session)
- `POST /api/webhook` — Creem signed events → grant/revoke in KV
- `POST /api/entitlement` `{ email }` → `{ active }`
- `POST /api/image` `{ dataUrl }` → `{ url }` (hosts an image in the `IMAGES` KV namespace)
- `GET /img/{id}.{ext}` — serves hosted images (long cache)
- `GET /checkout?site=&total=&currency=&items=&bg=&surface=&text=&accent=` — branded, hosted checkout page
- `POST /publish` `{ files, email, license, domain?, siteId? }` → `{ url }` (GitHub Pages; with `domain` it makes a dedicated repo + CNAME)

## Wire into the app

In the app `.env`:

```
VITE_PUBLISH_ENDPOINT=https://<your-worker>.workers.dev/publish
```

The checkout page URL is derived from `VITE_PUBLISH_ENDPOINT` automatically (or set `VITE_CHECKOUT_PAGE`).

## Security

- The GitHub token and Creem seller key live only as Worker secrets. The browser never sees them.
- Publishing is gated server-side on the buyer's email entitlement stored in KV.
- Image uploads are public-by-design (anyone can POST a data URL); only signed-in app users normally reach it.
