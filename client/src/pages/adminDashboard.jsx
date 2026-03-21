import { useState } from "react";
import { Navigate } from "react-router-dom";
import AdminNavigationBar from "../component/adminNavigationBar";

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
      { label: "Study", value: 40, color: "#6366f1" },
      { label: "Project", value: 25, color: "#f59e0b" },
      { label: "Exam prep", value: 20, color: "#10b981" },
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
    <main className="min-h-screen bg-slate-50 text-slate-800 p-6">
      <AdminNavigationBar />
      <div className="max-w-7xl mx-auto space-y-6 mt-25">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white shadow-md rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">Statistics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-3 bg-slate-100 rounded-xl">
                <p className="text-xs uppercase text-slate-500">
                  Registered Students
                </p>
                <p className="text-2xl font-bold">{stats.registeredStudents}</p>
              </div>
              <div className="p-3 bg-slate-100 rounded-xl">
                <p className="text-xs uppercase text-slate-500">
                  Current Sit-Ins
                </p>
                <p className="text-2xl font-bold">{stats.currentSitIns}</p>
              </div>
              <div className="p-3 bg-slate-100 rounded-xl">
                <p className="text-xs uppercase text-slate-500">
                  Total Sit-Ins
                </p>
                <p className="text-2xl font-bold">{stats.totalSitIns}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <svg
                width="200"
                height="200"
                viewBox="0 0 32 32"
                className="block"
              >
                {pieSlices.map((slice, idx) => (
                  <path key={slice.label} d={slice.path} fill={slice.color} />
                ))}
              </svg>
              <div className="flex-1">
                {stats.purposes.map((purpose) => (
                  <div
                    key={purpose.label}
                    className="flex items-center gap-2 mb-2"
                  >
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: purpose.color }}
                    />
                    <span className="font-medium">{purpose.label}:</span>
                    <span>{purpose.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">Announcements</h2>
            <div className="mb-4 space-y-2">
              <input
                type="text"
                value={newAnnouncementTitle}
                onChange={(e) => setNewAnnouncementTitle(e.target.value)}
                placeholder="Title"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <textarea
                rows={3}
                value={newAnnouncementContent}
                onChange={(e) => setNewAnnouncementContent(e.target.value)}
                placeholder="Announcement content"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button
                onClick={addAnnouncement}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Create Announcement
              </button>
            </div>
            <div className="space-y-3">
              {announcements.map((item) => (
                <div
                  key={item.id}
                  className="border border-slate-200 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{item.title}</h3>
                    <span className="text-xs text-slate-500">{item.date}</span>
                  </div>
                  <p className="text-sm mt-1 text-slate-700">{item.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
