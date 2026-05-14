'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { createClient } from '@/utils/supabase/client';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const libraries: any[] = ['places'];

export default function NewJobPage() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const [address, setAddress] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const lastCalculatedAddress = useRef<string | null>(null);
  const [travelTime, setTravelTime] = useState<{ raw: number; rounded: number } | null>(null);
  const [loadingRouting, setLoadingRouting] = useState(false);
  const [overlapWarning, setOverlapWarning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Agent Selection State
  const [selectedAgent, setSelectedAgent] = useState('');
  const [agentSearch, setAgentSearch] = useState('');
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);
  const agentComboRef = useRef<HTMLDivElement>(null);
  
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

  // New Agent Modal State
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentContact, setNewAgentContact] = useState('');
  const [newAgentAgencySearch, setNewAgentAgencySearch] = useState('');
  const [newAgentSelectedSubAgency, setNewAgentSelectedSubAgency] = useState('');
  const [showNewAgentAgencyDropdown, setShowNewAgentAgencyDropdown] = useState(false);
  const [isSavingAgent, setIsSavingAgent] = useState(false);
  const newAgentAgencyRef = useRef<HTMLDivElement>(null);

  // Top UI State
  const [bookingStatus, setBookingStatus] = useState<'confirmed' | 'pending'>('confirmed');

  // Smart Task Fields
  const [packageDetails, setPackageDetails] = useState('');
  const [packageTbc, setPackageTbc] = useState(false);
  const [fallbackDuration, setFallbackDuration] = useState(120); // minutes: 60 or 120
  const [keyBoxPin, setKeyBoxPin] = useState('');
  const [keyPinTbc, setKeyPinTbc] = useState(false);


  // Access & Property Details
  const [accessType, setAccessType] = useState('Vendor will meet onsite');
  const [vendorName, setVendorName] = useState('');
  const [vendorNumber, setVendorNumber] = useState('');
  const [accessNotes, setAccessNotes] = useState('');
  const [keyBoxLocation, setKeyBoxLocation] = useState('');
  const [propertyHighlights, setPropertyHighlights] = useState('');
  const [propertyNotes, setPropertyNotes] = useState('');

  // Routing & Suggestions State
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedPhotographer, setSelectedPhotographer] = useState<string | null>(null);

  // Manual Scheduling State
  const [manualSlot, setManualSlot] = useState<{ dayIdx: number, hourIdx: number, photographerId: string } | null>(null);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictDetails, setConflictDetails] = useState<{ type: 'overlap' | 'travel', message: string, pendingSlot: { dayIdx: number, hourIdx: number, photographerId: string } } | null>(null);

  // New Calendar State
  const [activeTab, setActiveTab] = useState('p1');
  const [showSidebar, setShowSidebar] = useState(true);
  // Derived effective duration (hours) — uses the real package when available, otherwise the fallback
  const effectiveDuration = selectedPackage?.duration ?? (fallbackDuration / 60);

  // Whether the Smart Schedule section should be enabled
  const scheduleReady = !!selectedPackage || packageTbc;

  const dummyPhotographers = useMemo(() => [
    { id: 'p1', name: 'Jackson', initial: 'J', color: 'text-success-700 dark:text-success', bg: 'bg-success/20' },
    { id: 'p2', name: 'Paige', initial: 'P', color: 'text-warning-700 dark:text-warning', bg: 'bg-warning/20' },
    { id: 'p3', name: 'Sarah', initial: 'S', color: 'text-primary-700 dark:text-primary', bg: 'bg-primary/20' },
  ], []);

  useEffect(() => {
    if (selectedPhotographer) {
      setActiveTab(selectedPhotographer);
    }
  }, [selectedPhotographer]);

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
      
      const [pricingRes, agenciesRes, subAgenciesRes, agentsRes] = await Promise.all([
        supabase.from('agency_settings').select('*').eq('user_id', user.id).single(),
        supabase.from('agencies').select('*').eq('user_id', user.id),
        supabase.from('sub_agencies').select('*'),
        supabase.from('agents').select('*, sub_agencies(*, agencies(*))')
      ]);

      if (pricingRes.data) setPricingSettings(prev => ({ ...prev, ...pricingRes.data }));
      if (agenciesRes.data) setAgenciesList(agenciesRes.data);
      if (subAgenciesRes.data) setSubAgenciesList(subAgenciesRes.data);
      if (agentsRes.data) setAgentsList(agentsRes.data);
    }
    fetchPricingAndAgencies();
  }, [supabase]);

  // Close agent combobox on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (agentComboRef.current && !agentComboRef.current.contains(e.target as Node)) {
        setShowAgentDropdown(false);
      }
      if (newAgentAgencyRef.current && !newAgentAgencyRef.current.contains(e.target as Node)) {
        setShowNewAgentAgencyDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch packages when agent changes
  useEffect(() => {
    async function fetchPackages() {
      if (!selectedAgent) {
        setPackages([]);
        return;
      }
      const agent = agentsList.find(a => a.id === selectedAgent);
      const parentAgencyId = agent?.sub_agencies?.agencies?.id || agent?.sub_agencies?.agency_id;
      
      let queryStr = `agent_id.eq.${selectedAgent}`;
      if (parentAgencyId) {
        queryStr += `,agency_id.eq.${parentAgencyId}`;
      }

      const { data } = await supabase.from('packages').select('*').or(queryStr);
      if (data) setPackages(data);
    }
    fetchPackages();
  }, [selectedAgent, agentsList, supabase]);

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
    
    // Prevent multiple initializations on the same input
    if (inputRef.current.dataset.hasAutocomplete) return;
    inputRef.current.dataset.hasAutocomplete = 'true';
    
    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      fields: ['formatted_address', 'geometry'],
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      const newAddress = place.formatted_address || place.name || '';
      if (newAddress) {
        setAddress(newAddress);
        calculateTravel(newAddress);
      }
    });
  };

  useEffect(() => {
    if (isLoaded && window.google) {
      initAutocomplete();
    }
  }, [isLoaded]);

  const fetchSuggestions = async (targetAddress: string) => {
    if (!targetAddress || !selectedAgent) return;
    setLoadingSuggestions(true);
    try {
      const agent = agentsList.find(a => a.id === selectedAgent);
      const parentAgencyId = agent?.sub_agencies?.agencies?.id || agent?.sub_agencies?.agency_id;
      if (!parentAgencyId) return;
      const res = await fetch(`/api/routing/suggestions?address=${encodeURIComponent(targetAddress)}&agency_id=${encodeURIComponent(parentAgencyId)}`);
      const data = await res.json();
      if (data.suggestions) {
        setSuggestions(data.suggestions);
        if (data.suggestions.length > 0) {
          setSelectedPhotographer(data.suggestions[0].photographer_id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  useEffect(() => {
    if (address && selectedAgent && lastCalculatedAddress.current === address) {
      fetchSuggestions(address);
    }
  }, [selectedAgent, address, agentsList]);

  const dummyEventsData = useMemo(() => {
    const events = [];
    if (activeTab === 'p1') {
      events.push({ dayIdx: 1, startHour: 0.25, endHour: 1.0, title: '#4921' });
      events.push({ dayIdx: 1, startHour: 2.0, endHour: 3.5, title: '#4925' });
    } else if (activeTab === 'p2') {
      events.push({ dayIdx: 2, startHour: 0, endHour: 1.0, title: 'Previous Job' });
    }
    return events;
  }, [activeTab]);

  const validateSlot = (proposedTime: { dayIdx: number, hourIdx: number }, eventsArray: any[]) => {
    const pStart = proposedTime.hourIdx;
    const pEnd = proposedTime.hourIdx + 1;

    for (const event of eventsArray) {
      if (event.dayIdx !== proposedTime.dayIdx) continue;
      
      if (pStart < event.endHour && pEnd > event.startHour) {
        return { valid: false, type: 'overlap', message: `Booking Overlap: This slot conflicts directly with an existing job (${event.title}).` };
      }

      const buffer = 0.5;
      if (pStart >= event.endHour && (pStart - event.endHour) < buffer) {
        return { valid: false, type: 'travel', message: `Travel Warning: It takes 25 mins to drive from the previous property, but there is only a ${Math.round((pStart - event.endHour) * 60)} min gap.` };
      }
      if (pEnd <= event.startHour && (event.startHour - pEnd) < buffer) {
        return { valid: false, type: 'travel', message: `Travel Warning: It takes 25 mins to drive to the next property, but there is only a ${Math.round((event.startHour - pEnd) * 60)} min gap.` };
      }
    }
    
    return { valid: true };
  };

  const handleGridClick = (dayIdx: number, hourIdx: number) => {
    const pendingSlot = { dayIdx, hourIdx, photographerId: activeTab };
    const validation = validateSlot(pendingSlot, dummyEventsData);
    
    if (!validation.valid) {
      setConflictDetails({ type: validation.type as 'overlap' | 'travel', message: validation.message!, pendingSlot });
      setShowConflictModal(true);
    } else {
      setManualSlot(pendingSlot);
      setSelectedPhotographer(null);
    }
  };

  const calculateTravel = async (targetAddress: string) => {
    if (!targetAddress || targetAddress === lastCalculatedAddress.current) return;
    
    setLoadingRouting(true);
    setOverlapWarning(false);
    try {
      const res = await fetch(`/api/routing?origin=${encodeURIComponent(PREVIOUS_JOB)}&destination=${encodeURIComponent(targetAddress)}`);
      const data = await res.json();
      
      if (data.success) {
        setTravelTime({
          raw: Math.round(data.raw_minutes),
          rounded: data.rounded_minutes
        });
        
        if (data.rounded_minutes > 30) {
          setOverlapWarning(true);
        }
        lastCalculatedAddress.current = targetAddress;
      }
      
      if (selectedAgent) {
        fetchSuggestions(targetAddress);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingRouting(false);
    }
  };

  const handleSaveAgent = async () => {
    if (!newAgentName.trim() || !newAgentSelectedSubAgency) {
      alert("Please enter a name and select an agency.");
      return;
    }
    setIsSavingAgent(true);
    try {
      let subAgencyId = newAgentSelectedSubAgency;

      // If the user typed a new agency name (no existing match selected)
      if (!subAgenciesList.find(s => s.id === subAgencyId)) {
        // Create new agency + sub-agency on the fly
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');
        
        const { data: newAgency, error: agencyErr } = await supabase.from('agencies').insert([{
          user_id: user.id,
          name: newAgentAgencySearch.trim()
        }]).select().single();
        if (agencyErr) throw agencyErr;
        
        const { data: newSubAgency, error: subErr } = await supabase.from('sub_agencies').insert([{
          agency_id: newAgency.id,
          name: newAgentAgencySearch.trim()
        }]).select().single();
        if (subErr) throw subErr;
        
        setAgenciesList(prev => [...prev, newAgency]);
        setSubAgenciesList(prev => [...prev, newSubAgency]);
        subAgencyId = newSubAgency.id;
      }

      const { data, error } = await supabase.from('agents').insert([{
        sub_agency_id: subAgencyId,
        name: newAgentName.trim(),
        contact_info: newAgentContact.trim() || null
      }]).select('*, sub_agencies(*, agencies(*))').single();

      if (error) throw error;
      
      if (data) {
        setAgentsList(prev => [...prev, data]);
        setSelectedAgent(data.id);
        setAgentSearch(data.name);
        setShowAgentModal(false);
        setNewAgentName('');
        setNewAgentContact('');
        setNewAgentAgencySearch('');
        setNewAgentSelectedSubAgency('');
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save agent.");
    } finally {
      setIsSavingAgent(false);
    }
  };

  const handleSaveBooking = async () => {
    if (!address || !selectedAgent || (!selectedPackage && !packageTbc)) {
      alert("Please ensure Address, Agent, and Package (or Package TBC) are selected.");
      return;
    }
    
    setIsSaving(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("No active session");
      
      const agent = agentsList.find(a => a.id === selectedAgent);
      const agencyId = agent?.sub_agencies?.agencies?.id || agent?.sub_agencies?.agency_id || null;
      const subAgencyId = agent?.sub_agency_id || null;
      
      // Determine deliverables
      let deliverables = [];
      if (!selectedPackage) {
        // TBC booking — no package chosen yet
        deliverables.push({ name: 'Package TBC', status: 'pending' });
      } else if (selectedPackage.name === 'Custom Package') {
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
        // Standard package
        deliverables.push({ name: selectedPackage.name, status: 'missing' });
      }

      // We use a dummy package_id if it's custom, otherwise we find the real package ID.
      const matchedPackage = selectedPackage ? packages.find(p => p.name === selectedPackage.name) : null;
      const packageId = matchedPackage ? matchedPackage.id : null;

      // Arbitrary start time tomorrow 9 AM for demo
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 1);
      startDate.setHours(9, 0, 0, 0);

      const combinedNotes = `
${propertyNotes}

Access Type: ${accessType}
Vendor Name: ${vendorName}
Vendor Number: ${vendorNumber}
${accessType === 'Key / Lockbox' ? `Key/Lockbox Location: ${keyBoxLocation}` : ''}
${accessNotes ? `Access Notes: ${accessNotes}` : ''}
${propertyHighlights ? `Property Highlights: ${propertyHighlights}` : ''}
      `.trim();

      const { data: insertedBooking, error } = await supabase.from('bookings').insert([{
        user_id: user.id,
        agency_id: agencyId,
        sub_agency_id: subAgencyId,
        agent_id: selectedAgent,
        package_id: packageId,
        photographer_id: selectedPhotographer,
        shoot_location: address,
        start_time: startDate.toISOString(),
        status: bookingStatus,
        deliverables: deliverables,
        notes: combinedNotes,
        package_details: packageDetails,
        package_tbc: packageTbc,
        key_box_pin: keyBoxPin,
        key_pin_tbc: keyPinTbc
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
            description: "Confirm key/lockbox details",
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

  const pendingTasks = useMemo(() => {
    const tasks = [];
    if (packageTbc) tasks.push({ title: 'Confirm package details with agent' });
    if (keyPinTbc) tasks.push({ title: 'Confirm key/lockbox details' });

    return tasks;
  }, [packageTbc, keyPinTbc]);

  return (
    <>
      <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] bg-white dark:bg-slate-900 relative overflow-hidden">
      {/* Form Section */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
        <div className="max-w-3xl mx-auto">
          {/* Street Address Bar */}
          <div className="mb-10 relative group">
            <span className="material-icons-outlined absolute left-5 top-1/2 -translate-y-1/2 text-primary">location_on</span>
            <input 
              ref={inputRef}
              type="text" 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onBlur={() => {
                if (address) calculateTravel(address);
              }}
              placeholder="Enter property address..." 
              className="w-full bg-white dark:bg-slate-800 border-2 border-primary/10 rounded-2xl py-5 pl-14 pr-16 text-lg font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none shadow-sm transition-all placeholder:text-slate-400"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {loadingRouting ? (
                <div className="p-2 text-primary/50 flex items-center justify-center">
                  <span className="material-symbols-outlined animate-spin text-2xl">progress_activity</span>
                </div>
              ) : (
                <button className="text-slate-400 hover:text-primary transition-colors p-2" title="Use Current Location">
                  <span className="material-icons-outlined">my_location</span>
                </button>
              )}
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
            
            {/* 1. Agent Section */}
            <section className="space-y-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <span className="material-icons-outlined text-base">person</span> 1. Agent
              </h2>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
                <div ref={agentComboRef} className="relative">
                  <label className="block text-xs font-semibold text-slate-500 mb-2 ml-1">Search Agent</label>
                  <div className="relative">
                    <span className="material-icons-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                    <input 
                      type="text"
                      value={agentSearch}
                      onChange={(e) => {
                        setAgentSearch(e.target.value);
                        setShowAgentDropdown(true);
                        if (!e.target.value) {
                          setSelectedAgent('');
                          setSelectedPackage(null);
                        }
                      }}
                      onFocus={() => setShowAgentDropdown(true)}
                      placeholder="Search Agent..."
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-10 py-3.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                    {selectedAgent && (
                      <button 
                        type="button"
                        onClick={() => {
                          setSelectedAgent('');
                          setAgentSearch('');
                          setSelectedPackage(null);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <span className="material-icons-outlined text-lg">close</span>
                      </button>
                    )}
                  </div>

                  {/* Dropdown Results */}
                  {showAgentDropdown && (
                    <div className="absolute z-40 left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-64 overflow-y-auto custom-scrollbar">
                      {agentsList
                        .filter(agent => {
                          const search = agentSearch.toLowerCase();
                          if (!search) return true;
                          const agencyName = agent.sub_agencies?.agencies?.name || agent.sub_agencies?.name || '';
                          return agent.name.toLowerCase().includes(search) || agencyName.toLowerCase().includes(search);
                        })
                        .map(agent => {
                          const agencyName = agent.sub_agencies?.agencies?.name || agent.sub_agencies?.name || '';
                          const isActive = selectedAgent === agent.id;
                          return (
                            <button
                              key={agent.id}
                              type="button"
                              onClick={() => {
                                setSelectedAgent(agent.id);
                                setAgentSearch(agent.name);
                                setShowAgentDropdown(false);
                                setSelectedPackage(null);
                              }}
                              className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-primary/5 transition-colors ${isActive ? 'bg-primary/10' : ''}`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isActive ? 'bg-primary/20 text-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                  {agent.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                  {agent.name}
                                  {agencyName && <span className="text-slate-400 dark:text-slate-500 font-normal ml-1.5">({agencyName})</span>}
                                </span>
                              </div>
                              {isActive && <span className="material-icons-outlined text-primary text-sm">check</span>}
                            </button>
                          );
                        })}
                      
                      {/* No results */}
                      {agentsList.filter(agent => {
                        const search = agentSearch.toLowerCase();
                        if (!search) return true;
                        const agencyName = agent.sub_agencies?.agencies?.name || agent.sub_agencies?.name || '';
                        return agent.name.toLowerCase().includes(search) || agencyName.toLowerCase().includes(search);
                      }).length === 0 && agentSearch && (
                        <div className="px-4 py-3 text-sm text-slate-400 text-center">No agents found</div>
                      )}

                      {/* Add New Agent */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowAgentDropdown(false);
                          setShowAgentModal(true);
                        }}
                        className="w-full text-left px-4 py-3 border-t border-slate-100 dark:border-slate-800 text-primary text-sm font-bold hover:bg-primary/5 transition-colors flex items-center gap-2"
                      >
                        <span className="material-icons-outlined text-sm">add</span>
                        Add New Agent
                      </button>
                    </div>
                  )}
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

                  {/* Package Details & TBC */}
                  <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 space-y-3">
                    <label className="block text-xs font-semibold text-slate-500 ml-1">Package Details</label>
                    <textarea 
                      value={packageDetails}
                      onChange={(e) => setPackageDetails(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-primary min-h-[80px]" 
                      placeholder="e.g. Needs drone shots of the backyard..."
                    />
                    <label className="flex items-center gap-2 cursor-pointer ml-1 w-fit">
                      <input 
                        type="checkbox" 
                        checked={packageTbc}
                        onChange={(e) => setPackageTbc(e.target.checked)}
                        className="w-4 h-4 text-warning rounded border-slate-300 focus:ring-warning" 
                      />
                      <span className="text-xs font-semibold text-slate-500">To Be Confirmed</span>
                    </label>

                    {/* Estimated Duration Fallback — shown when TBC or no package selected */}
                    {(packageTbc || !selectedPackage) && (
                      <div className="mt-4 p-4 bg-warning/5 border border-warning/20 rounded-xl space-y-2.5">
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          Estimated Duration <span className="font-normal normal-case text-slate-400">(For Scheduling)</span>
                        </label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setFallbackDuration(60)}
                            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                              fallbackDuration === 60
                                ? 'bg-primary text-white shadow-sm'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-primary/50'
                            }`}
                          >
                            1 Hour
                          </button>
                          <button
                            type="button"
                            onClick={() => setFallbackDuration(120)}
                            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                              fallbackDuration === 120
                                ? 'bg-primary text-white shadow-sm'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-primary/50'
                            }`}
                          >
                            2 Hours
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">This estimate is used to calculate scheduling gaps and travel times until the actual package is confirmed.</p>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </section>

            {/* 3. Schedule & Photographer Section (Cascading) */}
            <section className={`space-y-6 transition-opacity duration-300 ${scheduleReady ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
              <details className="group" open>
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                    <span className="material-icons-outlined text-base">calendar_today</span> 3. Smart Schedule
                  </h2>
                  <span className="material-icons-outlined text-slate-400 group-open:rotate-180 transition-transform">expand_more</span>
                </summary>
                
                {!scheduleReady ? (
                   <div className="mt-6 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center text-slate-500 text-sm">
                   Select a package to calculate required booking duration.
                 </div>
                ) : (
                  <div className="mt-6 space-y-6">
                    {/* Selected Duration Info */}
                    <div className={`flex items-center gap-3 p-3 rounded-xl border ${!selectedPackage ? 'bg-warning/5 border-warning/20' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                       <span className="material-icons-outlined text-slate-500">schedule</span>
                       <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                         Calculating availability for <strong className="text-primary">{effectiveDuration}-hour</strong> duration.
                         {!selectedPackage && <span className="text-warning text-xs ml-1.5 font-semibold">(Estimated)</span>}
                       </span>
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
                        {loadingSuggestions ? (
                          <div className="col-span-2 py-8 flex flex-col items-center justify-center text-primary/50">
                            <span className="material-symbols-outlined animate-spin text-3xl mb-2">progress_activity</span>
                            <p className="text-sm font-semibold">Calculating best routes...</p>
                          </div>
                        ) : suggestions.length > 0 ? (
                          suggestions.map((suggestion, index) => {
                            const isSelected = selectedPhotographer === suggestion.photographer_id;
                            return (
                              <div 
                                key={suggestion.photographer_id}
                                onClick={() => setSelectedPhotographer(suggestion.photographer_id)}
                                className={`bg-white dark:bg-slate-900 p-4 rounded-xl cursor-pointer hover:shadow-md transition-all group ${isSelected ? 'border-2 border-primary ring-2 ring-primary/20 shadow-md' : 'border border-slate-200 dark:border-slate-700 hover:border-primary/50'}`}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <span className={`font-bold text-lg block ${isSelected ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>{suggestion.suggested_time || '09:00 AM'} - {suggestion.name}</span>
                                    <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">
                                      {index === 0 ? 'Top Pick' : 'Alternative'}
                                    </span>
                                  </div>
                                  {isSelected && <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>}
                                </div>
                                {suggestion.insight_text && (
                                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{suggestion.insight_text}</p>
                                )}
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {suggestion.reasons.map((r: string, i: number) => (
                                    <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md text-[10px] font-bold uppercase">
                                      {r}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            );
                          })
                        ) : idealMode ? (
                          <>
                            {/* Suggestion 1: Ideal Mode */}
                            <div 
                              onClick={() => setSelectedPhotographer('p1')}
                              className={`bg-white dark:bg-slate-900 p-4 rounded-xl border cursor-pointer hover:shadow-md transition-shadow group ${selectedPhotographer === 'p1' ? 'border-primary ring-2 ring-primary/20 shadow-md' : 'border-primary/50'}`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <span className={`font-bold text-lg block ${selectedPhotographer === 'p1' ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>Tuesday, 1:30 PM</span>
                                  <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Anchor Slot</span>
                                </div>
                                {selectedPhotographer === 'p1' && <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>}
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-success/20 text-success-700 dark:text-success flex items-center justify-center font-bold text-[10px]">J</div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Jackson <span className="text-success font-medium">(Optimized Route)</span></p>
                              </div>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Jackson is already in the area and is a 10-minute drive away.</p>
                            </div>
                            
                            {/* Suggestion 2: Ideal Mode */}
                            <div 
                              onClick={() => setSelectedPhotographer('p2')}
                              className={`bg-white dark:bg-slate-900 p-4 rounded-xl border cursor-pointer hover:shadow-md transition-all group ${selectedPhotographer === 'p2' ? 'border-primary ring-2 ring-primary/20 shadow-md' : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'}`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <span className={`font-bold text-lg block ${selectedPhotographer === 'p2' ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>Wednesday, 9:00 AM</span>
                                  <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Anchor Slot</span>
                                </div>
                                {selectedPhotographer === 'p2' && <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>}
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-warning/20 text-warning-700 dark:text-warning flex items-center justify-center font-bold text-[10px]">P</div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Paige <span className="text-slate-400 font-medium">(First Job of Day)</span></p>
                              </div>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Paige is the preferred photographer for this client.</p>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Suggestion 1: Liquid Mode */}
                            <div 
                              onClick={() => setSelectedPhotographer('p1')}
                              className={`bg-white dark:bg-slate-900 p-4 rounded-xl border cursor-pointer hover:shadow-md transition-all group ${selectedPhotographer === 'p1' ? 'border-primary ring-2 ring-primary/20 shadow-md' : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'}`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <span className={`font-bold text-lg block ${selectedPhotographer === 'p1' ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>Tuesday, 11:15 AM</span>
                                  <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Liquid Slot</span>
                                </div>
                                {selectedPhotographer === 'p1' ? <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span> : <span className="material-symbols-outlined text-slate-400 text-sm">schedule</span>}
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-success/20 text-success-700 dark:text-success flex items-center justify-center font-bold text-[10px]">J</div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Jackson <span className="text-slate-500 font-medium">(Arrives +15m Paige Rule)</span></p>
                              </div>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Jackson covers the Richmond region.</p>
                            </div>

                            {/* Suggestion 2: Liquid Mode */}
                            <div 
                              onClick={() => setSelectedPhotographer('p2')}
                              className={`bg-white dark:bg-slate-900 p-4 rounded-xl border cursor-pointer hover:shadow-md transition-all group ${selectedPhotographer === 'p2' ? 'border-primary ring-2 ring-primary/20 shadow-md' : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'}`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <span className={`font-bold text-lg block ${selectedPhotographer === 'p2' ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>Tuesday, 2:45 PM</span>
                                  <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Liquid Slot</span>
                                </div>
                                {selectedPhotographer === 'p2' ? <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span> : <span className="material-symbols-outlined text-slate-400 text-sm">schedule</span>}
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-warning/20 text-warning-700 dark:text-warning flex items-center justify-center font-bold text-[10px]">P</div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Paige <span className="text-slate-500 font-medium">(Arrives +20m Paige Rule)</span></p>
                              </div>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Paige is available for this slot.</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Dispatch Timeline */}
                    <div>
                      <div className="flex justify-between items-end mb-4">
                        <h3 className="font-bold text-slate-900 dark:text-white">Live Availability</h3>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">May 11 - May 17, 2026</span>
                          <div className="flex gap-1">
                            <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                              <span className="material-icons-outlined text-sm">chevron_left</span>
                            </button>
                            <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                              <span className="material-icons-outlined text-sm">chevron_right</span>
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Photographer Tabs */}
                      <div className="flex gap-2 mb-4 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
                        {dummyPhotographers.map(p => (
                          <button 
                            key={p.id}
                            onClick={() => setActiveTab(p.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === p.id ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                          >
                            {p.name}
                          </button>
                        ))}
                      </div>

                      <div className="border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-sm overflow-x-auto custom-scrollbar">
                        <div className="min-w-[800px]">
                          {/* Timeline Header (Days of Week) */}
                          <div className="grid grid-cols-[80px_repeat(7,1fr)] bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                            <div className="p-4 border-r border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-400 text-center flex items-center justify-center uppercase tracking-wider">TIME</div>
                            <div className="p-4 text-center text-xs font-bold text-slate-500">MON 11</div>
                            <div className="p-4 text-center text-xs font-bold text-slate-500">TUE 12</div>
                            <div className="p-4 text-center text-xs font-bold text-slate-500">WED 13</div>
                            <div className="p-4 text-center text-xs font-bold text-slate-500">THU 14</div>
                            <div className="p-4 text-center text-xs font-bold text-slate-500">FRI 15</div>
                            <div className="p-4 text-center text-xs font-bold text-slate-500">SAT 16</div>
                            <div className="p-4 text-center text-xs font-bold text-slate-500">SUN 17</div>
                          </div>
                          
                          {/* Grid Rows for Hours */}
                          <div className="relative">
                            <div className="grid grid-cols-[80px_repeat(7,1fr)] divide-x divide-slate-100 dark:divide-slate-800">
                              {/* Time Column */}
                              <div className="border-r border-slate-200 dark:border-slate-700 flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
                                {['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'].map(time => (
                                  <div key={time} className="h-20 flex items-start justify-center pt-2">
                                    <span className="text-[10px] font-bold text-slate-400">{time}</span>
                                  </div>
                                ))}
                              </div>
                              
                              {/* Mon-Sun Columns */}
                              {[0, 1, 2, 3, 4, 5, 6].map(dayIdx => (
                                <div key={dayIdx} className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800 relative group/day">
                                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(hourIdx => (
                                    <div 
                                      key={hourIdx} 
                                      onClick={() => handleGridClick(dayIdx, hourIdx)}
                                      className="h-20 hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer group/cell transition-colors flex items-center justify-center p-1"
                                    >
                                      <div className="opacity-0 group-hover/cell:opacity-100 w-full h-full border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex items-center justify-center bg-white dark:bg-slate-900 transition-all">
                                        <span className="material-symbols-outlined text-slate-400 text-sm">add</span>
                                      </div>
                                    </div>
                                  ))}

                                  {/* Render Manual Selection */}
                                  {manualSlot && manualSlot.dayIdx === dayIdx && manualSlot.photographerId === activeTab && (
                                    <div 
                                      className="absolute left-1 right-1 h-[80px] border-2 border-success ring-2 ring-success/20 rounded-lg flex flex-col items-center justify-center cursor-pointer bg-success/10 hover:bg-success/20 transition-all z-30 shadow-md"
                                      style={{ top: `${manualSlot.hourIdx * 80}px` }}
                                    >
                                      <span className="material-symbols-outlined text-success text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                      <span className="text-[9px] font-bold text-success uppercase mt-1 text-center">Manual<br/>Selection</span>
                                    </div>
                                  )}

                                  {/* Dummy Events based on active tab */}
                                  {activeTab === 'p1' && dayIdx === 1 && (
                                    <>
                                      <div className="absolute top-[20px] left-1 right-1 h-[60px] bg-slate-800 dark:bg-slate-700 text-white rounded-lg p-2 text-[10px] overflow-hidden shadow-sm z-10 border border-slate-700 hover:ring-2 hover:ring-slate-400 transition-all cursor-pointer">
                                        <p className="font-bold">#4921</p>
                                        <p className="opacity-70 truncate">Houston Blvd</p>
                                      </div>
                                      <div className="absolute top-[160px] left-1 right-1 h-[120px] bg-slate-800 dark:bg-slate-700 text-white rounded-lg p-2 text-[10px] overflow-hidden shadow-sm z-10 flex flex-col justify-between border border-slate-700 hover:ring-2 hover:ring-slate-400 transition-all cursor-pointer">
                                        <div>
                                          <p className="font-bold truncate">#4925 - Full Listing</p>
                                          <p className="opacity-70 truncate">Meyerland Area</p>
                                        </div>
                                        <span className="material-symbols-outlined text-sm">verified_user</span>
                                      </div>
                                      {/* Highlighted suggestion slot */}
                                      {/* Highlighted suggestion slot */}
                                      {selectedPhotographer === 'p1' && (
                                        <>
                                          <div className={`absolute left-1 right-1 h-[20px] bg-slate-200 dark:bg-slate-700/50 rounded-t-lg border-x-2 border-t-2 border-dashed border-primary/30 z-10 ${idealMode ? 'top-[420px]' : 'top-[240px]'}`} style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,0,0,0.05) 5px, rgba(0,0,0,0.05) 10px)' }}>
                                             <span className="text-[8px] text-slate-400 absolute bottom-0 left-1 font-bold">10m</span>
                                          </div>
                                          <div className={`absolute left-1 right-1 h-[160px] border-x-2 border-primary ring-2 ring-primary/20 flex flex-col items-center justify-center cursor-pointer bg-primary/10 hover:bg-primary/20 transition-all z-20 shadow-md ${idealMode ? 'top-[440px]' : 'top-[260px]'}`}>
                                            <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                            <span className="text-[9px] font-bold text-primary uppercase mt-1 text-center">Selected<br/>Slot</span>
                                          </div>
                                          <div className={`absolute left-1 right-1 h-[40px] bg-slate-200 dark:bg-slate-700/50 rounded-b-lg border-x-2 border-b-2 border-dashed border-primary/30 z-10 ${idealMode ? 'top-[600px]' : 'top-[420px]'}`} style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,0,0,0.05) 5px, rgba(0,0,0,0.05) 10px)' }}>
                                            <span className="text-[8px] text-slate-400 absolute top-0 left-1 font-bold">20m</span>
                                          </div>
                                        </>
                                      )}
                                    </>
                                  )}

                                  {activeTab === 'p2' && dayIdx === 2 && idealMode && (
                                    <>
                                      {/* Highlighted suggestion slot */}
                                      {/* Highlighted suggestion slot */}
                                      {selectedPhotographer === 'p2' && (
                                        <>
                                          <div className="absolute top-[60px] left-1 right-1 h-[20px] bg-slate-200 dark:bg-slate-700/50 rounded-t-lg border-x-2 border-t-2 border-dashed border-primary/30 z-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,0,0,0.05) 5px, rgba(0,0,0,0.05) 10px)' }}>
                                             <span className="text-[8px] text-slate-400 absolute bottom-0 left-1 font-bold">10m</span>
                                          </div>
                                          <div className="absolute top-[80px] left-1 right-1 h-[160px] border-x-2 border-primary ring-2 ring-primary/20 flex flex-col items-center justify-center cursor-pointer bg-primary/10 hover:bg-primary/20 transition-all z-20 shadow-md">
                                            <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                            <span className="text-[9px] font-bold text-primary uppercase mt-1 text-center">Selected<br/>Slot</span>
                                          </div>
                                          <div className="absolute top-[240px] left-1 right-1 h-[40px] bg-slate-200 dark:bg-slate-700/50 rounded-b-lg border-x-2 border-b-2 border-dashed border-primary/30 z-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,0,0,0.05) 5px, rgba(0,0,0,0.05) 10px)' }}>
                                            <span className="text-[8px] text-slate-400 absolute top-0 left-1 font-bold">20m</span>
                                          </div>
                                        </>
                                      )}
                                    </>
                                  )}
                                  {activeTab === 'p2' && dayIdx === 1 && !idealMode && (
                                    <>
                                      {/* Highlighted suggestion slot */}
                                      {/* Highlighted suggestion slot */}
                                      {selectedPhotographer === 'p2' && (
                                        <>
                                          <div className="absolute top-[500px] left-1 right-1 h-[40px] bg-slate-200 dark:bg-slate-700/50 rounded-t-lg border-x-2 border-t-2 border-dashed border-primary/30 z-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,0,0,0.05) 5px, rgba(0,0,0,0.05) 10px)' }}>
                                             <span className="text-[8px] text-slate-400 absolute bottom-0 left-1 font-bold">20m</span>
                                          </div>
                                          <div className="absolute top-[540px] left-1 right-1 h-[160px] border-x-2 border-primary ring-2 ring-primary/20 flex flex-col items-center justify-center cursor-pointer bg-primary/10 hover:bg-primary/20 transition-all z-20 shadow-md">
                                            <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                            <span className="text-[9px] font-bold text-primary uppercase mt-1 text-center">Selected<br/>Slot</span>
                                          </div>
                                          <div className="absolute top-[700px] left-1 right-1 h-[60px] bg-slate-200 dark:bg-slate-700/50 rounded-b-lg border-x-2 border-b-2 border-dashed border-primary/30 z-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,0,0,0.05) 5px, rgba(0,0,0,0.05) 10px)' }}>
                                            <span className="text-[8px] text-slate-400 absolute top-0 left-1 font-bold">30m</span>
                                          </div>
                                        </>
                                      )}
                                    </>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Status Toggle (Relocated) */}
                    <div className="flex justify-center mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
                      <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full flex gap-1 shadow-inner">
                        <button 
                          onClick={() => setBookingStatus('confirmed')}
                          className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all ${bookingStatus === 'confirmed' ? 'bg-white dark:bg-slate-700 text-success shadow-sm' : 'bg-transparent shadow-none text-slate-500 hover:text-success'}`}
                        >Confirmed</button>
                        <button 
                          onClick={() => setBookingStatus('pending')}
                          className={`px-8 py-2.5 rounded-full text-sm font-semibold transition-all ${bookingStatus === 'pending' ? 'bg-white dark:bg-slate-700 text-warning shadow-sm' : 'bg-transparent shadow-none text-slate-500 hover:text-warning dark:hover:text-warning'}`}
                        >Pending</button>
                      </div>
                    </div>

                  </div>
                )}
              </details>
            </section>

            {/* 4. Access Section */}
            <section className="space-y-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <span className="material-icons-outlined text-base">key</span> 4. Access Details
              </h2>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-6 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    'Agent will meet onsite',
                    'Vendor will meet onsite',
                    'Property is a section',
                    'Key / Lockbox'
                  ].map((type) => (
                    <label key={type} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${accessType === type ? 'border-primary bg-primary/5' : 'border-slate-100 dark:border-slate-700 hover:border-primary/30'}`}>
                      <input 
                        type="radio" 
                        name="accessType"
                        value={type}
                        checked={accessType === type}
                        onChange={(e) => setAccessType(e.target.value)}
                        className="w-5 h-5 text-primary border-slate-300 focus:ring-primary" 
                      />
                      <span className={`text-sm font-medium ${accessType === type ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}>{type}</span>
                    </label>
                  ))}
                </div>

                {accessType === 'Key / Lockbox' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Key/Lockbox Location</label>
                      <input 
                        type="text" 
                        value={keyBoxLocation}
                        onChange={(e) => setKeyBoxLocation(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-primary" 
                        placeholder="e.g. Front door railing" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Key/Lockbox PIN</label>
                      <input 
                        type="text" 
                        value={keyBoxPin}
                        onChange={(e) => setKeyBoxPin(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-primary" 
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
                  </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Vendor Name</label>
                    <input 
                      type="text"
                      value={vendorName}
                      onChange={(e) => setVendorName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-primary" 
                      placeholder="Enter name" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Vendor Number</label>
                    <input 
                      type="tel"
                      value={vendorNumber}
                      onChange={(e) => setVendorNumber(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-primary" 
                      placeholder="(555) 000-0000" 
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Notes</label>
                    <textarea 
                      value={accessNotes}
                      onChange={(e) => setAccessNotes(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-primary min-h-[60px]" 
                      placeholder="General access notes..." 
                    />
                  </div>
                </div>


              </div>
            </section>

            {/* 5. Property Details Section */}
            <section className="space-y-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <span className="material-icons-outlined text-base">home</span> 5. Property Details
              </h2>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-6 shadow-sm">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2 ml-1">Property Highlights</label>
                  <textarea 
                    value={propertyHighlights}
                    onChange={(e) => setPropertyHighlights(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm focus:ring-primary min-h-[80px]" 
                    placeholder="e.g. Spiral staircase..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2 ml-1">Property Notes</label>
                  <textarea 
                    value={propertyNotes}
                    onChange={(e) => setPropertyNotes(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm focus:ring-primary min-h-[80px]" 
                    placeholder="Example: dog on site"
                  />
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

      {/* Sticky Tab Toggle */}
      <div 
        className={`hidden lg:flex absolute top-12 z-50 transition-all duration-300 ${showSidebar ? 'right-[400px]' : 'right-0'}`}
      >
        <button 
          onClick={() => setShowSidebar(!showSidebar)}
          className="bg-purple-50 dark:bg-slate-800 border border-r-0 border-slate-200 dark:border-slate-700 shadow-md py-4 px-1 rounded-l-md hover:bg-purple-100 dark:hover:bg-slate-700 transition-colors text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          title={showSidebar ? "Hide Tasks Sidebar" : "Show Tasks Sidebar"}
        >
          {showSidebar ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Right Sidebar (Tasks & Notes) */}
      {showSidebar && (
      <aside className="hidden lg:flex w-[400px] bg-[#f9f5ff] dark:bg-background-dark/40 border-l border-primary/10 flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.02)]">
        {/* Quick Notes */}
        <div className="flex-1 flex flex-col">
          <div className="p-6 border-b border-primary/5 flex items-center justify-between bg-white/50">
            <div className="flex items-center gap-2">
              <span className="material-icons-outlined text-primary">edit_note</span>
              <h2 className="font-bold text-slate-800 dark:text-slate-200">Quick Notes</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Saved
              </div>
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
            <span className="text-[10px] font-bold text-slate-400">{pendingTasks.length} REMAINING</span>
          </div>
          <div className="flex-1 p-6 space-y-4 overflow-y-auto custom-scrollbar">
            {pendingTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-70">
                <span className="material-icons-outlined text-4xl mb-2">check_circle</span>
                <p className="text-sm font-bold">All clear! No pending tasks.</p>
              </div>
            ) : (
              pendingTasks.map((task, idx) => (
                <label key={idx} className="flex items-center gap-3 group cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 text-success rounded-lg border-slate-300 focus:ring-success" />
                  <span className="text-sm text-slate-600 group-hover:text-success transition-colors">{task.title}</span>
                </label>
              ))
            )}
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
      )}
      {/* Custom Package Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 max-w-xl w-full sm:min-w-[500px] shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto custom-scrollbar">
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
              
              <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                <label className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={packageTbc}
                    onChange={(e) => setPackageTbc(e.target.checked)}
                    className="w-5 h-5 text-warning rounded border-slate-300 focus:ring-warning" 
                  />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Package Details To Be Confirmed</span>
                </label>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="flex-1 w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
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
                  className="flex-1 w-full px-4 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all"
                >
                  Save Custom Package
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Agent Modal */}
      {showAgentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 w-full max-w-lg sm:min-w-[480px] shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add New Agent</h2>
              <button type="button" onClick={() => { setShowAgentModal(false); setNewAgentAgencySearch(''); setNewAgentSelectedSubAgency(''); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <span className="material-icons-outlined">close</span>
              </button>
            </div>
            
            <div className="space-y-5">
              {/* Agency Search */}
              <div ref={newAgentAgencyRef} className="relative">
                <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">Agency *</label>
                <div className="relative">
                  <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">business</span>
                  <input 
                    type="text" 
                    value={newAgentAgencySearch}
                    onChange={(e) => {
                      setNewAgentAgencySearch(e.target.value);
                      setShowNewAgentAgencyDropdown(true);
                      // If text doesn't match an existing sub-agency, mark as 'new'
                      const match = subAgenciesList.find(s => {
                        const parent = agenciesList.find(a => a.id === s.agency_id);
                        const displayName = parent ? `${parent.name} - ${s.name}` : s.name;
                        return displayName.toLowerCase() === e.target.value.toLowerCase() || s.name.toLowerCase() === e.target.value.toLowerCase();
                      });
                      setNewAgentSelectedSubAgency(match ? match.id : e.target.value ? 'new' : '');
                    }}
                    onFocus={() => setShowNewAgentAgencyDropdown(true)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                    placeholder="Search or create agency..."
                  />
                </div>

                {showNewAgentAgencyDropdown && (
                  <div className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-48 overflow-y-auto custom-scrollbar">
                    {subAgenciesList
                      .filter(s => {
                        if (!newAgentAgencySearch) return true;
                        const parent = agenciesList.find(a => a.id === s.agency_id);
                        const displayName = parent ? `${parent.name} - ${s.name}` : s.name;
                        return displayName.toLowerCase().includes(newAgentAgencySearch.toLowerCase());
                      })
                      .map(sub => {
                        const parent = agenciesList.find(a => a.id === sub.agency_id);
                        const displayName = parent ? `${parent.name} - ${sub.name}` : sub.name;
                        const isActive = newAgentSelectedSubAgency === sub.id;
                        return (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => {
                              setNewAgentSelectedSubAgency(sub.id);
                              setNewAgentAgencySearch(displayName);
                              setShowNewAgentAgencyDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-primary/5 transition-colors ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-slate-700 dark:text-slate-300'}`}
                          >
                            {displayName}
                          </button>
                        );
                      })}
                    
                    {/* Create new option */}
                    {newAgentAgencySearch && !subAgenciesList.some(s => {
                      const parent = agenciesList.find(a => a.id === s.agency_id);
                      const displayName = parent ? `${parent.name} - ${s.name}` : s.name;
                      return displayName.toLowerCase() === newAgentAgencySearch.toLowerCase();
                    }) && (
                      <button
                        type="button"
                        onClick={() => {
                          setNewAgentSelectedSubAgency('new');
                          setShowNewAgentAgencyDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 text-primary text-sm font-bold hover:bg-primary/5 transition-colors flex items-center gap-2"
                      >
                        <span className="material-icons-outlined text-sm">add</span>
                        Create &quot;{newAgentAgencySearch}&quot;
                      </button>
                    )}
                  </div>
                )}

                {newAgentSelectedSubAgency === 'new' && newAgentAgencySearch && (
                  <p className="text-xs text-primary font-medium mt-1 ml-1 flex items-center gap-1">
                    <span className="material-icons-outlined text-xs">info</span>
                    A new agency &quot;{newAgentAgencySearch}&quot; will be created
                  </p>
                )}
              </div>

              {/* Agent Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">Agent Name *</label>
                <input 
                  type="text" 
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                  placeholder="e.g. Jane Doe"
                />
              </div>

              {/* Contact */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">Contact Info</label>
                <input 
                  type="text" 
                  value={newAgentContact}
                  onChange={(e) => setNewAgentContact(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                  placeholder="e.g. jane@example.com"
                />
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button 
                type="button" 
                onClick={() => { setShowAgentModal(false); setNewAgentAgencySearch(''); setNewAgentSelectedSubAgency(''); }}
                className="flex-1 w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleSaveAgent}
                disabled={isSavingAgent || !newAgentName.trim() || !newAgentSelectedSubAgency}
                className="flex-1 w-full px-4 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all text-sm disabled:opacity-50"
              >
                {isSavingAgent ? 'Saving...' : 'Save Agent'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conflict Warning Modal */}
      {showConflictModal && conflictDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${conflictDetails.type === 'overlap' ? 'bg-danger/20 text-danger' : 'bg-warning/20 text-warning-700 dark:text-warning'}`}>
                <span className="material-symbols-outlined">{conflictDetails.type === 'overlap' ? 'error' : 'warning'}</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {conflictDetails.type === 'overlap' ? 'Booking Overlap' : 'Travel Warning'}
              </h2>
            </div>
            
            <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
              {conflictDetails.message}
            </p>

            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={() => setShowConflictModal(false)}
                className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={() => {
                  setManualSlot(conflictDetails.pendingSlot);
                  setSelectedPhotographer(null);
                  setShowConflictModal(false);
                }}
                className={`flex-1 px-4 py-3 text-white rounded-xl font-bold transition-all text-sm ${conflictDetails.type === 'overlap' ? 'bg-danger hover:bg-danger/90' : 'bg-warning-600 hover:bg-warning-600/90'}`}
              >
                Override & Book
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
