
import "../App.css";

export default function Features() {
  return (
    <section id="features" className="py-20 px-4 bg-[#f8f1fa] dark:bg-slate-900">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-['Montserrat'] text-3xl md:text-4xl font-bold text-[#220055] dark:text-slate-100 mb-4">
            Intelligent System Features
          </h2>
          <p className="font-['Montserrat'] text-base text-[#494551] dark:text-slate-400 max-w-2xl mx-auto">
            Everything you need to manage laboratory resources, track student
            attendance, and maintain operational efficiency in one cohesive
            platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1: Large Card */}
          <div className="md:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-8 border border-[#cbc4d2]/30 dark:border-slate-700 shadow-[0_10px_30px_rgba(56,24,114,0.03)] hover:shadow-[0_15px_40px_rgba(56,24,114,0.08)] transition-shadow duration-300 flex flex-col justify-between overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#eaddff]/30 dark:bg-[#381872]/20 rounded-full blur-3xl -mr-20 -mt-20 z-0"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-[#381872] dark:bg-[#6c44c1] text-[#a385e2] dark:text-purple-100 flex items-center justify-center mb-6">
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                >
                  monitoring
                </span>
              </div>
              <h3 className="font-['Montserrat'] text-2xl font-semibold text-[#220055] dark:text-slate-100 mb-3">
                Real-Time Monitoring
              </h3>
              <p className="font-['Montserrat'] text-base text-[#494551] dark:text-slate-400 mb-6 max-w-md">
                Track active sit-in sessions with live updates. Identify vacant
                stations instantly and optimize laboratory utilization without
                physical inspection.
              </p>
            </div>
            <div className="relative z-10 mt-auto pt-8 border-t border-[#e7e0e9] dark:border-slate-700">
              <div className="w-full h-48 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-center overflow-hidden">
                <img
                  alt="Real-time monitoring"
                  className="w-full h-full object-cover opacity-80 dark:opacity-60"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrCVwAmdCZm1ndiTbV9sNwMK_lq3sxCIEThf-nHzHPokDbDeRSLzmlg_og5b7Ec2RnfbnZxmuxmoj-FYnPYSJJeRaRyLhPfajjIQz1Lk4GVNQGqUU9AItHA_CIpobFzVDgwod6juK7V5jU4TPPHOydR3eBny0nYrsD5VmGBLRI8cp5-n5Ul_qviYAO4fRN6vzWE5kObJHXg3gaWWbMo0DT6GIUuNUALrF4QdFCnGnyJp3ZwroUxGuYdYsYJPD1GKvJCjdXRC0wCp4"
                />
              </div>
            </div>
          </div>

          {/* Feature 2: Tall Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-[#cbc4d2]/30 dark:border-slate-700 shadow-[0_10px_30px_rgba(56,24,114,0.03)] hover:shadow-[0_15px_40px_rgba(56,24,114,0.08)] transition-shadow duration-300 flex flex-col relative overflow-hidden">
            <div className="w-12 h-12 rounded-xl bg-[#ffdeab] dark:bg-[#5f4100] text-[#5f4100] dark:text-[#ffdeab] flex items-center justify-center mb-6 z-10 relative">
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                history_edu
              </span>
            </div>
            <h3 className="font-['Montserrat'] text-2xl font-semibold text-[#220055] dark:text-slate-100 mb-3 z-10 relative">
              Automated Logging
            </h3>
            <p className="font-['Montserrat'] text-base text-[#494551] dark:text-slate-400 mb-8 z-10 relative">
              Every session is meticulously recorded. Access historical logs, track student sit-in hours, and maintain a digital trail of laboratory activity.
            </p>
            <div className="mt-auto relative z-10 flex justify-center">
               <div className="w-full space-y-2 opacity-20">
                  <div className="h-2 bg-slate-300 dark:bg-slate-600 rounded w-full"></div>
                  <div className="h-2 bg-slate-300 dark:bg-slate-600 rounded w-5/6"></div>
                  <div className="h-2 bg-slate-300 dark:bg-slate-600 rounded w-4/6"></div>
               </div>
            </div>
          </div>

          {/* Feature 3: Standard Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-[#cbc4d2]/30 dark:border-slate-700 shadow-[0_10px_30px_rgba(56,24,114,0.03)] hover:shadow-[0_15px_40px_rgba(56,24,114,0.08)] transition-shadow duration-300">
            <div className="w-12 h-12 rounded-xl bg-[#e7e0e9] dark:bg-slate-700 text-[#1d1b20] dark:text-slate-200 flex items-center justify-center mb-6">
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                groups
              </span>
            </div>
            <h3 className="font-['Montserrat'] text-xl font-semibold text-[#220055] dark:text-slate-100 mb-3">
              Student Management
            </h3>
            <p className="font-['Montserrat'] text-sm text-[#494551] dark:text-slate-400">
              Maintain detailed profiles for every student. Track remaining
              sit-in hours, disciplinary records, and laboratory access
              privileges securely.
            </p>
          </div>

          {/* Feature 4: Medium Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-[#cbc4d2]/30 dark:border-slate-700 shadow-[0_10px_30px_rgba(56,24,114,0.03)] hover:shadow-[0_15px_40px_rgba(56,24,114,0.08)] transition-shadow duration-300 md:col-span-2 flex items-center gap-8">
            <div className="flex-1">
              <div className="w-12 h-12 rounded-xl bg-[#ffdad6] dark:bg-red-950/50 text-[#ba1a1a] dark:text-red-400 flex items-center justify-center mb-6">
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                >
                  notifications_active
                </span>
              </div>
              <h3 className="font-['Montserrat'] text-xl font-semibold text-[#220055] dark:text-slate-100 mb-3">
                Smart Alerts
              </h3>
              <p className="font-['Montserrat'] text-sm text-[#494551] dark:text-slate-400">
                Automated notifications for overstaying students, unauthorized
                access attempts, or exhausted sit-in hour quotas, ensuring
                policy compliance.
              </p>
            </div>
            <div className="hidden sm:block flex-shrink-0 w-48 h-48 bg-[#e7e0e9] dark:bg-slate-700 rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-slate-900/40"></div>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm relative z-10 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#ffdad6] dark:bg-red-900 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#ba1a1a] dark:text-red-400 text-sm">
                    warning
                  </span>
                </div>
                <div className="flex-1">
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm relative z-10 flex items-center gap-3 opacity-70">
                <div className="w-8 h-8 rounded-full bg-[#381872] dark:bg-purple-900 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#a385e2] dark:text-purple-300 text-sm">
                    info
                  </span>
                </div>
                <div className="flex-1">
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2"></div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}