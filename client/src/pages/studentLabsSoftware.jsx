import { useEffect, useState } from "react";
import NavigationBar from "../component/studentNavBar";
import { Search, Monitor, Code, Database, Palette, FileText, Globe, Cpu, Filter } from "lucide-react";

const CATEGORY_ICONS = {
  IDE: Code,
  Office: FileText,
  Database: Database,
  Design: Palette,
  Browser: Globe,
  default: Cpu,
};

function getCategoryIcon(cat) {
  if (!cat) return CATEGORY_ICONS.default;
  for (const [key, Icon] of Object.entries(CATEGORY_ICONS)) {
    if (key !== "default" && cat.toLowerCase().includes(key.toLowerCase())) return Icon;
  }
  return CATEGORY_ICONS.default;
}

export default function StudentLabsSoftwarePage() {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    const fetchLabs = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/labsSoftware.php`);
        const json = await res.json();
        if (res.ok) setLabs(json.labs || []);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchLabs();
  }, []);

  // Collect all unique categories
  const allCategories = [...new Set(labs.flatMap(l => (l.software || []).map(s => s.category)).filter(Boolean))];

  // Filter labs: show only labs that have at least one matching software
  const filteredLabs = labs.map(lab => {
    const sw = (lab.software || []).filter(s => {
      const matchSearch = search === "" || s.software_name.toLowerCase().includes(search.toLowerCase()) || (s.category || "").toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === "all" || s.category === categoryFilter;
      return matchSearch && matchCat;
    });
    return { ...lab, software: sw };
  }).filter(lab => search === "" && categoryFilter === "all" ? true : lab.software.length > 0);

  return (
    <main className="min-h-screen bg-slate-50">
      <NavigationBar />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-10 space-y-6">
        {/* Header */}
        <div className="rounded-2xl bg-gradient-to-r from-purple-800 to-purple-700 text-white p-6 sm:p-8 shadow-lg">
          <div className="flex items-center gap-2 text-purple-200 text-sm mb-1">
            <Monitor className="w-4 h-4" /> Labs & Software
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">Laboratory Software Availability</h1>
          <p className="text-purple-100 mt-2 text-sm sm:text-base">Browse the software installed in each computer laboratory to find the tools you need.</p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search software by name or category..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 appearance-none"
            >
              <option value="all">All Categories</option>
              {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Labs Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500">Loading laboratories...</p>
          </div>
        ) : filteredLabs.length === 0 ? (
          <div className="text-center py-16">
            <Monitor className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No laboratories match your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredLabs.map(lab => (
              <div key={lab.lab_id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-purple-50 to-white">
                  <h3 className="text-lg font-bold text-slate-900">{lab.lab_name}</h3>
                  {lab.room_number && <p className="text-xs text-slate-500 mt-0.5">Room {lab.room_number}</p>}
                  {lab.description && <p className="text-sm text-slate-600 mt-1">{lab.description}</p>}
                </div>
                <div className="p-4">
                  {lab.software.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">No software assigned yet.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {lab.software.map(sw => {
                        const Icon = getCategoryIcon(sw.category);
                        return (
                          <span key={sw.software_id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-100 text-sm text-purple-800 font-medium">
                            <Icon className="w-3.5 h-3.5" />
                            {sw.software_name}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
