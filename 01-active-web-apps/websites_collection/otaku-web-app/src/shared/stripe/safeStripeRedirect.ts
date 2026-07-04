/**
 * Only allow navigation to Stripe-hosted checkout — mitigates open redirects if the API is abused or compromised.
 */
export function isStripeHostedCheckoutUrl(url: unknown): url is string {
  if (typeof url !== 'string' || !url.trim()) return false;
  if (url.length > 4096) return false;
  try {
    const u = new URL(url);
    if (u.protocol !== 'https:') return false;
    if (u.username !== '' || u.password !== '') return false;
    const h = u.hostname.toLowerCase();
    return h === 'checkout.stripe.com' || h === 'buy.stripe.com' || h.endsWith('.stripe.com');
  } catch {
    return false;
  }
}
