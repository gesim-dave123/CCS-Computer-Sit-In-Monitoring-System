import React, { useState, useEffect, useRef } from "react";
import ccslogo from "../assets/image/ccslogo.png";
import catUser from "../assets/image/catUser.png";
import { useNavigate } from "react-router-dom";
import { 
  Moon, 
  Sun, 
  LogOut, 
  User as UserIcon, 
  Settings,
  X,
  Shield,
  Camera,
  AlertCircle,
  CheckCircle2,
  Lock,
  User
} from "lucide-react";

const NAV_LINKS = [
  { label: "Home", link: "/dashboard", route: true },
  { label: "Announcements", link: "/dashboard/announcements", route: true },
  { label: "History", link: "/dashboard/history", route: true },
  { label: "Reservations", link: "/dashboard/reservations", route: true },
  { label: "Feedback", link: "/dashboard/feedback", route: true },
];

export default function NavigationBar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  
  // Settings Modal State
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState("profile");
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "null"));
  const [editFirstName, setFirstName] = useState("");
  const [editLastName, setLastName] = useState("");
  const [editMiddleName, setMiddleName] = useState("");
  const [editEmail, setEmail] = useState("");
  const [editAddress, setAddress] = useState("");
  const [editCourse, setCourse] = useState("");
  const [editYearLevel, setYearLevel] = useState("");
  const [editPhotoFile, setEditPhotoFile] = useState(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState(catUser);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const notificationsRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  
  const activeIdNumber = user?.id_number || "";

  useEffect(() => {
    const isDark = theme === "dark";
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setNotificationsOpen(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchNotifications = async () => {
      if (!activeIdNumber) return;

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/notifications.php?id_number=${encodeURIComponent(activeIdNumber)}&limit=12`,
        );
        const json = await res.json();

        if (!res.ok) return;

        const rows = Array.isArray(json.notifications) ? json.notifications : [];
        if (isMounted) {
          setNotifications(rows);
          setUnreadCount(Number(json.unread_count ?? 0));
        }
      } catch (err) {
        console.error("Notifications fetch failed", err);
      }
    };

    fetchNotifications();
    const refreshId = window.setInterval(fetchNotifications, 30000);

    const handleOpenSettings = () => openSettingsModal();
    window.addEventListener('openAccountSettings', handleOpenSettings);

    return () => {
      isMounted = false;
      window.clearInterval(refreshId);
      window.removeEventListener('openAccountSettings', handleOpenSettings);
    };
  }, [activeIdNumber, user]);

  const openSettingsModal = () => {
    setFirstName(user?.first_name || "");
    setMiddleName(user?.middle_name || "");
    setLastName(user?.last_name || "");
    setEmail(user?.email || "");
    setAddress(user?.address || "");
    setCourse(user?.course || "");
    setYearLevel(user?.year_level || "");
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
      formData.append("course", editCourse);
      formData.append("address", editAddress);
      formData.append("yearLevel", editYearLevel);
      if (editPhotoFile) formData.append("profilePhoto", editPhotoFile);

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/editProfile.php`, { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Failed."); return; }
      if (json.user) {
        const mergedUser = { ...user, ...json.user };
        setUser(mergedUser);
        localStorage.setItem("user", JSON.stringify(mergedUser));
        // Also dispatch a custom event to notify other components (like Dashboard)
        window.dispatchEvent(new Event('userProfileUpdated'));
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
          id_number: activeIdNumber,
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

  const formatNotificationDate = (value) => {
    if (!value) return "N/A";
    const parsed = new Date(value);
    return parsed.toLocaleString(undefined, {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const markAllNotificationsRead = async () => {
    if (!activeIdNumber || unreadCount <= 0) return;
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/notifications.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_number: activeIdNumber, action: "mark_all_read" }),
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch {}
  };

  const openNotification = async (notification) => {
    if (!activeIdNumber) return;
    if (Number(notification.is_read) !== 1) {
      try {
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/notifications.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_number: activeIdNumber,
            action: "mark_read",
            notification_id: notification.notification_id,
          }),
        });
        setNotifications(prev => prev.map(n => n.notification_id === notification.notification_id ? { ...n, is_read: 1 } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch {}
    }
    if (notification.action_url) navigate(notification.action_url);
    setNotificationsOpen(false);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <>
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-white/20 dark:border-slate-800/50 shadow-[0_10px_30px_rgba(56,24,114,0.06)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <img src={ccslogo} alt="CCS logo" className="w-10 h-10 object-contain" />
          </div>
          <span className="text-2xl font-bold tracking-tighter text-[#381872] dark:text-violet-300 font-['Montserrat']">
            CCS SITIN
          </span>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          {NAV_LINKS.map((link) => (
            <button
              key={link.label}
              onClick={() => navigate(link.link)}
              className={`font-['Montserrat'] antialiased tracking-tight text-sm font-semibold transition-all cursor-pointer active:scale-95 ${
                window.location.pathname === link.link
                  ? "text-[#381872] dark:text-violet-300 border-b-2 border-[#381872] dark:border-violet-400 pb-1"
                  : "text-slate-500 dark:text-slate-400 hover:text-[#381872] dark:hover:text-violet-300"
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
            className="p-2 rounded-full text-[#381872] dark:text-violet-400 hover:bg-violet-50/50 dark:hover:bg-violet-900/20 transition-all duration-300 active:scale-95"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setNotificationsOpen((prev) => !prev)}
              className="p-2 rounded-full text-[#381872] dark:text-violet-400 hover:bg-violet-50/50 dark:hover:bg-violet-900/20 transition-all duration-300 relative active:scale-95"
            >
              <span className="material-symbols-outlined text-2xl">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold border-2 border-white dark:border-slate-900">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            {notificationsOpen && (
              <div className="notification-dropdown absolute right-0 mt-4 w-80 max-h-96 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl z-50">
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-['Montserrat']">Notifications</p>
                  <button onClick={markAllNotificationsRead} disabled={unreadCount <= 0} className="text-xs font-bold text-[#381872] dark:text-violet-400 hover:underline disabled:opacity-50">Mark all read</button>
                </div>
                <div className="p-2 space-y-1">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-500 py-6 text-center">No notifications yet</p>
                  ) : (
                    notifications.map((item) => (
                      <button
                        key={item.notification_id}
                        onClick={() => openNotification(item)}
                        className={`w-full text-left rounded-lg p-3 transition-colors ${Number(item.is_read) === 1 ? "hover:bg-slate-50 dark:hover:bg-slate-800" : "bg-violet-50/50 dark:bg-violet-900/20"}`}
                      >
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{item.title}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{item.message}</p>
                        <p className="text-[10px] text-slate-400 mt-2 uppercase font-bold tracking-tight">{formatNotificationDate(item.created_at)}</p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2 hidden md:block"></div>
          
          <div className="relative" ref={profileRef}>
            <img
              src={user?.profilePicture || user?.profile_picture || catUser}
              onError={(e) => (e.currentTarget.src = catUser)}
              alt="Profile"
              className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 shadow-sm cursor-pointer hover:ring-2 hover:ring-violet-400 transition-all"
              onClick={() => setProfileOpen(!profileOpen)}
            />

            {profileOpen && (
              <div className="absolute right-0 mt-4 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 mb-2">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {user?.id_number}
                  </p>
                </div>

                <button
                  onClick={() => { navigate("/dashboard"); setProfileOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-[#381872] dark:hover:text-violet-300 flex items-center gap-3 transition-colors"
                >
                  <UserIcon size={16} />
                  My Dashboard
                </button>

                <button
                  onClick={() => { openSettingsModal(); setProfileOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-[#381872] dark:hover:text-violet-300 flex items-center gap-3 transition-colors"
                >
                  <Settings size={16} />
                  Account Settings
                </button>

                <div className="h-px bg-slate-100 dark:border-slate-800 my-2 mx-2"></div>

                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-3 transition-colors"
                >
                  <LogOut size={16} />
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-slate-600 dark:text-slate-300"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-6 space-y-4 shadow-xl">
          {NAV_LINKS.map((link) => (
            <button
              key={link.label}
              onClick={() => { navigate(link.link); setMenuOpen(false); }}
              className="block w-full text-left text-sm font-semibold text-slate-600 dark:text-slate-300"
            >
              {link.label}
            </button>
          ))}
          <button 
            onClick={() => { openSettingsModal(); setMenuOpen(false); }}
            className="block w-full text-left text-sm font-semibold text-slate-600 dark:text-slate-300"
          >
            Account Settings
          </button>
          <button onClick={() => { logout(); setMenuOpen(false); }} className="block w-full text-left text-sm font-semibold text-red-600">Logout</button>
        </div>
      )}
    </nav>

    {/* Settings Modal */}
    {isSettingsModalOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
        <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 animate-in zoom-in duration-200 overflow-hidden">
           <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#381872] rounded-lg text-white">
                  <UserIcon size={18} />
                </div>
                <h2 className="text-lg font-bold text-[#381872] dark:text-violet-300 tracking-tight">Account Settings</h2>
              </div>
              <button onClick={() => setSettingsModalOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
                <X size={20} />
              </button>
           </div>

           <div className="flex border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <button 
                onClick={() => { setSettingsTab("profile"); setError(""); }}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${settingsTab === "profile" ? "text-[#381872] dark:text-violet-300 border-b-2 border-[#381872] dark:border-violet-300 bg-violet-50/30 dark:bg-violet-900/10" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"}`}
              >
                Profile Information
              </button>
              <button 
                onClick={() => { setSettingsTab("security"); setError(""); }}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${settingsTab === "security" ? "text-[#381872] dark:text-violet-300 border-b-2 border-[#381872] dark:border-violet-300 bg-violet-50/30 dark:bg-violet-900/10" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"}`}
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
                          <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#381872] text-white rounded-xl flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-all border-2 border-white dark:border-slate-800">
                             <Camera size={18} />
                             <input type="file" className="hidden" onChange={handlePhotoChange} />
                          </label>
                        </div>
                        <p className="mt-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Profile Picture</p>
                     </div>
                     
                     <div className="md:col-span-8 grid grid-cols-2 gap-4">
                        <div className="col-span-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">First Name</label>
                          <input value={editFirstName} onChange={e => setFirstName(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all" />
                        </div>
                        <div className="col-span-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Middle Name</label>
                          <input value={editMiddleName} onChange={e => setMiddleName(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all" />
                        </div>
                        <div className="col-span-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Last Name</label>
                          <input value={editLastName} onChange={e => setLastName(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all" />
                        </div>
                        <div className="col-span-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Program</label>
                          <input value={editCourse} onChange={e => setCourse(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all" />
                        </div>
                        <div className="col-span-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Year Level</label>
                          <select value={editYearLevel} onChange={e => setYearLevel(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all appearance-none">
                            {["1st Year", "2nd Year", "3rd Year", "4th Year"].map(y => <option key={y} value={y}>{y}</option>)}
                          </select>
                        </div>
                        <div className="col-span-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Email Address</label>
                          <input value={editEmail} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all" />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Home Address</label>
                          <input value={editAddress} onChange={e => setAddress(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all" />
                        </div>
                     </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                     <button type="button" onClick={() => setSettingsModalOpen(false)} className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Discard</button>
                     <button type="submit" disabled={loading} className="px-8 py-2.5 bg-[#381872] text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg active:scale-95 disabled:opacity-50 transition-all">
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
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">New Password</label>
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
                     <button type="submit" disabled={passwordLoading} className="w-full py-3 bg-[#381872] text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                        {passwordLoading ? "Processing..." : "Secure Account"}
                     </button>
                  </div>
                </form>
              )}
           </div>
        </div>
      </div>
    )}
    </>
  );
}
