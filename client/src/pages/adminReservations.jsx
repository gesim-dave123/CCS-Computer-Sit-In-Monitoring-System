import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import AdminNavigationBar from "../component/adminNavigationBar";
import {
  CalendarCheck2, CheckCircle, XCircle, Clock, Monitor,
  MapPin, BookMarked, Search, RefreshCw, Loader2, Filter,
  Play, Ban, AlertTriangle, CalendarDays,
} from "lucide-react";

const STATUS_META = {
  pending:   { label: "Pending",   cls: "bg-amber-100 text-amber-700 border-amber-200" },
  approved:  { label: "Approved",  cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  cancelled: { label: "Cancelled", cls: "bg-slate-100 text-slate-500 border-slate-200" },
  completed: { label: "Completed", cls: "bg-purple-100 text-purple-700 border-purple-200" },
  rejected:  { label: "Rejected",  cls: "bg-red-100 text-red-600 border-red-200" },
};

const TODAY = new Date().toISOString().split("T")[0];

function isToday(dateStr) {
  return dateStr === TODAY;
}

/* ──────────────────── Confirmation Modal ──────────────────── */
function ConfirmDialog({ open, title, message, icon: Icon, iconColor, confirmLabel, confirmColor, onConfirm, onCancel, loading }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      onClick={onCancel}>
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-in"
        onClick={e => e.stopPropagation()}>
        <div className="p-6 flex flex-col items-center text-center">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${iconColor}`}>
            <Icon className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-xs">{message}</p>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-100 disabled:opacity-60">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2 ${confirmColor}`}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminReservationsPage() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const BASE = import.meta.env.VITE_API_BASE_URL;

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [selected, setSelected] = useState(null); // detail modal

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    open: false, title: "", message: "", icon: AlertTriangle, iconColor: "",
    confirmLabel: "", confirmColor: "", action: null, reservationId: null,
  });

  const fetchReservations = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BASE}/reservations.php?admin=1`);
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Failed to load reservations."); return; }
      setReservations(json.reservations || []);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === "admin") fetchReservations();
  }, []);


  /* ── Actions ─────────────────────────────────────────────── */
  const handleAction = async (id, action) => {
    setActionLoading(id + action);
    try {
      const res = await fetch(`${BASE}/reservations.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reservation_id: id, admin_id_number: user.id_number }),
      });
      const json = await res.json();
      if (!res.ok) { alert(json.error || "Action failed."); return; }
      setSelected(null);
      setConfirmDialog(prev => ({ ...prev, open: false }));
      await fetchReservations();
    } catch {
      alert("Server error.");
    } finally {
      setActionLoading(null);
    }
  };

  const openConfirm = (id, action, title, message, icon, iconColor, confirmLabel, confirmColor) => {
    setConfirmDialog({
      open: true, title, message, icon, iconColor, confirmLabel, confirmColor,
      action, reservationId: id,
    });
  };

  const confirmAction = () => {
    const { reservationId, action } = confirmDialog;
    if (reservationId && action) handleAction(reservationId, action);
  };

  /* ── Filtering ───────────────────────────────────────────── */
  const filtered = reservations.filter(r => {
    const matchStatus = filter === "all" || r.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || r.student_name?.toLowerCase().includes(q) ||
      r.id_number?.toLowerCase().includes(q) || r.lab?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  /* ── Stats ───────────────────────────────────────────────── */
  const pendingCount = reservations.filter(r => r.status === "pending").length;
  const approvedCount = reservations.filter(r => r.status === "approved").length;
  const todayApproved = reservations.filter(r => r.status === "approved" && isToday(r.reserved_date)).length;
  const cancelledRejected = reservations.filter(r => r.status === "cancelled" || r.status === "rejected").length;
  const completedCount = reservations.filter(r => r.status === "completed").length;

  const StatCard = ({ label, value, icon: Icon, color, highlight }) => (
    <div className={`bg-white border rounded-xl p-4 shadow-sm flex items-center gap-4 transition-all ${
      highlight ? "border-amber-300 ring-2 ring-amber-100" : "border-slate-200"
    }`}>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900 mt-0.5">{value}</p>
      </div>
    </div>
  );

  return (
    <>
      {(!user || user.role !== "admin") && <Navigate to="/dashboard" replace />}
    <main className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-6 md:pl-72">
      <AdminNavigationBar />


      <section className="max-w-7xl mx-auto mt-16 md:mt-0 space-y-6">

        {/* Header banner */}
        <div className="rounded-2xl overflow-hidden shadow-lg relative"
          style={{ background: "linear-gradient(135deg, #240d48, #5428a8)" }}>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle, rgba(201,151,58,0.4) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
          <div className="relative px-6 py-7 sm:px-10 flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm font-medium">Admin · Lab Management</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">Reservation Requests</h1>
              <p className="text-purple-200 mt-1 text-sm">Review, approve, check in, or cancel student computer seat reservations.</p>
            </div>
            <div className="flex gap-5">
              {todayApproved > 0 && (
                <div className="flex flex-col items-center gap-1">
                  <span className="text-4xl font-extrabold text-emerald-400">{todayApproved}</span>
                  <span className="text-xs text-emerald-300 font-medium">Today Check-Ins</span>
                </div>
              )}
              {pendingCount > 0 && (
                <div className="flex flex-col items-center gap-1">
                  <span className="text-4xl font-extrabold text-amber-400">{pendingCount}</span>
                  <span className="text-xs text-amber-300 font-medium">Pending</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard label="Total" value={reservations.length} icon={CalendarCheck2} color="bg-purple-50 text-purple-700" />
          <StatCard label="Pending" value={pendingCount} icon={Clock} color="bg-amber-50 text-amber-700" />
          <StatCard label="Approved" value={approvedCount} icon={CheckCircle} color="bg-emerald-50 text-emerald-700" />
          <StatCard label="Today's Check-Ins" value={todayApproved} icon={Play} color="bg-blue-50 text-blue-700" highlight={todayApproved > 0} />
          <StatCard label="Completed" value={completedCount} icon={CalendarDays} color="bg-purple-50 text-purple-600" />
        </div>

        {/* Filter / search toolbar */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, ID, or lab..."
              className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            {["all", "pending", "approved", "completed", "cancelled", "rejected"].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  filter === s
                    ? "bg-purple-700 text-white shadow"
                    : "bg-slate-100 text-slate-600 hover:bg-purple-50 hover:text-purple-700"
                }`}>
                {s}
              </button>
            ))}
          </div>
          <button onClick={fetchReservations} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-100 disabled:opacity-60 shrink-0">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
        )}

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CalendarCheck2 className="w-5 h-5 text-purple-600" />
              Reservations
              <span className="text-xs px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 font-semibold ml-1">
                {filtered.length}
              </span>
            </h2>
          </div>

          {loading && reservations.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <CalendarCheck2 className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">No reservations found</p>
              <p className="text-slate-400 text-sm mt-1">Try changing your filter or search query.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    {["#", "Student", "Lab", "Seat", "Date", "Time Slot", "Purpose", "Status", "Actions"].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(r => {
                    const meta = STATUS_META[r.status] || STATUS_META.pending;
                    const isPending = r.status === "pending";
                    const isApproved = r.status === "approved";
                    const isTodayReservation = isToday(r.reserved_date);
                    const canCheckIn = isApproved && isTodayReservation;
                    return (
                      <tr key={r.reservation_id}
                        className={`hover:bg-purple-50/40 transition-colors cursor-pointer ${
                          canCheckIn ? "bg-emerald-50/30" : ""
                        }`}
                        onClick={() => setSelected(r)}>
                        <td className="px-4 py-3 text-slate-400 font-mono text-xs">#{r.reservation_id}</td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-800">{r.student_name}</p>
                          <p className="text-xs text-slate-400">{r.id_number}</p>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-700">{r.lab}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-50 text-purple-700 font-bold text-xs">
                            <Monitor className="w-3 h-3" /> {r.seat_number}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-600">{r.reserved_date}</span>
                            {isTodayReservation && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 uppercase tracking-wide">Today</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 text-xs">{r.time_slot}</td>
                        <td className="px-4 py-3 text-slate-600 max-w-[120px] truncate">{r.purpose}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${meta.cls}`}>
                            {meta.label}
                          </span>
                        </td>
                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center gap-1.5">
                            {isPending && (
                              <>
                                <button onClick={() => handleAction(r.reservation_id, "approve")}
                                  disabled={!!actionLoading}
                                  className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 disabled:opacity-50 transition-colors"
                                  title="Approve">
                                  {actionLoading === r.reservation_id + "approve"
                                    ? <Loader2 className="w-4 h-4 animate-spin" />
                                    : <CheckCircle className="w-4 h-4" />}
                                </button>
                                <button onClick={() => handleAction(r.reservation_id, "reject")}
                                  disabled={!!actionLoading}
                                  className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50 transition-colors"
                                  title="Reject">
                                  {actionLoading === r.reservation_id + "reject"
                                    ? <Loader2 className="w-4 h-4 animate-spin" />
                                    : <XCircle className="w-4 h-4" />}
                                </button>
                              </>
                            )}
                            {canCheckIn && (
                              <button onClick={() => openConfirm(
                                r.reservation_id, "checkin",
                                "Check In Student",
                                `Start a sit-in session for ${r.student_name} in ${r.lab}, Seat #${r.seat_number}?`,
                                Play, "bg-emerald-100 text-emerald-700",
                                "Check In", "bg-emerald-600 hover:bg-emerald-700"
                              )}
                                disabled={!!actionLoading}
                                className="p-1.5 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50 transition-colors"
                                title="Check In — Start Sit-In Session">
                                {actionLoading === r.reservation_id + "checkin"
                                  ? <Loader2 className="w-4 h-4 animate-spin" />
                                  : <Play className="w-4 h-4" />}
                              </button>
                            )}
                            {(isPending || isApproved) && (
                              <button onClick={() => openConfirm(
                                r.reservation_id, "admin_cancel",
                                "Cancel Reservation",
                                `Cancel reservation #${r.reservation_id} for ${r.student_name}? The student will be notified.`,
                                Ban, "bg-red-100 text-red-600",
                                "Cancel Reservation", "bg-red-600 hover:bg-red-700"
                              )}
                                disabled={!!actionLoading}
                                className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 disabled:opacity-50 transition-colors"
                                title="Cancel Reservation">
                                {actionLoading === r.reservation_id + "admin_cancel"
                                  ? <Loader2 className="w-4 h-4 animate-spin" />
                                  : <Ban className="w-4 h-4" />}
                              </button>
                            )}
                            {!isPending && !isApproved && (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* ═══════ Detail modal ═══════ */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelected(null)}>
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between"
              style={{ background: "linear-gradient(135deg, #240d48, #5428a8)" }}>
              <div>
                <p className="text-purple-200 text-xs">Reservation #{selected.reservation_id}</p>
                <h3 className="text-lg font-bold text-white mt-0.5">Reservation Details</h3>
              </div>
              <button onClick={() => setSelected(null)}
                className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Today callout */}
              {selected.status === "approved" && isToday(selected.reserved_date) && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <Play className="w-4 h-4 text-emerald-600 shrink-0" />
                  <p className="text-sm text-emerald-800 font-medium">
                    This reservation is scheduled for <strong>today</strong> — ready for check-in.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: BookMarked, label: "Student", value: selected.student_name },
                  { icon: BookMarked, label: "ID Number", value: selected.id_number },
                  { icon: MapPin, label: "Laboratory", value: selected.lab },
                  { icon: Monitor, label: "Seat Number", value: `Seat #${selected.seat_number}` },
                  { icon: CalendarCheck2, label: "Date", value: selected.reserved_date + (isToday(selected.reserved_date) ? " (Today)" : "") },
                  { icon: Clock, label: "Time Slot", value: selected.time_slot },
                  { icon: BookMarked, label: "Purpose", value: selected.purpose },
                  { icon: CheckCircle, label: "Status", value: (STATUS_META[selected.status] || STATUS_META.pending).label },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className="w-3.5 h-3.5 text-purple-500" />
                      <p className="text-xs text-slate-400 font-medium">{label}</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-800">{value}</p>
                  </div>
                ))}
              </div>

              {/* Created at */}
              {selected.created_at && (
                <p className="text-xs text-slate-400 text-center pt-1">
                  Submitted on {new Date(selected.created_at).toLocaleString()}
                </p>
              )}
            </div>

            {/* ── Modal Actions ── */}
            {selected.status === "pending" && (
              <div className="px-6 pb-6 flex gap-3">
                <button onClick={() => handleAction(selected.reservation_id, "approve")}
                  disabled={!!actionLoading}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 disabled:opacity-60 flex items-center justify-center gap-2">
                  {actionLoading === selected.reservation_id + "approve"
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Approving...</>
                    : <><CheckCircle className="w-4 h-4" /> Approve</>}
                </button>
                <button onClick={() => handleAction(selected.reservation_id, "reject")}
                  disabled={!!actionLoading}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-2">
                  {actionLoading === selected.reservation_id + "reject"
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Rejecting...</>
                    : <><XCircle className="w-4 h-4" /> Reject</>}
                </button>
              </div>
            )}

            {selected.status === "approved" && (
              <div className="px-6 pb-6 flex gap-3">
                {isToday(selected.reserved_date) && (
                  <button onClick={() => {
                    setSelected(null);
                    openConfirm(
                      selected.reservation_id, "checkin",
                      "Check In Student",
                      `Start a sit-in session for ${selected.student_name} in ${selected.lab}, Seat #${selected.seat_number}?`,
                      Play, "bg-emerald-100 text-emerald-700",
                      "Check In", "bg-emerald-600 hover:bg-emerald-700"
                    );
                  }}
                    disabled={!!actionLoading}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 disabled:opacity-60 flex items-center justify-center gap-2">
                    <Play className="w-4 h-4" /> Check In
                  </button>
                )}
                <button onClick={() => {
                  setSelected(null);
                  openConfirm(
                    selected.reservation_id, "admin_cancel",
                    "Cancel Reservation",
                    `Cancel reservation #${selected.reservation_id} for ${selected.student_name}? The student will be notified.`,
                    Ban, "bg-red-100 text-red-600",
                    "Cancel Reservation", "bg-red-600 hover:bg-red-700"
                  );
                }}
                  disabled={!!actionLoading}
                  className="flex-1 py-2.5 rounded-xl border border-red-200 text-red-600 font-semibold text-sm hover:bg-red-50 disabled:opacity-60 flex items-center justify-center gap-2">
                  <Ban className="w-4 h-4" /> Cancel Reservation
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════ Confirmation dialog ═══════ */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        icon={confirmDialog.icon}
        iconColor={confirmDialog.iconColor}
        confirmLabel={confirmDialog.confirmLabel}
        confirmColor={confirmDialog.confirmColor}
        onConfirm={confirmAction}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
        loading={!!actionLoading}
      />
    </main>
    </>
  );
}

