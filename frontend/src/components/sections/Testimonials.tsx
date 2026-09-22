import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "../../lib/api";
import { LeafIllustration } from "./EcoVisuals";

interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  recipient_name: string;
  donor_name: string | null;
  location?: string;
  avatarBg?: string;
}

const DEFAULT_REVIEWS: Review[] = [
  {
    id: 1,
    rating: 5,
    comment:
      "Bantuan dari NutriShare sangat membantu anak-anak di panti kami. Makanan yang diterima selalu layak dan bergizi.",
    created_at: "",
    recipient_name: "Panti Asuhan Al-Furqon",
    donor_name: "Hotel Merapi Merbabu",
    location: "Yogyakarta",
    avatarBg: "bg-[#DCFCE7] text-[#15803D]",
  },
  {
    id: 2,
    rating: 5,
    comment:
      "Program ini benar-benar bermanfaat. Anak-anak jadi lebih semangat karena mendapat makanan yang sehat dan variatif. Terima kasih NutriShare!",
    created_at: "",
    recipient_name: "Yayasan Kasih Mulia",
    donor_name: "Restoran Dapur Rasa",
    location: "Sleman",
    avatarBg: "bg-[#D1FAE5] text-[#047857]",
  },
  {
    id: 3,
    rating: 5,
    comment:
      "Proses klaim sangat mudah dan transparan. Kami merasa didukung dengan data yang jelas dan komunikasi yang baik.",
    created_at: "",
    recipient_name: "Panti Karya Insani",
    donor_name: "Catering Sehat",
    location: "Bantul",
    avatarBg: "bg-[#BBF7D0] text-[#166534]",
  },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1" aria-label={`Rating ${rating} dari 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={14}
          className={
            i <= rating ? "text-[#F59E0B] fill-[#F59E0B]" : "text-gray-200"
          }
        />
      ))}
    </div>
  );
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "?";
  const last = parts[1]?.[0] ?? "";
  return (first + last).toUpperCase();
}

export function Testimonials() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    let active = true;
    api
      .fetchJSON("/api/public/reviews?limit=6")
      .then((data: Review[]) => {
        if (active && Array.isArray(data) && data.length) {
          setReviews(data);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const displayList = reviews.length > 0 ? reviews : DEFAULT_REVIEWS;

  return (
    <section id="pahlawan" className="relative py-28 bg-[#FFFFFF] overflow-hidden">
      {/* Decorative Botanical Leaf Accents */}
      <LeafIllustration className="absolute top-1/2 -right-10 w-52 h-52 opacity-85 -translate-y-1/2" />
      <LeafIllustration className="absolute -bottom-8 -left-8 w-48 h-48 opacity-85" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-[#059669] font-extrabold uppercase tracking-[0.25em] text-xs px-3.5 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]">
              TESTIMONIALS
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0F172A] tracking-tight font-heading"
          >
            What Recipients Are Saying
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xs sm:text-sm text-[#475569] leading-relaxed max-w-xl mx-auto"
          >
            Real stories from social institutions receiving food donations through NutriShare.
          </motion.p>
        </div>

        {/* Carousel / Card Grid with side chevron buttons */}
        <div className="relative">
          {/* Left Navigation Chevron */}
          <button
            type="button"
            className="hidden lg:flex absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white border border-[#E2E8F0] shadow-md items-center justify-center text-[#475569] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
            aria-label="Previous testimonials"
          >
            <ChevronLeft size={18} />
          </button>

          {/* 3 Testimonials Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayList.slice(0, 3).map((r, i) => (
              <motion.div
                key={r.id || i}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="bg-white rounded-3xl border border-[#E2E8F0] p-7 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  {/* 5 Stars Rating */}
                  <Stars rating={r.rating || 5} />

                  {/* Comment quote */}
                  <p className="text-xs text-[#334155] leading-relaxed italic">
                    "{r.comment}"
                  </p>
                </div>

                {/* Author & Location Footer */}
                <div className="pt-4 border-t border-[#F1F5F9] flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${r.avatarBg || "bg-[#DCFCE7] text-[#15803D]"} font-extrabold text-xs flex items-center justify-center shrink-0`}>
                    {initials(r.recipient_name)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs text-[#0F172A] truncate">
                      {r.recipient_name}
                    </h4>
                    <p className="text-[10px] text-[#94A3B8] truncate">
                      {r.location || "Yogyakarta"}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right Navigation Chevron */}
          <button
            type="button"
            className="hidden lg:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white border border-[#E2E8F0] shadow-md items-center justify-center text-[#475569] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
            aria-label="Next testimonials"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Pagination indicator dots */}
        <div className="flex items-center justify-center gap-1.5 mt-10">
          <span className="w-2 h-2 rounded-full bg-[#10B981]" />
          <span className="w-2 h-2 rounded-full bg-[#E2E8F0]" />
          <span className="w-2 h-2 rounded-full bg-[#E2E8F0]" />
          <span className="w-2 h-2 rounded-full bg-[#E2E8F0]" />
          <span className="w-2 h-2 rounded-full bg-[#E2E8F0]" />
        </div>
      </div>
    </section>
  );
}
