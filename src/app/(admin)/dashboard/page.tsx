'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { GoogleMap, useJsApiLoader, DirectionsService, Polyline, Marker, InfoWindow } from '@react-google-maps/api';

// --- MOCK DATA FALLBACKS ---
const MOCK_HOME_BASE = { lat: -36.8485, lng: 174.7633 }; // Auckland as default
const MOCK_HOME_ADDRESS = "Auckland CBD, New Zealand";

const MOCK_JOBS = [
  { id: '1', shoot_location: '100 Queen St, Auckland', start_time: new Date().toISOString(), status: 'pending', agent: { name: 'Sarah Chen' }, package: { name: 'Premium HDR' }, deliverables: [{status: 'missing'}] },
  { id: '2', shoot_location: 'Ponsonby Rd, Auckland', start_time: new Date(Date.now() + 2 * 3600000).toISOString(), status: 'pending', agent: { name: 'Mark Gable' }, package: { name: 'Standard + Drone' }, deliverables: [] },
  { id: '3', shoot_location: 'Newmarket, Auckland', start_time: new Date(Date.now() + 4 * 3600000).toISOString(), status: 'completed', agent: { name: 'Jessica Wong' }, package: { name: 'Video Only' }, deliverables: [] },
];

export default function DashboardPage() {
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<{temp: number, desc: string, icon: string} | null>(null);
  
  const supabase = createClient();

  // Load Google Maps API
  const { isLoaded: isMapLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  // Map state
  const [directionsResponse, setDirectionsResponse] = useState<any>(null);
  const [routeDistance, setRouteDistance] = useState('');
  const [activeMarker, setActiveMarker] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch Bookings
        const { data: jobsData, error: jobsError } = await supabase.from('bookings').select('*, agent:agent_id(name), package:package_id(name)');
        
        if (jobsError || !jobsData || jobsData.length === 0) {
          console.log("Using mock bookings fallback", jobsError);
          setJobs(MOCK_JOBS);
        } else {
          setJobs(jobsData);
        }

        // Fetch NIWA Weather
        if (process.env.NEXT_PUBLIC_NIWA_API_KEY || process.env.NIWA_API_KEY) {
          const apiKey = process.env.NEXT_PUBLIC_NIWA_API_KEY || process.env.NIWA_API_KEY;
          const lat = MOCK_HOME_BASE.lat;
          const long = MOCK_HOME_BASE.lng;
          // Example NIWA endpoint (may need adjustment based on exact API docs)
          const weatherRes = await fetch(`https://api.niwa.co.nz/weather/data/v1/forecasts/points?lat=${lat}&long=${long}`, {
            headers: { 'x-apikey': apiKey as string }
          });
          if (weatherRes.ok) {
            const wData = await weatherRes.json();
            // Assuming response structure has current temp somewhere
            const current = wData.forecasts?.[0] || {};
            setWeather({
              temp: current.air_temp || 18,
              desc: current.conditions || 'Clear skies, good conditions',
              icon: '☀️'
            });
          }
        } else {
          // Mock weather if no API key
          setWeather({ temp: 18, desc: 'Clear skies, good drone conditions', icon: '☀️' });
        }
      } catch (e) {
        console.error("Fetch error", e);
        setJobs(MOCK_JOBS);
        setWeather({ temp: 18, desc: 'Clear skies, good drone conditions', icon: '☀️' });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [supabase]);

  // Computed Data
  const filteredJobs = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    return jobs.filter(job => {
      const jobDate = new Date(job.start_time || job.date);
      if (viewMode === 'day') {
        return jobDate >= today && jobDate < new Date(today.getTime() + 86400000);
      } else {
        return jobDate >= today && jobDate < nextWeek;
      }
    }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  }, [jobs, viewMode]);

  const missingAssetsCount = useMemo(() => {
    let count = 0;
    filteredJobs.forEach(job => {
      if (job.deliverables && Array.isArray(job.deliverables)) {
        count += job.deliverables.filter((d:any) => d.status === 'missing').length;
      }
      if (viewMode === 'week' && job.status === 'pending') count++;
    });
    return count;
  }, [filteredJobs, viewMode]);

  const mapCenter = MOCK_HOME_BASE;

  const directionsCallback = (response: any, status: string) => {
    if (status === 'OK' && !directionsResponse) {
      setDirectionsResponse(response);
      let dist = 0;
      const route = response.routes[0];
      for (let i = 0; i < route.legs.length; i++) {
        dist += route.legs[i].distance.value;
      }
      setRouteDistance(`${Math.round(dist / 1000)} km`);
    }
  };

  return (
    <main className="flex-grow overflow-y-auto p-gutter lg:px-lg lg:py-md font-body-md text-on-surface bg-background">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between mb-lg gap-md">
        <div className="space-y-sm">
          <h1 className="font-h1 text-h1 text-on-surface">Good Morning, Jordan</h1>
          <div className="inline-flex bg-surface-container rounded-full p-1 w-fit">
            <button 
              onClick={() => setViewMode('day')}
              className={`px-6 py-2 rounded-full font-label-bold transition-all ${viewMode === 'day' ? 'bg-secondary text-on-secondary shadow-sm' : 'text-on-surface-variant hover:bg-surface-variant'}`}
            >
              My Day
            </button>
            <button 
              onClick={() => setViewMode('week')}
              className={`px-6 py-2 rounded-full font-label-bold transition-all ${viewMode === 'week' ? 'bg-secondary text-on-secondary shadow-sm' : 'text-on-surface-variant hover:bg-surface-variant'}`}
            >
              My Week
            </button>
          </div>
        </div>
        <Link href="/bookings/new" className="bg-secondary-container text-on-secondary-container px-gutter py-3 rounded-full font-label-bold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all w-fit">
          <span className="material-symbols-outlined font-[100]" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
          + Quick Book
        </Link>
      </header>

      {/* KPI Widgets Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-md mb-lg">
        <div className="bg-surface-container-lowest p-md rounded-xl ambient-shadow border-l-4 border-secondary flex items-center justify-between">
          <div>
            <p className="font-caption text-on-surface-variant mb-xs">
              {viewMode === 'day' ? 'Shoots Today' : 'Shoots This Week'}
            </p>
            <h3 className="font-h1 text-h1 text-secondary">{filteredJobs.length}</h3>
          </div>
          <div className="bg-secondary-fixed w-12 h-12 rounded-full flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-3xl">camera</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-md rounded-xl ambient-shadow border-l-4 border-primary-container flex items-center justify-between">
          <div>
            <p className="font-caption text-on-surface-variant mb-xs">
              {viewMode === 'day' ? "Today's Yield" : "Weekly Yield"}
            </p>
            <h3 className="font-h1 text-h1 text-primary-container">$45/km</h3>
          </div>
          <div className="bg-primary-fixed w-12 h-12 rounded-full flex items-center justify-center text-primary-container">
            <span className="material-symbols-outlined text-3xl">payments</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-md rounded-xl ambient-shadow border-l-4 border-tertiary-container flex items-center justify-between">
          <div>
            <p className="font-caption text-on-surface-variant mb-xs">{viewMode === 'day' ? 'Urgent: Missing Assets' : 'Pending Jobs'}</p>
            <h3 className="font-h1 text-h1 text-tertiary-container">{missingAssetsCount}</h3>
          </div>
          <div className="bg-tertiary-fixed w-12 h-12 rounded-full flex items-center justify-center text-tertiary-container">
            <span className="material-symbols-outlined text-3xl">warning</span>
          </div>
        </div>
      </section>

      {/* Main Layout Split */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-lg">
        
        {/* Left Column (60%) */}
        {viewMode === 'day' && (
          <div className="lg:col-span-6 space-y-lg">
            {/* Route Map Card */}
            <div className="bg-surface-container-lowest rounded-xl ambient-shadow overflow-hidden relative group">
              <div className="aspect-[16/9] w-full bg-surface-container relative">
                {isMapLoaded ? (
                  <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={mapCenter}
                    zoom={11}
                    options={{ disableDefaultUI: true, styles: [{ stylers: [{ saturation: -100 }, { lightness: 40 }] }] }}
                  >
                    {filteredJobs.length > 0 && (
                      <DirectionsService
                        options={{
                          origin: MOCK_HOME_ADDRESS,
                          destination: MOCK_HOME_ADDRESS,
                          waypoints: filteredJobs.map(j => ({ location: j.shoot_location || j.address, stopover: true })),
                          travelMode: window.google.maps.TravelMode.DRIVING,
                        }}
                        callback={directionsCallback}
                      />
                    )}
                    
                    {directionsResponse && (
                      <Polyline
                        path={directionsResponse.routes[0].overview_path}
                        options={{ strokeColor: '#8806BD', strokeWeight: 5, strokeOpacity: 0.8 }}
                      />
                    )}

                    {/* Home Pin */}
                    <Marker position={MOCK_HOME_BASE} icon={{ path: window.google.maps.SymbolPath.CIRCLE, scale: 6, fillColor: '#000', fillOpacity: 1, strokeWeight: 2, strokeColor: '#fff' }} />
                  </GoogleMap>
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><p className="text-on-surface-variant">Loading Map...</p></div>
                )}
                
                {/* Map Overlay Pill */}
                {routeDistance && (
                  <div className="absolute top-4 left-4 bg-surface-container-lowest/90 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 shadow-lg border border-white/50">
                    <span className="material-symbols-outlined text-primary">directions_car</span>
                    <span className="font-label-bold text-on-surface">Total Driving: {routeDistance}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Today's Timeline */}
            <div className="bg-surface-container-lowest p-md rounded-xl ambient-shadow">
              <div className="flex justify-between items-center mb-md">
                <h3 className="font-h3 text-h3 text-on-surface">Today's Timeline</h3>
                <span className="font-caption text-on-surface-variant">{filteredJobs.filter(j => j.status === 'completed').length}/{filteredJobs.length} Completed</span>
              </div>
              <div className="space-y-0 relative">
                <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-outline-variant"></div>
                
                {filteredJobs.length === 0 && <p className="text-on-surface-variant text-sm py-4">No jobs scheduled for today.</p>}
                
                {filteredJobs.map((job, idx) => {
                  const jobTime = new Date(job.start_time || job.date || new Date()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                  const isCompleted = job.status === 'completed';
                  const isNext = idx === filteredJobs.findIndex(j => j.status !== 'completed');
                  
                  return (
                    <div key={job.id} className="relative pl-10 pb-lg last:pb-0">
                      <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-surface-container-lowest z-10 ${isCompleted ? 'bg-success text-white' : isNext ? 'bg-primary' : 'bg-outline-variant'}`}></div>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-sm">
                        <div className="space-y-xs">
                          <div className="flex items-center gap-2">
                            <span className={`font-label-bold ${isNext ? 'text-primary' : 'text-on-surface-variant'}`}>{jobTime}</span>
                            {isNext && <span className="bg-primary-container/10 text-primary-container text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider">Next</span>}
                          </div>
                          <p className="font-body-md font-bold text-on-surface">{job.shoot_location || job.address || 'Unknown Location'}</p>
                          <p className="font-body-sm text-on-surface-variant">{job.package?.name || 'Standard Package'} • Agent: {job.agent?.name || 'TBD'}</p>
                        </div>
                        {isNext ? (
                          <button className="bg-surface-container hover:bg-surface-variant px-4 py-2 rounded-lg font-label-bold transition-colors">Arrived</button>
                        ) : isCompleted ? (
                          <span className="text-success font-bold text-sm">Completed</span>
                        ) : (
                          <button className="text-on-surface-variant/40 cursor-not-allowed px-4 py-2 rounded-lg font-label-bold">Pending</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'week' && (
          <div className="lg:col-span-6 space-y-lg">
             <div className="bg-surface-container-lowest p-md rounded-xl ambient-shadow">
               <h3 className="font-h3 text-h3 text-on-surface mb-4">This Week's Schedule</h3>
               <div className="space-y-4">
                 {filteredJobs.length === 0 ? (
                   <p className="text-on-surface-variant">No jobs scheduled this week.</p>
                 ) : (
                   filteredJobs.map(job => (
                     <div key={job.id} className="flex justify-between items-center p-4 border border-outline-variant rounded-xl">
                       <div>
                         <p className="font-bold text-on-surface">{new Date(job.start_time || job.date || new Date()).toLocaleDateString()} at {new Date(job.start_time || job.date || new Date()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                         <p className="text-sm text-on-surface-variant">{job.shoot_location || job.address || 'Unknown Location'}</p>
                       </div>
                       <span className="bg-surface-variant text-on-surface-variant px-3 py-1 rounded-full text-xs font-bold uppercase">{job.status}</span>
                     </div>
                   ))
                 )}
               </div>
             </div>
          </div>
        )}

        {/* Right Column (40%) */}
        <div className="lg:col-span-4 space-y-lg">
          
          {/* Weather & Insights Card */}
          <div className="bg-surface-container-lowest rounded-xl ambient-shadow overflow-hidden">
             <div className="p-md bg-surface-bright flex items-center justify-between border-b border-outline-variant">
                 {weather ? (
                   <div className="flex items-center gap-3">
                     <span className="text-4xl">{weather.icon}</span>
                     <div>
                       <h4 className="font-h3 text-h3 text-on-surface">{weather.temp}°C</h4>
                       <p className="font-body-sm text-on-surface-variant">{weather.desc}</p>
                     </div>
                   </div>
                 ) : (
                   <span className="text-on-surface-variant text-sm">Loading weather...</span>
                 )}
             </div>
             <div className="p-md bg-secondary-fixed/30 m-md rounded-xl">
                 <div className="flex gap-3">
                     <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
                     <div>
                         <p className="font-label-bold text-on-secondary-container mb-1">Schedule Tip</p>
                         <p className="font-body-sm text-on-secondary-container opacity-90 leading-relaxed">
                             You have a 2-hour gap at 1:00 PM. Perfect time to catch up on editing or grab a coffee!
                         </p>
                     </div>
                 </div>
             </div>
          </div>

          {/* Attention Required Card */}
          <div className="bg-surface-container-lowest p-md rounded-xl ambient-shadow">
            <div className="flex items-center gap-2 mb-md">
              <span className="material-symbols-outlined text-tertiary-container">notification_important</span>
              <h3 className="font-h3 text-h3 text-on-surface">Attention Required</h3>
            </div>
            <div className="space-y-md">
                {missingAssetsCount === 0 ? (
                  <p className="text-on-surface-variant text-sm">All caught up! No urgent tasks.</p>
                ) : (
                  <>
                    <div className="flex items-start justify-between group">
                      <div className="space-y-xs">
                        <p className="font-label-bold text-on-surface">Missing Floorplan</p>
                        <p className="font-caption text-on-surface-variant">123 Oak St • Due by EOD</p>
                      </div>
                      <button className="text-secondary font-label-bold text-body-sm hover:underline">Remind Agent</button>
                    </div>
                    <div className="h-px bg-outline-variant/30"></div>
                    <div className="flex items-start justify-between group">
                      <div className="space-y-xs">
                        <p className="font-label-bold text-on-surface">Payment Pending</p>
                        <p className="font-caption text-on-surface-variant">78 Sunset Blvd • Overdue</p>
                      </div>
                      <button className="text-secondary font-label-bold text-body-sm hover:underline">Remind Agent</button>
                    </div>
                  </>
                )}
            </div>
          </div>
          
          {/* Quick Stats (Extra) */}
          <div className="bg-primary-container p-md rounded-xl text-on-primary ambient-shadow">
            <div className="flex justify-between items-center mb-md">
              <span className="font-label-bold">Weekly Performance</span>
              <span className="material-symbols-outlined">trending_up</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold tracking-tighter">94%</span>
              <span className="font-caption mb-1">On-time delivery (+4% vs last week)</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
