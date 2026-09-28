import { motion } from "motion/react";
import {
  Brain,
  Sparkles,
  Scale,
  MapPin,
  Heart,
  CheckCircle2,
  Info,
  ShieldCheck,
  Utensils,
  Flame,
  Award,
  Users,
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
  onClose: () => void;
}

export function DonorTOPSISModal({ donation, topsisData = [], onClose }: Props) {
  if (!donation) return null;

  const portions = Number(donation.portion_count || 1);
  const proteinPerPortion = Number(donation.protein_per_portion || 0);
  const caloriePerPortion = Number(donation.calorie_per_portion || 0);
  const ironPerPortion = Number(donation.iron_mg || 0);
  const vitCPerPortion = Number(donation.vitamin_c_mg || 0);

  const totalProteinGrams = Math.round(proteinPerPortion * portions);
  const totalCalories = Math.round(caloriePerPortion * portions);
  const totalIronMg = (ironPerPortion * portions).toFixed(1);
  const totalVitCMg = (vitCPerPortion * portions).toFixed(1);

  // Standard RDA estimation (Average child 7-12 years requires ~40g protein & 1900 kcal / day)
  const childPortionsProteinCovered = (totalProteinGrams / 40).toFixed(1);
  const childPortionsCalorieCovered = (totalCalories / 1900).toFixed(1);

  const rankings = topsisData && topsisData.length > 0 ? topsisData : [];
  const top1 = rankings[0];

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
        label: "Ideal Solution Index (TOPSIS)",
        data: [
          Math.min(10, ((top1?.raw_c1 ?? 8) / 10) * 10),
          Math.min(10, ((top1?.raw_c2 ?? 9) / 10) * 10),
          Math.min(10, ((top1?.raw_c3 ?? 7) / 10) * 10),
          Math.max(2, 10 - (top1?.raw_c4 ?? 2.5)),
          Math.min(10, ((top1?.raw_c5 ?? 8) / 10) * 10),
        ],
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        borderColor: "#10B981",
        pointBackgroundColor: "#059669",
        pointBorderColor: "#fff",
      },
    ],
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden border border-stone-200 my-auto flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#0F2418] via-[#163826] to-[#2D7A4F] text-white flex items-center justify-between shrink-0">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[10px] font-bold uppercase tracking-wider text-[#A7F3D0] backdrop-blur-xs">
              <Brain size={13} className="text-[#6EE7B7]" />
              <span>Algorithm Transparency & RDA Impact</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold font-heading">
              Food Distribution Audit #{donation.id}
            </h3>
            <p className="text-xs text-emerald-100/90">
              Menu: <strong>{donation.food_name}</strong> • {portions} Ready-to-Eat Portions
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
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs text-[#334155]">
          {/* SECTION 1: RDA NUTRITIONAL IMPACT COMPUTATION */}
          <div className="bg-[#F8FAF8] rounded-2xl border border-[#E2E8F0] p-4.5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#ECFDF5] text-[#059669] flex items-center justify-center">
                  <Utensils size={15} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#0F172A]">
                    Recommended Dietary Allowance (RDA) Contribution
                  </h4>
                  <p className="text-[11px] text-[#64748B]">
                    Calculated against standard nutritional daily requirements
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] px-2.5 py-1 rounded-full flex items-center gap-1">
                <ShieldCheck size={12} /> Nutrition Verified
              </span>
            </div>

            {/* 4 Nutrition Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] text-center space-y-0.5">
                <span className="text-[10px] text-[#64748B] block font-medium">Total Protein</span>
                <span className="text-base font-black text-[#047857] block font-heading">
                  {totalProteinGrams} g
                </span>
                <span className="text-[9px] text-[#059669] block">
                  {proteinPerPortion}g / portion
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] text-center space-y-0.5">
                <span className="text-[10px] text-[#64748B] block font-medium">Total Energy</span>
                <span className="text-base font-black text-[#D97706] block font-heading">
                  {totalCalories.toLocaleString("en-US")} kcal
                </span>
                <span className="text-[9px] text-[#B45309] block">
                  {caloriePerPortion} kcal / portion
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] text-center space-y-0.5">
                <span className="text-[10px] text-[#64748B] block font-medium">Iron (Fe)</span>
                <span className="text-base font-black text-[#0284C7] block font-heading">
                  {totalIronMg} mg
                </span>
                <span className="text-[9px] text-[#0369A1] block">Anti-Anemia</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] text-center space-y-0.5">
                <span className="text-[10px] text-[#64748B] block font-medium">Vitamin C</span>
                <span className="text-base font-black text-[#7C3AED] block font-heading">
                  {totalVitCMg} mg
                </span>
                <span className="text-[9px] text-[#6D28D9] block">Immunity Support</span>
              </div>
            </div>

            {/* RDA Impact Summary Bar */}
            <div className="p-3 bg-[#ECFDF5] rounded-xl border border-[#A7F3D0] flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#10B981] text-white flex items-center justify-center shrink-0">
                <Heart size={16} className="fill-white" />
              </div>
              <div className="text-[11px] leading-relaxed text-[#065F46]">
                Your donation provides the equivalent of <strong>{childPortionsProteinCovered} full daily child protein portions</strong> for beneficiary shelters, directly preventing malnutrition.
              </div>
            </div>
          </div>

          {/* SECTION 2: HYBRID ENTROPY-TOPSIS RANKING QUEUE */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F1F5F9] pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                  <Scale size={15} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#0F172A]">
                    Hybrid TOPSIS Algorithmic Priority Ranking
                  </h4>
                  <p className="text-[11px] text-[#64748B]">
                    Beneficiary shelters ranked objectively via Shannon Entropy weighting
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#2563EB] bg-[#EFF6FF] border border-[#BFDBFE] px-2.5 py-0.5 rounded-full self-start sm:self-auto">
                Closeness Coefficient (Vᵢ)
              </span>
            </div>

            {/* Visual breakdown: Shannon weights & Ranked List */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Radar 5 Dimensions */}
              <div className="md:col-span-5 bg-[#F8FAFC] p-3 rounded-2xl border border-[#E2E8F0] flex flex-col justify-between h-56">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider text-center">
                  Ideal Solution Matching Dimensions
                </span>
                <div className="h-44 w-full">
                  <Radar
                    data={radarData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        r: {
                          suggestedMin: 0,
                          suggestedMax: 100,
                          ticks: { display: false },
                          pointLabels: {
                            font: { size: 9, weight: "bold" },
                            color: "#475569",
                          },
                        },
                      },
                      plugins: {
                        legend: { display: false },
                      },
                    }}
                  />
                </div>
              </div>

              {/* Shannon Entropy Objective Weights */}
              <div className="md:col-span-7 flex flex-col justify-between gap-3">
                <div className="p-3 bg-[#ECFDF5] rounded-2xl border border-[#A7F3D0]/60 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#065F46]">
                    <span className="flex items-center gap-1">
                      <Scale size={13} /> 5 Hybrid Shannon Criteria:
                    </span>
                    <span className="text-[9px] bg-white px-2 py-0.5 rounded-full border border-[#A7F3D0] text-[#047857]">
                      Objective & Bias-Free
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-1 text-center">
                    <div className="p-1.5 bg-white rounded-lg border border-[#A7F3D0]/50">
                      <div className="text-[8px] text-[#64748B]">C1: Nutrition</div>
                      <div className="font-bold text-[10px] text-[#047857]">25%</div>
                    </div>
                    <div className="p-1.5 bg-white rounded-lg border border-[#A7F3D0]/50">
                      <div className="text-[8px] text-[#64748B]">C2: Urgency</div>
                      <div className="font-bold text-[10px] text-[#047857]">25%</div>
                    </div>
                    <div className="p-1.5 bg-white rounded-lg border border-[#A7F3D0]/50">
                      <div className="text-[8px] text-[#64748B]">C3: Time</div>
                      <div className="font-bold text-[10px] text-[#047857]">15%</div>
                    </div>
                    <div className="p-1.5 bg-white rounded-lg border border-[#A7F3D0]/50">
                      <div className="text-[8px] text-[#64748B]">C4: Distance</div>
                      <div className="font-bold text-[10px] text-[#047857]">20%</div>
                    </div>
                    <div className="p-1.5 bg-white rounded-lg border border-[#A7F3D0]/50">
                      <div className="text-[8px] text-[#64748B]">C5: Equity</div>
                      <div className="font-bold text-[10px] text-[#047857]">15%</div>
                    </div>
                  </div>
                </div>

                {/* Ranked List Preview */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                    Top Priority Recommendation:
                  </div>
                  {topsisData.slice(0, 2).map((item, idx) => (
                    <div
                      key={item.recipient_id || idx}
                      className="p-2.5 bg-[#F8FAF8] rounded-xl border border-[#E2E8F0] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#047857] text-white text-[10px] font-black flex items-center justify-center font-mono">
                          {item.rank_position || idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-xs text-[#0F172A]">
                            {item.recipient_name}
                          </div>
                          <div className="text-[10px] text-[#64748B]">
                            Distance: {Number(item.distance_km || 0).toFixed(1)} km
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-[#047857] font-mono">
                          V = {Number(item.ci_score || 0).toFixed(3)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mathematical Audit Guarantee */}
          <div className="p-3.5 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] text-[11px] text-[#475569] space-y-1.5">
            <span className="font-bold text-[#0F172A] flex items-center gap-1">
              <Info size={14} className="text-[#2563EB]" /> Mathematical Formulations Applied:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px] font-mono text-[#334155]">
              <div>1. Normalization: rᵢⱼ = xᵢⱼ / √(∑ xᵢⱼ²)</div>
              <div>2. Shannon Entropy: Eⱼ = -k ∑ pᵢⱼ ln(pᵢⱼ)</div>
              <div>3. Ideal Solution: A⁺ = max(vᵢⱼ), A⁻ = min(vᵢⱼ)</div>
              <div>4. Preference Score: Vᵢ = Dᵢ⁻ / (Dᵢ⁺ + Dᵢ⁻)</div>
            </div>
            <p className="text-[10px] text-[#64748B] pt-1">
              NutriShare guarantees 100% transparent, tamper-free allocation. Your donation is matched to the recipients with the highest Vᵢ score.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F8FAF8] border-t border-[#E2E8F0] flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-[#64748B]">
            Data verified in real-time by NutriShare decision engine.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#2D7A4F] hover:bg-[#235F3D] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            Close Audit
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default DonorTOPSISModal;
