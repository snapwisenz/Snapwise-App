'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function AgenciesCRM() {
  const supabase = createClient();
  const [agencies, setAgencies] = useState<any[]>([]);
  const [subAgencies, setSubAgencies] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);

  const [selectedAgency, setSelectedAgency] = useState<string | null>(null);
  const [selectedSubAgency, setSelectedSubAgency] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  // Forms State
  const [newAgencyName, setNewAgencyName] = useState('');
  const [newSubAgencyName, setNewSubAgencyName] = useState('');
  const [newAgentName, setNewAgentName] = useState('');
  
  // Package Form
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [newPackage, setNewPackage] = useState({
    name: '', price: '', ground_photos_qty: 0, drone_qty: 0, video_package: ''
  });

  const fetchData = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const [resAgencies, resSubAgencies, resAgents, resPackages] = await Promise.all([
      supabase.from('agencies').select('*').order('created_at', { ascending: false }),
      supabase.from('sub_agencies').select('*').order('created_at', { ascending: false }),
      supabase.from('agents').select('*').order('created_at', { ascending: false }),
      supabase.from('agent_packages').select('*').order('created_at', { ascending: false })
    ]);

    if (resAgencies.data) setAgencies(resAgencies.data);
    if (resSubAgencies.data) setSubAgencies(resSubAgencies.data);
    if (resAgents.data) setAgents(resAgents.data);
    if (resPackages.data) setPackages(resPackages.data);

    setLoading(false);
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

  const handleAddSubAgency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubAgencyName.trim() || !selectedAgency) return;
    await supabase.from('sub_agencies').insert([{ name: newSubAgencyName, agency_id: selectedAgency }]);
    setNewSubAgencyName('');
    fetchData();
  };

  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentName.trim() || !selectedSubAgency) return;
    await supabase.from('agents').insert([{ name: newAgentName, sub_agency_id: selectedSubAgency }]);
    setNewAgentName('');
    fetchData();
  };

  const handleAddPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPackage.name.trim() || !newPackage.price || !selectedAgent) return;
    await supabase.from('agent_packages').insert([{ 
      agent_id: selectedAgent, 
      name: newPackage.name,
      price: Number(newPackage.price),
      ground_photos_qty: newPackage.ground_photos_qty,
      drone_qty: newPackage.drone_qty,
      video_package: newPackage.video_package
    }]);
    setShowPackageModal(false);
    setNewPackage({ name: '', price: '', ground_photos_qty: 0, drone_qty: 0, video_package: '' });
    fetchData();
  };

  if (loading) return <div className="p-8 text-slate-500">Loading CRM data...</div>;

  const currentSubAgencies = subAgencies.filter(s => s.agency_id === selectedAgency);
  const currentAgents = agents.filter(a => a.sub_agency_id === selectedSubAgency);
  const currentPackages = packages.filter(p => p.agent_id === selectedAgent);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 h-[700px] flex flex-col md:flex-row gap-6">
      
      {/* COLUMN 1: AGENCIES */}
      <div className="flex-1 border-r border-slate-100 dark:border-slate-700 pr-6 flex flex-col">
        <h2 className="font-bold text-slate-800 dark:text-white mb-4">Agencies</h2>
        <form onSubmit={handleAddAgency} className="mb-4 flex gap-2">
          <input type="text" placeholder="New Agency..." value={newAgencyName} onChange={e => setNewAgencyName(e.target.value)} className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-primary" />
          <button type="submit" className="bg-primary text-white px-3 rounded-lg text-sm font-bold">+</button>
        </form>
        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
          {agencies.map(ag => (
            <div key={ag.id} onClick={() => { setSelectedAgency(ag.id); setSelectedSubAgency(null); setSelectedAgent(null); }} className={`p-3 rounded-xl cursor-pointer transition-colors ${selectedAgency === ag.id ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300'}`}>
              {ag.name}
            </div>
          ))}
        </div>
      </div>

      {/* COLUMN 2: SUB-AGENCIES */}
      <div className="flex-1 border-r border-slate-100 dark:border-slate-700 pr-6 flex flex-col">
        <h2 className="font-bold text-slate-800 dark:text-white mb-4">Sub-Agencies</h2>
        {selectedAgency ? (
          <>
            <form onSubmit={handleAddSubAgency} className="mb-4 flex gap-2">
              <input type="text" placeholder="New Sub-Agency..." value={newSubAgencyName} onChange={e => setNewSubAgencyName(e.target.value)} className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-primary" />
              <button type="submit" className="bg-primary text-white px-3 rounded-lg text-sm font-bold">+</button>
            </form>
            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
              {currentSubAgencies.map(sub => (
                <div key={sub.id} onClick={() => { setSelectedSubAgency(sub.id); setSelectedAgent(null); }} className={`p-3 rounded-xl cursor-pointer transition-colors ${selectedSubAgency === sub.id ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300'}`}>
                  {sub.name}
                </div>
              ))}
              {currentSubAgencies.length === 0 && <p className="text-sm text-slate-400">No sub-agencies yet.</p>}
            </div>
          </>
        ) : (
          <p className="text-sm text-slate-400 mt-10 text-center">Select an agency first.</p>
        )}
      </div>

      {/* COLUMN 3: AGENTS */}
      <div className="flex-1 border-r border-slate-100 dark:border-slate-700 pr-6 flex flex-col">
        <h2 className="font-bold text-slate-800 dark:text-white mb-4">Agents</h2>
        {selectedSubAgency ? (
          <>
            <form onSubmit={handleAddAgent} className="mb-4 flex gap-2">
              <input type="text" placeholder="New Agent Name..." value={newAgentName} onChange={e => setNewAgentName(e.target.value)} className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-primary" />
              <button type="submit" className="bg-primary text-white px-3 rounded-lg text-sm font-bold">+</button>
            </form>
            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
              {currentAgents.map(agent => (
                <div key={agent.id} onClick={() => setSelectedAgent(agent.id)} className={`p-3 rounded-xl cursor-pointer transition-colors ${selectedAgent === agent.id ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300'}`}>
                  {agent.name}
                </div>
              ))}
              {currentAgents.length === 0 && <p className="text-sm text-slate-400">No agents yet.</p>}
            </div>
          </>
        ) : (
          <p className="text-sm text-slate-400 mt-10 text-center">Select a sub-agency first.</p>
        )}
      </div>

      {/* COLUMN 4: PACKAGES */}
      <div className="flex-[1.5] flex flex-col">
        <h2 className="font-bold text-slate-800 dark:text-white mb-4">Agent Custom Packages</h2>
        {selectedAgent ? (
          <>
            <button onClick={() => setShowPackageModal(true)} className="mb-4 w-full border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm font-bold text-primary hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors flex items-center justify-center gap-2">
              <span className="material-icons-outlined text-sm">add</span> Add Custom Package
            </button>
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
              {currentPackages.map(pkg => (
                <div key={pkg.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50 dark:bg-slate-900">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-800 dark:text-white">{pkg.name}</h3>
                    <span className="font-bold text-primary">${pkg.price}</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {pkg.ground_photos_qty} Photos, {pkg.drone_qty} Drone {pkg.video_package ? `, ${pkg.video_package} Video` : ''}
                  </p>
                </div>
              ))}
              {currentPackages.length === 0 && <p className="text-sm text-slate-400 text-center mt-4">No custom packages. Will fallback to General Pricing.</p>}
            </div>
          </>
        ) : (
          <p className="text-sm text-slate-400 mt-10 text-center">Select an agent first to manage packages.</p>
        )}
      </div>

      {/* Add Package Modal */}
      {showPackageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md shadow-xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">New Package</h2>
            <form onSubmit={handleAddPackage} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Package Name</label>
                <input type="text" value={newPackage.name} onChange={e => setNewPackage({...newPackage, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2" required placeholder="e.g. Starter Deal" />
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
  );
}
