import { useState, useEffect, useRef } from "react";
import { Trophy, Medal, Clock } from "lucide-react";

// ── Podium config: visual order left→right is rank 4,2,1,3,5 ──────────────────
const PODIUM_ORDER   = [3, 1, 0, 2, 4]; // indices into top-5 array
const PODIUM_HEIGHTS = [130, 180, 240, 155, 105]; // px (larger for landing page)
const PODIUM_COLORS  = [
  { bar: "#a78bfa", glow: "rgba(167,139,250,0.40)", light: "#ede9fe" }, // 4th – violet
  { bar: "#94a3b8", glow: "rgba(148,163,184,0.45)", light: "#f1f5f9" }, // 2nd – silver
  { bar: "#f59e0b", glow: "rgba(245,158,11,0.55)",  light: "#fef3c7" }, // 1st – gold
  { bar: "#f97316", glow: "rgba(249,115,22,0.40)",  light: "#fff7ed" }, // 3rd – bronze
  { bar: "#8b5cf6", glow: "rgba(139,92,246,0.35)",  light: "#f5f3ff" }, // 5th – purple
];
const RANK_MEDALS  = ["🥇", "🥈", "🥉", "4th", "5th"];
const RANK_DISPLAY = [4, 2, 1, 3, 5]; // human rank for each column

export default function StudentLeaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [animated, setAnimated]       = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res  = await fetch(`${import.meta.env.VITE_API_BASE_URL}/adminDashboardStats.php`);
        const json = await res.json();
        if (res.ok && json.stats) setLeaderboard(json.stats.leaderboard || []);
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  // Trigger animation after data loads
  useEffect(() => {
    if (!loading && leaderboard.length > 0) {
      const t = setTimeout(() => setAnimated(true), 120);
      return () => clearTimeout(t);
    }
  }, [loading, leaderboard]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-medium font-['Montserrat']">Loading achievements…</p>
      </div>
    );
  }

  if (leaderboard.length === 0) return null;

  const top5  = leaderboard.slice(0, 5);
  const others = leaderboard.slice(5, 15);

  return (
    <section
      id="leaderboard"
      className="py-24 px-4 bg-white dark:bg-slate-950 relative overflow-hidden font-['Montserrat']"
    >
      {/* CSS Keyframes */}
      <style>{`
        @keyframes lb-riseUp {
          from { transform: scaleY(0); opacity: 0; }
          to   { transform: scaleY(1); opacity: 1; }
        }
        @keyframes lb-floatBob {
          0%, 100% { transform: translateY(0px);  }
          50%       { transform: translateY(-8px); }
        }
        @keyframes lb-crownPulse {
          0%, 100% { transform: scale(1)   rotate(-6deg); filter: drop-shadow(0 0 6px #f59e0b);  }
          50%       { transform: scale(1.25) rotate(6deg);  filter: drop-shadow(0 0 14px #f59e0b); }
        }
        @keyframes lb-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes lb-pulse-ring {
          0%   { box-shadow: 0 0 0 0px rgba(245,158,11,0.5); }
          70%  { box-shadow: 0 0 0 12px rgba(245,158,11,0);  }
          100% { box-shadow: 0 0 0 0px rgba(245,158,11,0);   }
        }
        .lb-bar         { transform-origin: bottom; }
        .lb-bar:hover   { filter: brightness(1.12); }
        .lb-avatar      { animation: lb-floatBob 3.2s ease-in-out infinite; }
        .lb-avatar-1st  { animation: lb-floatBob 2.6s ease-in-out infinite; }
        .lb-crown       { animation: lb-crownPulse 2.2s ease-in-out infinite; display: inline-block; }
        .lb-shimmer-txt {
          background: linear-gradient(90deg, #6d28d9 0%, #a78bfa 40%, #ede9fe 58%, #6d28d9 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: lb-shimmer 3s linear infinite;
        }
        .lb-avatar-ring-1st { animation: lb-pulse-ring 2s ease-out infinite; }
      `}</style>

      {/* Ambient blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#eaddff]/25 dark:bg-[#381872]/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-70 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-50 dark:bg-amber-900/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl opacity-70 pointer-events-none" />

      <div ref={ref} className="max-w-[1400px] mx-auto relative z-10">

        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#eaddff]/50 dark:bg-[#381872]/30 border border-[#cbc4d2]/30 dark:border-[#52358d]/30 text-[#5428a8] dark:text-[#a385e2] text-sm font-semibold mb-4">
            <Trophy className="w-4 h-4" />
            <span>Achievement Leaderboard</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#220055] dark:text-slate-100 tracking-tight">
            Top <span className="text-[#5428a8] dark:text-[#a388ee]">Studious</span> Students
          </h2>
          <p className="mt-4 text-[#494551] dark:text-slate-400 max-w-2xl mx-auto text-lg font-medium">
            Recognizing the students with the longest laboratory sit-in hours. Dedication leads to excellence!
          </p>
        </div>

        {/* ── Animated Podium ── */}
        <div className="flex items-end justify-center gap-3 sm:gap-5 pt-16 pb-0 min-h-[380px] px-2 overflow-x-auto">
          {PODIUM_ORDER.map((rankIdx, colIdx) => {
            const student = top5[rankIdx];
            if (!student) return <div key={colIdx} style={{ width: 120 }} />;

            const height  = PODIUM_HEIGHTS[colIdx];
            const color   = PODIUM_COLORS[colIdx];
            const medal   = RANK_MEDALS[rankIdx];
            const isFirst = rankIdx === 0;
            const hours   = parseFloat(student.total_hours).toFixed(1);
            const initial = (student.full_name || student.id_number || "?")[0].toUpperCase();

            return (
              <div
                key={student.id_number}
                className="flex flex-col items-center flex-shrink-0"
                style={{ width: isFirst ? 140 : 110 }}
              >
                {/* Floating avatar block */}
                <div
                  className={`relative mb-3 ${isFirst ? "lb-avatar-1st" : "lb-avatar"}`}
                  style={{ animationDelay: `${colIdx * 0.18}s` }}
                >
                  {/* Crown for 1st */}
                  {isFirst && (
                    <div className="absolute -top-9 left-1/2 -translate-x-1/2 text-3xl lb-crown select-none">
                      👑
                    </div>
                  )}

                  {/* Avatar circle */}
                  <div
                    className={`${isFirst ? "w-20 h-20" : "w-14 h-14"} rounded-full flex items-center justify-center text-white font-black shadow-xl border-4 border-white dark:border-slate-900 ${isFirst ? "lb-avatar-ring-1st" : ""}`}
                    style={{
                      backgroundColor: color.bar,
                      fontSize: isFirst ? "1.5rem" : "1.1rem",
                      boxShadow: `0 0 22px ${color.glow}`,
                    }}
                  >
                    {initial}
                  </div>

                  {/* Medal badge */}
                  <div className="absolute -bottom-2 -right-2 text-base leading-none select-none">
                    {["🥇", "🥈", "🥉"].includes(medal) ? medal : (
                      <span
                        className="text-[11px] font-black px-1.5 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: color.bar }}
                      >
                        {medal}
                      </span>
                    )}
                  </div>
                </div>

                {/* Name */}
                <p
                  className={`font-black text-center leading-tight mb-1 truncate w-full px-1 ${
                    isFirst ? "lb-shimmer-txt text-base" : "text-[11px] text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {student.full_name?.split(" ")[0] || student.id_number}
                </p>

                {/* Hours pill */}
                <div className="flex items-center gap-1 mb-2">
                  <Clock size={10} style={{ color: color.bar }} />
                  <span
                    className="text-[11px] font-black"
                    style={{ color: color.bar }}
                  >
                    {hours}h
                  </span>
                </div>

                {/* Stair bar */}
                <div
                  className="lb-bar w-full rounded-t-2xl relative overflow-hidden cursor-pointer transition-all duration-300"
                  style={{
                    height: animated ? height : 0,
                    background: `linear-gradient(to bottom, ${color.bar}, ${color.bar}cc)`,
                    boxShadow: `0 -6px 24px ${color.glow}`,
                    animation: animated
                      ? `lb-riseUp 0.75s cubic-bezier(0.34,1.56,0.64,1) ${colIdx * 0.13}s both`
                      : "none",
                    transformOrigin: "bottom",
                  }}
                >
                  {/* Moving sheen */}
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      background: "linear-gradient(120deg, transparent 35%, rgba(255,255,255,0.7) 50%, transparent 65%)",
                      backgroundSize: "200% 100%",
                      animation: "lb-shimmer 2.8s linear infinite",
                      animationDelay: `${colIdx * 0.35}s`,
                    }}
                  />
                  {/* Rank inside bar */}
                  <p className="absolute bottom-4 left-0 right-0 text-center text-white/60 font-black text-sm">
                    #{rankIdx + 1}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stage platform */}
        <div className="h-4 rounded-b-2xl bg-gradient-to-r from-violet-200 via-amber-200 to-violet-200 dark:from-violet-900/40 dark:via-amber-900/30 dark:to-violet-900/40 shadow-inner mb-16" />

        {/* ── Rising Achievers list (rank 6-15) ── */}
        {others.length > 0 && (
          <div className="max-w-3xl mx-auto bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
              <Medal className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Rising Achievers (Top 6–15)
            </h3>
            <div className="space-y-3">
              {others.map((student, idx) => (
                <div
                  key={student.id_number}
                  className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-all hover:border-violet-200 dark:hover:border-violet-900 hover:shadow-md group"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 text-slate-400 dark:text-slate-500 font-bold group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors text-sm">
                      #{idx + 6}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center text-violet-700 dark:text-violet-300 font-black text-sm">
                      {student.full_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{student.full_name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-500">{student.id_number}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-bold">
                      <Clock className="w-4 h-4 text-violet-500 dark:text-violet-400" />
                      <span>{student.total_hours}h</span>
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold mt-0.5">
                      Total Hours
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
