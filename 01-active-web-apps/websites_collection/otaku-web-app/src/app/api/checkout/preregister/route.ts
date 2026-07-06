import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16' as any,
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tier = searchParams.get('tier'); // 'program' or 'card_holder'
    
    if (!tier || (tier !== 'program' && tier !== 'card_holder')) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    let priceId = '';
    let mode: 'payment' | 'subscription' = 'payment';

    if (tier === 'program') {
      priceId = process.env.VITE_STRIPE_LIBRARY_PROGRAM_LAUNCH_PRICE_ID as string;
      mode = 'payment';
    } else if (tier === 'card_holder') {
      priceId = process.env.VITE_STRIPE_LIBRARY_SUBSCRIPTION_PRICE_ID as string;
      mode = 'subscription';
    }

    if (!priceId) {
      return NextResponse.json({ error: 'Stripe configuration missing' }, { status: 500 });
    }

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode,
      success_url: `${baseUrl}/preregister?success=true&tier=${tier}`,
      cancel_url: `${baseUrl}/preregister?canceled=true`,
      metadata: {
        is_preregister: 'true',
        tier: tier,
      },
    });

    if (!session.url) {
      throw new Error('Failed to create Stripe session URL');
    }

    // Redirect to Stripe checkout
    return NextResponse.redirect(session.url);
  } catch (err: any) {
    console.error('Stripe Checkout Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
