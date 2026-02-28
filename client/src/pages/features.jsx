
import "../App.css";


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
export default function Features() {

    return (
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
    );

}