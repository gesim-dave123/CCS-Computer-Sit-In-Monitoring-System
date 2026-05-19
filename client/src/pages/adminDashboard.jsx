import { useEffect, useState } from "react";
import AdminNavigationBar from "../component/adminNavigationBar";
import { 
  Bell, 
  Users, 
  Monitor, 
  BarChart3, 
  Activity,
  History,
  Info
} from "lucide-react";

import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

export default function AdminDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [stats, setStats] = useState({
    registeredStudents: 0,
    currentSitIns: 0,
    totalSitIns: 0,
    announcementCount: 0,
    purposes: [],
    labUsage: [],
  });
  const [statsLoading, setStatsLoading] = useState(false);

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/adminDashboardStats.php`,
      );
      const json = await res.json();
      if (res.ok && json.stats) setStats(json.stats);
    } catch {
      // keep defaults
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const hasPurposeData = stats.purposes.length > 0;
  const hasLabData = stats.labUsage.length > 0;

  const pieData = {
    labels: hasPurposeData ? stats.purposes.map((p) => p.label) : ["No data"],
    datasets: [
      {
        data: hasPurposeData ? stats.purposes.map((p) => p.percent) : [100],
        backgroundColor: hasPurposeData
          ? stats.purposes.map((p) => p.color)
          : ["#CBD5E1"],
        borderColor: "transparent",
        borderWidth: 0,
        hoverOffset: 12,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(15,23,42,0.9)",
        padding: 12,
        cornerRadius: 12,
        titleFont: { size: 14, weight: 'bold' },
        callbacks: {
          label: (context) => {
            if (!hasPurposeData) return "No records yet";
            const entry = stats.purposes[context.dataIndex];
            return `${entry.label}: ${entry.count} (${entry.percent}%)`;
          },
        },
      },
    },
    cutout: '70%',
  };

  const barData = {
    labels: hasLabData ? stats.labUsage.map(l => l.label) : ["No data"],
    datasets: [
      {
        label: "Total Sessions",
        data: hasLabData ? stats.labUsage.map(l => l.count) : [0],
        backgroundColor: "#6b3fd0",
        borderRadius: 8,
        barThickness: 20,
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(15,23,42,0.9)",
        padding: 12,
        cornerRadius: 12,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(0,0,0,0.05)" },
        ticks: { font: { size: 10, weight: 'bold' }, color: "#64748b" }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 10, weight: 'bold' }, color: "#64748b" }
      }
    }
  };

  return (
    <main className="min-h-screen bg-[#fef7ff] dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-['Montserrat'] md:pl-64 transition-colors duration-300">
      <AdminNavigationBar />
      
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>

      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12 space-y-10">
        {/* Header Section */}
        <header className="px-2 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-4xl md:text-5xl font-bold text-[#381872] dark:text-violet-300 tracking-tight">
            Dashboard
          </h1>
        </header>

        {/* Bento Stats Row (Minimized) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Registered Students */}
          <div className="animate-fade-in-up bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:shadow-md transition-all" style={{ animationDelay: '0.2s' }}>
             <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#a67ffe]/5 rounded-full blur-xl group-hover:bg-[#a67ffe]/10 transition-colors"></div>
             <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center text-[#381872] dark:text-violet-300 mb-3 group-hover:scale-110 transition-transform">
                   <Users size={20} />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Registered Students</p>
                <h2 className="text-2xl font-bold text-[#381872] dark:text-white">
                  {statsLoading ? "..." : stats.registeredStudents}
                </h2>
                <div className="mt-2 flex items-center gap-1.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-tight">
                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                   Live Database
                </div>
             </div>
          </div>

          {/* Card 2: Current Sit-Ins */}
          <div className="animate-fade-in-up bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:shadow-md transition-all" style={{ animationDelay: '0.3s' }}>
             <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#f4be5d]/5 rounded-full blur-xl"></div>
             <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-[#f4be5d]/20 flex items-center justify-center text-[#5f4100] dark:text-[#f4be5d] mb-3 group-hover:scale-110 transition-transform">
                   <Monitor size={20} />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">In Session Now</p>
                <h2 className="text-2xl font-bold text-[#381872] dark:text-white">
                  {statsLoading ? "..." : stats.currentSitIns}
                </h2>
                <div className="mt-2 flex items-center gap-1.5 text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tight">
                   <Activity size={10} />
                   Active Computers
                </div>
             </div>
          </div>

          {/* Card 3: Lifetime Records */}
          <div className="animate-fade-in-up bg-[#381872] dark:bg-violet-950 rounded-2xl p-4 text-white relative overflow-hidden group hover:shadow-lg transition-all" style={{ animationDelay: '0.4s' }}>
             <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
             <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-[#f4be5d] mb-3 group-hover:scale-110 transition-transform">
                   <History size={20} />
                </div>
                <p className="text-[10px] font-bold text-violet-300 uppercase tracking-widest mb-0.5">Total Sit-Ins</p>
                <h2 className="text-2xl font-bold tracking-tight">
                  {statsLoading ? "..." : stats.totalSitIns}
                </h2>
                <div className="mt-2 text-[9px] font-bold text-violet-200 uppercase tracking-widest flex items-center gap-1.5">
                   <BarChart3 size={10} /> System Lifetime
                </div>
             </div>
          </div>

          {/* Card 4: Announcements */}
          <div className="animate-fade-in-up bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:shadow-md transition-all" style={{ animationDelay: '0.5s' }}>
             <div className="absolute -top-10 -right-10 w-24 h-24 bg-violet-500/5 rounded-full blur-xl"></div>
             <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center text-[#381872] dark:text-violet-300 mb-3 group-hover:scale-110 transition-transform">
                   <Bell size={20} />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Updates Posted</p>
                <h2 className="text-2xl font-bold text-[#381872] dark:text-white">
                  {statsLoading ? "..." : stats.announcementCount}
                </h2>
                <div className="mt-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                   <Info size={10} /> Official News
                </div>
             </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          {/* Purpose Distribution */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full transition-colors">
            <div className="px-6 py-4 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
              <h2 className="text-xs font-black uppercase tracking-widest text-[#381872] dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-500"></span>
                Purpose Distribution
              </h2>
            </div>
            
            <div className="p-6 flex flex-col items-center gap-8 flex-1">
              <div className="h-56 w-full relative">
                <Pie data={pieData} options={pieOptions} />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                   <p className="text-xl font-black text-[#381872] dark:text-white">
                      {stats.purposes.reduce((acc, curr) => acc + curr.count, 0)}
                   </p>
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {hasPurposeData ? (
                  stats.purposes.slice(0, 4).map((purpose) => (
                    <div key={purpose.label} className="flex items-center justify-between rounded-2xl bg-slate-50 dark:bg-slate-950 p-3 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: purpose.color }} />
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase truncate">{purpose.label}</span>
                      </div>
                      <span className="text-xs font-black text-[#381872] dark:text-white">{purpose.count}</span>
                    </div>
                  ))
                ) : null}
              </div>
            </div>
          </div>

          {/* Lab Usage Chart */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full transition-colors">
            <div className="px-6 py-4 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
              <h2 className="text-xs font-black uppercase tracking-widest text-[#381872] dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Lab Occupancy Stats
              </h2>
            </div>
            
            <div className="p-6 flex-1">
              {hasLabData ? (
                <div className="h-[300px] w-full">
                  <Bar data={barData} options={barOptions} />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
                   <Monitor size={32} className="mb-3 opacity-20" />
                   <p className="text-xs font-bold uppercase tracking-widest">No lab data yet</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
