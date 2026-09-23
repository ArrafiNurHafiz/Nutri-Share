import { UploadCloud, Cpu, Award, Truck, GitBranch, Zap } from "lucide-react";

const STEPS = [
  {
    num: "01",
    title: "Surplus Food Input",
    icon: UploadCloud,
    desc: "Hotels, restaurants, and catering vendors upload portion quantities, consumption deadlines, and nutrient parameters.",
  },
  {
    num: "02",
    title: "Entropy-TOPSIS Computing",
    icon: Cpu,
    desc: "The engine computes objective Shannon Entropy weights and Euclidean distances to positive (D+) and negative (D-) ideal solutions.",
  },
  {
    num: "03",
    title: "Objective Priority Allocation",
    icon: Award,
    desc: "Orphanages and shelters with the highest relative closeness score (Ci) automatically receive top distribution priority.",
  },
  {
    num: "04",
    title: "Hygienic Verified Delivery",
    icon: Truck,
    desc: "Logistics fleet picks up and delivers food with timestamped geotag validation and electronic proof-of-delivery.",
  },
];

const CRITERIA = [
  { code: "C1", name: "Nutritional Need & Calorie Deficit", type: "Benefit", weight: "28.4%", desc: "Proportion of children, elderly & baseline nutrition status" },
  { code: "C2", name: "Urgency & Safe Expiry Limit", type: "Cost", weight: "24.5%", desc: "Remaining safe hours before food expiration" },
  { code: "C3", name: "Storage & Chiller Capacity", type: "Benefit", weight: "18.2%", desc: "Hygienic cold chain & refrigerator infrastructure" },
  { code: "C4", name: "Distance & Travel Time (km)", type: "Cost", weight: "15.6%", desc: "Radius distance from donor kitchen to shelter" },
  { code: "C5", name: "Monthly Distribution History", type: "Cost", weight: "13.3%", desc: "Prevents donation monopoly and ensures fair equity" },
];

export function ProcessSection() {
  return (
    <section id="protocol" className="relative py-20 sm:py-28 bg-[#f4fbf7] bg-emerald-grid border-b border-emerald-200/80 overflow-hidden">
      {/* Visual Ambient Glows */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-emerald-300/15 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-teal-300/15 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-emerald-200 shadow-xs text-emerald-800 text-xs font-bold">
            <GitBranch size={14} className="text-emerald-600" />
            <span>Operational Workflow &amp; TOPSIS Algorithm</span>
          </div>
          <h2 className="font-heading font-extrabold text-3xl sm:text-5xl text-emerald-950 tracking-tight">
            How NutriShare Works
          </h2>
          <p className="text-sm sm:text-base text-emerald-900/80 leading-relaxed max-w-2xl mx-auto">
            End-to-end integration combining Shannon Entropy objective weighting with TOPSIS multi-criteria optimization for bias-free distribution.
          </p>
        </div>

        {/* 4 Steps Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {STEPS.map((step) => (
            <div
              key={step.num}
              className="p-7 rounded-3xl bg-white border border-emerald-200/80 flex flex-col justify-between hover:border-emerald-400 hover:shadow-lg transition-all duration-300 shadow-xs group"
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                    <step.icon size={22} />
                  </div>
                  <span className="text-sm font-extrabold text-emerald-600 font-mono px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200/60">
                    {step.num}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-heading font-bold text-lg text-emerald-950">
                    {step.title}
                  </h3>
                  <p className="text-xs text-emerald-900/70 leading-relaxed font-normal">
                    {step.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Criteria Matrix Breakdown: Rich Modern Glass Card */}
        <div className="mt-16 rounded-[2.5rem] bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 text-white p-8 sm:p-12 shadow-2xl relative overflow-hidden border border-emerald-700/50">

          {/* Subtle Grid Lines & Radial Lighting */}
          <div className="absolute inset-0 bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-400/20 blur-[90px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#e1fcad]/10 blur-[90px] rounded-full pointer-events-none" />

          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-emerald-700/60 pb-6 mb-8 gap-4">
              <div>
                <span className="inline-flex items-center gap-2 text-xs font-bold text-[#e1fcad] uppercase tracking-wider">
                  <Zap size={14} />
                  Multi-Criteria Decision Making (MCDM)
                </span>
                <h4 className="font-heading font-extrabold text-2xl sm:text-3xl text-white mt-1">
                  5 Objective Variables of the TOPSIS Matrix
                </h4>
              </div>
              <div className="px-4 py-2 rounded-full bg-emerald-950/80 border border-emerald-400/40 text-xs font-mono font-bold text-[#e1fcad] shadow-md self-start sm:self-auto backdrop-blur-md">
                Total Entropy &sum; w<sub>j</sub> = 1.000 (100%)
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {CRITERIA.map((c) => (
                <div
                  key={c.code}
                  className="p-5 rounded-2xl bg-emerald-950/70 border border-emerald-600/40 hover:border-emerald-400/80 shadow-md space-y-4 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 backdrop-blur-md group"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-[#e1fcad] border border-emerald-400/30 text-xs font-bold font-mono">
                      {c.code}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      c.type === "Benefit"
                        ? "bg-emerald-500/30 text-emerald-200 border border-emerald-400/40"
                        : "bg-amber-500/30 text-amber-200 border border-amber-400/40"
                    }`}>
                      {c.type}
                    </span>
                  </div>

                  <div>
                    <h5 className="font-bold text-sm text-white leading-snug group-hover:text-[#e1fcad] transition-colors">
                      {c.name}
                    </h5>
                    <p className="text-[11px] text-emerald-100/70 mt-1.5 leading-relaxed">
                      {c.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-emerald-800/80 flex items-center justify-between text-xs">
                    <span className="text-emerald-300/80 font-medium">Weight (w<sub>j</sub>)</span>
                    <strong className="text-[#e1fcad] font-mono text-base font-extrabold">{c.weight}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
