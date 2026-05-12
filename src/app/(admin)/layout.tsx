import Link from 'next/link';
import { ReactNode } from 'react';
import Sidebar from '@/components/Sidebar';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile?.first_name || !profile?.last_name) {
    redirect('/onboarding');
  }

  const fullName = `${profile.first_name} ${profile.last_name}`;
  const roleTitle = profile.role_title || 'User';
  const avatarUrl = profile.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(fullName) + '&background=random';

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 font-display text-slate-800 dark:text-slate-200">
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 ml-[240px]">
        
        {/* Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
          </div>
          
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-500 hover:bg-neutral-soft rounded-full transition-colors">
              <span className="material-icons">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-white"></span>
            </button>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold">{fullName}</p>
                <p className="text-xs text-slate-500">{roleTitle}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={avatarUrl} alt="User Profile" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        {children}

      </div>
    </div>
  );
}
