'use client';

import { useState } from 'react';

// Mock Data
const MOCK_TASKS = [
  {
    id: 'task-1',
    job_address: '4242 Beverly Blvd, Los Angeles, CA',
    asset_name: 'Boundary Images',
    hours_until_shoot: 18,
  },
  {
    id: 'task-2',
    job_address: '100 Sunset Strip, West Hollywood, CA',
    asset_name: 'Floor Plan PDF',
    hours_until_shoot: 22,
  }
];

export default function TasksPage() {
  const [tasks, setTasks] = useState(MOCK_TASKS);

  const handleAction = (id: string) => {
    setTasks(prev => prev.filter(n => n.id !== id));
  };

  return (
    <main className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Pending Tasks</h1>
        <p className="text-slate-500 mt-2">Manage missing assets and required actions before upcoming shoots.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="material-icons-outlined text-warning">pending_actions</span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Missing Assets</h2>
          </div>
          <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold px-3 py-1 rounded-full">
            {tasks.length} Pending
          </span>
        </div>

        {tasks.length === 0 ? (
          <div className="p-12 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="material-icons-outlined text-4xl text-success mb-3">check_circle</span>
            <p className="font-bold text-slate-700 dark:text-slate-300">All caught up!</p>
            <p className="text-sm text-slate-500 mt-1">No missing assets for upcoming shoots.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map(task => (
              <div key={task.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700 gap-4 hover:shadow-sm transition-shadow">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white mb-2">{task.job_address}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                      Missing: {task.asset_name}
                    </span>
                    <span className="text-xs font-bold text-warning flex items-center gap-1">
                      <span className="material-icons-outlined text-[14px]">schedule</span>
                      Shoot in {task.hours_until_shoot}h
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={() => handleAction(task.id)}
                    className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-lg border border-slate-200 dark:border-slate-700 transition-colors shadow-sm"
                  >
                    Dismiss
                  </button>
                  <button 
                    onClick={() => handleAction(task.id)}
                    className="px-4 py-2 bg-primary hover:opacity-90 text-white text-sm font-bold rounded-lg transition-colors shadow-sm flex items-center gap-2"
                  >
                    <span className="material-icons-outlined text-[16px]">send</span>
                    Send Reminder
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
