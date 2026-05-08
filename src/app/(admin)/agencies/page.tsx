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
    name: '', price: '', ground_photos_qty: 0, drone_qty: 0, video_package: ''
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
      video_package: newPackage.video_package
    };

    if (packageContext.type === 'agent') {
      payload.agent_id = packageContext.id;
    } else {
      payload.agency_id = packageContext.id;
    }

    await supabase.from('packages').insert([payload]);
    setNewPackage({ name: '', price: '', ground_photos_qty: 0, drone_qty: 0, video_package: '' });
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">New Agency</h2>
              <form onSubmit={handleAddAgency} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Agency Name</label>
                  <input type="text" value={newAgencyName} onChange={e => setNewAgencyName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2" required placeholder="e.g. Ray White" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Primary Location / Branch</label>
                  <input type="text" value={newAgencyLocation} onChange={e => setNewAgencyLocation(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2" placeholder="e.g. Nelson, NZ" />
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setShowAgencyModal(false)} className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-300">Cancel</button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-primary text-white rounded-xl font-bold">Create Agency</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Package Modal */}
        {showPackageModal && packageContext && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col">
              <div className="flex-shrink-0">
                <h2 className="text-xl font-bold mb-1 text-slate-900 dark:text-white">Add Custom Package</h2>
                <p className="text-xs text-slate-500 mb-4">Will apply to: <span className="font-bold">{packageContext.name}</span></p>
              </div>
              
              {/* List existing packages for this context */}
              <div className="mb-6 space-y-2 overflow-y-auto pr-2 custom-scrollbar flex-1 max-h-40">
                <h3 className="text-xs font-bold text-slate-500 uppercase sticky top-0 bg-white dark:bg-slate-900 pb-1 z-10">Existing Packages</h3>
                {packages.filter(p => packageContext.type === 'agent' ? p.agent_id === packageContext.id : p.agency_id === packageContext.id).map(pkg => (
                  <div key={pkg.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                    <div>
                      <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{pkg.name}</div>
                      <div className="text-xs text-slate-500">${pkg.price} • {pkg.ground_photos_qty || 0} photos</div>
                    </div>
                    <button onClick={() => handleDeletePackage(pkg.id)} className="text-slate-400 hover:text-error">
                      <span className="material-icons-outlined text-sm">delete</span>
                    </button>
                  </div>
                ))}
                {packages.filter(p => packageContext.type === 'agent' ? p.agent_id === packageContext.id : p.agency_id === packageContext.id).length === 0 && (
                  <div className="text-xs text-slate-400 italic">No custom packages yet.</div>
                )}
              </div>

              <form onSubmit={handleAddPackage} className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-4 flex-shrink-0">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Package Name</label>
                  <input type="text" value={newPackage.name} onChange={e => setNewPackage({...newPackage, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm" required placeholder="e.g. Premium Deal" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Flat Price ($)</label>
                  <input type="number" value={newPackage.price} onChange={e => setNewPackage({...newPackage, price: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm" required placeholder="199" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Photos Qty</label>
                    <input type="number" value={newPackage.ground_photos_qty} onChange={e => setNewPackage({...newPackage, ground_photos_qty: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Drone Qty</label>
                    <input type="number" value={newPackage.drone_qty} onChange={e => setNewPackage({...newPackage, drone_qty: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Video Included</label>
                  <select value={newPackage.video_package} onChange={e => setNewPackage({...newPackage, video_package: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm">
                    <option value="">None</option>
                    <option value="basic">Basic Video</option>
                    <option value="standard">Standard Video</option>
                    <option value="premium">Premium Video</option>
                    <option value="ai">AI Video</option>
                  </select>
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setShowPackageModal(false)} className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-300 text-sm">Close</button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm">Save Package</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
