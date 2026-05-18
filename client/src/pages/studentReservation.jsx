import { useEffect, useState, useMemo } from "react";
import NavigationBar from "../component/studentNavBar";
import ccslogo from "../assets/image/ccslogo.png";
import {
  Monitor,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  CalendarDays,
  Loader2,
  ChevronRight,
  ChevronLeft,
  X,
  Search,
  BookMarked,
  Cpu,
  Code,
  Database,
  Palette,
  FileText,
  Globe,
  Plus,
  History,
  Info,
  RefreshCw,
  CalendarCheck2,
  CheckCircle2
} from "lucide-react";

const TIME_SLOTS = ["7:30 AM – 9:00 AM", "9:00 AM – 10:30 AM", "10:30 AM – 12:00 PM", "12:00 PM – 1:30 PM", "1:30 PM – 3:00 PM", "3:00 PM – 4:30 PM", "4:30 PM – 6:00 PM"];
const PURPOSES = ["C Programming", "Java Programming", "Python Programming", "Web Development", "Database Management", "Thesis / Research", "Data Structures", "Operating Systems", "Networking", "Other"];
const STATUS_COLORS = {
  pending: "bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-800",
  approved: "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800",
  cancelled: "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700",
  completed: "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-100 dark:border-purple-800"
};

export default function StudentReservationPage() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const idNumber = user?.id_number || "";
  const [step, setStep] = useState(0);
  const [tab, setTab] = useState("new");
  const [selectedLab, setSelectedLab] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split("T")[0]; });
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[0]);
  const [purpose, setPurpose] = useState(PURPOSES[0]);
  const [reservedSeats, setReservedSeats] = useState([]);
  const [seatsLoading, setSeatsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successId, setSuccessId] = useState(null);
  const [myReservations, setMyReservations] = useState([]);
  const [myResLoading, setMyResLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [labs, setLabs] = useState([]);
  const [labsLoading, setLabsLoading] = useState(true);
  const [labSearchQuery, setLabSearchQuery] = useState("");

  const BASE = import.meta.env.VITE_API_BASE_URL;

  const filteredLabs = useMemo(() => {
    const q = labSearchQuery.toLowerCase().trim();
    if (!q) return labs;
    return labs.filter(l => l.name.toLowerCase().includes(q) || l.room_number?.toLowerCase().includes(q) || (l.software || []).some(s => s.software_name.toLowerCase().includes(q)));
  }, [labs, labSearchQuery]);

  const stats = useMemo(() => ({
    total: myReservations.length,
    pending: myReservations.filter(r => r.status === "pending").length,
    approved: myReservations.filter(r => r.status === "approved").length,
    completed: myReservations.filter(r => r.status === "completed").length
  }), [myReservations]);

  useEffect(() => {
    setLabsLoading(true);
    fetch(`${BASE}/labsSoftware.php`).then(r => r.json()).then(d => {
      setLabs((d.labs || []).map(l => ({ lab_id: Number(l.lab_id), id: l.lab_name, name: l.lab_name, seats: Number(l.seats) || 30, building: l.building, room_number: l.room_number, software: l.software || [] })));
    }).finally(() => setLabsLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedLab || step !== 1) return;
    setSeatsLoading(true); setSelectedSeat(null);
    fetch(`${BASE}/reservations.php?lab=${encodeURIComponent(selectedLab.id)}&date=${selectedDate}`).then(r => r.json()).then(d => setReservedSeats(d.reserved_seats || [])).finally(() => setSeatsLoading(false));
  }, [selectedLab, selectedDate, step, selectedSlot]);

  const fetchMyReservations = () => { if (!idNumber) return; setMyResLoading(true); fetch(`${BASE}/reservations.php?id_number=${encodeURIComponent(idNumber)}`).then(r => r.json()).then(d => setMyReservations(d.reservations || [])).finally(() => setMyResLoading(false)); };
  useEffect(() => { if (tab === "mine") fetchMyReservations(); }, [tab]);

  const handleSubmit = async () => {
    if (!selectedSeat) { setError("Select a seat."); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE}/reservations.php`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "create", id_number: idNumber, lab_id: selectedLab.lab_id, lab: selectedLab.id, seat_number: selectedSeat, purpose, date: selectedDate, time_slot: selectedSlot }) });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Failed."); return; }
      setSuccessId(json.reservation_id); setStep(2);
    } finally { setSubmitting(false); }
  };

  const handleCancel = async (rid) => {
    setCancellingId(rid);
    try {
      const res = await fetch(`${BASE}/reservations.php`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "cancel", id_number: idNumber, reservation_id: rid }) });
      if (res.ok) fetchMyReservations();
    } finally { setCancellingId(null); }
  };

  return (
    <main className="min-h-screen bg-[#fef7ff] dark:bg-slate-950 font-['Montserrat'] transition-colors duration-300">
      <NavigationBar />
      <section className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12 space-y-6">
        <header className="px-2">
          <h1 className="text-2xl md:text-3xl font-bold text-[#381872] dark:text-violet-300 tracking-tight">Reservation.</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Secure your laboratory activity slot.</p>
        </header>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-1 border border-slate-100 dark:border-slate-800 shadow-sm inline-flex gap-1 ml-2">
           {["new", "mine"].map(t => (
             <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${tab === t ? "bg-[#381872] text-white shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>
               {t === "new" ? "Booking" : "History"}
             </button>
           ))}
        </div>

        {tab === "new" && (
          <div className="space-y-6">
            {step === 0 && (
              <div className="space-y-6">
                <div className="relative max-w-md ml-2">
                  <Search className="w-3.5 h-3.5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={labSearchQuery} onChange={e => setLabSearchQuery(e.target.value)} placeholder="Filter labs or software..." className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-300" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {labsLoading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="animate-pulse bg-white dark:bg-slate-900 rounded-2xl h-40 border border-slate-100 dark:border-slate-800" />) : filteredLabs.map(lab => (
                    <button key={lab.lab_id} onClick={() => { setSelectedLab(lab); setStep(1); }} className="bg-white dark:bg-slate-900 border p-5 rounded-2xl shadow-sm hover:shadow-lg transition-all text-left group overflow-hidden relative">
                       <div className="absolute top-0 right-0 w-16 h-16 bg-[#a67ffe]/5 rounded-bl-full group-hover:bg-[#a67ffe]/10 transition-colors" />
                       <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center text-[#381872] dark:text-violet-300 mb-4 transition-transform group-hover:scale-110"><MapPin size={20} /></div>
                       <h3 className="text-base font-bold dark:text-white line-clamp-1">{lab.name}</h3>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 mb-4">{lab.building}</p>
                       <div className="flex gap-3 text-[10px] font-bold text-slate-500"><span className="flex items-center gap-1"><Monitor size={12} /> {lab.seats}</span><span className="flex items-center gap-1"><Cpu size={12} /> {lab.software?.length || 0} SW</span></div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 1 && selectedLab && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-in fade-in duration-300">
                <div className="lg:col-span-4 space-y-4">
                  <div className="bg-[#381872] dark:bg-violet-950 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                    <button onClick={() => setStep(0)} className="mb-4 text-[9px] font-black uppercase tracking-widest flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity"><ChevronLeft size={12} /> Back</button>
                    <h3 className="text-xl font-bold">{selectedLab.name}</h3>
                    <p className="text-violet-200 text-[10px] font-black uppercase tracking-widest mt-1 mb-6">{selectedLab.building}</p>
                    <div className="space-y-3">
                       <input type="date" value={selectedDate} min={new Date().toISOString().split("T")[0]} onChange={e => setSelectedDate(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-xs font-bold focus:outline-none" />
                       <select value={selectedSlot} onChange={e => setSelectedSlot(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-xs font-bold focus:outline-none appearance-none">{TIME_SLOTS.map(s => <option key={s} value={s} className="text-slate-900">{s}</option>)}</select>
                       <select value={purpose} onChange={e => setPurpose(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-xs font-bold focus:outline-none appearance-none">{PURPOSES.map(p => <option key={p} value={p} className="text-slate-900">{p}</option>)}</select>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm text-center">
                    {selectedSeat ? (
                       <button onClick={handleSubmit} disabled={submitting} className="w-full py-3 bg-[#381872] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 disabled:opacity-50">
                          {submitting ? "Booking..." : `Confirm Seat #${selectedSeat}`}
                       </button>
                    ) : <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest py-2">Select a terminal on the map</p>}
                  </div>
                </div>

                <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                   <div className="flex justify-between items-center mb-6">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Monitor size={14} className="text-violet-500" />Terminal Layout</h4>
                      <div className="flex gap-3 text-[8px] font-black uppercase tracking-tighter"><span className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-emerald-400" /> Free</span><span className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-red-400" /> Taken</span></div>
                   </div>
                   {seatsLoading ? <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-violet-200" /></div> : (
                     <div className="max-w-xl mx-auto">
                        <div className="flex justify-center mb-8"><div className="px-6 py-1.5 rounded-lg bg-slate-800 dark:bg-slate-950 text-white text-[8px] font-black uppercase tracking-[0.3em]">Front</div></div>
                        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                           {Array.from({ length: selectedLab.seats }, (_, i) => {
                             const n = i + 1; const taken = reservedSeats.some(s => Number(s.seat_number) === n && s.time_slot === selectedSlot);
                             const chosen = selectedSeat === n;
                             return (
                               <button key={n} disabled={taken} onClick={() => setSelectedSeat(chosen ? null : n)} className={`aspect-square rounded-lg flex items-center justify-center text-[9px] font-black transition-all ${taken ? "bg-red-50 dark:bg-red-950/20 text-red-200 border border-red-100 dark:border-red-900/30" : chosen ? "bg-amber-400 text-white scale-110 shadow-lg ring-2 ring-amber-400 border-2 border-white" : "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 hover:border-violet-400 hover:scale-105"}`}>{n}</button>
                             );
                           })}
                        </div>
                     </div>
                   )}
                </div>
              </div>
            )}

            {step === 2 && (
               <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center shadow-xl max-w-md mx-auto animate-in zoom-in duration-300">
                  <CheckCircle size={48} className="text-emerald-500 mx-auto mb-6" />
                  <h2 className="text-xl font-bold mb-2">Request Filed</h2>
                  <p className="text-xs text-slate-500 mb-8 font-medium italic">Reservation #{successId} is pending approval.</p>
                  <div className="flex gap-2 justify-center"><button onClick={() => setStep(0)} className="px-6 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest">New</button><button onClick={() => { setTab("mine"); fetchMyReservations(); }} className="px-6 py-2 rounded-xl bg-[#381872] text-white text-[10px] font-black uppercase tracking-widest">History</button></div>
               </div>
            )}
          </div>
        )}

        {tab === "mine" && (
          <div className="space-y-6 animate-in fade-in duration-300">
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[{l: "Total", v: stats.total, i: History, c: "text-violet-400"}, {l: "Pending", v: stats.pending, i: Clock, c: "text-amber-400"}, {l: "Active", v: stats.approved, i: CheckCircle, c: "text-emerald-400"}, {l: "Done", v: stats.completed, i: CheckCircle2, c: "text-purple-400"}].map((s, idx) => (
                   <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3"><div className={`w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-950 flex items-center justify-center ${s.c}`}><s.i size={16} /></div><div><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{s.l}</p><p className="text-base font-bold">{s.v}</p></div></div>
                ))}
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {myResLoading && myReservations.length === 0 ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="animate-pulse bg-white dark:bg-slate-900 rounded-2xl h-32 border border-slate-100 dark:border-slate-800" />) : myReservations.map(r => (
                   <div key={r.reservation_id} className="bg-white dark:bg-slate-900 border p-5 rounded-2xl shadow-sm hover:shadow-lg transition-all relative overflow-hidden group flex flex-col">
                      <div className="flex justify-between items-start mb-4"><span className="text-[10px] font-black text-slate-400 uppercase">#{r.reservation_id}</span><span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${STATUS_COLORS[r.status]}`}>{r.status}</span></div>
                      <h4 className="text-sm font-bold text-[#381872] dark:text-white line-clamp-1 mb-4">{r.lab}</h4>
                      <div className="space-y-1.5 mb-6 flex-1"><div className="flex items-center gap-2 text-[10px] font-bold text-slate-500"><Monitor size={12} className="text-violet-400" /> Seat {r.seat_number}</div><div className="flex items-center gap-2 text-[10px] font-bold text-slate-500"><CalendarDays size={12} className="text-violet-400" /> {r.reserved_date}</div></div>
                      {r.status === "pending" && <button onClick={() => handleCancel(r.reservation_id)} className="w-full py-2 bg-red-50 dark:bg-red-950/20 text-red-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">Cancel</button>}
                   </div>
                ))}
             </div>
          </div>
        )}
      </section>
    </main>
  );
}
