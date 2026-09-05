import { motion } from "motion/react";
import { Flame, Dumbbell, ShieldCheck, Sparkles } from "lucide-react";

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
  const getIcon = (label: string) => {
    switch (label.toLowerCase()) {
      case "calorie intake":
        return <Flame size={18} className="text-primary-orange" />;
      case "protein":
        return <Dumbbell size={18} className="text-emerald-600" />;
      case "donations received":
        return <ShieldCheck size={18} className="text-amber-500" />;
      default:
        return <Sparkles size={18} className="text-brand-accent" />;
    }
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((item, i) => (
        <motion.div
          key={i}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: i * 0.04 }}
          className="bg-white rounded-2xl p-5 border border-[var(--border-primary)] shadow-sm hover:border-brand-medium/40 hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              {item.label}
            </span>
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 group-hover:scale-105 transition-transform">
              {getIcon(item.label)}
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-brand-dark tracking-tight">
                {item.value}
              </span>
              <span className="text-xs text-[var(--text-tertiary)] font-medium">
                {item.sub}
              </span>
            </div>

            {item.pct !== undefined && (
              <div className="mt-3">
                <div className="flex justify-between text-[10px] font-bold mb-1">
                  <span className="text-[var(--text-tertiary)]">
                    Daily Goal
                  </span>
                  <span className="text-emerald-700">
                    {Math.round(item.pct)}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(item.pct, 100)}%` }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="h-full bg-emerald-500 rounded-full"
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
