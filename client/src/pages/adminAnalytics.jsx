import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import AdminNavigationBar from "../component/adminNavigationBar";
import ReportWizard from "../component/modals/ReportWizard";
import {
  TrendingUp, Clock, BarChart3, Star, Calendar,
  CheckCircle2, FlaskConical, Trophy, RefreshCw, ChevronDown,
  Search, Filter, History, ChevronLeft, ChevronRight, Download, FileBarChart2, X, Bell
} from "lucide-react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale,
  BarElement, LineElement, PointElement, Filler
);

const API = import.meta.env.VITE_API_BASE_URL;

const RANGE_OPTIONS = [
  { label: "7 Days",    value: 7  },
  { label: "30 Days",   value: 30 },
  { label: "90 Days",   value: 90 },
  { label: "1 Year",    value: 365 },
];

const PURPLE_PALETTE = [
  "#6d28d9","#7c3aed","#8b5cf6","#a78bfa",
  "#c4b5fd","#ddd6fe","#4c1d95","#5b21b6",
];

const DOW_LABELS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const HOUR_LABELS = Array.from({ length: 24 }, (_, i) =>
  i === 0 ? "12am" : i < 12 ? `${i}am` : i === 12 ? "12pm" : `${i - 12}pm`
);

function KpiCard({ icon: Icon, label, value, sub, color = "violet" }) {
  const colors = {
    violet: "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300",
    amber:  "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300",
    emerald:"bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300",
    rose:   "bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300",
    blue:   "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300",
    fuchsia:"bg-fuchsia-50 dark:bg-fuchsia-900/20 text-fuchsia-700 dark:text-fuchsia-300",
  };
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-all group">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]} group-hover:scale-110 transition-transform`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-bold text-[#381872] dark:text-white mt-0.5">{value}</p>
        {sub && <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{sub}</p>}
      </div>
    </div>
  );
}

function ChartCard({ title, icon: Icon, children, className = "" }) {
  return (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden ${className}`}>
      <div className="px-5 py-4 border-b border-slate-50 dark:border-slate-800 flex items-center gap-2 bg-slate-50/40 dark:bg-slate-800/20">
        <Icon size={15} className="text-violet-500" />
        <h2 className="text-xs font-bold text-[#381872] dark:text-white uppercase tracking-wider">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ── Podium config: visual order left→right is rank 4,2,1,3,5 ─────────────────
const PODIUM_ORDER  = [3, 1, 0, 2, 4]; // index into top-5 array
const PODIUM_HEIGHTS = [110, 150, 200, 130, 90]; // px, center tallest
const PODIUM_COLORS = [
  { bar:"#a78bfa", glow:"rgba(167,139,250,0.35)", text:"#6d28d9" }, // 4th
  { bar:"#c0c0c0", glow:"rgba(192,192,192,0.4)",  text:"#64748b" }, // 2nd
  { bar:"#f59e0b", glow:"rgba(245,158,11,0.45)",  text:"#92400e" }, // 1st
  { bar:"#f97316", glow:"rgba(249,115,22,0.35)",  text:"#9a3412" }, // 3rd
  { bar:"#8b5cf6", glow:"rgba(139,92,246,0.3)",   text:"#5b21b6" }, // 5th
];
const RANK_MEDALS = ["🥇","🥈","🥉","4th","5th"];

function PodiumStairs({ students, loading }) {
  const [animated, setAnimated] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!students.length) return;
    const timer = setTimeout(() => setAnimated(true), 80);
    return () => clearTimeout(timer);
  }, [students]);

  const top5 = students.slice(0, 5);
  if (!loading && top5.length === 0) {
    return <p className="text-xs text-slate-400 text-center py-10">No leaderboard data yet.</p>;
  }

  return (
    <div ref={ref} className="relative">
      <style>{`
        @keyframes riseUp {
          from { transform: scaleY(0); opacity: 0; }
          to   { transform: scaleY(1); opacity: 1; }
        }
        @keyframes floatBob {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-6px); }
        }
        @keyframes crownPulse {
          0%,100% { transform: scale(1) rotate(-5deg); filter: drop-shadow(0 0 4px #f59e0b); }
          50%      { transform: scale(1.2) rotate(5deg); filter: drop-shadow(0 0 10px #f59e0b); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .podium-bar {
          transform-origin: bottom;
          transition: box-shadow 0.3s ease;
        }
        .podium-bar:hover {
          filter: brightness(1.1);
        }
        .podium-avatar {
          animation: floatBob 3s ease-in-out infinite;
        }
        .podium-avatar-1st {
          animation: floatBob 2.8s ease-in-out infinite;
        }
        .crown-anim {
          animation: crownPulse 2s ease-in-out infinite;
          display: inline-block;
        }
        .shimmer-text {
          background: linear-gradient(90deg, #6d28d9 0%, #a78bfa 40%, #ede9fe 60%, #6d28d9 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
      `}</style>

      {/* Podium stage */}
      <div className="flex items-end justify-center gap-3 pt-12 pb-0 min-h-[300px]">
        {PODIUM_ORDER.map((rankIdx, colIdx) => {
          const student = top5[rankIdx];
          if (!student) return <div key={colIdx} style={{ width: 88 }} />;
          const height = PODIUM_HEIGHTS[colIdx];
          const color  = PODIUM_COLORS[colIdx];
          const medal  = RANK_MEDALS[rankIdx];
          const isFirst = rankIdx === 0;
          const hours  = parseFloat(student.total_hours).toFixed(1);
          const initial = (student.full_name || student.id_number || "?")[0].toUpperCase();

          return (
            <div key={rankIdx} className="flex flex-col items-center" style={{ width: 88 }}>
              {/* Floating avatar */}
              <div className={`relative mb-2 ${isFirst ? "podium-avatar-1st" : "podium-avatar"}`}
                style={{ animationDelay: `${colIdx * 0.2}s` }}>
                {/* Crown for 1st */}
                {isFirst && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-2xl crown-anim select-none">👑</div>
                )}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-lg shadow-lg border-2 border-white dark:border-slate-900"
                  style={{
                    backgroundColor: color.bar,
                    boxShadow: `0 0 16px ${color.glow}`,
                  }}
                >
                  {initial}
                </div>
                {/* Medal badge */}
                <div className="absolute -bottom-1.5 -right-1.5 text-sm leading-none select-none">
                  {["🥇","🥈","🥉"].includes(medal) ? medal : (
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300">
                      {medal}
                    </span>
                  )}
                </div>
              </div>

              {/* Name */}
              <p className={`text-[10px] font-black text-center mb-1 leading-tight max-w-[80px] truncate ${
                isFirst ? "shimmer-text" : "text-slate-700 dark:text-slate-300"
              }`}>
                {student.full_name?.split(" ")[0] || student.id_number}
              </p>

              {/* Hours badge */}
              <div
                className="text-[10px] font-black px-2 py-0.5 rounded-full mb-2 text-white"
                style={{ backgroundColor: color.bar, boxShadow: `0 2px 8px ${color.glow}` }}
              >
                {hours}h
              </div>

              {/* The stair bar */}
              <div
                className="podium-bar w-full rounded-t-xl relative overflow-hidden cursor-pointer"
                style={{
                  height: animated ? height : 0,
                  backgroundColor: color.bar,
                  boxShadow: `0 -4px 20px ${color.glow}`,
                  animation: animated ? `riseUp 0.7s cubic-bezier(0.34,1.56,0.64,1) ${colIdx * 0.12}s both` : "none",
                  transformOrigin: "bottom",
                }}
              >
                {/* Shimmer sheen on bar */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    background: "linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.6) 50%, transparent 60%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 2.5s linear infinite",
                    animationDelay: `${colIdx * 0.3}s`,
                  }}
                />
                {/* Rank number inside bar */}
                <p className="absolute bottom-3 left-0 right-0 text-center text-white/70 font-black text-xs">
                  #{rankIdx + 1}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stage base */}
      <div className="h-3 rounded-b-xl mx-0 bg-gradient-to-r from-violet-200 via-violet-300 to-violet-200 dark:from-violet-900/40 dark:via-violet-800/50 dark:to-violet-900/40" />

      {/* Bottom legend */}
      <div className="mt-6 grid grid-cols-5 gap-2">
        {PODIUM_ORDER.map((rankIdx, colIdx) => {
          const student = top5[rankIdx];
          if (!student) return <div key={colIdx} />;
          return (
            <div key={rankIdx} className="text-center">
              <p className="text-[9px] text-slate-400 font-bold truncate">{student.id_number}</p>
              <p className="text-[9px] text-slate-500 dark:text-slate-400">{student.course ?? ""}</p>
              <p className="text-[9px] font-black" style={{ color: PODIUM_COLORS[colIdx].bar }}>
                {student.session_count} sess.
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState(30);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  // --- Reports State ---
  const [records, setRecords]   = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [filterLabs, setFilterLabs]         = useState([]);
  const [filterPurposes, setFilterPurposes] = useState([]);

  const [studentSearch, setStudentSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate]     = useState("");
  const [lab, setLab]             = useState("all");
  const [purpose, setPurpose]     = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 15;

  const buildParams = useCallback(() => {
    const p = new URLSearchParams();
    if (startDate) p.set("start", startDate);
    if (endDate)   p.set("end",   endDate);
    if (lab     && lab     !== "all") p.set("lab",     lab);
    if (purpose && purpose !== "all") p.set("purpose", purpose);
    if (studentSearch.trim()) p.set("student", studentSearch.trim());
    return p;
  }, [startDate, endDate, lab, purpose, studentSearch]);

  const fetchRecords = useCallback(async () => {
    setLoadingRecords(true);
    try {
      const res  = await fetch(`${API}/reports.php?${buildParams()}`);
      const json = await res.json();
      if (res.ok) {
        setRecords(json.records || []);
        setTotalRecords(json.total || 0);
        if (json.filters) {
          setFilterLabs(json.filters.labs || []);
          setFilterPurposes(json.filters.purposes || []);
        }
      }
    } catch {} finally { setLoadingRecords(false); }
  }, [buildParams]);

  useEffect(() => { fetchRecords(); }, []); // Run once on mount

  const hasFilters = startDate || endDate || lab !== "all" || purpose !== "all" || studentSearch;
  const clearFilters = () => { setStartDate(""); setEndDate(""); setLab("all"); setPurpose("all"); setStudentSearch(""); };

  const totalPages = Math.ceil(records.length / perPage);
  const paginated  = useMemo(() => records.slice((page-1)*perPage, page*perPage), [records, page]);

  const statusBadge = (s) => ({
    in_session: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    ended:      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  }[s] || "bg-slate-100 text-slate-600");
  // ---------------------

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/analyticsInsights.php?section=all&range=${range}`);
      const json = await res.json();
      if (res.ok) setData(json);
    } catch { /* keep stale data */ }
    finally { setLoading(false); }
  }, [range]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ─── Derived chart datasets ───────────────────────────────────────────────

  const trendLabels = (data?.trends ?? []).map(r => {
    const d = new Date(r.day);
    return d.toLocaleDateString("en-US", { month:"short", day:"numeric" });
  });
  const trendValues = (data?.trends ?? []).map(r => parseInt(r.total));

  const trendChartData = {
    labels: trendLabels,
    datasets: [{
      label: "Sessions",
      data: trendValues,
      borderColor: "#7c3aed",
      backgroundColor: "rgba(124,58,237,0.08)",
      tension: 0.45,
      fill: true,
      pointRadius: trendValues.length > 60 ? 0 : 3,
      pointHoverRadius: 5,
      pointBackgroundColor: "#7c3aed",
      borderWidth: 2,
    }],
  };

  const trendOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor:"rgba(15,23,42,0.9)", padding:10, cornerRadius:10 } },
    scales: {
      x: { grid: { display: false }, ticks: { font:{ size:10 }, maxTicksLimit: 10, color:"#94a3b8" } },
      y: { beginAtZero: true, grid: { color:"rgba(148,163,184,0.08)" }, ticks: { font:{ size:10 }, color:"#94a3b8" } },
    },
  };

  // Lab utilization bar
  const labs = data?.labs ?? [];
  const labBarData = {
    labels: labs.map(l => l.lab),
    datasets: [
      {
        label: "Sessions",
        data: labs.map(l => l.totalSessions),
        backgroundColor: "#7c3aed",
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: "Hours",
        data: labs.map(l => l.totalHours),
        backgroundColor: "#a78bfa",
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const barOptions = {
    responsive: true, maintainAspectRatio: false, indexAxis: "y",
    plugins: { legend: { position:"top", labels:{ font:{ size:10 }, boxWidth:12 } }, tooltip: { backgroundColor:"rgba(15,23,42,0.9)", padding:10, cornerRadius:10 } },
    scales: {
      x: { beginAtZero: true, grid: { color:"rgba(148,163,184,0.08)" }, ticks:{ font:{size:10}, color:"#94a3b8" } },
      y: { grid: { display: false }, ticks:{ font:{size:11, weight:"bold"}, color:"#94a3b8" } },
    },
  };

  // Purpose donut
  const purposes = data?.purposes ?? [];
  const purposeDonutData = {
    labels: purposes.map(p => p.label),
    datasets: [{
      data: purposes.map(p => p.count),
      backgroundColor: purposes.map((_, i) => PURPLE_PALETTE[i % PURPLE_PALETTE.length]),
      borderColor: "transparent",
      borderWidth: 0,
      hoverOffset: 10,
    }],
  };
  const donutOptions = {
    responsive: true, maintainAspectRatio: false, cutout: "65%",
    plugins: { legend: { display: false }, tooltip: { backgroundColor:"rgba(15,23,42,0.9)", padding:10, cornerRadius:10 } },
  };

  // Reservation funnel
  const statusOrder = ["pending","approved","completed","rejected","cancelled"];
  const statusColors = { pending:"#f59e0b", approved:"#7c3aed", completed:"#10b981", rejected:"#f43f5e", cancelled:"#94a3b8" };
  const resByStatus = Object.fromEntries((data?.reservationsByStatus ?? []).map(r => [r.status, parseInt(r.total)]));

  // Rating bars
  const ratings = Array.from({ length: 5 }, (_, i) => {
    const star = 5 - i;
    const row = (data?.ratings ?? []).find(r => parseInt(r.rating) === star);
    return { star, count: row ? parseInt(row.count) : 0 };
  });
  const maxRating = Math.max(...ratings.map(r => r.count), 1);

  // Heatmap grid: dow 1-7 (Sun=1), hour 0-23
  const heatmapMap = {};
  (data?.heatmap ?? []).forEach(r => {
    heatmapMap[`${r.dow}-${r.hour}`] = parseInt(r.total);
  });
  const heatMax = Math.max(...Object.values(heatmapMap), 1);

  // Student course breakdown bar
  const courseMap = {};
  (data?.studentBreakdown ?? []).forEach(r => {
    if (!courseMap[r.course]) courseMap[r.course] = {};
    courseMap[r.course][r.year_level] = parseInt(r.total);
  });
  const courses = Object.keys(courseMap);
  const yearLevels = [...new Set((data?.studentBreakdown ?? []).map(r => r.year_level))].sort();
  const yearColors = ["#6d28d9","#a78bfa","#c4b5fd","#ddd6fe"];
  const courseBarData = {
    labels: courses,
    datasets: yearLevels.map((yr, i) => ({
      label: yr,
      data: courses.map(c => courseMap[c][yr] ?? 0),
      backgroundColor: yearColors[i % yearColors.length],
      borderRadius: 4,
      borderSkipped: false,
    })),
  };
  const courseBarOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position:"top", labels:{ font:{size:10}, boxWidth:12 } }, tooltip:{ backgroundColor:"rgba(15,23,42,0.9)", padding:10, cornerRadius:10 } },
    scales: {
      x: { stacked: true, grid:{ display:false }, ticks:{ font:{size:10}, color:"#94a3b8" } },
      y: { stacked: true, beginAtZero: true, grid:{ color:"rgba(148,163,184,0.08)" }, ticks:{ font:{size:10}, color:"#94a3b8" } },
    },
  };

  const kpis = data?.kpis ?? {};
  const leaderboard = data?.leaderboard ?? [];

  return (
    <main className="min-h-screen bg-[#fef7ff] dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-['Montserrat'] md:pl-64 transition-colors duration-300">
      <AdminNavigationBar />
      <ReportWizard open={showWizard} onClose={() => setShowWizard(false)} />

      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 space-y-8">

        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 px-2 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#381872] dark:text-violet-300 tracking-tight">Reports & Analytics.</h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 mt-2 font-medium">Data-driven insights and formatted exports for all sit-in activities.</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowWizard(true)}
              className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#381872] to-[#6c44c1] text-white font-black text-sm uppercase tracking-widest hover:shadow-lg hover:shadow-violet-500/20 transition-all active:scale-95 shadow-md"
            >
              <FileBarChart2 size={18} />
              Generate Report
            </button>
            <div className="h-10 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />
            {/* Range Selector */}
            <div className="relative">
              <select
                value={range}
                onChange={e => setRange(Number(e.target.value))}
                className="appearance-none pl-4 pr-9 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-black uppercase tracking-widest text-[#381872] dark:text-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-400 shadow-sm cursor-pointer"
              >
                {RANGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            <button
              onClick={fetchAll}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#381872] text-white text-xs font-black uppercase tracking-widest hover:bg-[#220055] transition-all shadow-md active:scale-95 disabled:opacity-60"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </header>

        {/* KPI Cards */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <KpiCard icon={BarChart3}    label="Total Sessions"  value={loading ? "—" : (kpis.totalSessions ?? 0).toLocaleString()} sub="All time"              color="violet"  />
          <KpiCard icon={Clock}        label="Total Hours"     value={loading ? "—" : `${(kpis.totalHours ?? 0).toLocaleString()}h`} sub="Completed sessions"  color="blue"    />
          <KpiCard icon={TrendingUp}   label="Avg Duration"    value={loading ? "—" : `${kpis.avgDuration ?? 0}m`}                  sub="Per session"         color="emerald" />
          <KpiCard icon={FlaskConical} label="Top Lab"         value={loading ? "—" : (kpis.mostUsedLab ?? "—")}                   sub="Most sessions"       color="fuchsia" />
          <KpiCard icon={Bell}         label="Announcements"   value={loading ? "—" : (kpis.totalAnnouncements ?? 0).toLocaleString()} sub="System updates"   color="amber"   />
          <KpiCard icon={Star}         label="Avg Rating"      value={loading ? "—" : `${kpis.avgRating ?? 0} / 5`}                sub="Student feedback"    color="rose"    />
        </section>

        {/* Row 1: Trend line + Heatmap */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <ChartCard title="Daily Sit-In Sessions" icon={TrendingUp} className="lg:col-span-2">
            {trendValues.length === 0 && !loading
              ? <p className="text-xs text-slate-400 text-center py-10">No session data in this range.</p>
              : <div className="h-56"><Line data={trendChartData} options={trendOptions} /></div>
            }
          </ChartCard>

          {/* Heatmap */}
          <ChartCard title="Activity Heatmap (Hour × Day)" icon={Calendar}>
            <div className="overflow-x-auto">
              {/* Hour axis */}
              <div className="flex gap-[3px] ml-8 mb-1">
                {[0,4,8,12,16,20,23].map(h => (
                  <div key={h} className="text-[8px] text-slate-400 font-bold" style={{ width: `${(h === 23 ? 1 : h === 0 ? 4 : 4) * 14}px`, minWidth:0 }}>
                    {HOUR_LABELS[h]}
                  </div>
                ))}
              </div>
              {/* Grid: 7 rows (dow 1-7 = Sun-Sat) × 24 cols */}
              {[1,2,3,4,5,6,7].map(dow => (
                <div key={dow} className="flex items-center gap-[3px] mb-[3px]">
                  <span className="text-[9px] text-slate-400 font-bold w-7 text-right pr-1 shrink-0">{DOW_LABELS[dow - 1]}</span>
                  {Array.from({ length: 24 }, (_, h) => {
                    const v = heatmapMap[`${dow}-${h}`] ?? 0;
                    const intensity = v / heatMax;
                    const bg = intensity === 0
                      ? "bg-slate-100 dark:bg-slate-800"
                      : intensity < 0.25 ? "bg-violet-100 dark:bg-violet-900/30"
                      : intensity < 0.5  ? "bg-violet-300 dark:bg-violet-700/60"
                      : intensity < 0.75 ? "bg-violet-500"
                      : "bg-violet-700";
                    return (
                      <div
                        key={h}
                        title={`${DOW_LABELS[dow-1]} ${HOUR_LABELS[h]}: ${v} sessions`}
                        className={`w-[13px] h-[13px] rounded-[2px] ${bg} cursor-pointer transition-all hover:scale-125`}
                      />
                    );
                  })}
                </div>
              ))}
              <div className="flex items-center gap-2 mt-3 justify-end">
                <span className="text-[9px] text-slate-400">Low</span>
                {["bg-slate-100 dark:bg-slate-800","bg-violet-100","bg-violet-300","bg-violet-500","bg-violet-700"].map((c,i) => (
                  <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
                ))}
                <span className="text-[9px] text-slate-400">High</span>
              </div>
            </div>
          </ChartCard>
        </section>

        {/* Row 2: Lab bar + Purpose donut */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <ChartCard title="Lab Utilization" icon={FlaskConical} className="lg:col-span-2">
            {labs.length === 0 && !loading
              ? <p className="text-xs text-slate-400 text-center py-10">No lab data in this range.</p>
              : <div className="h-64"><Bar data={labBarData} options={barOptions} /></div>
            }
          </ChartCard>

          <ChartCard title="Session Purpose Breakdown" icon={BarChart3}>
            {purposes.length === 0 && !loading
              ? <p className="text-xs text-slate-400 text-center py-10">No data.</p>
              : (
                <>
                  <div className="h-44 relative">
                    <Doughnut data={purposeDonutData} options={donutOptions} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total</p>
                      <p className="text-lg font-bold text-[#381872] dark:text-white">{purposes.reduce((s,p) => s + p.count, 0)}</p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {purposes.map((p, i) => (
                      <div key={p.label} className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PURPLE_PALETTE[i % PURPLE_PALETTE.length] }} />
                          <span className="text-slate-600 dark:text-slate-300 font-medium truncate max-w-[120px]">{p.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#381872] dark:text-white">{p.count}</span>
                          <span className="text-slate-400">({p.percent}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )
            }
          </ChartCard>
        </section>

        {/* Row 3: Reservations + Student breakdown + Ratings */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>

          {/* Reservation Status Funnel */}
          <ChartCard title="Reservation Status" icon={CheckCircle2}>
            <div className="space-y-3">
              {statusOrder.map(st => {
                const count = resByStatus[st] ?? 0;
                const total = Object.values(resByStatus).reduce((a,b) => a+b, 0) || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={st}>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="font-bold capitalize text-slate-700 dark:text-slate-300">{st}</span>
                      <span className="font-black text-slate-900 dark:text-white">{count} <span className="text-slate-400 font-normal">({pct}%)</span></span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: statusColors[st] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartCard>

          {/* Student Course Distribution */}
          <ChartCard title="Students by Course & Year" icon={BarChart3}>
            {courses.length === 0 && !loading
              ? <p className="text-xs text-slate-400 text-center py-10">No student data.</p>
              : <div className="h-52"><Bar data={courseBarData} options={courseBarOptions} /></div>
            }
          </ChartCard>

          {/* Rating Distribution */}
          <ChartCard title="Satisfaction Ratings" icon={Star}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl font-bold text-[#381872] dark:text-white">{data?.avgRating ?? "—"}</span>
              <div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < Math.round(data?.avgRating ?? 0) ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Average score</p>
              </div>
            </div>
            <div className="space-y-2">
              {ratings.map(({ star, count }) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-500 w-4 text-right">{star}</span>
                  <Star size={10} className="text-amber-400 fill-amber-400 shrink-0" />
                  <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all duration-700"
                      style={{ width: `${Math.round((count / maxRating) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 w-5 text-right">{count}</span>
                </div>
              ))}
            </div>
          </ChartCard>
        </section>

        {/* Row 4: Podium Leaderboard */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <div className="px-5 py-4 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/40 dark:bg-slate-800/20">
            <div className="flex items-center gap-2">
              <Trophy size={15} className="text-amber-500" />
              <h2 className="text-xs font-bold text-[#381872] dark:text-white uppercase tracking-wider">Top 5 Students by Lab Hours</h2>
            </div>
            <span className="text-[10px] font-black px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 uppercase tracking-widest">
              Hall of Fame
            </span>
          </div>
          <div className="px-6 pt-4 pb-6">
            <PodiumStairs students={leaderboard} loading={loading} />
          </div>
        </div>

        {/* --- Reports Section --- */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-8 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
          <header>
            <h2 className="text-2xl font-bold text-[#381872] dark:text-violet-300">Sessions Records</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Detailed log of all sit-in sessions with advanced filtering.</p>
          </header>

          {/* Filter Hub */}
          <form onSubmit={e=>{e.preventDefault();setPage(1);fetchRecords();}}
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">


            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"/>
                <input type="text" value={studentSearch} onChange={e=>setStudentSearch(e.target.value)}
                  placeholder="Search by ID or name…"
                  className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-violet-300"/>
              </div>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"/>
                <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none"/>
                {!startDate && <span className="absolute left-9 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 pointer-events-none font-bold uppercase"></span>}
              </div>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"/>
                <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none"/>
                {!endDate && <span className="absolute left-9 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 pointer-events-none font-bold uppercase"></span>}
              </div>
              <div className="relative">
                <select value={lab} onChange={e=>setLab(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest appearance-none focus:outline-none cursor-pointer">
                  <option value="all">All Labs</option>
                  {filterLabs.map(l=><option key={l} value={l}>{l}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
              </div>
              <div className="relative">
                <select value={purpose} onChange={e=>setPurpose(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest appearance-none focus:outline-none cursor-pointer">
                  <option value="all">All Purposes</option>
                  {filterPurposes.map(p=><option key={p} value={p}>{p}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
              </div>
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={loadingRecords}
                className="flex-1 py-3 rounded-2xl bg-[#381872] dark:bg-violet-800 text-white font-black text-xs uppercase tracking-widest hover:bg-[#220055] transition-all shadow-md active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2">
                {loadingRecords?<RefreshCw size={13} className="animate-spin"/>:<Search size={13}/>} Search
              </button>
            </div>
          </form>

          {/* Data Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
              <h2 className="text-sm font-bold text-[#381872] dark:text-white flex items-center gap-2">
                <History size={16} className="text-violet-500"/> Sit-In Sessions Preview
              </h2>
              <span className="text-[10px] font-black px-3 py-1 rounded-full bg-white dark:bg-slate-900 text-[#381872] dark:text-violet-300 shadow-sm uppercase tracking-widest">
                Page {page}/{totalPages||1}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-[11px]">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 uppercase tracking-widest font-black text-[10px]">
                  <tr>
                    {["Student ID","Name","Lab","Purpose","Status","Start","End","Duration"].map(h=>(
                      <th key={h} className="text-left px-5 py-3.5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {paginated.length === 0 ? (
                    <tr><td colSpan={8} className="px-6 py-16 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                      {loadingRecords?"Loading…":"No records match the filters"}
                    </td></tr>
                  ) : paginated.map(r => (
                    <tr key={r.sitIn_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all group">
                      <td className="px-5 py-3 font-black text-slate-900 dark:text-white">{r.id_number}</td>
                      <td className="px-5 py-3 font-bold uppercase tracking-tight">{r.student_name}</td>
                      <td className="px-5 py-3 font-bold text-[#381872] dark:text-violet-300">{r.lab}</td>
                      <td className="px-5 py-3">
                        <span className="bg-violet-50 dark:bg-violet-900/30 px-2 py-0.5 rounded text-[10px] font-bold text-[#381872] dark:text-violet-300">
                          {r.purpose}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black capitalize ${statusBadge(r.status)}`}>
                          {r.status.replace("_"," ")}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-400 font-medium">{r.started_at}</td>
                      <td className="px-5 py-3 text-slate-400 font-medium">{r.ended_at || "—"}</td>
                      <td className="px-5 py-3 font-black">{r.duration_minutes != null ? `${r.duration_minutes}m` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-900/50">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {((page-1)*perPage)+1}–{Math.min(page*perPage,records.length)} of {records.length}
                </p>
                <div className="flex gap-2">
                  <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-[#381872] transition-all disabled:opacity-30"><ChevronLeft size={15}/></button>
                  <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page>=totalPages}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-[#381872] transition-all disabled:opacity-30"><ChevronRight size={15}/></button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
