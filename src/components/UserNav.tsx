'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

interface UserNavProps {
  fullName: string;
  roleTitle: string;
  avatarUrl: string;
  email: string;
}

export default function UserNav({ fullName, roleTitle, avatarUrl, email }: UserNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 text-left"
      >
        <div className="hidden sm:block text-right">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{fullName}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{roleTitle}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20 overflow-hidden shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={avatarUrl} alt="User Profile" className="w-full h-full object-cover" />
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden z-50 origin-top-right animate-in fade-in zoom-in-95 duration-200">
          <div className="px-4 py-3 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{fullName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{email}</p>
          </div>
          
          <div className="p-1">
            <Link 
              href="/settings/profile" 
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <span className="material-icons text-[18px]">person</span>
              Profile Settings
            </Link>
          </div>
          
          <div className="h-px bg-slate-200 dark:bg-slate-800 my-1" />
          
          <div className="p-1">
            <button 
              onClick={() => {
                setIsOpen(false);
                handleSignOut();
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors"
            >
              <span className="material-icons text-[18px]">logout</span>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
