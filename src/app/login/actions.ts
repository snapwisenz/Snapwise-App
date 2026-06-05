'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  try {
    const { error } = await supabase.auth.signInWithPassword(data);

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/', 'layout');
    redirect('/dashboard');
  } catch (err: any) {
    console.error('Login exception:', err);
    return { error: err?.message || 'Network error: Could not reach the authentication server. Your database might be paused or offline.' };
  }
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  try {
    const { error } = await supabase.auth.signUp(data);

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/', 'layout');
    redirect('/dashboard');
  } catch (err: any) {
    console.error('Signup exception:', err);
    return { error: err?.message || 'Network error: Could not reach the authentication server. Your database might be paused or offline.' };
  }
}
