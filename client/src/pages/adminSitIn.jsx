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
  const [pendingSession, setPendingSession] = useState(null);
  const [feedbackSubject, setFeedbackSubject] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackCategory, setFeedbackCategory] = useState("general");
  const [feedbackRating, setFeedbackRating] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const fetchSitIns = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/adminSitInList.php`,
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

  const openFeedbackModal = (session) => {
    setPendingSession(session);
    setFeedbackSubject("Session behavior feedback");
    setFeedbackMessage("");
    setFeedbackCategory("general");
    setFeedbackRating("");
    setError("");
  };

  const closeFeedbackModal = () => {
    if (submittingFeedback) return;
    setPendingSession(null);
    setFeedbackSubject("");
    setFeedbackMessage("");
    setFeedbackCategory("general");
    setFeedbackRating("");
  };

  const submitEndSessionWithFeedback = async (e) => {
    e.preventDefault();

    if (!pendingSession) return;

    const subject = feedbackSubject.trim();
    const message = feedbackMessage.trim();

    if (!subject || !message) {
      setError("Feedback subject and message are required.");
      return;
    }

    setSubmittingFeedback(true);
    setError("");

    try {
      const ratingValue = feedbackRating === "" ? null : Number(feedbackRating);

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/adminEndSitIn.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sitIn_id: pendingSession.sitIn_id,
            admin_id_number: user?.id_number || "",
            feedback: {
              subject,
              message,
              category: feedbackCategory,
              rating: ratingValue,
            },
          }),
        },
      );

      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to end session.");
        return;
      }

      await fetchSitIns();
      closeFeedbackModal();
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setSubmittingFeedback(false);
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
            {showAction && (
              <th className="text-left px-4 py-3 font-semibold">actions</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={showAction ? 7 : 6}
                className="px-4 py-8 text-slate-500"
              >
                No records found.
              </td>
            </tr>
          ) : (
            rows.map((item) => (
              <tr key={item.sitIn_id} className="hover:bg-purple-50/40">
                <td className="px-4 py-3">{item.sitIn_id}</td>
                <td className="px-4 py-3 font-medium text-slate-800">
                  {item.id_number}
                </td>
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
                      onClick={() => openFeedbackModal(item)}
                      disabled={submittingFeedback}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60"
                    >
                      End Session
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
          <h1 className="text-2xl sm:text-3xl font-bold mt-1">
            Current Sit-In Sessions
          </h1>
          <p className="text-purple-100 mt-2 text-sm sm:text-base">
            Monitor and end currently active sit-in sessions.
          </p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white border border-purple-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Currently Sit-In
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-2">
              {currentSessions.length}
            </p>
          </div>
          <div className="bg-white border border-purple-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Status
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-2">Live</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Currently Sit-In
            </h2>
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

        {pendingSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    End Session Feedback
                  </h3>
                  <p className="text-sm text-slate-500">
                    Provide behavior or attitude feedback for{" "}
                    {pendingSession.name} ({pendingSession.id_number}).
                  </p>
                </div>
                <button
                  onClick={closeFeedbackModal}
                  disabled={submittingFeedback}
                  className="px-2 py-1 text-slate-500 hover:text-slate-800 disabled:opacity-60"
                >
                  Close
                </button>
              </div>

              <form
                onSubmit={submitEndSessionWithFeedback}
                className="p-6 space-y-4"
              >
                <input
                  type="text"
                  value={feedbackSubject}
                  onChange={(e) => setFeedbackSubject(e.target.value)}
                  placeholder="Feedback subject"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-300"
                  required
                />

                <textarea
                  rows={5}
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  placeholder="Describe the student's behavior or attitude during the laboratory session"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-300"
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    value={feedbackCategory}
                    onChange={(e) => setFeedbackCategory(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-300"
                  >
                    <option value="general">Behavior &amp; Attitude</option>
                    <option value="complaint">Needs Improvement</option>
                    <option value="other">Other</option>
                  </select>

                  <select
                    value={feedbackRating}
                    onChange={(e) => setFeedbackRating(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-300"
                  >
                    <option value="">No Rating</option>
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Good</option>
                    <option value="3">3 - Fair</option>
                    <option value="2">2 - Poor</option>
                    <option value="1">1 - Very Poor</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeFeedbackModal}
                    disabled={submittingFeedback}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingFeedback}
                    className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60"
                  >
                    {submittingFeedback
                      ? "Ending Session..."
                      : "Submit Feedback & End Session"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
