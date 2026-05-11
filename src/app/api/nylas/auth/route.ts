import { NextResponse } from 'next/server';
import { nylas, nylasConfig } from '@/utils/nylas';

export async function GET() {
  try {
    const authUrl = nylas.auth.urlForOAuth2({
      clientId: nylasConfig.clientId,
      redirectUri: nylasConfig.callbackUri,
      scope: ['https://www.googleapis.com/auth/calendar'],
      // Nylas v3 provider might be determined automatically, or 'google'
      provider: 'google',
    });

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Error generating Nylas auth URL:', error);
    return NextResponse.json({ error: 'Failed to generate auth URL' }, { status: 500 });
  }
}
