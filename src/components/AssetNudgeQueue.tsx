'use client';

import { useState } from 'react';

// Mock Data
const MOCK_NUDGES = [
  {
    id: 'asset-1',
    job_address: '4242 Beverly Blvd, Los Angeles, CA',
    asset_name: 'Boundary Images',
    hours_until_shoot: 18,
  },
  {
    id: 'asset-2',
    job_address: '100 Sunset Strip, West Hollywood, CA',
    asset_name: 'Floor Plan PDF',
    hours_until_shoot: 22,
  }
];

export default function AssetNudgeQueue() {
  const [nudges, setNudges] = useState(MOCK_NUDGES);

  const handleAction = (id: string) => {
    setNudges(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-red-200 dark:border-red-900 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <span className="material-icons-outlined text-red-500">warning_amber</span>
        <h2 className="text-lg font-black text-slate-900 dark:text-white">Action Required: Missing Assets</h2>
        <span className="bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300 text-xs font-bold px-2 py-0.5 rounded-full ml-auto">
          {nudges.length} Pending
        </span>
      </div>

      <p className="text-sm text-slate-500 mb-6">These shoots are scheduled within the next 24 hours but are still missing required assets.</p>

      {nudges.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
          <span className="material-icons-outlined text-4xl text-green-500 mb-2">check_circle</span>
          <p className="font-bold text-slate-700 dark:text-slate-300">All caught up!</p>
          <p className="text-xs text-slate-500">No missing assets for upcoming shoots.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {nudges.map(nudge => (
            <div key={nudge.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-100 dark:border-red-900 gap-4">
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{nudge.job_address}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-bold text-red-600 dark:text-red-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-red-200 dark:border-red-800">
                    {nudge.asset_name}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-500">
                    Shoot in {nudge.hours_until_shoot}h
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => handleAction(nudge.id)}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 transition-colors shadow-sm"
                >
                  Dismiss
                </button>
                <button 
                  onClick={() => handleAction(nudge.id)}
                  className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary dark:text-primary-300 text-xs font-bold rounded-lg transition-colors shadow-sm"
                >
                  Mark Received
                </button>
                <button 
                  onClick={() => handleAction(nudge.id)}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center gap-1"
                >
                  <span className="material-icons-outlined text-[14px]">send</span>
                  Send Template
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
