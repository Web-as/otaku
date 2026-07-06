import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/shared/supabase/admin';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    // Insert into pre_registrations table
    const { error } = await supabaseAdmin
      .from('pre_registrations')
      .insert([
        { email, tier: 'email_only' }
      ]);

    if (error) {
      if (error.code === '23505') { // Postgres unique constraint violation
        return NextResponse.json({ error: 'Email already registered!' }, { status: 400 });
      }
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: 'Failed to register. Please try again later.' }, { status: 500 });
    }

    // Attempt to send Welcome Email
    try {
      const { error: emailError } = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: [email],
        subject: 'Welcome to the Otaku Gildija Waitlist!',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #050505; color: #ffffff; padding: 40px; border-radius: 12px; border: 1px solid #333;">
            <h1 style="color: #a78bfa; text-transform: uppercase; letter-spacing: 2px;">Welcome, Founder.</h1>
            <p style="color: #d1d5db; line-height: 1.6;">
              Thank you for supporting <strong>Otaku Gildija</strong>. You are officially on the waitlist.
            </p>
            <p style="color: #d1d5db; line-height: 1.6;">
              We are working hard to build the ultimate spatial anime platform, and we'll notify you the moment the gates open.
            </p>
            <div style="margin-top: 30px; padding: 20px; background-color: #1a1a1a; border-left: 4px solid #ec4899;">
              <p style="margin: 0; color: #f3f4f6; font-size: 14px;">
                <strong>Want to skip the line?</strong> You can grab a Founder's Pack on the site to get instant Early Access.
              </p>
            </div>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 40px;">
              Otaku Gildija Team | System v2.4.0-BETA
            </p>
          </div>
        `
      });

      if (emailError) {
        console.error('Resend returned an error object:', emailError);
      } else {
        console.log('Resend email sent successfully to:', email);
      }
    } catch (emailError) {
      console.error('Resend catch block error:', emailError);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Preregister API Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
