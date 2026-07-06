import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/shared/supabase/admin';
import { Resend } from 'resend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16' as any,
});

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
  }

  try {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured');
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.metadata?.is_preregister === 'true') {
          const email = session.customer_details?.email;
          const name = session.customer_details?.name;
          const tier = session.metadata.tier; // 'program' or 'card_holder'
          const customerId = session.customer as string;
          const subscriptionId = session.subscription as string | undefined;

          if (email) {
            // Upsert into pre_registrations
            await supabaseAdmin.from('pre_registrations').upsert({
              email: email,
              name: name || null,
              tier: tier,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId || null,
            }, { onConflict: 'email' });
          }
        }
        break;
      }
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        
        // Find if this invoice is for a pre_registration
        const customerId = invoice.customer as string;
        const { data: preReg } = await supabaseAdmin
          .from('pre_registrations')
          .select('*')
          .eq('stripe_customer_id', customerId)
          .single();

        if (preReg && preReg.tier === 'card_holder') {
          // Increment support_months_remaining
          await supabaseAdmin
            .from('pre_registrations')
            .update({ free_months_remaining: (preReg.free_months_remaining || 0) + 1 })
            .eq('id', preReg.id);

          // Send Thank You Email via Resend
          if (process.env.RESEND_API_KEY) {
            await resend.emails.send({
              from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
              to: preReg.email,
              subject: 'Thank you for supporting the build! 🚀',
              html: `
                <h2>Thank you for your support!</h2>
                <p>We successfully received your €2.50 monthly support payment.</p>
                <p>Because you are supporting us <strong>before the official launch</strong>, you won't be charged for your first <strong>${(preReg.free_months_remaining || 0) + 1} months</strong> after we launch!</p>
                <br/>
                <p>You also have exclusive early access to the site right now. Just log in with this email.</p>
                <br/>
                <p>Stay tuned for more updates,</p>
                <p>The Otaku Gildija Team</p>
              `
            });
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook processing error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
