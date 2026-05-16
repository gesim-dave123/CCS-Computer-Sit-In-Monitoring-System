import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

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
} from "lucide-react";

const INITIAL_FORM = {
  title: "",
  content: "",
  type: "general",
  priority: "low",
  targetRole: "student",
};

export default function AdminAnnouncementsPage() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [searchParams] = useSearchParams();

  const [announcements, setAnnouncements] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [query, setQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [form, setForm] = useState(INITIAL_FORM);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState(null);

  const highlightedAnnouncementId = Number(
    searchParams.get("announcement") || 0,
  );

  const formatDateTime = (value) => {
    if (!value) return "N/A";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;

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
        `${import.meta.env.VITE_API_BASE_URL}/createAnnouncement.php?audience=admin&limit=200`,
      );
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Failed to load announcements.");
        return;
      }

      setAnnouncements(
        Array.isArray(json.announcements) ? json.announcements : [],
      );
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
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

  const truncateContent = (value, maxLength = 220) => {
    const text = String(value ?? "").trim();
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength).trimEnd()}...`;
  };

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

  const cancelEdit = () => {
    setEditingAnnouncementId(null);
    setForm(INITIAL_FORM);
    setError("");
    setSuccess("");
  };

  const submitAnnouncement = async (e) => {
    e.preventDefault();

    const title = form.title.trim();
    const content = form.content.trim();

    if (!title || !content) {
      setError("Title and content are required.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const authorName =
        `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim() ||
        "CCS ADMIN";

      const isEditMode = editingAnnouncementId !== null;

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/createAnnouncement.php`,
        {
          method: isEditMode ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            announcement_id: isEditMode ? editingAnnouncementId : undefined,
            title,
            content,
            type: form.type,
            priority: form.priority,
            target_role: form.targetRole,
            author_name: authorName,
          }),
        },
      );

      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to create announcement.");
        return;
      }

      if (isEditMode && json.announcement) {
        setAnnouncements((prev) =>
          prev.map((item) =>
            item.announcement_id === editingAnnouncementId
              ? json.announcement
              : item,
          ),
        );
      } else if (json.announcement) {
        setAnnouncements((prev) => [json.announcement, ...prev]);
      } else {
        await fetchAnnouncements();
      }

      setForm(INITIAL_FORM);
      if (isEditMode) {
        setEditingAnnouncementId(null);
        setSuccess("Announcement updated successfully.");
      } else {
        const sentCount = Number(json.notifications_created ?? 0);
        setSuccess(
          `Announcement created successfully. Notifications sent to ${sentCount} user${sentCount === 1 ? "" : "s"}.`,
        );
      }
    } catch {
      setError("Could not reach the server.");
    } finally {
      setSaving(false);
    }
  };

  const filteredAnnouncements = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return announcements.filter((item) => {
      const matchesQuery =
        normalizedQuery === "" ||
        item.title?.toLowerCase().includes(normalizedQuery) ||
        item.content?.toLowerCase().includes(normalizedQuery) ||
        item.author_name?.toLowerCase().includes(normalizedQuery);

      const matchesPriority =
        priorityFilter === "all" || item.priority === priorityFilter;
      const matchesType = typeFilter === "all" || item.type === typeFilter;

      return matchesQuery && matchesPriority && matchesType;
    });
  }, [announcements, priorityFilter, query, typeFilter]);

  const stats = useMemo(() => {
    const total = announcements.length;
    const highPriority = announcements.filter(
      (a) => a.priority === "high",
    ).length;
    const targetedToStudents = announcements.filter(
      (a) => a.target_role === "student" || a.target_role === "all",
    ).length;
    const active = announcements.filter(
      (a) => Number(a.is_active) === 1,
    ).length;

    return {
      total,
      highPriority,
      targetedToStudents,
      active,
    };
  }, [announcements]);

  const priorityCardClass = (priority) => {
    if (priority === "high") return "border-red-200 bg-red-50/70 dark:border-red-900/50 dark:bg-red-950/20";
    if (priority === "medium") return "border-amber-200 bg-amber-50/70 dark:border-amber-900/50 dark:bg-amber-950/20";
    return "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50";
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 p-4 sm:p-6 md:pl-72">
      <AdminNavigationBar />

      <section className="max-w-7xl mx-auto mt-16 md:mt-0 space-y-6">
        <div className="rounded-2xl bg-gradient-to-r from-purple-800 to-purple-700 text-white p-6 sm:p-8 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-purple-100 text-sm">
                Admin Announcement Center
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold mt-1">
                Announcement Management
              </h1>
              <p className="text-purple-100 mt-2 text-sm sm:text-base">
                Publish updates, target audiences, and monitor communication
                activity in one place.
              </p>
            </div>
            <button
              onClick={fetchAnnouncements}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20 disabled:opacity-60"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              {loading ? "Refreshing" : "Refresh Feed"}
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        {success && <p className="text-sm text-emerald-600 dark:text-emerald-400">{success}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/30 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Total Announcements
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {stats.total}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900/30 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              High Priority
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {stats.highPriority}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Active
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {stats.active}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/30 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Student Visible
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {stats.targetedToStudents}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden h-fit">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingAnnouncementId
                  ? "Edit Announcement"
                  : "Create New Announcement"}
              </h2>
            </div>

            <form onSubmit={submitAnnouncement} className="p-5 space-y-4">
              <input
                type="text"
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Enter title"
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-300 dark:focus:ring-purple-900 text-slate-900 dark:text-white"
                required
              />

              <textarea
                rows={6}
                value={form.content}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, content: e.target.value }))
                }
                placeholder="Write announcement details"
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-300 dark:focus:ring-purple-900 text-slate-900 dark:text-white"
                required
              />

              <div className="grid grid-cols-1 gap-3">
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, type: e.target.value }))
                  }
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-300 dark:focus:ring-purple-900 text-slate-900 dark:text-white"
                >
                  <option value="general">General</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="rules">Rules</option>
                  <option value="event">Event</option>
                </select>

                <select
                  value={form.priority}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, priority: e.target.value }))
                  }
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-300 dark:focus:ring-purple-900 text-slate-900 dark:text-white"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>

                <select
                  value={form.targetRole}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, targetRole: e.target.value }))
                  }
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-300 dark:focus:ring-purple-900 text-slate-900 dark:text-white"
                >
                  <option value="student">Students Only</option>
                  <option value="all">All Users</option>
                  <option value="admin">Admins Only</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60 shadow-md shadow-purple-900/20"
              >
                <Sparkles className="w-4 h-4" />
                {saving
                  ? editingAnnouncementId
                    ? "Saving..."
                    : "Publishing..."
                  : editingAnnouncementId
                    ? "Save Changes"
                    : "Publish Announcement"}
              </button>

              {editingAnnouncementId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel Edit
                </button>
              )}
            </form>
          </div>

          <div className="xl:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Announcement Feed
              </h2>

              <div className="w-full lg:w-auto grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search title, content, author"
                  className="sm:col-span-3 lg:col-span-1 w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300 dark:focus:ring-purple-900 text-slate-900 dark:text-white"
                />

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300 dark:focus:ring-purple-900 text-slate-900 dark:text-white"
                >
                  <option value="all">All Priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300 dark:focus:ring-purple-900 text-slate-900 dark:text-white"
                >
                  <option value="all">All Types</option>
                  <option value="general">General</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="rules">Rules</option>
                  <option value="event">Event</option>
                </select>
              </div>
            </div>

            <div className="p-5 space-y-3 max-h-[680px] overflow-y-auto">
              {loading && filteredAnnouncements.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Loading announcements...
                </p>
              ) : filteredAnnouncements.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No announcements match your filters.
                </p>
              ) : (
                filteredAnnouncements.map((item) => (
                  <article
                    key={item.announcement_id}
                    id={`announcement-${item.announcement_id}`}
                    className={`border rounded-xl p-4 ${priorityCardClass(item.priority)} ${
                      highlightedAnnouncementId > 0 &&
                      item.announcement_id === highlightedAnnouncementId
                        ? "ring-2 ring-purple-400 dark:ring-purple-600 shadow-lg shadow-purple-950/20"
                        : ""
                    }`}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white break-words">
                          {item.title}
                        </h3>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase">
                          <span className="px-2 py-1 rounded-full bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300">
                            {item.type}
                          </span>
                          <span className="px-2 py-1 rounded-full bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300">
                            {item.priority}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300">
                            <ShieldCheck className="w-3 h-3" />
                            {item.target_role}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full ${
                              Number(item.is_active) === 1
                                ? "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
                                : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400"
                            }`}
                          >
                            {Number(item.is_active) === 1
                              ? "active"
                              : "inactive"}
                          </span>
                        </div>
                      </div>

                      <div className="w-full sm:w-auto sm:min-w-[190px] sm:shrink-0 text-xs text-slate-500 dark:text-slate-400 space-y-1 gap-1">
                        <p className="inline-flex max-w-full items-start gap-1 mr-2">
                          <Calendar className="w-3 h-3 mt-0.5 shrink-0" />
                          <span className="break-words leading-relaxed">
                            {formatDateTime(item.publish_at || item.created_at)}
                          </span>
                        </p>
                        <button
                          type="button"
                          onClick={() => openEditAnnouncement(item)}
                          disabled={saving}
                          aria-label={`Edit announcement ${item.title || ""}`}
                          className={`mt-1 inline-flex w-full sm:w-auto items-center justify-center sm:justify-start gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                            editingAnnouncementId === item.announcement_id
                              ? "border-purple-600 bg-purple-600 text-white shadow-sm"
                              : "border-purple-200 dark:border-purple-800/50 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/40"
                          }`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          {editingAnnouncementId === item.announcement_id
                            ? "Editing"
                            : "Edit"}
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-slate-700 dark:text-slate-300 mt-3 leading-relaxed whitespace-pre-wrap">
                      {truncateContent(item.content)}
                    </p>

                    {item.expires_at && (
                      <p className="mt-3 text-xs text-amber-700 dark:text-amber-500 inline-flex items-center gap-1">
                        <TriangleAlert className="w-3 h-3" />
                        Expires on {formatDateTime(item.expires_at)}
                      </p>
                    )}
                  </article>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
