import { useState, useEffect, useMemo } from "react";
import { 
  X, FileText, FileSpreadsheet, File as FileIcon, 
  ChevronRight, ChevronLeft, Download, Check, Search,
  History, Users, FlaskConical, Target, CalendarCheck2,
  Trophy, UserSearch, Star
} from "lucide-react";

const API = import.meta.env.VITE_API_BASE_URL;

const REPORT_TYPES = [
  { id:"sit_in",      icon: History,        label:"Sit-In Sessions",     desc:"All session records with duration, lab, purpose & status." },
  { id:"students",    icon: Users,          label:"Student Roster",       desc:"Full list of registered students with session quotas." },
  { id:"labs",        icon: FlaskConical,   label:"Lab Utilization",      desc:"Per-lab stats: total sessions, hours, avg duration." },
  { id:"purposes",    icon: Target,         label:"Purpose Analysis",     desc:"Sessions grouped by subject/purpose with percentages." },
  { id:"reservations",icon: CalendarCheck2, label:"Reservations",         desc:"All reservation records with approval status." },
  { id:"leaderboard", icon: Trophy,         label:"Top Students",         desc:"Ranked students by total lab hours logged." },
  { id:"student_history", icon: UserSearch, label:"Student History",      desc:"Complete sit-in history for a specific student." },
  { id:"feedback",    icon: Star,           label:"Feedback & Ratings",   desc:"Student testimonials, ratings, and categories." },
];

const FORMATS = [
  { id:"pdf",   icon: FileIcon,        label:"PDF",   desc:"Formatted, printable report",   color:"red"   },
  { id:"excel", icon: FileSpreadsheet, label:"Excel", desc:"Spreadsheet with all columns",  color:"green" },
  { id:"csv",   icon: FileText,        label:"CSV",   desc:"Raw data, import anywhere",     color:"blue"  },
];

function FilterStep({ typeId, filters, setFilters, dropdowns }) {
  const [studentSearch, setStudentSearch] = useState("");
  const set = (k, v) => setFilters(f => ({ ...f, [k]: v }));
  
  const filteredStudents = useMemo(() => {
    if (!dropdowns.students) return [];
    if (!studentSearch.trim()) return dropdowns.students;
    const s = studentSearch.toLowerCase();
    return dropdowns.students.filter(st => 
      st.full_name.toLowerCase().includes(s) || 
      st.id_number.toLowerCase().includes(s)
    );
  }, [dropdowns.students, studentSearch]);

  const dateFields = (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Start Date</label>
        <input type="date" value={filters.start||""} onChange={e=>set("start",e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-violet-400" />
      </div>
      <div>
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">End Date</label>
        <input type="date" value={filters.end||""} onChange={e=>set("end",e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-violet-400" />
      </div>
    </div>
  );
  const labSelect = (
    <div>
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Laboratory</label>
      <select value={filters.lab||"all"} onChange={e=>set("lab",e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none">
        <option value="all">All Labs</option>
        {(dropdowns.labs||[]).map(l=><option key={l} value={l}>{l}</option>)}
      </select>
    </div>
  );
  const courseSelect = (
    <div>
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Course</label>
      <select value={filters.course||"all"} onChange={e=>set("course",e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none">
        <option value="all">All Courses</option>
        {(dropdowns.courses||[]).map(c=><option key={c} value={c}>{c}</option>)}
      </select>
    </div>
  );

  if (typeId === "sit_in") return <div className="space-y-4">{dateFields}{labSelect}
    <div>
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</label>
      <select value={filters.status||"all"} onChange={e=>set("status",e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none">
        <option value="all">All Statuses</option>
        <option value="in_session">Active</option>
        <option value="ended">Ended</option>
      </select>
    </div>
  </div>;

  if (typeId === "students") return <div className="space-y-4">{courseSelect}
    <div>
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Year Level</label>
      <select value={filters.year||"all"} onChange={e=>set("year",e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none">
        <option value="all">All Years</option>
        {(dropdowns.yearLevels||[]).map(y=><option key={y} value={y}>{y}</option>)}
      </select>
    </div>
    <div>
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Session Status</label>
      <select value={filters.status||"all"} onChange={e=>set("status",e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none">
        <option value="all">All Students</option>
        <option value="active">Has Remaining Sessions</option>
        <option value="depleted">Sessions Depleted</option>
      </select>
    </div>
  </div>;

  if (typeId === "labs")     return <div className="space-y-4">{dateFields}{labSelect}</div>;
  if (typeId === "purposes") return <div className="space-y-4">{dateFields}{labSelect}</div>;

  if (typeId === "reservations") return <div className="space-y-4">{dateFields}{labSelect}
    <div>
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</label>
      <select value={filters.status||"all"} onChange={e=>set("status",e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none">
        <option value="all">All</option>
        {["pending","approved","completed","rejected","cancelled"].map(s=><option key={s} value={s}>{s}</option>)}
      </select>
    </div>
  </div>;

  if (typeId === "leaderboard") return <div className="space-y-4">{dateFields}{courseSelect}
    <div>
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Top N Students</label>
      <select value={filters.limit||"25"} onChange={e=>set("limit",e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none">
        {["5","10","15","25","50","0"].map(n=><option key={n} value={n}>{n==="0"?"All":n}</option>)}
      </select>
    </div>
  </div>;

  if (typeId === "student_history") return <div className="space-y-4">
    <div>
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Search & Select Student <span className="text-rose-500">*</span></label>
      <div className="relative group/search">
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Type Student Name or ID..." 
            value={studentSearch} 
            onChange={e => {
              setStudentSearch(e.target.value);
              // Clear selection if user starts typing again after selection
              if (filters.student) set("student", "");
            }}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
        </div>

        {/* Results Dropdown */}
        {studentSearch.trim() && !filters.student && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 max-h-48 overflow-y-auto scrollbar-thin overflow-x-hidden">
            {filteredStudents.length === 0 ? (
              <div className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center italic">
                No matching students
              </div>
            ) : (
              filteredStudents.map(s => (
                <button
                  key={s.id_number}
                  type="button"
                  onClick={() => {
                    set("student", s.id_number);
                    setStudentSearch(`${s.full_name} (${s.id_number})`);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-violet-50 dark:hover:bg-violet-900/20 flex flex-col transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0"
                >
                  <span className="text-xs font-black text-[#381872] dark:text-violet-300">{s.full_name}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{s.id_number}</span>
                </button>
              ))
            )}
          </div>
        )}

        {/* Selection Success Indicator */}
        {filters.student && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-lg">
            <Check size={10} /> SELECTED
          </div>
        )}
      </div>
    </div>
    {dateFields}
    {labSelect}
  </div>;

  if (typeId === "feedback") return <div className="space-y-4">{dateFields}
    <div>
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rating</label>
      <select value={filters.rating||"all"} onChange={e=>set("rating",e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none">
        <option value="all">All Ratings</option>
        {[5,4,3,2,1].map(r=><option key={r} value={r}>{r} ★</option>)}
      </select>
    </div>
    <div>
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Category</label>
      <select value={filters.category||"all"} onChange={e=>set("category",e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none">
        <option value="all">All Categories</option>
        {(dropdowns.categories||[]).map(c=><option key={c} value={c}>{c}</option>)}
      </select>
    </div>
  </div>;

  return null;
}

export default function ReportWizard({ open, onClose }) {
  const [step, setStep]       = useState(1);
  const [typeId, setTypeId]   = useState("");
  const [filters, setFilters] = useState({});
  const [format, setFormat]   = useState("");
  const [dropdowns, setDropdowns] = useState({});
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Reset on open
  useEffect(() => { if (open) { setStep(1); setTypeId(""); setFilters({}); setFormat(""); setDropdowns({}); } }, [open]);

  // Fetch filter dropdowns when type is selected and moving to step 2
  const loadDropdowns = async (tid) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/generateReport.php?type=${tid}&format=json&limit=0`);
      const j = await res.json();
      setDropdowns(j.filters || {});
    } catch {} finally { setLoading(false); }
  };

  const goToStep2 = () => { loadDropdowns(typeId); setStep(2); };

  const buildParams = () => {
    const p = new URLSearchParams({ type: typeId });
    Object.entries(filters).forEach(([k,v]) => { if (v && v !== "all") p.set(k, v); });
    return p;
  };

  const handleDownload = async () => {
    setGenerating(true);
    try {
      if (format === "csv") {
        const p = buildParams(); p.set("format","csv");
        window.open(`${API}/generateReport.php?${p}`, "_blank");
        return;
      }
      // JSON → client-side PDF or Excel
      const p = buildParams(); p.set("format","json");
      const res = await fetch(`${API}/generateReport.php?${p}`);
      const json = await res.json();
      const records = json.records || [];
      const rpt = REPORT_TYPES.find(r => r.id === typeId);

      if (format === "excel") {
        const XLSX = await import("xlsx");
        const ws = XLSX.utils.json_to_sheet(records);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, rpt.label);
        XLSX.writeFile(wb, `CCS_${typeId}_${new Date().toISOString().slice(0,10)}.xlsx`);
      } else if (format === "pdf") {
        const { default: jsPDF } = await import("jspdf");
        const { default: autoTable } = await import("jspdf-autotable");
        const doc = new jsPDF({ orientation: records.length && Object.keys(records[0]).length > 6 ? "landscape" : "portrait" });
        doc.setFont("helvetica","bold"); doc.setFontSize(16); doc.setTextColor(56,24,114);
        doc.text("CCS Computer Sit-In Monitoring System", 14, 18);
        doc.setFont("helvetica","normal"); doc.setFontSize(11); doc.setTextColor(80);
        doc.text(rpt.label + " Report", 14, 26);
        doc.setFontSize(9); doc.setTextColor(130);
        doc.text(`Generated: ${new Date().toLocaleString()}  |  Total records: ${records.length}`, 14, 33);
        const cols = records.length ? Object.keys(records[0]).map(k=>k.replace(/_/g," ").toUpperCase()) : [];
        const rows = records.map(r => Object.values(r));
        autoTable(doc, { startY:40, head:[cols], body:rows, styles:{fontSize:7}, headStyles:{fillColor:[56,24,114],textColor:255,fontStyle:"bold"}, alternateRowStyles:{fillColor:[248,247,255]}, margin:{left:14,right:14} });
        doc.save(`CCS_${typeId}_${new Date().toISOString().slice(0,10)}.pdf`);
      }
      onClose();
    } catch(e) { alert("Export failed: "+e.message); }
    finally { setGenerating(false); }
  };

  if (!open) return null;
  const selectedType = REPORT_TYPES.find(r => r.id === typeId);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden" onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div className="bg-gradient-to-r from-[#381872] to-[#6c44c1] px-7 py-5 flex items-center justify-between">
          <div>
            <p className="text-violet-200 text-[10px] font-black uppercase tracking-widest">Generate Report — Step {step} of 3</p>
            <h2 className="text-white text-xl font-bold mt-0.5">
              {step===1?"Choose Report Type":step===2?"Configure Filters":"Select Format & Download"}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"><X size={18}/></button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center px-7 pt-5">
          {[1,2,3].map(s=>(
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${
                s<step?"bg-violet-600 border-violet-600 text-white":s===step?"bg-white border-violet-600 text-violet-600":"bg-white border-slate-200 dark:border-slate-700 text-slate-400 dark:bg-slate-900"}`}>
                {s<step?<Check size={14}/>:s}
              </div>
              {s<3&&<div className={`w-12 sm:w-24 h-0.5 mx-2 rounded-full ${s<step?"bg-violet-600":"bg-slate-200 dark:bg-slate-700"}`}/>}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="px-7 py-6 max-h-[60vh] overflow-y-auto">

          {/* Step 1 */}
          {step===1&&(
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {REPORT_TYPES.map(rt=>{
                const Icon = rt.icon;
                const isSelected = typeId === rt.id;
                return (
                  <button key={rt.id} onClick={()=>setTypeId(rt.id)}
                    className={`text-left p-4 rounded-2xl border-2 transition-all duration-300 group ${
                      isSelected 
                        ? "border-violet-600 bg-violet-50 dark:bg-violet-900/20 shadow-lg shadow-violet-500/10" 
                        : "border-slate-100 dark:border-slate-800 hover:border-violet-300 hover:bg-white dark:hover:bg-slate-800/50 hover:shadow-md hover:-translate-y-0.5"
                    }`}>
                    <div className={`mb-3 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      isSelected 
                        ? "bg-violet-600 text-white scale-110" 
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-violet-100 dark:group-hover:bg-violet-900/30 group-hover:text-violet-600 group-hover:scale-110"
                    }`}>
                      <Icon size={20} />
                    </div>
                    <p className={`text-sm font-black transition-colors ${isSelected?"text-violet-700 dark:text-violet-300":"text-slate-800 dark:text-slate-200 group-hover:text-violet-700 dark:group-hover:text-violet-300"}`}>{rt.label}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{rt.desc}</p>
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 2 */}
          {step===2&&(
            loading
              ? <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"/></div>
              : <FilterStep typeId={typeId} filters={filters} setFilters={setFilters} dropdowns={dropdowns}/>
          )}

          {/* Step 3 */}
          {step===3&&(
            <div className="space-y-6">
              <div className="text-center">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Final Step</p>
                 <h3 className="text-lg font-bold text-slate-800 dark:text-white">Choose Export Format</h3>
                 <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-tight font-bold">Prepare <span className="text-violet-600">{selectedType?.label}</span> for download</p>
              </div>

              <div className="grid grid-cols-3 gap-4 py-4">
                {FORMATS.map(fmt => {
                  const Icon = fmt.icon;
                  const colorMap = {
                    red: "text-red-500 bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900/30",
                    green: "text-emerald-500 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800/30",
                    blue: "text-blue-500 bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800/30"
                  };
                  const activeColorMap = {
                    red: "border-red-500 ring-4 ring-red-500/10",
                    green: "border-emerald-500 ring-4 ring-emerald-500/10",
                    blue: "border-blue-500 ring-4 ring-blue-500/10"
                  };

                  const isSelected = format === fmt.id;

                  return (
                    <button
                      key={fmt.id}
                      onClick={() => setFormat(fmt.id)}
                      className={`
                        flex flex-col items-center justify-center p-6 rounded-[2.5rem] border-2 transition-all duration-300 relative
                        ${isSelected ? activeColorMap[fmt.color] : "border-slate-100 dark:border-slate-800 hover:border-violet-200 bg-white dark:bg-slate-900"}
                      `}
                    >
                      <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-4 transition-transform duration-300 ${isSelected ? "scale-110" : "group-hover:scale-105"} ${colorMap[fmt.color]}`}>
                        <Icon size={32} />
                      </div>
                      <p className={`text-xs font-black uppercase tracking-widest ${isSelected ? "text-slate-900 dark:text-white" : "text-slate-400"}`}>
                        {fmt.label}
                      </p>
                      
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-violet-600 border-4 border-white dark:border-slate-900 flex items-center justify-center text-white shadow-lg animate-in zoom-in duration-300">
                          <Check size={14} strokeWidth={4} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-violet-500 shadow-sm shrink-0">
                    <Download size={18} />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Target Document</p>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                       {format ? `Ready to export ${format.toUpperCase()} package` : "Please select a format to proceed"}
                    </p>
                 </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-7 py-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/20">
          <button onClick={()=>step>1?setStep(s=>s-1):onClose()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-black uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
            <ChevronLeft size={14}/>{step===1?"Cancel":"Back"}
          </button>
          {step<3?(
            <button onClick={()=>step===1?goToStep2():setStep(3)}
              disabled={(step===1&&!typeId) || (step===2 && typeId === "student_history" && !filters.student)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#381872] dark:bg-violet-700 text-white text-xs font-black uppercase tracking-widest hover:bg-[#220055] transition-all shadow-md active:scale-95 disabled:opacity-40">
              Next<ChevronRight size={14}/>
            </button>
          ):(
            <button onClick={handleDownload} disabled={!format||generating}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md active:scale-95 disabled:opacity-40">
              <Download size={14}/>{generating?"Generating…":"Download"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
