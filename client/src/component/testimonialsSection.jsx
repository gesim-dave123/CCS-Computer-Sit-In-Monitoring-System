import React, { useEffect, useState } from "react";
import { Star, Quote } from "lucide-react";

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const API = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch(`${API}/testimonials.php?featured=1&limit=6`);
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
    <section id="testimonials" className="max-w-6xl mx-auto px-6 py-28 border-t border-slate-200">
      <div className="text-center mb-16">
        <h2 className="font-extrabold leading-tight text-slate-900" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}>
          What students are <span className="text-purple-800">saying.</span>
        </h2>
        <p className="mt-4 text-base font-medium max-w-xl mx-auto text-slate-500">
          Real feedback from students who use our facilities for their laboratory activities.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-white border border-slate-200 rounded-2xl p-7 shadow-sm h-64">
                    <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
                    <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded w-5/6 mb-4"></div>
                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200"></div>
                        <div className="flex-1">
                            <div className="h-3 bg-slate-200 rounded w-1/2 mb-1"></div>
                            <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                        </div>
                    </div>
                </div>
            ))
        ) : (
          testimonials.map((t) => (
            <div key={t.testimonial_id} className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm hover:shadow-md transition-shadow relative flex flex-col">
                <Quote className="absolute top-6 right-6 w-8 h-8 text-purple-100 -scale-x-100" />
                
                <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: 5 }, (_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < t.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                    ))}
                </div>

                <p className="text-slate-700 font-medium leading-relaxed italic mb-8 flex-1">
                    "{t.comment}"
                </p>

                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold uppercase shrink-0">
                        {t.student_name ? t.student_name.charAt(0) : "?"}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">
                            {t.student_name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                            {t.course || "CCS Student"}
                        </p>
                    </div>
                </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
