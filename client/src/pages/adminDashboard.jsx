import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import AdminNavigationBar from "../component/adminNavigationBar";
import { Bell, Users, Monitor, BarChart3 } from "lucide-react";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
);

export default function AdminDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user || user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  const [stats, setStats] = useState({
    registeredStudents: 0,
    currentSitIns: 0,
    totalSitIns: 0,
    announcementCount: 0,
    purposes: [],
    leaderboard: [],
  });
  const [statsLoading, setStatsLoading] = useState(false);

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/adminDashboardStats.php`,
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

  const hasPurposeData = stats.purposes.length > 0;
  const leaderboardRows = Array.isArray(stats.leaderboard)
    ? stats.leaderboard
    : [];
  const hasLeaderboardData = leaderboardRows.length > 0;

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

  const topFive = hasLeaderboardData ? leaderboardRows.slice(0, 5) : [];
  const reorderedTop5 =
    topFive.length >= 5
      ? [
          topFive[2], // 3rd place
          topFive[1], // 2nd place
          topFive[0], // 1st place (middle center)
          topFive[3], // 4th place
          topFive[4], // 5th place
        ]
      : topFive;

  const leaderboardData = {
    labels: hasLeaderboardData
      ? reorderedTop5.map((item) => item.full_name || item.id_number)
      : ["No data"],
    datasets: [
      {
        label: "Used Sessions",
        data: hasLeaderboardData
          ? reorderedTop5.map((item) => Number(item.used_session) || 0)
          : [0],
        backgroundColor: hasLeaderboardData
          ? reorderedTop5.map((_, idx) =>
              idx === 2
                ? "#FCD34D"
                : idx === 1
                  ? "#A78BFA"
                  : idx === 0
                    ? "#C4B5FD"
                    : idx === 3
                      ? "#7C3AED"
                      : "#8B5CF6",
            )
          : ["#CBD5E1"],
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const leaderboardOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "x",
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        padding: 10,
        titleFont: { size: 12, weight: "bold" },
        bodyFont: { size: 11 },
        cornerRadius: 8,
        callbacks: {
          title: (context) => {
            const idx = context[0].dataIndex;
            return (
              reorderedTop5[idx]?.full_name ||
              reorderedTop5[idx]?.id_number ||
              ""
            );
          },
          label: (context) => `Sessions: ${context.parsed.y ?? 0}`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          display: false,
        },
        grid: {
          display: false,
        },
      },
      y: {
        ticks: {
          precision: 0,
        },
        grid: {
          color: "rgba(203, 213, 225, 0.2)",
        },
      },
    },
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-6 md:pl-72">
      <AdminNavigationBar />
      <div className="max-w-7xl mx-auto mt-20 md:mt-0 space-y-5">
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-white border border-purple-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Registered Students
              </p>
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">
              {stats.registeredStudents}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {statsLoading ? "Syncing data..." : "Live database count"}
            </p>
          </div>

          <div className="bg-white border border-purple-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Current Sit-Ins
              </p>
              <Monitor className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">
              {stats.currentSitIns}
            </p>
            <p className="text-xs text-slate-500 mt-1">Live active sessions</p>
          </div>

          <div className="bg-white border border-purple-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Total Sit-Ins
              </p>
              <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-amber-700" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">
              {stats.totalSitIns}
            </p>
            <p className="text-xs text-amber-700 mt-1">
              Total recorded sit-ins
            </p>
          </div>

          <div className="bg-white border border-purple-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Announcements
              </p>
              <Bell className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">
              {stats.announcementCount}
            </p>
            <p className="text-xs text-slate-500 mt-1">Total posted updates</p>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Student Sit-In Leaderboard
              </h2>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-sm text-slate-600">
                Top students ranked by total used sit-in sessions.
              </p>

              <div className="space-y-3">
                {hasLeaderboardData && (
                  <div className="flex justify-between items-end gap-2 px-2 h-8">
                    {reorderedTop5.map((item, idx) => (
                      <div
                        key={item.id_number}
                        className="flex-1 flex flex-col items-center justify-end"
                      >
                        <p className="text-xs font-bold text-slate-700 text-center line-clamp-2 leading-tight">
                          {item.full_name || item.id_number}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="h-96">
                  <Bar data={leaderboardData} options={leaderboardOptions} />
                </div>
              </div>

              {statsLoading && (
                <p className="text-xs text-slate-500">
                  Refreshing leaderboard...
                </p>
              )}
            </div>
          </div>
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-bold text-slate-900">
                  Purpose Distribution
                </h2>
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
                          <span className="text-sm font-medium text-slate-700">
                            {purpose.label}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-slate-900">
                          ({purpose.percent}%)
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">
                      No sit-in purpose data yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
