
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
export default function HowItWorks() {
    return (
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
    );
}