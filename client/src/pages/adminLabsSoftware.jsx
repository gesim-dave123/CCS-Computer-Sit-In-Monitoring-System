import { useEffect, useState } from "react";
import AdminNavigationBar from "../component/adminNavigationBar";
import { Plus, Pencil, Trash2, X, Cpu, Monitor, MapPin, Building2, Search, Check } from "lucide-react";

const CATEGORIES = ["IDE", "Office", "Database", "Design", "Browser", "Utility", "Other"];

export default function AdminLabsSoftwarePage() {
  const [allSoftware, setAllSoftware] = useState([]);
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Detail modal
  const [activeLab, setActiveLab] = useState(null);
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

  const API = import.meta.env.VITE_API_BASE_URL;
  const post = (body) => fetch(`${API}/labsSoftware.php`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

  const fetchAll = async () => {
    const [r1, r2] = await Promise.all([fetch(`${API}/labsSoftware.php?admin=1`), fetch(`${API}/labsSoftware.php`)]);
    const [j1, j2] = await Promise.all([r1.json(), r2.json()]);
    setAllSoftware(j1.software || []);
    setLabs(j2.labs || []);
  };

  useEffect(() => { fetchAll().finally(() => setLoading(false)); }, []);

  // Sync activeLab with latest labs data
  useEffect(() => {
    if (activeLab) {
      const fresh = labs.find(l => l.lab_id == activeLab.lab_id);
      if (fresh) setActiveLab(fresh);
    }
  }, [labs]);

  // ── Lab CRUD ──
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

  const deleteLab = async (labId) => {
    if (!confirm("Delete this laboratory and all its software assignments?")) return;
    await post({ action: "delete_lab", lab_id: labId });
    if (activeLab?.lab_id == labId) setActiveLab(null);
    await fetchAll();
  };

  // ── Software CRUD ──
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

  const deleteSw = async (id) => {
    if (!confirm("Delete this software from all labs?")) return;
    await post({ action: "delete_software", software_id: id }); await fetchAll();
  };

  const toggleAssign = async (labId, swId, assigned) => {
    await post({ action: assigned ? "remove_software" : "assign_software", lab_id: labId, software_id: swId });
    await fetchAll();
  };

  // Helpers for detail modal
  const assignedIds = new Set((activeLab?.software || []).map(s => String(s.software_id)));
  const filtered = allSoftware.filter(s => !swSearch || s.software_name.toLowerCase().includes(swSearch.toLowerCase()) || (s.category || "").toLowerCase().includes(swSearch.toLowerCase()));

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-6 md:pl-72">
      <AdminNavigationBar />
      <div className="max-w-7xl mx-auto mt-20 md:mt-0 space-y-5">
        {/* Header */}
        <div className="rounded-2xl bg-gradient-to-r from-purple-800 to-purple-700 text-white p-6 sm:p-8 shadow-lg">
          <p className="text-purple-100 text-sm">Admin • Laboratory Management</p>
          <h1 className="text-2xl sm:text-3xl font-bold mt-1">Labs & Software</h1>
          <p className="text-purple-100 mt-2 text-sm sm:text-base">Click a lab card to view and manage its software.</p>
          <button onClick={openAddLab} className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-sm font-semibold backdrop-blur transition-colors">
            <Plus className="w-4 h-4" />Add Laboratory
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" /></div>
        ) : labs.length === 0 ? (
          <div className="text-center py-20">
            <Monitor className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No laboratories yet. Click <strong>Add Laboratory</strong> to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {labs.map(lab => {
              const sw = lab.software || [];
              return (
                <button key={lab.lab_id} onClick={() => { setActiveLab(lab); setSwSearch(""); }}
                  className="group text-left bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-purple-400 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-3 rounded-xl bg-purple-50 group-hover:bg-purple-600 transition-colors">
                      <Monitor className="w-6 h-6 text-purple-700 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">{sw.length} software</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{lab.lab_name}</h3>
                  <div className="mt-2 space-y-0.5">
                    {lab.room_number && <p className="flex items-center gap-1.5 text-xs text-slate-500"><MapPin className="w-3.5 h-3.5" />Room {lab.room_number}</p>}
                    <p className="flex items-center gap-1.5 text-xs text-slate-500"><Monitor className="w-3.5 h-3.5" />{lab.seats || 30} seats</p>
                    <p className="flex items-center gap-1.5 text-xs text-slate-500"><Building2 className="w-3.5 h-3.5" />{lab.building || "CCS Building"}</p>
                  </div>
                  {sw.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {sw.slice(0, 4).map(s => <span key={s.software_id} className="text-[11px] px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-medium">{s.software_name}</span>)}
                      {sw.length > 4 && <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-medium">+{sw.length - 4}</span>}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ══════════ Lab Detail Modal ══════════ */}
      {activeLab && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-[5vh] overflow-y-auto" onClick={(e) => { if (e.target === e.currentTarget) setActiveLab(null); }}>
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden my-4">
            {/* Modal header */}
            <div className="bg-gradient-to-r from-purple-700 to-purple-600 text-white px-6 py-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold">{activeLab.lab_name}</h2>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-purple-100 text-sm">
                    {activeLab.room_number && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />Room {activeLab.room_number}</span>}
                    <span className="flex items-center gap-1"><Monitor className="w-3.5 h-3.5" />{activeLab.seats || 30} seats</span>
                    <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{activeLab.building || "CCS Building"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => openEditLab(activeLab)} className="p-2 rounded-lg hover:bg-white/20 transition-colors" title="Edit lab"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => deleteLab(activeLab.lab_id)} className="p-2 rounded-lg hover:bg-red-500/30 transition-colors" title="Delete lab"><Trash2 className="w-4 h-4" /></button>
                  <button onClick={() => setActiveLab(null)} className="p-2 rounded-lg hover:bg-white/20 transition-colors"><X className="w-5 h-5" /></button>
                </div>
              </div>
            </div>

            {/* Assigned software */}
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-3">Installed Software ({(activeLab.software || []).length})</h3>
              {(activeLab.software || []).length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center">No software assigned yet. Use the catalog below to add.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(activeLab.software || []).map(s => (
                    <span key={s.software_id} className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 font-medium">
                      <Cpu className="w-3.5 h-3.5" />{s.software_name}
                      {s.category && <span className="text-[10px] text-emerald-600 ml-0.5">({s.category})</span>}
                      <button onClick={() => toggleAssign(activeLab.lab_id, s.software_id, true)} className="ml-1 p-1 rounded-lg hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors" title="Remove"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Software catalog */}
            <div className="px-6 py-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Software Catalog</h3>
                <button onClick={openAddSw} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors"><Plus className="w-3.5 h-3.5" />New Software</button>
              </div>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" value={swSearch} onChange={e => setSwSearch(e.target.value)} placeholder="Search software..." className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
              </div>
              <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
                {filtered.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6">No software found.</p>
                ) : filtered.map(sw => {
                  const isAssigned = assignedIds.has(String(sw.software_id));
                  return (
                    <div key={sw.software_id} className={`flex items-center justify-between rounded-xl px-4 py-2.5 border transition-colors ${isAssigned ? "border-emerald-200 bg-emerald-50/60" : "border-slate-200 hover:bg-slate-50"}`}>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900">{sw.software_name}</p>
                        {sw.category && <span className="text-[11px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-full">{sw.category}</span>}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => toggleAssign(activeLab.lab_id, sw.software_id, isAssigned)}
                          className={`p-1.5 rounded-lg transition-colors ${isAssigned ? "text-emerald-600 hover:bg-red-50 hover:text-red-500" : "text-slate-400 hover:bg-purple-50 hover:text-purple-600"}`}
                          title={isAssigned ? "Remove from lab" : "Add to lab"}>
                          {isAssigned ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </button>
                        <button onClick={() => openEditSw(sw)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => deleteSw(sw.software_id)} className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ Lab Form Modal ══════════ */}
      {showLabForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">{editLab ? "Edit Laboratory" : "Add Laboratory"}</h2>
              <button onClick={() => setShowLabForm(false)} className="text-slate-500 hover:text-slate-800"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {labErr && <p className="text-sm text-red-600">{labErr}</p>}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Lab Name *</label>
                <input type="text" value={lf.name} onChange={e => setLf({ ...lf, name: e.target.value })} placeholder="e.g. Lab 519" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Room Number</label>
                <input type="text" value={lf.room} onChange={e => setLf({ ...lf, room: e.target.value })} placeholder="e.g. 519" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-300" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Seats</label>
                  <input type="number" min="1" max="200" value={lf.seats} onChange={e => setLf({ ...lf, seats: Number(e.target.value) })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Building</label>
                  <input type="text" value={lf.building} onChange={e => setLf({ ...lf, building: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-300" />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-2">
              <button onClick={() => setShowLabForm(false)} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100">Cancel</button>
              <button onClick={saveLab} disabled={labSaving} className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60">{labSaving ? "Saving..." : "Save"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ Software Form Modal ══════════ */}
      {showSwForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">{editSw ? "Edit Software" : "Add Software"}</h2>
              <button onClick={() => setShowSwForm(false)} className="text-slate-500 hover:text-slate-800"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {swErr && <p className="text-sm text-red-600">{swErr}</p>}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Software Name *</label>
                <input type="text" value={sf.name} onChange={e => setSf({ ...sf, name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select value={sf.category} onChange={e => setSf({ ...sf, category: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-300">
                  <option value="">None</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Icon URL (optional)</label>
                <input type="text" value={sf.icon} onChange={e => setSf({ ...sf, icon: e.target.value })} placeholder="https://..." className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-300" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-2">
              <button onClick={() => setShowSwForm(false)} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100">Cancel</button>
              <button onClick={saveSw} disabled={swSaving} className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60">{swSaving ? "Saving..." : "Save"}</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
