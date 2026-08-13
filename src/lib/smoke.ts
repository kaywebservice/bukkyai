import { sampleProject } from "./blueprint";
import { renderPage, renderStaticSite } from "./render";
import { renderCss } from "./renderCss";
import { singleFileHtml } from "./export";
import { contrastRatio } from "./color";

export type SmokeResult = { results: [string, boolean][]; pass: number; total: number };

export function runSmoke(): SmokeResult {
  const doc = sampleProject();
  const page = doc.pages[0];

  const html = renderPage(doc, page, false);
  const htmlEdit = renderPage(doc, page, true);
  const css = renderCss(doc);

  const shopDoc = JSON.parse(JSON.stringify(doc)) as typeof doc;
  shopDoc.pages[0].sections.push({ id: "pg_shop", type: "products", content: { heading: "Shop", currency: "€", items: [] } });
  const shopHtml = renderPage(shopDoc, shopDoc.pages[0], false);

  const formsDoc = JSON.parse(JSON.stringify(doc)) as typeof doc;
  formsDoc.forms = { endpoint: "https://formspree.io/f/abcd1234" };
  formsDoc.analytics = { plausible: "example.com" };
  const formsHtml = renderPage(formsDoc, formsDoc.pages[0], false);

  const results: [string, boolean][] = [
    ["HTML starts with doctype", html.trimStart().startsWith("<!doctype html>")],
    ["Page title present", html.includes("<title>")],
    ["JSON-LD present", html.includes("schema.org")],
    ["All sample sections render", ["hero", "logos", "features", "stats", "testimonials", "pricing", "faq", "cta", "contact", "footer"].every((t) => html.includes(`data-type="${t}"`))],
    ["data-field attrs present (inline editing)", html.includes("data-field=")],
    ["data-page/secidx present", html.includes("data-page=")],
    ["Editing mode adds bk-editing class", htmlEdit.includes('class="bk-editing"')],
    ["No unescaped user content", !html.includes("<Fraunces")],
    ["CSS custom properties present", css.includes("--accent:")],
    ["Responsive media query present", css.includes("@media (max-width:860px)")],
    ["Footer copyright rendered", html.includes("Roasted with intent")],
    ["Nav links rendered", html.includes("#features")],
    ["Cart drawer rendered for shop pages", shopHtml.includes('id="bk-cart-drawer"')],
    ["Checkout button rendered", shopHtml.includes('id="bk-cart-checkout"')],
    ["Currency flows from products section", shopHtml.includes('"currency":"€"')],
    ["Form endpoint flows into page config", formsHtml.includes('"formEndpoint":"https://formspree.io/f/abcd1234"')],
    ["Analytics domain flows into head", formsHtml.includes('src="https://plausible.io/js/script.js"')],
    ["Single-file export works", singleFileHtml(doc).includes("<!doctype html>")],
    ["Static export has sitemap+robots", renderStaticSite(doc).files.some((f) => f.path === "sitemap.xml") && renderStaticSite(doc).files.some((f) => f.path === "robots.txt")],
    ["Contrast math sane", contrastRatio("#241a12", "#f7f2ea") > 7],
  ];

  const pass = results.filter(([, ok]) => ok).length;
  return { results, pass, total: results.length };
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, "/")}`) {
  const res = runSmoke();
  let pass = 0;
  for (const [name, ok] of res.results) {
    console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
    if (ok) pass++;
  }
  console.log(`\n${pass}/${res.total} checks passed`);
  if (pass !== res.total) throw new Error("Smoke test failed");
}