import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import AdminNavigationBar from "../component/adminNavigationBar";

export default function AdminSitInRecordsPage() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user || user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRecords = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        "http://localhost:8080/CCS-Computer-Sit-In-Monitoring-System/server/src/adminSitInList.php",
      );
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Failed to load sit-in records.");
        return;
      }

      setRecords(json.endedSessions || []);
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-6 md:pl-72">
      <AdminNavigationBar />

      <section className="max-w-7xl mx-auto mt-16 md:mt-0 space-y-6">
        <div className="rounded-2xl bg-gradient-to-r from-purple-800 to-purple-700 text-white p-6 sm:p-8 shadow-lg">
          <p className="text-purple-100 text-sm">Admin • Sit-In Records</p>
          <h1 className="text-2xl sm:text-3xl font-bold mt-1">Ended Sit-In Sessions</h1>
          <p className="text-purple-100 mt-2 text-sm sm:text-base">
            Review completed sit-in sessions in a clean record view.
          </p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Sit-In Records</h2>
            <button
              onClick={fetchRecords}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-60"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

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
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-slate-500">
                      {loading ? "Loading records..." : "No ended sit-in records found."}
                    </td>
                  </tr>
                ) : (
                  records.map((item) => (
                    <tr key={item.sitIn_id} className="hover:bg-purple-50/40">
                      <td className="px-4 py-3">{item.sitIn_id}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{item.id_number}</td>
                      <td className="px-4 py-3">{item.name}</td>
                      <td className="px-4 py-3">{item.purpose}</td>
                      <td className="px-4 py-3">{item.lab}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-1 rounded-full font-semibold bg-slate-200 text-slate-700">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
