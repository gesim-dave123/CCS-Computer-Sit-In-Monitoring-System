import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import NavigationBar from "../component/studentNavBar";
import ccslogo from "../assets/image/ccslogo.png";
import { 
  Megaphone, 
  Calendar, 
  UserRound, 
  Search, 
  Filter, 
  RefreshCw, 
  X,
  ChevronDown
} from "lucide-react";

export default function StudentAnnouncementsPage() {
  const [searchParams] = useSearchParams();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [expandedAnnouncement, setExpandedAnnouncement] = useState(null);

  const highlightedAnnouncementId = Number(searchParams.get("announcement") || 0);

  const formatDateTime = (value) => {
    if (!value) return "N/A";
    const parsed = new Date(value);
    return parsed.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
  };

  const fetchAnnouncements = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/createAnnouncement.php?audience=student&limit=200`);
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Failed."); setAnnouncements([]); return; }
      setAnnouncements(Array.isArray(json.announcements) ? json.announcements : []);
    } catch { setError("Server error."); setAnnouncements([]); } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchAnnouncements();
    const refreshId = window.setInterval(fetchAnnouncements, 60000);
    return () => window.clearInterval(refreshId);
  }, []);

  useEffect(() => {
    if (highlightedAnnouncementId <= 0) return;
    const target = document.getElementById(`announcement-${highlightedAnnouncementId}`);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      setExpandedAnnouncement(highlightedAnnouncementId);
    }
  }, [highlightedAnnouncementId, announcements]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return announcements.filter((item) => {
      const title = String(item.title ?? "").toLowerCase();
      const content = String(item.content ?? "").toLowerCase();
      const author = String(item.author_name ?? "").toLowerCase();
      const matchesQuery = !q || title.includes(q) || content.includes(q) || author.includes(q);
      const matchesType = typeFilter === "all" || item.type === typeFilter;
      const matchesPriority = priorityFilter === "all" || item.priority === priorityFilter;
      return matchesQuery && matchesType && matchesPriority;
    });
  }, [announcements, query, typeFilter, priorityFilter]);

  return (
    <main className="min-h-screen bg-[#fef7ff] dark:bg-slate-950 font-['Montserrat'] transition-colors duration-300">
      <NavigationBar />

      <section className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12 space-y-6">
        <header className="px-2 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-2xl md:text-3xl font-bold text-[#381872] dark:text-violet-300 tracking-tight">Announcements.</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Institutional news and updates.</p>
        </header>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm p-5 relative overflow-hidden group animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="w-full lg:max-w-md relative">
              <Search className="w-3.5 h-3.5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Filter keywords..." className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl pl-10 pr-4 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-300" />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-[#381872] dark:text-violet-300 focus:outline-none appearance-none min-w-[100px] text-center">
                <option value="all">Types: All</option>
                <option value="general">General</option>
                <option value="maintenance">Maintenance</option>
                <option value="rules">Rules</option>
                <option value="event">Event</option>
              </select>
              <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-[#381872] dark:text-violet-300 focus:outline-none appearance-none min-w-[100px] text-center">
                <option value="all">Priority: All</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <button onClick={fetchAnnouncements} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-[#381872] active:scale-95 transition-all"><RefreshCw size={14} className={loading ? "animate-spin" : ""} /></button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          {loading && announcements.length === 0 ? (
            Array.from({ length: 4 }).map((_, i) => <div key={i} className="animate-pulse bg-white dark:bg-slate-900 rounded-2xl h-48 border border-slate-100 dark:border-slate-800" />)
          ) : filtered.length === 0 ? (
            <div className="col-span-full py-20 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">No entries matched the criteria</div>
          ) : (
            filtered.map((item) => (
              <article key={item.announcement_id} id={`announcement-${item.announcement_id}`} className={`bg-white dark:bg-slate-900 border p-5 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all flex flex-col ${item.priority === "high" ? "border-red-100 dark:border-red-950/30" : "border-slate-100 dark:border-slate-800"}`}>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-tighter shadow-sm ${item.priority === 'high' ? 'bg-red-500 text-white' : item.priority === 'medium' ? 'bg-amber-400 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>{item.priority}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{formatDateTime(item.publish_at || item.created_at)}</span>
                </div>
                <h4 className="text-sm font-bold text-[#381872] dark:text-white mb-3 line-clamp-2">{item.title}</h4>
                <p className={`text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic mb-4 flex-1 ${expandedAnnouncement === item.announcement_id ? "" : "line-clamp-2"}`}>"{item.content}"</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                  <span className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">By {item.author_name}</span>
                  <button onClick={() => setExpandedAnnouncement(expandedAnnouncement === item.announcement_id ? null : item.announcement_id)} className="text-[9px] font-black text-[#381872] dark:text-violet-400 uppercase tracking-widest">{expandedAnnouncement === item.announcement_id ? "LESS" : "EXPAND"}</button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <footer className="bg-white dark:bg-slate-950 w-full py-10 px-8 border-t border-slate-100 dark:border-slate-800 mt-10 transition-all">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 max-w-full mx-auto w-full">
          <div className="flex items-center gap-3"><img src={ccslogo} alt="CCS" className="w-6 h-6 opacity-80" /><div className="font-bold text-[#381872] dark:text-violet-300 text-sm tracking-tighter uppercase">CCS SITIN</div></div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">© {new Date().getFullYear()} COLLEGE OF COMPUTER STUDIES.</div>
          <div className="flex gap-8 text-[9px] font-black uppercase tracking-widest">
            {["Privacy", "Terms", "Support"].map((l) => (<a key={l} href="#" className="text-slate-400 hover:text-[#f4be5d] transition-colors">{l}</a>))}
          </div>
        </div>
      </footer>
    </main>
  );
}
