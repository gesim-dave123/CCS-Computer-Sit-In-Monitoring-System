import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import AdminNavigationBar from "../component/adminNavigationBar";
import { Search, X } from "lucide-react";

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
  if (!user || user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

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
  const [actionLoading, setActionLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  const fetchStudents = async (targetPage = 1, targetQuery = searchQuery) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `http://localhost:8080/CCS-Computer-Sit-In-Monitoring-System/server/src/adminStudents.php?page=${targetPage}&limit=10&id=${encodeURIComponent(targetQuery)}`,
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
    setLabRoom("");
    setModalError("");
  };

  const confirmSitIn = async () => {
    if (!selectedStudent) return;
    if (!labRoom.trim()) {
      setModalError("Please provide a lab room number.");
      return;
    }

    setActionLoading(true);
    setModalError("");

    try {
      const res = await fetch(
        "http://localhost:8080/CCS-Computer-Sit-In-Monitoring-System/server/src/adminStartSitIn.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_number: selectedStudent.id_number,
            name: selectedStudent.full_name,
            purpose,
            lab: labRoom.trim(),
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
    <main className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-6 md:pl-72">
      <AdminNavigationBar />

      <section className="max-w-7xl mx-auto mt-16 md:mt-0 space-y-6">
        <div className="rounded-2xl bg-gradient-to-r from-purple-800 to-purple-700 text-white p-6 sm:p-8 shadow-lg">
          <p className="text-purple-100 text-sm">Admin • Students</p>
          <h1 className="text-2xl sm:text-3xl font-bold mt-1">Student Records</h1>
          <p className="text-purple-100 mt-2 text-sm sm:text-base">
            Search students by ID, review their details, and open sit-in action modal.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
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
                placeholder="Search by student ID number"
                className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-5 py-2.5 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 disabled:opacity-60"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Students</h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
              Total: {total}
            </span>
          </div>

          {error && <p className="px-5 pt-4 text-sm text-red-600">{error}</p>}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold">ID Number</th>
                  <th className="text-left px-5 py-3 font-semibold">Name</th>
                  <th className="text-left px-5 py-3 font-semibold">Year Level</th>
                  <th className="text-left px-5 py-3 font-semibold">Course</th>
                  <th className="text-left px-5 py-3 font-semibold">Remaining Session</th>
                  <th className="text-left px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {students.length === 0 ? (
                  <tr>
                    <td className="px-5 py-8 text-slate-500" colSpan={6}>
                      {loading ? "Loading students..." : "No student records found."}
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id_number} className="hover:bg-purple-50/40">
                      <td className="px-5 py-3 text-slate-800 font-medium">{student.id_number}</td>
                      <td className="px-5 py-3 text-slate-700">{student.full_name}</td>
                      <td className="px-5 py-3 text-slate-700">{student.year_level}</td>
                      <td className="px-5 py-3 text-slate-700">{student.course}</td>
                      <td className="px-5 py-3">
                        <span className="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
                          {student.remainingSessions}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => openSitInModal(student)}
                          disabled={Number(student.isInSession) === 1 || Number(student.remainingSessions) <= 0}
                          className="px-3 py-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
                        >
                          {Number(student.isInSession) === 1
                            ? "In Session"
                            : Number(student.remainingSessions) <= 0
                              ? "No Session Left"
                              : "Sit-In"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-4 border-t border-slate-200 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => fetchStudents(page - 1)}
                disabled={page <= 1 || loading}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => fetchStudents(page + 1)}
                disabled={page >= totalPages || loading}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </section>

      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Student Sit-In</h3>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-slate-500 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {modalError && <p className="text-sm text-red-600">{modalError}</p>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">ID Number</label>
                  <input
                    value={selectedStudent.id_number}
                    readOnly
                    className="mt-1 w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-slate-100 text-slate-700"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Name</label>
                  <input
                    value={selectedStudent.full_name}
                    readOnly
                    className="mt-1 w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-slate-100 text-slate-700"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Purpose</label>
                  <select
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="mt-1 w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
                  >
                    {PURPOSE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Lab Room Number</label>
                  <input
                    value={labRoom}
                    onChange={(e) => setLabRoom(e.target.value)}
                    placeholder="e.g. Lab 3"
                    className="mt-1 w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                </div>
              </div>

              <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
                <p className="text-sm text-amber-800">
                  Remaining Sessions: <span className="font-bold">{selectedStudent.remainingSessions}</span>
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmSitIn}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60"
              >
                {actionLoading ? "Starting..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
