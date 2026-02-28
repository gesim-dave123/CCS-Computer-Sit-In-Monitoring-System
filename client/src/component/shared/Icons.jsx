import React from "react";

/* ── Base icon wrapper ── */
export const Icon = ({ d, size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

export const MailIcon = () => <Icon d="M2 5.5h16v11H2V5.5zm0 0l8 6 8-6" />;

export const LockIcon = () => (
  <Icon d="M6 9V7a4 4 0 018 0v2M4 9h12a1 1 0 011 1v7a1 1 0 01-1 1H4a1 1 0 01-1-1v-7a1 1 0 011-1z" />
);

export const UserIcon = () => (
  <Icon d="M10 10a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 0114 0" />
);

export const IdIcon = () => <Icon d="M2 5h16v12H2V5zm3 4h3m-3 3h8m-8 3h5" />;

export const EyeIcon = () => (
  <Icon d="M1 10s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6zm9 2a2 2 0 100-4 2 2 0 000 4z" />
);

export const EyeOffIcon = () => (
  <Icon d="M3 3l14 14M10 4c5.5 0 9 6 9 6s-.9 1.7-2.4 3.2M6.4 6.4A8.7 8.7 0 001 10s3.5 6 9 6a8.7 8.7 0 004.6-1.4" />
);

export const YearLevelIcon = () => (
  <Icon d="M12 2l9 4-9 4-9-4 9-4zm0 6v6m-6 2h12M6 18h2m2 0h2m2 0h2" />

);

export const CheckIcon = ({ color = "white", size = 10 }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
    <path
      d="M2 6l3 3 5-5"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

export const Spinner = () => (
  <svg
    className="animate-spin"
    viewBox="0 0 20 20"
    fill="none"
    width="16"
    height="16"
    style={{ animation: "spin 0.8s linear infinite" }}
  >
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    <circle
      cx="10"
      cy="10"
      r="7"
      stroke="rgba(255,255,255,0.3)"
      strokeWidth="2.5"
    />
    <path
      d="M10 3a7 7 0 017 7"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

/* ── Password strength helper ── */
export function getStrength(pw) {
  if (!pw) return { score: 0, label: "", color: "#E5D9F7" };
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const map = [
    { label: "Too short", color: "#E57373" },
    { label: "Weak", color: "#E57373" },
    { label: "Fair", color: "#C9973A" },
    { label: "Good", color: "#7C3FB5" },
    { label: "Strong", color: "#4CAF50" },
  ];
  return { score: s, ...map[s] };
}
