import { useState } from "react";
import {
  MailIcon,
  LockIcon,
  UserIcon,
  IdIcon,
  EyeIcon,
  EyeOffIcon,
  CheckIcon,
  Spinner,
  getStrength,
} from "../shared/Icons";

export default function RegisterModal({ onClose, onSwitchToLogin }) {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("student");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const strength = getStrength(password);
  const passwordsMatch = confirm.length > 0 && password === confirm;
  const passwordMismatch = confirm.length > 0 && password !== confirm;

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
    }, 1700);
  };

  const roles = [
    { val: "student", label: "Student", emoji: "🎓" },
    { val: "faculty", label: "Faculty", emoji: "👨‍🏫" },
    { val: "admin", label: "Admin", emoji: "🛡️" },
  ];

  const strengthColors = {
    "#E57373": "bg-red-400",
    "#C9973A": "bg-amber-500",
    "#7C3FB5": "bg-purple-600",
    "#4CAF50": "bg-green-500",
    "#E5D9F7": "bg-purple-100",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-4">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>

          <h2 className="text-2xl font-bold text-gray-900">Create account</h2>
          <p className="text-sm text-gray-400 mt-1">Join the system — it only takes a minute</p>
        </div>

        {/* Body */}
        <div className="px-8 pb-8">
          {done ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full bg-amber-50 border-2 border-amber-500 flex items-center justify-center mx-auto mb-4">
                <svg viewBox="0 0 20 20" fill="#C9973A" width="28" height="28">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-xl font-semibold text-gray-900">Account created!</p>
              <p className="text-sm text-gray-400 mt-1 mb-6">Check your email to verify your account.</p>
              <button
                onClick={onSwitchToLogin}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-800 to-purple-600 text-white text-sm font-semibold shadow-md shadow-purple-200 hover:shadow-lg transition-all"
              >
                Go to Login
              </button>
            </div>
          ) : (
            <>
              {/* Step indicator */}
              <div className="flex items-center justify-center gap-3 mb-6">
                {[1, 2].map((s, i) => (
                  <div key={s} className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step > s
                            ? "bg-purple-700 text-white"
                            : step === s
                              ? "bg-purple-700 text-white"
                              : "bg-gray-100 text-gray-400"
                          }`}
                      >
                        {step > s ? <CheckIcon size={10} /> : s}
                      </div>
                      <span className={`text-xs font-medium ${step === s ? "text-purple-700" : "text-gray-400"}`}>
                        {s === 1 ? "Personal info" : "Credentials"}
                      </span>
                    </div>
                    {i < 1 && (
                      <div className={`w-10 h-0.5 rounded-full transition-all ${step > 1 ? "bg-purple-600" : "bg-gray-200"}`} />
                    )}
                  </div>
                ))}
              </div>

              {/* STEP 1 */}
              {step === 1 && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setStep(2);
                  }}
                  className="space-y-4"
                >
                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">I am a</label>
                    <div className="grid grid-cols-3 gap-2">
                      {roles.map((r) => (
                        <button
                          key={r.val}
                          type="button"
                          onClick={() => setRole(r.val)}
                          className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 text-sm transition-all ${role === r.val
                              ? "border-purple-600 bg-purple-50"
                              : "border-gray-200 bg-gray-50 hover:border-gray-300"
                            }`}
                        >
                          <span className="text-lg">{r.emoji}</span>
                          <span className={`text-xs font-medium ${role === r.val ? "text-purple-700" : "text-gray-500"}`}>
                            {r.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">First name</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <UserIcon />
                        </span>
                        <input
                          type="text"
                          required
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
                          placeholder="Juan"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Last name</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <UserIcon />
                        </span>
                        <input
                          type="text"
                          required
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
                          placeholder="Dela Cruz"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {role === "student" ? "Student ID" : role === "faculty" ? "Faculty ID" : "Admin ID"}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <IdIcon />
                      </span>
                      <input
                        type="text"
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
                        placeholder={role === "student" ? "e.g. 2024-00001" : "e.g. FAC-0042"}
                        value={idNumber}
                        onChange={(e) => setIdNumber(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-800 to-purple-600 text-white text-sm font-semibold shadow-md shadow-purple-200 hover:shadow-lg hover:shadow-purple-300 transition-all"
                  >
                    Continue →
                  </button>
                </form>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <MailIcon />
                      </span>
                      <input
                        type="email"
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
                        placeholder="you@university.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <LockIcon />
                      </span>
                      <input
                        type={showPw ? "text" : "password"}
                        required
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
                        placeholder="Min. 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => setShowPw((v) => !v)}
                      >
                        {showPw ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                    {password && (
                      <div className="mt-2 space-y-1">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className={`h-1 flex-1 rounded-full transition-all ${i <= strength.score
                                  ? strengthColors[strength.color] || "bg-gray-200"
                                  : "bg-gray-200"
                                }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs" style={{ color: strength.color }}>{strength.label}</p>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm password</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <LockIcon />
                      </span>
                      <input
                        type="password"
                        required
                        className={`w-full pl-10 pr-10 py-2.5 rounded-xl border bg-gray-50 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all ${passwordMismatch
                            ? "border-red-400 focus:ring-red-100 focus:border-red-400"
                            : passwordsMatch
                              ? "border-green-400 focus:ring-green-100 focus:border-green-400"
                              : "border-gray-200 focus:ring-purple-100 focus:border-purple-400"
                          } focus:ring-2`}
                        placeholder="Re-enter password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                      />
                      {(passwordsMatch || passwordMismatch) && (
                        <span className={`absolute right-3 top-1/2 -translate-y-1/2 ${passwordsMatch ? "text-green-500" : "text-red-400"}`}>
                          <svg viewBox="0 0 12 12" fill="currentColor" width="14" height="14">
                            {passwordsMatch ? (
                              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                            ) : (
                              <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                            )}
                          </svg>
                        </span>
                      )}
                    </div>
                    {passwordMismatch && (
                      <p className="text-xs text-red-400 mt-1">Passwords don't match</p>
                    )}
                  </div>

                  {/* Terms */}
                  <div className="flex items-start gap-2">
                    <button
                      type="button"
                      onClick={() => setAgree((v) => !v)}
                      className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border-2 transition-all flex-shrink-0 ${agree ? "bg-purple-700 border-purple-700" : "border-gray-300 bg-white"
                        }`}
                    >
                      {agree && <CheckIcon size={8} />}
                    </button>
                    <span className="text-xs text-gray-400 leading-relaxed">
                      I agree to the{" "}
                      <a href="#" className="text-amber-600 hover:text-amber-700">Terms of Service</a>{" "}
                      and{" "}
                      <a href="#" className="text-amber-600 hover:text-amber-700">Privacy Policy</a>
                    </span>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !agree || !!passwordMismatch || !password || !confirm}
                      className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white text-sm font-semibold shadow-md shadow-amber-100 hover:shadow-lg hover:shadow-amber-200 transition-all disabled:opacity-50"
                    >
                      {loading ? (
                        <span className="inline-flex items-center gap-2">
                          <Spinner /> Creating…
                        </span>
                      ) : (
                        "Create Account"
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Switch to login */}
              <div className="flex items-center gap-3 mt-5">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">already have an account?</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <p className="text-center text-sm text-gray-400 mt-3">
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-purple-700 font-medium hover:text-purple-800 transition-colors"
                >
                  Sign in instead
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
