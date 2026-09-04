import { motion } from "motion/react";

interface StatItem {
  label: string;
  value: string;
  sub: string;
  pct?: number;
  color: string;
  bg: string;
  icon: string;
}

interface Props {
  stats: StatItem[];
}

export function StatsCards({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {stats.map((item, i) => (
        <motion.div
          key={i}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: i * 0.05 }}
          className="glass p-6 rounded-3xl shadow-green border border-white/50 hover:-translate-y-1 hover:shadow-orange-lg transition-all duration-300 flex items-center relative overflow-hidden group"
        >
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${item.bg}`}>
              <div
                className={`w-8 h-8 flex items-center justify-center text-lg font-bold ${item.color}`}
              >
                {item.pct ? `${Math.round(item.pct)}%` : item.value}
              </div>
            </div>
            <div>
              <div className={`text-lg font-bold ${item.color}`}>
                {item.pct ? item.value : ""}
              </div>
              <div className="text-[11px] text-[var(--text-tertiary)]">
                {item.sub}
              </div>
              <div className="text-xs text-[var(--text-muted)]">
                {item.label}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
