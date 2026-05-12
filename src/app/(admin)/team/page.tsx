'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function TeamManagementPage() {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [photographers, setPhotographers] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function fetchPhotographers() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'photographer');
        
        if (error) throw error;
        
        // Combine with mock data if none found to keep the demo looking good
        const displayData = data && data.length > 0 ? data : [
          {
            id: 'marcus-wright',
            full_name: 'Marcus Wright',
            role: 'Lead Photographer',
            email: 'm.wright@snapwise.co',
            region: 'Nelson, Tasman',
            status: 'Active'
          },
          {
            id: 'sarah-miller',
            full_name: 'Sarah Miller',
            role: 'Contractor',
            email: 'sarah.m@gmail.com',
            region: 'Awaiting Setup',
            status: 'Pending Invite'
          },
          {
            id: 'elena-rossi',
            full_name: 'Elena Rossi',
            role: 'Senior Associate',
            email: 'elena.r@snapwise.co',
            region: 'Richmond',
            status: 'Active'
          }
        ];
        
        setPhotographers(displayData);
      } catch (error) {
        console.error('Error fetching photographers:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPhotographers();
  }, [supabase]);

  return (
    <>
      <div className="flex-1 overflow-y-auto p-6 lg:p-12 space-y-6 relative">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Team Management</h1>
            <p className="text-base text-slate-500 dark:text-slate-400">Oversee your photographer network and manage system access.</p>
          </div>
          <button 
            onClick={() => setIsInviteOpen(true)}
            className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/30 hover:brightness-110 active:scale-95 transition-all"
          >
            Invite Photographer
          </button>
        </div>

        {/* Dashboard Stats / Asymmetric Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="col-span-1 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Total Team</p>
            <h3 className="text-4xl font-bold text-slate-900 dark:text-white mt-1">{photographers.length}</h3>
          </div>
          
          <div className="col-span-1 md:col-span-3 bg-primary/10 dark:bg-primary/5 p-4 rounded-xl border border-primary/20 flex items-center overflow-hidden relative">
            <div className="z-10 w-full">
              <h3 className="text-xl font-bold text-primary dark:text-primary-300">Performance Insight</h3>
              <p className="text-base text-primary/80 dark:text-primary-200/80 max-w-full mt-1">92% of your photographers are meeting their 24-hour delivery window this week.</p>
            </div>
            <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 transform translate-x-12 translate-y-4">
              <span className="material-icons text-[120px] text-primary">monitoring</span>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[11px] tracking-widest">Photographer</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[11px] tracking-widest">Contact</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[11px] tracking-widest">Service Areas</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[11px] tracking-widest">Status</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[11px] tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                      Loading photographers...
                    </td>
                  </tr>
                ) : (
                  photographers.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                            {p.full_name ? p.full_name.split(' ').map((n:any) => n[0]).join('') : '??'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-slate-100">{p.full_name}</div>
                            <div className="text-xs text-slate-500">{p.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{p.email}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {p.region ? p.region.split(',').map((r: string) => (
                            <span key={r} className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                              {r.trim()}
                            </span>
                          )) : <span className="text-xs italic text-slate-400">None</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase ${
                          p.status === 'Active' ? 'bg-success/20 text-success-700 dark:text-success' : 'bg-warning/20 text-warning-700 dark:text-warning'
                        }`}>
                          {p.status === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>}
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/team/${p.id}`} className="text-xs font-bold text-primary hover:text-primary-600 dark:hover:text-primary-400 transition-colors uppercase tracking-wider">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Slide-over Panel (Open State) */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-[60] overflow-hidden">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
            onClick={() => setIsInviteOpen(false)}
          ></div>
          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-md animate-in slide-in-from-right duration-300">
              <div className="h-full flex flex-col bg-white dark:bg-slate-900 shadow-2xl">
                <div className="px-6 py-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Invite New Photographer</h2>
                  <button 
                    onClick={() => setIsInviteOpen(false)}
                    className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <span className="material-icons">close</span>
                  </button>
                </div>
                <div className="flex-1 relative p-6 overflow-y-auto">
                  <form className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="font-bold text-slate-500 text-xs uppercase tracking-wider">First Name</label>
                        <input className="w-full border border-slate-200 dark:border-slate-800 rounded-lg p-3 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm" placeholder="e.g. Julian" type="text" />
                      </div>
                      <div className="space-y-2">
                        <label className="font-bold text-slate-500 text-xs uppercase tracking-wider">Last Name</label>
                        <input className="w-full border border-slate-200 dark:border-slate-800 rounded-lg p-3 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm" placeholder="e.g. Sanchez" type="text" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="font-bold text-slate-500 text-xs uppercase tracking-wider">Email Address</label>
                      <input className="w-full border border-slate-200 dark:border-slate-800 rounded-lg p-3 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm" placeholder="julian@agency.com" type="email" />
                      <p className="text-[11px] text-slate-400 italic leading-relaxed">They will configure their Service Areas and profile via the invite link.</p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/50">
                      <div className="flex justify-between items-center">
                        <label className="font-bold text-slate-500 text-xs uppercase tracking-wider">Internal Pay Rate</label>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center gap-1">
                          <span className="material-icons text-[10px]">visibility_off</span>
                          Admin Only
                        </span>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                        <input className="w-full border border-slate-200 dark:border-slate-800 rounded-lg p-3 pl-7 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm" placeholder="0.00" type="number" step="0.01" min="0" />
                      </div>
                      <p className="text-[11px] text-slate-400 italic leading-relaxed">This rate is hidden from the photographer and used only for internal profit calculations.</p>
                    </div>
                    <div className="pt-6">
                      <div className="p-4 rounded-xl bg-success/10 border border-success/20 flex gap-3">
                        <span className="material-icons text-success">info</span>
                        <p className="text-xs text-success-700 dark:text-success-300">Snapwise invites grant limited dashboard access until the photographer completes their onboarding verification.</p>
                      </div>
                    </div>
                  </form>
                </div>
                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-3">
                  <button className="w-full bg-primary text-white py-3 rounded-xl font-bold shadow-lg shadow-primary/30 hover:brightness-110 active:scale-95 transition-all">
                    Send Invite
                  </button>
                  <button 
                    onClick={() => setIsInviteOpen(false)}
                    className="w-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-3 rounded-xl font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
