import { useEffect, useState, useMemo } from "react";
import AdminNavigationBar from "../component/adminNavigationBar";
import { 
  Star, 
  MessageSquare, 
  Search, 
  Eye, 
  EyeOff, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Heart,
  Plus,
  Filter,
  RefreshCw,
  Info
} from "lucide-react";

const CATEGORIES = ["all", "Usability", "Lab Facilities", "Staff", "Other"];

export default function AdminTestimonialsPage() {
  const API = import.meta.env.VITE_API_BASE_URL;
  const [testimonials, setTestimonials] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [summary, setSummary] = useState({ total: 0, avg_rating: 0, by_category: [], by_rating: [] });

  const fetchTestimonials = async (p = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ admin: "1", page: String(p) });
      if (ratingFilter !== "all") params.set("rating", ratingFilter);
      if (categoryFilter !== "all") params.set("category", categoryFilter);
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`${API}/testimonials.php?${params}`);
      const json = await res.json();
      if (res.ok) {
        setTestimonials(json.testimonials || []);
        setTotal(json.total || 0);
        setPage(json.page || 1);
        setTotalPages(json.total_pages || 1);
      }
    } catch {} finally { setLoading(false); }
  };

  const fetchSummary = async () => {
    try {
      const res = await fetch(`${API}/testimonials.php?admin=1&summary=1`);
      const json = await res.json();
      if (res.ok) setSummary(json);
    } catch {}
  };

  useEffect(() => { fetchSummary(); }, []);
  useEffect(() => { fetchTestimonials(1); }, [ratingFilter, categoryFilter]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchTestimonials(1); };

  const toggleVisibility = async (id) => {
    try {
      await fetch(`${API}/testimonials.php`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "toggle_visibility", testimonial_id: id }) });
      fetchTestimonials(); fetchSummary();
    } catch {}
  };

  const toggleFeatured = async (id) => {
    try {
      await fetch(`${API}/testimonials.php`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "toggle_featured", testimonial_id: id }) });
      fetchTestimonials(); fetchSummary();
    } catch {}
  };

  const softDelete = async (id) => {
    if (!confirm("Soft-delete this testimonial?")) return;
    try {
      await fetch(`${API}/testimonials.php`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "soft_delete", testimonial_id: id }) });
      fetchTestimonials(); fetchSummary();
    } catch {}
  };

  const renderStars = (count) => Array.from({ length: 5 }, (_, i) => <Star key={i} className={`w-3 h-3 ${i < count ? "fill-amber-400 text-amber-400" : "text-slate-200 dark:text-slate-800"}`} />);

  return (
    <main className="min-h-screen bg-[#fef7ff] dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-['Montserrat'] md:pl-64 transition-colors duration-300">
      <AdminNavigationBar />
      
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12 space-y-8">
        <header className="px-2 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-4xl md:text-5xl font-bold text-[#381872] dark:text-violet-300 tracking-tight">Testimonials.</h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 mt-2 font-medium">Audit student feedback and curate featured reviews for the landing page.</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
           {[
             { label: "Total Feedback", val: summary.total, icon: MessageSquare, color: "text-[#381872] dark:text-violet-300", bg: "bg-violet-50 dark:bg-violet-900/30" },
             { label: "Average Rating", val: summary.avg_rating || "---", icon: Star, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20" },
             { label: "Featured Count", val: testimonials.filter(t => Number(t.is_featured) === 1).length, icon: Heart, color: "text-pink-600 dark:text-pink-400", bg: "bg-pink-50 dark:bg-pink-900/20" },
             { label: "Categories", val: summary.by_category?.length || 0, icon: Filter, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" }
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
           <form onSubmit={handleSearch} className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by student name or keyword..." className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold focus:outline-none" />
           </form>
           <div className="flex items-center gap-2 w-full md:w-auto">
              <select value={ratingFilter} onChange={e => setRatingFilter(e.target.value)} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-tighter focus:outline-none">
                 <option value="all">All Ratings</option>
                 {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} STARS</option>)}
              </select>
              <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-tighter focus:outline-none">
                 {CATEGORIES.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
              </select>
              <button onClick={() => fetchTestimonials(1)} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-[#381872] transition-all"><RefreshCw size={16} className={loading ? "animate-spin" : ""} /></button>
           </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
           <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
              <h2 className="text-sm font-bold text-[#381872] dark:text-white flex items-center gap-2">
                 <MessageSquare className="w-4 h-4 text-violet-500" /> Inbox
              </h2>
              <span className="text-[10px] font-black px-3 py-1 rounded-full bg-white dark:bg-slate-900 text-[#381872] dark:text-violet-300 shadow-sm uppercase tracking-widest">{total} SUBMISSIONS</span>
           </div>

           <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {loading && testimonials.length === 0 ? (
                <div className="py-20 text-center"><RefreshCw className="animate-spin mx-auto text-violet-200" size={32} /></div>
              ) : testimonials.length === 0 ? (
                <div className="py-20 text-center text-slate-400 uppercase text-[10px] font-black tracking-widest">No entries found matching filters</div>
              ) : testimonials.map(t => (
                <div key={t.testimonial_id} className={`px-8 py-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all ${Number(t.is_visible) === 0 ? "opacity-60" : ""}`}>
                   <div className="flex items-start justify-between gap-6">
                      <div className="min-w-0 flex-1">
                         <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{t.student_name}</p>
                            <span className="text-[10px] font-bold text-slate-400">ID: {t.student_id}</span>
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-violet-50 dark:bg-violet-900/30 text-[#381872] dark:text-violet-300 uppercase border border-violet-100 dark:border-violet-800/50">{t.category || "Uncategorized"}</span>
                         </div>
                         <div className="flex items-center gap-1 mb-4">{renderStars(t.rating)}</div>
                         <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium italic">"{t.comment}"</p>
                         <p className="text-[9px] font-black text-slate-300 dark:text-slate-600 mt-4 uppercase tracking-[0.2em]">{new Date(t.created_at).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                         <button onClick={() => toggleFeatured(t.testimonial_id)} className="p-2 rounded-xl hover:bg-pink-50 dark:hover:bg-pink-900/20 group transition-all" title="Feature on Landing Page">
                            <Heart className={`w-4 h-4 ${Number(t.is_featured) === 1 ? "fill-pink-500 text-pink-500" : "text-slate-300 dark:text-slate-700 group-hover:text-pink-400"}`} />
                         </button>
                         <button onClick={() => toggleVisibility(t.testimonial_id)} className="p-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 group transition-all" title="Visibility">
                            {Number(t.is_visible) === 1 ? <Eye className="w-4 h-4 text-emerald-500" /> : <EyeOff className="w-4 h-4 text-slate-300 dark:text-slate-700 group-hover:text-emerald-400" />}
                         </button>
                         <button onClick={() => softDelete(t.testimonial_id)} className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 group transition-all" title="Delete record">
                            <Trash2 className="w-4 h-4 text-red-400 group-hover:text-red-600" />
                         </button>
                      </div>
                   </div>
                </div>
              ))}
           </div>

           {totalPages > 1 && (
             <div className="px-8 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-900/50">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Page {page} / {totalPages}</p>
                <div className="flex gap-2">
                   <button onClick={() => fetchTestimonials(page - 1)} disabled={page <= 1} className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-[#381872] transition-all disabled:opacity-30"><ChevronLeft size={16} /></button>
                   <button onClick={() => fetchTestimonials(page + 1)} disabled={page >= totalPages} className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-[#381872] transition-all disabled:opacity-30"><ChevronRight size={16} /></button>
                </div>
             </div>
           )}
        </div>
      </div>
    </main>
  );
}
