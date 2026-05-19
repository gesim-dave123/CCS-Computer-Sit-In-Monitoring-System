import { useEffect, useState } from "react";
import NavigationBar from "../component/studentNavBar";
import ccslogo from "../assets/image/ccslogo.png";
import { Cpu, Search, Monitor, MapPin, Building2, ChevronRight, Info } from "lucide-react";

export default function StudentLabsSoftwarePage() {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/labsSoftware.php`)
      .then(r => r.json())
      .then(d => setLabs(d.labs || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = labs.filter(l => l.lab_name.toLowerCase().includes(search.toLowerCase()) || (l.software || []).some(s => s.software_name.toLowerCase().includes(search.toLowerCase())));

  return (
    <main className="min-h-screen bg-[#fef7ff] dark:bg-slate-950 font-['Montserrat'] transition-colors duration-300">
      <NavigationBar />
      <section className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12 space-y-6">
        <header className="px-2 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-2xl md:text-3xl font-bold text-[#381872] dark:text-violet-300 tracking-tight">Available Tech.</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Browse laboratory facilities and software suites.</p>
        </header>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm p-5 relative overflow-hidden group animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="relative z-10">
            <div className="relative max-w-md">
              <Search className="w-3.5 h-3.5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search labs or software..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-300" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          {loading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="animate-pulse bg-white dark:bg-slate-900 rounded-2xl h-48 border border-slate-100 dark:border-slate-800" />) : filtered.length === 0 ? <p className="col-span-full py-20 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">No matching facilities</p> : filtered.map(lab => (
            <div key={lab.lab_id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-lg transition-all group overflow-hidden relative">
               <div className="absolute top-0 right-0 w-16 h-16 bg-[#a67ffe]/5 rounded-bl-full group-hover:bg-[#a67ffe]/10 transition-colors" />
               <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center text-[#381872] dark:text-violet-300 mb-4"><Monitor size={20} /></div>
               <h3 className="text-base font-bold dark:text-white mb-2">{lab.lab_name}</h3>
               <div className="space-y-1.5 mb-5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2"><MapPin size={12} className="text-violet-400" />{lab.room_number || "Room ---"}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2"><Building2 size={12} className="text-violet-400" />{lab.building || "CCS Complex"}</p>
               </div>
               <div className="pt-4 border-t border-slate-50 dark:border-slate-800">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3">Software Suite</p>
                  <div className="flex flex-wrap gap-1">
                     {(lab.software || []).slice(0, 5).map(s => <span key={s.software_id} className="text-[8px] font-black px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-950 text-slate-400 border border-slate-100 dark:border-slate-800 uppercase">{s.software_name}</span>)}
                     {lab.software?.length > 5 && <span className="text-[8px] font-black px-2 py-0.5 rounded-md bg-violet-50 dark:bg-violet-900/30 text-violet-400 uppercase">+{lab.software.length - 5}</span>}
                  </div>
               </div>
            </div>
          ))}
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
