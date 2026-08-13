export type BrandPalette = {
  colors: {
    background: string;
    surface: string;
    text: string;
    muted: string;
    primary: string;
    primaryContrast: string;
    accent: string;
    accentContrast: string;
    border: string;
  };
  mode: "light" | "dark";
};

function toHex(r: number, g: number, b: number): string {
  const h = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

function luminance(c: [number, number, number]): number {
  const [r, g, b] = c.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function textColorFor(bg: [number, number, number]): string {
  return luminance(bg) > 0.5 ? "#131313" : "#f5f5f2";
}

function samplePixels(data: Uint8ClampedArray, w: number, h: number, samples = 6000): [number, number, number][] {
  const out: [number, number, number][] = [];
  const step = Math.max(1, Math.floor((w * h) / samples));
  for (let i = 0; i < w * h; i += step) {
    const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
    if (r > 245 && g > 245 && b > 245) continue;
    if (r < 12 && g < 12 && b < 12) continue;
    out.push([r, g, b]);
  }
  return out;
}

function dominantColors(points: [number, number, number][], k: number): [number, number, number][] {
  if (points.length === 0) return [];
  const buckets: [number, number, number][] = [];
  for (let b = 0; b < k; b++) buckets.push(points[Math.floor((points.length * b) / k)]);

  let moved = true;
  for (let iter = 0; iter < 12 && moved; iter++) {
    const sums = buckets.map(() => ({ r: 0, g: 0, b: 0, n: 0 }));
    moved = false;
    for (const p of points) {
      let best = 0;
      let bestD = Infinity;
      for (let j = 0; j < buckets.length; j++) {
        const d =
          (p[0] - buckets[j][0]) ** 2 + (p[1] - buckets[j][1]) ** 2 + (p[2] - buckets[j][2]) ** 2;
        if (d < bestD) {
          bestD = d;
          best = j;
        }
      }
      sums[best].r += p[0];
      sums[best].g += p[1];
      sums[best].b += p[2];
      sums[best].n++;
    }
    for (let j = 0; j < buckets.length; j++) {
      if (sums[j].n > 0) {
        const nr = sums[j].r / sums[j].n, ng = sums[j].g / sums[j].n, nb = sums[j].b / sums[j].n;
        if (Math.abs(nr - buckets[j][0]) + Math.abs(ng - buckets[j][1]) + Math.abs(nb - buckets[j][2]) > 1) {
          moved = true;
          buckets[j] = [nr, ng, nb];
        }
      }
    }
  }
  return buckets.sort((a, b) => luminance(b) - luminance(a));
}

export async function paletteFromImage(file: File, mode: "light" | "dark" = "light"): Promise<BrandPalette | null> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("read failed"));
    reader.readAsDataURL(file);
  });

  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("image failed to load"));
    img.src = dataUrl;
  });

  const maxDim = 96;
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, w, h);
  const { data } = ctx.getImageData(0, 0, w, h);

  const points = samplePixels(data, w, h);
  const top = dominantColors(points, 6);

  if (top.length === 0) return null;

  const mostSaturated = [...top].sort(
    (a, b) => Math.max(a[0], a[1], a[2]) - Math.min(a[0], a[1], a[2]) >
      Math.max(b[0], b[1], b[2]) - Math.min(b[0], b[1], b[2])
      ? -1 : 1
  )[0];

  const dark = mode === "dark";
  const bg: [number, number, number] = dark ? [16, 17, 20] : [250, 248, 244];
  const surface: [number, number, number] = dark ? [26, 27, 32] : [255, 253, 250];
  const text: [number, number, number] = dark ? [240, 240, 244] : [24, 23, 21];
  const muted: [number, number, number] = dark ? [150, 152, 160] : [110, 104, 96];
  const border: [number, number, number] = dark ? [40, 41, 47] : [224, 219, 210];

  const accent = mostSaturated ?? top[1] ?? [200, 90, 40];

  const primaryRes = dark ? text : top[0] ?? text;

  const myBg = dark ? bg : top[0] && luminance(top[0]) > 0.75 ? top[0] : bg;
  const myAccent = accent;
  const myPrimary = primaryRes;

  return {
    colors: {
      background: toHex(...myBg),
      surface: toHex(...surface),
      text: toHex(...text),
      muted: toHex(...muted),
      primary: toHex(...myPrimary),
      primaryContrast: textColorFor(myPrimary),
      accent: toHex(...myAccent),
      accentContrast: textColorFor(myAccent),
      border: toHex(...border),
    },
    mode,
  };
}