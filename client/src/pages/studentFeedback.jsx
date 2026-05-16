import { useEffect, useState } from "react";
import NavigationBar from "../component/studentNavBar";
import { Star, MessageSquare, Send, ChevronDown, CheckCircle2 } from "lucide-react";

const CATEGORIES = ["Usability", "Lab Facilities", "Staff", "Other"];

export default function StudentFeedbackPage() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const studentId = user?.id_number || "";

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");
  const [submitErr, setSubmitErr] = useState("");
  const [myFeedback, setMyFeedback] = useState([]);
  const [fbLoading, setFbLoading] = useState(true);

  const fetchMyFeedback = async () => {
    if (!studentId) return;
    setFbLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/testimonials.php?my=1&student_id=${encodeURIComponent(studentId)}`);
      const json = await res.json();
      if (res.ok) setMyFeedback(json.testimonials || []);
    } catch { /* silent */ } finally { setFbLoading(false); }
  };

  useEffect(() => { fetchMyFeedback(); }, [studentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitErr("");
    setSubmitMsg("");
    if (rating < 1 || rating > 5) { setSubmitErr("Please select a rating (1-5)."); return; }
    if (comment.trim() === "") { setSubmitErr("Comment cannot be empty."); return; }
    if (!category) { setSubmitErr("Please select a category."); return; }

    setSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/testimonials.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "submit", student_id: studentId, rating, category, comment: comment.trim() }),
      });
      const json = await res.json();
      if (!res.ok) { setSubmitErr(json.error || "Submission failed."); return; }
      setSubmitMsg("Thank you! Your feedback has been submitted.");
      setRating(0); setCategory(""); setComment("");
      fetchMyFeedback();
    } catch { setSubmitErr("Could not reach the server."); } finally { setSubmitting(false); }
  };

  const renderStars = (count, size = "w-5 h-5") => Array.from({ length: 5 }, (_, i) => (
    <Star key={i} className={`${size} ${i < count ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
  ));

  return (
    <main className="min-h-screen bg-slate-50">
      <NavigationBar />
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-10 space-y-6">
        {/* Header */}
        <div className="rounded-2xl bg-gradient-to-r from-purple-800 to-purple-700 text-white p-6 sm:p-8 shadow-lg">
          <div className="flex items-center gap-2 text-purple-200 text-sm mb-1"><MessageSquare className="w-4 h-4" /> Feedback</div>
          <h1 className="text-2xl sm:text-3xl font-bold">Share Your Experience</h1>
          <p className="text-purple-100 mt-2 text-sm sm:text-base">Help us improve by sharing your feedback about the system, lab facilities, and staff.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Submit Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Send className="w-4 h-4 text-purple-600" /> Submit Feedback</h2>

              {submitMsg && <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm"><CheckCircle2 className="w-4 h-4" />{submitMsg}</div>}
              {submitErr && <p className="text-sm text-red-600">{submitErr}</p>}

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rating</label>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <button key={i} type="button" onMouseEnter={() => setHoverRating(i + 1)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(i + 1)} className="p-0.5 transition-transform hover:scale-110">
                      <Star className={`w-7 h-7 ${(hoverRating || rating) > i ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <div className="relative">
                  <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 appearance-none">
                    <option value="">Select a category...</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Comment</label>
                <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4} placeholder="Tell us about your experience..." className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none" />
              </div>

              <button type="submit" disabled={submitting} className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 disabled:opacity-60 transition-colors">
                {submitting ? "Submitting..." : "Submit Feedback"}
              </button>
            </form>
          </div>

          {/* My Feedback History */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">My Feedback History</h2>
                <span className="text-xs px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 font-semibold">{myFeedback.length} submitted</span>
              </div>
              <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
                {fbLoading ? (
                  <p className="text-sm text-slate-500 py-6 text-center">Loading your feedback...</p>
                ) : myFeedback.length === 0 ? (
                  <div className="text-center py-10">
                    <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">You haven't submitted any feedback yet.</p>
                  </div>
                ) : (
                  myFeedback.map(fb => (
                    <div key={fb.testimonial_id} className="rounded-xl border border-slate-200 p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1">{renderStars(fb.rating, "w-4 h-4")}</div>
                        <span className="text-xs text-slate-500">{new Date(fb.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" })}</span>
                      </div>
                      <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-medium mb-2">{fb.category}</span>
                      <p className="text-sm text-slate-700 leading-relaxed">{fb.comment}</p>
                      {Number(fb.is_visible) === 0 && <p className="text-xs text-amber-600 mt-1 italic">Hidden by admin</p>}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
