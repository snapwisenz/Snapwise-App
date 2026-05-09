'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function AgenciesPage() {
  const router = useRouter();
  const supabase = createClient();
  const [agencies, setAgencies] = useState<any[]>([]);
  const [subAgencies, setSubAgencies] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);

  // Accordion State
  const [expandedAgencyId, setExpandedAgencyId] = useState<string | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  const [loading, setLoading] = useState(true);

  // Modals State
  const [showAgencyModal, setShowAgencyModal] = useState(false);
  const [newAgencyName, setNewAgencyName] = useState('');
  const [newAgencyLocation, setNewAgencyLocation] = useState('');

  // Package Modal State
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [packageContext, setPackageContext] = useState<{type: 'agency'|'agent', id: string, name: string} | null>(null);
  const [newPackage, setNewPackage] = useState({
    name: '', price: '', ground_photos_qty: 0, drone_qty: 0, reels_qty: 0, twilight_qty: 0, video_package: '',
    site_plan: false, floorplan: false, matterport: false, virtual_staging: false, virtual_staging_qty: 0
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const [resAgencies, resSubAgencies, resAgents, resPackages] = await Promise.all([
        supabase.from('agencies').select('*').order('created_at', { ascending: false }),
        supabase.from('sub_agencies').select('*').order('created_at', { ascending: false }),
        supabase.from('agents').select('*').order('created_at', { ascending: false }),
        supabase.from('packages').select('*').order('created_at', { ascending: false })
      ]);

      if (resAgencies.data) setAgencies(resAgencies.data);
      if (resSubAgencies.data) setSubAgencies(resSubAgencies.data);
      if (resAgents.data) setAgents(resAgents.data);
      if (resPackages.data) setPackages(resPackages.data);
      
    } catch (err) {
      console.error("Fetch Data Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddAgency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgencyName.trim()) {
      alert("Please enter an agency name.");
      return;
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert("Error: You are not logged in. Please log in first.");
      return;
    }

    const { data: agencyData, error } = await supabase.from('agencies').insert([{ name: newAgencyName, user_id: session.user.id }]).select();
    
    if (!error && agencyData && agencyData.length > 0) {
      if (newAgencyLocation.trim()) {
        await supabase.from('sub_agencies').insert([{ name: newAgencyLocation, agency_id: agencyData[0].id }]);
      }
      
      setNewAgencyName('');
      setNewAgencyLocation('');
      setShowAgencyModal(false);
      
      window.location.href = `/agencies/${agencyData[0].id}`;
    } else {
      console.error("Error creating agency:", error);
      alert("Error creating agency: " + (error?.message || "Unknown error"));
      fetchData();
    }
  };

  const handleAddPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPackage.name.trim() || !newPackage.price || !packageContext) return;

    const payload: any = {
      name: newPackage.name,
      price: Number(newPackage.price),
      ground_photos_qty: newPackage.ground_photos_qty,
      drone_qty: newPackage.drone_qty,
      reels_qty: newPackage.reels_qty,
      twilight_qty: newPackage.twilight_qty,
      video_package: newPackage.video_package,
      site_plan: newPackage.site_plan,
      floorplan: newPackage.floorplan,
      matterport: newPackage.matterport,
      virtual_staging: newPackage.virtual_staging,
      virtual_staging_qty: newPackage.virtual_staging_qty
    };

    if (packageContext.type === 'agent') {
      payload.agent_id = packageContext.id;
    } else {
      payload.agency_id = packageContext.id;
    }

    await supabase.from('packages').insert([payload]);
    setNewPackage({ name: '', price: '', ground_photos_qty: 0, drone_qty: 0, reels_qty: 0, twilight_qty: 0, video_package: '', site_plan: false, floorplan: false, matterport: false, virtual_staging: false, virtual_staging_qty: 0 });
    fetchData();
  };

  const handleDeletePackage = async (pkgId: string) => {
    if(!confirm('Are you sure you want to delete this package?')) return;
    await supabase.from('packages').delete().eq('id', pkgId);
    fetchData();
  };

  if (loading) return <div className="flex-1 flex justify-center items-center h-full"><div className="p-8 text-slate-500">Loading Agencies...</div></div>;

  const filteredAgencies = agencies.filter(ag => ag.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 dark:bg-slate-900 custom-scrollbar h-[calc(100vh-4rem)]">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Top Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="relative w-full md:w-96">
            <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input 
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 placeholder:text-slate-400" 
              placeholder="Search agencies..." 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Link href="/agencies/new-agent" className="px-4 py-2.5 text-primary font-bold rounded-xl border border-primary/20 hover:bg-primary/5 transition-colors text-sm">
              + New Agent
            </Link>
            <button onClick={() => setShowAgencyModal(true)} className="px-4 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all text-sm">
              + New Agency
            </button>
          </div>
        </div>

        {/* Agencies List */}
        <div className="space-y-4">
          {filteredAgencies.map(agency => {
            const isExpanded = expandedAgencyId === agency.id;
            const agencyLocations = subAgencies.filter(s => s.agency_id === agency.id);
            const locationNames = agencyLocations.map(l => l.name).join(', ') || 'Headquarters';
            
            // Get all agents that belong to any sub_agency of this agency
            const agencyAgents = agents.filter(agent => {
              const sub = subAgencies.find(s => s.id === agent.sub_agency_id);
              return sub?.agency_id === agency.id;
            });

            return (
              <div key={agency.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* Agency Card Header */}
                <div 
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  onClick={() => setExpandedAgencyId(isExpanded ? null : agency.id)}
                >
                  <div className="flex items-center gap-4">
                    <span className={`material-icons-outlined text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                      chevron_right
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{agency.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold rounded-full uppercase tracking-widest">
                          {agencyAgents.length} Agents
                        </span>
                        <span className="text-xs text-slate-500">{locationNames}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setPackageContext({type: 'agency', id: agency.id, name: agency.name}); setShowPackageModal(true); }}
                      className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-full transition-colors flex items-center justify-center"
                      title="Manage Agency Packages"
                    >
                      <span className="material-icons-outlined text-sm">inventory_2</span>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); /* Optional: Agency edit/delete */ }} 
                      className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                    >
                      <span className="material-icons-outlined">more_vert</span>
                    </button>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr>
                          <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider pl-14">Agent Name</th>
                          <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Location</th>
                          <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                          <th className="px-6 py-3 w-28"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {agencyAgents.map(agent => {
                          const initials = agent.name ? agent.name.split(' ').map((n:string)=>n[0]).join('').substring(0,2).toUpperCase() : '??';
                          const locationName = subAgencies.find(s => s.id === agent.sub_agency_id)?.name || 'Unknown';
                          
                          return (
                            <tr key={agent.id} className="group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              <td className="px-6 py-4 pl-14">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                    {initials}
                                  </div>
                                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{agent.name}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-500">{locationName}</td>
                              <td className="px-6 py-4 text-sm text-slate-500">
                                <div className="flex flex-col">
                                  <span>{agent.phone || 'No phone'}</span>
                                  <span className="text-xs text-slate-400">{agent.email || 'No email'}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="opacity-0 group-hover:opacity-100 flex items-center justify-end gap-1 transition-opacity">
                                  <button 
                                    onClick={() => { setPackageContext({type: 'agent', id: agent.id, name: agent.name}); setShowPackageModal(true); }}
                                    className="p-1.5 text-slate-400 hover:text-primary rounded-lg"
                                    title="Manage Agent Packages"
                                  >
                                    <span className="material-icons-outlined text-lg">inventory_2</span>
                                  </button>
                                  <Link href={`/agencies/edit-agent/${agent.id}`} className="p-1.5 text-slate-400 hover:text-secondary rounded-lg">
                                    <span className="material-icons-outlined text-lg">edit</span>
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {agencyAgents.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">
                              No agents found for this agency.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
          {filteredAgencies.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No agencies found. Try creating a new one.
            </div>
          )}
        </div>

        {/* Add Agency Modal */}
        {showAgencyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-all duration-300">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-[480px] shadow-2xl border border-slate-200 dark:border-slate-800 transition-all duration-300">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">New Agency</h2>
                  <p className="text-sm text-slate-500 mt-1">Establish a new agency relationship</p>
                </div>
                <button onClick={() => setShowAgencyModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400">
                  <span className="material-icons">close</span>
                </button>
              </div>

              <form onSubmit={handleAddAgency} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Agency Name</label>
                  <input 
                    type="text" 
                    value={newAgencyName} 
                    onChange={e => setNewAgencyName(e.target.value)} 
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400" 
                    required 
                    placeholder="e.g. Ray White Realty" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Primary Location / Branch</label>
                  <input 
                    type="text" 
                    value={newAgencyLocation} 
                    onChange={e => setNewAgencyLocation(e.target.value)} 
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400" 
                    placeholder="e.g. Nelson, NZ" 
                  />
                </div>
                <div className="pt-6 flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => setShowAgencyModal(false)} 
                    className="flex-1 px-6 py-3.5 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 px-6 py-3.5 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98]"
                  >
                    Create Agency
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Package Modal */}
        {showPackageModal && packageContext && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-all duration-300">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-[720px] shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col transition-all duration-300">
              <div className="flex justify-between items-center mb-6 flex-shrink-0">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Add Custom Package</h2>
                  <p className="text-sm text-slate-500 mt-1">Applying to: <span className="font-bold text-primary">{packageContext.name}</span></p>
                </div>
                <button onClick={() => setShowPackageModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400">
                  <span className="material-icons">close</span>
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8">
                {/* List existing packages for this context */}
                <div className="space-y-4">
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Existing Packages</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {packages.filter(p => packageContext.type === 'agent' ? p.agent_id === packageContext.id : p.agency_id === packageContext.id).map(pkg => (
                      <div key={pkg.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-primary/30 transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                            <span className="material-icons text-sm">inventory_2</span>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{pkg.name}</div>
                            <div className="text-[10px] font-bold text-primary uppercase tracking-tighter">${pkg.price} • {pkg.ground_photos_qty || 0} photos</div>
                          </div>
                        </div>
                        <button onClick={() => handleDeletePackage(pkg.id)} className="p-1.5 text-slate-300 hover:text-error hover:bg-error/5 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                          <span className="material-icons text-sm">delete</span>
                        </button>
                      </div>
                    ))}
                    {packages.filter(p => packageContext.type === 'agent' ? p.agent_id === packageContext.id : p.agency_id === packageContext.id).length === 0 && (
                      <div className="col-span-2 text-sm text-slate-400 italic py-4 text-center bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                        No custom packages defined yet.
                      </div>
                    )}
                  </div>
                </div>

                {/* Form to add new package */}
                <form onSubmit={handleAddPackage} className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Package Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Package Name</label>
                      <input type="text" value={newPackage.name} onChange={e => setNewPackage({...newPackage, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" required placeholder="e.g. Premium Deal" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Flat Price ($)</label>
                      <input type="number" value={newPackage.price} onChange={e => setNewPackage({...newPackage, price: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" required placeholder="199" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Photos</label>
                      <input type="number" value={newPackage.ground_photos_qty} onChange={e => setNewPackage({...newPackage, ground_photos_qty: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 text-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Drone</label>
                      <input type="number" value={newPackage.drone_qty} onChange={e => setNewPackage({...newPackage, drone_qty: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 text-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Reels</label>
                      <input type="number" value={newPackage.reels_qty} onChange={e => setNewPackage({...newPackage, reels_qty: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 text-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Twilight</label>
                      <input type="number" value={newPackage.twilight_qty} onChange={e => setNewPackage({...newPackage, twilight_qty: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 text-sm" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Video Type</label>
                      <select value={newPackage.video_package} onChange={e => setNewPackage({...newPackage, video_package: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none">
                        <option value="">None</option>
                        <option value="basic">Basic Video</option>
                        <option value="standard">Standard Video</option>
                        <option value="premium">Premium Video</option>
                        <option value="ai">AI Video</option>
                      </select>
                    </div>
                    <div className="flex flex-col justify-end gap-3">
                      <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center gap-2 cursor-pointer p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl transition-colors hover:bg-slate-100 dark:hover:bg-slate-700">
                          <input type="checkbox" checked={newPackage.site_plan} onChange={e => setNewPackage({...newPackage, site_plan: e.target.checked})} className="rounded text-primary focus:ring-primary" />
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Site Plan</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl transition-colors hover:bg-slate-100 dark:hover:bg-slate-700">
                          <input type="checkbox" checked={newPackage.floorplan} onChange={e => setNewPackage({...newPackage, floorplan: e.target.checked})} className="rounded text-primary focus:ring-primary" />
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Floorplan</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex items-center gap-2 cursor-pointer p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl transition-colors hover:bg-slate-100 dark:hover:bg-slate-700">
                        <input type="checkbox" checked={newPackage.matterport} onChange={e => setNewPackage({...newPackage, matterport: e.target.checked})} className="rounded text-primary focus:ring-primary" />
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Matterport</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl transition-colors hover:bg-slate-100 dark:hover:bg-slate-700">
                        <input type="checkbox" checked={newPackage.virtual_staging} onChange={e => setNewPackage({...newPackage, virtual_staging: e.target.checked})} className="rounded text-primary focus:ring-primary" />
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Virtual Staging</span>
                      </label>
                    </div>
                    {newPackage.virtual_staging && (
                      <div className="flex items-center gap-3 bg-primary/5 p-3 rounded-2xl border border-primary/20 transition-all">
                        <span className="text-xs text-primary font-bold uppercase tracking-wider">Qty:</span>
                        <input type="number" value={newPackage.virtual_staging_qty} onChange={e => setNewPackage({...newPackage, virtual_staging_qty: Number(e.target.value)})} className="w-full bg-white dark:bg-slate-900 border border-primary/20 rounded-xl px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                      </div>
                    )}
                  </div>

                  <div className="pt-6 flex gap-4">
                    <button type="button" onClick={() => setShowPackageModal(false)} className="flex-1 px-6 py-3.5 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm">Close</button>
                    <button type="submit" className="flex-1 px-6 py-3.5 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98] text-sm">Save Package</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
