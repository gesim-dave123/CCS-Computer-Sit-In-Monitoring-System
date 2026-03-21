import { useState } from "react";
import { Navigate } from "react-router-dom";
import AdminNavigationBar from "../component/adminNavigationBar";
import { Bell, Users, Monitor, BarChart3, Megaphone, Calendar } from "lucide-react";

function getArcPath(value, startAngle, radius = 16) {
  const endAngle = startAngle + (value / 100) * 360;
  const start = {
    x: 16 + radius * Math.cos((Math.PI / 180) * startAngle),
    y: 16 + radius * Math.sin((Math.PI / 180) * startAngle),
  };
  const end = {
    x: 16 + radius * Math.cos((Math.PI / 180) * endAngle),
    y: 16 + radius * Math.sin((Math.PI / 180) * endAngle),
  };
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  return `M 16 16 L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`;
}

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

  const [stats] = useState({
    registeredStudents: 230,
    currentSitIns: 43,
    totalSitIns: 8600,
    purposes: [
      { label: "C#", value: 40, color: "#6366f1" },
      { label: "JavaScript", value: 25, color: "#f59e0b" },
      { label: "Python", value: 20, color: "#10b981" },
      { label: "Other", value: 15, color: "#ef4444" },
    ],
  });

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

  let startAngle = -90;
  const pieSlices = stats.purposes.map((slice) => {
    const segment = {
      ...slice,
      path: getArcPath(slice.value, startAngle),
    };
    startAngle += (slice.value / 100) * 360;
    return segment;
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-6">
      <AdminNavigationBar />
      <div className="max-w-7xl mx-auto mt-24 space-y-6">
        <section className="rounded-2xl bg-gradient-to-r from-purple-800 to-purple-700 text-white p-6 sm:p-8 shadow-lg">
          <p className="text-purple-100 text-sm">Admin Dashboard</p>
          <h1 className="text-2xl sm:text-3xl font-bold mt-1">Operations Overview</h1>
          <p className="text-purple-100 mt-2 text-sm sm:text-base">
            Monitor student activity, track sit-in trends, and publish announcements.
          </p>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-purple-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-slate-500">Registered Students</p>
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">{stats.registeredStudents}</p>
          </div>

          <div className="bg-white border border-purple-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-slate-500">Current Sit-Ins</p>
              <Monitor className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">{stats.currentSitIns}</p>
          </div>

          <div className="bg-white border border-purple-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-slate-500">Total Sit-Ins</p>
              <BarChart3 className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">{stats.totalSitIns}</p>
          </div>

          <div className="bg-white border border-purple-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-slate-500">Announcements</p>
              <Bell className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">{announcements.length}</p>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-bold text-slate-900">Purpose Distribution</h2>
            </div>

            <div className="p-5 flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                <svg width="210" height="210" viewBox="0 0 32 32" className="block drop-shadow-sm">
                  {pieSlices.map((slice) => (
                    <path key={slice.label} d={slice.path} fill={slice.color} />
                  ))}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-20 h-20 rounded-full bg-white border border-slate-200" />
                </div>
              </div>

              <div className="w-full space-y-2">
                {stats.purposes.map((purpose) => (
                  <div key={purpose.label} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: purpose.color }} />
                      <span className="text-sm font-medium text-slate-700">{purpose.label}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">{purpose.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
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

              <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                {announcements.map((item) => (
                  <article key={item.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/60">
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
