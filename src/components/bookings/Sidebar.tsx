/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { memo } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface SidebarProps {
  showSidebar: boolean;
  setShowSidebar: (val: boolean) => void;
  pendingTasks: any[];
}

export const Sidebar = memo(function Sidebar({
  showSidebar,
  setShowSidebar,
  pendingTasks
}: SidebarProps) {
  return (
    <>
      <div 
        className={`hidden lg:flex absolute top-12 z-50 transition-all duration-300 ${showSidebar ? 'right-[400px]' : 'right-0'}`}
      >
        <button 
          onClick={() => setShowSidebar(!showSidebar)}
          className="bg-purple-50 dark:bg-slate-800 border border-r-0 border-slate-200 dark:border-slate-700 shadow-md py-4 px-1 rounded-l-md hover:bg-purple-100 dark:hover:bg-slate-700 transition-colors text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          title={showSidebar ? "Hide Tasks Sidebar" : "Show Tasks Sidebar"}
        >
          {showSidebar ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {showSidebar && (
        <aside className="hidden lg:flex w-[400px] bg-[#f9f5ff] dark:bg-background-dark/40 border-l border-primary/10 flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.02)]">
          {/* Quick Notes */}
          <div className="flex-1 flex flex-col">
            <div className="p-6 border-b border-primary/5 flex items-center justify-between bg-white/50">
              <div className="flex items-center gap-2">
                <span className="material-icons-outlined text-primary">edit_note</span>
                <h2 className="font-bold text-slate-800 dark:text-slate-200">Quick Notes</h2>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Saved
                </div>
              </div>
            </div>
            <div className="flex-1 p-6 flex flex-col overflow-y-auto custom-scrollbar">
              <textarea 
                className="w-full h-full bg-transparent border-none focus:ring-0 text-slate-700 dark:text-slate-300 resize-none leading-relaxed placeholder:text-slate-400 placeholder:italic text-sm" 
                placeholder="Type onsite instructions or call notes here..."
                defaultValue=""
              />
            </div>
          </div>

          {/* Tasks Section */}
          <div className="h-[400px] border-t border-primary/10 flex flex-col bg-white">
            <div className="p-6 border-b border-primary/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-icons-outlined text-warning">task_alt</span>
                <h2 className="font-bold text-slate-800 dark:text-slate-200">Pending Tasks</h2>
              </div>
              <span className="text-[10px] font-bold text-slate-400">{pendingTasks.length} REMAINING</span>
            </div>
            <div className="flex-1 p-6 space-y-4 overflow-y-auto custom-scrollbar">
              {pendingTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-70">
                  <span className="material-icons-outlined text-4xl mb-2">check_circle</span>
                  <p className="text-sm font-bold">All clear! No pending tasks.</p>
                </div>
              ) : (
                pendingTasks.map((task, idx) => (
                  <label key={idx} className="flex items-center gap-3 group cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 text-success rounded-lg border-slate-300 focus:ring-success" />
                    <span className="text-sm text-slate-600 group-hover:text-success transition-colors">{task.title}</span>
                  </label>
                ))
              )}
              <button className="w-full py-3 mt-4 border-2 border-dashed border-slate-200 rounded-2xl text-xs font-bold text-slate-400 hover:border-primary/40 hover:text-primary transition-all">
                + ADD TASK
              </button>
            </div>
          </div>

          <div className="p-6 border-t border-primary/5 space-y-4">
            <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
              <div className="flex items-start gap-3">
                <span className="material-icons-outlined text-primary text-sm mt-0.5">info</span>
                <div>
                  <p className="text-xs font-bold text-primary uppercase tracking-wide mb-1">Operator Pro Tip</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">Notes and tasks are synced to the photographer&apos;s field app in real-time.</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      )}
    </>
  );
});
