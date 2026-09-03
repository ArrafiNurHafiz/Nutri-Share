import { motion } from "motion/react";
import { Package, TrendingUp, Star, HeartHandshake } from "lucide-react";

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
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6">
      {stats.map((item, i) => (
        <motion.div
          key={i}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: i * 0.05 }}
          className="bg-white p-5 rounded-2xl shadow-sm border border-[var(--border-primary)]"
        >
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${item.bg}`}>
              <item.icon size={20} className={item.color} />
            </div>
            <div>
              <div className={`text-xl font-bold ${item.color}`}>
                {item.value}
              </div>
              <div className="text-xs text-[var(--text-tertiary)]">
                {item.label}
              </div>
              {item.sub && (
                <div className="text-[10px] text-[var(--text-muted)]">
                  {item.sub}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
