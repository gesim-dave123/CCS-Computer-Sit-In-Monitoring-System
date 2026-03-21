import { useState } from "react";
import { Navigate } from "react-router-dom";
import AdminNavigationBar from "../component/adminNavigationBar";
import { Search, UserRound, X, DoorOpen, BookOpenCheck, Hash } from "lucide-react";

const PURPOSE_OPTIONS = [
  "C Programming",
  "Java Programming",
  "Python Programming",
  "Web Development",
  "Database Management",
  "UI/UX Project",
  "Research / Assignment",
];

export default function AdminSearchPage() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user || user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [purpose, setPurpose] = useState(PURPOSE_OPTIONS[0]);
  const [labRoom, setLabRoom] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) {
      setResults([]);
      setError("Please enter a student ID.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `http://localhost:8080/CCS-Computer-Sit-In-Monitoring-System/server/src/adminSearchStudent.php?id=${encodeURIComponent(query.trim())}`,
      );

      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Search failed.");
        setResults([]);
        return;
      }

      setResults(json.students || []);
      if (!json.students?.length) {
        setError("No student found for that ID.");
      }
    } catch (err) {
      setError("Could not connect to the server.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const openSitInModal = (student) => {
    setSelectedStudent(student);
    setPurpose(PURPOSE_OPTIONS[0]);
    setLabRoom("");
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-6 md:pl-72">
      <AdminNavigationBar />

      <section className="max-w-6xl mx-auto mt-16 md:mt-0 space-y-6">
        <div className="rounded-2xl bg-gradient-to-r from-purple-800 to-purple-700 text-white p-6 sm:p-8 shadow-lg">
          <p className="text-purple-100 text-sm">Admin • Student Search</p>
          <h1 className="text-2xl sm:text-3xl font-bold mt-1">Search Student by ID</h1>
          <p className="text-purple-100 mt-2 text-sm sm:text-base">
            Select a student to open the sit-in form modal.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                placeholder="Enter student ID number"
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

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Search Results</h2>
          </div>

          <div className="divide-y divide-slate-200">
            {results.length === 0 ? (
              <p className="px-5 py-8 text-sm text-slate-500">No results yet.</p>
            ) : (
              results.map((student) => (
                <button
                  key={student.id_number}
                  onClick={() => openSitInModal(student)}
                  className="w-full text-left px-5 py-4 hover:bg-purple-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{student.id_number}</p>
                      <p className="text-sm text-slate-700">{student.full_name}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {student.course} • {student.year_level}
                      </p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 font-semibold">
                      Remaining: {student.remainingSessions}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </section>

      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Sit-In Form</h3>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-slate-500 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">ID Number</label>
                  <div className="mt-1 relative">
                    <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      value={selectedStudent.id_number}
                      readOnly
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg bg-slate-100 text-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Student Name</label>
                  <div className="mt-1 relative">
                    <UserRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      value={selectedStudent.full_name}
                      readOnly
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg bg-slate-100 text-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Purpose</label>
                  <div className="mt-1 relative">
                    <BookOpenCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
                    >
                      {PURPOSE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Lab Room Number</label>
                  <div className="mt-1 relative">
                    <DoorOpen className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      value={labRoom}
                      onChange={(e) => setLabRoom(e.target.value)}
                      placeholder="e.g. Lab 3"
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-purple-50 border border-purple-100 px-4 py-3">
                <p className="text-sm text-purple-700">
                  Remaining Sessions: <span className="font-bold">{selectedStudent.remainingSessions}</span>
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                Close
              </button>
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
              >
                Confirm Sit-In
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
