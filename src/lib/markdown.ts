import type { Post } from "./types";
import { uid } from "./blueprint";

export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || `post-${Date.now().toString(36)}`;
}

export function parseMarkdown(md: string): Post | null {
  const front = md.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  const meta: Record<string, string> = {};
  if (front) {
    for (const line of front[1].split("\n")) {
      const m = line.match(/^([\w-]+):\s*(.*)$/);
      if (m) meta[m[1].toLowerCase()] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  }
  const body = front ? md.slice(front[0].length) : md;
  let html = body
    .replace(/^###\s+(.+)$/gm, "<h3>$1</h3>")
    .replace(/^##\s+(.+)$/gm, "<h2>$1</h2>")
    .replace(/^#\s+(.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/^[-*]\s+(.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .trim();
  html = html
    .split(/\n\n+/)
    .map((p) => {
      if (/^<(h\d|ul|li)/.test(p)) return p;
      return `<p>${p}</p>`;
    })
    .join("\n");
  if (!meta.title) return null;
  return {
    id: uid("post"),
    slug: meta.slug || slugify(meta.title),
    title: meta.title,
    excerpt: meta.excerpt || meta.description || "",
    content: html,
    date: meta.date ? new Date(meta.date).toISOString() : new Date().toISOString(),
    cover: meta.cover || meta.image || undefined,
    category: meta.category || "News",
    author: meta.author || undefined,
  };
}
