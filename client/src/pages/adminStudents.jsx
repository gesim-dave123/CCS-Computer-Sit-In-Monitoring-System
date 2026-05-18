import { useEffect, useState } from "react";
import AdminNavigationBar from "../component/adminNavigationBar";
import { Search, X, Users, ChevronLeft, ChevronRight, Monitor, Info, ChevronDown } from "lucide-react";


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
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [queryInput, setQueryInput] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [purpose, setPurpose] = useState(PURPOSE_OPTIONS[0]);
  const [labRoom, setLabRoom] = useState("");
  const [pcNumber, setPcNumber] = useState("");
  const [labs, setLabs] = useState([]);
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
    setLabRoom(labs.length > 0 ? labs[0].lab_name : "");
    setPcNumber("");
    setModalError("");
  };

  const confirmSitIn = async () => {
    if (!selectedStudent) return;
    if (!labRoom.trim()) {
      setModalError("Please provide a lab room number.");
      return;
    }
    if (!pcNumber.trim()) {
      setModalError("Please provide a PC number.");
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
            lab: labRoom.trim(),
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

  return (
    <main className="min-h-screen bg-[#fef7ff] dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-['Montserrat'] md:pl-64 transition-colors duration-300">
      <AdminNavigationBar />

      <section className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12 space-y-6">
        <header className="px-2">
          <h1 className="text-4xl md:text-5xl font-bold text-[#381872] dark:text-violet-300 tracking-tight">
            Student Records.
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Query identities, audit quotas, and initiate laboratory sessions.
          </p>
        </header>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm p-4">
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

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
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
                        <button
                          onClick={() => openSitInModal(student)}
                          disabled={Number(student.isInSession) === 1 || Number(student.remainingSessions) <= 0}
                          className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                            Number(student.isInSession) === 1
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

      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200 border border-slate-100 dark:border-slate-800">
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

            <div className="px-8 py-8 space-y-6">
              {modalError && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-700 dark:text-red-400 text-xs font-bold uppercase tracking-tight">
                   <Info size={16} /> {modalError}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Student ID</label>
                  <input
                    value={selectedStudent.id_number}
                    readOnly
                    className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Student Name</label>
                  <input
                    value={selectedStudent.full_name}
                    readOnly
                    className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Laboratory Subject</label>
                  <div className="relative">
                    <select
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      className="w-full px-5 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#381872] dark:text-violet-300 font-bold focus:outline-none focus:ring-2 focus:ring-purple-300 dark:focus:ring-purple-900 appearance-none"
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
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Terminal Assignment</label>
                  <div className="relative">
                    <select
                      value={labRoom}
                      onChange={(e) => setLabRoom(e.target.value)}
                      className="w-full px-5 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-purple-300 dark:focus:ring-purple-900 appearance-none"
                    >
                      <option value="">Select Laboratory...</option>
                      {labs.map((l) => (
                        <option key={l.lab_id} value={l.lab_name}>
                          {l.lab_name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">PC Number</label>
                  <input
                    value={pcNumber}
                    onChange={(e) => setPcNumber(e.target.value)}
                    placeholder="e.g. PC-01"
                    className="w-full px-5 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-purple-300 dark:focus:ring-purple-900"
                  />
                </div>
              </div>

              <div className="rounded-2xl bg-[#381872]/5 dark:bg-violet-900/10 border border-[#381872]/10 dark:border-violet-900/30 px-6 py-4 flex items-center justify-between">
                <p className="text-xs font-bold text-[#381872] dark:text-violet-300 uppercase tracking-widest">Remaining Quota</p>
                <span className="text-lg font-black text-[#381872] dark:text-violet-300">{selectedStudent.remainingSessions} SESSIONS</span>
              </div>
            </div>

            <div className="px-8 py-5 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-800/20">
              <button onClick={() => setSelectedStudent(null)} className="px-6 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-white dark:hover:bg-slate-900 transition-all">
                ABORT
              </button>
              <button
                onClick={confirmSitIn}
                disabled={actionLoading}
                className="px-8 py-2.5 rounded-2xl bg-[#381872] dark:bg-violet-800 text-white font-black text-xs uppercase tracking-widest hover:bg-[#220055] dark:hover:bg-violet-700 disabled:opacity-60 transition-all shadow-md active:scale-95"
              >
                {actionLoading ? "PROCESSING..." : "ACTIVATE SESSION"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
