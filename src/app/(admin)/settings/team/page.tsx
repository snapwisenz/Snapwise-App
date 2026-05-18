'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useJsApiLoader } from '@react-google-maps/api';

const libraries: any[] = ['places'];

export default function SettingsTeamPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Edit Form State
  const [isPhotographer, setIsPhotographer] = useState(false);
  const [baseAddress, setBaseAddress] = useState('');
  const [serviceRegions, setServiceRegions] = useState<string[]>([]);
  const [newRegion, setNewRegion] = useState('');
  
  const addressInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  useEffect(() => {
    fetchProfiles();
  }, [supabase]);

  async function fetchProfiles() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProfiles(data || []);
    } catch (err) {
      console.error('Error fetching profiles:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (selectedProfile && isLoaded && window.google && addressInputRef.current && isPhotographer) {
      if (addressInputRef.current.dataset.hasAutocomplete) return;
      addressInputRef.current.dataset.hasAutocomplete = 'true';
      
      const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
        fields: ['formatted_address', 'name'],
        componentRestrictions: { country: 'nz' },
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        const newAddress = place.formatted_address || place.name || '';
        setBaseAddress(newAddress);
      });
    }
  }, [selectedProfile, isLoaded, isPhotographer]);

  const openEditModal = (profile: any) => {
    setSelectedProfile(profile);
    setIsPhotographer(profile.role === 'photographer');
    setBaseAddress(profile.base_address || profile.home_address || '');
    setServiceRegions(Array.isArray(profile.service_regions) ? profile.service_regions : []);
    setNewRegion('');
  };

  const closeEditModal = () => {
    setSelectedProfile(null);
  };

  const handleAddRegion = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newRegion.trim()) {
      e.preventDefault();
      if (!serviceRegions.includes(newRegion.trim())) {
        setServiceRegions([...serviceRegions, newRegion.trim()]);
      }
      setNewRegion('');
    }
  };

  const handleRemoveRegion = (regionToRemove: string) => {
    setServiceRegions(serviceRegions.filter(r => r !== regionToRemove));
  };

  const handleSaveProfile = async () => {
    if (!selectedProfile) return;
    setIsSaving(true);
    try {
      const updates = {
        role: isPhotographer ? 'photographer' : (selectedProfile.role === 'photographer' ? null : selectedProfile.role),
        base_address: isPhotographer ? baseAddress : selectedProfile.base_address,
        service_regions: isPhotographer ? serviceRegions : selectedProfile.service_regions,
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', selectedProfile.id);

      if (error) throw error;

      alert('Profile updated successfully!');
      closeEditModal();
      fetchProfiles();
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-12 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Staff Management</h1>
          <p className="text-base text-slate-500 dark:text-slate-400">Manage your team members, permissions, and service zones.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[11px] tracking-widest">Name</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[11px] tracking-widest">Email</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[11px] tracking-widest">Role</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[11px] tracking-widest">Nylas Sync</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">
                    Loading staff...
                  </td>
                </tr>
              ) : profiles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">
                    No users found.
                  </td>
                </tr>
              ) : (
                profiles.map((p) => (
                  <tr 
                    key={p.id} 
                    onClick={() => openEditModal(p)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                          {p.first_name ? p.first_name[0] : (p.full_name ? p.full_name[0] : '?')}
                        </div>
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          {p.first_name && p.last_name ? `${p.first_name} ${p.last_name}` : (p.full_name || 'Unnamed User')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{p.email || 'No email provided'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase ${
                        p.role === 'photographer' ? 'bg-primary/20 text-primary-700 dark:text-primary-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}>
                        {p.role || 'Unassigned'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {p.nylas_grant_id ? (
                        <span className="inline-flex items-center gap-1.5 text-success text-xs font-bold">
                          <span className="material-icons-outlined text-[14px]">check_circle</span> Connected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                          <span className="material-icons-outlined text-[14px]">cancel</span> Not Connected
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedProfile && (
        <div className="fixed inset-0 z-[60] overflow-hidden flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeEditModal}></div>
          <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl h-full flex flex-col relative animate-in slide-in-from-right duration-300">
            <div className="px-6 py-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Edit Staff Profile</h2>
              <button onClick={closeEditModal} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                <span className="material-icons">close</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Basic Info */}
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                  {selectedProfile.first_name && selectedProfile.last_name ? `${selectedProfile.first_name} ${selectedProfile.last_name}` : (selectedProfile.full_name || 'Unnamed')}
                </h3>
                <p className="text-sm text-slate-500">{selectedProfile.email}</p>
              </div>

              {/* Roles & Permissions */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">Roles & Permissions</h4>
                
                <label className="flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all border-primary/20 bg-primary/5 hover:border-primary/40">
                  <input 
                    type="checkbox" 
                    checked={isPhotographer}
                    onChange={(e) => setIsPhotographer(e.target.checked)}
                    className="w-5 h-5 mt-0.5 text-primary border-slate-300 focus:ring-primary rounded" 
                  />
                  <div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white block">Designate as Photographer</span>
                    <span className="text-xs text-slate-500 block mt-1">Allows this user to be booked for jobs, manage service regions, and appear in AI routing suggestions.</span>
                  </div>
                </label>
              </div>

              {/* Conditional Photographer Settings */}
              {isPhotographer && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 pt-4 border-t border-slate-100 dark:border-slate-800">Photographer Logistics</h4>
                  
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Base Address</label>
                    <input
                      ref={addressInputRef}
                      type="text"
                      value={baseAddress}
                      onChange={(e) => setBaseAddress(e.target.value)}
                      placeholder="Enter base address for routing..."
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                    />
                    <p className="text-[10px] text-slate-400">Used to calculate starting travel times.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Service Regions (Tags)</label>
                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-800 focus-within:ring-2 focus-within:ring-primary flex flex-wrap gap-2">
                      {serviceRegions.map(region => (
                        <span key={region} className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                          {region}
                          <button onClick={() => handleRemoveRegion(region)} className="hover:text-primary-700">
                            <span className="material-icons-outlined text-[14px]">close</span>
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        value={newRegion}
                        onChange={(e) => setNewRegion(e.target.value)}
                        onKeyDown={handleAddRegion}
                        placeholder="Type a city and hit Enter..."
                        className="flex-1 min-w-[120px] bg-transparent outline-none text-sm p-1 text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-4">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Calendar Sync (Nylas)</label>
                    {selectedProfile.nylas_grant_id ? (
                      <div className="bg-success/10 border border-success/20 p-4 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-success-700 dark:text-success-400">Calendar Connected</p>
                          <p className="text-xs text-success-600/70 mt-1">Grant ID: {selectedProfile.nylas_grant_id.substring(0,8)}...</p>
                        </div>
                        <span className="material-icons text-success">check_circle</span>
                      </div>
                    ) : (
                      <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Not Connected</p>
                        <p className="text-xs text-slate-500 mt-1">This user needs to log into their dashboard and sync their Google Calendar.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex gap-3">
              <button 
                onClick={closeEditModal}
                className="flex-1 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-3 rounded-xl font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex-1 bg-primary text-white py-3 rounded-xl font-bold shadow-lg shadow-primary/30 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center"
              >
                {isSaving ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
