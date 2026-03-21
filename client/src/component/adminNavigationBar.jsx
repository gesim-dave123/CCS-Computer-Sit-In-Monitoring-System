import React, { useState } from "react";
import ccslogo from "../assets/image/ccslogo.png";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  LayoutDashboard,
  Search,
  Users,
  Monitor,
  FileText,
  BarChart3,
  MessageSquare,
  CalendarCheck2,
  LogOut,
} from "lucide-react";

const NAV_LINKS = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Search", icon: Search },
  { label: "Students", icon: Users },
  { label: "Sit-in", icon: Monitor },
  { label: "View Sit-in Records", icon: FileText },
  { label: "Sit-in Reports", icon: BarChart3 },
  { label: "Feedback Reports", icon: MessageSquare },
  { label: "Reservations", icon: CalendarCheck2 },
];
export default function AdminNavigationBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white border border-slate-200 shadow"
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label="Toggle admin sidebar"
      >
        {menuOpen ? (
          <X className="w-5 h-5 text-slate-700" />
        ) : (
          <Menu className="w-5 h-5 text-slate-700" />
        )}
      </button>

      <aside className="hidden md:flex fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 shadow-sm flex-col">
        <div className="h-16 px-4 border-b border-slate-200 flex items-center gap-3">
          <img src={ccslogo} alt="CCS logo" className="w-9 h-9" />
          <div>
            <p className="text-xs text-slate-500">CCS</p>
            <h2 className="text-sm font-bold text-purple-800">Admin Panel</h2>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.label}
                type="button"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-slate-700 hover:bg-purple-50 hover:text-purple-800 transition-colors"
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{link.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-200">
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-semibold">Logout</span>
          </button>
        </div>
      </aside>

      {menuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/30"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="w-72 h-full bg-white border-r border-slate-200 shadow-xl px-3 py-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-12 px-2 mb-3 flex items-center gap-2">
              <img src={ccslogo} alt="CCS logo" className="w-8 h-8" />
              <h2 className="text-sm font-bold text-purple-800">Admin Panel</h2>
            </div>

            <nav className="space-y-1">
              {NAV_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.label}
                    type="button"
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-slate-700 hover:bg-purple-50 hover:text-purple-800"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{link.label}</span>
                  </button>
                );
              })}
            </nav>

            <button
              type="button"
              className="w-full mt-4 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
              onClick={() => {
                setMenuOpen(false);
                logout();
              }}
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-semibold">Logout</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
