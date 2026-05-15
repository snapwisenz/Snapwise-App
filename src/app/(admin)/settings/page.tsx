'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { RefreshCcw, Loader2 } from 'lucide-react';

interface PricingRule {
  id: string;
  quantity: number;
  product: string;
  price: number;
}

const PRODUCT_OPTIONS = [
  { value: 'ground_photo', label: 'Ground Photo' },
  { value: 'drone_photo', label: 'Drone Photo' },
  { value: 'reel', label: 'Reel' },
  { value: 'twilight_photo', label: 'Twilight Photo' },
  { value: 'video_basic', label: 'Basic Video' },
  { value: 'video_standard', label: 'Standard Video' },
  { value: 'video_premium', label: 'Premium Video' },
  { value: 'video_ai', label: 'AI Video' },
  { value: 'site_plan', label: 'Site Plan' },
  { value: 'floorplan', label: 'Floorplan' },
  { value: 'matterport', label: 'Matterport 3D Tour' },
  { value: 'virtual_staging', label: 'Virtual Staging' }
];

export default function SettingsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
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
    custom_pricing_rules: [] as PricingRule[],
    isCalendarConnected: false,
    nylas_connected_email: '',
  });

  useEffect(() => {
    async function loadSettings() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      
      const { data } = await supabase
        .from('agency_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setSettings(prev => ({
          ...prev,
          ...data,
          custom_pricing_rules: data.custom_pricing_rules || [],
          isCalendarConnected: !!data.nylas_grant_id,
          nylas_connected_email: data.nylas_connected_email || ''
        }));
      }
      setLoading(false);
    }
    loadSettings();
  }, [supabase]);

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      const res = await fetch('/api/nylas/disconnect', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to disconnect');
      setSettings(prev => ({ ...prev, isCalendarConnected: false, nylas_connected_email: '' }));
    } catch (error) {
      console.error(error);
      alert('Error disconnecting calendar');
    } finally {
      setDisconnecting(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    window.location.href = '/api/nylas/auth';
  };

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('You must be logged in');
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from('agency_settings')
      .upsert({ 
        user_id: user.id, 
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
        custom_pricing_rules: settings.custom_pricing_rules,
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

  const addPricingRule = () => {
    setSettings({
      ...settings,
      custom_pricing_rules: [
        ...settings.custom_pricing_rules,
        { id: Date.now().toString(), quantity: 1, product: 'ground_photo', price: 0 }
      ]
    });
  };

  const removePricingRule = (id: string) => {
    setSettings({
      ...settings,
      custom_pricing_rules: settings.custom_pricing_rules.filter(rule => rule.id !== id)
    });
  };

  const updatePricingRule = (id: string, field: keyof PricingRule, value: string | number) => {
    setSettings({
      ...settings,
      custom_pricing_rules: settings.custom_pricing_rules.map(rule => 
        rule.id === id ? { ...rule, [field]: value } : rule
      )
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
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pricing Settings</h1>
            <p className="text-sm text-slate-500 mt-1">Configure your base pricing for custom package calculations.</p>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-full font-bold shadow-sm transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Calendar Sync */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-700 mb-8">
          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary mb-6 flex items-center gap-2">
              <span className="material-icons-outlined text-base">event</span> Calendar Sync
            </h2>
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200">Google / Outlook Calendar</h3>
                <p className="text-sm text-slate-500 mt-1">Sync your bookings directly to your personal calendar.</p>
                <div className="mt-3 flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${settings.isCalendarConnected ? 'bg-success' : 'bg-slate-400'}`}></div>
                  <span className={`text-sm font-semibold ${settings.isCalendarConnected ? 'text-success' : 'text-slate-700 dark:text-slate-300'}`}>
                    {settings.isCalendarConnected ? (
                      settings.nylas_connected_email 
                        ? `Connected as ${settings.nylas_connected_email}` 
                        : 'Connected'
                    ) : 'Not Connected'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {settings.isCalendarConnected ? (
                  <>
                    <button
                      onClick={handleRefresh}
                      disabled={refreshing || disconnecting}
                      className="p-2.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center"
                      title="Refresh Connection"
                    >
                      {refreshing ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCcw className="w-5 h-5" />}
                    </button>
                    <button 
                      onClick={handleDisconnect}
                      disabled={disconnecting || refreshing}
                      className="px-6 py-2.5 rounded-full border border-error text-error font-bold hover:bg-error/10 transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {disconnecting && <Loader2 className="w-4 h-4 animate-spin" />}
                      Disconnect
                    </button>
                  </>
                ) : (
                  <a 
                    href="/api/nylas/auth"
                    className="px-6 py-2.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:opacity-90 transition-opacity text-sm inline-block"
                  >
                    Connect Calendar
                  </a>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Pricing Form */}
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

          {/* Custom Tiered Pricing */}
          <section className="mt-10 pt-10 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <span className="material-icons-outlined text-base">layers</span> Custom Tiered Pricing
              </h2>
              <button 
                onClick={addPricingRule}
                className="text-xs font-bold bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1"
              >
                <span className="material-icons-outlined text-sm">add</span> Add Rule
              </button>
            </div>
            
            <div className="space-y-4">
              {settings.custom_pricing_rules.length === 0 ? (
                <div className="text-sm text-slate-500 italic bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                  No custom pricing rules added yet. Add a rule to set specific group prices (e.g. 5x Ground Photos = $100).
                </div>
              ) : (
                settings.custom_pricing_rules.map((rule) => (
                  <div key={rule.id} className="flex flex-col md:flex-row items-end md:items-center gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="flex-1 w-full md:w-auto">
                      <label className="block text-xs font-semibold text-slate-500 mb-2 ml-1">Quantity</label>
                      <input 
                        type="number" 
                        min="1"
                        value={rule.quantity} 
                        onChange={(e) => updatePricingRule(rule.id, 'quantity', Number(e.target.value))} 
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm" 
                      />
                    </div>
                    <div className="flex-[2] w-full md:w-auto">
                      <label className="block text-xs font-semibold text-slate-500 mb-2 ml-1">Product</label>
                      <select 
                        value={rule.product} 
                        onChange={(e) => updatePricingRule(rule.id, 'product', e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm appearance-none"
                      >
                        {PRODUCT_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1 w-full md:w-auto">
                      <label className="block text-xs font-semibold text-slate-500 mb-2 ml-1">Total Price ($)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">$</span>
                        <input 
                          type="number" 
                          value={rule.price} 
                          onChange={(e) => updatePricingRule(rule.id, 'price', Number(e.target.value))} 
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 pl-7 pr-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm" 
                        />
                      </div>
                    </div>
                    <div className="w-full md:w-auto flex justify-end">
                      <button 
                        onClick={() => removePricingRule(rule.id)}
                        className="p-2.5 text-slate-400 hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                        title="Remove Rule"
                      >
                        <span className="material-icons-outlined text-xl">delete</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
