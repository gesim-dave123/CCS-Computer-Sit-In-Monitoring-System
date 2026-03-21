import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import AdminNavigationBar from "../component/adminNavigationBar";

export default function AdminSitInPage() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user || user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  const [currentSessions, setCurrentSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchSitIns = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        "http://localhost:8080/CCS-Computer-Sit-In-Monitoring-System/server/src/adminSitInList.php",
      );
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Failed to load sit-in sessions.");
        return;
      }

      setCurrentSessions(json.currentSessions || []);
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSitIns();
  }, []);

  const endSession = async (sitInId) => {
    setActionLoadingId(sitInId);
    setError("");

    try {
      const res = await fetch(
        "http://localhost:8080/CCS-Computer-Sit-In-Monitoring-System/server/src/adminEndSitIn.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sitIn_id: sitInId }),
        },
      );

      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to end session.");
        return;
      }

      await fetchSitIns();
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const SessionTable = ({ rows, showAction }) => (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="text-left px-4 py-3 font-semibold">sitIn_id</th>
            <th className="text-left px-4 py-3 font-semibold">id_number</th>
            <th className="text-left px-4 py-3 font-semibold">name</th>
            <th className="text-left px-4 py-3 font-semibold">purpose</th>
            <th className="text-left px-4 py-3 font-semibold">lab</th>
            <th className="text-left px-4 py-3 font-semibold">status</th>
            {showAction && <th className="text-left px-4 py-3 font-semibold">actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={showAction ? 7 : 6} className="px-4 py-8 text-slate-500">
                No records found.
              </td>
            </tr>
          ) : (
            rows.map((item) => (
              <tr key={item.sitIn_id} className="hover:bg-purple-50/40">
                <td className="px-4 py-3">{item.sitIn_id}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{item.id_number}</td>
                <td className="px-4 py-3">{item.name}</td>
                <td className="px-4 py-3">{item.purpose}</td>
                <td className="px-4 py-3">{item.lab}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      item.status === "in_session"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                {showAction && (
                  <td className="px-4 py-3">
                    <button
                      onClick={() => endSession(item.sitIn_id)}
                      disabled={actionLoadingId === item.sitIn_id}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60"
                    >
                      {actionLoadingId === item.sitIn_id ? "Ending..." : "End Session"}
                    </button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-6 md:pl-72">
      <AdminNavigationBar />

      <section className="max-w-7xl mx-auto mt-16 md:mt-0 space-y-6">
        <div className="rounded-2xl bg-gradient-to-r from-purple-800 to-purple-700 text-white p-6 sm:p-8 shadow-lg">
          <p className="text-purple-100 text-sm">Admin • Sit-In Management</p>
          <h1 className="text-2xl sm:text-3xl font-bold mt-1">Current Sit-In Sessions</h1>
          <p className="text-purple-100 mt-2 text-sm sm:text-base">
            Monitor and end currently active sit-in sessions.
          </p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white border border-purple-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">Currently Sit-In</p>
            <p className="text-2xl font-bold text-slate-900 mt-2">{currentSessions.length}</p>
          </div>
          <div className="bg-white border border-purple-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
            <p className="text-2xl font-bold text-slate-900 mt-2">Live</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Currently Sit-In</h2>
            <button
              onClick={fetchSitIns}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-60"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
          <SessionTable rows={currentSessions} showAction />
        </div>

      </section>
    </main>
  );
}
