import { Link } from "react-router-dom";
import NavigationBar from "../component/navigationBar";
import "../App.css";
import csslogo from "../assets/image/ccslogo.png";
import DashboardMockup from "../component/dashboardMockupHero";
import HomePage from "../pages/homePage";
import Features from "../pages/features";
import TestimonialsSection from "../component/testimonialsSection";
import StudentLeaderboard from "../component/studentLeaderboard";
import HowItWorks from "../pages/howItWorks";
import About from "../pages/about";
import Footer from "../pages/footer";
import { useEffect } from "react";


/* ─── PAGE ─────────────────────────────────────────────── */
export default function LandingPage() {
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll(".reveal");
    revealElements.forEach((el) => observer.observe(el));

    return () => {
      revealElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <div className="min-h-screen font-['Montserrat'] overflow-x-hidden scroll-smooth bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
      <NavigationBar />

      {/* Watermark logo */}
      <img
        src={csslogo}
        alt=""
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none"
        style={{ width: 520, height: 520, opacity: 0.3, zIndex: 0 }}
      />

      <div className="reveal">
        <HomePage />
      </div>

      {/* ── FEATURES ─────────────────────────────────────── */}
      <div className="reveal reveal-delay-1">
       <About />
      </div>

      {/* ── TESTIMONIALS ─────────────────────────────────── */}
      <div className="reveal reveal-delay-1">
        <TestimonialsSection />
      </div>

      {/* ── LEADERBOARD ──────────────────────────────────── */}
      <div className="reveal reveal-delay-1">
        <StudentLeaderboard />
      </div>

      {/* ── ABOUT ────────────────────────────────────────── */}
      {/* <div className="reveal reveal-delay-1">
        
      </div> */}

      {/* ── FOOTER ───────────────────────────────────────── */}
      <Footer />
    </div>
  );
}
