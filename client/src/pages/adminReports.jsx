import { useEffect, useState, useCallback } from "react";
import AdminNavigationBar from "../component/adminNavigationBar";
import {
  Download,
  Search,
  Filter,
  FileText,
  ChevronDown,
  FileSpreadsheet,
  File,
} from "lucide-react";

export default function AdminReportsPage() {
  const API = import.meta.env.VITE_API_BASE_URL;
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filterLabs, setFilterLabs] = useState([]);
  const [filterPurposes, setFilterPurposes] = useState([]);

  // Filter state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [lab, setLab] = useState("all");
  const [purpose, setPurpose] = useState("all");
  const [studentSearch, setStudentSearch] = useState("");

  const buildParams = useCallback(() => {
    const p = new URLSearchParams();
    if (startDate) p.set("start", startDate);
    if (endDate) p.set("end", endDate);
    if (lab && lab !== "all") p.set("lab", lab);
    if (purpose && purpose !== "all") p.set("purpose", purpose);
    if (studentSearch.trim()) p.set("student", studentSearch.trim());
    return p;
  }, [startDate, endDate, lab, purpose, studentSearch]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/reports.php?${buildParams()}`);
      const json = await res.json();
      if (res.ok) {
        setRecords(json.records || []);
        setTotal(json.total || 0);
        if (json.filters) {
          setFilterLabs(json.filters.labs || []);
          setFilterPurposes(json.filters.purposes || []);
        }
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchRecords();
  };

  // ── CSV Export (server-side) ──
  const exportCSV = () => {
    const p = buildParams();
    p.set("format", "csv");
    window.open(`${API}/reports.php?${p}`, "_blank");
  };

  // ── PDF Export (client-side) ──
  const exportPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    await import("jspdf-autotable");
    const doc = new jsPDF({ orientation: "landscape" });

    doc.setFontSize(16);
    doc.text("Sit-In Session Report", 14, 15);
    doc.setFontSize(9);
    doc.setTextColor(100);
    const filters = [];
    if (startDate) filters.push(`From: ${startDate}`);
    if (endDate) filters.push(`To: ${endDate}`);
    if (lab !== "all") filters.push(`Lab: ${lab}`);
    if (purpose !== "all") filters.push(`Purpose: ${purpose}`);
    doc.text(
      filters.length > 0
        ? `Filters: ${filters.join(" | ")}`
        : "No filters applied",
      14,
      22,
    );
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 27);

    const head = [
      [
        "Student ID",
        "Student Name",
        "Laboratory",
        "Purpose",
        "Status",
        "Start Time",
        "End Time",
        "Duration (min)",
      ],
    ];
    const body = records.map((r) => [
      r.id_number,
      r.student_name,
      r.lab,
      r.purpose,
      r.status,
      r.started_at,
      r.ended_at || "—",
      r.duration_minutes ?? "—",
    ]);

    doc.autoTable({
      startY: 32,
      head,
      body,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [56, 24, 114] },
    });
    doc.save(`sit_in_report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  // ── Excel Export (client-side) ──
  const exportExcel = async () => {
    const XLSX = await import("xlsx");
    const wsData = [
      [
        "Student ID",
        "Student Name",
        "Laboratory",
        "Purpose",
        "Status",
        "Start Time",
        "End Time",
        "Duration (min)",
      ],
      ...records.map((r) => [
        r.id_number,
        r.student_name,
        r.lab,
        r.purpose,
        r.status,
        r.started_at,
        r.ended_at || "",
        r.duration_minutes ?? "",
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sit-In Report");
    XLSX.writeFile(
      wb,
      `sit_in_report_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  const formatDuration = (mins) => {
    if (mins == null) return "—";
    const m = Number(mins);
    if (m < 60) return `${m}m`;
    return `${Math.floor(m / 60)}h ${m % 60}m`;
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-4 sm:p-6 md:pl-72">
      <AdminNavigationBar />
      <div className="max-w-7xl mx-auto mt-20 md:mt-0 space-y-5">
        <div className="rounded-2xl bg-gradient-to-r from-purple-800 to-purple-700 text-white p-6 sm:p-8 shadow-lg">
          <p className="text-purple-100 text-sm">Admin • Reports</p>
          <h1 className="text-2xl sm:text-3xl font-bold mt-1">
            Generate & Export Reports
          </h1>
          <p className="text-purple-100 mt-2 text-sm sm:text-base">
            Filter sit-in session data and export as CSV, PDF, or Excel.
          </p>
        </div>

        {/* Filters */}
        <form
          onSubmit={handleFilter}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5"
        >
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-purple-600" />
            Filter Options
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Laboratory
              </label>
              <select
                value={lab}
                onChange={(e) => setLab(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 appearance-none"
              >
                <option value="all">All Labs</option>
                {filterLabs.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Purpose
              </label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 appearance-none"
              >
                <option value="all">All Purposes</option>
                {filterPurposes.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Student
              </label>
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="ID or name..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700"
            >
              <Search className="w-4 h-4" />
              Apply Filters
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={exportCSV}
                disabled={records.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              >
                <FileText className="w-4 h-4" />
                CSV
              </button>
              <button
                type="button"
                onClick={exportPDF}
                disabled={records.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              >
                <File className="w-4 h-4" />
                PDF
              </button>
              <button
                type="button"
                onClick={exportExcel}
                disabled={records.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Excel
              </button>
            </div>
          </div>
        </form>

        {/* Data Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Report Preview</h2>
            <span className="text-sm text-slate-500">
              {total} record{total !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-12 text-center">
                <div className="w-7 h-7 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto" />
              </div>
            ) : records.length === 0 ? (
              <p className="py-12 text-center text-sm text-slate-500">
                No records match the current filters.
              </p>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                      Student ID
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                      Name
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                      Lab
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                      Purpose
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                      Start
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                      End
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                      Duration
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records.map((r) => (
                    <tr key={r.sitIn_id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {r.id_number}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {r.student_name}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{r.lab}</td>
                      <td className="px-4 py-3 text-slate-700">{r.purpose}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${r.status === "in_session" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"}`}
                        >
                          {r.status === "in_session" ? "Active" : "Ended"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs">
                        {r.started_at}
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs">
                        {r.ended_at || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatDuration(r.duration_minutes)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
