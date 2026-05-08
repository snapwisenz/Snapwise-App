'use client';

export default function InsightsPage() {
  return (
    <main className="p-8 max-w-[1400px] mx-auto space-y-8">
      {/* Page Header */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white heading-font">Reports &amp; Insights</h1>
          <p className="text-slate-500 mt-2">Analyze your performance and operational efficiency.</p>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-bold text-slate-700 dark:text-slate-300">
          <span className="material-icons text-primary">calendar_month</span>
          <span>This Week: Oct 19 - Oct 25</span>
          <span className="material-icons text-slate-400">expand_more</span>
        </div>
      </section>

      {/* KPI Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Booked */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <span className="material-icons text-secondary">bookmark</span>
            </div>
            <span className="text-success font-bold flex items-center gap-1 text-sm">
              <span className="material-icons text-sm">trending_up</span>
              +12%
            </span>
          </div>
          <h3 className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Total Booked</h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">184</p>
          <p className="text-slate-400 text-xs mt-1 font-medium">vs last week</p>
        </div>

        {/* Completed */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <span className="material-icons text-primary">check_circle</span>
            </div>
            <span className="text-success font-bold flex items-center gap-1 text-sm">
              <span className="material-icons text-sm">trending_up</span>
              +5%
            </span>
          </div>
          <h3 className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Completed</h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">156</p>
          <p className="text-slate-400 text-xs mt-1 font-medium">vs last week</p>
        </div>

        {/* Pending/Scheduled */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-warning/10 rounded-lg">
              <span className="material-icons text-warning">schedule</span>
            </div>
          </div>
          <h3 className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Pending / Scheduled</h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">22</p>
          <p className="text-slate-400 text-xs mt-1 font-medium">Active upcoming jobs</p>
        </div>

        {/* Cancelled */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <span className="material-icons text-slate-500">cancel</span>
            </div>
            <span className="text-error font-bold flex items-center gap-1 text-sm">
              <span className="material-icons text-sm">trending_down</span>
              -2%
            </span>
          </div>
          <h3 className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Cancelled</h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">6</p>
          <p className="text-slate-400 text-xs mt-1 font-medium">vs last week</p>
        </div>
      </section>

      {/* Activity & Insights Row */}
      <section className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <h2 className="text-[22px] font-bold heading-font text-slate-900 dark:text-white">Recent Activity</h2>
            <button className="text-primary font-bold text-sm hover:underline">View All</button>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50">
                  <th className="px-6 py-4 font-bold text-xs text-slate-500 uppercase tracking-widest">Address</th>
                  <th className="px-6 py-4 font-bold text-xs text-slate-500 uppercase tracking-widest">Client Name</th>
                  <th className="px-6 py-4 font-bold text-xs text-slate-500 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 font-bold text-xs text-slate-500 uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {[
                  { address: '742 Evergreen Terrace', city: 'Springfield, IL', name: 'Homer Simpson', date: 'Oct 24, 2023', status: 'COMPLETED', statusColor: 'bg-primary/10 text-primary' },
                  { address: '123 Sesame Street', city: 'Manhattan, NY', name: 'Oscar Grouch', date: 'Oct 23, 2023', status: 'SCHEDULED', statusColor: 'bg-warning/10 text-warning' },
                  { address: '221B Baker Street', city: 'London, UK', name: 'Sherlock Holmes', date: 'Oct 23, 2023', status: 'COMPLETED', statusColor: 'bg-primary/10 text-primary' },
                  { address: '4 Privet Drive', city: 'Surrey, UK', name: 'Harry Potter', date: 'Oct 22, 2023', status: 'CANCELLED', statusColor: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
                  { address: '1600 Pennsylvania Ave', city: 'Washington, DC', name: 'Joe B.', date: 'Oct 21, 2023', status: 'COMPLETED', statusColor: 'bg-primary/10 text-primary' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900 dark:text-white block">{row.address}</span>
                      <span className="text-xs text-slate-500">{row.city}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{row.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{row.date}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${row.statusColor}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Efficiency Insights */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-[22px] font-bold heading-font text-slate-900 dark:text-white mb-6">Efficiency Insights</h2>
            
            {/* Mini Chart Placeholder */}
            <div className="relative w-48 h-48 mx-auto mb-8 flex items-center justify-center">
              {/* SVG Donut Chart Placeholder */}
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle className="stroke-slate-100 dark:stroke-slate-800" cx="18" cy="18" fill="none" r="16" strokeWidth="3"></circle>
                <circle className="stroke-secondary" cx="18" cy="18" fill="none" r="16" strokeDasharray="78, 100" strokeWidth="3"></circle>
                <circle className="stroke-primary" cx="18" cy="18" fill="none" r="16" strokeDasharray="45, 100" strokeDashoffset="-78" strokeWidth="3"></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-slate-900 dark:text-white heading-font">78%</span>
                <span className="text-xs font-medium text-slate-500">Efficiency</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="material-icons text-secondary">route</span>
                  <div>
                    <p className="font-bold text-sm text-slate-900 dark:text-white">Avg. Distance</p>
                    <p className="text-xs text-slate-500">Travel per job</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-secondary">15 km</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="material-icons text-primary">payments</span>
                  <div>
                    <p className="font-bold text-sm text-slate-900 dark:text-white">Billable Ratio</p>
                    <p className="text-xs text-slate-500">Profit margins</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-primary">78%</span>
              </div>
            </div>

            <div className="mt-6 p-4 border border-primary/20 bg-primary/5 rounded-xl">
              <div className="flex gap-3">
                <span className="material-icons text-primary mt-0.5">lightbulb</span>
                <div>
                  <p className="font-bold text-sm text-primary">Insight</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">You've saved 2 hours in travel time this week by optimizing your route cluster in the downtown area.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Small Callout Card */}
          <div className="bg-primary text-white p-6 rounded-[24px] shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="text-xl font-bold mb-2">Optimization Tip</h4>
              <p className="text-sm opacity-90 mb-6">Schedule clients in the "North Sector" on Tuesdays to reduce fuel costs by up to 14%.</p>
              <button className="bg-white text-primary px-4 py-2 rounded-lg font-bold text-sm hover:bg-opacity-90 transition-all">Enable Auto-Cluster</button>
            </div>
            {/* Background Accent */}
            <span className="material-icons absolute -bottom-4 -right-4 text-[120px] opacity-10 rotate-12">rocket_launch</span>
          </div>
        </div>
      </section>
    </main>
  );
}
