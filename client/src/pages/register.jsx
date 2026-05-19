import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ccslogo from "../assets/image/ccslogo.png";

import {
  MailIcon,
  LockIcon,
  UserIcon,
  YearLevelIcon,
  IdIcon,
  EyeIcon,
  EyeOffIcon,
  CheckIcon,
  Spinner,
  getStrength,
  CourseIcon,
} from "../component/shared/Icons";

const COURSE_OPTIONS = [
  { val: "BSIT", label: "BSIT - Information Technology" },
  { val: "BSCS", label: "BSCS - Computer Science" },
  { val: "BSHM", label: "BSHM - Hospitality Management" },
  { val: "BSAD", label: "BSAD - Accountancy" },
  { val: "BSCE", label: "BSCE - Civil Engineering" },
  { val: "BSC", label: "BSC - Chemistry" },
  { val: "BSED", label: "BSED - Education" },
  { val: "BSME", label: "BSME - Mechanical Engineering" },
  { val: "BSN", label: "BSN - Nursing" },
  { val: "BSCA", label: "BSCA - Customs Administration" },
  { val: "BSEE", label: "BSEE - Electrical Engineering" },
];

const YEAR_LEVELS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"];

const STRENGTH_COLORS = {
  "#E57373": "bg-red-400",
  "#C9973A": "bg-amber-500",
  "#7C3FB5": "bg-purple-600",
  "#4CAF50": "bg-green-500",
  "#E5D9F7": "bg-slate-200",
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    id_number: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    course: "",
    year_level: "",
    email: "",
    address: "",
    password: "",
    confirm: ""
  });
  
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const strength = getStrength(formData.password);
  const passwordsMatch = formData.confirm.length > 0 && formData.password === formData.confirm;
  const passwordMismatch = formData.confirm.length > 0 && formData.password !== formData.confirm;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/register.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          middle_name: formData.middle_name || null,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Registration failed.");
        return;
      }
      setDone(true);
    } catch (err) {
      setError("Server connection failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fef7ff] dark:bg-slate-950 font-['Montserrat'] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-5%] right-[-5%] w-[30%] h-[30%] bg-[#381872]/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-[#f4be5d]/5 rounded-full blur-[100px] pointer-events-none"></div>

      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#381872] dark:hover:text-violet-300 transition-colors z-20 bg-white/50 dark:bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-800 backdrop-blur-sm shadow-sm hover:shadow-md">
         <span className="material-symbols-outlined text-sm">arrow_back</span>
         Return to Home
      </Link>

      <div className="w-full max-w-[500px] relative z-10">
        {/* Logo Section */}
        <div className="flex items-center gap-4 mb-8 justify-center animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
           <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center">
              <img src={ccslogo} alt="Logo" className="w-8 h-8 object-contain" />
           </div>
           <div>
              <h1 className="text-xl font-bold text-[#381872] dark:text-white leading-none">JOIN CCS</h1>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Creation of digital identity</p>
           </div>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden relative group animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
           <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#f4be5d] via-[#6c44c1] to-[#381872]"></div>

           {done ? (
             <div className="p-10 text-center animate-in zoom-in duration-300">
                <div className="w-20 h-20 rounded-full bg-violet-50 dark:bg-violet-900/20 border-2 border-[#381872] flex items-center justify-center mx-auto mb-6">
                   <CheckIcon size={40} className="text-[#381872]" />
                </div>
                <h2 className="text-2xl font-bold text-[#381872] dark:text-white">Account Ready!</h2>
                <p className="text-xs text-slate-500 mt-2 mb-8 font-medium italic">Your registration was successful. You can now access the system.</p>
                <Link to="/login" className="inline-block px-10 py-3.5 bg-[#381872] text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg hover:shadow-violet-200 transition-all">Sign In Now</Link>
             </div>
           ) : (
             <div className="p-8 md:p-10">
                {/* Steps Header */}
                <div className="flex items-center justify-between mb-10 px-2">
                   <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all ${step === 1 ? 'bg-[#381872] text-white shadow-lg' : 'bg-emerald-500 text-white'}`}>
                        {step > 1 ? <CheckIcon size={14} /> : "1"}
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${step === 1 ? 'text-[#381872] dark:text-white' : 'text-slate-400'}`}>Profile</span>
                   </div>
                   <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800 mx-4"></div>
                   <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all ${step === 2 ? 'bg-[#381872] text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>2</div>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${step === 2 ? 'text-[#381872] dark:text-white' : 'text-slate-400'}`}>Access</span>
                   </div>
                </div>

                {error && (
                  <div className="mb-6 px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-[10px] font-bold uppercase flex items-center gap-2">
                     <span className="material-symbols-outlined text-sm">error</span> {error}
                  </div>
                )}

                {step === 1 ? (
                  <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-5">
                    {/* ID Number */}
                    <div className="space-y-1.5">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Student Identity Number</label>
                       <div className="relative group/input">
                         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-[#381872] transition-colors"><IdIcon /></span>
                         <input name="id_number" type="text" required value={formData.id_number} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold focus:border-[#381872] focus:ring-4 focus:ring-[#381872]/5 outline-none transition-all" placeholder="e.g. 2023-00001" />
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                          <input name="first_name" type="text" required value={formData.first_name} onChange={handleChange} className="w-full px-4 py-3.5 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold focus:border-[#381872] outline-none transition-all" placeholder="Juan" />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                          <input name="last_name" type="text" required value={formData.last_name} onChange={handleChange} className="w-full px-4 py-3.5 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold focus:border-[#381872] outline-none transition-all" placeholder="Dela Cruz" />
                       </div>
                    </div>

                    <div className="space-y-1.5">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Program / Course</label>
                       <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><CourseIcon /></span>
                          <select name="course" required value={formData.course} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold appearance-none outline-none focus:border-[#381872] transition-all">
                             <option value="">Choose your program</option>
                             {COURSE_OPTIONS.map(c => <option key={c.val} value={c.val}>{c.label}</option>)}
                          </select>
                       </div>
                    </div>

                    <div className="space-y-1.5">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Academic Year</label>
                       <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><YearLevelIcon /></span>
                          <select name="year_level" required value={formData.year_level} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold appearance-none outline-none focus:border-[#381872] transition-all">
                             <option value="">Choose year level</option>
                             {YEAR_LEVELS.map(y => <option key={y} value={y}>{y}</option>)}
                          </select>
                       </div>
                    </div>

                    <button type="submit" className="w-full py-4 bg-[#381872] text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-lg hover:shadow-violet-200 active:scale-[0.98] transition-all mt-4 flex items-center justify-center gap-2">
                       Next Dimension <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Institutional Email</label>
                        <div className="relative group/input">
                           <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-[#381872] transition-colors"><MailIcon /></span>
                           <input name="email" type="email" required value={formData.email} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold focus:border-[#381872] outline-none transition-all" placeholder="you@university.edu" />
                        </div>
                     </div>

                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Address</label>
                        <input name="address" type="text" required value={formData.address} onChange={handleChange} className="w-full px-4 py-3.5 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold focus:border-[#381872] outline-none transition-all" placeholder="e.g. Cebu City, PH" />
                     </div>

                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Security Code</label>
                        <div className="relative group/input">
                           <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-[#381872] transition-colors"><LockIcon /></span>
                           <input name="password" type={showPw ? "text" : "password"} required value={formData.password} onChange={handleChange} className="w-full pl-12 pr-12 py-3.5 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold focus:border-[#381872] outline-none transition-all" placeholder="••••••••" />
                           <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors">{showPw ? <EyeOffIcon /> : <EyeIcon />}</button>
                        </div>
                        {formData.password && (
                           <div className="mt-2 flex gap-1 px-1">
                              {[1, 2, 3, 4].map(i => <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength.score ? STRENGTH_COLORS[strength.color] : 'bg-slate-100 dark:bg-slate-800'}`} />)}
                           </div>
                        )}
                     </div>

                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Code</label>
                        <div className="relative group/input">
                           <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-[#381872] transition-colors"><LockIcon /></span>
                           <input name="confirm" type="password" required value={formData.confirm} onChange={handleChange} className={`w-full pl-12 pr-4 py-3.5 bg-slate-50/50 dark:bg-slate-950/50 border rounded-2xl text-xs font-bold outline-none transition-all ${passwordMismatch ? 'border-red-400 focus:ring-red-50 dark:focus:ring-red-900/10' : 'border-slate-100 dark:border-slate-800 focus:border-[#381872]'}`} placeholder="Re-enter password" />
                        </div>
                     </div>

                     <div className="flex gap-3 pt-4">
                        <button type="button" onClick={() => setStep(1)} className="flex-1 py-4 border border-slate-100 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Back</button>
                        <button type="submit" disabled={loading || passwordMismatch || !formData.password} className="flex-[2] py-4 bg-[#381872] text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-lg hover:shadow-violet-200 active:scale-[0.98] transition-all disabled:opacity-50">
                           {loading ? <Spinner /> : "Create Identity"}
                        </button>
                     </div>
                  </form>
                )}

                <div className="mt-8 text-center">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                     Already have an account? <Link to="/login" className="text-[#381872] dark:text-violet-400 hover:underline ml-1">Sign In</Link>
                   </p>
                </div>
             </div>
           )}
        </div>
      </div>
    </main>
  );
}
