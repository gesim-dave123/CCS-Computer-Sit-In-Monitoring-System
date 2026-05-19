import { useEffect, useState } from "react";
import AdminNavigationBar from "../component/adminNavigationBar";
import { Activity, RefreshCw, XCircle, X, ChevronDown, Info } from "lucide-react";


export default function AdminSitInPage() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

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

  return (
    <main className="min-h-screen bg-[#fef7ff] dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-['Montserrat'] md:pl-64 transition-colors duration-300">
      <AdminNavigationBar />

      <section className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12 space-y-6">
        <header className="px-2 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-4xl md:text-5xl font-bold text-[#381872] dark:text-violet-300 tracking-tight">
            Active Sessions.
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Real-time monitoring and termination of active laboratory sit-in sessions.
          </p>
        </header>

        {error && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-700 dark:text-red-400 text-xs font-bold uppercase tracking-tight animate-fade-in-up">
            <Info size={16} /> {error}
          </div>
        )}



        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="px-5 py-3 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
            <h2 className="text-sm font-bold text-[#381872] dark:text-white flex items-center gap-2">
               <Activity className="w-4 h-4 text-violet-500" />
               Current Fleet
            </h2>
            <button
              onClick={fetchSitIns}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#381872] dark:hover:text-violet-300 transition-colors disabled:opacity-60"
            >
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
              REFRESH
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 uppercase">
                <tr>
                  <th className="text-left px-5 py-4 font-black tracking-widest">Identity ID</th>
                  <th className="text-left px-5 py-4 font-black tracking-widest">User ID</th>
                  <th className="text-left px-5 py-4 font-black tracking-widest">Full Name</th>
                  <th className="text-left px-5 py-4 font-black tracking-widest">Activity</th>
                  <th className="text-left px-5 py-4 font-black tracking-widest">Computer</th>

                  <th className="text-left px-5 py-4 font-black tracking-widest">PC #</th>
                  <th className="text-left px-5 py-4 font-black tracking-widest">Condition</th>
                  <th className="text-right px-5 py-4 font-black tracking-widest">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {currentSessions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-10 text-slate-500 dark:text-slate-400 text-center">
                      {loading ? "SCANNING ACTIVE SESSIONS..." : "NO TERMINALS ARE CURRENTLY OCCUPIED."}
                    </td>
                  </tr>
                ) : (
                  currentSessions.map((item) => (
                    <tr key={item.sitIn_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-5 py-3 text-slate-500 font-mono">#{item.sitIn_id}</td>
                      <td className="px-5 py-3 text-slate-900 dark:text-white font-black">{item.id_number}</td>
                      <td className="px-5 py-3 text-slate-700 dark:text-slate-300 font-bold">{item.name}</td>
                      <td className="px-5 py-3">
                         <span className="bg-violet-50 dark:bg-violet-900/30 text-[#381872] dark:text-violet-300 px-2 py-0.5 rounded-lg border border-transparent group-hover:border-violet-100 dark:group-hover:border-violet-900 transition-all font-bold">
                            {item.purpose}
                         </span>
                      </td>
                      <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{item.lab}</td>
                      <td className="px-5 py-3 text-slate-500 dark:text-slate-400 font-bold">{item.pc_number || "N/A"}</td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => openFeedbackModal(item)}
                          disabled={submittingFeedback}
                          className="px-4 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-95"
                        >
                          TERMINATE
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {pendingSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200 border border-slate-100 dark:border-slate-800">
              <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-red-600 to-red-500 text-white">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-3">
                    <XCircle size={20} />
                    Session Termination
                  </h3>
                  <p className="text-red-100 text-xs mt-1 font-medium">
                    Finalizing record for {pendingSession.name} ({pendingSession.id_number}).
                  </p>
                </div>
                <button
                  onClick={closeFeedbackModal}
                  disabled={submittingFeedback}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={submitEndSessionWithFeedback} className="p-8 space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Performance Subject</label>
                  <input
                    type="text"
                    value={feedbackSubject}
                    onChange={(e) => setFeedbackSubject(e.target.value)}
                    placeholder="Short summary of student conduct..."
                    className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-900"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Behavioral Observation</label>
                  <textarea
                    rows={4}
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    placeholder="Detailed notes on student performance..."
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-900 resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Classification</label>
                    <div className="relative">
                      <select
                        value={feedbackCategory}
                        onChange={(e) => setFeedbackCategory(e.target.value)}
                        className="w-full px-5 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none appearance-none"
                      >
                        <option value="general">CONDUCT: POSITIVE</option>
                        <option value="complaint">CONDUCT: NEEDS REVIEW</option>
                        <option value="other">CONDUCT: NEUTRAL</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Performance Rating</label>
                    <div className="relative">
                      <select
                        value={feedbackRating}
                        onChange={(e) => setFeedbackRating(e.target.value)}
                        className="w-full px-5 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none appearance-none"
                      >
                        <option value="">NO RATING</option>
                        <option value="5">5 - EXCEPTIONAL</option>
                        <option value="4">4 - SATISFACTORY</option>
                        <option value="3">3 - MARGINAL</option>
                        <option value="2">2 - DEFICIENT</option>
                        <option value="1">1 - UNACCEPTABLE</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeFeedbackModal}
                    disabled={submittingFeedback}
                    className="px-6 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={submittingFeedback}
                    className="px-8 py-2.5 rounded-2xl bg-red-600 text-white font-black text-xs uppercase tracking-widest hover:bg-red-700 disabled:opacity-60 transition-all shadow-md active:scale-95 flex items-center gap-2"
                  >
                    {submittingFeedback ? <RefreshCw size={14} className="animate-spin" /> : null}
                    {submittingFeedback ? "FINALIZING..." : "END SESSION & LOG"}
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
