'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Script from 'next/script';
import { createClient } from '@/utils/supabase/client';

export default function NewJobPage() {
  const [address, setAddress] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [travelTime, setTravelTime] = useState<{ raw: number; rounded: number } | null>(null);
  const [loadingRouting, setLoadingRouting] = useState(false);
  const [overlapWarning, setOverlapWarning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Cascading State Management
  const [selectedAgency, setSelectedAgency] = useState(''); // Stores sub_agency_id
  const [selectedAgent, setSelectedAgent] = useState('');
  
  // Real Data State
  const [agenciesList, setAgenciesList] = useState<any[]>([]);
  const [subAgenciesList, setSubAgenciesList] = useState<any[]>([]);
  const [agentsList, setAgentsList] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<{name: string, duration: number, price: string, photos?: string} | null>(null);
  const [idealMode, setIdealMode] = useState(true); // true = Anchor slots (Ideal), false = Liquid mode

  // Custom Package State
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customOptions, setCustomOptions] = useState({
    groundPhotos: '',
    drone: '',
    reels: '',
    twilight: '',
    video: '', // '' | 'basic' | 'standard'
    sitePlan: false,
    floorplan: false,
    matterport: false,
    virtualStaging: false,
    virtualStagingQty: '',
    virtualStagingNotes: '',
  });

  // Smart Task Fields
  const [packageDetails, setPackageDetails] = useState('');
  const [packageTbc, setPackageTbc] = useState(false);
  const [keyBoxPin, setKeyBoxPin] = useState('');
  const [keyPinTbc, setKeyPinTbc] = useState(false);
  const [requiresFloorPlan, setRequiresFloorPlan] = useState(false);

  const [pricingSettings, setPricingSettings] = useState({
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
    custom_pricing_rules: [] as any[],
  });

  const supabase = createClient();

  useEffect(() => {
    async function fetchPricingAndAgencies() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const [pricingRes, agenciesRes, subAgenciesRes] = await Promise.all([
        supabase.from('agency_settings').select('*').eq('user_id', user.id).single(),
        supabase.from('agencies').select('*').eq('user_id', user.id),
        supabase.from('sub_agencies').select('*')
      ]);

      if (pricingRes.data) setPricingSettings(prev => ({ ...prev, ...pricingRes.data }));
      if (agenciesRes.data) setAgenciesList(agenciesRes.data);
      if (subAgenciesRes.data) setSubAgenciesList(subAgenciesRes.data);
    }
    fetchPricingAndAgencies();
  }, [supabase]);

  // Fetch agents when sub-agency changes
  useEffect(() => {
    async function fetchAgents() {
      if (!selectedAgency) {
        setAgentsList([]);
        return;
      }
      const { data } = await supabase.from('agents').select('*').eq('sub_agency_id', selectedAgency);
      if (data) setAgentsList(data);
    }
    fetchAgents();
  }, [selectedAgency, supabase]);

  // Fetch packages when agent changes
  useEffect(() => {
    async function fetchPackages() {
      if (!selectedAgent || !selectedAgency) {
        setPackages([]);
        return;
      }
      const subAgency = subAgenciesList.find(s => s.id === selectedAgency);
      const parentAgencyId = subAgency?.agency_id;
      
      let queryStr = `agent_id.eq.${selectedAgent}`;
      if (parentAgencyId) {
        queryStr += `,agency_id.eq.${parentAgencyId}`;
      }

      const { data } = await supabase.from('packages').select('*').or(queryStr);
      if (data) setPackages(data);
    }
    fetchPackages();
  }, [selectedAgent, selectedAgency, subAgenciesList, supabase]);

  const customPrice = useMemo(() => {
    const calculateProductPrice = (qtyStr: string | number, productKey: string, unitPrice: number) => {
      const qty = Number(qtyStr) || 0;
      if (qty === 0) return 0;
      
      const rules = pricingSettings.custom_pricing_rules?.filter(r => r.product === productKey).sort((a, b) => b.quantity - a.quantity) || [];
      
      let remainingQty = qty;
      let total = 0;
      
      for (const rule of rules) {
        if (remainingQty >= rule.quantity) {
          const times = Math.floor(remainingQty / rule.quantity);
          total += times * rule.price;
          remainingQty %= rule.quantity;
        }
      }
      
      total += remainingQty * unitPrice;
      return total;
    };

    return (
      calculateProductPrice(customOptions.groundPhotos, 'ground_photo', pricingSettings.ground_photo_price) +
      calculateProductPrice(customOptions.drone, 'drone_photo', pricingSettings.drone_photo_price) +
      calculateProductPrice(customOptions.reels, 'reel', pricingSettings.reel_price) +
      calculateProductPrice(customOptions.twilight, 'twilight_photo', pricingSettings.twilight_photo_price) +
      (customOptions.video === 'basic' ? pricingSettings.video_basic_price :
       customOptions.video === 'standard' ? pricingSettings.video_standard_price :
       customOptions.video === 'premium' ? pricingSettings.video_premium_price :
       customOptions.video === 'ai' ? pricingSettings.video_ai_price : 0) +
      (customOptions.sitePlan ? pricingSettings.site_plan_price : 0) +
      (customOptions.floorplan ? pricingSettings.floorplan_price : 0) +
      (customOptions.matterport ? pricingSettings.matterport_price : 0) +
      calculateProductPrice(customOptions.virtualStagingQty, 'virtual_staging', pricingSettings.virtual_staging_price)
    );
  }, [customOptions, pricingSettings]);

  // Mock previous job address for demo
  const PREVIOUS_JOB = "123 Main St, Los Angeles, CA";

  const initAutocomplete = () => {
    if (!inputRef.current || !window.google) return;
    
    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      fields: ['formatted_address', 'geometry'],
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.formatted_address) {
        setAddress(place.formatted_address);
      } else if (place.name) {
        setAddress(place.name);
      }
    });
  };

  const calculateTravel = async () => {
    if (!address) return;
    
    setLoadingRouting(true);
    setOverlapWarning(false);
    try {
      const res = await fetch(`/api/routing?origin=${encodeURIComponent(PREVIOUS_JOB)}&destination=${encodeURIComponent(address)}`);
      const data = await res.json();
      
      if (data.success) {
        setTravelTime({
          raw: Math.round(data.raw_minutes),
          rounded: data.rounded_minutes
        });
        
        if (data.rounded_minutes > 30) {
          setOverlapWarning(true);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingRouting(false);
    }
  };

  const handleSaveBooking = async () => {
    if (!address || !selectedAgent || !selectedPackage) {
      alert("Please ensure Address, Agent, and Package are selected.");
      return;
    }
    
    setIsSaving(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("No active session");
      
      const subAgency = subAgenciesList.find(s => s.id === selectedAgency);
      
      // Determine deliverables
      let deliverables = [];
      if (selectedPackage.name === 'Custom Package') {
        if (customOptions.groundPhotos) deliverables.push({ name: 'Ground Photos', qty: customOptions.groundPhotos, status: 'missing' });
        if (customOptions.drone) deliverables.push({ name: 'Drone Photos', qty: customOptions.drone, status: 'missing' });
        if (customOptions.reels) deliverables.push({ name: 'Reels', qty: customOptions.reels, status: 'missing' });
        if (customOptions.twilight) deliverables.push({ name: 'Twilight Photos', qty: customOptions.twilight, status: 'missing' });
        if (customOptions.video) deliverables.push({ name: 'Video', type: customOptions.video, status: 'missing' });
        if (customOptions.sitePlan) deliverables.push({ name: 'Site Plan', status: 'missing' });
        if (customOptions.floorplan) deliverables.push({ name: 'Floorplan', status: 'missing' });
        if (customOptions.matterport) deliverables.push({ name: 'Matterport', status: 'missing' });
        if (customOptions.virtualStaging) deliverables.push({ name: 'Virtual Staging', qty: customOptions.virtualStagingQty, notes: customOptions.virtualStagingNotes, status: 'missing' });
      } else {
        // Fallback or standard package logic could go here
        deliverables.push({ name: selectedPackage.name, status: 'missing' });
      }

      // We use a dummy package_id if it's custom, otherwise we find the real package ID.
      const matchedPackage = packages.find(p => p.name === selectedPackage.name);
      const packageId = matchedPackage ? matchedPackage.id : null;

      // Arbitrary start time tomorrow 9 AM for demo
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 1);
      startDate.setHours(9, 0, 0, 0);

      const { data: insertedBooking, error } = await supabase.from('bookings').insert([{
        user_id: user.id,
        agency_id: subAgency?.agency_id || null,
        sub_agency_id: selectedAgency,
        agent_id: selectedAgent,
        package_id: packageId,
        shoot_location: address,
        start_time: startDate.toISOString(),
        status: 'pending',
        deliverables: deliverables,
        notes: "Generated from UI",
        package_details: packageDetails,
        package_tbc: packageTbc,
        key_box_pin: keyBoxPin,
        key_pin_tbc: keyPinTbc,
        requires_floor_plan: requiresFloorPlan
      }]).select().single();

      if (error) {
        console.error("Error saving booking:", error);
        alert("Failed to save booking. Check console for details.");
      } else if (insertedBooking) {
        // Evaluate Smart Tasks
        const tasksToInsert = [];
        if (packageTbc) {
          tasksToInsert.push({
            user_id: user.id,
            job_id: insertedBooking.id,
            description: "Confirm package details with agent",
            notes: packageDetails,
            task_type: 'core'
          });
        }
        if (keyPinTbc) {
          tasksToInsert.push({
            user_id: user.id,
            job_id: insertedBooking.id,
            description: "Confirm key box PIN",
            task_type: 'core'
          });
        }
        if (requiresFloorPlan) {
          tasksToInsert.push({
            user_id: user.id,
            job_id: insertedBooking.id,
            description: "Receive existing floor plan from agent",
            task_type: 'core'
          });
        }
        
        if (tasksToInsert.length > 0) {
          const { error: taskError } = await supabase.from('tasks').insert(tasksToInsert);
          if (taskError) {
            console.error("Error inserting tasks:", taskError);
          }
        }

        alert("Booking finalized successfully!");
        window.location.href = `/bookings/${insertedBooking.id}`; // Redirect to specific booking
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Script 
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`} 
        strategy="lazyOnload" 
        onLoad={initAutocomplete} 
      />
      <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] bg-white dark:bg-slate-900">
      {/* Form Section */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
        <div className="max-w-3xl mx-auto">
          {/* Top Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full flex gap-1 shadow-inner">
              <button className="px-8 py-2.5 rounded-full text-sm font-bold bg-white dark:bg-slate-700 text-success shadow-sm transition-all">Confirmed</button>
              <button className="px-8 py-2.5 rounded-full text-sm font-semibold text-slate-500 hover:text-warning dark:hover:text-warning transition-all">Pending</button>
            </div>
          </div>

          {/* Street Address Bar */}
          <div className="mb-10 relative group">
            <span className="material-icons-outlined absolute left-5 top-1/2 -translate-y-1/2 text-primary">location_on</span>
            <input 
              ref={inputRef}
              type="text" 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter property address..." 
              className="w-full bg-white dark:bg-slate-800 border-2 border-primary/10 rounded-2xl py-5 pl-14 pr-32 text-lg font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none shadow-sm transition-all placeholder:text-slate-400"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button 
                  onClick={calculateTravel}
                  disabled={!address || loadingRouting}
                  className="bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                >
                  {loadingRouting ? 'Routing...' : 'Route'}
                </button>
                <button className="text-slate-400 hover:text-primary transition-colors p-2">
                  <span className="material-icons-outlined">my_location</span>
                </button>
            </div>
          </div>

          {/* Travel Insights / Overlap Warning */}
          {(travelTime || overlapWarning) && (
            <div className="mb-10 space-y-4">
              {travelTime && (
                <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Routing Insights</p>
                    <p className="text-xs text-slate-500">From previous booking</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary text-xl">{travelTime.rounded} mins</p>
                    <p className="text-xs text-slate-500">{travelTime.raw} raw</p>
                  </div>
                </div>
              )}
              {overlapWarning && (
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-4 rounded-xl flex gap-3 animate-pulse">
                  <span className="material-icons-outlined text-orange-500">warning</span>
                  <div>
                    <p className="font-bold text-orange-800 dark:text-orange-200 text-sm">Upload Buffer Overlap</p>
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">This booking time cuts into a 40-minute upload buffer. Are you sure you want to proceed?</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-12">
            
            {/* 1. Agency Section */}
            <section className="space-y-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <span className="material-icons-outlined text-base">business</span> 1. Agency &amp; Agent
              </h2>
              <div className="grid grid-cols-2 gap-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
                <div>
                  <div className="flex justify-between items-center mb-2 ml-1">
                    <label className="block text-xs font-semibold text-slate-500">Select Agency</label>
                    <button className="text-primary text-[10px] font-bold uppercase hover:underline">+ Add New</button>
                  </div>
                  <select 
                    value={selectedAgency}
                    onChange={(e) => {
                      setSelectedAgency(e.target.value);
                      setSelectedAgent('');
                      setSelectedPackage(null);
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-primary/20 outline-none appearance-none transition-all"
                  >
                    <option value="">Select Sub-Agency</option>
                    {subAgenciesList.map(sub => {
                      const parent = agenciesList.find(a => a.id === sub.agency_id);
                      const displayName = parent ? `${parent.name} - ${sub.name}` : sub.name;
                      return <option key={sub.id} value={sub.id}>{displayName}</option>;
                    })}
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2 ml-1">
                    <label className="block text-xs font-semibold text-slate-500">Select Agent</label>
                  </div>
                  <select 
                    value={selectedAgent}
                    onChange={(e) => {
                      setSelectedAgent(e.target.value);
                      if (!e.target.value) setSelectedPackage(null); // reset package if agent cleared
                    }}
                    disabled={!selectedAgency || agentsList.length === 0}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-primary/20 outline-none appearance-none transition-all disabled:opacity-50"
                  >
                    <option value="">Select Agent</option>
                    {agentsList.map(agent => (
                      <option key={agent.id} value={agent.id}>{agent.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* 2. Package Section (Cascading) */}
            <section className={`space-y-6 transition-opacity duration-300 ${selectedAgent ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
              <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <span className="material-icons-outlined text-base">inventory_2</span> 2. Packages &amp; Duration
              </h2>
              
              {!selectedAgent ? (
                <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center text-slate-500 text-sm">
                  Please select an Agent to view their specific packages.
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Agent Preloaded Packages</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {packages.map(pkg => {
                      const isSelected = selectedPackage?.name === pkg.name;
                      return (
                        <button 
                          key={pkg.id}
                          onClick={() => setSelectedPackage({ name: pkg.name, duration: 2, price: `$${pkg.price}` })}
                          className={`p-5 rounded-2xl text-left transition-all shadow-sm border-2 ${isSelected ? 'border-primary bg-primary/5 ring-offset-2' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary/50'}`}
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${isSelected ? 'bg-primary/10 text-primary' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                            <span className="material-icons-outlined text-xl">workspace_premium</span>
                          </div>
                          <p className={`font-bold text-sm ${isSelected ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}>{pkg.name}</p>
                          <p className="text-xs text-slate-500 mt-1">2hr • {pkg.ground_photos_qty} Photos, {pkg.drone_qty} Drone</p>
                          <p className={`font-bold text-sm mt-3 ${isSelected ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}>${pkg.price}</p>
                        </button>
                      )
                    })}
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowCustomModal(true);
                      }}
                      className={`p-5 rounded-2xl transition-all shadow-sm border-2 ${selectedPackage?.name === 'Custom Package' ? 'border-primary bg-primary/5 ring-offset-2 text-left' : 'border-dashed border-slate-300 text-center flex flex-col items-center justify-center hover:bg-slate-50'}`}
                    >
                      {selectedPackage?.name === 'Custom Package' ? (
                        <>
                          <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3 bg-primary/10 text-primary">
                            <span className="material-icons-outlined text-xl">tune</span>
                          </div>
                          <p className="font-bold text-sm text-primary">Custom Package</p>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-1" title={selectedPackage.photos || 'Custom'}>2hr • {selectedPackage.photos || 'Custom'}</p>
                          <p className="font-bold text-sm mt-3 text-primary">{selectedPackage.price}</p>
                        </>
                      ) : (
                        <>
                          <span className="material-icons-outlined text-slate-400 mb-1">add</span>
                          <p className="text-xs font-bold text-slate-400 uppercase">Custom</p>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              )}
            </section>

            {/* 3. Schedule & Photographer Section (Cascading) */}
            <section className={`space-y-6 transition-opacity duration-300 ${selectedPackage ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
              <details className="group" open>
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                    <span className="material-icons-outlined text-base">calendar_today</span> 3. Smart Schedule
                  </h2>
                  <span className="material-icons-outlined text-slate-400 group-open:rotate-180 transition-transform">expand_more</span>
                </summary>
                
                {!selectedPackage ? (
                   <div className="mt-6 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center text-slate-500 text-sm">
                   Select a package to calculate required booking duration.
                 </div>
                ) : (
                  <div className="mt-6 space-y-6">
                    {/* Selected Duration Info */}
                    <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                       <span className="material-icons-outlined text-slate-500">schedule</span>
                       <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Calculating availability for <strong className="text-primary">{selectedPackage.duration}-hour</strong> duration.</span>
                    </div>

                    {/* AI Smart Suggestions */}
                    <div className="bg-primary/5 dark:bg-primary/10 rounded-2xl p-6 border border-primary/20">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                          <h3 className="font-bold text-slate-900 dark:text-white">AI Smart Suggestions</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Ideal Mode (Anchors)</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer" 
                              checked={idealMode}
                              onChange={(e) => setIdealMode(e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {idealMode ? (
                          <>
                            {/* Suggestion 1: Ideal Mode */}
                            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-primary/50 cursor-pointer hover:shadow-md transition-shadow group ring-2 ring-primary/20">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <span className="font-bold text-primary text-lg block">Tuesday, 1:30 PM</span>
                                  <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Anchor Slot</span>
                                </div>
                                <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-success/20 text-success-700 dark:text-success flex items-center justify-center font-bold text-[10px]">J</div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Jackson <span className="text-success font-medium">(Optimized Route)</span></p>
                              </div>
                            </div>
                            
                            {/* Suggestion 2: Ideal Mode */}
                            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-md hover:border-primary/50 transition-all group">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <span className="font-bold text-slate-900 dark:text-white text-lg">Wednesday, 9:00 AM</span>
                                  <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Anchor Slot</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-warning/20 text-warning-700 dark:text-warning flex items-center justify-center font-bold text-[10px]">P</div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Paige <span className="text-slate-400 font-medium">(First Job of Day)</span></p>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Suggestion 1: Liquid Mode */}
                            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-md hover:border-primary/50 transition-all group">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <span className="font-bold text-slate-900 dark:text-white text-lg">Tuesday, 11:15 AM</span>
                                  <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Liquid Slot</span>
                                </div>
                                <span className="material-symbols-outlined text-slate-400 text-sm">schedule</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-success/20 text-success-700 dark:text-success flex items-center justify-center font-bold text-[10px]">J</div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Jackson <span className="text-slate-500 font-medium">(Arrives +15m Paige Rule)</span></p>
                              </div>
                            </div>

                            {/* Suggestion 2: Liquid Mode */}
                            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-md hover:border-primary/50 transition-all group">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <span className="font-bold text-slate-900 dark:text-white text-lg">Tuesday, 2:45 PM</span>
                                  <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Liquid Slot</span>
                                </div>
                                <span className="material-symbols-outlined text-slate-400 text-sm">schedule</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-warning/20 text-warning-700 dark:text-warning flex items-center justify-center font-bold text-[10px]">P</div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Paige <span className="text-slate-500 font-medium">(Arrives +20m Paige Rule)</span></p>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Dispatch Timeline */}
                    <div>
                      <div className="flex justify-between items-end mb-4">
                        <h3 className="font-bold text-slate-900 dark:text-white">Live Availability</h3>
                        <p className="text-sm text-slate-500">Tuesday, Sept 12, 2023</p>
                      </div>
                      
                      <div className="border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-sm overflow-x-auto custom-scrollbar">
                        <div className="min-w-[800px]">
                          {/* Timeline Header */}
                          <div className="grid grid-cols-[120px_repeat(10,1fr)] bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                            <div className="p-4 border-r border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 uppercase tracking-wider">OPERATOR</div>
                            <div className="p-4 text-center text-xs font-bold text-slate-500">08:00 AM</div>
                            <div className="p-4 text-center text-xs font-bold text-slate-500">09:00 AM</div>
                            <div className="p-4 text-center text-xs font-bold text-slate-500">10:00 AM</div>
                            <div className="p-4 text-center text-xs font-bold text-slate-500">11:00 AM</div>
                            <div className="p-4 text-center text-xs font-bold text-slate-500">12:00 PM</div>
                            <div className="p-4 text-center text-xs font-bold text-slate-500">01:00 PM</div>
                            <div className="p-4 text-center text-xs font-bold text-slate-500">02:00 PM</div>
                            <div className="p-4 text-center text-xs font-bold text-slate-500">03:00 PM</div>
                            <div className="p-4 text-center text-xs font-bold text-slate-500">04:00 PM</div>
                            <div className="p-4 text-center text-xs font-bold text-slate-500">05:00 PM</div>
                          </div>
                          
                          {/* Row 1: Jackson */}
                          <div className="grid grid-cols-[120px_repeat(10,1fr)] group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                            <div className="p-4 border-r border-slate-200 dark:border-slate-700 flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-success/20 text-success-700 dark:text-success flex items-center justify-center font-bold text-xs shrink-0">J</div>
                              <span className="font-bold text-sm text-slate-900 dark:text-white truncate">Jackson</span>
                            </div>
                            <div className="p-2 relative flex items-center justify-center">
                              <div className="w-full h-12 bg-slate-800 dark:bg-slate-700 text-white rounded-lg p-2 text-[10px] overflow-hidden">
                                <p className="font-bold">#4921</p>
                                <p className="opacity-70 truncate">Houston Blvd</p>
                              </div>
                            </div>
                            {/* Next slots visual mapping based on mode could be dynamic, for now static visual representation */}
                            <div className="p-2 flex items-center justify-center">
                              <div className="w-full h-12 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                                <span className="material-symbols-outlined text-slate-400 text-sm">add</span>
                              </div>
                            </div>
                            <div className="p-2 col-span-3 relative flex items-center justify-center">
                              <div className="w-full h-12 bg-slate-800 dark:bg-slate-700 text-white rounded-lg p-2 text-[10px] flex justify-between items-center">
                                <div className="overflow-hidden">
                                  <p className="font-bold truncate">#4925 - Full Listing Package</p>
                                  <p className="opacity-70 truncate">Meyerland Area</p>
                                </div>
                                <span className="material-symbols-outlined text-sm shrink-0 ml-1">verified_user</span>
                              </div>
                            </div>
                            <div className="p-2 bg-slate-50/50 dark:bg-slate-800/20"></div>
                            <div className="p-2 flex items-center justify-center">
                              <div className="w-full h-12 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                                <span className="material-symbols-outlined text-slate-400 text-sm">add</span>
                              </div>
                            </div>
                            <div className="p-2 flex items-center justify-center">
                              <div className="w-full h-12 border-2 border-primary ring-2 ring-primary/20 rounded-lg flex flex-col items-center justify-center cursor-pointer bg-primary/10 hover:bg-primary/20 transition-all">
                                <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                <span className="text-[9px] font-bold text-primary uppercase">Ideal</span>
                              </div>
                            </div>
                            <div className="p-2 relative flex items-center justify-center">
                              <div className="w-full h-12 bg-slate-800 dark:bg-slate-700 text-white rounded-lg p-2 text-[10px] overflow-hidden">
                                <p className="font-bold">#4929</p>
                                <p className="opacity-70 truncate">S. Park Dr</p>
                              </div>
                            </div>
                            <div className="p-2"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </details>
            </section>

            {/* Property Details Section */}
            <section className="space-y-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <span className="material-icons-outlined text-base">home</span> 4. Access &amp; Property Details
              </h2>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer">
                    <input className="w-5 h-5 text-success rounded-lg border-slate-300 focus:ring-success" type="checkbox" />
                    <span className="text-sm font-medium">Agent will meet onsite</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer">
                    <input className="w-5 h-5 text-success rounded-lg border-slate-300 focus:ring-success" type="checkbox" defaultChecked />
                    <span className="text-sm font-medium">Vendor will meet onsite</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer">
                    <input className="w-5 h-5 text-success rounded-lg border-slate-300 focus:ring-success" type="checkbox" />
                    <span className="text-sm font-medium">Just a section</span>
                  </label>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Vendor Name</label>
                    <input className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-primary" placeholder="Enter name" type="text" defaultValue="Michael Roberts" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Vendor Number</label>
                    <input className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-primary" placeholder="(555) 000-0000" type="tel" defaultValue="(555) 123-4567" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-500 ml-1">Package Details</label>
                    <textarea 
                      value={packageDetails}
                      onChange={(e) => setPackageDetails(e.target.value)}
                      className="w-full bg-white border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-primary min-h-[80px]" 
                      placeholder="e.g. Needs drone shots of the backyard..."
                    />
                    <label className="flex items-center gap-2 cursor-pointer mt-1 ml-1 w-fit">
                      <input 
                        type="checkbox" 
                        checked={packageTbc}
                        onChange={(e) => setPackageTbc(e.target.checked)}
                        className="w-4 h-4 text-warning rounded border-slate-300 focus:ring-warning" 
                      />
                      <span className="text-xs font-semibold text-slate-500">To Be Confirmed</span>
                    </label>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 ml-1 mb-2">Key Box PIN</label>
                      <input 
                        type="text" 
                        value={keyBoxPin}
                        onChange={(e) => setKeyBoxPin(e.target.value)}
                        className="w-full bg-white border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-primary" 
                        placeholder="e.g. 1234"
                      />
                      <label className="flex items-center gap-2 cursor-pointer mt-2 ml-1 w-fit">
                        <input 
                          type="checkbox" 
                          checked={keyPinTbc}
                          onChange={(e) => setKeyPinTbc(e.target.checked)}
                          className="w-4 h-4 text-warning rounded border-slate-300 focus:ring-warning" 
                        />
                        <span className="text-xs font-semibold text-slate-500">To Be Confirmed</span>
                      </label>
                    </div>

                    <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={requiresFloorPlan}
                        onChange={(e) => setRequiresFloorPlan(e.target.checked)}
                        className="w-5 h-5 text-primary rounded border-slate-300 focus:ring-primary" 
                      />
                      <span className="text-sm font-semibold text-slate-700">Requires Floor Plan Processing</span>
                    </label>
                  </div>
                </div>
                
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-2 ml-1">Property Highlights</label>
                    <textarea className="w-full bg-white border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-primary min-h-[80px]" placeholder="e.g. Spiral staircase..."></textarea>
                  </div>
                </div>
              </div>
            </section>

            <div className="pt-6 flex gap-4">
              <button className="flex-1 border border-slate-200 dark:border-slate-700 py-4 rounded-full font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 transition-all">
                Save as Draft
              </button>
              <button 
                onClick={handleSaveBooking}
                disabled={isSaving}
                className="flex-1 bg-primary text-white py-4 rounded-full font-bold hover:shadow-xl hover:shadow-primary/30 transition-all disabled:opacity-50"
              >
                {isSaving ? 'Finalizing...' : 'Finalize Booking'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar (Tasks & Notes) */}
      <aside className="hidden lg:flex w-[400px] bg-[#f9f5ff] dark:bg-background-dark/40 border-l border-primary/10 flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.02)]">
        {/* Quick Notes */}
        <div className="flex-1 flex flex-col">
          <div className="p-6 border-b border-primary/5 flex items-center justify-between bg-white/50">
            <div className="flex items-center gap-2">
              <span className="material-icons-outlined text-primary">edit_note</span>
              <h2 className="font-bold text-slate-800 dark:text-slate-200">Quick Notes</h2>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Saved
            </div>
          </div>
          <div className="flex-1 p-6 flex flex-col overflow-y-auto custom-scrollbar">
            <textarea 
              className="w-full h-full bg-transparent border-none focus:ring-0 text-slate-700 dark:text-slate-300 resize-none leading-relaxed placeholder:text-slate-400 placeholder:italic text-sm" 
              placeholder="Type onsite instructions or call notes here..."
              defaultValue={`Client mentioned the back patio needs wide angles to show the sunset view.\n\nHomeowner will be present but staying in the office.\n\nKey is under the blue ceramic pot near the side door.\n\nCall agent 15 mins before arrival.`}
            />
          </div>
        </div>

        {/* Tasks Section */}
        <div className="h-[400px] border-t border-primary/10 flex flex-col bg-white">
          <div className="p-6 border-b border-primary/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-icons-outlined text-warning">task_alt</span>
              <h2 className="font-bold text-slate-800 dark:text-slate-200">Pending Tasks</h2>
            </div>
            <span className="text-[10px] font-bold text-slate-400">3 REMAINING</span>
          </div>
          <div className="flex-1 p-6 space-y-4 overflow-y-auto custom-scrollbar">
            <label className="flex items-center gap-3 group cursor-pointer">
              <input type="checkbox" className="w-5 h-5 text-success rounded-lg border-slate-300 focus:ring-success" />
              <span className="text-sm text-slate-600 group-hover:text-success transition-colors">Send floorplan draft to agent</span>
            </label>
            <label className="flex items-center gap-3 group cursor-pointer">
              <input type="checkbox" className="w-5 h-5 text-success rounded-lg border-slate-300 focus:ring-success" />
              <span className="text-sm text-slate-600 group-hover:text-success transition-colors">Provide keybox location to Sarah</span>
            </label>
            <label className="flex items-center gap-3 group cursor-pointer">
              <input type="checkbox" className="w-5 h-5 text-success rounded-lg border-slate-300 focus:ring-success" />
              <span className="text-sm text-slate-600 group-hover:text-success transition-colors">Confirm gate code with vendor</span>
            </label>
            <button className="w-full py-3 mt-4 border-2 border-dashed border-slate-200 rounded-2xl text-xs font-bold text-slate-400 hover:border-primary/40 hover:text-primary transition-all">
              + ADD TASK
            </button>
          </div>
        </div>

        <div className="p-6 border-t border-primary/5 space-y-4">
          <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
            <div className="flex items-start gap-3">
              <span className="material-icons-outlined text-primary text-sm mt-0.5">info</span>
              <div>
                <p className="text-xs font-bold text-primary uppercase tracking-wide mb-1">Operator Pro Tip</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">Notes and tasks are synced to the photographer's field app in real-time.</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
      {/* Custom Package Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Custom Package</h2>
                <p className="text-sm font-semibold text-primary mt-1">Live Estimate: ${customPrice.toFixed(2)}</p>
              </div>
              <button type="button" onClick={() => setShowCustomModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <span className="material-icons-outlined">close</span>
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">Ground Photos Qty</label>
                  <input 
                    type="number" 
                    value={customOptions.groundPhotos}
                    onChange={(e) => setCustomOptions({...customOptions, groundPhotos: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                    placeholder="e.g. 25"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">Drone Qty</label>
                  <input 
                    type="number" 
                    value={customOptions.drone}
                    onChange={(e) => setCustomOptions({...customOptions, drone: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                    placeholder="e.g. 5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">Reels Qty</label>
                  <input 
                    type="number" 
                    value={customOptions.reels}
                    onChange={(e) => setCustomOptions({...customOptions, reels: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                    placeholder="e.g. 1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">Twilight Qty</label>
                  <input 
                    type="number" 
                    value={customOptions.twilight}
                    onChange={(e) => setCustomOptions({...customOptions, twilight: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                    placeholder="e.g. 4"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">Video Package</label>
                <select 
                  value={customOptions.video}
                  onChange={(e) => setCustomOptions({...customOptions, video: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"
                >
                  <option value="">None</option>
                  <option value="basic">Basic Video</option>
                  <option value="standard">Standard Video</option>
                  <option value="premium">Premium Video</option>
                  <option value="ai">AI Video</option>
                </select>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-500 mb-3 ml-1">Add-ons</label>
                <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={customOptions.sitePlan}
                      onChange={(e) => setCustomOptions({...customOptions, sitePlan: e.target.checked})}
                      className="w-5 h-5 text-primary rounded border-slate-300 focus:ring-primary transition-all" 
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors">Site Plan</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={customOptions.floorplan}
                      onChange={(e) => setCustomOptions({...customOptions, floorplan: e.target.checked})}
                      className="w-5 h-5 text-primary rounded border-slate-300 focus:ring-primary transition-all" 
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors">Floorplan</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={customOptions.matterport}
                      onChange={(e) => setCustomOptions({...customOptions, matterport: e.target.checked})}
                      className="w-5 h-5 text-primary rounded border-slate-300 focus:ring-primary transition-all" 
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors">Matterport 3D Tour</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={customOptions.virtualStaging}
                      onChange={(e) => setCustomOptions({...customOptions, virtualStaging: e.target.checked})}
                      className="w-5 h-5 text-primary rounded border-slate-300 focus:ring-primary transition-all" 
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors">Virtual Staging</span>
                  </label>
                  
                  {customOptions.virtualStaging && (
                    <div className="pl-8 pt-1 pb-1 grid grid-cols-[80px_1fr] gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-1 ml-1">Qty</label>
                        <input 
                          type="number" 
                          value={customOptions.virtualStagingQty}
                          onChange={(e) => setCustomOptions({...customOptions, virtualStagingQty: e.target.value})}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                          placeholder="e.g. 2"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-1 ml-1">Notes / Instructions</label>
                        <input 
                          type="text" 
                          value={customOptions.virtualStagingNotes}
                          onChange={(e) => setCustomOptions({...customOptions, virtualStagingNotes: e.target.value})}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                          placeholder="e.g. Modern furniture"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    // Update selected package to custom
                    let parts = [];
                    if (customOptions.groundPhotos) parts.push(`${customOptions.groundPhotos} Photos`);
                    if (customOptions.drone) parts.push(`${customOptions.drone} Drone`);
                    if (customOptions.reels) parts.push(`${customOptions.reels} Reels`);
                    if (customOptions.twilight) parts.push(`${customOptions.twilight} Twilight`);
                    if (customOptions.video) parts.push(`${customOptions.video} Video`);
                    if (customOptions.sitePlan) parts.push('Site Plan');
                    if (customOptions.floorplan) parts.push('Floorplan');
                    if (customOptions.matterport) parts.push('Matterport');
                    if (customOptions.virtualStaging) parts.push(`${customOptions.virtualStagingQty || '0'} Virtual Staging`);
                    
                    setSelectedPackage({
                      name: 'Custom Package',
                      duration: 2, // arbitrary
                      price: `$${customPrice.toFixed(2)}`,
                      photos: parts.join(', ') || 'Custom Selection'
                    });
                    setShowCustomModal(false);
                  }}
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all"
                >
                  Save Custom Package
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
