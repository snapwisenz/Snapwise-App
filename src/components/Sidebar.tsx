'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  role: string;
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const isManagerRole = role === 'owner' || role === 'admin';

  // All nav items — manager-only items are hidden from staff
  const allNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: 'dashboard', colorClass: 'primary', managerOnly: true },
    { name: 'Tasks', href: '/tasks', icon: 'assignment', colorClass: 'warning', managerOnly: false },
    { name: 'Bookings', href: '/bookings', icon: 'calendar_today', colorClass: 'success', managerOnly: false },
    { name: 'Agencies', href: '/agencies', icon: 'business', colorClass: 'secondary', managerOnly: true },
    { name: 'Team', href: '/settings/team', icon: 'groups', colorClass: 'accent', managerOnly: true },
    { name: 'Insights', href: '/insights', icon: 'insights', colorClass: 'primary', managerOnly: true },
  ];

  const navItems = allNavItems.filter(item => !item.managerOnly || isManagerRole);

  return (
    <aside className="w-[240px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col fixed h-full z-20">
      <div className="h-16 flex items-center px-6 gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Snapwise Logo" className="w-8 h-8 object-contain" />
        <span className="text-xl font-bold heading-font tracking-tight text-slate-900 dark:text-white">Snapwise</span>
      </div>
      
      <nav className="flex-1 mt-6">
        {navItems.map((item) => {
          // Check if current path matches or starts with the href (for subpages like /jobs/new)
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          
          let activeClasses = 'border-primary bg-primary/10 text-primary font-bold';
          if (isActive) {
            if (item.colorClass === 'warning') activeClasses = 'border-warning bg-warning/10 text-warning font-bold';
            if (item.colorClass === 'success') activeClasses = 'border-success bg-success/10 text-success font-bold';
            if (item.colorClass === 'secondary') activeClasses = 'border-secondary bg-secondary/10 text-secondary font-bold';
            if (item.colorClass === 'accent') activeClasses = 'border-accent bg-accent/10 text-accent font-bold';
          }
          
          return (
            <Link 
              key={item.name}
              href={item.href} 
              className={`flex items-center px-6 py-3 border-l-4 transition-colors group ${
                isActive 
                  ? activeClasses
                  : `border-transparent text-slate-500 hover:bg-neutral-soft dark:hover:bg-slate-800`
              }`}
            >
              <span className="material-icons mr-3 text-xl">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      {/* Settings link — only show for owners/admins */}
      {isManagerRole && (
        <div className="p-6">
          <Link 
            href="/settings" 
            className={`flex items-center px-4 py-3 rounded-xl transition-colors ${
              pathname.startsWith('/settings')
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <span className="material-icons mr-3 text-xl">settings</span>
            <span className="font-medium">Settings</span>
          </Link>
        </div>
      )}

      {/* For photographers, show a Profile link instead */}
      {!isManagerRole && (
        <div className="p-6">
          <Link 
            href="/settings/profile" 
            className={`flex items-center px-4 py-3 rounded-xl transition-colors ${
              pathname.startsWith('/settings/profile')
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <span className="material-icons mr-3 text-xl">person</span>
            <span className="font-medium">My Profile</span>
          </Link>
        </div>
      )}
    </aside>
  );
}
