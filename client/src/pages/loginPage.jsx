import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ccslogo from "../assets/image/ccslogo.png";
import {
  IdIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  Spinner,
} from "../component/shared/Icons";

export default function LoginPage() {
  const navigate = useNavigate();
  const [idNumber, setIdNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/login.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_number: idNumber, password: password }),
        },
      );

      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Unknown error");
        setLoading(false);
        return;
      }

      const role = json.user?.role || "student";
      const userWithRole = { ...json.user, role };

      localStorage.setItem("authToken", json.token);
      localStorage.setItem("user", JSON.stringify(userWithRole));

      setDone(true);
      setTimeout(() => {
        setLoading(false);
        navigate(role === "admin" ? "/admin" : "/dashboard");
      }, 800);
    } catch (err) {
      console.error("Login error:", err);
      setError("Could not reach the server. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fef7ff] dark:bg-slate-950 font-['Montserrat'] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#381872]/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#f4be5d]/5 rounded-full blur-[120px] pointer-events-none"></div>

      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#381872] dark:hover:text-violet-300 transition-colors z-20 bg-white/50 dark:bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-800 backdrop-blur-sm shadow-sm hover:shadow-md">
         <span className="material-symbols-outlined text-sm">arrow_back</span>
         Return to Home
      </Link>

      <div className="w-full max-w-[440px] relative z-10">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center mb-4 transition-transform hover:scale-105 duration-300">
             <img src={ccslogo} alt="CCS Logo" className="w-10 h-10 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-[#381872] dark:text-white tracking-tight">CCS SIT-IN</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Monitoring System</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-xl border border-slate-100 dark:border-slate-800 p-8 md:p-10 relative overflow-hidden group animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
           <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#381872] via-[#6c44c1] to-[#f4be5d]"></div>
           
           {done ? (
             <div className="text-center py-10 animate-in zoom-in duration-300">
                <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-100 dark:shadow-none">
                  <span className="material-symbols-outlined text-4xl text-emerald-500">check_circle</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Authenticated!</h2>
                <p className="text-xs text-slate-400 mt-2 font-medium">Entering your digital workspace...</p>
             </div>
           ) : (
             <>
               <header className="mb-8">
                 <h2 className="text-xl font-bold text-[#381872] dark:text-white">Welcome Back</h2>
                 <p className="text-xs text-slate-400 mt-1 font-medium italic">Sign in to continue your session.</p>
               </header>

               <form onSubmit={handleSubmit} className="space-y-6">
                 {/* ID Number */}
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Student / Admin ID</label>
                    <div className="relative group/input">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-[#381872] transition-colors">
                        <IdIcon />
                      </span>
                      <input
                        type="text"
                        required
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-sm font-bold text-slate-700 dark:text-white placeholder-slate-300 outline-none focus:border-[#381872] focus:ring-4 focus:ring-[#381872]/5 transition-all"
                        placeholder="e.g. 2023-00001"
                        value={idNumber}
                        onChange={(e) => setIdNumber(e.target.value)}
                      />
                    </div>
                 </div>

                 {/* Password */}
                 <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Security Code</label>
                      <button type="button" className="text-[9px] font-black text-[#381872] dark:text-violet-400 uppercase tracking-widest hover:underline">Forgot?</button>
                    </div>
                    <div className="relative group/input">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-[#381872] transition-colors">
                        <LockIcon />
                      </span>
                      <input
                        type={showPw ? "text" : "password"}
                        required
                        className="w-full pl-12 pr-12 py-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-sm font-bold text-slate-700 dark:text-white placeholder-slate-300 outline-none focus:border-[#381872] focus:ring-4 focus:ring-[#381872]/5 transition-all"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                        onClick={() => setShowPw(!showPw)}
                      >
                        {showPw ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                 </div>

                 {error && (
                   <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-[11px] font-bold">
                     <span className="material-symbols-outlined text-sm">info</span>
                     {error}
                   </div>
                 )}

                 {/* Submit */}
                 <button
                   type="submit"
                   disabled={loading}
                   className="w-full py-4 rounded-2xl bg-[#381872] text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-[#381872]/20 hover:shadow-xl hover:shadow-[#381872]/30 active:scale-[0.98] transition-all disabled:opacity-50"
                 >
                   {loading ? (
                     <span className="flex items-center justify-center gap-2">
                       <Spinner /> Authenticating...
                     </span>
                   ) : (
                     "Access Dashboard"
                   )}
                 </button>

                 {/* Register Link */}
                 <div className="pt-4 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      New to the system?{" "}
                      <Link to="/register" className="text-[#381872] dark:text-violet-400 hover:underline ml-1">Create Account</Link>
                    </p>
                 </div>
               </form>
             </>
           )}
        </div>

        {/* Footer info */}
        <p className="text-center mt-8 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] opacity-60">
           © {new Date().getFullYear()} College of Computer Studies
        </p>
      </div>
    </main>
  );
}
