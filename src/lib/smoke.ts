import { sampleProject } from "./blueprint";
import { renderPage, renderStaticSite, renderMaintenance, renderProductPage, renderPostPage } from "./render";
import { renderCss } from "./renderCss";
import { singleFileHtml, multiPageHtml } from "./export";
import { contrastRatio } from "./color";
import { FULL_TEMPLATES } from "./templatesFull";
import { readFileSync, readdirSync } from "node:fs";
import { GENERATED_THEMES } from "./themeEngine";
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

  const seoDoc = JSON.parse(JSON.stringify(doc)) as typeof doc;
  seoDoc.posts = [{ id: "p1", slug: "hello-world", title: "Hello world", excerpt: "First post", content: "<p>Body</p>", date: "2026-01-01T00:00:00.000Z", author: "Ada" }];
  seoDoc.languages = { default: "en", supported: ["en", "es"] };
  seoDoc.cookieConsent = { enabled: true, text: "We use cookies.", policyUrl: "/privacy" };
  seoDoc.redirects = [{ from: "/old", to: "/new" }];
  seoDoc.theme = { toggle: true, defaultMode: "auto" };
  seoDoc.meta.siteUrl = "https://mysite.example";
  seoDoc.nav = { ...seoDoc.nav, sticky: true };
  seoDoc.announcement = { text: "Summer sale!", href: "/shop" };
  seoDoc.popup = { enabled: true, title: "Join us", text: "Newsletter", buttonLabel: "Go", delaySec: 5 };
  seoDoc.customFonts = [{ name: "MyFont", url: "https://x/f.woff2", weight: "600" }];
  const seoHtml = renderPage(seoDoc, seoDoc.pages[0], false);
  const seoFiles = renderStaticSite(seoDoc).files;
  const seoCss = renderCss(seoDoc);

  const embedDoc = JSON.parse(JSON.stringify(doc)) as typeof doc;
  embedDoc.pages[0].sections.push({
    id: "emb",
    type: "embed",
    content: { heading: "Podcast", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", provider: "youtube" },
  });
  const embedHtml = renderPage(embedDoc, embedDoc.pages[0], false);

  const shopDoc2 = JSON.parse(JSON.stringify(doc)) as typeof doc;
  shopDoc2.pages[0].sections.push({
    id: "pg_shop2",
    type: "products",
    content: { heading: "Shop", currency: "€", items: [{ id: "a", name: "Coffee", price: 9, description: "", stock: 3 }, { id: "b", name: "Tea", price: 5, description: "", stock: 0 }] },
  });
  shopDoc2.coupons = [{ code: "SAVE10", percentOff: 10 }];
  shopDoc2.orderNotify = "https://formspree.io/f/order";
  shopDoc2.forms = { endpoint: "https://formspree.io/f/abcd1234", emailService: { provider: "mailchimp", endpoint: "https://x/list", apiKey: "k", listId: "L" } };
  const shop2Html = renderPage(shopDoc2, shopDoc2.pages[0], false);
  const blogDoc = JSON.parse(JSON.stringify(doc)) as typeof doc;
  blogDoc.posts = [
    { id: "p1", slug: "one", title: "One", excerpt: "", content: "", date: "2026-01-01", category: "News" },
    { id: "p2", slug: "two", title: "Two", excerpt: "", content: "", date: "2026-01-02", category: "Guides" },
  ];
  blogDoc.pages[0].sections.push({ id: "pg_blog", type: "posts", content: { heading: "Blog" } });
  blogDoc.pages[0].password = "secret123";
  const blogHtml = renderPage(blogDoc, blogDoc.pages[0], false);
  const blogHtmlEdit = renderPage(blogDoc, blogDoc.pages[0], true);
  const blogFiles = renderStaticSite(blogDoc).files;

  const sliderDoc = JSON.parse(JSON.stringify(doc)) as typeof doc;
  sliderDoc.pages[0].sections.push({
    id: "slider",
    type: "heroSlider",
    content: { slides: [{ title: "One", subtitle: "", cta: { label: "Go", href: "#" }, image: { url: "", alt: "" } }], autoplay: true, intervalSec: 5 },
  });

  const maintenanceDoc = JSON.parse(JSON.stringify(doc)) as typeof doc;
  maintenanceDoc.maintenance = { enabled: true, title: "Back soon", text: "Rebuilding.", email: "x@y.com" };
  const maintenanceHtml = renderMaintenance(maintenanceDoc);
  const maintenanceFiles = renderStaticSite(maintenanceDoc).files;

  const templatesOk = FULL_TEMPLATES.every((t) => {
    try {
      const tpl = t.build();
      if (tpl.pages.length < 4) return false;
      return tpl.pages.every((pg) => {
        const h = renderPage(tpl, pg, false);
        return h.includes("<!doctype html>") && h.includes("<main");
      });
    } catch {
      return false;
    }
  });
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
    ["Static export has sitemap+robots", seoFiles.some((f) => f.path === "sitemap.xml") && seoFiles.some((f) => f.path === "robots.txt")],
    ["RSS feed generated for posts", seoFiles.some((f) => f.path === "feed.xml" && f.content.includes("<rss") && f.content.includes("Hello world"))],
    ["Sitemap includes post URLs", seoFiles.find((f) => f.path === "sitemap.xml")?.content.includes("/post/hello-world.html") ?? false],
    ["Custom 404 page emitted", seoFiles.some((f) => f.path === "404.html" && f.content.includes("404"))],
    ["Redirects emitted", seoFiles.some((f) => f.path === "_redirects" && f.content.includes("/old /new 301"))],
    ["Cookie banner rendered", seoHtml.includes('id="bk-cookie"') && seoHtml.includes("We use cookies.")],
    ["Search overlay rendered", seoHtml.includes('id="bk-search-overlay"')],
    ["Hreflang alternates present", seoHtml.includes('hreflang="es"')],
    ["Theme toggle rendered", seoHtml.includes('id="bk-theme-toggle"')],
    ["Dark-mode CSS emitted", renderCss(seoDoc).includes('html[data-theme="dark"]')],
    ["Embed section renders YouTube iframe", embedHtml.includes('youtube.com/embed/dQw4w9WgXcQ')],
    ["Canonical uses site URL", seoHtml.includes('rel="canonical" href="https://mysite.example/')],
    ["Sitemap uses site URL", seoFiles.find((f) => f.path === "sitemap.xml")?.content.includes("https://mysite.example") ?? false],
    ["RSS uses site URL", seoFiles.find((f) => f.path === "feed.xml")?.content.includes("https://mysite.example") ?? false],
    ["Sticky nav rendered", seoHtml.includes("bk-nav-sticky")],
    ["Announcement bar rendered", seoHtml.includes("Summer sale!")],
    ["Popup markup rendered", seoHtml.includes('id="bk-popup"')],
    ["Custom font-face emitted", seoCss.includes("@font-face") && seoCss.includes("MyFont")],
    ["Coupon codes render in cart", shop2Html.includes('id="bk-coupon-input"')],
    ["Order notify flows into config", shop2Html.includes('"orderNotify":"https://formspree.io/f/order"')],
    ["Stock badge renders", shop2Html.includes("Only 3 left") && shop2Html.includes("Sold out")],
    ["Disabled add-to-cart for out-of-stock", shop2Html.includes("data-stock=\"0\" disabled")],
    ["Blog category chips render", blogHtml.includes("bk-chip") && blogHtml.includes("Guides")],
    ["Comment form in post modal", blogHtml.includes("bk-comment-form")],
    ["Per-page password gate renders", blogHtml.includes("data-page-password=\"secret123\"")],
    ["Password gate hidden in edit mode", !blogHtmlEdit.includes("data-page-password=\"secret123\"")],
    ["Category archive pages generated", blogFiles.some((f) => f.path === "blog/news.html" && f.content.includes("News")) && blogFiles.some((f) => f.path === "blog/guides.html")],
    ["Full templates build and render (6, multi-page)", templatesOk],
    ["Maintenance mode renders coming-soon page", maintenanceHtml.includes("Back soon") && maintenanceHtml.includes("x@y.com")],
    ["Maintenance mode publishes single index.html", maintenanceFiles.length === 1 && maintenanceFiles[0].path === "index.html"],
    ["Multi-page browser preview embeds all pages", multiPageHtml(doc).includes("bk-pages") && multiPageHtml(doc).includes("var pages =")],
    ["Marketing sitemap exists with programmatic URLs", (() => {
      try {
        const s = readFileSync("public/sitemap.xml", "utf8");
        return s.includes("/compare/wix") && s.includes("/templates/bakery") && s.includes("/industries/real-estate") && s.includes("/local/austin/bakery");
      } catch { return false; }
    })()],
    ["Programmatic pages generated (100+)", (() => {
      try {
        const n = readdirSync("programmatic").filter((f: string) => f.endsWith(".html")).length;
        return n >= 100;
      } catch { return false; }
    })()],
    ["Backlink in published footer", (() => {
      const bk = JSON.parse(JSON.stringify(doc)) as typeof doc;
      const foot = bk.pages[0].sections.find((s) => s.type === "footer");
      if (foot && "note" in (foot.content as object)) (foot.content as { note?: string }).note = "Designed by Kaywebservice Enterprise Solutions.";
      return renderPage(bk, bk.pages[0], false).includes("https://bukkyai.duckdns.org/");
    })()],
    ["Theme generator produces 100+ themes", GENERATED_THEMES.length >= 100],
    ["Theme generator has multiple categories", (() => {
      const cats = new Set(GENERATED_THEMES.map((t) => t.category));
      return cats.size >= 5;
    })()],
    ["Themes are valid design systems", GENERATED_THEMES.every((t) => t.system.tokens.colors.background && t.system.tokens.fonts.heading && t.system.tokens.radius.md > 0)],
    ["Hero slider renders slides + controls", renderPage(sliderDoc, sliderDoc.pages[0], false).includes("bk-slider-viewport") && renderPage(sliderDoc, sliderDoc.pages[0], false).includes("bk-slide-dot")],
    ["Product detail pages generated", renderStaticSite(shopDoc2).files.some((f) => f.path.startsWith("product/") && f.content.includes("Add to cart"))],
    ["Post detail pages generated", renderStaticSite(blogDoc).files.some((f) => f.path === "post/one.html" && f.content.includes("Keep reading"))],
    ["Breadcrumbs on non-home pages", (() => {
      const bd = JSON.parse(JSON.stringify(doc)) as typeof doc;
      bd.pages[0].slug = "about";
      return renderPage(bd, bd.pages[0], false).includes("bk-breadcrumbs");
    })()],
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