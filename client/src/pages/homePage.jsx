import { Link } from "react-router-dom";
import DashboardMockup from "../component/dashboardMockupHero";
import csslogo from "../assets/image/ccslogo.png";

export default function HomePage() {
  return (
    <section id="home" className="hero-gradient relative min-h-screen flex flex-col items-center justify-center pt-20 pb-10 overflow-hidden">
      {/* Decorative orbs */}
      <div className="orb orb-purple" />
      <div className="orb orb-gold" />

      {/* Watermark logo */}
      <img
        src={csslogo}
        alt=""
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none"
        style={{ width: 520, height: 520, opacity: 0.05, zIndex: 0 }}
      />
      
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col lg:flex-row xl:flex-row items-center gap-12 lg:gap-16 ">
     
        <div className="flex flex-col items-start text-left flex-1 min-w-0">
      
          <div className="fade-up badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <span className="live-dot w-2 h-2 rounded-full bg-purple-700 inline-block" />
            CCS Computer Sit-In Monitoring System
          </div>

          {/* Headline */}
          <h1 className="fade-up-2 font-extrabold leading-tight mb-5"
            style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)", lineHeight: 1.12 }}>
            Monitor Every{" "}
            <span className="text-shimmer">Sit-In Session</span>
            {" "}with Confidence
          </h1>

          {/* Sub-text */}
          <p className="fade-up-4 text-lg font-medium leading-relaxed mb-8" style={{ color: "#6b7280", maxWidth: 480 }}>
            A streamlined system for tracking computer lab usage
            from student check-in to real-time occupancy all in one
            clean, modern dashboard.
          </p>

          {/* CTA Buttons */}
          <div className="fade-up-4 flex flex-wrap items-center gap-4">
            <Link
              to="/login"
              className="btn-primary text-white px-8 py-3.5 rounded-full text-sm font-semibold inline-flex items-center gap-2"
            >
              Get Started
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
              </svg>
            </Link>
            <a href="#features" className="btn-outline px-7 py-3.5 rounded-full text-sm font-semibold inline-flex items-center gap-2">
              Explore Features
            </a>
          </div>
        </div>

        {/* RIGHT: Dashboard mockup */}
        <div className="fade-up-5 flex-1 w-full min-w-0">
          <DashboardMockup />
        </div>
      </div>
    </section>
  );
}   