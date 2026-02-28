import { Link } from "react-router-dom";
import NavigationBar from "../component/navigationBar";
import "../App.css";
import csslogo from "../assets/image/ccslogo.png";
import DashboardMockup from "../component/dashboardMockupHero";
import HomePage from "../pages/homePage";
import Features from "../pages/features";
import HowItWorks from "../pages/howItWorks";
import About from "../pages/about";
import Footer from "../pages/footer";


/* ─── PAGE ─────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen font-sans overflow-x-hidden scroll-smooth" style={{ background: "#f9f8fc", color: "#1a0a2e" }}>
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

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      {/* <HowItWorks /> */}
      {/* ── ABOUT ───────────────────────────────────────── */}
      {/* <About /> */}


      {/* ── FOOTER ───────────────────────────────────────── */}
      {/* <Footer /> */}
    </div>
  );
}
