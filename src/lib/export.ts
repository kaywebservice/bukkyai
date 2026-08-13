import type { SiteBlueprint } from "./types";
import { renderPage, renderStaticSite } from "./render";
import { renderCss } from "./renderCss";
import { googleFontsLink } from "./fontPairs";
import JSZip from "jszip";
import renderTs from "./render?raw";
import renderCssTs from "./renderCss?raw";
import iconsTs from "./icons?raw";
import fontPairsTs from "./fontPairs?raw";
import colorTs from "./color?raw";
import typesTs from "./types?raw";

export function singleFileHtml(doc: SiteBlueprint): string {
  const page = doc.pages[0];
  if (!page) return "<!doctype html><html><body></body></html>";
  const html = renderPage(doc, page, false);
  const css = renderCss(doc);
  const fontLink = `<link href="${googleFontsLink(
    doc.design.tokens.fonts.heading,
    doc.design.tokens.fonts.body
  )}" rel="stylesheet"/>`;
  const inlined = html
    .replace(/<style>[\s\S]*?<\/style>/, `<style>${css}</style>`)
    .replace(/<link rel="preconnect"[^>]*\/>/g, "")
    .replace(/<link href="https:\/\/fonts[^>]*\/>/, fontLink);
  return inlined;
}

export async function downloadStaticZip(doc: SiteBlueprint): Promise<void> {
  const { files } = renderStaticSite(doc);
  const zip = new JSZip();
  for (const f of files) zip.file(f.path, f.content);
  zip.file("README.md", readmeMd());
  zip.file("site.json", JSON.stringify(doc, null, 2));
  const blob = await zip.generateAsync({ type: "blob" });
  triggerDownload(blob, "bukkyai-site.zip");
}

export function downloadBlueprintJson(doc: SiteBlueprint): void {
  const blob = new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" });
  triggerDownload(blob, "bukkyai-blueprint.json");
}

export function downloadSingleFile(doc: SiteBlueprint): void {
  const blob = new Blob([singleFileHtml(doc)], { type: "text/html" });
  triggerDownload(blob, "index.html");
}

export async function downloadCmsExport(doc: SiteBlueprint): Promise<void> {
  const zip = new JSZip();
  for (const page of doc.pages) {
    const slug = page.slug || "home";
    zip.file(
      `content/${slug}.md`,
      `# ${page.title}\n\n${page.description}\n\n${page.sections
        .map((s) => `## ${s.type}\n\n\`\`\`json\n${JSON.stringify(s.content, null, 2)}\n\`\`\``)
        .join("\n\n")}\n`
    );
  }
  zip.file(
    "cms-README.md",
    `# Migrating from bukkyai\n\nEach page is exported as Markdown with the section content in JSON blocks.\nYou can import these into WordPress, Webflow, or any CMS that accepts Markdown.\nThe site itself is also included as static HTML in the main export.`
  );
  const blob = await zip.generateAsync({ type: "blob" });
  triggerDownload(blob, "bukkyai-cms-export.zip");
}

const REACT_TEMPLATE: Record<string, string> = {
  "package.json": JSON.stringify(
    {
      name: "bukkyai-site",
      private: true,
      version: "1.0.0",
      type: "module",
      scripts: { dev: "vite", build: "tsc && vite build", preview: "vite preview" },
      dependencies: { react: "^18.3.1", "react-dom": "^18.3.1" },
      devDependencies: {
        "@types/react": "^18.3.12",
        "@types/react-dom": "^18.3.1",
        "@vitejs/plugin-react": "^4.3.4",
        typescript: "^5.6.3",
        vite: "^5.4.11",
      },
    },
    null,
    2
  ),
  "vite.config.ts": `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({ plugins: [react()] });
`,
  "tsconfig.json": JSON.stringify(
    {
      compilerOptions: {
        target: "ES2022",
        lib: ["ES2022", "DOM", "DOM.Iterable"],
        module: "ESNext",
        skipLibCheck: true,
        moduleResolution: "bundler",
        allowImportingTsExtensions: true,
        isolatedModules: true,
        moduleDetection: "force",
        noEmit: true,
        jsx: "react-jsx",
        strict: true,
      },
      include: ["src"],
    },
    null,
    2
  ),
  "index.html": `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Bukkyai site</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
};

export async function downloadReactProject(doc: SiteBlueprint): Promise<void> {
  const zip = new JSZip();
  for (const [path, content] of Object.entries(REACT_TEMPLATE)) zip.file(path, content);
  const libFiles: [string, string][] = [
    ["src/lib/types.ts", typesTs],
    ["src/lib/icons.ts", iconsTs],
    ["src/lib/fontPairs.ts", fontPairsTs],
    ["src/lib/color.ts", colorTs],
    ["src/lib/renderCss.ts", renderCssTs],
    ["src/lib/render.ts", renderTs],
  ];
  for (const [path, content] of libFiles) zip.file(path, content);
  zip.file(
    "src/lib/blueprint.json",
    JSON.stringify(doc, null, 2)
  );
  zip.file(
    "src/main.tsx",
    `import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import doc from "./lib/blueprint.json";
import { renderPage } from "./lib/render";

function App() {
  const [page, setPage] = useState(0);
  useEffect(() => {
    window.addEventListener("message", (e) => {
      if (e.data && e.data.type === "bk-nav") {
        const idx = doc.pages.findIndex((p) => p.slug === e.data.slug);
        if (idx >= 0) setPage(idx);
      }
    });
  }, []);
  const current = doc.pages[page] ?? doc.pages[0];
  const html = renderPage(doc, current, false, doc.pages.map((p) => p.slug));
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`
  );
  const blob = await zip.generateAsync({ type: "blob" });
  triggerDownload(blob, "bukkyai-react-project.zip");
}

export async function publishPreview(doc: SiteBlueprint): Promise<void> {
  const page = doc.pages[0];
  if (!page) return;
  const html = singleFileHtml(doc);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

export async function backupToGithub(token: string, doc: SiteBlueprint, name: string): Promise<{ url?: string; error?: string }> {
  try {
    const res = await fetch("https://api.github.com/gists", {
      method: "POST",
      headers: {
        authorization: `token ${token}`,
        "content-type": "application/json",
        "user-agent": "bukkyai",
        accept: "application/vnd.github+json",
      },
      body: JSON.stringify({
        description: `bukkyai backup — ${name}`,
        public: false,
        files: {
          "site.json": { content: JSON.stringify(doc, null, 2) },
        },
      }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data?.message ?? `GitHub returned ${res.status}` };
    return { url: data.html_url };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

export async function deployToGithubPages(
  token: string,
  doc: SiteBlueprint,
  siteName: string
): Promise<{ url?: string; error?: string }> {
  const gh = async (path: string, init: RequestInit = {}): Promise<{ ok: boolean; data: Record<string, unknown> }> => {
    const res = await fetch(`https://api.github.com${path}`, {
      ...init,
      headers: {
        authorization: `token ${token}`,
        "content-type": "application/json",
        "user-agent": "bukkyai",
        accept: "application/vnd.github+json",
        ...(init.headers ?? {}),
      },
    });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    return { ok: res.ok, data };
  };

  try {
    // 1. current user
    const user = await gh("/user");
    if (!user.ok) return { error: `Could not read GitHub user: ${String(user.data.message ?? "")}` };
    const owner = String(user.data.login ?? "");

    // 2. ensure repo exists (create if missing)
    const repoName = `bukkyai-${siteName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "site"}`;
    const repo = await gh(`/repos/${owner}/${repoName}`);
    if (!repo.ok) {
      const created = await gh(`/user/repos`, {
        method: "POST",
        body: JSON.stringify({ name: repoName, private: false, auto_init: true, description: `Site built with bukkyai — ${doc.meta.title}` }),
      });
      if (!created.ok) return { error: `Could not create repo: ${String(created.data.message ?? "")}` };
    }

    // 3. create blobs for every static file
    const files = renderStaticSite(doc).files;
    const blobs: { path: string; sha: string }[] = [];
    for (const f of files) {
      const b = await gh(`/repos/${owner}/${repoName}/git/blobs`, {
        method: "POST",
        body: JSON.stringify({ content: btoa(unescape(encodeURIComponent(f.content))), encoding: "base64" }),
      });
      if (!b.ok) return { error: `Could not create blob for ${f.path}: ${String(b.data.message ?? "")}` };
      blobs.push({ path: f.path, sha: String(b.data.sha ?? "") });
    }

    // 4. build tree referencing existing main HEAD if present
    const head = await gh(`/repos/${owner}/${repoName}/git/refs/heads/main`);
    const headObj = head.data.object as { sha?: string } | undefined;
    const parent = head.ok && headObj?.sha ? [headObj.sha] : [];
    const tree = await gh(`/repos/${owner}/${repoName}/git/trees`, {
      method: "POST",
      body: JSON.stringify({ tree: blobs.map((b) => ({ path: b.path, mode: "100644", type: "blob", sha: b.sha })) }),
    });
    if (!tree.ok) return { error: `Could not create tree: ${String(tree.data.message ?? "")}` };

    // 5. commit
    const commit = await gh(`/repos/${owner}/${repoName}/git/commits`, {
      method: "POST",
      body: JSON.stringify({ message: `Deploy ${doc.meta.title}`, tree: String(tree.data.sha ?? ""), parents: parent }),
    });
    if (!commit.ok) return { error: `Could not create commit: ${String(commit.data.message ?? "")}` };

    // 6. update main ref
    const ref = await gh(`/repos/${owner}/${repoName}/git/refs/heads/main`, {
      method: "PATCH",
      body: JSON.stringify({ sha: String(commit.data.sha ?? ""), force: true }),
    });
    if (!ref.ok) {
      // ref may not exist yet on a fresh repo; create it
      const createRef = await gh(`/repos/${owner}/${repoName}/git/refs`, {
        method: "POST",
        body: JSON.stringify({ ref: "refs/heads/main", sha: String(commit.data.sha ?? "") }),
      });
      if (!createRef.ok) return { error: `Could not update main branch: ${String(createRef.data.message ?? "")}` };
    }

    // 7. enable Pages (best-effort)
    await gh(`/repos/${owner}/${repoName}/pages`, {
      method: "POST",
      body: JSON.stringify({ source: { branch: "main", path: "/" } }),
    });

    const url = `https://${owner}.github.io/${repoName}/`;
    return { url };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

function readmeMd(): string {
  return `# Your bukkyai site

Generated by [bukkyai](https://github.com/anomalyco/opencode) — the local, unlimited-edit AI website builder.

## Files
- \`index.html\` (+ page files) — the site. Static, server-rendered HTML. No framework, no build step.
- \`styles\` — the design system is embedded as CSS custom properties in every page.
- \`site.json\` — the full editable blueprint. Open it back in bukkyai (Import) to keep editing.
- \`robots.txt\`, \`sitemap.xml\` — SEO essentials, generated automatically.

## Deploy (any of these, ~1 minute)

**Netlify** — drag the folder onto app.netlify.com/drop. Done.
**Vercel** — \`vercel\` in this folder. Static preset.
**GitHub Pages** — push the folder to a repo, enable Pages on main branch.
**Any static host** — upload the files. There is no backend.

## Keep editing
Import \`site.json\` in bukkyai → Edit → Export again. Your changes, your data, always.
`;
}

function triggerDownload(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
