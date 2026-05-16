import { useEffect, useState } from "react";
import NavigationBar from "../component/studentNavBar";
import {
  Monitor,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  CalendarDays,
  Loader2,
  ChevronRight,
  ChevronLeft,
  X,
  BookMarked,
  Cpu,
  Code,
  Database,
  Palette,
  FileText,
  Globe,
} from "lucide-react";

const SW_ICONS = {
  IDE: Code,
  Office: FileText,
  Database: Database,
  Design: Palette,
  Browser: Globe,
};
const getSWIcon = (cat) => {
  if (!cat) return Cpu;
  for (const [k, I] of Object.entries(SW_ICONS))
    if (cat.toLowerCase().includes(k.toLowerCase())) return I;
  return Cpu;
};

const TIME_SLOTS = [
  "7:30 AM – 9:00 AM",
  "9:00 AM – 10:30 AM",
  "10:30 AM – 12:00 PM",
  "12:00 PM – 1:30 PM",
  "1:30 PM – 3:00 PM",
  "3:00 PM – 4:30 PM",
  "4:30 PM – 6:00 PM",
];

const PURPOSES = [
  "C Programming",
  "Java Programming",
  "Python Programming",
  "Web Development",
  "Database Management",
  "Thesis / Research",
  "Data Structures",
  "Operating Systems",
  "Networking",
  "Other",
];

const STATUS_COLORS = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cancelled: "bg-slate-100 text-slate-500 border-slate-200",
  completed: "bg-purple-100 text-purple-700 border-purple-200",
};

export default function StudentReservationPage() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const idNumber = user?.id_number || "";

  // Step: 0=lab pick, 1=seat/form, 2=success
  const [step, setStep] = useState(0);
  const [tab, setTab] = useState("new"); // "new" | "mine"

  const [selectedLab, setSelectedLab] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[0]);
  const [purpose, setPurpose] = useState(PURPOSES[0]);

  const [reservedSeats, setReservedSeats] = useState([]);
  const [seatsLoading, setSeatsLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successId, setSuccessId] = useState(null);

  const [myReservations, setMyReservations] = useState([]);
  const [myResLoading, setMyResLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [labs, setLabs] = useState([]);
  const [labsLoading, setLabsLoading] = useState(true);

  const BASE = import.meta.env.VITE_API_BASE_URL;

  // Fetch labs (with seats, building, software) from database
  useEffect(() => {
    setLabsLoading(true);
    fetch(`${BASE}/labsSoftware.php`)
      .then((r) => r.json())
      .then((d) => {
        const labsList = (d.labs || []).map((l) => ({
          lab_id: Number(l.lab_id),
          id: l.lab_name,
          name: l.lab_name,
          seats: Number(l.seats) || 30,
          building: l.building || "CCS Building",
          room_number: l.room_number,
          software: l.software || [],
        }));
        setLabs(labsList);
      })
      .catch(() => {})
      .finally(() => setLabsLoading(false));
  }, []);

  // Fetch seat availability whenever lab, date, or slot changes
  useEffect(() => {
    if (!selectedLab || step !== 1) return;
    let alive = true;
    setSeatsLoading(true);
    setSelectedSeat(null);
    fetch(
      `${BASE}/reservations.php?lab=${encodeURIComponent(selectedLab.id)}&date=${selectedDate}`,
    )
      .then((r) => r.json())
      .then((d) => {
        if (alive) setReservedSeats(d.reserved_seats || []);
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setSeatsLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [selectedLab, selectedDate, step]);

  // Fetch my reservations
  const fetchMyReservations = () => {
    if (!idNumber) return;
    setMyResLoading(true);
    fetch(`${BASE}/reservations.php?id_number=${encodeURIComponent(idNumber)}`)
      .then((r) => r.json())
      .then((d) => setMyReservations(d.reservations || []))
      .catch(() => {})
      .finally(() => setMyResLoading(false));
  };

  useEffect(() => {
    if (tab === "mine") fetchMyReservations();
  }, [tab]);

  const isSeatTaken = (seatNum) =>
    reservedSeats.some(
      (s) => Number(s.seat_number) === seatNum && s.time_slot === selectedSlot,
    );

  const handleSubmit = async () => {
    if (!selectedSeat) {
      setError("Please select a seat.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE}/reservations.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          id_number: idNumber,
          lab_id: selectedLab.lab_id,
          lab: selectedLab.id,
          seat_number: selectedSeat,
          purpose,
          date: selectedDate,
          time_slot: selectedSlot,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to submit reservation.");
        return;
      }
      setSuccessId(json.reservation_id);
      setStep(2);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (rid) => {
    setCancellingId(rid);
    try {
      const res = await fetch(`${BASE}/reservations.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "cancel",
          id_number: idNumber,
          reservation_id: rid,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || "Could not cancel.");
        return;
      }
      fetchMyReservations();
    } catch {
      alert("Server error.");
    } finally {
      setCancellingId(null);
    }
  };

  const resetFlow = () => {
    setStep(0);
    setSelectedLab(null);
    setSelectedSeat(null);
    setError("");
    setSuccessId(null);
  };

  const labForSeat = selectedLab || labs[0];
  const totalSeats = labForSeat?.seats || 30;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <NavigationBar />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-14 space-y-6">
        {/* Header */}
        <div
          className="rounded-2xl overflow-hidden shadow-lg relative"
          style={{ background: "linear-gradient(135deg, #240d48, #5428a8)" }}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(201,151,58,0.4) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="relative px-6 py-8 sm:px-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm">
                <BookMarked className="w-6 h-6 text-amber-400" />
              </div>
              <p className="text-purple-200 text-sm font-medium">
                Student Portal
              </p>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Computer Lab Reservation
            </h1>
            <p className="text-purple-200 mt-2 text-sm sm:text-base max-w-xl">
              Reserve a computer seat in your preferred laboratory. Choose your
              lab, pick a seat, and set your schedule.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200">
          {["new", "mine"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg transition-all ${
                tab === t
                  ? "bg-white border border-b-white border-slate-200 text-purple-700 -mb-px"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {t === "new" ? "New Reservation" : "My Reservations"}
            </button>
          ))}
        </div>

        {/* ══════════ NEW RESERVATION TAB ══════════ */}
        {tab === "new" && (
          <>
            {/* Step indicator */}
            <div className="flex items-center gap-2 text-sm">
              {["Choose Lab", "Select Seat & Schedule"].map((label, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      step > i
                        ? "bg-emerald-500 text-white dark:bg-emerald-600"
                        : step === i
                          ? "bg-purple-700 text-white dark:bg-purple-600"
                          : "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                    }`}
                  >
                    {step > i ? "✓" : i + 1}
                  </span>
                  <span
                    className={
                      step === i
                        ? "text-slate-800 font-semibold dark:text-slate-100"
                        : "text-slate-400 dark:text-slate-500"
                    }
                  >
                    {label}
                  </span>
                  {i < 1 && (
                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                  )}
                </div>
              ))}
            </div>

            {/* ── STEP 0: Lab selection ── */}
            {step === 0 && (
              <div className="space-y-4 fade-up">
                <h2 className="text-lg font-bold text-slate-800">
                  Select a Laboratory Room
                </h2>
                {labsLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                  </div>
                ) : labs.length === 0 ? (
                  <p className="text-center text-sm text-slate-500 py-12">
                    No laboratories available.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {labs.map((lab) => {
                      const sw = lab.software || [];
                      return (
                        <button
                          key={lab.lab_id}
                          onClick={() => {
                            setSelectedLab(lab);
                            setStep(1);
                          }}
                          className="group text-left bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-purple-400 hover:shadow-purple-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="p-3 rounded-xl bg-purple-50 group-hover:bg-purple-600 transition-colors">
                              <Monitor className="w-6 h-6 text-purple-700 group-hover:text-white transition-colors" />
                            </div>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                              Available
                            </span>
                          </div>
                          <h3 className="font-bold text-slate-900 text-base">
                            {lab.name}
                          </h3>
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                              <MapPin className="w-3.5 h-3.5" /> {lab.building}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                              <Monitor className="w-3.5 h-3.5" /> {lab.seats}{" "}
                              computer seats
                            </div>
                          </div>
                          {sw.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1">
                              {sw.slice(0, 3).map((s) => {
                                const Icon = getSWIcon(s.category);
                                return (
                                  <span
                                    key={s.software_id}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-[11px] text-purple-700 font-medium"
                                  >
                                    <Icon className="w-3 h-3" />
                                    {s.software_name}
                                  </span>
                                );
                              })}
                              {sw.length > 3 && (
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] text-slate-500 font-medium">
                                  +{sw.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                          <div className="mt-4 flex items-center gap-1 text-purple-700 text-sm font-semibold group-hover:gap-2 transition-all">
                            Select Lab <ChevronRight className="w-4 h-4" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 1: Seat map + form ── */}
            {step === 1 && selectedLab && (
              <div className="space-y-5 fade-up">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setStep(0)}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-slate-800">
                      {selectedLab.name}
                    </h2>
                    <p className="text-sm text-slate-500">
                      {selectedLab.seats} seats · {selectedLab.building}
                    </p>
                  </div>
                </div>

                {/* Available Software section */}
                {(selectedLab.software || []).length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-purple-600" />
                      Available Software in this Lab
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {(selectedLab.software || []).map((s) => {
                        const Icon = getSWIcon(s.category);
                        return (
                          <span
                            key={s.software_id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-100 text-sm text-purple-800 font-medium"
                          >
                            <Icon className="w-4 h-4 text-purple-600" />
                            {s.software_name}
                            {s.category && (
                              <span className="text-[10px] text-purple-500">
                                ({s.category})
                              </span>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
                {/* Date / Time row */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-purple-600" />{" "}
                    Schedule
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-500 font-medium block mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 font-medium block mb-1">
                        Time Slot
                      </label>
                      <select
                        value={selectedSlot}
                        onChange={(e) => setSelectedSlot(e.target.value)}
                        className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                      >
                        {TIME_SLOTS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Seat map */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-purple-600" /> Seat Map
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-emerald-400 block" />
                        Available
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-red-400 block" />
                        Taken
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-amber-400 block" />
                        Selected
                      </span>
                    </div>
                  </div>

                  {seatsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                    </div>
                  ) : (
                    <>
                      {/* Instructor desk */}
                      <div className="flex justify-center mb-6">
                        <div className="px-8 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold tracking-wide shadow">
                          INSTRUCTOR'S DESK
                        </div>
                      </div>

                      <div
                        className="grid gap-2"
                        style={{
                          gridTemplateColumns:
                            "repeat(auto-fill, minmax(52px, 1fr))",
                        }}
                      >
                        {Array.from({ length: totalSeats }, (_, i) => {
                          const num = i + 1;
                          const taken = isSeatTaken(num);
                          const chosen = selectedSeat === num;
                          return (
                            <button
                              key={num}
                              disabled={taken}
                              onClick={() =>
                                setSelectedSeat(chosen ? null : num)
                              }
                              title={`Seat ${num}${taken ? " (Taken)" : ""}`}
                              className={`relative flex flex-col items-center justify-center rounded-xl border-2 py-2.5 px-1 text-xs font-bold transition-all duration-150
                                ${
                                  taken
                                    ? "border-red-200 bg-red-50 text-red-400 cursor-not-allowed"
                                    : chosen
                                      ? "border-amber-400 bg-amber-50 text-amber-700 scale-105 shadow-lg shadow-amber-200"
                                      : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-purple-400 hover:bg-purple-50 hover:text-purple-700 hover:scale-105"
                                }`}
                            >
                              <Monitor className="w-5 h-5 mb-0.5" />
                              {num}
                              {chosen && (
                                <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-amber-400 rounded-full border-2 border-white" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      <p className="mt-3 text-xs text-slate-400 text-center">
                        {totalSeats -
                          reservedSeats.filter(
                            (s) => s.time_slot === selectedSlot,
                          ).length}{" "}
                        of {totalSeats} seats available for {selectedSlot}
                      </p>
                    </>
                  )}
                </div>

                {/* Purpose & submit */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <BookMarked className="w-4 h-4 text-purple-600" />{" "}
                    Reservation Details
                  </h3>

                  {selectedSeat && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
                      <CheckCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <p className="text-sm text-amber-800 font-medium">
                        Seat <strong>#{selectedSeat}</strong> selected in{" "}
                        <strong>{selectedLab.name}</strong>
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="text-xs text-slate-500 font-medium block mb-1">
                      Purpose / Subject
                    </label>
                    <select
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                    >
                      {PURPOSES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
                      <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !selectedSeat}
                    className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all
                      disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    style={{
                      background: "linear-gradient(135deg, #240d48, #5428a8)",
                    }}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />{" "}
                        Submitting...
                      </>
                    ) : (
                      "Submit Reservation"
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 2: Success ── */}
            {step === 2 && (
              <div className="flex flex-col items-center justify-center py-16 fade-up">
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-5 shadow-lg shadow-emerald-200">
                  <CheckCircle className="w-10 h-10 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Reservation Submitted!
                </h2>
                <p className="text-slate-500 mt-2 text-sm max-w-sm text-center">
                  Your reservation #{successId} is pending admin approval.
                  You'll be notified once confirmed.
                </p>
                <div className="mt-8 flex gap-3">
                  <button
                    onClick={resetFlow}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-100"
                  >
                    New Reservation
                  </button>
                  <button
                    onClick={() => {
                      setTab("mine");
                      resetFlow();
                      fetchMyReservations();
                    }}
                    className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
                    style={{
                      background: "linear-gradient(135deg, #240d48, #5428a8)",
                    }}
                  >
                    View My Reservations
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ══════════ MY RESERVATIONS TAB ══════════ */}
        {tab === "mine" && (
          <div className="space-y-4 fade-up">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">
                My Reservations
              </h2>
              <button
                onClick={fetchMyReservations}
                disabled={myResLoading}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-sm hover:bg-slate-100 disabled:opacity-60 flex items-center gap-1.5"
              >
                {myResLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : null}
                Refresh
              </button>
            </div>

            {myResLoading && myReservations.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
              </div>
            ) : myReservations.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center">
                <CalendarDays className="w-12 h-12 text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">
                  No reservations yet
                </p>
                <p className="text-slate-400 text-sm mt-1">
                  Go to "New Reservation" to book a computer seat.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {myReservations.map((r) => (
                  <div
                    key={r.reservation_id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-xs text-slate-400 font-medium">
                          #{r.reservation_id}
                        </span>
                        <h4 className="text-base font-bold text-slate-900 mt-0.5">
                          {r.lab}
                        </h4>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_COLORS[r.status] || STATUS_COLORS.pending}`}
                      >
                        {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                      </span>
                    </div>
                    <div className="space-y-1.5 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Monitor className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                        <span>
                          Seat <strong>#{r.seat_number}</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                        <span>{r.reserved_date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                        <span className="text-xs">{r.time_slot}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookMarked className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                        <span className="truncate">{r.purpose}</span>
                      </div>
                    </div>
                    {r.status === "pending" && (
                      <button
                        onClick={() => handleCancel(r.reservation_id)}
                        disabled={cancellingId === r.reservation_id}
                        className="mt-4 w-full py-2 rounded-xl border border-red-200 text-red-600 text-xs font-semibold
                          hover:bg-red-50 disabled:opacity-60 flex items-center justify-center gap-1.5"
                      >
                        {cancellingId === r.reservation_id ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />{" "}
                            Cancelling...
                          </>
                        ) : (
                          <>
                            <X className="w-3.5 h-3.5" /> Cancel Reservation
                          </>
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
