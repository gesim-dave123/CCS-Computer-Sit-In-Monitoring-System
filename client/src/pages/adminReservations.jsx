import { useEffect, useState, useMemo } from "react";
import { Navigate } from "react-router-dom";
import AdminNavigationBar from "../component/adminNavigationBar";
import {
  CalendarCheck2, CheckCircle, XCircle, Clock, Monitor,
  MapPin, BookMarked, Search, RefreshCw, Loader2, Filter,
  Play, Ban, AlertTriangle, CalendarDays,
  History,
  Info,
  ChevronDown
} from "lucide-react";

const STATUS_META = {
  pending:   { label: "Pending",   cls: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800/50" },
  approved:  { label: "Approved",  cls: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800/50" },
  cancelled: { label: "Cancelled", cls: "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700" },
  completed: { label: "Completed", cls: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800/50" },
  rejected:  { label: "Rejected",  cls: "bg-red-100 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50" },
};

const TODAY = new Date().toISOString().split("T")[0];
function isToday(dateStr) { return dateStr === TODAY; }

function ConfirmDialog({ open, title, message, icon: Icon, iconColor, confirmLabel, confirmColor, onConfirm, onCancel, loading }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onCancel}>
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
        <div className="p-8 flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${iconColor} shadow-lg`}>
            <Icon className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{message}</p>
        </div>
        <div className="px-8 pb-8 flex gap-3">
          <button onClick={onCancel} disabled={loading} className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">Cancel</button>
          <button onClick={onConfirm} disabled={loading} className={`flex-1 py-3 rounded-2xl text-white text-xs font-black uppercase tracking-widest shadow-md transition-all active:scale-95 ${confirmColor}`}>
            {loading ? "..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminReservationsPage() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const BASE = import.meta.env.VITE_API_BASE_URL;

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [selected, setSelected] = useState(null);

  const [confirmDialog, setConfirmDialog] = useState({
    open: false, title: "", message: "", icon: AlertTriangle, iconColor: "",
    confirmLabel: "", confirmColor: "", action: null, reservationId: null,
  });

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/reservations.php?admin=1`);
      const json = await res.json();
      if (res.ok) setReservations(json.reservations || []);
    } catch { setError("Could not reach server."); } finally { setLoading(false); }
  };

  useEffect(() => { if (user?.role === "admin") fetchReservations(); }, []);

  const handleAction = async (id, action) => {
    setActionLoading(id + action);
    try {
      const res = await fetch(`${BASE}/reservations.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reservation_id: id, admin_id_number: user.id_number }),
      });
      if (res.ok) { setSelected(null); setConfirmDialog(prev => ({ ...prev, open: false })); await fetchReservations(); }
    } catch {} finally { setActionLoading(null); }
  };

  const filtered = useMemo(() => {
    return reservations.filter(r => {
      const matchStatus = filter === "all" || r.status === filter;
      const q = search.toLowerCase();
      const matchSearch = !q || r.student_name?.toLowerCase().includes(q) || r.id_number?.toLowerCase().includes(q) || r.lab?.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [reservations, filter, search]);

  const stats = useMemo(() => ({
    total: reservations.length,
    pending: reservations.filter(r => r.status === "pending").length,
    today: reservations.filter(r => r.status === "approved" && isToday(r.reserved_date)).length,
    completed: reservations.filter(r => r.status === "completed").length
  }), [reservations]);

  return (
    <main className="min-h-screen bg-[#fef7ff] dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-['Montserrat'] md:pl-64 transition-colors duration-300">
      <AdminNavigationBar />

      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12 space-y-8">
        <header className="px-2 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-4xl md:text-5xl font-bold text-[#381872] dark:text-violet-300 tracking-tight">Reservations.</h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 mt-2 font-medium">Moderate laboratory bookings and student check-ins.</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
           {[
             { label: "Total Requests", val: stats.total, icon: CalendarCheck2, color: "text-[#381872] dark:text-violet-300", bg: "bg-violet-50 dark:bg-violet-900/30" },
             { label: "Pending Review", val: stats.pending, icon: Clock, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20" },
             { label: "Today's Schedule", val: stats.today, icon: Play, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" },
             { label: "Completed", val: stats.completed, icon: History, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" }
           ].map((s, i) => (
             <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                <div className="relative z-10 flex items-center gap-4">
                   <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center ${s.color} group-hover:scale-110 transition-transform`}>
                      <s.icon size={24} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{s.val}</h3>
                   </div>
                </div>
             </div>
           ))}
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 flex flex-col md:flex-row items-center gap-4 shadow-sm animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
           <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter by ID, Name or Laboratory..." className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold focus:outline-none" />
           </div>
           <div className="flex items-center gap-2 w-full md:w-auto">
              <select value={filter} onChange={e => setFilter(e.target.value)} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-tighter focus:outline-none">
                 <option value="all">Statuses</option>
                 {Object.keys(STATUS_META).map(k => <option key={k} value={k}>{k.toUpperCase()}</option>)}
              </select>
              <button onClick={fetchReservations} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-[#381872] transition-all"><RefreshCw size={16} className={loading ? "animate-spin" : ""} /></button>
           </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
           <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
              <h2 className="text-sm font-bold text-[#381872] dark:text-white flex items-center gap-2">
                 <CalendarCheck2 className="w-4 h-4 text-violet-500" /> Registry
              </h2>
              <span className="text-[10px] font-black px-3 py-1 rounded-full bg-white dark:bg-slate-900 text-[#381872] dark:text-violet-300 shadow-sm uppercase tracking-widest">{filtered.length} REQUESTS</span>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-[11px]">
                 <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 uppercase">
                    <tr>
                       {["ID", "Student Entity", "Computer", "Date", "Slot", "Condition", "Ops"].map(h => (
                         <th key={h} className="text-left px-6 py-4 font-black tracking-widest">{h}</th>
                       ))}
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {filtered.map(r => (
                      <tr key={r.reservation_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer" onClick={() => setSelected(r)}>
                         <td className="px-6 py-4 text-slate-400 font-mono">#{r.reservation_id}</td>
                         <td className="px-6 py-4">
                            <p className="font-black text-slate-900 dark:text-white uppercase">{r.student_name}</p>
                            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tight">{r.id_number}</p>
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 font-bold text-[#381872] dark:text-violet-300">
                               <Monitor size={12} /> Seat {r.seat_number}
                            </div>
                            <p className="text-[9px] text-slate-400 uppercase mt-0.5">{r.lab}</p>
                         </td>
                         <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-tighter">
                            {r.reserved_date}
                            {isToday(r.reserved_date) && <span className="ml-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 text-[8px] px-1.5 py-0.5 rounded-md border border-blue-100 dark:border-blue-800/50">TODAY</span>}
                         </td>
                         <td className="px-6 py-4 text-slate-500 dark:text-slate-500 font-medium uppercase tracking-tight">{r.time_slot}</td>
                         <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${STATUS_META[r.status]?.cls}`}>
                               {r.status}
                            </span>
                         </td>
                         <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center gap-1.5">
                               {r.status === "pending" && (
                                 <>
                                    <button onClick={() => handleAction(r.reservation_id, "approve")} className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all"><CheckCircle size={14} /></button>
                                    <button onClick={() => handleAction(r.reservation_id, "reject")} className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-600 hover:text-white transition-all"><XCircle size={14} /></button>
                                 </>
                               )}
                               {r.status === "approved" && isToday(r.reserved_date) && (
                                 <button onClick={() => handleAction(r.reservation_id, "checkin")} className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-600 hover:text-white transition-all" title="Check-in"><Play size={14} /></button>
                               )}
                            </div>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        icon={confirmDialog.icon}
        iconColor={confirmDialog.iconColor}
        confirmLabel={confirmDialog.confirmLabel}
        confirmColor={confirmDialog.confirmColor}
        onConfirm={() => handleAction(confirmDialog.reservationId, confirmDialog.action)}
        onCancel={() => setConfirmDialog(p => ({ ...p, open: false }))}
        loading={!!actionLoading}
      />
    </main>
  );
}
