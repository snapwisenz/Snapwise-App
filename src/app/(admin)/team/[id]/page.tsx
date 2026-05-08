'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function PhotographerProfilePage() {
  const { id } = useParams();
  
  // Mock data - in a real app, this would be fetched based on {id}
  const [photographer, setPhotographer] = useState({
    name: id === 'marcus-wright' ? 'Marcus Wright' : id === 'sarah-miller' ? 'Sarah Miller' : 'Elena Rossi',
    role: id === 'sarah-miller' ? 'Contractor' : id === 'marcus-wright' ? 'Lead Photographer' : 'Senior Associate',
    email: id === 'marcus-wright' ? 'm.wright@snapwise.co' : id === 'sarah-miller' ? 'sarah.m@gmail.com' : 'elena.r@snapwise.co',
    phone: '+64 21 000 0000',
    region: id === 'marcus-wright' ? 'Nelson, Tasman' : id === 'elena-rossi' ? 'Richmond' : 'Auckland',
    equipment: 'Sony A7R IV, 16-35mm GM, DJI Mavic 3 Pro, Matterport Pro 2',
    internal_pay_rate: '85.00',
    notes: 'Very reliable, specializes in high-end architectural shoots.',
    deliverables: ['ground_photos', 'drone', 'matterport', 'video'],
    status: 'Active'
  });

  const allProducts = [
    { id: 'ground_photos', label: 'Ground Photos', icon: 'photo_camera' },
    { id: 'drone', label: 'Drone Photos/Video', icon: 'flight' },
    { id: 'reels', label: 'Social Reels', icon: 'movie' },
    { id: 'twilight', label: 'Twilight Shoots', icon: 'wb_twilight' },
    { id: 'video', label: 'Full Video Production', icon: 'videocam' },
    { id: 'floorplan', label: 'Floorplans', icon: 'architecture' },
    { id: 'site_plan', label: 'Site Plans', icon: 'map' },
    { id: 'matterport', label: '3D Tours (Matterport)', icon: 'view_in_ar' },
    { id: 'virtual_staging', label: 'Virtual Staging', icon: 'chair' },
  ];

  const recentJobs = [
    { id: 'JOB-101', address: '124 Collingwood St, Nelson', date: 'Oct 12, 2023', status: 'Completed', amount: '$240.00' },
    { id: 'JOB-105', address: '45 Beach Rd, Tahunanui', date: 'Oct 15, 2023', status: 'Completed', amount: '$310.00' },
    { id: 'JOB-112', address: '89 Hill St, Richmond', date: 'Oct 18, 2023', status: 'In Progress', amount: '$180.00' },
  ];

  const toggleDeliverable = (productId: string) => {
    if (photographer.deliverables.includes(productId)) {
      setPhotographer({
        ...photographer,
        deliverables: photographer.deliverables.filter(d => d !== productId)
      });
    } else {
      setPhotographer({
        ...photographer,
        deliverables: [...photographer.deliverables, productId]
      });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-12 space-y-8 animate-in fade-in duration-500">
      {/* Header & Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6">
          <Link 
            href="/team"
            className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-primary border border-slate-200 dark:border-slate-700 transition-all shadow-sm active:scale-90"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl border border-primary/20 overflow-hidden">
               {photographer.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{photographer.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-medium text-slate-500">{photographer.role}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span className="text-xs font-bold text-success uppercase tracking-wider">{photographer.status}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-6 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-all">
            Cancel
          </button>
          <button className="px-8 py-3 rounded-xl font-bold text-white bg-primary shadow-lg shadow-primary/30 hover:brightness-110 active:scale-95 transition-all">
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Information & Tools */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Information Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/50 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">contact_page</span>
              <h2 className="font-bold text-slate-900 dark:text-white">General Information</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
                <input 
                  type="email" 
                  value={photographer.email}
                  onChange={(e) => setPhotographer({...photographer, email: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Phone Number</label>
                <input 
                  type="text" 
                  value={photographer.phone}
                  onChange={(e) => setPhotographer({...photographer, phone: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Service Regions</label>
                <input 
                  type="text" 
                  value={photographer.region}
                  onChange={(e) => setPhotographer({...photographer, region: e.target.value})}
                  placeholder="e.g. Nelson, Richmond, Tasman"
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Equipment & Capabilities */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/50 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">camera</span>
              <h2 className="font-bold text-slate-900 dark:text-white">Equipment & Deliverables</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Equipment List</label>
                <textarea 
                  rows={3}
                  value={photographer.equipment}
                  onChange={(e) => setPhotographer({...photographer, equipment: e.target.value})}
                  placeholder="List cameras, drones, and other gear..."
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                />
              </div>
              
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-4">Authorized Products</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {allProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => toggleDeliverable(product.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                        photographer.deliverables.includes(product.id)
                        ? 'bg-primary/5 border-primary text-primary shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-xl ${
                        photographer.deliverables.includes(product.id) ? 'text-primary' : 'text-slate-400'
                      }`}>
                        {product.icon}
                      </span>
                      <span className="text-xs font-bold truncate">{product.label}</span>
                      {photographer.deliverables.includes(product.id) && (
                        <span className="material-symbols-outlined text-sm ml-auto">check_circle</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Internal Details */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-500 text-xl">admin_panel_settings</span>
                <h2 className="font-bold text-slate-700 dark:text-slate-300">Internal Administration</h2>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 uppercase tracking-tighter">
                Admin Only Access
              </span>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Base Pay Rate</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <input 
                    type="number" 
                    value={photographer.internal_pay_rate}
                    onChange={(e) => setPhotographer({...photographer, internal_pay_rate: e.target.value})}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 pl-7 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Internal Notes</label>
                <textarea 
                  rows={1}
                  value={photographer.notes}
                  onChange={(e) => setPhotographer({...photographer, notes: e.target.value})}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Job History */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-full">
            <div className="px-6 py-6 border-b border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">history</span>
                <h2 className="font-bold text-slate-900 dark:text-white">Recent Work</h2>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                LAST 30 DAYS
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {recentJobs.map((job) => (
                  <div key={job.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all group">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-bold text-slate-400 group-hover:text-primary transition-colors">{job.id}</span>
                      <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100">{job.amount}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 line-clamp-1">{job.address}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-slate-500">{job.date}</span>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        job.status === 'Completed' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800/50 mt-auto">
              <button className="w-full py-2 text-xs font-bold text-slate-500 hover:text-primary transition-all flex items-center justify-center gap-2">
                View Full History
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reliability</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">98%</h3>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg. Rating</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">4.9</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
