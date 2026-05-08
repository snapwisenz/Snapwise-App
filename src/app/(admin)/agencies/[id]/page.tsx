'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { use } from 'react';

export default function AgencyProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const agencyId = resolvedParams.id;
  const router = useRouter();
  const supabase = createClient();
  
  const [agency, setAgency] = useState<any>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Edit state
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: '', website: '', notes: '' });

  // Add Location State
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');

  const fetchAgencyData = async () => {
    try {
      setLoading(true);
      const [resAgency, resLocations] = await Promise.all([
        supabase.from('agencies').select('*').eq('id', agencyId).single(),
        supabase.from('sub_agencies').select('*').eq('agency_id', agencyId).order('created_at', { ascending: false }),
      ]);

      if (resAgency.data) {
        setAgency(resAgency.data);
        setFormData({ 
          name: resAgency.data.name || '', 
          website: resAgency.data.website || '', 
          notes: resAgency.data.notes || '' 
        });
      } else if (resAgency.error) {
        console.error("Error fetching agency:", resAgency.error);
      }

      if (resLocations.data) {
        setLocations(resLocations.data);
        const locationIds = resLocations.data.map((l: any) => l.id);
        if (locationIds.length > 0) {
          const resAgents = await supabase.from('agents').select('*').in('sub_agency_id', locationIds).order('created_at', { ascending: false });
          if (resAgents.data) setAgents(resAgents.data);
        } else {
          setAgents([]);
        }
      }
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgencyData();
  }, [agencyId]);

  const handleSaveProfile = async () => {
    setSaving(true);
    const { error } = await supabase.from('agencies').update({
      name: formData.name,
      website: formData.website,
      notes: formData.notes
    }).eq('id', agencyId);
    
    setSaving(false);
    if (!error) {
      setEditMode(false);
      setAgency({ ...agency, ...formData });
    } else {
      console.error("Error updating profile:", error);
      alert("Failed to save profile changes.");
    }
  };

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocationName.trim()) return;
    
    const { error } = await supabase.from('sub_agencies').insert([{ name: newLocationName, agency_id: agencyId }]);
    if (!error) {
      setNewLocationName('');
      setShowLocationModal(false);
      fetchAgencyData(); // refresh to get new location
    } else {
      console.error("Error adding location:", error);
    }
  };

  if (loading) return <div className="flex-1 p-8 text-slate-500">Loading Agency Profile...</div>;
  if (!agency) return <div className="flex-1 p-8 text-error">Agency not found.</div>;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 dark:bg-slate-900 custom-scrollbar h-[calc(100vh-4rem)]">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Back Link */}
        <Link href="/agencies" className="text-sm font-bold text-slate-500 hover:text-primary flex items-center gap-1 w-fit">
          <span className="material-icons-outlined text-sm">arrow_back</span> Back to Directory
        </Link>

        {/* Header / Profile Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-700 relative">
          {!editMode && (
            <button 
              onClick={() => setEditMode(true)} 
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-full transition-colors flex items-center justify-center"
              title="Edit Profile"
            >
              <span className="material-icons-outlined">edit</span>
            </button>
          )}

          {editMode ? (
            <div className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Agency Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Website URL</label>
                <input type="url" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} placeholder="https://..." className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Internal Notes</label>
                <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} rows={4} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 custom-scrollbar"></textarea>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditMode(false)} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-300 text-sm">Cancel</button>
                <button onClick={handleSaveProfile} disabled={saving} className="px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{agency.name}</h1>
              {agency.website && (
                <a href={agency.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm font-semibold flex items-center gap-1 mb-4 w-fit">
                  <span className="material-icons-outlined text-sm">language</span> {agency.website.replace(/^https?:\/\//, '')}
                </a>
              )}
              {agency.notes && (
                <div className="mt-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                  <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Internal Notes</h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{agency.notes}</p>
                </div>
              )}
              {!agency.notes && !agency.website && (
                <p className="text-sm text-slate-400 mt-2">No additional information provided.</p>
              )}
            </div>
          )}
        </div>

        {/* Locations & Agents Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Locations */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900 dark:text-white text-lg">Locations</h2>
              <button onClick={() => setShowLocationModal(true)} className="text-primary hover:bg-primary/5 p-1.5 rounded-lg transition-colors flex items-center" title="Add Location">
                <span className="material-icons-outlined text-sm">add</span>
              </button>
            </div>
            
            <div className="space-y-2">
              {locations.map(loc => (
                <div key={loc.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 flex justify-between items-center">
                  <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{loc.name}</span>
                  <span className="text-xs text-slate-500 font-bold bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-full">
                    {agents.filter(a => a.sub_agency_id === loc.id).length} Agents
                  </span>
                </div>
              ))}
              {locations.length === 0 && <p className="text-sm text-slate-400 italic">No locations added.</p>}
            </div>
          </div>

          {/* Agents */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900 dark:text-white text-lg">Agents</h2>
              <Link href="/agencies/new-agent" className="text-primary hover:bg-primary/5 p-1.5 rounded-lg transition-colors flex items-center" title="Add Agent">
                <span className="material-icons-outlined text-sm">add</span>
              </Link>
            </div>
            
            <div className="space-y-2 overflow-y-auto max-h-80 custom-scrollbar pr-2">
              {agents.map(agent => (
                <div key={agent.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-sm text-slate-800 dark:text-slate-200">{agent.name}</div>
                    <div className="text-xs text-slate-500">{locations.find(l => l.id === agent.sub_agency_id)?.name}</div>
                  </div>
                  <Link href={`/agencies/edit-agent/${agent.id}`} className="text-slate-400 hover:text-secondary p-1">
                    <span className="material-icons-outlined text-sm">edit</span>
                  </Link>
                </div>
              ))}
              {agents.length === 0 && <p className="text-sm text-slate-400 italic">No agents added.</p>}
            </div>
          </div>

        </div>

        {/* Add Location Modal */}
        {showLocationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm shadow-xl border border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Add Location</h2>
              <form onSubmit={handleAddLocation} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Location Name</label>
                  <input type="text" value={newLocationName} onChange={e => setNewLocationName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2" required placeholder="e.g. Richmond Branch" />
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setShowLocationModal(false)} className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-300 text-sm">Cancel</button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm">Add</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
