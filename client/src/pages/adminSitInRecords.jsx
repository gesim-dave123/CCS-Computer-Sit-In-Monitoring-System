import { useEffect, useState, useMemo } from "react";
import AdminNavigationBar from "../component/adminNavigationBar";
import { 
  History, 
  FileText, 
  RefreshCw, 
  Search, 
  Info,
  Calendar,
  Monitor,
  User,
  BookOpen,
  CheckCircle2,
  Filter,
  ChevronDown,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export default function AdminSitInRecordsPage() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  
  // Filtering States
  const [filterDate, setFilterDate] = useState("");
  const [filterLab, setFilterLab] = useState("all");
  const [filterPurpose, setFilterPurpose] = useState("all");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 15;

  const fetchRecords = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/adminSitInList.php`,
      );
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Failed to load sit-in records.");
        return;
      }

      setRecords(json.endedSessions || []);
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterDate, filterLab, filterPurpose]);

  // Derived filter options from data
  const labsList = useMemo(() => {
    const unique = new Set(records.map(r => r.lab).filter(Boolean));
    return Array.from(unique).sort();
  }, [records]);

  const purposesList = useMemo(() => {
    const unique = new Set(records.map(r => r.purpose).filter(Boolean));
    return Array.from(unique).sort();
  }, [records]);

  const filtered = useMemo(() => {
    return records.filter(r => {
      const q = search.toLowerCase().trim();
      const matchesSearch = !q || 
        r.name?.toLowerCase().includes(q) ||
        r.id_number?.toLowerCase().includes(q) ||
        r.lab?.toLowerCase().includes(q) ||
        r.purpose?.toLowerCase().includes(q);
      
      const matchesLab = filterLab === "all" || r.lab === filterLab;
      const matchesPurpose = filterPurpose === "all" || r.purpose === filterPurpose;
      
      let matchesDate = true;
      if (filterDate && r.started_at) {
        const rDate = r.started_at.split(' ')[0]; // YYYY-MM-DD
        if (rDate !== filterDate) matchesDate = false;
      }

      return matchesSearch && matchesLab && matchesPurpose && matchesDate;
    });
  }, [records, search, filterLab, filterPurpose, filterDate]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, currentPage]);

  const resetFilters = () => {
    setSearch("");
    setFilterDate("");
    setFilterLab("all");
    setFilterPurpose("all");
  };

  return (
    <main className="min-h-screen bg-[#fef7ff] dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-['Montserrat'] md:pl-64 transition-colors duration-300">
      <AdminNavigationBar />

      <section className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12 space-y-6">
        <header className="px-2 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-4xl md:text-5xl font-bold text-[#381872] dark:text-violet-300 tracking-tight">
            Sit-In Records.
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 mt-2 font-medium">
            A comprehensive registry of completed sessions and historical student activity.
          </p>
        </header>

        {error && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-700 dark:text-red-400 text-xs font-bold uppercase tracking-tight animate-fade-in-up">
            <Info size={16} /> {error}
          </div>
        )}

        {/* Filter Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm p-5 space-y-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-violet-500" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Filter Records</h2>
             </div>
             {(search || filterDate || filterLab !== "all" || filterPurpose !== "all") && (
               <button onClick={resetFilters} className="text-[10px] font-bold text-red-500 hover:underline uppercase tracking-tighter">Reset All</button>
             )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Query by ID, Name..."
                className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-300 dark:focus:ring-purple-900 transition-all"
              />
            </div>

            <div className="relative">
               <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
               <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-medium focus:outline-none" />
               {!filterDate && <span className="absolute left-9 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 pointer-events-none font-bold uppercase"></span>}
            </div>

            <div className="relative">
               <select value={filterLab} onChange={e => setFilterLab(e.target.value)} className="w-full pl-3 pr-8 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-bold uppercase tracking-tighter appearance-none focus:outline-none">
                  <option value="all">All Laboratories</option>
                  {labsList.map(l => <option key={l} value={l}>{l}</option>)}
               </select>
               <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative">
               <select value={filterPurpose} onChange={e => setFilterPurpose(e.target.value)} className="w-full pl-3 pr-8 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-bold uppercase tracking-tighter appearance-none focus:outline-none">
                  <option value="all">All Purposes</option>
                  {purposesList.map(p => <option key={p} value={p}>{p}</option>)}
               </select>
               <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="px-5 py-3 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
            <h2 className="text-sm font-bold text-[#381872] dark:text-white flex items-center gap-2">
               <History className="w-4 h-4 text-violet-500" />
               Historical Logs
            </h2>
            <button
              onClick={fetchRecords}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#381872] dark:hover:text-violet-300 transition-colors disabled:opacity-60"
            >
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
              FETCH LATEST
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 uppercase">
                <tr>
                  <th className="text-left px-5 py-4 font-black tracking-widest">Entry ID</th>
                  <th className="text-left px-5 py-4 font-black tracking-widest">User ID</th>
                  <th className="text-left px-5 py-4 font-black tracking-widest">Student Name</th>
                  <th className="text-left px-5 py-4 font-black tracking-widest">Activity</th>
                  <th className="text-left px-5 py-4 font-black tracking-widest">Station</th>
                  <th className="text-right px-5 py-4 font-black tracking-widest">Condition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {paginatedRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-slate-500 dark:text-slate-400 text-center">
                      {loading ? "SEARCHING ARCHIVES..." : "NO RECORDS MATCH THE SEARCH CRITERIA."}
                    </td>
                  </tr>
                ) : (
                  paginatedRecords.map((item) => (
                    <tr key={item.sitIn_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-5 py-3 text-slate-500 font-mono">#{item.sitIn_id}</td>
                      <td className="px-5 py-3 text-slate-900 dark:text-white font-black">{item.id_number}</td>
                      <td className="px-5 py-3 text-slate-700 dark:text-slate-300 font-bold">{item.name}</td>
                      <td className="px-5 py-3">
                         <div className="flex items-center gap-2">
                            <BookOpen size={14} className="text-violet-400 opacity-70" />
                            <span className="text-slate-600 dark:text-slate-400 font-medium">{item.purpose}</span>
                         </div>
                      </td>
                      <td className="px-5 py-3 text-slate-500 dark:text-slate-400">
                         <div className="flex items-center gap-2">
                            <Monitor size={14} className="text-slate-300" />
                            {item.lab}
                         </div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-transparent group-hover:border-slate-200 dark:group-hover:border-slate-700 transition-all">
                          <CheckCircle2 size={10} />
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-900/50">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, filtered.length)} of {filtered.length} entries
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-[#381872] dark:hover:text-violet-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="flex items-center px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[10px] font-black text-[#381872] dark:text-violet-300">
                  PAGE {currentPage} / {totalPages}
                </div>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-[#381872] dark:hover:text-violet-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
