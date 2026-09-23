import { Leaf, ShieldCheck, Zap, HeartHandshake, Utensils, CheckCircle2 } from "lucide-react";

export function MarqueeBanner() {
  const items = [
    { text: "Integrated Food Waste Prevention Protocol", icon: Leaf },
    { text: "Shannon Entropy - TOPSIS Objective Allocation", icon: Zap },
    { text: "BPOM & HACCP Food Hygiene Compliance", icon: ShieldCheck },
    { text: "2.4 Tons CO₂e Greenhouse Gas Emissions Avoided", icon: CheckCircle2 },
    { text: "Hospitality & Restaurant Network in Yogyakarta", icon: Utensils },
    { text: "100% Transparent Public Distribution Ledger", icon: HeartHandshake },
  ];

  return (
    <div className="relative w-full overflow-hidden bg-emerald-900 text-emerald-100 py-3.5 border-y border-emerald-800 select-none">
      <div className="animate-marquee flex items-center gap-10 whitespace-nowrap">
        {[...items, ...items, ...items].map((item, idx) => (
          <div key={idx} className="flex items-center gap-2.5 text-xs font-semibold tracking-wide text-emerald-100">
            <item.icon size={14} className="text-[#e1fcad] shrink-0" />
            <span>{item.text}</span>
            <span className="text-emerald-500 font-normal ml-3">&bull;</span>
          </div>
        ))}
      </div>
    </div>
  );
}
