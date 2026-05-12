'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Script from 'next/script';

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
    role_title: '',
    avatar_url: ''
  });

  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (profile) {
          setFormData({
            first_name: profile.first_name || '',
            last_name: profile.last_name || '',
            home_address: profile.home_address || '',
            role_title: profile.role_title || '',
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
          home_address: formData.home_address,
          role_title: formData.role_title,
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
    
    const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
      fields: ['formatted_address', 'name'],
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      const newAddress = place.formatted_address || place.name || '';
      setFormData(prev => ({ ...prev, home_address: newAddress }));
    });
  };

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
                <div className="flex items-center gap-3">
                  {['fun', 'bottts', 'adventurer', 'micah'].map((style) => {
                    const presetUrl = `https://api.dicebear.com/7.x/${style}/svg?seed=${formData.first_name || 'user'}`;
                    return (
                      <button 
                        key={style}
                        type="button"
                        onClick={() => selectPresetAvatar(presetUrl)}
                        className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all ${formData.avatar_url === presetUrl ? 'border-primary ring-2 ring-primary/30' : 'border-transparent hover:border-slate-300'}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={presetUrl} alt="Preset Avatar" className="w-full h-full object-cover bg-slate-100" />
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
              <label htmlFor="role_title" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Role Title</label>
              <input
                type="text"
                id="role_title"
                name="role_title"
                value={formData.role_title}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
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
