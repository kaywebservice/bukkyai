import type { SiteBlueprint } from "./types";

export async function generateOgImage(doc: SiteBlueprint, width = 1200, height = 630): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  const c = doc.design.tokens.colors;
  const heading = doc.design.tokens.fonts.heading || "Inter";

  ctx.fillStyle = c.background;
  ctx.fillRect(0, 0, width, height);

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, c.primary);
  gradient.addColorStop(1, c.accent);
  ctx.fillStyle = gradient;
  ctx.globalAlpha = 0.12;
  ctx.beginPath();
  ctx.arc(width - 120, 110, 300, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  await loadFont(heading);

  ctx.fillStyle = c.text;
  ctx.textBaseline = "top";
  ctx.font = `700 64px "${heading}"`;
  const title = doc.meta.title.slice(0, 42);
  ctx.fillText(title, 72, 96, width - 144);

  ctx.font = `400 26px "${heading}"`;
  ctx.fillStyle = c.muted;
  const desc = (doc.meta.description || "").slice(0, 130);
  wrapText(ctx, desc, 72, 230, width - 144, 36);

  ctx.fillStyle = c.accent;
  ctx.font = `600 20px "${heading}"`;
  ctx.fillText("bukkyai", 72, height - 88);

  return canvas.toDataURL("image/png");
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): void {
  const words = text.split(/\s+/);
  let line = "";
  let yy = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, yy);
      line = word;
      yy += lineHeight;
    } else {
      line = test;
    }
    if (yy > 520) break;
  }
  if (line && yy <= 520) ctx.fillText(line, x, yy);
}

let fontCache: Promise<void> | null = null;
function loadFont(family: string): Promise<void> {
  if (!fontCache) {
    fontCache = new Promise((resolve) => {
      try {
        const docEl = document.createElement("link");
        docEl.rel = "stylesheet";
        docEl.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@400;700&display=swap`;
        docEl.onload = () => resolve();
        docEl.onerror = () => resolve();
        document.head.appendChild(docEl);
      } catch {
        resolve();
      }
      setTimeout(resolve, 2000);
    });
  }
  return fontCache;
}
