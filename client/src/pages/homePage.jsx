import { Link } from "react-router-dom";
import DashboardMockup from "../component/dashboardMockupHero";
import csslogo from "../assets/image/ccslogo.png";

export default function HomePage() {
  return (
    <section
      id="home"
      className="relative pt-24 pb-32 px-6 overflow-hidden flex flex-col items-center text-center"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#eaddff]/20 to-transparent dark:from-[#1a0b33]/20 -z-10"></div>
      
      {/* Watermark logo */}
      <img
        src={csslogo}
        alt=""
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none opacity-5 dark:opacity-[0.03]"
        style={{ width: 520, height: 520, zIndex: 0 }}
      />

      <div className="max-w-6xl mx-auto z-10 flex flex-col items-center">
        <div className="mb-8 px-4 py-1.5 rounded-full bg-[#eaddff]/50 dark:bg-[#381872]/30 border border-[#cbc4d2]/30 dark:border-[#52358d]/30 flex items-center gap-2">
          <span
            className="material-symbols-outlined text-[#5428a8] dark:text-[#a385e2] text-sm"
            style={{ fontVariationSettings: '"FILL" 1' }}
          >
            stars
          </span>
          <span className="font-['Montserrat'] text-xs font-semibold text-[#5428a8] dark:text-[#a385e2] uppercase tracking-wider">
            Computer Lab Monitoring Systems
          </span>
        </div>

        <h1 className="font-['Montserrat'] text-4xl md:text-5xl lg:text-6xl font-bold text-[#220055] dark:text-slate-100 mb-6 max-w-3xl leading-tight">
          Monitor Every Sit-In Session with{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5428a8] to-[#6c44c1] dark:from-[#a388ee] dark:to-[#d2bcff]">
            Confidence
          </span>
        </h1>

        <p className="font-['Montserrat'] text-lg text-[#494551] dark:text-slate-400 max-w-2xl mb-12">
          A comprehensive academic management portal designed for modern
          computer laboratories. Streamline tracking, enhance security, and
          generate insightful reports effortlessly.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            to="/login"
            className="bg-[#5428a8] dark:bg-[#6c44c1] text-white font-['Montserrat'] font-semibold px-8 py-4 rounded-xl hover:shadow-[0_8px_30px_rgba(84,40,168,0.2)] dark:hover:shadow-[0_8px_30px_rgba(108,68,193,0.3)] transition-all flex items-center justify-center gap-2"
          >
            Get Started
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
          <Link
            to="/register"
            className="bg-white dark:bg-slate-900 text-[#220055] dark:text-slate-200 border border-[#cbc4d2] dark:border-slate-700 font-['Montserrat'] font-semibold px-8 py-4 rounded-xl hover:bg-[#e7e0e9] dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">person_add</span>
            Create Account  
          </Link>
        </div>
      </div>

      {/* Hero Image/Innovative Visual */}
      <div className="mt-20 w-full max-w-[1400px] relative z-10 px-2 sm:px-4">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-slate-950 via-transparent to-transparent z-20"></div>
        <div className="relative rounded-3xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-[0_32px_64px_-16px_rgba(84,40,168,0.2)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-1">
          <img
            src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=2070"
            alt="Modern Computer Laboratory Monitoring"
            className="w-full h-auto rounded-2xl object-cover aspect-[21/9] lg:aspect-[21/7]"
          />
          {/* Overlay elements to make it look like a system */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-full h-full bg-[#5428a8]/5 mix-blend-overlay"></div>
            <div className="absolute top-8 left-8 flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400 animate-pulse"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
            </div>
            <div className="absolute bottom-8 right-8 px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-white text-[10px] font-mono tracking-widest uppercase">
              System Active: Live Monitoring
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}   