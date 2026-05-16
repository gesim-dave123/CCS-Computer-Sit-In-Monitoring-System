import { Link } from "react-router-dom";
import NavigationBar from "../component/navigationBar";
import "../App.css";
import csslogo from "../assets/image/ccslogo.png";
import DashboardMockup from "../component/dashboardMockupHero";
import HomePage from "../pages/homePage";
import Features from "../pages/features";
import TestimonialsSection from "../component/testimonialsSection";
import HowItWorks from "../pages/howItWorks";
import About from "../pages/about";
import Footer from "../pages/footer";
import { useEffect } from "react";


/* ─── PAGE ─────────────────────────────────────────────── */
export default function LandingPage() {
  useEffect(() => {
    // Force light mode on landing page
    document.documentElement.classList.remove("dark");
  }, []);

  return (
    <div className="min-h-screen font-sans overflow-x-hidden scroll-smooth bg-slate-50 text-slate-900">
      <NavigationBar />

      {/* Watermark logo */}
      <img
        src={csslogo}
        alt=""
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none"
        style={{ width: 520, height: 520, opacity: 0.05, zIndex: 0 }}
      />

      <HomePage />

      {/* ── FEATURES ─────────────────────────────────────── */}
      <Features />

      {/* ── TESTIMONIALS ─────────────────────────────────── */}
      <TestimonialsSection />

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      {/* <HowItWorks /> */}
      {/* ── ABOUT ───────────────────────────────────────── */}
      {/* <About /> */}


      {/* ── FOOTER ───────────────────────────────────────── */}
      <Footer />
    </div>
  );
}
