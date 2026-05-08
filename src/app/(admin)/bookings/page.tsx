'use client';

import Link from 'next/link';
import { useState } from 'react';

const mockBookings = [
  {
    id: 1,
    address: '123 Oak Street, Silverwood',
    date: 'Oct 24, 2023 · 10:30 AM',
    clientName: 'Sarah Jenkins',
    clientAgency: 'Prime Realty',
    status: 'Scheduled',
    photographer: 'Alex Johnson'
  },
  {
    id: 2,
    address: '455 Marine Parade, Oceanview',
    date: 'Oct 25, 2023 · 02:00 PM',
    clientName: 'Marcus Thorne',
    clientAgency: 'Coastal Homes',
    status: 'Scheduled',
    photographer: 'Sarah Williams'
  },
  {
    id: 3,
    address: '12 Bayside Terrace, North Port',
    date: 'Oct 22, 2023 · 09:00 AM',
    clientName: 'Elena Rodriguez',
    clientAgency: 'Skyline Property',
    status: 'Completed',
    photographer: 'Alex Johnson'
  },
  {
    id: 4,
    address: '89 Willow Lane, Greenslope',
    date: 'Oct 26, 2023 · 11:45 AM',
    clientName: 'John Carter',
    clientAgency: 'Homestead Group',
    status: 'Pending',
    photographer: 'Mike Davis'
  }
];

const photographers = ['All Photographers', 'Alex Johnson', 'Sarah Williams', 'Mike Davis'];

export default function BookingsPage() {
  const [selectedPhotographer, setSelectedPhotographer] = useState('All Photographers');

  const filteredBookings = mockBookings.filter(booking => 
    selectedPhotographer === 'All Photographers' || booking.photographer === selectedPhotographer
  );

  return (
    <main className="flex-1 p-8 md:p-10 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white heading-font">All Bookings</h1>
          <p className="text-slate-500 mt-2">Manage your shoots and view their current status.</p>
        </div>
        <Link 
          href="/bookings/new"
          className="bg-primary hover:opacity-90 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          <span className="material-icons">add_circle</span>
          New Booking
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2">
        <div className="relative max-w-md w-full">
          <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">search</span>
          <input 
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary text-sm placeholder:text-slate-500 text-slate-900 dark:text-white shadow-sm dark:focus:ring-offset-slate-900" 
            placeholder="Search by address or agent..." 
            type="text"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          <div className="relative">
            <select 
              value={selectedPhotographer}
              onChange={(e) => setSelectedPhotographer(e.target.value)}
              className="appearance-none flex items-center gap-1.5 px-4 py-2.5 pr-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm text-slate-900 dark:text-white whitespace-nowrap cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            >
              {photographers.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <span className="material-icons text-[18px] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">expand_more</span>
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm text-slate-900 dark:text-white whitespace-nowrap">
            Status <span className="material-icons text-[18px]">expand_more</span>
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm text-slate-900 dark:text-white whitespace-nowrap">
            Date Range <span className="material-icons text-[18px]">calendar_month</span>
          </button>
        </div>
      </div>

      {/* Table Section */}
      <section className="flex-1">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Shoot Location / Address</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Date &amp; Time</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Client / Agent</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Photographer</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-5">
                      <span className="text-sm font-bold block text-slate-900 dark:text-white">{booking.address}</span>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-500">{booking.date}</td>
                    <td className="px-6 py-5 text-sm">
                      <span className="font-medium text-slate-900 dark:text-white">{booking.clientName}</span>
                      <span className="text-slate-500 ml-1">· {booking.clientAgency}</span>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-700 dark:text-slate-300">
                      {booking.photographer}
                    </td>
                    <td className="px-6 py-5">
                      {booking.status === 'Scheduled' && (
                        <span className="px-2.5 py-1 bg-warning/15 text-warning rounded-full text-[11px] font-bold border border-warning/20">Scheduled</span>
                      )}
                      {booking.status === 'Completed' && (
                        <span className="px-2.5 py-1 bg-secondary/15 text-secondary rounded-full text-[11px] font-bold border border-secondary/20">Completed</span>
                      )}
                      {booking.status === 'Pending' && (
                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full text-[11px] font-bold border border-slate-200 dark:border-slate-700">Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Link href={`/bookings/${booking.id}`} className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 transition-all active:scale-[0.98] inline-block">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
