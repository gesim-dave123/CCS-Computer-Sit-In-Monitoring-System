import { Link } from "react-router-dom";
import { Info, Target, Shield, Zap, Computer, Heart } from "lucide-react";

export default function About() {
  return (
    <section id="about" className="relative py-24 px-6 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-violet-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/50 mb-6">
            <Info size={14} className="text-violet-600 dark:text-violet-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-violet-600 dark:text-violet-400">Our Identity</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-[#381872] dark:text-white tracking-tight mb-6">
            Redefining the <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600">Lab Experience.</span>
          </h2>
          <p className="max-w-3xl mx-auto text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
            The CCS Computer Sit-In Monitoring System is a dedicated academic portal designed to streamline 
            how students interact with laboratory facilities at the College of Computer Studies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
          <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex gap-6 group">
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform group-hover:bg-[#381872] group-hover:text-white group-hover:shadow-lg group-hover:shadow-violet-500/20">
                <Target size={28} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 uppercase tracking-tight">Our Mission</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  To eliminate the friction of manual logbooks by providing a real-time, digital environment for seat reservations, 
                  session tracking, and laboratory management.
                </p>
              </div>
            </div>

            <div className="flex gap-6 group">
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform group-hover:bg-[#381872] group-hover:text-white group-hover:shadow-lg group-hover:shadow-violet-500/20">
                <Shield size={28} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 uppercase tracking-tight">Academic Integrity</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  Ensuring fair usage and transparent monitoring of lab credits, helping students manage their allocated sit-in hours effectively 
                  throughout the semester.
                </p>
              </div>
            </div>

            <div className="flex gap-6 group">
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform group-hover:bg-[#381872] group-hover:text-white group-hover:shadow-lg group-hover:shadow-violet-500/20">
                <Zap size={28} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 uppercase tracking-tight">Real-Time Insight</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  Providing administrators with powerful analytics and automated reporting tools to maintain high-quality 
                  educational facilities and technical readiness.
                </p>
              </div>
            </div>
          </div>

          <div className="relative animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="absolute inset-0 bg-violet-600/10 dark:bg-violet-400/5 blur-3xl rounded-full"></div>
            <div className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-violet-500 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                  <Computer size={300} />
               </div>
               
               <h4 className="text-2xl font-bold text-[#381872] dark:text-white mb-6">Designed by CCS, For CCS.</h4>
               <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
                 The system is built with a deep understanding of the unique workflow of computer laboratories. 
                 From tracking software availability to visual terminal maps, every feature is tailored to 
                 enhance the student's technical journey.
               </p>

               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                     <p className="text-2xl font-bold text-[#381872] dark:text-violet-300">100%</p>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Process</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                     <p className="text-2xl font-bold text-[#381872] dark:text-violet-300">Live</p>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Seat Tracking</p>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-[#381872] dark:bg-violet-950 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <Heart className="w-12 h-12 text-[#f4be5d] mx-auto mb-8 animate-pulse" />
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">Experience a smarter way to sit-in.</h3>
            <p className="text-violet-100/70 max-w-lg mx-auto mb-10 text-lg">
              Join hundreds of CCS students who have already moved to the digital monitoring system.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-10 py-4 bg-white text-[#381872] rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#f4be5d] transition-all hover:shadow-xl hover:-translate-y-1 active:scale-95"
              >
                Create Your Account
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-10 py-4 bg-white/10 text-white border border-white/20 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all backdrop-blur-md"
              >
                Sign In Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
