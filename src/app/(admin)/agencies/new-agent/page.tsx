'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

function NewAgentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [agencies, setAgencies] = useState<any[]>([]);
  const [subAgencies, setSubAgencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sub_agency_id: searchParams.get('locationId') || '',
    email: '',
    phone: '',
    notes: '',
  });

  // Package State
  const [showPackageBuilder, setShowPackageBuilder] = useState(false);
  const [newPackage, setNewPackage] = useState({
    name: '',
    price: '',
    ground_photos_qty: 0,
    drone_qty: 0,
    reels_qty: 0,
    twilight_qty: 0,
    video_package: '',
    site_plan: false,
    floorplan: false,
    matterport: false,
    virtual_staging: false,
    virtual_staging_qty: 0,
    drone_included: false,
  });
  const [addedPackages, setAddedPackages] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      const { data: agData } = await supabase.from('agencies').select('*').order('name');
      const { data: subAgData } = await supabase.from('sub_agencies').select('*').order('name');
      if (agData) setAgencies(agData);
      if (subAgData) setSubAgencies(subAgData);
      setLoading(false);
    }
    fetchData();
  }, [supabase]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sub_agency_id) {
      alert('Please fill in Name and select a Location.');
      return;
    }

    setSaving(true);
    
    // STRICT AUTH CHECK
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Auth error fetching user:', authError);
      alert('Error: You are not logged in. Please log in first.');
      setSaving(false);
      return;
    }

    const agentPayload = {
      ...formData,
      user_id: user.id
    };

    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .insert([agentPayload])
      .select()
      .single();

    if (agentError) {
      alert('Error saving agent: ' + agentError.message);
      setSaving(false);
      return;
    }

    if (addedPackages.length > 0) {
      const packagesToInsert = addedPackages.map(pkg => ({
        ...pkg,
        agent_id: agent.id,
        user_id: user.id
      }));
      
      const { error: pkgError } = await supabase.from('packages').insert(packagesToInsert);
      if (pkgError) console.error('Error saving packages:', pkgError);
    }

    router.push('/agencies');
    router.refresh();
  };

  const addPackage = () => {
    if (!newPackage.name || !newPackage.price) return;
    setAddedPackages([...addedPackages, {
      name: newPackage.name,
      price: Number(newPackage.price),
      ground_photos_qty: newPackage.ground_photos_qty,
      drone_qty: newPackage.drone_included ? newPackage.drone_qty : 0,
      reels_qty: newPackage.reels_qty,
      twilight_qty: newPackage.twilight_qty,
      video_package: newPackage.video_package,
      site_plan: newPackage.site_plan,
      floorplan: newPackage.floorplan,
      matterport: newPackage.matterport,
      virtual_staging: newPackage.virtual_staging,
      virtual_staging_qty: newPackage.virtual_staging_qty
    }]);
    setNewPackage({ name: '', price: '', ground_photos_qty: 0, drone_qty: 0, drone_included: false, reels_qty: 0, twilight_qty: 0, video_package: '', site_plan: false, floorplan: false, matterport: false, virtual_staging: false, virtual_staging_qty: 0 });
    setShowPackageBuilder(false);
  };

  if (loading) return <div className="p-8 text-slate-500">Loading details...</div>;

  return (
    <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 flex justify-between items-center px-8 h-16 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/agencies" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <span className="material-icons">arrow_back</span>
          </Link>
          <h2 className="text-xl font-bold text-primary">Add New Agent</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
          <span className="material-icons text-slate-400 cursor-pointer p-2 hover:bg-slate-100 rounded-full">notifications</span>
          <span className="material-icons text-slate-400 cursor-pointer p-2 hover:bg-slate-100 rounded-full">help</span>
        </div>
      </header>

      {/* Main Scrolling Content */}
      <div className="flex-1 overflow-y-auto bg-slate-50/50">
        <div className="max-w-4xl mx-auto p-8 space-y-8">
          
          {/* Agent Details Section */}
          <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="material-icons text-primary">person</span>
              Agent Details
            </h3>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                  <input 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all"
                    placeholder="e.g. Michael Jordan"
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Location / Sub-Agency</label>
                  <div className="relative">
                    <select 
                      className="w-full appearance-none px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all"
                      value={formData.sub_agency_id}
                      onChange={e => setFormData({ ...formData, sub_agency_id: e.target.value })}
                    >
                      <option value="">Select a location...</option>
                      {agencies.map(ag => (
                        <optgroup key={ag.id} label={ag.name}>
                          {subAgencies.filter(s => s.agency_id === ag.id).map(sub => (
                            <option key={sub.id} value={sub.id}>{sub.name}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    <span className="material-icons absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">expand_more</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Contact Email</label>
                  <input 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all"
                    placeholder="name@agency.com"
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                  <input 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all"
                    placeholder="+64 00 000 0000"
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Agent Notes</label>
                <textarea 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none resize-none transition-all"
                  placeholder="Add any specific details or specializations..."
                  rows={4}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                ></textarea>
              </div>

              <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 flex gap-3">
                <span className="material-icons text-primary">info</span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  New agents will receive an automated invitation to set up their Snapwise dispatch portal once saved.
                </p>
              </div>
            </form>
          </section>

          {/* Agent Packages Section */}
          <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="material-icons text-primary">inventory_2</span>
                Agent Packages
              </h3>
              <button 
                onClick={() => setShowPackageBuilder(!showPackageBuilder)}
                className="flex items-center gap-2 text-secondary text-sm font-bold hover:bg-secondary/5 px-4 py-2 rounded-xl transition-colors border border-secondary/10"
              >
                <span className="material-icons text-[20px]">add_circle</span>
                Create Package
              </button>
            </div>

            {showPackageBuilder && (
              <div className="mb-6 p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Package Name</label>
                    <input 
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all"
                      placeholder="e.g. Standard Pro"
                      type="text"
                      value={newPackage.name}
                      onChange={e => setNewPackage({ ...newPackage, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Price ($)</label>
                    <input 
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all"
                      placeholder="e.g. 199"
                      type="number"
                      value={newPackage.price}
                      onChange={e => setNewPackage({ ...newPackage, price: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Photo Count</label>
                    <input 
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all"
                      placeholder="e.g. 15"
                      type="number"
                      value={newPackage.ground_photos_qty}
                      onChange={e => setNewPackage({ ...newPackage, ground_photos_qty: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Drone Qty</label>
                    <input 
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all"
                      placeholder="e.g. 5"
                      type="number"
                      value={newPackage.drone_qty}
                      onChange={e => setNewPackage({ ...newPackage, drone_qty: Number(e.target.value), drone_included: Number(e.target.value) > 0 })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Reels Qty</label>
                    <input 
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all"
                      type="number"
                      value={newPackage.reels_qty}
                      onChange={e => setNewPackage({ ...newPackage, reels_qty: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Twilight Qty</label>
                    <input 
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all"
                      type="number"
                      value={newPackage.twilight_qty}
                      onChange={e => setNewPackage({ ...newPackage, twilight_qty: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Video Type</label>
                  <select value={newPackage.video_package} onChange={e => setNewPackage({...newPackage, video_package: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all">
                    <option value="">None</option>
                    <option value="basic">Basic Video</option>
                    <option value="standard">Standard Video</option>
                    <option value="premium">Premium Video</option>
                    <option value="ai">AI Video</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={newPackage.site_plan} onChange={e => setNewPackage({...newPackage, site_plan: e.target.checked})} className="rounded text-secondary focus:ring-secondary w-4 h-4" />
                    <span className="text-sm font-medium text-slate-700">Site Plan</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={newPackage.floorplan} onChange={e => setNewPackage({...newPackage, floorplan: e.target.checked})} className="rounded text-secondary focus:ring-secondary w-4 h-4" />
                    <span className="text-sm font-medium text-slate-700">Floorplan</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={newPackage.matterport} onChange={e => setNewPackage({...newPackage, matterport: e.target.checked})} className="rounded text-secondary focus:ring-secondary w-4 h-4" />
                    <span className="text-sm font-medium text-slate-700">Matterport</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={newPackage.virtual_staging} onChange={e => setNewPackage({...newPackage, virtual_staging: e.target.checked})} className="rounded text-secondary focus:ring-secondary w-4 h-4" />
                      <span className="text-sm font-medium text-slate-700">Virtual Staging</span>
                    </label>
                    {newPackage.virtual_staging && (
                      <input type="number" placeholder="Qty" value={newPackage.virtual_staging_qty} onChange={e => setNewPackage({...newPackage, virtual_staging_qty: Number(e.target.value)})} className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none" />
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-200">
                  <button 
                    onClick={addPackage}
                    type="button"
                    className="px-6 py-2 bg-slate-800 text-white text-sm font-bold rounded-xl hover:bg-slate-700 transition-colors"
                  >
                    Add to List
                  </button>
                </div>
              </div>
            )}

            {/* List of Added Packages */}
            <div className="space-y-3">
              {addedPackages.map((pkg, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <p className="font-bold text-slate-900">{pkg.name}</p>
                    <p className="text-xs text-slate-500">{pkg.ground_photos_qty} photos {pkg.drone_qty > 0 ? `+ ${pkg.drone_qty} drone` : ''}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-bold text-primary">${pkg.price}</p>
                    <button 
                      onClick={() => setAddedPackages(addedPackages.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-error transition-colors"
                    >
                      <span className="material-icons text-sm">delete</span>
                    </button>
                  </div>
                </div>
              ))}

              {addedPackages.length === 0 && !showPackageBuilder && (
                <div className="border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
                  <span className="material-icons text-slate-200 text-[48px] mb-2">package_2</span>
                  <p className="text-sm text-slate-400">No custom packages defined yet. Create packages to offer specialized services for this agent.</p>
                </div>
              )}
            </div>
          </section>

          {/* Bottom Action Bar */}
          <div className="flex items-center justify-end gap-4 pt-8 border-t border-slate-200">
            <Link 
              href="/agencies"
              className="px-8 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-2xl transition-colors"
            >
              Discard Changes
            </Link>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="px-12 py-3 bg-secondary text-white font-bold rounded-2xl hover:opacity-90 shadow-xl shadow-secondary/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Agent'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function NewAgentPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading form...</div>}>
      <NewAgentForm />
    </Suspense>
  );
}
