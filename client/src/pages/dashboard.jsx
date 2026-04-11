import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import NavigationBar from "../component/studentNavBar";
import catUser from "../assets/image/catUser.png";
import {
  User,
  Mail,
  MapPin,
  BookOpen,
  Calendar,
  Briefcase,
  Bell,
  FileText,
  ChevronRight,
  X,
  AlertCircle,
  Clock,
  Camera,
} from "lucide-react";

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const activeIdNumber = user?.id_number || "";
  const [profile, setProfile] = useState(user || {});
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [expandedAnnouncement, setExpandedAnnouncement] = useState(null);
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState(
    new Set(),
  );
  const [editFirstName, setFirstName] = useState("");
  const [editLastName, setLastName] = useState("");
  const [editMiddleName, setMiddleName] = useState("");
  const [editEmail, setEmail] = useState("");
  const [editAddress, setAddress] = useState("");
  const [editCourse, setCourse] = useState("");
  const [editYearLevel, setYearLevel] = useState("");
  const [editPhotoFile, setEditPhotoFile] = useState(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState(catUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setFirstName(profile.first_name || "");
    setMiddleName(profile.middle_name || "");
    setLastName(profile.last_name || "");
    setEmail(profile.email || "");
    setAddress(profile.address || "");
    setCourse(profile.course || "");
    setYearLevel(profile.year_level || "");
  }, [profile]);

  const openEditModal = () => {
    setFirstName(profile?.first_name || "");
    setMiddleName(profile?.middle_name || "");
    setLastName(profile?.last_name || "");
    setEmail(profile?.email || "");
    setAddress(profile?.address || "");
    setCourse(profile?.course || "");
    setYearLevel(profile?.year_level || "");
    setEditPhotoFile(null);
    setEditPhotoPreview(
      profile?.profilePicture || profile?.profile_picture || catUser,
    );
    setError("");
    setEditModalOpen(true);
  };

  const formatAnnouncementDate = (value) => {
    if (!value) return "N/A";

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return parsed.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  useEffect(() => {
    let isMounted = true;

    const fetchAnnouncements = async () => {
      setAnnouncementsLoading(true);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/createAnnouncement.php?audience=student&limit=20`,
        );
        const json = await res.json();

        if (!res.ok) {
          if (isMounted) {
            setAnnouncements([]);
          }
          return;
        }

        const rows = Array.isArray(json.announcements)
          ? json.announcements
          : [];

        if (isMounted) {
          setAnnouncements(
            rows.map((item) => ({
              id: item.announcement_id,
              title: item.title,
              author: item.author_name || "CCS ADMIN",
              date: formatAnnouncementDate(item.publish_at || item.created_at),
              content: item.content,
              type: item.type || "general",
              priority: item.priority || "low",
            })),
          );
        }
      } catch {
        if (isMounted) {
          setAnnouncements([]);
        }
      } finally {
        if (isMounted) {
          setAnnouncementsLoading(false);
        }
      }
    };

    fetchAnnouncements();
    const refreshId = window.setInterval(fetchAnnouncements, 30000);

    return () => {
      isMounted = false;
      window.clearInterval(refreshId);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchSessionStatus = async () => {
      if (!activeIdNumber) return;

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/studentSessionStatus.php?id_number=${encodeURIComponent(activeIdNumber)}`,
        );
        const json = await res.json();

        if (!res.ok || !isMounted) {
          return;
        }

        setProfile((prev) => {
          const merged = {
            ...prev,
            remaining_sessions: Number(
              json.remaining_sessions ?? prev.remaining_sessions ?? 30,
            ),
            is_in_session: Number(
              json.is_in_session ?? prev.is_in_session ?? 0,
            ),
            total_sit_in_records: Number(
              json.sessions_used ?? prev.total_sit_in_records ?? 0,
            ),
          };

          localStorage.setItem("user", JSON.stringify(merged));
          return merged;
        });
      } catch {
        // Keep dashboard usable if status endpoint is temporarily unavailable.
      }
    };

    fetchSessionStatus();
    const refreshId = window.setInterval(fetchSessionStatus, 15000);

    return () => {
      isMounted = false;
      window.clearInterval(refreshId);
    };
  }, [activeIdNumber]);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, PNG, or WEBP images are allowed.");
      return;
    }

    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      setError("Image is too large. Maximum size is 5MB.");
      return;
    }

    setEditPhotoFile(file);
    setError("");

    const reader = new FileReader();
    reader.onload = () => {
      setEditPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const rules = [
    {
      icon: User,
      text: "Maintain silence, proper decorum and decipline inside the laboratory. Mobile phones wallets and other personal pieces of equipments must be switched off",
    },
    {
      icon: AlertCircle,
      text: "Games are not allowed in the lab. This include computer realted games, card games and other games that may disrupt the operation of the lab",
    },
    {
      icon: Clock,
      text: "Surfing the internet is allowed only with the permission of the instructor. Downloading and installing of software are strictly prohibited",
    },
  ];

  const defaultSessionAllocation = 30;
  const parsedRemainingSessions = Number(profile?.remaining_sessions);
  const safeRemainingSessions = Number.isFinite(parsedRemainingSessions)
    ? Math.max(0, parsedRemainingSessions)
    : defaultSessionAllocation;
  const parsedTotalRecords = Number(profile?.total_sit_in_records);
  const totalSitInRecords = Number.isFinite(parsedTotalRecords)
    ? Math.max(0, parsedTotalRecords)
    : Math.max(0, defaultSessionAllocation - safeRemainingSessions);
  const isInSession = Number(profile?.is_in_session) === 1;

  const infoFields = [
    {
      label: "Full Name",
      value: `${profile?.first_name || ""} ${profile?.middle_name || ""} ${profile?.last_name || ""}`,
      icon: User,
    },
    { label: "Course", value: profile?.course, icon: BookOpen },
    { label: "Year Level", value: profile?.year_level, icon: Calendar },
    { label: "Email", value: profile?.email, icon: Mail },
    { label: "Address", value: profile?.address, icon: MapPin },
    {
      label: "Session Status",
      value: isInSession ? "In Session" : "Not In Session",
      icon: Clock,
    },
    {
      label: "Remaining Sessions",
      value: safeRemainingSessions,
      icon: Briefcase,
    },
  ];

  const toggleAnnouncement = (id) => {
    setExpandedAnnouncement(expandedAnnouncement === id ? null : id);
  };

  const dismissAnnouncement = (id) => {
    const newDismissed = new Set(dismissedAnnouncements);
    newDismissed.add(id);
    setDismissedAnnouncements(newDismissed);
  };

  const visibleAnnouncements = announcements.filter(
    (a) => !dismissedAnnouncements.has(a.id),
  );

  const saveProfile = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("firstName", editFirstName);
      formData.append("lastName", editLastName);
      formData.append("MiddleName", editMiddleName || "");
      formData.append("email", editEmail);
      formData.append("currentEmail", profile?.email || editEmail);
      formData.append("course", editCourse);
      formData.append("address", editAddress);
      formData.append("yearLevel", editYearLevel);

      if (editPhotoFile) {
        formData.append("profilePhoto", editPhotoFile);
      }

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/editProfile.php`,
        {
          method: "POST",
          body: formData,
        },
      );

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Edit profile failed. Please try again.");
        return;
      }
      if (json.user) {
        const mergedUser = { ...profile, ...json.user };
        setProfile(mergedUser);
        localStorage.setItem("user", JSON.stringify(mergedUser));
        setEditPhotoFile(null);
      }
      setError("");
      setEditModalOpen(false);
    } catch (err) {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <NavigationBar onEditProfile={openEditModal} />

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Edit Profile</h2>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-slate-500 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-1">
                  <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                    <p className="text-sm font-semibold text-slate-700 mb-3">
                      Profile Photo
                    </p>
                    <div className="flex flex-col items-center gap-3">
                      <img
                        src={editPhotoPreview || catUser}
                        alt="Profile preview"
                        className="w-28 h-28 rounded-2xl object-cover border-4 border-white shadow"
                      />
                      <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium cursor-pointer hover:bg-purple-700">
                        <Camera className="w-4 h-4" />
                        Upload Photo
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={handlePhotoChange}
                        />
                      </label>
                      <p className="text-xs text-slate-500 text-center">
                        JPG, PNG, WEBP only (max 5MB)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={editFirstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First Name"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-purple-300 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={editMiddleName}
                      onChange={(e) => setMiddleName(e.target.value)}
                      placeholder="Middle Name"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-purple-300 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={editLastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last Name"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-purple-300 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={editCourse}
                      onChange={(e) => setCourse(e.target.value)}
                      placeholder="Course"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-purple-300 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={editYearLevel}
                      onChange={(e) => setYearLevel(e.target.value)}
                      placeholder="Year Level"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-purple-300 focus:outline-none"
                    />
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-purple-300 focus:outline-none"
                    />
                  </div>

                  <textarea
                    value={editAddress}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Address"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-purple-300 focus:outline-none"
                    rows={4}
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={saveProfile}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-10 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-purple-100 p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Total Sit-In Records
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {totalSitInRecords}
            </p>
            <p className="text-sm text-purple-700">Total sit-in records</p>
          </div>
          <div className="bg-white rounded-xl border border-purple-100 p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Remaining Sessions
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {safeRemainingSessions}
            </p>
            <p className="text-sm text-purple-700">Sessions left this term</p>
          </div>
          {/* <div className="bg-white rounded-xl border border-purple-100 p-4 shadow-sm"> */}
          <div
            className={` rounded-xl border p-4 shadow-sm ${isInSession ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white"}`}
          >
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Session Status
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {isInSession ? "Active" : "Idle"}
            </p>
            <p
              className={`text-sm ${isInSession ? "text-emerald-700" : "text-slate-500"}`}
            >
              {isInSession
                ? "You are currently in session"
                : "You are currently not in session"}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-purple-100 p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Announcements
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {visibleAnnouncements.length}
            </p>
            <p className="text-sm text-purple-700">Unread updates</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200">
              <div className="h-20 bg-gradient-to-r from-purple-800 to-purple-700" />
              <div className="px-6 pb-6 -mt-10">
                <img
                  src={
                    profile?.profilePicture ||
                    profile?.profile_picture ||
                    catUser
                  }
                  onError={(e) => {
                    e.currentTarget.src = catUser;
                  }}
                  alt="Student profile"
                  className="w-20 h-20 rounded-2xl border-4 border-white object-cover shadow-md"
                />
                <h2 className="mt-3 text-xl font-bold text-slate-900">
                  {profile?.first_name} {profile?.last_name}
                </h2>
                <p className="text-sm text-purple-700 font-medium">
                  {profile?.course || "No course"}
                </p>
                <p className="text-sm text-slate-500">
                  {profile?.year_level || "No year level"}
                </p>
                <span
                  className={`inline-flex mt-3 items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                    isInSession
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {isInSession ? "In Session" : "Not In Session"}
                </span>

                <div className="mt-5 grid grid-cols-2 gap-2">
                  <button
                    onClick={openEditModal}
                    className="px-3 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={logout}
                    className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-purple-600" />
                Student Information
              </h3>
              <div className="space-y-3">
                {infoFields.map((field, idx) => {
                  const IconComponent = field.icon;
                  return (
                    <div
                      key={idx}
                      className="flex items-start gap-3 rounded-lg p-2 hover:bg-slate-50"
                    >
                      <div className="p-2 rounded-lg bg-purple-50 text-purple-700">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-slate-500">{field.label}</p>
                        <p className="text-sm font-semibold text-slate-800 break-words">
                          {field.value || "N/A"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>

          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-purple-600" />
                  Announcements
                </h3>
                <span className="text-xs px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 font-semibold">
                  {visibleAnnouncements.length} active
                </span>
              </div>

              <div className="p-4 sm:p-5 space-y-3">
                {visibleAnnouncements.length > 0 ? (
                  visibleAnnouncements.map((announcement) => (
                    <article
                      key={announcement.id}
                      className={`rounded-xl border p-4 transition-all ${
                        announcement.priority === "high"
                          ? "border-red-200 bg-red-50/70"
                          : announcement.priority === "medium"
                            ? "border-yellow-200 bg-yellow-50/70"
                            : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => toggleAnnouncement(announcement.id)}
                          className="text-left flex-1"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-white/80 text-slate-700">
                              {announcement.priority.toUpperCase()}
                            </span>
                            <span className="text-xs text-slate-500">
                              {announcement.date}
                            </span>
                          </div>
                          <h4 className="font-semibold text-slate-900">
                            {announcement.title}
                          </h4>
                          <p className="text-xs text-slate-600 mt-1">
                            Posted by {announcement.author}
                          </p>
                        </button>

                        <button
                          onClick={() => dismissAnnouncement(announcement.id)}
                          className="p-1.5 rounded-md hover:bg-white"
                          title="Dismiss"
                        >
                          <X className="w-4 h-4 text-slate-500" />
                        </button>
                      </div>

                      {expandedAnnouncement === announcement.id ? (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <p className="text-sm text-slate-700 leading-relaxed">
                            {announcement.content}
                          </p>
                          <button
                            onClick={() => toggleAnnouncement(announcement.id)}
                            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-purple-700 hover:text-purple-800"
                          >
                            Collapse
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => toggleAnnouncement(announcement.id)}
                          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-purple-700 hover:text-purple-800"
                        >
                          Read more
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </article>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">
                      {announcementsLoading
                        ? "Loading announcements..."
                        : "No announcements to display"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  Lab Rules & Regulations
                </h3>
              </div>
              <div className="p-4 sm:p-5 space-y-2">
                {rules.map((rule, idx) => {
                  const IconComponent = rule.icon;
                  return (
                    <div
                      key={idx}
                      className="flex items-start gap-3 rounded-lg p-3 hover:bg-slate-50"
                    >
                      <div className="mt-0.5 p-2 rounded-lg bg-purple-50 text-purple-700">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {rule.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
