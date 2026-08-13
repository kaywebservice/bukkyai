import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

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
      },
    },
  },
});
