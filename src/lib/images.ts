import type { LLMSettings } from "./types";

export const DEFAULT_IMAGE_MODEL = "gemini-3.1-flash-image";

export type ImageResult = { dataUrl?: string; error?: string };

export function canGenerateImages(settings: LLMSettings): boolean {
  return settings.provider === "gemini" && Boolean(settings.apiKey.trim());
}

export async function generateSiteImage(
  settings: LLMSettings,
  prompt: string,
  opts: { seed?: string } = {}
): Promise<ImageResult> {
  const key = settings.apiKey.trim();
  if (!key) return { error: "Add a Gemini API key in Settings to generate images." };
  if (settings.provider !== "gemini") {
    return { error: "Image generation uses the Gemini API — switch the AI provider to Google Gemini in Settings." };
  }
  const model = (settings.imageModel?.trim() || DEFAULT_IMAGE_MODEL).trim();
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            responseModalities: ["IMAGE"],
            ...(opts.seed ? { seed: parseInt(opts.seed, 36) % 2147483647 } : {}),
            temperature: 1,
          },
        }),
      }
    );
    const data = await res.json();
    if (!res.ok) {
      return { error: `Gemini image API: ${data?.error?.message ?? res.status}` };
    }
    const parts: { inlineData?: { mimeType?: string; data?: string } }[] =
      data?.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        return { dataUrl: `data:${part.inlineData.mimeType ?? "image/png"};base64,${part.inlineData.data}` };
      }
    }
    return { error: "The image model returned no image. It may need an upgraded (paid) plan for image output." };
  } catch (err) {
    return { error: `Network error: ${err instanceof Error ? err.message : String(err)}` };
  }
}
