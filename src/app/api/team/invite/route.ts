import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Placeholder for transactional email integration (e.g. Resend, Sendgrid)
async function sendBrandedInviteEmail(email: string, role: string, inviteUrl: string) {
  // TODO: Integrate actual email provider here.
  console.log(`\n======================================================`);
  console.log(`MOCK BRANDED EMAIL SENDER`);
  console.log(`To: ${email}`);
  console.log(`Subject: You have been invited to join the team!`);
  console.log(`Body:`);
  console.log(`Hello,`);
  console.log(`You have been invited to join the team as a ${role}.`);
  console.log(`Please click the link below to set up your account:`);
  console.log(`${inviteUrl}`);
  console.log(`======================================================\n`);
}

export async function POST(request: Request) {
  try {
    const { email, role } = await request.json();

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
        // Depending on schema, status: 'Pending' might not exist or be needed.
      }, { onConflict: 'id' });

    if (profileError) {
       // Just log, the user is created and link generated.
       console.error("Profile update error:", profileError);
    }

    // 3. Custom Email Integration Hook
    await sendBrandedInviteEmail(email, role, inviteUrl);

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
