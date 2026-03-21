import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import AdminNavigationBar from "../component/adminNavigationBar";

export default function AdminSitInReportsPage() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user || user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  const [summary, setSummary] = useState({ total: 0, active: 0, ended: 0 });
  const [byPurpose, setByPurpose] = useState([]);
  const [byLab, setByLab] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchReports = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        "http://localhost:8080/CCS-Computer-Sit-In-Monitoring-System/server/src/adminSitInReports.php",
      );
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Failed to load reports.");
        return;
      }

      setSummary(json.summary || { total: 0, active: 0, ended: 0 });
      setByPurpose(json.byPurpose || []);
      setByLab(json.byLab || []);
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-6 md:pl-72">
      <AdminNavigationBar />

      <section className="max-w-7xl mx-auto mt-16 md:mt-0 space-y-6">
        <div className="rounded-2xl bg-gradient-to-r from-purple-800 to-purple-700 text-white p-6 sm:p-8 shadow-lg">
          <p className="text-purple-100 text-sm">Admin • Sit-In Reports</p>
          <h1 className="text-2xl sm:text-3xl font-bold mt-1">View Sit-In Reports</h1>
          <p className="text-purple-100 mt-2 text-sm sm:text-base">
            Summary and breakdown of sit-in sessions by purpose and lab.
          </p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-purple-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">Total Sessions</p>
            <p className="text-2xl font-bold text-slate-900 mt-2">{summary.total}</p>
          </div>
          <div className="bg-white border border-purple-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">Active Sessions</p>
            <p className="text-2xl font-bold text-slate-900 mt-2">{summary.active}</p>
          </div>
          <div className="bg-white border border-purple-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">Ended Sessions</p>
            <p className="text-2xl font-bold text-slate-900 mt-2">{summary.ended}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">By Purpose</h2>
              <button
                onClick={fetchReports}
                disabled={loading}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-60"
              >
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
            <div className="p-4 space-y-2">
              {byPurpose.length === 0 ? (
                <p className="text-sm text-slate-500">No purpose report data found.</p>
              ) : (
                byPurpose.map((row) => (
                  <div key={row.purpose} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                    <span className="text-sm text-slate-700">{row.purpose}</span>
                    <span className="text-sm font-bold text-slate-900">{row.total}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">By Lab</h2>
            </div>
            <div className="p-4 space-y-2">
              {byLab.length === 0 ? (
                <p className="text-sm text-slate-500">No lab report data found.</p>
              ) : (
                byLab.map((row) => (
                  <div key={row.lab} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                    <span className="text-sm text-slate-700">{row.lab}</span>
                    <span className="text-sm font-bold text-slate-900">{row.total}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
