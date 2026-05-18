'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import Script from 'next/script';

export default function OnboardingPage() {
  const supabase = createClient();
  const addressInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPhotographer, setIsPhotographer] = useState(false);
  const [userRole, setUserRole] = useState<string>('staff');

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    home_address: '',
  });

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name, home_address, role, is_photographer')
          .eq('id', user.id)
          .single();
        if (profile) {
          setUserRole(profile.role || 'staff');
          setIsPhotographer(profile.is_photographer || false);
          setFormData({
            first_name: profile.first_name || '',
            last_name: profile.last_name || '',
            home_address: profile.home_address || '',
          });
        }
      }
    }
    loadProfile();
  }, [supabase]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated.');

      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          is_photographer: isPhotographer,
          home_address: isPhotographer ? formData.home_address : null,
        })
        .eq('id', user.id)
        .select('role');

      if (updateError) {
        throw new Error(updateError.message || 'Database error while saving profile.');
      }
      if (!data || data.length === 0) {
        throw new Error('Update returned no rows. Check that your RLS policy allows profile self-updates.');
      }

      // Route based strictly on role — not photographer status
      const role = data[0]?.role || userRole;
      if (role === 'owner' || role === 'admin') {
        window.location.href = '/dashboard';
      } else {
        // Staff go to their schedule/bookings view
        window.location.href = '/bookings';
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('Onboarding save error:', err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const initAutocomplete = () => {
    if (!addressInputRef.current || !window.google) return;
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

  // Re-init autocomplete when the photographer toggle reveals the address field
  useEffect(() => {
    if (isPhotographer && window.google && addressInputRef.current) {
      const timer = setTimeout(() => initAutocomplete(), 100);
      return () => clearTimeout(timer);
    }
  }, [isPhotographer]);

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
            <p className="text-slate-500 dark:text-slate-400">Let&apos;s get your profile set up so we can personalize your experience.</p>
          </div>

          {error && (
            <div className="bg-error/10 text-error p-4 rounded-lg mb-6 text-sm flex items-center gap-2">
              <span className="material-icons text-[18px]">error_outline</span>
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

            {/* Photographer Job Function Toggle */}
            <div className="pt-2">
              <label
                htmlFor="is_photographer"
                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  isPhotographer
                    ? 'border-primary bg-primary/5 dark:bg-primary/10'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${
                  isPhotographer ? 'border-primary bg-primary' : 'border-slate-300 dark:border-slate-600'
                }`}>
                  {isPhotographer && (
                    <span className="material-icons text-white text-[16px]">check</span>
                  )}
                </div>
                <input
                  type="checkbox"
                  id="is_photographer"
                  checked={isPhotographer}
                  onChange={(e) => {
                    setIsPhotographer(e.target.checked);
                    if (!e.target.checked) {
                      setFormData(prev => ({ ...prev, home_address: '' }));
                    }
                  }}
                  className="sr-only"
                />
                <div>
                  <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">I am a photographer</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">I need a route schedule and territory assignments.</p>
                </div>
                <span className={`material-icons-outlined ml-auto text-xl ${isPhotographer ? 'text-primary' : 'text-slate-400'}`}>camera_alt</span>
              </label>
            </div>

            {/* Conditional Address Field — shown only if is_photographer is true */}
            {isPhotographer && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
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
            )}

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
