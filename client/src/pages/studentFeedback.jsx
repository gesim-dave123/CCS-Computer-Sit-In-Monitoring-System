import { useEffect, useState } from "react";
import NavigationBar from "../component/studentNavBar";
import ccslogo from "../assets/image/ccslogo.png";
import { 
  Star, 
  MessageSquare, 
  Send, 
  ChevronDown, 
  CheckCircle2, 
  History,
  Info,
  Quote
} from "lucide-react";

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
    } finally { setFbLoading(false); }
  };
  useEffect(() => { fetchMyFeedback(); }, [studentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1 || !category || !comment.trim()) { setSubmitErr("Fill all fields."); return; }
    setSubmitting(true); setSubmitErr(""); setSubmitMsg("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/testimonials.php`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "submit", student_id: studentId, rating, category, comment: comment.trim() }) });
      if (res.ok) { setSubmitMsg("Feedback submitted."); setRating(0); setCategory(""); setComment(""); fetchMyFeedback(); }
    } finally { setSubmitting(false); }
  };

  const renderStars = (count, sz = "w-3 h-3") => Array.from({ length: 5 }, (_, i) => <Star key={i} className={`${sz} ${i < count ? "fill-amber-400 text-amber-400" : "text-slate-200 dark:text-slate-700"}`} />);

  return (
    <main className="min-h-screen bg-[#fef7ff] dark:bg-slate-950 font-['Montserrat'] transition-colors duration-300">
      <NavigationBar />
      <section className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12 space-y-6">
        <header className="px-2 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-2xl md:text-3xl font-bold text-[#381872] dark:text-violet-300 tracking-tight">Feedback.</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Help us improve the laboratory.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="lg:col-span-4">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-4 shadow-sm relative overflow-hidden">
               <h2 className="text-sm font-bold flex items-center gap-2 mb-2"><Send size={16} className="text-violet-500" /> New Entry</h2>
               {submitMsg && <p className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-lg">{submitMsg}</p>}
               {submitErr && <p className="text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">{submitErr}</p>}
               <div>
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-2">Rating</label>
                  <div className="flex gap-1 justify-center p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                    {Array.from({ length: 5 }, (_, i) => (
                      <button key={i} type="button" onMouseEnter={() => setHoverRating(i + 1)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(i + 1)} className="p-1 transition-transform hover:scale-110">
                        <Star className={`w-8 h-8 ${(hoverRating || rating) > i ? "fill-amber-400 text-amber-400" : "text-slate-200 dark:text-slate-800"}`} />
                      </button>
                    ))}
                  </div>
               </div>
               <div className="relative">
                  <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold appearance-none focus:outline-none">
                    <option value="">Category...</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
               </div>
               <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4} placeholder="Your thoughts..." className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-medium resize-none focus:outline-none" />
               <button type="submit" disabled={submitting} className="w-full py-3 bg-[#381872] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg disabled:opacity-50">Submit</button>
            </form>
          </div>

          <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="px-6 py-4 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-800/20">
              <h2 className="text-sm font-bold flex items-center gap-2"><History size={16} /> History</h2>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-white dark:bg-slate-950 text-slate-400 border border-slate-100 dark:border-slate-800 shadow-sm">{myFeedback.length} Logs</span>
            </div>
            <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto scrollbar-thin">
               {fbLoading ? <div className="py-20 text-center"><div className="w-8 h-8 border-2 border-violet-100 border-t-[#381872] rounded-full animate-spin mx-auto" /></div> : myFeedback.length === 0 ? <p className="py-20 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">No entries</p> : myFeedback.map(fb => (
                 <div key={fb.testimonial_id} className="relative rounded-2xl border border-slate-50 dark:border-slate-800 p-5 hover:shadow-md transition-all group overflow-hidden">
                    <Quote className="absolute top-4 right-4 w-6 h-6 text-violet-50 dark:text-violet-900 opacity-40 -scale-x-100" />
                    <div className="flex items-center justify-between mb-3"><div className="flex gap-0.5">{renderStars(fb.rating)}</div><span className="text-[9px] font-bold text-slate-400">{new Date(fb.created_at).toLocaleDateString()}</span></div>
                    <div className="flex items-center gap-2 mb-3"><span className="text-[8px] font-black px-2 py-0.5 rounded bg-violet-50 dark:bg-violet-950 text-[#381872] dark:text-violet-300 uppercase border border-violet-100 dark:border-violet-900">{fb.category}</span>{Number(fb.is_visible) === 0 && <span className="text-[8px] font-black px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-900/20 text-amber-600 uppercase">Reviewing</span>}</div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic">"{fb.comment}"</p>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-white dark:bg-slate-950 w-full py-10 px-8 border-t border-slate-100 dark:border-slate-800 mt-10 transition-all">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 max-w-full mx-auto w-full">
          <div className="flex items-center gap-3"><img src={ccslogo} alt="CCS" className="w-6 h-6 opacity-80" /><div className="font-bold text-[#381872] dark:text-violet-300 text-sm tracking-tighter uppercase">CCS SITIN</div></div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">© {new Date().getFullYear()} COLLEGE OF COMPUTER STUDIES.</div>
          <div className="flex gap-8 text-[9px] font-black uppercase tracking-widest">
            {["Privacy", "Terms", "Support"].map((l) => (<a key={l} href="#" className="text-slate-400 hover:text-[#f4be5d] transition-colors">{l}</a>))}
          </div>
        </div>
      </footer>
    </main>
  );
}
