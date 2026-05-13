'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function BookingDetailsPage({ params }: { params: { id: string } }) {
  const [booking, setBooking] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskText, setNewTaskText] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const [{ data: bData }, { data: tData }] = await Promise.all([
        supabase.from('bookings').select('*, agent:agents(*), package:packages(*)').eq('id', params.id).single(),
        supabase.from('tasks').select('*').eq('job_id', params.id).order('created_at', { ascending: true })
      ]);
      if (bData) setBooking(bData);
      if (tData) setTasks(tData);
      setLoading(false);
    }
    fetchData();
  }, [params.id, supabase]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    setIsAddingTask(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newTask = {
      user_id: user.id,
      job_id: params.id,
      description: newTaskText,
      task_type: 'manual'
    };

    const { data, error } = await supabase.from('tasks').insert([newTask]).select();
    
    if (!error && data) {
      setTasks(prev => [...prev, data[0]]);
      setNewTaskText('');
    } else {
      console.error(error);
    }
    setIsAddingTask(false);
  };

  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, is_completed: !currentStatus } : t));
    await supabase.from('tasks').update({ is_completed: !currentStatus }).eq('id', taskId);
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center flex-col">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Booking not found</h2>
        <Link href="/bookings" className="text-primary hover:underline mt-2">Return to bookings</Link>
      </div>
    );
  }

  const coreTasks = tasks.filter(t => t.task_type === 'core');
  const generalTasks = tasks.filter(t => t.task_type !== 'core');

  // Format date safely
  let dateDisplay = "TBD";
  if (booking.start_time) {
    const d = new Date(booking.start_time);
    dateDisplay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + 
      " | " + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  return (
    <>
      {/* Sub-Header / Page Header */}
      <div className="bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/10 py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col">
            <nav className="flex items-center gap-2 mb-1 text-sm text-slate-500 dark:text-slate-400">
              <Link href="/bookings" className="hover:text-primary transition-colors flex items-center gap-1">
                <span className="material-icons-outlined text-sm">arrow_back</span>
                Back to Bookings
              </Link>
              <span>/</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">Booking Details</span>
            </nav>
            <h1 className="text-2xl font-bold tracking-tight">{booking.shoot_location || 'No Location Provided'}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-6 py-2.5 rounded-full border-2 border-primary text-primary font-semibold hover:bg-primary/5 transition-all">
              Reschedule
            </button>
            <button className="px-6 py-2.5 rounded-full bg-error text-white font-semibold hover:bg-opacity-90 shadow-lg shadow-error/20 transition-all">
              Cancel Booking
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Property Details */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Status & Summary Card */}
            <div className="bg-white dark:bg-slate-900/50 p-6 rounded-xl border border-success/5 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center text-success">
                  <span className="material-icons-outlined">home_work</span>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Booking Status</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold border flex items-center gap-1 ${
                      booking.status === 'pending' ? 'bg-warning/20 text-warning-700 border-warning/30' : 
                      booking.status === 'completed' ? 'bg-success/20 text-success-700 border-success/30' : 
                      'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${booking.status === 'pending' ? 'bg-warning' : booking.status === 'completed' ? 'bg-success' : 'bg-slate-400'}`}></span>
                      {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Order ID</p>
                <p className="font-bold text-slate-800 dark:text-slate-200">#{booking.id.substring(0, 8).toUpperCase()}</p>
              </div>
            </div>

            {/* Editable Details Grid */}
            <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-success/5 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h2 className="font-bold text-lg">Detailed Information</h2>
                <span className="text-xs text-slate-400">Click icon to edit fields</span>
              </div>
              <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                
                {/* Date & Time */}
                <div className="p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors flex justify-between items-center group">
                  <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-4">
                    <div className="text-slate-500 text-sm font-medium flex items-center gap-2">
                      <span className="material-icons-outlined text-success/60 text-lg">calendar_today</span>
                      Date &amp; Time
                    </div>
                    <div className="md:col-span-2 flex justify-between items-center">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{dateDisplay}</p>
                      <button className="p-2 rounded-lg text-success/40 hover:text-success hover:bg-success/10 transition-all opacity-0 group-hover:opacity-100">
                        <span className="material-icons-outlined text-sm">edit</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Agent */}
                <div className="p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors flex justify-between items-center group">
                  <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-4">
                    <div className="text-slate-500 text-sm font-medium flex items-center gap-2">
                      <span className="material-icons-outlined text-success/60 text-lg">person</span>
                      Listing Agent
                    </div>
                    <div className="md:col-span-2 flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{booking.agent?.name || 'Unassigned'}</p>
                        <p className="text-xs text-slate-400">{booking.agent?.email || 'No email provided'}</p>
                      </div>
                      <button className="p-2 rounded-lg text-success/40 hover:text-success hover:bg-success/10 transition-all opacity-0 group-hover:opacity-100">
                        <span className="material-icons-outlined text-sm">edit</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Package & Price */}
                <div className="p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors flex justify-between items-center group">
                  <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-4">
                    <div className="text-slate-500 text-sm font-medium flex items-center gap-2">
                      <span className="material-icons-outlined text-success/60 text-lg">inventory_2</span>
                      Package
                    </div>
                    <div className="md:col-span-2 flex justify-between items-center">
                      <div className="flex flex-col">
                        <p className="font-bold text-slate-800 dark:text-slate-200">{booking.package?.name || 'Custom Package'}</p>
                        <div className="text-xs text-slate-500 mt-1 space-y-1">
                          {booking.deliverables?.map((del: any, idx: number) => (
                            <p key={idx}>- {del.name} {del.qty ? `(${del.qty})` : ''}</p>
                          ))}
                        </div>
                      </div>
                      <button className="p-2 rounded-lg text-success/40 hover:text-success hover:bg-success/10 transition-all opacity-0 group-hover:opacity-100">
                        <span className="material-icons-outlined text-sm">edit</span>
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Smart Task Fields summary (optional info area) */}
            {(booking.package_details || booking.key_box_pin) && (
              <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-success/5 shadow-sm p-6">
                <h3 className="font-bold text-lg mb-4">Submission Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {booking.package_details && (
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Package Notes</p>
                      <p className="text-sm mt-1">{booking.package_details}</p>
                    </div>
                  )}
                  {booking.key_box_pin && (
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Key Box PIN</p>
                      <p className="text-sm mt-1">{booking.key_box_pin}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
          </div>

          {/* Right Column: Tasks Sidebar */}
          <div className="lg:col-span-4 space-y-6">

            {/* Core Tasks */}
            <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-warning/20 shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-5 border-b border-warning/10 bg-warning/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-icons-outlined text-warning">fact_check</span>
                  <h3 className="font-bold text-slate-800 dark:text-slate-200">Core Requirements</h3>
                </div>
                <span className="text-[10px] font-bold text-warning-600 bg-warning/20 px-2 py-1 rounded-full">{coreTasks.length} ITEMS</span>
              </div>
              <div className="p-6 flex-grow space-y-4">
                {coreTasks.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">No core requirements flagged.</p>
                ) : (
                  coreTasks.map(task => (
                    <label key={task.id} className="flex items-start gap-3 cursor-pointer group">
                      <div className="relative flex items-center mt-0.5">
                        <input 
                          type="checkbox" 
                          checked={task.is_completed}
                          onChange={() => handleToggleTask(task.id, task.is_completed)}
                          className="peer w-5 h-5 appearance-none rounded border-2 border-slate-300 dark:border-slate-600 checked:bg-warning checked:border-warning transition-all" 
                        />
                        <span className="material-icons-outlined absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-sm opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity">check</span>
                      </div>
                      <div>
                        <p className={`text-sm font-semibold transition-colors ${task.is_completed ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-slate-200 group-hover:text-warning'}`}>{task.description}</p>
                        {task.notes && (
                          <p className={`text-xs mt-1 ${task.is_completed ? 'text-slate-400' : 'text-slate-500'}`}>{task.notes}</p>
                        )}
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>
            
            {/* General Tasks Panel */}
            <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-primary/10 shadow-sm flex flex-col">
              <div className="px-6 py-5 border-b border-primary/10 bg-primary/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-icons-outlined text-primary">task_alt</span>
                  <h3 className="font-bold text-slate-800 dark:text-slate-200">General Tasks</h3>
                </div>
                <span className="text-[10px] font-bold text-primary-600 bg-primary/20 px-2 py-1 rounded-full">{generalTasks.length} ITEMS</span>
              </div>
              
              <div className="p-6 flex-grow space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar">
                {generalTasks.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">No general tasks. Add one below!</p>
                ) : (
                  generalTasks.map(task => (
                    <label key={task.id} className="flex items-start gap-3 cursor-pointer group">
                      <div className="relative flex items-center mt-0.5">
                        <input 
                          type="checkbox" 
                          checked={task.is_completed}
                          onChange={() => handleToggleTask(task.id, task.is_completed)}
                          className="peer w-5 h-5 appearance-none rounded border-2 border-slate-300 dark:border-slate-600 checked:bg-primary checked:border-primary transition-all" 
                        />
                        <span className="material-icons-outlined absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-sm opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity">check</span>
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-semibold transition-colors ${task.is_completed ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-slate-200 group-hover:text-primary'}`}>{task.description}</p>
                      </div>
                    </label>
                  ))
                )}
              </div>

              {/* Add Task Input */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 rounded-b-xl">
                <form onSubmit={handleAddTask} className="flex gap-2">
                  <input 
                    type="text" 
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    placeholder="Add a new task..."
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                  <button 
                    type="submit"
                    disabled={isAddingTask || !newTaskText.trim()}
                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    Add
                  </button>
                </form>
              </div>
            </div>

            {/* Quick Actions / Meta */}
            <div className="bg-gradient-to-br from-success/10 to-transparent p-6 rounded-xl border border-success/10">
              <h4 className="font-bold mb-4 text-sm">Activity Timeline</h4>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="relative">
                    <div className="w-2 h-2 rounded-full bg-slate-300 mt-1.5"></div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500">Booking Created</p>
                    <p className="text-[10px] text-slate-500">Just now</p>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </main>
    </>
  );
}
