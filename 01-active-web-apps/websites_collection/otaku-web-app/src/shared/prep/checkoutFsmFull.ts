/**
 * Extended checkout FSM states — prep for full XState (ADV-07) atop lite checkoutStateMachine.
 * Import transitionCheckout from ../lib/checkoutStateMachine for runtime; use these for UI labels.
 */

import { transitionCheckout, type CheckoutContext, type CheckoutPhase } from '../lib/checkoutStateMachine';

export type CheckoutPhaseMeta = {
  phase: CheckoutPhase;
  label: string;
  canCancel: boolean;
};

export const CHECKOUT_PHASE_UI: CheckoutPhaseMeta[] = [
  { phase: 'browsing', label: 'Browsing', canCancel: false },
  { phase: 'payment', label: 'Choose offer', canCancel: true },
  { phase: 'processing', label: 'Redirecting to Stripe…', canCancel: false },
  { phase: 'success', label: 'Complete', canCancel: false },
  { phase: 'cancelled', label: 'Cancelled', canCancel: false },
];

export function checkoutPhaseLabel(phase: CheckoutPhase): string {
  return CHECKOUT_PHASE_UI.find((p) => p.phase === phase)?.label ?? phase;
}

export function createCheckoutContext(cartCount = 0): CheckoutContext {
  return { phase: 'browsing', cartCount };
}

export { transitionCheckout, type CheckoutContext, type CheckoutPhase };
