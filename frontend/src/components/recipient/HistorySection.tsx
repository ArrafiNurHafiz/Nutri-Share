import { motion } from "motion/react";
import { FileText, Star, Clock, UserCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Props {
  completedHistory: any[];
  onRate: (donation: any) => void;
}

export function HistorySection({ completedHistory, onRate }: Props) {
  if (completedHistory.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[var(--border-primary)] p-8 text-center flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[var(--text-tertiary)] mb-3">
          <FileText size={24} />
        </div>
        <p className="text-sm font-bold text-brand-dark">No Claim History</p>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          Completed food donations and distributions will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {completedHistory.map((d: any, i: number) => (
        <motion.div
          key={d.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
          className="bg-white rounded-2xl p-4 border border-[var(--border-primary)] shadow-sm hover:border-brand-medium/40 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 uppercase tracking-wider">
                Completed
              </span>
              {d.completed_at && (
                <span className="text-[11px] text-[var(--text-tertiary)] flex items-center gap-1">
                  <Clock size={11} />
                  {formatDistanceToNow(new Date(d.completed_at), {
                    addSuffix: true,
                  })}
                </span>
              )}
            </div>

            <h3 className="font-bold text-sm text-brand-dark line-clamp-1">
              {d.food_name}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1 mt-1">
              <UserCheck size={12} className="text-slate-400" />
              <span>{d.donor_name}</span>
            </p>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-brand-dark">
              {d.protein ? `${d.protein}g Protein` : `Donation #${d.id}`}
            </span>

            {d.has_reviewed ? (
              <span className="bg-amber-50 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                <Star size={12} className="fill-amber-500 text-amber-500" />{" "}
                Rated
              </span>
            ) : (
              <button
                onClick={() => onRate(d)}
                className="bg-white border border-primary-orange text-primary-orange hover:bg-primary-orange-bg px-3 py-1 rounded-lg text-xs font-bold transition-all active:scale-95 shadow-sm"
              >
                Rate Donor
              </button>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
