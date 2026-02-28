import React, { useState, useEffect } from "react";
import ccslogo from "../assets/image/ccslogo.png";
import { useNavigate } from "react-router-dom";

const NAV_LINKS = [
  { label: "Home", link: "#home" },
  { label: "Community ▾", link: "#" },
  { label: "About", link: "#features" },
  
];
export default function NavigationBar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 pt-5 pb-5  right-0 z-50 transition-all duration-300 ${scrolled ? "nav-blur bg-white/80 shadow-sm border-stone-200" : "bg-transparent"}`}
    >
      <div className="max-w-8xl mx-5 lg:mx-30 px-0 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-md flex items-center justify-center">
            <img src={ccslogo} alt="CCS logo" className="w-10 h-10" />
          </div>
          <span
            className="font-display text-xl font-extrabold tracking-tight"
            style={{ color: "#5B2D8E" }}
          >
           Sit-In Monitoring System
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 font-medium pr-20">
          {NAV_LINKS.map((link) => (
            link.label === "Community ▾" ? (
              <div key={link.label} className="relative group">
                <button className="text-md font-semibold text-stone-500 hover:text-stone-900 transition-colors">
                  {link.label}
                </button>

                {/* Dropdown */}
                <div className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-lg 
                                opacity-0 invisible group-hover:opacity-100 
                                group-hover:visible transition-all duration-200">
                  <a href="" className="block px-4 py-2 hover:bg-gray-100">
                    Forum
                  </a>
                  <a href="" className="block px-4 py-2 hover:bg-gray-100">
                    Events
                  </a>
                  <a href="" className="block px-4 py-2 hover:bg-gray-100">
                    Members
                  </a>
                </div>
              </div>
            ) : (
              <a
                key={link.label}
                href={link.link}
                className="text-md font-semibold text-stone-500 hover:text-stone-900 transition-colors"
              >
                {link.label}
              </a>
            )
          ))}

  <div className="hidden md:flex items-center gap-3">
    <button
      className="btn-outline text-white text-sm px-8 py-2 rounded-full"
      onClick={() => navigate("/login")}
    >
      Log In
    </button>
    <button
      className="btn-primary text-white text-sm px-8 py-2 rounded-full"
      onClick={() => navigate("/register")}
    >
      Register
    </button>
  </div>
</div>
        <button
          className="md:hidden lg:hidden text-stone-600"
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
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="flex gap-3 mt-3">
            <button className="btn-primary text-sm text-white px-4 py-2 rounded-full ">
              Log In
            </button>

          </div>
        </div>
      )}
    </nav>
  );
}
