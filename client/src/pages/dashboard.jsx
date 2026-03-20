import { useNavigate } from "react-router-dom";
import { useState } from "react";
import NavigationBar from "../component/studentNavBar";
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
    { icon: User, text: "This Lab is for CCS students only" },
    { icon: AlertCircle, text: "Please bring your student ID for check-in" },
    { icon: Clock, text: "Lab hours: 7:00 AM - 6:00 PM (Weekdays)" },
    { icon: FileText, text: "Report any equipment issues immediately" },
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

  const saveProfile = () => {
    localStorage.setItem("user", JSON.stringify(profile));
    setEditModalOpen(false);
  };

  return (
    <main className="min-h-screen ">
      <NavigationBar onEditProfile={() => setEditModalOpen(true)} />

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={profile.first_name || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, first_name: e.target.value })
                  }
                  placeholder="First Name"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-purple-300 focus:outline-none"
                />
                <input
                  type="text"
                  value={profile.middle_name || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, middle_name: e.target.value })
                  }
                  placeholder="Middle Name"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-purple-300 focus:outline-none"
                />
                <input
                  type="text"
                  value={profile.last_name || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, last_name: e.target.value })
                  }
                  placeholder="Last Name"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-purple-300 focus:outline-none"
                />
                <input
                  type="text"
                  value={profile.course || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, course: e.target.value })
                  }
                  placeholder="Course"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-purple-300 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={profile.year_level || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, year_level: e.target.value })
                  }
                  placeholder="Year Level"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-purple-300 focus:outline-none"
                />
                <input
                  type="email"
                  value={profile.email || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                  placeholder="Email"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-purple-300 focus:outline-none"
                />
              </div>
              <textarea
                value={profile.address || ""}
                onChange={(e) =>
                  setProfile({ ...profile, address: e.target.value })
                }
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
                className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="w-full max-w-full mx-0 px-2 sm:px-4 lg:px-6 py-6">
        {/* Three-card grid layout */}
        <div className="grid grid-cols-1 mt-25 lg:grid-cols-3 gap-4">
          {/* Left Column: Student Information */}
          <div className="space-y-8">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl max-w-300 shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="h-32 bg-purple-800"></div>
              <div className="px-8 pb-8">
                <div className="flex justify-center -mt-16 mb-6">
                  <img
                    src={
                      profile?.profile_picture ||
                      "https://via.placeholder.com/150"
                    }
                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                  />
                </div>
                <h2 className="text-2xl font-bold text-center text-slate-900 mb-1">
                  {profile?.first_name} {profile?.last_name}
                </h2>
                <p className="text-center text-purple-600 font-semibold">
                  {profile?.course}
                </p>
              </div>
            </div>

            {/* Information Fields */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <User className="w-6 h-6 text-purple-600" />
                Student Information
              </h3>
              <div className="space-y-4">
                {infoFields.map((field, idx) => {
                  const IconComponent = field.icon;
                  return (
                    <div
                      key={idx}
                      className="flex items-start gap-4 p-4 rounded-lg hover:bg-purple-50 transition-colors duration-200 group"
                    >
                      <div className="flex-shrink-0 p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                        <IconComponent className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-grow">
                        <p className="text-sm text-slate-600 font-medium">
                          {field.label}
                        </p>
                        <p className="text-slate-900 font-semibold mt-1">
                          {field.value || "N/A"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Announcements & Rules */}
          <div className="space-y-8">
            {/* Announcements Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Bell className="w-6 h-6 text-purple-600" />
                  Announcements
                </h3>
              </div>
              <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                {visibleAnnouncements.length > 0 ? (
                  visibleAnnouncements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className={`rounded-lg border-2 transition-all duration-300 ${
                        announcement.priority === "high"
                          ? "border-red-200 bg-red-50"
                          : announcement.priority === "medium"
                            ? "border-yellow-200 bg-yellow-50"
                            : "border-slate-200 bg-slate-50"
                      } ${expandedAnnouncement === announcement.id ? "ring-2 ring-purple-400" : ""}`}
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div
                            className="flex-grow cursor-pointer"
                            onClick={() => toggleAnnouncement(announcement.id)}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-bold ${
                                  announcement.priority === "high"
                                    ? "bg-red-200 text-red-800"
                                    : announcement.priority === "medium"
                                      ? "bg-yellow-200 text-yellow-800"
                                      : "bg-blue-200 text-blue-800"
                                }`}
                              >
                                {announcement.priority.toUpperCase()}
                              </span>
                            </div>
                            <h4 className="font-bold text-slate-900 text-sm">
                              {announcement.title}
                            </h4>
                            <p className="text-xs text-slate-600 mt-1">
                              {announcement.author} • {announcement.date}
                            </p>
                          </div>
                          <button
                            onClick={() => dismissAnnouncement(announcement.id)}
                            className="flex-shrink-0 p-1 hover:bg-slate-200 rounded transition-colors"
                            title="Dismiss"
                          >
                            <X className="w-4 h-4 text-slate-500 hover:text-slate-700" />
                          </button>
                        </div>

                        {expandedAnnouncement === announcement.id && (
                          <div className="mt-4 pt-4 border-t border-slate-300 animate-in fade-in duration-300">
                            <p className="text-sm text-slate-700 leading-relaxed">
                              {announcement.content}
                            </p>
                            <div className="mt-4 flex gap-2">
                              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                                Learn More
                              </button>
                              <button
                                onClick={() =>
                                  toggleAnnouncement(announcement.id)
                                }
                                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300 transition-colors"
                              >
                                Collapse
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">
                      No announcements to display
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Rules & Regulations Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-6 h-6 text-purple-600" />
                Lab Rules & Regulations
              </h3>
            </div>
            <div className="p-6 space-y-3">
              {rules.map((rule, idx) => {
                const IconComponent = rule.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-purple-50 transition-colors group"
                  >
                    <div className="flex-shrink-0 p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                      <IconComponent className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-slate-700 font-medium">{rule.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
