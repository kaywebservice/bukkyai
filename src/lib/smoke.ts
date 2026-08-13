import { sampleProject } from "./blueprint";
import { renderPage, renderStaticSite } from "./render";
import { renderCss } from "./renderCss";
import { singleFileHtml } from "./export";
import { contrastRatio } from "./color";

const doc = sampleProject();
const page = doc.pages[0];

const html = renderPage(doc, page, false);
const htmlEdit = renderPage(doc, page, true);
const css = renderCss(doc);

const checks: [string, boolean][] = [
  ["HTML starts with doctype", html.trimStart().startsWith("<!doctype html>")],
  ["Page title present", html.includes("<title>")],
  ["JSON-LD present", html.includes("schema.org")],
  ["All 10 sample sections render", ["hero", "logos", "features", "stats", "testimonials", "team", "pricing", "faq", "cta", "contact", "gallery", "footer"].every((t) => html.includes(`data-type="${t}"`))],
  ["data-field attrs present (inline editing)", html.includes("data-field=")],
  ["data-page/secidx present", html.includes("data-page=")],
  ["Editing mode adds bk-editing class", htmlEdit.includes('class="bk-editing"')],
  ["No unescaped user content", !html.includes("<Fraunces")],
  ["CSS custom properties present", css.includes("--accent:")],
  ["Responsive media query present", css.includes("@media (max-width:860px)")],
  ["Footer copyright rendered", html.includes("Roasted with intent")],
  ["Nav links rendered", html.includes("#features")],
  ["Single-file export works", singleFileHtml(doc).includes("<!doctype html>")],
  ["Static export has sitemap+robots", renderStaticSite(doc).files.some((f) => f.path === "sitemap.xml") && renderStaticSite(doc).files.some((f) => f.path === "robots.txt")],
  ["Contrast math sane", contrastRatio("#241a12", "#f7f2ea") > 7],
];

let pass = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
  if (ok) pass++;
}
console.log(`\n${pass}/${checks.length} checks passed`);
if (pass !== checks.length) throw new Error("Smoke test failed");