// Creem checkout integration.
//
// Creem has NO public "publishable key" (unlike Stripe). Its API keys
// (creem_test_… / creem_live_…) are secret and must stay server-side.
//
// Two safe patterns:
// 1. Hosted checkout link (no code, no exposure) — create a product in the
//    Creem dashboard, "generate checkout link", and paste the URL into
//    bukkyai Settings → payment link. The site just redirects.
// 2. Server-side checkout (for dynamic carts) — a serverless function or your
//    backend holds the secret key and calls creem.checkouts.create(); your site
//    redirects to the returned checkout.checkoutUrl. The browser never sees the key.
import type { CartItem } from "./types";

// Optional: URL of your own serverless checkout endpoint (Option 2).
// Leave empty to rely on hosted checkout links (Option 1).
export function checkoutEndpoint(): string {
  return (import.meta.env.VITE_CHECKOUT_ENDPOINT as string | undefined) ?? "";
}

export function checkoutConfigured(): boolean {
  return Boolean(checkoutEndpoint());
}

// Option 1: hosted checkout link.
export function openHostedCheckout(link: string): void {
  window.open(link, "_blank", "noopener");
}

// Option 2: POST the cart to YOUR serverless endpoint, which holds the Creem
// secret key server-side and returns { url } to redirect to.
export async function createServerCheckout(
  items: CartItem[],
  opts: { successUrl?: string; cancelUrl?: string }
): Promise<{ url?: string; error?: string }> {
  const endpoint = checkoutEndpoint();
  if (!endpoint) return { error: "No checkout endpoint configured." };
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        line_items: items.map((i) => ({ product_id: i.productId, quantity: i.qty })),
        success_url: opts.successUrl ?? window.location.href,
        cancel_url: opts.cancelUrl ?? window.location.href,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { url?: string; message?: string };
    if (!res.ok) return { error: data.message ?? `Checkout returned ${res.status}` };
    if (!data.url) return { error: "Checkout returned no URL." };
    return { url: data.url };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
