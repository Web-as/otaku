/**
 * Lightweight checkout guardrails (inspired by snippet23 XState — no extra deps).
 */

export type CheckoutPhase = 'browsing' | 'payment' | 'processing' | 'success' | 'cancelled';

export type CheckoutContext = {
  phase: CheckoutPhase;
  cartCount: number;
  error?: string;
};

export function transitionCheckout(ctx: CheckoutContext, event: string): CheckoutContext {
  switch (ctx.phase) {
    case 'browsing':
      if (event === 'BEGIN_CHECKOUT' && ctx.cartCount > 0) return { ...ctx, phase: 'payment' };
      if (event === 'ADD_TO_CART') return { ...ctx, cartCount: ctx.cartCount + 1 };
      break;
    case 'payment':
      if (event === 'SUBMIT_PAYMENT') return { ...ctx, phase: 'processing' };
      if (event === 'CANCEL') return { ...ctx, phase: 'browsing', error: undefined };
      break;
    case 'processing':
      if (event === 'PAYMENT_SUCCESS') return { ...ctx, phase: 'success', error: undefined };
      if (event === 'PAYMENT_FAILED') return { ...ctx, phase: 'payment', error: 'Payment failed' };
      break;
    case 'success':
      if (event === 'RESET') return { phase: 'browsing', cartCount: 0 };
      break;
    default:
      break;
  }
  return ctx;
}

export function canBeginCheckout(ctx: CheckoutContext): boolean {
  return ctx.phase === 'browsing' && ctx.cartCount > 0;
}
