/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useMemo, memo } from 'react';
import { CalendarSlot } from './CalendarSlot';
import { format, addDays } from 'date-fns';

interface SmartScheduleGridProps {
  scheduleReady: boolean;
  effectiveDuration: number;
  idealMode: boolean;
  setIdealMode: (val: boolean) => void;
  loadingSuggestions: boolean;
  suggestions: any[];
  selectedPhotographer: string | null;
  setSelectedPhotographer: (val: string | null) => void;
  setManualSlot: (val: any) => void;
  activeTab: string;
  setActiveTab: (val: string) => void;
  manualSlot: any;
  manualSlotHasConflict: boolean;
  handleGridClick: (dayIdx: number, hourIdx: number) => void;
  bookingStatus: 'confirmed' | 'pending';
  setBookingStatus: (val: 'confirmed' | 'pending') => void;
  // Events will be wired to real data in phase 2.
  events: any[];
  checkSlotConflict: (dayIdx: number, topPx: number, heightPx: number, events: any[]) => boolean;
}

export const SmartScheduleGrid = memo(function SmartScheduleGrid({
  scheduleReady,
  effectiveDuration,
  idealMode,
  setIdealMode,
  loadingSuggestions,
  suggestions,
  selectedPhotographer,
  setSelectedPhotographer,
  setManualSlot,
  activeTab,
  setActiveTab,
  manualSlot,
  manualSlotHasConflict,
  handleGridClick,
  bookingStatus,
  setBookingStatus,
  events,
  checkSlotConflict
}: SmartScheduleGridProps) {

  // Dynamically extract photographers from suggestions, or leave empty.
  const photographers = useMemo(() => {
    const unique = new Map();
    suggestions.forEach(s => {
      if (!unique.has(s.photographer_id)) {
        unique.set(s.photographer_id, {
          id: s.photographer_id,
          name: s.name,
          initial: s.name ? s.name.charAt(0) : '?',
        });
      }
    });
    return Array.from(unique.values());
  }, [suggestions]);

  // Dynamic Dates for header (Start from next Monday for demo, or today. Let's use today as Mon)
  // To keep it simple and clean, let's just generate the next 7 days from today.
  const weekDays = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }).map((_, i) => addDays(today, i));
  }, []);

  return (
    <section className={`space-y-6 transition-opacity duration-300 ${scheduleReady ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
      <details className="group" open>
        <summary className="flex items-center justify-between cursor-pointer list-none">
          <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
            <span className="material-icons-outlined text-base">calendar_today</span> 3. Smart Schedule
          </h2>
          <span className="material-icons-outlined text-slate-400 group-open:rotate-180 transition-transform">expand_more</span>
        </summary>
        
        {!scheduleReady ? (
            <div className="mt-6 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center text-slate-500 text-sm">
            Select a package to calculate required booking duration.
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {/* Selected Duration Info */}
            <div className="flex items-center gap-3 p-3 rounded-xl border bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <span className="material-icons-outlined text-slate-500">schedule</span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Calculating availability for <strong className="text-primary">{effectiveDuration}-hour</strong> duration.
                </span>
            </div>

            {/* AI Smart Suggestions */}
            <div className="bg-primary/5 dark:bg-primary/10 rounded-2xl p-6 border border-primary/20">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  <h3 className="font-bold text-slate-900 dark:text-white">AI Smart Suggestions</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Show All Available Slots</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={idealMode}
                      onChange={(e) => setIdealMode(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loadingSuggestions ? (
                  <div className="col-span-2 py-8 flex flex-col items-center justify-center text-primary/50">
                    <span className="material-symbols-outlined animate-spin text-3xl mb-2">progress_activity</span>
                    <p className="text-sm font-semibold">Calculating best routes...</p>
                  </div>
                ) : suggestions.length > 0 ? (
                  suggestions.map((suggestion, index) => {
                    const isSelected = selectedPhotographer === suggestion.photographer_id;
                    return (
                      <div 
                        key={suggestion.photographer_id}
                        onClick={() => { setSelectedPhotographer(suggestion.photographer_id); setManualSlot(null); }}
                        className={`bg-white dark:bg-slate-900 p-4 rounded-xl cursor-pointer hover:shadow-md transition-all group ${isSelected ? 'border-2 border-primary ring-2 ring-primary/20 shadow-md' : 'border border-slate-200 dark:border-slate-700 hover:border-primary/50'}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className={`font-bold text-lg block ${isSelected ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>{suggestion.suggested_time || '09:00 AM'} - {suggestion.name}</span>
                            <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">
                              {index === 0 ? 'Top Pick' : 'Alternative'}
                            </span>
                          </div>
                          {isSelected && <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>}
                        </div>
                        {suggestion.insight_text && (
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{suggestion.insight_text}</p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {suggestion.reasons?.map((r: string, i: number) => (
                            <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md text-[10px] font-bold uppercase">
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-2 py-6 flex flex-col items-center justify-center text-slate-400">
                    <span className="material-icons-outlined text-3xl mb-2">search_off</span>
                    <p className="text-sm font-semibold">No AI suggestions available for this address and package.</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Dispatch Timeline */}
            <div>
              <div className="flex justify-between items-end mb-4">
                <h3 className="font-bold text-slate-900 dark:text-white">Live Availability</h3>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
                  </span>
                  <div className="flex gap-1">
                    <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <span className="material-icons-outlined text-sm">chevron_left</span>
                    </button>
                    <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <span className="material-icons-outlined text-sm">chevron_right</span>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Photographer Tabs */}
              {photographers.length > 0 && (
                <div className="flex gap-2 mb-4 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
                  {photographers.map(p => (
                    <button 
                      key={p.id}
                      onClick={() => setActiveTab(p.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === p.id ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              )}

              <div className="border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-sm overflow-x-auto custom-scrollbar">
                <div className="min-w-[800px]">
                  {/* Timeline Header (Days of Week) */}
                  <div className="grid grid-cols-[80px_repeat(7,1fr)] bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                    <div className="p-4 border-r border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-400 text-center flex items-center justify-center uppercase tracking-wider">TIME</div>
                    {weekDays.map((date, idx) => (
                      <div key={idx} className="p-4 text-center text-xs font-bold text-slate-500 uppercase">
                        {format(date, 'E d')}
                      </div>
                    ))}
                  </div>
                  
                  {/* Grid Rows for Hours */}
                  <div className="relative">
                    <div className="grid grid-cols-[80px_repeat(7,1fr)] divide-x divide-slate-100 dark:divide-slate-800">
                      {/* Time Column */}
                      <div className="border-r border-slate-200 dark:border-slate-700 flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
                        {['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'].map(time => (
                          <div key={time} className="h-20 flex items-start justify-center pt-2">
                            <span className="text-[10px] font-bold text-slate-400">{time}</span>
                          </div>
                        ))}
                      </div>
                      
                      {/* Mon-Sun Columns */}
                      {[0, 1, 2, 3, 4, 5, 6].map(dayIdx => (
                        <div key={dayIdx} className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800 relative group/day">
                          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(hourIdx => (
                            <div 
                              key={hourIdx} 
                              onClick={() => handleGridClick(dayIdx, hourIdx)}
                              className="h-20 hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer group/cell transition-colors flex items-center justify-center p-1"
                            >
                              <div className="opacity-0 group-hover/cell:opacity-100 w-full h-full border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex items-center justify-center bg-white dark:bg-slate-900 transition-all">
                                <span className="material-symbols-outlined text-slate-400 text-sm">add</span>
                              </div>
                            </div>
                          ))}

                          {/* Render Events */}
                          {events.filter(e => e.dayIdx === dayIdx).map((e, idx) => {
                            const startOffset = e.startHour - 8;
                            const heightHours = e.endHour - e.startHour;
                            
                            // Prevent rendering if completely outside our 8am-6pm grid
                            if (startOffset + heightHours <= 0 || startOffset >= 10) return null;
                            
                            // Clamp to grid boundaries
                            const clampedOffset = Math.max(0, startOffset);
                            const clampedEnd = Math.min(10, startOffset + heightHours);
                            const clampedHeight = clampedEnd - clampedOffset;

                            const topPx = clampedOffset * 80;
                            const heightPx = clampedHeight * 80;

                            return (
                              <div 
                                key={`evt-${e.id}-${idx}`}
                                className={`absolute left-1 right-1 border-l-4 rounded-md p-1.5 z-10 overflow-hidden shadow-sm ${e.isExternal ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-400' : 'bg-slate-100 dark:bg-slate-800 border-slate-400'}`}
                                style={{ top: `${topPx}px`, height: `${heightPx}px` }}
                              >
                                <div className="text-[10px] font-bold leading-tight line-clamp-2 truncate" style={{ color: e.isExternal ? '#f97316' : '#64748b' }}>
                                  {e.isExternal && <span className="material-icons-outlined text-[10px] mr-1 align-text-bottom">event</span>}
                                  {e.title}
                                </div>
                              </div>
                            );
                          })}

                          {/* Render Manual Selection */}
                          {manualSlot && manualSlot.dayIdx === dayIdx && manualSlot.photographerId === activeTab && (
                            <CalendarSlot 
                              type="manual"
                              topPx={manualSlot.hourIdx * 80}
                              heightPx={Math.round(effectiveDuration * 80)}
                              isConflict={manualSlotHasConflict}
                            />
                          )}

                          {/* Render Selected Suggestion Slot */}
                          {/* We derive this dynamically based on suggestions. If selectedPhotographer is active, find its suggestion. */}
                          {selectedPhotographer && activeTab === selectedPhotographer && suggestions.find(s => s.photographer_id === selectedPhotographer) && (() => {
                             const suggestion = suggestions.find(s => s.photographer_id === selectedPhotographer);
                             // To perfectly map this to dayIdx/hourIdx, we'd parse suggestion.suggested_time
                             // For now, if we match the day (let's say day 1 for demo purposes), we render it.
                             // Wait, without real data, we can't reliably render suggestion slots on the grid because they don't have dayIdx/hourIdx in the mock payload.
                             // We will leave this clean and hook it up properly in Phase 2.
                             return null;
                          })()}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Status Toggle */}
            <div className="flex justify-center mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
              <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full flex gap-1 shadow-inner">
                <button 
                  onClick={() => setBookingStatus('confirmed')}
                  className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all ${bookingStatus === 'confirmed' ? 'bg-white dark:bg-slate-700 text-success shadow-sm' : 'bg-transparent shadow-none text-slate-500 hover:text-success'}`}
                >Confirmed</button>
                <button 
                  onClick={() => setBookingStatus('pending')}
                  className={`px-8 py-2.5 rounded-full text-sm font-semibold transition-all ${bookingStatus === 'pending' ? 'bg-white dark:bg-slate-700 text-warning shadow-sm' : 'bg-transparent shadow-none text-slate-500 hover:text-warning dark:hover:text-warning'}`}
                >Pending</button>
              </div>
            </div>

          </div>
        )}
      </details>
    </section>
  );
});
