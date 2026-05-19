import React, { useEffect, useState } from "react";
import { Star, Quote } from "lucide-react";

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const API = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch(`${API}/testimonials.php?featured=1&limit=20`);
        const json = await res.json();
        if (res.ok) {
          setTestimonials(json.testimonials || []);
        }
      } catch (err) {
        console.error("Failed to fetch testimonials:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, [API]);

  if (!loading && testimonials.length === 0) return null;

  return (
    <section
      id="testimonials"
      className="py-28 border-t border-[#cbc4d2]/30 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 overflow-hidden"
    >
      <div className="max-w-[1400px] mx-auto px-6 mb-16 text-center">
        <h2 className="font-['Montserrat'] text-3xl md:text-4xl font-bold text-[#220055] dark:text-slate-100 mb-4">
          What students are <span className="text-[#5428a8] dark:text-[#a388ee]">saying.</span>
        </h2>
        <p className="font-['Montserrat'] text-base font-medium max-w-xl mx-auto text-[#494551] dark:text-slate-400">
          Real feedback from students who use our facilities. These reviews are
          hand-picked by our administrators.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center gap-6 overflow-hidden px-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-7 shadow-sm h-64 min-w-[350px]"
            >
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6 mb-4"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="relative group">
          {/* Marquee Wrapper */}
          <div className="flex gap-6 animate-marquee hover:pause-marquee whitespace-nowrap">
            {/* Double the list for seamless loop */}
            {[...testimonials, ...testimonials].map((t, idx) => (
              <div
                key={`${t.testimonial_id}-${idx}`}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-7 shadow-sm hover:shadow-md dark:hover:shadow-slate-900 transition-shadow relative flex flex-col min-w-[350px] max-w-[400px] whitespace-normal"
              >
                <Quote className="absolute top-6 right-6 w-8 h-8 text-purple-100 dark:text-purple-900 opacity-20 -scale-x-100" />

                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < t.rating ? "fill-amber-400 text-amber-400" : "text-slate-200 dark:text-slate-700"}`}
                    />
                  ))}
                </div>

                <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed italic mb-8 flex-1">
                  "{t.comment}"
                </p>

                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-700 dark:text-purple-300 font-bold uppercase shrink-0">
                    {t.student_name ? t.student_name.charAt(0) : "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                      {t.student_name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {t.course || "CCS Student"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Gradients for fading edges */}
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-50 dark:from-slate-950 to-transparent pointer-events-none z-10" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-slate-50 dark:from-slate-950 to-transparent pointer-events-none z-10" />
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-50% - 12px)); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .pause-marquee:hover {
          animation-play-state: paused;
        }
      `}} />
    </section>
  );
}
