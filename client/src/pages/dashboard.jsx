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
} from "lucide-react";

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    setError("");
    setEditModalOpen(true);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const announcements = [
    {
      id: 1,
      title: "Computer Lab Maintenance",
      author: "CCS ADMIN",
      date: "2024 Feb 11",
      content:
        "Important Announcement: Computer Lab Maintenance on Feb 15-16. The lab will be unavailable during these dates. Please plan your activities accordingly.",
      type: "maintenance",
      priority: "high",
    },
    {
      id: 2,
      title: "New Lab Rules Updated",
      author: "Lab Supervisor",
      date: "2024 Feb 10",
      content:
        "We have updated our lab policies to ensure better safety and efficiency. All students must review the new guidelines.",
      type: "rules",
      priority: "medium",
    },
    {
      id: 3,
      title: "Workshop Announcement",
      author: "CCS Department",
      date: "2024 Feb 09",
      content:
        "Join us for an exclusive workshop on Web Development. Registration is now open for all CCS students.",
      type: "event",
      priority: "low",
    },
  ];

  const rules = [
    { icon: User, text: "Maintain silence, proper decorum and decipline inside the laboratory. Mobile phones wallets and other personal pieces of equipments must be switched off" },
    { icon: AlertCircle, text: "Games are not allowed in the lab. This include computer realted games, card games and other games that may disrupt the operation of the lab" },
    { icon: Clock, text: "Surfing the internet is allowed only with the permission of the instructor. Downloading and installing of software are strictly prohibited" },
  ];

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
    { label: "Session", value: "67", icon: Briefcase },
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
      const res = await fetch(
        "http://localhost:8080/CCS-Computer-Sit-In-Monitoring-System/server/src/editProfile.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: editFirstName,
            lastName: editLastName,
            MiddleName: editMiddleName || null,
            email: editEmail,
            currentEmail: profile?.email || editEmail,
            course: editCourse,
            address: editAddress,
            yearLevel: editYearLevel,
          }),
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
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Edit Profile</h2>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-slate-500 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-3">
              {error && <p className="text-sm text-red-600">{error}</p>}
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
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                rows={3}
              />
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
        <div className="rounded-2xl bg-gradient-to-r from-purple-800 to-purple-700 text-white p-6 sm:p-8 shadow-lg">
          <p className="text-purple-100 text-sm">Student Dashboard</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back, {profile?.first_name || "Student"}
          </h1>
          <p className="mt-2 text-purple-100 text-sm sm:text-base">
            View announcements, review lab rules, and keep your profile up to date.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-purple-100 p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">Sessions</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">67</p>
            <p className="text-sm text-purple-700">Total sit-in records</p>
          </div>
          <div className="bg-white rounded-xl border border-purple-100 p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">Announcements</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{visibleAnnouncements.length}</p>
            <p className="text-sm text-purple-700">Unread updates</p>
          </div>
          <div className="bg-white rounded-xl border border-purple-100 p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">Rules</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{rules.length}</p>
            <p className="text-sm text-purple-700">Lab guidelines</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200">
              <div className="h-20 bg-gradient-to-r from-purple-800 to-purple-700" />
              <div className="px-6 pb-6 -mt-10">
                <img
                  src={profile?.profile_picture || catUser}
                  onError={(e) => {
                    e.currentTarget.src = catUser;
                  }}
                  alt="Student profile"
                  className="w-20 h-20 rounded-2xl border-4 border-white object-cover shadow-md"
                />
                <h2 className="mt-3 text-xl font-bold text-slate-900">
                  {profile?.first_name} {profile?.last_name}
                </h2>
                <p className="text-sm text-purple-700 font-medium">{profile?.course || "No course"}</p>
                <p className="text-sm text-slate-500">{profile?.year_level || "No year level"}</p>

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
                    <div key={idx} className="flex items-start gap-3 rounded-lg p-2 hover:bg-slate-50">
                      <div className="p-2 rounded-lg bg-purple-50 text-purple-700">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-slate-500">{field.label}</p>
                        <p className="text-sm font-semibold text-slate-800 break-words">{field.value || "N/A"}</p>
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
                            <span className="text-xs text-slate-500">{announcement.date}</span>
                          </div>
                          <h4 className="font-semibold text-slate-900">{announcement.title}</h4>
                          <p className="text-xs text-slate-600 mt-1">Posted by {announcement.author}</p>
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
                          <p className="text-sm text-slate-700 leading-relaxed">{announcement.content}</p>
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
                    <p className="text-slate-500">No announcements to display</p>
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
                    <div key={idx} className="flex items-start gap-3 rounded-lg p-3 hover:bg-slate-50">
                      <div className="mt-0.5 p-2 rounded-lg bg-purple-50 text-purple-700">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">{rule.text}</p>
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
