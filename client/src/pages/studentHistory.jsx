import { useEffect, useState, useMemo } from "react";
import NavigationBar from "../component/studentNavBar";
import ccslogo from "../assets/image/ccslogo.png";
import { 
  FileText, 
  MessageSquare, 
  X, 
  History, 
  Clock, 
  MapPin, 
  BookOpen,
  Calendar,
  CheckCircle2,
  PlayCircle,
  Timer,
  Trophy,
  Monitor,
  BarChart3,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export default function StudentHistoryPage() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [historyRecords, setHistoryRecords] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [selectedHistoryFeedback, setSelectedHistoryFeedback] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);

  const activeIdNumber = user?.id_number || "";

  const formatDateTime = (value) => {
    if (!value) return "N/A";
    const parsed = new Date(value);
    return parsed.toLocaleString(undefined, { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  };

  const formatDuration = (mins) => {
    if (!mins || mins < 0) return "0m";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const calculateDuration = (start, end) => {
    if (!start || !end) return "N/A";
    const diff = Math.floor((new Date(end) - new Date(start)) / 60000);
    return formatDuration(diff);
  };

  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      if (!activeIdNumber) return;
      setHistoryLoading(true); setHistoryError("");
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/studentSitInHistory.php?id_number=${encodeURIComponent(activeIdNumber)}&limit=100`);
        const json = await res.json();
        if (!res.ok) { if (isMounted) setHistoryError(json.error || "Failed."); return; }
        if (isMounted) setHistoryRecords(Array.isArray(json.history) ? json.history : []);
      } catch { if (isMounted) setHistoryError("Server error."); } finally { if (isMounted) setHistoryLoading(false); }
    };
    fetchHistory();
    return () => { isMounted = false; };
  }, [activeIdNumber]);

  const stats = useMemo(() => {
    const ended = historyRecords.filter(r => r.status === "ended" && r.started_at && r.ended_at);
    let totalM = 0, maxM = 0;
    ended.forEach(r => {
      const diff = Math.floor((new Date(r.ended_at) - new Date(r.started_at)) / 60000);
      if (diff > 0) { totalM += diff; if (diff > maxM) maxM = diff; }
    });
    return { total: historyRecords.length, totalM, avg: ended.length > 0 ? Math.round(totalM / ended.length) : 0, maxM };
  }, [historyRecords]);

  return (
    <main className="min-h-screen bg-[#fef7ff] dark:bg-slate-950 font-['Montserrat'] transition-colors duration-300">
      <NavigationBar />

      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setSelectedSession(null)}>
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200 border border-slate-100 dark:border-slate-800" onClick={e => e.stopPropagation()}>
             <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-[#381872] to-[#6c44c1] text-white">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-3"><History size={20} /> Session Details</h3>
                  <p className="text-violet-200 text-[10px] font-black uppercase tracking-widest mt-1">Record #{selectedSession.sitIn_id}</p>
                </div>
                <button onClick={() => setSelectedSession(null)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"><X size={18} /></button>
             </div>
             <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                   <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date</p><p className="text-sm font-bold">{new Date(selectedSession.started_at).toLocaleDateString()}</p></div>
                   <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p><span className={`inline-flex px-2 py-0.5 rounded-lg text-[8px] font-black uppercase ${selectedSession.status === 'ended' ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400' : 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'}`}>{selectedSession.status}</span></div>
                   <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Time In</p><p className="text-sm font-bold flex items-center gap-2"><Clock size={14} className="text-violet-400" /> {new Date(selectedSession.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p></div>
                   <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Time Out</p><p className="text-sm font-bold flex items-center gap-2"><Clock size={14} className="text-violet-400" /> {selectedSession.ended_at ? new Date(selectedSession.ended_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "---"}</p></div>
                   <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Duration</p><p className="text-sm font-bold flex items-center gap-2"><Timer size={14} className="text-violet-400" /> {calculateDuration(selectedSession.started_at, selectedSession.ended_at)}</p></div>
                   <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">PC Number</p><p className="text-sm font-bold flex items-center gap-2"><Monitor size={14} className="text-violet-400" /> {selectedSession.pc_number || "N/A"}</p></div>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Activity / Purpose</p>
                   <div className="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 font-bold text-[#381872] dark:text-violet-300">{selectedSession.purpose || "General Study"}</div>
                </div>
             </div>
             <div className="px-8 pb-8 flex justify-end"><button onClick={() => setSelectedSession(null)} className="px-8 py-2.5 rounded-2xl bg-[#381872] text-white text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">Close</button></div>
          </div>
        </div>
      )}

      {selectedHistoryFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 animate-in zoom-in duration-200">
             <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-[#381872] to-[#6c44c1] text-white">
                <h2 className="text-sm font-bold flex items-center gap-2"><MessageSquare size={16} /> Feedback</h2>
                <button onClick={() => setSelectedHistoryFeedback(null)} className="p-1 rounded-lg hover:bg-white/10"><X size={16} /></button>
             </div>
             <div className="p-6 space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Observation</p>
                <p className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs font-medium italic">"{selectedHistoryFeedback.feedback?.message || "No comments."}"</p>
                <div className="grid grid-cols-2 gap-3">
                   <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800"><p className="text-[8px] font-black text-slate-400 uppercase">Rating</p><p className="text-sm font-bold text-amber-500">{selectedHistoryFeedback.feedback?.rating || "N/A"}</p></div>
                   <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800"><p className="text-[8px] font-black text-slate-400 uppercase">Category</p><p className="text-sm font-bold text-[#381872] dark:text-violet-300 capitalize">{selectedHistoryFeedback.feedback?.category || "General"}</p></div>
                </div>
             </div>
             <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button onClick={() => setSelectedHistoryFeedback(null)} className="px-5 py-2 rounded-xl bg-[#381872] text-white text-[10px] font-black uppercase tracking-widest shadow-lg">Close</button>
             </div>
          </div>
        </div>
      )}

      <section className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12 space-y-6">
        <header className="px-2 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-2xl md:text-3xl font-bold text-[#381872] dark:text-violet-300 tracking-tight">Sit-In Logs.</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Activity and performance history.</p>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
           {[
             { label: "Sessions", val: stats.total, icon: History, color: "text-[#381872] dark:text-violet-300", bg: "bg-violet-50 dark:bg-violet-900/30" },
             { label: "Duration", val: formatDuration(stats.totalM), icon: Timer, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
             { label: "Average", val: formatDuration(stats.avg), icon: BarChart3, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
             { label: "Peak", val: formatDuration(stats.maxM), icon: Trophy, color: "text-white", bg: "bg-[#381872]" }
           ].map((s, i) => (
             <div key={i} className={`rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3 transition-all hover:shadow-md ${i === 3 ? "bg-[#381872] text-white" : "bg-white dark:bg-slate-900"}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg} ${s.color}`}><s.icon size={20} /></div>
                <div><p className={`text-[8px] font-black uppercase tracking-widest ${i === 3 ? "text-violet-300" : "text-slate-400"}`}>{s.label}</p><h3 className="text-lg font-bold">{s.val}</h3></div>
             </div>
           ))}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="px-6 py-4 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-800/20">
             <h3 className="text-sm font-bold flex items-center gap-2"><FileText size={16} className="text-violet-500" />Detailed Activity</h3>
          </div>
          <div className="max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-violet-100 dark:scrollbar-thumb-slate-800">
             {historyLoading && historyRecords.length === 0 ? <div className="py-20 text-center"><div className="w-8 h-8 border-2 border-violet-100 border-t-[#381872] rounded-full animate-spin mx-auto" /></div> : historyRecords.length === 0 ? <p className="py-20 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">No activity history</p> : (
               <table className="w-full text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 sticky top-0 z-10 uppercase font-black text-[9px] tracking-widest">
                     <tr>
                        <th className="text-left px-6 py-4">Session</th>
                        <th className="text-left px-6 py-4">Activity</th>
                        <th className="text-left px-6 py-4">Location</th>
                        <th className="text-left px-6 py-4">Status</th>
                        <th className="text-right px-6 py-4">Action</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                     {historyRecords.map(r => (
                        <tr key={r.sitIn_id} onClick={() => setSelectedSession(r)} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                           <td className="px-6 py-3 font-black text-[#381872] dark:text-violet-300">#{r.sitIn_id}</td>
                           <td className="px-6 py-3 font-bold">{r.purpose || "Study"}</td>
                           <td className="px-6 py-3 text-slate-500">{r.lab}</td>
                           <td className="px-6 py-3">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${r.status === 'ended' ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400' : 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'}`}>{r.status}</span>
                           </td>
                           <td className="px-6 py-3 text-right">
                              {r.feedback ? <button onClick={(e) => { e.stopPropagation(); setSelectedHistoryFeedback(r); }} className="p-2 rounded-lg bg-violet-50 dark:bg-violet-900/30 text-[#381872] dark:text-violet-300"><MessageSquare size={14} /></button> : <span className="text-[8px] font-black text-slate-300 uppercase">No Feedback</span>}
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
             )}
          </div>
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
