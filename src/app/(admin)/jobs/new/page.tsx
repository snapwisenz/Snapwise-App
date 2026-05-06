'use client';

import { useState } from 'react';

export default function NewJobPage() {
  const [address, setAddress] = useState('');
  const [travelTime, setTravelTime] = useState<{ raw: number; rounded: number } | null>(null);
  const [loadingRouting, setLoadingRouting] = useState(false);
  const [overlapWarning, setOverlapWarning] = useState(false);

  // Mock previous job address for demo
  const PREVIOUS_JOB = "123 Main St, Los Angeles, CA";

  const calculateTravel = async () => {
    if (!address) return;
    
    setLoadingRouting(true);
    setOverlapWarning(false);
    try {
      const res = await fetch(`/api/routing?origin=${encodeURIComponent(PREVIOUS_JOB)}&destination=${encodeURIComponent(address)}`);
      const data = await res.json();
      
      if (data.success) {
        setTravelTime({
          raw: Math.round(data.raw_minutes),
          rounded: data.rounded_minutes
        });
        
        // Mock overlap check
        if (data.rounded_minutes > 30) {
          setOverlapWarning(true);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingRouting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button className="w-10 h-10 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-primary transition-colors">
          <span className="material-icons-outlined">arrow_back</span>
        </button>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Create New Job</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="material-icons-outlined text-primary">location_on</span>
              Location Details
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Job Address</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter full property address"
                    className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                  <button 
                    onClick={calculateTravel}
                    disabled={!address || loadingRouting}
                    className="px-6 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition-colors disabled:opacity-50"
                  >
                    {loadingRouting ? 'Calculating...' : 'Calc Route'}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button className="text-sm font-bold text-primary hover:text-primary-700 flex items-center gap-1 transition-colors">
                  <span className="material-icons-outlined text-lg">pin_drop</span>
                  Address not found? Drop a pin manually
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="material-icons-outlined text-primary">assignment</span>
              Requirements
            </h2>
            <div className="flex gap-4">
              <label className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:border-primary/50 transition-colors flex-1">
                <input type="checkbox" className="w-5 h-5 text-primary rounded focus:ring-primary" />
                <span className="font-bold">Requires Drone</span>
              </label>
              <label className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:border-primary/50 transition-colors flex-1">
                <input type="checkbox" className="w-5 h-5 text-primary rounded focus:ring-primary" />
                <span className="font-bold">Requires Tide Match</span>
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-b from-primary/10 to-transparent p-6 rounded-2xl border border-primary/10">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Routing Insights</h3>
            
            {travelTime ? (
              <div className="space-y-4">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-primary/5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Raw Travel Time</p>
                  <p className="text-xl font-bold">{travelTime.raw} mins</p>
                </div>
                
                <div className="bg-primary p-4 rounded-xl shadow-md text-white">
                  <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-1 flex items-center justify-between">
                    Paige Rule Applied
                    <span className="material-icons-outlined text-sm">verified</span>
                  </p>
                  <p className="text-2xl font-black">{travelTime.rounded} mins</p>
                  <p className="text-xs text-white/80 mt-2">+ 40 min Upload Buffer</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Enter an address to calculate driving times from the previous shoot.</p>
            )}
          </div>

          {overlapWarning && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-4 rounded-xl flex gap-3 animate-pulse">
              <span className="material-icons-outlined text-orange-500">warning</span>
              <div>
                <p className="font-bold text-orange-800 dark:text-orange-200 text-sm">Upload Buffer Overlap</p>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">This booking time cuts into a 40-minute upload buffer. Are you sure you want to proceed?</p>
              </div>
            </div>
          )}

          <button className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-lg">
            Create Booking
          </button>
        </div>
      </div>
    </div>
  );
}
