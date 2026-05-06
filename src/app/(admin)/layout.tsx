import Link from 'next/link';
import { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 overflow-hidden font-display">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-neutral-border dark:border-slate-800 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-neutral-border dark:border-slate-800">
          <h1 className="text-2xl font-black text-primary tracking-tight">Snapwise</h1>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-primary/10 text-primary rounded-xl font-bold transition-colors">
            <span className="material-icons-outlined">dashboard</span>
            Dashboard
          </Link>
          <Link href="/jobs" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium transition-colors">
            <span className="material-icons-outlined">work_outline</span>
            Jobs
          </Link>
          <Link href="/team" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium transition-colors">
            <span className="material-icons-outlined">people_outline</span>
            Team
          </Link>
          <Link href="/assets" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium transition-colors">
            <span className="material-icons-outlined">folder_open</span>
            Media Assets
          </Link>
        </nav>
        
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button className="flex items-center gap-3 px-4 py-3 w-full text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl font-medium transition-colors">
            <span className="material-icons-outlined">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <header className="h-20 bg-white dark:bg-slate-900 border-b border-neutral-border dark:border-slate-800 px-8 flex items-center justify-between z-10">
          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 -ml-2 text-slate-500 hover:text-primary transition-colors">
            <span className="material-icons-outlined">menu</span>
          </button>

          <div className="hidden md:flex items-center gap-4 flex-1">
            <div className="relative w-96">
              <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input 
                type="text" 
                placeholder="Search jobs, profiles, or assets..." 
                className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-full py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-400 outline-none"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2.5 bg-slate-100 dark:bg-slate-900 rounded-full text-slate-500 hover:text-primary transition-colors relative">
              <span className="material-icons-outlined text-xl">notifications_none</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-950"></span>
            </button>
            
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1">Jane Doe</p>
                <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Franchise Admin</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-primary-300 text-white flex items-center justify-center font-bold shadow-md">
                JD
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>

      </div>
    </div>
  );
}
