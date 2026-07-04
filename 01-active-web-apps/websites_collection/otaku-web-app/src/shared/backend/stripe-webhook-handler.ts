import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-04-22.dahlia',
});

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

function generateLicenseKey(): string {
  const segments = [];
  for (let i = 0; i < 4; i++) {
    const segment = Math.random().toString(36).substring(2, 7).toUpperCase();
    segments.push(segment);
  }
  return segments.join('-');
}

export async function handleStripeWebhook(
  rawBody: string,
  signature: string
): Promise<{ success: boolean; error?: string }> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    return { success: false, error: 'Webhook secret not configured' };
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const error = err as Error;
    console.error('Webhook signature verification failed:', error.message);
    return { success: false, error: 'Invalid signature' };
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { success: true };
  } catch (err) {
    const error = err as Error;
    console.error('Error processing webhook:', error);
    return { success: false, error: error.message };
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  const userEmail = session.customer_email;
  const purchaseType = session.metadata?.purchase_type as 'library_premium' | 'program_download';

  if (!userId) {
    console.error('No user_id in session metadata');
    return;
  }

  const licenseKey = generateLicenseKey();
  
  const tier = 'lifetime';
  
  const updateData: any = {
    tier,
    program_license_key: licenseKey,
    purchase_type: purchaseType,
    purchase_date: new Date().toISOString(),
    stripe_customer_id: session.customer as string,
    stripe_checkout_session_id: session.id,
    stripe_payment_intent_id: session.payment_intent as string,
  };

  if (session.mode === 'subscription') {
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);
    updateData.subscription_end_date = subscriptionEndDate.toISOString();
  }

  const { error } = await supabase
    .from('user_profiles')
    .update(updateData)
    .eq('id', userId);

  if (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }

  console.log(`Successfully granted ${tier} tier to user ${userId}`);
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const invoiceAny = invoice as any;
  const subscriptionId = invoiceAny.subscription as string;
  
  if (!subscriptionId) {
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = subscription.metadata?.user_id;

  if (!userId) {
    console.error('No user_id in subscription metadata');
    return;
  }

  const subscriptionEndDate = new Date();
  subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);

  const { error } = await supabase
    .from('user_profiles')
    .update({
      subscription_end_date: subscriptionEndDate.toISOString(),
      tier: 'lifetime',
    })
    .eq('id', userId);

  if (error) {
    console.error('Error extending subscription:', error);
    throw error;
  }

  console.log(`Extended subscription for user ${userId}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id;

  if (!userId) {
    console.error('No user_id in subscription metadata');
    return;
  }

  const { error } = await supabase
    .from('user_profiles')
    .update({
      tier: 'free',
      subscription_end_date: null,
    })
    .eq('id', userId);

  if (error) {
    console.error('Error downgrading user:', error);
    throw error;
  }

  console.log(`Downgraded user ${userId} after subscription cancellation`);
}

export async function createCheckoutSession(
  userId: string,
  userEmail: string,
  purchaseType: 'library_premium' | 'program_download'
): Promise<{ sessionId: string; url: string }> {
  const priceId = purchaseType === 'library_premium' 
    ? process.env.STRIPE_PRICE_LIBRARY_PREMIUM 
    : process.env.STRIPE_PRICE_PROGRAM_DOWNLOAD;

  if (!priceId) {
    throw new Error('Price ID not configured');
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.VITE_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.VITE_APP_URL}/pricing`,
    customer_email: userEmail,
    metadata: {
      user_id: userId,
      purchase_type: purchaseType,
    },
  });

  return {
    sessionId: session.id,
    url: session.url!,
  };
}
