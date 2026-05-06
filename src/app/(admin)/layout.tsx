import Link from 'next/link';
import { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-800 dark:text-slate-200">
      
      {/* Sidebar */}
      <aside className="w-[240px] bg-white dark:bg-slate-900 border-r border-neutral-border dark:border-slate-800 flex flex-col fixed h-full z-20">
        <div className="h-16 flex items-center px-6 gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
            <span className="material-icons text-xl">camera_enhance</span>
          </div>
          <span className="text-xl font-bold heading-font tracking-tight text-slate-900 dark:text-white">Snapwise</span>
        </div>
        
        <nav className="flex-1 mt-6">
          <Link href="/dashboard" className="flex items-center px-6 py-3 border-l-4 border-primary bg-primary/5 text-primary group">
            <span className="material-icons mr-3 text-xl">dashboard</span>
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link href="/tasks" className="flex items-center px-6 py-3 border-l-4 border-transparent text-slate-500 hover:bg-neutral-soft dark:hover:bg-slate-800 transition-colors">
            <span className="material-icons mr-3 text-xl">assignment</span>
            <span className="font-medium">Tasks</span>
          </Link>
          <Link href="/jobs" className="flex items-center px-6 py-3 border-l-4 border-transparent text-slate-500 hover:bg-neutral-soft dark:hover:bg-slate-800 transition-colors">
            <span className="material-icons mr-3 text-xl">calendar_today</span>
            <span className="font-medium">Jobs</span>
          </Link>
          <Link href="/team" className="flex items-center px-6 py-3 border-l-4 border-transparent text-slate-500 hover:bg-neutral-soft dark:hover:bg-slate-800 transition-colors">
            <span className="material-icons mr-3 text-xl">groups</span>
            <span className="font-medium">Team</span>
          </Link>
        </nav>
        
        <div className="p-6">
          <Link href="/settings" className="flex items-center text-slate-500 hover:text-primary transition-colors">
            <span className="material-icons mr-3 text-xl">settings</span>
            <span className="font-medium">Settings</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-[240px]">
        
        {/* Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-neutral-border dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
          </div>
          
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-500 hover:bg-neutral-soft rounded-full transition-colors">
              <span className="material-icons">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-white"></span>
            </button>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold">Jordan Smith</p>
                <p className="text-xs text-slate-500">Ops Manager</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhjvgV_y9dIhcXaDUO0C_DL5iIDM6xs1cVBYen9KiGtM9jJv0ni7_pR_oK0zPXE4QLr6XV6jf5fmDMftDfnD6wds3jsLziJTSOkKo3U7B77oWwuacfYRNPrvKsfLKeS2rmmOj6TlOTeZ9vZsM1hz7wXlJXo2idCyb0YR7n4OcITDdMU1o1bqfK9m-OOeid-fDPY8aoKljRB8vcp2ZoborC1w84V5X8XEhdiPfnCzLZ4f2tU5AJn4Eiy1o5oHIb4wdUjdJNgh7SREA" alt="User Profile" className="w-full h-full object-cover" />
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
