import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
    }

    const { error: settingsError } = await supabase
      .from('agency_settings')
      .update({
        nylas_grant_id: null,
        nylas_account_id: null,
        nylas_connected_email: null,
      })
      .eq('user_id', user.id);

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        nylas_grant_id: null,
        nylas_account_id: null,
      })
      .eq('id', user.id);

    if (settingsError || profileError) {
      console.error('Error disconnecting calendar:', settingsError || profileError);
      return NextResponse.json({ error: 'Failed to disconnect calendar' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in disconnect route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
