import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import AdminNavigationBar from "../component/adminNavigationBar";
import {
  Megaphone,
  RefreshCw,
  Calendar,
  UserRound,
  Pencil,
  TriangleAlert,
  Sparkles,
  ShieldCheck,
  Search,
  Filter,
  ChevronDown,
  X,
  Plus,
  ArrowRight
} from "lucide-react";

const INITIAL_FORM = {
  title: "",
  content: "",
  type: "general",
  priority: "low",
  targetRole: "student",
};

export default function AdminAnnouncementsPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [searchParams] = useSearchParams();

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Filtering
  const [query, setQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  
  const [form, setForm] = useState(INITIAL_FORM);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState(null);

  const highlightedAnnouncementId = Number(searchParams.get("announcement") || 0);

  const formatDateTime = (value) => {
    if (!value) return "N/A";
    const parsed = new Date(value);
    return parsed.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
  };

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/createAnnouncement.php?audience=admin&limit=200`);
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Failed to load."); return; }
      setAnnouncements(Array.isArray(json.announcements) ? json.announcements : []);
    } catch { setError("Could not reach server."); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const openEditAnnouncement = (item) => {
    setEditingAnnouncementId(item.announcement_id);
    setForm({
      title: item.title || "",
      content: item.content || "",
      type: item.type || "general",
      priority: item.priority || "low",
      targetRole: item.target_role || "student",
    });
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submitAnnouncement = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(""); setSuccess("");
    try {
      const isEditMode = editingAnnouncementId !== null;
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/createAnnouncement.php`, {
        method: isEditMode ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          announcement_id: isEditMode ? editingAnnouncementId : undefined,
          title: form.title.trim(),
          content: form.content.trim(),
          type: form.type,
          priority: form.priority,
          target_role: form.targetRole,
          author_name: `${user?.first_name} ${user?.last_name}`,
        }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Failed."); return; }
      await fetchAnnouncements();
      setForm(INITIAL_FORM);
      setEditingAnnouncementId(null);
      setSuccess("Announcement published successfully.");
    } catch { setError("Server error."); } finally { setSaving(false); }
  };

  const filtered = useMemo(() => {
    return announcements.filter(a => {
      const q = query.toLowerCase().trim();
      const matchesQuery = !q || a.title?.toLowerCase().includes(q) || a.content?.toLowerCase().includes(q);
      const matchesPriority = priorityFilter === "all" || a.priority === priorityFilter;
      const matchesType = typeFilter === "all" || a.type === typeFilter;
      return matchesQuery && matchesPriority && matchesType;
    });
  }, [announcements, query, priorityFilter, typeFilter]);

  return (
    <main className="min-h-screen bg-[#fef7ff] dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-['Montserrat'] md:pl-64 transition-colors duration-300">
      <AdminNavigationBar />

      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12 space-y-8">
        <header className="px-2 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-4xl md:text-5xl font-bold text-[#381872] dark:text-violet-300 tracking-tight">Announcements.</h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 mt-2 font-medium">Broadcast updates and manage institutional communication.</p>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Form Column (Span 4) */}
          <div className="xl:col-span-4 space-y-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 relative overflow-hidden">
               <div className="flex items-center gap-2 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center text-[#381872] dark:text-violet-300">
                     <Plus size={20} />
                  </div>
                  <h2 className="text-sm font-black uppercase tracking-widest text-[#381872] dark:text-white">Compose</h2>
               </div>

               <form onSubmit={submitAnnouncement} className="space-y-4">
                  <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Announcement Title" className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-300" required />
                  <textarea rows={6} value={form.content} onChange={e => setForm({...form, content: e.target.value})} placeholder="Detailed message content..." className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none" required />
                  
                  <div className="grid grid-cols-1 gap-3">
                     <div className="relative">
                        <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full px-5 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest appearance-none focus:outline-none">
                           <option value="general">Type: General</option>
                           <option value="maintenance">Type: Maintenance</option>
                           <option value="rules">Type: Rules</option>
                           <option value="event">Type: Event</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" />
                     </div>
                     <div className="relative">
                        <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className="w-full px-5 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest appearance-none focus:outline-none">
                           <option value="low">Priority: Low</option>
                           <option value="medium">Priority: Medium</option>
                           <option value="high">Priority: High</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" />
                     </div>
                     <div className="relative">
                        <select value={form.targetRole} onChange={e => setForm({...form, targetRole: e.target.value})} className="w-full px-5 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest appearance-none focus:outline-none">
                           <option value="student">Target: Students</option>
                           <option value="all">Target: All Users</option>
                           <option value="admin">Target: Admins</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" />
                     </div>
                  </div>

                  <button type="submit" disabled={saving} className="w-full py-4 rounded-2xl bg-[#381872] dark:bg-violet-800 text-white font-black text-xs uppercase tracking-widest hover:bg-[#220055] transition-all shadow-lg active:scale-95 disabled:opacity-60">
                     {saving ? "Processing..." : editingAnnouncementId ? "Update Post" : "Publish Now"}
                  </button>
                  {editingAnnouncementId && <button type="button" onClick={() => {setEditingAnnouncementId(null); setForm(INITIAL_FORM);}} className="w-full py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:underline">Cancel Edit</button>}
               </form>
            </div>
          </div>

          {/* Feed Column (Span 8) */}
          <div className="xl:col-span-8 space-y-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col lg:flex-row items-center gap-4">
               <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Filter by keyword..." className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-300" />
               </div>
               <div className="flex items-center gap-2 w-full lg:w-auto">
                  <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-tighter focus:outline-none">
                     <option value="all">Priorities</option>
                     <option value="high">High</option>
                     <option value="medium">Medium</option>
                     <option value="low">Low</option>
                  </select>
                  <button onClick={fetchAnnouncements} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-[#381872] transition-all"><RefreshCw size={16} className={loading ? "animate-spin" : ""} /></button>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filtered.map(item => (
                <article key={item.announcement_id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group relative flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                      item.priority === 'high' ? 'bg-red-500 text-white' : item.priority === 'medium' ? 'bg-amber-400 text-amber-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {item.priority}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{formatDateTime(item.publish_at)}</span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-[#381872] dark:text-white mb-3 line-clamp-2">{item.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3 mb-6 flex-1 italic">"{item.content}"</p>
                  
                  <div className="flex items-center justify-between pt-5 border-t border-slate-50 dark:border-slate-800">
                     <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center text-violet-400"><UserRound size={14} /></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter truncate max-w-[100px]">{item.target_role}</span>
                     </div>
                     <button onClick={() => openEditAnnouncement(item)} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-[#381872] dark:hover:text-violet-300 transition-all"><Pencil size={14} /></button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
