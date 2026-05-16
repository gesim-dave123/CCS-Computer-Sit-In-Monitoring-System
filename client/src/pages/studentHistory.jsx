import { useEffect, useState } from "react";
import NavigationBar from "../component/studentNavBar";
import { FileText, MessageSquare, X } from "lucide-react";

export default function StudentHistoryPage() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [historyRecords, setHistoryRecords] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [selectedHistoryFeedback, setSelectedHistoryFeedback] = useState(null);

  const activeIdNumber = user?.id_number || "";

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

  useEffect(() => {
    let isMounted = true;

    const fetchHistory = async () => {
      if (!activeIdNumber) {
        if (isMounted) {
          setHistoryRecords([]);
        }
        return;
      }

      setHistoryLoading(true);
      setHistoryError("");

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/studentSitInHistory.php?id_number=${encodeURIComponent(activeIdNumber)}&limit=100`,
        );
        const json = await res.json();

        if (!res.ok) {
          if (isMounted) {
            setHistoryError(json.error || "Failed to load sit-in history.");
            setHistoryRecords([]);
          }
          return;
        }

        if (isMounted) {
          setHistoryRecords(Array.isArray(json.history) ? json.history : []);
          setHistoryError("");
        }
      } catch {
        if (isMounted) {
          setHistoryError("Could not reach the server for sit-in history.");
          setHistoryRecords([]);
        }
      } finally {
        if (isMounted) {
          setHistoryLoading(false);
        }
      }
    };

    fetchHistory();

    return () => {
      isMounted = false;
    };
  }, [activeIdNumber]);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <NavigationBar />

      {selectedHistoryFeedback && selectedHistoryFeedback.feedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                Session Feedback #{selectedHistoryFeedback.sitIn_id}
              </h2>
              <button
                onClick={() => setSelectedHistoryFeedback(null)}
                className="text-slate-500 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Subject
                </p>
                <p className="text-sm font-semibold text-slate-900 mt-1">
                  {selectedHistoryFeedback.feedback.subject || "No subject"}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Feedback
                </p>
                <p className="text-sm text-slate-700 mt-1 leading-relaxed whitespace-pre-wrap">
                  {selectedHistoryFeedback.feedback.message ||
                    "No feedback details."}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Rating
                  </p>
                  <p className="text-sm font-semibold text-slate-900 mt-1">
                    {selectedHistoryFeedback.feedback.rating ?? "N/A"}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Category
                  </p>
                  <p className="text-sm font-semibold text-slate-900 mt-1 capitalize">
                    {selectedHistoryFeedback.feedback.category || "general"}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Submitted
                  </p>
                  <p className="text-sm font-semibold text-slate-900 mt-1">
                    {formatDateTime(
                      selectedHistoryFeedback.feedback.responded_at ||
                        selectedHistoryFeedback.feedback.created_at,
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedHistoryFeedback(null)}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-10 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h1 className="text-2xl font-bold text-slate-900">Sit-In History</h1>
          <p className="text-sm text-slate-600 mt-1">
            View your completed and active sit-in sessions, including admin
            feedback.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              Session Records
            </h3>
            <span className="text-xs px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 font-semibold">
              {historyRecords.length} sessions
            </span>
          </div>

          <div className="p-4 sm:p-5 space-y-3">
            {historyError && (
              <p className="text-sm text-red-600">{historyError}</p>
            )}

            {historyLoading && historyRecords.length === 0 ? (
              <p className="text-sm text-slate-500">
                Loading sit-in history...
              </p>
            ) : historyRecords.length === 0 ? (
              <p className="text-sm text-slate-500">
                No sit-in history found for your account.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="text-left px-3 py-2 font-semibold">
                        Session
                      </th>
                      <th className="text-left px-3 py-2 font-semibold">
                        Purpose
                      </th>
                      <th className="text-left px-3 py-2 font-semibold">Lab</th>
                      <th className="text-left px-3 py-2 font-semibold">
                        Started
                      </th>
                      <th className="text-left px-3 py-2 font-semibold">
                        Ended
                      </th>
                      <th className="text-left px-3 py-2 font-semibold">
                        Status
                      </th>
                      <th className="text-left px-3 py-2 font-semibold">
                        Feedback
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {historyRecords.map((record) => (
                      <tr key={record.sitIn_id} className="hover:bg-slate-50">
                        <td className="px-3 py-2 font-medium text-slate-800">
                          #{record.sitIn_id}
                        </td>
                        <td className="px-3 py-2">{record.purpose || "N/A"}</td>
                        <td className="px-3 py-2">{record.lab || "N/A"}</td>
                        <td className="px-3 py-2">
                          {formatDateTime(record.started_at)}
                        </td>
                        <td className="px-3 py-2">
                          {record.ended_at
                            ? formatDateTime(record.ended_at)
                            : "In progress"}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-semibold ${
                              record.status === "ended"
                                ? "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                            }`}
                          >
                            {record.status}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          {record.feedback ? (
                            <button
                              onClick={() => setSelectedHistoryFeedback(record)}
                              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200"
                            >
                              <MessageSquare className="w-3 h-3" />
                              View
                            </button>
                          ) : (
                            <span className="text-xs text-slate-500">
                              No feedback yet
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
