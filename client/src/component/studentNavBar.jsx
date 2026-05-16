import React, { useState, useEffect, useRef } from "react";
import ccslogo from "../assets/image/ccslogo.png";
import { useNavigate } from "react-router-dom";
import { Moon, Sun } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", link: "/dashboard", route: true },
  { label: "Announcements", link: "/dashboard/announcements", route: true },
  { label: "History", link: "/dashboard/history", route: true },
  { label: "Reservations", link: "/dashboard/reservations", route: true },
  { label: "Feedback", link: "/dashboard/feedback", route: true },
];
export default function NavigationBar({ onEditProfile }) {
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
  const notificationsRef = useRef(null);
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const activeIdNumber = currentUser?.id_number || "";

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
    const closeNotifications = (event) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", closeNotifications);
    return () => document.removeEventListener("mousedown", closeNotifications);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchNotifications = async () => {
      if (!activeIdNumber) {
        if (isMounted) {
          setNotifications([]);
          setUnreadCount(0);
        }
        return;
      }

      setNotificationsLoading(true);

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/notifications.php?id_number=${encodeURIComponent(activeIdNumber)}&limit=12`,
        );
        const json = await res.json();

        if (!res.ok) {
          if (isMounted) {
            setNotificationsError(
              json.error || "Failed to load notifications.",
            );
          }
          return;
        }

        const rows = Array.isArray(json.notifications)
          ? json.notifications
          : [];
        const derivedUnread = rows.filter(
          (item) => Number(item.is_read) !== 1,
        ).length;

        if (isMounted) {
          setNotifications(rows);
          setUnreadCount(
            Number.isFinite(Number(json.unread_count))
              ? Number(json.unread_count)
              : derivedUnread,
          );
          setNotificationsError("");
        }
      } catch {
        if (isMounted) {
          setNotificationsError("Could not load notifications.");
        }
      } finally {
        if (isMounted) {
          setNotificationsLoading(false);
        }
      }
    };

    fetchNotifications();
    const refreshId = window.setInterval(fetchNotifications, 30000);

    return () => {
      isMounted = false;
      window.clearInterval(refreshId);
    };
  }, [activeIdNumber]);

  const formatNotificationDate = (value) => {
    if (!value) return "N/A";

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

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
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/notifications.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_number: activeIdNumber,
            action: "mark_all_read",
          }),
        },
      );

      if (!res.ok) return;

      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          is_read: 1,
          read_at: item.read_at || new Date().toISOString(),
        })),
      );
      setUnreadCount(0);
    } catch {
      // Keep UI stable on network errors.
    }
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

        setNotifications((prev) =>
          prev.map((item) =>
            item.notification_id === notification.notification_id
              ? {
                  ...item,
                  is_read: 1,
                  read_at: item.read_at || new Date().toISOString(),
                }
              : item,
          ),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // Keep UI stable on network errors.
      }
    }

    if (notification.action_url) {
      navigate(notification.action_url);
    }

    setNotificationsOpen(false);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

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
            Dashboard
          </span>
        </div>

        <div className="hidden md:flex items-center gap-6 font-medium pr-20">
          {NAV_LINKS.map((link) =>
            link.label === "Edit Profile" ? (
              <button
                key={link.label}
                onClick={() => onEditProfile && onEditProfile()}
                className="text-md font-semibold text-stone-500 hover:text-stone-900 transition-colors"
              >
                {link.label}
              </button>
            ) : link.route ? (
              <button
                key={link.label}
                onClick={() => navigate(link.link)}
                className="text-md font-semibold text-stone-500 hover:text-stone-900 transition-colors"
              >
                {link.label}
              </button>
            ) : (
              <a
                key={link.label}
                href={link.link}
                className="text-md font-semibold text-stone-500 hover:text-stone-900 transition-colors"
              >
                {link.label}
              </a>
            ),
          )}

          <button
            type="button"
            onClick={() =>
              setTheme((prev) => (prev === "dark" ? "light" : "dark"))
            }
            className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-stone-200 text-stone-600 hover:bg-purple-50 hover:text-purple-800 transition-colors"
            aria-label="Toggle dark mode"
            title="Toggle dark mode"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setNotificationsOpen((prev) => !prev)}
              className="text-md font-semibold text-stone-500 hover:text-stone-900 transition-colors inline-flex items-center gap-2"
            >
              Notifications
              {unreadCount > 0 && (
                <span className="inline-flex min-w-[20px] h-5 px-1.5 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg z-50">
                <div className="px-3 py-2 border-b border-slate-200 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Notifications
                  </p>
                  <button
                    type="button"
                    onClick={markAllNotificationsRead}
                    disabled={unreadCount <= 0}
                    className="text-xs text-purple-700 hover:text-purple-800 disabled:text-slate-400"
                  >
                    Mark all read
                  </button>
                </div>

                <div className="p-2 space-y-2">
                  {notificationsLoading && notifications.length === 0 ? (
                    <p className="text-xs text-slate-500 px-2 py-3">
                      Loading notifications...
                    </p>
                  ) : notificationsError ? (
                    <p className="text-xs text-red-600 px-2 py-3">
                      {notificationsError}
                    </p>
                  ) : notifications.length === 0 ? (
                    <p className="text-xs text-slate-500 px-2 py-3">
                      No notifications yet.
                    </p>
                  ) : (
                    notifications.map((item) => (
                      <button
                        key={item.notification_id}
                        type="button"
                        onClick={() => openNotification(item)}
                        className={`w-full text-left rounded-lg border px-3 py-2 ${
                          Number(item.is_read) === 1
                            ? "border-slate-200 bg-white"
                            : "border-purple-200 bg-purple-50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-slate-900 truncate">
                            {item.title}
                          </p>
                          {Number(item.is_read) !== 1 && (
                            <span className="w-2 h-2 rounded-full bg-purple-600 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {item.message}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          {formatNotificationDate(item.created_at)}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="md:hidden lg:hidden flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              setTheme((prev) => (prev === "dark" ? "light" : "dark"))
            }
            className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-stone-200 text-stone-600 hover:bg-purple-50 hover:text-purple-800 transition-colors"
            aria-label="Toggle dark mode"
            title="Toggle dark mode"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
          <button
            className="text-stone-600"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
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
      </div>

      {menuOpen && (
        <div className="md:hidden nav-blur bg-white/100 border-t border-stone-100 px-6 pb-4 w-40  absolute right-2">
          {NAV_LINKS.map((link) => (
            <button
              key={link.label}
              className="block text-left w-full py-2 text-sm text-stone-600"
              onClick={() => {
                if (link.label === "Edit Profile" && onEditProfile) {
                  onEditProfile();
                } else if (link.route) {
                  navigate(link.link);
                } else if (link.link?.startsWith("#")) {
                  const section = document.querySelector(link.link);
                  if (section) {
                    section.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  } else {
                    window.location.hash = link.link;
                  }
                }
                setMenuOpen(false);
              }}
            >
              {link.label}
            </button>
          ))}

          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              Theme
            </p>
            <button
              type="button"
              onClick={() =>
                setTheme((prev) => (prev === "dark" ? "light" : "dark"))
              }
              className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-stone-200 text-stone-600 hover:bg-purple-50 hover:text-purple-800 transition-colors"
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

          <div className="mt-3 pt-3 border-t border-stone-200">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                Notifications
              </p>
              {unreadCount > 0 && (
                <span className="inline-flex min-w-[20px] h-5 px-1.5 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={markAllNotificationsRead}
              disabled={unreadCount <= 0}
              className="mt-2 text-xs text-purple-700 hover:text-purple-800 disabled:text-slate-400"
            >
              Mark all read
            </button>

            <div className="mt-2 space-y-2 max-h-52 overflow-y-auto pr-1">
              {notificationsLoading && notifications.length === 0 ? (
                <p className="text-xs text-stone-500">
                  Loading notifications...
                </p>
              ) : notificationsError ? (
                <p className="text-xs text-red-600">{notificationsError}</p>
              ) : notifications.length === 0 ? (
                <p className="text-xs text-stone-500">No notifications yet.</p>
              ) : (
                notifications.slice(0, 4).map((item) => (
                  <button
                    key={item.notification_id}
                    type="button"
                    onClick={() => {
                      openNotification(item);
                      setMenuOpen(false);
                    }}
                    className={`block w-full text-left rounded-md px-2 py-2 text-xs ${
                      Number(item.is_read) === 1
                        ? "bg-white text-stone-600"
                        : "bg-purple-50 text-stone-700"
                    }`}
                  >
                    <p className="font-semibold truncate">{item.title}</p>
                    <p className="mt-0.5 line-clamp-2">{item.message}</p>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-3">
            <button
              className="btn-primary text-sm text-white px-4 py-2 rounded-full "
              onClick={() => {
                logout();
                setMenuOpen(false);
              }}
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
