'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import AgenciesCRM from './AgenciesCRM';

export default function SettingsPage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<'general' | 'agencies'>('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    ground_photo_price: 10,
    drone_photo_price: 15,
    reel_price: 50,
    twilight_photo_price: 25,
    video_basic_price: 150,
    video_standard_price: 250,
    video_premium_price: 350,
    video_ai_price: 200,
    site_plan_price: 50,
    floorplan_price: 75,
    matterport_price: 100,
    virtual_staging_price: 30,
  });

  useEffect(() => {
    async function loadSettings() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('agency_settings')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
        
      if (data) {
        setSettings({
          ...settings,
          ...data
        });
      }
      setLoading(false);
    }
    loadSettings();
  }, [supabase]);

  const handleSave = async () => {
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('You must be logged in');
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from('agency_settings')
      .upsert({ 
        user_id: session.user.id, 
        ground_photo_price: settings.ground_photo_price,
        drone_photo_price: settings.drone_photo_price,
        reel_price: settings.reel_price,
        twilight_photo_price: settings.twilight_photo_price,
        video_basic_price: settings.video_basic_price,
        video_standard_price: settings.video_standard_price,
        video_premium_price: settings.video_premium_price,
        video_ai_price: settings.video_ai_price,
        site_plan_price: settings.site_plan_price,
        floorplan_price: settings.floorplan_price,
        matterport_price: settings.matterport_price,
        virtual_staging_price: settings.virtual_staging_price,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    setSaving(false);
    if (error) {
      console.error(error);
      alert('Error saving settings');
    } else {
      alert('Settings saved successfully!');
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings({
      ...settings,
      [key]: Number(value) || 0
    });
  };

  if (loading) {
    return <div className="p-8">Loading settings...</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 dark:bg-slate-900 custom-scrollbar h-[calc(100vh-4rem)]">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
            <p className="text-sm text-slate-500 mt-1">Configure your pricing and manage agencies.</p>
          </div>
          {activeTab === 'general' && (
            <button 
              onClick={handleSave}
              disabled={saving}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-full font-bold shadow-sm transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          <button 
            onClick={() => setActiveTab('general')}
            className={`pb-4 px-4 font-bold text-sm transition-colors border-b-2 ${activeTab === 'general' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            General Pricing
          </button>
          <button 
            onClick={() => setActiveTab('agencies')}
            className={`pb-4 px-4 font-bold text-sm transition-colors border-b-2 ${activeTab === 'agencies' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Agencies & Agents
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'general' ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-700">
          
          {/* Per Unit Assets */}
          <section className="mb-10">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary mb-6 flex items-center gap-2">
              <span className="material-icons-outlined text-base">photo_camera</span> Per Unit Pricing
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 ml-1">Ground Photo (per photo)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                  <input type="number" value={settings.ground_photo_price} onChange={(e) => handleChange('ground_photo_price', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-8 pr-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 ml-1">Drone Photo (per photo)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                  <input type="number" value={settings.drone_photo_price} onChange={(e) => handleChange('drone_photo_price', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-8 pr-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 ml-1">Reels (per reel)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                  <input type="number" value={settings.reel_price} onChange={(e) => handleChange('reel_price', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-8 pr-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 ml-1">Twilight Photo (per photo)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                  <input type="number" value={settings.twilight_photo_price} onChange={(e) => handleChange('twilight_photo_price', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-8 pr-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 ml-1">Virtual Staging (per photo)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                  <input type="number" value={settings.virtual_staging_price} onChange={(e) => handleChange('virtual_staging_price', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-8 pr-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>
              </div>
            </div>
          </section>

          {/* Video Packages */}
          <section className="mb-10">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary mb-6 flex items-center gap-2">
              <span className="material-icons-outlined text-base">videocam</span> Video Packages (Flat Rate)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 ml-1">Basic Video</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                  <input type="number" value={settings.video_basic_price} onChange={(e) => handleChange('video_basic_price', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-8 pr-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 ml-1">Standard Video</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                  <input type="number" value={settings.video_standard_price} onChange={(e) => handleChange('video_standard_price', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-8 pr-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 ml-1">Premium Video</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                  <input type="number" value={settings.video_premium_price} onChange={(e) => handleChange('video_premium_price', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-8 pr-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 ml-1">AI Video</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                  <input type="number" value={settings.video_ai_price} onChange={(e) => handleChange('video_ai_price', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-8 pr-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>
              </div>
            </div>
          </section>

          {/* Add-ons */}
          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary mb-6 flex items-center gap-2">
              <span className="material-icons-outlined text-base">extension</span> Add-ons (Flat Rate)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 ml-1">Site Plan</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                  <input type="number" value={settings.site_plan_price} onChange={(e) => handleChange('site_plan_price', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-8 pr-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 ml-1">Floorplan</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                  <input type="number" value={settings.floorplan_price} onChange={(e) => handleChange('floorplan_price', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-8 pr-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 ml-1">Matterport 3D Tour</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                  <input type="number" value={settings.matterport_price} onChange={(e) => handleChange('matterport_price', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-8 pr-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>
              </div>
            </div>
          </section>

        </div>
        ) : (
          <AgenciesCRM />
        )}
      </div>
    </div>
  );
}
