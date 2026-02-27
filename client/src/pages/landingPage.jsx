import { Link } from "react-router-dom";
import NavigationBar from "../component/navigationBar";
import csslogo from "../assets/image/ccslogo.png";
import "../App.css";

/* ─── DATA ─────────────────────────────────────────────── */

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75" />
      </svg>
    ),
    title: "Real-Time Monitoring",
    desc: "Track all sit-in sessions live with instant status updates across every workstation, no refresh needed.",
    accent: "#5b2d8e",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM12.75 3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v16.5c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V3.375zM6.75 9.75c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v10.125c0 .621-.504 1.125-1.125 1.125H7.875A1.125 1.125 0 016.75 19.875V9.75z" />
      </svg>
    ),
    title: "Usage Analytics",
    desc: "Detailed reports on lab occupancy, peak usage hours, and student activity patterns for smarter decisions.",
    accent: "#c9973a",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    title: "Student Management",
    desc: "Register, identify, and manage students via seamless ID-based check-in with complete session history.",
    accent: "#5b2d8e",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    ),
    title: "Smart Alerts",
    desc: "Automated notifications for computer lab announcements.",
    accent: "#c9973a",
  },
];

const STATS = [
  { value: "99.9%", label: "System Uptime" },
  { value: "<1s", label: "Response Time" },
  { value: "100+", label: "Active Users" },
  { value: "50+", label: "Daily Sessions" },
];

const STEPS = [
  {
    num: "01",
    title: "Register Students",
    desc: "Students are registered with their ID in seconds, creating a verified profile for all future sessions.",
  },
  {
    num: "02",
    title: "Start a Sit-In Session",
    desc: "Admin or student initiates a session by entering an ID the system logs start time automatically.",
  },
  {
    num: "03",
    title: "Monitor in Real-Time",
    desc: "The dashboard updates instantly, showing seat occupancy and session status at a glance.",
  },
  {
    num: "04",
    title: "Review Reports",
    desc: "At any time, export analytics and session logs to review usage trends, peak periods, and student activity.",
  },
];

/* ─── DASHBOARD MOCKUP ─────────────────────────────────── */
function DashboardMockup() {
  const rows = [
    { name: "Juan dela Cruz", id: "2021-00012", pc: "PC-07", status: "active", time: "01:24" },
    { name: "Maria Santos", id: "2022-00134", pc: "PC-03", status: "active", time: "00:47" },
    { name: "Carlo Reyes", id: "2023-00088", pc: "PC-11", status: "idle", time: "00:05" },
    { name: "Ana Mercado", id: "2021-00201", pc: "PC-02", status: "active", time: "02:10" },
  ];

  return (
    <div className="mockup-shell w-full max-w-2xl mx-auto float-anim">
      {/* Window chrome */}
      <div className="mockup-bar">
        <span className="mockup-dot" style={{ background: "#ff5f57" }} />
        <span className="mockup-dot" style={{ background: "#febc2e" }} />
        <span className="mockup-dot" style={{ background: "#28c840" }} />
        <span style={{ marginLeft: 12, fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>
          CCS Lab Monitor — Dashboard
        </span>
      </div>

      <div className="mockup-content">
        {/* Stat cards */}
        <div className="mockup-stat-row">
          <div className="mockup-stat-card">
            <div className="mockup-stat-val">28</div>
            <div className="mockup-stat-label">Active Seats</div>
          </div>
          <div className="mockup-stat-card">
            <div className="mockup-stat-val">12</div>
            <div className="mockup-stat-label">Available</div>
          </div>
          <div className="mockup-stat-card">
            <div className="mockup-stat-val" style={{ color: "#34d399" }}>70%</div>
            <div className="mockup-stat-label">Occupancy</div>
          </div>
        </div>

        {/* Table */}
        <div style={{ marginTop: 4 }}>
          <div className="mockup-table-header">
            <span>Student</span>
            <span>PC</span>
            <span>Status</span>
            <span>Duration</span>
          </div>
          {rows.map((r, i) => (
            <div key={i} className="mockup-table-row">
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>{r.name}</span>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{r.id}</span>
              </div>
              <span style={{ color: "rgba(255,255,255,0.5)" }}>{r.pc}</span>
              <span className={`mockup-status-badge ${r.status === "active" ? "mockup-status-active" : "mockup-status-idle"}`}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
                {r.status}
              </span>
              <span style={{ color: "#e4b857", fontSize: 12, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                {r.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── PAGE ─────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen font-sans overflow-x-hidden scroll-smooth" style={{ background: "#f9f8fc", color: "#1a0a2e" }}>
      <NavigationBar />

      {/* ── HERO ─────────────────────────────────────────── */}
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

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* LEFT: Text content */}
          <div className="flex flex-col items-start text-left flex-1 min-w-0">
            {/* Live badge */}
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


      {/* ── FEATURES ─────────────────────────────────────── */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-28">
        {/* Section label */}
        <div className="text-center mb-16">

          <h2 className="font-extrabold leading-tight" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}>
            Everything you need to run a{" "}
            <span style={{ color: "#5b2d8e" }}>smarter lab.</span>
          </h2>
          <p className="mt-4 text-base font-medium max-w-xl mx-auto" style={{ color: "#6b7280" }}>
            Built specifically for university CCS labs, combining ease-of-use
            with powerful management tools.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card rounded-2xl p-7">
              <div className="feature-icon-wrap">{f.icon}</div>
              <h3 className="font-bold text-lg mb-2" style={{ color: "#1a0a2e" }}>{f.title}</h3>
              <p className="text-sm font-medium leading-relaxed" style={{ color: "#6b7280" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section id="how-it-works" style={{ background: "#f3eef9" }} className="py-10">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-extrabold" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)" }}>
              How it works
            </h2>
          </div>

          <div className="flex flex-col gap-10">
            {STEPS.map((s, i) => (
              <div key={i} className="flex gap-6 items-start relative">
                {i < STEPS.length - 1 && <div className="step-connector" />}
                <div className="step-number flex-shrink-0">{s.num}</div>
                <div className="pt-1">
                  <h3 className="font-bold text-lg mb-1" style={{ color: "#1a0a2e" }}>{s.title}</h3>
                  <p className="text-sm font-semibold leading-relaxed" style={{ color: "#6b7280" }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      <section id="about" className="max-w-6xl mx-auto px-6 py-24">
        <div className="cta-section rounded-3xl p-14 text-center">
          {/* Dot grid overlay */}
          <div className="dot-grid absolute inset-0 opacity-10 rounded-3xl pointer-events-none" />

          <p className="relative text-xs uppercase tracking-widest mb-4 font-semibold" style={{ color: "#e4b857" }}>
            Ready to get started?
          </p>
          <h2 className="relative font-extrabold text-white mb-5 max-w-lg mx-auto"
            style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", lineHeight: 1.2 }}>
            Take control of your computer lab&nbsp;today.
          </h2>
          <p className="relative mb-8 max-w-sm font-medium mx-auto text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
            No complex setup. Just a clean, efficient system your faculty
            and students will actually love.
          </p>
          <Link
            to="/login"
            className="relative inline-flex items-center gap-2 px-9 py-3.5 rounded-full text-sm font-semibold text-white transition-transform hover:scale-105"
            style={{ background: "#c9973a", boxShadow: "0 8px 28px rgba(201,151,58,0.35)" }}
          >
            Get Started
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid #ede5f7", background: "#ffffff" }}>
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <img src={csslogo} alt="CCS Logo" className="w-8 h-8 opacity-80" />
            <div>
              <p className="font-bold text-base" style={{ color: "#5b2d8e" }}>Computer Sit-In Monitoring System</p>
              <p className="text-xs" style={{ color: "#9ca3af" }}>College of Computer Studies</p>
            </div>
          </div>

          {/* Links */}
          <div className="flex gap-8">
            {["Privacy Policy", "Terms of Use", "Support", "About"].map((l) => (
              <a key={l} href="#" className="footer-link">{l}</a>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-xs" style={{ color: "#9ca3af" }}>
            © {new Date().getFullYear()} CCS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
