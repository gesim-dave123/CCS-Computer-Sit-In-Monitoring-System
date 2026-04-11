import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import NavigationBar from "../component/studentNavBar";
import { Megaphone, Calendar, UserRound, Search } from "lucide-react";

export default function StudentAnnouncementsPage() {
  const [searchParams] = useSearchParams();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const highlightedAnnouncementId = Number(
    searchParams.get("announcement") || 0,
  );

  const formatDateTime = (value) => {
    if (!value) return "N/A";

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return parsed.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/createAnnouncement.php?audience=student&limit=200`,
      );
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Failed to load announcements.");
        setAnnouncements([]);
        return;
      }

      setAnnouncements(
        Array.isArray(json.announcements) ? json.announcements : [],
      );
    } catch {
      setError("Could not reach the server.");
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();

    const refreshId = window.setInterval(fetchAnnouncements, 30000);
    return () => window.clearInterval(refreshId);
  }, []);

  useEffect(() => {
    if (highlightedAnnouncementId <= 0) return;

    const target = document.getElementById(
      `announcement-${highlightedAnnouncementId}`,
    );
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightedAnnouncementId, announcements]);

  const filteredAnnouncements = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return announcements.filter((item) => {
      const title = String(item.title ?? "").toLowerCase();
      const content = String(item.content ?? "").toLowerCase();
      const author = String(item.author_name ?? "").toLowerCase();

      const matchesQuery =
        normalizedQuery === "" ||
        title.includes(normalizedQuery) ||
        content.includes(normalizedQuery) ||
        author.includes(normalizedQuery);

      const matchesType = typeFilter === "all" || item.type === typeFilter;
      const matchesPriority =
        priorityFilter === "all" || item.priority === priorityFilter;

      return matchesQuery && matchesType && matchesPriority;
    });
  }, [announcements, query, typeFilter, priorityFilter]);

  const cardClassByPriority = (priority) => {
    if (priority === "high") return "border-red-200 bg-red-50/70";
    if (priority === "medium") return "border-amber-200 bg-amber-50/70";
    return "border-slate-200 bg-slate-50";
  };

  const truncateContent = (value, maxLength = 220) => {
    const text = String(value ?? "").trim();
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength).trimEnd()}...`;
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <NavigationBar />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-10 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h1 className="text-2xl font-bold text-slate-900">Announcements</h1>
          <p className="text-sm text-slate-600 mt-1">
            Search and filter announcements by type and priority.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="relative block md:col-span-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search title, content, or author"
                className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </label>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              <option value="all">All Types</option>
              <option value="general">General</option>
              <option value="maintenance">Maintenance</option>
              <option value="rules">Rules</option>
              <option value="event">Event</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Showing {filteredAnnouncements.length} of {announcements.length}{" "}
              announcements
            </p>
            <button
              type="button"
              onClick={fetchAnnouncements}
              disabled={loading}
              className="text-xs px-2.5 py-1.5 rounded-md bg-purple-100 text-purple-700 hover:bg-purple-200 disabled:opacity-60"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-purple-600" />
              Announcement Feed
            </h3>
          </div>

          <div className="p-4 sm:p-5 space-y-3">
            {error && <p className="text-sm text-red-600">{error}</p>}

            {loading && announcements.length === 0 ? (
              <p className="text-sm text-slate-500">Loading announcements...</p>
            ) : filteredAnnouncements.length === 0 ? (
              <p className="text-sm text-slate-500">
                No announcements match the selected filters.
              </p>
            ) : (
              filteredAnnouncements.map((item) => (
                <article
                  key={item.announcement_id}
                  id={`announcement-${item.announcement_id}`}
                  className={`rounded-xl border p-4 ${cardClassByPriority(item.priority)} ${
                    highlightedAnnouncementId > 0 &&
                    item.announcement_id === highlightedAnnouncementId
                      ? "ring-2 ring-purple-400"
                      : ""
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-slate-900">
                        {item.title}
                      </h4>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-white/80 text-slate-700 uppercase">
                          {item.type || "general"}
                        </span>
                        <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-white/80 text-slate-700 uppercase">
                          {item.priority || "low"}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 space-y-1">
                      <p className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDateTime(item.publish_at || item.created_at)}
                      </p>
                      <p className="inline-flex items-center gap-1">
                        <UserRound className="w-3 h-3" />
                        {item.author_name || "CCS ADMIN"}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-slate-700 mt-3 leading-relaxed whitespace-pre-wrap">
                    {truncateContent(item.content)}
                  </p>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
