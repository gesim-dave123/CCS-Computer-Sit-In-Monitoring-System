import { useEffect, useState, useMemo } from "react";
import AdminNavigationBar from "../component/adminNavigationBar";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  X, 
  Cpu, 
  Monitor, 
  MapPin, 
  Building2, 
  Search, 
  Check,
  ChevronDown,
  Info,
  Users,
  Box,
  LayoutGrid,
  Settings2,
  FileCode2,
  Database,
  Globe,
  AppWindow,
  PowerOff,
  Wrench
} from "lucide-react";

const CATEGORIES = ["IDE", "Office", "Database", "Design", "Browser", "Utility", "Other"];

export default function AdminLabsSoftwarePage() {
  const [activeTab, setActiveTab] = useState("labs"); // "labs" or "software"
  const [allSoftware, setAllSoftware] = useState([]);
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search
  const [labSearch, setLabSearch] = useState("");
  const [swMainSearch, setSwMainSearch] = useState("");

  // Detail modal
  const [activeLab, setActiveLab] = useState(null);
  const [activeSoftware, setActiveSoftware] = useState(null);
  const [swSearch, setSwSearch] = useState("");

  // Lab form modal
  const [showLabForm, setShowLabForm] = useState(false);
  const [editLab, setEditLab] = useState(null);
  const [lf, setLf] = useState({ name: "", room: "", seats: 30, building: "CCS Building" });
  const [labSaving, setLabSaving] = useState(false);
  const [labErr, setLabErr] = useState("");

  // Software form modal
  const [showSwForm, setShowSwForm] = useState(false);
  const [editSw, setEditSw] = useState(null);
  const [sf, setSf] = useState({ name: "", category: "", icon: "" });
  const [swSaving, setSwSaving] = useState(false);
  const [swErr, setSwErr] = useState("");

  const [labModalTab, setLabModalTab] = useState("software"); // "software" or "terminals"
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: 'lab', id: null, name: '' });

  const API = import.meta.env.VITE_API_BASE_URL;
  const post = (body) => fetch(`${API}/labsSoftware.php`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

  const fetchAll = async () => {
    try {
      const [r1, r2] = await Promise.all([fetch(`${API}/labsSoftware.php?admin=1`), fetch(`${API}/labsSoftware.php`)]);
      const [j1, j2] = await Promise.all([r1.json(), r2.json()]);
      setAllSoftware(j1.software || []);
      setLabs(j2.labs || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { fetchAll().finally(() => setLoading(false)); }, []);

  useEffect(() => {
    if (activeLab) {
      const fresh = labs.find(l => l.lab_id == activeLab.lab_id);
      if (fresh) setActiveLab(fresh);
    }
  }, [labs]);

  const softwareWithLabs = useMemo(() => {
    return allSoftware.map(sw => ({
      ...sw,
      installedIn: labs.filter(lab => (lab.software || []).some(ls => String(ls.software_id) === String(sw.software_id)))
    }));
  }, [allSoftware, labs]);

  const filteredLabs = labs.filter(l => 
    l.lab_name.toLowerCase().includes(labSearch.toLowerCase()) || 
    (l.room_number || "").toLowerCase().includes(labSearch.toLowerCase())
  );

  const filteredSoftwareMain = softwareWithLabs.filter(s => 
    s.software_name.toLowerCase().includes(swMainSearch.toLowerCase()) || 
    (s.category || "").toLowerCase().includes(swMainSearch.toLowerCase())
  );

  const openAddLab = () => { setEditLab(null); setLf({ name: "", room: "", seats: 30, building: "CCS Building" }); setLabErr(""); setShowLabForm(true); };
  const openEditLab = (lab) => { setEditLab(lab); setLf({ name: lab.lab_name, room: lab.room_number || "", seats: Number(lab.seats) || 30, building: lab.building || "CCS Building" }); setLabErr(""); setShowLabForm(true); };

  const saveLab = async () => {
    if (!lf.name.trim()) { setLabErr("Lab name is required"); return; }
    setLabSaving(true); setLabErr("");
    const body = { action: editLab ? "update_lab" : "add_lab", lab_name: lf.name.trim(), room_number: lf.room.trim(), seats: Math.max(1, lf.seats), building: lf.building.trim() || "CCS Building" };
    if (editLab) body.lab_id = editLab.lab_id;
    try {
      const res = await post(body); const json = await res.json();
      if (!res.ok) { setLabErr(json.error || "Failed"); return; }
      setShowLabForm(false); await fetchAll();
    } catch { setLabErr("Server error"); } finally { setLabSaving(false); }
  };

  const deleteLab = (labId, labName) => {
    setConfirmDialog({ open: true, type: 'lab', id: labId, name: labName });
  };

  const openAddSw = () => { setEditSw(null); setSf({ name: "", category: "", icon: "" }); setSwErr(""); setShowSwForm(true); };
  const openEditSw = (sw) => { setEditSw(sw); setSf({ name: sw.software_name, category: sw.category || "", icon: sw.icon_url || "" }); setSwErr(""); setShowSwForm(true); };

  const saveSw = async () => {
    if (!sf.name.trim()) { setSwErr("Name is required"); return; }
    setSwSaving(true); setSwErr("");
    const body = { action: editSw ? "update_software" : "add_software", software_name: sf.name.trim(), category: sf.category, icon_url: sf.icon };
    if (editSw) body.software_id = editSw.software_id;
    try {
      const res = await post(body); const json = await res.json();
      if (!res.ok) { setSwErr(json.error || "Failed"); return; }
      setShowSwForm(false); await fetchAll();
    } catch { setSwErr("Server error"); } finally { setSwSaving(false); }
  };

  const deleteSw = (id, name) => {
    setConfirmDialog({ open: true, type: 'software', id, name });
  };

  const handleConfirmDelete = async () => {
    const { type, id } = confirmDialog;
    if (type === 'lab') {
      await post({ action: "delete_lab", lab_id: id });
      if (activeLab?.lab_id == id) setActiveLab(null);
    } else {
      await post({ action: "delete_software", software_id: id });
      if (activeSoftware?.software_id == id) setActiveSoftware(null);
    }
    setConfirmDialog({ open: false, type: 'lab', id: null, name: '' });
    await fetchAll();
  };

  const toggleAssign = async (labId, swId, assigned) => {
    await post({ action: assigned ? "remove_software" : "assign_software", lab_id: labId, software_id: swId });
    await fetchAll();
  };

  const toggleTerminalStatus = async (labId, seatNumber, currentlyDisabled) => {
    const action = currentlyDisabled ? "enable_terminal" : "disable_terminal";
    const body = { action, lab_id: labId, seat_number: seatNumber, reason: "Maintenance" };
    try {
      await post(body);
      await fetchAll();
    } catch(e) { console.error(e); }
  };

  const toggleLabStatus = async (labId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'maintenance' : 'active';
    try {
      await post({ action: "update_lab_status", lab_id: labId, status: newStatus });
      await fetchAll();
    } catch(e) { console.error(e); }
  };

  const assignedIds = new Set((activeLab?.software || []).map(s => String(s.software_id)));
  const filteredSwModal = allSoftware.filter(s => !swSearch || s.software_name.toLowerCase().includes(swSearch.toLowerCase()) || (s.category || "").toLowerCase().includes(swSearch.toLowerCase()));

  return (
    <main className="min-h-screen bg-[#fef7ff] dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-['Montserrat'] md:pl-64 transition-colors duration-300">
      <AdminNavigationBar />
      
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12 space-y-8">
        <header className="px-2 flex flex-col md:flex-row md:items-end justify-between gap-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#381872] dark:text-violet-300 tracking-tight">Repository.</h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 mt-2 font-medium">Provision laboratory assets and catalog software suites.</p>
          </div>
          <div className="flex gap-3">
             {activeTab === "labs" ? (
               <button onClick={openAddLab} className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#381872] dark:bg-violet-800 text-white text-xs font-black uppercase tracking-widest hover:bg-[#220055] transition-all shadow-lg active:scale-95">
                 <Plus size={16} /> New Laboratory
               </button>
             ) : (
               <button onClick={openAddSw} className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#381872] dark:bg-violet-800 text-white text-xs font-black uppercase tracking-widest hover:bg-[#220055] transition-all shadow-lg active:scale-95">
                 <Plus size={16} /> Register Software
               </button>
             )}
          </div>
        </header>

        {/* Tab Switcher */}
        <div className="flex gap-8 border-b border-slate-100 dark:border-slate-800 px-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <button 
            onClick={() => setActiveTab("labs")}
            className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === "labs" ? "text-[#381872] dark:text-violet-300" : "text-slate-400 hover:text-slate-600"}`}
          >
            Laboratories
            {activeTab === "labs" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#381872] dark:bg-violet-300 animate-in fade-in slide-in-from-left-2 duration-300"></div>}
          </button>
          <button 
            onClick={() => setActiveTab("software")}
            className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === "software" ? "text-[#381872] dark:text-violet-300" : "text-slate-400 hover:text-slate-600"}`}
          >
            Software Suite
            {activeTab === "software" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#381872] dark:bg-violet-300 animate-in fade-in slide-in-from-left-2 duration-300"></div>}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-violet-100 border-t-[#381872] rounded-full animate-spin" /></div>
        ) : (
          <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            {/* Search Filters */}
            <div className="px-2">
               <div className="relative max-w-md">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    value={activeTab === "labs" ? labSearch : swMainSearch} 
                    onChange={e => activeTab === "labs" ? setLabSearch(e.target.value) : setSwMainSearch(e.target.value)}
                    placeholder={activeTab === "labs" ? "Search laboratories..." : "Search software or categories..."} 
                    className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-300 shadow-sm" 
                  />
               </div>
            </div>

            {activeTab === "labs" ? (
              labs.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-20 text-center">
                  <Monitor className="w-16 h-16 text-slate-100 dark:text-slate-800 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No laboratories established</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in duration-500">
                  {filteredLabs.map(lab => {
                    const sw = lab.software || [];
                    return (
                      <button key={lab.lab_id} onClick={() => { setActiveLab(lab); setSwSearch(""); }}
                        className={`group relative rounded-2xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left overflow-hidden border ${
                          lab.status === 'maintenance'
                            ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/60 ring-1 ring-red-300 dark:ring-red-800'
                            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
                        }`}>
                        <div className={`absolute top-0 right-0 w-20 h-20 rounded-bl-full transition-colors ${
                          lab.status === 'maintenance' ? 'bg-red-200/30 group-hover:bg-red-200/50' : 'bg-[#a67ffe]/5 group-hover:bg-[#a67ffe]/10'
                        }`}></div>

                        {/* Maintenance banner */}
                        {lab.status === 'maintenance' && (
                          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-rose-400 to-red-500" />
                        )}
                        
                        <div className="flex items-start justify-between mb-5 relative z-10">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            lab.status === 'maintenance'
                              ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'
                              : 'bg-violet-50 dark:bg-violet-900/30 text-[#381872] dark:text-violet-300'
                          }`}>
                            {lab.status === 'maintenance' ? <Wrench size={20} /> : <Monitor size={20} />}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {lab.status === 'maintenance' ? (
                              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 uppercase tracking-tighter shadow-sm border border-red-200 dark:border-red-800 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
                                MAINTENANCE
                              </span>
                            ) : (
                              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 uppercase tracking-tighter shadow-sm border border-emerald-100 dark:border-emerald-800">
                                {sw.length} SW
                              </span>
                            )}
                          </div>
                        </div>

                        <h3 className={`text-lg font-bold mb-3 line-clamp-1 uppercase tracking-tight ${
                          lab.status === 'maintenance' ? 'text-red-700 dark:text-red-300' : 'text-[#381872] dark:text-white'
                        }`}>{lab.lab_name}</h3>
                        
                        <div className="space-y-1.5 mb-5">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase">
                             <MapPin size={12} className={lab.status === 'maintenance' ? 'text-red-400' : 'text-violet-400'} /> {lab.room_number || "---"}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase">
                             <Users size={12} className={lab.status === 'maintenance' ? 'text-red-400' : 'text-violet-400'} /> {lab.seats || 30} Nodes
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {sw.slice(0, 3).map(s => <span key={s.software_id} className="text-[9px] font-black px-2 py-1 rounded-md bg-slate-50 dark:bg-slate-950 text-slate-400 uppercase border border-slate-100 dark:border-slate-800">{s.software_name}</span>)}
                          {sw.length > 3 && <span className="text-[9px] font-black px-2 py-1 rounded-md bg-violet-50 dark:bg-violet-900/30 text-violet-400 uppercase">+{sw.length - 3}</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )
            ) : (
              allSoftware.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-20 text-center">
                  <Box className="w-16 h-16 text-slate-100 dark:text-slate-800 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Software registry is empty</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in duration-500">
                  {filteredSoftwareMain.map(sw => {
                    const labsWithSw = sw.installedIn || [];
                    return (
                      <div 
                        key={sw.software_id} 
                        onClick={() => setActiveSoftware(sw)}
                        className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all flex flex-col relative overflow-hidden cursor-pointer"
                      >
                        <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-bl-3xl -mr-8 -mt-8 group-hover:w-20 group-hover:h-20 transition-all"></div>
                        
                        <div className="flex items-start justify-between mb-5">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-violet-500 transition-colors">
                            {sw.category === "IDE" ? <FileCode2 size={20} /> : 
                             sw.category === "Database" ? <Database size={20} /> :
                             sw.category === "Browser" ? <Globe size={20} /> :
                             <AppWindow size={20} />}
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button 
                               onClick={(e) => { e.stopPropagation(); openEditSw(sw); }} 
                               className="p-1.5 rounded-lg text-slate-400 hover:text-[#381872] dark:hover:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-all"
                             >
                               <Pencil size={14} />
                             </button>
                             <button 
                               onClick={(e) => { e.stopPropagation(); deleteSw(sw.software_id); }} 
                               className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all"
                             >
                               <Trash2 size={14} />
                             </button>
                          </div>
                        </div>

                        <h3 className="text-sm font-black text-slate-700 dark:text-white mb-1 uppercase tracking-tight">{sw.software_name}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{sw.category || "Utility"}</p>
                        
                        <div className="mt-auto">
                           <div className="flex items-center justify-between mb-2">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Availability</span>
                              <span className="text-[10px] font-black text-emerald-500">{labsWithSw.length} LABS</span>
                           </div>
                           <div className="flex flex-wrap gap-1">
                             {labsWithSw.length === 0 ? (
                               <span className="text-[9px] font-bold text-slate-300 italic uppercase">Not installed</span>
                             ) : (
                               <>
                                 {labsWithSw.slice(0, 2).map(l => (
                                   <span key={l.lab_id} className="text-[9px] font-bold px-2 py-0.5 rounded bg-violet-50 dark:bg-violet-900/20 text-[#381872] dark:text-violet-300 border border-violet-100/50 dark:border-violet-800/30">
                                     {l.lab_name}
                                   </span>
                                 ))}
                                 {labsWithSw.length > 2 && (
                                   <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-50 dark:bg-slate-800 text-slate-400">
                                     +{labsWithSw.length - 2} more
                                   </span>
                                 )}
                               </>
                             )}
                           </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Software Detail Modal */}
      {activeSoftware && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) setActiveSoftware(null); }}>
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200 border border-slate-100 dark:border-slate-800">
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-6 text-white flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                    {activeSoftware.category === "IDE" ? <FileCode2 size={24} /> : 
                     activeSoftware.category === "Database" ? <Database size={24} /> :
                     activeSoftware.category === "Browser" ? <Globe size={24} /> :
                     <AppWindow size={24} />}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold uppercase tracking-tight">{activeSoftware.software_name}</h2>
                    <p className="text-violet-100 text-[10px] font-bold uppercase tracking-widest">{activeSoftware.category || "Utility"} MODULE</p>
                  </div>
               </div>
               <button onClick={() => setActiveSoftware(null)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all"><X size={18} /></button>
            </div>
            
            <div className="p-8">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Deployment Reach</h3>
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 uppercase tracking-tighter border border-emerald-100 dark:border-emerald-800">
                    {activeSoftware.installedIn?.length || 0} TOTAL LABS
                  </span>
               </div>

               <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                  {(!activeSoftware.installedIn || activeSoftware.installedIn.length === 0) ? (
                    <div className="py-10 text-center space-y-2 opacity-50">
                       <Monitor size={32} className="mx-auto text-slate-300" />
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Not provisioned in any node</p>
                    </div>
                  ) : activeSoftware.installedIn.map(lab => (
                    <div key={lab.lab_id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 group hover:border-violet-200 dark:hover:border-violet-900 transition-all">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:text-violet-500 transition-colors">
                             <Monitor size={14} />
                          </div>
                          <div>
                             <p className="text-xs font-black text-slate-700 dark:text-white uppercase tracking-tight">{lab.lab_name}</p>
                             <p className="text-[9px] font-bold text-slate-400 uppercase">{lab.room_number || "Main Floor"}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-[9px] font-black text-violet-500 uppercase tracking-tighter">Active Node</p>
                       </div>
                    </div>
                  ))}
               </div>

               <div className="mt-8 flex gap-3">
                  <button onClick={() => { setEditSw(activeSoftware); setSf({ name: activeSoftware.software_name, category: activeSoftware.category || "", icon: activeSoftware.icon_url || "" }); setActiveSoftware(null); setShowSwForm(true); }} className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                    Configure Registry
                  </button>
                  <button onClick={() => setActiveSoftware(null)} className="flex-1 py-3 rounded-xl bg-[#381872] text-white text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                    Dismiss
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {activeLab && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) setActiveLab(null); }}>
          <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200 border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh]">
            <div className={`px-8 py-6 text-white flex items-center justify-between transition-colors duration-500 ${activeLab.status === 'maintenance' ? 'bg-gradient-to-r from-red-800 to-rose-600' : 'bg-gradient-to-r from-[#381872] to-[#6c44c1]'}`}>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold">{activeLab.lab_name}</h2>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${activeLab.status === 'maintenance' ? 'bg-red-900/50 border-red-400 text-red-100' : 'bg-white/20 border-white/30 text-white'}`}>
                    {activeLab.status === 'maintenance' ? 'Maintenance' : 'Active'}
                  </span>
                </div>
                <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mt-1">Configuring {activeLab.room_number} • {activeLab.seats} Seats</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggleLabStatus(activeLab.lab_id, activeLab.status)} className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all flex items-center gap-2 text-xs font-bold" title={activeLab.status === 'maintenance' ? 'Activate Lab' : 'Put in Maintenance'}>
                  {activeLab.status === 'maintenance' ? <PowerOff size={18} /> : <Wrench size={18} />}
                  {activeLab.status === 'maintenance' ? 'ACTIVATE' : 'MAINTENANCE'}
                </button>
                <button onClick={() => openEditLab(activeLab)} className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all"><Pencil size={18} /></button>
                <button onClick={() => deleteLab(activeLab.lab_id, activeLab.lab_name)} className="p-2.5 rounded-xl bg-black/20 hover:bg-black/40 transition-all text-red-200 hover:text-red-100"><Trash2 size={18} /></button>
                <button onClick={() => setActiveLab(null)} className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all"><X size={18} /></button>
              </div>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-8">
              <button 
                onClick={() => setLabModalTab("software")} 
                className={`py-3 px-4 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${labModalTab === "software" ? "border-[#381872] dark:border-violet-400 text-[#381872] dark:text-violet-300" : "border-transparent text-slate-400 hover:text-slate-600"}`}
              >
                Software Catalog
              </button>
              <button 
                onClick={() => setLabModalTab("terminals")} 
                className={`py-3 px-4 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${labModalTab === "terminals" ? "border-[#381872] dark:border-violet-400 text-[#381872] dark:text-violet-300" : "border-transparent text-slate-400 hover:text-slate-600"}`}
              >
                Terminal Health
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {labModalTab === "software" && (
                <div className="grid grid-cols-1 md:grid-cols-2">
                   <div className="p-8 border-r border-slate-100 dark:border-slate-800">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Installed Modules</h3>
                      <div className="space-y-2">
                         {(activeLab.software || []).length === 0 ? <p className="text-xs text-slate-400 italic">No software assigned.</p> : (activeLab.software || []).map(s => (
                           <div key={s.software_id} className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50">
                              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">{s.software_name}</span>
                              <button onClick={() => toggleAssign(activeLab.lab_id, s.software_id, true)} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-400 transition-colors"><X size={12} /></button>
                           </div>
                         ))}
                      </div>
                   </div>
                   <div className="p-8 bg-slate-50/50 dark:bg-slate-800/20">
                      <div className="flex items-center justify-between mb-6">
                         <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Global Catalog</h3>
                         <button onClick={openAddSw} className="text-[10px] font-black text-[#381872] dark:text-violet-300 hover:underline uppercase tracking-tighter">Register New</button>
                      </div>
                      <div className="relative mb-4">
                         <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                         <input type="text" value={swSearch} onChange={e => setSwSearch(e.target.value)} placeholder="Search catalog..." className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none" />
                      </div>
                      <div className="space-y-1.5">
                         {filteredSwModal.map(sw => {
                           const assigned = assignedIds.has(String(sw.software_id));
                           return (
                             <div key={sw.software_id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${assigned ? "border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950" : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-violet-200 dark:hover:border-violet-900"}`}>
                                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{sw.software_name}</span>
                                <button onClick={() => toggleAssign(activeLab.lab_id, sw.software_id, assigned)} className={`p-1.5 rounded-lg ${assigned ? "text-emerald-500" : "text-slate-300 hover:text-violet-500"}`}>
                                   {assigned ? <Check size={14} /> : <Plus size={14} />}
                                </button>
                             </div>
                           );
                         })}
                      </div>
                   </div>
                </div>
              )}

              {labModalTab === "terminals" && (
                <div className="p-8">
                   <div className="flex justify-between items-center mb-6">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Wrench size={14} className="text-violet-500" /> Computer Health & Provisioning</h4>
                      <div className="flex gap-3 text-[8px] font-black uppercase tracking-tighter">
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-emerald-400" /> Operational</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-red-400" /> Maintenance</span>
                      </div>
                   </div>
                   <p className="text-xs text-slate-500 mb-8 italic">Click on a computer to toggle its operational status. Computers in maintenance mode cannot be reserved by students.</p>
                   
                   <div className="relative z-10 overflow-x-auto pb-6">
                        <div className="flex flex-col items-center mb-12 min-w-max">
                           <div className="w-full max-w-md h-2 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent rounded-full mb-4 opacity-50" />
                           <div className="px-10 py-2.5 rounded-2xl bg-slate-800 dark:bg-slate-950 text-white text-[9px] font-black uppercase tracking-[0.4em] shadow-xl">Instructor's Area / Desk</div>
                        </div>
                        
                        <div className="flex justify-center gap-4 min-w-max px-8">
                           {Array.from({ length: Math.ceil(activeLab.seats / 7) }, (_, colIdx) => (
                              <div key={colIdx} className={`flex flex-col gap-3 ${colIdx % 2 === 0 && colIdx > 0 ? 'ml-12' : ''}`}>
                                 {Array.from({ length: 7 }, (_, rowIdx) => {
                                    const n = colIdx * 7 + rowIdx + 1;
                                    if (n > activeLab.seats) return null;
                                    const isDisabled = (activeLab.disabled_terminals || []).some(t => t.seat_number === n);
                                    return (
                                       <button 
                                         key={n} 
                                         onClick={() => toggleTerminalStatus(activeLab.lab_id, n, isDisabled)} 
                                         title={isDisabled ? "Click to enable" : "Click to disable"}
                                         className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-300 relative group/seat shadow-sm border ${
                                           isDisabled 
                                             ? "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-900/50" 
                                             : "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30 hover:border-violet-400 hover:text-violet-600"
                                         }`}
                                       >
                                          <Monitor size={14} strokeWidth={2.5} className="mb-0.5" />
                                          <span className="text-[10px] font-black">{n}</span>
                                          {isDisabled && <PowerOff className="absolute top-1 right-1 w-2.5 h-2.5 text-red-300 dark:text-red-900" />}
                                       </button>
                                    );
                                 })}
                              </div>
                           ))}
                        </div>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lab Form Modal */}
      {showLabForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl animate-in zoom-in duration-200 border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-50 dark:border-slate-800 bg-[#381872] text-white flex items-center justify-between">
              <h2 className="text-lg font-bold">{editLab ? "Modify Laboratory" : "Establish Laboratory"}</h2>
              <button onClick={() => setShowLabForm(false)} className="p-2 rounded-xl hover:bg-white/10 transition-colors"><X size={18} /></button>
            </div>
            <div className="p-8 space-y-4">
              {labErr && <p className="text-xs font-bold text-red-500 uppercase tracking-tight">{labErr}</p>}
              <div className="space-y-4">
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Laboratory Name</label>
                   <input type="text" value={lf.name} onChange={e => setLf({ ...lf, name: e.target.value })} placeholder="e.g. Lab 519" className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-300" />
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Room Index</label>
                   <input type="text" value={lf.room} onChange={e => setLf({ ...lf, room: e.target.value })} placeholder="e.g. 5th Floor" className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-300" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Seat Quota</label>
                      <input type="number" value={lf.seats} onChange={e => setLf({ ...lf, seats: Number(e.target.value) })} placeholder="e.g. 30" className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-bold focus:outline-none" />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Complex</label>
                      <input type="text" value={lf.building} onChange={e => setLf({ ...lf, building: e.target.value })} placeholder="e.g. CCS Bldg" className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-bold focus:outline-none" />
                   </div>
                </div>
              </div>
              <button onClick={saveLab} disabled={labSaving} className="w-full py-4 rounded-2xl bg-[#381872] dark:bg-violet-800 text-white font-black text-xs uppercase tracking-widest hover:bg-[#220055] transition-all shadow-lg disabled:opacity-60">{labSaving ? "Registering..." : "Commit changes"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Software Form Modal */}
      {showSwForm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl animate-in zoom-in duration-200 border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-50 dark:border-slate-800 bg-[#381872] text-white flex items-center justify-between">
               <h2 className="text-lg font-bold">{editSw ? "Update Suite" : "Register Suite"}</h2>
               <button onClick={() => setShowSwForm(false)} className="p-2 rounded-xl hover:bg-white/10"><X size={18} /></button>
            </div>
            <div className="p-8 space-y-6">
              {swErr && <p className="text-xs font-bold text-red-500 uppercase tracking-tight">{swErr}</p>}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Software Name</label>
                  <input type="text" value={sf.name} onChange={e => setSf({ ...sf, name: e.target.value })} placeholder="e.g. VS Code" className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-bold focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Classification</label>
                  <div className="relative">
                    <select value={sf.category} onChange={e => setSf({ ...sf, category: e.target.value })} className="w-full px-5 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold uppercase tracking-widest appearance-none focus:outline-none">
                        <option value="">Select Category...</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
              </div>
              <button onClick={saveSw} disabled={swSaving} className="w-full py-4 rounded-2xl bg-[#381872] dark:bg-violet-800 text-white font-black text-xs uppercase tracking-widest hover:bg-[#220055] transition-all shadow-lg disabled:opacity-60">{swSaving ? "Cataloging..." : "Update registry"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {confirmDialog.open && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) setConfirmDialog({ open: false, type: 'lab', id: null, name: '' }); }}>
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-red-100 dark:border-red-900/40 overflow-hidden animate-in zoom-in duration-200">
            {/* Red header strip */}
            <div className="h-1.5 bg-gradient-to-r from-red-500 via-rose-400 to-red-500" />
            <div className="p-8">
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-5 border border-red-100 dark:border-red-800/50">
                <Trash2 size={28} className="text-red-500" />
              </div>
              {/* Title */}
              <h2 className="text-center text-lg font-black text-slate-800 dark:text-white mb-2 tracking-tight">
                Delete {confirmDialog.type === 'lab' ? 'Laboratory' : 'Software'}?
              </h2>
              <p className="text-center text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                You are about to permanently delete{' '}
                <span className="font-black text-slate-700 dark:text-slate-200">"{confirmDialog.name}"</span>.
                <br />
                {confirmDialog.type === 'lab'
                  ? 'All terminal records for this laboratory will also be removed.'
                  : 'This software will be unassigned from all laboratories.'}
                <br />
                <span className="text-red-500 font-bold">This action cannot be undone.</span>
              </p>
              {/* Actions */}
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setConfirmDialog({ open: false, type: 'lab', id: null, name: '' })}
                  className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-200 dark:shadow-red-900/30 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
