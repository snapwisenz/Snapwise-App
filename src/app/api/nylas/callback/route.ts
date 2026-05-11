import { NextResponse } from 'next/server';
import { nylas, nylasConfig } from '@/utils/nylas';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'No authorization code returned from Nylas' }, { status: 400 });
  }

  try {
    const response = await nylas.auth.exchangeCodeForToken({
      clientSecret: nylasConfig.clientSecret,
      clientId: nylasConfig.clientId,
      redirectUri: nylasConfig.callbackUri,
      code,
    });

    const grantId = response.grantId;
    const email = response.email; // Often available in the response

    // Save grantId to the user's profile
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL('/settings?error=not_logged_in', request.url));
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        nylas_grant_id: grantId,
        nylas_account_id: grantId, // In v3, grantId often replaces accountId, keeping both for schema
      })
      .eq('id', user.id);

    if (error) {
      console.error('Error saving grant ID to Supabase:', error);
      return NextResponse.redirect(new URL('/settings?error=db_update_failed', request.url));
    }

    return NextResponse.redirect(new URL('/settings?success=calendar_connected', request.url));
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    return NextResponse.redirect(new URL('/settings?error=exchange_failed', request.url));
  }
}
