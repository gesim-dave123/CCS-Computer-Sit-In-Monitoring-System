import { useEffect, useState } from "react";
import AdminNavigationBar from "../component/adminNavigationBar";
import { Search, X, Users, ChevronLeft, ChevronRight, Monitor, Info, ChevronDown, Trash2, AlertTriangle, Eye, Mail, MapPin, Calendar, Clock, MousePointer2, Computer } from "lucide-react";


const PURPOSE_OPTIONS = [
  "C Programming",
  "Java Programming",
  "Python Programming",
  "Web Development",
  "Database Management",
  "Capstone",
  "Project Development",
];

export default function AdminStudentsPage() {
  const [queryInput, setQueryInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [purpose, setPurpose] = useState(PURPOSE_OPTIONS[0]);
  const [selectedLabId, setSelectedLabId] = useState("");
  const [pcNumber, setPcNumber] = useState("");
  const [labs, setLabs] = useState([]);
  const [labStatus, setLabStatus] = useState(null);
  const [loadingLabStatus, setLoadingLabStatus] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  const fetchLabs = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/labsSoftware.php`);
      const json = await res.json();
      if (res.ok) {
        setLabs(json.labs || []);
      }
    } catch {
      // silent
    }
  };

  const fetchStudents = async (targetPage = 1, targetQuery = searchQuery) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/adminStudents.php?page=${targetPage}&limit=10&id=${encodeURIComponent(targetQuery)}`,
      );
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Failed to load students.");
        setStudents([]);
        return;
      }

      setStudents(json.students || []);
      setPage(json.pagination?.page || 1);
      setTotalPages(json.pagination?.totalPages || 1);
      setTotal(json.pagination?.total || 0);
    } catch {
      setError("Could not connect to the server.");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLabStatus = async (labId) => {
    if (!labId) {
      setLabStatus(null);
      return;
    }
    setLoadingLabStatus(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/adminLabStatus.php?lab_id=${labId}`);
      const json = await res.json();
      if (res.ok) {
        setLabStatus(json);
      }
    } catch {
      // silent
    } finally {
      setLoadingLabStatus(false);
    }
  };

  useEffect(() => {
    fetchStudents(1, "");
    fetchLabs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    const normalized = queryInput.trim();
    setSearchQuery(normalized);
    fetchStudents(1, normalized);
  };

  const openSitInModal = (student) => {
    setSelectedStudent(student);
    setPurpose(PURPOSE_OPTIONS[0]);
    setSelectedLabId("");
    setPcNumber("");
    setLabStatus(null);
    setModalError("");
  };

  const confirmSitIn = async () => {
    if (!selectedStudent) return;
    const lab = labs.find(l => l.lab_id === parseInt(selectedLabId));
    if (!lab) {
      setModalError("Please select a laboratory.");
      return;
    }
    if (!pcNumber.trim()) {
      setModalError("Please select or enter a PC number.");
      return;
    }

    setActionLoading(true);
    setModalError("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/adminStartSitIn.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_number: selectedStudent.id_number,
            name: selectedStudent.full_name,
            purpose,
            lab: lab.lab_name,
            pc_number: pcNumber.trim(),
          }),
        },
      );

      const json = await res.json();
      if (!res.ok) {
        setModalError(json.error || "Failed to start sit-in.");
        return;
      }

      setSelectedStudent(null);
      fetchStudents(page, searchQuery);
    } catch {
      setModalError("Could not connect to the server.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;

    setActionLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/adminDeleteStudent.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_number: studentToDelete.id_number }),
        },
      );

      if (!res.ok) {
        const json = await res.json();
        alert(json.error || "Failed to delete student.");
        return;
      }

      setStudentToDelete(null);
      fetchStudents(page, searchQuery);
    } catch {
      alert("Could not connect to the server.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fef7ff] dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-['Montserrat'] md:pl-64 transition-colors duration-300">
      <AdminNavigationBar />

      <section className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12 space-y-6">
        <header className="px-2 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-4xl md:text-5xl font-bold text-[#381872] dark:text-violet-300 tracking-tight">
            Student Records.
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Query identities, audit quotas, and initiate laboratory sessions.
          </p>
        </header>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm p-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                placeholder="Query by Student ID..."
                className="w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-300 dark:focus:ring-purple-900 transition-all"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2 rounded-xl bg-[#381872] dark:bg-violet-800 text-white text-xs font-black uppercase tracking-widest hover:bg-[#220055] disabled:opacity-60 transition-all active:scale-95 shadow-sm"
            >
              {loading ? "SEARCHING..." : "SEARCH"}
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="px-5 py-3 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
            <h2 className="text-sm font-bold text-[#381872] dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-violet-500" />
              Index
            </h2>
            <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-white dark:bg-slate-950 text-[#381872] dark:text-violet-300 shadow-sm uppercase tracking-tighter">
              {total} TOTAL ENTRIES
            </span>
          </div>

          {error && <p className="px-5 pt-4 text-xs font-bold text-red-600 dark:text-red-400">{error}</p>}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 uppercase">
                <tr>
                  <th className="text-left px-5 py-4 font-black tracking-widest">ID Identity</th>
                  <th className="text-left px-5 py-4 font-black tracking-widest">Full Name</th>
                  <th className="text-left px-5 py-4 font-black tracking-widest">Level</th>
                  <th className="text-left px-5 py-4 font-black tracking-widest">Program</th>
                  <th className="text-left px-5 py-4 font-black tracking-widest text-center">Remaining</th>
                  <th className="text-right px-5 py-4 font-black tracking-widest">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {students.length === 0 ? (
                  <tr>
                    <td className="px-5 py-10 text-slate-500 dark:text-slate-400 text-center" colSpan={6}>
                      {loading ? "ACCESSING DATABASE..." : "NO RECORDS MATCH YOUR QUERY."}
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id_number} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-5 py-3 text-slate-900 dark:text-white font-black">{student.id_number}</td>
                      <td className="px-5 py-3 text-slate-700 dark:text-slate-300 font-bold">{student.full_name}</td>
                      <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{student.year_level}</td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-400">
                        <span className="bg-violet-50 dark:bg-violet-900/20 text-[#381872] dark:text-violet-300 px-2 py-0.5 rounded-lg border border-transparent group-hover:border-violet-100 dark:group-hover:border-violet-900 transition-all font-bold">
                          {student.course}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-800/50 shadow-sm">
                          {student.remainingSessions}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openSitInModal(student)}
                            disabled={Number(student.isInSession) === 1 || Number(student.remainingSessions) <= 0}
                            className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${Number(student.isInSession) === 1
                                ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                                : Number(student.remainingSessions) <= 0
                                  ? "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                  : "bg-[#381872] dark:bg-violet-800 text-white hover:bg-[#220055] dark:hover:bg-violet-700 shadow-sm"
                              }`}
                          >
                            {Number(student.isInSession) === 1
                              ? "IN SESSION"
                              : Number(student.remainingSessions) <= 0
                                ? "VOID"
                                : "SIT IN"}
                          </button>
                          <button
                            onClick={() => setViewingStudent(student)}
                            className="p-2 rounded-xl text-slate-400 hover:text-[#381872] dark:hover:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => setStudentToDelete(student)}
                            className="p-2 rounded-xl text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                            title="Delete Student"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-900/50">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Page {page} / {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => fetchStudents(page - 1)} disabled={page <= 1 || loading} className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-[#381872] dark:hover:text-violet-300 transition-colors disabled:opacity-50"><ChevronLeft size={16} /></button>
              <button onClick={() => fetchStudents(page + 1)} disabled={page >= totalPages || loading} className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-[#381872] dark:hover:text-violet-300 transition-colors disabled:opacity-50"><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>
      </section>

      {/* Delete Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-[60] bg-black/40 p-4 flex items-center justify-center backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200 border border-slate-100 dark:border-slate-800">
            <div className="px-6 py-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-400">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Confirm Deletion</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 px-4">
                Are you sure you want to delete <span className="font-black text-[#381872] dark:text-violet-300">{studentToDelete.full_name}</span>? This action cannot be undone.
              </p>
            </div>
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
              <button
                onClick={() => setStudentToDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold text-xs uppercase tracking-widest hover:bg-white dark:hover:bg-slate-900 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteStudent}
                disabled={actionLoading}
                className="flex-1 px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                {actionLoading ? "DELETING..." : "CONFIRM"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200 border border-slate-100 dark:border-slate-800">
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Users size={20} />
                </div>
                Student Profile
              </h3>
              <button onClick={() => setViewingStudent(null)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-8 py-8 space-y-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-3xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-[#381872] dark:text-violet-300 border-4 border-white dark:border-slate-800 shadow-xl mb-4 overflow-hidden">
                  {viewingStudent.profilePicture ? (
                    <img src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${viewingStudent.profilePicture}`} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Users size={40} />
                  )}
                </div>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{viewingStudent.full_name}</h4>
                <p className="text-sm font-bold text-violet-600 dark:text-violet-400 uppercase tracking-[0.2em]">{viewingStudent.id_number}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sessions Used</p>
                  <p className="text-lg font-black text-[#381872] dark:text-violet-300">{viewingStudent.usedSessions}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Quota Left</p>
                  <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{viewingStudent.remainingSessions}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <Mail size={18} className="text-violet-500" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                    <p className="text-sm font-bold">{viewingStudent.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <MapPin size={18} className="text-violet-500" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Residence</p>
                    <p className="text-sm font-bold">{viewingStudent.address || "No address provided"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <Calendar size={18} className="text-violet-500" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Registered Date</p>
                    <p className="text-sm font-bold">{new Date(viewingStudent.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <Clock size={18} className="text-violet-500" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Academic Info</p>
                    <p className="text-sm font-bold">{viewingStudent.course} — {viewingStudent.year_level}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-8 py-6 bg-slate-50 dark:bg-slate-800/30 flex justify-end">
              <button onClick={() => setViewingStudent(null)} className="px-8 py-2.5 rounded-2xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-lg active:scale-95">
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center backdrop-blur-sm">
          <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200 border border-slate-100 dark:border-slate-800">
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-[#381872] to-[#6c44c1] text-white">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Monitor size={20} />
                </div>
                Initiate Laboratory Session
              </h3>
              <button onClick={() => setSelectedStudent(null)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
              <div className="lg:col-span-4 px-8 py-8 space-y-6 border-r border-slate-100 dark:border-slate-800">
                {modalError && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-700 dark:text-red-400 text-xs font-bold uppercase tracking-tight">
                    <Info size={16} /> {modalError}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Student ID</label>
                    <div className="px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-sm">
                      {selectedStudent.id_number}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Student Name</label>
                    <div className="px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-sm">
                      {selectedStudent.full_name}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Purpose</label>
                    <div className="relative">
                      <select
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        className="w-full px-5 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#381872] dark:text-violet-300 font-bold focus:outline-none focus:ring-2 focus:ring-purple-300 dark:focus:ring-purple-900 appearance-none text-sm"
                      >
                        {PURPOSE_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Laboratory</label>
                    <div className="relative">
                      <select
                        value={selectedLabId}
                        onChange={(e) => {
                          const id = e.target.value;
                          setSelectedLabId(id);
                          setPcNumber("");
                          fetchLabStatus(id);
                        }}
                        className="w-full px-5 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-purple-300 dark:focus:ring-purple-900 appearance-none text-sm"
                      >
                        <option value="">Select Laboratory...</option>
                        {labs.map((l) => (
                          <option key={l.lab_id} value={l.lab_id}>
                            {l.lab_name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Computer ID</label>

                    <input
                      value={pcNumber}
                      onChange={(e) => setPcNumber(e.target.value)}
                      placeholder="e.g. PC-01"
                      className="w-full px-5 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-purple-300 dark:focus:ring-purple-900 text-sm"
                    />
                  </div>
                </div>

                <div className="rounded-2xl bg-[#381872]/5 dark:bg-violet-900/10 border border-[#381872]/10 dark:border-violet-900/30 px-6 py-4 flex items-center justify-between">
                  <p className="text-[10px] font-bold text-[#381872] dark:text-violet-300 uppercase tracking-widest">Balance</p>
                  <span className="text-sm font-black text-[#381872] dark:text-violet-300">{selectedStudent.remainingSessions} SESSIONS</span>
                </div>
              </div>

              <div className="lg:col-span-8 bg-slate-50 dark:bg-slate-950/50 flex flex-col">
                <div className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <MousePointer2 size={18} className="text-violet-500" />
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Visual Seat Map</h4>
                  </div>
                  {labStatus && (
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-emerald-500 shadow-sm" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Free</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-rose-500 shadow-sm" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Occupied</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-amber-400 shadow-sm" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Selected</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-1 p-8 flex items-center justify-center">
                  {!selectedLabId ? (
                    <div className="text-center space-y-3 opacity-40">
                      <Monitor size={48} className="mx-auto text-slate-300" />
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400">Select a laboratory to view layout</p>
                    </div>
                  ) : loadingLabStatus ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-violet-100 dark:border-violet-900 border-t-violet-600 rounded-full animate-spin" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Scanning Computers...</p>
                    </div>
                  ) : labStatus ? (
                    <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                      {Array.from({ length: labStatus.capacity }, (_, i) => {
                        const pcID = `PC-${String(i + 1).padStart(2, '0')}`;
                        const isOccupied = labStatus.occupied.some(o => o.pc_number === pcID);
                        const isSelected = pcNumber === pcID;

                        return (
                          <button
                            key={i}
                            disabled={isOccupied}
                            onClick={() => setPcNumber(pcID)}
                            className={`
                               w-12 h-12 rounded-xl flex flex-col items-center justify-center text-[8px] font-black transition-all relative group border-2
                               ${isOccupied
                                ? 'bg-rose-500 text-white border-rose-600 cursor-not-allowed shadow-md'
                                : isSelected
                                  ? 'bg-amber-400 text-white shadow-lg scale-110 z-10 border-white'
                                  : 'bg-emerald-950/50 text-white border-emerald-500/30 hover:bg-emerald-600 shadow-md'
                              }
                             `}
                          >
                            <Computer size={14} className={isSelected ? "animate-bounce" : ""} />
                            <span className="mt-0.5">{i + 1}</span>
                            {isOccupied && (
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-[8px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none whitespace-nowrap shadow-xl">
                                {labStatus.occupied.find(o => o.pc_number === pcID)?.name}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center opacity-40">
                      <Info size={48} className="mx-auto text-red-300" />
                      <p className="text-xs font-black uppercase tracking-widest text-red-400 mt-3">Error loading layout</p>
                    </div>
                  )}
                </div>

                <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                  <button onClick={() => setSelectedStudent(null)} className="px-6 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                    ABORT
                  </button>
                  <button
                    onClick={confirmSitIn}
                    disabled={actionLoading}
                    className="px-10 py-2.5 rounded-2xl bg-[#381872] dark:bg-violet-800 text-white font-black text-xs uppercase tracking-widest hover:bg-[#220055] dark:hover:bg-violet-700 disabled:opacity-60 transition-all shadow-md active:scale-95"
                  >
                    {actionLoading ? "PROCESSING..." : "ACTIVATE SESSION"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
