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
      setLabs((d.labs || []).map(l => ({ 
        lab_id: Number(l.lab_id), 
        id: l.lab_name, 
        name: l.lab_name, 
        seats: Number(l.seats) || 30, 
        building: l.building, 
        room_number: l.room_number, 
        software: l.software || [],
        status: l.status || 'active',
        disabled_terminals: l.disabled_terminals || []
      })));
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
        <header className="px-2 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-2xl md:text-3xl font-bold text-[#381872] dark:text-violet-300 tracking-tight">Reservation.</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Secure your laboratory activity slot.</p>
        </header>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-1 border border-slate-100 dark:border-slate-800 shadow-sm inline-flex gap-1 ml-2 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
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
                <div className="relative max-w-md ml-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  <Search className="w-3.5 h-3.5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={labSearchQuery} onChange={e => setLabSearchQuery(e.target.value)} placeholder="Filter labs or software..." className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-300" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                  {labsLoading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="animate-pulse bg-white dark:bg-slate-900 rounded-3xl h-56 border border-slate-100 dark:border-slate-800" />) : filteredLabs.map(lab => (
                    <button key={lab.lab_id} onClick={() => { if (lab.status !== 'maintenance') { setSelectedLab(lab); setStep(1); } }} className={`group bg-white dark:bg-slate-900 border p-6 rounded-3xl shadow-sm transition-all text-left overflow-hidden relative flex flex-col h-full ${lab.status === 'maintenance' ? 'opacity-60 cursor-not-allowed border-red-200 dark:border-red-900/50' : 'hover:shadow-xl hover:-translate-y-1 border-slate-100 dark:border-slate-800'}`}>
                       <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full transition-all duration-500 ${lab.status === 'maintenance' ? 'bg-red-500/5' : 'bg-gradient-to-br from-violet-500/5 to-purple-500/5 group-hover:from-violet-500/10 group-hover:to-purple-500/10'}`} />
                       
                       <div className="flex justify-between items-start mb-5 relative z-10">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm ${lab.status === 'maintenance' ? 'bg-red-100 dark:bg-red-900/40 text-red-500' : 'bg-white dark:bg-slate-800 text-[#381872] dark:text-violet-300 group-hover:bg-[#381872] group-hover:text-white group-hover:shadow-lg'}`}>
                            <MapPin size={22} strokeWidth={2.5} />
                          </div>
                          {lab.status === 'maintenance' ? (
                            <span className="text-[9px] font-black px-3 py-1.5 rounded-xl bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 uppercase tracking-widest border border-red-200/50 dark:border-red-800/50">Maintenance</span>
                          ) : (
                            <div className="flex -space-x-2">
                               {(lab.software || []).slice(0, 3).map((s, i) => (
                                 <div key={i} className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[#381872] dark:text-violet-300 shadow-sm overflow-hidden" title={s.software_name}>
                                    <span className="text-[8px] font-black">{s.software_name.substring(0, 2).toUpperCase()}</span>
                                 </div>
                               ))}
                               {(lab.software?.length || 0) > 3 && (
                                 <div className="w-7 h-7 rounded-lg bg-[#381872] text-white border-2 border-white dark:border-slate-900 flex items-center justify-center text-[8px] font-black shadow-sm">
                                   +{(lab.software?.length || 0) - 3}
                                 </div>
                               )}
                            </div>
                          )}
                       </div>

                       <div className="relative z-10 flex-grow">
                          <h3 className={`text-lg font-bold tracking-tight mb-1 ${lab.status === 'maintenance' ? 'text-red-900 dark:text-red-200' : 'text-slate-800 dark:text-white'}`}>{lab.name}</h3>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                             <span className="flex items-center gap-1"><Monitor size={12} className="text-violet-400" /> {lab.seats} Seats</span>
                             <span className="w-1 h-1 rounded-full bg-slate-200" />
                             <span>{lab.building}</span>
                          </div>

                          <div className="space-y-2 mt-auto">
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Installed Tools</p>
                            <div className="flex flex-wrap gap-1.5">
                               {lab.software && lab.software.length > 0 ? (
                                 lab.software.slice(0, 4).map(s => (
                                   <span key={s.software_id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-[9px] font-bold text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700/50 group-hover:border-violet-200 group-hover:bg-violet-50 dark:group-hover:bg-violet-900/10 transition-colors">
                                      <div className="w-1 h-1 rounded-full bg-violet-400" />
                                      {s.software_name}
                                   </span>
                                 ))
                               ) : (
                                 <span className="text-[9px] text-slate-400 italic">No special software listed</span>
                               )}
                            </div>
                          </div>
                       </div>
                       
                       <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-between">
                          <span className="text-[10px] font-black text-[#381872] dark:text-violet-400 uppercase tracking-widest group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                             Select Lab <ChevronRight size={14} />
                          </span>
                       </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 1 && selectedLab && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in-up">
                <div className="lg:col-span-4 space-y-5">
                  <div className="bg-[#381872] dark:bg-violet-950 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                    <button onClick={() => setStep(0)} className="mb-6 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 opacity-60 hover:opacity-100 hover:-translate-x-1 transition-all">
                       <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center"><ChevronLeft size={14} /></div>
                       Return to Labs
                    </button>
                    
                    <div className="relative z-10">
                       <h3 className="text-2xl font-bold tracking-tight">{selectedLab.name}</h3>
                       <div className="flex items-center gap-2 text-violet-200 text-[10px] font-black uppercase tracking-widest mt-1 mb-8">
                          <MapPin size={12} /> {selectedLab.building}
                       </div>

                       <div className="space-y-4">
                          <div className="space-y-1.5">
                             <label className="text-[9px] font-black text-violet-300 uppercase tracking-widest ml-1">Schedule Date</label>
                             <div className="relative">
                                <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-300 w-4 h-4" />
                                <input type="date" value={selectedDate} min={new Date().toISOString().split("T")[0]} onChange={e => setSelectedDate(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-2xl pl-11 pr-4 py-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-white/20 transition-all cursor-pointer" />
                             </div>
                          </div>
                          
                          <div className="space-y-1.5">
                             <label className="text-[9px] font-black text-violet-300 uppercase tracking-widest ml-1">Time Slot</label>
                             <div className="relative">
                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-300 w-4 h-4" />
                                <select value={selectedSlot} onChange={e => setSelectedSlot(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-2xl pl-11 pr-4 py-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-white/20 transition-all appearance-none cursor-pointer">
                                   {TIME_SLOTS.map(s => <option key={s} value={s} className="text-slate-900">{s}</option>)}
                                </select>
                             </div>
                          </div>

                          <div className="space-y-1.5">
                             <label className="text-[9px] font-black text-violet-300 uppercase tracking-widest ml-1">Academic Purpose</label>
                             <div className="relative">
                                <BookMarked className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-300 w-4 h-4" />
                                <select value={purpose} onChange={e => setPurpose(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-2xl pl-11 pr-4 py-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-white/20 transition-all appearance-none cursor-pointer">
                                   {PURPOSES.map(p => <option key={p} value={p} className="text-slate-900">{p}</option>)}
                                </select>
                             </div>
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-7 border border-slate-100 dark:border-slate-800 shadow-sm animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
                    <div className="flex items-center justify-between mb-5">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                         <Cpu size={16} className="text-violet-500" />
                         Lab Technical Stack
                       </h4>
                       <span className="text-[10px] font-bold text-slate-300">{selectedLab.software?.length || 0} Tools</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedLab.software && selectedLab.software.length > 0 ? (
                        selectedLab.software.map(s => {
                          const name = s.software_name.toLowerCase();
                          let Icon = Code;
                          let color = "text-blue-500 bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/20";
                          
                          if (name.includes('db') || name.includes('sql') || name.includes('oracle')) {
                            Icon = Database;
                            color = "text-amber-500 bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/20";
                          } else if (name.includes('adobe') || name.includes('photo') || name.includes('design')) {
                            Icon = Palette;
                            color = "text-pink-500 bg-pink-50 dark:bg-pink-900/10 border-pink-100 dark:border-pink-900/20";
                          } else if (name.includes('web') || name.includes('html') || name.includes('js')) {
                            Icon = Globe;
                            color = "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/20";
                          } else if (name.includes('office') || name.includes('word') || name.includes('excel')) {
                            Icon = FileText;
                            color = "text-sky-500 bg-sky-50 dark:bg-sky-900/10 border-sky-100 dark:border-sky-900/20";
                          }

                          return (
                            <div key={s.software_id} className={`flex items-center gap-3 px-3 py-3 rounded-2xl border transition-all hover:shadow-sm group/sw ${color}`}>
                               <div className="p-1.5 rounded-lg bg-white/50 dark:bg-black/20">
                                  <Icon size={14} />
                               </div>
                               <span className="text-[10px] font-bold truncate">
                                 {s.software_name}
                               </span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="col-span-2 py-4 text-center">
                           <p className="text-[10px] text-slate-400 italic font-medium uppercase tracking-widest">Standard OS Config Only</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-7 border border-slate-100 dark:border-slate-800 shadow-sm text-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    {selectedSeat ? (
                       <button onClick={handleSubmit} disabled={submitting} className="w-full py-4 bg-[#381872] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-violet-500/10 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-3">
                          {submitting ? (
                             <><Loader2 size={16} className="animate-spin" /> Finalizing...</>
                          ) : (
                             <><CheckCircle2 size={18} /> Book Computer #{selectedSeat}</>
                          )}
                       </button>
                    ) : (
                       <div className="py-2 px-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                          <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                             Please choose a computer
                          </p>
                       </div>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
                   <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                      <Monitor size={400} />
                   </div>
                   
                   <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 relative z-10">
                      <div>
                         <h4 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-3">
                           <div className="p-2 bg-violet-100 dark:bg-violet-900/40 rounded-xl text-violet-600 dark:text-violet-400"><Monitor size={20} /></div>
                           Computer Seat Map
                         </h4>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Select your preferred spot</p>
                      </div>
                      <div className="flex gap-4 p-2 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                         <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                            <span className="text-[9px] font-black text-slate-500 uppercase">Available</span>
                         </div>
                         <div className="flex items-center gap-2 px-3 py-1.5 opacity-60">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                            <span className="text-[9px] font-black text-slate-500 uppercase">Taken</span>
                         </div>
                      </div>
                   </div>

                   {seatsLoading ? (
                      <div className="py-32 flex flex-col items-center justify-center gap-4">
                         <div className="w-16 h-16 border-4 border-violet-100 dark:border-violet-900/30 border-t-violet-500 rounded-full animate-spin" />
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Syncing Map...</p>
                      </div>
                   ) : (
                     <div className="relative z-10 overflow-x-auto pb-6">
                        <div className="flex flex-col items-center mb-12 min-w-max">
                           <div className="w-full max-w-md h-2 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent rounded-full mb-4 opacity-50" />
                           <div className="px-10 py-2.5 rounded-2xl bg-[#381872] text-white text-[9px] font-black uppercase tracking-[0.4em] shadow-xl shadow-violet-500/20">Professor's Area / Whiteboard</div>
                        </div>
                        
                        <div className="flex justify-center gap-4 min-w-max px-8">
                           {Array.from({ length: Math.ceil(selectedLab.seats / 7) }, (_, colIdx) => (
                              <div key={colIdx} className={`flex flex-col gap-3 ${colIdx % 2 === 0 && colIdx > 0 ? 'ml-12' : ''}`}>
                                 {Array.from({ length: 7 }, (_, rowIdx) => {
                                    const n = colIdx * 7 + rowIdx + 1;
                                    if (n > selectedLab.seats) return null;
                                    const taken = reservedSeats.some(s => Number(s.seat_number) === n && s.time_slot === selectedSlot);
                                    const disabled = (selectedLab.disabled_terminals || []).some(t => t.seat_number === n);
                                    const chosen = selectedSeat === n;
                                    const notAvailable = taken || disabled;
                                    return (
                                       <button 
                                         key={n} 
                                         disabled={notAvailable} 
                                         onClick={() => setSelectedSeat(chosen ? null : n)} 
                                         className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-300 relative group/seat ${
                                           disabled ? "bg-slate-50 dark:bg-slate-800/50 text-slate-300 dark:text-slate-600 border border-slate-100 dark:border-slate-800 cursor-not-allowed" :
                                           taken ? "bg-slate-50 dark:bg-slate-800 text-slate-200 dark:text-slate-700 border border-slate-100 dark:border-slate-800 cursor-not-allowed grayscale" : 
                                           chosen ? "bg-[#381872] text-white scale-110 shadow-2xl shadow-violet-500/40 ring-4 ring-violet-500/10 z-20" : 
                                           "bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/30 hover:border-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 hover:shadow-lg hover:-translate-y-1"
                                         }`}
                                       >
                                          <Monitor size={chosen ? 18 : 14} strokeWidth={2.5} className="mb-0.5" />
                                          <span className="text-[10px] font-black">{n}</span>
                                          {taken && <X className="absolute top-1 right-1 w-2.5 h-2.5 text-red-300 dark:text-red-900" />}
                                          {disabled && <Info className="absolute top-1 right-1 w-2.5 h-2.5 text-slate-300 dark:text-slate-600" />}
                                       </button>
                                    );
                                 })}
                              </div>
                           ))}
                        </div>

                        <div className="mt-16 flex flex-wrap justify-center gap-8 border-t border-slate-50 dark:border-slate-800/50 pt-8 min-w-max">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500"><Monitor size={18} /></div>
                              <div>
                                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Available</p>
                                 <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{selectedLab.seats - reservedSeats.filter(s => s.time_slot === selectedSlot).length - (selectedLab.disabled_terminals || []).length} Units</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-400"><XCircle size={18} /></div>
                              <div>
                                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Reserved</p>
                                 <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{reservedSeats.filter(s => s.time_slot === selectedSlot).length} Units</p>
                              </div>
                           </div>
                        </div>
                     </div>
                   )}
                </div>
              </div>
            )}

            {step === 2 && (
               <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center shadow-xl max-w-md mx-auto animate-fade-in-up">
                  <CheckCircle size={48} className="text-emerald-500 mx-auto mb-6" />
                  <h2 className="text-xl font-bold mb-2">Request Filed</h2>
                  <p className="text-xs text-slate-500 mb-8 font-medium italic">Reservation #{successId} is pending approval.</p>
                  <div className="flex gap-2 justify-center"><button onClick={() => setStep(0)} className="px-6 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest">New</button><button onClick={() => { setTab("mine"); fetchMyReservations(); }} className="px-6 py-2 rounded-xl bg-[#381872] text-white text-[10px] font-black uppercase tracking-widest">History</button></div>
               </div>
            )}
          </div>
        )}

        {tab === "mine" && (
          <div className="space-y-6 animate-fade-in-up">
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                {[{l: "Total", v: stats.total, i: History, c: "text-violet-400"}, {l: "Pending", v: stats.pending, i: Clock, c: "text-amber-400"}, {l: "Active", v: stats.approved, i: CheckCircle, c: "text-emerald-400"}, {l: "Done", v: stats.completed, i: CheckCircle2, c: "text-purple-400"}].map((s, idx) => (
                   <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3 transition-all hover:shadow-md"><div className={`w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-950 flex items-center justify-center ${s.c}`}><s.i size={16} /></div><div><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{s.l}</p><p className="text-base font-bold">{s.v}</p></div></div>
                ))}
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                {myResLoading && myReservations.length === 0 ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="animate-pulse bg-white dark:bg-slate-900 rounded-2xl h-32 border border-slate-100 dark:border-slate-800" />) : myReservations.map(r => (
                   <div key={r.reservation_id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-lg transition-all relative overflow-hidden group flex flex-col">
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
