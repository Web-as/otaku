import Stripe from 'stripe'

/** Unlock full QuestBook after Episode 1 (Phase 6 freemium). */
export async function POST(req: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) {
    return Response.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const body = await req.json() as {
    userId?: string
    userEmail?: string
    questBookId?: string
    successUrl?: string
    cancelUrl?: string
  }

  const priceId = process.env.STRIPE_VN_QUESTBOOK_PRICE_ID ?? process.env.STRIPE_PRICE_VN_PREMIUM
  if (!priceId) {
    return Response.json({ error: 'STRIPE_VN_QUESTBOOK_PRICE_ID not set' }, { status: 503 })
  }

  const stripe = new Stripe(stripeKey, { apiVersion: '2026-04-22.dahlia' })
  const origin = req.headers.get('origin') ?? 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: body.successUrl ?? `${origin}/vn/play/${body.questBookId ?? 'default'}?unlocked=1`,
    cancel_url: body.cancelUrl ?? `${origin}/vn?cancelled=1`,
    customer_email: body.userEmail,
    metadata: {
      userId: body.userId ?? '',
      questBookId: body.questBookId ?? '',
      product: 'vn_questbook_unlock',
    },
  })

  return Response.json({ url: session.url })
}
