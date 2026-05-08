'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function PhotographerProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [photographer, setPhotographer] = useState({
    full_name: '',
    role: 'photographer',
    email: '',
    phone: '',
    region: '',
    equipment: '',
    internal_pay_rate: '',
    internal_notes: '',
    deliverable_products: [] as string[],
    status: 'Active'
  });

  const fetchPhotographer = useCallback(async () => {
    try {
      setLoading(true);
      // Check if it's a UUID (real data) or a mock slug
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id as string);
      
      if (isUUID) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        if (data) {
          setPhotographer({
            full_name: data.full_name || '',
            role: data.role || 'photographer',
            email: data.email || '',
            phone: data.phone || '',
            region: data.region || '',
            equipment: data.equipment || '',
            internal_pay_rate: data.internal_pay_rate?.toString() || '',
            internal_notes: data.internal_notes || '',
            deliverable_products: Array.isArray(data.deliverable_products) ? data.deliverable_products : [],
            status: 'Active'
          });
        }
      } else {
        // Mock data fallback for the demo slugs
        const mockData: Record<string, any> = {
          'marcus-wright': {
            full_name: 'Marcus Wright',
            role: 'Lead Photographer',
            email: 'm.wright@snapwise.co',
            phone: '+64 21 000 0000',
            region: 'Nelson, Tasman',
            equipment: 'Sony A7R IV, 16-35mm GM, DJI Mavic 3 Pro, Matterport Pro 2',
            internal_pay_rate: '85.00',
            internal_notes: 'Very reliable, specializes in high-end architectural shoots.',
            deliverable_products: ['ground_photos', 'drone', 'matterport', 'video'],
          },
          'sarah-miller': {
            full_name: 'Sarah Miller',
            role: 'Contractor',
            email: 'sarah.m@gmail.com',
            phone: '+64 27 111 2222',
            region: 'Auckland',
            equipment: 'Canon R5, RF 15-35mm',
            internal_pay_rate: '65.00',
            internal_notes: 'New contractor, awaiting onboarding completion.',
            deliverable_products: ['ground_photos'],
          },
          'elena-rossi': {
            full_name: 'Elena Rossi',
            role: 'Senior Associate',
            email: 'elena.r@snapwise.co',
            phone: '+64 22 333 4444',
            region: 'Richmond',
            equipment: 'Sony A7S III, Ronin S2, Mavic 3',
            internal_pay_rate: '95.00',
            internal_notes: 'Expert in video and twilight shots.',
            deliverable_products: ['ground_photos', 'drone', 'reels', 'video', 'twilight'],
          }
        };

        const data = mockData[id as string];
        if (data) {
          setPhotographer(prev => ({ ...prev, ...data }));
        }
      }
    } catch (error) {
      console.error('Error fetching photographer:', error);
    } finally {
      setLoading(false);
    }
  }, [id, supabase]);

  useEffect(() => {
    fetchPhotographer();
  }, [fetchPhotographer]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id as string);
      
      if (isUUID) {
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: photographer.full_name,
            email: photographer.email,
            phone: photographer.phone,
            region: photographer.region,
            equipment: photographer.equipment,
            internal_pay_rate: photographer.internal_pay_rate ? parseFloat(photographer.internal_pay_rate) : null,
            internal_notes: photographer.internal_notes,
            deliverable_products: photographer.deliverable_products
          })
          .eq('id', id);

        if (error) throw error;
        alert('Changes saved successfully!');
      } else {
        alert('This is a demo profile. Real saving is only enabled for authenticated database records (UUIDs).');
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Failed to save changes. Please check console for details.');
    } finally {
      setSaving(false);
    }
  };

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
    if (photographer.deliverable_products.includes(productId)) {
      setPhotographer({
        ...photographer,
        deliverable_products: photographer.deliverable_products.filter(d => d !== productId)
      });
    } else {
      setPhotographer({
        ...photographer,
        deliverable_products: [...photographer.deliverable_products, productId]
      });
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Loading Profile...</p>
        </div>
      </div>
    );
  }

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
               {photographer.full_name ? photographer.full_name.split(' ').map(n => n[0]).join('') : '??'}
            </div>
            <div>
              <input 
                type="text"
                value={photographer.full_name}
                onChange={(e) => setPhotographer({...photographer, full_name: e.target.value})}
                className="text-3xl font-bold text-slate-900 dark:text-white bg-transparent border-none outline-none focus:ring-2 focus:ring-primary/20 rounded px-1 -ml-1 w-full"
              />
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-medium text-slate-500">{photographer.role}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span className="text-xs font-bold text-success uppercase tracking-wider">{photographer.status}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/team')}
            className="px-6 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 rounded-xl font-bold text-white bg-primary shadow-lg shadow-primary/30 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Saving...
              </>
            ) : 'Save Changes'}
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
                        photographer.deliverable_products.includes(product.id)
                        ? 'bg-primary/5 border-primary text-primary shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-xl ${
                        photographer.deliverable_products.includes(product.id) ? 'text-primary' : 'text-slate-400'
                      }`}>
                        {product.icon}
                      </span>
                      <span className="text-xs font-bold truncate">{product.label}</span>
                      {photographer.deliverable_products.includes(product.id) && (
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
                  value={photographer.internal_notes}
                  onChange={(e) => setPhotographer({...photographer, internal_notes: e.target.value})}
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
