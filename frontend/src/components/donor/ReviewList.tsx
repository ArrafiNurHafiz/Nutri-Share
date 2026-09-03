import { motion } from "motion/react";
import { Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Props {
  reviews: any[];
}

export function ReviewList({ reviews }: Props) {
  if (reviews.length === 0) return null;

  return (
    <div>
      <h2 className="text-lg font-bold text-brand-dark mb-4 flex items-center gap-2">
        <Star className="text-accent" size={18} /> Recipient Reviews
      </h2>
      <div className="grid md:grid-cols-2 gap-3">
        {reviews.slice(0, 4).map((r: any) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-4 rounded-2xl border border-[var(--border-primary)] shadow-sm"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="font-bold text-sm text-brand-dark">
                {r.recipient_name}
              </span>
              <div className="flex text-accent">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill={i < r.rating ? "currentColor" : "none"}
                    className={
                      i < r.rating ? "" : "text-[var(--border-secondary)]"
                    }
                  />
                ))}
              </div>
            </div>
            {r.comment && (
              <p className="text-sm text-[var(--text-secondary)] italic">
                "{r.comment}"
              </p>
            )}
            <p className="text-xs text-[var(--text-tertiary)] mt-2">
              {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
