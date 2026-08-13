// SEO report: reads public/sitemap.xml, checks every URL for HTTP status, and
// reports issues (404s, redirects, title/meta presence from static pages where
// possible). Run after deploy:
//   node scripts/seo-report.mjs [--limit 50] [--live]
//
// Without --live it validates the sitemap file + reports URL counts.
// With --live it does real HTTP checks against bukkyai.duckdns.org.
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://bukkyai.duckdns.org";

const args = process.argv.slice(2);
const live = args.includes("--live");
const limitArg = args.find((a) => a.startsWith("--limit="));
const limit = limitArg ? Number(limitArg.split("=")[1]) || 50 : 0;

let xml;
try {
  xml = readFileSync(join(root, "public", "sitemap.xml"), "utf8");
} catch {
  console.log("no public/sitemap.xml — run node scripts/gen-pages.mjs && node scripts/gen-seo.mjs first");
  process.exit(1);
}

const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
console.log(`sitemap: ${urls.length} URLs\n`);

const dups = urls.filter((u, i) => urls.indexOf(u) !== i);
if (dups.length) console.log(`⚠ duplicate URLs: ${dups.length}`);
else console.log("duplicate URLs: 0");

if (!live) {
  console.log("\nrun with --live to check HTTP status of every URL");
  process.exit(0);
}

const targets = limit ? urls.slice(0, limit) : urls;
let ok = 0, bad = [], redirected = [];
const concurrency = 12;
const queue = [...targets];
const workers = Array.from({ length: concurrency }, async () => {
  while (queue.length) {
    const u = queue.shift();
    try {
      const res = await fetch(u, { method: "HEAD", redirect: "manual", headers: { "user-agent": "bukkyai-seo-report" } });
      if (res.status >= 200 && res.status < 400) ok++;
      else if (res.status >= 400) bad.push([u, res.status]);
      else redirected.push([u, res.status]);
    } catch (err) {
      bad.push([u, err.message || String(err)]);
    }
  }
});
await Promise.all(workers);

console.log(`checked: ${targets.length} · ok: ${ok} · errors: ${bad.length} · redirects: ${redirected.length}`);
if (bad.length) {
  console.log("\nERRORS:");
  bad.slice(0, 40).forEach(([u, s]) => console.log(`  ${s} ${u}`));
  if (bad.length > 40) console.log(`  … and ${bad.length - 40} more`);
}
if (redirected.length) {
  console.log("\nREDIRECTS (should be 301 to a final page):");
  redirected.slice(0, 10).forEach(([u, s]) => console.log(`  ${s} ${u}`));
}
process.exit(bad.length ? 1 : 0);
