'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function AgenciesPage() {
  const supabase = createClient();
  const [agencies, setAgencies] = useState<any[]>([]);
  const [subAgencies, setSubAgencies] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);

  // Selection State
  // Mode can be 'agency', 'sub_agency', or 'agent'
  const [selectedAgencyId, setSelectedAgencyId] = useState<string | null>(null);
  const [selectedSubAgencyId, setSelectedSubAgencyId] = useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  // Forms State
  const [newAgencyName, setNewAgencyName] = useState('');
  const [newSubAgencyName, setNewSubAgencyName] = useState('');

  // Package Form
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [newPackage, setNewPackage] = useState({
    name: '', price: '', ground_photos_qty: 0, drone_qty: 0, video_package: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

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
      
      if (resAgencies.error) console.error("Agencies Error:", resAgencies.error);
      if (resPackages.error) console.error("Packages Error:", resPackages.error);

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
    if (!newAgencyName.trim()) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await supabase.from('agencies').insert([{ name: newAgencyName, user_id: session.user.id }]);
    setNewAgencyName('');
    fetchData();
  };

  const handleAddSubAgency = async (e: React.FormEvent, parentAgencyId: string) => {
    e.preventDefault();
    if (!newSubAgencyName.trim()) return;
    await supabase.from('sub_agencies').insert([{ name: newSubAgencyName, agency_id: parentAgencyId }]);
    setNewSubAgencyName('');
    fetchData();
  };

  const handleAddPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPackage.name.trim() || !newPackage.price) return;

    const payload: any = {
      name: newPackage.name,
      price: Number(newPackage.price),
      ground_photos_qty: newPackage.ground_photos_qty,
      drone_qty: newPackage.drone_qty,
      video_package: newPackage.video_package
    };

    if (selectedAgentId) {
      payload.agent_id = selectedAgentId;
    } else if (selectedAgencyId) {
      payload.agency_id = selectedAgencyId;
    } else {
      return; // Need either agent or agency selected
    }

    await supabase.from('packages').insert([payload]);
    setShowPackageModal(false);
    setNewPackage({ name: '', price: '', ground_photos_qty: 0, drone_qty: 0, video_package: '' });
    fetchData();
  };

  const handleDeletePackage = async (pkgId: string) => {
    if(!confirm('Are you sure you want to delete this package?')) return;
    await supabase.from('packages').delete().eq('id', pkgId);
    fetchData();
  };

  if (loading) return <div className="p-8 text-slate-500">Loading Agencies...</div>;

  const currentAgents = agents.filter(a => a.sub_agency_id === selectedSubAgencyId);
  
  // Determine which packages to show
  let displayedPackages: any[] = [];
  let packageContext = '';
  
  if (selectedAgentId) {
    displayedPackages = packages.filter(p => p.agent_id === selectedAgentId);
    packageContext = 'Agent';
  } else if (selectedAgencyId) {
    displayedPackages = packages.filter(p => p.agency_id === selectedAgencyId);
    packageContext = 'Agency';
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 dark:bg-slate-900 custom-scrollbar h-[calc(100vh-4rem)]">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Agencies & Agents</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your agencies, locations, agents, and custom packages.</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 h-[700px] flex flex-col md:flex-row gap-6">
          
          {/* COLUMN 1: AGENCIES & LOCATIONS */}
          <div className="flex-1 border-r border-slate-100 dark:border-slate-700 pr-6 flex flex-col">
            <h2 className="font-bold text-slate-800 dark:text-white mb-4">Agencies</h2>
            <form onSubmit={handleAddAgency} className="mb-4 flex gap-2">
              <input type="text" placeholder="New Agency (e.g. Ray White)" value={newAgencyName} onChange={e => setNewAgencyName(e.target.value)} className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-primary" />
              <button type="submit" className="bg-primary text-white px-3 rounded-lg text-sm font-bold">+</button>
            </form>
            <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
              {agencies.map(ag => (
                <div key={ag.id} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <div 
                    onClick={() => { setSelectedAgencyId(ag.id); setSelectedSubAgencyId(null); setSelectedAgentId(null); }} 
                    className={`p-3 cursor-pointer flex justify-between items-center transition-colors ${selectedAgencyId === ag.id && !selectedSubAgencyId ? 'bg-primary text-white' : 'bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  >
                    <span className="font-bold text-sm">{ag.name}</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-1 bg-black/10 rounded-full">Agency</span>
                  </div>
                  
                  <div className="bg-white dark:bg-slate-800 p-2 space-y-1">
                    {subAgencies.filter(s => s.agency_id === ag.id).map(sub => (
                      <div 
                        key={sub.id} 
                        onClick={() => { setSelectedAgencyId(ag.id); setSelectedSubAgencyId(sub.id); setSelectedAgentId(null); }}
                        className={`p-2 text-sm rounded-lg cursor-pointer transition-colors ml-4 flex items-center gap-2 ${selectedSubAgencyId === sub.id ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400'}`}
                      >
                        <span className="material-icons-outlined text-sm">location_on</span>
                        {sub.name}
                      </div>
                    ))}
                    
                    {/* Add Sub-Agency Form */}
                    <form onSubmit={(e) => handleAddSubAgency(e, ag.id)} className="ml-4 mt-2 flex gap-2">
                      <input type="text" placeholder="New Location..." value={selectedAgencyId === ag.id ? newSubAgencyName : ''} onChange={e => setNewSubAgencyName(e.target.value)} onFocus={() => {setSelectedAgencyId(ag.id); setSelectedSubAgencyId(null);}} className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1.5 text-xs focus:outline-primary" />
                      <button type="submit" className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 rounded-md text-xs font-bold">+</button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COLUMN 2: AGENTS */}
          <div className="flex-1 border-r border-slate-100 dark:border-slate-700 pr-6 flex flex-col">
            <h2 className="font-bold text-slate-800 dark:text-white mb-4">Agents</h2>
            {selectedSubAgencyId ? (
              <>
                <div className="mb-4 text-xs font-bold text-primary bg-primary/10 p-2 rounded-lg inline-block w-fit">
                  Location: {subAgencies.find(s => s.id === selectedSubAgencyId)?.name}
                </div>
                
                <Link 
                  href={`/agencies/new-agent?locationId=${selectedSubAgencyId}`}
                  className="mb-4 w-full border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm font-bold text-primary hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-icons text-sm">person_add</span> Add New Agent
                </Link>

                <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                  {currentAgents.map(agent => (
                    <div key={agent.id} onClick={() => setSelectedAgentId(agent.id)} className={`p-3 rounded-xl cursor-pointer transition-colors border ${selectedAgentId === agent.id ? 'border-primary bg-primary/5 text-primary font-bold' : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300'}`}>
                      {agent.name}
                    </div>
                  ))}
                  {currentAgents.length === 0 && <p className="text-sm text-slate-400">No agents yet.</p>}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center">
                <p className="text-sm text-slate-400">Select a Location (Sub-Agency) on the left to view and add Agents.</p>
              </div>
            )}
          </div>

          {/* COLUMN 3: PACKAGES */}
          <div className="flex-[1.5] flex flex-col">
            <h2 className="font-bold text-slate-800 dark:text-white mb-4">
              {packageContext ? `${packageContext} Packages` : 'Packages'}
            </h2>
            
            {(selectedAgencyId && !selectedSubAgencyId) || selectedAgentId ? (
              <>
                <div className="mb-4 text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 p-2 rounded-lg">
                  Applying to: <span className="text-slate-800 dark:text-white">
                    {selectedAgentId 
                      ? agents.find(a => a.id === selectedAgentId)?.name 
                      : agencies.find(a => a.id === selectedAgencyId)?.name + " (All Locations & Agents)"}
                  </span>
                </div>
                
                <button onClick={() => setShowPackageModal(true)} className="mb-4 w-full border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm font-bold text-primary hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors flex items-center justify-center gap-2">
                  <span className="material-icons-outlined text-sm">add</span> Add {packageContext} Package
                </button>
                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                  {displayedPackages.map(pkg => (
                    <div key={pkg.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50 dark:bg-slate-900 relative group">
                      <button onClick={() => handleDeletePackage(pkg.id)} className="absolute top-4 right-4 text-slate-400 hover:text-error opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-icons-outlined text-sm">delete</span>
                      </button>
                      <div className="flex justify-between items-start mb-2 pr-6">
                        <h3 className="font-bold text-slate-800 dark:text-white">{pkg.name}</h3>
                        <span className="font-bold text-primary">${pkg.price}</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {pkg.ground_photos_qty} Photos, {pkg.drone_qty} Drone {pkg.video_package ? `, ${pkg.video_package} Video` : ''}
                      </p>
                    </div>
                  ))}
                  {displayedPackages.length === 0 && <p className="text-sm text-slate-400 text-center mt-4">No custom packages created.</p>}
                </div>
              </>
            ) : selectedSubAgencyId ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-4 space-y-4">
                <span className="material-icons-outlined text-4xl text-slate-300">inventory_2</span>
                <p className="text-sm text-slate-500">
                  You are viewing a Location. <br/>
                  To add a package for <b>ALL</b> agents at {agencies.find(a=>a.id===selectedAgencyId)?.name}, select the top-level Agency on the left.<br/>
                  To add a package for a <b>SPECIFIC</b> agent, select an Agent in the middle column.
                </p>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center">
                <p className="text-sm text-slate-400">Select an Agency or an Agent to view and manage packages.</p>
              </div>
            )}
          </div>

          {/* Add Package Modal */}
          {showPackageModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md shadow-xl border border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-bold mb-1 text-slate-900 dark:text-white">New {packageContext} Package</h2>
                <p className="text-xs text-slate-500 mb-4">Will apply to: {selectedAgentId ? agents.find(a => a.id === selectedAgentId)?.name : agencies.find(a => a.id === selectedAgencyId)?.name}</p>
                <form onSubmit={handleAddPackage} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Package Name</label>
                    <input type="text" value={newPackage.name} onChange={e => setNewPackage({...newPackage, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2" required placeholder="e.g. Premium Deal" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Flat Price ($)</label>
                    <input type="number" value={newPackage.price} onChange={e => setNewPackage({...newPackage, price: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2" required placeholder="199" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Photos Qty</label>
                      <input type="number" value={newPackage.ground_photos_qty} onChange={e => setNewPackage({...newPackage, ground_photos_qty: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Drone Qty</label>
                      <input type="number" value={newPackage.drone_qty} onChange={e => setNewPackage({...newPackage, drone_qty: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Video Included</label>
                    <select value={newPackage.video_package} onChange={e => setNewPackage({...newPackage, video_package: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2">
                      <option value="">None</option>
                      <option value="basic">Basic Video</option>
                      <option value="standard">Standard Video</option>
                      <option value="premium">Premium Video</option>
                      <option value="ai">AI Video</option>
                    </select>
                  </div>
                  <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setShowPackageModal(false)} className="flex-1 px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600">Cancel</button>
                    <button type="submit" className="flex-1 px-4 py-2 bg-primary text-white rounded-xl font-bold">Save Package</button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
