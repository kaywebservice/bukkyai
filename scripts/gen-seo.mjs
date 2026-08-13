// Generates public/sitemap.xml from the canonical page list.
// Run BEFORE vite build (npm run build already does this).
import { writeFileSync, mkdirSync, readdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://bukkyai.duckdns.org";

// Static marketing pages + their priorities.
const staticPages = [
  ["/", 1.0, "daily"],
  ["/features", 0.9, "weekly"],
  ["/templates", 0.9, "weekly"],
  ["/tools", 0.8, "weekly"],
  ["/design-system", 0.7, "monthly"],
  ["/made-with", 0.8, "weekly"],
  ["/playground", 0.8, "weekly"],
  ["/pricing", 0.9, "weekly"],
  ["/faq", 0.6, "monthly"],
  ["/contact", 0.5, "monthly"],
  ["/blog", 0.7, "weekly"],
  ["/blog/how-to-write-a-website-brief", 0.6, "monthly"],
  ["/blog/why-good-design-system-beats-template", 0.6, "monthly"],
  ["/blog/writing-homepage-that-sells", 0.6, "monthly"],
  ["/blog/how-much-does-website-cost", 0.6, "monthly"],
  ["/blog/best-website-builder-for-restaurants", 0.6, "monthly"],
  ["/badge", 0.5, "monthly"],
];

// Programmatic pages live in programmatic/*.html — collect them.
// Map file names (templates-bakery.html) to pretty routes (/templates/bakery).
const progDir = join(root, "programmatic");
let progPages = [];
try {
  progPages = readdirSync(progDir)
    .filter((f) => f.endsWith(".html"))
    .map((f) => {
      const base = f.replace(/\.html$/, "");
      const idx = base.indexOf("-");
      const cat = idx >= 0 ? base.slice(0, idx) : base;
      const rest = idx >= 0 ? base.slice(idx + 1) : "";
      const route = cat === "templates" ? `/templates/${rest}`
        : cat === "industries" ? (rest === "index" ? "/industries" : `/industries/${rest}`)
        : cat === "use" ? (rest === "index" ? "/use-cases" : `/use-cases/${rest}`)
        : cat === "compare" ? (rest ? `/compare/${rest}` : "/compare")
        : cat === "how" ? (rest === "index" ? "/how-to" : `/how-to/${rest}`)
        : cat === "local" ? `/local/${rest.replace(/-/, "/")}`   // rest = {city}-{industry}
        : `/${base}`;
      return route;
    })
    .sort();
} catch {
  // programmatic dir may not exist yet
}

const urls = [];
for (const [path, prio, freq] of staticPages) {
  urls.push(`  <url><loc>${SITE}${path}</loc><changefreq>${freq}</changefreq><priority>${prio}</priority></url>`);
}
for (const path of progPages) {
  const prio = path.startsWith("/local/") ? 0.5 : 0.7;
  urls.push(`  <url><loc>${SITE}${path}</loc><changefreq>monthly</changefreq><priority>${prio}</priority></url>`);
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;

mkdirSync(join(root, "public"), { recursive: true });
writeFileSync(join(root, "public", "sitemap.xml"), xml);
console.log(`sitemap.xml written with ${staticPages.length + progPages.length} URLs`);
