'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import * as Popover from '@radix-ui/react-popover';

function DateTimePicker({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const [date, setDate] = useState<Date | undefined>(value ? new Date(value) : undefined);
  const [time, setTime] = useState<string>(
    value ? format(new Date(value), 'HH:mm') : '09:00'
  );

  useEffect(() => {
    if (date) {
      const [hours, minutes] = time.split(':');
      const newDate = new Date(date);
      newDate.setHours(parseInt(hours, 10));
      newDate.setMinutes(parseInt(minutes, 10));
      onChange(newDate.toISOString());
    }
  }, [date, time]);

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-5 h-5 text-slate-500" />
            <span>{value ? format(new Date(value), 'dd/MM/yyyy, HH:mm') : 'Select date & time'}</span>
          </div>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content 
          side="top" 
          align="start" 
          sideOffset={8}
          className="z-[100] p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl w-auto outline-none flex flex-col sm:flex-row gap-6 animate-in fade-in zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2"
        >
          {/* Calendar side */}
          <div>
            <DayPicker
              mode="single"
              selected={date}
              onSelect={(d) => { if (d) setDate(d); }}
              className="p-0"
              classNames={{
                months: "flex flex-col space-y-4",
                month: "space-y-4",
                month_caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-bold text-slate-900 dark:text-white",
                nav: "space-x-1 flex items-center",
                button_previous: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1 flex items-center justify-center",
                button_next: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1 flex items-center justify-center",
                month_grid: "w-full border-collapse space-y-1",
                weekdays: "flex",
                weekday: "text-slate-500 rounded-md w-9 font-normal text-[0.8rem]",
                week: "flex w-full mt-2",
                day: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                day_button: "h-full w-full p-0 font-bold aria-selected:opacity-100 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300 flex items-center justify-center",
                selected: "bg-primary text-white hover:bg-primary hover:text-white focus:bg-primary focus:text-white",
                today: "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-50",
                outside: "text-slate-400 opacity-50",
                disabled: "text-slate-400 opacity-50",
                hidden: "invisible",
              }}
            />
          </div>

          {/* Time sidebar */}
          <div className="flex flex-col gap-3 pt-2 sm:pt-1 sm:border-l sm:border-slate-100 dark:sm:border-slate-800 sm:pl-6 sm:min-w-[140px]">
            <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" /> Time
            </label>
            <input 
              type="time" 
              value={time} 
              onChange={(e) => setTime(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-lg font-bold text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary/50 focus:outline-none"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Select the exact time for this task to be due.
            </p>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskJobId, setNewTaskJobId] = useState('');
  const [newTaskNotes, setNewTaskNotes] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskAssigneeId, setNewTaskAssigneeId] = useState('');
  
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data: tasksData } = await supabase
      .from('tasks')
      .select('*, bookings(shoot_location), profiles:assignee_id(full_name)')
      .eq('is_completed', false)
      .order('created_at', { ascending: false });
      
    if (tasksData) setTasks(tasksData);

    const { data: bookingsData } = await supabase
      .from('bookings')
      .select('id, shoot_location')
      .in('status', ['pending', 'scheduled'])
      .order('created_at', { ascending: false });

    if (bookingsData) setBookings(bookingsData);

    const { data: teamData } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .order('full_name', { ascending: true });
      
    if (teamData) setTeamMembers(teamData);

    setLoading(false);
  }

  const handleToggleComplete = async (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    
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
      notes: newTaskNotes || null,
      due_date: newTaskDueDate ? new Date(newTaskDueDate).toISOString() : null,
      assignee_id: newTaskAssigneeId || null,
      is_completed: false,
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert([newTask])
      .select('*, bookings(shoot_location), profiles:assignee_id(full_name)')
      .single();

    if (data) {
      setTasks([data, ...tasks]);
      setIsModalOpen(false);
      setNewTaskDescription('');
      setNewTaskJobId('');
      setNewTaskNotes('');
      setNewTaskDueDate('');
      setNewTaskAssigneeId('');
    }
  };

  const formatDueDateDisplay = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
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
              <div key={task.id} className="flex flex-col md:flex-row md:items-start justify-between p-5 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700 gap-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start gap-4">
                  <input 
                    type="checkbox" 
                    onChange={() => handleToggleComplete(task.id)}
                    className="mt-1 w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                  />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white mb-2">{task.description}</p>
                    
                    {task.notes && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{task.notes}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      {task.job_id && (
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                          Linked Job: {task.bookings?.shoot_location || 'Unknown Location'}
                        </span>
                      )}
                      {task.due_date && (
                        <span className="text-xs font-bold text-warning flex items-center gap-1 bg-white dark:bg-slate-900 px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                          <span className="material-icons-outlined text-[14px]">event</span>
                          Due: {formatDueDateDisplay(task.due_date)}
                        </span>
                      )}
                      {task.assignee_id && (
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 bg-white dark:bg-slate-900 px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                          <span className="material-icons-outlined text-[14px]">person</span>
                          Assigned: {task.profiles?.full_name || 'Team Member'}
                        </span>
                      )}
                      {task.asset_name && !task.job_id && (
                         <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                            Missing: {task.asset_name}
                          </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
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
        <>
          <div className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="fixed left-[50%] top-[50%] z-50 flex flex-col w-full min-w-[320px] sm:min-w-[550px] max-w-xl translate-x-[-50%] translate-y-[-50%] gap-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
            <div className="pb-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center w-full sticky top-0 bg-white dark:bg-slate-900 z-10">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Add New Task</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <span className="material-icons-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleAddTask} className="space-y-4 w-full flex flex-col pt-2">
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
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Notes (Optional)</label>
                <textarea 
                  value={newTaskNotes}
                  onChange={(e) => setNewTaskNotes(e.target.value)}
                  placeholder="Additional details..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none h-24"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-2">
                <div className="w-full">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Due Date (Optional)</label>
                  <DateTimePicker 
                    value={newTaskDueDate}
                    onChange={(val) => setNewTaskDueDate(val)}
                  />
                </div>
                <div className="w-full">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Assign To</label>
                  <select 
                    value={newTaskAssigneeId}
                    onChange={(e) => setNewTaskAssigneeId(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">Unassigned</option>
                    {teamMembers.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.full_name || member.email}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex w-full gap-3 mt-4 border-t border-slate-100 dark:border-slate-800 pt-4">
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
        </>
      )}
    </main>
  );
}
