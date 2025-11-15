'use server';

import type { MembershipTier } from '../lib/membership-tiers';

const priceEnvMap: Record<MembershipTier, string> = {
  standard: 'STRIPE_PRICE_STANDARD',
  pro: 'STRIPE_PRICE_PRO',
  academy: 'STRIPE_PRICE_ACADEMY',
};

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable ${name}`);
  }
  return value;
}

export interface CheckoutIntent {
  priceId: string;
  mode: 'subscription';
  successUrl: string;
  cancelUrl: string;
  metadata: Record<string, string>;
}

export function buildCheckoutIntent(
  tier: MembershipTier,
  email?: string,
  returnTo: string = 'https://grapplemap.uk/network/dashboard',
): CheckoutIntent {
  const priceId = requiredEnv(priceEnvMap[tier]);

  return {
    priceId,
    mode: 'subscription',
    successUrl: `${returnTo}?event=checkout_complete`,
    cancelUrl: 'https://grapplemap.uk/network',
    metadata: {
      tier,
      ...(email ? { email } : {}),
    },
  };
}

export function buildBillingPortalUrl(customerId: string): string {
  const portalBase = requiredEnv('STRIPE_PORTAL_URL');
  const url = new URL(portalBase);
  url.searchParams.set('customer', customerId);
  return url.toString();
}
