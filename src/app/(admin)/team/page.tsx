'use client';

import { useState } from 'react';

export default function TeamManagementPage() {
  const [isInviteOpen, setIsInviteOpen] = useState(false);

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
          <div className="col-span-1 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Total Team</p>
            <h3 className="text-4xl font-bold text-slate-900 dark:text-white mt-1">24</h3>
          </div>
          
          <div className="col-span-1 md:col-span-3 bg-primary/10 dark:bg-primary/5 p-6 rounded-xl border border-primary/20 flex items-center justify-between overflow-hidden relative">
            <div className="z-10">
              <h3 className="text-xl font-bold text-primary dark:text-primary-300">Performance Insight</h3>
              <p className="text-base text-primary/80 dark:text-primary-200/80 max-w-md mt-1">92% of your photographers are meeting their 24-hour delivery window this week.</p>
            </div>
            <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 transform translate-x-12 translate-y-4">
              <span className="material-symbols-outlined text-[120px] text-primary">monitoring</span>
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
                {/* Row 1 */}
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCpa8eGF6S3R1CtgQ9qCbUy2gd5Fh9ZuytiVvEEZ5TbEpQCQ6YvRw9NxD8teHcWiGDAhQiepdB9cCjNIf4CJW56NHmRhUR4Fz7hr_zpV05aKec6Hf8IjjxAVp6SpZEhhy0YgHR0DXsW7QXlCjJIqlp4Rct9O4rTMZA9dQABJSYOMd0FJyMzYkbepmwWUSGpuSN88r4dKmVh6M1Ho6gLdrIBOwOAyePv0BEsbv3mdn1snvQx_TfCXqVBO9NUvYZAA9LZkYRyDG-UcSE" alt="Marcus Wright" className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800" />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100">Marcus Wright</div>
                        <div className="text-xs text-slate-500">Lead Photographer</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">m.wright@snapwise.co</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300">Nelson</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300">Tasman</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/20 text-success-700 dark:text-success text-[11px] font-extrabold uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </td>
                </tr>
                {/* Row 2 */}
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-warning/20 text-warning-700 dark:text-warning flex items-center justify-center font-bold">SM</div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100">Sarah Miller</div>
                        <div className="text-xs text-slate-500">Contractor</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">sarah.m@gmail.com</td>
                  <td className="px-6 py-4">
                    <span className="text-xs italic text-slate-400">Awaiting Setup</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-warning/20 text-warning-700 dark:text-warning text-[11px] font-extrabold uppercase">
                      Pending Invite
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </td>
                </tr>
                {/* Row 3 */}
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAi_LuyYAl24NHjdtgc7CTXE91tiYPPl1O0euJx8KI9rBKBm5Uyt3CAO35BakcsZyRqlTRVUH60v4ktLuxSnPDG3zFeIV5Ucn8wAzqsLutXsJh9Q8Q2tAEHOpEmCztVj6XNpwjQ-EExP0JZuOubD7Cz_JxCWnv18fYCeUQaqwEfsjur3S_6p310Ai1kwXqFwP-5I9DrXdX80X5liJvZYGhIAKwDQBMHkjH_gPLBZEAhhoQs02oLzGDP7vA-F7PvQoSO3Uc1SsA9OUY" alt="Elena Rossi" className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800" />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100">Elena Rossi</div>
                        <div className="text-xs text-slate-500">Senior Associate</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">elena.r@snapwise.co</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300">Richmond</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/20 text-success-700 dark:text-success text-[11px] font-extrabold uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </td>
                </tr>
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
                    <span className="material-symbols-outlined">close</span>
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
                    <div className="pt-6">
                      <div className="p-4 rounded-xl bg-success/10 border border-success/20 flex gap-3">
                        <span className="material-symbols-outlined text-success">info</span>
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
