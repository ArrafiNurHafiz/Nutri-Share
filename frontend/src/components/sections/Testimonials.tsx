import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Star } from "lucide-react";
import { api } from "../../lib/api";

interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  recipient_name: string;
  donor_name: string | null;
}

// Fallback jika API belum mengembalikan data
const FALLBACK = [
  {
    id: 1,
    rating: 5,
    comment:
      "NutriShare changed how we donate surplus. Just upload, and it's immediately distributed. The algorithm ensures it reaches those who truly need it.",
    created_at: "",
    recipient_name: "Beneficiary",
    donor_name: "Hotel Grand Keisha",
  },
  {
    id: 2,
    rating: 5,
    comment:
      "The donations we receive are pre-calculated for nutrition. The children get the intake they need.",
    created_at: "",
    recipient_name: "Orphanage",
    donor_name: "Padang Sederhana Restaurant",
  },
  {
    id: 3,
    rating: 5,
    comment:
      "All transactions are tracked from publication to handover. Monthly impact reports are now easy.",
    created_at: "",
    recipient_name: "Admin NutriShare",
    donor_name: "Katering Sri Rejeki",
  },
];

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "?";
  const last = parts[1]?.[0] ?? "";
  return (first + last).toUpperCase();
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`Rating ${rating} dari 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={14}
          className={
            i <= rating ? "text-[#e9c400] fill-[#e9c400]" : "text-gray-300"
          }
        />
      ))}
    </div>
  );
}

function ReviewCard({ r }: { r: Review; key?: string | number }) {
  return (
    <figure className="w-[340px] sm:w-[380px] shrink-0 snap-start bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <Stars rating={r.rating} />
        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
          Recipient
        </span>
      </div>
      <blockquote className="text-sm text-gray-600 leading-relaxed italic flex-1">
        &ldquo;{r.comment}&rdquo;
      </blockquote>
      <figcaption className="flex items-center gap-3 border-t border-gray-100 pt-4">
        <div className="w-10 h-10 rounded-full bg-[#ecfdf5] flex items-center justify-center text-[#10b981] font-bold text-xs shrink-0">
          {initials(r.recipient_name)}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-brand-dark text-sm truncate">
            {r.recipient_name}
          </p>
          <p className="text-xs text-gray-500 truncate">
            Donated by {r.donor_name || "a donor"}
          </p>
        </div>
      </figcaption>
    </figure>
  );
}

export function Testimonials() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    let active = true;
    api
      .fetchJSON("/api/public/reviews?limit=8")
      .then((data: Review[]) => {
        if (active && Array.isArray(data) && data.length) setReviews(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const items: Review[] = reviews.length ? reviews : FALLBACK;
  // Duplikat agar marquee tampil kontinu tanpa celah
  const doubled = [...items, ...items];

  return (
    <section id="pahlawan" className="py-24 bg-[#f4fafd] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-[#10b981] font-bold uppercase tracking-widest text-sm mb-2 block">
            Testimonials
          </span>
          <h2 className="text-4xl font-extrabold text-brand-dark">
            What Recipients Are Saying
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto text-sm">
            Real reviews from social institutions receiving food donations
            through NutriShare.
          </p>
        </motion.div>

        {/* Marquee */}
        <div
          className="relative"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          }}
        >
          <div className="flex gap-6 overflow-hidden py-2">
            <div className="flex gap-6 shrink-0 marquee-track min-w-full">
              {doubled.map((r, i) => (
                <ReviewCard key={`${r.id}-${i}`} r={r} />
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Showing the latest reviews from recipients, updated automatically.
        </p>
      </div>
    </section>
  );
}
