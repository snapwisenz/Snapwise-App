/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { createClient } from '@/utils/supabase/client';
import { AlertTriangle } from 'lucide-react';
import { AgentCombobox } from '@/components/bookings/AgentCombobox';
import { PackageSelector } from '@/components/bookings/PackageSelector';
import { SmartScheduleGrid } from '@/components/bookings/SmartScheduleGrid';
import { Sidebar } from '@/components/bookings/Sidebar';

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
  
  // Real Data State
  const [agenciesList, setAgenciesList] = useState<any[]>([]);
  const [subAgenciesList, setSubAgenciesList] = useState<any[]>([]);
  const [agentsList, setAgentsList] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<{name: string, duration: number, price: string, photos?: string} | null>(null);
  const [idealMode, setIdealMode] = useState(false);

  // Custom Package State
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customOptions, setCustomOptions] = useState({
    groundPhotos: '',
    drone: '',
    reels: '',
    twilight: '',
    video: '', 
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
  const [fallbackDuration, setFallbackDuration] = useState(120);
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
  const [activeTab, setActiveTab] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  
  const effectiveDuration = selectedPackage?.duration ?? (fallbackDuration / 60);
  const scheduleReady = !!selectedPackage || packageTbc;

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
        supabase.from('agency_settings').select('ground_photo_price, drone_photo_price, reel_price, twilight_photo_price, video_basic_price, video_standard_price, video_premium_price, video_ai_price, site_plan_price, floorplan_price, matterport_price, virtual_staging_price, custom_pricing_rules').eq('user_id', user.id).single(),
        supabase.from('agencies').select('id, name').eq('user_id', user.id),
        supabase.from('sub_agencies').select('id, name, agency_id'),
        supabase.from('agents').select('id, name, sub_agency_id, contact_info, sub_agencies(id, name, agency_id, agencies(id, name))')
      ]);

      if (pricingRes.data) setPricingSettings(prev => ({ ...prev, ...pricingRes.data }));
      if (agenciesRes.data) setAgenciesList(agenciesRes.data);
      if (subAgenciesRes.data) setSubAgenciesList(subAgenciesRes.data);
      if (agentsRes.data) setAgentsList(agentsRes.data);
    }
    fetchPricingAndAgencies();
  }, [supabase]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (newAgentAgencyRef.current && !newAgentAgencyRef.current.contains(e.target as Node)) {
        setShowNewAgentAgencyDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

      const { data } = await supabase.from('packages').select('id, name, price, duration, ground_photos_qty, drone_qty').or(queryStr);
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



  const initAutocomplete = useCallback(() => {
    if (!inputRef.current || !window.google) return;
    
    if (inputRef.current.dataset.hasAutocomplete) return;
    inputRef.current.dataset.hasAutocomplete = 'true';
    
    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      fields: ['formatted_address', 'geometry'],
      componentRestrictions: { country: 'nz' },
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      const newAddress = place.formatted_address || place.name || '';
      if (newAddress) {
        setAddress(newAddress);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isLoaded && window.google) {
      initAutocomplete();
    }
  }, [isLoaded, initAutocomplete]);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAgent, address, agentsList]);

  const eventsArray: any[] = useMemo(() => [], []);

  const checkSlotConflict = useCallback((dayIdx: number, topPx: number, heightPx: number, events: any[]) => {
    const slotStartHour = topPx / 80;
    const slotEndHour = (topPx + heightPx) / 80;
    for (const event of events) {
      if (event.dayIdx !== dayIdx) continue;
      if (slotStartHour < event.endHour && slotEndHour > event.startHour) return true;
    }
    return false;
  }, []);

  const validateSlot = useCallback((proposedTime: { dayIdx: number, hourIdx: number }, events: any[]) => {
    const pStart = proposedTime.hourIdx;
    const pEnd = proposedTime.hourIdx + 1;

    for (const event of events) {
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
  }, []);

  const manualSlotHasConflict = useMemo(() => {
    if (!manualSlot) return false;
    const validation = validateSlot(manualSlot, eventsArray);
    return !validation.valid && validation.type === 'overlap';
  }, [manualSlot, eventsArray, validateSlot]);

  const handleGridClick = useCallback((dayIdx: number, hourIdx: number) => {
    const pendingSlot = { dayIdx, hourIdx, photographerId: activeTab };
    const validation = validateSlot(pendingSlot, eventsArray);
    
    if (!validation.valid) {
      setConflictDetails({ type: validation.type as 'overlap' | 'travel', message: validation.message!, pendingSlot });
      setShowConflictModal(true);
    } else {
      setManualSlot(pendingSlot);
      setSelectedPhotographer(null);
    }
  }, [activeTab, eventsArray, validateSlot]);

  const calculateTravel = useCallback(async (targetAddress: string, photographerId: string, targetDate: Date) => {
    if (!targetAddress || !photographerId) return;
    
    setLoadingRouting(true);
    setOverlapWarning(false);
    try {
      // Fetch photographer's base address
      const { data: profile } = await supabase.from('profiles').select('base_address').eq('id', photographerId).single();
      let previousLocation = profile?.base_address || '';

      // Fetch previous job of the day
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0,0,0,0);
      const { data: dayBookings } = await supabase
        .from('bookings')
        .select('shoot_location')
        .eq('photographer_id', photographerId)
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', targetDate.toISOString())
        .order('start_time', { ascending: false })
        .limit(1);

      if (dayBookings && dayBookings.length > 0) {
        previousLocation = dayBookings[0].shoot_location;
      }

      if (!previousLocation) {
        setTravelTime({ raw: 0, rounded: 0 });
        return;
      }

      const res = await fetch(`/api/routing?origin=${encodeURIComponent(previousLocation)}&destination=${encodeURIComponent(targetAddress)}`);
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
  }, [supabase]);

  useEffect(() => {
    if (!address) return;
    
    let photographerId = selectedPhotographer;
    let targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 1);
    targetDate.setHours(9, 0, 0, 0);

    if (manualSlot) {
      photographerId = manualSlot.photographerId;
      targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + manualSlot.dayIdx);
      targetDate.setHours(8 + manualSlot.hourIdx, 0, 0, 0);
    } else if (selectedPhotographer) {
       const suggestion = suggestions.find(s => s.photographer_id === selectedPhotographer);
       if (suggestion && suggestion.suggested_time) {
         const timeParts = suggestion.suggested_time.match(/(\d+):(\d+)\s+(AM|PM)/i);
         if (timeParts) {
            let hours = parseInt(timeParts[1], 10);
            const minutes = parseInt(timeParts[2], 10);
            const modifier = timeParts[3].toUpperCase();
            if (hours === 12) hours = modifier === 'AM' ? 0 : 12;
            else if (modifier === 'PM') hours += 12;
            targetDate.setHours(hours, minutes, 0, 0);
         }
       }
    }

    if (photographerId) {
      calculateTravel(address, photographerId, targetDate);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, selectedPhotographer, manualSlot, suggestions, calculateTravel]);

  const handleSaveAgent = async () => {
    if (!newAgentName.trim() || !newAgentSelectedSubAgency) {
      alert("Please enter a name and select an agency.");
      return;
    }
    setIsSavingAgent(true);
    try {
      let subAgencyId = newAgentSelectedSubAgency;

      if (!subAgenciesList.find(s => s.id === subAgencyId)) {
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
    
    if (!manualSlot && !selectedPhotographer) {
      alert("Please select a time slot or an AI suggested photographer.");
      return;
    }
    
    setIsSaving(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("No active session");
      
      const agent = agentsList.find(a => a.id === selectedAgent);
      const agencyId = agent?.sub_agencies?.agencies?.id || agent?.sub_agencies?.agency_id || null;
      const subAgencyId = agent?.sub_agency_id || null;
      
      let deliverables = [];
      if (!selectedPackage) {
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
        deliverables.push({ name: selectedPackage.name, status: 'missing' });
      }

      const matchedPackage = selectedPackage ? packages.find(p => p.name === selectedPackage.name) : null;
      const packageId = matchedPackage ? matchedPackage.id : null;

      const startDate = new Date();
      if (manualSlot) {
        startDate.setDate(startDate.getDate() + manualSlot.dayIdx);
        startDate.setHours(8 + manualSlot.hourIdx, 0, 0, 0);
      } else {
        startDate.setDate(startDate.getDate() + 1);
        const suggestion = suggestions.find(s => s.photographer_id === selectedPhotographer);
        if (suggestion && suggestion.suggested_time) {
          const timeParts = suggestion.suggested_time.match(/(\d+):(\d+)\s+(AM|PM)/i);
          if (timeParts) {
            let hours = parseInt(timeParts[1], 10);
            const minutes = parseInt(timeParts[2], 10);
            const modifier = timeParts[3].toUpperCase();
            if (hours === 12) hours = modifier === 'AM' ? 0 : 12;
            else if (modifier === 'PM') hours += 12;
            startDate.setHours(hours, minutes, 0, 0);
          } else {
            startDate.setHours(9, 0, 0, 0);
          }
        } else {
          startDate.setHours(9, 0, 0, 0);
        }
      }

      // We also need the end time which is start time + effectiveDuration
      const endDate = new Date(startDate);
      endDate.setMinutes(startDate.getMinutes() + Math.round(effectiveDuration * 60));

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
        photographer_id: manualSlot ? manualSlot.photographerId : selectedPhotographer,
        shoot_location: address,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
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
        window.location.href = `/bookings/${insertedBooking.id}`;
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
                  if (address) fetchSuggestions(address);
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
              <AgentCombobox 
                agentsList={agentsList}
                agentSearch={agentSearch}
                setAgentSearch={setAgentSearch}
                selectedAgent={selectedAgent}
                setSelectedAgent={setSelectedAgent}
                setSelectedPackage={setSelectedPackage}
                setShowAgentModal={setShowAgentModal}
              />

              <PackageSelector 
                selectedAgent={selectedAgent}
                packages={packages}
                selectedPackage={selectedPackage}
                setSelectedPackage={setSelectedPackage}
                setShowCustomModal={setShowCustomModal}
                packageDetails={packageDetails}
                setPackageDetails={setPackageDetails}
                packageTbc={packageTbc}
                setPackageTbc={setPackageTbc}
                fallbackDuration={fallbackDuration}
                setFallbackDuration={setFallbackDuration}
              />

              <SmartScheduleGrid 
                scheduleReady={scheduleReady}
                effectiveDuration={effectiveDuration}
                idealMode={idealMode}
                setIdealMode={setIdealMode}
                loadingSuggestions={loadingSuggestions}
                suggestions={suggestions}
                selectedPhotographer={selectedPhotographer}
                setSelectedPhotographer={setSelectedPhotographer}
                setManualSlot={setManualSlot}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                manualSlot={manualSlot}
                manualSlotHasConflict={manualSlotHasConflict}
                handleGridClick={handleGridClick}
                bookingStatus={bookingStatus}
                setBookingStatus={setBookingStatus}
                events={eventsArray}
                checkSlotConflict={checkSlotConflict}
              />

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

        <Sidebar 
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
          pendingTasks={pendingTasks}
        />

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
                        duration: 2,
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
                          Create "{newAgentAgencySearch}"
                        </button>
                      )}
                    </div>
                  )}

                  {newAgentSelectedSubAgency === 'new' && newAgentAgencySearch && (
                    <p className="text-xs text-primary font-medium mt-1 ml-1 flex items-center gap-1">
                      <span className="material-icons-outlined text-xs">info</span>
                      A new agency "{newAgentAgencySearch}" will be created
                    </p>
                  )}
                </div>

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

        {showConflictModal && conflictDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-[90vw] sm:max-w-md shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 p-6">
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
