import { ReactNode } from 'react';
import Sidebar from '@/components/Sidebar';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import UserNav from '@/components/UserNav';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, role, avatar_url')
    .eq('id', user.id)
    .single();

  if (!profile?.first_name || !profile?.last_name) {
    redirect('/onboarding');
  }

  const role = profile.role || 'photographer';
  const fullName = `${profile.first_name} ${profile.last_name}`;
  const roleTitle = role.charAt(0).toUpperCase() + role.slice(1);
  const avatarUrl = profile.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(fullName) + '&background=random';

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 font-display text-slate-800 dark:text-slate-200">
      
      {/* Sidebar — role determines visible nav items */}
      <Sidebar role={role} />

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
            
            <UserNav 
              fullName={fullName} 
              roleTitle={roleTitle} 
              avatarUrl={avatarUrl} 
              email={user.email || ''} 
            />
          </div>
        </header>

        {/* Page Content */}
        {children}

      </div>
    </div>
  );
}
