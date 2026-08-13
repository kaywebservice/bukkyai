import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readdirSync } from "fs";
import { join } from "path";

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
  plugins: [react()],
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
        ...progInputs,
      },
    },
  },
});
