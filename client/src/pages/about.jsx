import { Link } from "react-router-dom";
export default function () {
    return (
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
    );
}