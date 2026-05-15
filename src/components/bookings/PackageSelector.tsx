/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { memo } from 'react';

interface PackageSelectorProps {
  selectedAgent: string;
  packages: any[];
  selectedPackage: any;
  setSelectedPackage: (val: any) => void;
  setShowCustomModal: (val: boolean) => void;
  packageDetails: string;
  setPackageDetails: (val: string) => void;
  packageTbc: boolean;
  setPackageTbc: (val: boolean) => void;
  fallbackDuration: number;
  setFallbackDuration: (val: number) => void;
}

export const PackageSelector = memo(function PackageSelector({
  selectedAgent,
  packages,
  selectedPackage,
  setSelectedPackage,
  setShowCustomModal,
  packageDetails,
  setPackageDetails,
  packageTbc,
  setPackageTbc,
  fallbackDuration,
  setFallbackDuration
}: PackageSelectorProps) {
  return (
    <section className={`space-y-6 transition-opacity duration-300 ${selectedAgent ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
      <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
        <span className="material-icons-outlined text-base">inventory_2</span> 2. Packages &amp; Duration
      </h2>
      
      {!selectedAgent ? (
        <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center text-slate-500 text-sm">
          Please select an Agent to view their specific packages.
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Agent Preloaded Packages</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {packages.map(pkg => {
              const isSelected = selectedPackage?.name === pkg.name;
              return (
                <button 
                  key={pkg.id}
                  onClick={() => setSelectedPackage({ name: pkg.name, duration: 2, price: `$${pkg.price}` })}
                  className={`p-5 rounded-2xl text-left transition-all shadow-sm border-2 ${isSelected ? 'border-primary bg-primary/5 ring-offset-2' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary/50'}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${isSelected ? 'bg-primary/10 text-primary' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                    <span className="material-icons-outlined text-xl">workspace_premium</span>
                  </div>
                  <p className={`font-bold text-sm ${isSelected ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}>{pkg.name}</p>
                  <p className="text-xs text-slate-500 mt-1">2hr • {pkg.ground_photos_qty} Photos, {pkg.drone_qty} Drone</p>
                  <p className={`font-bold text-sm mt-3 ${isSelected ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}>${pkg.price}</p>
                </button>
              )
            })}
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setShowCustomModal(true);
              }}
              className={`p-5 rounded-2xl transition-all shadow-sm border-2 ${selectedPackage?.name === 'Custom Package' ? 'border-primary bg-primary/5 ring-offset-2 text-left' : 'border-dashed border-slate-300 text-center flex flex-col items-center justify-center hover:bg-slate-50'}`}
            >
              {selectedPackage?.name === 'Custom Package' ? (
                <>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3 bg-primary/10 text-primary">
                    <span className="material-icons-outlined text-xl">tune</span>
                  </div>
                  <p className="font-bold text-sm text-primary">Custom Package</p>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1" title={selectedPackage.photos || 'Custom'}>2hr • {selectedPackage.photos || 'Custom'}</p>
                  <p className="font-bold text-sm mt-3 text-primary">{selectedPackage.price}</p>
                </>
              ) : (
                <>
                  <span className="material-icons-outlined text-slate-400 mb-1">add</span>
                  <p className="text-xs font-bold text-slate-400 uppercase">Custom</p>
                </>
              )}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 space-y-3">
            <label className="block text-xs font-semibold text-slate-500 ml-1">Package Details</label>
            <textarea 
              value={packageDetails}
              onChange={(e) => setPackageDetails(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-primary min-h-[80px]" 
              placeholder="e.g. Needs drone shots of the backyard..."
            />
            <label className="flex items-center gap-2 cursor-pointer ml-1 w-fit">
              <input 
                type="checkbox" 
                checked={packageTbc}
                onChange={(e) => setPackageTbc(e.target.checked)}
                className="w-4 h-4 text-warning rounded border-slate-300 focus:ring-warning" 
              />
              <span className="text-xs font-semibold text-slate-500">To Be Confirmed</span>
            </label>

            {(packageTbc || !selectedPackage) && (
              <div className="mt-4 p-4 bg-warning/5 border border-warning/20 rounded-xl space-y-2.5">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Estimated Duration <span className="font-normal normal-case text-slate-400">(For Scheduling)</span>
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFallbackDuration(60)}
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      fallbackDuration === 60
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-primary/50'
                    }`}
                  >
                    1 Hour
                  </button>
                  <button
                    type="button"
                    onClick={() => setFallbackDuration(120)}
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      fallbackDuration === 120
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-primary/50'
                    }`}
                  >
                    2 Hours
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">This estimate is used to calculate scheduling gaps and travel times until the actual package is confirmed.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
});
