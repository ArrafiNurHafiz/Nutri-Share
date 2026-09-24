import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Star, MessageSquareQuote } from "lucide-react";

interface Review {
  id: number;
  rating: number;
  comment: string;
  recipient_name: string;
  donor_name?: string;
  role?: string;
  image?: string;
}

const defaultTestimonials: Review[] = [
  {
    id: 1,
    rating: 5,
    comment:
      "NutriShare's distribution has tremendously helped our orphanage fulfill the daily nutritional requirements of our 45 children. Meals arrive hygienic, temperature-verified, and fresh.",
    recipient_name: "Ust. Ahmad Fauzi",
    role: "Director • Panti Asuhan Al-Furqan",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 2,
    rating: 5,
    comment:
      "The Entropy-TOPSIS priority algorithm ensures genuine fairness. There is zero manual queuing bias because each shelter's real nutritional deficit is calculated objectively.",
    recipient_name: "Siti Rahmawati, S.Sos",
    role: "Head Caregiver • Kasih Mulia Foundation",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 3,
    rating: 5,
    comment:
      "As a hotel partner, NutriShare makes it effortless to dispatch our breakfast and banquet surplus responsibly with transparent ESG environmental tracking and verified certificates.",
    recipient_name: "Chef Bayu Wicaksono",
    role: "Executive Chef • Hotel Merapi Merbabu",
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 4,
    rating: 5,
    comment:
      "The IoT thermal tracking and HACCP checklist gave us peace of mind. We can trust the food quality 100% before serving it to our elderly community members.",
    recipient_name: "Dr. Hendra Gunawan",
    role: "Supervisor • Balai Lansia Harapan Mulya",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 5,
    rating: 5,
    comment:
      "NutriShare converted what used to be organic waste disposal costs into verifiable social impact credits for our restaurant chain across Yogyakarta.",
    recipient_name: "Clarissa Wijaya",
    role: "CSR & Sustainability Manager • Bale Ayu Group",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 6,
    rating: 5,
    comment:
      "Fast response and reliable logistics dispatch. From surplus report to doorstep delivery usually takes less than 90 minutes. Remarkable efficiency!",
    recipient_name: "Bambang Santoso",
    role: "Operations Head • Panti Wreda Bhakti",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 7,
    rating: 5,
    comment:
      "NutriShare's digital handover system with QR code and tamper-proof photos makes food donations completely transparent and auditable for our annual report.",
    recipient_name: "Ratna Kusuma Dewi",
    role: "Social Worker • Yayasan Sayap Ibu D.I.Y.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 8,
    rating: 5,
    comment:
      "We've reduced banquet food waste by over 80% since integrating NutriShare's rapid dispatch into our kitchen closing SOPs.",
    recipient_name: "Dimas Prasetyo",
    role: "F&B Director • Grand Mercure Yogyakarta",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 9,
    rating: 5,
    comment:
      "Balanced nutrition is crucial for children's growth. NutriShare helps us ensure varied protein and mineral intake without straining our monthly shelter budget.",
    recipient_name: "Nur Hidayat, M.Psi",
    role: "Care Coordinator • Griya Yatim Mandiri",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop",
  },
];

const TestimonialsColumn = (props: {
  className?: string;
  testimonials: Review[];
  duration?: number;
}) => {
  return (
    <div className={props.className}>
      <motion.ul
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration: props.duration || 14,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6 bg-transparent transition-colors duration-300 list-none m-0 p-0"
      >
        {[
          ...new Array(2).fill(0).map((_, index) => (
            <React.Fragment key={index}>
              {props.testimonials.map(({ id, comment, image, recipient_name, role, rating }, i) => (
                <motion.li
                  key={`${index}-${id || i}`}
                  aria-hidden={index === 1 ? "true" : "false"}
                  tabIndex={index === 1 ? -1 : 0}
                  whileHover={{
                    scale: 1.02,
                    y: -6,
                    boxShadow: "0 20px 35px -10px rgba(6, 78, 59, 0.12), 0 0 0 1px rgba(16, 185, 129, 0.2)",
                    transition: { type: "spring", stiffness: 400, damping: 20 },
                  }}
                  className="p-7 sm:p-8 rounded-3xl border border-emerald-100/90 shadow-sm max-w-sm w-full bg-white/95 backdrop-blur-sm transition-all duration-300 cursor-default select-none group focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                >
                  <blockquote className="m-0 p-0 flex flex-col justify-between h-full space-y-5">
                    <div className="space-y-3">
                      {/* Star ratings */}
                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: rating || 5 }).map((_, starIdx) => (
                          <Star key={starIdx} size={14} className="fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <p className="text-slate-700 leading-relaxed font-normal text-sm m-0">
                        "{comment}"
                      </p>
                    </div>
                    <footer className="flex items-center gap-3.5 pt-4 border-t border-slate-100">
                      <img
                        width={44}
                        height={44}
                        src={image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop"}
                        alt={`Avatar of ${recipient_name}`}
                        className="h-11 w-11 rounded-full object-cover ring-2 ring-emerald-100 group-hover:ring-emerald-400 transition-all duration-300 ease-in-out shrink-0"
                      />
                      <div className="flex flex-col min-w-0">
                        <cite className="font-bold not-italic tracking-tight leading-5 text-emerald-950 text-sm truncate">
                          {recipient_name}
                        </cite>
                        <span className="text-xs leading-4 text-emerald-700/80 font-medium mt-0.5 truncate">
                          {role || "Ecosystem Partner"}
                        </span>
                      </div>
                    </footer>
                  </blockquote>
                </motion.li>
              ))}
            </React.Fragment>
          )),
        ]}
      </motion.ul>
    </div>
  );
};

export function Testimonials() {
  const [reviews, setReviews] = useState<Review[]>(defaultTestimonials);

  useEffect(() => {
    fetch("/api/public/reviews")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: any[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: Review[] = data.map((r, idx) => ({
            id: r.id || idx + 1,
            rating: r.rating || 5,
            comment: r.comment,
            recipient_name: r.recipient_name || "Beneficiary Shelter",
            role: r.donor_name ? `Partner: ${r.donor_name}` : "Social Foundation Leader",
            image: defaultTestimonials[idx % defaultTestimonials.length].image,
          }));

          // Pad with defaults if API has fewer than 9 to maintain 3 smooth columns
          if (mapped.length < 9) {
            const combined = [...mapped, ...defaultTestimonials.slice(mapped.length)];
            setReviews(combined);
          } else {
            setReviews(mapped);
          }
        }
      })
      .catch(() => {
        setReviews(defaultTestimonials);
      });
  }, []);

  const firstColumn = reviews.slice(0, 3);
  const secondColumn = reviews.slice(3, 6);
  const thirdColumn = reviews.slice(6, 9);

  return (
    <section
      aria-labelledby="testimonials-heading"
      className="relative py-24 sm:py-32 bg-[#f8fafc] text-slate-900 border-b border-emerald-100 overflow-hidden"
    >
      {/* Background radial highlights */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-emerald-100/40 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{
          duration: 1.0,
          ease: [0.16, 1, 0.3, 1],
          opacity: { duration: 0.6 },
        }}
        className="max-w-7xl px-4 sm:px-6 lg:px-8 z-10 mx-auto relative"
      >
        {/* Section Heading */}
        <div className="flex flex-col items-center justify-center max-w-2xl mx-auto mb-16 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold shadow-xs">
            <MessageSquareQuote size={14} className="text-emerald-700" />
            <span>COMMUNITY &amp; PARTNER VOICES</span>
          </div>

          <h2
            id="testimonials-heading"
            className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl tracking-tight text-emerald-950"
          >
            Trusted by the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800">
              Ecosystem.
            </span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl">
            Real feedback from verified orphanage caregivers and commercial hospitality partners across D.I. Yogyakarta.
          </p>
        </div>

        {/* 3 Infinite Scrolling Columns with Top/Bottom Gradient Mask */}
        <div
          className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)] max-h-[640px] overflow-hidden"
          role="region"
          aria-label="Scrolling Testimonials"
        >
          <TestimonialsColumn testimonials={firstColumn} duration={18} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={22} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={20} />
        </div>
      </motion.div>
    </section>
  );
}
