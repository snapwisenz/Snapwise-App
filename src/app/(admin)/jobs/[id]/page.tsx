import Link from 'next/link';

export default function BookingDetailsPage({ params }: { params: { id: string } }) {
  // We can use params.id later to fetch real booking details
  return (
    <>
      {/* Sub-Header / Page Header */}
      <div className="bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/10 py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col">
            <nav className="flex items-center gap-2 mb-1 text-sm text-slate-500 dark:text-slate-400">
              <Link href="/jobs" className="hover:text-primary transition-colors flex items-center gap-1">
                <span className="material-icons-outlined text-sm">arrow_back</span>
                Back to Bookings
              </Link>
              <span>/</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">Booking Details</span>
            </nav>
            <h1 className="text-2xl font-bold tracking-tight">1234 Maple Drive, Beverly Hills, CA 90210</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-6 py-2.5 rounded-full border-2 border-primary text-primary font-semibold hover:bg-primary/5 transition-all">
              Reschedule
            </button>
            <button className="px-6 py-2.5 rounded-full bg-error text-white font-semibold hover:bg-opacity-90 shadow-lg shadow-error/20 transition-all">
              Cancel Booking
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Property Details */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Status & Summary Card */}
            <div className="bg-white dark:bg-slate-900/50 p-6 rounded-xl border border-success/5 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center text-success">
                  <span className="material-icons-outlined">home_work</span>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Booking Status</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-bold border border-green-200 dark:border-green-800 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      Confirmed
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Order ID</p>
                <p className="font-bold text-slate-800 dark:text-slate-200">#BK-94210-23</p>
              </div>
            </div>

            {/* Editable Details Grid */}
            <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-success/5 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h2 className="font-bold text-lg">Detailed Information</h2>
                <span className="text-xs text-slate-400">Click icon to edit fields</span>
              </div>
              <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                
                {/* Date & Time */}
                <div className="p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors flex justify-between items-center group">
                  <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-4">
                    <div className="text-slate-500 text-sm font-medium flex items-center gap-2">
                      <span className="material-icons-outlined text-success/60 text-lg">calendar_today</span>
                      Date &amp; Time
                    </div>
                    <div className="md:col-span-2 flex justify-between items-center">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">Oct 24, 2023 | 10:00 AM — 12:30 PM</p>
                      <button className="p-2 rounded-lg text-success/40 hover:text-success hover:bg-success/10 transition-all opacity-0 group-hover:opacity-100">
                        <span className="material-icons-outlined text-sm">edit</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Agent */}
                <div className="p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors flex justify-between items-center group">
                  <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-4">
                    <div className="text-slate-500 text-sm font-medium flex items-center gap-2">
                      <span className="material-icons-outlined text-success/60 text-lg">person</span>
                      Listing Agent
                    </div>
                    <div className="md:col-span-2 flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">Sarah Jenkins</p>
                        <p className="text-xs text-slate-400">Century 21 Real Estate</p>
                      </div>
                      <button className="p-2 rounded-lg text-success/40 hover:text-success hover:bg-success/10 transition-all opacity-0 group-hover:opacity-100">
                        <span className="material-icons-outlined text-sm">edit</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Photographer */}
                <div className="p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors flex justify-between items-center group">
                  <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-4">
                    <div className="text-slate-500 text-sm font-medium flex items-center gap-2">
                      <span className="material-icons-outlined text-success/60 text-lg">photo_camera</span>
                      Photographer
                    </div>
                    <div className="md:col-span-2 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMObI5aeXI2Yohy629oPwM24iUvr4MTPVB744h9Ozc_X0Bssqcudup8GDfuGPH-2IrhI-iPrzQ4fdOV_KfyDxfbQtkzSWXDjBc2M06zBqq_v624GdWmEcyFijDa8TYO9KE2e6wxj_5S3Y08alBdZVRBekMw_2xXeJRBZzCqq6emxXxzd65tRW4_neRqGXaM_GA3r-eH-jWQVAz2MgrMgg_7fNwlW-ilnm317LgDNz6gbzzqyaDd6d5d5TwG6Xl0A3h3YHloup8vls" alt="Photographer profile headshot" className="w-full h-full object-cover" />
                        </div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">Alex Rivera</p>
                      </div>
                      <button className="p-2 rounded-lg text-success/40 hover:text-success hover:bg-success/10 transition-all opacity-0 group-hover:opacity-100">
                        <span className="material-icons-outlined text-sm">edit</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Package & Price */}
                <div className="p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors flex justify-between items-center group">
                  <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-4">
                    <div className="text-slate-500 text-sm font-medium flex items-center gap-2">
                      <span className="material-icons-outlined text-success/60 text-lg">payments</span>
                      Package Price
                    </div>
                    <div className="md:col-span-2 flex justify-between items-center">
                      <div className="flex flex-col">
                        <p className="font-bold text-xl text-slate-800 dark:text-slate-200">$299.00</p>
                        <p className="text-xs text-slate-400">Premium Photo + 3D Tour</p>
                      </div>
                      <button className="p-2 rounded-lg text-success/40 hover:text-success hover:bg-success/10 transition-all opacity-0 group-hover:opacity-100">
                        <span className="material-icons-outlined text-sm">edit</span>
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Driving Times & Interactive Map */}
            <div className="space-y-4">
              {/* Driving Times Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-900/50 p-4 rounded-xl border border-success/5 shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                    <span className="material-symbols-outlined">directions_car</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">From Previous Shoot</p>
                    <p className="text-lg font-bold text-slate-800 dark:text-slate-200">15 mins</p>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-900/50 p-4 rounded-xl border border-success/5 shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                    <span className="material-symbols-outlined">near_me</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">To Next Shoot</p>
                    <p className="text-lg font-bold text-slate-800 dark:text-slate-200">22 mins</p>
                  </div>
                </div>
              </div>

              {/* Interactive Map View */}
              <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-success/5 shadow-sm overflow-hidden h-80 relative">
                {/* Placeholder for interactive map */}
                <div className="w-full h-full bg-[#e5e7eb] dark:bg-slate-800 relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnqB17I6v6t6_N2UjW3wN_v9Xm_0zQ9w6L0X0Z9M8O7L5K4J3I2H1G0F9E8D7C6B5A4" alt="Map of Beverly Hills area" className="w-full h-full object-cover opacity-80" />
                  
                  {/* Map Marker */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="relative">
                      <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center text-white shadow-xl animate-bounce">
                        <span className="material-icons-outlined">home</span>
                      </div>
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-black/20 rounded-full blur-sm"></div>
                    </div>
                  </div>
                </div>
                
                <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg text-[10px] font-bold uppercase tracking-widest text-success border border-success/20">
                  Interactive Map
                </div>
                
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                  <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-success/10 shadow-xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center text-success">
                      <span className="material-symbols-outlined text-sm">location_on</span>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-400 leading-none mb-1">Current Location</p>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Beverly Hills, CA 90210</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="w-10 h-10 bg-white/90 dark:bg-slate-900/90 rounded-lg shadow-lg flex items-center justify-center text-slate-600 hover:text-success transition-colors border border-success/10">
                      <span className="material-symbols-outlined">add</span>
                    </button>
                    <button className="w-10 h-10 bg-white/90 dark:bg-slate-900/90 rounded-lg shadow-lg flex items-center justify-center text-slate-600 hover:text-success transition-colors border border-success/10">
                      <span className="material-symbols-outlined">remove</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Quick Notes & Sidebar */}
          <div className="lg:col-span-4 space-y-6">

            {/* Requirements & Assets */}
            <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-success/5 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-icons-outlined text-success">fact_check</span>
                  <h3 className="font-bold">Requirements</h3>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {/* Agent Meeting */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center mt-0.5">
                    <input type="checkbox" className="peer w-5 h-5 appearance-none rounded border-2 border-slate-300 dark:border-slate-600 checked:bg-success checked:border-success transition-all" />
                    <span className="material-icons-outlined absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-sm opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity">check</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-success transition-colors">Agent meeting at property</p>
                    <p className="text-xs text-slate-500">Will the agent be present during the shoot?</p>
                  </div>
                </label>

                {/* Floorplan */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center mt-0.5">
                    <input type="checkbox" className="peer w-5 h-5 appearance-none rounded border-2 border-slate-300 dark:border-slate-600 checked:bg-success checked:border-success transition-all" />
                    <span className="material-icons-outlined absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-sm opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity">check</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-success transition-colors">Floorplan required</p>
                    <p className="text-xs text-slate-500">Provide floorplan to agent if package includes it</p>
                  </div>
                </label>

                {/* Highlights */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center mt-0.5">
                    <input type="checkbox" className="peer w-5 h-5 appearance-none rounded border-2 border-slate-300 dark:border-slate-600 checked:bg-success checked:border-success transition-all" />
                    <span className="material-icons-outlined absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-sm opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity">check</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-success transition-colors">Capture particular highlights</p>
                    <p className="text-xs text-slate-500">Any specific features the agent wants captured?</p>
                  </div>
                </label>
              </div>
            </div>
            
            {/* Quick Notes Staging Panel */}
            <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-success/5 shadow-sm h-full flex flex-col">
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-icons-outlined text-success">description</span>
                  <h3 className="font-bold">Quick Notes</h3>
                </div>
                <span className="flex h-2 w-2 rounded-full bg-success animate-pulse"></span>
              </div>
              <div className="p-6 flex-grow">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Staging Instructions</label>
                <textarea 
                  className="w-full h-48 bg-slate-50 dark:bg-slate-800/50 border-0 rounded-xl focus:ring-2 focus:ring-success/20 text-sm p-4 resize-none placeholder:text-slate-400" 
                  placeholder="Add staging notes here... (e.g. Hidden key location, pets on property, preferred angles)"
                  defaultValue={`1. Ensure all pool lights are turned on before twilight shoot.\n2. Hidden key under the terracotta pot to the left of the main entrance.\n3. Master bedroom curtains should remain open for canyon views.\n4. Homeowner will be present but staying in the guest suite.`}
                />
                
                <div className="mt-6 space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-success/5 border border-success/10 rounded-lg">
                    <span className="material-icons-outlined text-success text-sm mt-0.5">info</span>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Notes are synced with the photographer's mobile app in real-time.
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 dark:border-slate-800">
                <button className="w-full py-3 bg-success text-white font-bold rounded-full hover:bg-success/90 transition-colors shadow-lg">
                  Save Notes
                </button>
              </div>
            </div>

            {/* Quick Actions / Meta */}
            <div className="bg-gradient-to-br from-success/10 to-transparent p-6 rounded-xl border border-success/10">
              <h4 className="font-bold mb-4 text-sm">Activity Timeline</h4>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="relative">
                    <div className="w-2 h-2 rounded-full bg-success mt-1.5"></div>
                    <div className="absolute top-4 bottom-[-16px] left-[3.5px] w-[1px] bg-success/20"></div>
                  </div>
                  <div>
                    <p className="text-xs font-bold">Booking Confirmed</p>
                    <p className="text-[10px] text-slate-500">Oct 12, 2023 · 2:45 PM</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="relative">
                    <div className="w-2 h-2 rounded-full bg-slate-300 mt-1.5"></div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500">Booking Created</p>
                    <p className="text-[10px] text-slate-500">Oct 12, 2023 · 2:30 PM</p>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </main>
      
      {/* Floating Helper (Bottom Right) */}
      <div className="fixed bottom-8 right-8">
        <button className="w-14 h-14 bg-white dark:bg-slate-800 rounded-full shadow-2xl flex items-center justify-center text-success border border-success/20 hover:scale-110 transition-transform">
          <span className="material-icons-outlined">support_agent</span>
        </button>
      </div>
    </>
  );
}
