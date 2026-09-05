import { motion } from "motion/react";
import { Package, TrendingUp, Star, Activity, Sparkles } from "lucide-react";

interface Stat {
  label: string;
  value: string | number;
  icon: any;
  color: string;
  bg: string;
  sub?: string;
}
interface Props {
  stats: Stat[];
}

export function DonorStats({ stats }: Props) {
  const getIcon = (label: string) => {
    switch (label.toLowerCase()) {
      case "total donations":
        return <Package size={18} className="text-primary-orange" />;
      case "total portions":
        return <TrendingUp size={18} className="text-emerald-600" />;
      case "rating":
        return <Star size={18} className="text-amber-500 fill-amber-500" />;
      case "active":
        return <Activity size={18} className="text-brand-accent" />;
      default:
        return <Sparkles size={18} className="text-brand-medium" />;
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
              {item.sub && (
                <span className="text-xs text-[var(--text-tertiary)] font-medium">
                  {item.sub}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
