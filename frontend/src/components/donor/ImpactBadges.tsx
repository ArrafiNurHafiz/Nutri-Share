import { motion } from "motion/react";
import { Flame, Leaf, Trophy, Lock } from "lucide-react";

interface Props {
  badges: any[];
}

export function ImpactBadges({ badges }: Props) {
  const defaultBadges = [
    {
      icon: Flame,
      name: "7 Day Streak",
      desc: "7 consecutive donations",
      color: "from-brand-medium to-brand-light",
    },
    {
      icon: Leaf,
      name: "Eco Champion",
      desc: "500kg waste diverted",
      color: "from-brand-medium to-brand-accent",
    },
    {
      icon: Trophy,
      name: "Top Donor",
      desc: "Highest contribution",
      color: "from-accent to-accent-light",
    },
  ];

  const items =
    badges.length > 0
      ? badges.slice(0, 4).map((b: any) => ({
          icon: b.icon ? (typeof b.icon === "string" ? Flame : b.icon) : Flame,
          name: b.name,
          desc: b.desc || "",
          color: "from-brand-medium to-brand-light",
        }))
      : defaultBadges;

  return (
    <div className="bg-white rounded-2xl border border-[var(--border-primary)] p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-bold text-brand-dark">Impact Badges</h4>
        <span
          className="material-symbols-outlined text-accent"
          style={{ fontSize: 20 }}
        >
          workspace_premium
        </span>
      </div>
      <div className="flex flex-wrap gap-3">
        {items.map((badge, i) => {
          const Icon = badge.icon;
          return (
            <div key={i} className="group relative">
              <div
                className={`w-16 h-16 rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center shadow-lg border-4 border-white`}
              >
                <Icon size={24} className="text-white" />
              </div>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-brand-dark text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                {badge.name}: {badge.desc}
              </div>
            </div>
          );
        })}
        {badges.length < 3 && (
          <div className="w-16 h-16 rounded-full bg-[var(--bg-tertiary)] border-2 border-dashed border-[var(--border-secondary)] flex items-center justify-center opacity-50">
            <Lock size={20} className="text-[var(--text-tertiary)]" />
          </div>
        )}
      </div>
      <div className="mt-4 p-4 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)]">
        <p className="text-[10px] text-[var(--text-tertiary)] uppercase font-bold mb-1">
          Next Milestone
        </p>
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-bold text-brand-dark">1000kg Club</span>
          <span className="text-xs font-mono text-[var(--text-tertiary)]">
            854/1000
          </span>
        </div>
        <div className="w-full bg-white h-1.5 rounded-full">
          <div
            className="bg-brand-medium h-full rounded-full"
            style={{ width: "85%" }}
          />
        </div>
      </div>
    </div>
  );
}
