'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useJsApiLoader } from '@react-google-maps/api';
import { toast } from 'sonner';

const libraries: any[] = ['places'];

export default function SettingsTeamPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  const [currentAgencyId, setCurrentAgencyId] = useState<string | null>(null);
  
  // Invite Modal State
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('staff');
  const [inviteIsPhotographer, setInviteIsPhotographer] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  // Edit Modal State
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Edit Form State
  const [editRole, setEditRole] = useState('');
  const [editIsPhotographer, setEditIsPhotographer] = useState(false);
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
    async function init() {
      // Fetch current user's role for permission gating
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: myProfile } = await supabase
          .from('profiles')
          .select('role, agency_id')
          .eq('id', user.id)
          .single();
        if (myProfile) {
          setCurrentUserRole(myProfile.role || '');
          if (myProfile.agency_id) setCurrentAgencyId(myProfile.agency_id);
        }
      }
      fetchProfiles();
    }
    init();
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
    if (selectedProfile && isLoaded && window.google && addressInputRef.current && editIsPhotographer) {
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
  }, [selectedProfile, isLoaded, editIsPhotographer]);

  const openEditModal = (profile: any) => {
    setSelectedProfile(profile);
    setEditRole(profile.role || 'staff');
    setEditIsPhotographer(profile.is_photographer || false);
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
        role: editRole,
        is_photographer: editIsPhotographer,
        base_address: editIsPhotographer ? baseAddress : null,
        service_regions: editIsPhotographer ? serviceRegions : null,
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', selectedProfile.id);

      if (error) throw new Error(error.message);

      toast.success('Profile updated successfully!');
      closeEditModal();
      fetchProfiles();
    } catch (err) {
      console.error('Error saving profile:', err);
      toast.error(`Failed to update profile: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveUser = async () => {
    if (!selectedProfile) return;
    const confirmed = window.confirm(`Are you sure you want to completely remove ${selectedProfile.first_name || selectedProfile.email || 'this user'}? Their system access will be permanently revoked.`);
    if (!confirmed) return;
    
    setIsSaving(true);
    try {
      const res = await fetch(`/api/team/delete-user?id=${selectedProfile.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to remove user');
      
      toast.success('User removed successfully.');
      closeEditModal();
      fetchProfiles();
    } catch (err: any) {
      console.error(err);
      toast.error(`Error removing user: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevokeAccessInline = async (p: any) => {
    const confirmed = window.confirm(`Are you sure you want to revoke access for ${p.email}? This will permanently delete their account.`);
    if (!confirmed) return;
    
    setActionLoading(p.id);
    try {
      const res = await fetch(`/api/team/delete-user?id=${p.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to remove user');
      
      toast.success('User access revoked.');
      fetchProfiles();
    } catch (err: any) {
      console.error(err);
      toast.error(`Error revoking access: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResendInvite = async (p: any) => {
    setActionLoading(p.id);
    try {
      const res = await fetch('/api/team/resend-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: p.email, role: p.role, is_photographer: p.is_photographer })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to resend invite');
      
      toast.success(`Invite resent successfully to ${p.email}`);
    } catch (err: any) {
      console.error(err);
      toast.error(`Failed to resend invite: ${err.message}`);
    } finally {
      setActionLoading(null);
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
        body: JSON.stringify({ 
          email: inviteEmail, 
          role: inviteRole, 
          is_photographer: inviteIsPhotographer,
          agency_id: currentAgencyId 
        })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to send invite');
      
      toast.success(`Invitation sent successfully to ${inviteEmail}`);
      setIsInviteOpen(false);
      setInviteEmail('');
      setInviteRole('staff');
      setInviteIsPhotographer(false);
      fetchProfiles(); // Refresh the list to show the pending profile
    } catch (err: any) {
      console.error(err);
      toast.error(`Failed to send invite: ${err.message}`);
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-12 space-y-6 bg-slate-50 dark:bg-slate-950 min-h-full relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Team Management</h1>
          <p className="text-base text-slate-500 dark:text-slate-400">Manage Owners, Admins, and Photographers.</p>
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
                  const isPhoto = p.is_photographer === true;
                  
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                            {p.first_name ? p.first_name[0] : (p.email ? p.email[0].toUpperCase() : '?')}
                          </div>
                          <div className="font-bold text-slate-900 dark:text-slate-100">
                            {p.first_name && p.last_name ? `${p.first_name} ${p.last_name}` : (p.email || p.full_name || 'Unnamed')}
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
                          <span className="text-slate-400 text-xs font-medium">N/A</span>
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
                        {(!p.first_name || !p.last_name) ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            Pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase bg-success/20 text-success-700 dark:text-success">
                            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {(!p.first_name || !p.last_name) && (
                            <button 
                              onClick={() => handleResendInvite(p)}
                              disabled={actionLoading === p.id}
                              className="text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors uppercase tracking-wider bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 px-3 py-2 rounded-lg disabled:opacity-50"
                            >
                              Resend
                            </button>
                          )}
                          <button 
                            onClick={() => openEditModal(p)}
                            className="text-xs font-bold text-primary hover:text-primary-600 dark:hover:text-primary-400 transition-colors uppercase tracking-wider bg-primary/5 hover:bg-primary/10 px-3 py-2 rounded-lg"
                          >
                            Edit
                          </button>
                          {(!p.first_name || !p.last_name) && (
                            <button 
                              onClick={() => handleRevokeAccessInline(p)}
                              disabled={actionLoading === p.id}
                              className="text-xs font-bold text-error hover:text-error-600 transition-colors uppercase tracking-wider bg-error/5 hover:bg-error/10 px-3 py-2 rounded-lg disabled:opacity-50"
                            >
                              Revoke
                            </button>
                          )}
                        </div>
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
          <div className="w-full sm:w-[400px] shrink-0 bg-white dark:bg-slate-900 shadow-2xl h-full flex flex-col relative animate-in slide-in-from-right duration-300">
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

                <div className="space-y-3">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Access Level</label>
                  <div className="space-y-2">
                    {[
                      { value: 'admin', label: 'Admin', desc: 'Manage bookings, team, and agency settings.', icon: 'admin_panel_settings' },
                      { value: 'staff', label: 'Staff', desc: 'Access to schedule and assigned bookings.', icon: 'person' },
                    ].map(opt => {
                      return (
                        <label
                          key={opt.value}
                          className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            inviteRole === opt.value
                              ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-sm'
                              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                          }`}
                        >
                          <input
                            type="radio"
                            name="inviteRole"
                            value={opt.value}
                            checked={inviteRole === opt.value}
                            onChange={(e) => setInviteRole(e.target.value)}
                            className="sr-only"
                          />
                          <span className={`material-icons-outlined text-xl ${inviteRole === opt.value ? 'text-primary' : 'text-slate-400'}`}>{opt.icon}</span>
                          <div className="flex-1">
                            <p className="font-bold text-sm text-slate-900 dark:text-white">{opt.label}</p>
                            <p className="text-[11px] text-slate-500">{opt.desc}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            inviteRole === opt.value ? 'border-primary bg-primary' : 'border-slate-300 dark:border-slate-600'
                          }`}>
                            {inviteRole === opt.value && <span className="w-2 h-2 rounded-full bg-white"></span>}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2">
                  <label
                    htmlFor="invite_is_photographer"
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      inviteIsPhotographer
                        ? 'border-primary bg-primary/5 dark:bg-primary/10'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${
                      inviteIsPhotographer ? 'border-primary bg-primary' : 'border-slate-300 dark:border-slate-600'
                    }`}>
                      {inviteIsPhotographer && <span className="material-icons text-white text-[16px]">check</span>}
                    </div>
                    <input
                      type="checkbox"
                      id="invite_is_photographer"
                      checked={inviteIsPhotographer}
                      onChange={(e) => setInviteIsPhotographer(e.target.checked)}
                      className="sr-only"
                    />
                    <div>
                      <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">Is a photographer</p>
                      <p className="text-xs text-slate-500 mt-0.5">Enables route scheduling and territory assignments.</p>
                    </div>
                    <span className={`material-icons-outlined ml-auto text-xl ${inviteIsPhotographer ? 'text-primary' : 'text-slate-400'}`}>camera_alt</span>
                  </label>
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
          <div className="w-full sm:w-[400px] shrink-0 bg-white dark:bg-slate-900 shadow-2xl h-full flex flex-col relative animate-in slide-in-from-right duration-300">
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

              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">System Role</h4>
                {selectedProfile.role === 'owner' && currentUserRole !== 'owner' ? (
                  <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="material-icons-outlined text-amber-500">shield</span>
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">Account Owner</p>
                      <p className="text-[11px] text-slate-500">Owner role cannot be changed.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {[
                      { value: 'owner', label: 'Owner', desc: 'Full system control.', icon: 'shield' },
                      { value: 'admin', label: 'Admin', desc: 'Manage bookings and team.', icon: 'admin_panel_settings' },
                      { value: 'staff', label: 'Staff', desc: 'Access to schedule and bookings.', icon: 'person' },
                    ].map(opt => {
                      const isDisabled = opt.value === 'owner' && currentUserRole !== 'owner';
                      return (
                        <label
                          key={opt.value}
                          className={`flex items-center gap-4 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                            editRole === opt.value
                              ? 'border-primary bg-primary/5 dark:bg-primary/10'
                              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                          } ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                        >
                          <input
                            type="radio"
                            name="editRole"
                            value={opt.value}
                            checked={editRole === opt.value}
                            onChange={(e) => setEditRole(e.target.value)}
                            disabled={isDisabled}
                            className="sr-only"
                          />
                          <span className={`material-icons-outlined ${editRole === opt.value ? 'text-primary' : 'text-slate-400'}`}>{opt.icon}</span>
                          <div className="flex-1">
                            <p className="font-bold text-sm text-slate-900 dark:text-white">{opt.label}</p>
                            <p className="text-[10px] text-slate-500">{opt.desc}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            editRole === opt.value ? 'border-primary bg-primary' : 'border-slate-300 dark:border-slate-600'
                          }`}>
                            {editRole === opt.value && <span className="w-2 h-2 rounded-full bg-white"></span>}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Photographer Job Function Toggle */}
              <div className="pt-2">
                <label
                  htmlFor="edit_is_photographer"
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    editIsPhotographer
                      ? 'border-primary bg-primary/5 dark:bg-primary/10'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${
                    editIsPhotographer ? 'border-primary bg-primary' : 'border-slate-300 dark:border-slate-600'
                  }`}>
                    {editIsPhotographer && <span className="material-icons text-white text-[16px]">check</span>}
                  </div>
                  <input
                    type="checkbox"
                    id="edit_is_photographer"
                    checked={editIsPhotographer}
                    onChange={(e) => {
                      setEditIsPhotographer(e.target.checked);
                      if (!e.target.checked) {
                        setBaseAddress('');
                        setServiceRegions([]);
                      }
                    }}
                    className="sr-only"
                  />
                  <div>
                    <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">Is a photographer</p>
                    <p className="text-xs text-slate-500 mt-0.5">Enables route scheduling and territory assignments.</p>
                  </div>
                  <span className={`material-icons-outlined ml-auto text-xl ${editIsPhotographer ? 'text-primary' : 'text-slate-400'}`}>camera_alt</span>
                </label>
              </div>

              {/* Conditional Photographer Logistics */}
              {editIsPhotographer && (
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
