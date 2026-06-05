import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import SnapwiseInviteEmail from '@/emails/SnapwiseInviteEmail';

export async function POST(request: Request) {
  try {
    const { email, role, is_photographer } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!supabaseUrl || !supabaseKey || !resendApiKey) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    
    const resend = new Resend(resendApiKey);

    // Generate magic link since user already exists
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
    });

    if (linkError) {
      return NextResponse.json({ error: linkError.message }, { status: 500 });
    }

    const inviteUrl = linkData.properties?.action_link;

    if (!inviteUrl) {
       return NextResponse.json({ error: 'Failed to generate link' }, { status: 500 });
    }

    // Send the email
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'Snapwise <hello@snapwise.co.nz>',
      to: email,
      subject: 'Your Snapwise Invitation (Resent)',
      react: SnapwiseInviteEmail({ inviteUrl, role: role || 'staff', isPhotographer: is_photographer || false }),
    });

    if (emailError) {
      console.error('Resend email error:', emailError);
      return NextResponse.json({ error: 'Failed to send invite email' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
