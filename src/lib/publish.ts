// Client-side publish: send the static site to YOUR publish worker
// (server/worker.js). The worker holds the GitHub token + optional license check.
import type { SiteBlueprint } from "./types";
import { renderStaticSite } from "./render";

export function publishEndpoint(): string {
  return (import.meta.env.VITE_PUBLISH_ENDPOINT as string | undefined) ?? "";
}

export function proLicense(): string {
  return (import.meta.env.VITE_PRO_LICENSE_KEY as string | undefined) ?? "";
}

export function proUnlocked(): boolean {
  try {
    return localStorage.getItem("bukkyai.pro") === "1";
  } catch {
    return false;
  }
}

export function setProUnlocked(v: boolean): void {
  try {
    localStorage.setItem("bukkyai.pro", v ? "1" : "0");
  } catch {}
}

export async function publishSite(doc: SiteBlueprint): Promise<{ url?: string; error?: string }> {
  const endpoint = publishEndpoint();
  if (!endpoint) return { error: "Publish endpoint not configured. Add VITE_PUBLISH_ENDPOINT to .env (see server/README.md)." };
  try {
    const files = renderStaticSite(doc).files;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ files, license: proLicense() }),
    });
    const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
    if (!res.ok) return { error: data.error ?? `Publish returned ${res.status}` };
    if (!data.url) return { error: "Publish returned no URL." };
    return { url: data.url };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
