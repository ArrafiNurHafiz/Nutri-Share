import { useState } from "react";
import { motion } from "motion/react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { GlossyLeafDecor } from "./EcoVisuals";

interface Review {
  id: number;
  rating: number;
  comment: string;
  recipient_name: string;
  location: string;
  avatarBg: string;
  initials: string;
}

const DEFAULT_REVIEWS: Review[] = [
  {
    id: 1,
    rating: 5,
    comment:
      "Bantuan dari NutriShare sangat membantu anak-anak di panti kami. Makanan yang diterima selalu layak dan bergizi.",
    recipient_name: "Panti Asuhan Al-Furqan",
    location: "Yogyakarta",
    avatarBg: "bg-[#DCFCE7] text-[#15803D]",
    initials: "PA",
  },
  {
    id: 2,
    rating: 5,
    comment:
      "Program ini benar-benar bermanfaat. Anak-anak jadi lebih semangat karena mendapat makanan yang sehat dan variatif. Terima kasih NutriShare!",
    recipient_name: "Yayasan Kasih Mulia",
    location: "Sleman",
    avatarBg: "bg-[#D1FAE5] text-[#047857]",
    initials: "YK",
  },
  {
    id: 3,
    rating: 5,
    comment:
      "Proses klaim sangat mudah dan transparan. Kami merasa didukung dengan data yang jelas dan komunikasi yang baik.",
    recipient_name: "Panti Karya Insani",
    location: "Bantul",
    avatarBg: "bg-[#BBF7D0] text-[#166534]",
    initials: "PK",
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

export function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const displayList = DEFAULT_REVIEWS;

  const handlePrev = () => {
    setActiveIndex((prev: number) => (prev > 0 ? prev - 1 : displayList.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev: number) => (prev < displayList.length - 1 ? prev + 1 : 0));
  };

  return (
    <section id="pahlawan" className="relative py-24 bg-[#FFFFFF] overflow-hidden">
      {/* Botanical 3D Leaf Accents - Unique Variants */}
      <GlossyLeafDecor
        variant="sprig-stem"
        className="hidden md:block absolute top-1/2 -right-8 w-28 h-28 opacity-90 -translate-y-1/2"
      />
      <GlossyLeafDecor
        variant="hero-cluster"
        className="hidden md:block absolute -bottom-6 -left-6 w-28 h-28 opacity-90 rotate-45"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-[#059669] font-bold uppercase tracking-[0.2em] text-[11px] px-3.5 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]">
              TESTIMONIALS
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F172A] tracking-tight font-heading"
          >
            What Recipients Are Saying
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xs sm:text-[13px] text-[#64748B] leading-relaxed max-w-lg mx-auto"
          >
            Real stories from social institutions receiving food donations through NutriShare.
          </motion.p>
        </div>

        {/* Carousel / Card Grid with side chevron buttons */}
        <div className="relative">
          {/* Left Navigation Chevron */}
          <button
            type="button"
            onClick={handlePrev}
            className="hidden lg:flex absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white border border-[#E2E8F0] shadow-md items-center justify-center text-[#475569] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
            aria-label="Previous testimonials"
          >
            <ChevronLeft size={16} />
          </button>

          {/* 3 Testimonials Cards matching reference */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {displayList.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3.5">
                  {/* 5 Stars Rating */}
                  <Stars rating={r.rating} />

                  {/* Comment quote */}
                  <p className="text-xs text-[#334155] leading-relaxed">
                    "{r.comment}"
                  </p>
                </div>

                {/* Author & Location Footer */}
                <div className="pt-3.5 border-t border-[#F1F5F9] flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${r.avatarBg} font-extrabold text-[11px] flex items-center justify-center shrink-0`}>
                    {r.initials}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs text-[#0F172A] truncate">
                      {r.recipient_name}
                    </h4>
                    <p className="text-[10px] text-[#94A3B8] truncate">
                      {r.location}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right Navigation Chevron */}
          <button
            type="button"
            onClick={handleNext}
            className="hidden lg:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white border border-[#E2E8F0] shadow-md items-center justify-center text-[#475569] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
            aria-label="Next testimonials"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Pagination indicator dots */}
        <div className="flex items-center justify-center gap-1.5 mt-8">
          {[0, 1, 2, 3, 4].map((dot) => (
            <span
              key={dot}
              className={`w-2 h-2 rounded-full transition-all ${
                dot === activeIndex ? "bg-[#10B981] w-4" : "bg-[#E2E8F0]"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
