import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { FileText, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Props {
  completedHistory: any[];
  onRate: (donation: any) => void;
}

export function HistorySection({ completedHistory, onRate }: Props) {
  if (completedHistory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-[var(--text-tertiary)]">
        <FileText size={40} className="mb-3 opacity-50" />
        <p className="text-sm">No History Yet</p>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Completed donations will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {completedHistory.map((d: any, i: number) => (
        <motion.div
          key={d.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
          className="bg-white rounded-2xl p-5 border border-[var(--border-primary)] shadow-sm flex justify-between items-start"
        >
          <div>
            <h3 className="font-bold text-brand-dark">{d.food_name}</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              From: {d.donor_name}
            </p>
            {d.completed_at && (
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                {formatDistanceToNow(new Date(d.completed_at), {
                  addSuffix: true,
                })}
              </p>
            )}
          </div>
          {d.has_reviewed ? (
            <span className="bg-brand-medium/10 text-brand-medium text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shrink-0">
              <Star size={12} fill="currentColor" /> Rated
            </span>
          ) : (
            <button
              onClick={() => onRate(d)}
              className="bg-white border-2 border-primary-orange text-primary-orange px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-primary-orange-bg transition-all shrink-0"
            >
              Rate
            </button>
          )}
        </motion.div>
      ))}
    </div>
  );
}
