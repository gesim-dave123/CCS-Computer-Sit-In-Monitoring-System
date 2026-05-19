import React, { useState, useEffect } from "react";
import ccslogo from "../assets/image/ccslogo.png";
import catUser from "../assets/image/catUser.png";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  LayoutDashboard,
  Bell,
  Users,
  Monitor,
  FileText,
  BarChart3,
  MessageSquare,
  CalendarCheck2,
  LogOut,
  Cpu,
  Download,
  Moon,
  Sun,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  User,
  Shield,
  Camera,
  AlertCircle,
  CheckCircle2,
  Lock
} from "lucide-react";

const NAV_LINKS = [
  { label: "Overview", icon: LayoutDashboard, path: "/admin" },
  { label: "Students", icon: Users, path: "/admin/students" },
  {
    label: "Sit-in",
    icon: Monitor,
    children: [
      { label: "Current Sit-In", icon: Monitor, path: "/admin/sit-in" },
      {
        label: "Sit-In Records",
        icon: FileText,
        path: "/admin/sit-in/records",
      },
    ],
  },
  { label: "Announcements", icon: Bell, path: "/admin/announcements" },
  { label: "Labs & Software", icon: Cpu, path: "/admin/labs-software" },
  { label: "Testimonials", icon: MessageSquare, path: "/admin/testimonials" },
  { label: "Reports & Analytics", icon: BarChart3, path: "/admin/analytics" },
  {
    label: "Reservations",
    icon: CalendarCheck2,
    path: "/admin/reservations",
    badgeKey: "reservations",
  },
];

export default function AdminNavigationBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("adminSidebarCollapsed") === "true";
  });
  const [openSubMenus, setOpenSubMenus] = useState(() => {
    const initial = {};
    NAV_LINKS.forEach((link) => {
      if (
        link.children?.some((child) => window.location.pathname === child.path)
      ) {
        initial[link.label] = true;
      }
    });
    return initial;
  });
  const [pendingReservations, setPendingReservations] = useState(0);
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") return stored;
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }
    return "light";
  });
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "null"));

  // Settings Modal State
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState("profile");
  const [editFirstName, setFirstName] = useState("");
  const [editLastName, setLastName] = useState("");
  const [editMiddleName, setMiddleName] = useState("");
  const [editEmail, setEmail] = useState("");
  const [editAddress, setAddress] = useState("");
  const [editPhotoFile, setEditPhotoFile] = useState(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState(catUser);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const openSettingsModal = () => {
    setFirstName(user?.first_name || "");
    setMiddleName(user?.middle_name || "");
    setLastName(user?.last_name || "");
    setEmail(user?.email || "");
    setAddress(user?.address || "");
    setEditPhotoFile(null);
    setEditPhotoPreview(user?.profilePicture || user?.profile_picture || catUser);
    setError("");
    setPasswordSuccess("");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSettingsTab("profile");
    setSettingsModalOpen(true);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setEditPhotoPreview(reader.result);
    reader.readAsDataURL(file);
    setEditPhotoFile(file);
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("firstName", editFirstName);
      formData.append("lastName", editLastName);
      formData.append("MiddleName", editMiddleName || "");
      formData.append("email", editEmail);
      formData.append("currentEmail", user?.email || editEmail);
      formData.append("address", editAddress);
      formData.append("course", user?.course || "");
      formData.append("yearLevel", user?.year_level || "");
      if (editPhotoFile) formData.append("profilePhoto", editPhotoFile);

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/editProfile.php`, { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Failed to update profile."); return; }
      if (json.user) {
        const mergedUser = { ...user, ...json.user };
        setUser(mergedUser);
        localStorage.setItem("user", JSON.stringify(mergedUser));
      }
      setSettingsModalOpen(false);
    } catch { setError("Server error."); } finally { setLoading(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    if (newPassword.length < 8) { setError("Password must be at least 8 characters."); return; }

    setPasswordLoading(true);
    setError("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/changePassword.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_number: user?.id_number,
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Failed to change password."); return; }
      setPasswordSuccess("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch { setError("Server error."); } finally { setPasswordLoading(false); }
  };

  // Sync open submenus with current path
  useEffect(() => {
    const newOpen = { ...openSubMenus };
    NAV_LINKS.forEach((link) => {
      if (link.children?.some((child) => location.pathname === child.path)) {
        newOpen[link.label] = true;
      }
    });
    setOpenSubMenus(newOpen);
  }, [location.pathname]);

  useEffect(() => {
    const isDark = theme === "dark";
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("adminSidebarCollapsed", isCollapsed);
    if (isCollapsed) {
      document.body.classList.add("admin-sidebar-collapsed");
    } else {
      document.body.classList.remove("admin-sidebar-collapsed");
    }
  }, [isCollapsed]);

  useEffect(() => {
    let alive = true;
    const fetchPending = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/reservations.php?admin=1`,
        );
        const json = await res.json();
        if (!res.ok || !alive) return;
        const pending = (json.reservations || []).filter(
          (r) => r.status === "pending",
        ).length;
        if (alive) setPendingReservations(pending);
      } catch {}
    };
    fetchPending();
    const id = setInterval(fetchPending, 20000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const toggleSubMenu = (label, e) => {
    if (e) e.stopPropagation();
    setOpenSubMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const navLinkClass = (isActive) =>
    `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
      isActive
        ? "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 shadow-sm"
        : "text-slate-700 dark:text-slate-300 hover:bg-purple-50 hover:text-purple-800 dark:hover:bg-slate-800 dark:hover:text-purple-300"
    } ${isCollapsed ? "justify-center" : ""}`;

  return (
    <>
      {/* Mobile hamburger toggle */}
      <button
        className="mobile-menu-toggle md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow"
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label="Toggle admin sidebar"
      >
        {menuOpen ? (
          <X className="w-5 h-5 text-slate-700 dark:text-slate-300" />
        ) : (
          <Menu className="w-5 h-5 text-slate-700 dark:text-slate-300" />
        )}
      </button>

      {/* Desktop sidebar */}
      <aside
        onClick={() => isCollapsed && setIsCollapsed(false)}
        className={`admin-sidebar hidden md:flex fixed inset-y-0 left-0 z-40 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 shadow-sm flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-20 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50" : "w-64"
        }`}
      >
        {/* Header */}
        <div className="admin-sidebar-header h-16 px-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 overflow-hidden">
          <div
            className={`flex items-center gap-3 transition-opacity duration-300 ${isCollapsed ? "opacity-0 w-0" : "opacity-100"}`}
          >
            <img src={ccslogo} alt="CCS logo" className="w-9 h-9 shrink-0" />
            <div className="whitespace-nowrap">
              <p className="text-[10px] leading-tight text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
                CCS
              </p>
              <h2 className="text-sm font-bold text-purple-800 dark:text-purple-300">
                Admin Panel
              </h2>
            </div>
          </div>
          {/* Collapse toggle (Desktop) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsCollapsed((prev) => !prev);
            }}
            className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-slate-800 hover:text-purple-800 dark:hover:text-purple-300 transition-all ${isCollapsed ? "mx-auto" : ""}`}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = link.path && location.pathname === link.path;
            const hasChildren =
              Array.isArray(link.children) && link.children.length > 0;
            const isParentActive = hasChildren
              ? link.children.some((child) => location.pathname === child.path)
              : false;
            const isOpen = openSubMenus[link.label];

            if (hasChildren) {
              return (
                <div key={link.label} className="relative group/sitin">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isCollapsed) {
                        setIsCollapsed(false);
                      } else {
                        toggleSubMenu(link.label, e);
                      }
                    }}
                    className={navLinkClass(isParentActive)}
                    title={isCollapsed ? link.label : ""}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!isCollapsed && (
                      <>
                        <span className="text-sm font-medium flex-1 whitespace-nowrap">
                          {link.label}
                        </span>
                        {isOpen ? (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </>
                    )}
                  </button>

                  {/* Accordion sub-links (Expanded) */}
                  {!isCollapsed && (
                    <div
                      className={`grid transition-all duration-300 ease-in-out ${
                        isOpen
                          ? "grid-rows-[1fr] opacity-100 mt-1"
                          : "grid-rows-[0fr] opacity-0 mt-0"
                      }`}
                    >
                      <div className="overflow-hidden ml-4 pl-3 border-l border-slate-200 dark:border-slate-700 space-y-1">
                        {link.children.map((child) => {
                          const ChildIcon = child.icon;
                          const isChildActive =
                            location.pathname === child.path;
                          return (
                            <button
                              key={child.label}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(child.path);
                              }}
                              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                                isChildActive
                                  ? "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 font-semibold"
                                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-purple-700"
                              }`}
                            >
                              <ChildIcon className="w-3.5 h-3.5 opacity-70" />
                              {child.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Flyout sub-links (Collapsed) */}
                  {isCollapsed && (
                    <div className="absolute left-full top-0 ml-2 w-60 opacity-0 invisible -translate-x-2 pointer-events-none transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) z-50 group-hover/sitin:opacity-100 group-hover/sitin:visible group-hover/sitin:translate-x-0 group-hover/sitin:pointer-events-auto">
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl rounded-xl p-2 border-l-4 border-l-purple-600 transform transition-transform duration-300 group-hover/sitin:scale-100 scale-95 origin-left pointer-events-auto">
                        <p className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 mb-1">
                          {link.label} Options
                        </p>
                        {link.children.map((child) => {
                          const ChildIcon = child.icon;
                          const isChildActive =
                            location.pathname === child.path;
                          return (
                            <button
                              key={child.label}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(child.path);
                              }}
                              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                                isChildActive
                                  ? "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300"
                                  : "text-slate-700 dark:text-slate-300 hover:bg-purple-50 hover:text-purple-800 dark:hover:bg-slate-800 dark:hover:text-purple-300"
                              }`}
                            >
                              <ChildIcon className="w-4 h-4" />
                              {child.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            const badge =
              link.badgeKey === "reservations" && pendingReservations > 0
                ? pendingReservations
                : 0;
            return (
              <button
                key={link.label}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isCollapsed) {
                    setIsCollapsed(false);
                  }
                  if (link.path) navigate(link.path);
                }}
                className={`${navLinkClass(isActive)} ${link.path ? "" : "opacity-60 cursor-default"}`}
                title={isCollapsed ? link.label : ""}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!isCollapsed && (
                  <span className="text-sm font-medium flex-1 whitespace-nowrap">
                    {link.label}
                  </span>
                )}
                {badge > 0 && (
                  <span
                    className={`inline-flex min-w-[20px] h-5 px-1.5 items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-bold ${isCollapsed ? "absolute -top-1 -right-1 border-2 border-white dark:border-slate-900 scale-90" : ""}`}
                  >
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Profile Section & Footer */}
        <div className="admin-sidebar-footer p-3 border-t border-slate-200 dark:border-slate-700 space-y-3">
          {/* User Info */}
          {!isCollapsed && (
            <div className="px-2 py-1 flex items-center gap-3 relative group/profile">
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md overflow-hidden border-2 border-white dark:border-slate-800">
                <img src={user?.profilePicture || user?.profile_picture || catUser} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  Administrator
                </p>
              </div>
              <button 
                onClick={openSettingsModal}
                className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-purple-600 dark:hover:text-purple-300 transition-all opacity-0 group-hover/profile:opacity-100"
                title="Account Settings"
              >
                <Settings size={14} />
              </button>
            </div>
          )}

          {/* Action Row */}
          <div
            className={`flex items-center gap-2 ${isCollapsed ? "flex-col" : "justify-between"}`}
          >
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={() =>
                setTheme((prev) => (prev === "dark" ? "light" : "dark"))
              }
              className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-slate-700 hover:text-purple-800 dark:hover:text-purple-300 transition-all"
              aria-label="Toggle dark mode"
              title="Toggle dark mode"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={logout}
              className={`flex items-center justify-center h-10 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-all shadow-md ${isCollapsed ? "w-10" : "flex-1 gap-2"}`}
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              {!isCollapsed && <span className="text-sm font-bold">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Settings Modal */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 animate-in zoom-in duration-200 overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-600 rounded-lg text-white">
                    <User size={18} />
                  </div>
                  <h2 className="text-lg font-bold text-purple-800 dark:text-purple-300 tracking-tight">Admin Settings</h2>
                </div>
                <button onClick={() => setSettingsModalOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
                  <X size={20} />
                </button>
             </div>

             <div className="flex border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <button 
                  onClick={() => { setSettingsTab("profile"); setError(""); }}
                  className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${settingsTab === "profile" ? "text-purple-600 dark:text-purple-300 border-b-2 border-purple-600 dark:border-purple-300 bg-purple-50/30 dark:bg-purple-900/10" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"}`}
                >
                  Profile Information
                </button>
                <button 
                  onClick={() => { setSettingsTab("security"); setError(""); }}
                  className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${settingsTab === "security" ? "text-purple-600 dark:text-purple-300 border-b-2 border-purple-600 dark:border-purple-300 bg-purple-50/30 dark:bg-purple-900/10" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"}`}
                >
                  Security & Password
                </button>
             </div>

             <div className="p-6">
                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 flex items-center gap-2 text-red-600 dark:text-red-400 text-[10px] font-bold uppercase tracking-wide">
                    <AlertCircle size={14} />
                    {error}
                  </div>
                )}
                {passwordSuccess && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wide">
                    <CheckCircle2 size={14} />
                    {passwordSuccess}
                  </div>
                )}

                {settingsTab === "profile" ? (
                  <form onSubmit={saveProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                       <div className="md:col-span-4 flex flex-col items-center">
                          <div className="relative group">
                            <img src={editPhotoPreview} alt="Preview" className="w-32 h-32 rounded-3xl object-cover border-4 border-white dark:border-slate-800 shadow-lg transition-transform group-hover:scale-[1.02]" />
                            <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-purple-600 text-white rounded-xl flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-all border-2 border-white dark:border-slate-800">
                               <Camera size={18} />
                               <input type="file" className="hidden" onChange={handlePhotoChange} />
                            </label>
                          </div>
                          <p className="mt-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Admin Avatar</p>
                       </div>
                       
                       <div className="md:col-span-8 grid grid-cols-2 gap-4">
                          <div className="col-span-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">First Name</label>
                            <input value={editFirstName} onChange={e => setFirstName(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all" />
                          </div>
                          <div className="col-span-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Last Name</label>
                            <input value={editLastName} onChange={e => setLastName(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all" />
                          </div>
                          <div className="col-span-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Official Email</label>
                            <input value={editEmail} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all" />
                          </div>
                          <div className="col-span-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Office / Home Address</label>
                            <input value={editAddress} onChange={e => setAddress(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all" />
                          </div>
                       </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                       <button type="button" onClick={() => setSettingsModalOpen(false)} className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Discard</button>
                       <button type="submit" disabled={loading} className="px-8 py-2.5 bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg active:scale-95 disabled:opacity-50 transition-all">
                          {loading ? "Saving..." : "Update Profile"}
                       </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handlePasswordChange} className="max-w-md mx-auto py-4 space-y-5">
                    <div className="space-y-4">
                       <div>
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Current Password</label>
                          <div className="relative">
                            <input 
                              type="password"
                              value={currentPassword} 
                              onChange={e => setCurrentPassword(e.target.value)} 
                              placeholder="••••••••"
                              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all" 
                            />
                          </div>
                       </div>
                       <div className="h-px bg-slate-100 dark:bg-slate-800 my-2"></div>
                       <div>
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">New Administrative Password</label>
                          <input 
                            type="password"
                            value={newPassword} 
                            onChange={e => setNewPassword(e.target.value)} 
                            placeholder="Min. 8 characters"
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all" 
                          />
                       </div>
                       <div>
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Confirm New Password</label>
                          <input 
                            type="password"
                            value={confirmPassword} 
                            onChange={e => setConfirmPassword(e.target.value)} 
                            placeholder="••••••••"
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all" 
                          />
                       </div>
                    </div>
                    <div className="pt-6">
                       <button type="submit" disabled={passwordLoading} className="w-full py-3 bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                          {passwordLoading ? "Processing..." : "Secure Admin Account"}
                       </button>
                    </div>
                  </form>
                )}
             </div>
          </div>
        </div>
      )}

      {/* Mobile drawer overlay */}
      {menuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="w-72 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 shadow-xl px-3 py-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile header */}
            <div className="h-12 px-2 mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <img src={ccslogo} alt="CCS logo" className="w-8 h-8" />
                <h2 className="text-sm font-bold text-purple-800 dark:text-purple-300">
                  Admin Panel
                </h2>
              </div>
              <button
                type="button"
                onClick={() =>
                  setTheme((prev) => (prev === "dark" ? "light" : "dark"))
                }
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-slate-800 hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
                aria-label="Toggle dark mode"
                title="Toggle dark mode"
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Mobile nav links */}
            <nav className="space-y-1">
              {NAV_LINKS.map((link) => {
                const Icon = link.icon;
                const isActive = link.path && location.pathname === link.path;
                const hasChildren =
                  Array.isArray(link.children) && link.children.length > 0;
                const isParentActive = hasChildren
                  ? link.children.some(
                      (child) => location.pathname === child.path,
                    )
                  : false;

                if (hasChildren) {
                  return (
                    <div
                      key={link.label}
                      className="rounded-lg border border-slate-200 dark:border-slate-700 p-2"
                    >
                      <div
                        className={`flex items-center gap-2 px-2 py-1.5 text-sm font-medium ${
                          isParentActive
                            ? "text-purple-800 dark:text-purple-300"
                            : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {link.label}
                      </div>
                      <div className="mt-1 space-y-1">
                        {link.children.map((child) => {
                          const ChildIcon = child.icon;
                          const isChildActive =
                            location.pathname === child.path;
                          return (
                            <button
                              key={child.label}
                              type="button"
                              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm ${
                                isChildActive
                                  ? "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300"
                                  : "text-slate-700 dark:text-slate-300 hover:bg-purple-50 hover:text-purple-800 dark:hover:bg-slate-800 dark:hover:text-purple-300"
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

                const badge =
                  link.badgeKey === "reservations" && pendingReservations > 0
                    ? pendingReservations
                    : 0;
                return (
                  <button
                    key={link.label}
                    type="button"
                    className={`${navLinkClass(isActive)} ${link.path ? "" : "opacity-60 cursor-default"}`}
                    onClick={() => {
                      if (link.path) navigate(link.path);
                      setMenuOpen(false);
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium flex-1">
                      {link.label}
                    </span>
                    {badge > 0 && (
                      <span className="inline-flex min-w-[20px] h-5 px-1.5 items-center justify-center rounded-full bg-amber-500 text-white text-xs font-bold">
                        {badge > 99 ? "99+" : badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                onClick={() => {
                  setMenuOpen(false);
                  openSettingsModal();
                }}
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm font-semibold">Settings</span>
              </button>
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
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
        </div>
      )}
    </>
  );
}
