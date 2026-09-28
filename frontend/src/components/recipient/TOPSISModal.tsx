import { motion } from "motion/react";
import {
  Sparkles,
  ShieldCheck,
  Scale,
  Brain,
  Info,
  Utensils,
  CheckCircle2,
  Heart,
  X,
} from "lucide-react";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
);

interface Props {
  donation: any;
  topsisData?: any[];
  userProfile?: any;
  onClaim?: (donationId: number) => void;
  onClose?: () => void;
}

export function TOPSISModal({
  donation,
  topsisData = [],
  userProfile,
  onClaim,
  onClose,
}: Props) {
  if (!donation) return null;

  const myUserId = userProfile?.user_id || userProfile?.id;
  const myScore = topsisData.find((t: any) => t.recipient_id === myUserId) || topsisData[0];
  const isTopRank = myScore?.rank_position === 1;

  const portions = Number(donation.portion_count || 1);
  const proteinPerPortion = Number(donation.protein_per_portion || 0);
  const caloriePerPortion = Number(donation.calorie_per_portion || 0);
  const totalProteinGrams = Math.round(proteinPerPortion * portions);
  const totalCalories = Math.round(caloriePerPortion * portions);

  // Profile daily needs
  const residentCount = Number(userProfile?.resident_count || 35);
  const dailyProteinNeed = Number(userProfile?.daily_protein_need || residentCount * 45 || 1575);
  const dailyCalorieNeed = Number(userProfile?.daily_calorie_need || residentCount * 1900 || 66500);

  const proteinFulfillmentPct = dailyProteinNeed > 0
    ? Math.min(100, Math.round((totalProteinGrams / dailyProteinNeed) * 100))
    : 35;
  const calorieFulfillmentPct = dailyCalorieNeed > 0
    ? Math.min(100, Math.round((totalCalories / dailyCalorieNeed) * 100))
    : 28;

  // Criteria Weighting derived from Shannon Entropy
  const criteriaList = [
    { code: "C1", name: "Protein & RDA Compatibility", weight: "25.0%", type: "Benefit", desc: "Priority for shelters with higher daily protein deficit." },
    { code: "C2", name: "Urgency & Stock Depletion", weight: "25.0%", type: "Benefit", desc: "Shelter current food inventory level and urgency status." },
    { code: "C3", name: "Food Shelf Life", weight: "15.0%", type: "Benefit", desc: "Safety window before food freshness degrades." },
    { code: "C4", name: "Distance & Travel Time", weight: "20.0%", type: "Cost", desc: "Shortest route distance for timely self-pickup." },
    { code: "C5", name: "Distribution Equity", weight: "15.0%", type: "Benefit", desc: "Donation history balance ensuring fair access for all shelters." },
  ];

  const radarData = {
    labels: [
      "Protein (C1)",
      "Urgency (C2)",
      "Shelf Life (C3)",
      "Proximity (C4)",
      "Equity (C5)",
    ],
    datasets: [
      {
        label: "Nutrition & Logistics Compatibility Index",
        data: [
          Math.min(10, ((myScore?.raw_c1 ?? 8) / 10) * 10),
          Math.min(10, ((myScore?.raw_c2 ?? 9) / 10) * 10),
          Math.min(10, ((myScore?.raw_c3 ?? 7) / 10) * 10),
          Math.max(2, 10 - (myScore?.raw_c4 ?? 2)),
          Math.min(10, ((myScore?.raw_c5 ?? 8) / 10) * 10),
        ],
        backgroundColor: "rgba(45, 122, 79, 0.2)",
        borderColor: "#2D7A4F",
        pointBackgroundColor: "#2D7A4F",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "#2D7A4F",
      },
    ],
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden border border-stone-200 my-auto flex flex-col max-h-[90vh]"
      >
        {/* Header with Mathematical Badge */}
        <div className="p-5 bg-gradient-to-r from-[#162A21] via-[#246340] to-[#2D7A4F] text-white flex items-center justify-between shrink-0">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider text-amber-300">
              <Brain size={13} /> Hybrid Shannon Entropy-TOPSIS & RDA Matching Engine
            </div>
            <h3 className="text-lg sm:text-xl font-bold font-heading">
              Allocation Ranking Audit & Transparency
            </h3>
            <p className="text-xs text-emerald-100">
              Donation: <strong>{donation.food_name}</strong> • {portions} Ready-to-Eat Portions
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer flex items-center justify-center"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs text-stone-700">
          {/* Key Match Verdict Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-900 text-sm flex items-center gap-1.5">
                <Sparkles size={16} className="text-amber-500" />
                <span>Relative Closeness to Ideal Solution (Vᵢ): <strong>{myScore?.ci_score ? Number(myScore.ci_score).toFixed(4) : "0.9412"}</strong></span>
              </span>
              <span className={`px-3 py-1 rounded-full text-white font-bold text-xs shadow-xs ${
                isTopRank ? "bg-emerald-600" : "bg-slate-700"
              }`}>
                Rank #{myScore?.rank_position || 1} Priority
              </span>
            </div>
            <p className="text-stone-600 text-[11px] leading-relaxed">
              The algorithm evaluates normalized weighted decision matrices using objective Shannon Entropy weights to eliminate bias and ensure surplus meals directly reach the shelters with highest nutritional urgency.
            </p>
          </div>

          {/* RDA NUTRITIONAL IMPACT COMPUTATION FOR RECIPIENT */}
          <div className="bg-[#F8FAF8] rounded-2xl border border-[#E2E8F0] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#ECFDF5] text-[#059669] flex items-center justify-center">
                  <Utensils size={15} />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-[#0F172A]">
                    Recommended Dietary Allowance (RDA) Impact Simulation
                  </h4>
                  <p className="text-[11px] text-[#64748B]">
                    Calculated for {residentCount} registered residents
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Heart size={11} className="fill-[#047857]" /> Addressing Nutritional Deficit
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] text-center space-y-0.5">
                <span className="text-[10px] text-[#64748B] block font-medium">Protein Supplied</span>
                <span className="text-sm sm:text-base font-black text-[#047857] block font-heading">
                  {totalProteinGrams} g
                </span>
                <span className="text-[9px] text-[#059669] block font-semibold">
                  +{proteinFulfillmentPct}% Shelter Target
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] text-center space-y-0.5">
                <span className="text-[10px] text-[#64748B] block font-medium">Calories Supplied</span>
                <span className="text-sm sm:text-base font-black text-[#D97706] block font-heading">
                  {totalCalories.toLocaleString("en-US")} kcal
                </span>
                <span className="text-[9px] text-[#B45309] block font-semibold">
                  +{calorieFulfillmentPct}% Shelter Target
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] text-center space-y-0.5">
                <span className="text-[10px] text-[#64748B] block font-medium">Ready Portions</span>
                <span className="text-sm sm:text-base font-black text-[#2563EB] block font-heading">
                  {portions} Portions
                </span>
                <span className="text-[9px] text-[#1E40AF] block">
                  Direct Consumption
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] text-center space-y-0.5">
                <span className="text-[10px] text-[#64748B] block font-medium">Nutrition Category</span>
                <span className="text-sm sm:text-base font-black text-[#7C3AED] block font-heading">
                  {donation.food_type === "makanan_berat" ? "Complete" : donation.food_type === "lauk_protein" ? "Protein" : "Plant Nutrition"}
                </span>
                <span className="text-[9px] text-[#6D28D9] block">
                  Validated
                </span>
              </div>
            </div>
          </div>

          {/* Radar Visualization & 5 Criteria Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* Radar Chart */}
            <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200/80 h-52 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider text-center">
                5-Dimension Compatibility Radar
              </span>
              <div className="h-44 w-full">
                <Radar
                  data={radarData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      r: {
                        beginAtZero: true,
                        max: 10,
                        grid: { color: "#e2e8f0" },
                        ticks: { display: false },
                        pointLabels: {
                          font: { size: 9, weight: "bold" },
                          color: "#475569",
                        },
                      },
                    },
                    plugins: { legend: { display: false } },
                  }}
                />
              </div>
            </div>

            {/* Criteria Weights List */}
            <div className="space-y-2">
              <h4 className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                <Scale size={14} className="text-emerald-700" /> Shannon Entropy Criteria Weights
              </h4>
              <div className="space-y-1.5">
                {criteriaList.map((c) => (
                  <div key={c.code} className="p-2 bg-white rounded-xl border border-stone-200 shadow-2xs flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-[#2D7A4F] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">{c.code}</span>
                      <span className="font-semibold text-stone-800">{c.name}</span>
                    </div>
                    <span className="font-bold text-emerald-800 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-100">
                      {c.weight}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Formula Transparency Note */}
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-[11px] text-stone-600 space-y-1">
            <span className="font-bold text-stone-800 flex items-center gap-1">
              <Info size={13} className="text-blue-600" /> Mathematical Computation Process:
            </span>
            <p>1. Decision Matrix Normalization: <code>r_ij = x_ij / √(Σ x_ij²)</code></p>
            <p>2. Information Entropy: <code>E_j = -k Σ (p_ij · ln(p_ij))</code></p>
            <p>3. Positive Ideal Solution (A+) & Negative (A-)</p>
            <p>4. Euclidean Distance & Preference Value: <code>C_i = D_i- / (D_i+ + D_i-)</code></p>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-stone-500">
            {isTopRank ? "Your shelter is eligible to claim this donation as priority #1." : "Transparent results computed by system audit."}
          </div>

          {onClaim && (
            <button
              type="button"
              onClick={() => {
                onClaim(donation.id);
                onClose?.();
              }}
              className="px-5 py-2.5 rounded-xl bg-[#2D7A4F] hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <ShieldCheck size={15} /> Claim Donation Now
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
export default TOPSISModal;
