'use client';

import Link from 'next/link';

export default function DashboardPage() {
  return (
    <main className="p-8">
      {/* Dashboard Header & Action */}
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white heading-font">Dashboard</h1>
          <p className="text-slate-500 mt-2">Welcome back, Jordan. Here is your schedule for the day.</p>
        </div>
        <Link 
          href="/bookings/new"
          className="bg-primary hover:opacity-90 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          <span className="material-icons">add_circle</span>
          New Booking
        </Link>
      </div>

      {/* Current Bookings Grid */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-[22px] font-bold heading-font text-slate-900 dark:text-white">Upcoming Bookings</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {/* Property Card 1 */}
          <div className="bg-white dark:bg-slate-900 rounded-[24px] overflow-hidden shadow-sm hover:shadow-md transition-shadow group border border-slate-200 dark:border-slate-800 flex flex-col h-full">
            <div className="h-[200px] overflow-hidden relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBu_BjaH45g4B2eBfrH31TyWJMIz-vg0OYIJDRIrafiL6tlVi6lFuMfycHu7UwOxihGiJwPre2w_PJWM8Q_ndiJd8ACpodvCIRK0RSlxrd-s8TxCBcLSNeBc2hRQrGMXBh2rUZyjjnfxL6DyeUWmBIn-uAKhlcvY5HqWrAzWmhO3VNDWyMsj78CzkAgFNXlqi41gkKusbHCTyWRzA3GDmeGoMYiBrcOW_PHqo5eRMuDbrzTF4jlWqGKBeha-mTzDajqG_XXetWN5sQ" alt="Luxury home exterior" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-4 right-4">
                <span className="px-4 py-1.5 bg-success/90 text-white text-xs font-bold rounded-full backdrop-blur-sm">CONFIRMED</span>
              </div>
            </div>
            <div className="p-6 space-y-4 flex flex-col flex-grow">
              <div>
                <h3 className="text-xl font-bold heading-font mb-1 truncate text-slate-900 dark:text-white">742 Evergreen Terrace</h3>
                <p className="text-sm text-slate-500 flex items-center">
                  <span className="material-icons text-sm mr-1">location_on</span>
                  Springfield, IL 62704
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-200/50 dark:border-slate-800">
                <div className="space-y-1 flex flex-col h-full">
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Date &amp; Time</p>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Oct 24 • 10:00 AM</p>
                </div>
                <div className="space-y-1 flex flex-col h-full">
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Agent</p>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Sarah Jenkins</p>
                </div>
                <div className="space-y-1 flex flex-col h-full">
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Photographer</p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] text-primary font-bold">AR</div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Alex Rivers</p>
                  </div>
                </div>
                <div className="space-y-1 flex flex-col h-full">
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Package</p>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Premium HDR</p>
                </div>
              </div>
              <div className="flex-grow"></div>
              <Link href="/bookings/1" className="w-full py-3 bg-neutral-soft dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-sm hover:bg-primary hover:text-white transition-colors text-center block">View Booking</Link>
            </div>
          </div>

          {/* Property Card 2 */}
          <div className="bg-white dark:bg-slate-900 rounded-[24px] overflow-hidden shadow-sm hover:shadow-md transition-shadow group border border-slate-200 dark:border-slate-800 flex flex-col h-full">
            <div className="h-[200px] overflow-hidden relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwLcgZ-o8t-76nwNGWk_ZbioJZKVRYnm6s_OAsHMonuAphEF95fYZ5UsOfYUBBKZ-C36HyW7ykLLWlPqZREFKJDlurx4a1lgLV3PTepMHVC_hcceWo4yh6-GjeOlXNETj4BZWuqwAVZnsVf3aEjTCySZP7AgCeID8hoQdO1aGS4Tp5Gmke_AbTtiDCTh_PNcDecCMbYw47zeU8k3_Zei5IcWpzii8FP7aBGaK0T15Vi6uz_NezWskoD2WRqneh7UWEyOYZHRItuHo" alt="Modern interior living room" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-4 right-4">
                <span className="px-4 py-1.5 bg-warning text-white text-xs font-bold rounded-full backdrop-blur-sm">PENDING</span>
              </div>
            </div>
            <div className="p-6 space-y-4 flex flex-col flex-grow">
              <div>
                <h3 className="text-xl font-bold heading-font mb-1 truncate text-slate-900 dark:text-white">124 Conch Street</h3>
                <p className="text-sm text-slate-500 flex items-center">
                  <span className="material-icons text-sm mr-1">location_on</span>
                  Pacific Ocean, BI 00000
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-200/50 dark:border-slate-800">
                <div className="space-y-1 flex flex-col h-full">
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Date &amp; Time</p>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Oct 25 • 02:30 PM</p>
                </div>
                <div className="space-y-1 flex flex-col h-full">
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Agent</p>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Michael Scott</p>
                </div>
                <div className="space-y-1 flex flex-col h-full">
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Photographer</p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] text-primary font-bold">DW</div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Dave White</p>
                  </div>
                </div>
                <div className="space-y-1 flex flex-col h-full">
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Package</p>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Standard + Drone</p>
                </div>
              </div>
              <div className="flex-grow"></div>
              <Link href="/bookings/2" className="w-full py-3 bg-neutral-soft dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-sm hover:bg-primary hover:text-white transition-colors text-center block">View Booking</Link>
            </div>
          </div>

          {/* Property Card 3 */}
          <div className="bg-white dark:bg-slate-900 rounded-[24px] overflow-hidden shadow-sm hover:shadow-md transition-shadow group border border-slate-200 dark:border-slate-800 flex flex-col h-full">
            <div className="h-[200px] overflow-hidden relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5ga-vrwEaJsMAC1PTbZMDlBSmDIoEbaYwTOU8F21Puf1cr-orZbmox2XwZa_KcvVp5lHH68ODxuGNa6lY0jV5qmMrIQF1KaikrB21m5P9grfvYfH7k_K9dGStOvWSYzsv1VJ1cSiURcMWi1tcEyms3HNnUtRWuox2I_PrvsANfP2Uwp9UuHxBBncXwu10YiA-e8_Xp8yPh-mZUa7sPaVcZtDE53QltdNIGaX8kGobQ5pkFBWgCjkkKPenDaFQwtRj6fsjUOg9KCo" alt="Penthouse apartment view" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-4 right-4">
                <span className="px-4 py-1.5 bg-success/90 text-white text-xs font-bold rounded-full backdrop-blur-sm">CONFIRMED</span>
              </div>
            </div>
            <div className="p-6 space-y-4 flex flex-col flex-grow">
              <div>
                <h3 className="text-xl font-bold heading-font mb-1 truncate text-slate-900 dark:text-white">42 Wallaby Way</h3>
                <p className="text-sm text-slate-500 flex items-center">
                  <span className="material-icons text-sm mr-1">location_on</span>
                  Sydney, NSW 2000
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-200/50 dark:border-slate-800">
                <div className="space-y-1 flex flex-col h-full">
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Date &amp; Time</p>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Oct 26 • 09:00 AM</p>
                </div>
                <div className="space-y-1 flex flex-col h-full">
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Agent</p>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Elena Fisher</p>
                </div>
                <div className="space-y-1 flex flex-col h-full">
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Photographer</p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] text-primary font-bold">NM</div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Nathan Moon</p>
                  </div>
                </div>
                <div className="space-y-1 flex flex-col h-full">
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Package</p>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Virtual Tour 3D</p>
                </div>
              </div>
              <div className="flex-grow"></div>
              <Link href="/bookings/3" className="w-full py-3 bg-neutral-soft dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-sm hover:bg-primary hover:text-white transition-colors text-center block">View Booking</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
