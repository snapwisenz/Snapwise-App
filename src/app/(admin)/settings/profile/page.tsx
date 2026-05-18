'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Script from 'next/script';

const PRESET_ICONS = [
  { id: 'camera', svg: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>` },
  { id: 'sun', svg: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>` },
  { id: 'user', svg: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>` },
  { id: 'house', svg: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>` },
  { id: 'building', svg: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/></svg>` },
  { id: 'compass', svg: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>` },
  { id: 'cat', svg: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 12 21s-9-3-9-7.56c0-1.25.5-2.4 1-3.44 0 0-1.89-6.42-.5-7 1.39-.58 4.72.23 6.5 2.23A9.04 9.04 0 0 1 12 5Z"/><path d="M8 14v.5"/><path d="M16 14v.5"/><path d="M11.25 16.25h1.5L12 17l-.75-.75Z"/></svg>` },
  { id: 'gear', svg: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>` },
];

export default function ProfileSettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    home_address: '',
    role: '',
    avatar_url: ''
  });

  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [isPhotographer, setIsPhotographer] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: profile } = await supabase.from('profiles').select('first_name, last_name, home_address, role, avatar_url, is_photographer').eq('id', user.id).single();
        if (profile) {
          setUserRole(profile.role || 'staff');
          setIsPhotographer(profile.is_photographer || false);
          setFormData({
            first_name: profile.first_name || '',
            last_name: profile.last_name || '',
            home_address: profile.home_address || '',
            role: profile.role || 'staff',
            avatar_url: profile.avatar_url || ''
          });
        }
      }
    }
    loadProfile();
  }, [supabase]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      if (!e.target.files || e.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      // Prefix with user ID to comply with RLS policies: (storage.foldername(name))[1] = auth.uid()
      const filePath = `${userId}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      setFormData((prev) => ({ ...prev, avatar_url: data.publicUrl }));
      setSuccessMessage('Avatar uploaded successfully. Remember to save changes.');

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error uploading avatar.');
    } finally {
      setLoading(false);
    }
  };

  const selectPresetAvatar = (url: string) => {
    setFormData((prev) => ({ ...prev, avatar_url: url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (!userId) throw new Error('User not authenticated.');

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          is_photographer: isPhotographer,
          home_address: isPhotographer ? formData.home_address : null,
          avatar_url: formData.avatar_url
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      setSuccessMessage('Profile updated successfully!');
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while saving your profile.');
    } finally {
      setLoading(false);
    }
  };

  const initAutocomplete = () => {
    if (!addressInputRef.current || !window.google) return;
    
    // Prevent multiple initializations on the same input
    if (addressInputRef.current.dataset.hasAutocomplete) return;
    addressInputRef.current.dataset.hasAutocomplete = 'true';
    
    const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
      fields: ['formatted_address', 'name'],
      componentRestrictions: { country: 'nz' },
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      const newAddress = place.formatted_address || place.name || '';
      setFormData(prev => ({ ...prev, home_address: newAddress }));
    });
  };

  useEffect(() => {
    if (window.google) {
      initAutocomplete();
    }
  }, []);

  return (
    <>
      <Script 
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`} 
        strategy="lazyOnload" 
        onLoad={initAutocomplete} 
      />
      <main className="flex-grow overflow-y-auto p-8 font-display text-slate-800 dark:text-slate-200">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-slate-500 mt-2">Manage your personal details and preferences.</p>
      </header>

      <div className="max-w-4xl bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        
        {/* Avatar Section */}
        <div className="p-8 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <h2 className="text-lg font-semibold mb-4">Profile Picture</h2>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center shrink-0 border-4 border-white shadow-sm">
              {formData.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="material-icons text-4xl text-primary/50">person</span>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  type="button"
                >
                  Upload Custom Image
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleAvatarUpload} 
                  className="hidden" 
                  accept="image/*"
                />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-500 mb-2">Or choose a preset:</p>
                <div className="flex items-center gap-3 flex-wrap">
                  {PRESET_ICONS.map((preset) => {
                    const presetUrl = `data:image/svg+xml;utf8,${encodeURIComponent(preset.svg)}`;
                    return (
                      <button 
                        key={preset.id}
                        type="button"
                        onClick={() => selectPresetAvatar(presetUrl)}
                        className={`w-12 h-12 rounded-full overflow-hidden border-2 flex items-center justify-center bg-slate-100 dark:bg-slate-800 transition-all ${formData.avatar_url === presetUrl ? 'border-primary ring-2 ring-primary/30' : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600'}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={presetUrl} alt={`Preset ${preset.id}`} className="w-6 h-6 object-contain" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="p-8">
          {error && (
            <div className="bg-error/10 text-error p-4 rounded-lg mb-6 text-sm flex items-center gap-2">
              <span className="material-icons">error_outline</span>
              {error}
            </div>
          )}
          {successMessage && (
            <div className="bg-success/10 text-success p-4 rounded-lg mb-6 text-sm flex items-center gap-2">
              <span className="material-icons">check_circle</span>
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="first_name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">First Name</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  required
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="last_name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Last Name</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  required
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="role" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">System Role</label>
              <div className="relative">
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  disabled
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 focus:outline-none cursor-not-allowed appearance-none font-semibold"
                >
                  <option value="owner">Owner</option>
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                </select>
                <span className="material-icons-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">lock</span>
              </div>
              <p className="text-xs text-slate-400">Your role is managed by the Account Owner via Team Settings.</p>
            </div>

            {/* Photographer job function toggle */}
            <div className="pt-2">
              <label
                htmlFor="is_photographer_profile"
                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  isPhotographer
                    ? 'border-primary bg-primary/5 dark:bg-primary/10'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${
                  isPhotographer ? 'border-primary bg-primary' : 'border-slate-300 dark:border-slate-600'
                }`}>
                  {isPhotographer && <span className="material-icons text-white text-[16px]">check</span>}
                </div>
                <input
                  type="checkbox"
                  id="is_photographer_profile"
                  checked={isPhotographer}
                  onChange={(e) => {
                    setIsPhotographer(e.target.checked);
                    if (!e.target.checked) setFormData(prev => ({ ...prev, home_address: '' }));
                  }}
                  className="sr-only"
                />
                <div>
                  <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">I am a photographer</p>
                  <p className="text-xs text-slate-500 mt-0.5">I need a route schedule and territory assignments.</p>
                </div>
                <span className={`material-icons-outlined ml-auto text-xl ${isPhotographer ? 'text-primary' : 'text-slate-400'}`}>camera_alt</span>
              </label>
            </div>

            <div className="space-y-2">
              <label htmlFor="home_address" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Home Base Address</label>
              <input
                ref={addressInputRef}
                type="text"
                id="home_address"
                name="home_address"
                value={formData.home_address}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="flex justify-end border-t border-slate-200 dark:border-slate-700 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="bg-primary hover:bg-primary-container text-on-primary font-bold py-2 px-8 rounded-lg transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Smart Working Rules Placeholder */}
      <div className="max-w-4xl mt-8 bg-gradient-to-r from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10 rounded-2xl shadow-sm border border-primary/20 dark:border-primary/30 overflow-hidden relative">
        <div className="absolute top-6 right-6">
          <span className="bg-primary/20 text-primary font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider">Coming Soon</span>
        </div>
        <div className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Smart Working Rules</h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-2xl">
            We are building a dedicated AI Rule Builder! Soon, you will be able to construct complex, natural-language logic rules to govern how the AI dispatcher manages your schedule, buffers, and appointments.
          </p>
          <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-4 border border-white/20 dark:border-slate-700/50 backdrop-blur-sm">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 italic">
              Example: "Don't book any shoots past 4 PM on Fridays, and automatically add 30 mins travel buffer if the shoot is outside the CBD."
            </p>
          </div>
        </div>
      </div>
    </main>
    </>
  );
}
