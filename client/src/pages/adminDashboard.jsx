import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import AdminNavigationBar from "../component/adminNavigationBar";
import {
  Bell,
  Users,
  Monitor,
  BarChart3,
  Megaphone,
  Calendar,
} from "lucide-react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function AdminDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user || user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: "System maintenance scheduled",
      content:
        "Maintenance window on Friday 10pm-12am. Services may be unavailable.",
      date: "2025-12-01",
    },
    {
      id: 2,
      title: "New sit-in policy",
      content: "All sit-ins must be logged with purpose and staff approval.",
      date: "2025-12-02",
    },
  ]);

  const [newAnnouncementTitle, setNewAnnouncementTitle] = useState("");
  const [newAnnouncementContent, setNewAnnouncementContent] = useState("");

  const [stats, setStats] = useState({
    registeredStudents: 0,
    currentSitIns: 0,
    totalSitIns: 0,
    purposes: [],
  });
  const [statsLoading, setStatsLoading] = useState(false);

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await fetch(
        "http://localhost:8080/CCS-Computer-Sit-In-Monitoring-System/server/src/adminDashboardStats.php",
      );
      const json = await res.json();

      if (!res.ok) {
        return;
      }

      if (json.stats) {
        setStats(json.stats);
      }
    } catch {
      // keep default values when server is unavailable
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const addAnnouncement = () => {
    if (!newAnnouncementTitle || !newAnnouncementContent) return;
    const newItem = {
      id: Date.now(),
      title: newAnnouncementTitle,
      content: newAnnouncementContent,
      date: new Date().toISOString().split("T")[0],
    };
    setAnnouncements([newItem, ...announcements]);
    setNewAnnouncementTitle("");
    setNewAnnouncementContent("");
  };

  const hasPurposeData = stats.purposes.length > 0;

  const pieData = {
    labels: hasPurposeData ? stats.purposes.map((p) => p.label) : ["No data"],
    datasets: [
      {
        data: hasPurposeData ? stats.purposes.map((p) => p.percent) : [100],
        backgroundColor: hasPurposeData
          ? stats.purposes.map((p) => p.color)
          : ["#CBD5E1"],
        borderColor: "#ffffff",
        borderWidth: 3,
        hoverOffset: 8,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            if (!hasPurposeData) return "No sit-in records yet";
            const entry = stats.purposes[context.dataIndex];
            return `${entry.label}: ${entry.count} (${entry.percent}%)`;
          },
        },
      },
    },
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-6 md:pl-72">
      <AdminNavigationBar />
      <div className="max-w-7xl mx-auto mt-16 md:mt-0 space-y-6">
        <section className="rounded-2xl bg-gradient-to-r from-purple-800 to-purple-700 text-white p-6 sm:p-8 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-purple-100 text-sm">Admin Dashboard</p>
              <h1 className="text-2xl sm:text-3xl font-bold mt-1">Operations Overview</h1>
              <p className="text-purple-100 mt-2 text-sm sm:text-base">
                Monitor student activity, track sit-in trends, and publish announcements.
              </p>
            </div>
            <div className="text-sm bg-white/10 border border-white/20 px-4 py-2 rounded-xl">
              {new Date().toLocaleDateString()}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-white border border-purple-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-slate-500">Registered Students</p>
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">{stats.registeredStudents}</p>
            <p className="text-xs text-slate-500 mt-1">
              {statsLoading ? "Syncing data..." : "Live database count"}
            </p>
          </div>

          <div className="bg-white border border-purple-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-slate-500">Current Sit-Ins</p>
              <Monitor className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">{stats.currentSitIns}</p>
            <p className="text-xs text-slate-500 mt-1">Live active sessions</p>
          </div>

          <div className="bg-white border border-purple-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-slate-500">Total Sit-Ins</p>
              <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-amber-700" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">{stats.totalSitIns}</p>
            <p className="text-xs text-amber-700 mt-1">Total recorded sit-ins</p>
          </div>

          <div className="bg-white border border-purple-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-slate-500">Announcements</p>
              <Bell className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">{announcements.length}</p>
            <p className="text-xs text-slate-500 mt-1">Total posted updates</p>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-bold text-slate-900">Purpose Distribution</h2>
              </div>

              <div className="p-5 grid grid-cols-1 xl:grid-cols-5 gap-4 items-center">
                <div className="xl:col-span-3 h-72">
                  <Pie data={pieData} options={pieOptions} />
                </div>

                <div className="xl:col-span-2 space-y-2">
                  {hasPurposeData ? (
                    stats.purposes.map((purpose) => (
                      <div
                        key={purpose.label}
                        className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: purpose.color }}
                          />
                          <span className="text-sm font-medium text-slate-700">{purpose.label}</span>
                        </div>
                        <span className="text-sm font-bold text-slate-900">
                           ({purpose.percent}%)
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No sit-in purpose data yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-bold text-slate-900">Manage Announcements</h2>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <input
                  type="text"
                  value={newAnnouncementTitle}
                  onChange={(e) => setNewAnnouncementTitle(e.target.value)}
                  placeholder="Announcement title"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
                <textarea
                  rows={3}
                  value={newAnnouncementContent}
                  onChange={(e) => setNewAnnouncementContent(e.target.value)}
                  placeholder="Write announcement details"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
                <button
                  onClick={addAnnouncement}
                  className="w-fit px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
                >
                  Create Announcement
                </button>
              </div>

              <div className="space-y-3 max-h-[430px] overflow-y-auto pr-1">
                {announcements.map((item) => (
                  <article
                    key={item.id}
                    className="border border-slate-200 rounded-xl p-4 bg-slate-50/60"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold text-slate-900">{item.title}</h3>
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500 whitespace-nowrap">
                        <Calendar className="w-3 h-3" />
                        {item.date}
                      </span>
                    </div>
                    <p className="text-sm mt-2 text-slate-700 leading-relaxed">{item.content}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
