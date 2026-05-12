'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskJobId, setNewTaskJobId] = useState('');
  
  const supabase = createClient();

  // fetch data
  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    // Fetch pending tasks
    const { data: tasksData } = await supabase
      .from('tasks')
      .select('*, bookings(shoot_location)')
      .eq('is_completed', false)
      .order('created_at', { ascending: false });
      
    if (tasksData) setTasks(tasksData);

    // Fetch active/upcoming jobs for the dropdown
    const { data: bookingsData } = await supabase
      .from('bookings')
      .select('id, shoot_location')
      .in('status', ['pending', 'scheduled'])
      .order('created_at', { ascending: false });

    if (bookingsData) setBookings(bookingsData);
    setLoading(false);
  }

  const handleToggleComplete = async (taskId: string) => {
    // Optimistic update
    setTasks(prev => prev.filter(t => t.id !== taskId));
    
    // DB update
    await supabase
      .from('tasks')
      .update({ is_completed: true })
      .eq('id', taskId);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskDescription.trim()) return;

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const newTask = {
      user_id: userData.user.id,
      description: newTaskDescription,
      job_id: newTaskJobId || null,
      is_completed: false,
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert([newTask])
      .select('*, bookings(shoot_location)')
      .single();

    if (data) {
      setTasks([data, ...tasks]);
      setIsModalOpen(false);
      setNewTaskDescription('');
      setNewTaskJobId('');
    }
  };

  return (
    <main className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Pending Tasks</h1>
          <p className="text-slate-500 mt-2">Manage tasks and required actions before upcoming shoots.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:opacity-90 text-white font-bold py-2 px-4 rounded-lg shadow-sm flex items-center gap-2 transition-opacity"
        >
          <span className="material-icons-outlined text-[20px]">add</span>
          Add Task
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="material-icons-outlined text-warning">pending_actions</span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Active Tasks</h2>
          </div>
          <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold px-3 py-1 rounded-full">
            {tasks.length} Pending
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="p-12 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="material-icons-outlined text-4xl text-success mb-3">check_circle</span>
            <p className="font-bold text-slate-700 dark:text-slate-300">All caught up!</p>
            <p className="text-sm text-slate-500 mt-1">No pending tasks for upcoming shoots.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map(task => (
              <div key={task.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700 gap-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start gap-4">
                  <input 
                    type="checkbox" 
                    onChange={() => handleToggleComplete(task.id)}
                    className="mt-1 w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                  />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white mb-2">{task.description}</p>
                    {task.job_id && (
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                          Linked Job: {task.bookings?.shoot_location || 'Unknown Location'}
                        </span>
                      </div>
                    )}
                    {task.asset_name && !task.job_id && (
                       <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                          Missing: {task.asset_name}
                        </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {task.job_id && task.asset_name && (
                    <button 
                      className="px-4 py-2 bg-primary hover:opacity-90 text-white text-sm font-bold rounded-lg transition-colors shadow-sm flex items-center gap-2"
                    >
                      <span className="material-icons-outlined text-[16px]">send</span>
                      Send Reminder
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg p-6 overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="pb-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center w-full">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Add New Task</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <span className="material-icons-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleAddTask} className="pt-6 space-y-5 w-full flex flex-col">
              <div className="w-full">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Task Description</label>
                <input 
                  type="text" 
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  placeholder="e.g. Follow up on property access..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
              <div className="w-full">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Link to Job (Optional)</label>
                <select 
                  value={newTaskJobId}
                  onChange={(e) => setNewTaskJobId(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">No specific job</option>
                  {bookings.map(booking => (
                    <option key={booking.id} value={booking.id}>
                      {booking.shoot_location}
                    </option>
                  ))}
                </select>
              </div>
              <div className="pt-4 flex w-full gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!newTaskDescription.trim()}
                  className="w-full flex-1 px-4 py-3 bg-primary hover:opacity-90 disabled:opacity-50 text-white font-bold rounded-xl transition-colors"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
