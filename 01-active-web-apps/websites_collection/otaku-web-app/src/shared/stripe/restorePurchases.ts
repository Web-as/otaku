import { getCurrentUser } from '../firebase';

const backendUrl = () =>
  (process.env.NEXT_PUBLIC_BACKEND_URL as string | undefined)?.replace(/\/$/, '') ||
  'http://localhost:3333';

export async function refreshEntitlementsFromServer(): Promise<{
  refreshed: boolean;
  hasLibraryPremium?: boolean;
}> {
  const user = getCurrentUser();
  if (!user) throw new Error('Sign in to restore purchases');

  const res = await fetch(`${backendUrl()}/api/entitlements/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: user.uid }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || 'Failed to refresh entitlements');
  }

  return res.json();
}

export async function openStripeCustomerPortal(returnUrl?: string): Promise<string> {
  const user = getCurrentUser();
  if (!user) throw new Error('Sign in to manage subscription');

  const res = await fetch(`${backendUrl()}/api/stripe/customer-portal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: user.uid,
      returnUrl: returnUrl || window.location.href,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || 'Failed to open billing portal');
  }

  const data = (await res.json()) as { url: string };
  return data.url;
}
