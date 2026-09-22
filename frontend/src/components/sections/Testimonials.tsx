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

  const items: Review[] = reviews;
  const doubled = items.length > 0 ? [...items, ...items] : [];

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

        {items.length > 0 ? (
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
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 max-w-lg mx-auto shadow-xs">
            <p className="text-sm font-semibold text-gray-700">Belum ada ulasan publik</p>
            <p className="text-xs text-gray-500 mt-1">
              Ulasan nyata dari lembaga penerima manfaat akan ditampilkan di sini setelah donasi berhasil disalurkan.
            </p>
          </div>
        )}

        {items.length > 0 && (
          <p className="text-center text-xs text-gray-400 mt-6">
            Showing the latest reviews from recipients, updated automatically.
          </p>
        )}
      </div>
    </section>
  );
}
