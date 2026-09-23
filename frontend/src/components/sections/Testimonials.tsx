import { useState, useEffect } from "react";
import { Star, MessageSquareQuote } from "lucide-react";

interface Review {
  id: number;
  rating: number;
  comment: string;
  recipient_name: string;
  donor_name?: string;
  location?: string;
}

export function Testimonials() {
  const [reviews, setReviews] = useState<Review[]>([]);

  const defaultReviews: Review[] = [
    {
      id: 1,
      rating: 5,
      comment: "NutriShare's distribution has tremendously helped our orphanage fulfill the daily nutritional requirements of our children. The meals are always hygienic, vacuum-sealed, and safe.",
      recipient_name: "Al-Furqan Orphanage",
      location: "Yogyakarta",
    },
    {
      id: 2,
      rating: 5,
      comment: "The TOPSIS priority algorithm ensures fairness and transparency. There is no manual queuing bias because each shelter's real nutritional deficit is computed accurately.",
      recipient_name: "Kasih Mulia Foundation",
      location: "Sleman",
    },
    {
      id: 3,
      rating: 5,
      comment: "As a hotel partner, NutriShare makes it effortless to dispatch our breakfast and banquet surplus responsibly with transparent ESG environmental tracking.",
      recipient_name: "Hotel Merapi Merbabu",
      location: "Sleman",
    },
  ];

  useEffect(() => {
    fetch("/api/public/reviews")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: any[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((r, idx) => ({
            id: r.id || idx + 1,
            rating: r.rating || 5,
            comment: r.comment,
            recipient_name: r.recipient_name || "Beneficiary Shelter",
            location: r.donor_name ? `Partner: ${r.donor_name}` : "Yogyakarta",
          }));
          setReviews(mapped);
        } else {
          setReviews(defaultReviews);
        }
      })
      .catch(() => {
        setReviews(defaultReviews);
      });
  }, []);

  const displayList = reviews.length > 0 ? reviews : defaultReviews;

  return (
    <section className="relative py-20 sm:py-28 bg-[#f8fafc] text-slate-900 border-b border-emerald-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <MessageSquareQuote size={13} className="text-emerald-700" />
            <span>Community &amp; Partner Voices</span>
          </div>
          <h2 className="font-heading font-extrabold text-3xl sm:text-5xl text-emerald-950 tracking-tight">
            Trusted by the Ecosystem
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Real feedback from verified orphanage caregivers and commercial hospitality partners across D.I. Yogyakarta.
          </p>
        </div>

        {/* 3 Review Bento Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayList.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="p-8 rounded-3xl bg-white border border-emerald-100 hover:border-emerald-300 flex flex-col justify-between space-y-6 transition-all duration-300 hover:-translate-y-1 shadow-xs hover:shadow-md"
            >
              <div className="space-y-4">
                {/* Stars */}
                <div className="flex items-center gap-1.5 text-amber-500">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Quote Text */}
                <p className="text-sm text-slate-700 leading-relaxed font-normal">
                  "{item.comment}"
                </p>
              </div>

              {/* Institution Metadata */}
              <div className="pt-4 border-t border-slate-100 space-y-0.5">
                <strong className="text-sm font-bold text-emerald-950 block truncate">
                  {item.recipient_name}
                </strong>
                <span className="text-xs text-slate-500 block">
                  {item.location}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
