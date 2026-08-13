import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
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
