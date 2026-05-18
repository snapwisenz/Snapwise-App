'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useJsApiLoader } from '@react-google-maps/api';

const libraries: any[] = ['places'];

export default function SettingsTeamPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Invite Modal State
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('photographer');
  const [isInviting, setIsInviting] = useState(false);

  // Edit Modal State
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Edit Form State
  const [editRole, setEditRole] = useState('');
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

  // --- Edit Profile Logic ---
  useEffect(() => {
    if (selectedProfile && isLoaded && window.google && addressInputRef.current && editRole === 'photographer') {
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
  }, [selectedProfile, isLoaded, editRole]);

  const openEditModal = (profile: any) => {
    setSelectedProfile(profile);
    setEditRole(profile.role || 'photographer');
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
      const isPhotographer = editRole === 'photographer';
      const updates = {
        role: editRole,
        base_address: isPhotographer ? baseAddress : null,
        service_regions: isPhotographer ? serviceRegions : null,
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

  const handleRemoveUser = async () => {
    if (!selectedProfile) return;
    const confirmed = window.confirm(`Are you sure you want to completely remove ${selectedProfile.first_name || 'this user'}? Their system access will be permanently revoked.`);
    if (!confirmed) return;
    
    setIsSaving(true);
    try {
      const res = await fetch(`/api/team/remove?id=${selectedProfile.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to remove user');
      
      alert('User removed successfully.');
      closeEditModal();
      fetchProfiles();
    } catch (err: any) {
      console.error(err);
      alert(`Error removing user: ${err.message}. Make sure SUPABASE_SERVICE_ROLE_KEY is configured in Vercel.`);
    } finally {
      setIsSaving(false);
    }
  };

  // --- Invite Logic ---
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    try {
      const res = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to send invite');
      
      alert(`Invitation sent to ${inviteEmail} for role: ${inviteRole.toUpperCase()}`);
      setIsInviteOpen(false);
      setInviteEmail('');
      setInviteRole('photographer');
      fetchProfiles(); // Refresh the list to show the pending profile
    } catch (err: any) {
      console.error(err);
      alert(`Failed to send invite: ${err.message}`);
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-12 space-y-6 bg-slate-50 dark:bg-slate-950 min-h-full relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Team Management</h1>
          <p className="text-base text-slate-500 dark:text-slate-400">Manage Admins, Dispatchers, and Photographers.</p>
        </div>
        <button 
          onClick={() => setIsInviteOpen(true)}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/30 hover:brightness-110 active:scale-95 transition-all"
        >
          <span className="material-icons-outlined">person_add</span>
          Invite Team Member
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[11px] tracking-widest">Name</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[11px] tracking-widest">Role</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[11px] tracking-widest">Contact</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[11px] tracking-widest">Service Areas</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[11px] tracking-widest">Status</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[11px] tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                    Loading team members...
                  </td>
                </tr>
              ) : profiles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                    No team members found.
                  </td>
                </tr>
              ) : (
                profiles.map((p) => {
                  const roleName = p.role ? p.role.charAt(0).toUpperCase() + p.role.slice(1) : 'Unassigned';
                  const isPhoto = p.role === 'photographer';
                  
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                            {p.first_name ? p.first_name[0] : (p.full_name ? p.full_name[0] : '?')}
                          </div>
                          <div className="font-bold text-slate-900 dark:text-slate-100">
                            {p.first_name && p.last_name ? `${p.first_name} ${p.last_name}` : (p.full_name || 'Unnamed')}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase ${
                          isPhoto ? 'bg-primary/10 text-primary-700 dark:text-primary-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}>
                          {roleName}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{p.email || '-'}</td>
                      <td className="px-6 py-4">
                        {!isPhoto ? (
                          <span className="text-slate-400 font-medium">—</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(p.service_regions) && p.service_regions.length > 0 ? (
                              p.service_regions.map((r: string) => (
                                <span key={r} className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                  {r.trim()}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs italic text-slate-400">None Set</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase bg-success/20 text-success-700 dark:text-success">
                          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => openEditModal(p)}
                          className="text-xs font-bold text-primary hover:text-primary-600 dark:hover:text-primary-400 transition-colors uppercase tracking-wider bg-primary/5 hover:bg-primary/10 px-3 py-2 rounded-lg"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Invite Modal --- */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-[60] overflow-hidden flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsInviteOpen(false)}></div>
          <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl h-full flex flex-col relative animate-in slide-in-from-right duration-300">
            <div className="px-6 py-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Invite Team Member</h2>
              <button onClick={() => setIsInviteOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                <span className="material-icons">close</span>
              </button>
            </div>
            
            <form onSubmit={handleInviteSubmit} className="flex-1 overflow-y-auto flex flex-col">
              <div className="p-6 space-y-6 flex-1">
                <div className="bg-primary/10 p-4 rounded-xl flex gap-3 text-sm text-primary-700 dark:text-primary-300">
                  <span className="material-icons-outlined text-primary">info</span>
                  <p>When the user accepts this invite, their onboarding flow will be customized based on the role you select below.</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="team@example.com"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Assigned Role</label>
                  <div className="relative">
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer"
                    >
                      <option value="admin">Admin</option>
                      <option value="dispatcher">Dispatcher</option>
                      <option value="photographer">Photographer</option>
                    </select>
                    <span className="material-icons-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {inviteRole === 'photographer' && "Photographers will be asked for their service zones and base address."}
                    {inviteRole === 'dispatcher' && "Dispatchers manage scheduling but don't travel."}
                    {inviteRole === 'admin' && "Admins have full access to billing and agency settings."}
                  </p>
                </div>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="flex-1 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-3 rounded-xl font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isInviting || !inviteEmail}
                  className="flex-1 bg-primary text-white py-3 rounded-xl font-bold shadow-lg shadow-primary/30 hover:brightness-110 disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isInviting ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : <>Send Invite <span className="material-icons-outlined text-sm">send</span></>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Edit Profile Modal --- */}
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
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">System Role</h4>
                <div className="relative">
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer"
                  >
                    <option value="admin">Admin</option>
                    <option value="dispatcher">Dispatcher</option>
                    <option value="photographer">Photographer</option>
                  </select>
                  <span className="material-icons-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                </div>
              </div>

              {/* Conditional Photographer Settings */}
              {editRole === 'photographer' && (
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
            
            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <button 
                onClick={handleRemoveUser}
                disabled={isSaving}
                className="text-error font-bold text-sm px-4 py-3 hover:bg-error/10 rounded-xl transition-all"
                title="Permanently remove user and revoke access"
              >
                Remove User
              </button>
              <div className="flex gap-3 flex-1 justify-end">
                <button 
                  onClick={closeEditModal}
                  className="px-6 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-3 rounded-xl font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="px-8 bg-primary text-white py-3 rounded-xl font-bold shadow-lg shadow-primary/30 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isSaving ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
