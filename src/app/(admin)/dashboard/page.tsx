'use client';

import { useState } from 'react';
import AssetNudgeQueue from '@/components/AssetNudgeQueue';
import SmartEmailSidebar from '@/components/SmartEmailSidebar';

export default function DashboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="max-w-6xl mx-auto space-y-8 relative">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Dashboard</h1>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="bg-primary hover:bg-primary-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 shadow-lg transition-colors"
        >
          <span className="material-icons-outlined">auto_awesome</span>
          Open AI Email Assist
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <AssetNudgeQueue />
          
          {/* Placeholder for other dashboard content like recent jobs */}
          <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="material-icons-outlined text-primary">calendar_today</span>
              Upcoming Jobs
            </h2>
            <p className="text-sm text-slate-500">Your schedule is looking clear.</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Quick Stats Placeholder */}
          <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Quick Stats</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-sm">Jobs this week</span>
                <span className="font-bold">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-sm">Pending Assets</span>
                <span className="font-bold text-red-500">2</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isSidebarOpen && (
        <>
          <div 
            className="fixed inset-0 bg-slate-900/20 dark:bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
          <SmartEmailSidebar onClose={() => setIsSidebarOpen(false)} />
        </>
      )}
    </div>
  );
}
