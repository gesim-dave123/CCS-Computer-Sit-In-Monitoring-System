export default function Footer() {
  return (
    <footer className="w-full py-12 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-950 mt-auto flex flex-col md:flex-row justify-between items-center px-12 gap-8 max-w-[1400px] mx-auto transition-colors duration-300">
      <div className="font-bold text-[#5428a8] dark:text-[#a388ee] font-['Montserrat']">
        CCS SITIN
      </div>
      <div className="text-slate-400 dark:text-slate-500 font-['Montserrat'] text-xs uppercase tracking-widest text-center">
        © {new Date().getFullYear()} College of Computer Studies. Professional
        Monitoring Systems.
      </div>
      <div className="flex gap-6">
        {["Privacy Policy", "Terms of Service", "Help Desk"].map((l) => (
          <a
            key={l}
            href="#"
            className="text-slate-400 dark:text-slate-500 hover:text-[#5428a8] dark:hover:text-[#a388ee] transition-all duration-200 font-['Montserrat'] text-xs uppercase tracking-widest"
          >
            {l}
          </a>
        ))}
      </div>
    </footer>
  );
}