import type { LLMSettings } from "./types";

export type LLMResult = { text: string; error?: string };

const DEFAULT_MODELS: Record<string, string> = {
  openai: "gpt-4o",
  anthropic: "claude-sonnet-4-5",
  gemini: "gemini-3.5-flash",
  custom: "",
};

export function defaultModel(provider: LLMSettings["provider"]): string {
  return DEFAULT_MODELS[provider] ?? "";
}

export function hasKey(s: LLMSettings): boolean {
  return Boolean(s.apiKey.trim());
}

export async function callLLM(
  settings: LLMSettings,
  system: string,
  user: string,
  maxTokens = 8192
): Promise<LLMResult> {
  const key = settings.apiKey.trim();
  if (!key) return { text: "", error: "No API key configured. Add one in Settings." };
  try {
    if (settings.provider === "anthropic") {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: settings.model || defaultModel("anthropic"),
          max_tokens: maxTokens,
          system,
          messages: [{ role: "user", content: user }],
        }),
      });
      const data = await res.json();
      if (!res.ok) return { text: "", error: `Anthropic: ${data?.error?.message ?? res.status}` };
      return { text: (data.content ?? [])
        .filter((b: { type: string }) => b.type === "text")
        .map((b: { text: string }) => b.text)
        .join("\n") };
    }

    if (settings.provider === "gemini") {
      const model = settings.model || defaultModel("gemini");
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: system }] },
            contents: [{ role: "user", parts: [{ text: user }] }],
            generationConfig: { maxOutputTokens: maxTokens, responseMimeType: "application/json" },
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        return { text: "", error: `Gemini: ${data?.error?.message ?? res.status}` };
      }
      const text = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
      if (data?.candidates?.[0]?.finishReason === "MAX_TOKENS") {
        return { text, error: "Gemini: output was truncated (max tokens)." };
      }
      return { text };
    }

    const base =
      settings.provider === "custom" && settings.baseUrl
        ? settings.baseUrl.replace(/\/+$/, "")
        : "https://api.openai.com/v1";
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: settings.model || defaultModel(settings.provider),
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.7,
        max_tokens: maxTokens,
        ...(settings.provider === "openai" ? { response_format: { type: "json_object" } } : {}),
      }),
    });
    const data = await res.json();
    if (!res.ok) return { text: "", error: `${data?.error?.message ?? `HTTP ${res.status}`}` };
    return { text: data?.choices?.[0]?.message?.content ?? "" };
  } catch (err) {
    return { text: "", error: `Network error: ${err instanceof Error ? err.message : String(err)}` };
  }
}

export function extractJson(text: string): unknown {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

export async function callJSON<T>(
  settings: LLMSettings,
  system: string,
  user: string
): Promise<{ data: T | null; error?: string }> {
  const res = await callLLM(settings, system, user);
  if (res.error) return { data: null, error: res.error };
  const parsed = extractJson(res.text);
  if (!parsed) return { data: null, error: "Model returned invalid JSON. Please try again." };
  return { data: parsed as T };
}
