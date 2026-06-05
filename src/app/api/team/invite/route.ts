import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import SnapwiseInviteEmail from '@/emails/SnapwiseInviteEmail';

const resend = new Resend(process.env.RESEND_API_KEY);


export async function POST(request: Request) {
  try {
    const { email, role, is_photographer } = await request.json();

    if (!email || !role) {
      return NextResponse.json({ error: 'Email and role are required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Server misconfiguration: Service role key missing' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // 1. Generate the invite link silently without triggering default emails
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'invite',
      email: email,
    });

    if (linkError) {
      return NextResponse.json({ error: linkError.message }, { status: 500 });
    }

    const user = linkData.user;
    const inviteUrl = linkData.properties?.action_link;

    if (!user || !inviteUrl) {
       return NextResponse.json({ error: 'Failed to generate invite link' }, { status: 500 });
    }

    // 2. Profile Creation (if it doesn't already exist from a trigger)
    // Upsert into profiles based on user id, set email and role, status can be implicitly handled or if there is a column.
    // If there is an existing trigger, it might have created the profile already. We just need to update it with the role.
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: user.id,
        email: email,
        role: role,
        is_photographer: is_photographer || false,
        // Depending on schema, status: 'Pending' might not exist or be needed.
      }, { onConflict: 'id' });

    if (profileError) {
       // Just log, the user is created and link generated.
       console.error("Profile update error:", profileError);
    }

    // 3. Custom Email Integration Hook
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'Snapwise <hello@snapwise.co.nz>',
      to: email,
      subject: 'You have been invited to join the Snapwise team!',
      react: SnapwiseInviteEmail({ inviteUrl, role, isPhotographer: is_photographer || false }),
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
