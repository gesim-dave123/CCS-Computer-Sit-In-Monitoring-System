import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import NavigationBar from "../component/studentNavBar";
import catUser from "../assets/image/catUser.png";
import ccslogo from "../assets/image/ccslogo.png";
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
  History,
  Monitor,
  Timer,
  CheckCircle2
} from "lucide-react";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(JSON.parse(localStorage.getItem("user") || "{}"));
  const activeIdNumber = profile?.id_number || "";
  
  const [stats, setStats] = useState({
    remaining_sessions: Number(profile?.remaining_sessions ?? 30),
    is_in_session: Number(profile?.is_in_session ?? 0),
    total_sit_in_records: Number(profile?.total_sit_in_records ?? 0),
    total_duration_minutes: Number(profile?.total_duration_minutes ?? 0),
  });

  const [announcements, setAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [expandedAnnouncement, setExpandedAnnouncement] = useState(null);
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState(new Set());

  // Sync profile when navbar updates it
  useEffect(() => {
    const handleProfileUpdate = () => {
      setProfile(JSON.parse(localStorage.getItem("user") || "{}"));
    };
    window.addEventListener('userProfileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('userProfileUpdated', handleProfileUpdate);
  }, []);

  const formatAnnouncementDate = (value) => {
    if (!value) return "N/A";
    const parsed = new Date(value);
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
          if (isMounted) setAnnouncements([]);
          return;
        }
        const rows = Array.isArray(json.announcements) ? json.announcements : [];
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
        if (isMounted) setAnnouncements([]);
      } finally {
        if (isMounted) setAnnouncementsLoading(false);
      }
    };
    fetchAnnouncements();
    const refreshId = window.setInterval(fetchAnnouncements, 30000);
    return () => { isMounted = false; window.clearInterval(refreshId); };
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
        if (!res.ok || !isMounted) return;
        
        const merged = {
          ...profile,
          remaining_sessions: Number(json.remaining_sessions ?? profile.remaining_sessions ?? 30),
          is_in_session: Number(json.is_in_session ?? profile.is_in_session ?? 0),
          total_sit_in_records: Number(json.sessions_used ?? profile.total_sit_in_records ?? 0),
          total_duration_minutes: Number(json.total_duration_minutes ?? profile.total_duration_minutes ?? 0),
        };
        setProfile(merged);
        localStorage.setItem("user", JSON.stringify(merged));
      } catch {}
    };
    fetchSessionStatus();
    const refreshId = window.setInterval(fetchSessionStatus, 15000);
    return () => { isMounted = false; window.clearInterval(refreshId); };
  }, [activeIdNumber]);

  const rules = [
    {
      icon: "volume_off",
      text: "Maintain silence, proper decorum and decipline inside the laboratory. Mobile phones wallets and other personal pieces of equipments must be switched off",
    },
    {
      icon: "videogame_asset_off",
      text: "Games are not allowed in the lab. This include computer realted games, card games and other games that may disrupt the operation of the lab",
    },
    {
      icon: "language",
      text: "Surfing the internet is allowed only with the permission of the instructor. Downloading and installing of software are strictly prohibited",
    },
  ];

  const defaultSessionAllocation = 30;
  const safeRemainingSessions = Math.max(0, Number(profile?.remaining_sessions ?? 30));
  const totalSitInRecords = Math.max(0, Number(profile?.total_sit_in_records ?? 0));
  const isInSession = Number(profile?.is_in_session) === 1;

  const toggleAnnouncement = (id) => setExpandedAnnouncement(expandedAnnouncement === id ? null : id);
  const dismissAnnouncement = (id) => {
    const newDismissed = new Set(dismissedAnnouncements);
    newDismissed.add(id);
    setDismissedAnnouncements(newDismissed);
  };

  const visibleAnnouncements = announcements.filter((a) => !dismissedAnnouncements.has(a.id)).slice(0, 3);

  const formatTotalTime = (mins) => {
    if (!mins) return "0h 0m";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  return (
    <main className="min-h-screen bg-[#fef7ff] dark:bg-slate-950 font-['Montserrat'] transition-colors duration-300">
      <NavigationBar />

      <section className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12 space-y-6">
        {/* Header Section */}
        <header className="px-2 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-3xl md:text-4xl font-bold text-[#381872] dark:text-violet-300 tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Welcome back, {profile?.first_name}. Monitor your laboratory engagement.
          </p>
        </header>

        {/* Top Section: 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {/* Total Sessions */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5 hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Usage</p>
                <h2 className="text-3xl font-bold text-[#381872] dark:text-white mt-1">{totalSitInRecords}</h2>
              </div>
              <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center text-[#6c44c1] dark:text-[#a67ffe]">
                <History size={20} />
              </div>
            </div>
            <div className="w-full bg-slate-50 dark:bg-slate-950 rounded-full h-1.5 mb-1.5 border border-slate-100 dark:border-slate-800">
              <div 
                className="bg-gradient-to-r from-[#381872] to-[#6c44c1] h-1.5 rounded-full" 
                style={{ width: `${(totalSitInRecords / defaultSessionAllocation) * 100}%` }}
              ></div>
            </div>
            <p className="text-[8px] text-slate-400 font-black tracking-widest uppercase">Limit: {defaultSessionAllocation}</p>
          </div>

          {/* Remaining Sessions */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5 hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Remaining</p>
                <h2 className="text-3xl font-bold text-[#6c44c1] dark:text-violet-300 mt-1">{safeRemainingSessions}</h2>
              </div>
              <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center text-[#381872] dark:text-violet-400">
                <Monitor size={20} />
              </div>
            </div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Available Credits</p>
          </div>

          {/* Total Duration */}
          <div className="bg-[#381872] dark:bg-violet-950 rounded-2xl p-5 text-white shadow-md relative overflow-hidden group hover:shadow-lg transition-all">
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[9px] font-black text-violet-300 uppercase tracking-widest">Duration</p>
                <h2 className="text-2xl font-bold text-white mt-1 tracking-tight">
                  {formatTotalTime(profile?.total_duration_minutes)}
                </h2>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-[#f4be5d]">
                <Timer size={20} />
              </div>
            </div>
            <p className="text-[9px] text-violet-200 font-black uppercase tracking-widest">Lab Time Logged</p>
          </div>

          {/* Session Status Card - Now at the Top */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5 flex flex-col justify-center items-center text-center relative group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${isInSession ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500" : "bg-slate-50 dark:bg-slate-800 text-slate-400"}`}>
              <span className="material-symbols-outlined text-2xl">
                {isInSession ? "check_circle" : "error_outline"}
              </span>
            </div>
            <h3 className="text-xs font-bold text-[#381872] dark:text-white mb-1.5">Session State</h3>
            <div className={`inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-[8px] font-black tracking-widest uppercase ${
              isInSession 
                ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400" 
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            }`}>
              {isInSession && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
              {isInSession ? "IN SESSION" : "IDLE"}
            </div>
          </div>
        </div>

        {/* Main Content: Three Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          
          {/* COLUMN 1: Profile */}
          <div className="lg:col-span-1">
            {/* Portrait Profile Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 flex flex-col items-center text-center relative overflow-hidden group h-full">
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#a67ffe]/5 rounded-full blur-3xl"></div>
              
              <div className="relative z-10 w-28 h-28 mb-6">
                <img
                  src={profile?.profilePicture || profile?.profile_picture || catUser}
                  onError={(e) => (e.currentTarget.src = catUser)}
                  alt="Student Profile"
                  className="w-full h-full object-cover rounded-2xl shadow-sm border-4 border-white dark:border-slate-800"
                />
              </div>

              <div className="relative z-10 w-full flex-grow">
                <span className="inline-block bg-[#f4be5d]/20 text-[#5f4100] dark:text-[#f4be5d] text-[8px] font-black px-2 py-0.5 rounded-full mb-2 uppercase tracking-widest">
                  Identity
                </span>
                <h2 className="text-xl font-bold text-[#381872] dark:text-white mb-6">
                  {profile?.first_name} {profile?.last_name}
                </h2>
                
                <div className="space-y-4 text-left bg-slate-50/50 dark:bg-slate-950/30 p-5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-lg text-violet-400">badge</span>
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase">Student ID</p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{profile?.id_number}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-lg text-violet-400">school</span>
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase">Program</p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{profile?.course || "Not Set"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-lg text-violet-400">calendar_today</span>
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase">Year Level</p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{profile?.year_level || "Not Set"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-lg text-violet-400">mail</span>
                    <div className="min-w-0">
                      <p className="text-[8px] font-black text-slate-400 uppercase">Email</p>
                      <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate">{profile?.email}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => window.dispatchEvent(new Event('openAccountSettings'))}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-[#381872] dark:hover:text-violet-300 transition-all active:scale-90"
              >
                <span className="material-symbols-outlined text-lg">settings</span>
              </button>
            </div>
          </div>

          {/* COLUMN 2: Announcements */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden h-full flex flex-col">
              <div className="px-6 py-4 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
                <h3 className="text-sm font-bold text-[#381872] dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg text-violet-500">campaign</span>
                  Official Announcements
                </h3>
              </div>

              <div className="p-6 space-y-3 flex-grow">
                {visibleAnnouncements.length > 0 ? (
                  <>
                    {visibleAnnouncements.map((announcement) => (
                      <article
                        key={announcement.id}
                        className={`rounded-xl border p-4 transition-all hover:shadow-sm ${
                          announcement.priority === "high"
                            ? "border-red-100 dark:border-red-900/30 bg-red-50/10"
                            : announcement.priority === "medium"
                              ? "border-amber-100 dark:border-amber-900/30 bg-amber-50/10"
                              : "border-slate-100 dark:border-slate-800 bg-slate-50/10"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <button
                            onClick={() => toggleAnnouncement(announcement.id)}
                            className="text-left flex-1"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${
                                announcement.priority === 'high' ? 'bg-red-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                              }`}>
                                {announcement.priority}
                              </span>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                {announcement.date}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-[#381872] dark:text-white line-clamp-1">
                              {announcement.title}
                            </h4>
                          </button>

                          <button
                            onClick={() => dismissAnnouncement(announcement.id)}
                            className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-800 text-slate-300 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>

                        {expandedAnnouncement === announcement.id && (
                          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium italic">
                              "{announcement.content}"
                            </p>
                          </div>
                        )}
                        
                        <button
                          onClick={() => toggleAnnouncement(announcement.id)}
                          className="mt-3 text-[9px] font-black text-[#381872] dark:text-violet-400 uppercase tracking-widest"
                        >
                          {expandedAnnouncement === announcement.id ? "VIEW LESS" : "READ MORE"}
                        </button>
                      </article>
                    ))}
                    
                    <div className="pt-2 flex justify-center">
                      <button 
                        onClick={() => navigate("/dashboard/announcements")}
                        className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-[10px] font-black text-slate-400 hover:text-[#381872] transition-all uppercase tracking-widest"
                      >
                        See All <ChevronRight size={12} />
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="py-10 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">No Active Updates</p>
                )}
              </div>
            </div>
          </div>

          {/* COLUMN 3: Lab Rules */}
          <div className="lg:col-span-1">
            <div className="bg-[#381872] dark:bg-violet-950 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden h-full">
               <h3 className="text-sm font-bold mb-6 flex items-center gap-3">
                 <span className="material-symbols-outlined text-lg text-[#f4be5d]">gavel</span>
                 Lab Rules and Regulations
               </h3>
               <h3 className="mb-8 font-medium text-sm text-white">To Avoid Embarassment and maintain camaraderie with your friends and superiors at our laboratory, please observe the following:</h3>
               <div className="space-y-4">
                 {rules.map((rule, idx) => (
                   <div key={idx} className="flex gap-3 group">
                     <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#f4be5d]">
                       <span className="material-symbols-outlined text-base">{rule.icon}</span>
                     </div>
                     <p className="text-xs leading-relaxed text-violet-100 font-medium italic">
                       {rule.text}
                     </p>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-white dark:bg-slate-950 w-full py-10 px-8 border-t border-slate-100 dark:border-slate-800 mt-10 transition-all">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 max-w-full mx-auto w-full">
          <div className="flex items-center gap-3"><img src={ccslogo} alt="CCS" className="w-6 h-6 opacity-80" /><div className="font-bold text-[#381872] dark:text-violet-300 text-sm tracking-tighter uppercase">CCS SITIN</div></div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">© {new Date().getFullYear()} COLLEGE OF COMPUTER STUDIES.</div>
          <div className="flex gap-8 text-[9px] font-black uppercase tracking-widest">
            {["Privacy", "Terms", "Support"].map((l) => (<a key={l} href="#" className="text-slate-400 hover:text-[#f4be5d] transition-colors">{l}</a>))}
          </div>
        </div>
      </footer>
    </main>
  );
}
