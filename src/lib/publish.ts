// Client-side publish: send the static site to YOUR publish worker
// (server/worker.js). The worker holds the GitHub token, the Creem seller key,
// and the entitlement store — the browser never sees any of them.
import type { SiteBlueprint } from "./types";
import { renderStaticSite } from "./render";

export function publishEndpoint(): string {
  return (import.meta.env.VITE_PUBLISH_ENDPOINT as string | undefined) ?? "";
}

export async function uploadImageToHost(dataUrl: string): Promise<{ url?: string; error?: string }> {
  const endpoint = publishEndpoint();
  if (!endpoint) return { error: "Publish endpoint not configured." };
  try {
    const res = await fetch(endpoint.replace(/\/publish$/, "").replace(/\/+$/, "") + "/api/image", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ dataUrl }),
    });
    const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
    if (!res.ok) return { error: data.error ?? `Upload returned ${res.status}` };
    if (!data.url) return { error: "Upload returned no URL." };
    return { url: data.url };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

function apiBase(): string {
  return publishEndpoint().replace(/\/publish$/, "").replace(/\/+$/, "");
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

// Create a Creem checkout session bound to the buyer's email (server-side).
export async function startProCheckout(email: string, tier: "pro" | "plus" = "pro"): Promise<{ url?: string; error?: string }> {
  const base = apiBase();
  if (!base) return { error: "Checkout not configured — VITE_PUBLISH_ENDPOINT is empty. Add it to .env (see server/README.md)." };
  try {
    const res = await fetch(`${base}/api/checkout`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, tier }),
    });
    const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
    if (!res.ok) return { error: data.error ?? `Checkout returned ${res.status}` };
    if (!data.url) return { error: "Checkout returned no URL." };
    return { url: data.url };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

// Ask the worker whether this email has a paid entitlement.
export async function fetchEntitlement(email: string): Promise<boolean> {
  const base = apiBase();
  if (!base) return false;
  try {
    const res = await fetch(`${base}/api/entitlement`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { active?: boolean };
    return Boolean(data.active);
  } catch {
    return false;
  }
}

// Ask the worker for the entitlement plus the purchased tier.
export async function fetchEntitlementDetail(email: string): Promise<{ active: boolean; tier?: string }> {
  const base = apiBase();
  if (!base) return { active: false };
  try {
    const res = await fetch(`${base}/api/entitlement`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) return { active: false };
    const data = (await res.json()) as { active?: boolean; tier?: string };
    return { active: Boolean(data.active), tier: data.tier };
  } catch {
    return { active: false };
  }
}

export async function publishSite(doc: SiteBlueprint, email: string, domain?: string): Promise<{ url?: string; error?: string }> {
  const endpoint = publishEndpoint();
  if (!endpoint) return { error: "Publish endpoint not configured. Add VITE_PUBLISH_ENDPOINT to .env (see server/README.md)." };
  try {
    const files = renderStaticSite(doc).files;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        files,
        email,
        license: proLicense(),
        domain: domain?.trim() || undefined,
        siteId: doc.meta.title ? slugifyForRepo(doc.meta.title) : "site",
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
    if (!res.ok) return { error: data.error ?? `Publish returned ${res.status}` };
    if (!data.url) return { error: "Publish returned no URL." };
    return { url: data.url };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

function slugifyForRepo(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "site";
}
