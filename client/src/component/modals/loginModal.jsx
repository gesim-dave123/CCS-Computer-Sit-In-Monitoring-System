import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  IdIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  CheckIcon,
  Spinner,
} from "../shared/Icons";

export default function LoginModal({ onClose, onSwitchToRegister }) {
  const navigate = useNavigate();
  const [idNumber, setIdNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        "http://localhost:8080/CCS-Computer-Sit-In-Monitoring-System/server/src/login.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id_number: idNumber, password: password }),
        },
      );

      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Unknown error");
        setLoading(false);
        return;
      }

      const role = json.user?.role || "student";
      const userWithRole = { ...json.user, role };

      localStorage.setItem("authToken", json.token);
      localStorage.setItem("user", JSON.stringify(userWithRole));

      setDone(true);
      setTimeout(() => {
        setLoading(false);
        navigate(role === "admin" ? "/admin" : "/dashboard");
      }, 800);
    } catch (err) {
      console.error("Login error:", err);
      setError("Could not reach the server. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
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
              <path
                d="M1 1l12 12M13 1L1 13"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
          <p className="text-sm text-gray-400 mt-1">
            Sign in to access your dashboard
          </p>
        </div>

        {/* Body */}
        <div className="px-8 pb-8">
          {done ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full bg-purple-50 border-2 border-purple-600 flex items-center justify-center mx-auto mb-4">
                <svg viewBox="0 0 20 20" fill="#5B2D8E" width="28" height="28">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="text-xl font-semibold text-gray-900">Signed in!</p>
              <p className="text-sm text-gray-400 mt-1">
                Redirecting to your dashboard…
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* ID Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  ID Number
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <IdIcon />
                  </span>
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
                    placeholder="e.g. 2023-00001"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <a
                    href="#"
                    className="text-xs text-amber-600 hover:text-amber-700 transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <LockIcon />
                  </span>
                  {error && (
                    <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-600 mt-3">
                      {error}
                    </div>
                  )}
                  <input
                    type={showPw ? "text" : "password"}
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
                    placeholder="Enter your password"
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
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-800 to-purple-600 text-white text-sm font-semibold shadow-md shadow-purple-200 hover:shadow-lg hover:shadow-purple-300 transition-all disabled:opacity-60"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner /> Signing in…
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Switch to register */}
              <p className="text-center text-sm text-gray-400">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-amber-600 font-medium hover:text-amber-700 transition-colors"
                >
                  Create one
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
