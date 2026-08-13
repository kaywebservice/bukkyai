// Vite plugin: renders the 6 full templates into public/previews/{slug}/ at build
// time. Each preview is a self-contained multi-page static site, so the playground
// iframes and shareable demo URLs work with zero signup.
import type { Plugin } from "vite";
import { writeFileSync, rmSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { FULL_TEMPLATES } from "../src/lib/templatesFull";
import { renderStaticSite } from "../src/lib/render";

let generated = false;

export function previewsPlugin(): Plugin {
  const outDir = join(process.cwd(), "public", "previews");
  return {
    name: "bukkyai-previews",
    apply: "build",
    buildStart() {
      if (generated) return;
      generated = true;
      if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
      mkdirSync(outDir, { recursive: true });
      const index: { slug: string; name: string; tagline: string; category: string }[] = [];
      for (const t of FULL_TEMPLATES) {
        const slug = t.id.replace("tpl-", "");
        const dir = join(outDir, slug);
        mkdirSync(dir, { recursive: true });
        const files = renderStaticSite(t.build()).files;
        for (const f of files) {
          const path = join(dir, f.path);
          mkdirSync(join(dir, f.path.split("/").slice(0, -1).join("/")), { recursive: true });
          writeFileSync(path, f.content);
        }
        writeFileSync(
          join(outDir, `${slug}.json`),
          JSON.stringify(
            { slug, name: t.name, tagline: t.tagline, category: t.category, fileCount: files.length },
            null,
            2,
          ),
        );
        index.push({ slug, name: t.name, tagline: t.tagline, category: t.category });
        console.log(`preview: ${slug} (${files.length} files)`);
      }
      writeFileSync(join(outDir, "index.json"), JSON.stringify(index, null, 2));
    },
  };
}
