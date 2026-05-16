import csslogo from "../assets/image/ccslogo.png";
export default function Footer() {
    return (
        <footer className="border-t border-slate-200 bg-white">
            <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between items-center gap-6">
                {/* Brand */}
                <div className="flex items-center gap-3">
                    <img src={csslogo} alt="CCS Logo" className="w-8 h-8 opacity-80" />
                    <div>
                        <p className="font-bold text-base text-purple-800">Sit-In Monitoring System</p>
                        <p className="text-xs text-slate-500">College of Computer Studies</p>
                    </div>
                </div>

                {/* Links */}
                <div className="flex gap-8">
                    {["Privacy Policy", "Terms of Use", "Support", "About"].map((l) => (
                        <a key={l} href="#" className="text-sm font-medium text-slate-600 hover:text-purple-800 transition-colors">{l}</a>
                    ))}
                </div>

                {/* Copyright */}
                <p className="text-xs text-slate-500">
                    © {new Date().getFullYear()} CCS. All rights reserved.
                </p>
            </div>
        </footer>
    );
}