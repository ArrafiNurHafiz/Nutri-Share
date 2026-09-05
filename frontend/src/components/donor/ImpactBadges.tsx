import { motion } from "motion/react";
import {
  Flame,
  Leaf,
  Trophy,
  Award,
  Sparkles,
  Zap,
  Target,
} from "lucide-react";

interface Props {
  badges: any[];
}

const BADGE_PRESETS: Record<
  string,
  {
    icon: any;
    bg: string;
    border: string;
    text: string;
    badgeStyle: string;
  }
> = {
  streak: {
    icon: Flame,
    bg: "from-amber-500/15 to-orange-500/10",
    border: "border-amber-400/40",
    text: "text-amber-600",
    badgeStyle: "bg-amber-100 text-amber-800",
  },
  eco: {
    icon: Leaf,
    bg: "from-emerald-500/15 to-teal-500/10",
    border: "border-emerald-400/40",
    text: "text-emerald-600",
    badgeStyle: "bg-emerald-100 text-emerald-800",
  },
  hero: {
    icon: Trophy,
    bg: "from-indigo-500/15 to-purple-500/10",
    border: "border-indigo-400/40",
    text: "text-indigo-600",
    badgeStyle: "bg-indigo-100 text-indigo-800",
  },
  default: {
    icon: Zap,
    bg: "from-primary-orange/15 to-amber-500/10",
    border: "border-primary-orange/30",
    text: "text-primary-orange",
    badgeStyle: "bg-orange-100 text-orange-800",
  },
};

export function ImpactBadges({ badges }: Props) {
  const defaultBadges = [
    {
      name: "7-Day Streak",
      desc: "7 consecutive food rescue contributions",
      tier: "streak",
      level: "Lv. 2",
    },
    {
      name: "Eco Champion",
      desc: "500kg edible food diverted from waste",
      tier: "eco",
      level: "Lv. 3",
    },
    {
      name: "Community Hero",
      desc: "Top 5% active donor this month",
      tier: "hero",
      level: "Elite",
    },
  ];

  const items =
    badges && badges.length > 0
      ? badges.map((b: any, idx: number) => {
          const nameLower = (b.name || "").toLowerCase();
          const tier = nameLower.includes("streak")
            ? "streak"
            : nameLower.includes("eco") || nameLower.includes("green")
              ? "eco"
              : nameLower.includes("hero") || nameLower.includes("top")
                ? "hero"
                : "default";
          return {
            name: b.name || `Impact Achievement #${idx + 1}`,
            desc: b.desc || "Recognized for consistent food donations",
            tier,
            level: `Lv. ${idx + 1}`,
          };
        })
      : defaultBadges;

  return (
    <div className="bg-white rounded-2xl border border-[var(--border-primary)] shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border-primary)] bg-gradient-to-r from-surface-container-low to-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60">
            <Award size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-brand-dark">
              Impact & Achievements
            </h3>
            <p className="text-[11px] text-[var(--text-tertiary)]">
              {items.length} unlocked badges
            </p>
          </div>
        </div>
        <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-full">
          <Sparkles size={12} className="text-amber-500" /> Pro Donor
        </span>
      </div>

      <div className="p-4 space-y-3">
        {/* Badges List */}
        <div className="space-y-2.5">
          {items.map((b, i) => {
            const config = BADGE_PRESETS[b.tier] || BADGE_PRESETS.default;
            const Icon = config.icon;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`p-3 rounded-xl border ${config.border} bg-gradient-to-r ${config.bg} flex items-center justify-between gap-3 hover:scale-[1.01] transition-transform`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center ${config.text} shrink-0 border border-white`}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-brand-dark truncate flex items-center gap-1.5">
                      {b.name}
                    </h4>
                    <p className="text-[11px] text-[var(--text-secondary)] truncate">
                      {b.desc}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${config.badgeStyle} shrink-0 uppercase tracking-wider`}
                >
                  {b.level}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Milestone Progress Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Target size={13} className="text-emerald-600" />
              <span className="text-[11px] font-bold text-slate-700">
                Next Tier: 1,000 Portions Rescued
              </span>
            </div>
            <span className="text-[11px] font-extrabold text-emerald-700">
              85%
            </span>
          </div>

          <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "85%" }}
              transition={{ duration: 1 }}
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full"
            />
          </div>
          <div className="flex justify-between text-[10px] text-[var(--text-tertiary)] mt-1.5 font-medium">
            <span>Current: 854 portions</span>
            <span>Goal: 1,000 portions</span>
          </div>
        </div>
      </div>
    </div>
  );
}
