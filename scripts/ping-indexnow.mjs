// Pings IndexNow (Bing/Yandex/Seznam) so newly published URLs get indexed in
// minutes instead of days. Reads the key from public/indexnow-key.txt.
//
// Usage: node scripts/ping-indexnow.mjs [url1 url2 ...]
//   - no args: pings the sitemap (recrawl everything)
//   - with URLs: pings just those URLs
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const keyPath = join(root, "public", "indexnow-key.txt");
const SITE = "https://bukkyai.duckdns.org";

let key;
try {
  key = readFileSync(keyPath, "utf8").trim();
} catch {
  console.log("no indexnow key at public/indexnow-key.txt — skipping ping");
  process.exit(0);
}

const args = process.argv.slice(2);
const urls = args.length
  ? args.map((u) => (u.startsWith("http") ? u : `${SITE}${u}`))
  : [`${SITE}/sitemap.xml`];

const payload = { host: "bukkyai.duckdns.org", key, urlList: urls };

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify(payload),
});

console.log(`IndexNow ping ${res.ok ? "OK" : "FAILED"} (${res.status}) for ${urls.length} URL(s)`);
process.exit(res.ok ? 0 : 1);
