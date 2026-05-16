import { useEffect, useState } from "react";
import AdminNavigationBar from "../component/adminNavigationBar";
import { Star, MessageSquare, Search, Eye, EyeOff, Trash2, ChevronLeft, ChevronRight, BarChart3 } from "lucide-react";

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

  const softDelete = async (id) => {
    if (!confirm("Soft-delete this testimonial?")) return;
    try {
      await fetch(`${API}/testimonials.php`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "soft_delete", testimonial_id: id }) });
      fetchTestimonials(); fetchSummary();
    } catch {}
  };

  const renderStars = (count) => Array.from({ length: 5 }, (_, i) => <Star key={i} className={`w-4 h-4 ${i < count ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-6 md:pl-72">
      <AdminNavigationBar />
      <div className="max-w-7xl mx-auto mt-20 md:mt-0 space-y-5">
        {/* Header */}
        <div className="rounded-2xl bg-gradient-to-r from-purple-800 to-purple-700 text-white p-6 sm:p-8 shadow-lg">
          <p className="text-purple-100 text-sm">Admin • Feedback</p>
          <h1 className="text-2xl sm:text-3xl font-bold mt-1">Student Testimonials</h1>
          <p className="text-purple-100 mt-2 text-sm sm:text-base">View, filter, and manage all student feedback submissions.</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-purple-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">Total Feedback</p>
            <p className="text-2xl font-bold text-slate-900 mt-2">{summary.total}</p>
          </div>
          <div className="bg-white border border-purple-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">Average Rating</p>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-2xl font-bold text-slate-900">{summary.avg_rating || "—"}</p>
              <div className="flex gap-0.5">{renderStars(Math.round(summary.avg_rating || 0))}</div>
            </div>
          </div>
          <div className="bg-white border border-purple-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">By Category</p>
            <div className="mt-2 space-y-1">
              {(summary.by_category || []).slice(0, 4).map(c => (
                <div key={c.category} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{c.category}</span>
                  <span className="font-bold text-slate-900">{c.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by student name or keyword..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
          </form>
          <select value={ratingFilter} onChange={e => setRatingFilter(e.target.value)} className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-300">
            <option value="all">All Ratings</option>
            {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Star{r > 1 ? "s" : ""}</option>)}
          </select>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-300">
            {CATEGORIES.map(c => <option key={c} value={c}>{c === "all" ? "All Categories" : c}</option>)}
          </select>
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-purple-600" />Testimonials</h2>
            <span className="text-sm text-slate-500">{total} results</span>
          </div>
          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="py-12 text-center"><div className="w-7 h-7 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto" /></div>
            ) : testimonials.length === 0 ? (
              <p className="py-12 text-center text-sm text-slate-500">No testimonials found.</p>
            ) : testimonials.map(t => (
              <div key={t.testimonial_id} className={`px-5 py-4 hover:bg-slate-50 transition-colors ${Number(t.is_visible) === 0 ? "opacity-60" : ""}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="text-sm font-semibold text-slate-900">{t.student_name}</p>
                      <span className="text-xs text-slate-500">({t.student_id})</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">{t.category || "Uncategorized"}</span>
                    </div>
                    <div className="flex items-center gap-1 mb-2">{renderStars(t.rating)}</div>
                    <p className="text-sm text-slate-700 leading-relaxed">{t.comment}</p>
                    <p className="text-xs text-slate-400 mt-1">{new Date(t.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => toggleVisibility(t.testimonial_id)} className="p-1.5 rounded-lg hover:bg-slate-100" title={Number(t.is_visible) === 1 ? "Hide" : "Show"}>
                      {Number(t.is_visible) === 1 ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                    </button>
                    <button onClick={() => softDelete(t.testimonial_id)} className="p-1.5 rounded-lg hover:bg-red-50" title="Delete"><Trash2 className="w-4 h-4 text-red-500" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-between">
              <button onClick={() => { setPage(p => Math.max(1, p - 1)); fetchTestimonials(Math.max(1, page - 1)); }} disabled={page <= 1} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50">
                <ChevronLeft className="w-4 h-4" />Prev
              </button>
              <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
              <button onClick={() => { setPage(p => Math.min(totalPages, p + 1)); fetchTestimonials(Math.min(totalPages, page + 1)); }} disabled={page >= totalPages} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50">
                Next<ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
