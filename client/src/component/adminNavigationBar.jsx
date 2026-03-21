import React, { useState } from "react";
import ccslogo from "../assets/image/ccslogo.png";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  Monitor,
  FileText,
  BarChart3,
  MessageSquare,
  CalendarCheck2,
  LogOut,
} from "lucide-react";

const NAV_LINKS = [
  { label: "Overview", icon: LayoutDashboard, path: "/admin" },
  { label: "Students", icon: Users, path: "/admin/students" },
  {
    label: "Sit-in",
    icon: Monitor,
    children: [
      { label: "Current Sit-In", icon: Monitor, path: "/admin/sit-in" },
      { label: "Sit-In Records", icon: FileText, path: "/admin/sit-in/records" },
      { label: "View Sit-In Reports", icon: BarChart3, path: "/admin/sit-in/reports" },
    ],
  },
  { label: "Feedback Reports", icon: MessageSquare },
  { label: "Reservations", icon: CalendarCheck2 },
];

export default function AdminNavigationBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
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
            const isActive = link.path && location.pathname === link.path;
            const hasChildren = Array.isArray(link.children) && link.children.length > 0;
            const isParentActive = hasChildren
              ? link.children.some((child) => location.pathname === child.path)
              : false;

            if (hasChildren) {
              return (
                <div key={link.label} className="relative group/sitin">
                  <button
                    type="button"
                    onClick={() => navigate(link.children[0].path)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                      isParentActive
                        ? "bg-purple-100 text-purple-800"
                        : "text-slate-700 hover:bg-purple-50 hover:text-purple-800"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{link.label}</span>
                  </button>

                  <div className="absolute left-full top-0 w-3 h-full" />

                  <div className="absolute left-full top-0 ml-0 pl-2 w-60 opacity-0 invisible translate-x-1 pointer-events-none transition-all duration-150 z-20 group-hover/sitin:opacity-100 group-hover/sitin:visible group-hover/sitin:translate-x-0 group-hover/sitin:pointer-events-auto group-focus-within/sitin:opacity-100 group-focus-within/sitin:visible group-focus-within/sitin:translate-x-0 group-focus-within/sitin:pointer-events-auto">
                    <div className="bg-white border border-slate-200 shadow-lg rounded-xl p-2">
                    {link.children.map((child) => {
                      const ChildIcon = child.icon;
                      const isChildActive = location.pathname === child.path;
                      return (
                        <button
                          key={child.label}
                          type="button"
                          onClick={() => navigate(child.path)}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm ${
                            isChildActive
                              ? "bg-purple-100 text-purple-800"
                              : "text-slate-700 hover:bg-purple-50 hover:text-purple-800"
                          }`}
                        >
                          <ChildIcon className="w-4 h-4" />
                          {child.label}
                        </button>
                      );
                    })}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <button
                key={link.label}
                type="button"
                onClick={() => {
                  if (link.path) navigate(link.path);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                  isActive
                    ? "bg-purple-100 text-purple-800"
                    : "text-slate-700 hover:bg-purple-50 hover:text-purple-800"
                } ${link.path ? "" : "opacity-60 cursor-default"}`}
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
                const isActive = link.path && location.pathname === link.path;
                const hasChildren = Array.isArray(link.children) && link.children.length > 0;
                const isParentActive = hasChildren
                  ? link.children.some((child) => location.pathname === child.path)
                  : false;

                if (hasChildren) {
                  return (
                    <div key={link.label} className="rounded-lg border border-slate-200 p-2">
                      <div
                        className={`flex items-center gap-2 px-2 py-1.5 text-sm font-medium ${
                          isParentActive ? "text-purple-800" : "text-slate-700"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {link.label}
                      </div>
                      <div className="mt-1 space-y-1">
                        {link.children.map((child) => {
                          const ChildIcon = child.icon;
                          const isChildActive = location.pathname === child.path;
                          return (
                            <button
                              key={child.label}
                              type="button"
                              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm ${
                                isChildActive
                                  ? "bg-purple-100 text-purple-800"
                                  : "text-slate-700 hover:bg-purple-50 hover:text-purple-800"
                              }`}
                              onClick={() => {
                                navigate(child.path);
                                setMenuOpen(false);
                              }}
                            >
                              <ChildIcon className="w-4 h-4" />
                              {child.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                return (
                  <button
                    key={link.label}
                    type="button"
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left ${
                      isActive
                        ? "bg-purple-100 text-purple-800"
                        : "text-slate-700 hover:bg-purple-50 hover:text-purple-800"
                    } ${link.path ? "" : "opacity-60 cursor-default"}`}
                    onClick={() => {
                      if (link.path) navigate(link.path);
                      setMenuOpen(false);
                    }}
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

