'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Script from 'next/script';

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const addressInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    home_address: '',
    role_title: ''
  });

  useEffect(() => {
    // Optionally fetch existing profile data to pre-fill if any exist
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setFormData(prev => ({ ...prev, email: user.email || '' }));
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (profile) {
          setFormData({
            first_name: profile.first_name || '',
            last_name: profile.last_name || '',
            home_address: profile.home_address || '',
            role_title: profile.role_title || ''
          });
        }
      }
    }
    loadProfile();
  }, [supabase]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated.');

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          home_address: formData.home_address,
          role_title: formData.role_title,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      router.push('/dashboard');
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
      <main className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-6">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm w-full max-w-2xl border border-slate-200 dark:border-slate-700">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Welcome to Snapwise!</h1>
          <p className="text-slate-500 dark:text-slate-400">Let's get your profile set up so we can personalize your experience.</p>
        </div>

        {error && (
          <div className="bg-error/10 text-error p-4 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="first_name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">First Name *</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                required
                value={formData.first_name}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Jane"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="last_name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Last Name *</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                required
                value={formData.last_name}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="home_address" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Home Base Address</label>
            <p className="text-xs text-slate-500 mb-1">Used to calculate your driving distances and routes.</p>
            <input
              ref={addressInputRef}
              type="text"
              id="home_address"
              name="home_address"
              value={formData.home_address}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="e.g. 123 Main St, Auckland"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="role_title" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Role Title</label>
            <input
              type="text"
              id="role_title"
              name="role_title"
              value={formData.role_title}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="e.g. Lead Photographer"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-container text-on-primary font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
            ) : (
              'Complete Profile'
            )}
          </button>
        </form>
      </div>
    </main>
    </>
  );
}
