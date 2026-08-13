import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readdirSync } from "fs";
import { join } from "path";
import { previewsPlugin } from "./scripts/previews-plugin";

const progDir = join(process.cwd(), "programmatic");
let progInputs = {};
try {
  for (const f of readdirSync(progDir).filter((f) => f.endsWith(".html"))) {
    progInputs[`prog-${f.replace(/\.html$/, "").replace(/[^a-z0-9]/g, "-")}`] = join(progDir, f);
  }
} catch {
  // programmatic dir may not exist yet on first run
}

export default defineConfig({
  plugins: [react(), previewsPlugin()],
  build: {
    rollupOptions: {
      input: {
        app: "app.html",
        index: "index.html",
        landing: "landing.html",
        pricing: "pricing.html",
        features: "features.html",
        templates: "templates.html",
        faq: "faq.html",
        contact: "contact.html",
        tools: "tools.html",
        madeWith: "made-with.html",
        playground: "playground.html",
        blog: "blog.html",
        blogBrief: "blog/how-to-write-a-website-brief.html",
        blogDesign: "blog/why-good-design-system-beats-template.html",
        blogHomepage: "blog/writing-homepage-that-sells.html",
        blogCost: "blog/how-much-does-website-cost.html",
        blogRestaurant: "blog/best-website-builder-for-restaurants.html",
        referral: "referral.html",
        badge: "badge.html",
        designSystem: "design-system.html",
        ...progInputs,
      },
    },
  },
});
