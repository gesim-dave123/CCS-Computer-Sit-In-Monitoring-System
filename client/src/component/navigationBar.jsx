import React, { useState, useEffect } from "react";
import ccslogo from "../assets/image/ccslogo.png";
import { useNavigate } from "react-router-dom";
import { Moon, Sun } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", link: "#home" },
  { label: "About", link: "#about" },
  { label: "Reviews", link: "#testimonials" },
  { label: "Leaderboard", link: "#leaderboard" },
];

export default function NavigationBar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const isDark = theme === "dark";
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? "bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-gray-100 dark:border-slate-800 shadow-[0_10px_30px_rgba(56,24,114,0.05)]"
          : "bg-transparent"
        }`}
    >
      <div className="flex justify-between items-center w-full px-8 py-4 max-w-[1400px] mx-auto">
        <div className="flex items-center gap-3">
          <img src={ccslogo} alt="CCS Logo" className="w-10 h-10 object-contain" />
          <span className="text-xl font-bold text-[#5428a8] dark:text-[#a388ee] font-['Montserrat'] tracking-tight">
            CCS SITIN
  
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.link}
              className={`font-['Montserrat'] tracking-tight transition-colors duration-300 ${link.label === "Home"
                  ? "text-[#5428a8] dark:text-[#a388ee] font-bold border-b-2 border-[#5428a8] dark:border-[#a388ee] pb-1"
                  : "text-slate-600 dark:text-slate-400 hover:text-[#5428a8] dark:hover:text-[#a388ee] font-medium"
                }`}
            >
              {link.label.replace(" ▾", "")}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-[#5428a8]/5 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            className="hidden md:block font-['Montserrat'] text-sm font-semibold text-[#5428a8] dark:text-[#a388ee] hover:bg-[#5428a8]/5 dark:hover:bg-slate-800 px-4 py-2 rounded-lg transition-colors"
            onClick={() => navigate("/login")}
          >
            Log In
          </button>
          <button
            className="bg-[#5428a8] dark:bg-[#6c44c1] text-white font-['Montserrat'] text-sm font-semibold px-6 py-2 rounded-lg hover:opacity-90 transition-opacity shadow-[0_4px_14px_0_rgba(84,40,168,0.39)]"
            onClick={() => navigate("/register")}
          >
            Get Started
          </button>
        </div>
      </div>
      <div className="md:hidden lg:hidden flex items-center gap-3">
        <button
          className="text-stone-600"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-5 h-5"
          >
            {menuOpen ? (
              <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden nav-blur bg-white/100 border-t border-stone-100 px-6 pb-4 w-40  absolute right-2">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="block py-2 text-sm text-stone-600"
              onClick={() => logout()}
            >
              {link.label}
            </a>
          ))}
          <div className="flex flex-col gap-3 mt-3">
            <button className="btn-primary text-sm text-white px-4 py-2 rounded-full w-full">
              Log In
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
